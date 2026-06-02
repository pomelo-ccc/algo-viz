import { createSignal } from 'solid-js';
import CodePanel from '../components/CodePanel';
import Dropdown from '../components/Dropdown';

export default function BitManipulation() {
  const [numA, setNumA] = createSignal(170);
  const [numB, setNumB] = createSignal(85);
  const [operation, setOperation] = createSignal<string>('and');
  const [result, setResult] = createSignal(0);
  const [steps, setSteps] = createSignal<string[]>([]);
  const [isRunning, setIsRunning] = createSignal(false);
  const [speed, setSpeed] = createSignal(50);
  const [highlightBit, setHighlightBit] = createSignal<number | null>(null);

  const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));
  const addStep = (text: string) => setSteps(prev => [text, ...prev].slice(0, 30));

  const toBinary = (n: number, bits = 8) => {
    return (n >>> 0).toString(2).padStart(bits, '0');
  };

  const runOperation = async () => {
    if (isRunning()) return;
    setIsRunning(true);
    setSteps([]);
    addStep(`执行操作: ${numA()} ${getOpSymbol(operation())} ${numB()}`);

    let res = 0;
    const a = numA();
    const b = numB();
    const op = operation();

    switch (op) {
      case 'and': res = a & b; break;
      case 'or': res = a | b; break;
      case 'xor': res = a ^ b; break;
      case 'not': res = ~a; break;
      case 'lsh': res = a << 1; break;
      case 'rsh': res = a >> 1; break;
    }

    for (let i = 7; i >= 0; i--) {
      if (!isRunning()) break;
      setHighlightBit(i);
      const aBit = (a >>> i) & 1;
      const bBit = (b >>> i) & 1;
      let rBit = 0;
      let desc = '';
      switch (op) {
        case 'and': rBit = aBit & bBit; desc = `${aBit} & ${bBit} = ${rBit}`; break;
        case 'or': rBit = aBit | bBit; desc = `${aBit} | ${bBit} = ${rBit}`; break;
        case 'xor': rBit = aBit ^ bBit; desc = `${aBit} ^ ${bBit} = ${rBit}`; break;
        case 'not': rBit = aBit === 0 ? 1 : 0; desc = `~${aBit} = ${rBit}`; break;
        case 'lsh': desc = `左移`; break;
        case 'rsh': desc = `右移`; break;
      }
      addStep(`位 ${i}: ${desc}`);
      await sleep(Math.max(1, 101 - speed()) * 15);
    }

    setResult(res);
    addStep(`结果: ${res} (二进制: ${toBinary(res)})`);
    setIsRunning(false);
  };

  const getOpSymbol = (op: string) => {
    switch (op) {
      case 'and': return '&';
      case 'or': return '|';
      case 'xor': return '^';
      case 'not': return '~';
      case 'lsh': return '<<';
      case 'rsh': return '>>';
      default: return '';
    }
  };

  const [singleNum, setSingleNum] = createSignal(170);
  const [singleResult, setSingleResult] = createSignal(0);

  const countBits = async () => {
    if (isRunning()) return;
    setIsRunning(true);
    setSteps([]);
    addStep(`计算 ${singleNum()} 的二进制中1的个数`);

    let n = singleNum();
    let count = 0;
    for (let i = 7; i >= 0; i--) {
      if (!isRunning()) break;
      setHighlightBit(i);
      const bit = (n >>> i) & 1;
      if (bit === 1) {
        count++;
        addStep(`位 ${i}: 1 (计数: ${count})`);
      } else {
        addStep(`位 ${i}: 0`);
      }
      await sleep(Math.max(1, 101 - speed()) * 12);
    }

    setSingleResult(count);
    addStep(`结果: ${singleNum()} 中共有 ${count} 个1`);
    setIsRunning(false);
  };

  const isPowerOfTwo = async () => {
    if (isRunning()) return;
    setIsRunning(true);
    setSteps([]);
    addStep(`判断 ${singleNum()} 是否为2的幂`);

    const n = singleNum();
    addStep(`检查: n & (n-1) == 0`);
    await sleep(Math.max(1, 101 - speed()) * 10);

    const nMinus1 = n - 1;
    addStep(`${n} & (${n}-1) = ${n} & ${nMinus1} = ${n & nMinus1}`);
    await sleep(Math.max(1, 101 - speed()) * 10);

    const res = (n & nMinus1) === 0 && n !== 0;
    setSingleResult(res ? 1 : 0);
    addStep(`结果: ${n} ${res ? '是' : '不是'} 2的幂`);
    setIsRunning(false);
  };

  const [activeTab, setActiveTab] = createSignal<'basic' | 'applications'>('basic');

  const renderBit = (num: number, bitIndex: number) => {
    const bit = (num >>> bitIndex) & 1;
    const isHighlight = highlightBit() === bitIndex;
    return (
      <div style={{
        width: '32px',
        height: '32px',
        display: 'flex',
        'align-items': 'center',
        'justify-content': 'center',
        background: isHighlight ? '#1a1a1a' : '#f5f5f5',
        color: isHighlight ? '#fff' : '#1a1a1a',
        border: '1px solid var(--border)',
        'font-family': 'var(--font-mono)',
        'font-size': '0.85rem',
        'font-weight': '500',
        transition: 'all 0.3s ease',
      }}>{bit}</div>
    );
  };

  return (
    <main class="visualization-page">
      <div class="container">
        <div class="visualization-header">
          <h1>位运算</h1>
          <p class="description">位运算在计算机底层操作中最基础且高效，掌握位运算技巧能够显著提升算法性能和代码效率。</p>
        </div>
        <div style={{ display: 'flex', gap: '0', 'border-bottom': '1px solid var(--border)', 'margin-bottom': '2rem' }}>
          {[
            { id: 'basic', label: '基本运算' },
            { id: 'applications', label: '经典应用' },
          ].map(tab => (
            <div
              class="bit-tab"
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
              onClick={() => setActiveTab(tab.id as 'basic' | 'applications')}
            >
              {tab.label}
            </div>
          ))}
        </div>

        {activeTab() === 'basic' && (
          <div>
            <div class="controls">
              <div class="controls-group">
                <label>数字 A</label>
                <input type="number" value={numA()} onChange={e => setNumA(parseInt(e.currentTarget.value) || 0)} style={{ width: '80px', padding: '0.5rem', border: '1px solid var(--border)' }} />
              </div>
              <div class="controls-group">
                <label>数字 B</label>
                <input type="number" value={numB()} onChange={e => setNumB(parseInt(e.currentTarget.value) || 0)} style={{ width: '80px', padding: '0.5rem', border: '1px solid var(--border)' }} />
              </div>
              <div class="controls-group">
                <label>操作</label>
                <Dropdown
                  value={operation()}
                  onChange={(value) => setOperation(value)}
                  options={[
                    { label: 'AND (&)', value: 'and' },
                    { label: 'OR (|)', value: 'or' },
                    { label: 'XOR (^)', value: 'xor' },
                    { label: 'NOT (~)', value: 'not' },
                    { label: '左移 (<<)', value: 'lsh' },
                    { label: '右移 (>>)', value: 'rsh' },
                  ]}
                />
              </div>
              <div class="controls-group">
                <button class="btn btn-primary" onClick={runOperation} disabled={isRunning()}>
                  {isRunning() ? '运行中...' : '执行运算'}
                </button>
              </div>
            </div>
            <div class="canvas-container" style={{ padding: '2rem', 'min-height': '300px' }}>
              <div style={{ display: 'flex', 'flex-direction': 'column', gap: '2rem', 'align-items': 'center' }}>
                <div style={{ display: 'flex', 'flex-direction': 'column', gap: '0.5rem', 'align-items': 'center' }}>
                  <span style={{ 'font-size': '0.75rem', color: 'var(--text-tertiary)', 'text-transform': 'uppercase', 'letter-spacing': '0.05em' }}>数字 A ({numA()})</span>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    {Array.from({ length: 8 }, (_, i) => renderBit(numA(), 7 - i))}
                  </div>
                </div>
                <div style={{ 'font-size': '1.5rem', 'font-weight': '500' }}>{getOpSymbol(operation())}</div>
                {operation() !== 'not' && operation() !== 'lsh' && operation() !== 'rsh' && (
                  <div style={{ display: 'flex', 'flex-direction': 'column', gap: '0.5rem', 'align-items': 'center' }}>
                    <span style={{ 'font-size': '0.75rem', color: 'var(--text-tertiary)', 'text-transform': 'uppercase', 'letter-spacing': '0.05em' }}>数字 B ({numB()})</span>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      {Array.from({ length: 8 }, (_, i) => renderBit(numB(), 7 - i))}
                    </div>
                  </div>
                )}
                <div style={{ width: '60px', height: '1px', background: 'var(--border)', margin: '0.5rem 0' }}></div>
                <div style={{ display: 'flex', 'flex-direction': 'column', gap: '0.5rem', 'align-items': 'center' }}>
                  <span style={{ 'font-size': '0.75rem', color: 'var(--text-tertiary)', 'text-transform': 'uppercase', 'letter-spacing': '0.05em' }}>结果 ({result()})</span>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    {Array.from({ length: 8 }, (_, i) => renderBit(result(), 7 - i))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab() === 'applications' && (
          <div>
            <div class="controls">
              <div class="controls-group">
                <label>数字</label>
                <input type="number" value={singleNum()} onChange={e => setSingleNum(parseInt(e.currentTarget.value) || 0)} style={{ width: '80px', padding: '0.5rem', border: '1px solid var(--border)' }} />
              </div>
              <div class="controls-group">
                <button class="btn" onClick={countBits} disabled={isRunning()}>计算1的个数</button>
                <button class="btn btn-primary" onClick={isPowerOfTwo} disabled={isRunning()}>判断2的幂</button>
              </div>
            </div>
            <div class="canvas-container" style={{ padding: '2rem', 'min-height': '200px' }}>
              <div style={{ display: 'flex', 'flex-direction': 'column', gap: '1rem', 'align-items': 'center' }}>
                <div style={{ display: 'flex', 'flex-direction': 'column', gap: '0.5rem', 'align-items': 'center' }}>
                  <span style={{ 'font-size': '0.75rem', color: 'var(--text-tertiary)', 'text-transform': 'uppercase', 'letter-spacing': '0.05em' }}>数字 ({singleNum()})</span>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    {Array.from({ length: 8 }, (_, i) => renderBit(singleNum(), 7 - i))}
                  </div>
                </div>
                {singleResult() > 0 && (
                  <div style={{ 'margin-top': '1rem', padding: '1rem', background: '#f5f5f5', border: '1px solid var(--border)', 'text-align': 'center' }}>
                    <span style={{ 'font-family': 'var(--font-mono)', 'font-size': '1.25rem', 'font-weight': '500' }}>{singleResult()}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <div class="info-panel">
          <h3>位运算技巧</h3>
          <ul style={{ 'padding-left': '1.25rem', 'line-height': '2', 'margin-top': '0.5rem' }}>
            <li><strong>n & (n-1)</strong>：清除最低位的1，用于快速计算1的个数</li>
            <li><strong>n & -n</strong>：获取最低位的1的值</li>
            <li><strong>n | (n+1)</strong>：将最低位的0变为1</li>
            <li><strong>n & (n+1)</strong>：将尾部的1全部变为0</li>
            <li>{'n ^ (n >> 1)'}：格雷码转换</li>
            <li><strong>a ^ b ^ a = b</strong>：利用异或交换两个数</li>
          </ul>
          <div class="complexity" style={{ 'margin-top': '1.5rem' }}>
            <div class="complexity-item"><div class="label">所有基本位运算</div><div class="value">O(1)</div></div>
            <div class="complexity-item"><div class="label">空间复杂度</div><div class="value">O(1)</div></div>
          </div>
        </div>

        <div class="steps-panel">
          <h3>执行步骤</h3>
          <div>
            {steps().length === 0 ? (
              <div class="step-item">选择操作并点击"执行运算"查看位运算过程</div>
            ) : (
              steps().map(step => <div class="step-item active">{step}</div>)
            )}
          </div>
        </div>

        <CodePanel category="bitmanip" algorithm="basic" />
      </div>
    </main>
  );
}
