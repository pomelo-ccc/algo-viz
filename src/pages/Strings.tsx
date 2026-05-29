import { createSignal } from 'solid-js';

export default function Strings() {
  const [text, setText] = createSignal('ABABDABACDABABCABAB');
  const [pattern, setPattern] = createSignal('ABABCABAB');
  const [isRunning, setIsRunning] = createSignal(false);
  const [steps, setSteps] = createSignal<string[]>([]);
  const [speed, setSpeed] = createSignal(50);
  const [lpsArray, setLpsArray] = createSignal<number[]>([]);
  const [currentMatch, setCurrentMatch] = createSignal<{ textIdx: number; patIdx: number } | null>(null);
  const [matchResult, setMatchResult] = createSignal<number[]>([]);

  const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));
  const addStep = (text: string) => setSteps(prev => [text, ...prev].slice(0, 30));

  const buildLPS = async (pat: string): Promise<number[]> => {
    const lps = new Array(pat.length).fill(0);
    let len = 0;
    let i = 1;
    addStep('构建 LPS (Longest Prefix Suffix) 数组');
    while (i < pat.length) {
      if (!isRunning()) break;
      if (pat[i] === pat[len]) {
        len++;
        lps[i] = len;
        addStep(`pat[${i}] == pat[${len - 1}], lps[${i}] = ${len}`);
        i++;
      } else {
        if (len !== 0) {
          len = lps[len - 1];
          addStep(`不匹配，len = lps[${len}] = ${lps[len]}`);
        } else {
          lps[i] = 0;
          addStep(`pat[${i}] != pat[0], lps[${i}] = 0`);
          i++;
        }
      }
      await sleep(Math.max(1, 101 - speed()) * 5);
    }
    return lps;
  };

  const kmpSearch = async () => {
    if (isRunning()) return;
    setIsRunning(true);
    setSteps([]);
    setMatchResult([]);
    const t = text();
    const p = pattern();

    if (p.length === 0 || p.length > t.length) {
      addStep('模式串为空或长于文本串');
      setIsRunning(false);
      return;
    }

    const lps = await buildLPS(p);
    setLpsArray(lps);
    addStep('LPS 数组构建完成');

    let i = 0, j = 0;
    const matches: number[] = [];
    while (i < t.length) {
      if (!isRunning()) break;
      setCurrentMatch({ textIdx: i, patIdx: j });
      await sleep(Math.max(1, 101 - speed()) * 10);
      if (t[i] === p[j]) {
        addStep(`匹配: text[${i}] = '${t[i]}' == pattern[${j}] = '${p[j]}'`);
        i++; j++;
      }
      if (j === p.length) {
        const matchIdx = i - j;
        matches.push(matchIdx);
        setMatchResult([...matches]);
        addStep(`找到匹配! 起始位置: ${matchIdx}`);
        j = lps[j - 1];
      } else if (i < t.length && t[i] !== p[j]) {
        addStep(`不匹配: text[${i}] = '${t[i]}' != pattern[${j}] = '${p[j]}'`);
        if (j !== 0) {
          j = lps[j - 1];
          addStep(`j = lps[${j}] = ${j}`);
        } else {
          i++;
        }
      }
      await sleep(Math.max(1, 101 - speed()) * 5);
    }
    if (matches.length === 0) addStep('未找到匹配');
    else addStep(`搜索完成，共找到 ${matches.length} 处匹配`);
    setCurrentMatch(null);
    setIsRunning(false);
  };

  const resetKMP = () => {
    setSteps([]);
    setLpsArray([]);
    setMatchResult([]);
    setCurrentMatch(null);
  };

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
              onInput={e => { setText(e.currentTarget.value); resetKMP(); }}
              style={{ padding: '0.5rem', border: '1px solid var(--border)', 'font-family': 'var(--font-mono)', width: '250px' }}
            />
          </div>
          <div class="controls-group">
            <label>模式串</label>
            <input
              type="text"
              value={pattern()}
              onInput={e => { setPattern(e.currentTarget.value); resetKMP(); }}
              style={{ padding: '0.5rem', border: '1px solid var(--border)', 'font-family': 'var(--font-mono)', width: '150px' }}
            />
          </div>
          <div class="controls-group">
            <label>速度</label>
            <input type="range" min="1" max="100" value={speed()} onInput={e => setSpeed(parseInt(e.currentTarget.value))} />
          </div>
          <div class="controls-group">
            <button class="btn btn-primary" onClick={kmpSearch} disabled={isRunning()}>
              {isRunning() ? '运行中...' : '开始匹配'}
            </button>
          </div>
        </div>

        <div class="canvas-container" style={{ padding: '2rem' }}>
          <div style={{ 'margin-bottom': '1.5rem' }}>
            <h4 style={{ 'font-size': '0.8rem', color: 'var(--text-tertiary)', 'text-transform': 'uppercase', 'letter-spacing': '0.05em', 'margin-bottom': '0.5rem' }}>文本串</h4>
            <div style={{ display: 'flex', gap: '2px', 'flex-wrap': 'wrap' }}>
              {text().split('').map((char, i) => {
                const isMatch = matchResult().some(m => i >= m && i < m + pattern().length);
                const isCurrent = currentMatch() && i === currentMatch()!.textIdx;
                return (
                  <div style={{
                    width: '28px', height: '28px', display: 'flex', 'align-items': 'center', 'justify-content': 'center',
                    background: isMatch ? '#666666' : isCurrent ? '#1a1a1a' : '#f5f5f5',
                    color: isMatch || isCurrent ? '#fff' : '#1a1a1a',
                    'font-family': 'var(--font-mono)', 'font-size': '0.85rem',
                    border: '1px solid var(--border)',
                  }}>{char}</div>
                );
              })}
            </div>
          </div>

          <div style={{ 'margin-bottom': '1.5rem' }}>
            <h4 style={{ 'font-size': '0.8rem', color: 'var(--text-tertiary)', 'text-transform': 'uppercase', 'letter-spacing': '0.05em', 'margin-bottom': '0.5rem' }}>模式串</h4>
            <div style={{ display: 'flex', gap: '2px' }}>
              {pattern().split('').map((char, i) => (
                <div style={{
                  width: '28px', height: '28px', display: 'flex', 'align-items': 'center', 'justify-content': 'center',
                  background: currentMatch() && i === currentMatch()!.patIdx ? '#1a1a1a' : '#f5f5f5',
                  color: currentMatch() && i === currentMatch()!.patIdx ? '#fff' : '#1a1a1a',
                  'font-family': 'var(--font-mono)', 'font-size': '0.85rem',
                  border: '1px solid var(--border)',
                }}>{char}</div>
              ))}
            </div>
          </div>

          {lpsArray().length > 0 && (
            <div>
              <h4 style={{ 'font-size': '0.8rem', color: 'var(--text-tertiary)', 'text-transform': 'uppercase', 'letter-spacing': '0.05em', 'margin-bottom': '0.5rem' }}>LPS 数组</h4>
              <div style={{ display: 'flex', gap: '2px', 'margin-bottom': '0.25rem' }}>
                {pattern().split('').map((char, i) => (
                  <div style={{
                    width: '28px', height: '28px', display: 'flex', 'align-items': 'center', 'justify-content': 'center',
                    background: '#f5f5f5', 'font-family': 'var(--font-mono)', 'font-size': '0.85rem',
                    border: '1px solid var(--border)',
                  }}>{char}</div>
                ))}
              </div>
              <div style={{ display: 'flex', gap: '2px' }}>
                {lpsArray().map((val, i) => (
                  <div style={{
                    width: '28px', height: '28px', display: 'flex', 'align-items': 'center', 'justify-content': 'center',
                    background: '#e5e5e5', 'font-family': 'var(--font-mono)', 'font-size': '0.85rem',
                    border: '1px solid var(--border)', color: 'var(--text-secondary)',
                  }}>{val}</div>
                ))}
              </div>
            </div>
          )}
        </div>

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
              <div class="step-item">输入文本串和模式串，点击"开始匹配"</div>
            ) : (
              steps().map(step => <div class="step-item active">{step}</div>)
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
