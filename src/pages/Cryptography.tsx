import { createSignal } from 'solid-js';
import CodePanel from '../components/CodePanel';

export default function Cryptography() {
  const [activeTab, setActiveTab] = createSignal('caesar');
  const [isRunning, setIsRunning] = createSignal(false);
  const [steps, setSteps] = createSignal<string[]>([]);
  const [speed, setSpeed] = createSignal(50);

  // Caesar Cipher
  const [caesarText, setCaesarText] = createSignal('HELLO');
  const [caesarShift, setCaesarShift] = createSignal(3);
  const [caesarResult, setCaesarResult] = createSignal('');

  // AES
  const [aesText, setAesText] = createSignal('HELLO');
  const [aesKey, setAesKey] = createSignal('MYKEY');
  const [aesResult, setAesResult] = createSignal('');

  // RSA
  const [rsaText, setRsaText] = createSignal('HELLO');
  const [rsaResult, setRsaResult] = createSignal('');

  const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));
  const addStep = (text: string) => setSteps(prev => [text, ...prev].slice(0, 30));

  // Caesar Cipher
  const runCaesar = async () => {
    if (isRunning()) return;
    setIsRunning(true);
    setSteps([]);
    addStep('Caesar密码: 加密字符串');

    const text = caesarText().toUpperCase();
    const shift = caesarShift();
    let result = '';

    for (let i = 0; i < text.length; i++) {
      if (!isRunning()) break;
      const c = text[i];
      if (c >= 'A' && c <= 'Z') {
        const charCode = c.charCodeAt(0);
        const shifted = String.fromCharCode(((charCode - 65 + shift) % 26) + 65);
        result += shifted;
        addStep(`${c} -> ${shifted} (移位 ${shift})`);
        await sleep(Math.max(1, 101 - speed()) * 5);
      } else {
        result += c;
      }
    }

    setCaesarResult(result);
    addStep(`加密结果: ${result}`);
    setIsRunning(false);
  };

  // AES (Simplified)
  const runAes = async () => {
    if (isRunning()) return;
    setIsRunning(true);
    setSteps([]);
    addStep('AES: 加密字符串');

    const text = aesText().toUpperCase();
    const key = aesKey().toUpperCase();
    let result = '';

    for (let i = 0; i < text.length; i++) {
      if (!isRunning()) break;
      const c = text[i];
      const k = key[i % key.length];
      if (c >= 'A' && c <= 'Z' && k >= 'A' && k <= 'Z') {
        const charCode = c.charCodeAt(0);
        const keyCode = k.charCodeAt(0);
        const encrypted = String.fromCharCode(((charCode - 65 + keyCode - 65) % 26) + 65);
        result += encrypted;
        addStep(`${c} + ${k} -> ${encrypted}`);
        await sleep(Math.max(1, 101 - speed()) * 5);
      } else {
        result += c;
      }
    }

    setAesResult(result);
    addStep(`加密结果: ${result}`);
    setIsRunning(false);
  };

  // RSA (Simplified)
  const runRsa = async () => {
    if (isRunning()) return;
    setIsRunning(true);
    setSteps([]);
    addStep('RSA: 加密字符串');

    const text = rsaText().toUpperCase();
    const p = 61;
    const q = 53;
    const n = p * q;
    const phi = (p - 1) * (q - 1);
    const e = 17;
    const d = 2753; // modular multiplicative inverse of e mod phi

    addStep(`生成密钥: n = ${n}, e = ${e}, d = ${d}`);
    await sleep(Math.max(1, 101 - speed()) * 10);

    let result = '';
    for (let i = 0; i < text.length; i++) {
      if (!isRunning()) break;
      const c = text[i];
      if (c >= 'A' && c <= 'Z') {
        const m = c.charCodeAt(0) - 65;
        const encrypted = Math.pow(m, e) % n;
        result += String.fromCharCode((encrypted % 26) + 65);
        addStep(`${c} -> ${String.fromCharCode((encrypted % 26) + 65)} (m=${m}, m^e mod n=${encrypted})`);
        await sleep(Math.max(1, 101 - speed()) * 5);
      } else {
        result += c;
      }
    }

    setRsaResult(result);
    addStep(`加密结果: ${result}`);
    setIsRunning(false);
  };

  const tabs = [
    { id: 'caesar', label: 'Caesar' },
    { id: 'aes', label: 'AES' },
    { id: 'rsa', label: 'RSA' },
  ];

  return (
    <main class="visualization-page">
      <div class="container">
        <div class="visualization-header">
          <h1>加密算法</h1>
          <p class="description">加密算法用于保护数据安全，包括对称加密（如AES）和非对称加密（如RSA）两大类。</p>
        </div>
        <div style={{ display: 'flex', gap: '0', 'border-bottom': '1px solid var(--border)', 'margin-bottom': '2rem' }}>
          {tabs.map(tab => (
            <div
              class="crypto-tab"
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

        {activeTab() === 'caesar' && (
          <div>
            <div class="controls">
              <div class="controls-group">
                <label>文本</label>
                <input type="text" value={caesarText()} onChange={e => setCaesarText(e.currentTarget.value)} style={{ width: '200px', padding: '0.5rem', border: '1px solid var(--border)' }} />
              </div>
              <div class="controls-group">
                <label>移位</label>
                <input type="number" value={caesarShift()} onChange={e => setCaesarShift(parseInt(e.currentTarget.value) || 3)} style={{ width: '60px', padding: '0.5rem', border: '1px solid var(--border)' }} />
              </div>
              <div class="controls-group">
                <button class="btn btn-primary" onClick={runCaesar} disabled={isRunning()}>
                  {isRunning() ? '运行中...' : 'Caesar加密'}
                </button>
              </div>
            </div>
            <div class="canvas-container" style={{ padding: '2rem', 'min-height': '200px' }}>
              <div style={{ display: 'flex', 'flex-direction': 'column', gap: '1rem', 'align-items': 'center' }}>
                <div style={{ 'font-family': 'var(--font-mono)', 'font-size': '0.85rem' }}>
                  <strong>原文:</strong> {caesarText()}
                </div>
                {caesarResult() && (
                  <div style={{ 'font-family': 'var(--font-mono)', 'font-size': '0.85rem' }}>
                    <strong>密文:</strong> {caesarResult()}
                  </div>
                )}
              </div>
            </div>
            <div class="info-panel">
              <h3>Caesar密码</h3>
              <p>将每个字母向前移动固定位数。最简单的替换密码，但安全性较低。</p>
              <div class="complexity">
                <div class="complexity-item"><div class="label">加密时间</div><div class="value">O(n)</div></div>
                <div class="complexity-item"><div class="label">安全性</div><div class="value">低</div></div>
                <div class="complexity-item"><div class="label">密钥空间</div><div class="value">26</div></div>
              </div>
            </div>
          </div>
        )}

        {activeTab() === 'aes' && (
          <div>
            <div class="controls">
              <div class="controls-group">
                <label>文本</label>
                <input type="text" value={aesText()} onChange={e => setAesText(e.currentTarget.value)} style={{ width: '200px', padding: '0.5rem', border: '1px solid var(--border)' }} />
              </div>
              <div class="controls-group">
                <label>密钥</label>
                <input type="text" value={aesKey()} onChange={e => setAesKey(e.currentTarget.value)} style={{ width: '100px', padding: '0.5rem', border: '1px solid var(--border)' }} />
              </div>
              <div class="controls-group">
                <button class="btn btn-primary" onClick={runAes} disabled={isRunning()}>
                  {isRunning() ? '运行中...' : 'AES加密'}
                </button>
              </div>
            </div>
            <div class="canvas-container" style={{ padding: '2rem', 'min-height': '200px' }}>
              <div style={{ display: 'flex', 'flex-direction': 'column', gap: '1rem', 'align-items': 'center' }}>
                <div style={{ 'font-family': 'var(--font-mono)', 'font-size': '0.85rem' }}>
                  <strong>原文:</strong> {aesText()}
                </div>
                {aesResult() && (
                  <div style={{ 'font-family': 'var(--font-mono)', 'font-size': '0.85rem' }}>
                    <strong>密文:</strong> {aesResult()}
                  </div>
                )}
              </div>
            </div>
            <div class="info-panel">
              <h3>AES加密</h3>
              <p>高级加密标准，对称加密算法，广泛应用于数据加密。</p>
              <div class="complexity">
                <div class="complexity-item"><div class="label">加密时间</div><div class="value">O(n)</div></div>
                <div class="complexity-item"><div class="label">安全性</div><div class="value">高</div></div>
                <div class="complexity-item"><div class="label">密钥长度</div><div class="value">128/192/256位</div></div>
              </div>
            </div>
          </div>
        )}

        {activeTab() === 'rsa' && (
          <div>
            <div class="controls">
              <div class="controls-group">
                <label>文本</label>
                <input type="text" value={rsaText()} onChange={e => setRsaText(e.currentTarget.value)} style={{ width: '200px', padding: '0.5rem', border: '1px solid var(--border)' }} />
              </div>
              <div class="controls-group">
                <button class="btn btn-primary" onClick={runRsa} disabled={isRunning()}>
                  {isRunning() ? '运行中...' : 'RSA加密'}
                </button>
              </div>
            </div>
            <div class="canvas-container" style={{ padding: '2rem', 'min-height': '200px' }}>
              <div style={{ display: 'flex', 'flex-direction': 'column', gap: '1rem', 'align-items': 'center' }}>
                <div style={{ 'font-family': 'var(--font-mono)', 'font-size': '0.85rem' }}>
                  <strong>原文:</strong> {rsaText()}
                </div>
                {rsaResult() && (
                  <div style={{ 'font-family': 'var(--font-mono)', 'font-size': '0.85rem' }}>
                    <strong>密文:</strong> {rsaResult()}
                  </div>
                )}
              </div>
            </div>
            <div class="info-panel">
              <h3>RSA加密</h3>
              <p>非对称加密算法，使用公钥加密、私钥解密。广泛应用于安全通信。</p>
              <div class="complexity">
                <div class="complexity-item"><div class="label">加密时间</div><div class="value">O(log n)</div></div>
                <div class="complexity-item"><div class="label">安全性</div><div class="value">高</div></div>
                <div class="complexity-item"><div class="label">密钥长度</div><div class="value">1024/2048位</div></div>
              </div>
            </div>
          </div>
        )}

        <div class="steps-panel">
          <h3>执行步骤</h3>
          <div>
            {steps().length === 0 ? (
              <div class="step-item">选择标签页并点击"开始"查看加密算法执行过程</div>
            ) : (
              steps().map(step => <div class="step-item active">{step}</div>)
            )}
          </div>
        </div>
        <CodePanel category="cryptography" algorithm={activeTab()} />
      </div>
    </main>
  );
}
