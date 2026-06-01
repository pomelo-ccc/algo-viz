/**
 * Three.js 抽象层
 * 统一的 3D 场景基类，封装相机、灯光、控制器、渲染循环
 */

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export interface VisualizerTheme {
  bg: string;
  primary: string;
  secondary: string;
  accent: string;
  highlight: string;
  text: string;
}

export const DARK_THEME: VisualizerTheme = {
  bg: '#0a0e1a',
  primary: '#00e5ff',
  secondary: '#ff006e',
  accent: '#8338ec',
  highlight: '#06ffa5',
  text: '#e8eaf2',
};

export const LIGHT_THEME: VisualizerTheme = {
  bg: '#f5f5f7',
  primary: '#0066ff',
  secondary: '#e91e63',
  accent: '#673ab7',
  highlight: '#00c853',
  text: '#1a1a1a',
};

export interface ThreeVisualizerOptions {
  autoRotate?: boolean;
  enableControls?: boolean;
  enableDamping?: boolean;
  cameraPosition?: [number, number, number];
  fov?: number;
}

export abstract class ThreeVisualizer {
  protected scene: THREE.Scene;
  protected camera: THREE.PerspectiveCamera;
  protected renderer: THREE.WebGLRenderer;
  protected controls: OrbitControls | null = null;
  protected container: HTMLElement;
  protected theme: VisualizerTheme = DARK_THEME;
  protected rafId = 0;
  protected visible = true;
  protected clock = new THREE.Clock();
  protected lights: THREE.Light[] = [];
  protected disposables: Array<{ dispose: () => void }> = [];
  protected time = 0;
  protected target = new THREE.Vector3(0, 0, 0);

  constructor(container: HTMLElement, options: ThreeVisualizerOptions = {}) {
    this.container = container;

    this.scene = new THREE.Scene();
    this.scene.background = null;
    this.scene.fog = new THREE.FogExp2(0x0a0e1a, 0.015);

    const rect = container.getBoundingClientRect();
    const aspect = rect.width / rect.height;
    this.camera = new THREE.PerspectiveCamera(
      options.fov ?? 45,
      aspect,
      0.1,
      200
    );
    const [cx, cy, cz] = options.cameraPosition ?? [8, 6, 12];
    this.camera.position.set(cx, cy, cz);

    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(rect.width, rect.height);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.0;
    container.appendChild(this.renderer.domElement);
    this.renderer.domElement.style.display = 'block';
    this.renderer.domElement.style.width = '100%';
    this.renderer.domElement.style.height = '100%';

    if (options.enableControls !== false) {
      this.controls = new OrbitControls(this.camera, this.renderer.domElement);
      this.controls.enableDamping = options.enableDamping ?? true;
      this.controls.dampingFactor = 0.05;
      this.controls.autoRotate = options.autoRotate ?? false;
      this.controls.autoRotateSpeed = 0.4;
      this.controls.minDistance = 4;
      this.controls.maxDistance = 60;
      this.controls.maxPolarAngle = Math.PI * 0.85;
      this.controls.target.copy(this.target);
    }

    this.setupLights();

    this.handleResize = this.handleResize.bind(this);
    this.onVisibilityChange = this.onVisibilityChange.bind(this);
    window.addEventListener('resize', this.handleResize);
    document.addEventListener('visibilitychange', this.onVisibilityChange);
  }

  protected setupLights() {
    const ambient = new THREE.AmbientLight(0xffffff, 0.4);
    this.scene.add(ambient);
    this.lights.push(ambient);

    const key = new THREE.DirectionalLight(0xffffff, 0.8);
    key.position.set(10, 15, 8);
    key.castShadow = true;
    key.shadow.mapSize.set(2048, 2048);
    key.shadow.camera.left = -20;
    key.shadow.camera.right = 20;
    key.shadow.camera.top = 20;
    key.shadow.camera.bottom = -20;
    key.shadow.bias = -0.0005;
    this.scene.add(key);
    this.lights.push(key);

    const fill = new THREE.DirectionalLight(0x00e5ff, 0.3);
    fill.position.set(-8, 5, -5);
    this.scene.add(fill);
    this.lights.push(fill);

    const rim = new THREE.PointLight(0xff006e, 0.6, 30);
    rim.position.set(0, 8, -10);
    this.scene.add(rim);
    this.lights.push(rim);
  }

  setTheme(theme: VisualizerTheme) {
    this.theme = theme;
    this.scene.fog = new THREE.FogExp2(theme.bg, 0.015);
    this.onThemeChange(theme);
  }

  protected onThemeChange(_theme: VisualizerTheme) {
    // Override in subclasses
  }

  start() {
    this.onInit();
    this.loop();
  }

  stop() {
    cancelAnimationFrame(this.rafId);
    window.removeEventListener('resize', this.handleResize);
    document.removeEventListener('visibilitychange', this.onVisibilityChange);
    this.controls?.dispose();
    this.dispose();
    this.renderer.dispose();
    if (this.renderer.domElement.parentNode) {
      this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
    }
  }

  clearScene() {
    this.dispose();
  }

  protected abstract onInit(): void;

  protected onUpdate(_delta: number, _elapsed: number): void {
    // Override in subclasses
  }

  protected dispose(): void {
    for (const d of this.disposables) {
      try { d.dispose(); } catch {}
    }
    this.disposables = [];
    this.scene.traverse(obj => {
      if (obj instanceof THREE.Mesh) {
        obj.geometry?.dispose();
        const mat = obj.material;
        if (Array.isArray(mat)) mat.forEach(m => m.dispose());
        else mat?.dispose();
      }
    });
    while (this.scene.children.length) {
      this.scene.remove(this.scene.children[0]);
    }
  }

  protected track(obj: { dispose: () => void }) {
    this.disposables.push(obj);
  }

  private loop = () => {
    if (!this.visible) return;
    this.rafId = requestAnimationFrame(this.loop);
    const delta = this.clock.getDelta();
    this.time += delta;
    this.onUpdate(delta, this.time);
    this.controls?.update();
    this.renderer.render(this.scene, this.camera);
  };

  private handleResize() {
    const rect = this.container.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;
    this.camera.aspect = rect.width / rect.height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(rect.width, rect.height);
  }

  private onVisibilityChange = () => {
    this.visible = !document.hidden;
    if (this.visible) {
      this.clock.start();
      this.loop();
    } else {
      cancelAnimationFrame(this.rafId);
    }
  };

  resetCamera() {
    this.camera.position.set(8, 6, 12);
    this.controls?.target.set(0, 0, 0);
    this.controls?.update();
  }
}

export function createColorFromHex(hex: string): THREE.Color {
  return new THREE.Color(hex);
}

export function lerpColor(a: THREE.Color, b: THREE.Color, t: number): THREE.Color {
  return new THREE.Color(
    a.r + (b.r - a.r) * t,
    a.g + (b.g - a.g) * t,
    a.b + (b.b - a.b) * t
  );
}

export function createGradientTexture(stops: { offset: number; color: string }[]): THREE.Texture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 1;
  const ctx = canvas.getContext('2d')!;
  const grad = ctx.createLinearGradient(0, 0, 256, 0);
  stops.forEach(s => grad.addColorStop(s.offset, s.color));
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 256, 1);
  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  return tex;
}
