import { createSignal, onMount, onCleanup, Show } from 'solid-js';
import { AnimationController, type AnimStep } from '../utils/animation';
import ControlPanel from '../components/ControlPanel';

interface KnapsackItem {
  weight: number;
  value: number;
}

interface LCSCell {
  value: number;
  direction?: 'diag' | 'up' | 'left';
}

interface DPState {
  type: 'fib' | 'knapsack' | 'lcs';
  fibArray: number[];
  fibCurrentIndex: number;
  knapsackDP: number[][];
  knapsackCurrent: { row: number; col: number } | null;
  knapsackSelected: number[];
  lcsDP: LCSCell[][];
  lcsCurrent: { row: number; col: number } | null;
  lcsResult: string;
  lcsPath: { row: number; col: number }[];
}

export default function Advanced() {
  const [activeTab, setActiveTab] = createSignal('fib');
  const [isRunning, setIsRunning] = createSignal(false);
  const [steps, setSteps] = createSignal<string[]>([]);
  const [speed, setSpeed] = createSignal(50);
  const [fibN, setFibN] = createSignal(10);
  const [knapsackItems, setKnapsackItems] = createSignal<KnapsackItem[]>([
    { weight: 2, value: 3 },
    { weight: 3, value: 4 },
    { weight: 4, value: 5 },
    { weight: 5, value: 8 },
  ]);
  const [knapsackCapacity, setKnapsackCapacity] = createSignal(8);
  const [knapsackInput, setKnapsackInput] = createSignal('2,3,4,3,4,5,5,8,6,10');
  const [lcsStr1, setLcsStr1] = createSignal('ABCBDAB');
  const [lcsStr2, setLcsStr2] = createSignal('BDCAB');
  const [currentStep, setCurrentStep] = createSignal(-1);
  const [totalSteps, setTotalSteps] = createSignal(0);
  const [state, setState] = createSignal<DPState>({
    type: 'fib',
    fibArray: [],
    fibCurrentIndex: -1,
    knapsackDP: [],
    knapsackCurrent: null,
    knapsackSelected: [],
    lcsDP: [],
    lcsCurrent: null,
    lcsResult: '',
    lcsPath: [],
  });
  let controller: AnimationController<DPState>;

  onMount(() => {
    controller = new AnimationController<DPState>({ speed: speed() });
    controller.setCallbacks(
      (step: AnimStep<DPState>) => {
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

  const buildFibSteps = (n: number): AnimStep<DPState>[] => {
    const steps: AnimStep<DPState>[] = [];
    const dp = new Array(n + 1).fill(0);
    dp[0] = 0; dp[1] = 1;

    steps.push({
      state: {
        type: 'fib',
        fibArray: [...dp],
        fibCurrentIndex: 1,
        knapsackDP: [],
        knapsackCurrent: null,
        knapsackSelected: [],
        lcsDP: [],
        lcsCurrent: null,
        lcsResult: '',
        lcsPath: [],
      },
      description: '初始化: dp[0] = 0, dp[1] = 1',
    });

    for (let i = 2; i <= n; i++) {
      dp[i] = dp[i - 1] + dp[i - 2];
      steps.push({
        state: {
          type: 'fib',
          fibArray: [...dp],
          fibCurrentIndex: i,
          knapsackDP: [],
          knapsackCurrent: null,
          knapsackSelected: [],
          lcsDP: [],
          lcsCurrent: null,
          lcsResult: '',
          lcsPath: [],
        },
        description: `dp[${i}] = dp[${i - 1}] + dp[${i - 2}] = ${dp[i - 1]} + ${dp[i - 2]} = ${dp[i]}`,
      });
    }

    steps.push({
      state: {
        type: 'fib',
        fibArray: [...dp],
        fibCurrentIndex: -1,
        knapsackDP: [],
        knapsackCurrent: null,
        knapsackSelected: [],
        lcsDP: [],
        lcsCurrent: null,
        lcsResult: '',
        lcsPath: [],
      },
      description: `斐波那契数列前 ${n} 项完成`,
    });
    return steps;
  };

  const buildKnapsackSteps = (items: KnapsackItem[], W: number): AnimStep<DPState>[] => {
    const steps: AnimStep<DPState>[] = [];
    const n = items.length;
    const dp: number[][] = Array(n + 1).fill(null).map(() => Array(W + 1).fill(0));

    steps.push({
      state: {
        type: 'knapsack',
        fibArray: [],
        fibCurrentIndex: -1,
        knapsackDP: dp.map(row => [...row]),
        knapsackCurrent: null,
        knapsackSelected: [],
        lcsDP: [],
        lcsCurrent: null,
        lcsResult: '',
        lcsPath: [],
      },
      description: `初始化 ${n} 个物品, 背包容量 ${W}`,
    });

    for (let i = 1; i <= n; i++) {
      const w = items[i - 1].weight;
      const v = items[i - 1].value;
      for (let j = 0; j <= W; j++) {
        if (w <= j) {
          const notTake = dp[i - 1][j];
          const take = dp[i - 1][j - w] + v;
          const old = dp[i][j];
          dp[i][j] = Math.max(notTake, take);
          steps.push({
            state: {
              type: 'knapsack',
              fibArray: [],
              fibCurrentIndex: -1,
              knapsackDP: dp.map(row => [...row]),
              knapsackCurrent: { row: i, col: j },
              knapsackSelected: [],
              lcsDP: [],
              lcsCurrent: null,
              lcsResult: '',
              lcsPath: [],
            },
            description: old === take
              ? `dp[${i}][${j}] = max(${notTake}, ${take}) = ${take} (取物品 ${i})`
              : `dp[${i}][${j}] = max(${notTake}, ${take}) = ${notTake} (不取)`,
          });
        } else {
          dp[i][j] = dp[i - 1][j];
          steps.push({
            state: {
              type: 'knapsack',
              fibArray: [],
              fibCurrentIndex: -1,
              knapsackDP: dp.map(row => [...row]),
              knapsackCurrent: { row: i, col: j },
              knapsackSelected: [],
              lcsDP: [],
              lcsCurrent: null,
              lcsResult: '',
              lcsPath: [],
            },
            description: `dp[${i}][${j}] = dp[${i - 1}][${j}] = ${dp[i][j]} (物品 ${i} 重量 ${w} 超过 ${j})`,
          });
        }
      }
    }

    steps.push({
      state: {
        type: 'knapsack',
        fibArray: [],
        fibCurrentIndex: -1,
        knapsackDP: dp.map(row => [...row]),
        knapsackCurrent: null,
        knapsackSelected: [],
        lcsDP: [],
        lcsCurrent: null,
        lcsResult: '',
        lcsPath: [],
      },
      description: `最大价值: ${dp[n][W]}`,
    });

    let w = W;
    const selected: number[] = [];
    for (let i = n; i > 0 && w > 0; i--) {
      if (dp[i][w] !== dp[i - 1][w]) {
        selected.push(i - 1);
        w -= items[i - 1].weight;
        steps.push({
          state: {
            type: 'knapsack',
            fibArray: [],
            fibCurrentIndex: -1,
            knapsackDP: dp.map(row => [...row]),
            knapsackCurrent: null,
            knapsackSelected: [...selected],
            lcsDP: [],
            lcsCurrent: null,
            lcsResult: '',
            lcsPath: [],
          },
          description: `回溯选择物品 ${i} (价值 ${items[i - 1].value}, 重量 ${items[i - 1].weight})`,
        });
      }
    }

    return steps;
  };

  const buildLCSSteps = (s1: string, s2: string): AnimStep<DPState>[] => {
    const steps: AnimStep<DPState>[] = [];
    const m = s1.length;
    const n = s2.length;
    const dp: LCSCell[][] = Array(m + 1).fill(null).map(() =>
      Array(n + 1).fill(null).map(() => ({ value: 0 }))
    );

    steps.push({
      state: {
        type: 'lcs',
        fibArray: [],
        fibCurrentIndex: -1,
        knapsackDP: [],
        knapsackCurrent: null,
        knapsackSelected: [],
        lcsDP: dp.map(row => row.map(c => ({ ...c }))),
        lcsCurrent: null,
        lcsResult: '',
        lcsPath: [],
      },
      description: `字符串1: "${s1}", 字符串2: "${s2}"`,
    });

    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        if (s1[i - 1] === s2[j - 1]) {
          dp[i][j] = { value: dp[i - 1][j - 1].value + 1, direction: 'diag' };
          steps.push({
            state: {
              type: 'lcs',
              fibArray: [],
              fibCurrentIndex: -1,
              knapsackDP: [],
              knapsackCurrent: null,
              knapsackSelected: [],
              lcsDP: dp.map(row => row.map(c => ({ ...c }))),
              lcsCurrent: { row: i, col: j },
              lcsResult: '',
              lcsPath: [],
            },
            description: `s1[${i - 1}]='${s1[i - 1]}' == s2[${j - 1}]='${s2[j - 1]}': LCS[${i}][${j}] = ${dp[i][j].value}`,
          });
        } else {
          if (dp[i - 1][j].value >= dp[i][j - 1].value) {
            dp[i][j] = { value: dp[i - 1][j].value, direction: 'up' };
          } else {
            dp[i][j] = { value: dp[i][j - 1].value, direction: 'left' };
          }
          steps.push({
            state: {
              type: 'lcs',
              fibArray: [],
              fibCurrentIndex: -1,
              knapsackDP: [],
              knapsackCurrent: null,
              knapsackSelected: [],
              lcsDP: dp.map(row => row.map(c => ({ ...c }))),
              lcsCurrent: { row: i, col: j },
              lcsResult: '',
              lcsPath: [],
            },
            description: `s1[${i - 1}]='${s1[i - 1]}' != s2[${j - 1}]='${s2[j - 1]}': LCS[${i}][${j}] = max(${dp[i - 1][j].value}, ${dp[i][j - 1].value}) = ${dp[i][j].value}`,
          });
        }
      }
    }

    let lcs = '';
    const path: { row: number; col: number }[] = [];
    let i = m, j = n;
    while (i > 0 && j > 0) {
      path.push({ row: i, col: j });
      if (dp[i][j].direction === 'diag') {
        lcs = s1[i - 1] + lcs;
        i--; j--;
      } else if (dp[i][j].direction === 'up') {
        i--;
      } else {
        j--;
      }
    }

    steps.push({
      state: {
        type: 'lcs',
        fibArray: [],
        fibCurrentIndex: -1,
        knapsackDP: [],
        knapsackCurrent: null,
        knapsackSelected: [],
        lcsDP: dp.map(row => row.map(c => ({ ...c }))),
        lcsCurrent: null,
        lcsResult: lcs,
        lcsPath: path,
      },
      description: `LCS: "${lcs}" (长度: ${lcs.length})`,
    });

    return steps;
  };

  const start = () => {
    if (isRunning()) return;
    setIsRunning(true);
    setSteps([]);

    let animSteps: AnimStep<DPState>[] = [];
    const tab = activeTab();

    if (tab === 'fib') {
      animSteps = buildFibSteps(fibN());
    } else if (tab === 'knapsack') {
      animSteps = buildKnapsackSteps(knapsackItems(), knapsackCapacity());
    } else if (tab === 'lcs') {
      animSteps = buildLCSSteps(lcsStr1(), lcsStr2());
    }

    controller.setSteps(animSteps);
    controller.setSpeed(speed());
    controller.play().then(() => {
      setIsRunning(false);
      setSteps(prev => ['计算完成', ...prev]);
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
    setState({
      type: activeTab() as 'fib' | 'knapsack' | 'lcs',
      fibArray: [],
      fibCurrentIndex: -1,
      knapsackDP: [],
      knapsackCurrent: null,
      knapsackSelected: [],
      lcsDP: [],
      lcsCurrent: null,
      lcsResult: '',
      lcsPath: [],
    });
    setSteps([]);
    setCurrentStep(-1);
    setTotalSteps(0);
  };

  const parseKnapsackInput = () => {
    const values = knapsackInput().split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n) && n > 0);
    const items: KnapsackItem[] = [];
    for (let i = 0; i < values.length - 1; i += 2) {
      items.push({ weight: values[i], value: values[i + 1] });
    }
    if (items.length > 0) {
      setKnapsackItems(items);
      reset();
    }
  };

  const handleStepForward = () => { if (!isRunning()) controller.stepForward(); };
  const handleStepBackward = () => { if (!isRunning()) controller.stepBackward(); };
  const handleSpeedChange = (newSpeed: number) => { setSpeed(newSpeed); controller.setSpeed(newSpeed); };

  const tabs = [
    { id: 'fib', label: '斐波那契' },
    { id: 'knapsack', label: '01背包' },
    { id: 'lcs', label: '最长公共子序列' },
  ];

  return (
    <main class="visualization-page">
      <div class="container">
        <div class="visualization-header">
          <h1>动态规划</h1>
          <p class="description">动态规划通过将问题分解为子问题并存储子问题的解来避免重复计算。</p>
        </div>
        <div style={{ display: 'flex', gap: '0', 'border-bottom': '1px solid var(--border)', 'margin-bottom': '2rem' }}>
          {tabs.map(tab => (
            <div
              class="dp-tab"
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

        <Show when={activeTab() === 'fib'}>
          <div class="controls">
            <div class="controls-group">
              <label>项数 n</label>
              <input type="range" min="5" max="20" value={fibN()} onInput={e => { setFibN(parseInt(e.currentTarget.value)); reset(); }} />
              <span>{fibN()}</span>
            </div>
          </div>
          <div class="canvas-container canvas-container-enhanced" style={{ padding: '2rem', 'min-height': '180px' }}>
            <div style={{ display: 'flex', gap: '0.5rem', 'flex-wrap': 'wrap', 'align-items': 'flex-end', 'justify-content': 'center', 'min-height': '120px' }}>
              {state().fibArray.map((val, i) => (
                <div style={{ display: 'flex', 'flex-direction': 'column', 'align-items': 'center', gap: '0.25rem' }}>
                  <span style={{ 'font-size': '0.75rem', color: 'var(--text-secondary)', 'font-family': 'var(--font-mono)' }}>{val}</span>
                  <div style={{
                    width: '36px',
                    background: i === state().fibCurrentIndex ? '#1a1a1a' : (i === 0 || i === 1 ? '#cccccc' : '#666666'),
                    'box-shadow': i === state().fibCurrentIndex ? '0 0 12px rgba(0,0,0,0.3)' : 'none',
                    height: `${Math.min(val * 2 + 10, 100)}px`,
                    transition: 'all 0.3s ease',
                  }} />
                  <span style={{ 'font-size': '0.7rem', color: 'var(--text-tertiary)' }}>dp[{i}]</span>
                </div>
              ))}
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
            <h3>斐波那契数列</h3>
            <div class="complexity">
              <div class="complexity-item"><div class="label">递推公式</div><div class="value">dp[i] = dp[i-1] + dp[i-2]</div></div>
              <div class="complexity-item"><div class="label">时间复杂度</div><div class="value">O(n)</div></div>
              <div class="complexity-item"><div class="label">空间复杂度</div><div class="value">O(n)</div></div>
            </div>
          </div>
        </Show>

        <Show when={activeTab() === 'knapsack'}>
          <div class="controls">
            <div class="controls-group">
              <label>物品列表 (格式: 重量,价值...)</label>
              <input
                type="text"
                value={knapsackInput()}
                onInput={e => setKnapsackInput(e.currentTarget.value)}
                style={{ padding: '0.5rem', border: '1px solid var(--border)', width: '200px', 'font-family': 'var(--font-mono)' }}
              />
              <button class="btn" onClick={parseKnapsackInput}>解析</button>
            </div>
            <div class="controls-group">
              <label>背包容量</label>
              <input type="range" min="1" max="20" value={knapsackCapacity()} onInput={e => { setKnapsackCapacity(parseInt(e.currentTarget.value)); reset(); }} />
              <span>{knapsackCapacity()}</span>
            </div>
          </div>
          <div class="canvas-container canvas-container-enhanced" style={{ padding: '2rem', 'min-height': '200px', overflow: 'auto' }}>
            <div style={{ 'margin-bottom': '1rem' }}>
              <h4 style={{ 'font-size': '0.8rem', color: 'var(--text-tertiary)', 'margin-bottom': '0.5rem' }}>物品列表</h4>
              <div style={{ display: 'flex', gap: '0.5rem', 'flex-wrap': 'wrap' }}>
                {knapsackItems().map((item, i) => (
                  <div style={{
                    padding: '0.5rem 1rem',
                    background: state().knapsackSelected.includes(i) ? '#1a1a1a' : '#f5f5f5',
                    color: state().knapsackSelected.includes(i) ? '#fff' : '#1a1a1a',
                    'font-family': 'var(--font-mono)', 'font-size': '0.85rem',
                    border: '1px solid var(--border)',
                    'box-shadow': state().knapsackSelected.includes(i) ? '0 0 12px rgba(0,0,0,0.3)' : 'none',
                  }}>
                    物品{i + 1}: 重量{item.weight}, 价值{item.value}
                  </div>
                ))}
              </div>
            </div>
            {state().knapsackDP.length > 0 && (
              <div style={{ 'margin-top': '1rem', overflow: 'auto' }}>
                <h4 style={{ 'font-size': '0.8rem', color: 'var(--text-tertiary)', 'margin-bottom': '0.5rem' }}>动态规划表</h4>
                <div style={{ display: 'flex', 'flex-direction': 'column', gap: '2px', 'align-items': 'flex-start' }}>
                  <div style={{ display: 'flex', gap: '2px' }}>
                    <div style={{ width: '34px', height: '34px', display: 'flex', 'align-items': 'center', 'justify-content': 'center', background: '#f5f5f5', 'font-family': 'var(--font-mono)', 'font-size': '0.75rem' }}></div>
                    {Array.from({ length: knapsackCapacity() + 1 }, (_, i) => (
                      <div style={{ width: '34px', height: '34px', display: 'flex', 'align-items': 'center', 'justify-content': 'center', background: '#f5f5f5', 'font-family': 'var(--font-mono)', 'font-size': '0.7rem', 'font-weight': '500' }}>{i}</div>
                    ))}
                  </div>
                  {state().knapsackDP.slice(1).map((row, i) => (
                    <div style={{ display: 'flex', gap: '2px' }}>
                      <div style={{ width: '34px', height: '34px', display: 'flex', 'align-items': 'center', 'justify-content': 'center', background: '#f5f5f5', 'font-family': 'var(--font-mono)', 'font-size': '0.7rem', 'font-weight': '500' }}>w={knapsackItems()[i]?.weight}</div>
                      {row.slice(1).map((cell, j) => {
                        const isCurrent = state().knapsackCurrent?.row === i + 1 && state().knapsackCurrent?.col === j + 1;
                        return (
                          <div style={{
                            width: '34px', height: '34px',
                            display: 'flex', 'align-items': 'center', 'justify-content': 'center',
                            background: isCurrent ? '#1a1a1a' : '#e5e5e5',
                            color: isCurrent ? '#fff' : '#1a1a1a',
                            'font-family': 'var(--font-mono)', 'font-size': '0.8rem',
                            transition: 'all 0.2s ease',
                            'box-shadow': isCurrent ? '0 0 8px rgba(0,0,0,0.4)' : 'none',
                          }}>{cell}</div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            )}
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
            <h3>01 背包问题</h3>
            <p>给定 n 个物品，每个物品有重量和价值，在总重量不超过 W 的情况下，求最大价值。</p>
            <div class="complexity">
              <div class="complexity-item"><div class="label">递推公式</div><div class="value">dp[i][w] = max(dp[i-1][w], dp[i-1][w-wi]+vi)</div></div>
              <div class="complexity-item"><div class="label">时间复杂度</div><div class="value">O(n * W)</div></div>
            </div>
          </div>
        </Show>

        <Show when={activeTab() === 'lcs'}>
          <div class="controls">
            <div class="controls-group">
              <label>字符串 1</label>
              <input
                type="text"
                value={lcsStr1()}
                onInput={e => { setLcsStr1(e.currentTarget.value); reset(); }}
                style={{ padding: '0.5rem', border: '1px solid var(--border)', width: '150px', 'font-family': 'var(--font-mono)' }}
              />
            </div>
            <div class="controls-group">
              <label>字符串 2</label>
              <input
                type="text"
                value={lcsStr2()}
                onInput={e => { setLcsStr2(e.currentTarget.value); reset(); }}
                style={{ padding: '0.5rem', border: '1px solid var(--border)', width: '150px', 'font-family': 'var(--font-mono)' }}
              />
            </div>
          </div>
          <div class="canvas-container canvas-container-enhanced" style={{ padding: '2rem', 'min-height': '200px', overflow: 'auto' }}>
            {state().lcsDP.length > 0 && (
              <div>
                <div style={{ display: 'flex', 'flex-direction': 'column', gap: '2px', 'align-items': 'flex-start' }}>
                  <div style={{ display: 'flex', gap: '2px' }}>
                    <div style={{ width: '34px', height: '34px', display: 'flex', 'align-items': 'center', 'justify-content': 'center', background: '#f5f5f5' }}></div>
                    {lcsStr2().split('').map(char => (
                      <div style={{ width: '34px', height: '34px', display: 'flex', 'align-items': 'center', 'justify-content': 'center', background: '#f5f5f5', 'font-family': 'var(--font-mono)', 'font-size': '0.85rem', 'font-weight': '500' }}>{char}</div>
                    ))}
                  </div>
                  {state().lcsDP.slice(1).map((row, i) => (
                    <div style={{ display: 'flex', gap: '2px' }}>
                      <div style={{ width: '34px', height: '34px', display: 'flex', 'align-items': 'center', 'justify-content': 'center', background: '#f5f5f5', 'font-family': 'var(--font-mono)', 'font-size': '0.85rem', 'font-weight': '500' }}>{lcsStr1()[i]}</div>
                      {row.slice(1).map((cell, j) => {
                        const isCurrent = state().lcsCurrent?.row === i + 1 && state().lcsCurrent?.col === j + 1;
                        const isPath = state().lcsPath.some(p => p.row === i + 1 && p.col === j + 1);
                        return (
                          <div style={{
                            width: '34px', height: '34px',
                            display: 'flex', 'align-items': 'center', 'justify-content': 'center',
                            background: isPath ? '#666' : (isCurrent ? '#1a1a1a' : '#e5e5e5'),
                            color: isPath || isCurrent ? '#fff' : '#1a1a1a',
                            'font-family': 'var(--font-mono)', 'font-size': '0.85rem',
                            transition: 'all 0.2s ease',
                            'box-shadow': isCurrent ? '0 0 8px rgba(0,0,0,0.4)' : 'none',
                          }}>{cell.value}</div>
                        );
                      })}
                    </div>
                  ))}
                </div>
                {state().lcsResult && (
                  <div style={{ 'margin-top': '1rem', padding: '1rem', background: '#f5f5f5', border: '1px solid var(--border)' }}>
                    <span style={{ 'font-size': '0.85rem', color: 'var(--text-secondary)' }}>最长公共子序列: </span>
                    <span style={{ 'font-family': 'var(--font-mono)', 'font-size': '1rem', 'font-weight': '500' }}>"{state().lcsResult}"</span>
                    <span style={{ 'font-size': '0.85rem', color: 'var(--text-secondary)', 'margin-left': '1rem' }}>(长度: {state().lcsResult.length})</span>
                  </div>
                )}
              </div>
            )}
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
            <h3>最长公共子序列 (LCS)</h3>
            <p>给定两个序列，找出它们最长的公共子序列的长度。</p>
            <div class="complexity">
              <div class="complexity-item"><div class="label">递推公式</div><div class="value">dp[i][j] = dp[i-1][j-1]+1 (if match) else max(dp[i-1][j], dp[i][j-1])</div></div>
              <div class="complexity-item"><div class="label">时间复杂度</div><div class="value">O(m * n)</div></div>
            </div>
          </div>
        </Show>

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
