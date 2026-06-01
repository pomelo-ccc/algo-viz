import { createSignal } from 'solid-js';
import CodePanel from '../components/CodePanel';

interface BPlusTreeNode {
  keys: number[];
  children: (BPlusTreeNode | null)[];
  isLeaf: boolean;
}

export default function DatabaseAlgorithms() {
  const [activeTab, setActiveTab] = createSignal('bplus');
  const [isRunning, setIsRunning] = createSignal(false);
  const [steps, setSteps] = createSignal<string[]>([]);
  const [speed, setSpeed] = createSignal(50);

  // B+ Tree
  const [bpValues, setBpValues] = createSignal('10,20,5,6,12,30,7,15');
  const [bpResult, setBpResult] = createSignal<string>('');

  // Query Optimization
  const [queryTables, setQueryTables] = createSignal(3);
  const [queryResult, setQueryResult] = createSignal<string>('');

  // Transaction Management
  const [txCount, setTxCount] = createSignal(3);
  const [txResult, setTxResult] = createSignal<string>('');

  const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));
  const addStep = (text: string) => setSteps(prev => [text, ...prev].slice(0, 30));

  // B+ Tree
  const runBPlusTree = async () => {
    if (isRunning()) return;
    setIsRunning(true);
    setSteps([]);
    addStep('B+树: 开始构建');

    const values = bpValues().split(',').map(v => parseInt(v.trim())).filter(v => !isNaN(v));
    addStep(`插入值: ${values.join(', ')}`);
    await sleep(Math.max(1, 101 - speed()) * 5);

    // Simple B+ tree simulation
    const root: BPlusTreeNode = {
      keys: [],
      children: [],
      isLeaf: true,
    };

    for (const value of values) {
      root.keys.push(value);
      root.keys.sort((a, b) => a - b);
      addStep(`插入 ${value}: [${root.keys.join(', ')}]`);
      await sleep(Math.max(1, 101 - speed()) * 3);
    }

    setBpResult(`B+树构建完成: 根节点=[${root.keys.join(', ')}]`);
    addStep('B+树构建完成');
    setIsRunning(false);
  };

  // Query Optimization
  const runQueryOptimization = async () => {
    if (isRunning()) return;
    setIsRunning(true);
    setSteps([]);
    addStep('查询优化: 开始分析');

    const tables = queryTables();
    addStep(`表数量: ${tables}`);
    await sleep(Math.max(1, 101 - speed()) * 5);

    // Generate query plans
    const plans: string[] = [];
    for (let i = 0; i < tables; i++) {
      const cost = Math.floor(Math.random() * 1000) + 100;
      plans.push(`Plan ${i + 1}: cost=${cost}`);
      addStep(`生成查询计划 ${i + 1}: 代价=${cost}`);
      await sleep(Math.max(1, 101 - speed()) * 3);
    }

    // Select best plan
    const bestPlan = plans.reduce((best, current) => {
      const bestCost = parseInt(best.match(/cost=(\d+)!/)?.[1] || '0');
      const currentCost = parseInt(current.match(/cost=(\d+)/)?.[1] || '0');
      return currentCost < bestCost ? current : best;
    });

    setQueryResult(`最优查询计划: ${bestPlan}`);
    addStep(`查询优化完成: ${bestPlan}`);
    setIsRunning(false);
  };

  // Transaction Management
  const runTransaction = async () => {
    if (isRunning()) return;
    setIsRunning(true);
    setSteps([]);
    addStep('事务管理: 开始模拟');

    const transactions = txCount();
    addStep(`事务数量: ${transactions}`);
    await sleep(Math.max(1, 101 - speed()) * 5);

    // Simulate 2PL (Two-Phase Locking)
    const locks: Map<number, string> = new Map();
    for (let i = 0; i < transactions; i++) {
      const lockType = Math.random() > 0.5 ? 'X' : 'S';
      locks.set(i, lockType);
      addStep(`T${i + 1} 获取 ${lockType === 'X' ? '排他' : '共享'}锁`);
      await sleep(Math.max(1, 101 - speed()) * 3);
    }

    // Commit phase
    for (let i = 0; i < transactions; i++) {
      addStep(`T${i + 1} 提交`);
      await sleep(Math.max(1, 101 - speed()) * 3);
    }

    setTxResult(`事务管理完成: ${transactions} 个事务已提交`);
    addStep('事务管理模拟完成');
    setIsRunning(false);
  };

  const tabs = [
    { id: 'bplus', label: 'B+树索引' },
    { id: 'query', label: '查询优化' },
    { id: 'transaction', label: '事务管理' },
  ];

  return (
    <main class="visualization-page">
      <div class="container">
        <div class="visualization-header">
          <h1>数据库算法</h1>
          <p class="description">数据库系统中的经典算法，包括索引、查询优化和事务管理等。</p>
        </div>
        <div style={{ display: 'flex', gap: '0', 'border-bottom': '1px solid var(--border)', 'margin-bottom': '2rem' }}>
          {tabs.map(tab => (
            <div
              class="db-tab"
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

        {activeTab() === 'bplus' && (
          <div>
            <div class="controls">
              <div class="controls-group">
                <label>值</label>
                <input type="text" value={bpValues()} onChange={e => setBpValues(e.currentTarget.value)} style={{ width: '300px', padding: '0.5rem', border: '1px solid var(--border)' }} />
              </div>
              <div class="controls-group">
                <button class="btn btn-primary" onClick={runBPlusTree} disabled={isRunning()}>
                  {isRunning() ? '运行中...' : '构建B+树'}
                </button>
              </div>
            </div>
            <div class="canvas-container" style={{ padding: '2rem', 'min-height': '200px' }}>
              <div style={{ display: 'flex', 'flex-direction': 'column', gap: '1rem', 'align-items': 'center' }}>
                {bpResult() && (
                  <div style={{ padding: '1rem', background: 'var(--bg-secondary)', border: '1px solid var(--border)', 'text-align': 'center', 'font-family': 'var(--font-mono)', 'font-size': '1.25rem' }}>
                    {bpResult()}
                  </div>
                )}
              </div>
            </div>
            <div class="info-panel">
              <h3>B+树索引</h3>
              <p>平衡多路搜索树，所有数据存储在叶子节点，适合范围查询和顺序访问。</p>
              <div class="complexity">
                <div class="complexity-item"><div class="label">查找</div><div class="value">O(log n)</div></div>
                <div class="complexity-item"><div class="label">插入</div><div class="value">O(log n)</div></div>
                <div class="complexity-item"><div class="label">删除</div><div class="value">O(log n)</div></div>
              </div>
            </div>
          </div>
        )}

        {activeTab() === 'query' && (
          <div>
            <div class="controls">
              <div class="controls-group">
                <label>表数</label>
                <input type="number" value={queryTables()} onChange={e => setQueryTables(parseInt(e.currentTarget.value))} style={{ width: '60px', padding: '0.5rem', border: '1px solid var(--border)' }} />
              </div>
              <div class="controls-group">
                <button class="btn btn-primary" onClick={runQueryOptimization} disabled={isRunning()}>
                  {isRunning() ? '运行中...' : '查询优化'}
                </button>
              </div>
            </div>
            <div class="canvas-container" style={{ padding: '2rem', 'min-height': '200px' }}>
              <div style={{ display: 'flex', 'flex-direction': 'column', gap: '1rem', 'align-items': 'center' }}>
                {queryResult() && (
                  <div style={{ padding: '1rem', background: 'var(--bg-secondary)', border: '1px solid var(--border)', 'text-align': 'center', 'font-family': 'var(--font-mono)', 'font-size': '1.25rem' }}>
                    {queryResult()}
                  </div>
                )}
              </div>
            </div>
            <div class="info-panel">
              <h3>查询优化</h3>
              <p>选择最优查询计划，减少查询执行时间和资源消耗。</p>
              <div class="complexity">
                <div class="complexity-item"><div class="label">时间复杂度</div><div class="value">O(n!)</div></div>
                <div class="complexity-item"><div class="label">空间复杂度</div><div class="value">O(n)</div></div>
                <div class="complexity-item"><div class="label">应用</div><div class="value">SQL查询</div></div>
              </div>
            </div>
          </div>
        )}

        {activeTab() === 'transaction' && (
          <div>
            <div class="controls">
              <div class="controls-group">
                <label>事务数</label>
                <input type="number" value={txCount()} onChange={e => setTxCount(parseInt(e.currentTarget.value))} style={{ width: '60px', padding: '0.5rem', border: '1px solid var(--border)' }} />
              </div>
              <div class="controls-group">
                <button class="btn btn-primary" onClick={runTransaction} disabled={isRunning()}>
                  {isRunning() ? '运行中...' : '事务管理'}
                </button>
              </div>
            </div>
            <div class="canvas-container" style={{ padding: '2rem', 'min-height': '200px' }}>
              <div style={{ display: 'flex', 'flex-direction': 'column', gap: '1rem', 'align-items': 'center' }}>
                {txResult() && (
                  <div style={{ padding: '1rem', background: 'var(--bg-secondary)', border: '1px solid var(--border)', 'text-align': 'center', 'font-family': 'var(--font-mono)', 'font-size': '1.25rem' }}>
                    {txResult()}
                  </div>
                )}
              </div>
            </div>
            <div class="info-panel">
              <h3>事务管理</h3>
              <p>通过ACID特性保证数据库事务的正确性和一致性。</p>
              <div class="complexity">
                <div class="complexity-item"><div class="label">时间复杂度</div><div class="value">O(n)</div></div>
                <div class="complexity-item"><div class="label">空间复杂度</div><div class="value">O(n)</div></div>
                <div class="complexity-item"><div class="label">应用</div><div class="value">并发控制</div></div>
              </div>
            </div>
          </div>
        )}

        <div class="steps-panel">
          <h3>执行步骤</h3>
          <div>
            {steps().length === 0 ? (
              <div class="step-item">选择标签页并点击"开始"查看数据库算法执行过程</div>
            ) : (
              steps().map(step => <div class="step-item active">{step}</div>)
            )}
          </div>
        </div>
        <CodePanel category="databasealgorithms" algorithm={activeTab()} />
      </div>
    </main>
  );
}
