/**
 * 设置 Canvas 分辨率，适配高 DPI 屏幕
 */
export function setupCanvas(canvas: HTMLCanvasElement) {
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.scale(dpr, dpr);
  }
  return ctx;
}

/**
 * 监听 Canvas 尺寸变化并重新设置分辨率
 */
export function observeCanvas(canvas: HTMLCanvasElement, callback?: (ctx: CanvasRenderingContext2D) => void) {
  const resize = () => {
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.scale(dpr, dpr);
      callback?.(ctx);
    }
  };
  resize();
  window.addEventListener('resize', resize);
  return () => window.removeEventListener('resize', resize);
}
