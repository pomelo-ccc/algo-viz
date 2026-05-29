import { createSignal } from 'solid-js';

export default function RandomizedAlgorithms() {
  const [activeTab, setActiveTab] = createSignal('quickselect');
  const [isRunning, setIsRunning] = createSignal(false);
  const [steps, setSteps] = createSignal<string[]>([]);
  const [speed, setSpeed] = createSignal(50);

  // Quickselect
  const [quickselectArray, setQuickselectArray] = createSignal<number[]>([3, 2, 1, 5, 6, 4]);
  const [quickselectK, setQuickselectK] = createSignal(3);
  const [quickselectResult, setQuickselectResult] = createSignal<number | null>(null);
  const [quickselectPivot, setQuickselectPivot] = createSignal<number | null>(null);

  // Monte Carlo Pi
  const [monteCarloPoints, setMonteCarloPoints] = createSignal<number>(1000);
  const [monteCarloResult, setMonteCarloResult] = createSignal<number | null>(null);
  const [monteCarloInside, setMonteCarloInside] = createSignal<number>(0);

  // Randomized QuickSort
  const [randomQuickArray, setRandomQuickArray] = createSignal<number[]>([3, 6, 8, 10, 1, 2, 1]);
  const [randomQuickSorted, setRandomQuickSorted] = createSignal<number[]>([]);

  const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));
  const addStep = (text: string) => setSteps(prev => [text, ...prev].slice(0, 30));

  // Quickselect
  const runQuickselect = async () => {
    if (isRunning()) return;
    setIsRunning(true);
    setSteps([]);
    addStep(`Quickselect: 寻找第 ${quickselectK()} 小的元素`);

    const arr = [...quickselectArray()];
    const k = quickselectK();
    let left = 0;
    let right = arr.length - 1;

    while (left <= right) {
      if (!isRunning()) break;
      const pivotIndex = Math.floor(Math.random() * (right - left + 1)) + left;
      setQuickselectPivot(pivotIndex);
      addStep(`随机选择 pivot: arr[${pivotIndex}] = ${arr[pivotIndex]}`);
      await sleep(Math.max(1, 101 - speed()) * 10);

      // Partition
      const pivotValue = arr[pivotIndex];
      [arr[pivotIndex], arr[right]] = [arr[right], arr[pivotIndex]];
      let storeIndex = left;
      for (let i = left; i < right; i++) {
        if (arr[i] < pivotValue) {
          [arr[storeIndex], arr[i]] = [arr[i], arr[storeIndex]];
          storeIndex++;
        }
      }
      [arr[storeIndex], arr[right]] = [arr[right], arr[storeIndex]];

      addStep(`分区后: pivot 位置 = ${storeIndex}`);
      await sleep(Math.max(1, 101 - speed()) * 10);

      if (storeIndex === k - 1) {
        setQuickselectResult(arr[storeIndex]);
        addStep(`找到第 ${k} 小的元素: ${arr[storeIndex]}`);
        break;
      } else if (storeIndex < k - 1) {
        left = storeIndex + 1;
        addStep(`pivot 位置 < ${k - 1}, 搜索右半部分`);
      } else {
        right = storeIndex - 1;
        addStep(`pivot 位置 > ${k - 1}, 搜索左半部分`);
      }
    }

    setIsRunning(false);
  };

  // Monte Carlo Pi
  const runMonteCarlo = async () => {
    if (isRunning()) return;
    setIsRunning(true);
    setSteps([]);
    addStep('Monte Carlo: 估算圆周率');

    const n = monteCarloPoints();
    let inside = 0;
    for (let i = 0; i < n; i++) {
      if (!isRunning()) break;
      const x = Math.random();
      const y = Math.random();
      if (x * x + y * y <= 1) {
        inside++;
      }
      if (i % 100 === 0) {
        setMonteCarloInside(inside);
        setMonteCarloResult((4 * inside) / (i + 1));
        addStep(`第 ${i + 1} 个点: 估计 pi = ${((4 * inside) / (i + 1)).toFixed(6)}`);
        await sleep(Math.max(1, 101 - speed()) * 1);
      }
    }

    const pi = (4 * inside) / n;
    setMonteCarloResult(pi);
    addStep(`最终估计: pi ≈ ${pi.toFixed(6)}`);
    setIsRunning(false);
  };

  // Randomized QuickSort
  const runRandomQuickSort = async () => {
    if (isRunning()) return;
    setIsRunning(true);
    setSteps([]);
    addStep('随机化快速排序');

    const arr = [...randomQuickArray()];
    const sorted: number[] = [];

    const quickSort = async (a: number[], left: number, right: number) => {
      if (left >= right) return;
      const pivotIndex = Math.floor(Math.random() * (right - left + 1)) + left;
      const pivotValue = a[pivotIndex];
      addStep(`随机选择 pivot: ${pivotValue}`);
      await sleep(Math.max(1, 101 - speed()) * 10);

      // Partition
      [a[pivotIndex], a[right]] = [a[right], a[pivotIndex]];
      let storeIndex = left;
      for (let i = left; i < right; i++) {
        if (a[i] < pivotValue) {
          [a[storeIndex], a[i]] = [arr[i], a[storeIndex]];
          storeIndex++;
        }
      }
      [a[storeIndex], a[right]] = [a[right], a[storeIndex]];

      addStep(`分区完成: [${a.slice(left, storeIndex).join(', ')}] < ${pivotValue} < [${a.slice(storeIndex + 1, right + 1).join(', ')}]`);
      await sleep(Math.max(1, 101 - speed()) * 10);

      await quickSort(a, left, storeIndex - 1);
      await quickSort(a, storeIndex + 1, right);
    };

    await quickSort(arr, 0, arr.length - 1);
    setRandomQuickSorted([...arr]);
    addStep(`排序完成: [${arr.join(', ')}]`);
    setIsRunning(false);
  };

  const tabs = [
    { id: 'quickselect', label: 'Quickselect' },
    { id: 'montecarlo', label: 'Monte Carlo' },
    { id: 'randomquicksort', label: '随机化快速排序' },
  ];

  return (
    <main class="visualization-page">
      <div class="container">
        <div class="visualization-header">
          <h1>随机化算法</h1>
          <p class="description">随机化算法利用随机性来简化算法设计或提高算法性能，包括Quickselect、Monte Carlo方法、随机化排序等。</p>
        </div>
        <div style={{ display: 'flex', gap: '0', 'border-bottom': '1px solid var(--border)', 'margin-bottom': '2rem' }}>
          {tabs.map(tab => (
            <div
              class="ra-tab"
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

        {activeTab() === 'quickselect' && (
          <div>
            <div class="controls">
              <div class="controls-group">
                <label>数组</label>
                <input type="text" value={quickselectArray().join(',')} onChange={e => setQuickselectArray(e.currentTarget.value.split(',').map(Number))} style={{ width: '200px', padding: '0.5rem', border: '1px solid var(--border)' }} />
              </div>
              <div class="controls-group">
                <label>K</label>
                <input type="number" value={quickselectK()} onChange={e => setQuickselectK(parseInt(e.currentTarget.value) || 1)} style={{ width: '60px', padding: '0.5rem', border: '1px solid var(--border)' }} />
              </div>
              <div class="controls-group">
                <button class="btn btn-primary" onClick={runQuickselect} disabled={isRunning()}>
                  {isRunning() ? '运行中...' : '寻找第 K 小'}
                </button>
              </div>
            </div>
            <div class="canvas-container" style={{ padding: '2rem', 'min-height': '200px' }}>
              <div style={{ display: 'flex', 'flex-direction': 'column', gap: '1rem', 'align-items': 'center' }}>
                <div style={{ display: 'flex', gap: '4px' }}>
                  {quickselectArray().map((val, i) => (
                    <div style={{
                      width: '36px',
                      height: '36px',
                      display: 'flex',
                      'align-items': 'center',
                      'justify-content': 'center',
                      background: quickselectPivot() === i ? '#1a1a1a' : 'var(--bg-secondary)',
                      color: quickselectPivot() === i ? '#fff' : '#1a1a1a',
                      border: '1px solid var(--border)',
                      'font-family': 'var(--font-mono)',
                      'font-size': '0.85rem',
                    }}>
                      {val}
                    </div>
                  ))}
                </div>
                {quickselectResult() !== null && (
                  <div style={{ padding: '1rem', background: 'var(--bg-secondary)', border: '1px solid var(--border)', 'text-align': 'center', 'font-family': 'var(--font-mono)', 'font-size': '1.25rem' }}>
                    第 {quickselectK()} 小的元素: {quickselectResult()}
                  </div>
                )}
              </div>
            </div>
            <div class="info-panel">
              <h3>Quickselect</h3>
              <p>基于快速排序的分区思想，在平均 O(n) 时间内找到第 k 小的元素。</p>
              <div class="complexity">
                <div class="complexity-item"><div class="label">平均时间</div><div class="value">O(n)</div></div>
                <div class="complexity-item"><div class="label">最坏时间</div><div class="value">O(n²)</div></div>
                <div class="complexity-item"><div class="label">空间复杂度</div><div class="value">O(1)</div></div>
              </div>
            </div>
          </div>
        )}

        {activeTab() === 'montecarlo' && (
          <div>
            <div class="controls">
              <div class="controls-group">
                <label>点数</label>
                <input type="range" min="100" max="5000" value={monteCarloPoints()} onInput={e => setMonteCarloPoints(parseInt(e.currentTarget.value))} />
                <span>{monteCarloPoints()}</span>
              </div>
              <div class="controls-group">
                <button class="btn btn-primary" onClick={runMonteCarlo} disabled={isRunning()}>
                  {isRunning() ? '运行中...' : '估算 Pi'}
                </button>
              </div>
            </div>
            <div class="canvas-container" style={{ padding: '2rem', 'min-height': '200px' }}>
              <div style={{ display: 'flex', 'flex-direction': 'column', gap: '1rem', 'align-items': 'center' }}>
                {monteCarloResult() !== null && (
                  <div style={{ padding: '1rem', background: 'var(--bg-secondary)', border: '1px solid var(--border)', 'text-align': 'center', 'font-family': 'var(--font-mono)', 'font-size': '1.25rem' }}>
                    估算 Pi ≈ {monteCarloResult()?.toFixed(6)}
                  </div>
                )}
              </div>
            </div>
            <div class="info-panel">
              <h3>Monte Carlo 方法</h3>
              <p>通过随机采样来估算数值结果，常用于积分计算、概率模拟等问题。</p>
              <div class="complexity">
                <div class="complexity-item"><div class="label">收敛速度</div><div class="value">O(1/√n)</div></div>
                <div class="complexity-item"><div class="label">误差</div><div class="value">与 √n 成反比</div></div>
                <div class="complexity-item"><div class="label">应用</div><div class="value">积分、概率模拟</div></div>
              </div>
            </div>
          </div>
        )}

        {activeTab() === 'randomquicksort' && (
          <div>
            <div class="controls">
              <div class="controls-group">
                <label>数组</label>
                <input type="text" value={randomQuickArray().join(',')} onChange={e => setRandomQuickArray(e.currentTarget.value.split(',').map(Number))} style={{ width: '200px', padding: '0.5rem', border: '1px solid var(--border)' }} />
              </div>
              <div class="controls-group">
                <button class="btn btn-primary" onClick={runRandomQuickSort} disabled={isRunning()}>
                  {isRunning() ? '运行中...' : '随机化快速排序'}
                </button>
              </div>
            </div>
            <div class="canvas-container" style={{ padding: '2rem', 'min-height': '200px' }}>
              <div style={{ display: 'flex', 'flex-direction': 'column', gap: '1rem', 'align-items': 'center' }}>
                <div style={{ display: 'flex', gap: '4px' }}>
                  {randomQuickArray().map((val, i) => (
                    <div style={{
                      width: '36px',
                      height: '36px',
                      display: 'flex',
                      'align-items': 'center',
                      'justify-content': 'center',
                      background: 'var(--bg-secondary)',
                      border: '1px solid var(--border)',
                      'font-family': 'var(--font-mono)',
                      'font-size': '0.85rem',
                    }}>
                      {val}
                    </div>
                  ))}
                </div>
                {randomQuickSorted().length > 0 && (
                  <div style={{ display: 'flex', gap: '4px' }}>
                    {randomQuickSorted().map((val, i) => (
                      <div style={{
                        width: '36px',
                        height: '36px',
                        display: 'flex',
                        'align-items': 'center',
                        'justify-content': 'center',
                        background: 'var(--bg-secondary)',
                        border: '1px solid var(--border)',
                        'font-family': 'var(--font-mono)',
                        'font-size': '0.85rem',
                      }}>
                        {val}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div class="info-panel">
              <h3>随机化快速排序</h3>
              <p>通过随机选择 pivot 来避免最坏情况，使得算法的期望时间复杂度为 O(n log n)。</p>
              <div class="complexity">
                <div class="complexity-item"><div class="label">期望时间</div><div class="value">O(n log n)</div></div>
                <div class="complexity-item"><div class="label">最坏时间</div><div class="value">O(n²)</div></div>
                <div class="complexity-item"><div class="label">空间复杂度</div><div class="value">O(log n)</div></div>
              </div>
            </div>
          </div>
        )}

        <div class="steps-panel">
          <h3>执行步骤</h3>
          <div>
            {steps().length === 0 ? (
              <div class="step-item">选择标签页并点击"开始"查看随机化算法执行过程</div>
            ) : (
              steps().map(step => <div class="step-item active">{step}</div>)
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
