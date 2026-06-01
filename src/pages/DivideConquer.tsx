import { createSignal, onMount, onCleanup } from 'solid-js';
import ControlPanel from '../components/ControlPanel';
import { AnimationController, type AnimStep } from '../utils/animation';

type DCState =
  | {
      type: 'merge';
      array: number[];
      left: number;
      right: number;
      mid: number;
      phase: 'divide' | 'merge' | 'idle';
      current?: number;
    }
  | {
      type: 'hanoi';
      towers: number[][];
      from: number;
      to: number;
      disk: number;
      phase: 'idle' | 'moving';
    }
  | {
      type: 'fastexp';
      base: number;
      exp: number;
      result: number;
      currentBit: number;
      currentBase: number;
      done: boolean;
    };

export default function DivideConquer() {
  const [activeTab, setActiveTab] = createSignal('merge');
  const [isRunning, setIsRunning] = createSignal(false);
  const [steps, setSteps] = createSignal<string[]>([]);
  const [speed, setSpeed] = createSignal(50);
  const [mergeArray, setMergeArray] = createSignal([38, 27, 43, 3, 9, 82, 10]);
  const [disks, setDisks] = createSignal(4);
  const [base, setBase] = createSignal(3);
  const [exp, setExp] = createSignal(13);
  const [currentStep, setCurrentStep] = createSignal(-1);
  const [totalSteps, setTotalSteps] = createSignal(0);
  const [state, setState] = createSignal<DCState>({
    type: 'merge',
    array: [38, 27, 43, 3, 9, 82, 10],
    left: -1,
    right: -1,
    mid: -1,
    phase: 'idle',
  });
  let controller: AnimationController<DCState>;

  onMount(() => {
    controller = new AnimationController<DCState>({ speed: speed() });
    controller.setCallbacks(
      (step: AnimStep<DCState>) => {
        setState(step.state);
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
      if (e.key === ' ' || e.key === 'Space') { e.preventDefault(); if (isRunning()) pause(); else play(); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); controller.stepBackward(); }
      if (e.key === 'ArrowRight') { e.preventDefault(); controller.stepForward(); }
      if (e.key === 'r' || e.key === 'R') { e.preventDefault(); reset(); }
    };
    window.addEventListener('keydown', handleKeydown);

    onCleanup(() => {
      controller.destroy();
      window.removeEventListener('keydown', handleKeydown);
    });

    reset();
  });

  const buildMergeSteps = (arr: number[]): AnimStep<DCState>[] => {
    const steps: AnimStep<DCState>[] = [];
    const working = [...arr];

    steps.push({
      state: { type: 'merge', array: [...working], left: 0, right: arr.length - 1, mid: -1, phase: 'divide' },
      description: `归并排序: 初始范围 [0, ${arr.length - 1}]`,
    });

    const mergeSort = (left: number, right: number) => {
      if (left >= right) return;
      const mid = Math.floor((left + right) / 2);
      steps.push({
        state: { type: 'merge', array: [...working], left, right, mid, phase: 'divide' },
        description: `分治: [${left}, ${right}] -> [${left}, ${mid}] + [${mid + 1}, ${right}]`,
      });
      mergeSort(left, mid);
      mergeSort(mid + 1, right);

      steps.push({
        state: { type: 'merge', array: [...working], left, right, mid, phase: 'merge' },
        description: `合并: [${left}, ${mid}] 和 [${mid + 1}, ${right}]`,
      });

      const leftArr = working.slice(left, mid + 1);
      const rightArr = working.slice(mid + 1, right + 1);
      let i = 0, j = 0, k = left;
      while (i < leftArr.length && j < rightArr.length) {
        steps.push({
          state: { type: 'merge', array: [...working], left, right, mid, phase: 'merge', current: k },
          description: `比较 ${leftArr[i]} 和 ${rightArr[j]}, 放入位置 ${k}`,
        });
        if (leftArr[i] <= rightArr[j]) {
          working[k] = leftArr[i++];
        } else {
          working[k] = rightArr[j++];
        }
        steps.push({
          state: { type: 'merge', array: [...working], left, right, mid, phase: 'merge', current: k },
          description: `位置 ${k} 设为 ${working[k]}`,
        });
        k++;
      }
      while (i < leftArr.length) {
        working[k] = leftArr[i++];
        steps.push({
          state: { type: 'merge', array: [...working], left, right, mid, phase: 'merge', current: k },
          description: `复制剩余元素 ${working[k]} 到位置 ${k}`,
        });
        k++;
      }
      while (j < rightArr.length) {
        working[k] = rightArr[j++];
        steps.push({
          state: { type: 'merge', array: [...working], left, right, mid, phase: 'merge', current: k },
          description: `复制剩余元素 ${working[k]} 到位置 ${k}`,
        });
        k++;
      }
    };

    mergeSort(0, arr.length - 1);
    steps.push({
      state: { type: 'merge', array: [...working], left: 0, right: arr.length - 1, mid: -1, phase: 'idle' },
      description: '归并排序完成',
    });
    return steps;
  };

  const buildHanoiSteps = (n: number): AnimStep<DCState>[] => {
    const steps: AnimStep<DCState>[] = [];
    const towers: number[][] = [[], [], []];
    for (let i = n; i >= 1; i--) towers[0].push(i);

    steps.push({
      state: { type: 'hanoi', towers: [towers[0].slice(), [], []], from: -1, to: -1, disk: -1, phase: 'idle' },
      description: `汉诺塔: 将 ${n} 个圆盘从 A 移到 C`,
    });

    const hanoi = (num: number, from: number, to: number, aux: number) => {
      if (num === 0) return;
      hanoi(num - 1, from, aux, to);
      const disk = towers[from].pop()!;
      towers[to].push(disk);
      steps.push({
        state: { type: 'hanoi', towers: [towers[0].slice(), towers[1].slice(), towers[2].slice()], from, to, disk, phase: 'moving' },
        description: `移动圆盘 ${disk} 从 ${String.fromCharCode(65 + from)} 到 ${String.fromCharCode(65 + to)}`,
      });
      hanoi(num - 1, aux, to, from);
    };

    hanoi(n, 0, 2, 1);
    steps.push({
      state: { type: 'hanoi', towers: [towers[0].slice(), towers[1].slice(), towers[2].slice()], from: -1, to: -1, disk: -1, phase: 'idle' },
      description: '汉诺塔完成',
    });
    return steps;
  };

  const buildFastExpSteps = (b: number, e: number): AnimStep<DCState>[] => {
    const steps: AnimStep<DCState>[] = [];
    let baseVal = b;
    let expVal = e;
    let result = 1;

    steps.push({
      state: { type: 'fastexp', base: baseVal, exp: expVal, result, currentBit: -1, currentBase: baseVal, done: false },
      description: `快速幂: 计算 ${b}^${e}`,
    });

    while (expVal > 0) {
      const bit = expVal & 1;
      steps.push({
        state: { type: 'fastexp', base: baseVal, exp: expVal, result, currentBit: bit, currentBase: baseVal, done: false },
        description: `检查最低位: ${bit}`,
      });
      if (bit === 1) {
        result *= baseVal;
        steps.push({
          state: { type: 'fastexp', base: baseVal, exp: expVal, result, currentBit: bit, currentBase: baseVal, done: false },
          description: `位为 1: result = result × ${baseVal} = ${result}`,
        });
      } else {
        steps.push({
          state: { type: 'fastexp', base: baseVal, exp: expVal, result, currentBit: bit, currentBase: baseVal, done: false },
          description: `位为 0: result 不变`,
        });
      }
      baseVal *= baseVal;
      expVal >>= 1;
      if (expVal > 0) {
        steps.push({
          state: { type: 'fastexp', base: baseVal, exp: expVal, result, currentBit: -1, currentBase: baseVal, done: false },
          description: `base 平方: ${baseVal}, exp 右移: ${expVal}`,
        });
      }
    }

    steps.push({
      state: { type: 'fastexp', base: b, exp: e, result, currentBit: -1, currentBase: 0, done: true },
      description: `结果: ${b}^${e} = ${result}`,
    });
    return steps;
  };

  const start = () => {
    if (isRunning()) return;
    setIsRunning(true);
    setSteps([]);

    let animSteps: AnimStep<DCState>[] = [];
    if (activeTab() === 'merge') {
      animSteps = buildMergeSteps([...mergeArray()]);
    } else if (activeTab() === 'hanoi') {
      animSteps = buildHanoiSteps(disks());
    } else if (activeTab() === 'fastexp') {
      animSteps = buildFastExpSteps(base(), exp());
    }

    controller.setSteps(animSteps);
    controller.setSpeed(speed());
    controller.play().then(() => {
      setIsRunning(false);
      setSteps(prev => ['算法执行完成', ...prev]);
    });
  };

  const play = () => {
    if (controller.isAtEnd() || controller.isEmpty()) start();
    else { setIsRunning(true); controller.play().then(() => setIsRunning(false)); }
  };

  const pause = () => { controller.pause(); setIsRunning(false); };

  const generateMergeArray = () => {
    const arr: number[] = [];
    for (let i = 0; i < 8; i++) arr.push(Math.floor(Math.random() * 90) + 10);
    setMergeArray(arr);
    reset();
  };

  const reset = () => {
    controller.pause();
    setIsRunning(false);
    if (activeTab() === 'merge') {
      setState({ type: 'merge', array: [...mergeArray()], left: -1, right: -1, mid: -1, phase: 'idle' });
    } else if (activeTab() === 'hanoi') {
      const n = disks();
      const t: number[][] = [[], [], []];
      for (let i = n; i >= 1; i--) t[0].push(i);
      setState({ type: 'hanoi', towers: t, from: -1, to: -1, disk: -1, phase: 'idle' });
    } else {
      setState({ type: 'fastexp', base: base(), exp: exp(), result: 1, currentBit: -1, currentBase: base(), done: false });
    }
    setSteps([]);
    setCurrentStep(-1);
    setTotalSteps(0);
  };

  const handleStepForward = () => { if (!isRunning()) controller.stepForward(); };
  const handleStepBackward = () => { if (!isRunning()) controller.stepBackward(); };
  const handleSpeedChange = (newSpeed: number) => { setSpeed(newSpeed); controller.setSpeed(newSpeed); };

  const tabs = [
    { id: 'merge', label: '归并排序' },
    { id: 'hanoi', label: '汉诺塔' },
    { id: 'fastexp', label: '快速幂' },
  ];

  return (
    <main class="visualization-page">
      <div class="container">
        <div class="visualization-header">
          <h1>分治算法</h1>
          <p class="description">分治法将问题分解为更小的子问题，分别解决后再合并结果。经典应用包括归并排序、汉诺塔、快速幂等。</p>
        </div>
        <div style={{ display: 'flex', gap: '0', 'border-bottom': '1px solid var(--border)', 'margin-bottom': '2rem' }}>
          {tabs.map(tab => (
            <div
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

        {activeTab() === 'merge' && (
          <div>
            <div class="controls">
              <div class="controls-group">
                <button class="btn" onClick={generateMergeArray}>生成新数组</button>
              </div>
            </div>
            <div class="canvas-container canvas-container-enhanced" style={{ padding: '2rem', 'min-height': '120px' }}>
              {(() => {
                const s = state();
                if (s.type !== 'merge') return null;
                return (
                  <div style={{ display: 'flex', gap: '4px', 'justify-content': 'center', 'flex-wrap': 'wrap' }}>
                    {s.array.map((val, i) => {
                      const inRange = i >= s.left && i <= s.right;
                      const inLeftHalf = i >= s.left && i <= s.mid;
                      const inRightHalf = i > s.mid && i <= s.right;
                      const isCurrent = s.current === i;
                      let bg = '#f5f5f5';
                      let color = '#1a1a1a';
                      let shadow = '';
                      if (inRange && s.phase === 'divide') { bg = '#cccccc'; }
                      if (inLeftHalf && s.phase === 'merge') { bg = '#999999'; color = '#fff'; }
                      if (inRightHalf && s.phase === 'merge') { bg = '#666666'; color = '#fff'; }
                      if (isCurrent) { bg = '#1a1a1a'; color = '#fff'; shadow = '0 0 12px rgba(0,0,0,0.4)'; }
                      return (
                        <div style={{
                          width: '52px', height: '52px',
                          display: 'flex', 'align-items': 'center', 'justify-content': 'center',
                          background: bg, color,
                          'font-family': 'var(--font-mono)', 'font-size': '0.9rem',
                          border: '1px solid var(--border)', 'border-radius': '6px',
                          transition: 'all 0.2s ease', 'box-shadow': shadow,
                        }}>{val}</div>
                      );
                    })}
                  </div>
                );
              })()}
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
              onGenerate={generateMergeArray}
            />
            <div class="info-panel">
              <h3>归并排序 (Merge Sort)</h3>
              <p>将数组分成两半，分别排序后合并。分治思想的经典应用。</p>
              <div class="complexity">
                <div class="complexity-item"><div class="label">时间复杂度</div><div class="value">O(n log n)</div></div>
                <div class="complexity-item"><div class="label">空间复杂度</div><div class="value">O(n)</div></div>
                <div class="complexity-item"><div class="label">稳定性</div><div class="value">稳定</div></div>
              </div>
            </div>
          </div>
        )}

        {activeTab() === 'hanoi' && (
          <div>
            <div class="controls">
              <div class="controls-group">
                <label>圆盘数量</label>
                <input type="range" min="3" max="6" value={disks()} onInput={e => { setDisks(parseInt(e.currentTarget.value)); reset(); }} />
                <span>{disks()}</span>
              </div>
            </div>
            <div class="canvas-container canvas-container-enhanced" style={{ padding: '2rem', 'min-height': '320px', display: 'flex', 'justify-content': 'center', gap: '2rem' }}>
              {(() => {
                const s = state();
                if (s.type !== 'hanoi') return null;
                return s.towers.map((tower, ti) => {
                  const isFrom = s.from === ti;
                  const isTo = s.to === ti;
                  return (
                    <div style={{ display: 'flex', 'flex-direction': 'column', 'align-items': 'center', gap: '0.5rem' }}>
                      <span style={{ 'font-size': '0.85rem', color: 'var(--text-tertiary)', 'text-transform': 'uppercase', 'letter-spacing': '0.05em', 'font-weight': isFrom || isTo ? '600' : '400' }}>
                        {String.fromCharCode(65 + ti)} 柱
                      </span>
                      <div style={{
                        display: 'flex', 'flex-direction': 'column-reverse', 'align-items': 'center', gap: '2px',
                        width: '140px', 'min-height': '220px',
                        'border-bottom': '4px solid var(--border)',
                        'padding-bottom': '4px',
                        background: isFrom ? 'rgba(0,0,0,0.03)' : isTo ? 'rgba(0,0,0,0.05)' : 'transparent',
                        transition: 'background 0.2s ease',
                      }}>
                        {tower.length === 0 ? (
                          <span style={{ color: 'var(--text-tertiary)', 'font-size': '0.75rem' }}>空</span>
                        ) : tower.map((disk) => (
                          <div style={{
                            height: '24px',
                            width: `${disk * 14 + 24}px`,
                            'max-width': '130px',
                            background: s.disk === disk ? '#1a1a1a' : '#666666',
                            color: '#fff',
                            display: 'flex', 'align-items': 'center', 'justify-content': 'center',
                            'font-family': 'var(--font-mono)', 'font-size': '0.75rem',
                            'border-radius': '4px',
                            'box-shadow': s.disk === disk ? '0 0 16px rgba(0,0,0,0.5)' : 'none',
                            transition: 'all 0.3s ease',
                          }}>{disk}</div>
                        ))}
                      </div>
                    </div>
                  );
                });
              })()}
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
              <h3>汉诺塔 (Tower of Hanoi)</h3>
              <p>将 n 个圆盘从柱子 A 借助柱子 B 移动到柱子 C，每次只能移动一个圆盘且大盘不能压在小盘上。</p>
              <div class="complexity">
                <div class="complexity-item"><div class="label">递归公式</div><div class="value">T(n) = 2T(n-1) + 1</div></div>
                <div class="complexity-item"><div class="label">移动次数</div><div class="value">2ⁿ - 1</div></div>
                <div class="complexity-item"><div class="label">时间复杂度</div><div class="value">O(2ⁿ)</div></div>
              </div>
            </div>
          </div>
        )}

        {activeTab() === 'fastexp' && (
          <div>
            <div class="controls">
              <div class="controls-group">
                <label>底数</label>
                <input type="number" value={base()} onChange={e => { setBase(parseInt(e.currentTarget.value) || 2); reset(); }} style={{ width: '80px', padding: '0.5rem', border: '1px solid var(--border)' }} />
              </div>
              <div class="controls-group">
                <label>指数</label>
                <input type="number" value={exp()} onChange={e => { setExp(parseInt(e.currentTarget.value) || 1); reset(); }} style={{ width: '80px', padding: '0.5rem', border: '1px solid var(--border)' }} />
              </div>
            </div>
            <div class="canvas-container canvas-container-enhanced" style={{ padding: '2rem', 'min-height': '180px' }}>
              {(() => {
                const s = state();
                if (s.type !== 'fastexp') return null;
                const binaryStr = (s.exp).toString(2);
                return (
                  <div style={{ display: 'flex', 'flex-direction': 'column', gap: '1.5rem', 'align-items': 'center' }}>
                    <div style={{ display: 'flex', gap: '1.5rem', 'align-items': 'center', 'flex-wrap': 'wrap', 'justify-content': 'center' }}>
                      <div style={{ display: 'flex', 'flex-direction': 'column', 'align-items': 'center', gap: '0.5rem' }}>
                        <span style={{ 'font-size': '0.75rem', color: 'var(--text-tertiary)' }}>base</span>
                        <div style={{
                          padding: '1rem 1.5rem',
                          background: '#1a1a1a', color: '#fff',
                          'font-family': 'var(--font-mono)', 'font-size': '1.5rem',
                          'border-radius': '8px', 'min-width': '80px', 'text-align': 'center',
                          'box-shadow': '0 4px 12px rgba(0,0,0,0.15)',
                        }}>{s.base}</div>
                      </div>
                      <span style={{ 'font-size': '1.5rem', color: 'var(--text-tertiary)' }}>×</span>
                      <div style={{ display: 'flex', 'flex-direction': 'column', 'align-items': 'center', gap: '0.5rem' }}>
                        <span style={{ 'font-size': '0.75rem', color: 'var(--text-tertiary)' }}>result</span>
                        <div style={{
                          padding: '1rem 1.5rem',
                          background: s.result > 1 ? '#1a1a1a' : '#f5f5f5',
                          color: s.result > 1 ? '#fff' : '#1a1a1a',
                          'font-family': 'var(--font-mono)', 'font-size': '1.5rem',
                          'border-radius': '8px', 'min-width': '80px', 'text-align': 'center',
                          'box-shadow': s.result > 1 ? '0 0 16px rgba(0,0,0,0.3)' : 'none',
                          transition: 'all 0.3s ease',
                        }}>{s.result}</div>
                      </div>
                    </div>
                    {binaryStr && (
                      <div style={{ display: 'flex', 'flex-direction': 'column', 'align-items': 'center', gap: '0.5rem' }}>
                        <span style={{ 'font-size': '0.75rem', color: 'var(--text-tertiary)' }}>exp (二进制)</span>
                        <div style={{ display: 'flex', gap: '4px' }}>
                          {binaryStr.split('').map((bit, i) => {
                            const bitPos = binaryStr.length - 1 - i;
                            const isCurrent = s.currentBit >= 0 && (s.exp & 1) === parseInt(bit) && bitPos === 0;
                            return (
                              <div style={{
                                width: '32px', height: '32px',
                                display: 'flex', 'align-items': 'center', 'justify-content': 'center',
                                background: bit === '1' ? '#1a1a1a' : '#f5f5f5',
                                color: bit === '1' ? '#fff' : '#1a1a1a',
                                'font-family': 'var(--font-mono)', 'font-size': '0.9rem',
                                border: '1px solid var(--border)', 'border-radius': '4px',
                                'box-shadow': isCurrent ? '0 0 12px rgba(0,0,0,0.4)' : 'none',
                              }}>{bit}</div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                    {s.done && (
                      <div style={{ padding: '1rem 2rem', background: '#1a1a1a', color: '#fff', 'font-family': 'var(--font-mono)', 'font-size': '1.2rem', 'border-radius': '8px', 'box-shadow': '0 4px 16px rgba(0,0,0,0.2)' }}>
                        {base()}^{exp()} = {s.result}
                      </div>
                    )}
                  </div>
                );
              })()}
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
              <h3>快速幂 (Fast Exponentiation)</h3>
              <p>利用指数的二进制表示，将幂运算的时间复杂度从 O(n) 优化到 O(log n)。</p>
              <div class="complexity">
                <div class="complexity-item"><div class="label">核心思想</div><div class="value">平方倍增</div></div>
                <div class="complexity-item"><div class="label">时间复杂度</div><div class="value">O(log n)</div></div>
              </div>
            </div>
          </div>
        )}

        <div class="steps-panel">
          <h3>执行步骤</h3>
          <div>
            {steps().length === 0 ? (
              <div class="step-item">点击播放按钮开始分治算法可视化</div>
            ) : (
              steps().map(step => <div class="step-item active">{step}</div>)
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
