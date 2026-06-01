/**
 * 搜索算法 3D 可视化
 * 数组水平排列, 目标值搜索高亮
 * 支持线性搜索和二分搜索
 */

import * as THREE from 'three';
import { ThreeVisualizer, DARK_THEME, type VisualizerTheme } from './ThreeVisualizer';

export interface SearchBar {
  index: number;
  value: number;
  state: 'idle' | 'comparing' | 'found' | 'range';
  mesh: THREE.Mesh;
  label: THREE.Sprite | null;
}

export class SearchingVisualizer extends ThreeVisualizer {
  private bars: SearchBar[] = [];
  private targetValue = 0;
  private targetMesh: THREE.Mesh | null = null;
  private targetLabel: THREE.Sprite | null = null;
  private groundMesh: THREE.Mesh | null = null;

  protected onInit() {
    this.createGround();
  }

  protected onThemeChange(theme: VisualizerTheme) {
    this.theme = theme;
    if (this.groundMesh) {
      (this.groundMesh.material as THREE.MeshStandardMaterial).color.set(theme.bg);
    }
  }

  private createGround() {
    const geo = new THREE.PlaneGeometry(40, 20);
    const mat = new THREE.MeshStandardMaterial({
      color: this.theme.bg,
      roughness: 0.9,
      metalness: 0.05,
    });
    this.groundMesh = new THREE.Mesh(geo, mat);
    this.groundMesh.rotation.x = -Math.PI / 2;
    this.groundMesh.position.y = -0.02;
    this.groundMesh.receiveShadow = true;
    this.scene.add(this.groundMesh);

    const grid = new THREE.GridHelper(40, 40, 0x1a1f30, 0x0f1320);
    (grid.material as THREE.LineBasicMaterial).opacity = 0.25;
    (grid.material as THREE.LineBasicMaterial).transparent = true;
    grid.position.y = 0.001;
    this.scene.add(grid);
  }

  setArray(values: number[], target: number, sorted = false) {
    this.clearScene();
    this.createGround();
    this.bars = [];
    this.targetValue = target;

    const barWidth = 0.5;
    const barGap = 0.15;
    const totalWidth = values.length * (barWidth + barGap);
    const startX = -totalWidth / 2 + barWidth / 2;
    const maxVal = Math.max(...values, target);

    // 创建目标值指示器
    this.createTargetIndicator(target, maxVal);

    // 创建数组块
    for (let i = 0; i < values.length; i++) {
      const value = values[i];
      const height = (value / maxVal) * 3 + 0.3;
      const color = sorted ? this.getSortedColor(i, values.length) : new THREE.Color(this.theme.primary);

      const geo = new THREE.BoxGeometry(barWidth, height, barWidth);
      const mat = new THREE.MeshStandardMaterial({
        color: color,
        roughness: 0.3,
        metalness: 0.5,
        emissive: color,
        emissiveIntensity: 0.1,
      });
      const mesh = new THREE.Mesh(geo, mat);
      const x = startX + i * (barWidth + barGap);
      mesh.position.set(x, height / 2, 0);
      mesh.castShadow = true;
      this.scene.add(mesh);

      // 数值标签
      const label = this.createLabel(String(value));
      label.position.set(x, height + 0.5, 0);
      this.scene.add(label);

      this.bars.push({
        index: i,
        value,
        state: 'idle',
        mesh,
        label,
      });
    }

    // 添加索引标签
    for (let i = 0; i < values.length; i++) {
      const x = startX + i * (barWidth + barGap);
      const indexLabel = this.createLabel(String(i), 0.3);
      indexLabel.position.set(x, -0.3, 0.5);
      this.scene.add(indexLabel);
    }
  }

  private createTargetIndicator(target: number, maxVal: number) {
    // 目标值球体
    const geo = new THREE.SphereGeometry(0.4, 24, 16);
    const mat = new THREE.MeshStandardMaterial({
      color: this.theme.secondary,
      emissive: this.theme.secondary,
      emissiveIntensity: 0.8,
      roughness: 0.2,
      metalness: 0.6,
    });
    this.targetMesh = new THREE.Mesh(geo, mat);
    this.targetMesh.position.set(8, 4, -3);
    this.scene.add(this.targetMesh);

    // 目标值标签
    const label = this.createLabel(`目标: ${target}`, 0.5);
    label.position.set(8, 5, -3);
    this.scene.add(label);
    this.targetLabel = label;

    // 光环
    const ringGeo = new THREE.RingGeometry(0.5, 0.7, 32);
    const ringMat = new THREE.MeshBasicMaterial({
      color: this.theme.secondary,
      transparent: true,
      opacity: 0.5,
      side: THREE.DoubleSide,
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.position.set(8, 4, -3);
    this.scene.add(ring);
  }

  private createLabel(text: string, scale = 0.4): THREE.Sprite {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 64;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = 'transparent';
    ctx.fillRect(0, 0, 128, 64);
    ctx.font = 'bold 32px monospace';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, 64, 32);

    const texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.LinearFilter;
    const mat = new THREE.SpriteMaterial({ map: texture, transparent: true });
    const sprite = new THREE.Sprite(mat);
    sprite.scale.set(scale * 4, scale * 2, 1);
    return sprite;
  }

  private getSortedColor(index: number, total: number): THREE.Color {
    const t = index / (total - 1 || 1);
    const c1 = new THREE.Color(this.theme.primary);
    const c2 = new THREE.Color(this.theme.accent);
    return c1.lerp(c2, t);
  }

  highlight(indices: number[], state: 'comparing' | 'found' | 'range' = 'comparing') {
    for (let i = 0; i < this.bars.length; i++) {
      const bar = this.bars[i];
      const isTarget = indices.includes(i);
      const mat = bar.mesh.material as THREE.MeshStandardMaterial;

      if (isTarget) {
        bar.state = state;
        if (state === 'comparing') {
          mat.emissive.set(this.theme.highlight);
          mat.emissiveIntensity = 0.6;
          bar.mesh.scale.setScalar(1.1);
        } else if (state === 'found') {
          mat.emissive.set(this.theme.secondary);
          mat.emissiveIntensity = 1.0;
          bar.mesh.scale.setScalar(1.2);
        } else if (state === 'range') {
          mat.emissive.set(this.theme.accent);
          mat.emissiveIntensity = 0.4;
          bar.mesh.scale.setScalar(1.05);
        }
      } else if (bar.state !== 'found') {
        bar.state = 'idle';
        mat.emissiveIntensity = 0.1;
        bar.mesh.scale.lerp(new THREE.Vector3(1, 1, 1), 0.3);
      }
    }
  }

  markFound(index: number) {
    const bar = this.bars[index];
    if (!bar) return;
    bar.state = 'found';
    const mat = bar.mesh.material as THREE.MeshStandardMaterial;
    mat.color.set(this.theme.secondary);
    mat.emissive.set(this.theme.secondary);
    mat.emissiveIntensity = 1.2;
    bar.mesh.scale.setScalar(1.25);
  }

  protected onUpdate(delta: number, elapsed: number) {
    // 目标指示器脉冲
    if (this.targetMesh) {
      const pulse = (Math.sin(elapsed * 4) + 1) / 2;
      const scale = 1 + pulse * 0.15;
      this.targetMesh.scale.setScalar(scale);
    }

    // 当前比较元素呼吸效果
    for (const bar of this.bars) {
      if (bar.state === 'comparing') {
        const pulse = (Math.sin(elapsed * 6) + 1) / 2;
        const yScale = 1 + pulse * 0.08;
        bar.mesh.scale.y = yScale;
      } else if (bar.state === 'found') {
        bar.mesh.rotation.y += delta * 0.5;
      }
    }
  }

  reset() {
    for (const bar of this.bars) {
      bar.state = 'idle';
      const mat = bar.mesh.material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity = 0.1;
      bar.mesh.scale.set(1, 1, 1);
      bar.mesh.rotation.y = 0;
    }
  }
}
