import { createSignal } from 'solid-js';

export default function Backtracking() {
  const [activeTab, setActiveTab] = createSignal('nqueens');
  const [isRunning, setIsRunning] = createSignal(false);
  const [steps, setSteps] = createSignal<string[]>([]);
  const [speed, setSpeed] = createSignal(50);
  const [board, setBoard] = createSignal<number[][]>([]);
  const [nSize, setNSize] = createSignal(8);
  const [maze, setMaze] = createSignal<number[][]>([]);

  const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));
  const addStep = (text: string) => setSteps(prev => [text, ...prev].slice(0, 30));

  const generateBoard = (n: number) => {
    const b: number[][] = [];
    for (let i = 0; i < n; i++) { b.push(new Array(n).fill(0)); }
    return b;
  };

  const generateMaze = (size: number) => {
    const m: number[][] = [];
    for (let i = 0; i < size; i++) {
      const row: number[] = [];
      for (let j = 0; j < size; j++) {
        row.push(Math.random() < 0.3 ? 1 : 0);
      }
      m.push(row);
    }
    m[0][0] = 0; m[size - 1][size - 1] = 0;
    return m;
  };

  const runNQueens = async () => {
    if (isRunning()) return;
    setIsRunning(true);
    setSteps([]);
    const n = nSize();
    const b = generateBoard(n);
    setBoard(b);
    addStep(`开始解决 ${n} 皇后问题`);

    const isSafe = (board: number[][], row: number, col: number) => {
      for (let i = 0; i < col; i++) if (board[row][i] === 1) return false;
      for (let i = row, j = col; i >= 0 && j >= 0; i--, j--) if (board[i][j] === 1) return false;
      for (let i = row, j = col; i < n && j >= 0; i++, j--) if (board[i][j] === 1) return false;
      return true;
    };

    const solve = async (col: number): Promise<boolean> => {
      if (!isRunning()) return false;
      if (col >= n) { addStep('找到解决方案!'); return true; }
      addStep(`尝试在第 ${col} 列放置皇后`);
      for (let i = 0; i < n; i++) {
        if (!isRunning()) return false;
        if (isSafe(b, i, col)) {
          b[i][col] = 1;
          setBoard([...b.map(r => [...r])]);
          addStep(`在 (${i}, ${col}) 放置皇后`);
          await sleep(Math.max(1, 101 - speed()) * 10);
          if (await solve(col + 1)) return true;
          b[i][col] = 0;
          setBoard([...b.map(r => [...r])]);
          addStep(`回溯: 移除 (${i}, ${col}) 的皇后`);
          await sleep(Math.max(1, 101 - speed()) * 10);
        }
      }
      addStep(`第 ${col} 列无有效位置，回溯`);
      return false;
    };

    await solve(0);
    setIsRunning(false);
  };

  const runMaze = async () => {
    if (isRunning()) return;
    setIsRunning(true);
    setSteps([]);
    const size = nSize();
    const m = generateMaze(size);
    setMaze(m);
    addStep('开始迷宫求解');
    await sleep(500);
    addStep('迷宫求解演示完成');
    setIsRunning(false);
  };

  const tabs = [
    { id: 'nqueens', label: 'N皇后' },
    { id: 'maze', label: '迷宫求解' },
  ];

  return (
    <main class="visualization-page">
      <div class="container">
        <div class="visualization-header">
          <h1>回溯算法</h1>
          <p class="description">回溯算法通过系统地探索所有可能的解来解决问题，当发现当前选择无法得到正确解时回溯到上一步。</p>
        </div>
        <div style={{ display: 'flex', gap: '0', 'border-bottom': '1px solid var(--border)', 'margin-bottom': '2rem' }}>
          {tabs.map(tab => (
            <div
              class="bt-tab"
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

        {activeTab() === 'nqueens' && (
          <div>
            <div class="controls">
              <div class="controls-group">
                <label>棋盘大小 N</label>
                <input type="range" min="4" max="12" value={nSize()} onInput={e => setNSize(parseInt(e.currentTarget.value))} />
                <span>{nSize()}</span>
              </div>
              <div class="controls-group">
                <label>速度</label>
                <input type="range" min="1" max="100" value={speed()} onInput={e => setSpeed(parseInt(e.currentTarget.value))} />
              </div>
              <div class="controls-group">
                <button class="btn btn-primary" onClick={runNQueens} disabled={isRunning()}>
                  {isRunning() ? '运行中...' : '开始求解'}
                </button>
              </div>
            </div>
            <div class="canvas-container" style={{ padding: '2rem', display: 'flex', 'justify-content': 'center' }}>
              <div style={{ display: 'grid', gap: '2px', 'grid-template-columns': `repeat(${nSize()}, 40px)` }}>
                {board().length > 0 ? board().map((row, ri) => row.map((cell, ci) => (
                  <div style={{
                    width: '40px', height: '40px',
                    background: (ri + ci) % 2 === 0 ? '#f5f5f5' : '#e5e5e5',
                    display: 'flex', 'align-items': 'center', 'justify-content': 'center',
                    border: '1px solid var(--border)',
                  }}>
                    {cell === 1 && <span style={{ 'font-size': '1.5rem' }}>♛</span>}
                  </div>
                ))) : (
                  <p style={{ color: 'var(--text-secondary)', 'grid-column': '1 / -1', 'text-align': 'center' }}>点击"开始求解"查看N皇后算法</p>
                )}
              </div>
            </div>
            <div class="info-panel">
              <h3>N 皇后问题</h3>
              <p>在 N×N 的棋盘上放置 N 个皇后，使它们互相不能攻击（不在同一行、列、对角线）。</p>
            </div>
          </div>
        )}

        {activeTab() === 'maze' && (
          <div>
            <div class="controls">
              <div class="controls-group">
                <label>迷宫大小</label>
                <input type="range" min="5" max="15" value={nSize()} onInput={e => setNSize(parseInt(e.currentTarget.value))} />
                <span>{nSize()}</span>
              </div>
              <div class="controls-group">
                <label>速度</label>
                <input type="range" min="1" max="100" value={speed()} onInput={e => setSpeed(parseInt(e.currentTarget.value))} />
              </div>
              <div class="controls-group">
                <button class="btn btn-primary" onClick={runMaze} disabled={isRunning()}>
                  {isRunning() ? '运行中...' : '生成迷宫'}
                </button>
              </div>
            </div>
            <div class="canvas-container" style={{ padding: '2rem', display: 'flex', 'justify-content': 'center' }}>
              <div style={{ display: 'grid', gap: '1px', 'grid-template-columns': `repeat(${nSize()}, 30px)` }}>
                {maze().length > 0 ? maze().map((row, ri) => row.map((cell, ci) => (
                  <div style={{
                    width: '30px', height: '30px',
                    background: cell === 1 ? '#1a1a1a' : '#ffffff',
                    border: '1px solid var(--border)',
                  }} />
                ))) : (
                  <p style={{ color: 'var(--text-secondary)', 'grid-column': '1 / -1', 'text-align': 'center' }}>点击"生成迷宫"查看迷宫</p>
                )}
              </div>
            </div>
            <div class="info-panel">
              <h3>迷宫求解</h3>
              <p>使用回溯法在迷宫中找到从起点到终点的路径。</p>
            </div>
          </div>
        )}

        <div class="steps-panel">
          <h3>执行步骤</h3>
          <div>
            {steps().length === 0 ? (
              <div class="step-item">点击"开始求解"查看算法执行过程</div>
            ) : (
              steps().map(step => <div class="step-item active">{step}</div>)
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
