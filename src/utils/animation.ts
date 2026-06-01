export interface AnimStep<T = any> {
  state: T;
  description: string;
  highlight?: number[];
  swap?: [number, number];
  sorted?: number[];
  compare?: number[];
  pivot?: number;
}

export interface AnimationConfig {
  speed: number;
  onStep?: (step: AnimStep) => void;
  onComplete?: () => void;
}

export class AnimationController<T = any> {
  private steps: AnimStep<T>[] = [];
  private currentIndex = -1;
  private isPlaying = false;
  private speed = 50;
  private animationId: number | null = null;
  private onStep?: (step: AnimStep<T>) => void;
  private onStateChange?: (state: T | null, index: number, total: number) => void;

  constructor(config?: Partial<AnimationConfig>) {
    if (config?.speed) this.speed = config.speed;
    if (config?.onStep) this.onStep = config.onStep;
  }

  setCallbacks(
    onStep?: (step: AnimStep<T>) => void,
    onStateChange?: (state: T | null, index: number, total: number) => void
  ) {
    this.onStep = onStep;
    this.onStateChange = onStateChange;
  }

  addStep(step: AnimStep<T>) {
    this.steps.push(step);
  }

  setSteps(steps: AnimStep<T>[]) {
    this.steps = steps;
    this.currentIndex = -1;
  }

  setSpeed(speed: number) {
    this.speed = Math.max(1, Math.min(100, speed));
  }

  getSpeed() {
    return this.speed;
  }

  getSteps() {
    return this.steps;
  }

  getCurrentIndex() {
    return this.currentIndex;
  }

  getTotalSteps() {
    return this.steps.length;
  }

  isAtStart() {
    return this.currentIndex === -1;
  }

  isAtEnd() {
    return this.currentIndex === this.steps.length - 1;
  }

  isEmpty() {
    return this.steps.length === 0;
  }

  private getDelay(): number {
    return Math.max(1, (101 - this.speed) * 3);
  }

  reset() {
    this.currentIndex = -1;
    this.isPlaying = false;
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
    this.onStateChange?.(null, -1, this.steps.length);
  }

  async play() {
    if (this.isEmpty()) return;
    this.isPlaying = true;
    await this.runAnimation();
  }

  pause() {
    this.isPlaying = false;
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  private async runAnimation() {
    while (this.isPlaying && this.currentIndex < this.steps.length - 1) {
      this.currentIndex++;
      const step = this.steps[this.currentIndex];
      this.onStep?.(step);
      this.onStateChange?.(step.state, this.currentIndex, this.steps.length);
      await this.sleep(this.getDelay());
    }
    if (this.currentIndex >= this.steps.length - 1) {
      this.isPlaying = false;
    }
  }

  async stepForward() {
    if (this.isAtEnd() || this.isEmpty()) return;
    this.isPlaying = false;
    this.currentIndex++;
    const step = this.steps[this.currentIndex];
    this.onStep?.(step);
    this.onStateChange?.(step.state, this.currentIndex, this.steps.length);
  }

  async stepBackward() {
    if (this.isAtStart() || this.isEmpty()) return;
    this.isPlaying = false;
    this.currentIndex--;
    const step = this.steps[this.currentIndex];
    this.onStep?.(step);
    this.onStateChange?.(step.state, this.currentIndex, this.steps.length);
  }

  async jumpToStart() {
    this.isPlaying = false;
    this.currentIndex = -1;
    this.onStateChange?.(null, -1, this.steps.length);
  }

  async jumpToEnd() {
    this.isPlaying = false;
    if (this.isEmpty()) return;
    this.currentIndex = this.steps.length - 1;
    const step = this.steps[this.currentIndex];
    this.onStep?.(step);
    this.onStateChange?.(step.state, this.currentIndex, this.steps.length);
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => {
      this.animationId = window.setTimeout(resolve, ms);
    });
  }

  destroy() {
    this.pause();
    this.steps = [];
    this.currentIndex = -1;
  }
}

export const animationColors = {
  default: '#cccccc',
  comparing: '#666666',
  swapping: '#1a1a1a',
  sorted: '#e5e5e5',
  pivot: '#999999',
  found: '#333333',
  visited: '#f0f0f0',
  path: '#4a4a4a',
  wall: '#1a1a1a',
  start: '#2d2d2d',
  end: '#666666',
};

export const gradientColors = {
  bar: ['#3a3a3a', '#1a1a1a'],
  comparing: ['#888888', '#555555'],
  swapping: ['#1a1a1a', '#000000'],
  sorted: ['#e5e5e5', '#cccccc'],
  glow: 'rgba(0, 0, 0, 0.3)',
};

export function drawGlowingBar(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  color: string,
  glowColor: string = 'rgba(0, 0, 0, 0.2)',
  glowSize: number = 4
) {
  ctx.shadowColor = glowColor;
  ctx.shadowBlur = glowSize;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;
  ctx.fillStyle = color;
  ctx.fillRect(x, y, width, height);
  ctx.shadowBlur = 0;
}

export function drawBarWithGradient(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  colors: [string, string],
  isActive: boolean = false
) {
  const gradient = ctx.createLinearGradient(x, y, x, y + height);
  gradient.addColorStop(0, colors[0]);
  gradient.addColorStop(1, colors[1]);

  if (isActive) {
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    ctx.shadowBlur = 8;
    ctx.shadowOffsetY = 2;
  }

  ctx.fillStyle = gradient;
  ctx.fillRect(x + 1, y, width - 2, height);

  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(x + 1, y);
  ctx.lineTo(x + width - 1, y);
  ctx.stroke();
}

export function drawPulseCircle(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  color: string,
  pulsePhase: number = 0
) {
  const pulseRadius = radius + Math.sin(pulsePhase) * 3;

  ctx.shadowColor = color;
  ctx.shadowBlur = 10;

  ctx.beginPath();
  ctx.arc(x, y, pulseRadius, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();

  ctx.shadowBlur = 0;

  ctx.beginPath();
  ctx.arc(x, y, radius * 0.6, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
  ctx.fill();
}

export function animateValue(
  current: number,
  target: number,
  duration: number,
  onUpdate: (value: number) => void,
  onComplete?: () => void,
  easing: 'linear' | 'easeOut' | 'easeInOut' = 'easeOut'
) {
  const startTime = performance.now();
  const startValue = current;

  const easeFunctions = {
    linear: (t: number) => t,
    easeOut: (t: number) => 1 - Math.pow(1 - t, 3),
    easeInOut: (t: number) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2,
  };

  const ease = easeFunctions[easing];

  function animate(currentTime: number) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const easedProgress = ease(progress);
    const value = startValue + (target - startValue) * easedProgress;

    onUpdate(value);

    if (progress < 1) {
      requestAnimationFrame(animate);
    } else {
      onComplete?.();
    }
  }

  requestAnimationFrame(animate);
}

export class ParticleSystem {
  private particles: Particle[] = [];
  private ctx: CanvasRenderingContext2D;
  private animationId: number | null = null;

  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
  }

  emit(x: number, y: number, count: number = 10, color: string = '#1a1a1a') {
    for (let i = 0; i < count; i++) {
      this.particles.push(new Particle(x, y, color));
    }
    if (!this.animationId) {
      this.animate();
    }
  }

  private animate() {
    this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    this.particles = this.particles.filter(p => p.update());
    this.particles.forEach(p => p.draw(this.ctx));

    if (this.particles.length > 0) {
      this.animationId = requestAnimationFrame(() => this.animate());
    } else {
      this.animationId = null;
    }
  }

  destroy() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
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
    this.vx = (Math.random() - 0.5) * 4;
    this.vy = (Math.random() - 0.5) * 4 - 2;
    this.life = 1;
    this.maxLife = 30 + Math.random() * 20;
    this.size = 2 + Math.random() * 3;
    this.color = color;
  }

  update(): boolean {
    this.x += this.vx;
    this.y += this.vy;
    this.vy += 0.1;
    this.life -= 1 / this.maxLife;
    return this.life > 0;
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.globalAlpha = this.life;
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size * this.life, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }
}
