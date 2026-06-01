/**
 * 生成艺术系统
 * 包含三种主视觉：
 * 1. FlowField：沿噪声矢量场漂移的粒子，留尾迹
 * 2. Constellation：随机粒子 + 近距离连线
 * 3. Voronoi：细胞图，脉冲呼吸
 */

import { noise2D, fbm } from './noise';

export type Palette = {
  bg: string[];
  neon: [string, string, string, string];
};

// 4 主色霓虹色板
export const PALETTES: Record<'default' | 'cool' | 'warm', Palette> = {
  default: {
    bg: ['#0a0e1a', '#050810'],
    neon: ['#00e5ff', '#ff006e', '#8338ec', '#06ffa5'],
  },
  cool: {
    bg: ['#050a1a', '#020514'],
    neon: ['#00e5ff', '#3a86ff', '#8338ec', '#06ffa5'],
  },
  warm: {
    bg: ['#1a0a0e', '#100508'],
    neon: ['#ff006e', '#fb5607', '#ffbe0b', '#8338ec'],
  },
};

export class GenerativeRenderer {
  private ctx: CanvasRenderingContext2D;
  private width = 0;
  private height = 0;
  private dpr = 1;
  private time = 0;
  private mode: 'flow' | 'constellation' | 'voronoi' = 'flow';
  private palette: Palette = PALETTES.default;
  private mouseX = -1000;
  private mouseY = -1000;
  private rafId = 0;
  private visible = true;

  private particles: Particle[] = [];
  private voronoiPoints: { x: number; y: number; vx: number; vy: number; phase: number }[] = [];

  constructor(private canvas: HTMLCanvasElement) {
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) throw new Error('Canvas 2D context not available');
    this.ctx = ctx;
  }

  start(mode: 'flow' | 'constellation' | 'voronoi' = 'flow', palette: Palette = PALETTES.default) {
    this.mode = mode;
    this.palette = palette;
    this.resize();
    this.initParticles();
    this.initVoronoi();
    this.loop();
    this.handleVisibility();
  }

  stop() {
    cancelAnimationFrame(this.rafId);
    document.removeEventListener('visibilitychange', this.onVisibilityChange);
  }

  setMode(mode: 'flow' | 'constellation' | 'voronoi') {
    this.mode = mode;
    this.initParticles();
    this.initVoronoi();
  }

  setPalette(palette: Palette) {
    this.palette = palette;
  }

  setMouse(x: number, y: number) {
    this.mouseX = x;
    this.mouseY = y;
  }

  resize() {
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = this.canvas.getBoundingClientRect();
    this.width = rect.width;
    this.height = rect.height;
    this.canvas.width = this.width * this.dpr;
    this.canvas.height = this.height * this.dpr;
    this.ctx.scale(this.dpr, this.dpr);
  }

  private onVisibilityChange = () => {
    this.visible = !document.hidden;
    if (this.visible) this.loop();
  };

  private handleVisibility() {
    document.addEventListener('visibilitychange', this.onVisibilityChange);
  }

  private initParticles() {
    const count = this.mode === 'flow' ? 280 : 90;
    this.particles = [];
    for (let i = 0; i < count; i++) {
      this.particles.push(this.spawnParticle());
    }
  }

  private initVoronoi() {
    const count = 22;
    this.voronoiPoints = [];
    for (let i = 0; i < count; i++) {
      this.voronoiPoints.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        phase: Math.random() * Math.PI * 2,
      });
    }
  }

  private spawnParticle(): Particle {
    return {
      x: Math.random() * this.width,
      y: Math.random() * this.height,
      vx: 0,
      vy: 0,
      age: Math.random() * 200,
      life: 180 + Math.random() * 120,
      color: this.pickColor(),
      size: 0.6 + Math.random() * 1.8,
    };
  }

  private pickColor(): string {
    const [c1, c2, c3, c4] = this.palette.neon;
    return [c1, c2, c3, c4][Math.floor(Math.random() * 4)];
  }

  private loop = () => {
    if (!this.visible) return;
    this.rafId = requestAnimationFrame(this.loop);
    this.time += 1;
    this.render();
  };

  private render() {
    const { ctx, width, height } = this;
    const isDark = this.palette.bg[0] === '#0a0e1a' || this.palette.bg[0] === '#050a1a' || this.palette.bg[0] === '#1a0a0e';

    ctx.globalCompositeOperation = isDark ? 'source-over' : 'source-over';

    if (this.mode === 'flow') {
      ctx.fillStyle = 'rgba(5, 8, 16, 0.08)';
      ctx.fillRect(0, 0, width, height);
      ctx.globalCompositeOperation = 'lighter';
      this.updateAndDrawFlow();
    } else if (this.mode === 'constellation') {
      ctx.clearRect(0, 0, width, height);
      this.updateAndDrawConstellation();
    } else {
      ctx.fillStyle = this.palette.bg[0];
      ctx.fillRect(0, 0, width, height);
      this.drawVoronoi();
    }
  }

  private updateAndDrawFlow() {
    const { ctx, width, height, mouseX, mouseY, palette } = this;
    const scale = 0.0035;
    const speed = 1.2;
    const t = this.time * 0.0015;

    for (const p of this.particles) {
      const angle = noise2D(p.x * scale + t, p.y * scale) * Math.PI * 2.5;
      p.vx = Math.cos(angle) * speed;
      p.vy = Math.sin(angle) * speed;

      if (mouseX > 0) {
        const dx = mouseX - p.x;
        const dy = mouseY - p.y;
        const dist = Math.hypot(dx, dy);
        if (dist < 180) {
          const force = (1 - dist / 180) * 0.6;
          p.vx += (dx / dist) * force;
          p.vy += (dy / dist) * force;
        }
      }

      p.x += p.vx;
      p.y += p.vy;
      p.age++;

      if (p.x < 0) p.x = width;
      if (p.x > width) p.x = 0;
      if (p.y < 0) p.y = height;
      if (p.y > height) p.y = 0;

      if (p.age > p.life) {
        Object.assign(p, this.spawnParticle(), { x: p.x, y: p.y });
      }

      const alpha = Math.sin((p.age / p.life) * Math.PI) * 0.7;
      ctx.fillStyle = p.color;
      ctx.globalAlpha = alpha;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  private updateAndDrawConstellation() {
    const { ctx, width, height, mouseX, mouseY, particles, palette } = this;
    const [, , , mint] = palette.neon;

    for (const p of particles) {
      p.x += p.vx;
      p.y += p.vy;
      p.age++;

      if (mouseX > 0) {
        const dx = mouseX - p.x;
        const dy = mouseY - p.y;
        const dist = Math.hypot(dx, dy);
        if (dist < 200) {
          p.vx += (dx / dist) * 0.08;
          p.vy += (dy / dist) * 0.08;
        }
      }
      p.vx *= 0.96;
      p.vy *= 0.96;

      if (p.x < 0 || p.x > width || p.y < 0 || p.y > height || p.age > p.life) {
        Object.assign(p, this.spawnParticle(), { x: Math.random() * width, y: Math.random() * height });
        p.vx = (Math.random() - 0.5) * 0.5;
        p.vy = (Math.random() - 0.5) * 0.5;
      }

      ctx.fillStyle = p.color;
      ctx.globalAlpha = 0.85;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.lineWidth = 0.6;
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const a = particles[i];
        const b = particles[j];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const dist = Math.hypot(dx, dy);
        if (dist < 120) {
          const alpha = (1 - dist / 120) * 0.35;
          ctx.strokeStyle = a.color;
          ctx.globalAlpha = alpha;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }
    ctx.globalAlpha = 1;
  }

  private drawVoronoi() {
    const { ctx, width, height, voronoiPoints, palette, time } = this;
    const t = time * 0.008;

    for (let i = 0; i < voronoiPoints.length; i++) {
      const p = voronoiPoints[i];
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0 || p.x > width) p.vx *= -1;
      if (p.y < 0 || p.y > height) p.vy *= -1;
    }

    const cols = 20;
    const rows = 14;
    const cellW = width / cols;
    const cellH = height / rows;
    const [c1, c2, c3, c4] = palette.neon;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const cx = c * cellW + cellW / 2;
        const cy = r * cellH + cellH / 2;

        let nearest = -1;
        let minDist = Infinity;
        for (let i = 0; i < voronoiPoints.length; i++) {
          const dx = voronoiPoints[i].x - cx;
          const dy = voronoiPoints[i].y - cy;
          const d = dx * dx + dy * dy;
          if (d < minDist) {
            minDist = d;
            nearest = i;
          }
        }
        const dist = Math.sqrt(minDist);
        const phase = voronoiPoints[nearest].phase;
        const pulse = (Math.sin(t + phase) + 1) / 2;
        const alpha = 0.04 + pulse * 0.08;

        const color = [c1, c2, c3, c4][nearest % 4];
        ctx.fillStyle = color;
        ctx.globalAlpha = alpha;
        ctx.fillRect(c * cellW, r * cellH, cellW + 1, cellH + 1);
      }
    }

    ctx.globalAlpha = 1;
    for (let i = 0; i < voronoiPoints.length; i++) {
      const p = voronoiPoints[i];
      const pulse = (Math.sin(t * 1.5 + p.phase) + 1) / 2;
      const r = 1.5 + pulse * 1.5;
      const color = [c1, c2, c3, c4][i % 4];
      ctx.fillStyle = color;
      ctx.globalAlpha = 0.6 + pulse * 0.4;
      ctx.beginPath();
      ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  age: number;
  life: number;
  color: string;
  size: number;
}
