/**
 * 排序算法 3D 可视化
 * 每个元素是 3D 立方体,高度映射值
 * 支持比较/交换的弹性插值动画
 */

import * as THREE from 'three';
import { ThreeVisualizer, DARK_THEME, type VisualizerTheme } from './ThreeVisualizer';

export interface SortBar {
  index: number;
  value: number;
  state: 'idle' | 'comparing' | 'swapping' | 'sorted' | 'pivot';
  targetY: number;
  currentY: number;
  targetX: number;
  currentX: number;
  mesh: THREE.Mesh;
  material: THREE.MeshStandardMaterial;
  edgeMaterial: THREE.LineBasicMaterial;
  edgeMesh: THREE.LineSegments;
}

export class SortingVisualizer extends ThreeVisualizer {
  private bars: SortBar[] = [];
  private values: number[] = [];
  private ground: THREE.Mesh | null = null;
  private grid: THREE.GridHelper | null = null;
  private maxValue = 100;
  private barWidth = 0.6;
  private barGap = 0.15;
  private barHeight = 4;

  protected onInit() {
    this.createEnvironment();
    this.generateRandomArray(20);
  }

  protected onThemeChange(theme: VisualizerTheme) {
    if (this.ground) {
      (this.ground.material as THREE.MeshStandardMaterial).color.set(theme.bg);
    }
    if (this.grid) {
      (this.grid.material as THREE.LineBasicMaterial).color.set(theme.primary).multiplyScalar(0.3);
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
    this.dispose();
    this.values = [...values];
    this.maxValue = Math.max(...values);
    this.createBars();
  }

  generateRandomArray(n: number) {
    const arr = Array.from({ length: n }, (_, i) => Math.floor(Math.random() * 90) + 10);
    this.setValues(arr);
  }

  private createBars() {
    const totalWidth = this.values.length * (this.barWidth + this.barGap);
    const startX = -totalWidth / 2 + this.barWidth / 2;

    const colors = [
      new THREE.Color(this.theme.primary),
      new THREE.Color(this.theme.secondary),
      new THREE.Color(this.theme.accent),
      new THREE.Color(this.theme.highlight),
    ];

    for (let i = 0; i < this.values.length; i++) {
      const value = this.values[i];
      const height = (value / this.maxValue) * this.barHeight + 0.5;
      const colorIdx = i % colors.length;

      const geo = new THREE.BoxGeometry(this.barWidth, height, this.barWidth);
      const mat = new THREE.MeshStandardMaterial({
        color: colors[colorIdx],
        roughness: 0.3,
        metalness: 0.6,
        emissive: colors[colorIdx],
        emissiveIntensity: 0.15,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.castShadow = true;
      mesh.receiveShadow = true;

      const x = startX + i * (this.barWidth + this.barGap);
      const y = height / 2;
      mesh.position.set(x, y, 0);
      this.scene.add(mesh);

      const edges = new THREE.EdgesGeometry(geo);
      const edgeMat = new THREE.LineBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.4,
      });
      const edgeMesh = new THREE.LineSegments(edges, edgeMat);
      mesh.add(edgeMesh);

      this.bars.push({
        index: i,
        value,
        state: 'idle',
        targetY: y,
        currentY: y,
        targetX: x,
        currentX: x,
        mesh,
        material: mat,
        edgeMaterial: edgeMat,
        edgeMesh,
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

  swap(i: number, j: number) {
    if (!this.bars[i] || !this.bars[j]) return;
    const a = this.bars[i];
    const b = this.bars[j];
    [a.targetX, b.targetX] = [b.currentX, a.currentX];
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

      bar.material.color.lerp(color, 0.2);
      bar.material.emissive.lerp(color, 0.2);
      bar.material.emissiveIntensity += (emissiveIntensity - bar.material.emissiveIntensity) * 0.2;
      bar.mesh.scale.y += (scaleY - bar.mesh.scale.y) * 0.2;
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
      const newX = bar.currentX + (bar.targetX - bar.currentX) * t;
      const newY = bar.currentY + (bar.targetY - bar.currentY) * t;
      bar.currentX = newX;
      bar.currentY = newY;
      bar.mesh.position.x = newX;
      bar.mesh.position.y = newY;

      bar.mesh.rotation.y += delta * 0.1;
    }
  }

  reset() {
    for (const bar of this.bars) {
      bar.state = 'idle';
    }
  }
}
