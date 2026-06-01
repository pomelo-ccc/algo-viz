import { onMount, onCleanup, createSignal, createEffect } from 'solid-js';
import { GenerativeRenderer, PALETTES } from '../utils/generativeArt';
import type { Palette } from '../utils/generativeArt';

type Mode = 'flow' | 'constellation' | 'voronoi';

interface Props {
  mode?: Mode;
  intensity?: 'low' | 'medium' | 'high';
  palette?: 'default' | 'cool' | 'warm';
}

function readTheme(): boolean {
  const stored = localStorage.getItem('algo-viz-theme');
  if (stored) return stored === 'dark';
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

export default function GenerativeBackground(props: Props) {
  let canvasRef: HTMLCanvasElement | undefined;
  let containerRef: HTMLDivElement | undefined;
  let renderer: GenerativeRenderer | undefined;
  const [isDark, setIsDark] = createSignal(true);

  onMount(() => {
    if (!canvasRef) return;
    setIsDark(readTheme());

    const palette: Palette = (() => {
      if (!isDark()) {
        return {
          bg: ['#fafafa', '#f0f0f0'],
          neon: ['#0084ff', '#e91e63', '#673ab7', '#00c853'],
        };
      }
      return PALETTES[props.palette ?? 'default'];
    })();

    renderer = new GenerativeRenderer(canvasRef);
    renderer.start(props.mode ?? 'flow', palette);
    renderer.resize();

    const handleResize = () => renderer?.resize();
    const handleMouse = (e: MouseEvent) => {
      if (!containerRef) return;
      const rect = containerRef.getBoundingClientRect();
      renderer?.setMouse(e.clientX - rect.left, e.clientY - rect.top);
    };
    const handleMouseLeave = () => renderer?.setMouse(-1000, -1000);
    const handleThemeChange = () => {
      const dark = readTheme();
      setIsDark(dark);
    };

    window.addEventListener('resize', handleResize);
    containerRef?.addEventListener('mousemove', handleMouse);
    containerRef?.addEventListener('mouseleave', handleMouseLeave);

    const observer = new MutationObserver(handleThemeChange);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    });

    onCleanup(() => {
      window.removeEventListener('resize', handleResize);
      containerRef?.removeEventListener('mousemove', handleMouse);
      containerRef?.removeEventListener('mouseleave', handleMouseLeave);
      observer.disconnect();
      renderer?.stop();
    });
  });

  createEffect(() => {
    const dark = isDark();
    if (dark) {
      renderer?.setPalette(PALETTES[props.palette ?? 'default']);
    } else {
      renderer?.setPalette({
        bg: ['#fafafa', '#f0f0f0'],
        neon: ['#0084ff', '#e91e63', '#673ab7', '#00c853'],
      });
    }
  });

  const intensity = props.intensity ?? 'medium';
  const opacity = intensity === 'low' ? 0.35 : intensity === 'high' ? 0.85 : 0.6;

  return (
    <div ref={containerRef} class="generative-bg" data-mode={props.mode ?? 'flow'} data-intensity={intensity}>
      <canvas ref={canvasRef} style={{ opacity }} />
      <div class="generative-bg-noise" />
      <div class="generative-bg-vignette" />
    </div>
  );
}
