/**
 * Sorting 3D Visualizer - 3D Elements Style
 * Glass + metal + neon materials with cold color gradients
 */

import * as THREE from 'three';
import { ThreeVisualizer, DARK_THEME, type VisualizerTheme } from './ThreeVisualizer';

interface SortBar {
  index: number;
  value: number;
  mesh: THREE.Mesh;
  material: THREE.MeshStandardMaterial;
  edgeMesh: THREE.LineSegments;
  state: 'idle' | 'comparing' | 'swapping' | 'sorted' | 'pivot';
}

export class SortingVisualizer extends ThreeVisualizer {
  private bars: SortBar[] = [];
  private values: number[] = [];
  private ground: THREE.Mesh | null = null;
  private grid: THREE.GridHelper | null = null;
  private maxValue = 100;
  private barWidth = 0.55;
  private barGap = 0.12;
  private barHeightScale = 5;
  private hoverBar: number | null = null;
  private styleLight: THREE.PointLight | null = null;

  protected onInit() {
    this.createEnvironment();
  }

  private createEnvironment() {
    // Deep space background - no ground plane, just a grid floor
    this.grid = new THREE.GridHelper(60, 60, 0x1a2a4a, 0x0f1528);
    (this.grid.material as THREE.LineBasicMaterial).opacity = 0.3;
    (this.grid.material as THREE.LineBasicMaterial).transparent = true;
    this.grid.position.y = 0;
    this.scene.add(this.grid);

    this.styleLight = new THREE.PointLight(0x3b82f6, 0.42, 26);
    this.styleLight.position.set(1.2, 7, 7);
    this.scene.add(this.styleLight);
  }

  protected onThemeChange(theme: VisualizerTheme) {
    if (this.grid) {
      (this.grid.material as THREE.LineBasicMaterial).color.set(theme.primary).multiplyScalar(0.2);
    }
  }

  setValues(values: number[]) {
    this.clearBars();
    this.values = [...values];
    this.maxValue = Math.max(...values, 1);
    this.createBars();
  }

  generateRandomArray(n: number) {
    const arr = Array.from({ length: n }, () => Math.floor(Math.random() * 90) + 10);
    this.setValues(arr);
  }

  private clearBars() {
    for (const bar of this.bars) {
      this.scene.remove(bar.mesh);
      bar.mesh.geometry.dispose();
      bar.material.dispose();
      (bar.edgeMesh.material as THREE.Material).dispose();
      bar.edgeMesh.geometry.dispose();
    }
    this.bars = [];
  }

  private createBars() {
    const totalWidth = this.values.length * (this.barWidth + this.barGap);
    const startX = -totalWidth / 2 + this.barWidth / 2;

    for (let i = 0; i < this.values.length; i++) {
      const value = this.values[i];
      const h = (value / this.maxValue) * this.barHeightScale + 0.2;
      const color = this.idleColor(i);

      // Glass-like bar with metallic finish
      const geo = new THREE.BoxGeometry(this.barWidth, h, this.barWidth);
      const mat = new THREE.MeshStandardMaterial({
        color: color.clone(),
        roughness: 0.15,
        metalness: 0.85,
        emissive: color.clone(),
        emissiveIntensity: 0.2,
        transparent: true,
        opacity: 0.9,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.castShadow = true;
      mesh.receiveShadow = true;

      const x = startX + i * (this.barWidth + this.barGap);
      mesh.position.set(x, h / 2, 0);
      this.scene.add(mesh);

      // Neon edge glow
      const edges = new THREE.EdgesGeometry(geo);
      const edgeMat = new THREE.LineBasicMaterial({
        color: 0x00e5ff,
        transparent: true,
        opacity: 0.5,
      });
      const edgeMesh = new THREE.LineSegments(edges, edgeMat);
      mesh.add(edgeMesh);

      this.bars.push({
        index: i,
        value,
        mesh,
        material: mat,
        edgeMesh,
        state: 'idle',
      });
    }
  }

  highlight(indices: number[], state: 'comparing' | 'swapping' | 'pivot' | 'sorted' = 'comparing') {
    for (let i = 0; i < this.bars.length; i++) {
      const bar = this.bars[i];
      if (indices.includes(i)) {
        bar.state = state;
      } else if (bar.state !== 'sorted') {
        bar.state = 'idle';
      }
    }
    this.syncVisualStates();
  }

  markSorted(indices: number[]) {
    for (const i of indices) {
      if (this.bars[i]) this.bars[i].state = 'sorted';
    }
    this.syncVisualStates();
  }

  /**
   * Update bar heights to reflect new array values during sorting
   */
  updateArray(values: number[]) {
    if (values.length !== this.bars.length) return;
    const newMax = Math.max(...values, 1);
    for (let i = 0; i < this.bars.length; i++) {
      const bar = this.bars[i];
      const newValue = values[i];
      const newH = (newValue / newMax) * this.barHeightScale + 0.2;
      
      // Update the bar's geometry height by scaling
      const currentScaleY = bar.mesh.scale.y || 1;
      const targetScaleY = newH / (bar.mesh.geometry as THREE.BoxGeometry).parameters.height;
      bar.mesh.scale.y = targetScaleY;
      
      // Re-center vertically
      bar.mesh.position.y = newH / 2;
      
      // Update stored value
      bar.value = newValue;
    }
    this.maxValue = newMax;
  }

  private syncVisualStates() {
    for (const bar of this.bars) {
      let targetColor: THREE.Color;
      let emissiveIntensity = 0.2;
      let pulse = 1;

      switch (bar.state) {
        case 'idle':
          targetColor = this.idleColor(bar.index);
          break;
        case 'comparing':
          targetColor = new THREE.Color(0x06ffa5);
          emissiveIntensity = 0.8;
          pulse = 1.08;
          break;
        case 'swapping':
          targetColor = new THREE.Color(0xff006e);
          emissiveIntensity = 1.0;
          pulse = 1.12;
          break;
        case 'pivot':
          targetColor = new THREE.Color(0x8338ec);
          emissiveIntensity = 0.6;
          pulse = 1.06;
          break;
        case 'sorted':
          targetColor = new THREE.Color(0x00e5ff);
          emissiveIntensity = 0.5;
          break;
      }

      bar.material.color.lerp(targetColor, 0.25);
      bar.material.emissive.lerp(targetColor, 0.25);
      bar.material.emissiveIntensity += (emissiveIntensity - bar.material.emissiveIntensity) * 0.25;
      // Subtle pulse on x/z
      bar.mesh.scale.x += (pulse - bar.mesh.scale.x) * 0.25;
      bar.mesh.scale.z += (pulse - bar.mesh.scale.z) * 0.25;
    }
  }

  private idleColor(index: number): THREE.Color {
    // Cool gradient palette: cyan -> blue -> purple -> magenta
    const colors = [
      new THREE.Color(0x00e5ff),
      new THREE.Color(0x3b82f6),
      new THREE.Color(0x8338ec),
      new THREE.Color(0xff006e),
    ];
    return colors[index % colors.length];
  }

  protected onUpdate(delta: number, _elapsed: number) {
    const t = 1 - Math.pow(0.001, delta);
    const styleColor = new THREE.Color(0x3b82f6);

    if (this.styleLight) {
      this.styleLight.color.lerp(styleColor, t * 0.5);
      this.styleLight.intensity += (0.42 - this.styleLight.intensity) * t * 0.35;
    }

    if (this.grid) {
      (this.grid.material as THREE.LineBasicMaterial).color.lerp(styleColor, t * 0.05);
      (this.grid.material as THREE.LineBasicMaterial).opacity += (0.34 - (this.grid.material as THREE.LineBasicMaterial).opacity) * t * 0.12;
    }

    for (const bar of this.bars) {
      // Idle floating animation
      if (bar.state === 'idle') {
        const floatY = Math.sin(_elapsed * 2 + bar.index * 0.5) * 0.05;
        bar.mesh.position.y += floatY * 0.1;
      }

      // Gentle rotation
      bar.mesh.rotation.y += delta * 0.01;

      // Smooth state transition
      bar.material.color.lerp(this.idleColor(bar.index), t * 0.02);
      if (bar.state === 'idle') {
        bar.material.emissiveIntensity += (0.2 - bar.material.emissiveIntensity) * t * 0.1;
      }
    }

    // Camera gentle orbit
    const time = _elapsed * 0.1;
    this.camera.position.x = Math.sin(time) * 2;
    this.camera.position.z = 14 + Math.cos(time) * 2;
    this.camera.lookAt(0, 2, 0);
  }

  reset() {
    for (const bar of this.bars) {
      bar.state = 'idle';
    }
    this.syncVisualStates();
  }
}
