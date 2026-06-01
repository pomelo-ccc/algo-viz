import { createSignal, onMount, onCleanup } from 'solid-js';
import { useLocation } from '@solidjs/router';

export default function ScrollToTop() {
  const location = useLocation();
  const [show, setShow] = createSignal(false);

  const handleScroll = () => {
    setShow(window.scrollY > 300);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  onMount(() => {
    window.addEventListener('scroll', handleScroll);
    onCleanup(() => window.removeEventListener('scroll', handleScroll));
  });

  return (
    <button
      class={`scroll-to-top ${show() ? 'visible' : ''}`}
      onClick={scrollToTop}
      title="回到顶部"
      aria-label="回到顶部"
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="18 15 12 9 6 15" />
      </svg>
    </button>
  );
}
