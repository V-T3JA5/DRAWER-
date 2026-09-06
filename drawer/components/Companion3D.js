'use client';

// Companion3D — the drifting faceted object beside the current week card.
//
// Tries GLTFLoader('/models/main-model.glb') first. Until you drop a real
// model in public/models/, that fetch 404s (expected, not an error) and
// it falls back to a procedural icosahedron with two morph targets built
// from deterministic seeded vertex displacement. morphTargetsRelative is
// true so the swap-in later needs zero code changes — delta-offset morph
// targets are exactly how glTF/Blender shape-key exports work by default.
//
// Desktop-only (gated by the same matchMedia the slide deck uses) and
// disabled under prefers-reduced-motion. Position every frame: find
// whichever [data-week-card] is closest to viewport center, measure real
// leftover space on each side, convert that screen point into world
// coordinates via actual camera unprojection, then ease toward it.

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

function mulberry32(seed) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function buildProceduralMesh() {
  const geo = new THREE.IcosahedronGeometry(1, 1);
  const posAttr = geo.attributes.position;
  const normAttr = geo.attributes.normal;
  const rand = mulberry32(42);
  const morphA = new Float32Array(posAttr.count * 3);
  const morphB = new Float32Array(posAttr.count * 3);
  for (let i = 0; i < posAttr.count; i++) {
    const nx = normAttr.getX(i), ny = normAttr.getY(i), nz = normAttr.getZ(i);
    const dA = (rand() - 0.5) * 0.55;
    const dB = (rand() - 0.5) * 0.85;
    morphA[i * 3] = nx * dA; morphA[i * 3 + 1] = ny * dA; morphA[i * 3 + 2] = nz * dA;
    morphB[i * 3] = nx * dB; morphB[i * 3 + 1] = ny * dB; morphB[i * 3 + 2] = nz * dB;
  }
  geo.morphAttributes.position = [
    new THREE.Float32BufferAttribute(morphA, 3),
    new THREE.Float32BufferAttribute(morphB, 3),
  ];
  geo.morphTargetsRelative = true;

  const material = new THREE.MeshStandardMaterial({
    color: 0x18181a,
    metalness: 0.6,
    roughness: 0.35,
    emissive: 0xffffff,
    emissiveIntensity: 0.06,
    flatShading: true,
    transparent: true,
    opacity: 0,
  });

  const mesh = new THREE.Mesh(geo, material);
  mesh.updateMorphTargets();
  return { mesh, geometry: geo, material, hasMorphTargets: true };
}

function buildGlowSprite() {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  const grad = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
  grad.addColorStop(0, 'rgba(255,255,255,0.5)');
  grad.addColorStop(0.4, 'rgba(255,255,255,0.18)');
  grad.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 256, 256);
  const texture = new THREE.CanvasTexture(canvas);
  const material = new THREE.SpriteMaterial({
    map: texture,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    transparent: true,
    opacity: 0,
  });
  const sprite = new THREE.Sprite(material);
  sprite.scale.set(4.4, 4.4, 1);
  return { sprite, texture, material };
}

export default function Companion3D({ activeSlideRef, totalSlides, reducedMotion }) {
  const hostRef = useRef(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 901px)');
    const update = () => setReady(mq.matches && !reducedMotion);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, [reducedMotion]);

  useEffect(() => {
    if (!ready || !hostRef.current) return;
    const container = hostRef.current;
    let cancelled = false;
    let frameId = null;
    let renderer, geometry, material, glowTexture, spriteMaterial, mesh;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;

    renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.appendChild(renderer.domElement);

    scene.add(new THREE.AmbientLight(0xffffff, 0.55));
    const keyLight = new THREE.PointLight(0xffffff, 1.3, 60);
    keyLight.position.set(2.5, 2, 4);
    scene.add(keyLight);
    const fillLight = new THREE.PointLight(0xffffff, 0.35, 60);
    fillLight.position.set(-3, -2, 3);
    scene.add(fillLight);

    let hasMorphTargets = false;

    function attachMesh(loadedMesh, morphCapable) {
      mesh = loadedMesh;
      hasMorphTargets = morphCapable;
      const { sprite, texture, material: spriteMat } = buildGlowSprite();
      glowTexture = texture;
      spriteMaterial = spriteMat;
      mesh.add(sprite);
      scene.add(mesh);
      animate();
    }

    // Try the real model first. A 404 here is expected until a real
    // .glb is dropped into public/models/ — it's not an error state.
    const loader = new GLTFLoader();
    loader.load(
      '/models/main-model.glb',
      (gltf) => {
        if (cancelled) return;
        let firstMesh = null;
        gltf.scene.traverse((child) => {
          if (!firstMesh && child.isMesh) firstMesh = child;
        });
        if (!firstMesh) {
          // File loaded but had no mesh in it — fall back rather than show nothing.
          const built = buildProceduralMesh();
          geometry = built.geometry;
          material = built.material;
          attachMesh(built.mesh, built.hasMorphTargets);
          return;
        }
        material = firstMesh.material;
        if (material && 'transparent' in material) {
          material.transparent = true;
          material.opacity = 0;
        }
        const morphCapable = Boolean(
          firstMesh.geometry &&
            firstMesh.geometry.morphAttributes &&
            firstMesh.geometry.morphAttributes.position &&
            firstMesh.geometry.morphAttributes.position.length >= 2
        );
        if (morphCapable) firstMesh.updateMorphTargets();
        attachMesh(firstMesh, morphCapable);
      },
      undefined,
      () => {
        // Expected failure path: no model file yet.
        if (cancelled) return;
        const built = buildProceduralMesh();
        geometry = built.geometry;
        material = built.material;
        attachMesh(built.mesh, built.hasMorphTargets);
      }
    );

    const _ndc = new THREE.Vector3();
    const _worldTarget = new THREE.Vector3();
    const smoothed = { scroll: 0, ready: false, opacity: 0 };
    let lockedEl = null;

    function getTargetScreenPos() {
      const cards = document.querySelectorAll('[data-week-card]');
      if (!cards.length) return null;
      const viewportCenterY = window.innerHeight / 2;

      let closestEl = null;
      let closestDist = Infinity;
      cards.forEach((card) => {
        const rect = card.getBoundingClientRect();
        const cy = rect.top + rect.height / 2;
        const dist = Math.abs(cy - viewportCenterY);
        if (dist < closestDist) { closestDist = dist; closestEl = card; }
      });
      if (!closestEl) return null;

      let targetEl = closestEl;
      if (lockedEl && lockedEl !== closestEl && lockedEl.isConnected) {
        const lockedRect = lockedEl.getBoundingClientRect();
        const lockedDist = Math.abs(lockedRect.top + lockedRect.height / 2 - viewportCenterY);
        if (closestDist > lockedDist - 90) targetEl = lockedEl;
      }
      lockedEl = targetEl;

      const rect = targetEl.getBoundingClientRect();
      const leftSpace = rect.left;
      const rightSpace = window.innerWidth - rect.right;
      let screenX = rightSpace > leftSpace ? rect.right + rightSpace / 2 : leftSpace / 2;
      screenX = Math.max(90, Math.min(window.innerWidth - 90, screenX));
      const screenY = rect.top + rect.height / 2;
      return { x: screenX, y: screenY };
    }

    function screenToWorld(sx, sy, out) {
      const ndcX = (sx / window.innerWidth) * 2 - 1;
      const ndcY = -(sy / window.innerHeight) * 2 + 1;
      _ndc.set(ndcX, ndcY, 0.5).unproject(camera);
      const dir = _ndc.sub(camera.position).normalize();
      const dist = -camera.position.z / dir.z;
      return out.copy(camera.position).addScaledVector(dir, dist);
    }

    function animate() {
      if (cancelled || !mesh) return;
      const targetScreen = getTargetScreenPos();

      const desiredOpacity = targetScreen ? 1 : 0;
      smoothed.opacity += (desiredOpacity - smoothed.opacity) * 0.05;
      if (material && 'opacity' in material) material.opacity = smoothed.opacity;
      if (spriteMaterial) spriteMaterial.opacity = smoothed.opacity * 0.9;

      if (targetScreen) {
        const world = screenToWorld(targetScreen.x, targetScreen.y, _worldTarget);
        if (!smoothed.ready) {
          mesh.position.copy(world);
          smoothed.ready = true;
        } else {
          mesh.position.x += (world.x - mesh.position.x) * 0.045;
          mesh.position.y += (world.y - mesh.position.y) * 0.045;
        }
      }

      const rawProgress = activeSlideRef.current / Math.max(1, totalSlides - 1);
      smoothed.scroll += (rawProgress - smoothed.scroll) * 0.055;

      mesh.rotation.y = smoothed.scroll * Math.PI * 0.65;
      mesh.rotation.x = smoothed.scroll * Math.PI * 0.15;
      mesh.scale.setScalar(1 + Math.sin(smoothed.scroll * Math.PI * 0.8) * 0.06);
      if (hasMorphTargets && mesh.morphTargetInfluences) {
        mesh.morphTargetInfluences[0] = 0.5 + Math.sin(smoothed.scroll * Math.PI * 0.7) * 0.5;
        mesh.morphTargetInfluences[1] = 0.5 + Math.cos(smoothed.scroll * Math.PI * 0.55) * 0.5;
      }

      renderer.render(scene, camera);
      frameId = requestAnimationFrame(animate);
    }

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelled = true;
      if (frameId) cancelAnimationFrame(frameId);
      window.removeEventListener('resize', handleResize);
      geometry && geometry.dispose && geometry.dispose();
      material && material.dispose && material.dispose();
      glowTexture && glowTexture.dispose();
      spriteMaterial && spriteMaterial.dispose();
      if (renderer) {
        renderer.dispose();
        if (container.contains(renderer.domElement)) container.removeChild(renderer.domElement);
      }
    };
  }, [ready, activeSlideRef, totalSlides]);

  return <div ref={hostRef} className="model-layer" aria-hidden="true" />;
}
