import { createSignal } from 'solid-js';
import CodePanel from '../components/CodePanel';

export default function GameAlgorithms() {
  const [activeTab, setActiveTab] = createSignal('minimax');
  const [isRunning, setIsRunning] = createSignal(false);
  const [steps, setSteps] = createSignal<string[]>([]);
  const [speed, setSpeed] = createSignal(50);

  // Minimax
  const [minimaxDepth, setMinimaxDepth] = createSignal(3);
  const [minimaxResult, setMinimaxResult] = createSignal<string>('');

  // Alpha-Beta
  const [alphaBetaDepth, setAlphaBetaDepth] = createSignal(3);
  const [alphaBetaResult, setAlphaBetaResult] = createSignal<string>('');

  // Monte Carlo Tree Search
  const [mctsIterations, setMctsIterations] = createSignal(1000);
  const [mctsResult, setMctsResult] = createSignal<string>('');

  const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));
  const addStep = (text: string) => setSteps(prev => [text, ...prev].slice(0, 30));

  // Minimax
  const runMinimax = async () => {
    if (isRunning()) return;
    setIsRunning(true);
    setSteps([]);
    addStep('Minimax: 开始搜索');

    const depth = minimaxDepth();
    
    // Simple minimax on a binary tree
    const minimax = (node: number, depth: number, isMaximizing: boolean): number => {
      if (depth === 0) {
        return Math.floor(Math.random() * 10) - 5;
      }
      
      if (isMaximizing) {
        let maxEval = -Infinity;
        for (let i = 0; i < 2; i++) {
          const evalValue = minimax(node * 2 + i, depth - 1, false);
          maxEval = Math.max(maxEval, evalValue);
          addStep(`Max节点: 评估子节点 ${node * 2 + i} = ${evalValue}`);
        }
        return maxEval;
      } else {
        let minEval = Infinity;
        for (let i = 0; i < 2; i++) {
          const evalValue = minimax(node * 2 + i, depth - 1, true);
          minEval = Math.min(minEval, evalValue);
          addStep(`Min节点: 评估子节点 ${node * 2 + i} = ${evalValue}`);
        }
        return minEval;
      }
    };

    const result = minimax(0, depth, true);
    setMinimaxResult(`Minimax值: ${result}`);
    addStep(`Minimax搜索完成: ${minimaxResult()}`);
    setIsRunning(false);
  };

  // Alpha-Beta
  const runAlphaBeta = async () => {
    if (isRunning()) return;
    setIsRunning(true);
    setSteps([]);
    addStep('Alpha-Beta: 开始搜索');

    const depth = alphaBetaDepth();
    
    // Alpha-Beta pruning
    const alphaBeta = (node: number, depth: number, alpha: number, beta: number, isMaximizing: boolean): number => {
      if (depth === 0) {
        return Math.floor(Math.random() * 10) - 5;
      }
      
      if (isMaximizing) {
        let maxEval = -Infinity;
        for (let i = 0; i < 2; i++) {
          const evalValue = alphaBeta(node * 2 + i, depth - 1, alpha, beta, false);
          maxEval = Math.max(maxEval, evalValue);
          alpha = Math.max(alpha, evalValue);
          addStep(`Alpha-Beta Max: alpha=${alpha}, beta=${beta}, eval=${evalValue}`);
          if (beta <= alpha) {
            addStep(`剪枝: beta(${beta}) <= alpha(${alpha})`);
            break;
          }
        }
        return maxEval;
      } else {
        let minEval = Infinity;
        for (let i = 0; i < 2; i++) {
          const evalValue = alphaBeta(node * 2 + i, depth - 1, alpha, beta, true);
          minEval = Math.min(minEval, evalValue);
          beta = Math.min(beta, evalValue);
          addStep(`Alpha-Beta Min: alpha=${alpha}, beta=${beta}, eval=${evalValue}`);
          if (beta <= alpha) {
            addStep(`剪枝: beta(${beta}) <= alpha(${alpha})`);
            break;
          }
        }
        return minEval;
      }
    };

    const result = alphaBeta(0, depth, -Infinity, Infinity, true);
    setAlphaBetaResult(`Alpha-Beta值: ${result}`);
    addStep(`Alpha-Beta搜索完成: ${alphaBetaResult()}`);
    setIsRunning(false);
  };

  // Monte Carlo Tree Search
  const runMCTS = async () => {
    if (isRunning()) return;
    setIsRunning(true);
    setSteps([]);
    addStep('MCTS: 开始模拟');

    const iterations = mctsIterations();
    let wins = 0;
    let total = 0;

    for (let i = 0; i < iterations; i++) {
      // Simulate a random game
      const result = Math.random() > 0.5 ? 1 : 0;
      wins += result;
      total++;
      
      if (i % 100 === 0) {
        addStep(`MCTS: 第${i}次模拟, 胜率=${(wins / total * 100).toFixed(2)}%`);
        await sleep(Math.max(1, 101 - speed()) * 2);
      }
    }

    const winRate = (wins / total * 100).toFixed(2);
    setMctsResult(`MCTS胜率: ${winRate}% (${wins}/${total})`);
    addStep(`MCTS模拟完成: ${mctsResult()}`);
    setIsRunning(false);
  };

  const tabs = [
    { id: 'minimax', label: 'Minimax' },
    { id: 'alpha-beta', label: 'Alpha-Beta剪枝' },
    { id: 'mcts', label: '蒙特卡洛树搜索' },
  ];

  return (
    <main class="visualization-page">
      <div class="container">
        <div class="visualization-header">
          <h1>游戏算法</h1>
          <p class="description">游戏AI中的经典算法，包括Minimax、Alpha-Beta剪枝和蒙特卡洛树搜索等。</p>
        </div>
        <div style={{ display: 'flex', gap: '0', 'border-bottom': '1px solid var(--border)', 'margin-bottom': '2rem' }}>
          {tabs.map(tab => (
            <div
              class="game-tab"
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

        {activeTab() === 'minimax' && (
          <div>
            <div class="controls">
              <div class="controls-group">
                <label>搜索深度</label>
                <input type="number" value={minimaxDepth()} onChange={e => setMinimaxDepth(parseInt(e.currentTarget.value))} style={{ width: '60px', padding: '0.5rem', border: '1px solid var(--border)' }} />
              </div>
              <div class="controls-group">
                <button class="btn btn-primary" onClick={runMinimax} disabled={isRunning()}>
                  {isRunning() ? '运行中...' : '运行Minimax'}
                </button>
              </div>
            </div>
            <div class="canvas-container" style={{ padding: '2rem', 'min-height': '200px' }}>
              <div style={{ display: 'flex', 'flex-direction': 'column', gap: '1rem', 'align-items': 'center' }}>
                {minimaxResult() && (
                  <div style={{ padding: '1rem', background: 'var(--bg-secondary)', border: '1px solid var(--border)', 'text-align': 'center', 'font-family': 'var(--font-mono)', 'font-size': '1.25rem' }}>
                    {minimaxResult()}
                  </div>
                )}
              </div>
            </div>
            <div class="info-panel">
              <h3>Minimax</h3>
              <p>在零和博弈中，假设对手会选择最优策略，通过递归搜索找到最优解。</p>
              <div class="complexity">
                <div class="complexity-item"><div class="label">时间复杂度</div><div class="value">O(b^d)</div></div>
                <div class="complexity-item"><div class="label">空间复杂度</div><div class="value">O(bd)</div></div>
                <div class="complexity-item"><div class="label">应用</div><div class="value">博弈树搜索</div></div>
              </div>
            </div>
          </div>
        )}

        {activeTab() === 'alpha-beta' && (
          <div>
            <div class="controls">
              <div class="controls-group">
                <label>搜索深度</label>
                <input type="number" value={alphaBetaDepth()} onChange={e => setAlphaBetaDepth(parseInt(e.currentTarget.value))} style={{ width: '60px', padding: '0.5rem', border: '1px solid var(--border)' }} />
              </div>
              <div class="controls-group">
                <button class="btn btn-primary" onClick={runAlphaBeta} disabled={isRunning()}>
                  {isRunning() ? '运行中...' : '运行Alpha-Beta'}
                </button>
              </div>
            </div>
            <div class="canvas-container" style={{ padding: '2rem', 'min-height': '200px' }}>
              <div style={{ display: 'flex', 'flex-direction': 'column', gap: '1rem', 'align-items': 'center' }}>
                {alphaBetaResult() && (
                  <div style={{ padding: '1rem', background: 'var(--bg-secondary)', border: '1px solid var(--border)', 'text-align': 'center', 'font-family': 'var(--font-mono)', 'font-size': '1.25rem' }}>
                    {alphaBetaResult()}
                  </div>
                )}
              </div>
            </div>
            <div class="info-panel">
              <h3>Alpha-Beta剪枝</h3>
              <p>在Minimax基础上引入剪枝策略，减少不必要的搜索节点，提高效率。</p>
              <div class="complexity">
                <div class="complexity-item"><div class="label">时间复杂度</div><div class="value">O(b^(d/2))</div></div>
                <div class="complexity-item"><div class="label">空间复杂度</div><div class="value">O(bd)</div></div>
                <div class="complexity-item"><div class="label">应用</div><div class="value">博弈树搜索</div></div>
              </div>
            </div>
          </div>
        )}

        {activeTab() === 'mcts' && (
          <div>
            <div class="controls">
              <div class="controls-group">
                <label>模拟次数</label>
                <input type="number" value={mctsIterations()} onChange={e => setMctsIterations(parseInt(e.currentTarget.value))} style={{ width: '60px', padding: '0.5rem', border: '1px solid var(--border)' }} />
              </div>
              <div class="controls-group">
                <button class="btn btn-primary" onClick={runMCTS} disabled={isRunning()}>
                  {isRunning() ? '运行中...' : '运行MCTS'}
                </button>
              </div>
            </div>
            <div class="canvas-container" style={{ padding: '2rem', 'min-height': '200px' }}>
              <div style={{ display: 'flex', 'flex-direction': 'column', gap: '1rem', 'align-items': 'center' }}>
                {mctsResult() && (
                  <div style={{ padding: '1rem', background: 'var(--bg-secondary)', border: '1px solid var(--border)', 'text-align': 'center', 'font-family': 'var(--font-mono)', 'font-size': '1.25rem' }}>
                    {mctsResult()}
                  </div>
                )}
              </div>
            </div>
            <div class="info-panel">
              <h3>蒙特卡洛树搜索</h3>
              <p>通过随机模拟来评估局面，结合树搜索找到最优策略。</p>
              <div class="complexity">
                <div class="complexity-item"><div class="label">时间复杂度</div><div class="value">O(n)</div></div>
                <div class="complexity-item"><div class="label">空间复杂度</div><div class="value">O(n)</div></div>
                <div class="complexity-item"><div class="label">应用</div><div class="value">围棋、象棋</div></div>
              </div>
            </div>
          </div>
        )}

        <div class="steps-panel">
          <h3>执行步骤</h3>
          <div>
            {steps().length === 0 ? (
              <div class="step-item">选择标签页并点击"开始"查看游戏算法执行过程</div>
            ) : (
              steps().map(step => <div class="step-item active">{step}</div>)
            )}
          </div>
        </div>
        <CodePanel category="gamealgorithms" algorithm={activeTab()} />
      </div>
    </main>
  );
}
