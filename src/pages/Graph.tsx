import { createSignal, onMount, onCleanup, For, Show } from 'solid-js';
import { graphCodes, languageLabels, type Language } from '../utils/codeData';
import Dropdown from '../components/Dropdown';
import CodePanel from '../components/CodePanel';
import ControlPanel from '../components/ControlPanel';
import { AnimationController, type AnimStep } from '../utils/animation';
import { GraphVisualizer } from '../utils/three/GraphVisualizer';
import { DARK_THEME, LIGHT_THEME } from '../utils/three/ThreeVisualizer';

interface GraphNode {
  id: number;
  label: string;
}

interface GraphEdge {
  from: number;
  to: number;
  weight: number;
}

interface GraphState {
  nodes: GraphNode[];
  edges: GraphEdge[];
  visited: Set<number>;
  current: number;
  queue: number[];
  mstEdges: GraphEdge[];
  topoOrder: number[];
}

export default function Graph() {
  let containerRef: HTMLDivElement | undefined;
  let visualizer: GraphVisualizer | undefined;
  let controller: AnimationController<GraphState>;

  const [activeTab, setActiveTab] = createSignal('traversal');
  const [algorithm, setAlgorithm] = createSignal('bfs');
  const [nodeCount, setNodeCount] = createSignal(8);
  const [speed, setSpeed] = createSignal(50);
  const [isRunning, setIsRunning] = createSignal(false);
  const [steps, setSteps] = createSignal<string[]>([]);
  const [lang, setLang] = createSignal<Language>('javascript');
  const [currentStep, setCurrentStep] = createSignal(-1);
  const [totalSteps, setTotalSteps] = createSignal(0);
  const [state, setState] = createSignal<GraphState>({
    nodes: [],
    edges: [],
    visited: new Set(),
    current: -1,
    queue: [],
    mstEdges: [],
    topoOrder: [],
  });

  onMount(() => {
    if (!containerRef) return;
    visualizer = new GraphVisualizer(containerRef, {
      cameraPosition: [0, 8, 14],
      fov: 50,
    });
    const isDark = () => document.documentElement.getAttribute('data-theme') === 'dark';
    visualizer.setTheme(isDark() ? DARK_THEME : LIGHT_THEME);
    visualizer.start();

    const observer = new MutationObserver(() => {
      visualizer?.setTheme(isDark() ? DARK_THEME : LIGHT_THEME);
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

    generateGraph();

    controller = new AnimationController<GraphState>({ speed: speed() });
    controller.setCallbacks(
      (step: AnimStep<GraphState>) => {
        setState(step.state);
        for (let i = 0; i < step.state.nodes.length; i++) {
          const node = step.state.nodes[i];
          if (!node) continue;
          if (i === step.state.current) {
            visualizer?.setNodeState(i, 'current');
          } else if (step.state.visited.has(i)) {
            visualizer?.setNodeState(i, 'visited');
          } else if (step.state.queue.includes(i)) {
            visualizer?.setNodeState(i, 'queue');
          } else {
            visualizer?.setNodeState(i, 'idle');
          }
        }
        for (const e of step.state.edges) {
          const isMst = step.state.mstEdges.some(m =>
            (m.from === e.from && m.to === e.to) || (m.from === e.to && m.to === e.from)
          );
          visualizer?.setEdgeMst(e.from, e.to, isMst);
        }
        setSteps(prev => [step.description, ...prev].slice(0, 30));
      },
      (s, index, total) => {
        setCurrentStep(index);
        setTotalSteps(total);
      }
    );

    const handleKeydown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;
      if (e.key === ' ' || e.key === 'Space') {
        e.preventDefault();
        if (isRunning()) pause();
        else play();
      }
      if (e.key === 'ArrowLeft') { e.preventDefault(); controller.stepBackward(); }
      if (e.key === 'ArrowRight') { e.preventDefault(); controller.stepForward(); }
      if (e.key === 'r' || e.key === 'R') { e.preventDefault(); reset(); }
    };
    window.addEventListener('keydown', handleKeydown);

    onCleanup(() => {
      controller.destroy();
      observer.disconnect();
      window.removeEventListener('keydown', handleKeydown);
      visualizer?.stop();
    });
  });

  const generateGraph = () => {
    controller?.reset();
    const n = nodeCount();
    const newNodes: GraphNode[] = [];
    const newEdges: GraphEdge[] = [];

    for (let i = 0; i < n; i++) {
      newNodes.push({ id: i, label: String.fromCharCode(65 + i % 26) });
    }

    for (let i = 0; i < n - 1; i++) {
      newEdges.push({ from: i, to: i + 1, weight: Math.floor(Math.random() * 20) + 1 });
      if (Math.random() > 0.5 && i < n - 2) {
        const extra = i + 2 + Math.floor(Math.random() * (n - i - 2));
        if (extra < n) newEdges.push({ from: i, to: extra, weight: Math.floor(Math.random() * 20) + 1 });
      }
    }
    for (let i = 0; i < n; i++) {
      const target = (i + 3) % n;
      if (target !== i && !newEdges.some(e => (e.from === i && e.to === target) || (e.from === target && e.to === i))) {
        if (Math.random() > 0.4) {
          newEdges.push({ from: i, to: target, weight: Math.floor(Math.random() * 20) + 1 });
        }
      }
    }

    const newState: GraphState = {
      nodes: newNodes, edges: newEdges,
      visited: new Set(), current: -1, queue: [], mstEdges: [], topoOrder: [],
    };
    setState(newState);
    setSteps([]);
    setCurrentStep(-1);
    setTotalSteps(0);
    visualizer?.setGraph(newNodes, newEdges);
  };

  const getNeighbors = (nodeIndex: number, edgeList: GraphEdge[]): number[] => {
    const neighbors: number[] = [];
    for (const edge of edgeList) {
      if (edge.from === nodeIndex) neighbors.push(edge.to);
      else if (edge.to === nodeIndex) neighbors.push(edge.from);
    }
    return neighbors;
  };

  const buildSteps = (g: GraphState, algo: string): AnimStep<GraphState>[] => {
    const steps: AnimStep<GraphState>[] = [];

    if (algo === 'bfs') {
      const visited = new Set<number>();
      const queue: number[] = [0];
      steps.push({ state: { ...g, queue: [0], current: 0 }, description: `起点 ${g.nodes[0].label} 加入队列` });

      while (queue.length > 0) {
        const current = queue.shift()!;
        if (visited.has(current)) continue;
        visited.add(current);
        steps.push({ state: { ...g, visited: new Set(visited), queue: [...queue], current }, description: `访问节点 ${g.nodes[current].label}` });

        const neighbors = getNeighbors(current, g.edges);
        for (const n of neighbors) {
          if (!visited.has(n) && !queue.includes(n)) {
            queue.push(n);
            steps.push({ state: { ...g, visited: new Set(visited), queue: [...queue], current: n }, description: `将节点 ${g.nodes[n].label} 加入队列` });
          }
        }
      }
      steps.push({ state: { ...g, visited: new Set(visited), queue: [], current: -1 }, description: 'BFS 遍历完成' });
    } else if (algo === 'dfs') {
      const visited = new Set<number>();
      const stack: number[] = [0];
      steps.push({ state: { ...g, queue: [0], current: 0 }, description: `起点 ${g.nodes[0].label} 入栈` });

      while (stack.length > 0) {
        const current = stack.pop()!;
        if (visited.has(current)) continue;
        visited.add(current);
        steps.push({ state: { ...g, visited: new Set(visited), queue: [...stack], current }, description: `访问节点 ${g.nodes[current].label}` });

        const neighbors = getNeighbors(current, g.edges);
        for (let i = neighbors.length - 1; i >= 0; i--) {
          const n = neighbors[i];
          if (!visited.has(n) && !stack.includes(n)) {
            stack.push(n);
            steps.push({ state: { ...g, visited: new Set(visited), queue: [...stack], current: n }, description: `将节点 ${g.nodes[n].label} 压入栈` });
          }
        }
      }
      steps.push({ state: { ...g, visited: new Set(visited), queue: [], current: -1 }, description: 'DFS 遍历完成' });
    } else if (algo === 'dijkstra') {
      const visited = new Set<number>();
      const distances = new Array(g.nodes.length).fill(Infinity);
      distances[0] = 0;
      steps.push({ state: { ...g, queue: [0], current: 0 }, description: `起点 ${g.nodes[0].label} 距离为 0` });

      while (visited.size < g.nodes.length) {
        let current = -1, minDist = Infinity;
        for (let i = 0; i < g.nodes.length; i++) {
          if (!visited.has(i) && distances[i] < minDist) {
            minDist = distances[i]; current = i;
          }
        }
        if (current === -1) break;
        visited.add(current);
        steps.push({ state: { ...g, visited: new Set(visited), queue: [], current }, description: `选择 ${g.nodes[current].label} (距离 ${minDist})` });

        const neighbors = getNeighbors(current, g.edges);
        for (const n of neighbors) {
          const edge = g.edges.find(e => (e.from === current && e.to === n) || (e.from === n && e.to === current));
          const weight = edge?.weight || 1;
          const newDist = minDist + weight;
          if (newDist < distances[n]) {
            distances[n] = newDist;
            steps.push({ state: { ...g, visited: new Set(visited), queue: [n], current: n }, description: `更新 ${g.nodes[n].label} 距离为 ${newDist}` });
          }
        }
      }
      steps.push({ state: { ...g, visited: new Set(visited), queue: [], current: -1 }, description: 'Dijkstra 完成' });
    } else if (algo === 'kruskal') {
      const sortedEdges = [...g.edges].sort((a, b) => (a.weight || 0) - (b.weight || 0));
      const parent = g.nodes.map((_, i) => i);
      const mst: GraphEdge[] = [];
      const find = (x: number): number => parent[x] === x ? x : (parent[x] = find(parent[x]));
      const union = (x: number, y: number) => { parent[find(x)] = find(y); };

      steps.push({ state: { ...g, mstEdges: [] }, description: 'Kruskal: 按边权从小到大排序' });

      for (const edge of sortedEdges) {
        const pa = find(edge.from);
        const pb = find(edge.to);
        if (pa !== pb) {
          union(edge.from, edge.to);
          mst.push(edge);
          steps.push({ state: { ...g, mstEdges: [...mst] }, description: `选择边 ${g.nodes[edge.from].label}-${g.nodes[edge.to].label} (权重 ${edge.weight})` });
        } else {
          steps.push({ state: { ...g, mstEdges: [...mst] }, description: `跳过边 ${g.nodes[edge.from].label}-${g.nodes[edge.to].label}: 会形成环` });
        }
        if (mst.length >= g.nodes.length - 1) break;
      }
      steps.push({ state: { ...g, mstEdges: [...mst] }, description: `Kruskal 完成: MST 包含 ${mst.length} 条边` });
    } else if (algo === 'prim') {
      const visited = new Set<number>([0]);
      const mst: GraphEdge[] = [];
      steps.push({ state: { ...g, visited: new Set(visited), current: 0 }, description: `Prim: 从节点 ${g.nodes[0].label} 开始` });

      while (visited.size < g.nodes.length) {
        let minEdge: GraphEdge | null = null;
        let minWeight = Infinity;
        for (const edge of g.edges) {
          const fromVisited = visited.has(edge.from);
          const toVisited = visited.has(edge.to);
          if ((fromVisited && !toVisited) || (!fromVisited && toVisited)) {
            if ((edge.weight || 0) < minWeight) {
              minWeight = edge.weight || 0;
              minEdge = edge;
            }
          }
        }
        if (!minEdge) break;
        const newNode = visited.has(minEdge.from) ? minEdge.to : minEdge.from;
        visited.add(newNode);
        mst.push(minEdge);
        steps.push({ state: { ...g, visited: new Set(visited), mstEdges: [...mst], current: newNode }, description: `添加边 ${g.nodes[minEdge.from].label}-${g.nodes[minEdge.to].label} (权重 ${minEdge.weight})` });
      }
      steps.push({ state: { ...g, visited: new Set(visited), mstEdges: [...mst], current: -1 }, description: `Prim 完成: MST 包含 ${mst.length} 条边` });
    } else if (algo === 'topo') {
      const inDegree = new Array(g.nodes.length).fill(0);
      for (const edge of g.edges) inDegree[edge.to]++;
      const queue: number[] = [];
      for (let i = 0; i < g.nodes.length; i++) {
        if (inDegree[i] === 0) queue.push(i);
      }
      const order: number[] = [];
      const visited = new Set<number>();
      steps.push({ state: { ...g, queue: [...queue], current: -1 }, description: '入度为 0 的节点入队' });

      while (queue.length > 0) {
        const current = queue.shift()!;
        visited.add(current);
        order.push(current);
        steps.push({ state: { ...g, visited: new Set(visited), queue: [...queue], current, topoOrder: [...order] }, description: `访问 ${g.nodes[current].label}, 顺序: ${order.map(i => g.nodes[i].label).join(' → ')}` });

        for (const edge of g.edges) {
          if (edge.from === current) {
            inDegree[edge.to]--;
            if (inDegree[edge.to] === 0 && !visited.has(edge.to)) {
              queue.push(edge.to);
              steps.push({ state: { ...g, visited: new Set(visited), queue: [...queue], current: edge.to }, description: `${g.nodes[edge.to].label} 入度变为 0, 入队` });
            }
          }
        }
      }
      steps.push({ state: { ...g, visited: new Set(visited), queue: [], current: -1, topoOrder: [...order] }, description: order.length < g.nodes.length ? '图中存在环' : '拓扑排序完成' });
    }

    return steps;
  };

  const start = () => {
    if (isRunning()) return;
    setIsRunning(true);
    setSteps([]);
    const freshState: GraphState = {
      nodes: state().nodes, edges: state().edges,
      visited: new Set(), current: -1, queue: [], mstEdges: [], topoOrder: [],
    };
    setState(freshState);
    const animSteps = buildSteps(freshState, algorithm());
    controller.setSteps(animSteps);
    controller.setSpeed(speed());
    controller.play().then(() => {
      setIsRunning(false);
      setSteps(prev => ['算法执行完成', ...prev]);
    });
  };

  const play = () => {
    if (controller.isAtEnd() || controller.isEmpty()) start();
    else { setIsRunning(true); controller.play().then(() => setIsRunning(false)); }
  };
  const pause = () => { controller.pause(); setIsRunning(false); };
  const reset = () => { controller.pause(); setIsRunning(false); generateGraph(); };
  const handleStepForward = () => { if (!isRunning()) controller.stepForward(); };
  const handleStepBackward = () => { if (!isRunning()) controller.stepBackward(); };
  const handleSpeedChange = (newSpeed: number) => { setSpeed(newSpeed); controller.setSpeed(newSpeed); };

  const codeContent = () => {
    const code = graphCodes[algorithm()];
    if (!code) return '// 暂无代码';
    return code[lang()];
  };

  const getAlgoOptions = () => {
    switch (activeTab()) {
      case 'traversal': return [
        { label: '广度优先搜索', value: 'bfs' },
        { label: '深度优先搜索', value: 'dfs' },
      ];
      case 'shortest': return [{ label: 'Dijkstra', value: 'dijkstra' }];
      case 'mst': return [
        { label: 'Kruskal', value: 'kruskal' },
        { label: 'Prim', value: 'prim' },
      ];
      case 'topo': return [{ label: '拓扑排序', value: 'topo' }];
      default: return [];
    }
  };

  const tabs = [
    { id: 'traversal', label: '图遍历' },
    { id: 'shortest', label: '最短路径' },
    { id: 'mst', label: '最小生成树' },
    { id: 'topo', label: '拓扑排序' },
  ];

  return (
    <main class="visualization-page">
      <div class="container">
        <div class="visualization-header">
          <h1>图算法</h1>
          <p class="description">
            图是由节点和边组成的非线性数据结构, 广泛应用于路径规划、社交网络分析、网络设计等领域。
            <span class="hint">3D 力导向布局 · 拖拽旋转 · 鼠标悬停查看节点</span>
          </p>
        </div>
        <div class="graph-tabs">
          <For each={tabs}>{tab => (
            <button
              class={`graph-tab ${activeTab() === tab.id ? 'active' : ''}`}
              onClick={() => { setActiveTab(tab.id); reset(); }}
            >
              {tab.label}
            </button>
          )}</For>
        </div>
        <div class="controls">
          <div class="controls-group">
            <label>算法</label>
            <Dropdown
              value={algorithm()}
              onChange={(value) => { setAlgorithm(value); reset(); }}
              options={getAlgoOptions()}
            />
          </div>
          <div class="controls-group">
            <label>节点数量</label>
            <input type="range" min="5" max="15" value={nodeCount()} onInput={e => { setNodeCount(parseInt(e.currentTarget.value)); generateGraph(); }} />
            <span>{nodeCount()}</span>
          </div>
        </div>
        <div class="canvas-container canvas-container-3d">
          <div ref={el => { containerRef = el; }} class="three-container" />
          <div class="three-hint">
            <span>3D VIEW</span>
            <span class="three-hint-divider">·</span>
            <span>拖拽旋转</span>
            <span class="three-hint-divider">·</span>
            <span>滚轮缩放</span>
          </div>
        </div>
        <ControlPanel
          isRunning={isRunning()}
          speed={speed()}
          currentStep={currentStep()}
          totalSteps={totalSteps()}
          onPlay={play}
          onPause={pause}
          onReset={reset}
          onStepForward={handleStepForward}
          onStepBackward={handleStepBackward}
          onSpeedChange={handleSpeedChange}
          onGenerate={generateGraph}
        />

        <Show when={activeTab() === 'mst' && state().mstEdges.length > 0}>
          <div class="info-panel">
            <h3>最小生成树</h3>
            <div class="complexity">
              <div class="complexity-item"><div class="label">已选边数</div><div class="value">{state().mstEdges.length}</div></div>
              <div class="complexity-item"><div class="label">总权重</div><div class="value">{state().mstEdges.reduce((sum, e) => sum + (e.weight || 0), 0)}</div></div>
            </div>
          </div>
        </Show>

        <Show when={activeTab() === 'topo' && state().topoOrder.length > 0}>
          <div class="info-panel">
            <h3>拓扑排序结果</h3>
            <div class="topo-order">
              <For each={state().topoOrder}>{(idx, i) => (
                <>
                  <div class="topo-node">{state().nodes[idx]?.label}</div>
                  <Show when={i() < state().topoOrder.length - 1}>
                    <span class="topo-arrow">→</span>
                  </Show>
                </>
              )}</For>
            </div>
          </div>
        </Show>

        <div class="steps-panel">
          <h3>执行步骤</h3>
          <div>
            {steps().length === 0 ? <div class="step-item">点击播放按钮开始算法可视化</div> : steps().map(step => <div class="step-item active">{step}</div>)}
          </div>
        </div>

        <CodePanel category="graph" algorithm={algorithm()} />
      </div>
    </main>
  );
}
