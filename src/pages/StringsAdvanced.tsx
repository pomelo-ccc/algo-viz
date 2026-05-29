import { createSignal } from 'solid-js';

export default function StringsAdvanced() {
  const [activeTab, setActiveTab] = createSignal('suffix');
  const [isRunning, setIsRunning] = createSignal(false);
  const [steps, setSteps] = createSignal<string[]>([]);
  const [speed, setSpeed] = createSignal(50);

  // Suffix Array
  const [suffixText, setSuffixText] = createSignal('banana');
  const [suffixArray, setSuffixArray] = createSignal<number[]>([]);
  const [lcpArray, setLcpArray] = createSignal<number[]>([]);

  // Manacher
  const [manacherText, setManacherText] = createSignal('abacaba');
  const [manacherResult, setManacherResult] = createSignal<number[]>([]);
  const [manacherCenter, setManacherCenter] = createSignal<number | null>(null);

  // Z-Algorithm
  const [zText, setZText] = createSignal('ababcab');
  const [zArray, setZArray] = createSignal<number[]>([]);
  const [zCurrent, setZCurrent] = createSignal<number | null>(null);

  const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));
  const addStep = (text: string) => setSteps(prev => [text, ...prev].slice(0, 30));

  // Suffix Array
  const buildSuffixArray = async () => {
    if (isRunning()) return;
    setIsRunning(true);
    setSteps([]);
    addStep('构建后缀数组');

    const text = suffixText();
    const n = text.length;
    const suffixes: { suffix: string; idx: number }[] = [];

    for (let i = 0; i < n; i++) {
      suffixes.push({ suffix: text.slice(i), idx: i });
    }

    addStep('生成所有后缀');
    await sleep(Math.max(1, 101 - speed()) * 10);

    suffixes.sort((a, b) => a.suffix.localeCompare(b.suffix));
    const sa = suffixes.map(s => s.idx);
    setSuffixArray(sa);
    addStep('按字典序排序后缀');
    await sleep(Math.max(1, 101 - speed()) * 10);

    // LCP
    const lcp = new Array(n).fill(0);
    for (let i = 1; i < n; i++) {
      const prev = suffixes[i - 1].suffix;
      const curr = suffixes[i].suffix;
      let len = 0;
      while (len < prev.length && len < curr.length && prev[len] === curr[len]) {
        len++;
      }
      lcp[i] = len;
    }
    setLcpArray(lcp);
    addStep('计算最长公共前缀 (LCP)');
    setIsRunning(false);
  };

  // Manacher
  const runManacher = async () => {
    if (isRunning()) return;
    setIsRunning(true);
    setSteps([]);
    addStep('Manacher算法: 寻找最长回文子串');

    const text = manacherText();
    const n = text.length;
    const d1 = new Array(n).fill(1);
    const d2 = new Array(n).fill(0);

    let l = 0, r = -1;
    for (let i = 0; i < n; i++) {
      if (!isRunning()) break;
      setManacherCenter(i);
      addStep(`检查中心位置 ${i}`);
      await sleep(Math.max(1, 101 - speed()) * 5);

      let k = i > r ? 1 : Math.min(d1[l + r - i], r - i + 1);
      while (i - k >= 0 && i + k < n && text[i - k] === text[i + k]) {
        k++;
      }
      d1[i] = k;
      if (i + k - 1 > r) {
        l = i - k + 1;
        r = i + k - 1;
      }
      addStep(`以 ${i} 为中心的最长奇回文半径: ${k}`);
      await sleep(Math.max(1, 101 - speed()) * 5);
    }

    setManacherResult(d1);
    const maxRadius = Math.max(...d1);
    const center = d1.indexOf(maxRadius);
    addStep(`最长回文子串: 中心 ${center}, 半径 ${maxRadius}`);
    setIsRunning(false);
  };

  // Z-Algorithm
  const runZAlgorithm = async () => {
    if (isRunning()) return;
    setIsRunning(true);
    setSteps([]);
    addStep('Z算法: 计算字符串的最长前缀匹配');

    const text = zText();
    const n = text.length;
    const z = new Array(n).fill(0);

    let l = 0, r = 0;
    for (let i = 1; i < n; i++) {
      if (!isRunning()) break;
      setZCurrent(i);
      addStep(`计算 Z[${i}]`);
      await sleep(Math.max(1, 101 - speed()) * 5);

      if (i <= r) {
        z[i] = Math.min(r - i + 1, z[i - l]);
        addStep(`利用先前结果: Z[${i}] = min(${r - i + 1}, ${z[i - l]}) = ${z[i]}`);
      }
      while (i + z[i] < n && text[z[i]] === text[i + z[i]]) {
        z[i]++;
      }
      if (i + z[i] - 1 > r) {
        l = i;
        r = i + z[i] - 1;
      }
      addStep(`Z[${i}] = ${z[i]}`);
      setZArray([...z]);
      await sleep(Math.max(1, 101 - speed()) * 5);
    }

    addStep('Z数组计算完成');
    setIsRunning(false);
  };

  const tabs = [
    { id: 'suffix', label: '后缀数组' },
    { id: 'manacher', label: 'Manacher' },
    { id: 'zalgo', label: 'Z算法' },
  ];

  return (
    <main class="visualization-page">
      <div class="container">
        <div class="visualization-header">
          <h1>字符串算法扩展</h1>
          <p class="description">字符串算法扩展包含后缀数组、Manacher算法、Z算法等经典字符串处理算法，用于解决更复杂的字符串匹配和分析问题。</p>
        </div>
        <div style={{ display: 'flex', gap: '0', 'border-bottom': '1px solid var(--border)', 'margin-bottom': '2rem' }}>
          {tabs.map(tab => (
            <div
              class="str-tab"
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
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </div>
          ))}
        </div>

        {activeTab() === 'suffix' && (
          <div>
            <div class="controls">
              <div class="controls-group">
                <label>字符串</label>
                <input type="text" value={suffixText()} onChange={e => setSuffixText(e.currentTarget.value)} style={{ width: '200px', padding: '0.5rem', border: '1px solid var(--border)' }} />
              </div>
              <div class="controls-group">
                <button class="btn btn-primary" onClick={buildSuffixArray} disabled={isRunning()}>
                  {isRunning() ? '运行中...' : '构建后缀数组'}
                </button>
              </div>
            </div>
            <div class="canvas-container" style={{ padding: '2rem', 'min-height': '200px' }}>
              <div style={{ display: 'flex', 'flex-direction': 'column', gap: '1rem' }}>
                <div style={{ 'font-family': 'var(--font-mono)', 'font-size': '0.85rem' }}>
                  <strong>原字符串:</strong> {suffixText()}
                </div>
                {suffixArray().length > 0 && (
                  <div style={{ display: 'flex', 'flex-direction': 'column', gap: '0.5rem' }}>
                    <h4 style={{ 'font-size': '0.85rem', color: 'var(--text-tertiary)', 'text-transform': 'uppercase', 'letter-spacing': '0.05em', 'margin-bottom': '0.5rem' }}>后缀数组</h4>
                    {suffixArray().map((idx, i) => (
                      <div style={{ display: 'flex', 'align-items': 'center', gap: '1rem', padding: '0.5rem', background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
                        <span style={{ 'font-family': 'var(--font-mono)', 'font-size': '0.85rem', color: 'var(--text-tertiary)', width: '30px' }}>SA[{i}]</span>
                        <span style={{ 'font-family': 'var(--font-mono)', 'font-size': '0.85rem' }}>{idx}</span>
                        <span style={{ 'font-family': 'var(--font-mono)', 'font-size': '0.85rem', color: 'var(--text-secondary)' }}>{suffixText().slice(idx)}</span>
                      </div>
                    ))}
                  </div>
                )}
                {lcpArray().length > 0 && (
                  <div style={{ display: 'flex', 'flex-direction': 'column', gap: '0.5rem' }}>
                    <h4 style={{ 'font-size': '0.85rem', color: 'var(--text-tertiary)', 'text-transform': 'uppercase', 'letter-spacing': '0.05em', 'margin-bottom': '0.5rem' }}>LCP数组</h4>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      {lcpArray().map((len, i) => (
                        <div style={{ width: '32px', height: '32px', display: 'flex', 'align-items': 'center', 'justify-content': 'center', background: 'var(--bg-secondary)', border: '1px solid var(--border)', 'font-family': 'var(--font-mono)', 'font-size': '0.85rem' }}>
                          {len}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div class="info-panel">
              <h3>后缀数组 (Suffix Array)</h3>
              <p>将所有后缀按字典序排序后，记录每个后缀在原字符串中的起始位置。配合LCP数组可用于字符串匹配、最长重复子串等问题。</p>
              <div class="complexity">
                <div class="complexity-item"><div class="label">构建时间</div><div class="value">O(n log n)</div></div>
                <div class="complexity-item"><div class="label">空间复杂度</div><div class="value">O(n)</div></div>
                <div class="complexity-item"><div class="label">应用</div><div class="value">字符串匹配、重复子串</div></div>
              </div>
            </div>
          </div>
        )}

        {activeTab() === 'manacher' && (
          <div>
            <div class="controls">
              <div class="controls-group">
                <label>字符串</label>
                <input type="text" value={manacherText()} onChange={e => setManacherText(e.currentTarget.value)} style={{ width: '200px', padding: '0.5rem', border: '1px solid var(--border)' }} />
              </div>
              <div class="controls-group">
                <button class="btn btn-primary" onClick={runManacher} disabled={isRunning()}>
                  {isRunning() ? '运行中...' : '寻找回文子串'}
                </button>
              </div>
            </div>
            <div class="canvas-container" style={{ padding: '2rem', 'min-height': '200px' }}>
              <div style={{ display: 'flex', 'flex-direction': 'column', gap: '1rem', 'align-items': 'center' }}>
                <div style={{ display: 'flex', gap: '4px' }}>
                  {manacherText().split('').map((ch, i) => (
                    <div style={{
                      width: '36px',
                      height: '36px',
                      display: 'flex',
                      'align-items': 'center',
                      'justify-content': 'center',
                      background: manacherCenter() === i ? '#1a1a1a' : '#f5f5f5',
                      color: manacherCenter() === i ? '#fff' : '#1a1a1a',
                      border: '1px solid var(--border)',
                      'font-family': 'var(--font-mono)',
                      'font-size': '0.85rem',
                      transition: 'all 0.3s ease',
                    }}>{ch}</div>
                  ))}
                </div>
                {manacherResult().length > 0 && (
                  <div style={{ display: 'flex', 'flex-direction': 'column', gap: '0.5rem', width: '100%', 'max-width': '400px' }}>
                    <h4 style={{ 'font-size': '0.85rem', color: 'var(--text-tertiary)', 'text-transform': 'uppercase', 'letter-spacing': '0.05em', 'margin-bottom': '0.5rem' }}>回文半径</h4>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      {manacherResult().map((r, i) => (
                        <div style={{ width: '36px', height: '36px', display: 'flex', 'align-items': 'center', 'justify-content': 'center', background: 'var(--bg-secondary)', border: '1px solid var(--border)', 'font-family': 'var(--font-mono)', 'font-size': '0.85rem' }}>
                          {r}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div class="info-panel">
              <h3>Manacher算法</h3>
              <p>在线性时间内找到字符串中所有回文子串的最长长度。利用对称性避免重复计算。</p>
              <div class="complexity">
                <div class="complexity-item"><div class="label">时间复杂度</div><div class="value">O(n)</div></div>
                <div class="complexity-item"><div class="label">空间复杂度</div><div class="value">O(n)</div></div>
                <div class="complexity-item"><div class="label">核心</div><div class="value">对称性利用</div></div>
              </div>
            </div>
          </div>
        )}

        {activeTab() === 'zalgo' && (
          <div>
            <div class="controls">
              <div class="controls-group">
                <label>字符串</label>
                <input type="text" value={zText()} onChange={e => setZText(e.currentTarget.value)} style={{ width: '200px', padding: '0.5rem', border: '1px solid var(--border)' }} />
              </div>
              <div class="controls-group">
                <button class="btn btn-primary" onClick={runZAlgorithm} disabled={isRunning()}>
                  {isRunning() ? '运行中...' : '计算Z数组'}
                </button>
              </div>
            </div>
            <div class="canvas-container" style={{ padding: '2rem', 'min-height': '200px' }}>
              <div style={{ display: 'flex', 'flex-direction': 'column', gap: '1rem', 'align-items': 'center' }}>
                <div style={{ display: 'flex', gap: '4px' }}>
                  {zText().split('').map((ch, i) => (
                    <div style={{
                      width: '36px',
                      height: '36px',
                      display: 'flex',
                      'align-items': 'center',
                      'justify-content': 'center',
                      background: zCurrent() === i ? '#1a1a1a' : '#f5f5f5',
                      color: zCurrent() === i ? '#fff' : '#1a1a1a',
                      border: '1px solid var(--border)',
                      'font-family': 'var(--font-mono)',
                      'font-size': '0.85rem',
                      transition: 'all 0.3s ease',
                    }}>{ch}</div>
                  ))}
                </div>
                {zArray().length > 0 && (
                  <div style={{ display: 'flex', 'flex-direction': 'column', gap: '0.5rem', width: '100%', 'max-width': '400px' }}>
                    <h4 style={{ 'font-size': '0.85rem', color: 'var(--text-tertiary)', 'text-transform': 'uppercase', 'letter-spacing': '0.05em', 'margin-bottom': '0.5rem' }}>Z数组</h4>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      {zArray().map((z, i) => (
                        <div style={{ width: '36px', height: '36px', display: 'flex', 'align-items': 'center', 'justify-content': 'center', background: zCurrent() === i ? '#1a1a1a' : 'var(--bg-secondary)', border: '1px solid var(--border)', 'font-family': 'var(--font-mono)', 'font-size': '0.85rem', color: zCurrent() === i ? '#fff' : '#1a1a1a' }}>
                          {z}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div class="info-panel">
              <h3>Z算法 (Z-Algorithm)</h3>
              <p>计算字符串中每个后缀与原字符串的最长公共前缀长度。用于字符串匹配、前缀函数等问题。</p>
              <div class="complexity">
                <div class="complexity-item"><div class="label">时间复杂度</div><div class="value">O(n)</div></div>
                <div class="complexity-item"><div class="label">空间复杂度</div><div class="value">O(n)</div></div>
                <div class="complexity-item"><div class="label">应用</div><div class="value">字符串匹配、前缀函数</div></div>
              </div>
            </div>
          </div>
        )}

        <div class="steps-panel">
          <h3>执行步骤</h3>
          <div>
            {steps().length === 0 ? (
              <div class="step-item">选择标签页并点击"开始"查看字符串算法执行过程</div>
            ) : (
              steps().map(step => <div class="step-item active">{step}</div>)
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
