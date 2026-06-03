/**
 * Sorting 3D Visualizer - restrained monochrome treatment
 */

import * as THREE from 'three';
import { gsap } from 'gsap';
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
    this.grid = new THREE.GridHelper(60, 60, 0x4b5563, 0x1f2937);
    (this.grid.material as THREE.LineBasicMaterial).opacity = 0.16;
    (this.grid.material as THREE.LineBasicMaterial).transparent = true;
    this.grid.position.y = 0;
    this.scene.add(this.grid);

    this.styleLight = new THREE.PointLight(0xffffff, 0.28, 26);
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
      gsap.killTweensOf([bar.mesh.position, bar.mesh.scale, bar.material.color, bar.material.emissive, bar.material]);
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
        roughness: 0.36,
        metalness: 0.28,
        emissive: color.clone(),
        emissiveIntensity: 0.08,
        transparent: true,
        opacity: 0.96,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.castShadow = true;
      mesh.receiveShadow = true;

      const x = startX + i * (this.barWidth + this.barGap);
      mesh.position.set(x, h / 2, 0);
      this.scene.add(mesh);

      const edges = new THREE.EdgesGeometry(geo);
      const edgeMat = new THREE.LineBasicMaterial({
        color: 0xd1d5db,
        transparent: true,
        opacity: 0.28,
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

  playCompletionEffect() {
    this.bars.forEach((bar, index) => {
      if (bar.state !== 'sorted') {
        return;
      }

      const delay = index * 0.025;
      gsap.to(bar.material, {
        emissiveIntensity: 1.15,
        duration: 0.24,
        delay,
        ease: 'power2.out',
        yoyo: true,
        repeat: 1,
        overwrite: 'auto',
      });

      gsap.to(bar.mesh.position, {
        y: bar.mesh.position.y + 0.24,
        duration: 0.28,
        delay,
        ease: 'power2.out',
        yoyo: true,
        repeat: 1,
        overwrite: 'auto',
      });

      gsap.to(bar.mesh.scale, {
        x: 1.08,
        z: 1.08,
        duration: 0.28,
        delay,
        ease: 'power2.out',
        yoyo: true,
        repeat: 1,
        overwrite: 'auto',
      });
    });
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
      const targetScaleY = newH / (bar.mesh.geometry as THREE.BoxGeometry).parameters.height;

      gsap.to(bar.mesh.scale, {
        y: targetScaleY,
        duration: 0.46,
        ease: 'power2.inOut',
        overwrite: 'auto',
      });

      gsap.to(bar.mesh.position, {
        y: newH / 2,
        duration: 0.46,
        ease: 'power2.inOut',
        overwrite: 'auto',
      });
      
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
          targetColor = new THREE.Color(0xe5e7eb);
          emissiveIntensity = 0.2;
          pulse = 1.05;
          break;
        case 'swapping':
          targetColor = new THREE.Color(0xffffff);
          emissiveIntensity = 0.28;
          pulse = 1.08;
          break;
        case 'pivot':
          targetColor = new THREE.Color(0x9ca3af);
          emissiveIntensity = 0.14;
          pulse = 1.04;
          break;
        case 'sorted':
          targetColor = new THREE.Color(0xf3f4f6);
          emissiveIntensity = 0.16;
          break;
      }

      gsap.to(bar.material.color, {
        r: targetColor.r,
        g: targetColor.g,
        b: targetColor.b,
        duration: 0.32,
        ease: 'power2.out',
        overwrite: 'auto',
      });

      gsap.to(bar.material.emissive, {
        r: targetColor.r,
        g: targetColor.g,
        b: targetColor.b,
        duration: 0.32,
        ease: 'power2.out',
        overwrite: 'auto',
      });

      gsap.to(bar.material, {
        emissiveIntensity,
        duration: 0.34,
        ease: 'power2.out',
        overwrite: 'auto',
      });

      gsap.to(bar.mesh.scale, {
        x: pulse,
        z: pulse,
        duration: bar.state === 'swapping' ? 0.42 : 0.32,
        ease: bar.state === 'swapping' ? 'elastic.out(1, 0.55)' : 'power2.out',
        overwrite: 'auto',
      });
    }
  }

  private idleColor(index: number): THREE.Color {
    const colors = [
      new THREE.Color(0x8f98a7),
      new THREE.Color(0xa5adba),
      new THREE.Color(0xc2c8d1),
      new THREE.Color(0x727985),
    ];
    return colors[index % colors.length];
  }

  protected onUpdate(delta: number, _elapsed: number) {
    const t = 1 - Math.pow(0.001, delta);
    const styleColor = new THREE.Color(0xf3f4f6);

    if (this.styleLight) {
      this.styleLight.color.lerp(styleColor, t * 0.5);
      this.styleLight.intensity += (0.26 - this.styleLight.intensity) * t * 0.35;
    }

    if (this.grid) {
      (this.grid.material as THREE.LineBasicMaterial).color.lerp(styleColor, t * 0.05);
      (this.grid.material as THREE.LineBasicMaterial).opacity += (0.14 - (this.grid.material as THREE.LineBasicMaterial).opacity) * t * 0.12;
    }

    for (const bar of this.bars) {
      // Gentle rotation
      bar.mesh.rotation.y += delta * 0.01;
    }

    // Camera gentle orbit
    const time = _elapsed * 0.1;
    this.camera.position.x = Math.sin(time) * 2;
    this.camera.position.z = 14 + Math.cos(time) * 2;
    this.camera.lookAt(0, 2, 0);
  }

  reset() {
    for (const bar of this.bars) {
      gsap.killTweensOf([bar.mesh.position, bar.mesh.scale, bar.material.color, bar.material.emissive, bar.material]);
      bar.state = 'idle';
    }
    this.syncVisualStates();
  }
}
