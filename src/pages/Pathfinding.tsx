import { createSignal, onMount, onCleanup } from 'solid-js';
import Dropdown from '../components/Dropdown';
import ControlPanel from '../components/ControlPanel';
import { AnimationController, type AnimStep } from '../utils/animation';

interface Cell {
  row: number;
  col: number;
  isWall: boolean;
  isStart: boolean;
  isEnd: boolean;
  isVisited: boolean;
  isPath: boolean;
  isCurrent?: boolean;
  isInOpenSet?: boolean;
}

interface PathStep {
  grid: Cell[][];
  description: string;
  current?: { row: number; col: number };
  visited?: { row: number; col: number };
  path?: { row: number; col: number }[];
}

export default function Pathfinding() {
  let canvasRef: HTMLCanvasElement;
  let ctxRef: CanvasRenderingContext2D;
  let controller: AnimationController<Cell[][]>;
  let animationId: number | null = null;

  const [gridSize, setGridSize] = createSignal(15);
  const [isRunning, setIsRunning] = createSignal(false);
  const [steps, setSteps] = createSignal<string[]>([]);
  const [grid, setGrid] = createSignal<Cell[][]>([]);
  const [speed, setSpeed] = createSignal(50);
  const [algorithm, setAlgorithm] = createSignal('astar');
  const [currentStep, setCurrentStep] = createSignal(-1);
  const [totalSteps, setTotalSteps] = createSignal(0);

  const createGrid = (size: number): Cell[][] => {
    const g: Cell[][] = [];
    for (let r = 0; r < size; r++) {
      const row: Cell[] = [];
      for (let c = 0; c < size; c++) {
        row.push({
          row: r, col: c,
          isWall: Math.random() < 0.28 && !(r === 0 && c === 0) && !(r === size - 1 && c === size - 1),
          isStart: r === 0 && c === 0,
          isEnd: r === size - 1 && c === size - 1,
          isVisited: false,
          isPath: false,
        });
      }
      g.push(row);
    }
    return g;
  };

  onMount(() => {
    setupCanvas();
    const g = createGrid(gridSize());
    setGrid(g);
    drawGrid(g);

    controller = new AnimationController<Cell[][]>({ speed: speed() });
    controller.setCallbacks(
      (step: AnimStep<Cell[][]>) => {
        setGrid(step.state);
        drawGrid(step.state, (step as any).current);
        setSteps(prev => [step.description, ...prev].slice(0, 30));
      },
      (state, index, total) => {
        setCurrentStep(index);
        setTotalSteps(total);
      }
    );

    const handleKeydown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;

      if (e.key === ' ' || e.key === 'Space') {
        e.preventDefault();
        if (isRunning()) pausePathfinding();
        else playPathfinding();
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
        resetPathfinding();
      }
    };
    window.addEventListener('keydown', handleKeydown);

    const handleResize = () => {
      setupCanvas();
      drawGrid(grid());
    };
    window.addEventListener('resize', handleResize);

    onCleanup(() => {
      controller.destroy();
      window.removeEventListener('keydown', handleKeydown);
      window.removeEventListener('resize', handleResize);
    });
  });

  const setupCanvas = () => {
    if (!canvasRef) return;
    ctxRef = canvasRef.getContext('2d')!;
    const dpr = window.devicePixelRatio || 1;
    const rect = canvasRef.getBoundingClientRect();
    canvasRef.width = rect.width * dpr;
    canvasRef.height = rect.height * dpr;
    ctxRef.scale(dpr, dpr);
  };

  const drawGrid = (g: Cell[][], current?: { row: number; col: number }) => {
    if (!ctxRef || g.length === 0) return;
    const canvas = canvasRef;
    const ctx = ctxRef;
    const size = g.length;
    const cellSize = Math.min(canvas.width, canvas.height) / size;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        const cell = g[r][c];
        const x = c * cellSize;
        const y = r * cellSize;

        let color = '#ffffff';
        let glow = false;

        if (cell.isWall) {
          color = '#1a1a1a';
        } else if (cell.isPath) {
          color = '#444444';
          glow = true;
        } else if (cell.isEnd) {
          color = '#666666';
          glow = true;
        } else if (cell.isStart) {
          color = '#333333';
          glow = true;
        } else if (current && current.row === r && current.col === c) {
          color = '#1a1a1a';
          glow = true;
        } else if (cell.isVisited) {
          color = '#e5e5e5';
        }

        if (glow) {
          ctx.shadowColor = color;
          ctx.shadowBlur = 8;
        } else {
          ctx.shadowBlur = 0;
        }

        ctx.fillStyle = color;
        const pad = 1;
        ctx.beginPath();
        const radius = Math.min(3, (cellSize - pad * 2) / 3);
        ctx.moveTo(x + pad + radius, y + pad);
        ctx.lineTo(x + cellSize - pad - radius, y + pad);
        ctx.quadraticCurveTo(x + cellSize - pad, y + pad, x + cellSize - pad, y + pad + radius);
        ctx.lineTo(x + cellSize - pad, y + cellSize - pad - radius);
        ctx.quadraticCurveTo(x + cellSize - pad, y + cellSize - pad, x + cellSize - pad - radius, y + cellSize - pad);
        ctx.lineTo(x + pad + radius, y + cellSize - pad);
        ctx.quadraticCurveTo(x + pad, y + cellSize - pad, x + pad, y + cellSize - pad - radius);
        ctx.lineTo(x + pad, y + pad + radius);
        ctx.quadraticCurveTo(x + pad, y + pad, x + pad + radius, y + pad);
        ctx.closePath();
        ctx.fill();

        ctx.shadowBlur = 0;

        if (cell.isStart || cell.isEnd) {
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(x + cellSize / 2, y + cellSize / 2, cellSize / 4, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }
  };

  const regenerateGrid = () => {
    controller.reset();
    const g = createGrid(gridSize());
    setGrid(g);
    setSteps([]);
    setCurrentStep(-1);
    setTotalSteps(0);
    drawGrid(g);
  };

  const buildSteps = (g: Cell[][], algo: string): PathStep[] => {
    const size = g.length;
    const start = { row: 0, col: 0 };
    const end = { row: size - 1, col: size - 1 };
    const steps: PathStep[] = [];
    const workingGrid: Cell[][] = g.map(row => row.map(c => ({ ...c })));
    const key = (r: number, c: number) => `${r},${c}`;

    if (algo === 'astar') {
      const openSet: { row: number; col: number; f: number; g: number; parent?: { row: number; col: number } }[] = [];
      const closedSet = new Set<string>();
      openSet.push({ row: start.row, col: start.col, f: 0, g: 0 });

      steps.push({
        grid: workingGrid.map(row => row.map(c => ({ ...c }))),
        description: '初始化起点到开放集',
        current: { row: start.row, col: start.col },
      });

      while (openSet.length > 0) {
        openSet.sort((a, b) => a.f - b.f);
        const current = openSet.shift()!;
        const k = key(current.row, current.col);
        if (closedSet.has(k)) continue;
        closedSet.add(k);

        workingGrid[current.row][current.col].isVisited = true;
        steps.push({
          grid: workingGrid.map(row => row.map(c => ({ ...c }))),
          description: `访问节点 (${current.row}, ${current.col}), f=${current.f}`,
          current: { row: current.row, col: current.col },
        });

        if (current.row === end.row && current.col === end.col) {
          let node: any = current;
          const path: { row: number; col: number }[] = [];
          while (node.parent) {
            path.push({ row: node.row, col: node.col });
            node = node.parent;
          }
          for (const p of path) {
            workingGrid[p.row][p.col].isPath = true;
            steps.push({
              grid: workingGrid.map(row => row.map(c => ({ ...c }))),
              description: `回溯路径到 (${p.row}, ${p.col})`,
              current: p,
            });
          }
          workingGrid[start.row][start.col].isPath = true;
          steps.push({
            grid: workingGrid.map(row => row.map(c => ({ ...c }))),
            description: '找到最短路径！',
          });
          return steps;
        }

        const dirs = [[0, 1], [0, -1], [1, 0], [-1, 0]];
        for (const [dr, dc] of dirs) {
          const nr = current.row + dr, nc = current.col + dc;
          if (nr < 0 || nr >= size || nc < 0 || nc >= size) continue;
          if (workingGrid[nr][nc].isWall || closedSet.has(key(nr, nc))) continue;
          const h = Math.abs(nr - end.row) + Math.abs(nc - end.col);
          const ng = current.g + 1;
          const nf = ng + h;
          openSet.push({ row: nr, col: nc, f: nf, g: ng, parent: { row: current.row, col: current.col } });
        }
      }

      steps.push({
        grid: workingGrid.map(row => row.map(c => ({ ...c }))),
        description: '未找到路径',
      });
    } else if (algo === 'dijkstra') {
      const dist: number[][] = Array.from({ length: size }, () => new Array(size).fill(Infinity));
      const visited: boolean[][] = Array.from({ length: size }, () => new Array(size).fill(false));
      const parent: { row: number; col: number }[][] = Array.from({ length: size }, () => new Array(size).fill(null));
      dist[start.row][start.col] = 0;

      steps.push({
        grid: workingGrid.map(row => row.map(c => ({ ...c }))),
        description: '初始化所有距离为无穷大',
        current: { row: start.row, col: start.col },
      });

      for (let i = 0; i < size * size; i++) {
        let minDist = Infinity;
        let minR = -1, minC = -1;
        for (let r = 0; r < size; r++) {
          for (let c = 0; c < size; c++) {
            if (!visited[r][c] && !workingGrid[r][c].isWall && dist[r][c] < minDist) {
              minDist = dist[r][c];
              minR = r;
              minC = c;
            }
          }
        }
        if (minR === -1) break;
        visited[minR][minC] = true;
        workingGrid[minR][minC].isVisited = true;
        steps.push({
          grid: workingGrid.map(row => row.map(c => ({ ...c }))),
          description: `选择最短距离节点 (${minR}, ${minC}), d=${minDist}`,
          current: { row: minR, col: minC },
        });

        if (minR === end.row && minC === end.col) {
          let r = minR, c = minC;
          while (parent[r][c]) {
            const p = parent[r][c];
            workingGrid[p.row][p.col].isPath = true;
            steps.push({
              grid: workingGrid.map(row => row.map(c => ({ ...c }))),
              description: `回溯到 (${p.row}, ${p.col})`,
              current: p,
            });
            r = p.row;
            c = p.col;
          }
          workingGrid[start.row][start.col].isPath = true;
          steps.push({
            grid: workingGrid.map(row => row.map(c => ({ ...c }))),
            description: '找到最短路径！',
          });
          return steps;
        }

        const dirs = [[0, 1], [0, -1], [1, 0], [-1, 0]];
        for (const [dr, dc] of dirs) {
          const nr = minR + dr, nc = minC + dc;
          if (nr < 0 || nr >= size || nc < 0 || nc >= size) continue;
          if (workingGrid[nr][nc].isWall || visited[nr][nc]) continue;
          const nd = dist[minR][minC] + 1;
          if (nd < dist[nr][nc]) {
            dist[nr][nc] = nd;
            parent[nr][nc] = { row: minR, col: minC };
            steps.push({
              grid: workingGrid.map(row => row.map(c => ({ ...c }))),
              description: `更新 (${nr}, ${nc}) 距离为 ${nd}`,
              current: { row: nr, col: nc },
            });
          }
        }
      }

      steps.push({
        grid: workingGrid.map(row => row.map(c => ({ ...c }))),
        description: '未找到路径',
      });
    } else if (algo === 'bfs') {
      const queue: { row: number; col: number }[] = [];
      const visited: boolean[][] = Array.from({ length: size }, () => new Array(size).fill(false));
      const parent: { row: number; col: number }[][] = Array.from({ length: size }, () => new Array(size).fill(null));
      queue.push(start);
      visited[start.row][start.col] = true;

      steps.push({
        grid: workingGrid.map(row => row.map(c => ({ ...c }))),
        description: '起点加入队列',
        current: { row: start.row, col: start.col },
      });

      while (queue.length > 0) {
        const current = queue.shift()!;
        workingGrid[current.row][current.col].isVisited = true;
        steps.push({
          grid: workingGrid.map(row => row.map(c => ({ ...c }))),
          description: `访问 (${current.row}, ${current.col})`,
          current,
        });

        if (current.row === end.row && current.col === end.col) {
          let r = current.row, c = current.col;
          while (parent[r][c]) {
            const p = parent[r][c];
            workingGrid[p.row][p.col].isPath = true;
            steps.push({
              grid: workingGrid.map(row => row.map(c => ({ ...c }))),
              description: `回溯到 (${p.row}, ${p.col})`,
              current: p,
            });
            r = p.row;
            c = p.col;
          }
          workingGrid[start.row][start.col].isPath = true;
          steps.push({
            grid: workingGrid.map(row => row.map(c => ({ ...c }))),
            description: '找到最短路径！',
          });
          return steps;
        }

        const dirs = [[0, 1], [0, -1], [1, 0], [-1, 0]];
        for (const [dr, dc] of dirs) {
          const nr = current.row + dr, nc = current.col + dc;
          if (nr < 0 || nr >= size || nc < 0 || nc >= size) continue;
          if (workingGrid[nr][nc].isWall || visited[nr][nc]) continue;
          visited[nr][nc] = true;
          parent[nr][nc] = { row: current.row, col: current.col };
          queue.push({ row: nr, col: nc });
          steps.push({
            grid: workingGrid.map(row => row.map(c => ({ ...c }))),
            description: `发现邻居 (${nr}, ${nc})`,
            current: { row: nr, col: nc },
          });
        }
      }

      steps.push({
        grid: workingGrid.map(row => row.map(c => ({ ...c }))),
        description: '未找到路径',
      });
    }

    return steps;
  };

  const startPathfinding = () => {
    if (isRunning()) return;
    setIsRunning(true);
    setSteps([]);

    const g = createGrid(gridSize());
    setGrid(g);
    drawGrid(g);

    const builtSteps = buildSteps(g, algorithm());
    const animSteps: AnimStep<Cell[][]>[] = builtSteps.map(s => ({
      state: s.grid,
      description: s.description,
      ...(s.current && { current: s.current }),
    })) as any;

    controller.setSteps(animSteps);
    controller.setSpeed(speed());
    controller.play().then(() => {
      setIsRunning(false);
      setSteps(prev => ['寻路完成', ...prev]);
    });
  };

  const playPathfinding = () => {
    if (controller.isAtEnd() || controller.isEmpty()) {
      startPathfinding();
    } else {
      setIsRunning(true);
      controller.play().then(() => setIsRunning(false));
    }
  };

  const pausePathfinding = () => {
    controller.pause();
    setIsRunning(false);
  };

  const resetPathfinding = () => {
    controller.pause();
    setIsRunning(false);
    regenerateGrid();
  };

  const handleStepForward = () => {
    if (!isRunning()) controller.stepForward();
  };

  const handleStepBackward = () => {
    if (!isRunning()) controller.stepBackward();
  };

  const handleSpeedChange = (newSpeed: number) => {
    setSpeed(newSpeed);
    controller.setSpeed(newSpeed);
  };

  return (
    <main class="visualization-page">
      <div class="container">
        <div class="visualization-header">
          <h1>寻路算法可视化</h1>
          <p class="description">A*、Dijkstra、BFS 是常用的图搜索算法，用于在网格中寻找从起点到终点的最短路径。</p>
        </div>
        <div class="controls">
          <div class="controls-group">
            <label>算法</label>
            <Dropdown
              value={algorithm()}
              onChange={(value) => {
                setAlgorithm(value);
                resetPathfinding();
              }}
              options={[
                { label: 'A* 算法', value: 'astar' },
                { label: 'Dijkstra', value: 'dijkstra' },
                { label: 'BFS', value: 'bfs' },
              ]}
            />
          </div>
          <div class="controls-group">
            <label>网格大小</label>
            <Dropdown
              value={String(gridSize())}
              onChange={(value) => { setGridSize(parseInt(value)); resetPathfinding(); }}
              options={[
                { label: '10×10', value: '10' },
                { label: '15×15', value: '15' },
                { label: '20×20', value: '20' },
                { label: '25×25', value: '25' },
              ]}
            />
          </div>
        </div>
        <div class="canvas-container canvas-container-enhanced">
          <canvas ref={el => canvasRef = el} style={{ width: '100%', height: '500px', display: 'block' }} />
        </div>
        <ControlPanel
          isRunning={isRunning()}
          speed={speed()}
          currentStep={currentStep()}
          totalSteps={totalSteps()}
          onPlay={playPathfinding}
          onPause={pausePathfinding}
          onReset={resetPathfinding}
          onStepForward={handleStepForward}
          onStepBackward={handleStepBackward}
          onSpeedChange={handleSpeedChange}
          onGenerate={regenerateGrid}
        />
        <div class="steps-panel">
          <h3>执行步骤</h3>
          <div>
            {steps().length === 0 ? (
              <div class="step-item">点击播放按钮开始寻路可视化</div>
            ) : (
              steps().map(step => <div class="step-item active">{step}</div>)
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
