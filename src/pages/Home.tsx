import { createMemo, createSignal, onCleanup, onMount } from 'solid-js';
import { A } from '@solidjs/router';
import GenerativeBackground from '../components/GenerativeBackground';

interface AlgorithmItem {
  path: string;
  title: string;
  desc: string;
}

interface Category {
  id: string;
  title: string;
  items: AlgorithmItem[];
}

type Mode = 'flow' | 'constellation' | 'voronoi';

const categories: Category[] = [
  {
    id: 'algorithms',
    title: '算法',
    items: [
      { path: '/sorting', title: '排序算法', desc: '九大经典排序算法的可视化演示，从冒泡到基数排序，逐步观察元素比较与交换过程。' },
      { path: '/searching', title: '搜索算法', desc: '线性搜索与二分搜索的对比演示，理解不同搜索策略在数据结构中的查找路径。' },
      { path: '/graph', title: '图算法', desc: 'BFS、DFS、Dijkstra、Kruskal、Prim 与拓扑排序等图算法的遍历与求解过程。' },
      { path: '/greedy', title: '贪心算法', desc: '活动选择、分数背包、哈夫曼编码等问题中，局部最优如何推动全局结果。' },
      { path: '/divide-conquer', title: '分治算法', desc: '归并排序、汉诺塔、快速幂等分治算法的拆分、求解与合并。' },
      { path: '/bit-manipulation', title: '位运算', desc: '位与、位或、异或、移位，以及常见位技巧的可视化讲解。' },
      { path: '/math', title: '数学算法', desc: '素数筛、最大公约数、最小公倍数等经典数学算法的过程展示。' },
      { path: '/geometry', title: '几何算法', desc: '凸包、点在多边形内、最近点对等经典几何算法的可视化演示。' },
      { path: '/strings-advanced', title: '字符串扩展', desc: '后缀数组、Manacher、Z 算法等高级字符串算法的结构化呈现。' },
      { path: '/advanced-data-structures', title: '高级数据结构', desc: '线段树、树状数组、单调栈等结构的操作过程与数据流向。' },
      { path: '/network-flow', title: '网络流', desc: '最大流、最小割、二分图匹配等经典网络流问题的演示。' },
      { path: '/randomized', title: '随机化算法', desc: 'Quickselect、Monte Carlo、随机化排序等利用随机性的算法。' },
      { path: '/compression', title: '压缩算法', desc: 'Run-Length、LZW、Huffman 等压缩方法如何重写数据。' },
      { path: '/cryptography', title: '加密算法', desc: 'Caesar、AES、RSA 等算法如何完成编码、变换与还原。' },
      { path: '/machine-learning', title: '机器学习', desc: 'K-Means、KNN、线性回归等经典机器学习算法的步骤展示。' },
      { path: '/image-processing', title: '图像处理', desc: '边缘检测、模糊、锐化等图像处理流程在像素层面的变化。' },
      { path: '/nlp', title: '自然语言处理', desc: '词频统计、TF-IDF、情感分析等自然语言处理方法的核心流程。' },
      { path: '/evolutionary', title: '演化算法', desc: '遗传算法、粒子群优化、蚁群算法等演化式求解路径。' },
      { path: '/distributed', title: '分布式算法', desc: 'MapReduce、一致性哈希、Raft 等分布式算法的运作逻辑。' },
      { path: '/game-algorithms', title: '游戏算法', desc: 'Minimax、Alpha-Beta 剪枝、MCTS 等游戏 AI 算法的决策过程。' },
      { path: '/operating-systems', title: '操作系统算法', desc: 'CPU 调度、内存管理、文件系统等操作系统算法的过程。' },
      { path: '/database', title: '数据库算法', desc: 'B+ 树索引、查询优化、事务管理等数据库内部算法的可视化。' },
      { path: '/advanced', title: '动态规划', desc: '斐波那契、01 背包、LCS 等问题中表格如何逐步填满。' },
      { path: '/backtracking', title: '回溯算法', desc: 'N 皇后、迷宫求解等问题中的试探、撤销与重试。' },
      { path: '/pathfinding', title: '寻路算法', desc: 'A* 等启发式寻路算法在网格中的扩展、估价与回溯。' },
      { path: '/strings', title: '字符串匹配', desc: 'KMP 等字符串匹配算法如何构建表并跳过无效比较。' },
    ],
  },
  {
    id: 'data-structures',
    title: '数据结构',
    items: [
      { path: '/data-structures', title: '数据结构总览', desc: '数组、链表、栈、队列、二叉搜索树、堆、哈希表、并查集和字典树的操作过程。' },
    ],
  },
];

const STATS = [
  { value: '26+', label: '算法主题' },
  { value: '60fps', label: '可视反馈' },
  { value: '5', label: '代码语言' },
  { value: '∞', label: '步骤回放' },
];

const STORY_BLOCKS = [
  {
    title: '从概念到过程',
    text: '把“会排序、会搜索、会划分”这样的抽象结论拆成真实的状态变化，让每一步都能被追踪。',
  },
  {
    title: '让数据自己说话',
    text: '界面负责组织节奏，真正站到前台的是数组、图、树和路径本身，而不是装饰性的界面动作。',
  },
  {
    title: '像展览一样浏览',
    text: '滚动时先看见品牌和方法，再自然进入具体算法目录，形成从整体到细节的浏览顺序。',
  },
];

const SCROLL_CHAPTERS = [
  { label: '01', title: '输入状态', text: '先观察原始数据的排列、分布和边界条件。' },
  { label: '02', title: '局部动作', text: '比较、交换、拆分和合并被拆成可追踪的步骤。' },
  { label: '03', title: '代码对应', text: '每一次视觉变化都能回到对应的代码逻辑。' },
  { label: '04', title: '结果收束', text: '最后看到结构如何稳定下来，而不是只看到答案。' },
];

const CODE_LINES = [
  'for each step in algorithm:',
  '  compare current state',
  '  update structure',
  '  record transition',
  'render(data, step, code)',
];

function clamp(value: number, min = 0, max = 1) {
  return Math.min(Math.max(value, min), max);
}

function chapterOpacity(progress: number, index: number) {
  const center = index / Math.max(SCROLL_CHAPTERS.length - 1, 1);
  return clamp(1 - Math.abs(progress - center) * 3.2, 0.18, 1);
}

export default function Home() {
  const [mode, setMode] = createSignal<Mode>('flow');
  const [heroProgress, setHeroProgress] = createSignal(0);
  const [storyScroll, setStoryScroll] = createSignal(0);
  const [catalogScroll, setCatalogScroll] = createSignal(0);
  let stageRef: HTMLElement | undefined;
  let storyRef: HTMLElement | undefined;
  let catalogRef: HTMLElement | undefined;

  onMount(() => {
    let ticking = false;
    const getSectionProgress = (element: HTMLElement | undefined) => {
      if (!element) return 0;
      const rect = element.getBoundingClientRect();
      const distance = window.innerHeight + rect.height;
      return distance > 0 ? clamp((window.innerHeight - rect.top) / distance) : 0;
    };
    const updateProgress = () => {
      if (!stageRef) return;
      const rect = stageRef.getBoundingClientRect();
      const scrollable = rect.height - window.innerHeight;
      setHeroProgress(scrollable > 0 ? clamp(-rect.top / scrollable) : 0);
      setStoryScroll(getSectionProgress(storyRef));
      setCatalogScroll(getSectionProgress(catalogRef));
      ticking = false;
    };
    const requestUpdate = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(updateProgress);
    };
    updateProgress();
    window.addEventListener('scroll', requestUpdate, { passive: true });
    window.addEventListener('resize', requestUpdate);
    onCleanup(() => {
      window.removeEventListener('scroll', requestUpdate);
      window.removeEventListener('resize', requestUpdate);
    });
  });

  const progress = createMemo(() => heroProgress());
  const storyProgress = createMemo(() => clamp((heroProgress() - 0.32) / 0.48));
  const storyReveal = createMemo(() => clamp((storyScroll() - 0.08) / 0.42));
  const catalogReveal = createMemo(() => clamp((catalogScroll() - 0.06) / 0.36));
  const activeChapter = createMemo(() => Math.min(Math.round(progress() * (SCROLL_CHAPTERS.length - 1)), SCROLL_CHAPTERS.length - 1));

  return (
    <main class="home-page">
      <section ref={stageRef} class="home-scroll-stage" style={{ '--scroll-progress': `${progress()}` }}>
        <div class="hero hero-scroll">
          <div class="hero-scroll-bg" style={{ transform: `translate3d(0, ${progress() * 96}px, 0) scale(${1 + progress() * 0.08})` }}>
            <GenerativeBackground mode={mode()} intensity="low" />
          </div>
          <div class="hero-scroll-grid container">
            <div class="hero-scroll-copy" style={{ transform: `translate3d(0, ${progress() * -168}px, 0)`, opacity: `${clamp(1 - progress() * 2.7)}` }}>
              <div class="hero-eyebrow">
                <span class="hero-eyebrow-dot" />
                <span>Algorithm Visualizer</span>
              </div>
              <h1 class="hero-title">
                <span class="hero-title-line">把算法从结果</span>
                <span class="hero-title-line hero-title-accent">重新带回过程</span>
              </h1>
              <p class="hero-subtitle">
                从排序、搜索到图与网络流，所有可视化都围绕同一件事展开：让数据结构、状态变化和代码逻辑在同一屏里变得可读。
              </p>
            </div>
            <div class="hero-scroll-rail" style={{ transform: `translate3d(0, ${progress() * -104}px, 0)`, opacity: `${clamp(1 - progress() * 0.72, 0.32, 1)}` }}>
              <div class="hero-modes">
                <span class="hero-mode-label">视觉模式</span>
                <button class={`hero-mode-chip ${mode() === 'flow' ? 'active' : ''}`} onClick={() => setMode('flow')}>
                  <span class="hero-mode-dot" />
                  Flow
                </button>
                <button class={`hero-mode-chip ${mode() === 'constellation' ? 'active' : ''}`} onClick={() => setMode('constellation')}>
                  <span class="hero-mode-dot" />
                  Constellation
                </button>
                <button class={`hero-mode-chip ${mode() === 'voronoi' ? 'active' : ''}`} onClick={() => setMode('voronoi')}>
                  <span class="hero-mode-dot" />
                  Voronoi
                </button>
              </div>
              <div class="hero-stats">
                {STATS.map((stat) => (
                  <div class="hero-stat">
                    <div class="hero-stat-value">{stat.value}</div>
                    <div class="hero-stat-label">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div class="hero-process-board" style={{ transform: `translate3d(0, ${(1 - storyProgress()) * 96}px, 0)`, opacity: `${storyProgress()}` }}>
              <div class="hero-process-kicker">Scroll Sequence</div>
              <div class="hero-process-title">从输入到结果的可视化路径</div>
              <div class="hero-process-grid">
                <div class="hero-process-steps">
                  {SCROLL_CHAPTERS.map((chapter, index) => (
                    <div class={`hero-process-step ${activeChapter() === index ? 'active' : ''}`} style={{ opacity: `${chapterOpacity(progress(), index)}` }}>
                      <span>{chapter.label}</span>
                      <strong>{chapter.title}</strong>
                      <p>{chapter.text}</p>
                    </div>
                  ))}
                </div>
                <div class="hero-process-preview" aria-hidden="true">
                  <div class="hero-data-row">
                    {[38, 72, 44, 91, 56, 68, 29].map((value, index) => (
                      <span style={{ height: `${32 + value * 0.72}px`, transform: `translate3d(0, ${Math.sin(progress() * 5 + index) * 10}px, 0)` }} />
                    ))}
                  </div>
                  <div class="hero-code-window">
                    {CODE_LINES.map((line, index) => (
                      <code style={{ opacity: `${clamp(0.3 + progress() * 1.4 - index * 0.16, 0.24, 1)}` }}>{line}</code>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="hero-scroll-progress" aria-hidden="true">
            <span style={{ transform: `scaleY(${Math.max(progress(), 0.04)})` }} />
          </div>
          <div class="hero-scroll-hint" style={{ opacity: `${1 - progress() * 1.8}` }}>
            <span>Scroll to Explore</span>
            <div class="hero-scroll-line" />
          </div>
        </div>
      </section>

      <section ref={storyRef} class="home-story-band" style={{ '--story-reveal': `${storyReveal()}` }}>
        <div class="container home-story-grid">
          <div class="home-story-intro" style={{ transform: `translate3d(0, ${(1 - storyReveal()) * 32}px, 0)`, opacity: `${clamp(0.55 + storyReveal() * 0.45)}` }}>
            <div class="home-section-kicker">Why This Exists</div>
            <h2>不是只告诉你答案，而是把每一次移动、比较和分支都展开给你看。</h2>
            <p>
              当算法被还原成过程，你能更直观地理解复杂度、稳定性、局部决策和全局结果之间的关系，也更容易把代码、图像和抽象概念连接起来。
            </p>
          </div>
          <div class="home-story-cards">
            {STORY_BLOCKS.map((block, index) => (
              <article
                class="home-story-card"
                style={{
                  transform: `translate3d(0, ${(1 - storyReveal()) * (18 + index * 8)}px, 0)`,
                  opacity: `${clamp(0.62 + storyReveal() * 0.46 - index * 0.05)}`,
                }}
              >
                <div class="home-story-index">{String(index + 1).padStart(2, '0')}</div>
                <h3>{block.title}</h3>
                <p>{block.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section ref={catalogRef} class="container home-categories" style={{ '--catalog-reveal': `${catalogReveal()}` }}>
        {categories.map((cat, index) => (
          <div class="category-section" style={{ '--category-delay': `${index * 0.08}s`, transform: `translate3d(0, ${(1 - catalogReveal()) * 26}px, 0)`, opacity: `${clamp(0.74 + catalogReveal() * 0.26)}` }}>
            <div class="category-header">
              <h2 class="category-title">
                <span class="category-title-num">{String(index + 1).padStart(2, '0')}</span>
                {cat.title}
              </h2>
              <div class="category-meta">{cat.items.length} 个主题</div>
            </div>
            <div class="algorithm-grid">
              {cat.items.map((algo, itemIndex) => (
                <A
                  href={algo.path}
                  class="algorithm-card algorithm-card-home"
                  style={{
                    transform: `translate3d(0, ${Math.max(0, 1 - catalogReveal() * 1.15 + itemIndex * 0.012) * 28}px, 0)`,
                    opacity: `${clamp(0.72 + catalogReveal() * 0.36 - itemIndex * 0.012, 0.68, 1)}`,
                  }}
                >
                  <div class="algorithm-card-meta">进入主题</div>
                  <h3 class="algorithm-card-title">{algo.title}</h3>
                  <p class="algorithm-card-desc">{algo.desc}</p>
                  <div class="algorithm-card-arrow">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                      <line x1="5" y1="12" x2="19" y2="12" />
                      <polyline points="12 5 19 12 12 19" />
                    </svg>
                  </div>
                </A>
              ))}
            </div>
          </div>
        ))}
      </section>
    </main>
  );
}
