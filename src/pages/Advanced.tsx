import { createSignal, onMount } from 'solid-js';
import Dropdown from '../components/Dropdown';

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
                <button class="btn btn-primary" disabled>01背包可视化即将推出</button>
              </div>
            </div>
            <div class="canvas-container" style={{ 'min-height': '300px', display: 'flex', 'align-items': 'center', 'justify-content': 'center' }}>
              <p style={{ color: 'var(--text-secondary)' }}>01背包问题动态规划表即将推出</p>
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
                <button class="btn btn-primary" disabled>最长公共子序列可视化即将推出</button>
              </div>
            </div>
            <div class="canvas-container" style={{ 'min-height': '300px', display: 'flex', 'align-items': 'center', 'justify-content': 'center' }}>
              <p style={{ color: 'var(--text-secondary)' }}>最长公共子序列动态规划表即将推出</p>
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
