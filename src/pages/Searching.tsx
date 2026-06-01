import { createSignal, onMount, onCleanup } from 'solid-js';
import { searchingCodes, languageLabels, type Language } from '../utils/codeData';
import Dropdown from '../components/Dropdown';
import CodePanel from '../components/CodePanel';
import ControlPanel from '../components/ControlPanel';
import { DoubleBufferedRenderer } from '../utils/canvasRenderer';
import { AnimationController, type AnimStep } from '../utils/animation';

export default function Searching() {
  let canvasRef: HTMLCanvasElement;
  let renderer: DoubleBufferedRenderer;
  let controller: AnimationController<number[]>;
  const [algorithm, setAlgorithm] = createSignal('linear');
  const [arraySize, setArraySize] = createSignal(50);
  const [speed, setSpeed] = createSignal(50);
  const [isRunning, setIsRunning] = createSignal(false);
  const [steps, setSteps] = createSignal<string[]>([]);
  const [lang, setLang] = createSignal<Language>('javascript');
  const [target, setTarget] = createSignal(42);
  const [array, setArray] = createSignal<number[]>([]);
  const [currentStep, setCurrentStep] = createSignal(-1);
  const [totalSteps, setTotalSteps] = createSignal(0);

  onMount(() => {
    renderer = new DoubleBufferedRenderer(canvasRef, {
      barColor: '#cccccc',
      comparingColor: '#555555',
      swappingColor: '#1a1a1a',
      sortedColor: '#888888',
      pivotColor: '#333333',
      backgroundColor: '#ffffff',
      gradientEnabled: true,
      glowEnabled: true,
      particleEnabled: true,
    });
    controller = new AnimationController<number[]>({ speed: speed() });
    controller.setCallbacks(
      (step: AnimStep<number[]>) => {
        const arr = step.state;
        renderer.render({
          array: arr,
          comparing: step.highlight || [],
          swapping: [],
          sorted: step.sorted || [],
        });

        if (step.swap) {
          const barWidth = canvasRef.getBoundingClientRect().width / arr.length;
          const x = (step.swap[0] + 0.5) * barWidth;
          const height = canvasRef.getBoundingClientRect().height;
          renderer.emitParticles(x, height - 100, 20, '#1a1a1a');
        }

        setSteps(prev => [step.description, ...prev].slice(0, 30));
      },
      (state, index, total) => {
        setCurrentStep(index);
        setTotalSteps(total);
      }
    );

    generateArray();

    const handleKeydown = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'Space') {
        e.preventDefault();
        if (isRunning()) pauseSearch();
        else playSearch();
      }
      if (e.key === 'ArrowLeft') controller.stepBackward();
      if (e.key === 'ArrowRight') controller.stepForward();
      if (e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        resetSearch();
      }
    };
    window.addEventListener('keydown', handleKeydown);

    onCleanup(() => {
      controller.destroy();
      renderer.destroy();
      window.removeEventListener('keydown', handleKeydown);
    });
  });

  const generateArray = () => {
    const arr: number[] = [];
    for (let i = 0; i < arraySize(); i++) arr.push(Math.floor(Math.random() * 85) + 15);
    arr.sort((a, b) => a - b);
    setArray(arr);
    controller.reset();
    controller.setSteps([]);
    setSteps([]);
    setCurrentStep(-1);
    setTotalSteps(0);
    renderer.render({ array: arr, comparing: [], swapping: [], sorted: [] });
  };

  const buildSteps = (arr: number[], algo: string, target: number) => {
    const steps: AnimStep<number[]>[] = [];

    if (algo === 'linear') {
      for (let i = 0; i < arr.length; i++) {
        steps.push({
          state: [...arr],
          description: `检查索引 ${i}: 值 = ${arr[i]}`,
          highlight: [i],
        });
        if (arr[i] === target) {
          steps.push({
            state: [...arr],
            description: `找到目标值 ${target}! 索引: ${i}`,
            swap: [i, i],
          });
          return steps;
        }
      }
      steps.push({ state: [...arr], description: `未找到目标值 ${target}` });
    } else {
      let low = 0, high = arr.length - 1;
      while (low <= high) {
        const mid = Math.floor((low + high) / 2);
        steps.push({
          state: [...arr],
          description: `范围 [${low}, ${high}], 中间: 索引 ${mid}, 值 ${arr[mid]}`,
          highlight: [mid],
          sorted: Array.from({ length: high - low + 1 }, (_, i) => low + i),
        });
        if (arr[mid] === target) {
          steps.push({
            state: [...arr],
            description: `找到目标值 ${target}! 索引: ${mid}`,
            swap: [mid, mid],
          });
          return steps;
        } else if (arr[mid] < target) {
          steps.push({
            state: [...arr],
            description: `${arr[mid]} < ${target}, 搜索右半部分`,
            sorted: Array.from({ length: high - mid }, (_, i) => mid + 1 + i),
          });
          low = mid + 1;
        } else {
          steps.push({
            state: [...arr],
            description: `${arr[mid]} > ${target}, 搜索左半部分`,
            sorted: Array.from({ length: mid - low }, (_, i) => low + i),
          });
          high = mid - 1;
        }
      }
      steps.push({ state: [...arr], description: `未找到目标值 ${target}` });
    }

    return steps;
  };

  const startSearch = () => {
    if (isRunning()) return;
    setIsRunning(true);
    setSteps([]);

    const arr = [...array()];
    const t = target();
    const steps = buildSteps(arr, algorithm(), t);
    controller.setSteps(steps);
    controller.setSpeed(speed());
    controller.play().then(() => {
      setIsRunning(false);
      setSteps(prev => [`搜索完成`, ...prev]);
    });
  };

  const playSearch = () => {
    if (controller.isAtEnd() || controller.isEmpty()) {
      startSearch();
    } else {
      setIsRunning(true);
      controller.play().then(() => setIsRunning(false));
    }
  };

  const pauseSearch = () => {
    controller.pause();
    setIsRunning(false);
  };

  const resetSearch = () => {
    controller.pause();
    setIsRunning(false);
    generateArray();
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
              onChange={(value) => {
                setAlgorithm(value);
                resetSearch();
              }}
              options={[
                { label: '线性搜索', value: 'linear' },
                { label: '二分搜索', value: 'binary' },
              ]}
            />
          </div>
          <div class="controls-group">
            <label>数组大小</label>
            <input type="range" min="10" max="100" value={arraySize()} onInput={e => {
              setArraySize(parseInt(e.currentTarget.value));
              generateArray();
            }} />
            <span>{arraySize()}</span>
          </div>
          <div class="controls-group">
            <label>目标值</label>
            <input type="number" value={target()} onChange={e => setTarget(parseInt(e.currentTarget.value))} style={{ width: '80px', padding: '0.5rem', border: '1px solid var(--border)' }} />
          </div>
        </div>

        <div class="canvas-container canvas-container-enhanced">
          <canvas ref={el => canvasRef = el} style={{ width: '100%', height: '400px', display: 'block' }} />
        </div>

        <ControlPanel
          isRunning={isRunning()}
          speed={speed()}
          currentStep={currentStep()}
          totalSteps={totalSteps()}
          onPlay={playSearch}
          onPause={pauseSearch}
          onReset={resetSearch}
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
              <div class="step-item">点击播放按钮开始算法可视化</div>
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
