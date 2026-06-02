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

  render(state: RenderState) {
    const ctx = this.offscreenCtx;
    const width = this.offscreenCanvas.width / this.dpr;
    const height = this.offscreenCanvas.height / this.dpr;

    // Dark background
    ctx.fillStyle = this.config.backgroundColor;
    ctx.fillRect(0, 0, width, height);

    const { array, comparing, swapping, sorted, pivot } = state;
    if (array.length === 0) return;

    const gap = 4;
    const barWidth = (width - (array.length + 1) * gap) / array.length;
    const maxValue = Math.max(...array, 1);
    const padding = 40;
    const chartHeight = height - padding * 2;

    // Draw bars
    for (let i = 0; i < array.length; i++) {
      const barHeight = (array[i] / maxValue) * chartHeight;
      const x = gap + i * (barWidth + gap);
      const y = height - padding - barHeight;
      const bw = Math.max(1, barWidth);
      const bh = Math.max(1, barHeight);

      // Determine color based on state
      let color = this.config.barColor;
      let isActive = false;

      if (sorted.includes(i)) {
        color = this.config.sortedColor;
      } else if (swapping.includes(i)) {
        color = this.config.swappingColor;
        isActive = true;
      } else if (comparing.includes(i)) {
        // Alternate colors for comparing elements
        const compareIndex = comparing.indexOf(i);
        color = compareIndex === 0 ? this.config.comparingColor : '#f59e0b';
        isActive = true;
      } else if (pivot !== undefined && i === pivot) {
        color = this.config.pivotColor;
        isActive = true;
      }

      // Draw top-rounded bar
      ctx.save();
      this.drawTopRoundedBar(ctx, x, y, bw, bh, Math.min(bw / 2, 8));

      // Gradient fill
      if (this.config.gradientEnabled) {
        const gradient = ctx.createLinearGradient(x, y, x, y + bh);
        gradient.addColorStop(0, this.lightenColor(color, 0.2));
        gradient.addColorStop(0.5, color);
        gradient.addColorStop(1, this.darkenColor(color, 0.3));
        ctx.fillStyle = gradient;
      } else {
        ctx.fillStyle = color;
      }
      ctx.fill();

      // Glow effect for active bars
      if (this.config.glowEnabled && isActive) {
        ctx.shadowColor = color;
        ctx.shadowBlur = 20;
        ctx.shadowOffsetY = 0;
        ctx.strokeStyle = color;
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.shadowBlur = 0;
      }
      ctx.restore();
    }

    // Draw swap arrows between comparing elements
    if (comparing.length >= 2) {
      this.drawSwapArrows(ctx, array, comparing, maxValue, chartHeight, width, height, padding, gap, barWidth);
    }

    // Copy to main canvas
    this.ctx.drawImage(this.offscreenCanvas, 0, 0, width * this.dpr, height * this.dpr);
  }

  private drawTopRoundedBar(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h);
    ctx.lineTo(x, y + h);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }

  private drawSwapArrows(ctx: CanvasRenderingContext2D, array: number[], comparing: number[], maxValue: number, chartHeight: number, width: number, height: number, padding: number, gap: number, barWidth: number) {
    const [i, j] = comparing;
    if (i === undefined || j === undefined || i === j) return;

    const x1 = gap + i * (barWidth + gap) + barWidth / 2;
    const x2 = gap + j * (barWidth + gap) + barWidth / 2;
    const y1 = height - padding - (array[i] / maxValue) * chartHeight - 12;
    const y2 = height - padding - (array[j] / maxValue) * chartHeight - 12;
    const arrowY = Math.min(y1, y2) - 10;

    ctx.save();
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 2;
    ctx.fillStyle = '#fbbf24';

    // Draw curved arrow from i to j
    const midX = (x1 + x2) / 2;
    const controlY = arrowY - 20;

    // Arrow path
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.quadraticCurveTo(x1, controlY, midX, controlY);
    ctx.quadraticCurveTo(x2, controlY, x2, y2);
    ctx.stroke();

    // Arrow head at j
    const angle = Math.atan2(y2 - controlY, x2 - midX);
    const headLen = 8;
    ctx.beginPath();
    ctx.moveTo(x2, y2);
    ctx.lineTo(x2 - headLen * Math.cos(angle - Math.PI / 6), y2 - headLen * Math.sin(angle - Math.PI / 6));
    ctx.lineTo(x2 - headLen * Math.cos(angle + Math.PI / 6), y2 - headLen * Math.sin(angle + Math.PI / 6));
    ctx.closePath();
    ctx.fill();

    ctx.restore();
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

  private lightenColor(hex: string, amount: number): string {
    const num = parseInt(hex.replace('#', ''), 16);
    const r = Math.min(255, (num >> 16) + 255 * amount);
    const g = Math.min(255, ((num >> 8) & 0x00ff) + 255 * amount);
    const b = Math.min(255, (num & 0x0000ff) + 255 * amount);
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
    barColor: '#3b82f6',
    comparingColor: '#fbbf24',
    swappingColor: '#ef4444',
    sortedColor: '#0d9488',
    pivotColor: '#8b5cf6',
    backgroundColor: '#0a0e17',
    gradientEnabled: true,
    glowEnabled: true,
    particleEnabled: false,
  });
}
