import { createSignal, onMount, onCleanup } from 'solid-js';
import CodePanel from '../components/CodePanel';
import ControlPanel from '../components/ControlPanel';
import { AnimationController, type AnimStep } from '../utils/animation';

interface KMPState {
  lps: number[];
  lpsIndex: number;
  lpsLen: number;
  lpsBuilding: boolean;
  textIndex: number;
  patternIndex: number;
  matches: number[];
  phase: 'lps' | 'search' | 'done';
}

export default function Strings() {
  const [text, setText] = createSignal('ABABDABACDABABCABAB');
  const [pattern, setPattern] = createSignal('ABABCABAB');
  const [isRunning, setIsRunning] = createSignal(false);
  const [steps, setSteps] = createSignal<string[]>([]);
  const [speed, setSpeed] = createSignal(50);
  const [currentStep, setCurrentStep] = createSignal(-1);
  const [totalSteps, setTotalSteps] = createSignal(0);
  const [state, setState] = createSignal<KMPState>({
    lps: [],
    lpsIndex: -1,
    lpsLen: 0,
    lpsBuilding: false,
    textIndex: -1,
    patternIndex: -1,
    matches: [],
    phase: 'lps',
  });
  let controller: AnimationController<KMPState>;

  onMount(() => {
    controller = new AnimationController<KMPState>({ speed: speed() });
    controller.setCallbacks(
      (step: AnimStep<KMPState>) => {
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
  });

  const buildKMPSteps = (t: string, p: string): AnimStep<KMPState>[] => {
    const steps: AnimStep<KMPState>[] = [];

    if (p.length === 0) {
      steps.push({ state: { ...state(), phase: 'done' }, description: '模式串为空' });
      return steps;
    }

    const lps: number[] = new Array(p.length).fill(0);
    steps.push({
      state: { lps: [...lps], lpsIndex: 0, lpsLen: 0, lpsBuilding: true, textIndex: -1, patternIndex: -1, matches: [], phase: 'lps' },
      description: '开始构建 LPS 数组',
    });

    let len = 0;
    let i = 1;
    while (i < p.length) {
      if (p[i] === p[len]) {
        len++;
        lps[i] = len;
        steps.push({
          state: { lps: [...lps], lpsIndex: i, lpsLen: len, lpsBuilding: true, textIndex: -1, patternIndex: -1, matches: [], phase: 'lps' },
          description: `pat[${i}]='${p[i]}' == pat[${len - 1}]='${p[len - 1]}', lps[${i}] = ${len}`,
        });
        i++;
      } else {
        if (len !== 0) {
          const oldLen = len;
          len = lps[len - 1];
          steps.push({
            state: { lps: [...lps], lpsIndex: i, lpsLen: len, lpsBuilding: true, textIndex: -1, patternIndex: -1, matches: [], phase: 'lps' },
            description: `不匹配, len = lps[${oldLen - 1}] = ${len}`,
          });
        } else {
          lps[i] = 0;
          steps.push({
            state: { lps: [...lps], lpsIndex: i, lpsLen: 0, lpsBuilding: true, textIndex: -1, patternIndex: -1, matches: [], phase: 'lps' },
            description: `pat[${i}]='${p[i]}' != pat[0], lps[${i}] = 0`,
          });
          i++;
        }
      }
    }

    steps.push({
      state: { lps: [...lps], lpsIndex: -1, lpsLen: 0, lpsBuilding: false, textIndex: -1, patternIndex: -1, matches: [], phase: 'search' },
      description: 'LPS 数组构建完成, 开始搜索',
    });

    let ti = 0, pj = 0;
    const matches: number[] = [];
    while (ti < t.length) {
      steps.push({
        state: { lps: [...lps], lpsIndex: -1, lpsLen: 0, lpsBuilding: false, textIndex: ti, patternIndex: pj, matches: [...matches], phase: 'search' },
        description: `比较 text[${ti}]='${t[ti]}' 和 pattern[${pj}]='${p[pj] || ''}'`,
      });

      if (t[ti] === p[pj]) {
        ti++;
        pj++;
        if (pj === p.length) {
          const matchIdx = ti - pj;
          matches.push(matchIdx);
          steps.push({
            state: { lps: [...lps], lpsIndex: -1, lpsLen: 0, lpsBuilding: false, textIndex: ti, patternIndex: pj, matches: [...matches], phase: 'search' },
            description: `找到匹配! 起始位置: ${matchIdx}`,
          });
          pj = lps[pj - 1];
        }
      } else {
        if (pj !== 0) {
          pj = lps[pj - 1];
          steps.push({
            state: { lps: [...lps], lpsIndex: -1, lpsLen: 0, lpsBuilding: false, textIndex: ti, patternIndex: pj, matches: [...matches], phase: 'search' },
            description: `不匹配, j = lps[${pj}] = ${pj}`,
          });
        } else {
          ti++;
        }
      }
    }

    steps.push({
      state: { lps: [...lps], lpsIndex: -1, lpsLen: 0, lpsBuilding: false, textIndex: -1, patternIndex: -1, matches: [...matches], phase: 'done' },
      description: matches.length === 0 ? '未找到匹配' : `搜索完成, 共找到 ${matches.length} 处匹配`,
    });

    return steps;
  };

  const start = () => {
    if (isRunning()) return;
    setIsRunning(true);
    setSteps([]);

    const t = text();
    const p = pattern();
    const animSteps = buildKMPSteps(t, p);
    controller.setSteps(animSteps);
    controller.setSpeed(speed());
    controller.play().then(() => {
      setIsRunning(false);
      setSteps(prev => ['匹配完成', ...prev]);
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
      lps: [],
      lpsIndex: -1,
      lpsLen: 0,
      lpsBuilding: false,
      textIndex: -1,
      patternIndex: -1,
      matches: [],
      phase: 'lps',
    });
    setSteps([]);
    setCurrentStep(-1);
    setTotalSteps(0);
  };

  const handleStepForward = () => { if (!isRunning()) controller.stepForward(); };
  const handleStepBackward = () => { if (!isRunning()) controller.stepBackward(); };
  const handleSpeedChange = (newSpeed: number) => { setSpeed(newSpeed); controller.setSpeed(newSpeed); };

  return (
    <main class="visualization-page">
      <div class="container">
        <div class="visualization-header">
          <h1>KMP 字符串匹配</h1>
          <p class="description">Knuth-Morris-Pratt (KMP) 算法是一种高效的字符串匹配算法。通过预处理模式串构建部分匹配表，避免不必要的回溯。</p>
        </div>
        <div class="controls">
          <div class="controls-group">
            <label>文本串</label>
            <input
              type="text"
              value={text()}
              onInput={e => { setText(e.currentTarget.value); reset(); }}
              style={{ padding: '0.5rem', border: '1px solid var(--border)', 'font-family': 'var(--font-mono)', width: '250px' }}
            />
          </div>
          <div class="controls-group">
            <label>模式串</label>
            <input
              type="text"
              value={pattern()}
              onInput={e => { setPattern(e.currentTarget.value); reset(); }}
              style={{ padding: '0.5rem', border: '1px solid var(--border)', 'font-family': 'var(--font-mono)', width: '150px' }}
            />
          </div>
        </div>

        <div class="canvas-container canvas-container-enhanced" style={{ padding: '2rem' }}>
          <div style={{ 'margin-bottom': '1.5rem' }}>
            <h4 style={{ 'font-size': '0.8rem', color: 'var(--text-tertiary)', 'text-transform': 'uppercase', 'letter-spacing': '0.05em', 'margin-bottom': '0.5rem' }}>文本串</h4>
            <div style={{ display: 'flex', gap: '2px', 'flex-wrap': 'wrap' }}>
              {text().split('').map((char, i) => {
                const isMatch = state().matches.some(m => i >= m && i < m + pattern().length);
                const isCurrent = i === state().textIndex;
                const isInPattern = state().textIndex >= 0 && state().patternIndex > 0 && i >= state().textIndex - state().patternIndex && i <= state().textIndex;
                let bg = '#f5f5f5';
                let color = '#1a1a1a';
                if (isMatch) { bg = '#666666'; color = '#fff'; }
                if (isInPattern && !isMatch) { bg = '#cccccc'; }
                if (isCurrent) { bg = '#1a1a1a'; color = '#fff'; }
                return (
                  <div style={{
                    width: '32px', height: '32px', display: 'flex', 'align-items': 'center', 'justify-content': 'center',
                    background: bg, color, 'font-family': 'var(--font-mono)', 'font-size': '0.85rem',
                    border: '1px solid var(--border)',
                    'box-shadow': isCurrent ? '0 0 12px rgba(0, 0, 0, 0.4)' : 'none',
                    transition: 'all 0.2s ease',
                  }}>{char}</div>
                );
              })}
            </div>
          </div>

          <div style={{ 'margin-bottom': '1.5rem' }}>
            <h4 style={{ 'font-size': '0.8rem', color: 'var(--text-tertiary)', 'text-transform': 'uppercase', 'letter-spacing': '0.05em', 'margin-bottom': '0.5rem' }}>模式串</h4>
            <div style={{ display: 'flex', gap: '2px' }}>
              {pattern().split('').map((char, i) => {
                const isCurrent = i === state().patternIndex && state().phase === 'search';
                return (
                  <div style={{
                    width: '32px', height: '32px', display: 'flex', 'align-items': 'center', 'justify-content': 'center',
                    background: isCurrent ? '#1a1a1a' : '#f5f5f5',
                    color: isCurrent ? '#fff' : '#1a1a1a',
                    'font-family': 'var(--font-mono)', 'font-size': '0.85rem',
                    border: '1px solid var(--border)',
                    'box-shadow': isCurrent ? '0 0 12px rgba(0, 0, 0, 0.4)' : 'none',
                    transition: 'all 0.2s ease',
                  }}>{char}</div>
                );
              })}
            </div>
          </div>

          {state().lps.length > 0 && (
            <div>
              <h4 style={{ 'font-size': '0.8rem', color: 'var(--text-tertiary)', 'text-transform': 'uppercase', 'letter-spacing': '0.05em', 'margin-bottom': '0.5rem' }}>LPS 数组</h4>
              <div style={{ display: 'flex', gap: '2px', 'margin-bottom': '0.25rem' }}>
                {pattern().split('').map((char, i) => {
                  const isCurrent = i === state().lpsIndex && state().lpsBuilding;
                  return (
                    <div style={{
                      width: '32px', height: '32px', display: 'flex', 'align-items': 'center', 'justify-content': 'center',
                      background: isCurrent ? '#1a1a1a' : '#f5f5f5',
                      color: isCurrent ? '#fff' : '#1a1a1a',
                      'font-family': 'var(--font-mono)', 'font-size': '0.85rem',
                      border: '1px solid var(--border)',
                      'box-shadow': isCurrent ? '0 0 12px rgba(0, 0, 0, 0.4)' : 'none',
                      transition: 'all 0.2s ease',
                    }}>{char}</div>
                  );
                })}
              </div>
              <div style={{ display: 'flex', gap: '2px' }}>
                {state().lps.map((val, i) => {
                  const isCurrent = i === state().lpsIndex && state().lpsBuilding;
                  return (
                    <div style={{
                      width: '32px', height: '32px', display: 'flex', 'align-items': 'center', 'justify-content': 'center',
                      background: isCurrent ? '#1a1a1a' : '#e5e5e5',
                      color: isCurrent ? '#fff' : 'var(--text-secondary)',
                      'font-family': 'var(--font-mono)', 'font-size': '0.85rem',
                      border: '1px solid var(--border)',
                      'box-shadow': isCurrent ? '0 0 12px rgba(0, 0, 0, 0.4)' : 'none',
                      transition: 'all 0.2s ease',
                    }}>{val}</div>
                  );
                })}
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
          <h3>KMP 算法原理</h3>
          <p>KMP 算法通过构建部分匹配表（LPS 数组），在匹配失败时利用已匹配的信息，避免回溯到文本串的起始位置。</p>
          <div class="complexity">
            <div class="complexity-item">
              <div class="label">预处理时间</div>
              <div class="value">O(m)</div>
            </div>
            <div class="complexity-item">
              <div class="label">匹配时间</div>
              <div class="value">O(n)</div>
            </div>
            <div class="complexity-item">
              <div class="label">总时间复杂度</div>
              <div class="value">O(n + m)</div>
            </div>
            <div class="complexity-item">
              <div class="label">空间复杂度</div>
              <div class="value">O(m)</div>
            </div>
          </div>
        </div>

        <div class="steps-panel">
          <h3>执行步骤</h3>
          <div>
            {steps().length === 0 ? (
              <div class="step-item">输入文本串和模式串, 点击播放按钮开始匹配</div>
            ) : (
              steps().map(step => <div class="step-item active">{step}</div>)
            )}
          </div>
        </div>

        <CodePanel category="strings" algorithm="kmp" />
      </div>
    </main>
  );
}
