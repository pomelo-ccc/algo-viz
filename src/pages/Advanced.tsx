import { createSignal, onMount } from 'solid-js';
import Dropdown from '../components/Dropdown';

interface KnapsackItem {
  weight: number;
  value: number;
}

interface LCSCell {
  value: number;
  direction?: 'diag' | 'up' | 'left';
}

export default function Advanced() {
  const [activeTab, setActiveTab] = createSignal('fib');
  const [isRunning, setIsRunning] = createSignal(false);
  const [steps, setSteps] = createSignal<string[]>([]);
  const [speed, setSpeed] = createSignal(50);
  const [fibN, setFibN] = createSignal(10);
  const [fibResult, setFibResult] = createSignal<number[]>([]);

  const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));
  const addStep = (text: string) => setSteps(prev => [text, ...prev].slice(0, 30));

  const runFibonacci = async () => {
    if (isRunning()) return;
    setIsRunning(true);
    setSteps([]);
    const n = fibN();
    const dp = new Array(n + 1).fill(0);
    dp[0] = 0; dp[1] = 1;
    addStep('初始化: dp[0] = 0, dp[1] = 1');
    setFibResult([...dp]);
    await sleep(Math.max(1, 101 - speed()) * 10);
    for (let i = 2; i <= n; i++) {
      if (!isRunning()) return;
      dp[i] = dp[i - 1] + dp[i - 2];
      addStep(`dp[${i}] = dp[${i - 1}] + dp[${i - 2}] = ${dp[i - 1]} + ${dp[i - 2]} = ${dp[i]}`);
      setFibResult([...dp]);
      await sleep(Math.max(1, 101 - speed()) * 10);
    }
    addStep(`斐波那契数列前 ${n} 项完成`);
    setIsRunning(false);
  };

  const [knapsackItems, setKnapsackItems] = createSignal<KnapsackItem[]>([
    { weight: 2, value: 3 },
    { weight: 3, value: 4 },
    { weight: 4, value: 5 },
    { weight: 5, value: 8 },
  ]);
  const [knapsackCapacity, setKnapsackCapacity] = createSignal(8);
  const [knapsackDP, setKnapsackDP] = createSignal<number[][]>([]);
  const [knapsackCurrentCell, setKnapsackCurrentCell] = createSignal<{ row: number; col: number } | null>(null);
  const [knapsackSelected, setKnapsackSelected] = createSignal<number[]>([]);
  const [knapsackInput, setKnapsackInput] = createSignal('2,3,4,3,4,5,5,8,6,10');

  const runKnapsack = async () => {
    if (isRunning()) return;
    setIsRunning(true);
    setSteps([]);
    setKnapsackSelected([]);

    const items = knapsackItems();
    const W = knapsackCapacity();
    const n = items.length;

    const dp: number[][] = Array(n + 1).fill(null).map(() => Array(W + 1).fill(0));
    setKnapsackDP([...dp.map(row => [...row])]);

    addStep(`初始化 ${n} 个物品，背包容量 ${W}`);
    await sleep(Math.max(1, 101 - speed()) * 20);

    for (let i = 1; i <= n; i++) {
      if (!isRunning()) return;
      const w = items[i - 1].weight;
      const v = items[i - 1].value;

      for (let j = 0; j <= W; j++) {
        setKnapsackCurrentCell({ row: i, col: j });
        await sleep(Math.max(1, 101 - speed()) * 5);

        if (w <= j) {
          const notTake = dp[i - 1][j];
          const take = dp[i - 1][j - w] + v;
          dp[i][j] = Math.max(notTake, take);
          if (take > notTake) {
            addStep(`物品 ${i} (价值 ${v}, 重量 ${w}): 取 (总价值 ${take}) > 不取 (${notTake})`);
          }
        } else {
          dp[i][j] = dp[i - 1][j];
        }
        setKnapsackDP([...dp.map(row => [...row])]);
      }
    }

    addStep(`最大价值: ${dp[n][W]}`);
    await sleep(500);

    let w = W;
    const selected: number[] = [];
    for (let i = n; i > 0 && w > 0; i--) {
      if (dp[i][w] !== dp[i - 1][w]) {
        selected.push(i - 1);
        w -= items[i - 1].weight;
        addStep(`选择物品 ${i} (价值 ${items[i - 1].value}, 重量 ${items[i - 1].weight})`);
      }
    }
    setKnapsackSelected(selected);
    setKnapsackCurrentCell(null);
    setIsRunning(false);
  };

  const parseKnapsackInput = () => {
    const values = knapsackInput().split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n) && n > 0);
    const items: KnapsackItem[] = [];
    for (let i = 0; i < values.length - 1; i += 2) {
      items.push({ weight: values[i], value: values[i + 1] });
    }
    if (items.length > 0) setKnapsackItems(items);
    setKnapsackDP([]);
    setKnapsackSelected([]);
    addStep(`已设置 ${items.length} 个物品`);
  };

  const [lcsStr1, setLcsStr1] = createSignal('ABCBDAB');
  const [lcsStr2, setLcsStr2] = createSignal('BDCAB');
  const [lcsDP, setLcsDP] = createSignal<LCSCell[][]>([]);
  const [lcsCurrentCell, setLcsCurrentCell] = createSignal<{ row: number; col: number } | null>(null);
  const [lcsResult, setLcsResult] = createSignal('');

  const runLCS = async () => {
    if (isRunning()) return;
    setIsRunning(true);
    setSteps([]);
    setLcsResult('');

    const s1 = lcsStr1();
    const s2 = lcsStr2();
    const m = s1.length;
    const n = s2.length;

    const dp: LCSCell[][] = Array(m + 1).fill(null).map(() =>
      Array(n + 1).fill(null).map(() => ({ value: 0 }))
    );
    setLcsDP(dp.map(row => row.map(cell => ({ ...cell }))));

    addStep(`字符串1: "${s1}", 字符串2: "${s2}"`);
    await sleep(Math.max(1, 101 - speed()) * 10);

    for (let i = 1; i <= m; i++) {
      if (!isRunning()) return;
      for (let j = 1; j <= n; j++) {
        setLcsCurrentCell({ row: i, col: j });
        await sleep(Math.max(1, 101 - speed()) * 5);

        if (s1[i - 1] === s2[j - 1]) {
          dp[i][j] = { value: dp[i - 1][j - 1].value + 1, direction: 'diag' };
          addStep(`s1[${i - 1}]='${s1[i - 1]}' == s2[${j - 1}]='${s2[j - 1]}': LCS[${i}][${j}] = ${dp[i][j].value}`);
        } else {
          if (dp[i - 1][j].value >= dp[i][j - 1].value) {
            dp[i][j] = { value: dp[i - 1][j].value, direction: 'up' };
          } else {
            dp[i][j] = { value: dp[i][j - 1].value, direction: 'left' };
          }
        }
        setLcsDP(dp.map(row => row.map(cell => ({ ...cell }))));
      }
    }

    addStep(`LCS 长度: ${dp[m][n].value}`);

    let lcs = '';
    let i = m, j = n;
    while (i > 0 && j > 0) {
      if (dp[i][j].direction === 'diag') {
        lcs = s1[i - 1] + lcs;
        i--; j--;
      } else if (dp[i][j].direction === 'up') {
        i--;
      } else {
        j--;
      }
    }
    setLcsResult(lcs);
    addStep(`LCS: "${lcs}"`);
    setLcsCurrentCell(null);
    setIsRunning(false);
  };

  const tabs = [
    { id: 'fib', label: '斐波那契' },
    { id: 'knapsack', label: '01背包' },
    { id: 'lcs', label: '最长公共子序列' },
  ];

  return (
    <main class="visualization-page">
      <div class="container">
        <div class="visualization-header">
          <h1>动态规划</h1>
          <p class="description">动态规划通过将问题分解为子问题并存储子问题的解来避免重复计算。</p>
        </div>
        <div style={{ display: 'flex', gap: '0', 'border-bottom': '1px solid var(--border)', 'margin-bottom': '2rem' }}>
          {tabs.map(tab => (
            <div
              class="dp-tab"
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

        {activeTab() === 'fib' && (
          <div>
            <div class="controls">
              <div class="controls-group">
                <label>项数 n</label>
                <input type="range" min="5" max="20" value={fibN()} onInput={e => setFibN(parseInt(e.currentTarget.value))} />
                <span>{fibN()}</span>
              </div>
              <div class="controls-group">
                <label>速度</label>
                <input type="range" min="1" max="100" value={speed()} onInput={e => setSpeed(parseInt(e.currentTarget.value))} />
              </div>
              <div class="controls-group">
                <button class="btn btn-primary" onClick={runFibonacci} disabled={isRunning()}>
                  {isRunning() ? '运行中...' : '开始计算'}
                </button>
              </div>
            </div>
            <div class="canvas-container" style={{ padding: '2rem', 'min-height': '120px' }}>
              <div style={{ display: 'flex', gap: '0.5rem', 'flex-wrap': 'wrap', 'align-items': 'flex-end', 'justify-content': 'center', 'min-height': '100px' }}>
                {fibResult().map((val, i) => (
                  <div style={{ display: 'flex', 'flex-direction': 'column', 'align-items': 'center', gap: '0.25rem' }}>
                    <span style={{ 'font-size': '0.75rem', color: 'var(--text-secondary)', 'font-family': 'var(--font-mono)' }}>{val}</span>
                    <div style={{
                      width: '30px',
                      background: i === 0 || i === 1 ? '#cccccc' : '#666666',
                      height: `${Math.min(val * 2 + 10, 80)}px`,
                      transition: 'all 0.3s ease',
                    }} />
                    <span style={{ 'font-size': '0.7rem', color: 'var(--text-tertiary)' }}>dp[{i}]</span>
                  </div>
                ))}
              </div>
            </div>
            <div class="info-panel">
              <h3>斐波那契数列</h3>
              <div class="complexity">
                <div class="complexity-item">
                  <div class="label">递推公式</div>
                  <div class="value">dp[i] = dp[i-1] + dp[i-2]</div>
                </div>
                <div class="complexity-item">
                  <div class="label">时间复杂度</div>
                  <div class="value">O(n)</div>
                </div>
                <div class="complexity-item">
                  <div class="label">空间复杂度</div>
                  <div class="value">O(n)</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab() === 'knapsack' && (
          <div>
            <div class="controls">
              <div class="controls-group">
                <label>物品列表 (格式: 重量,价值,重量,价值...)</label>
                <input
                  type="text"
                  value={knapsackInput()}
                  onInput={e => setKnapsackInput(e.currentTarget.value)}
                  style={{ padding: '0.5rem', border: '1px solid var(--border)', width: '200px', 'font-family': 'var(--font-mono)' }}
                />
                <button class="btn" onClick={parseKnapsackInput}>解析</button>
              </div>
              <div class="controls-group">
                <label>背包容量</label>
                <input type="range" min="1" max="20" value={knapsackCapacity()} onInput={e => setKnapsackCapacity(parseInt(e.currentTarget.value))} />
                <span>{knapsackCapacity()}</span>
              </div>
              <div class="controls-group">
                <label>速度</label>
                <input type="range" min="1" max="100" value={speed()} onInput={e => setSpeed(parseInt(e.currentTarget.value))} />
              </div>
              <div class="controls-group">
                <button class="btn btn-primary" onClick={runKnapsack} disabled={isRunning()}>
                  {isRunning() ? '运行中...' : '开始计算'}
                </button>
              </div>
            </div>
            <div class="canvas-container" style={{ padding: '2rem', 'min-height': '200px', overflow: 'auto' }}>
              <div style={{ 'margin-bottom': '1rem' }}>
                <h4 style={{ 'font-size': '0.8rem', color: 'var(--text-tertiary)', 'margin-bottom': '0.5rem' }}>物品列表</h4>
                <div style={{ display: 'flex', gap: '0.5rem', 'flex-wrap': 'wrap' }}>
                  {knapsackItems().map((item, i) => (
                    <div style={{
                      padding: '0.5rem 1rem',
                      background: knapsackSelected().includes(i) ? '#1a1a1a' : '#f5f5f5',
                      color: knapsackSelected().includes(i) ? '#fff' : '#1a1a1a',
                      'font-family': 'var(--font-mono)', 'font-size': '0.85rem',
                      border: '1px solid var(--border)',
                    }}>
                      物品{i + 1}: 重量{item.weight}, 价值{item.value}
                    </div>
                  ))}
                </div>
              </div>
              {knapsackDP().length > 0 && (
                <div style={{ 'margin-top': '1rem', overflow: 'auto' }}>
                  <h4 style={{ 'font-size': '0.8rem', color: 'var(--text-tertiary)', 'margin-bottom': '0.5rem' }}>动态规划表</h4>
                  <div style={{ display: 'flex', 'flex-direction': 'column', gap: '2px', 'align-items': 'flex-start' }}>
                    <div style={{ display: 'flex', gap: '2px' }}>
                      <div style={{ width: '30px', height: '30px', display: 'flex', 'align-items': 'center', 'justify-content': 'center', background: '#f5f5f5', 'font-family': 'var(--font-mono)', 'font-size': '0.75rem' }}></div>
                      {Array.from({ length: knapsackCapacity() + 1 }, (_, i) => (
                        <div style={{ width: '30px', height: '30px', display: 'flex', 'align-items': 'center', 'justify-content': 'center', background: '#f5f5f5', 'font-family': 'var(--font-mono)', 'font-size': '0.7rem', 'font-weight': '500' }}>{i}</div>
                      ))}
                    </div>
                    {knapsackDP().slice(1).map((row, i) => (
                      <div style={{ display: 'flex', gap: '2px' }}>
                        <div style={{ width: '30px', height: '30px', display: 'flex', 'align-items': 'center', 'justify-content': 'center', background: '#f5f5f5', 'font-family': 'var(--font-mono)', 'font-size': '0.7rem', 'font-weight': '500' }}>{knapsackItems()[i]?.weight}</div>
                        {row.slice(1).map((cell, j) => {
                          const current = knapsackCurrentCell();
                          const isCurrent = current && current.row === i + 1 && current.col === j + 1;
                          return (
                            <div style={{
                              width: '30px', height: '30px',
                              display: 'flex', 'align-items': 'center', 'justify-content': 'center',
                              background: isCurrent ? '#1a1a1a' : '#e5e5e5',
                              color: isCurrent ? '#fff' : '#1a1a1a',
                              'font-family': 'var(--font-mono)', 'font-size': '0.8rem',
                              transition: 'all 0.2s ease',
                            }}>{cell}</div>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div class="info-panel">
              <h3>01 背包问题</h3>
              <p>给定 n 个物品，每个物品有重量和价值，在总重量不超过 W 的情况下，求最大价值。</p>
              <div class="complexity">
                <div class="complexity-item">
                  <div class="label">递推公式</div>
                  <div class="value">dp[i][w] = max(dp[i-1][w], dp[i-1][w-wi]+vi)</div>
                </div>
                <div class="complexity-item">
                  <div class="label">时间复杂度</div>
                  <div class="value">O(n * W)</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab() === 'lcs' && (
          <div>
            <div class="controls">
              <div class="controls-group">
                <label>字符串 1</label>
                <input
                  type="text"
                  value={lcsStr1()}
                  onInput={e => { setLcsStr1(e.currentTarget.value); setLcsDP([]); setLcsResult(''); }}
                  style={{ padding: '0.5rem', border: '1px solid var(--border)', width: '150px', 'font-family': 'var(--font-mono)' }}
                />
              </div>
              <div class="controls-group">
                <label>字符串 2</label>
                <input
                  type="text"
                  value={lcsStr2()}
                  onInput={e => { setLcsStr2(e.currentTarget.value); setLcsDP([]); setLcsResult(''); }}
                  style={{ padding: '0.5rem', border: '1px solid var(--border)', width: '150px', 'font-family': 'var(--font-mono)' }}
                />
              </div>
              <div class="controls-group">
                <label>速度</label>
                <input type="range" min="1" max="100" value={speed()} onInput={e => setSpeed(parseInt(e.currentTarget.value))} />
              </div>
              <div class="controls-group">
                <button class="btn btn-primary" onClick={runLCS} disabled={isRunning()}>
                  {isRunning() ? '运行中...' : '开始计算'}
                </button>
              </div>
            </div>
            <div class="canvas-container" style={{ padding: '2rem', 'min-height': '200px', overflow: 'auto' }}>
              {lcsDP().length > 0 && (
                <div>
                  <div style={{ display: 'flex', 'flex-direction': 'column', gap: '2px', 'align-items': 'flex-start' }}>
                    <div style={{ display: 'flex', gap: '2px' }}>
                      <div style={{ width: '30px', height: '30px', display: 'flex', 'align-items': 'center', 'justify-content': 'center', background: '#f5f5f5', 'font-family': 'var(--font-mono)', 'font-size': '0.7rem' }}></div>
                      {lcsStr2().split('').map(char => (
                        <div style={{ width: '30px', height: '30px', display: 'flex', 'align-items': 'center', 'justify-content': 'center', background: '#f5f5f5', 'font-family': 'var(--font-mono)', 'font-size': '0.85rem', 'font-weight': '500' }}>{char}</div>
                      ))}
                    </div>
                    {lcsDP().slice(1).map((row, i) => (
                      <div style={{ display: 'flex', gap: '2px' }}>
                        <div style={{ width: '30px', height: '30px', display: 'flex', 'align-items': 'center', 'justify-content': 'center', background: '#f5f5f5', 'font-family': 'var(--font-mono)', 'font-size': '0.85rem', 'font-weight': '500' }}>{lcsStr1()[i]}</div>
                        {row.slice(1).map((cell, j) => {
                          const current = lcsCurrentCell();
                          const isCurrent = current && current.row === i + 1 && current.col === j + 1;
                          return (
                            <div style={{
                              width: '30px', height: '30px',
                              display: 'flex', 'align-items': 'center', 'justify-content': 'center',
                              background: isCurrent ? '#1a1a1a' : '#e5e5e5',
                              color: isCurrent ? '#fff' : '#1a1a1a',
                              'font-family': 'var(--font-mono)', 'font-size': '0.85rem',
                              transition: 'all 0.2s ease',
                            }}>{cell.value}</div>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                  {lcsResult() && (
                    <div style={{ 'margin-top': '1rem', padding: '1rem', background: '#f5f5f5', border: '1px solid var(--border)' }}>
                      <span style={{ 'font-size': '0.85rem', color: 'var(--text-secondary)' }}>最长公共子序列: </span>
                      <span style={{ 'font-family': 'var(--font-mono)', 'font-size': '1rem', 'font-weight': '500' }}>"{lcsResult()}"</span>
                      <span style={{ 'font-size': '0.85rem', color: 'var(--text-secondary)', 'margin-left': '1rem' }}>(长度: {lcsResult().length})</span>
                    </div>
                  )}
                </div>
              )}
            </div>
            <div class="info-panel">
              <h3>最长公共子序列 (LCS)</h3>
              <p>给定两个序列，找出它们最长的公共子序列的长度。</p>
              <div class="complexity">
                <div class="complexity-item">
                  <div class="label">递推公式</div>
                  <div class="value">dp[i][j] = dp[i-1][j-1]+1 (if match) else max(dp[i-1][j], dp[i][j-1])</div>
                </div>
                <div class="complexity-item">
                  <div class="label">时间复杂度</div>
                  <div class="value">O(m * n)</div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div class="steps-panel">
          <h3>执行步骤</h3>
          <div>
            {steps().length === 0 ? (
              <div class="step-item">点击"开始计算"查看算法执行过程</div>
            ) : (
              steps().map(step => <div class="step-item active">{step}</div>)
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
