export interface RenderState {
  array: number[];
  comparing: number[];
  swapping: number[];
  sorted: number[];
  pivot?: number;
}

export interface RenderConfig {
  barColor: string;
  comparingColor: string;
  swappingColor: string;
  sortedColor: string;
  pivotColor: string;
  backgroundColor: string;
  gradientEnabled: boolean;
  glowEnabled: boolean;
  particleEnabled: boolean;
}

const defaultConfig: RenderConfig = {
  barColor: '#cccccc',
  comparingColor: '#555555',
  swappingColor: '#1a1a1a',
  sortedColor: '#e5e5e5',
  pivotColor: '#888888',
  backgroundColor: '#ffffff',
  gradientEnabled: true,
  glowEnabled: true,
  particleEnabled: true,
};

export class DoubleBufferedRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private offscreenCanvas: HTMLCanvasElement;
  private offscreenCtx: CanvasRenderingContext2D;
  private animationId: number | null = null;
  private particles: Particle[] = [];
  private config: RenderConfig;
  private dpr: number = 1;

  constructor(canvas: HTMLCanvasElement, config: Partial<RenderConfig> = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.config = { ...defaultConfig, ...config };

    this.offscreenCanvas = document.createElement('canvas');
    this.offscreenCtx = this.offscreenCanvas.getContext('2d')!;

    this.setupCanvas();
  }

  private setupCanvas() {
    this.dpr = window.devicePixelRatio || 1;
    const rect = this.canvas.getBoundingClientRect();

    this.offscreenCanvas.width = rect.width * this.dpr;
    this.offscreenCanvas.height = rect.height * this.dpr;

    this.canvas.width = rect.width * this.dpr;
    this.canvas.height = rect.height * this.dpr;

    this.ctx.scale(this.dpr, this.dpr);
    this.offscreenCtx.scale(this.dpr, this.dpr);
  }

  resize() {
    this.setupCanvas();
  }

  clear() {
    const width = this.canvas.width / this.dpr;
    const height = this.canvas.height / this.dpr;

    this.ctx.fillStyle = this.config.backgroundColor;
    this.ctx.fillRect(0, 0, width, height);

    this.offscreenCtx.fillStyle = this.config.backgroundColor;
    this.offscreenCtx.fillRect(0, 0, width, height);
  }

  render(state: RenderState, animate: boolean = false) {
    const ctx = this.offscreenCtx;
    const width = this.offscreenCanvas.width / this.dpr;
    const height = this.offscreenCanvas.height / this.dpr;

    ctx.fillStyle = this.config.backgroundColor;
    ctx.fillRect(0, 0, width, height);

    const { array, comparing, swapping, sorted, pivot } = state;
    if (array.length === 0) return;

    const barWidth = width / array.length;
    const maxValue = Math.max(...array, 100);
    const padding = 20;
    const chartHeight = height - padding * 2;

    for (let i = 0; i < array.length; i++) {
      const barHeight = (array[i] / maxValue) * chartHeight;
      const x = i * barWidth;
      const y = height - barHeight - padding;
      const bw = barWidth - 2;
      const bh = barHeight;

      let color = this.config.barColor;
      let isActive = false;

      if (sorted.includes(i)) {
        color = this.config.sortedColor;
      } else if (swapping.includes(i)) {
        color = this.config.swappingColor;
        isActive = true;
      } else if (comparing.includes(i)) {
        color = this.config.comparingColor;
        isActive = true;
      } else if (pivot !== undefined && i === pivot) {
        color = this.config.pivotColor;
        isActive = true;
      }

      if (this.config.gradientEnabled) {
        const gradient = ctx.createLinearGradient(x, y, x, y + bh);
        gradient.addColorStop(0, color);
        gradient.addColorStop(1, this.darkenColor(color, 0.15));
        ctx.fillStyle = gradient;
      } else {
        ctx.fillStyle = color;
      }

      if (this.config.glowEnabled && isActive) {
        ctx.shadowColor = color;
        ctx.shadowBlur = 12;
        ctx.shadowOffsetY = 4;
      }

      ctx.beginPath();
      const radius = Math.min(3, bw / 2);
      this.roundRect(ctx, x + 1, y, bw - 2, bh, radius);
      ctx.fill();

      ctx.shadowBlur = 0;
      ctx.shadowOffsetY = 0;

      if (bw > 8 && bh > 15) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
        ctx.fillRect(x + 2, y + 2, bw - 4, 2);
      }
    }

    if (this.config.particleEnabled) {
      this.renderParticles(ctx, width, height);
    }

    this.ctx.drawImage(this.offscreenCanvas, 0, 0, width * this.dpr, height * this.dpr);

    this.particles = this.particles.filter(p => {
      p.update();
      return p.life > 0;
    });
  }

  private roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h);
    ctx.lineTo(x, y + h);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }

  private darkenColor(hex: string, amount: number): string {
    const num = parseInt(hex.replace('#', ''), 16);
    const r = Math.max(0, (num >> 16) * (1 - amount));
    const g = Math.max(0, ((num >> 8) & 0x00ff) * (1 - amount));
    const b = Math.max(0, (num & 0x0000ff) * (1 - amount));
    return `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`;
  }

  emitParticles(x: number, y: number, count: number = 8, color: string = '#1a1a1a') {
    for (let i = 0; i < count; i++) {
      this.particles.push(new Particle(x, y, color));
    }
  }

  private renderParticles(ctx: CanvasRenderingContext2D, width: number, height: number) {
    this.particles.forEach(p => p.draw(ctx));
  }

  destroy() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
    this.particles = [];
  }
}

class Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;

  constructor(x: number, y: number, color: string) {
    this.x = x;
    this.y = y;
    const angle = Math.random() * Math.PI * 2;
    const speed = 1 + Math.random() * 3;
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed - 2;
    this.life = 1;
    this.maxLife = 20 + Math.random() * 15;
    this.size = 2 + Math.random() * 4;
    this.color = color;
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.vy += 0.15;
    this.vx *= 0.98;
    this.life -= 1 / this.maxLife;
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.globalAlpha = this.life * 0.8;
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size * this.life, 0, Math.PI * 2);
    ctx.fill();

    ctx.globalAlpha = this.life * 0.3;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size * this.life * 2, 0, Math.PI * 2);
    ctx.fill();

    ctx.globalAlpha = 1;
  }
}

export function createSortingRenderer(canvas: HTMLCanvasElement) {
  return new DoubleBufferedRenderer(canvas, {
    barColor: '#cccccc',
    comparingColor: '#555555',
    swappingColor: '#1a1a1a',
    sortedColor: '#e5e5e5',
    pivotColor: '#888888',
    backgroundColor: '#ffffff',
    gradientEnabled: true,
    glowEnabled: true,
    particleEnabled: true,
  });
}
