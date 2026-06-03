import { gsap } from 'gsap';

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
  private animatedValues: number[] = [];
  private animatedState: RenderState = { array: [], comparing: [], swapping: [], sorted: [] };
  private valueTweenTarget: Record<number, number> = {};
  private completionSweep = { progress: 0, intensity: 0 };

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
    this.syncAnimatedState(state);
    this.drawFrame();
  }

  playCompletionEffect() {
    gsap.killTweensOf(this.completionSweep);
    this.completionSweep.progress = 0;
    this.completionSweep.intensity = 1;

    gsap.to(this.completionSweep, {
      progress: 1,
      duration: 1.05,
      ease: 'power2.inOut',
      onUpdate: () => this.drawFrame(),
      onComplete: () => {
        gsap.to(this.completionSweep, {
          intensity: 0,
          duration: 0.52,
          ease: 'power2.out',
          onUpdate: () => this.drawFrame(),
        });
      },
    });
  }

  private drawFrame() {
    const ctx = this.offscreenCtx;
    const width = this.offscreenCanvas.width / this.dpr;
    const height = this.offscreenCanvas.height / this.dpr;

    this.drawReactiveBackground(ctx, width, height);

    const { array, comparing, swapping, sorted, pivot } = this.animatedState;
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
        isActive = this.completionSweep.intensity > 0.02;
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

      const valueLabel = Math.round(array[i]).toString();
      ctx.fillStyle = isActive ? '#f8fbff' : 'rgba(232, 238, 255, 0.82)';
      ctx.font = `500 ${Math.max(11, Math.min(14, bw * 0.3))}px var(--font-mono)`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';
      ctx.fillText(valueLabel, x + bw / 2, y - 8);
      ctx.restore();
    }

    if (this.completionSweep.intensity > 0.02) {
      const sweepX = width * this.completionSweep.progress;
      const sweepWidth = Math.max(72, width * 0.2);
      const sweep = ctx.createLinearGradient(sweepX - sweepWidth, 0, sweepX + sweepWidth, 0);
      sweep.addColorStop(0, 'rgba(255, 255, 255, 0)');
      sweep.addColorStop(0.5, `rgba(125, 249, 255, ${0.2 * this.completionSweep.intensity})`);
      sweep.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = sweep;
      ctx.fillRect(0, 0, width, height);
    }

    // Copy to main canvas
    this.ctx.drawImage(this.offscreenCanvas, 0, 0, width, height);
  }

  private syncAnimatedState(state: RenderState) {
    if (this.animatedValues.length !== state.array.length) {
      this.animatedValues = [...state.array];
      this.valueTweenTarget = {};
    } else {
      state.array.forEach((value, index) => {
        if (this.valueTweenTarget[index] === value) return;
        this.valueTweenTarget[index] = value;
        gsap.to(this.animatedValues, {
          [index]: value,
          duration: 0.42,
          ease: 'power2.inOut',
          overwrite: 'auto',
          onUpdate: () => {
            this.animatedState = {
              ...this.animatedState,
              array: [...this.animatedValues],
            };
            this.drawFrame();
          },
        });
      });
    }

    this.animatedState = {
      array: [...this.animatedValues],
      comparing: [...state.comparing],
      swapping: [...state.swapping],
      sorted: [...state.sorted],
      pivot: state.pivot,
    };
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
    const accent = '#9ca3af';
    const bgGradient = ctx.createLinearGradient(0, 0, width, height);
    bgGradient.addColorStop(0, '#111317');
    bgGradient.addColorStop(1, this.config.backgroundColor);
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, width, height);

    ctx.save();
    ctx.globalAlpha = 0.1;
    ctx.strokeStyle = accent;
    ctx.lineWidth = 1;
    for (let x = -24; x < width + 24; x += 44) {
      ctx.beginPath();
      ctx.moveTo(x + 8, 0);
      ctx.lineTo(x - 48, height);
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
    gsap.killTweensOf(this.animatedValues);
    gsap.killTweensOf(this.completionSweep);
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
    barColor: '#d4d8df',
    comparingColor: '#7b818d',
    swappingColor: '#f2f4f7',
    sortedColor: '#eef2f6',
    pivotColor: '#a1a1aa',
    backgroundColor: '#191c21',
    gradientEnabled: true,
    glowEnabled: false,
    particleEnabled: false,
  });
}
