import { createSignal, createEffect, onMount } from 'solid-js';
import { sortingCodes, languageLabels, type Language } from '../utils/codeData';
import Dropdown from '../components/Dropdown';
import CodePanel from '../components/CodePanel';

interface ComplexityInfo {
  avg: string;
  worst: string;
  space: string;
  stability: string;
}

const complexityMap: Record<string, ComplexityInfo> = {
  bubble: { avg: 'O(n\u00B2)', worst: 'O(n\u00B2)', space: 'O(1)', stability: '稳定' },
  selection: { avg: 'O(n\u00B2)', worst: 'O(n\u00B2)', space: 'O(1)', stability: '不稳定' },
  insertion: { avg: 'O(n\u00B2)', worst: 'O(n\u00B2)', space: 'O(1)', stability: '稳定' },
  quick: { avg: 'O(n log n)', worst: 'O(n\u00B2)', space: 'O(log n)', stability: '不稳定' },
  merge: { avg: 'O(n log n)', worst: 'O(n log n)', space: 'O(n)', stability: '稳定' },
  heap: { avg: 'O(n log n)', worst: 'O(n log n)', space: 'O(1)', stability: '不稳定' },
  shell: { avg: 'O(n log n)', worst: 'O(n\u00B2)', space: 'O(1)', stability: '不稳定' },
  counting: { avg: 'O(n + k)', worst: 'O(n + k)', space: 'O(k)', stability: '稳定' },
  radix: { avg: 'O(d(n + k))', worst: 'O(d(n + k))', space: 'O(n + k)', stability: '稳定' },
};

export default function Sorting() {
  let canvasRef: HTMLCanvasElement;
  let ctxRef: CanvasRenderingContext2D;
  const [algorithm, setAlgorithm] = createSignal('bubble');
  const [arraySize, setArraySize] = createSignal(50);
  const [speed, setSpeed] = createSignal(50);
  const [isRunning, setIsRunning] = createSignal(false);
  const [steps, setSteps] = createSignal<string[]>([]);
  const [lang, setLang] = createSignal<Language>('javascript');
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
      drawArray(array(), [], [], []);
    });
  });

  const generateArray = () => {
    const arr: number[] = [];
    for (let i = 0; i < arraySize(); i++) {
      arr.push(Math.floor(Math.random() * 90) + 10);
    }
    setArray(arr);
    drawArray(arr, [], [], []);
    setSteps([]);
  };

  const drawArray = (arr: number[], comparing: number[] = [], swapping: number[] = [], sorted: number[] = []) => {
    if (!ctxRef || arr.length === 0) return;
    const canvas = canvasRef;
    const ctx = ctxRef;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const barWidth = canvas.width / arr.length;
    const maxValue = Math.max(...arr, 100);

    for (let i = 0; i < arr.length; i++) {
      const barHeight = (arr[i] / maxValue) * (canvas.height - 40);
      const x = i * barWidth;
      const y = canvas.height - barHeight - 20;

      if (sorted.includes(i)) ctx.fillStyle = '#e5e5e5';
      else if (comparing.includes(i)) ctx.fillStyle = '#666666';
      else if (swapping.includes(i)) ctx.fillStyle = '#1a1a1a';
      else ctx.fillStyle = '#cccccc';
      ctx.fillRect(x + 1, y, barWidth - 2, barHeight);
    }
  };

  const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

  const addStep = (text: string) => {
    setSteps(prev => [text, ...prev].slice(0, 30));
  };

  const startSort = async () => {
    if (isRunning()) return;
    setIsRunning(true);
    setSteps([]);
    const currentArray = [...array()];
    const algo = algorithm();

    switch (algo) {
      case 'bubble': await bubbleSort(currentArray); break;
      case 'selection': await selectionSort(currentArray); break;
      case 'insertion': await insertionSort(currentArray); break;
      case 'quick': await quickSort(currentArray, 0, currentArray.length - 1); break;
      case 'merge': await mergeSort(currentArray, 0, currentArray.length - 1); break;
      case 'heap': await heapSort(currentArray); break;
      case 'shell': await shellSort(currentArray); break;
      case 'counting': await countingSort(currentArray); break;
      case 'radix': await radixSort(currentArray); break;
    }

    drawArray(currentArray, [], [], Array.from({ length: currentArray.length }, (_, i) => i));
    addStep('排序完成');
    setIsRunning(false);
  };

  const bubbleSort = async (arr: number[]) => {
    const n = arr.length;
    for (let i = 0; i < n - 1; i++) {
      for (let j = 0; j < n - i - 1; j++) {
        if (!isRunning()) return;
        drawArray(arr, [j, j + 1], [], []);
        await sleep(Math.max(1, 101 - speed()) * 3);
        if (arr[j] > arr[j + 1]) {
          [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
          addStep(`交换: ${arr[j]} <-> ${arr[j+1]}`);
          drawArray(arr, [], [j, j + 1], []);
          await sleep(Math.max(1, 101 - speed()) * 3);
        }
      }
    }
  };

  const selectionSort = async (arr: number[]) => {
    const n = arr.length;
    for (let i = 0; i < n - 1; i++) {
      let minIdx = i;
      for (let j = i + 1; j < n; j++) {
        if (!isRunning()) return;
        drawArray(arr, [minIdx, j], [], []);
        await sleep(Math.max(1, 101 - speed()) * 3);
        if (arr[j] < arr[minIdx]) minIdx = j;
      }
      if (minIdx !== i) {
        [arr[i], arr[minIdx]] = [arr[minIdx], arr[i]];
        addStep(`交换位置 ${i} 和 ${minIdx}`);
        drawArray(arr, [], [i, minIdx], []);
        await sleep(Math.max(1, 101 - speed()) * 3);
      }
    }
  };

  const insertionSort = async (arr: number[]) => {
    const n = arr.length;
    for (let i = 1; i < n; i++) {
      const key = arr[i];
      let j = i - 1;
      while (j >= 0 && arr[j] > key) {
        if (!isRunning()) return;
        arr[j + 1] = arr[j];
        drawArray(arr, [j, j + 1], [], []);
        await sleep(Math.max(1, 101 - speed()) * 3);
        j--;
      }
      arr[j + 1] = key;
      addStep(`插入 ${key} 到位置 ${j + 1}`);
    }
  };

  const quickSort = async (arr: number[], low: number, high: number) => {
    if (low < high && isRunning()) {
      const pi = await partition(arr, low, high);
      await quickSort(arr, low, pi - 1);
      await quickSort(arr, pi + 1, high);
    }
  };

  const partition = async (arr: number[], low: number, high: number) => {
    const pivot = arr[high];
    let i = low - 1;
    for (let j = low; j < high; j++) {
      if (!isRunning()) return low;
      drawArray(arr, [j, high], [], []);
      await sleep(Math.max(1, 101 - speed()) * 3);
      if (arr[j] < pivot) {
        i++;
        [arr[i], arr[j]] = [arr[j], arr[i]];
        drawArray(arr, [], [i, j], []);
        await sleep(Math.max(1, 101 - speed()) * 3);
      }
    }
    [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
    return i + 1;
  };

  const mergeSort = async (arr: number[], left: number, right: number) => {
    if (left < right && isRunning()) {
      const mid = Math.floor((left + right) / 2);
      await mergeSort(arr, left, mid);
      await mergeSort(arr, mid + 1, right);
      await merge(arr, left, mid, right);
    }
  };

  const merge = async (arr: number[], left: number, mid: number, right: number) => {
    const leftArr = arr.slice(left, mid + 1);
    const rightArr = arr.slice(mid + 1, right + 1);
    let i = 0, j = 0, k = left;
    while (i < leftArr.length && j < rightArr.length) {
      if (!isRunning()) return;
      drawArray(arr, [left + i, mid + 1 + j], [], []);
      await sleep(Math.max(1, 101 - speed()) * 3);
      if (leftArr[i] <= rightArr[j]) { arr[k] = leftArr[i]; i++; }
      else { arr[k] = rightArr[j]; j++; }
      drawArray(arr, [], [k], []);
      await sleep(Math.max(1, 101 - speed()) * 3);
      k++;
    }
    while (i < leftArr.length) { arr[k] = leftArr[i]; i++; k++; }
    while (j < rightArr.length) { arr[k] = rightArr[j]; j++; k++; }
  };

  const heapSort = async (arr: number[]) => {
    const n = arr.length;
    for (let i = Math.floor(n / 2) - 1; i >= 0; i--) await heapify(arr, n, i);
    for (let i = n - 1; i > 0; i--) {
      if (!isRunning()) return;
      [arr[0], arr[i]] = [arr[i], arr[0]];
      drawArray(arr, [], [0, i], []);
      await sleep(Math.max(1, 101 - speed()) * 3);
      await heapify(arr, i, 0);
    }
  };

  const heapify = async (arr: number[], n: number, i: number) => {
    let largest = i;
    const left = 2 * i + 1;
    const right = 2 * i + 2;
    if (left < n && arr[left] > arr[largest]) largest = left;
    if (right < n && arr[right] > arr[largest]) largest = right;
    if (largest !== i) {
      if (!isRunning()) return;
      [arr[i], arr[largest]] = [arr[largest], arr[i]];
      drawArray(arr, [i, largest], [], []);
      await sleep(Math.max(1, 101 - speed()) * 3);
      await heapify(arr, n, largest);
    }
  };

  const shellSort = async (arr: number[]) => {
    const n = arr.length;
    for (let gap = Math.floor(n / 2); gap > 0; gap = Math.floor(gap / 2)) {
      for (let i = gap; i < n; i++) {
        const temp = arr[i];
        let j = i;
        while (j >= gap && arr[j - gap] > temp) {
          if (!isRunning()) return;
          arr[j] = arr[j - gap];
          drawArray(arr, [j, j - gap], [], []);
          await sleep(Math.max(1, 101 - speed()) * 3);
          j -= gap;
        }
        arr[j] = temp;
      }
    }
  };

  const countingSort = async (arr: number[]) => {
    const max = Math.max(...arr);
    const count = new Array(max + 1).fill(0);
    const output = new Array(arr.length);
    for (let i = 0; i < arr.length; i++) count[arr[i]]++;
    for (let i = 1; i <= max; i++) count[i] += count[i - 1];
    for (let i = arr.length - 1; i >= 0; i--) {
      if (!isRunning()) return;
      output[count[arr[i]] - 1] = arr[i];
      count[arr[i]]--;
      drawArray(arr, [i], [], []);
      await sleep(Math.max(1, 101 - speed()) * 3);
    }
    for (let i = 0; i < arr.length; i++) arr[i] = output[i];
  };

  const radixSort = async (arr: number[]) => {
    const max = Math.max(...arr);
    for (let exp = 1; Math.floor(max / exp) > 0; exp *= 10) {
      if (!isRunning()) return;
      await countingSortByDigit(arr, exp);
      addStep(`按第 ${exp} 位排序完成`);
    }
  };

  const countingSortByDigit = async (arr: number[], exp: number) => {
    const output = new Array(arr.length);
    const count = new Array(10).fill(0);
    for (let i = 0; i < arr.length; i++) count[Math.floor(arr[i] / exp) % 10]++;
    for (let i = 1; i < 10; i++) count[i] += count[i - 1];
    for (let i = arr.length - 1; i >= 0; i--) {
      const digit = Math.floor(arr[i] / exp) % 10;
      output[count[digit] - 1] = arr[i];
      count[digit]--;
    }
    for (let i = 0; i < arr.length; i++) {
      arr[i] = output[i];
      drawArray(arr, [i], [], []);
      await sleep(Math.max(1, 101 - speed()) * 3);
    }
  };

  createEffect(() => {
    const algo = algorithm();
    const info = complexityMap[algo];
    document.getElementById('time-complexity')!.textContent = info?.avg || 'O(?)';
    document.getElementById('worst-time')!.textContent = info?.worst || 'O(?)';
    document.getElementById('space-complexity')!.textContent = info?.space || 'O(?)';
    document.getElementById('stability')!.textContent = info?.stability || '?';
  });

  const codeContent = () => {
    const code = sortingCodes[algorithm()];
    if (!code) return '// 暂无代码';
    return code[lang()];
  };

  return (
    <main class="visualization-page">
      <div class="container">
        <div class="visualization-header">
          <h1>排序算法</h1>
          <p class="description">
            排序算法将无序的数据序列整理为有序序列。通过观察不同算法的比较和交换过程，
            理解它们的时间复杂度和空间复杂度差异。
          </p>
        </div>

        <div class="controls">
          <div class="controls-group">
            <label for="sort-algorithm">算法</label>
            <Dropdown
              id="sort-algorithm"
              value={algorithm()}
              onChange={(value) => setAlgorithm(value)}
              options={[
                { label: '冒泡排序', value: 'bubble' },
                { label: '选择排序', value: 'selection' },
                { label: '插入排序', value: 'insertion' },
                { label: '快速排序', value: 'quick' },
                { label: '归并排序', value: 'merge' },
                { label: '堆排序', value: 'heap' },
                { label: '希尔排序', value: 'shell' },
                { label: '计数排序', value: 'counting' },
                { label: '基数排序', value: 'radix' },
              ]}
            />
          </div>
          <div class="controls-group">
            <label for="array-size">数组大小</label>
            <input
              type="range"
              id="array-size"
              min="10"
              max="100"
              value={arraySize()}
              onInput={(e) => setArraySize(parseInt(e.currentTarget.value))}
            />
            <span>{arraySize()}</span>
          </div>
          <div class="controls-group">
            <label for="sort-speed">速度</label>
            <input
              type="range"
              id="sort-speed"
              min="1"
              max="100"
              value={speed()}
              onInput={(e) => setSpeed(parseInt(e.currentTarget.value))}
            />
          </div>
          <div class="controls-group">
            <button class="btn" onClick={generateArray}>生成新数组</button>
            <button class="btn btn-primary" onClick={startSort} disabled={isRunning()}>
              {isRunning() ? '运行中...' : '开始排序'}
            </button>
          </div>
        </div>

        <div class="canvas-container">
          <canvas
            ref={el => { canvasRef = el; }}
            style={{ width: '100%', height: '400px', display: 'block' }}
          />
        </div>

        <div class="info-panel">
          <h3>算法复杂度</h3>
          <div class="complexity">
            <div class="complexity-item">
              <div class="label">时间复杂度 (平均)</div>
              <div class="value" id="time-complexity">O(n\u00B2)</div>
            </div>
            <div class="complexity-item">
              <div class="label">时间复杂度 (最坏)</div>
              <div class="value" id="worst-time">O(n\u00B2)</div>
            </div>
            <div class="complexity-item">
              <div class="label">空间复杂度</div>
              <div class="value" id="space-complexity">O(1)</div>
            </div>
            <div class="complexity-item">
              <div class="label">稳定性</div>
              <div class="value" id="stability">稳定</div>
            </div>
          </div>
        </div>

        <div class="code-panel">
          <div class="code-panel-header">
            <h3>算法代码</h3>
            <Dropdown
              class="code-lang-select"
              value={lang()}
              onChange={(value) => setLang(value as Language)}
              options={Object.entries(languageLabels).map(([key, label]) => ({ value: key, label }))}
            />
          </div>
          <pre class="code-block"><code>{codeContent()}</code></pre>
        </div>

        <div class="steps-panel">
          <h3>执行步骤</h3>
          <div>
            {steps().length === 0 ? (
              <div class="step-item">点击"开始排序"查看算法执行过程</div>
            ) : (
              steps().map(step => <div class="step-item active">{step}</div>)
            )}
          </div>
        </div>

        <CodePanel category="sorting" algorithm={algorithm()} />
      </div>
    </main>
  );
}
