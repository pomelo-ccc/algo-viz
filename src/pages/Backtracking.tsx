import { createSignal, onMount, onCleanup } from 'solid-js';
import ControlPanel from '../components/ControlPanel';
import { AnimationController, type AnimStep } from '../utils/animation';

interface QueensState {
  board: number[][];
  currentRow: number;
  currentCol: number;
  isBacktracking: boolean;
  isInvalid: boolean;
  queensCount: number;
}

export default function Backtracking() {
  const [activeTab, setActiveTab] = createSignal('nqueens');
  const [isRunning, setIsRunning] = createSignal(false);
  const [steps, setSteps] = createSignal<string[]>([]);
  const [speed, setSpeed] = createSignal(50);
  const [nSize, setNSize] = createSignal(8);
  const [maze, setMaze] = createSignal<number[][]>([]);
  const [currentStep, setCurrentStep] = createSignal(-1);
  const [totalSteps, setTotalSteps] = createSignal(0);
  const [queensState, setQueensState] = createSignal<QueensState>({
    board: [],
    currentRow: -1,
    currentCol: -1,
    isBacktracking: false,
    isInvalid: false,
    queensCount: 0,
  });
  let controller: AnimationController<QueensState>;

  const generateBoard = (n: number): number[][] => {
    return Array.from({ length: n }, () => new Array(n).fill(0));
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

  onMount(() => {
    controller = new AnimationController<QueensState>({ speed: speed() });
    controller.setCallbacks(
      (step: AnimStep<QueensState>) => {
        setQueensState(step.state);
        setSteps(prev => [step.description, ...prev].slice(0, 30));
      },
      (s, index, total) => {
        setCurrentStep(index);
        setTotalSteps(total);
      }
    );

    const handleKeydown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;
      if (e.key === ' ' || e.key === 'Space') {
        e.preventDefault();
        if (isRunning()) pause();
        else play();
      }
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        controller.stepBackward();
      }
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        controller.stepForward();
      }
      if (e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        reset();
      }
    };
    window.addEventListener('keydown', handleKeydown);

    onCleanup(() => {
      controller.destroy();
      window.removeEventListener('keydown', handleKeydown);
    });

    reset();
  });

  const buildQueensSteps = (n: number): AnimStep<QueensState>[] => {
    const steps: AnimStep<QueensState>[] = [];
    const board = generateBoard(n);
    let queensCount = 0;

    steps.push({
      state: { board: board.map(r => [...r]), currentRow: -1, currentCol: -1, isBacktracking: false, isInvalid: false, queensCount: 0 },
      description: `开始求解 ${n} 皇后问题`,
    });

    const isSafe = (b: number[][], row: number, col: number): boolean => {
      for (let i = 0; i < col; i++) if (b[row][i] === 1) return false;
      for (let i = row, j = col; i >= 0 && j >= 0; i--, j--) if (b[i][j] === 1) return false;
      for (let i = row, j = col; i < n && j >= 0; i++, j--) if (b[i][j] === 1) return false;
      return true;
    };

    const solve = (col: number): boolean => {
      if (col >= n) {
        steps.push({
          state: { board: board.map(r => [...r]), currentRow: -1, currentCol: -1, isBacktracking: false, isInvalid: false, queensCount },
          description: '找到解决方案！',
        });
        return true;
      }

      steps.push({
        state: { board: board.map(r => [...r]), currentRow: -1, currentCol: col, isBacktracking: false, isInvalid: false, queensCount },
        description: `尝试在第 ${col} 列放置皇后`,
      });

      for (let i = 0; i < n; i++) {
        const safe = isSafe(board, i, col);

        steps.push({
          state: { board: board.map(r => [...r]), currentRow: i, currentCol: col, isBacktracking: false, isInvalid: !safe, queensCount },
          description: safe ? `检查 (${i}, ${col}): 位置安全` : `检查 (${i}, ${col}): 位置冲突`,
        });

        if (safe) {
          board[i][col] = 1;
          queensCount++;
          steps.push({
            state: { board: board.map(r => [...r]), currentRow: i, currentCol: col, isBacktracking: false, isInvalid: false, queensCount },
            description: `在 (${i}, ${col}) 放置皇后`,
          });

          if (solve(col + 1)) return true;

          board[i][col] = 0;
          queensCount--;
          steps.push({
            state: { board: board.map(r => [...r]), currentRow: i, currentCol: col, isBacktracking: true, isInvalid: false, queensCount },
            description: `回溯: 移除 (${i}, ${col}) 的皇后`,
          });
        }
      }

      steps.push({
        state: { board: board.map(r => [...r]), currentRow: -1, currentCol: col, isBacktracking: true, isInvalid: false, queensCount },
        description: `第 ${col} 列无有效位置, 回溯`,
      });
      return false;
    };

    solve(0);

    if (queensCount < n) {
      steps.push({
        state: { board: board.map(r => [...r]), currentRow: -1, currentCol: -1, isBacktracking: false, isInvalid: false, queensCount },
        description: '未找到解决方案',
      });
    }

    return steps;
  };

  const start = () => {
    if (isRunning()) return;
    setIsRunning(true);
    setSteps([]);

    const animSteps = buildQueensSteps(nSize());
    controller.setSteps(animSteps);
    controller.setSpeed(speed());
    controller.play().then(() => {
      setIsRunning(false);
      setSteps(prev => ['求解完成', ...prev]);
    });
  };

  const play = () => {
    if (controller.isAtEnd() || controller.isEmpty()) {
      start();
    } else {
      setIsRunning(true);
      controller.play().then(() => setIsRunning(false));
    }
  };

  const pause = () => {
    controller.pause();
    setIsRunning(false);
  };

  const reset = () => {
    controller.pause();
    setIsRunning(false);
    const n = nSize();
    const newBoard = generateBoard(n);
    setQueensState({
      board: newBoard,
      currentRow: -1,
      currentCol: -1,
      isBacktracking: false,
      isInvalid: false,
      queensCount: 0,
    });
    setSteps([]);
    setCurrentStep(-1);
    setTotalSteps(0);
    if (activeTab() === 'maze') {
      setMaze(generateMaze(n));
    }
  };

  const handleStepForward = () => { if (!isRunning()) controller.stepForward(); };
  const handleStepBackward = () => { if (!isRunning()) controller.stepBackward(); };
  const handleSpeedChange = (newSpeed: number) => { setSpeed(newSpeed); controller.setSpeed(newSpeed); };

  const runMaze = () => {
    setMaze(generateMaze(nSize()));
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
              onClick={() => { setActiveTab(tab.id); reset(); }}
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
                <input type="range" min="4" max="12" value={nSize()} onInput={e => { setNSize(parseInt(e.currentTarget.value)); reset(); }} />
                <span>{nSize()}</span>
              </div>
            </div>
            <div class="canvas-container canvas-container-enhanced" style={{ padding: '2rem', display: 'flex', 'justify-content': 'center' }}>
              <div style={{ display: 'grid', gap: '4px', 'grid-template-columns': `repeat(${nSize()}, 44px)` }}>
                {queensState().board.length > 0 ? queensState().board.map((row, ri) => row.map((cell, ci) => {
                  const isCurrent = ri === queensState().currentRow && ci === queensState().currentCol;
                  const hasQueen = cell === 1;
                  let bgColor = (ri + ci) % 2 === 0 ? '#f5f5f5' : '#e5e5e5';
                  if (isCurrent) {
                    if (queensState().isInvalid) {
                      bgColor = '#ffebee';
                    } else if (queensState().isBacktracking) {
                      bgColor = '#fff3e0';
                    } else {
                      bgColor = '#e8f5e9';
                    }
                  }
                  return (
                    <div style={{
                      width: '44px', height: '44px',
                      background: bgColor,
                      display: 'flex', 'align-items': 'center', 'justify-content': 'center',
                      border: isCurrent ? '2px solid #1a1a1a' : '1px solid var(--border)',
                      'box-shadow': isCurrent ? '0 0 12px rgba(0, 0, 0, 0.2)' : 'none',
                      transition: 'all 0.2s ease',
                    }}>
                      {hasQueen && <span style={{ 'font-size': '1.5rem' }}>♛</span>}
                    </div>
                  );
                })) : null}
              </div>
            </div>
            <ControlPanel
              isRunning={isRunning()}
              speed={speed()}
              currentStep={currentStep()}
              totalSteps={totalSteps()}
              onPlay={play}
              onPause={pause}
              onReset={reset}
              onStepForward={handleStepForward}
              onStepBackward={handleStepBackward}
              onSpeedChange={handleSpeedChange}
              onGenerate={reset}
            />
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
                <input type="range" min="5" max="15" value={nSize()} onInput={e => { setNSize(parseInt(e.currentTarget.value)); reset(); }} />
                <span>{nSize()}</span>
              </div>
              <div class="controls-group">
                <button class="btn btn-primary" onClick={runMaze}>生成迷宫</button>
              </div>
            </div>
            <div class="canvas-container canvas-container-enhanced" style={{ padding: '2rem', display: 'flex', 'justify-content': 'center' }}>
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
              <div class="step-item">点击播放按钮开始算法可视化</div>
            ) : (
              steps().map(step => <div class="step-item active">{step}</div>)
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
