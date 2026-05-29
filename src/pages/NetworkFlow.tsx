import { createSignal } from 'solid-js';

export default function NetworkFlow() {
  const [activeTab, setActiveTab] = createSignal('maxflow');
  const [isRunning, setIsRunning] = createSignal(false);
  const [steps, setSteps] = createSignal<string[]>([]);
  const [speed, setSpeed] = createSignal(50);

  // Max Flow
  const [flowGraph, setFlowGraph] = createSignal<number[][]>([
    [0, 16, 13, 0, 0, 0],
    [0, 0, 10, 12, 0, 0],
    [0, 4, 0, 0, 14, 0],
    [0, 0, 9, 0, 0, 20],
    [0, 0, 0, 7, 0, 4],
    [0, 0, 0, 0, 0, 0],
  ]);
  const [flowResult, setFlowResult] = createSignal(0);
  const [flowPath, setFlowPath] = createSignal<number[]>([]);

  // Min Cut
  const [minCutResult, setMinCutResult] = createSignal<number[]>([]);

  // Bipartite Matching
  const [bipartiteGraph, setBipartiteGraph] = createSignal<number[][]>([
    [1, 1, 0, 0],
    [0, 1, 1, 0],
    [0, 0, 1, 1],
    [1, 0, 0, 1],
  ]);
  const [matchResult, setMatchResult] = createSignal<number[]>([]);

  const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));
  const addStep = (text: string) => setSteps(prev => [text, ...prev].slice(0, 30));

  // Max Flow (Ford-Fulkerson)
  const runMaxFlow = async () => {
    if (isRunning()) return;
    setIsRunning(true);
    setSteps([]);
    addStep('Ford-Fulkerson: 计算最大流');

    const graph = [...flowGraph().map(row => [...row])];
    const n = graph.length;
    let maxFlow = 0;

    const bfs = (s: number, t: number, parent: number[]) => {
      const visited = new Array(n).fill(false);
      const queue: number[] = [s];
      visited[s] = true;
      parent[s] = -1;

      while (queue.length > 0) {
        const u = queue.shift()!;
        for (let v = 0; v < n; v++) {
          if (!visited[v] && graph[u][v] > 0) {
            queue.push(v);
            parent[v] = u;
            visited[v] = true;
            if (v === t) return true;
          }
        }
      }
      return false;
    };

    const s = 0;
    const t = n - 1;
    const parent = new Array(n).fill(-1);

    while (bfs(s, t, parent)) {
      if (!isRunning()) break;
      let pathFlow = Infinity;
      let v = t;
      const path: number[] = [t];

      while (v !== s) {
        const u = parent[v];
        pathFlow = Math.min(pathFlow, graph[u][v]);
        v = u;
        path.unshift(v);
      }

      addStep(`找到增广路径: ${path.join(' -> ')}, 流量: ${pathFlow}`);
      setFlowPath([...path]);
      await sleep(Math.max(1, 101 - speed()) * 10);

      v = t;
      while (v !== s) {
        const u = parent[v];
        graph[u][v] -= pathFlow;
        graph[v][u] += pathFlow;
        v = u;
      }

      maxFlow += pathFlow;
      addStep(`当前最大流: ${maxFlow}`);
      await sleep(Math.max(1, 101 - speed()) * 10);
    }

    setFlowResult(maxFlow);
    addStep(`最大流: ${maxFlow}`);
    setIsRunning(false);
  };

  // Min Cut
  const runMinCut = async () => {
    if (isRunning()) return;
    setIsRunning(true);
    setSteps([]);
    addStep('计算最小割');

    // Simple implementation: find reachable nodes from source in residual graph
    const graph = [...flowGraph().map(row => [...row])];
    const n = graph.length;
    const visited = new Array(n).fill(false);
    const queue: number[] = [0];
    visited[0] = true;

    while (queue.length > 0) {
      const u = queue.shift()!;
      for (let v = 0; v < n; v++) {
        if (!visited[v] && graph[u][v] > 0) {
          queue.push(v);
          visited[v] = true;
        }
      }
    }

    const cut = visited.map((v, i) => (v ? i : -1)).filter(i => i !== -1);
    setMinCutResult(cut);
    addStep(`最小割: S集 = {${cut.join(', ')}}`);
    setIsRunning(false);
  };

  // Bipartite Matching (Hungarian)
  const runBipartiteMatching = async () => {
    if (isRunning()) return;
    setIsRunning(true);
    setSteps([]);
    addStep('匈牙利算法: 二分图最大匹配');

    const graph = [...bipartiteGraph().map(row => [...row])];
    const n = graph.length;
    const match = new Array(n).fill(-1);

    const bpm = async (u: number, seen: boolean[]) => {
      for (let v = 0; v < n; v++) {
        if (graph[u][v] === 1 && !seen[v]) {
          seen[v] = true;
          if (match[v] < 0 || (await bpm(match[v], seen))) {
            match[v] = u;
            return true;
          }
        }
      }
      return false;
    };

    let result = 0;
    for (let u = 0; u < n; u++) {
      if (!isRunning()) break;
      const seen = new Array(n).fill(false);
      if (await bpm(u, seen)) {
        result++;
        addStep(`找到匹配: 顶点 ${u}`);
        setMatchResult([...match]);
        await sleep(Math.max(1, 101 - speed()) * 10);
      }
    }

    addStep(`最大匹配数: ${result}`);
    setIsRunning(false);
  };

  const tabs = [
    { id: 'maxflow', label: '最大流' },
    { id: 'mincut', label: '最小割' },
    { id: 'bipartite', label: '二分图匹配' },
  ];

  return (
    <main class="visualization-page">
      <div class="container">
        <div class="visualization-header">
          <h1>网络流算法</h1>
          <p class="description">网络流算法用于解决图论中的流问题，包括最大流、最小割、二分图匹配等经典问题。</p>
        </div>
        <div style={{ display: 'flex', gap: '0', 'border-bottom': '1px solid var(--border)', 'margin-bottom': '2rem' }}>
          {tabs.map(tab => (
            <div
              class="nf-tab"
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
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </div>
          ))}
        </div>

        {activeTab() === 'maxflow' && (
          <div>
            <div class="controls">
              <div class="controls-group">
                <button class="btn btn-primary" onClick={runMaxFlow} disabled={isRunning()}>
                  {isRunning() ? '运行中...' : '计算最大流'}
                </button>
              </div>
            </div>
            <div class="canvas-container" style={{ padding: '2rem', 'min-height': '200px' }}>
              <div style={{ display: 'flex', 'flex-direction': 'column', gap: '1rem', 'align-items': 'center' }}>
                <div style={{ display: 'grid', 'grid-template-columns': 'repeat(6, 1fr)', gap: '4px' }}>
                  {flowGraph().map((row, i) =>
                    row.map((val, j) => (
                      <div style={{
                        width: '36px',
                        height: '36px',
                        display: 'flex',
                        'align-items': 'center',
                        'justify-content': 'center',
                        background: val > 0 ? 'var(--bg-secondary)' : 'transparent',
                        border: val > 0 ? '1px solid var(--border)' : 'none',
                        'font-family': 'var(--font-mono)',
                        'font-size': '0.75rem',
                      }}>
                        {val > 0 ? val : ''}
                      </div>
                    ))
                  )}
                </div>
                {flowResult() > 0 && (
                  <div style={{ padding: '1rem', background: 'var(--bg-secondary)', border: '1px solid var(--border)', 'text-align': 'center', 'font-family': 'var(--font-mono)', 'font-size': '1.25rem' }}>
                    最大流: {flowResult()}
                  </div>
                )}
              </div>
            </div>
            <div class="info-panel">
              <h3>最大流 (Max Flow)</h3>
              <p>Ford-Fulkerson算法通过不断寻找增广路径来增加流量，直到无法找到新的增广路径为止。</p>
              <div class="complexity">
                <div class="complexity-item"><div class="label">时间复杂度</div><div class="value">O(E * f)</div></div>
                <div class="complexity-item"><div class="label">空间复杂度</div><div class="value">O(V²)</div></div>
                <div class="complexity-item"><div class="label">方法</div><div class="value">增广路径</div></div>
              </div>
            </div>
          </div>
        )}

        {activeTab() === 'mincut' && (
          <div>
            <div class="controls">
              <div class="controls-group">
                <button class="btn btn-primary" onClick={runMinCut} disabled={isRunning()}>
                  {isRunning() ? '运行中...' : '计算最小割'}
                </button>
              </div>
            </div>
            <div class="canvas-container" style={{ padding: '2rem', 'min-height': '200px' }}>
              <div style={{ display: 'flex', 'flex-direction': 'column', gap: '1rem', 'align-items': 'center' }}>
                <div style={{ display: 'grid', 'grid-template-columns': 'repeat(6, 1fr)', gap: '4px' }}>
                  {flowGraph().map((row, i) =>
                    row.map((val, j) => (
                      <div style={{
                        width: '36px',
                        height: '36px',
                        display: 'flex',
                        'align-items': 'center',
                        'justify-content': 'center',
                        background: val > 0 ? 'var(--bg-secondary)' : 'transparent',
                        border: val > 0 ? '1px solid var(--border)' : 'none',
                        'font-family': 'var(--font-mono)',
                        'font-size': '0.75rem',
                      }}>
                        {val > 0 ? val : ''}
                      </div>
                    ))
                  )}
                </div>
                {minCutResult().length > 0 && (
                  <div style={{ padding: '1rem', background: 'var(--bg-secondary)', border: '1px solid var(--border)', 'text-align': 'center', 'font-family': 'var(--font-mono)', 'font-size': '1.25rem' }}>
                    最小割: S集 = {'{'} {minCutResult().join(', ')} {'}'}
                  </div>
                )}
              </div>
            </div>
            <div class="info-panel">
              <h3>最小割 (Min-Cut)</h3>
              <p>最小割将图分成两个部分，使得从源点到汇点的所有边的容量之和最小。最大流最小割定理指出最大流等于最小割。</p>
              <div class="complexity">
                <div class="complexity-item"><div class="label">时间复杂度</div><div class="value">O(V + E)</div></div>
                <div class="complexity-item"><div class="label">空间复杂度</div><div class="value">O(V²)</div></div>
                <div class="complexity-item"><div class="label">定理</div><div class="value">最大流 = 最小割</div></div>
              </div>
            </div>
          </div>
        )}

        {activeTab() === 'bipartite' && (
          <div>
            <div class="controls">
              <div class="controls-group">
                <button class="btn btn-primary" onClick={runBipartiteMatching} disabled={isRunning()}>
                  {isRunning() ? '运行中...' : '二分图匹配'}
                </button>
              </div>
            </div>
            <div class="canvas-container" style={{ padding: '2rem', 'min-height': '200px' }}>
              <div style={{ display: 'flex', 'flex-direction': 'column', gap: '1rem', 'align-items': 'center' }}>
                <div style={{ display: 'grid', 'grid-template-columns': 'repeat(4, 1fr)', gap: '4px' }}>
                  {bipartiteGraph().map((row, i) =>
                    row.map((val, j) => (
                      <div style={{
                        width: '36px',
                        height: '36px',
                        display: 'flex',
                        'align-items': 'center',
                        'justify-content': 'center',
                        background: val > 0 ? 'var(--bg-secondary)' : 'transparent',
                        border: val > 0 ? '1px solid var(--border)' : 'none',
                        'font-family': 'var(--font-mono)',
                        'font-size': '0.75rem',
                      }}>
                        {val > 0 ? val : ''}
                      </div>
                    ))
                  )}
                </div>
                {matchResult().length > 0 && (
                  <div style={{ padding: '1rem', background: 'var(--bg-secondary)', border: '1px solid var(--border)', 'text-align': 'center', 'font-family': 'var(--font-mono)', 'font-size': '1.25rem' }}>
                    匹配结果: {matchResult().map((m, i) => `顶点 ${i} -> 顶点 ${m}`).join(', ')}
                  </div>
                )}
              </div>
            </div>
            <div class="info-panel">
              <h3>二分图匹配 (Bipartite Matching)</h3>
              <p>匈牙利算法通过DFS寻找增广路径来实现二分图的最大匹配。</p>
              <div class="complexity">
                <div class="complexity-item"><div class="label">时间复杂度</div><div class="value">O(V * E)</div></div>
                <div class="complexity-item"><div class="label">空间复杂度</div><div class="value">O(V²)</div></div>
                <div class="complexity-item"><div class="label">方法</div><div class="value">增广路径</div></div>
              </div>
            </div>
          </div>
        )}

        <div class="steps-panel">
          <h3>执行步骤</h3>
          <div>
            {steps().length === 0 ? (
              <div class="step-item">选择标签页并点击"开始"查看网络流算法执行过程</div>
            ) : (
              steps().map(step => <div class="step-item active">{step}</div>)
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
