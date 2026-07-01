"use client";

import { useEffect, useRef } from "react";

import {
  FALLBACK_FRAGMENT,
  RENDER_FRAGMENT,
  SIM_FRAGMENT,
  VERTEX_SHADER,
} from "./water-background-shaders";
import type { WaterBackgroundProps } from "./water-background.types";

const MAX_DEVICE_PIXEL_RATIO = 1.5;
const MAX_SIM = 360;
const TARGET_FRAME_INTERVAL = 1000 / 45;

function hexToRgb01(hex: string): [number, number, number] {
  const normalized = hex.replace("#", "");
  const value =
    normalized.length === 3
      ? normalized
          .split("")
          .map((item) => item + item)
          .join("")
      : normalized;
  const red = parseInt(value.slice(0, 2), 16) / 255;
  const green = parseInt(value.slice(2, 4), 16) / 255;
  const blue = parseInt(value.slice(4, 6), 16) / 255;

  return [red || 0, green || 0, blue || 0];
}

function compileShader(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type);

  if (!shader) {
    return null;
  }

  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader);
    return null;
  }

  return shader;
}

function createProgram(gl: WebGLRenderingContext, fragmentSource: string) {
  const vertex = compileShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER);
  const fragment = compileShader(gl, gl.FRAGMENT_SHADER, fragmentSource);
  const program = gl.createProgram();

  if (!vertex || !fragment || !program) {
    return null;
  }

  gl.attachShader(program, vertex);
  gl.attachShader(program, fragment);
  gl.linkProgram(program);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    return null;
  }

  return program;
}

export function WaterBackgroundRenderer({
  className,
  deep,
  shallow,
  foam,
}: WaterBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvasElement = canvasRef.current;

    if (!canvasElement) {
      return;
    }

    const canvas: HTMLCanvasElement = canvasElement;

    const renderingContext =
      canvas.getContext("webgl", { antialias: false, alpha: false }) ??
      (canvas.getContext("experimental-webgl") as WebGLRenderingContext | null);

    if (!renderingContext) {
      canvas.style.background = `linear-gradient(160deg, ${deep}, ${shallow})`;
      return;
    }

    const gl: WebGLRenderingContext = renderingContext;

    const deepRgb = hexToRgb01(deep);
    const shallowRgb = hexToRgb01(shallow);
    const foamRgb = hexToRgb01(foam);

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 3, -1, -1, 3]),
      gl.STATIC_DRAW,
    );

    function bindGeometry(program: WebGLProgram) {
      const location = gl.getAttribLocation(program, "aPosition");
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.enableVertexAttribArray(location);
      gl.vertexAttribPointer(location, 2, gl.FLOAT, false, 0, 0);
    }

    // Detect a usable float render target for the ripple simulation.
    let floatType: number | null = null;
    gl.getExtension("OES_texture_float");
    const halfExt = gl.getExtension("OES_texture_half_float") as
      | { HALF_FLOAT_OES: number }
      | null;

    function supportsRenderTarget(type: number) {
      const texture = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 4, 4, 0, gl.RGBA, type, null);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
      const fbo = gl.createFramebuffer();
      gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
      gl.framebufferTexture2D(
        gl.FRAMEBUFFER,
        gl.COLOR_ATTACHMENT0,
        gl.TEXTURE_2D,
        texture,
        0,
      );
      const ok =
        gl.checkFramebufferStatus(gl.FRAMEBUFFER) === gl.FRAMEBUFFER_COMPLETE;
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.deleteFramebuffer(fbo);
      gl.deleteTexture(texture);
      return ok;
    }

    if (supportsRenderTarget(gl.FLOAT)) {
      floatType = gl.FLOAT;
    } else if (halfExt && supportsRenderTarget(halfExt.HALF_FLOAT_OES)) {
      floatType = halfExt.HALF_FLOAT_OES;
    }

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const pointer = { x: 0.5, y: 0.5 };
    const target = { x: 0.5, y: 0.5 };
    let strength = 0;
    let frame = 0;
    let lastFrameTime = 0;
    const start = performance.now();

    function handlePointer(event: PointerEvent) {
      const rect = canvas.getBoundingClientRect();
      const nx = (event.clientX - rect.left) / rect.width;
      const ny = 1 - (event.clientY - rect.top) / rect.height;
      const velocity = Math.hypot(nx - target.x, ny - target.y);
      target.x = nx;
      target.y = ny;
      strength = Math.min(strength + velocity * 3.5 + 0.05, 0.9);
    }

    // -- Simulation path (authentic propagating ripples) --
    if (floatType !== null && !reducedMotion) {
      const simProgram = createProgram(gl, SIM_FRAGMENT);
      const renderProgram = createProgram(gl, RENDER_FRAGMENT);

      if (!simProgram || !renderProgram) {
        canvas.style.background = `linear-gradient(160deg, ${deep}, ${shallow})`;
        return;
      }

      const activeSimProgram: WebGLProgram = simProgram;
      const activeRenderProgram: WebGLProgram = renderProgram;

      let simWidth = 4;
      let simHeight = 4;
      let textures: WebGLTexture[] = [];
      let framebuffers: WebGLFramebuffer[] = [];
      let read = 0;

      function createSimTargets() {
        textures.forEach((texture) => gl.deleteTexture(texture));
        framebuffers.forEach((fbo) => gl.deleteFramebuffer(fbo));
        textures = [];
        framebuffers = [];

        for (let i = 0; i < 2; i++) {
          const texture = gl.createTexture()!;
          gl.bindTexture(gl.TEXTURE_2D, texture);
          gl.texImage2D(
            gl.TEXTURE_2D,
            0,
            gl.RGBA,
            simWidth,
            simHeight,
            0,
            gl.RGBA,
            floatType as number,
            null,
          );
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

          const fbo = gl.createFramebuffer()!;
          gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
          gl.framebufferTexture2D(
            gl.FRAMEBUFFER,
            gl.COLOR_ATTACHMENT0,
            gl.TEXTURE_2D,
            texture,
            0,
          );
          gl.clearColor(0, 0, 0, 1);
          gl.clear(gl.COLOR_BUFFER_BIT);

          textures.push(texture);
          framebuffers.push(fbo);
        }

        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      }

      function resize() {
        const dpr = Math.min(
          window.devicePixelRatio || 1,
          MAX_DEVICE_PIXEL_RATIO,
        );
        const width = Math.max(1, Math.floor(canvas.clientWidth * dpr));
        const height = Math.max(1, Math.floor(canvas.clientHeight * dpr));

        if (canvas.width !== width || canvas.height !== height) {
          canvas.width = width;
          canvas.height = height;
        }

        const scale = MAX_SIM / Math.max(canvas.clientWidth, canvas.clientHeight, 1);
        const nextW = Math.max(8, Math.round(canvas.clientWidth * scale));
        const nextH = Math.max(8, Math.round(canvas.clientHeight * scale));

        if (nextW !== simWidth || nextH !== simHeight) {
          simWidth = nextW;
          simHeight = nextH;
          createSimTargets();
        }
      }

      const simUMouse = gl.getUniformLocation(activeSimProgram, "uMouse");
      const simUStrength = gl.getUniformLocation(activeSimProgram, "uStrength");
      const simUDamping = gl.getUniformLocation(activeSimProgram, "uDamping");
      const simUResolution = gl.getUniformLocation(activeSimProgram, "uSimResolution");
      const simUPrev = gl.getUniformLocation(activeSimProgram, "uPrev");

      const renderUSim = gl.getUniformLocation(activeRenderProgram, "uSim");
      const renderUResolution = gl.getUniformLocation(activeRenderProgram, "uResolution");
      const renderUSimResolution = gl.getUniformLocation(
        activeRenderProgram,
        "uSimResolution",
      );
      const renderUTime = gl.getUniformLocation(activeRenderProgram, "uTime");
      const renderUDeep = gl.getUniformLocation(activeRenderProgram, "uDeep");
      const renderUShallow = gl.getUniformLocation(activeRenderProgram, "uShallow");
      const renderUFoam = gl.getUniformLocation(activeRenderProgram, "uFoam");

      resize();

      function render(now: number) {
        frame = window.requestAnimationFrame(render);
        const elapsed = now - lastFrameTime;

        if (elapsed < TARGET_FRAME_INTERVAL) {
          return;
        }

        lastFrameTime = now - (elapsed % TARGET_FRAME_INTERVAL);
        pointer.x += (target.x - pointer.x) * 0.18;
        pointer.y += (target.y - pointer.y) * 0.18;

        // Simulation step into the write target.
        const write = 1 - read;
        gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffers[write]);
        gl.viewport(0, 0, simWidth, simHeight);
        gl.useProgram(activeSimProgram);
        bindGeometry(activeSimProgram);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, textures[read]);
        gl.uniform1i(simUPrev, 0);
        gl.uniform2f(simUResolution, simWidth, simHeight);
        gl.uniform2f(simUMouse, pointer.x, pointer.y);
        gl.uniform1f(simUStrength, strength);
        gl.uniform1f(simUDamping, 0.985);
        gl.drawArrays(gl.TRIANGLES, 0, 3);
        read = write;
        strength *= 0.9;

        // Render the water using the latest height field.
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.viewport(0, 0, canvas.width, canvas.height);
        gl.useProgram(activeRenderProgram);
        bindGeometry(activeRenderProgram);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, textures[read]);
        gl.uniform1i(renderUSim, 0);
        gl.uniform2f(renderUResolution, canvas.width, canvas.height);
        gl.uniform2f(renderUSimResolution, simWidth, simHeight);
        gl.uniform1f(renderUTime, (now - start) / 1000);
        gl.uniform3fv(renderUDeep, deepRgb);
        gl.uniform3fv(renderUShallow, shallowRgb);
        gl.uniform3fv(renderUFoam, foamRgb);
        gl.drawArrays(gl.TRIANGLES, 0, 3);
      }

      const resizeObserver = new ResizeObserver(resize);
      resizeObserver.observe(canvas);
      window.addEventListener("pointermove", handlePointer, { passive: true });
      frame = window.requestAnimationFrame(render);

      return () => {
        window.cancelAnimationFrame(frame);
        window.removeEventListener("pointermove", handlePointer);
        resizeObserver.disconnect();
        textures.forEach((texture) => gl.deleteTexture(texture));
        framebuffers.forEach((fbo) => gl.deleteFramebuffer(fbo));
        gl.deleteProgram(activeSimProgram);
        gl.deleteProgram(activeRenderProgram);
        gl.deleteBuffer(buffer);
      };
    }

    // -- Fallback path (procedural water, simple pointer ripple) --
    const program = createProgram(gl, FALLBACK_FRAGMENT);

    if (!program) {
      canvas.style.background = `linear-gradient(160deg, ${deep}, ${shallow})`;
      return;
    }

    gl.useProgram(program);
    bindGeometry(program);

    const uResolution = gl.getUniformLocation(program, "uResolution");
    const uTime = gl.getUniformLocation(program, "uTime");
    const uMouse = gl.getUniformLocation(program, "uMouse");
    const uMouseStrength = gl.getUniformLocation(program, "uMouseStrength");
    gl.uniform3fv(gl.getUniformLocation(program, "uDeep"), deepRgb);
    gl.uniform3fv(gl.getUniformLocation(program, "uShallow"), shallowRgb);
    gl.uniform3fv(gl.getUniformLocation(program, "uFoam"), foamRgb);

    function resizeFallback() {
      const dpr = Math.min(
        window.devicePixelRatio || 1,
        MAX_DEVICE_PIXEL_RATIO,
      );
      const width = Math.max(1, Math.floor(canvas.clientWidth * dpr));
      const height = Math.max(1, Math.floor(canvas.clientHeight * dpr));

      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }

      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(uResolution, canvas.width, canvas.height);
    }

    resizeFallback();

    function renderFallback(now: number) {
      frame = window.requestAnimationFrame(renderFallback);
      const elapsed = now - lastFrameTime;

      if (elapsed < TARGET_FRAME_INTERVAL) {
        return;
      }

      lastFrameTime = now - (elapsed % TARGET_FRAME_INTERVAL);
      pointer.x += (target.x - pointer.x) * 0.06;
      pointer.y += (target.y - pointer.y) * 0.06;
      strength *= 0.96;

      gl.uniform1f(uTime, (now - start) / 1000);
      gl.uniform2f(uMouse, pointer.x, pointer.y);
      gl.uniform1f(uMouseStrength, strength);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    }

    const resizeObserver = new ResizeObserver(resizeFallback);
    resizeObserver.observe(canvas);
    window.addEventListener("pointermove", handlePointer, { passive: true });

    if (reducedMotion) {
      gl.uniform1f(uTime, 8);
      gl.uniform2f(uMouse, 0.5, 0.5);
      gl.uniform1f(uMouseStrength, 0);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    } else {
      frame = window.requestAnimationFrame(renderFallback);
    }

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", handlePointer);
      resizeObserver.disconnect();
      gl.deleteProgram(program);
      gl.deleteBuffer(buffer);
    };
  }, [deep, foam, shallow]);

  return (
    <canvas
      aria-hidden
      className={className}
      ref={canvasRef}
      style={{ background: `linear-gradient(160deg, ${deep}, ${shallow})` }}
    />
  );
}
