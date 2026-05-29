import { createSignal, onMount } from 'solid-js';
import { graphCodes, languageLabels, type Language } from '../utils/codeData';
import Dropdown from '../components/Dropdown';

export default function Graph() {
  let canvasRef: HTMLCanvasElement;
  let ctxRef: CanvasRenderingContext2D;
  const [activeTab, setActiveTab] = createSignal('traversal');
  const [algorithm, setAlgorithm] = createSignal('bfs');
  const [nodeCount, setNodeCount] = createSignal(10);
  const [speed, setSpeed] = createSignal(50);
  const [isRunning, setIsRunning] = createSignal(false);
  const [steps, setSteps] = createSignal<string[]>([]);
  const [lang, setLang] = createSignal<Language>('javascript');
  const [nodes, setNodes] = createSignal<any[]>([]);
  const [edges, setEdges] = createSignal<any[]>([]);

  // MST state
  const [mstEdges, setMstEdges] = createSignal<any[]>([]);

  // Topo sort state
  const [topoOrder, setTopoOrder] = createSignal<number[]>([]);

  onMount(() => {
    ctxRef = canvasRef.getContext('2d')!;
    const dpr = window.devicePixelRatio || 1;
    const rect = canvasRef.getBoundingClientRect();
    canvasRef.width = rect.width * dpr;
    canvasRef.height = rect.height * dpr;
    ctxRef.scale(dpr, dpr);
    generateGraph();
    window.addEventListener('resize', () => {
      const rect = canvasRef.getBoundingClientRect();
      canvasRef.width = rect.width * dpr;
      canvasRef.height = rect.height * dpr;
      ctxRef.scale(dpr, dpr);
      const nodeList = nodes();
      const edgeList = edges();
      if (nodeList.length > 0) {
        drawGraph(nodeList, edgeList, new Set(), -1, []);
      }
    });
  });

  const generateGraph = () => {
    const n = nodeCount();
    const newNodes: any[] = [];
    const newEdges: any[] = [];
    for (let i = 0; i < n; i++) {
      const angle = (i / n) * Math.PI * 2;
      const radius = 150;
      newNodes.push({
        id: i,
        x: 300 + Math.cos(angle) * radius,
        y: 200 + Math.sin(angle) * radius,
        label: String.fromCharCode(65 + i % 26)
      });
    }
    for (let i = 0; i < n - 1; i++) {
      newEdges.push({ from: i, to: i + 1, weight: Math.floor(Math.random() * 20) + 1 });
      if (Math.random() > 0.5 && i < n - 2) {
        const extra = i + 2 + Math.floor(Math.random() * (n - i - 2));
        if (extra < n) newEdges.push({ from: i, to: extra, weight: Math.floor(Math.random() * 20) + 1 });
      }
    }
    setNodes(newNodes);
    setEdges(newEdges);
    setMstEdges([]);
    setTopoOrder([]);
    drawGraph(newNodes, newEdges, new Set(), -1, []);
    setSteps([]);
  };

  const drawGraph = (nodeList: any[], edgeList: any[], visited: Set<number>, current: number, queue: number[], mstEdgeList?: any[]) => {
    if (!ctxRef) return;
    const canvas = canvasRef;
    const ctx = ctxRef;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (const edge of edgeList) {
      const from = nodeList[edge.from];
      const to = nodeList[edge.to];
      const isMst = mstEdgeList?.some((e: any) =>
        (e.from === edge.from && e.to === edge.to) || (e.from === edge.to && e.to === edge.from)
      );
      ctx.beginPath(); ctx.moveTo(from.x, from.y); ctx.lineTo(to.x, to.y);
      ctx.strokeStyle = isMst ? '#1a1a1a' : '#e5e5e5';
      ctx.lineWidth = isMst ? 3 : 1;
      ctx.stroke();
      // Draw weight
      if (edge.weight !== undefined) {
        const midX = (from.x + to.x) / 2;
        const midY = (from.y + to.y) / 2;
        ctx.fillStyle = isMst ? '#1a1a1a' : '#999999';
        ctx.font = '11px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(String(edge.weight), midX, midY - 8);
      }
    }
    for (let i = 0; i < nodeList.length; i++) {
      const node = nodeList[i];
      ctx.beginPath(); ctx.arc(node.x, node.y, 20, 0, Math.PI * 2);
      if (i === current) ctx.fillStyle = '#1a1a1a';
      else if (visited.has(i)) ctx.fillStyle = '#666666';
      else if (queue.includes(i)) ctx.fillStyle = '#999999';
      else { ctx.fillStyle = '#ffffff'; }
      ctx.fill(); ctx.strokeStyle = '#cccccc'; ctx.lineWidth = 2; ctx.stroke();
      ctx.fillStyle = (i === current || visited.has(i)) ? '#ffffff' : '#1a1a1a';
      ctx.font = '14px monospace'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(node.label, node.x, node.y);
    }
  };

  const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));
  const addStep = (text: string) => setSteps(prev => [text, ...prev].slice(0, 30));

  const startAlgorithm = async () => {
    if (isRunning()) return;
    setIsRunning(true);
    setSteps([]);
    const algo = algorithm();
    if (algo === 'bfs') await bfs();
    else if (algo === 'dfs') await dfs();
    else if (algo === 'dijkstra') await dijkstra();
    else if (algo === 'kruskal') await kruskal();
    else if (algo === 'prim') await prim();
    else if (algo === 'topo') await topologicalSort();
    setIsRunning(false);
  };

  const bfs = async () => {
    const nodeList = [...nodes()];
    const edgeList = [...edges()];
    const visited = new Set<number>();
    const queue = [0];
    addStep('从节点 A 开始 BFS');
    while (queue.length > 0) {
      if (!isRunning()) return;
      const current = queue.shift()!;
      if (visited.has(current)) continue;
      visited.add(current);
      addStep(`访问节点: ${nodeList[current].label}`);
      drawGraph(nodeList, edgeList, visited, current, queue);
      await sleep(Math.max(1, 101 - speed()) * 15);
      const neighbors = getNeighbors(current, edgeList);
      for (const n of neighbors) {
        if (!visited.has(n) && !queue.includes(n)) { queue.push(n); addStep(`将节点 ${nodeList[n].label} 加入队列`); }
      }
      drawGraph(nodeList, edgeList, visited, -1, queue);
      await sleep(Math.max(1, 101 - speed()) * 15);
    }
    addStep('BFS 遍历完成');
  };

  const dfs = async () => {
    const nodeList = [...nodes()];
    const edgeList = [...edges()];
    const visited = new Set<number>();
    const stack = [0];
    addStep('从节点 A 开始 DFS');
    while (stack.length > 0) {
      if (!isRunning()) return;
      const current = stack.pop()!;
      if (visited.has(current)) continue;
      visited.add(current);
      addStep(`访问节点: ${nodeList[current].label}`);
      drawGraph(nodeList, edgeList, visited, current, stack);
      await sleep(Math.max(1, 101 - speed()) * 15);
      const neighbors = getNeighbors(current, edgeList);
      for (const n of neighbors) {
        if (!visited.has(n) && !stack.includes(n)) { stack.push(n); addStep(`将节点 ${nodeList[n].label} 压入栈`); }
      }
      drawGraph(nodeList, edgeList, visited, -1, stack);
      await sleep(Math.max(1, 101 - speed()) * 15);
    }
    addStep('DFS 遍历完成');
  };

  const dijkstra = async () => {
    const nodeList = [...nodes()];
    const edgeList = [...edges()];
    const visited = new Set<number>();
    const distances = new Array(nodeList.length).fill(Infinity);
    distances[0] = 0;
    addStep('从节点 A 开始 Dijkstra');
    while (visited.size < nodeList.length) {
      if (!isRunning()) return;
      let current = -1, minDist = Infinity;
      for (let i = 0; i < nodeList.length; i++) {
        if (!visited.has(i) && distances[i] < minDist) { minDist = distances[i]; current = i; }
      }
      if (current === -1) break;
      visited.add(current);
      addStep(`访问节点: ${nodeList[current].label}, 距离: ${minDist}`);
      drawGraph(nodeList, edgeList, visited, current, []);
      await sleep(Math.max(1, 101 - speed()) * 15);
      const neighbors = getNeighbors(current, edgeList);
      for (const n of neighbors) {
        const edge = edgeList.find((e: any) => (e.from === current && e.to === n) || (e.from === n && e.to === current));
        const weight = edge?.weight || 1;
        const newDist = minDist + weight;
        if (newDist < distances[n]) { distances[n] = newDist; addStep(`更新节点 ${nodeList[n].label} 距离: ${newDist}`); }
      }
    }
    addStep('Dijkstra 完成');
  };

  const kruskal = async () => {
    const nodeList = [...nodes()];
    const edgeList = [...edges()].sort((a: any, b: any) => a.weight - b.weight);
    const parent = nodeList.map((_: any, i: number) => i);
    const mst: any[] = [];

    const find = (x: number) => {
      if (parent[x] !== x) parent[x] = find(parent[x]);
      return parent[x];
    };

    const union = (x: number, y: number) => {
      parent[find(x)] = find(y);
    };

    addStep('Kruskal: 按边权从小到大排序');
    for (const edge of edgeList) {
      if (!isRunning()) return;
      const pa = find(edge.from);
      const pb = find(edge.to);
      if (pa !== pb) {
        union(edge.from, edge.to);
        mst.push(edge);
        setMstEdges([...mst]);
        addStep(`选择边 ${nodeList[edge.from].label}-${nodeList[edge.to].label} (权重 ${edge.weight})`);
        drawGraph(nodeList, edgeList, new Set(), -1, [], mst);
        await sleep(Math.max(1, 101 - speed()) * 15);
      } else {
        addStep(`跳过边 ${nodeList[edge.from].label}-${nodeList[edge.to].label}: 会形成环`);
        await sleep(Math.max(1, 101 - speed()) * 8);
      }
      if (mst.length >= nodeList.length - 1) break;
    }
    addStep(`Kruskal 完成: 最小生成树包含 ${mst.length} 条边`);
  };

  const prim = async () => {
    const nodeList = [...nodes()];
    const edgeList = [...edges()];
    const visited = new Set<number>();
    const mst: any[] = [];

    visited.add(0);
    addStep('Prim: 从节点 A 开始');

    while (visited.size < nodeList.length) {
      if (!isRunning()) return;
      let minEdge: any = null;
      let minWeight = Infinity;

      for (const edge of edgeList) {
        const fromVisited = visited.has(edge.from);
        const toVisited = visited.has(edge.to);
        if ((fromVisited && !toVisited) || (!fromVisited && toVisited)) {
          if (edge.weight < minWeight) {
            minWeight = edge.weight;
            minEdge = edge;
          }
        }
      }

      if (!minEdge) break;

      const newNode = visited.has(minEdge.from) ? minEdge.to : minEdge.from;
      visited.add(newNode);
      mst.push(minEdge);
      setMstEdges([...mst]);
      addStep(`添加边 ${nodeList[minEdge.from].label}-${nodeList[minEdge.to].label} (权重 ${minEdge.weight})`);
      drawGraph(nodeList, edgeList, visited, newNode, [], mst);
      await sleep(Math.max(1, 101 - speed()) * 15);
    }
    addStep(`Prim 完成: 最小生成树包含 ${mst.length} 条边`);
  };

  const topologicalSort = async () => {
    const nodeList = [...nodes()];
    const edgeList = [...edges()];
    const inDegree = new Array(nodeList.length).fill(0);
    for (const edge of edgeList) inDegree[edge.to]++;

    const queue: number[] = [];
    for (let i = 0; i < nodeList.length; i++) {
      if (inDegree[i] === 0) queue.push(i);
    }

    const order: number[] = [];
    const visited = new Set<number>();
    addStep('拓扑排序: 从入度为 0 的节点开始');

    while (queue.length > 0) {
      if (!isRunning()) return;
      const current = queue.shift()!;
      visited.add(current);
      order.push(current);
      setTopoOrder([...order]);
      addStep(`访问节点 ${nodeList[current].label}，当前顺序: ${order.map(i => nodeList[i].label).join(' -> ')}`);
      drawGraph(nodeList, edgeList, visited, current, queue);
      await sleep(Math.max(1, 101 - speed()) * 15);

      for (const edge of edgeList) {
        if (edge.from === current) {
          inDegree[edge.to]--;
          if (inDegree[edge.to] === 0 && !visited.has(edge.to)) {
            queue.push(edge.to);
          }
        }
      }
    }

    if (order.length < nodeList.length) {
      addStep('图中存在环，无法进行拓扑排序');
    } else {
      addStep('拓扑排序完成');
    }
  };

  const getNeighbors = (nodeIndex: number, edgeList: any[]) => {
    const neighbors: number[] = [];
    for (const edge of edgeList) {
      if (edge.from === nodeIndex) neighbors.push(edge.to);
      else if (edge.to === nodeIndex) neighbors.push(edge.from);
    }
    return neighbors;
  };

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
      case 'shortest': return [
        { label: 'Dijkstra', value: 'dijkstra' },
      ];
      case 'mst': return [
        { label: 'Kruskal', value: 'kruskal' },
        { label: 'Prim', value: 'prim' },
      ];
      case 'topo': return [
        { label: '拓扑排序', value: 'topo' },
      ];
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
          <p class="description">图是由节点和边组成的数据结构，广泛应用于路径规划、社交网络分析、网络设计等领域。</p>
        </div>
        <div style={{ display: 'flex', gap: '0', 'border-bottom': '1px solid var(--border)', 'margin-bottom': '2rem' }}>
          {tabs.map(tab => (
            <div
              class="graph-tab"
              style={{
                padding: '0.75rem 1.5rem',
                cursor: 'pointer',
                'font-size': '0.85rem',
                'text-transform': 'uppercase',
                'letter-spacing': '0.05em',
                color: activeTab() === tab.id ? 'var(--text-primary)' : 'var(--text-secondary)',
                'border-bottom': activeTab() === tab.id ? '1px solid var(--text-primary)' : '1px solid transparent',
                'margin-bottom': '-1px',
              }}
              onClick={() => { setActiveTab(tab.id); setMstEdges([]); setTopoOrder([]); setSteps([]); }}
            >
              {tab.label}
            </div>
          ))}
        </div>
        <div class="controls">
          <div class="controls-group">
            <label>算法</label>
            <Dropdown
              value={algorithm()}
              onChange={(value) => setAlgorithm(value)}
              options={getAlgoOptions()}
            />
          </div>
          <div class="controls-group">
            <label>节点数量</label>
            <input type="range" min="5" max="20" value={nodeCount()} onInput={e => { setNodeCount(parseInt(e.currentTarget.value)); generateGraph(); }} />
            <span>{nodeCount()}</span>
          </div>
          <div class="controls-group">
            <label>速度</label>
            <input type="range" min="1" max="100" value={speed()} onInput={e => setSpeed(parseInt(e.currentTarget.value))} />
          </div>
          <div class="controls-group">
            <button class="btn" onClick={generateGraph}>生成新图</button>
            <button class="btn btn-primary" onClick={startAlgorithm} disabled={isRunning()}>
              {isRunning() ? '运行中...' : '开始算法'}
            </button>
          </div>
        </div>
        <div class="canvas-container">
          <canvas ref={el => canvasRef = el} style={{ width: '100%', height: '400px', display: 'block' }} />
        </div>

        {activeTab() === 'mst' && mstEdges().length > 0 && (
          <div class="info-panel">
            <h3>最小生成树</h3>
            <div class="complexity">
              <div class="complexity-item"><div class="label">已选边数</div><div class="value">{mstEdges().length}</div></div>
              <div class="complexity-item"><div class="label">总权重</div><div class="value">{mstEdges().reduce((sum: number, e: any) => sum + e.weight, 0)}</div></div>
            </div>
          </div>
        )}

        {activeTab() === 'topo' && topoOrder().length > 0 && (
          <div class="info-panel">
            <h3>拓扑排序结果</h3>
            <div style={{ display: 'flex', gap: '0.5rem', 'flex-wrap': 'wrap' }}>
              {topoOrder().map((idx, i) => (
                <div style={{ display: 'flex', 'align-items': 'center', gap: '0.5rem' }}>
                  <div style={{
                    width: '40px', height: '40px', 'border-radius': '50%',
                    background: '#1a1a1a', color: '#fff', display: 'flex',
                    'align-items': 'center', 'justify-content': 'center',
                    'font-family': 'var(--font-mono)', 'font-size': '0.85rem',
                  }}>{nodes()[idx]?.label}</div>
                  {i < topoOrder().length - 1 && <span style={{ color: 'var(--text-secondary)' }}>→</span>}
                </div>
              ))}
            </div>
          </div>
        )}
        <div class="code-panel">
          <div class="code-panel-header">
            <h3>算法代码</h3>
            <Dropdown
              class="code-lang-select"
              value={lang()}
              onChange={(value) => setLang(value as Language)}
              options={Object.entries(languageLabels).map(([key, label]) => ({ value: key, label }))}
            />
          </div>
          <pre class="code-block"><code>{codeContent()}</code></pre>
        </div>
        <div class="steps-panel">
          <h3>执行步骤</h3>
          <div>
            {steps().length === 0 ? <div class="step-item">点击"开始算法"查看执行过程</div> : steps().map(step => <div class="step-item active">{step}</div>)}
          </div>
        </div>
      </div>
    </main>
  );
}
