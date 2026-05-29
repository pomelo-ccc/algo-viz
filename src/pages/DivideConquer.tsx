import { createSignal, For } from 'solid-js';
import Dropdown from '../components/Dropdown';

interface MergeSortState {
  array: number[];
  left: number;
  right: number;
  level: number;
  merged: boolean;
}

export default function DivideConquer() {
  const [activeTab, setActiveTab] = createSignal('merge');
  const [isRunning, setIsRunning] = createSignal(false);
  const [steps, setSteps] = createSignal<string[]>([]);
  const [speed, setSpeed] = createSignal(50);

  // Merge Sort
  const [mergeArray, setMergeArray] = createSignal([38, 27, 43, 3, 9, 82, 10]);
  const [mergeStates, setMergeStates] = createSignal<MergeSortState[]>([]);
  const [highlightRange, setHighlightRange] = createSignal<{ l: number; r: number } | null>(null);

  // Tower of Hanoi
  const [disks, setDisks] = createSignal(4);
  const [towers, setTowers] = createSignal<number[][]>([[], [], []]);
  const [hanoiSteps, setHanoiSteps] = createSignal<string[]>([]);

  // Fast Exponentiation
  const [base, setBase] = createSignal(3);
  const [exp, setExp] = createSignal(13);
  const [expResult, setExpResult] = createSignal(0);
  const [expSteps, setExpSteps] = createSignal<{ bit: number; current: number; accum: number }[]>([]);

  const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));
  const addStep = (text: string) => setSteps(prev => [text, ...prev].slice(0, 30));

  // Merge Sort
  const generateMergeArray = () => {
    const arr: number[] = [];
    for (let i = 0; i < 8; i++) arr.push(Math.floor(Math.random() * 90) + 10);
    setMergeArray(arr);
    setMergeStates([]);
    setHighlightRange(null);
    setSteps([]);
  };

  const runMergeSort = async () => {
    if (isRunning()) return;
    setIsRunning(true);
    setSteps([]);
    addStep('归并排序: 分治法 - 将数组分成两半，分别排序后合并');

    const arr = [...mergeArray()];
    const states: MergeSortState[] = [];

    const mergeSort = async (array: number[], left: number, right: number, depth: number) => {
      if (left >= right) return;
      const mid = Math.floor((left + right) / 2);
      addStep(`分治: [${left}, ${right}] -> 分成 [${left}, ${mid}] 和 [${mid + 1}, ${right}]`);
      setHighlightRange({ l: left, r: mid });
      await sleep(Math.max(1, 101 - speed()) * 8);

      await mergeSort(array, left, mid, depth + 1);
      await mergeSort(array, mid + 1, right, depth + 1);

      addStep(`合并: [${left}, ${mid}] 和 [${mid + 1}, ${right}]`);
      setHighlightRange({ l: left, r: right });
      await merge(array, left, mid, right);
    };

    const merge = async (array: number[], left: number, mid: number, right: number) => {
      const leftArr = array.slice(left, mid + 1);
      const rightArr = array.slice(mid + 1, right + 1);
      let i = 0, j = 0, k = left;

      while (i < leftArr.length && j < rightArr.length) {
        if (leftArr[i] <= rightArr[j]) {
          array[k] = leftArr[i];
          i++;
        } else {
          array[k] = rightArr[j];
          j++;
        }
        setMergeArray([...array]);
        await sleep(Math.max(1, 101 - speed()) * 5);
        k++;
      }
      while (i < leftArr.length) { array[k] = leftArr[i]; i++; k++; setMergeArray([...array]); await sleep(Math.max(1, 101 - speed()) * 3); }
      while (j < rightArr.length) { array[k] = rightArr[j]; j++; k++; setMergeArray([...array]); await sleep(Math.max(1, 101 - speed()) * 3); }
    };

    await mergeSort(arr, 0, arr.length - 1, 0);
    addStep('归并排序完成');
    setMergeArray([...arr]);
    setIsRunning(false);
  };

  // Tower of Hanoi
  const initHanoi = () => {
    const n = disks();
    const tower: number[][] = [[], [], []];
    for (let i = n; i >= 1; i--) tower[0].push(i);
    setTowers(tower);
    setHanoiSteps([]);
    setSteps([]);
  };

  const runHanoi = async () => {
    if (isRunning()) return;
    setIsRunning(true);
    setSteps([]);
    addStep(`汉诺塔: 将 ${disks()} 个圆盘从 A 柱移到 C 柱`);

    const n = disks();
    const tower: number[][] = [[], [], []];
    for (let i = n; i >= 1; i--) tower[0].push(i);
    setTowers([tower[0].slice(), [], []]);

    const hanoi = async (num: number, from: number, to: number, aux: number) => {
      if (num === 0) return;
      if (!isRunning()) return;

      await hanoi(num - 1, from, aux, to);
      if (!isRunning()) return;

      const disk = tower[from].pop()!;
      tower[to].push(disk);
      setTowers([tower[0].slice(), tower[1].slice(), tower[2].slice()]);
      addStep(`移动圆盘 ${disk} 从 ${String.fromCharCode(65 + from)} 到 ${String.fromCharCode(65 + to)}`);
      await sleep(Math.max(1, 101 - speed()) * 15);

      await hanoi(num - 1, aux, to, from);
    };

    await hanoi(n, 0, 2, 1);
    addStep('汉诺塔完成');
    setIsRunning(false);
  };

  // Fast Exponentiation
  const runFastExp = async () => {
    if (isRunning()) return;
    setIsRunning(true);
    setSteps([]);
    addStep(`快速幂: 计算 ${base()}^${exp()}`);

    let b = base();
    let e = exp();
    let result = 1;
    const steps: { bit: number; current: number; accum: number }[] = [];

    addStep(`初始化: result = 1, base = ${b}, exp = ${e}`);
    await sleep(Math.max(1, 101 - speed()) * 10);

    while (e > 0) {
      const bit = e & 1;
      if (bit === 1) {
        result *= b;
        addStep(`最低位为 1: result = ${result}, base = ${b}`);
      } else {
        addStep(`最低位为 0: 不乘, base = ${b}`);
      }
      steps.push({ bit, current: b, accum: result });
      setExpSteps([...steps]);
      await sleep(Math.max(1, 101 - speed()) * 10);

      b *= b;
      e >>= 1;
      if (e > 0) addStep(`base 平方: ${b}, exp 右移: ${e}`);
      await sleep(Math.max(1, 101 - speed()) * 10);
    }

    setExpResult(result);
    addStep(`结果: ${base()}^${exp()} = ${result}`);
    setIsRunning(false);
  };

  const tabs = [
    { id: 'merge', label: '归并排序' },
    { id: 'hanoi', label: '汉诺塔' },
    { id: 'fastexp', label: '快速幂' },
  ];

  return (
    <main class="visualization-page">
      <div class="container">
        <div class="visualization-header">
          <h1>分治算法</h1>
          <p class="description">分治法将问题分解为更小的子问题，分别解决后再合并结果。经典应用包括归并排序、快速排序、汉诺塔等。</p>
        </div>
        <div style={{ display: 'flex', gap: '0', 'border-bottom': '1px solid var(--border)', 'margin-bottom': '2rem' }}>
          {tabs.map(tab => (
            <div
              class="dc-tab"
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

        {activeTab() === 'merge' && (
          <div>
            <div class="controls">
              <div class="controls-group">
                <button class="btn" onClick={generateMergeArray}>生成新数组</button>
                <button class="btn btn-primary" onClick={runMergeSort} disabled={isRunning()}>
                  {isRunning() ? '运行中...' : '开始排序'}
                </button>
              </div>
            </div>
            <div class="canvas-container" style={{ padding: '2rem', 'min-height': '120px' }}>
              <div style={{ display: 'flex', gap: '4px', 'justify-content': 'center', 'flex-wrap': 'wrap' }}>
                {mergeArray().map((val, i) => {
                  const hr = highlightRange();
                  const isHighlight = hr && i >= hr.l && i <= hr.r;
                  return (
                    <div style={{
                      width: '50px',
                      height: '50px',
                      display: 'flex',
                      'align-items': 'center',
                      'justify-content': 'center',
                      background: isHighlight ? '#1a1a1a' : '#f5f5f5',
                      color: isHighlight ? '#fff' : '#1a1a1a',
                      border: '1px solid var(--border)',
                      'font-family': 'var(--font-mono)',
                      'font-size': '0.9rem',
                      transition: 'all 0.3s ease',
                    }}>{val}</div>
                  );
                })}
              </div>
            </div>
            <div class="info-panel">
              <h3>归并排序 (Merge Sort)</h3>
              <p>将数组分成两半，分别排序后合并。分治思想的经典应用。</p>
              <div class="complexity">
                <div class="complexity-item"><div class="label">时间复杂度</div><div class="value">O(n log n)</div></div>
                <div class="complexity-item"><div class="label">空间复杂度</div><div class="value">O(n)</div></div>
                <div class="complexity-item"><div class="label">稳定性</div><div class="value">稳定</div></div>
              </div>
            </div>
          </div>
        )}

        {activeTab() === 'hanoi' && (
          <div>
            <div class="controls">
              <div class="controls-group">
                <label>圆盘数量</label>
                <input type="range" min="3" max="7" value={disks()} onInput={e => setDisks(parseInt(e.currentTarget.value))} />
                <span>{disks()}</span>
              </div>
              <div class="controls-group">
                <button class="btn" onClick={initHanoi}>初始化</button>
                <button class="btn btn-primary" onClick={runHanoi} disabled={isRunning()}>
                  {isRunning() ? '运行中...' : '开始'}
                </button>
              </div>
            </div>
            <div class="canvas-container" style={{ padding: '2rem', 'min-height': '300px', display: 'flex', 'justify-content': 'center', gap: '2rem' }}>
              {towers().map((tower, ti) => (
                <div style={{ display: 'flex', 'flex-direction': 'column', 'align-items': 'center', gap: '0.5rem' }}>
                  <span style={{ 'font-size': '0.85rem', color: 'var(--text-tertiary)', 'text-transform': 'uppercase', 'letter-spacing': '0.05em' }}>
                    {String.fromCharCode(65 + ti)} 柱
                  </span>
                  <div style={{
                    display: 'flex',
                    'flex-direction': 'column-reverse',
                    'align-items': 'center',
                    gap: '2px',
                    width: '120px',
                    'min-height': '200px',
                    'border-bottom': '4px solid var(--border)',
                    'padding-bottom': '4px',
                  }}>
                    {tower.length === 0 ? (
                      <span style={{ color: 'var(--text-tertiary)', 'font-size': '0.75rem' }}>空</span>
                    ) : tower.map((disk) => (
                      <div style={{
                        height: '24px',
                        width: `${disk * 12 + 20}px`,
                        'max-width': '110px',
                        background: '#1a1a1a',
                        color: '#fff',
                        display: 'flex',
                        'align-items': 'center',
                        'justify-content': 'center',
                        'font-family': 'var(--font-mono)',
                        'font-size': '0.75rem',
                        'border-radius': '2px',
                        transition: 'all 0.3s ease',
                      }}>{disk}</div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div class="info-panel">
              <h3>汉诺塔 (Tower of Hanoi)</h3>
              <p>将 n 个圆盘从一个柱子移动到另一个柱子，每次只能移动一个圆盘，且大盘不能放在小盘上面。</p>
              <div class="complexity">
                <div class="complexity-item"><div class="label">移动次数</div><div class="value">2^n - 1</div></div>
                <div class="complexity-item"><div class="label">时间复杂度</div><div class="value">O(2^n)</div></div>
                <div class="complexity-item"><div class="label">空间复杂度</div><div class="value">O(n)</div></div>
              </div>
            </div>
          </div>
        )}

        {activeTab() === 'fastexp' && (
          <div>
            <div class="controls">
              <div class="controls-group">
                <label>底数</label>
                <input type="number" value={base()} onChange={e => setBase(parseInt(e.currentTarget.value) || 3)} style={{ width: '80px', padding: '0.5rem', border: '1px solid var(--border)' }} />
              </div>
              <div class="controls-group">
                <label>指数</label>
                <input type="number" value={exp()} onChange={e => setExp(parseInt(e.currentTarget.value) || 13)} style={{ width: '80px', padding: '0.5rem', border: '1px solid var(--border)' }} />
              </div>
              <div class="controls-group">
                <button class="btn btn-primary" onClick={runFastExp} disabled={isRunning()}>
                  {isRunning() ? '运行中...' : '计算'}
                </button>
              </div>
            </div>
            <div class="canvas-container" style={{ padding: '2rem', 'min-height': '200px' }}>
              <div style={{ display: 'flex', 'flex-direction': 'column', gap: '1rem', 'align-items': 'center' }}>
                <div style={{ display: 'flex', gap: '2rem', 'align-items': 'center', 'font-size': '1.5rem', 'font-family': 'var(--font-mono)' }}>
                  <span>{base()}<sup>{exp()}</sup> = {expResult() || '?'}</span>
                </div>
                {expSteps().length > 0 && (
                  <div style={{ display: 'flex', 'flex-direction': 'column', gap: '0.5rem', width: '100%', 'max-width': '400px' }}>
                    <h4 style={{ 'font-size': '0.85rem', color: 'var(--text-tertiary)', 'text-transform': 'uppercase', 'letter-spacing': '0.05em', 'margin-bottom': '0.5rem' }}>计算过程</h4>
                    {expSteps().map((step, i) => (
                      <div style={{ display: 'flex', 'align-items': 'center', gap: '1rem', padding: '0.5rem', background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
                        <span style={{ 'font-family': 'var(--font-mono)', 'font-size': '0.85rem', color: 'var(--text-tertiary)', width: '40px' }}>第{i + 1}步</span>
                        <span style={{ 'font-family': 'var(--font-mono)', 'font-size': '0.85rem' }}>bit={step.bit}, current={step.current}, accum={step.accum}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div class="info-panel">
              <h3>快速幂 (Fast Exponentiation)</h3>
              <p>利用指数的二进制表示，通过平方和乘法将时间复杂度从 O(n) 降到 O(log n)。</p>
              <div class="complexity">
                <div class="complexity-item"><div class="label">朴素方法</div><div class="value">O(n)</div></div>
                <div class="complexity-item"><div class="label">快速幂</div><div class="value">O(log n)</div></div>
                <div class="complexity-item"><div class="label">空间复杂度</div><div class="value">O(1)</div></div>
              </div>
            </div>
          </div>
        )}

        <div class="steps-panel">
          <h3>执行步骤</h3>
          <div>
            {steps().length === 0 ? (
              <div class="step-item">选择标签页并点击"开始"查看分治算法执行过程</div>
            ) : (
              steps().map(step => <div class="step-item active">{step}</div>)
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
