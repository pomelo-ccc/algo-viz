import { createSignal, onMount, onCleanup } from 'solid-js';
import Dropdown from '../components/Dropdown';
import ControlPanel from '../components/ControlPanel';
import { AnimationController, type AnimStep } from '../utils/animation';
import { PathfindingVisualizer } from '../utils/three/PathfindingVisualizer';
import { DARK_THEME, LIGHT_THEME } from '../utils/three/ThreeVisualizer';

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
  let containerRef: HTMLDivElement | undefined;
  let visualizer: PathfindingVisualizer | undefined;
  let controller: AnimationController<Cell[][]>;

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
    if (!containerRef) return;
    visualizer = new PathfindingVisualizer(containerRef);
    const isDark = () => document.documentElement.getAttribute('data-theme') === 'dark';
    visualizer.setTheme(isDark() ? DARK_THEME : LIGHT_THEME);
    visualizer.start();

    const observer = new MutationObserver(() => {
      visualizer?.setTheme(isDark() ? DARK_THEME : LIGHT_THEME);
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

    const g = createGrid(gridSize());
    setGrid(g);
    visualizer.setGrid(g);

    controller = new AnimationController<Cell[][]>({ speed: speed() });
    controller.setCallbacks(
      (step: AnimStep<Cell[][]>) => {
        const current = (step as any).current as { row: number; col: number } | undefined;
        if (current) {
          if (step.description.includes('邻居') || step.description.includes('更新') || step.description.includes('距离')) {
            visualizer?.markInOpenSet(current.row, current.col);
          } else if (step.description.includes('访问') || step.description.includes('选择') || step.description.includes('初始化')) {
            visualizer?.markVisited(current.row, current.col);
            visualizer?.markCurrent(current.row, current.col);
          } else if (step.description.includes('回溯') || step.description.includes('放置') || step.description.includes('找到')) {
            visualizer?.markVisited(current.row, current.col);
          }
        }
        setSteps(prev => [step.description, ...prev].slice(0, 30));
      },
      (state, index, total) => {
        setCurrentStep(index);
        setTotalSteps(total);
        const lastStep = state as any;
        if (lastStep && lastStep._path) {
          visualizer?.showPath(lastStep._path);
        }
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
      if (e.key === 'ArrowLeft') { e.preventDefault(); controller.stepBackward(); }
      if (e.key === 'ArrowRight') { e.preventDefault(); controller.stepForward(); }
      if (e.key === 'r' || e.key === 'R') { e.preventDefault(); resetPathfinding(); }
    };
    window.addEventListener('keydown', handleKeydown);

    onCleanup(() => {
      controller.destroy();
      observer.disconnect();
      window.removeEventListener('keydown', handleKeydown);
      visualizer?.stop();
    });
  });

  const regenerateGrid = () => {
    controller?.reset();
    const g = createGrid(gridSize());
    setGrid(g);
    visualizer?.setGrid(g);
    setSteps([]);
    setCurrentStep(-1);
    setTotalSteps(0);
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
            _path: path as any,
          } as any);
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
              minR = r; minC = c;
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
          const path: { row: number; col: number }[] = [];
          while (parent[r][c]) {
            const p = parent[r][c];
            workingGrid[p.row][p.col].isPath = true;
            path.push(p);
            steps.push({
              grid: workingGrid.map(row => row.map(c => ({ ...c }))),
              description: `回溯到 (${p.row}, ${p.col})`,
              current: p,
            });
            r = p.row; c = p.col;
          }
          workingGrid[start.row][start.col].isPath = true;
          steps.push({
            grid: workingGrid.map(row => row.map(c => ({ ...c }))),
            description: '找到最短路径！',
            _path: path as any,
          } as any);
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
          const path: { row: number; col: number }[] = [];
          while (parent[r][c]) {
            const p = parent[r][c];
            workingGrid[p.row][p.col].isPath = true;
            path.push(p);
            steps.push({
              grid: workingGrid.map(row => row.map(c => ({ ...c }))),
              description: `回溯到 (${p.row}, ${p.col})`,
              current: p,
            });
            r = p.row; c = p.col;
          }
          workingGrid[start.row][start.col].isPath = true;
          steps.push({
            grid: workingGrid.map(row => row.map(c => ({ ...c }))),
            description: '找到最短路径！',
            _path: path as any,
          } as any);
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
    visualizer?.setGrid(g);

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

  const pausePathfinding = () => { controller.pause(); setIsRunning(false); };
  const resetPathfinding = () => { controller.pause(); setIsRunning(false); regenerateGrid(); };
  const handleStepForward = () => { if (!isRunning()) controller.stepForward(); };
  const handleStepBackward = () => { if (!isRunning()) controller.stepBackward(); };
  const handleSpeedChange = (newSpeed: number) => { setSpeed(newSpeed); controller.setSpeed(newSpeed); };

  return (
    <main class="visualization-page">
      <div class="container">
        <div class="visualization-header">
          <h1>寻路算法可视化</h1>
          <p class="description">
            A*、Dijkstra、BFS 是常用的图搜索算法,用于在网格中寻找从起点到终点的最短路径。
            <span class="hint">3D 迷宫 · 拖拽旋转视角 · 滚轮缩放</span>
          </p>
        </div>
        <div class="controls">
          <div class="controls-group">
            <label>算法</label>
            <Dropdown
              value={algorithm()}
              onChange={(value) => { setAlgorithm(value); resetPathfinding(); }}
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
              ]}
            />
          </div>
        </div>
        <div class="canvas-container canvas-container-3d">
          <div ref={el => { containerRef = el; }} class="three-container" />
          <div class="three-hint">
            <span>3D VIEW</span>
            <span class="three-hint-divider">·</span>
            <span>拖拽旋转</span>
            <span class="three-hint-divider">·</span>
            <span>滚轮缩放</span>
          </div>
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
