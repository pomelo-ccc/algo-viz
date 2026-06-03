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
  private lastState: RenderState | null = null;

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

    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    this.offscreenCtx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
  }

  resize() {
    this.setupCanvas();
    if (this.lastState) this.render(this.lastState);
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
    this.lastState = state;
    const ctx = this.offscreenCtx;
    const width = this.offscreenCanvas.width / this.dpr;
    const height = this.offscreenCanvas.height / this.dpr;

    this.drawReactiveBackground(ctx, width, height);

    const { array, comparing, swapping, sorted, pivot } = state;
    if (array.length === 0) return;

    const gap = Math.max(3, Math.min(8, width / array.length * 0.12));
    const paddingX = 28;
    const usableWidth = width - paddingX * 2;
    const barWidth = Math.max(8, (usableWidth - (array.length - 1) * gap) / array.length);
    const maxValue = Math.max(...array, 1);
    const paddingTop = 52;
    const paddingBottom = 42;
    const baseline = height - paddingBottom;
    const chartHeight = height - paddingTop - paddingBottom;

    // Draw bars
    for (let i = 0; i < array.length; i++) {
      const barHeightVal = (array[i] / maxValue) * chartHeight;
      const barHeight = Math.max(4, barHeightVal);
      const x = paddingX + i * (barWidth + gap);
      const y = baseline - barHeight;
      const bw = Math.max(2, barWidth);
      const bh = barHeight;

      // Determine color based on state
      let color = this.config.barColor;
      let isActive = false;

      if (sorted.includes(i)) {
        color = this.config.sortedColor;
      } else if (swapping.includes(i)) {
        color = this.config.swappingColor;
        isActive = true;
      } else if (comparing.includes(i)) {
        const compareIndex = comparing.indexOf(i);
        color = compareIndex === 0 ? this.config.comparingColor : '#f59e0b';
        isActive = true;
      } else if (pivot !== undefined && i === pivot) {
        color = this.config.pivotColor;
        isActive = true;
      }

      // Draw pill-shaped bar
      ctx.save();
      this.drawRoundedBar(ctx, x, y, bw, bh, Math.min(bw / 2, 14));

      // Gradient fill
      if (this.config.gradientEnabled) {
        const gradient = ctx.createLinearGradient(x, y, x, y + bh);
        gradient.addColorStop(0, this.lightenColor(color, 0.38));
        gradient.addColorStop(0.5, color);
        gradient.addColorStop(1, this.darkenColor(color, 0.2));
        ctx.fillStyle = gradient;
      } else {
        ctx.fillStyle = color;
      }
      ctx.fill();

      // Subtle border for visibility
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.lineWidth = 0.5;
      ctx.stroke();

      // Glow effect for active bars
      if (this.config.glowEnabled && isActive) {
        ctx.shadowColor = color;
        ctx.shadowBlur = 15;
        ctx.shadowOffsetY = 0;
        ctx.strokeStyle = color;
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.shadowBlur = 0;
      }
      ctx.restore();
    }

    // Copy to main canvas
    this.ctx.drawImage(this.offscreenCanvas, 0, 0, width, height);
  }

  private drawRoundedBar(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
    const radius = Math.min(r, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + w - radius, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
    ctx.lineTo(x + w, y + h - radius);
    ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
    ctx.lineTo(x + radius, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  }

  private drawSwapArrows(ctx: CanvasRenderingContext2D, array: number[], comparing: number[], maxValue: number, chartHeight: number, baseline: number, paddingX: number, gap: number, barWidth: number) {
    const [i, j] = comparing;
    if (i === undefined || j === undefined || i === j) return;

    const x1 = paddingX + i * (barWidth + gap) + barWidth / 2;
    const x2 = paddingX + j * (barWidth + gap) + barWidth / 2;
    const y1 = baseline - (array[i] / maxValue) * chartHeight - 12;
    const y2 = baseline - (array[j] / maxValue) * chartHeight - 12;
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

  private drawReactiveBackground(ctx: CanvasRenderingContext2D, width: number, height: number) {
    const px = width * 0.58;
    const py = height * 0.42;
    const accent = '#3b82f6';
    const bgGradient = ctx.createLinearGradient(0, 0, width, height);
    bgGradient.addColorStop(0, '#060a14');
    bgGradient.addColorStop(0.48, this.config.backgroundColor);
    bgGradient.addColorStop(1, '#151023');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, width, height);

    const glow = ctx.createRadialGradient(px, py, 0, px, py, Math.max(width, height) * 0.72);
    glow.addColorStop(0, this.hexToRgba(accent, 0.13));
    glow.addColorStop(0.34, this.hexToRgba(accent, 0.06));
    glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, width, height);

    ctx.save();
    ctx.globalAlpha = 0.14;
    ctx.strokeStyle = accent;
    ctx.lineWidth = 1;
    for (let x = -40; x < width + 40; x += 46) {
      ctx.beginPath();
      ctx.moveTo(x + 16, 0);
      ctx.lineTo(x - 64, height);
      ctx.stroke();
    }
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
    const source = this.hexToRgb(hex);
    const r = Math.max(0, source.r * (1 - amount));
    const g = Math.max(0, source.g * (1 - amount));
    const b = Math.max(0, source.b * (1 - amount));
    return `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`;
  }

  private lightenColor(hex: string, amount: number): string {
    const source = this.hexToRgb(hex);
    const r = Math.min(255, source.r + 255 * amount);
    const g = Math.min(255, source.g + 255 * amount);
    const b = Math.min(255, source.b + 255 * amount);
    return `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`;
  }

  private hexToRgba(hex: string, alpha: number): string {
    const { r, g, b } = this.hexToRgb(hex);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  private hexToRgb(hex: string): { r: number; g: number; b: number } {
    const rgbMatch = hex.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    if (rgbMatch) {
      return {
        r: Number(rgbMatch[1]),
        g: Number(rgbMatch[2]),
        b: Number(rgbMatch[3]),
      };
    }
    const normalized = hex.replace('#', '');
    const num = parseInt(normalized, 16);
    return {
      r: (num >> 16) & 0xff,
      g: (num >> 8) & 0xff,
      b: num & 0xff,
    };
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
    sortedColor: '#2dd4bf',
    pivotColor: '#8b5cf6',
    backgroundColor: '#0a0e17',
    gradientEnabled: true,
    glowEnabled: true,
    particleEnabled: false,
  });
}
