import { createSignal, onMount } from 'solid-js';
import Dropdown from '../components/Dropdown';

interface Cell {
  row: number;
  col: number;
  isWall: boolean;
  isStart: boolean;
  isEnd: boolean;
  isVisited: boolean;
  isPath: boolean;
}

export default function Pathfinding() {
  let canvasRef: HTMLCanvasElement;
  let ctxRef: CanvasRenderingContext2D;
  const [gridSize, setGridSize] = createSignal(15);
  const [isRunning, setIsRunning] = createSignal(false);
  const [steps, setSteps] = createSignal<string[]>([]);
  const [grid, setGrid] = createSignal<Cell[][]>([]);
  const [speed, setSpeed] = createSignal(50);

  const createGrid = (size: number): Cell[][] => {
    const g: Cell[][] = [];
    for (let r = 0; r < size; r++) {
      const row: Cell[] = [];
      for (let c = 0; c < size; c++) {
        row.push({
          row: r, col: c,
          isWall: Math.random() < 0.3 && !(r === 0 && c === 0) && !(r === size - 1 && c === size - 1),
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
    ctxRef = canvasRef.getContext('2d')!;
    const dpr = window.devicePixelRatio || 1;
    const rect = canvasRef.getBoundingClientRect();
    canvasRef.width = rect.width * dpr;
    canvasRef.height = rect.height * dpr;
    ctxRef.scale(dpr, dpr);
    const g = createGrid(gridSize());
    setGrid(g);
    drawGrid(g);
    window.addEventListener('resize', () => {
      const rect = canvasRef.getBoundingClientRect();
      canvasRef.width = rect.width * dpr;
      canvasRef.height = rect.height * dpr;
      ctxRef.scale(dpr, dpr);
      drawGrid(grid());
    });
  });

  const drawGrid = (g: Cell[][]) => {
    if (!ctxRef || g.length === 0) return;
    const canvas = canvasRef;
    const ctx = ctxRef;
    const size = g.length;
    const cellSize = Math.min(canvas.width / size, canvas.height / size);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        const cell = g[r][c];
        const x = c * cellSize;
        const y = r * cellSize;
        if (cell.isWall) ctx.fillStyle = '#1a1a1a';
        else if (cell.isPath) ctx.fillStyle = '#666666';
        else if (cell.isVisited) ctx.fillStyle = '#e5e5e5';
        else ctx.fillStyle = '#ffffff';
        ctx.fillRect(x + 1, y + 1, cellSize - 2, cellSize - 2);
        if (cell.isStart) {
          ctx.fillStyle = '#1a1a1a';
          ctx.beginPath(); ctx.arc(x + cellSize / 2, y + cellSize / 2, cellSize / 4, 0, Math.PI * 2); ctx.fill();
        }
        if (cell.isEnd) {
          ctx.fillStyle = '#666666';
          ctx.beginPath(); ctx.arc(x + cellSize / 2, y + cellSize / 2, cellSize / 4, 0, Math.PI * 2); ctx.fill();
        }
      }
    }
  };

  const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));
  const addStep = (text: string) => setSteps(prev => [text, ...prev].slice(0, 30));

  const regenerateGrid = () => {
    const g = createGrid(gridSize());
    setGrid(g);
    drawGrid(g);
    setSteps([]);
  };

  const startPathfinding = async () => {
    if (isRunning()) return;
    setIsRunning(true);
    setSteps([]);
    const size = gridSize();
    const g = createGrid(size);
    setGrid(g);
    drawGrid(g);

    const start = { row: 0, col: 0 };
    const end = { row: size - 1, col: size - 1 };

    const openSet: { row: number; col: number; f: number; g: number; parent?: { row: number; col: number } }[] = [];
    const closedSet = new Set<string>();
    const key = (r: number, c: number) => `${r},${c}`;

    openSet.push({ row: start.row, col: start.col, f: 0, g: 0 });
    addStep('开始 A* 寻路');

    while (openSet.length > 0) {
      if (!isRunning()) break;
      openSet.sort((a, b) => a.f - b.f);
      const current = openSet.shift()!;
      const k = key(current.row, current.col);
      if (closedSet.has(k)) continue;
      closedSet.add(k);

      g[current.row][current.col].isVisited = true;
      addStep(`检查节点 (${current.row}, ${current.col})`);
      drawGrid(g);
      await sleep(Math.max(1, 101 - speed()) * 5);

      if (current.row === end.row && current.col === end.col) {
        let node: any = current;
        while (node.parent) {
          g[node.row][node.col].isPath = true;
          node = node.parent;
          drawGrid(g);
          await sleep(30);
        }
        g[start.row][start.col].isPath = true;
        drawGrid(g);
        addStep('找到最短路径!');
        setIsRunning(false);
        return;
      }

      const dirs = [[0, 1], [0, -1], [1, 0], [-1, 0]];
      for (const [dr, dc] of dirs) {
        const nr = current.row + dr, nc = current.col + dc;
        if (nr < 0 || nr >= size || nc < 0 || nc >= size) continue;
        if (g[nr][nc].isWall || closedSet.has(key(nr, nc))) continue;
        const h = Math.abs(nr - end.row) + Math.abs(nc - end.col);
        const ng = current.g + 1;
        const nf = ng + h;
        openSet.push({ row: nr, col: nc, f: nf, g: ng, parent: { row: current.row, col: current.col } });
      }
    }

    addStep('未找到路径');
    setIsRunning(false);
  };

  return (
    <main class="visualization-page">
      <div class="container">
        <div class="visualization-header">
          <h1>A* 寻路算法</h1>
          <p class="description">A* (A-Star) 算法是一种启发式搜索算法，结合了 Dijkstra 算法的准确性和贪心搜索的效率。</p>
        </div>
        <div class="controls">
          <div class="controls-group">
            <label>网格大小</label>
            <Dropdown
              value={String(gridSize())}
              onChange={(value) => { setGridSize(parseInt(value)); regenerateGrid(); }}
              options={[
                { label: '15×15', value: '15' },
                { label: '20×20', value: '20' },
                { label: '25×25', value: '25' },
              ]}
            />
          </div>
          <div class="controls-group">
            <label>速度</label>
            <input type="range" min="1" max="100" value={speed()} onInput={e => setSpeed(parseInt(e.currentTarget.value))} />
          </div>
          <div class="controls-group">
            <button class="btn" onClick={regenerateGrid}>生成新地图</button>
            <button class="btn btn-primary" onClick={startPathfinding} disabled={isRunning()}>
              {isRunning() ? '运行中...' : '开始寻路'}
            </button>
          </div>
        </div>
        <div class="canvas-container">
          <canvas ref={el => canvasRef = el} style={{ width: '100%', height: '400px', display: 'block' }} />
        </div>
        <div class="steps-panel">
          <h3>执行步骤</h3>
          <div>
            {steps().length === 0 ? (
              <div class="step-item">点击"开始寻路"查看算法执行过程</div>
            ) : (
              steps().map(step => <div class="step-item active">{step}</div>)
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
