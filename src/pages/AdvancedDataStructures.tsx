import { createSignal } from 'solid-js';
import CodePanel from '../components/CodePanel';

export default function AdvancedDataStructures() {
  const [activeTab, setActiveTab] = createSignal('segment');
  const [isRunning, setIsRunning] = createSignal(false);
  const [steps, setSteps] = createSignal<string[]>([]);
  const [speed, setSpeed] = createSignal(50);

  // Segment Tree
  const [segArray, setSegArray] = createSignal<number[]>([1, 3, 5, 7, 9, 11, 13, 15]);
  const [segTree, setSegTree] = createSignal<number[]>([]);
  const [segQueryL, setSegQueryL] = createSignal(0);
  const [segQueryR, setSegQueryR] = createSignal(7);
  const [segQueryResult, setSegQueryResult] = createSignal<number | null>(null);

  // Fenwick Tree
  const [fenwickArray, setFenwickArray] = createSignal<number[]>([1, 3, 5, 7, 9, 11, 13, 15]);
  const [fenwickTree, setFenwickTree] = createSignal<number[]>([]);
  const [fenwickQueryIdx, setFenwickQueryIdx] = createSignal(7);
  const [fenwickResult, setFenwickResult] = createSignal<number | null>(null);

  // Monotonic Stack
  const [monoArray, setMonoArray] = createSignal<number[]>([2, 1, 2, 4, 3]);
  const [monoStack, setMonoStack] = createSignal<number[]>([]);
  const [monoResult, setMonoResult] = createSignal<number[]>([]);

  const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));
  const addStep = (text: string) => setSteps(prev => [text, ...prev].slice(0, 30));

  // Segment Tree
  const buildSegmentTree = async () => {
    if (isRunning()) return;
    setIsRunning(true);
    setSteps([]);
    addStep('构建线段树');

    const arr = [...segArray()];
    const n = arr.length;
    const tree = new Array(4 * n).fill(0);

    const build = async (node: number, start: number, end: number) => {
      if (start === end) {
        tree[node] = arr[start];
        addStep(`叶子节点 [${start}]: ${arr[start]}`);
        await sleep(Math.max(1, 101 - speed()) * 5);
        return;
      }
      const mid = Math.floor((start + end) / 2);
      await build(node * 2, start, mid);
      await build(node * 2 + 1, mid + 1, end);
      tree[node] = tree[node * 2] + tree[node * 2 + 1];
      addStep(`内部节点 [${start}-${end}]: ${tree[node * 2]} + ${tree[node * 2 + 1]} = ${tree[node]}`);
      await sleep(Math.max(1, 101 - speed()) * 5);
    };

    await build(1, 0, n - 1);
    setSegTree([...tree]);
    addStep('线段树构建完成');
    setIsRunning(false);
  };

  const querySegmentTree = async () => {
    if (isRunning()) return;
    setIsRunning(true);
    setSteps([]);
    addStep(`查询区间 [${segQueryL()}, ${segQueryR()}]`);

    const l = segQueryL();
    const r = segQueryR();
    const arr = [...segArray()];
    let sum = 0;
    for (let i = l; i <= r; i++) {
      sum += arr[i];
      addStep(`累加 arr[${i}] = ${arr[i]}, 当前和: ${sum}`);
      await sleep(Math.max(1, 101 - speed()) * 5);
    }
    setSegQueryResult(sum);
    addStep(`区间 [${l}, ${r}] 的和为 ${sum}`);
    setIsRunning(false);
  };

  // Fenwick Tree
  const buildFenwickTree = async () => {
    if (isRunning()) return;
    setIsRunning(true);
    setSteps([]);
    addStep('构建树状数组');

    const arr = [...fenwickArray()];
    const n = arr.length;
    const tree = new Array(n + 1).fill(0);

    for (let i = 0; i < n; i++) {
      let j = i + 1;
      while (j <= n) {
        tree[j] += arr[i];
        j += j & -j;
      }
      addStep(`更新树状数组: arr[${i}] = ${arr[i]}`);
      await sleep(Math.max(1, 101 - speed()) * 5);
    }

    setFenwickTree([...tree]);
    addStep('树状数组构建完成');
    setIsRunning(false);
  };

  const queryFenwickTree = async () => {
    if (isRunning()) return;
    setIsRunning(true);
    setSteps([]);
    addStep(`查询前缀和 [0, ${fenwickQueryIdx()}]`);

    const idx = fenwickQueryIdx();
    let sum = 0;
    let i = idx + 1;
    while (i > 0) {
      sum += fenwickTree()[i];
      addStep(`累加 tree[${i}] = ${fenwickTree()[i]}, 当前和: ${sum}`);
      i -= i & -i;
      await sleep(Math.max(1, 101 - speed()) * 5);
    }

    setFenwickResult(sum);
    addStep(`前缀和 [0, ${idx}] = ${sum}`);
    setIsRunning(false);
  };

  // Monotonic Stack
  const runMonotonicStack = async () => {
    if (isRunning()) return;
    setIsRunning(true);
    setSteps([]);
    addStep('单调栈: 寻找下一个更大元素');

    const arr = [...monoArray()];
    const n = arr.length;
    const result = new Array(n).fill(-1);
    const stack: number[] = [];

    for (let i = 0; i < n; i++) {
      addStep(`处理元素 arr[${i}] = ${arr[i]}`);
      await sleep(Math.max(1, 101 - speed()) * 5);

      while (stack.length > 0 && arr[stack[stack.length - 1]] < arr[i]) {
        const idx = stack.pop()!;
        result[idx] = arr[i];
        addStep(`arr[${idx}] = ${arr[idx]} 的下一个更大元素是 ${arr[i]}`);
        setMonoStack([...stack]);
        await sleep(Math.max(1, 101 - speed()) * 5);
      }

      stack.push(i);
      setMonoStack([...stack]);
      addStep(`将 ${i} 压入栈`);
      await sleep(Math.max(1, 101 - speed()) * 5);
    }

    setMonoResult(result);
    addStep('单调栈处理完成');
    setIsRunning(false);
  };

  const tabs = [
    { id: 'segment', label: '线段树' },
    { id: 'fenwick', label: '树状数组' },
    { id: 'monotonic', label: '单调栈' },
  ];

  return (
    <main class="visualization-page">
      <div class="container">
        <div class="visualization-header">
          <h1>高级数据结构</h1>
          <p class="description">高级数据结构包括线段树、树状数组、单调栈等，用于解决区间查询、前缀和、单调性等复杂问题。</p>
        </div>
        <div style={{ display: 'flex', gap: '0', 'border-bottom': '1px solid var(--border)', 'margin-bottom': '2rem' }}>
          {tabs.map(tab => (
            <div
              class="ads-tab"
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

        {activeTab() === 'segment' && (
          <div>
            <div class="controls">
              <div class="controls-group">
                <label>数组</label>
                <input type="text" value={segArray().join(',')} onChange={e => setSegArray(e.currentTarget.value.split(',').map(Number))} style={{ width: '200px', padding: '0.5rem', border: '1px solid var(--border)' }} />
              </div>
              <div class="controls-group">
                <button class="btn" onClick={buildSegmentTree}>构建线段树</button>
                <button class="btn btn-primary" onClick={querySegmentTree} disabled={isRunning()}>
                  {isRunning() ? '运行中...' : '区间查询'}
                </button>
              </div>
            </div>
            <div class="canvas-container" style={{ padding: '2rem', 'min-height': '200px' }}>
              <div style={{ display: 'flex', 'flex-direction': 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', gap: '4px' }}>
                  {segArray().map((val, i) => (
                    <div style={{ width: '36px', height: '36px', display: 'flex', 'align-items': 'center', 'justify-content': 'center', background: 'var(--bg-secondary)', border: '1px solid var(--border)', 'font-family': 'var(--font-mono)', 'font-size': '0.85rem' }}>
                      {val}
                    </div>
                  ))}
                </div>
                {segTree().length > 0 && (
                  <div style={{ display: 'flex', 'flex-direction': 'column', gap: '0.5rem' }}>
                    <h4 style={{ 'font-size': '0.85rem', color: 'var(--text-tertiary)', 'text-transform': 'uppercase', 'letter-spacing': '0.05em', 'margin-bottom': '0.5rem' }}>线段树</h4>
                    <div style={{ display: 'flex', gap: '4px', 'flex-wrap': 'wrap' }}>
                      {segTree().map((val, i) => (
                        <div style={{ width: '36px', height: '36px', display: 'flex', 'align-items': 'center', 'justify-content': 'center', background: val > 0 ? 'var(--bg-secondary)' : 'transparent', border: val > 0 ? '1px solid var(--border)' : 'none', 'font-family': 'var(--font-mono)', 'font-size': '0.85rem' }}>
                          {val > 0 ? val : ''}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {segQueryResult() !== null && (
                  <div style={{ padding: '1rem', background: 'var(--bg-secondary)', border: '1px solid var(--border)', 'text-align': 'center', 'font-family': 'var(--font-mono)', 'font-size': '1.25rem' }}>
                    区间 [{segQueryL()}, {segQueryR()}] 的和 = {segQueryResult()}
                  </div>
                )}
              </div>
            </div>
            <div class="info-panel">
              <h3>线段树 (Segment Tree)</h3>
              <p>用于区间查询和修改的数据结构，支持在 O(log n) 时间内完成区间和、区间最值等操作。</p>
              <div class="complexity">
                <div class="complexity-item"><div class="label">构建时间</div><div class="value">O(n)</div></div>
                <div class="complexity-item"><div class="label">查询/修改</div><div class="value">O(log n)</div></div>
                <div class="complexity-item"><div class="label">空间复杂度</div><div class="value">O(n)</div></div>
              </div>
            </div>
          </div>
        )}

        {activeTab() === 'fenwick' && (
          <div>
            <div class="controls">
              <div class="controls-group">
                <label>数组</label>
                <input type="text" value={fenwickArray().join(',')} onChange={e => setFenwickArray(e.currentTarget.value.split(',').map(Number))} style={{ width: '200px', padding: '0.5rem', border: '1px solid var(--border)' }} />
              </div>
              <div class="controls-group">
                <button class="btn" onClick={buildFenwickTree}>构建树状数组</button>
                <button class="btn btn-primary" onClick={queryFenwickTree} disabled={isRunning()}>
                  {isRunning() ? '运行中...' : '前缀和查询'}
                </button>
              </div>
            </div>
            <div class="canvas-container" style={{ padding: '2rem', 'min-height': '200px' }}>
              <div style={{ display: 'flex', 'flex-direction': 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', gap: '4px' }}>
                  {fenwickArray().map((val, i) => (
                    <div style={{ width: '36px', height: '36px', display: 'flex', 'align-items': 'center', 'justify-content': 'center', background: 'var(--bg-secondary)', border: '1px solid var(--border)', 'font-family': 'var(--font-mono)', 'font-size': '0.85rem' }}>
                      {val}
                    </div>
                  ))}
                </div>
                {fenwickTree().length > 0 && (
                  <div style={{ display: 'flex', 'flex-direction': 'column', gap: '0.5rem' }}>
                    <h4 style={{ 'font-size': '0.85rem', color: 'var(--text-tertiary)', 'text-transform': 'uppercase', 'letter-spacing': '0.05em', 'margin-bottom': '0.5rem' }}>树状数组</h4>
                    <div style={{ display: 'flex', gap: '4px', 'flex-wrap': 'wrap' }}>
                      {fenwickTree().map((val, i) => (
                        <div style={{ width: '36px', height: '36px', display: 'flex', 'align-items': 'center', 'justify-content': 'center', background: val > 0 ? 'var(--bg-secondary)' : 'transparent', border: val > 0 ? '1px solid var(--border)' : 'none', 'font-family': 'var(--font-mono)', 'font-size': '0.85rem' }}>
                          {val > 0 ? val : ''}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {fenwickResult() !== null && (
                  <div style={{ padding: '1rem', background: 'var(--bg-secondary)', border: '1px solid var(--border)', 'text-align': 'center', 'font-family': 'var(--font-mono)', 'font-size': '1.25rem' }}>
                    前缀和 [0, {fenwickQueryIdx()}] = {fenwickResult()}
                  </div>
                )}
              </div>
            </div>
            <div class="info-panel">
              <h3>树状数组 (Fenwick Tree / BIT)</h3>
              <p>用于高效计算前缀和的数据结构，支持在 O(log n) 时间内完成单点更新和前缀和查询。</p>
              <div class="complexity">
                <div class="complexity-item"><div class="label">构建时间</div><div class="value">O(n log n)</div></div>
                <div class="complexity-item"><div class="label">查询/更新</div><div class="value">O(log n)</div></div>
                <div class="complexity-item"><div class="label">空间复杂度</div><div class="value">O(n)</div></div>
              </div>
            </div>
          </div>
        )}

        {activeTab() === 'monotonic' && (
          <div>
            <div class="controls">
              <div class="controls-group">
                <label>数组</label>
                <input type="text" value={monoArray().join(',')} onChange={e => setMonoArray(e.currentTarget.value.split(',').map(Number))} style={{ width: '200px', padding: '0.5rem', border: '1px solid var(--border)' }} />
              </div>
              <div class="controls-group">
                <button class="btn btn-primary" onClick={runMonotonicStack} disabled={isRunning()}>
                  {isRunning() ? '运行中...' : '单调栈处理'}
                </button>
              </div>
            </div>
            <div class="canvas-container" style={{ padding: '2rem', 'min-height': '200px' }}>
              <div style={{ display: 'flex', 'flex-direction': 'column', gap: '1rem', 'align-items': 'center' }}>
                <div style={{ display: 'flex', gap: '4px' }}>
                  {monoArray().map((val, i) => (
                    <div style={{ width: '36px', height: '36px', display: 'flex', 'align-items': 'center', 'justify-content': 'center', background: 'var(--bg-secondary)', border: '1px solid var(--border)', 'font-family': 'var(--font-mono)', 'font-size': '0.85rem' }}>
                      {val}
                    </div>
                  ))}
                </div>
                {monoStack().length > 0 && (
                  <div style={{ display: 'flex', 'flex-direction': 'column', gap: '0.5rem', width: '100%', 'max-width': '400px' }}>
                    <h4 style={{ 'font-size': '0.85rem', color: 'var(--text-tertiary)', 'text-transform': 'uppercase', 'letter-spacing': '0.05em', 'margin-bottom': '0.5rem' }}>单调栈</h4>
                    <div style={{ display: 'flex', gap: '4px', 'flex-wrap': 'wrap' }}>
                      {monoStack().map((idx, i) => (
                        <div style={{ width: '36px', height: '36px', display: 'flex', 'align-items': 'center', 'justify-content': 'center', background: 'var(--bg-secondary)', border: '1px solid var(--border)', 'font-family': 'var(--font-mono)', 'font-size': '0.85rem' }}>
                          {idx}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {monoResult().length > 0 && (
                  <div style={{ display: 'flex', 'flex-direction': 'column', gap: '0.5rem', width: '100%', 'max-width': '400px' }}>
                    <h4 style={{ 'font-size': '0.85rem', color: 'var(--text-tertiary)', 'text-transform': 'uppercase', 'letter-spacing': '0.05em', 'margin-bottom': '0.5rem' }}>下一个更大元素</h4>
                    <div style={{ display: 'flex', gap: '4px', 'flex-wrap': 'wrap' }}>
                      {monoResult().map((val, i) => (
                        <div style={{ width: '36px', height: '36px', display: 'flex', 'align-items': 'center', 'justify-content': 'center', background: 'var(--bg-secondary)', border: '1px solid var(--border)', 'font-family': 'var(--font-mono)', 'font-size': '0.85rem' }}>
                          {val}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div class="info-panel">
              <h3>单调栈 (Monotonic Stack)</h3>
              <p>用于寻找下一个更大/更小元素的数据结构，通过维护单调递增或递减的栈来高效解决问题。</p>
              <div class="complexity">
                <div class="complexity-item"><div class="label">时间复杂度</div><div class="value">O(n)</div></div>
                <div class="complexity-item"><div class="label">空间复杂度</div><div class="value">O(n)</div></div>
                <div class="complexity-item"><div class="label">应用</div><div class="value">下一个更大元素</div></div>
              </div>
            </div>
          </div>
        )}

        <div class="steps-panel">
          <h3>执行步骤</h3>
          <div>
            {steps().length === 0 ? (
              <div class="step-item">选择标签页并点击"开始"查看高级数据结构执行过程</div>
            ) : (
              steps().map(step => <div class="step-item active">{step}</div>)
            )}
          </div>
        </div>

        <CodePanel category="advancedDS" algorithm={activeTab()} />
      </div>
    </main>
  );
}
