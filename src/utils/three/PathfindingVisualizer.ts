/**
 * 寻路算法 3D 可视化
 * 网格地面 + 抬升的墙体迷宫
 * 起点/终点用发光柱, 访问过的格子留下方块痕迹
 */

import * as THREE from 'three';
import { ThreeVisualizer, DARK_THEME, type VisualizerTheme } from './ThreeVisualizer';

export interface PathCell {
  row: number;
  col: number;
  isWall: boolean;
  isStart: boolean;
  isEnd: boolean;
  visited: boolean;
  isPath: boolean;
  inOpenSet: boolean;
  cost: number;
  mesh: THREE.Mesh | null;
  visitedMarker: THREE.Mesh | null;
  currentPulse: number;
}

export class PathfindingVisualizer extends ThreeVisualizer {
  private cells: PathCell[][] = [];
  private cellSize = 0.8;
  private gridSize = 15;
  private groundMesh: THREE.Mesh | null = null;
  private wallMaterial: THREE.MeshStandardMaterial;
  private floorMaterial: THREE.MeshStandardMaterial;
  private startMaterial: THREE.MeshStandardMaterial;
  private endMaterial: THREE.MeshStandardMaterial;
  private visitedMaterial: THREE.MeshStandardMaterial;
  private pathMaterial: THREE.MeshStandardMaterial;
  private openSetMaterial: THREE.MeshStandardMaterial;
  private pathLine: THREE.Line | null = null;
  private pathGeometry: THREE.BufferGeometry | null = null;

  constructor(container: HTMLElement) {
    super(container, {
      cameraPosition: [12, 14, 16],
      fov: 45,
    });

    this.wallMaterial = new THREE.MeshStandardMaterial({
      color: this.theme.text,
      roughness: 0.4,
      metalness: 0.2,
      emissive: 0x000000,
      transparent: true,
      opacity: 0.85,
    });
    this.track({ dispose: () => this.wallMaterial.dispose() });

    this.floorMaterial = new THREE.MeshStandardMaterial({
      color: this.theme.bg,
      roughness: 0.9,
      metalness: 0.1,
    });
    this.track({ dispose: () => this.floorMaterial.dispose() });

    this.startMaterial = new THREE.MeshStandardMaterial({
      color: this.theme.primary,
      emissive: this.theme.primary,
      emissiveIntensity: 1.2,
      roughness: 0.2,
      metalness: 0.6,
    });
    this.track({ dispose: () => this.startMaterial.dispose() });

    this.endMaterial = new THREE.MeshStandardMaterial({
      color: this.theme.secondary,
      emissive: this.theme.secondary,
      emissiveIntensity: 1.2,
      roughness: 0.2,
      metalness: 0.6,
    });
    this.track({ dispose: () => this.endMaterial.dispose() });

    this.visitedMaterial = new THREE.MeshStandardMaterial({
      color: this.theme.accent,
      emissive: this.theme.accent,
      emissiveIntensity: 0.3,
      roughness: 0.5,
      metalness: 0.3,
      transparent: true,
      opacity: 0.4,
    });
    this.track({ dispose: () => this.visitedMaterial.dispose() });

    this.pathMaterial = new THREE.MeshStandardMaterial({
      color: this.theme.highlight,
      emissive: this.theme.highlight,
      emissiveIntensity: 0.8,
      roughness: 0.3,
      metalness: 0.5,
    });
    this.track({ dispose: () => this.pathMaterial.dispose() });

    this.openSetMaterial = new THREE.MeshStandardMaterial({
      color: this.theme.secondary,
      emissive: this.theme.secondary,
      emissiveIntensity: 0.4,
      roughness: 0.5,
      transparent: true,
      opacity: 0.5,
    });
    this.track({ dispose: () => this.openSetMaterial.dispose() });
  }

  protected onInit() {
    this.createGround();
  }

  protected onThemeChange(theme: VisualizerTheme) {
    this.theme = theme;
    this.wallMaterial.color.set(theme.text);
    this.floorMaterial.color.set(theme.bg);
    this.startMaterial.color.set(theme.primary);
    this.startMaterial.emissive.set(theme.primary);
    this.endMaterial.color.set(theme.secondary);
    this.endMaterial.emissive.set(theme.secondary);
    this.visitedMaterial.color.set(theme.accent);
    this.visitedMaterial.emissive.set(theme.accent);
    this.pathMaterial.color.set(theme.highlight);
    this.pathMaterial.emissive.set(theme.highlight);
    this.openSetMaterial.color.set(theme.secondary);
    this.openSetMaterial.emissive.set(theme.secondary);
  }

  private createGround() {
    const size = 30;
    const geo = new THREE.PlaneGeometry(size, size);
    this.groundMesh = new THREE.Mesh(geo, this.floorMaterial);
    this.groundMesh.rotation.x = -Math.PI / 2;
    this.groundMesh.position.y = -0.02;
    this.groundMesh.receiveShadow = true;
    this.scene.add(this.groundMesh);

    const grid = new THREE.GridHelper(size, 30, 0x1a1f30, 0x0f1320);
    (grid.material as THREE.LineBasicMaterial).opacity = 0.3;
    (grid.material as THREE.LineBasicMaterial).transparent = true;
    grid.position.y = 0.001;
    this.scene.add(grid);
  }

  setGrid(cells: { row: number; col: number; isWall: boolean; isStart: boolean; isEnd: boolean }[][]) {
    this.clearScene();
    this.createGround();
    this.gridSize = cells.length;
    this.cells = [];
    const offset = (this.gridSize * this.cellSize) / 2;

    for (let r = 0; r < cells.length; r++) {
      const row: PathCell[] = [];
      for (let c = 0; c < cells[r].length; c++) {
        const cell = cells[r][c];
        const x = c * this.cellSize - offset + this.cellSize / 2;
        const z = r * this.cellSize - offset + this.cellSize / 2;
        const pathCell: PathCell = {
          row: r, col: c,
          isWall: cell.isWall, isStart: cell.isStart, isEnd: cell.isEnd,
          visited: false, isPath: false, inOpenSet: false, cost: 0,
          mesh: null, visitedMarker: null, currentPulse: 0,
        };

        if (cell.isWall) {
          const wallHeight = 1.2;
          const geo = new THREE.BoxGeometry(this.cellSize * 0.95, wallHeight, this.cellSize * 0.95);
          const mesh = new THREE.Mesh(geo, this.wallMaterial);
          mesh.position.set(x, wallHeight / 2, z);
          mesh.castShadow = true;
          mesh.receiveShadow = true;
          this.scene.add(mesh);
          pathCell.mesh = mesh;
        } else if (cell.isStart) {
          const geo = new THREE.CylinderGeometry(this.cellSize * 0.3, this.cellSize * 0.3, 0.4, 16);
          const mesh = new THREE.Mesh(geo, this.startMaterial);
          mesh.position.set(x, 0.2, z);
          mesh.castShadow = true;
          this.scene.add(mesh);

          const haloGeo = new THREE.RingGeometry(this.cellSize * 0.35, this.cellSize * 0.5, 32);
          const haloMat = new THREE.MeshBasicMaterial({ color: this.theme.primary, transparent: true, opacity: 0.4, side: THREE.DoubleSide });
          this.track({ dispose: () => haloMat.dispose() });
          const halo = new THREE.Mesh(haloGeo, haloMat);
          halo.rotation.x = -Math.PI / 2;
          halo.position.set(x, 0.02, z);
          this.scene.add(halo);
          pathCell.mesh = mesh;
        } else if (cell.isEnd) {
          const geo = new THREE.CylinderGeometry(this.cellSize * 0.3, this.cellSize * 0.3, 0.4, 16);
          const mesh = new THREE.Mesh(geo, this.endMaterial);
          mesh.position.set(x, 0.2, z);
          mesh.castShadow = true;
          this.scene.add(mesh);

          const haloGeo = new THREE.RingGeometry(this.cellSize * 0.35, this.cellSize * 0.5, 32);
          const haloMat = new THREE.MeshBasicMaterial({ color: this.theme.secondary, transparent: true, opacity: 0.4, side: THREE.DoubleSide });
          this.track({ dispose: () => haloMat.dispose() });
          const halo = new THREE.Mesh(haloGeo, haloMat);
          halo.rotation.x = -Math.PI / 2;
          halo.position.set(x, 0.02, z);
          this.scene.add(halo);
          pathCell.mesh = mesh;
        }

        row.push(pathCell);
      }
      this.cells.push(row);
    }
  }

  markVisited(row: number, col: number) {
    const cell = this.cells[row]?.[col];
    if (!cell || cell.visited || cell.isWall) return;
    cell.visited = true;
    cell.inOpenSet = false;

    const offset = (this.gridSize * this.cellSize) / 2;
    const x = col * this.cellSize - offset + this.cellSize / 2;
    const z = row * this.cellSize - offset + this.cellSize / 2;

    const geo = new THREE.BoxGeometry(this.cellSize * 0.6, 0.12, this.cellSize * 0.6);
    const marker = new THREE.Mesh(geo, this.visitedMaterial);
    marker.position.set(x, 0.06, z);
    this.scene.add(marker);
    cell.visitedMarker = marker;
  }

  markInOpenSet(row: number, col: number) {
    const cell = this.cells[row]?.[col];
    if (!cell || cell.visited || cell.isWall) return;
    cell.inOpenSet = true;

    const offset = (this.gridSize * this.cellSize) / 2;
    const x = col * this.cellSize - offset + this.cellSize / 2;
    const z = row * this.cellSize - offset + this.cellSize / 2;

    if (!cell.visitedMarker) {
      const geo = new THREE.BoxGeometry(this.cellSize * 0.4, 0.06, this.cellSize * 0.4);
      const marker = new THREE.Mesh(geo, this.openSetMaterial);
      marker.position.set(x, 0.04, z);
      this.scene.add(marker);
      cell.visitedMarker = marker;
    }
  }

  markCurrent(row: number, col: number) {
    for (let r = 0; r < this.cells.length; r++) {
      for (let c = 0; c < this.cells[r].length; c++) {
        const cell = this.cells[r][c];
        if (cell.mesh && (cell.mesh.material as any).emissiveIntensity !== undefined) {
          cell.currentPulse = 0;
        }
      }
    }
    const cell = this.cells[row]?.[col];
    if (cell) cell.currentPulse = 1;
  }

  showPath(path: { row: number; col: number }[]) {
    if (this.pathLine) {
      this.scene.remove(this.pathLine);
      this.pathGeometry?.dispose();
    }
    if (path.length === 0) return;

    const offset = (this.gridSize * this.cellSize) / 2;
    const points: THREE.Vector3[] = [];
    for (const p of path) {
      const x = p.col * this.cellSize - offset + this.cellSize / 2;
      const z = p.row * this.cellSize - offset + this.cellSize / 2;
      points.push(new THREE.Vector3(x, 0.15, z));
    }

    this.pathGeometry = new THREE.BufferGeometry().setFromPoints(points);
    const lineMat = new THREE.LineBasicMaterial({
      color: this.theme.highlight,
      linewidth: 3,
    });
    this.track({ dispose: () => lineMat.dispose() });
    this.pathLine = new THREE.Line(this.pathGeometry, lineMat);
    this.scene.add(this.pathLine);

    for (const p of path) {
      const cell = this.cells[p.row]?.[p.col];
      if (cell) {
        cell.isPath = true;
        if (cell.visitedMarker) {
          cell.visitedMarker.material = this.pathMaterial;
        }
      }
    }
  }

  protected onUpdate(delta: number, elapsed: number) {
    const pulse = (Math.sin(elapsed * 4) + 1) / 2;
    for (let r = 0; r < this.cells.length; r++) {
      for (let c = 0; c < this.cells[r].length; c++) {
        const cell = this.cells[r][c];
        if (cell.currentPulse > 0 && cell.mesh) {
          const scale = 1 + pulse * 0.15;
          cell.mesh.scale.set(scale, 1.3 + pulse * 0.2, scale);
        }
      }
    }
  }
}
