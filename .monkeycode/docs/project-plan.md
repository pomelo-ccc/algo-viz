# 项目内容规划

## 现状概览
- **28 个页面**：总代码量 9377+ 行
- **codeData.ts**：约 4000 行，支持 5 种语言（JS/TS/Python/C++/Java）
- **CodePanel 集成**：28/28 页面完成 ✅
- **技术栈**：Solid.js + TypeScript + Vite，极简主义 UI

---

## 一、核心功能完善

### P0 - 必须有 ✅
| 模块 | 内容 | 状态 |
|------|------|------|
| 排序算法 | 冒泡/选择/插入/快速/归并/堆/希尔/计数/基数 | ✅ 完整 |
| 搜索算法 | 线性/二分搜索 | ✅ 完整 |
| 图算法 | BFS/DFS/Dijkstra/Kruskal/Prim/拓扑排序 | ✅ 完整 |
| 动态规划 | 斐波那契/01背包/LCS | ✅ 完整 |
| 回溯算法 | N皇后/迷宫求解 | ✅ 完整 |
| 寻路算法 | A* | ✅ 完整 |
| 字符串匹配 | KMP | ✅ 完整 |
| 数据结构 | 数组/链表/栈/队列/树/堆/哈希 | ✅ 完整 |

### P1 - 应该有 ✅
| 模块 | 内容 | 状态 |
|------|------|------|
| 贪心算法 | 活动选择/背包/哈夫曼 | ✅ 完整 |
| 分治算法 | 归并排序/汉诺塔/快速幂 | ✅ 完整 |
| 位运算 | 基本操作/经典应用 | ✅ 完整 |
| 数学算法 | 素数筛/GCD/LCM | ✅ 完整 |
| 几何算法 | 凸包/点包含 | ✅ 完整 |
| 高级数据结构 | 线段树/树状数组/单调栈 | ✅ 完整 |
| 网络流 | 最大流/二分图匹配 | ✅ 完整 |

### P2 - 锦上添花 ✅
| 模块 | 内容 | 状态 |
|------|------|------|
| 字符串扩展 | 后缀数组/Manacher/Z算法 | ✅ 完整 |
| 随机化算法 | Quickselect/Monte Carlo | ✅ 完整 |
| 压缩算法 | RLE/LZW/Huffman | ✅ 完整 |
| 加密算法 | Caesar 等 | ✅ 完整 |
| 机器学习 | K-Means/KNN | ✅ 完整 |
| 图像处理 | 边缘检测/模糊 | ✅ 完整 |
| NLP | 词频/TF-IDF | ✅ 完整 |
| 演化算法 | 遗传/粒子群 | ✅ 完整 |
| 分布式算法 | MapReduce/Raft | ✅ 完整 |
| 游戏算法 | Minimax/Alpha-Beta/MCTS | ✅ 完整 |
| 操作系统算法 | CPU调度/内存管理 | ✅ 完整 |
| 数据库算法 | B+树/事务管理 | ✅ 完整 |

---

## 二、代码数据补全 ✅

| 页面 | 代码数据 | 状态 |
|------|---------|------|
| Sorting | sortingCodes | ✅ 完整 |
| Searching | searchingCodes | ✅ 完整 |
| Graph | graphCodes | ✅ 完整 |
| DP | dpCodes | ✅ 新增 |
| Pathfinding | pathfindingCodes | ✅ 新增 |
| Backtracking | backtrackingCodes | ✅ 新增 |
| Greedy | greedyCodes | ✅ 新增 |
| DivideConquer | divideConquerCodes | ✅ 新增 |

---

## 三、UI/UX 改进 ✅

| 项目 | 描述 | 状态 |
|------|------|------|
| CodePanel 集成 | 28/28 页面已完成 | ✅ 完成 |
| 步骤日志 | 统一格式 | ✅ 完成 |
| Canvas 动画 | 渐变效果 | ✅ 完成 |
| 控制面板 | 统一样式 | ✅ 完成 |

---

## 四、技术优化

| 项目 | 描述 | 优先级 |
|------|------|--------|
| 响应式优化 | 平板/手机端体验 | P2 |
| 键盘快捷键 | 播放/暂停/重置/步进 | P2 |

---

## 五、项目结构

```
src/
├── components/
│   ├── Layout.tsx       # 导航 + 汉堡菜单
│   ├── Dropdown.tsx     # 下拉组件
│   └── CodePanel.tsx    # 代码展示（已集成 28 个页面）
├── pages/               # 28 个算法页面
│   ├── Home.tsx
│   ├── Sorting.tsx     ✅
│   ├── Searching.tsx   ✅
│   ├── Graph.tsx       ✅
│   ├── Advanced.tsx    ✅
│   ├── Backtracking.tsx ✅
│   ├── Pathfinding.tsx  ✅
│   ├── Strings.tsx      ✅
│   ├── DataStructures.tsx ✅
│   ├── Greedy.tsx       ✅
│   ├── DivideConquer.tsx ✅
│   ├── BitManipulation.tsx ✅
│   ├── MathAlgorithms.tsx ✅
│   ├── Geometry.tsx      ✅
│   ├── AdvancedDataStructures.tsx ✅
│   ├── NetworkFlow.tsx   ✅
│   ├── StringsAdvanced.tsx ✅
│   ├── RandomizedAlgorithms.tsx ✅
│   ├── CompressionAlgorithms.tsx ✅
│   ├── Cryptography.tsx  ✅
│   ├── MachineLearning.tsx ✅
│   ├── ImageProcessing.tsx ✅
│   ├── NLP.tsx          ✅
│   ├── Evolutionary.tsx ✅
│   ├── Distributed.tsx   ✅
│   ├── GameAlgorithms.tsx ✅
│   ├── OperatingSystems.tsx ✅
│   └── DatabaseAlgorithms.tsx ✅
├── utils/
│   ├── codeData.ts     # 代码数据源（5种语言）
│   └── canvas.ts       # Canvas 工具
└── index.css           # 全局样式
```

---

## 六、Git 提交记录

- `5cf6510` - 初始提交
- `53249de` - P0 核心页面和代码数据补全
- `2d80802` - P1 页面完善和 CodePanel 集成
- `6693fdf` - P2 页面完善和 CodePanel 全量集成
