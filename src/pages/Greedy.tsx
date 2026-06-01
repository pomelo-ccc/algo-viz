import { createSignal } from 'solid-js';
import Dropdown from '../components/Dropdown';
import CodePanel from '../components/CodePanel';

interface Activity {
  id: number;
  start: number;
  end: number;
  selected: boolean;
}

export default function Greedy() {
  const [activeTab, setActiveTab] = createSignal('activity');
  const [isRunning, setIsRunning] = createSignal(false);
  const [steps, setSteps] = createSignal<string[]>([]);
  const [speed, setSpeed] = createSignal(50);

  // Activity Selection
  const [activities, setActivities] = createSignal<Activity[]>([
    { id: 1, start: 1, end: 4, selected: false },
    { id: 2, start: 3, end: 5, selected: false },
    { id: 3, start: 0, end: 6, selected: false },
    { id: 4, start: 5, end: 7, selected: false },
    { id: 5, start: 3, end: 8, selected: false },
    { id: 6, start: 5, end: 9, selected: false },
    { id: 7, start: 6, end: 10, selected: false },
    { id: 8, start: 8, end: 11, selected: false },
  ]);

  // Fractional Knapsack
  const [knapsackItems, setKnapsackItems] = createSignal([
    { id: 1, weight: 10, value: 60, ratio: 6, taken: 0 },
    { id: 2, weight: 20, value: 100, ratio: 5, taken: 0 },
    { id: 3, weight: 30, value: 120, ratio: 4, taken: 0 },
  ]);
  const [knapsackCapacity, setKnapsackCapacity] = createSignal(50);
  const [currentValue, setCurrentValue] = createSignal(0);
  const [currentWeight, setCurrentWeight] = createSignal(0);

  // Huffman Coding
  const [huffmanChars, setHuffmanChars] = createSignal([
    { char: 'a', freq: 5, code: '' },
    { char: 'b', freq: 9, code: '' },
    { char: 'c', freq: 12, code: '' },
    { char: 'd', freq: 13, code: '' },
    { char: 'e', freq: 16, code: '' },
    { char: 'f', freq: 45, code: '' },
  ]);

  const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));
  const addStep = (text: string) => setSteps(prev => [text, ...prev].slice(0, 30));

  const resetActivities = () => {
    setActivities(prev => prev.map(a => ({ ...a, selected: false })));
    setSteps([]);
  };

  const runActivitySelection = async () => {
    if (isRunning()) return;
    setIsRunning(true);
    setSteps([]);
    addStep('活动选择问题: 选择最多不重叠的活动');

    const sorted = [...activities()].sort((a, b) => a.end - b.end);
    const selectedIds = new Set<number>();
    let lastEnd = -1;

    for (const activity of sorted) {
      if (!isRunning()) return;
      if (activity.start >= lastEnd) {
        selectedIds.add(activity.id);
        lastEnd = activity.end;
        addStep(`选择活动 ${activity.id}: [${activity.start}, ${activity.end}]`);
        setActivities(prev => prev.map(a => selectedIds.has(a.id) ? { ...a, selected: true } : a));
        await sleep(Math.max(1, 101 - speed()) * 15);
      }
    }

    addStep(`完成: 共选择 ${selectedIds.size} 个活动`);
    setIsRunning(false);
  };

  const runFractionalKnapsack = async () => {
    if (isRunning()) return;
    setIsRunning(true);
    setSteps([]);
    addStep('分数背包问题: 按单位价值贪心选取');

    const items = [...knapsackItems()].sort((a, b) => b.ratio - a.ratio);
    let remaining = knapsackCapacity();
    let totalValue = 0;
    let totalWeight = 0;

    const updated = knapsackItems().map(item => ({ ...item, taken: 0 }));

    for (const item of items) {
      if (!isRunning()) return;
      if (remaining <= 0) break;

      const take = Math.min(item.weight, remaining);
      const itemIdx = updated.findIndex(i => i.id === item.id);
      if (itemIdx >= 0) {
        updated[itemIdx].taken = take;
      }

      remaining -= take;
      totalValue += (take / item.weight) * item.value;
      totalWeight += take;

      addStep(`选取物品 ${item.id}: 重量 ${take}/${item.weight}, 价值 ${(take / item.weight) * item.value}`);
      setKnapsackItems([...updated]);
      setCurrentValue(Math.round(totalValue));
      setCurrentWeight(totalWeight);
      await sleep(Math.max(1, 101 - speed()) * 15);
    }

    addStep(`完成: 总重量 ${totalWeight}, 总价值 ${Math.round(totalValue)}`);
    setIsRunning(false);
  };

  const runHuffmanCoding = async () => {
    if (isRunning()) return;
    setIsRunning(true);
    setSteps([]);
    addStep('哈夫曼编码: 构建前缀树实现最优编码');
    await sleep(500);
    addStep('按频率构建最小堆，每次合并频率最小的两个节点');
    await sleep(500);
    addStep('哈夫曼编码树构建完成（简化演示）');
    setIsRunning(false);
  };

  const tabs = [
    { id: 'activity', label: '活动选择' },
    { id: 'knapsack', label: '分数背包' },
    { id: 'huffman', label: '哈夫曼编码' },
  ];

  return (
    <main class="visualization-page">
      <div class="container">
        <div class="visualization-header">
          <h1>贪心算法</h1>
          <p class="description">贪心算法在每一步选择中都采取当前状态下最好或最优的选择，从而希望导致结果是全局最好或最优的算法。</p>
        </div>
        <div style={{ display: 'flex', gap: '0', 'border-bottom': '1px solid var(--border)', 'margin-bottom': '2rem' }}>
          {tabs.map(tab => (
            <div
              class="greedy-tab"
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

        {activeTab() === 'activity' && (
          <div>
            <div class="controls">
              <div class="controls-group">
                <button class="btn" onClick={resetActivities}>重置</button>
                <button class="btn btn-primary" onClick={runActivitySelection} disabled={isRunning()}>
                  {isRunning() ? '运行中...' : '开始选择'}
                </button>
              </div>
            </div>
            <div class="canvas-container" style={{ padding: '2rem', 'min-height': '300px' }}>
              <div style={{ display: 'flex', 'flex-direction': 'column', gap: '1rem' }}>
                {activities().map(activity => (
                  <div style={{ display: 'flex', 'align-items': 'center', gap: '1rem' }}>
                    <span style={{ width: '80px', 'font-size': '0.85rem', 'font-family': 'var(--font-mono)' }}>
                      活动 {activity.id}
                    </span>
                    <div style={{
                      position: 'relative',
                      height: '32px',
                      'flex-grow': '1',
                      background: 'var(--bg-secondary)',
                      border: '1px solid var(--border)',
                    }}>
                      <div style={{
                        position: 'absolute',
                        left: `${(activity.start / 12) * 100}%`,
                        width: `${((activity.end - activity.start) / 12) * 100}%`,
                        height: '100%',
                        background: activity.selected ? '#1a1a1a' : '#cccccc',
                        transition: 'background 0.3s ease',
                        display: 'flex',
                        'align-items': 'center',
                        'justify-content': 'center',
                        color: activity.selected ? '#fff' : '#1a1a1a',
                        'font-size': '0.75rem',
                        'font-family': 'var(--font-mono)',
                      }}>
                        [{activity.start}, {activity.end}]
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div class="info-panel">
              <h3>活动选择问题</h3>
              <p>给定一组活动，每个活动有开始和结束时间。选择尽可能多的互不重叠的活动。</p>
              <div class="complexity">
                <div class="complexity-item"><div class="label">贪心策略</div><div class="value">优先选择结束时间最早的活动</div></div>
                <div class="complexity-item"><div class="label">时间复杂度</div><div class="value">O(n log n)</div></div>
                <div class="complexity-item"><div class="label">空间复杂度</div><div class="value">O(1)</div></div>
              </div>
            </div>
          </div>
        )}

        {activeTab() === 'knapsack' && (
          <div>
            <div class="controls">
              <div class="controls-group">
                <label>背包容量</label>
                <input type="number" value={knapsackCapacity()} onChange={e => setKnapsackCapacity(parseInt(e.currentTarget.value) || 50)} style={{ width: '80px', padding: '0.5rem', border: '1px solid var(--border)' }} />
              </div>
              <div class="controls-group">
                <span>当前重量: {currentWeight()}</span>
                <span>当前价值: {currentValue()}</span>
              </div>
              <div class="controls-group">
                <button class="btn" onClick={() => { setKnapsackItems(prev => prev.map(i => ({ ...i, taken: 0 }))); setCurrentValue(0); setCurrentWeight(0); setSteps([]); }}>重置</button>
                <button class="btn btn-primary" onClick={runFractionalKnapsack} disabled={isRunning()}>
                  {isRunning() ? '运行中...' : '贪心求解'}
                </button>
              </div>
            </div>
            <div class="canvas-container" style={{ padding: '2rem', 'min-height': '200px' }}>
              <div style={{ display: 'flex', 'flex-direction': 'column', gap: '1.5rem' }}>
                {knapsackItems().map(item => (
                  <div style={{ display: 'flex', 'align-items': 'center', gap: '1rem' }}>
                    <span style={{ width: '80px', 'font-size': '0.85rem' }}>物品 {item.id}</span>
                    <div style={{
                      height: '40px',
                      width: '200px',
                      background: 'var(--bg-secondary)',
                      border: '1px solid var(--border)',
                      position: 'relative',
                      overflow: 'hidden',
                    }}>
                      <div style={{
                        height: '100%',
                        width: `${(item.taken / item.weight) * 100}%`,
                        background: '#1a1a1a',
                        transition: 'width 0.5s ease',
                      }} />
                    </div>
                    <span style={{ 'font-size': '0.8rem', color: 'var(--text-secondary)' }}>
                      重量: {item.weight}, 价值: {item.value}, 单位价值: {item.ratio}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div class="info-panel">
              <h3>分数背包问题</h3>
              <p>给定物品的重量和价值，在背包容量限制下，可以取物品的一部分，求最大总价值。</p>
              <div class="complexity">
                <div class="complexity-item"><div class="label">贪心策略</div><div class="value">按单位价值从高到低选取</div></div>
                <div class="complexity-item"><div class="label">时间复杂度</div><div class="value">O(n log n)</div></div>
                <div class="complexity-item"><div class="label">空间复杂度</div><div class="value">O(1)</div></div>
              </div>
            </div>
          </div>
        )}

        {activeTab() === 'huffman' && (
          <div>
            <div class="controls">
              <div class="controls-group">
                <button class="btn btn-primary" onClick={runHuffmanCoding} disabled={isRunning()}>
                  {isRunning() ? '运行中...' : '构建哈夫曼树'}
                </button>
              </div>
            </div>
            <div class="canvas-container" style={{ padding: '2rem', 'min-height': '200px' }}>
              <div style={{ display: 'flex', gap: '2rem', 'justify-content': 'center', 'flex-wrap': 'wrap' }}>
                {huffmanChars().map(c => (
                  <div style={{
                    display: 'flex',
                    'flex-direction': 'column',
                    'align-items': 'center',
                    gap: '0.5rem',
                    padding: '1.5rem',
                    border: '1px solid var(--border)',
                    'min-width': '80px',
                  }}>
                    <span style={{ 'font-size': '1.5rem', 'font-family': 'var(--font-mono)' }}>{c.char}</span>
                    <span style={{ 'font-size': '0.8rem', color: 'var(--text-secondary)' }}>频率: {c.freq}</span>
                    <span style={{
                      'font-size': '0.75rem',
                      color: 'var(--text-tertiary)',
                      'font-family': 'var(--font-mono)',
                    }}>编码: {c.code || '待生成'}</span>
                  </div>
                ))}
              </div>
            </div>
            <div class="info-panel">
              <h3>哈夫曼编码</h3>
              <p>通过构建最优前缀树，为高频字符分配短编码，低频字符分配长编码，实现数据压缩。</p>
              <div class="complexity">
                <div class="complexity-item"><div class="label">贪心策略</div><div class="value">每次合并频率最小的两个节点</div></div>
                <div class="complexity-item"><div class="label">时间复杂度</div><div class="value">O(n log n)</div></div>
                <div class="complexity-item"><div class="label">空间复杂度</div><div class="value">O(n)</div></div>
              </div>
            </div>
          </div>
        )}

        <div class="steps-panel">
          <h3>执行步骤</h3>
          <div>
            {steps().length === 0 ? (
              <div class="step-item">选择标签页并点击"开始"查看贪心算法执行过程</div>
            ) : (
              steps().map(step => <div class="step-item active">{step}</div>)
            )}
          </div>
        </div>

        <CodePanel category="greedy" algorithm={activeTab()} />
      </div>
    </main>
  );
}
