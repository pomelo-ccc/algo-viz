import { createSignal, onMount } from 'solid-js';
import { searchingCodes, languageLabels, type Language } from '../utils/codeData';
import Dropdown from '../components/Dropdown';
import CodePanel from '../components/CodePanel';

export default function Searching() {
  let canvasRef: HTMLCanvasElement;
  let ctxRef: CanvasRenderingContext2D;
  const [algorithm, setAlgorithm] = createSignal('linear');
  const [arraySize, setArraySize] = createSignal(50);
  const [speed, setSpeed] = createSignal(50);
  const [isRunning, setIsRunning] = createSignal(false);
  const [steps, setSteps] = createSignal<string[]>([]);
  const [lang, setLang] = createSignal<Language>('javascript');
  const [target, setTarget] = createSignal(42);
  const [array, setArray] = createSignal<number[]>([]);

  onMount(() => {
    ctxRef = canvasRef.getContext('2d')!;
    const dpr = window.devicePixelRatio || 1;
    const rect = canvasRef.getBoundingClientRect();
    canvasRef.width = rect.width * dpr;
    canvasRef.height = rect.height * dpr;
    ctxRef.scale(dpr, dpr);
    generateArray();
    window.addEventListener('resize', () => {
      const rect = canvasRef.getBoundingClientRect();
      canvasRef.width = rect.width * dpr;
      canvasRef.height = rect.height * dpr;
      ctxRef.scale(dpr, dpr);
      drawArray(array(), -1, -1, -1);
    });
  });

  const generateArray = () => {
    const arr: number[] = [];
    for (let i = 0; i < arraySize(); i++) arr.push(Math.floor(Math.random() * 100) + 1);
    arr.sort((a, b) => a - b);
    setArray(arr);
    drawArray(arr, -1, -1, -1);
    setSteps([]);
  };

  const drawArray = (arr: number[], current: number, low: number, high: number) => {
    if (!ctxRef) return;
    const canvas = canvasRef;
    const ctx = ctxRef;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const barWidth = canvas.width / arr.length;
    const maxValue = Math.max(...arr, 1);
    for (let i = 0; i < arr.length; i++) {
      const barHeight = (arr[i] / maxValue) * (canvas.height - 80);
      const x = i * barWidth;
      const y = canvas.height - barHeight - 40;
      if (i === current) ctx.fillStyle = '#666666';
      else if (i >= low && i <= high && low !== -1) ctx.fillStyle = '#999999';
      else ctx.fillStyle = '#cccccc';
      ctx.fillRect(x + 1, y, barWidth - 2, barHeight);
      if (arr.length <= 30) {
        ctx.fillStyle = '#666666'; ctx.font = '10px monospace'; ctx.textAlign = 'center';
        ctx.fillText(String(arr[i]), x + barWidth / 2, y - 5);
      }
    }
  };

  const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));
  const addStep = (text: string) => setSteps(prev => [text, ...prev].slice(0, 30));

  const startSearch = async () => {
    if (isRunning()) return;
    setIsRunning(true);
    setSteps([]);
    const arr = [...array()];
    const t = target();
    if (algorithm() === 'linear') await linearSearch(arr, t);
    else await binarySearch(arr, t);
    setIsRunning(false);
  };

  const linearSearch = async (arr: number[], target: number) => {
    addStep(`开始线性搜索: 目标值 = ${target}`);
    for (let i = 0; i < arr.length; i++) {
      if (!isRunning()) return;
      addStep(`检查索引 ${i}: ${arr[i]}`);
      drawArray(arr, i, -1, -1);
      await sleep(Math.max(1, 101 - speed()) * 10);
      if (arr[i] === target) { addStep(`找到目标值! 索引: ${i}`); return; }
    }
    addStep(`未找到目标值 ${target}`);
  };

  const binarySearch = async (arr: number[], target: number) => {
    addStep(`开始二分搜索: 目标值 = ${target}`);
    let low = 0, high = arr.length - 1;
    while (low <= high) {
      if (!isRunning()) return;
      const mid = Math.floor((low + high) / 2);
      addStep(`范围 [${low}, ${high}], 中间索引: ${mid}, 值: ${arr[mid]}`);
      drawArray(arr, mid, low, high);
      await sleep(Math.max(1, 101 - speed()) * 10);
      if (arr[mid] === target) { addStep(`找到目标值! 索引: ${mid}`); return; }
      else if (arr[mid] < target) { addStep(`${arr[mid]} < ${target}, 搜索右半部分`); low = mid + 1; }
      else { addStep(`${arr[mid]} > ${target}, 搜索左半部分`); high = mid - 1; }
      await sleep(Math.max(1, 101 - speed()) * 10);
    }
    addStep(`未找到目标值 ${target}`);
  };

  const codeContent = () => {
    const code = searchingCodes[algorithm()];
    if (!code) return '// 暂无代码';
    return code[lang()];
  };

  return (
    <main class="visualization-page">
      <div class="container">
        <div class="visualization-header">
          <h1>搜索算法</h1>
          <p class="description">搜索算法用于在数据集合中查找特定元素。线性搜索逐个检查元素，而二分搜索利用有序特性快速定位。</p>
        </div>

        <div class="controls">
          <div class="controls-group">
            <label>算法</label>
            <Dropdown
              value={algorithm()}
              onChange={(value) => setAlgorithm(value)}
              options={[
                { label: '线性搜索', value: 'linear' },
                { label: '二分搜索', value: 'binary' },
              ]}
            />
          </div>
          <div class="controls-group">
            <label>数组大小</label>
            <input type="range" min="10" max="100" value={arraySize()} onInput={e => setArraySize(parseInt(e.currentTarget.value))} />
            <span>{arraySize()}</span>
          </div>
          <div class="controls-group">
            <label>速度</label>
            <input type="range" min="1" max="100" value={speed()} onInput={e => setSpeed(parseInt(e.currentTarget.value))} />
          </div>
          <div class="controls-group">
            <label>目标值</label>
            <input type="number" value={target()} onChange={e => setTarget(parseInt(e.currentTarget.value))} style={{ width: '80px', padding: '0.5rem', border: '1px solid var(--border)' }} />
          </div>
          <div class="controls-group">
            <button class="btn" onClick={generateArray}>生成新数组</button>
            <button class="btn btn-primary" onClick={startSearch} disabled={isRunning()}>
              {isRunning() ? '运行中...' : '开始搜索'}
            </button>
          </div>
        </div>

        <div class="canvas-container">
          <canvas ref={el => canvasRef = el} style={{ width: '100%', height: '400px', display: 'block' }} />
        </div>

        <div class="info-panel">
          <h3>算法复杂度</h3>
          <div class="complexity">
            <div class="complexity-item">
              <div class="label">时间复杂度 (平均)</div>
              <div class="value">{algorithm() === 'linear' ? 'O(n)' : 'O(log n)'}</div>
            </div>
            <div class="complexity-item">
              <div class="label">时间复杂度 (最坏)</div>
              <div class="value">{algorithm() === 'linear' ? 'O(n)' : 'O(log n)'}</div>
            </div>
            <div class="complexity-item">
              <div class="label">空间复杂度</div>
              <div class="value">O(1)</div>
            </div>
            <div class="complexity-item">
              <div class="label">前提条件</div>
              <div class="value">{algorithm() === 'linear' ? '无' : '数组已排序'}</div>
            </div>
          </div>
        </div>

        <div class="steps-panel">
          <h3>执行步骤</h3>
          <div>
            {steps().length === 0 ? (
              <div class="step-item">点击"开始搜索"查看算法执行过程</div>
            ) : (
              steps().map(step => <div class="step-item active">{step}</div>)
            )}
          </div>
        </div>

        <CodePanel category="searching" algorithm={algorithm()} />
      </div>
    </main>
  );
}
