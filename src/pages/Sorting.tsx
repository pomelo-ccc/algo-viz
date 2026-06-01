import { createSignal, createEffect, onMount, onCleanup } from 'solid-js';
import { sortingCodes, languageLabels, type Language } from '../utils/codeData';
import Dropdown from '../components/Dropdown';
import CodePanel from '../components/CodePanel';
import ControlPanel from '../components/ControlPanel';
import { DoubleBufferedRenderer, createSortingRenderer, type RenderState } from '../utils/canvasRenderer';
import { AnimationController, type AnimStep } from '../utils/animation';

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
  let renderer: DoubleBufferedRenderer;
  let controller: AnimationController<number[]>;
  const [algorithm, setAlgorithm] = createSignal('bubble');
  const [arraySize, setArraySize] = createSignal(50);
  const [speed, setSpeed] = createSignal(50);
  const [isRunning, setIsRunning] = createSignal(false);
  const [steps, setSteps] = createSignal<string[]>([]);
  const [lang, setLang] = createSignal<Language>('javascript');
  const [array, setArray] = createSignal<number[]>([]);
  const [currentStep, setCurrentStep] = createSignal(-1);
  const [totalSteps, setTotalSteps] = createSignal(0);

  onMount(() => {
    renderer = createSortingRenderer(canvasRef);
    controller = new AnimationController<number[]>({ speed: speed() });
    controller.setCallbacks(
      (step: AnimStep<number[]>) => {
        const arr = step.state;
        renderer.render({
          array: arr,
          comparing: step.compare || [],
          swapping: step.swap ? [step.swap[0], step.swap[1]] : [],
          sorted: step.sorted || [],
        });

        if (step.swap) {
          const barWidth = canvasRef.getBoundingClientRect().width / arr.length;
          const x = (step.swap[0] + 0.5) * barWidth;
          const height = canvasRef.getBoundingClientRect().height;
          renderer.emitParticles(x, height - 100, 12, '#1a1a1a');
        }

        setSteps(prev => [step.description, ...prev].slice(0, 30));
      },
      (state, index, total) => {
        setCurrentStep(index);
        setTotalSteps(total);
      }
    );

    generateArray();

    const handleResize = () => renderer.resize();
    window.addEventListener('resize', handleResize);

    const handleKeydown = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'Space') {
        e.preventDefault();
        if (isRunning()) pauseSort();
        else playSort();
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
        resetSort();
      }
    };
    window.addEventListener('keydown', handleKeydown);

    onCleanup(() => {
      controller.destroy();
      renderer.destroy();
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('keydown', handleKeydown);
    });
  });

  const generateArray = () => {
    const arr: number[] = [];
    for (let i = 0; i < arraySize(); i++) {
      arr.push(Math.floor(Math.random() * 85) + 15);
    }
    setArray(arr);
    controller.reset();
    controller.setSteps([]);
    setSteps([]);
    setCurrentStep(-1);
    setTotalSteps(0);
    renderer.render({ array: arr, comparing: [], swapping: [], sorted: [] });
  };

  const buildSteps = (arr: number[], algo: string) => {
    const workingArr = [...arr];
    const steps: AnimStep<number[]>[] = [];

    switch (algo) {
      case 'bubble':
        for (let i = 0; i < workingArr.length - 1; i++) {
          for (let j = 0; j < workingArr.length - i - 1; j++) {
            steps.push({
              state: [...workingArr],
              description: `比较 ${workingArr[j]} 和 ${workingArr[j + 1]}`,
              compare: [j, j + 1],
            });
            if (workingArr[j] > workingArr[j + 1]) {
              [workingArr[j], workingArr[j + 1]] = [workingArr[j + 1], workingArr[j]];
              steps.push({
                state: [...workingArr],
                description: `交换 ${workingArr[j + 1]} 和 ${workingArr[j]}`,
                swap: [j, j + 1],
              });
            }
          }
          steps.push({
            state: [...workingArr],
            description: `位置 ${workingArr.length - i - 1} 已排序`,
            sorted: Array.from({ length: i + 1 }, (_, k) => workingArr.length - 1 - k),
          });
        }
        break;

      case 'selection':
        for (let i = 0; i < workingArr.length - 1; i++) {
          let minIdx = i;
          for (let j = i + 1; j < workingArr.length; j++) {
            steps.push({
              state: [...workingArr],
              description: `查找最小值: 比较 ${workingArr[j]} 和 ${workingArr[minIdx]}`,
              compare: [j, minIdx],
            });
            if (workingArr[j] < workingArr[minIdx]) minIdx = j;
          }
          if (minIdx !== i) {
            [workingArr[i], workingArr[minIdx]] = [workingArr[minIdx], workingArr[i]];
            steps.push({
              state: [...workingArr],
              description: `交换 ${workingArr[minIdx]} 到位置 ${i}`,
              swap: [i, minIdx],
            });
          }
          steps.push({
            state: [...workingArr],
            description: `位置 ${i} 已排序`,
            sorted: [i],
          });
        }
        break;

      case 'insertion':
        for (let i = 1; i < workingArr.length; i++) {
          const key = workingArr[i];
          let j = i - 1;
          while (j >= 0 && workingArr[j] > key) {
            workingArr[j + 1] = workingArr[j];
            steps.push({
              state: [...workingArr],
              description: `移动 ${workingArr[j]} 到位置 ${j + 1}`,
              swap: [j, j + 1],
            });
            j--;
          }
          workingArr[j + 1] = key;
          if (j + 1 !== i) {
            steps.push({
              state: [...workingArr],
              description: `插入 ${key} 到位置 ${j + 1}`,
            });
          }
        }
        break;

      case 'quick':
        const quickSteps: AnimStep<number[]>[] = [];
        const partitionQuick = (arr: number[], low: number, high: number): number => {
          const pivot = arr[high];
          let i = low - 1;
          for (let j = low; j < high; j++) {
            quickSteps.push({
              state: [...arr],
              description: `比较 ${arr[j]} 和 pivot ${pivot}`,
              compare: [j, high],
              pivot: high,
            });
            if (arr[j] < pivot) {
              i++;
              [arr[i], arr[j]] = [arr[j], arr[i]];
              if (i !== j) {
                quickSteps.push({
                  state: [...arr],
                  description: `交换 ${arr[i]} 和 ${arr[j]}`,
                  swap: [i, j],
                });
              }
            }
          }
          [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
          quickSteps.push({
            state: [...arr],
            description: `pivot ${pivot} 放置到位置 ${i + 1}`,
            swap: [i + 1, high],
            sorted: [i + 1],
          });
          return i + 1;
        };
        const quickSort = (arr: number[], low: number, high: number) => {
          if (low < high) {
            const pi = partitionQuick(arr, low, high);
            quickSort(arr, low, pi - 1);
            quickSort(arr, pi + 1, high);
          }
        };
        quickSort(workingArr, 0, workingArr.length - 1);
        steps.push(...quickSteps);
        break;

      case 'merge':
        const mergeSteps: AnimStep<number[]>[] = [];
        const merge = (arr: number[], l: number, m: number, r: number) => {
          const left = arr.slice(l, m + 1);
          const right = arr.slice(m + 1, r + 1);
          let i = 0, j = 0, k = l;
          while (i < left.length && j < right.length) {
            mergeSteps.push({
              state: [...arr],
              description: `合并: 比较 ${left[i]} 和 ${right[j]}`,
              compare: [l + i, m + 1 + j],
            });
            if (left[i] <= right[j]) {
              arr[k] = left[i++];
            } else {
              arr[k] = right[j++];
            }
            mergeSteps.push({
              state: [...arr],
              description: `放置 ${arr[k]} 到位置 ${k}`,
              sorted: [k],
            });
            k++;
          }
          while (i < left.length) {
            arr[k] = left[i++];
            mergeSteps.push({ state: [...arr], description: `放置剩余元素`, sorted: [k] });
            k++;
          }
          while (j < right.length) {
            arr[k] = right[j++];
            mergeSteps.push({ state: [...arr], description: `放置剩余元素`, sorted: [k] });
            k++;
          }
        };
        const mergeSort = (arr: number[], l: number, r: number) => {
          if (l < r) {
            const m = Math.floor((l + r) / 2);
            mergeSort(arr, l, m);
            mergeSort(arr, m + 1, r);
            merge(arr, l, m, r);
          }
        };
        mergeSort(workingArr, 0, workingArr.length - 1);
        steps.push(...mergeSteps);
        break;

      case 'heap':
        const heapSteps: AnimStep<number[]>[] = [];
        const heapify = (arr: number[], n: number, i: number) => {
          let largest = i;
          const left = 2 * i + 1;
          const right = 2 * i + 2;
          if (left < n) {
            heapSteps.push({ state: [...arr], description: `比较 ${arr[left]} 和 ${arr[largest]}`, compare: [left, largest] });
            if (arr[left] > arr[largest]) largest = left;
          }
          if (right < n) {
            heapSteps.push({ state: [...arr], description: `比较 ${arr[right]} 和 ${arr[largest]}`, compare: [right, largest] });
            if (arr[right] > arr[largest]) largest = right;
          }
          if (largest !== i) {
            [arr[i], arr[largest]] = [arr[largest], arr[i]];
            heapSteps.push({ state: [...arr], description: `交换 ${arr[largest]} 和 ${arr[i]}`, swap: [i, largest] });
            heapify(arr, n, largest);
          }
        };
        const n = workingArr.length;
        for (let i = Math.floor(n / 2) - 1; i >= 0; i--) heapify(workingArr, n, i);
        for (let i = n - 1; i > 0; i--) {
          [workingArr[0], workingArr[i]] = [workingArr[i], workingArr[0]];
          heapSteps.push({ state: [...workingArr], description: `提取最大元素 ${workingArr[i]}`, swap: [0, i], sorted: [i] });
          heapify(workingArr, i, 0);
        }
        steps.push(...heapSteps);
        break;

      case 'shell':
        for (let gap = Math.floor(workingArr.length / 2); gap > 0; gap = Math.floor(gap / 2)) {
          for (let i = gap; i < workingArr.length; i++) {
            const temp = workingArr[i];
            let j = i;
            while (j >= gap && workingArr[j - gap] > temp) {
              workingArr[j] = workingArr[j - gap];
              steps.push({
                state: [...workingArr],
                description: `移动 ${workingArr[j - gap]} 到位置 ${j}`,
                swap: [j - gap, j],
              });
              j -= gap;
            }
            workingArr[j] = temp;
          }
        }
        break;

      case 'counting':
        const max = Math.max(...workingArr);
        const count = new Array(max + 1).fill(0);
        const output = new Array(workingArr.length);
        for (let i = 0; i < workingArr.length; i++) count[workingArr[i]]++;
        for (let i = 1; i <= max; i++) count[i] += count[i - 1];
        for (let i = workingArr.length - 1; i >= 0; i--) {
          output[count[workingArr[i]] - 1] = workingArr[i];
          count[workingArr[i]]--;
          steps.push({
            state: [...output],
            description: `放置 ${workingArr[i]} 到位置 ${count[workingArr[i]]}`,
            sorted: Array.from({ length: workingArr.length - i - 1 }, (_, k) => k),
          });
        }
        for (let i = 0; i < workingArr.length; i++) workingArr[i] = output[i];
        break;

      case 'radix':
        const radixMax = Math.max(...workingArr);
        for (let exp = 1; Math.floor(radixMax / exp) > 0; exp *= 10) {
          const count = new Array(10).fill(0);
          const output = new Array(workingArr.length);
          for (let i = 0; i < workingArr.length; i++) count[Math.floor(workingArr[i] / exp) % 10]++;
          for (let i = 1; i < 10; i++) count[i] += count[i - 1];
          for (let i = workingArr.length - 1; i >= 0; i--) {
            const digit = Math.floor(workingArr[i] / exp) % 10;
            output[count[digit] - 1] = workingArr[i];
            count[digit]--;
            steps.push({
              state: [...output],
              description: `按第 ${exp} 位数字 ${digit} 放置 ${workingArr[i]}`,
              sorted: Array.from({ length: workingArr.length - i - 1 }, (_, k) => k),
            });
          }
          for (let i = 0; i < workingArr.length; i++) workingArr[i] = output[i];
        }
        break;
    }

    return steps;
  };

  const startSort = () => {
    if (isRunning()) return;
    setIsRunning(true);
    setSteps([]);

    const arr = [...array()];
    const steps = buildSteps(arr, algorithm());
    controller.setSteps(steps);
    controller.setSpeed(speed());
    controller.play().then(() => {
      setIsRunning(false);
      setSteps(prev => ['排序完成', ...prev]);
    });
  };

  const playSort = () => {
    if (controller.isAtEnd() || controller.isEmpty()) {
      startSort();
    } else {
      setIsRunning(true);
      controller.play().then(() => setIsRunning(false));
    }
  };

  const pauseSort = () => {
    controller.pause();
    setIsRunning(false);
  };

  const resetSort = () => {
    controller.pause();
    setIsRunning(false);
    generateArray();
  };

  const handleStepForward = () => {
    if (!isRunning()) {
      controller.stepForward();
    }
  };

  const handleStepBackward = () => {
    if (!isRunning()) {
      controller.stepBackward();
    }
  };

  const handleSpeedChange = (newSpeed: number) => {
    setSpeed(newSpeed);
    controller.setSpeed(newSpeed);
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
              onChange={(value) => {
                setAlgorithm(value);
                resetSort();
              }}
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
              onInput={(e) => {
                setArraySize(parseInt(e.currentTarget.value));
                generateArray();
              }}
            />
            <span>{arraySize()}</span>
          </div>
        </div>

        <div class="canvas-container canvas-container-enhanced">
          <canvas
            ref={el => { canvasRef = el; }}
            style={{ width: '100%', height: '400px', display: 'block' }}
          />
        </div>

        <ControlPanel
          isRunning={isRunning()}
          speed={speed()}
          currentStep={currentStep()}
          totalSteps={totalSteps()}
          onPlay={playSort}
          onPause={pauseSort}
          onReset={resetSort}
          onStepForward={handleStepForward}
          onStepBackward={handleStepBackward}
          onSpeedChange={handleSpeedChange}
          onGenerate={generateArray}
        />

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
              <div class="step-item">点击播放按钮开始算法可视化</div>
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
