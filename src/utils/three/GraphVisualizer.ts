/**
 * 图算法 3D 可视化
 * 节点用 3D 球体, 边用 Line
 * 力导向布局 (简单斥力 + 边弹簧)
 * 节点状态: idle / queue / visited / current / mst
 */

import * as THREE from 'three';
import { ThreeVisualizer, DARK_THEME, type VisualizerTheme } from './ThreeVisualizer';

export interface GraphNode3D {
  id: number;
  label: string;
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  mesh: THREE.Mesh;
  halo: THREE.Mesh;
  state: 'idle' | 'queue' | 'visited' | 'current' | 'mst';
  baseColor: THREE.Color;
}

export interface GraphEdge3D {
  from: number;
  to: number;
  weight: number;
  line: THREE.Line;
  isMst: boolean;
}

export class GraphVisualizer extends ThreeVisualizer {
  private nodes: GraphNode3D[] = [];
  private edges: GraphEdge3D[] = [];
  private forceStrength = 5;
  private centerPull = 0.05;
  private groundMesh: THREE.Mesh | null = null;

  protected onInit() {
    this.createGround();
  }

  protected onThemeChange(theme: VisualizerTheme) {
    this.theme = theme;
    for (const node of this.nodes) {
      node.mesh.material = this.makeNodeMaterial(node.state);
      node.halo.material = this.makeHaloMaterial(node.state);
    }
    for (const edge of this.edges) {
      this.updateEdgeColor(edge);
    }
    if (this.groundMesh) {
      (this.groundMesh.material as THREE.MeshStandardMaterial).color.set(theme.bg);
    }
  }

  private createGround() {
    const geo = new THREE.PlaneGeometry(40, 40);
    const mat = new THREE.MeshStandardMaterial({
      color: this.theme.bg,
      roughness: 0.9,
      metalness: 0.05,
    });
    this.track({ dispose: () => mat.dispose() });
    this.groundMesh = new THREE.Mesh(geo, mat);
    this.groundMesh.rotation.x = -Math.PI / 2;
    this.groundMesh.position.y = -3.5;
    this.groundMesh.receiveShadow = true;
    this.scene.add(this.groundMesh);

    const grid = new THREE.GridHelper(40, 20, 0x1a1f30, 0x0f1320);
    (grid.material as THREE.LineBasicMaterial).opacity = 0.25;
    (grid.material as THREE.LineBasicMaterial).transparent = true;
    grid.position.y = -3.49;
    this.scene.add(grid);
  }

  setGraph(nodes: { id: number; label: string }[], edges: { from: number; to: number; weight: number }[]) {
    this.clearScene();
    this.createGround();
    this.nodes = [];
    this.edges = [];

    const n = nodes.length;
    const radius = 6;
    for (let i = 0; i < n; i++) {
      const phi = Math.acos(-1 + (2 * i) / Math.max(1, n - 1));
      const theta = Math.sqrt(Math.max(1, n - 1) * Math.PI) * phi;
      const x = radius * Math.cos(theta) * Math.sin(phi);
      const y = radius * Math.cos(phi) * 0.5;
      const z = radius * Math.sin(theta) * Math.sin(phi);

      this.addNode(nodes[i].id, nodes[i].label, new THREE.Vector3(x, y, z));
    }

    for (const e of edges) {
      this.addEdge(e.from, e.to, e.weight);
    }
  }

  private addNode(id: number, label: string, position: THREE.Vector3) {
    const geo = new THREE.SphereGeometry(0.45, 24, 16);
    const mat = this.makeNodeMaterial('idle');
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.copy(position);
    mesh.castShadow = true;
    mesh.userData = { id, label };
    this.scene.add(mesh);

    const haloGeo = new THREE.RingGeometry(0.55, 0.7, 32);
    const haloMat = this.makeHaloMaterial('idle');
    const halo = new THREE.Mesh(haloGeo, haloMat);
    halo.rotation.x = -Math.PI / 2;
    halo.position.copy(position);
    halo.position.y -= 0.45;
    this.scene.add(halo);

    this.nodes.push({
      id, label, position, velocity: new THREE.Vector3(),
      mesh, halo, state: 'idle',
      baseColor: new THREE.Color(0xffffff),
    });
  }

  private makeNodeMaterial(state: GraphNode3D['state']): THREE.MeshStandardMaterial {
    const colorHex = (() => {
      switch (state) {
        case 'idle': return 0xcccccc;
        case 'queue': return this.theme.accent;
        case 'visited': return this.theme.primary;
        case 'current': return this.theme.secondary;
        case 'mst': return this.theme.highlight;
      }
    })();
    const emissiveHex = (() => {
      switch (state) {
        case 'idle': return 0x000000;
        case 'queue': return this.theme.accent;
        case 'visited': return this.theme.primary;
        case 'current': return this.theme.secondary;
        case 'mst': return this.theme.highlight;
      }
    })();
    const emissiveIntensity = state === 'idle' ? 0 : state === 'current' ? 0.8 : state === 'mst' ? 0.6 : 0.4;
    return new THREE.MeshStandardMaterial({
      color: new THREE.Color(colorHex),
      emissive: new THREE.Color(emissiveHex),
      emissiveIntensity,
      roughness: 0.3, metalness: 0.6,
    });
  }

  private makeHaloMaterial(state: GraphNode3D['state']): THREE.MeshBasicMaterial {
    const colorHex = (() => {
      switch (state) {
        case 'idle': return 0x888888;
        case 'queue': return this.theme.accent;
        case 'visited': return this.theme.primary;
        case 'current': return this.theme.secondary;
        case 'mst': return this.theme.highlight;
      }
    })();
    const opacity = state === 'idle' ? 0.1 : state === 'current' ? 0.6 : state === 'mst' ? 0.5 : 0.3;
    return new THREE.MeshBasicMaterial({
      color: new THREE.Color(colorHex),
      transparent: true, opacity,
      side: THREE.DoubleSide,
    });
  }

  private addEdge(from: number, to: number, weight: number) {
    const fromNode = this.nodes[from];
    const toNode = this.nodes[to];
    if (!fromNode || !toNode) return;

    const geo = new THREE.BufferGeometry().setFromPoints([fromNode.position.clone(), toNode.position.clone()]);
    const mat = new THREE.LineBasicMaterial({ color: 0x444444, transparent: true, opacity: 0.6 });
    this.track({ dispose: () => mat.dispose() });
    const line = new THREE.Line(geo, mat);
    this.scene.add(line);

    this.edges.push({ from, to, weight, line, isMst: false });
  }

  setNodeState(id: number, state: GraphNode3D['state']) {
    const node = this.nodes[id];
    if (!node) return;
    node.state = state;
    const oldMat = node.mesh.material as THREE.MeshStandardMaterial;
    oldMat?.dispose?.();
    node.mesh.material = this.makeNodeMaterial(state);
    const oldHalo = node.halo.material as THREE.MeshBasicMaterial;
    oldHalo?.dispose?.();
    node.halo.material = this.makeHaloMaterial(state);
  }

  setEdgeMst(from: number, to: number, isMst: boolean) {
    const edge = this.edges.find(e =>
      (e.from === from && e.to === to) || (e.from === to && e.to === from)
    );
    if (!edge) return;
    edge.isMst = isMst;
    this.updateEdgeColor(edge);
  }

  private updateEdgeColor(edge: GraphEdge3D) {
    const oldMat = edge.line.material as THREE.LineBasicMaterial;
    oldMat?.dispose?.();
    edge.line.material = new THREE.LineBasicMaterial({
      color: edge.isMst ? this.theme.highlight : 0x444444,
      transparent: true,
      opacity: edge.isMst ? 0.9 : 0.6,
    });
  }

  private updateEdgePositions() {
    for (const edge of this.edges) {
      const fromNode = this.nodes[edge.from];
      const toNode = this.nodes[edge.to];
      if (!fromNode || !toNode) continue;
      const positions = edge.line.geometry.attributes.position as THREE.BufferAttribute;
      if (!positions) continue;
      positions.setXYZ(0, fromNode.position.x, fromNode.position.y, fromNode.position.z);
      positions.setXYZ(1, toNode.position.x, toNode.position.y, toNode.position.z);
      positions.needsUpdate = true;
    }
  }

  protected onUpdate(delta: number, elapsed: number) {
    const damping = 0.85;
    const repulsion = this.forceStrength;
    const idealLength = 4.5;
    const springK = 0.05;

    for (let i = 0; i < this.nodes.length; i++) {
      const a = this.nodes[i];
      a.velocity.multiplyScalar(damping);
      a.velocity.add(a.position.clone().multiplyScalar(-this.centerPull));
    }

    for (let i = 0; i < this.nodes.length; i++) {
      for (let j = i + 1; j < this.nodes.length; j++) {
        const a = this.nodes[i];
        const b = this.nodes[j];
        const diff = a.position.clone().sub(b.position);
        const dist = diff.length() + 0.01;
        const force = repulsion / (dist * dist);
        diff.normalize().multiplyScalar(force);
        a.velocity.add(diff);
        b.velocity.sub(diff);
      }
    }

    for (const edge of this.edges) {
      const a = this.nodes[edge.from];
      const b = this.nodes[edge.to];
      if (!a || !b) continue;
      const diff = b.position.clone().sub(a.position);
      const dist = diff.length() + 0.01;
      const force = (dist - idealLength) * springK;
      diff.normalize().multiplyScalar(force);
      a.velocity.add(diff);
      b.velocity.sub(diff);
    }

    for (const node of this.nodes) {
      node.position.add(node.velocity.clone().multiplyScalar(delta * 30));
      node.position.y = Math.max(node.position.y, -2.5);
      node.mesh.position.copy(node.position);
      node.halo.position.set(node.position.x, node.position.y - 0.45, node.position.z);
    }

    this.updateEdgePositions();

    const pulse = (Math.sin(elapsed * 3) + 1) / 2;
    for (const node of this.nodes) {
      if (node.state === 'current') {
        const scale = 1 + pulse * 0.2;
        node.mesh.scale.setScalar(scale);
        node.halo.scale.setScalar(scale * 1.1);
      } else {
        node.mesh.scale.lerp(new THREE.Vector3(1, 1, 1), 0.1);
        node.halo.scale.lerp(new THREE.Vector3(1, 1, 1), 0.1);
      }
    }
  }

  getNodePosition(id: number): THREE.Vector3 | null {
    return this.nodes[id]?.position.clone() ?? null;
  }
}
