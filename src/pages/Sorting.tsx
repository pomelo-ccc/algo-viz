import { createSignal, onMount, onCleanup, createEffect, createMemo, For } from 'solid-js';
import { sortingCodes, languageLabels, type Language } from '../utils/codeData';
import Dropdown from '../components/Dropdown';
import ControlPanel from '../components/ControlPanel';
import { AnimationController, type AnimStep } from '../utils/animation';
import { createSortingRenderer, type RenderState } from '../utils/canvasRenderer';
import { SortingVisualizer } from '../utils/three/SortingVisualizer';
import { DARK_THEME, LIGHT_THEME } from '../utils/three/ThreeVisualizer';
import Prism from 'prismjs';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-c';
import 'prismjs/components/prism-cpp';
import 'prismjs/components/prism-java';

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
  let container3DRef: HTMLDivElement | undefined;
  let canvas2DRef: HTMLCanvasElement | undefined;
  let visualizer3D: SortingVisualizer | undefined;
  let renderer2D: ReturnType<typeof createSortingRenderer> | undefined;
  let controller: AnimationController<number[]>;
  const [algorithm, setAlgorithm] = createSignal('bubble');
  const [arraySize, setArraySize] = createSignal(20);
  const [speed, setSpeed] = createSignal(50);
  const [isRunning, setIsRunning] = createSignal(false);
  const [steps, setSteps] = createSignal<string[]>([]);
  const [lang, setLang] = createSignal<Language>('javascript');
  const [array, setArray] = createSignal<number[]>([]);
  const [initialArray, setInitialArray] = createSignal<number[]>([]);
  const [currentStep, setCurrentStep] = createSignal(-1);
  const [totalSteps, setTotalSteps] = createSignal(0);
  const [viewMode, setViewMode] = createSignal<'2d' | '3d'>('2d');
  const [completionFxEnabled, setCompletionFxEnabled] = createSignal(true);
  const [codeTheme, setCodeTheme] = createSignal<'zed' | 'dark' | 'light'>('zed');
  const [codeFont, setCodeFont] = createSignal<'jetbrains' | 'ibm' | 'sfmono'>('jetbrains');
  const codeThemeLabels = {
    zed: 'Zed Theme',
    dark: 'Dark',
    light: 'Light',
  } as const;
  const codeFontLabels = {
    jetbrains: 'JetBrains Mono',
    ibm: 'IBM Plex Mono',
    sfmono: 'SF Mono',
  } as const;

  onMount(() => {
    // Initialize 2D renderer (immediately, canvas is visible)
    if (canvas2DRef) {
      renderer2D = createSortingRenderer(canvas2DRef);
    }

    const observer = new MutationObserver(() => {
      visualizer3D?.setTheme(isDark() ? DARK_THEME : LIGHT_THEME);
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

    const isDark = () => document.documentElement.getAttribute('data-theme') === 'dark';

    controller = new AnimationController<number[]>({ speed: speed() });
    controller.setCallbacks(
      (step: AnimStep<number[]>) => {
        setArray(step.state);
        if (viewMode() === '3d' && visualizer3D) {
          // Update bar heights to reflect current array state
          visualizer3D.updateArray(step.state);
          if (step.compare) {
            visualizer3D.highlight(step.compare, 'comparing');
          } else if (step.swap) {
            visualizer3D.highlight(step.swap, 'swapping');
          } else if (step.sorted && step.sorted.length > 0) {
            visualizer3D.markSorted(step.sorted);
          } else {
            visualizer3D.highlight([], 'comparing');
          }
        } else if (viewMode() === '2d' && renderer2D) {
          const state: RenderState = {
            array: step.state,
            comparing: step.compare || [],
            swapping: step.swap || [],
            sorted: step.sorted || [],
            pivot: step.pivot,
          };
          renderer2D.render(state);
        }
        setSteps(prev => [step.description, ...prev].slice(0, 30));
      },
      (_state, index, total) => {
        setCurrentStep(index);
        setTotalSteps(total);
      }
    );

    generateArray();

    const handleResize = () => {
      if (renderer2D && canvas2DRef) {
        renderer2D.resize();
      }
    };
    window.addEventListener('resize', handleResize);

    const handleKeydown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
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
      observer.disconnect();
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('keydown', handleKeydown);
      visualizer3D?.stop();
      renderer2D?.destroy();
    });
  });

  const generateArray = () => {
    const arr: number[] = [];
    for (let i = 0; i < arraySize(); i++) {
      arr.push(Math.floor(Math.random() * 85) + 15);
    }
    setArray(arr);
    setInitialArray(arr);
    controller?.reset();
    controller?.setSteps([]);
    setSteps([]);
    setCurrentStep(-1);
    setTotalSteps(0);

    if (viewMode() === '3d' && visualizer3D) {
      visualizer3D.reset();
      visualizer3D.setValues(arr);
    } else if (viewMode() === '2d' && renderer2D) {
      renderer2D.render({ array: arr, comparing: [], swapping: [], sorted: [] });
    }
  };

  const renderCompletedState = (values: number[]) => {
    const sortedIndices = Array.from({ length: values.length }, (_, index) => index);
    if (viewMode() === '3d' && visualizer3D) {
      visualizer3D.updateArray(values);
      visualizer3D.markSorted(sortedIndices);
      if (completionFxEnabled()) {
        visualizer3D.playCompletionEffect();
      }
      return;
    }

    if (viewMode() === '2d' && renderer2D) {
      renderer2D.render({
        array: values,
        comparing: [],
        swapping: [],
        sorted: sortedIndices,
      });
      if (completionFxEnabled()) {
        renderer2D.playCompletionEffect();
      }
    }
  };

  const init3D = () => {
    if (!container3DRef || visualizer3D) return;
    visualizer3D = new SortingVisualizer(container3DRef, {
      cameraPosition: [0, 8, 14],
      fov: 50,
    });
    const isDark = () => document.documentElement.getAttribute('data-theme') === 'dark';
    visualizer3D.setTheme(isDark() ? DARK_THEME : LIGHT_THEME);
    visualizer3D.start();
  };

  const toggleViewMode = () => {
    const newMode = viewMode() === '2d' ? '3d' : '2d';
    setViewMode(newMode);

    if (newMode === '3d') {
      // Initialize 3D only when container becomes visible
      setTimeout(() => {
        const arr = [...array()];
        init3D();
        if (visualizer3D) {
          if (arr.length > 0) {
            visualizer3D.setValues(arr);
            if (isCompleted()) {
              renderCompletedState(arr);
            }
          } else {
            visualizer3D.generateRandomArray(arraySize());
          }
        }
      }, 50);
    } else {
      // Switch to 2D: render current array
      setTimeout(() => {
        const arr = [...array()];
        if (renderer2D) {
          if (isCompleted()) {
            renderCompletedState(arr);
          } else {
            renderer2D.render({ array: arr.length > 0 ? arr : [], comparing: [], swapping: [], sorted: [] });
          }
        }
      }, 50);
    }
  };

  const buildSteps = (arr: number[], algo: string) => {
    const workingArr = [...arr];
    const steps: AnimStep<number[]>[] = [];

    switch (algo) {
      case 'bubble':
        for (let i = 0; i < workingArr.length - 1; i++) {
          for (let j = 0; j < workingArr.length - i - 1; j++) {
            steps.push({ state: [...workingArr], description: `比较 ${workingArr[j]} 和 ${workingArr[j + 1]}`, compare: [j, j + 1] });
            if (workingArr[j] > workingArr[j + 1]) {
              [workingArr[j], workingArr[j + 1]] = [workingArr[j + 1], workingArr[j]];
              steps.push({ state: [...workingArr], description: `交换 ${workingArr[j + 1]} 和 ${workingArr[j]}`, swap: [j, j + 1] });
            }
          }
          steps.push({ state: [...workingArr], description: `位置 ${workingArr.length - i - 1} 已排序`, sorted: Array.from({ length: i + 1 }, (_, k) => workingArr.length - 1 - k) });
        }
        break;
      case 'selection':
        for (let i = 0; i < workingArr.length - 1; i++) {
          let minIdx = i;
          for (let j = i + 1; j < workingArr.length; j++) {
            steps.push({ state: [...workingArr], description: `查找最小值: 比较 ${workingArr[j]} 和 ${workingArr[minIdx]}`, compare: [j, minIdx] });
            if (workingArr[j] < workingArr[minIdx]) minIdx = j;
          }
          if (minIdx !== i) {
            [workingArr[i], workingArr[minIdx]] = [workingArr[minIdx], workingArr[i]];
            steps.push({ state: [...workingArr], description: `交换 ${workingArr[minIdx]} 到位置 ${i}`, swap: [i, minIdx] });
          }
          steps.push({ state: [...workingArr], description: `位置 ${i} 已排序`, sorted: [i] });
        }
        break;
      case 'insertion':
        for (let i = 1; i < workingArr.length; i++) {
          const key = workingArr[i];
          let j = i - 1;
          while (j >= 0 && workingArr[j] > key) {
            workingArr[j + 1] = workingArr[j];
            steps.push({ state: [...workingArr], description: `移动 ${workingArr[j]} 到位置 ${j + 1}`, swap: [j, j + 1] });
            j--;
          }
          workingArr[j + 1] = key;
        }
        break;
      case 'quick':
        const quickSteps: AnimStep<number[]>[] = [];
        const partitionQuick = (arr: number[], low: number, high: number): number => {
          const pivot = arr[high];
          let i = low - 1;
          for (let j = low; j < high; j++) {
            quickSteps.push({ state: [...arr], description: `比较 ${arr[j]} 和 pivot ${pivot}`, compare: [j, high], pivot: high });
            if (arr[j] < pivot) {
              i++;
              [arr[i], arr[j]] = [arr[j], arr[i]];
              if (i !== j) {
                quickSteps.push({ state: [...arr], description: `交换 ${arr[i]} 和 ${arr[j]}`, swap: [i, j] });
              }
            }
          }
          [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
          quickSteps.push({ state: [...arr], description: `pivot ${pivot} 放置到位置 ${i + 1}`, swap: [i + 1, high], sorted: [i + 1] });
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
            mergeSteps.push({ state: [...arr], description: `合并: 比较 ${left[i]} 和 ${right[j]}`, compare: [l + i, m + 1 + j] });
            if (left[i] <= right[j]) arr[k] = left[i++];
            else arr[k] = right[j++];
            mergeSteps.push({ state: [...arr], description: `放置 ${arr[k]} 到位置 ${k}`, sorted: [k] });
            k++;
          }
          while (i < left.length) { arr[k] = left[i++]; mergeSteps.push({ state: [...arr], description: `放置剩余元素`, sorted: [k] }); k++; }
          while (j < right.length) { arr[k] = right[j++]; mergeSteps.push({ state: [...arr], description: `放置剩余元素`, sorted: [k] }); k++; }
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
              steps.push({ state: [...workingArr], description: `移动 ${workingArr[j - gap]} 到位置 ${j}`, swap: [j - gap, j] });
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
          steps.push({ state: [...output], description: `放置 ${workingArr[i]} 到位置 ${count[workingArr[i]]}`, sorted: Array.from({ length: workingArr.length - i - 1 }, (_, k) => k) });
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
            steps.push({ state: [...output], description: `按第 ${exp} 位数字 ${digit} 放置 ${workingArr[i]}`, sorted: Array.from({ length: workingArr.length - i - 1 }, (_, k) => k) });
          }
          for (let i = 0; i < workingArr.length; i++) workingArr[i] = output[i];
        }
        break;
    }

    if (workingArr.length > 0) {
      steps.push({
        state: [...workingArr],
        description: '全部元素已排序',
        sorted: Array.from({ length: workingArr.length }, (_, index) => index),
      });
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
      const completedArray = [...arr].sort((a, b) => a - b);
      setArray(completedArray);
      renderCompletedState(completedArray);
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

  const handleStepForward = () => { if (!isRunning()) controller.stepForward(); };
  const handleStepBackward = () => { if (!isRunning()) controller.stepBackward(); };
  const handleSpeedChange = (newSpeed: number) => { setSpeed(newSpeed); controller.setSpeed(newSpeed); };

  createEffect(() => {
    const algo = algorithm();
    const info = complexityMap[algo];
    const el1 = document.getElementById('time-complexity');
    const el2 = document.getElementById('worst-time');
    const el3 = document.getElementById('space-complexity');
    const el4 = document.getElementById('stability');
    if (el1) el1.textContent = info?.avg || 'O(?)';
    if (el2) el2.textContent = info?.worst || 'O(?)';
    if (el3) el3.textContent = info?.space || 'O(?)';
    if (el4) el4.textContent = info?.stability || '?';
  });

  const codeContent = () => {
    const code = sortingCodes[algorithm()];
    if (!code) return '// 暂无代码';
    return code[lang()];
  };

  const finalArray = createMemo(() => [...initialArray()].sort((a, b) => a - b));

  const prismLanguage = createMemo(() => {
    const languageMap: Record<Language, string> = {
      javascript: 'javascript',
      typescript: 'typescript',
      python: 'python',
      cpp: 'cpp',
      java: 'java',
    };
    return languageMap[lang()] ?? 'javascript';
  });

  const highlightedCode = createMemo(() => {
    const source = codeContent();
    const grammar = Prism.languages[prismLanguage()] ?? Prism.languages.javascript;
    return Prism.highlight(source, grammar, prismLanguage());
  });

  const renderArrayLine = (values: number[]) => values.join('  ');
  const isCompleted = createMemo(() => {
    if (totalSteps() === 0) return false;
    return currentStep() >= totalSteps() - 1 && array().length > 0;
  });
  const snapshotCards = createMemo(() => [
    {
      label: '初始数据',
      tone: 'initial',
      caption: 'Raw input',
      values: initialArray(),
    },
    {
      label: '当前状态',
      tone: isCompleted() ? 'complete' : isRunning() ? 'active' : 'current',
      caption: isCompleted() ? 'Completed' : isRunning() ? 'Live state' : 'Ready state',
      values: array(),
    },
    {
      label: '最终结果',
      tone: 'result',
      caption: 'Sorted target',
      values: finalArray(),
    },
  ] as const);

  const snapshotSummary = (values: number[]) => {
    if (values.length === 0) return '0 items';
    return `${values.length} items · min ${Math.min(...values)} · max ${Math.max(...values)}`;
  };

  return (
    <main class="visualization-page">
      <div class="container">
        <div class="visualization-header">
          <h1>排序算法</h1>
          <p class="description">
            排序算法将无序的数据序列整理为有序序列。3D 可视化让你从多角度观察算法的执行过程。
            <span class="hint">鼠标拖拽旋转视角 · 滚轮缩放</span>
          </p>
        </div>

        <div class="controls">
          <div class="controls-group">
            <label for="sort-algorithm">算法</label>
            <Dropdown
              id="sort-algorithm"
              value={algorithm()}
              onChange={(value) => { setAlgorithm(value); resetSort(); }}
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
              min="5"
              max="40"
              value={arraySize()}
              onInput={(e) => { setArraySize(parseInt(e.currentTarget.value)); generateArray(); }}
            />
            <span>{arraySize()}</span>
          </div>
        </div>

        <div
          class="canvas-container sorting-preview-shell"
          data-view-mode={viewMode()}
        >
          <div
            ref={el => { container3DRef = el; }}
            class="three-container"
            style={{ display: viewMode() === '3d' ? 'block' : 'none' }}
          />
          <canvas
            ref={el => { canvas2DRef = el; }}
            class="sorting-canvas"
            style={{ display: viewMode() === '2d' ? 'block' : 'none' }}
          />
          <div class="three-hint" style={{ display: viewMode() === '3d' ? 'flex' : 'none' }}>
            <span>3D VIEW</span>
            <span class="three-hint-divider">·</span>
            <span>拖拽旋转</span>
            <span class="three-hint-divider">·</span>
            <span>滚轮缩放</span>
          </div>
          <div class="three-hint" style={{ display: viewMode() === '2d' ? 'flex' : 'none' }}>
            <span>2D VIEW</span>
          </div>
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
          extraControls={[
            {
              label: viewMode() === '2d' ? '切换到 3D' : '切换到 2D',
              onClick: toggleViewMode,
              variant: 'secondary' as const,
            },
          ]}
        />

        <div class="info-panel sorting-display-panel">
          <div class="sorting-display-header">
            <div>
              <h3>展示设置</h3>
              <div class="sorting-display-subtitle">控制完成态反馈与代码阅读方式</div>
            </div>
          </div>
          <div class="sorting-display-grid">
            <div class="sorting-display-group">
              <div class="sorting-display-label">完成特效</div>
              <div class="sorting-toggle-row">
                <button
                  class={`sorting-toggle-btn ${completionFxEnabled() ? 'active' : ''}`}
                  onClick={() => setCompletionFxEnabled(true)}
                  type="button"
                >
                  开启
                </button>
                <button
                  class={`sorting-toggle-btn ${!completionFxEnabled() ? 'active' : ''}`}
                  onClick={() => setCompletionFxEnabled(false)}
                  type="button"
                >
                  关闭
                </button>
              </div>
            </div>
            <div class="sorting-display-group">
              <div class="sorting-display-label">代码主题</div>
              <Dropdown
                class="code-toolbar-select"
                value={codeTheme()}
                onChange={(value) => setCodeTheme(value as 'zed' | 'dark' | 'light')}
                options={[
                  { label: 'Zed Theme', value: 'zed' },
                  { label: 'Dark', value: 'dark' },
                  { label: 'Light', value: 'light' },
                ]}
              />
            </div>
            <div class="sorting-display-group">
              <div class="sorting-display-label">代码字体</div>
              <Dropdown
                class="code-toolbar-select"
                value={codeFont()}
                onChange={(value) => setCodeFont(value as 'jetbrains' | 'ibm' | 'sfmono')}
                options={[
                  { label: 'JetBrains Mono', value: 'jetbrains' },
                  { label: 'IBM Plex Mono', value: 'ibm' },
                  { label: 'SF Mono', value: 'sfmono' },
                ]}
              />
            </div>
          </div>
        </div>

        <div class="info-panel data-snapshot-panel">
          <div class="data-snapshot-header">
            <div>
              <h3>数据快照</h3>
              <div class="data-snapshot-subtitle">为排序、树、图等视图保留统一的数据观察层</div>
            </div>
            <div class="data-snapshot-meta">{array().length} 个元素</div>
          </div>
          <div class="data-snapshot-grid">
            <For each={snapshotCards()}>
              {(card) => {
                const maxValue = Math.max(...card.values, 1);
                return (
                  <section class={`data-snapshot-card tone-${card.tone}`}>
                    <div class="data-snapshot-card-header">
                      <div>
                        <div class="data-snapshot-label">{card.label}</div>
                        <div class="data-snapshot-caption">{card.caption}</div>
                      </div>
                      <div class="data-snapshot-summary">{snapshotSummary(card.values)}</div>
                    </div>
                    <div class="data-snapshot-track" aria-hidden="true">
                      <For each={card.values}>
                        {(value) => (
                          <div class="data-snapshot-track-item">
                            <span
                              class="data-snapshot-track-bar"
                              style={{ height: `${Math.max(18, (value / maxValue) * 56)}px` }}
                            />
                            <span class="data-snapshot-track-value">{value}</span>
                          </div>
                        )}
                      </For>
                    </div>
                    <div class="data-snapshot-values">{renderArrayLine(card.values)}</div>
                  </section>
                );
              }}
            </For>
          </div>
        </div>

        <div class="info-panel">
          <h3>算法复杂度</h3>
          <div class="complexity">
            <div class="complexity-item">
              <div class="label">时间复杂度 (平均)</div>
              <div class="value" id="time-complexity">O(n²)</div>
            </div>
            <div class="complexity-item">
              <div class="label">时间复杂度 (最坏)</div>
              <div class="value" id="worst-time">O(n²)</div>
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
            <div class="code-toolbar">
              <Dropdown
                class="code-lang-select"
                value={lang()}
                onChange={(value) => setLang(value as Language)}
                options={Object.entries(languageLabels).map(([key, label]) => ({ value: key, label }))}
              />
              <span class="code-toolbar-chip">{codeThemeLabels[codeTheme()]}</span>
              <span class="code-toolbar-chip">{codeFontLabels[codeFont()]}</span>
            </div>
          </div>
          <pre class={`code-block code-block-prism code-theme-${codeTheme()} code-font-${codeFont()}`}>
            <code class={`language-${prismLanguage()}`} innerHTML={highlightedCode()} />
          </pre>
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
      </div>
    </main>
  );
}
