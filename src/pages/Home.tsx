import { createSignal } from 'solid-js';
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
      { path: '/sorting', title: '排序算法', desc: '九大经典排序算法的可视化演示,从冒泡到基数排序,逐步观察元素比较与交换过程。' },
      { path: '/searching', title: '搜索算法', desc: '线性搜索与二分搜索的对比演示,理解不同搜索策略在数据结构中的查找过程。' },
      { path: '/graph', title: '图算法', desc: 'BFS、DFS、Dijkstra、Kruskal、Prim、拓扑排序六大图算法的遍历与求解过程。' },
      { path: '/greedy', title: '贪心算法', desc: '活动选择、分数背包、哈夫曼编码等经典贪心问题的局部最优到全局最优策略。' },
      { path: '/divide-conquer', title: '分治算法', desc: '归并排序、汉诺塔、快速幂等分治算法的分解、解决、合并思想可视化。' },
      { path: '/bit-manipulation', title: '位运算', desc: '位与、位或、异或、移位等基本位运算及经典应用(1的个数、2的幂判断等)。' },
      { path: '/math', title: '数学算法', desc: '素数筛、最大公约数、最小公倍数等经典数学算法的可视化演示。' },
      { path: '/geometry', title: '几何算法', desc: '凸包、点在多边形内、最近点对等经典几何算法的可视化演示。' },
      { path: '/strings-advanced', title: '字符串扩展', desc: '后缀数组、Manacher、Z算法等高级字符串算法的可视化演示。' },
      { path: '/advanced-data-structures', title: '高级数据结构', desc: '线段树、树状数组、单调栈等高级数据结构的实现与可视化。' },
      { path: '/network-flow', title: '网络流', desc: '最大流、最小割、二分图匹配等经典网络流算法的可视化演示。' },
      { path: '/randomized', title: '随机化算法', desc: 'Quickselect、Monte Carlo、随机化排序等利用随机性的算法可视化。' },
      { path: '/compression', title: '压缩算法', desc: 'Run-Length、LZW、Huffman等经典压缩算法的可视化演示。' },
      { path: '/cryptography', title: '加密算法', desc: 'Caesar密码、AES、RSA等经典加密算法的可视化演示。' },
      { path: '/machine-learning', title: '机器学习', desc: 'K-Means、KNN、线性回归等经典机器学习算法的可视化演示。' },
      { path: '/image-processing', title: '图像处理', desc: '边缘检测、模糊、锐化等经典图像处理算法的可视化演示。' },
      { path: '/nlp', title: '自然语言处理', desc: '词频统计、TF-IDF、情感分析等经典自然语言处理算法的可视化演示。' },
      { path: '/evolutionary', title: '演化算法', desc: '遗传算法、粒子群优化、蚁群算法等经典演化算法的可视化演示。' },
      { path: '/distributed', title: '分布式算法', desc: 'MapReduce、一致性哈希、Raft等经典分布式算法的可视化演示。' },
      { path: '/game-algorithms', title: '游戏算法', desc: 'Minimax、Alpha-Beta剪枝、蒙特卡洛树搜索等游戏AI算法的可视化。' },
      { path: '/operating-systems', title: '操作系统算法', desc: 'CPU调度、内存管理、文件系统等经典操作系统算法的可视化演示。' },
      { path: '/database', title: '数据库算法', desc: 'B+树索引、查询优化、事务管理等经典数据库算法的可视化演示。' },
      { path: '/advanced', title: '动态规划', desc: '斐波那契、01背包、最长公共子序列(LCS)等经典DP问题的动态规划表填充过程。' },
      { path: '/backtracking', title: '回溯算法', desc: 'N皇后问题、迷宫求解等经典回溯算法的搜索过程可视化。' },
      { path: '/pathfinding', title: '寻路算法', desc: 'A* (A-Star) 启发式搜索算法在网格世界中的寻路过程可视化。' },
      { path: '/strings', title: '字符串匹配', desc: 'KMP字符串匹配算法可视化,观察部分匹配表(LPS数组)的构建过程。' },
    ],
  },
  {
    id: 'data-structures',
    title: '数据结构',
    items: [
      { path: '/data-structures', title: '数据结构总览', desc: '数组、链表、栈、队列、二叉搜索树、堆、哈希表、并查集、字典树的插入、删除、查找操作可视化。' },
    ],
  },
];

const STATS = [
  { value: '26+', label: '算法主题' },
  { value: '60fps', label: '流畅动画' },
  { value: '5', label: '代码语言' },
  { value: '∞', label: '步骤回放' },
];

export default function Home() {
  const [mode, setMode] = createSignal<Mode>('flow');

  return (
    <main>
      <section class="hero hero-art">
        <GenerativeBackground mode={mode()} intensity="medium" />
        <div class="hero-art-content">
          <div class="container">
            <div class="hero-eyebrow fade-in-up">
              <span class="hero-eyebrow-dot" />
              <span>ALGORITHM × VISUALIZATION</span>
            </div>
            <h1 class="hero-title fade-in-up" style={{ 'animation-delay': '0.1s' }}>
              <span class="hero-title-line">看见算法的</span>
              <span class="hero-title-line hero-title-accent">流动轨迹</span>
            </h1>
            <p class="hero-subtitle fade-in-up" style={{ 'animation-delay': '0.2s' }}>
              通过生成式视觉语言,将每一个算法的运作过程转化为可感知的图形语言。
              从噪声流场到粒子连线,从细胞分裂到路径寻优,在静默中观察计算之美。
            </p>
            <div class="hero-stats fade-in-up" style={{ 'animation-delay': '0.3s' }}>
              {STATS.map(s => (
                <div class="hero-stat">
                  <div class="hero-stat-value">{s.value}</div>
                  <div class="hero-stat-label">{s.label}</div>
                </div>
              ))}
            </div>
            <div class="hero-modes fade-in-up" style={{ 'animation-delay': '0.4s' }}>
              <span class="hero-mode-label">视觉模式</span>
              <button
                class={`hero-mode-chip ${mode() === 'flow' ? 'active' : ''}`}
                onClick={() => setMode('flow')}
              >
                <span class="hero-mode-dot" style={{ background: '#00e5ff' }} />
                Flow Field
              </button>
              <button
                class={`hero-mode-chip ${mode() === 'constellation' ? 'active' : ''}`}
                onClick={() => setMode('constellation')}
              >
                <span class="hero-mode-dot" style={{ background: '#ff006e' }} />
                Constellation
              </button>
              <button
                class={`hero-mode-chip ${mode() === 'voronoi' ? 'active' : ''}`}
                onClick={() => setMode('voronoi')}
              >
                <span class="hero-mode-dot" style={{ background: '#8338ec' }} />
                Voronoi
              </button>
            </div>
          </div>
        </div>
        <div class="hero-scroll-hint">
          <span>SCROLL</span>
          <div class="hero-scroll-line" />
        </div>
      </section>

      <section class="container">
        {categories.map(cat => (
          <div class="category-section">
            <div class="category-header">
              <h2 class="category-title">
                <span class="category-title-num">{String(categories.indexOf(cat) + 1).padStart(2, '0')}</span>
                {cat.title}
              </h2>
              <div class="category-meta">{cat.items.length} 个主题</div>
            </div>
            <div class="algorithm-grid fade-in-stagger">
              {cat.items.map(algo => (
                <A href={algo.path} class="algorithm-card">
                  <div class="algorithm-card-bar" />
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
