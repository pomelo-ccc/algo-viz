/**
 * Sorting 3D Visualizer
 * Each element is a 3D bar, height maps to value.
 * Bars stay in fixed positions; only height and color change during animation.
 */

import * as THREE from 'three';
import { ThreeVisualizer, DARK_THEME, type VisualizerTheme } from './ThreeVisualizer';

export interface SortBar {
  index: number;
  value: number;
  mesh: THREE.Mesh;
  material: THREE.MeshStandardMaterial;
  edgeMaterial: THREE.LineBasicMaterial;
  edgeMesh: THREE.LineSegments;
  originalHeight: number;
  currentHeight: number;
  targetHeight: number;
  state: 'idle' | 'comparing' | 'swapping' | 'sorted' | 'pivot';
}

export class SortingVisualizer extends ThreeVisualizer {
  private bars: SortBar[] = [];
  private values: number[] = [];
  private ground: THREE.Mesh | null = null;
  private grid: THREE.GridHelper | null = null;
  private maxValue = 100;
  private barWidth = 0.6;
  private barGap = 0.15;
  private barHeightScale = 4;

  protected onInit() {
    this.createEnvironment();
  }

  protected onThemeChange(theme: VisualizerTheme) {
    if (this.ground) {
      (this.ground.material as THREE.MeshStandardMaterial).color.set(theme.bg);
    }
    if (this.grid) {
      (this.grid.material as THREE.LineBasicMaterial).color.set(theme.primary).multiplyScalar(0.3);
    }
    // Update idle colors for all bars
    for (const bar of this.bars) {
      if (bar.state === 'idle') {
        bar.material.color.set(this.idleColor(bar.index));
        bar.material.emissive.set(this.idleColor(bar.index));
      }
    }
  }

  private createEnvironment() {
    const groundGeo = new THREE.PlaneGeometry(50, 50);
    const groundMat = new THREE.MeshStandardMaterial({
      color: DARK_THEME.bg,
      roughness: 0.85,
      metalness: 0.1,
    });
    this.ground = new THREE.Mesh(groundGeo, groundMat);
    this.ground.rotation.x = -Math.PI / 2;
    this.ground.position.y = -0.01;
    this.ground.receiveShadow = true;
    this.scene.add(this.ground);

    this.grid = new THREE.GridHelper(40, 40, 0x1a1f30, 0x0f1320);
    (this.grid.material as THREE.LineBasicMaterial).opacity = 0.4;
    (this.grid.material as THREE.LineBasicMaterial).transparent = true;
    this.grid.position.y = 0;
    this.scene.add(this.grid);
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
      bar.edgeMaterial.dispose();
      bar.edgeMesh.geometry.dispose();
    }
    this.bars = [];
  }

  private createBars() {
    const totalWidth = this.values.length * (this.barWidth + this.barGap);
    const startX = -totalWidth / 2 + this.barWidth / 2;

    for (let i = 0; i < this.values.length; i++) {
      const value = this.values[i];
      const h = (value / this.maxValue) * this.barHeightScale + 0.3;
      const color = this.idleColor(i);

      const geo = new THREE.BoxGeometry(this.barWidth, h, this.barWidth);
      const mat = new THREE.MeshStandardMaterial({
        color: color.clone(),
        roughness: 0.3,
        metalness: 0.6,
        emissive: color.clone(),
        emissiveIntensity: 0.15,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.castShadow = true;
      mesh.receiveShadow = true;

      const x = startX + i * (this.barWidth + this.barGap);
      mesh.position.set(x, h / 2, 0);
      this.scene.add(mesh);

      const edges = new THREE.EdgesGeometry(geo);
      const edgeMat = new THREE.LineBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.3,
      });
      const edgeMesh = new THREE.LineSegments(edges, edgeMat);
      mesh.add(edgeMesh);

      this.bars.push({
        index: i,
        value,
        mesh,
        material: mat,
        edgeMaterial: edgeMat,
        edgeMesh,
        originalHeight: h,
        currentHeight: h,
        targetHeight: h,
        state: 'idle',
      });
    }
  }

  /**
   * Update bar heights to reflect current array values.
   * Call this when the array state changes during sorting.
   */
  updateArray(values: number[]) {
    if (values.length !== this.bars.length) return;
    const newMax = Math.max(...values, 1);
    for (let i = 0; i < this.bars.length; i++) {
      const bar = this.bars[i];
      const newH = (values[i] / newMax) * this.barHeightScale + 0.3;
      bar.targetHeight = newH;
      bar.value = values[i];
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

  private syncVisualStates() {
    for (const bar of this.bars) {
      let color: THREE.Color;
      let emissiveIntensity = 0.15;
      let scaleY = 1;

      switch (bar.state) {
        case 'idle':
          color = this.idleColor(bar.index);
          break;
        case 'comparing':
          color = new THREE.Color(this.theme.highlight);
          emissiveIntensity = 0.6;
          scaleY = 1.05;
          break;
        case 'swapping':
          color = new THREE.Color(this.theme.secondary);
          emissiveIntensity = 0.8;
          scaleY = 1.08;
          break;
        case 'pivot':
          color = new THREE.Color(this.theme.accent);
          emissiveIntensity = 0.5;
          scaleY = 1.06;
          break;
        case 'sorted':
          color = new THREE.Color(this.theme.primary);
          emissiveIntensity = 0.3;
          break;
      }

      bar.material.color.lerp(color, 0.3);
      bar.material.emissive.lerp(color, 0.3);
      bar.material.emissiveIntensity += (emissiveIntensity - bar.material.emissiveIntensity) * 0.3;
      bar.mesh.scale.y += (scaleY - bar.mesh.scale.y) * 0.3;
    }
  }

  private idleColor(index: number): THREE.Color {
    const colors = [
      new THREE.Color(this.theme.primary),
      new THREE.Color(this.theme.secondary),
      new THREE.Color(this.theme.accent),
      new THREE.Color(this.theme.highlight),
    ];
    return colors[index % colors.length];
  }

  protected onUpdate(delta: number, _elapsed: number) {
    const t = 1 - Math.pow(0.001, delta);

    for (const bar of this.bars) {
      // Smoothly animate height changes
      if (Math.abs(bar.currentHeight - bar.targetHeight) > 0.01) {
        bar.currentHeight += (bar.targetHeight - bar.currentHeight) * t;
        // Update geometry height by scaling
        const scale = bar.currentHeight / bar.originalHeight;
        bar.mesh.scale.y = Math.max(0.1, scale);
        // Re-center the mesh vertically
        bar.mesh.position.y = bar.currentHeight / 2;
      }

      // Gentle rotation
      bar.mesh.rotation.y += delta * 0.02;
    }
  }

  reset() {
    for (const bar of this.bars) {
      bar.state = 'idle';
    }
    this.syncVisualStates();
  }
}
