export const VERTEX_SHADER = `
attribute vec2 aPosition;
varying vec2 vUv;
void main() {
  vUv = aPosition * 0.5 + 0.5;
  gl_Position = vec4(aPosition, 0.0, 1.0);
}
`;

export const NOISE_GLSL = `
float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash(i + vec2(0.0, 0.0)), hash(i + vec2(1.0, 0.0)), u.x),
    mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
    u.y
  );
}

float fbm(vec2 p) {
  float value = 0.0;
  float amplitude = 0.5;
  mat2 m = mat2(1.6, 1.2, -1.2, 1.6);
  for (int i = 0; i < 5; i++) {
    value += amplitude * noise(p);
    p = m * p;
    amplitude *= 0.5;
  }
  return value;
}
`;

// Wave-equation height field on a ping-pong texture.
// R channel = current height, G channel = previous height.
export const SIM_FRAGMENT = `
precision highp float;
varying vec2 vUv;

uniform sampler2D uPrev;
uniform vec2 uSimResolution;
uniform vec2 uMouse;
uniform float uStrength;
uniform float uDamping;

void main() {
  vec2 texel = 1.0 / uSimResolution;

  float h = texture2D(uPrev, vUv).r;
  float hPrev = texture2D(uPrev, vUv).g;
  float l = texture2D(uPrev, vUv - vec2(texel.x, 0.0)).r;
  float r = texture2D(uPrev, vUv + vec2(texel.x, 0.0)).r;
  float u = texture2D(uPrev, vUv + vec2(0.0, texel.y)).r;
  float d = texture2D(uPrev, vUv - vec2(0.0, texel.y)).r;

  float newH = (l + r + u + d) * 0.5 - hPrev;
  newH *= uDamping;

  vec2 diff = (vUv - uMouse) * vec2(uSimResolution.x / uSimResolution.y, 1.0);
  newH += exp(-dot(diff, diff) / 0.0009) * uStrength;

  gl_FragColor = vec4(newH, h, 0.0, 1.0);
}
`;

export const RENDER_FRAGMENT = `
precision highp float;
varying vec2 vUv;

uniform sampler2D uSim;
uniform vec2 uResolution;
uniform vec2 uSimResolution;
uniform float uTime;
uniform vec3 uDeep;
uniform vec3 uShallow;
uniform vec3 uFoam;

${NOISE_GLSL}

// Manual bilinear sampling of the height field so the low-res ripple
// simulation upscales smoothly instead of showing blocky texels.
float sampleHeight(vec2 uv) {
  vec2 res = uSimResolution;
  vec2 st = uv * res - 0.5;
  vec2 base = floor(st);
  vec2 f = fract(st);
  vec2 texel = 1.0 / res;
  vec2 origin = (base + 0.5) * texel;
  float h00 = texture2D(uSim, origin).r;
  float h10 = texture2D(uSim, origin + vec2(texel.x, 0.0)).r;
  float h01 = texture2D(uSim, origin + vec2(0.0, texel.y)).r;
  float h11 = texture2D(uSim, origin + vec2(texel.x, texel.y)).r;
  return mix(mix(h00, h10, f.x), mix(h01, h11, f.x), f.y);
}

void main() {
  vec2 texel = 1.0 / uSimResolution;
  float hL = sampleHeight(vUv - vec2(texel.x, 0.0));
  float hR = sampleHeight(vUv + vec2(texel.x, 0.0));
  float hU = sampleHeight(vUv + vec2(0.0, texel.y));
  float hD = sampleHeight(vUv - vec2(0.0, texel.y));

  vec3 normal = normalize(vec3(hL - hR, hD - hU, 2.2));
  vec2 distort = normal.xy * 0.045;

  vec2 uv = vUv + distort;
  vec2 aspect = vec2(uResolution.x / uResolution.y, 1.0);
  vec2 p = uv * aspect;
  float t = uTime * 0.05;

  vec2 q = vec2(fbm(p * 2.6 + t), fbm(p * 2.6 - t + 5.2));
  vec2 r = vec2(
    fbm(p * 2.6 + 1.7 * q + vec2(1.7, 9.2) + 0.15 * t),
    fbm(p * 2.6 + 1.7 * q + vec2(8.3, 2.8) - 0.12 * t)
  );
  float pattern = fbm(p * 2.6 + 1.8 * r);

  float caustic = pow(abs(sin((pattern + r.x) * 6.2831853)), 2.6);
  float depth = clamp(pattern * 1.02 + 0.05, 0.0, 1.0);

  vec3 col = mix(uDeep, uShallow, depth);
  col += uFoam * caustic * 0.22;
  col += uFoam * smoothstep(0.78, 1.0, pattern) * 0.09;

  vec3 lightDir = normalize(vec3(-0.35, 0.65, 0.7));
  float spec = pow(max(dot(normal, lightDir), 0.0), 90.0);
  col += uFoam * spec * 0.38;
  col += (normal.x + normal.y) * 0.03;
  col += (1.0 - vUv.y) * 0.04;

  gl_FragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
}
`;

// Fallback used when float/half-float render targets are unavailable.
export const FALLBACK_FRAGMENT = `
precision highp float;
varying vec2 vUv;

uniform vec2 uResolution;
uniform float uTime;
uniform vec2 uMouse;
uniform float uMouseStrength;
uniform vec3 uDeep;
uniform vec3 uShallow;
uniform vec3 uFoam;

${NOISE_GLSL}

void main() {
  vec2 uv = vUv;
  vec2 aspect = vec2(uResolution.x / uResolution.y, 1.0);
  vec2 p = uv * aspect;
  float t = uTime * 0.05;

  vec2 q = vec2(fbm(p * 2.6 + t), fbm(p * 2.6 - t + 5.2));
  vec2 r = vec2(
    fbm(p * 2.6 + 1.7 * q + vec2(1.7, 9.2) + 0.15 * t),
    fbm(p * 2.6 + 1.7 * q + vec2(8.3, 2.8) - 0.12 * t)
  );
  float pattern = fbm(p * 2.6 + 1.8 * r);

  vec2 m = uMouse * aspect;
  float dist = distance(p, m);
  pattern += sin(dist * 34.0 - uTime * 3.0) * exp(-dist * 5.5) * uMouseStrength * 0.22;

  float caustic = pow(abs(sin((pattern + r.x) * 6.2831853)), 2.6);
  float depth = clamp(pattern * 1.02 + 0.05, 0.0, 1.0);

  vec3 col = mix(uDeep, uShallow, depth);
  col += uFoam * caustic * 0.22;
  col += uFoam * smoothstep(0.78, 1.0, pattern) * 0.09;
  col += (1.0 - uv.y) * 0.04;

  gl_FragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
}
`;
