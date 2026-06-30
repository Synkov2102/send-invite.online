"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

type WeddingRingsSceneProps = {
  ink: string;
  line: string;
  photoText: string;
  ringColor: string;
};

type BandProfilePoint = {
  r: number;
  z: number;
};

const createStudioReflectionMap = () => {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 256;
  const context = canvas.getContext("2d");

  if (!context) {
    return null;
  }

  const studioGradient = context.createLinearGradient(0, 0, 0, canvas.height);
  studioGradient.addColorStop(0, "#ffffff");
  studioGradient.addColorStop(0.22, "#fff3cc");
  studioGradient.addColorStop(0.4, "#30291d");
  studioGradient.addColorStop(0.54, "#fff8db");
  studioGradient.addColorStop(0.68, "#b78923");
  studioGradient.addColorStop(1, "#14120d");
  context.fillStyle = studioGradient;
  context.fillRect(0, 0, canvas.width, canvas.height);

  context.fillStyle = "rgba(255, 255, 255, 0.9)";
  context.fillRect(26, 0, 68, canvas.height);
  context.fillRect(328, 0, 36, canvas.height);
  context.fillStyle = "rgba(0, 0, 0, 0.38)";
  context.fillRect(132, 0, 52, canvas.height);
  context.fillRect(438, 0, 46, canvas.height);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.mapping = THREE.EquirectangularReflectionMapping;

  return texture;
};

const createBandGeometry = (
  radius = 1,
  bandWidth = 0.082,
  bandDepth = 0.225,
  bevel = 0.026,
  radialSegments = 216,
  bevelSegments = 8,
) => {
  const profile: BandProfilePoint[] = [];
  const halfWidth = bandWidth / 2;
  const halfDepth = bandDepth / 2;
  const corners = [
    { r: halfWidth - bevel, z: halfDepth - bevel, start: 0, end: Math.PI / 2 },
    { r: -halfWidth + bevel, z: halfDepth - bevel, start: Math.PI / 2, end: Math.PI },
    { r: -halfWidth + bevel, z: -halfDepth + bevel, start: Math.PI, end: Math.PI * 1.5 },
    { r: halfWidth - bevel, z: -halfDepth + bevel, start: Math.PI * 1.5, end: Math.PI * 2 },
  ];

  corners.forEach((corner) => {
    for (let index = 0; index <= bevelSegments; index += 1) {
      const angle = corner.start + ((corner.end - corner.start) * index) / bevelSegments;
      profile.push({
        r: corner.r + Math.cos(angle) * bevel,
        z: corner.z + Math.sin(angle) * bevel,
      });
    }
  });

  const positions: number[] = [];
  const normals: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];
  const profileCount = profile.length;

  for (let radialIndex = 0; radialIndex <= radialSegments; radialIndex += 1) {
    const theta = (radialIndex / radialSegments) * Math.PI * 2;
    const cos = Math.cos(theta);
    const sin = Math.sin(theta);

    profile.forEach((point, profileIndex) => {
      const ringRadius = radius + point.r;
      positions.push(cos * ringRadius, sin * ringRadius, point.z);
      normals.push(cos * point.r, sin * point.r, point.z);
      uvs.push(radialIndex / radialSegments, profileIndex / profileCount);
    });
  }

  for (let radialIndex = 0; radialIndex < radialSegments; radialIndex += 1) {
    for (let profileIndex = 0; profileIndex < profileCount; profileIndex += 1) {
      const nextProfileIndex = (profileIndex + 1) % profileCount;
      const a = radialIndex * profileCount + profileIndex;
      const b = (radialIndex + 1) * profileCount + profileIndex;
      const c = (radialIndex + 1) * profileCount + nextProfileIndex;
      const d = radialIndex * profileCount + nextProfileIndex;
      indices.push(a, b, d, b, c, d);
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute("normal", new THREE.Float32BufferAttribute(normals, 3));
  geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();

  return geometry;
};

const createReflectionArc = (
  radius: number,
  tube: number,
  color: THREE.Color,
  opacity: number,
  arc: number,
) =>
  new THREE.Mesh(
    new THREE.TorusGeometry(radius, tube, 12, 96, arc),
    new THREE.MeshBasicMaterial({
      color,
      transparent: true,
      opacity,
      depthWrite: false,
    }),
  );

export default function WeddingRingsScene({
  ink,
  line,
  photoText,
  ringColor,
}: Readonly<WeddingRingsSceneProps>) {
  const mountRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const mount = mountRef.current;

    if (!mount) {
      return;
    }

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      preserveDrawingBuffer: true,
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      34,
      mount.clientWidth / mount.clientHeight,
      0.1,
      100,
    );
    camera.position.set(0, 0.16, 5.65);

    const inkColor = new THREE.Color(ink);
    const lineColor = new THREE.Color(line);
    const photoTextColor = new THREE.Color(photoText);
    const metalColor = new THREE.Color(ringColor);
    const deepMetalColor = metalColor.clone().lerp(inkColor, 0.42);
    const reflectionMap = createStudioReflectionMap();

    renderer.setClearColor(inkColor, 1);
    scene.fog = new THREE.Fog(inkColor, 5.3, 10);
    scene.environment = reflectionMap;

    const root = new THREE.Group();
    const orbitGroup = new THREE.Group();
    scene.add(root);
    scene.add(orbitGroup);
    orbitGroup.position.y = 0.58;

    const ambient = new THREE.AmbientLight(photoTextColor, 2.1);
    scene.add(ambient);

    const keyLight = new THREE.DirectionalLight(photoTextColor, 4.4);
    keyLight.position.set(3.8, 4.8, 5.8);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(lineColor, 1.8);
    fillLight.position.set(-3.2, -0.8, 3.4);
    scene.add(fillLight);

    const rimLight = new THREE.PointLight(metalColor, 10, 8);
    rimLight.position.set(-2.9, 1.8, 2.9);
    scene.add(rimLight);

    const createWeddingBand = () => {
      const band = new THREE.Group();
      const bodyGeometry = createBandGeometry();
      const innerGeometry = createBandGeometry(0.997, 0.04, 0.153, 0.014);
      const edgeGeometry = new THREE.TorusGeometry(1.006, 0.0055, 10, 216);
      const innerEdgeGeometry = new THREE.TorusGeometry(0.958, 0.0045, 10, 216);
      const material = new THREE.MeshPhysicalMaterial({
        color: metalColor,
        emissive: metalColor.clone().multiplyScalar(0.03),
        envMapIntensity: 2.8,
        metalness: 1,
        roughness: 0.08,
        clearcoat: 1,
        clearcoatRoughness: 0.025,
      });
      const innerMaterial = new THREE.MeshPhysicalMaterial({
        color: metalColor.clone().lerp(deepMetalColor, 0.18),
        envMapIntensity: 2.25,
        metalness: 1,
        roughness: 0.12,
        clearcoat: 1,
        clearcoatRoughness: 0.04,
      });
      const highlightMaterial = new THREE.MeshBasicMaterial({
        color: photoTextColor,
        transparent: true,
        opacity: 0.5,
        depthWrite: false,
      });
      const darkReflectionMaterial = new THREE.MeshBasicMaterial({
        color: inkColor,
        transparent: true,
        opacity: 0.3,
        depthWrite: false,
      });

      const body = new THREE.Mesh(bodyGeometry, material);
      const innerGlow = new THREE.Mesh(innerGeometry, innerMaterial);
      innerGlow.scale.setScalar(0.988);
      const frontEdge = new THREE.Mesh(edgeGeometry, highlightMaterial);
      frontEdge.position.z = 0.1135;
      const backEdge = new THREE.Mesh(edgeGeometry.clone(), highlightMaterial.clone());
      backEdge.position.z = -0.1135;
      const frontInnerEdge = new THREE.Mesh(innerEdgeGeometry, highlightMaterial.clone());
      frontInnerEdge.position.z = 0.1125;
      const backInnerEdge = new THREE.Mesh(innerEdgeGeometry.clone(), darkReflectionMaterial);
      backInnerEdge.position.z = -0.1125;
      const whiteArc = createReflectionArc(1.012, 0.009, photoTextColor, 0.48, Math.PI * 0.54);
      whiteArc.position.z = 0.121;
      whiteArc.rotation.z = -0.34;
      const darkArc = createReflectionArc(1.014, 0.007, inkColor, 0.3, Math.PI * 0.44);
      darkArc.position.z = 0.122;
      darkArc.rotation.z = 2.22;

      band.add(
        body,
        innerGlow,
        frontEdge,
        backEdge,
        frontInnerEdge,
        backInnerEdge,
        whiteArc,
        darkArc,
      );
      band.userData = {
        dispose: () => {
          bodyGeometry.dispose();
          innerGeometry.dispose();
          edgeGeometry.dispose();
          innerEdgeGeometry.dispose();
          (backEdge.geometry as THREE.BufferGeometry).dispose();
          (backInnerEdge.geometry as THREE.BufferGeometry).dispose();
          whiteArc.geometry.dispose();
          darkArc.geometry.dispose();
          material.dispose();
          innerMaterial.dispose();
          highlightMaterial.dispose();
          darkReflectionMaterial.dispose();
          (backEdge.material as THREE.Material).dispose();
          (frontInnerEdge.material as THREE.Material).dispose();
          (whiteArc.material as THREE.Material).dispose();
          (darkArc.material as THREE.Material).dispose();
        },
      };

      return band;
    };

    const ringA = createWeddingBand();
    ringA.position.set(-0.55, 0.11, -0.08);
    ringA.rotation.set(1.32, 0.32, -0.58);
    ringA.scale.setScalar(0.9);

    const ringB = createWeddingBand();
    ringB.position.set(0.5, -0.2, 0.22);
    ringB.rotation.set(1.2, -0.3, 0.56);
    ringB.scale.setScalar(0.86);
    root.add(ringA, ringB);

    const ribbonCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-6.4, -1.34, -0.4),
      new THREE.Vector3(-2.1, -0.38, 0.34),
      new THREE.Vector3(0, 0.4, -0.14),
      new THREE.Vector3(2.08, 0.16, 0.26),
      new THREE.Vector3(6.4, 1.3, -0.32),
    ]);
    const ribbonGeometry = new THREE.TubeGeometry(ribbonCurve, 220, 0.014, 10, false);
    const ribbonMaterial = new THREE.MeshStandardMaterial({
      color: photoTextColor,
      emissive: lineColor.clone().multiplyScalar(0.18),
      transparent: true,
      opacity: 0.48,
      roughness: 0.32,
      metalness: 0.06,
    });
    const ribbon = new THREE.Mesh(ribbonGeometry, ribbonMaterial);
    orbitGroup.add(ribbon);

    const haloMaterial = new THREE.MeshBasicMaterial({
      color: photoTextColor,
      transparent: true,
      opacity: 0.12,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    const halo = new THREE.Mesh(new THREE.TorusGeometry(1.62, 0.01, 12, 180), haloMaterial);
    halo.rotation.set(1.18, -0.15, 0.22);
    orbitGroup.add(halo);

    const particleCount = 360;
    const particlePositions = new Float32Array(particleCount * 3);

    for (let index = 0; index < particleCount; index += 1) {
      const radius = 1.25 + Math.random() * 2.55;
      const angle = Math.random() * Math.PI * 2;
      particlePositions[index * 3] = Math.cos(angle) * radius;
      particlePositions[index * 3 + 1] = (Math.random() - 0.5) * 2.55;
      particlePositions[index * 3 + 2] = Math.sin(angle) * radius - 1.1;
    }

    const particleGeometry = new THREE.BufferGeometry();
    particleGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(particlePositions, 3),
    );
    const particleMaterial = new THREE.PointsMaterial({
      color: photoTextColor,
      size: 0.022,
      transparent: true,
      opacity: 0.7,
      depthWrite: false,
    });
    const particles = new THREE.Points(particleGeometry, particleMaterial);
    root.add(particles);

    const pointer = { x: 0, y: 0 };
    const pointerTarget = { x: 0, y: 0 };
    let frameId = 0;

    const handlePointerMove = (event: PointerEvent) => {
      const bounds = mount.getBoundingClientRect();
      pointerTarget.x = ((event.clientX - bounds.left) / bounds.width - 0.5) * 0.78;
      pointerTarget.y = ((event.clientY - bounds.top) / bounds.height - 0.5) * 0.52;
    };

    const resizeObserver = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      halo.scale.x = Math.max(1, camera.aspect * 1.34);
      renderer.setSize(width, height);
    });

    resizeObserver.observe(mount);
    mount.addEventListener("pointermove", handlePointerMove);

    const timer = new THREE.Timer();
    timer.connect(document);

    const animate = (timestamp: number) => {
      timer.update(timestamp);
      const elapsed = timer.getElapsed();

      pointer.x += (pointerTarget.x - pointer.x) * 0.055;
      pointer.y += (pointerTarget.y - pointer.y) * 0.055;

      root.rotation.y = Math.sin(elapsed * 0.24) * 0.28 + pointer.x;
      root.rotation.x = Math.sin(elapsed * 0.2) * 0.1 - pointer.y;
      root.position.y = 0.58 + Math.sin(elapsed * 0.54) * 0.06;
      ringA.rotation.z += 0.0019;
      ringB.rotation.z -= 0.0016;
      orbitGroup.position.x = Math.sin(elapsed * 0.18) * 0.035;
      orbitGroup.position.y = 0.58 + Math.sin(elapsed * 0.24) * 0.025;
      ribbon.rotation.z = Math.sin(elapsed * 0.24) * 0.018;
      particles.rotation.y = elapsed * 0.035;

      renderer.render(scene, camera);
      frameId = window.requestAnimationFrame(animate);
    };

    frameId = window.requestAnimationFrame(animate);

    return () => {
      window.cancelAnimationFrame(frameId);
      resizeObserver.disconnect();
      mount.removeEventListener("pointermove", handlePointerMove);
      mount.removeChild(renderer.domElement);
      (ringA.userData.dispose as () => void)();
      (ringB.userData.dispose as () => void)();
      ribbonGeometry.dispose();
      ribbonMaterial.dispose();
      halo.geometry.dispose();
      haloMaterial.dispose();
      particleGeometry.dispose();
      particleMaterial.dispose();
      reflectionMap?.dispose();
      timer.dispose();
      renderer.dispose();
    };
  }, [ink, line, photoText, ringColor]);

  return (
    <div
      aria-label="Анимированные 3D обручальные кольца"
      className="invite-three-canvas"
      ref={mountRef}
      role="img"
    />
  );
}
