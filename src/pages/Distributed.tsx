import { createSignal } from 'solid-js';
import CodePanel from '../components/CodePanel';

export default function Distributed() {
  const [activeTab, setActiveTab] = createSignal('mapreduce');
  const [isRunning, setIsRunning] = createSignal(false);
  const [steps, setSteps] = createSignal<string[]>([]);
  const [speed, setSpeed] = createSignal(50);

  // MapReduce
  const [mrData, setMrData] = createSignal('apple banana apple orange banana apple');
  const [mrResult, setMrResult] = createSignal<Map<string, number>>(new Map());

  // Consistent Hashing
  const [chNodes, setChNodes] = createSignal(3);
  const [chKeys, setChKeys] = createSignal(10);
  const [chResult, setChResult] = createSignal<Map<number, number>>(new Map());

  // Raft
  const [raftNodes, setRaftNodes] = createSignal(5);
  const [raftResult, setRaftResult] = createSignal<string>('');

  const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));
  const addStep = (text: string) => setSteps(prev => [text, ...prev].slice(0, 30));

  // MapReduce
  const runMapReduce = async () => {
    if (isRunning()) return;
    setIsRunning(true);
    setSteps([]);
    addStep('MapReduce: 开始词频统计');

    const data = mrData().split(/\s+/);
    const mapResult: Map<string, number> = new Map();

    addStep(`Map阶段: 将数据拆分为 ${data.length} 个单词`);
    await sleep(Math.max(1, 101 - speed()) * 5);

    for (const word of data) {
      if (word) {
        mapResult.set(word, (mapResult.get(word) || 0) + 1);
        addStep(`Map: ${word} -> 1`);
        await sleep(Math.max(1, 101 - speed()) * 3);
      }
    }

    addStep('Reduce阶段: 合并相同单词的计数');
    await sleep(Math.max(1, 101 - speed()) * 5);

    for (const [word, count] of mapResult.entries()) {
      addStep(`Reduce: ${word} -> ${count}`);
      await sleep(Math.max(1, 101 - speed()) * 3);
    }

    setMrResult(new Map(mapResult));
    addStep('MapReduce完成');
    setIsRunning(false);
  };

  // Consistent Hashing
  const runConsistentHashing = async () => {
    if (isRunning()) return;
    setIsRunning(true);
    setSteps([]);
    addStep('一致性哈希: 初始化虚拟节点');

    const nodes = chNodes();
    const keys = chKeys();
    const hashRing: Map<number, number> = new Map();

    // Create virtual nodes
    const virtualNodes: number[] = [];
    for (let i = 0; i < nodes * 3; i++) {
      virtualNodes.push(Math.floor(Math.random() * 360));
    }
    virtualNodes.sort((a, b) => a - b);

    addStep(`创建 ${nodes * 3} 个虚拟节点`);
    await sleep(Math.max(1, 101 - speed()) * 5);

    // Map keys to nodes
    for (let i = 0; i < keys; i++) {
      const keyHash = Math.floor(Math.random() * 360);
      let node = 0;
      for (let j = 0; j < virtualNodes.length; j++) {
        if (virtualNodes[j] >= keyHash) {
          node = Math.floor(j / 3);
          break;
        }
      }
      hashRing.set(i, node);
      addStep(`Key ${i} (hash=${keyHash}) -> Node ${node}`);
      await sleep(Math.max(1, 101 - speed()) * 3);
    }

    setChResult(new Map(hashRing));
    addStep('一致性哈希完成');
    setIsRunning(false);
  };

  // Raft
  const runRaft = async () => {
    if (isRunning()) return;
    setIsRunning(true);
    setSteps([]);
    addStep('Raft: 开始选举');

    const nodes = raftNodes();
    const votes = new Map<number, number>();
    
    // Election
    addStep(`节点发起选举请求`);
    await sleep(Math.max(1, 101 - speed()) * 5);

    for (let i = 0; i < nodes; i++) {
      votes.set(i, 0);
      addStep(`Node ${i} 投票`);
      await sleep(Math.max(1, 101 - speed()) * 3);
    }

    // Count votes
    let maxVotes = 0;
    let leader = -1;
    for (let i = 0; i < nodes; i++) {
      const voteCount = Math.floor(Math.random() * nodes);
      votes.set(i, voteCount);
      if (voteCount > maxVotes) {
        maxVotes = voteCount;
        leader = i;
      }
      addStep(`Node ${i} 获得 ${voteCount} 票`);
      await sleep(Math.max(1, 101 - speed()) * 3);
    }

    setRaftResult(`Node ${leader} 当选为 Leader`);
    addStep(`Raft选举完成: Node ${leader} 成为 Leader`);
    setIsRunning(false);
  };

  const tabs = [
    { id: 'mapreduce', label: 'MapReduce' },
    { id: 'consistent-hashing', label: '一致性哈希' },
    { id: 'raft', label: 'Raft' },
  ];

  return (
    <main class="visualization-page">
      <div class="container">
        <div class="visualization-header">
          <h1>分布式算法</h1>
          <p class="description">分布式系统中的一致性、共识和计算算法，包括MapReduce、一致性哈希和Raft等经典算法。</p>
        </div>
        <div style={{ display: 'flex', gap: '0', 'border-bottom': '1px solid var(--border)', 'margin-bottom': '2rem' }}>
          {tabs.map(tab => (
            <div
              class="distributed-tab"
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

        {activeTab() === 'mapreduce' && (
          <div>
            <div class="controls">
              <div class="controls-group">
                <label>数据</label>
                <input type="text" value={mrData()} onChange={e => setMrData(e.currentTarget.value)} style={{ width: '300px', padding: '0.5rem', border: '1px solid var(--border)' }} />
              </div>
              <div class="controls-group">
                <button class="btn btn-primary" onClick={runMapReduce} disabled={isRunning()}>
                  {isRunning() ? '运行中...' : '运行MapReduce'}
                </button>
              </div>
            </div>
            <div class="canvas-container" style={{ padding: '2rem', 'min-height': '200px' }}>
              <div style={{ display: 'flex', 'flex-direction': 'column', gap: '1rem', 'align-items': 'center' }}>
                {mrResult().size > 0 && (
                  <div style={{ display: 'flex', 'flex-direction': 'column', gap: '0.5rem', width: '100%', 'max-width': '400px' }}>
                    <h4 style={{ 'font-size': '0.85rem', color: 'var(--text-tertiary)', 'text-transform': 'uppercase', 'letter-spacing': '0.05em', 'margin-bottom': '0.5rem' }}>词频统计</h4>
                    {Array.from(mrResult().entries()).map(([word, count]) => (
                      <div style={{ display: 'flex', 'align-items': 'center', gap: '1rem', padding: '0.5rem', background: 'var(--bg-secondary)', border: '1px solid var(--border)', 'font-family': 'var(--font-mono)', 'font-size': '0.85rem' }}>
                        <span style={{ width: '100px' }}>{word}</span>
                        <span>{count}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div class="info-panel">
              <h3>MapReduce</h3>
              <p>Google提出的分布式计算模型，通过Map和Reduce两个阶段处理大规模数据集。</p>
              <div class="complexity">
                <div class="complexity-item"><div class="label">时间复杂度</div><div class="value">O(n/p + p)</div></div>
                <div class="complexity-item"><div class="label">空间复杂度</div><div class="value">O(n)</div></div>
                <div class="complexity-item"><div class="label">应用</div><div class="value">大数据处理</div></div>
              </div>
            </div>
          </div>
        )}

        {activeTab() === 'consistent-hashing' && (
          <div>
            <div class="controls">
              <div class="controls-group">
                <label>节点数</label>
                <input type="number" value={chNodes()} onChange={e => setChNodes(parseInt(e.currentTarget.value))} style={{ width: '60px', padding: '0.5rem', border: '1px solid var(--border)' }} />
              </div>
              <div class="controls-group">
                <label>Key数</label>
                <input type="number" value={chKeys()} onChange={e => setChKeys(parseInt(e.currentTarget.value))} style={{ width: '60px', padding: '0.5rem', border: '1px solid var(--border)' }} />
              </div>
              <div class="controls-group">
                <button class="btn btn-primary" onClick={runConsistentHashing} disabled={isRunning()}>
                  {isRunning() ? '运行中...' : '运行一致性哈希'}
                </button>
              </div>
            </div>
            <div class="canvas-container" style={{ padding: '2rem', 'min-height': '200px' }}>
              <div style={{ display: 'flex', 'flex-direction': 'column', gap: '1rem', 'align-items': 'center' }}>
                {chResult().size > 0 && (
                  <div style={{ display: 'flex', 'flex-direction': 'column', gap: '0.5rem', width: '100%', 'max-width': '400px' }}>
                    <h4 style={{ 'font-size': '0.85rem', color: 'var(--text-tertiary)', 'text-transform': 'uppercase', 'letter-spacing': '0.05em', 'margin-bottom': '0.5rem' }}>一致性哈希</h4>
                    {Array.from(chResult().entries()).map(([key, node]) => (
                      <div style={{ display: 'flex', 'align-items': 'center', gap: '1rem', padding: '0.5rem', background: 'var(--bg-secondary)', border: '1px solid var(--border)', 'font-family': 'var(--font-mono)', 'font-size': '0.85rem' }}>
                        <span style={{ width: '100px' }}>Key {key}</span>
                        <span>Node {node}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div class="info-panel">
              <h3>一致性哈希</h3>
              <p>一种特殊的哈希算法，当节点数量变化时，只需重新定位少量数据。</p>
              <div class="complexity">
                <div class="complexity-item"><div class="label">时间复杂度</div><div class="value">O(log n)</div></div>
                <div class="complexity-item"><div class="label">空间复杂度</div><div class="value">O(n)</div></div>
                <div class="complexity-item"><div class="label">应用</div><div class="value">负载均衡</div></div>
              </div>
            </div>
          </div>
        )}

        {activeTab() === 'raft' && (
          <div>
            <div class="controls">
              <div class="controls-group">
                <label>节点数</label>
                <input type="number" value={raftNodes()} onChange={e => setRaftNodes(parseInt(e.currentTarget.value))} style={{ width: '60px', padding: '0.5rem', border: '1px solid var(--border)' }} />
              </div>
              <div class="controls-group">
                <button class="btn btn-primary" onClick={runRaft} disabled={isRunning()}>
                  {isRunning() ? '运行中...' : '运行Raft'}
                </button>
              </div>
            </div>
            <div class="canvas-container" style={{ padding: '2rem', 'min-height': '200px' }}>
              <div style={{ display: 'flex', 'flex-direction': 'column', gap: '1rem', 'align-items': 'center' }}>
                {raftResult() && (
                  <div style={{ padding: '1rem', background: 'var(--bg-secondary)', border: '1px solid var(--border)', 'text-align': 'center', 'font-family': 'var(--font-mono)', 'font-size': '1.25rem' }}>
                    {raftResult()}
                  </div>
                )}
              </div>
            </div>
            <div class="info-panel">
              <h3>Raft</h3>
              <p>一种易于理解的分布式共识算法，通过选举Leader来达成共识。</p>
              <div class="complexity">
                <div class="complexity-item"><div class="label">时间复杂度</div><div class="value">O(n)</div></div>
                <div class="complexity-item"><div class="label">空间复杂度</div><div class="value">O(n)</div></div>
                <div class="complexity-item"><div class="label">应用</div><div class="value">分布式共识</div></div>
              </div>
            </div>
          </div>
        )}

        <div class="steps-panel">
          <h3>执行步骤</h3>
          <div>
            {steps().length === 0 ? (
              <div class="step-item">选择标签页并点击"开始"查看分布式算法执行过程</div>
            ) : (
              steps().map(step => <div class="step-item active">{step}</div>)
            )}
          </div>
        </div>
        <CodePanel category="distributed" algorithm={activeTab()} />
      </div>
    </main>
  );
}
