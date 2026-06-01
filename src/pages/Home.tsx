import { A } from '@solidjs/router';

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

const categories: Category[] = [
  {
    id: 'algorithms',
    title: '算法',
    items: [
      {
        path: '/sorting',
        title: '排序算法',
        desc: '冒泡排序、选择排序、插入排序、快速排序、归并排序、堆排序、希尔排序、计数排序、基数排序等经典排序算法的可视化演示。',
      },
      {
        path: '/searching',
        title: '搜索算法',
        desc: '线性搜索与二分搜索的对比演示，理解不同搜索策略在数据结构中的查找过程和效率差异。',
      },
      {
        path: '/graph',
        title: '图算法',
        desc: '广度优先搜索(BFS)、深度优先搜索(DFS)、Dijkstra最短路径、Kruskal/Prim最小生成树、拓扑排序等图算法的可视化。',
      },
      {
        path: '/greedy',
        title: '贪心算法',
        desc: '活动选择、分数背包、哈夫曼编码、作业调度等经典贪心问题的可视化演示，理解局部最优到全局最优的策略。',
      },
      {
        path: '/divide-conquer',
        title: '分治算法',
        desc: '归并排序、汉诺塔、快速幂等经典分治算法的可视化演示，理解分解、解决、合并的分治思想。',
      },
      {
        path: '/bit-manipulation',
        title: '位运算',
        desc: '位与、位或、异或、移位等基本位运算及经典应用（1的个数、2的幂判断等）的可视化演示。',
      },
      {
        path: '/math',
        title: '数学算法',
        desc: '素数筛、最大公约数、最小公倍数等经典数学算法的可视化演示，理解数论算法的基本原理。',
      },
      {
        path: '/geometry',
        title: '几何算法',
        desc: '凸包、点在多边形内、最近点对等经典几何算法的可视化演示，理解计算几何的基本原理。',
      },
      {
        path: '/strings-advanced',
        title: '字符串算法扩展',
        desc: '后缀数组、Manacher算法、Z算法等高级字符串算法的可视化演示，解决复杂字符串处理问题。',
      },
      {
        path: '/advanced-data-structures',
        title: '高级数据结构',
        desc: '线段树、树状数组、单调栈等高级数据结构的实现与可视化，理解更复杂的数据操作。',
      },
      {
        path: '/network-flow',
        title: '网络流',
        desc: '最大流、最小割、二分图匹配等经典网络流算法的可视化演示。',
      },
      {
        path: '/randomized',
        title: '随机化算法',
        desc: 'Quickselect、Monte Carlo方法、随机化排序等利用随机性的算法可视化。',
      },
      {
        path: '/compression',
        title: '压缩算法',
        desc: 'Run-Length、LZW、Huffman等经典压缩算法的可视化演示。',
      },
      {
        path: '/cryptography',
        title: '加密算法',
        desc: 'Caesar密码、AES、RSA等经典加密算法的可视化演示。',
      },
      {
        path: '/machine-learning',
        title: '机器学习',
        desc: 'K-Means、KNN、线性回归等经典机器学习算法的可视化演示。',
      },
      {
        path: '/image-processing',
        title: '图像处理',
        desc: '边缘检测、模糊、锐化等经典图像处理算法的可视化演示。',
      },
      {
        path: '/nlp',
        title: '自然语言处理',
        desc: '词频统计、TF-IDF、情感分析等经典自然语言处理算法的可视化演示。',
      },
      {
        path: '/evolutionary',
        title: '演化算法',
        desc: '遗传算法、粒子群优化、蚁群算法等经典演化算法的可视化演示。',
      },
      {
        path: '/distributed',
        title: '分布式算法',
        desc: 'MapReduce、一致性哈希、Raft等经典分布式算法的可视化演示。',
      },
      {
        path: '/game-algorithms',
        title: '游戏算法',
        desc: 'Minimax、Alpha-Beta剪枝、蒙特卡洛树搜索等经典游戏AI算法的可视化演示。',
      },
      {
        path: '/operating-systems',
        title: '操作系统算法',
        desc: 'CPU调度、内存管理、文件系统等经典操作系统算法的可视化演示。',
      },
      {
        path: '/database',
        title: '数据库算法',
        desc: 'B+树索引、查询优化、事务管理等经典数据库算法的可视化演示。',
      },
      {
        path: '/advanced',
        title: '动态规划',
        desc: '斐波那契数列、01背包问题、最长公共子序列(LCS)等经典DP问题的动态规划表填充过程可视化。',
      },
      {
        path: '/backtracking',
        title: '回溯算法',
        desc: 'N皇后问题、迷宫求解等经典回溯算法的搜索过程可视化，观察回溯和剪枝机制。',
      },
      {
        path: '/pathfinding',
        title: '寻路算法',
        desc: 'A* (A-Star) 启发式搜索算法在网格世界中的寻路过程可视化。',
      },
      {
        path: '/strings',
        title: '字符串匹配',
        desc: 'KMP字符串匹配算法可视化，观察部分匹配表(LPS数组)的构建过程。',
      },
    ],
  },
  {
    id: 'data-structures',
    title: '数据结构',
    items: [
      {
        path: '/data-structures',
        title: '数据结构总览',
        desc: '数组、链表、栈、队列、二叉搜索树、堆、哈希表、并查集、字典树等经典数据结构的插入、删除、查找操作可视化。',
      },
    ],
  },
];

export default function Home() {
  return (
    <main>
      <section class="hero">
        <div class="container">
          <h1 class="fade-in-up">算法可视化</h1>
          <p class="hero-subtitle fade-in-up" style={{ 'animation-delay': '0.1s' }}>
            通过直观的视觉呈现，深入理解算法的运作原理。
            每个算法都被分解为可观察的步骤，帮助你在安静、无干扰的环境中专注于学习。
          </p>
          <div class="hero-features fade-in-up" style={{ 'animation-delay': '0.2s', display: 'flex', gap: '2rem', 'margin-top': '2rem', 'flex-wrap': 'wrap' }}>
            <div class="hero-feature">
              <span class="hero-feature-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                  <polygon points="5 3 19 12 5 21 5 3" />
                </svg>
              </span>
              <span>逐步执行</span>
            </div>
            <div class="hero-feature">
              <span class="hero-feature-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="9 11 12 14 22 4" />
                  <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                </svg>
              </span>
              <span>单步回退</span>
            </div>
            <div class="hero-feature">
              <span class="hero-feature-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
              </span>
              <span>速度控制</span>
            </div>
            <div class="hero-feature">
              <span class="hero-feature-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                </svg>
              </span>
              <span>5 种语言</span>
            </div>
          </div>
        </div>
      </section>

      <section class="container">
        {categories.map(cat => (
          <div class="category-section" style={{ 'margin-bottom': '3rem' }}>
            <h2 style={{
              'font-size': '1.25rem',
              'font-weight': '500',
              'margin-bottom': '1.5rem',
              'padding-bottom': '0.75rem',
              'border-bottom': '1px solid var(--border)',
              'text-transform': 'uppercase',
              'letter-spacing': '0.05em',
            }}>
              {cat.title}
            </h2>
            <div class="algorithm-grid fade-in-stagger">
              {cat.items.map(algo => (
                <A href={algo.path} class="algorithm-card">
                  <h3>{algo.title}</h3>
                  <p>{algo.desc}</p>
                </A>
              ))}
            </div>
          </div>
        ))}
      </section>
    </main>
  );
}
