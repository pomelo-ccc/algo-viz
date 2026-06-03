import { createSignal, onMount, onCleanup } from 'solid-js';
import { A, useLocation } from '@solidjs/router';
import type { JSX } from 'solid-js';
import ThemeToggle from './ThemeToggle';
import ScrollToTop from './ScrollToTop';

const navItems = [
  { path: '/', label: '首页' },
  { path: '/sorting', label: '排序' },
  { path: '/searching', label: '搜索' },
  { path: '/graph', label: '图' },
  { path: '/greedy', label: '贪心' },
  { path: '/divide-conquer', label: '分治' },
  { path: '/bit-manipulation', label: '位运算' },
  { path: '/math', label: '数学' },
  { path: '/geometry', label: '几何' },
  { path: '/strings-advanced', label: '字符串扩展' },
  { path: '/advanced-data-structures', label: '高级数据结构' },
  { path: '/network-flow', label: '网络流' },
  { path: '/randomized', label: '随机化' },
  { path: '/compression', label: '压缩' },
  { path: '/cryptography', label: '加密' },
  { path: '/machine-learning', label: '机器学习' },
  { path: '/image-processing', label: '图像处理' },
  { path: '/nlp', label: '自然语言处理' },
  { path: '/evolutionary', label: '演化算法' },
  { path: '/distributed', label: '分布式算法' },
  { path: '/game-algorithms', label: '游戏算法' },
  { path: '/operating-systems', label: '操作系统' },
  { path: '/database', label: '数据库算法' },
  { path: '/data-structures', label: '数据结构' },
  { path: '/advanced', label: '动态规划' },
  { path: '/backtracking', label: '回溯' },
  { path: '/pathfinding', label: '寻路' },
  { path: '/strings', label: '字符串' },
];

interface LayoutProps {
  children?: JSX.Element;
}

export default function Layout(props: LayoutProps) {
  const location = useLocation();
  const isHome = () => location.pathname === '/';
  const [menuOpen, setMenuOpen] = createSignal(false);
  const [showShortcuts, setShowShortcuts] = createSignal(false);

  onMount(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === '?') {
        e.preventDefault();
        setShowShortcuts(prev => !prev);
      }
      if (e.key === 'Escape') {
        setMenuOpen(false);
        setShowShortcuts(false);
      }
    };
    window.addEventListener('keydown', handler);
    onCleanup(() => window.removeEventListener('keydown', handler));
  });

  return (
    <div class={isHome() ? 'app-shell app-shell-home' : 'app-shell app-shell-content'}>
      <header class={isHome() ? 'site-header site-header-home' : 'site-header site-header-content'}>
        <div class="container">
          <div class="site-title">Algorithm Visualizer</div>
          <button
            class="menu-toggle"
            onClick={() => setMenuOpen(!menuOpen())}
            aria-label="切换导航"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
          <div style={{ display: 'flex', 'align-items': 'center' }}>
            <nav class={`site-nav ${menuOpen() ? 'open' : ''}`}>
              {navItems.slice(0, 5).map(item => (
                <A
                  href={item.path}
                  class={location.pathname === item.path ? 'active' : ''}
                  end
                  onClick={() => setMenuOpen(false)}
                >
                  {item.label}
                </A>
              ))}
            </nav>
            <ThemeToggle />
          </div>
        </div>
      </header>
      <div class={isHome() ? 'main-content main-content-home' : 'main-content main-content-content'}>
        {props.children}
      </div>
      <footer class="site-footer">
        <div class="container">
          <p>Algorithm Visualizer - 极简主义算法学习工具 <span class="shortcut-hint">按 <kbd>?</kbd> 查看快捷键</span></p>
        </div>
      </footer>
      <ScrollToTop />
      {showShortcuts() && (
        <div class="shortcuts-overlay" onClick={() => setShowShortcuts(false)}>
          <div class="shortcuts-modal" onClick={e => e.stopPropagation()}>
            <h3>键盘快捷键</h3>
            <div class="shortcuts-list">
              <div class="shortcut-item">
                <kbd>Space</kbd>
                <span>播放 / 暂停</span>
              </div>
              <div class="shortcut-item">
                <kbd>←</kbd>
                <kbd>→</kbd>
                <span>上一步 / 下一步</span>
              </div>
              <div class="shortcut-item">
                <kbd>R</kbd>
                <span>重置</span>
              </div>
              <div class="shortcut-item">
                <kbd>1-9</kbd>
                <span>调整速度</span>
              </div>
              <div class="shortcut-item">
                <kbd>Esc</kbd>
                <span>关闭弹窗</span>
              </div>
              <div class="shortcut-item">
                <kbd>?</kbd>
                <span>显示/隐藏此面板</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
