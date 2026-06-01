import { createSignal } from 'solid-js';
import CodePanel from '../components/CodePanel';

export default function MathAlgorithms() {
  const [activeTab, setActiveTab] = createSignal('sieve');
  const [isRunning, setIsRunning] = createSignal(false);
  const [steps, setSteps] = createSignal<string[]>([]);
  const [speed, setSpeed] = createSignal(50);

  // Sieve of Eratosthenes
  const [sieveLimit, setSieveLimit] = createSignal(50);
  const [sieveArray, setSieveArray] = createSignal<boolean[]>([]);
  const [sieveCurrent, setSieveCurrent] = createSignal<number | null>(null);
  const [sievePrimes, setSievePrimes] = createSignal<number[]>([]);

  // GCD
  const [gcdA, setGcdA] = createSignal(48);
  const [gcdB, setGcdB] = createSignal(18);
  const [gcdResult, setGcdResult] = createSignal(0);
  const [gcdSteps, setGcdSteps] = createSignal<{ a: number; b: number; r: number }[]>([]);

  // LCM
  const [lcmA, setLcmA] = createSignal(12);
  const [lcmB, setLcmB] = createSignal(18);
  const [lcmResult, setLcmResult] = createSignal(0);
  const [lcmGcd, setLcmGcd] = createSignal(0);

  const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));
  const addStep = (text: string) => setSteps(prev => [text, ...prev].slice(0, 30));

  // Sieve
  const initSieve = () => {
    const n = sieveLimit();
    const arr = new Array(n + 1).fill(true);
    arr[0] = false;
    arr[1] = false;
    setSieveArray(arr);
    setSieveCurrent(null);
    setSievePrimes([]);
    setSteps([]);
  };

  const runSieve = async () => {
    if (isRunning()) return;
    setIsRunning(true);
    setSteps([]);
    addStep(`素数筛: 找出 2 到 ${sieveLimit()} 之间的所有素数`);

    const n = sieveLimit();
    const isPrime = new Array(n + 1).fill(true);
    isPrime[0] = false;
    isPrime[1] = false;
    setSieveArray([...isPrime]);

    for (let p = 2; p * p <= n; p++) {
      if (!isRunning()) break;
      if (isPrime[p]) {
        setSieveCurrent(p);
        addStep(`找到素数 ${p}，标记其倍数`);
        await sleep(Math.max(1, 101 - speed()) * 10);
        for (let i = p * p; i <= n; i += p) {
          if (!isRunning()) break;
          isPrime[i] = false;
          setSieveArray([...isPrime]);
          addStep(`${i} = ${p} x ${i / p}，标记为合数`);
          await sleep(Math.max(1, 101 - speed()) * 5);
        }
      }
    }

    const primes: number[] = [];
    for (let i = 2; i <= n; i++) {
      if (isPrime[i]) primes.push(i);
    }
    setSievePrimes(primes);
    addStep(`素数筛选完成: ${primes.join(', ')}`);
    setIsRunning(false);
  };

  // GCD
  const runGcd = async () => {
    if (isRunning()) return;
    setIsRunning(true);
    setSteps([]);
    addStep(`计算 GCD(${gcdA()}, ${gcdB()})`);

    let a = gcdA();
    let b = gcdB();
    const steps: { a: number; b: number; r: number }[] = [];

    while (b !== 0) {
      if (!isRunning()) break;
      const r = a % b;
      steps.push({ a, b, r });
      addStep(`${a} % ${b} = ${r}`);
      setGcdSteps([...steps]);
      await sleep(Math.max(1, 101 - speed()) * 15);
      a = b;
      b = r;
    }

    setGcdResult(a);
    addStep(`GCD(${gcdA()}, ${gcdB()}) = ${a}`);
    setIsRunning(false);
  };

  // LCM
  const runLcm = async () => {
    if (isRunning()) return;
    setIsRunning(true);
    setSteps([]);
    addStep(`计算 LCM(${lcmA()}, ${lcmB()})`);

    let a = lcmA();
    let b = lcmB();
    addStep(`先计算 GCD(${a}, ${b})`);
    await sleep(Math.max(1, 101 - speed()) * 10);

    const originalA = a;
    const originalB = b;
    while (b !== 0) {
      const r = a % b;
      a = b;
      b = r;
    }
    const gcd = a;
    setLcmGcd(gcd);
    addStep(`GCD(${originalA}, ${originalB}) = ${gcd}`);
    await sleep(Math.max(1, 101 - speed()) * 10);

    const lcm = Math.floor((originalA * originalB) / gcd);
    setLcmResult(lcm);
    addStep(`LCM(${originalA}, ${originalB}) = (${originalA} x ${originalB}) / ${gcd} = ${lcm}`);
    setIsRunning(false);
  };

  const tabs = [
    { id: 'sieve', label: '素数筛' },
    { id: 'gcd', label: '最大公约数' },
    { id: 'lcm', label: '最小公倍数' },
  ];

  return (
    <main class="visualization-page">
      <div class="container">
        <div class="visualization-header">
          <h1>数学算法</h1>
          <p class="description">数学算法是计算机科学的基础，掌握这些经典算法有助于理解更复杂的数据结构和算法设计。</p>
        </div>
        <div style={{ display: 'flex', gap: '0', 'border-bottom': '1px solid var(--border)', 'margin-bottom': '2rem' }}>
          {tabs.map(tab => (
            <div
              class="math-tab"
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

        {activeTab() === 'sieve' && (
          <div>
            <div class="controls">
              <div class="controls-group">
                <label>上限</label>
                <input type="range" min="10" max="100" value={sieveLimit()} onInput={e => setSieveLimit(parseInt(e.currentTarget.value))} />
                <span>{sieveLimit()}</span>
              </div>
              <div class="controls-group">
                <button class="btn" onClick={initSieve}>初始化</button>
                <button class="btn btn-primary" onClick={runSieve} disabled={isRunning()}>
                  {isRunning() ? '运行中...' : '开始筛素数'}
                </button>
              </div>
            </div>
            <div class="canvas-container" style={{ padding: '2rem', 'min-height': '200px' }}>
              <div style={{ display: 'flex', 'flex-wrap': 'wrap', gap: '4px', 'justify-content': 'center' }}>
                {Array.from({ length: sieveLimit() + 1 }, (_, i) => i).map(num => {
                  const isPrime = sieveArray()[num];
                  const isCurrent = sieveCurrent() === num;
                  const isPrimeList = sievePrimes().includes(num);
                  if (num < 2) return null;
                  return (
                    <div style={{
                      width: '36px',
                      height: '36px',
                      display: 'flex',
                      'align-items': 'center',
                      'justify-content': 'center',
                      background: isCurrent ? '#1a1a1a' : isPrimeList ? '#1a1a1a' : isPrime === false ? '#e5e5e5' : '#f5f5f5',
                      color: isCurrent || isPrimeList ? '#fff' : isPrime === false ? '#999' : '#1a1a1a',
                      border: '1px solid var(--border)',
                      'font-family': 'var(--font-mono)',
                      'font-size': '0.75rem',
                      transition: 'all 0.3s ease',
                    }}>{num}</div>
                  );
                })}
              </div>
            </div>
            <div class="info-panel">
              <h3>埃拉托斯特尼筛法 (Sieve of Eratosthenes)</h3>
              <p>从2开始，将每个素数的倍数标记为合数，剩下的即为素数。时间复杂度为 O(n log log n)。</p>
              <div class="complexity">
                <div class="complexity-item"><div class="label">时间复杂度</div><div class="value">O(n log log n)</div></div>
                <div class="complexity-item"><div class="label">空间复杂度</div><div class="value">O(n)</div></div>
                <div class="complexity-item"><div class="label">适用</div><div class="value">区间素数筛选</div></div>
              </div>
            </div>
          </div>
        )}

        {activeTab() === 'gcd' && (
          <div>
            <div class="controls">
              <div class="controls-group">
                <label>数字 A</label>
                <input type="number" value={gcdA()} onChange={e => setGcdA(parseInt(e.currentTarget.value) || 48)} style={{ width: '80px', padding: '0.5rem', border: '1px solid var(--border)' }} />
              </div>
              <div class="controls-group">
                <label>数字 B</label>
                <input type="number" value={gcdB()} onChange={e => setGcdB(parseInt(e.currentTarget.value) || 18)} style={{ width: '80px', padding: '0.5rem', border: '1px solid var(--border)' }} />
              </div>
              <div class="controls-group">
                <button class="btn btn-primary" onClick={runGcd} disabled={isRunning()}>
                  {isRunning() ? '运行中...' : '计算 GCD'}
                </button>
              </div>
            </div>
            <div class="canvas-container" style={{ padding: '2rem', 'min-height': '200px' }}>
              <div style={{ display: 'flex', 'flex-direction': 'column', gap: '1rem', 'align-items': 'center' }}>
                <div style={{ display: 'flex', gap: '2rem', 'align-items': 'center', 'font-size': '1.5rem', 'font-family': 'var(--font-mono)' }}>
                  <span>GCD({gcdA()}, {gcdB()}) = {gcdResult() || '?'}</span>
                </div>
                {gcdSteps().length > 0 && (
                  <div style={{ display: 'flex', 'flex-direction': 'column', gap: '0.5rem', width: '100%', 'max-width': '400px' }}>
                    <h4 style={{ 'font-size': '0.85rem', color: 'var(--text-tertiary)', 'text-transform': 'uppercase', 'letter-spacing': '0.05em', 'margin-bottom': '0.5rem' }}>计算过程</h4>
                    {gcdSteps().map((step, i) => (
                      <div style={{ display: 'flex', 'align-items': 'center', gap: '1rem', padding: '0.5rem', background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
                        <span style={{ 'font-family': 'var(--font-mono)', 'font-size': '0.85rem', color: 'var(--text-tertiary)', width: '40px' }}>第{i + 1}步</span>
                        <span style={{ 'font-family': 'var(--font-mono)', 'font-size': '0.85rem' }}>{step.a} % {step.b} = {step.r}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div class="info-panel">
              <h3>欧几里得算法 (Euclidean Algorithm)</h3>
              <p>通过反复取余数来求两个数的最大公约数。基于 GCD(a, b) = GCD(b, a mod b) 的性质。</p>
              <div class="complexity">
                <div class="complexity-item"><div class="label">时间复杂度</div><div class="value">O(log min(a,b))</div></div>
                <div class="complexity-item"><div class="label">空间复杂度</div><div class="value">O(1)</div></div>
                <div class="complexity-item"><div class="label">核心</div><div class="value">辗转相除</div></div>
              </div>
            </div>
          </div>
        )}

        {activeTab() === 'lcm' && (
          <div>
            <div class="controls">
              <div class="controls-group">
                <label>数字 A</label>
                <input type="number" value={lcmA()} onChange={e => setLcmA(parseInt(e.currentTarget.value) || 12)} style={{ width: '80px', padding: '0.5rem', border: '1px solid var(--border)' }} />
              </div>
              <div class="controls-group">
                <label>数字 B</label>
                <input type="number" value={lcmB()} onChange={e => setLcmB(parseInt(e.currentTarget.value) || 18)} style={{ width: '80px', padding: '0.5rem', border: '1px solid var(--border)' }} />
              </div>
              <div class="controls-group">
                <button class="btn btn-primary" onClick={runLcm} disabled={isRunning()}>
                  {isRunning() ? '运行中...' : '计算 LCM'}
                </button>
              </div>
            </div>
            <div class="canvas-container" style={{ padding: '2rem', 'min-height': '200px' }}>
              <div style={{ display: 'flex', 'flex-direction': 'column', gap: '1rem', 'align-items': 'center' }}>
                <div style={{ display: 'flex', gap: '2rem', 'align-items': 'center', 'font-size': '1.5rem', 'font-family': 'var(--font-mono)' }}>
                  <span>LCM({lcmA()}, {lcmB()}) = {lcmResult() || '?'}</span>
                </div>
                {lcmResult() > 0 && (
                  <div style={{ display: 'flex', 'flex-direction': 'column', gap: '0.5rem', width: '100%', 'max-width': '400px' }}>
                    <h4 style={{ 'font-size': '0.85rem', color: 'var(--text-tertiary)', 'text-transform': 'uppercase', 'letter-spacing': '0.05em', 'margin-bottom': '0.5rem' }}>计算过程</h4>
                    <div style={{ padding: '0.5rem', background: 'var(--bg-secondary)', border: '1px solid var(--border)', 'font-family': 'var(--font-mono)', 'font-size': '0.85rem' }}>
                      GCD({lcmA()}, {lcmB()}) = {lcmGcd()}
                    </div>
                    <div style={{ padding: '0.5rem', background: 'var(--bg-secondary)', border: '1px solid var(--border)', 'font-family': 'var(--font-mono)', 'font-size': '0.85rem' }}>
                      LCM = ({lcmA()} x {lcmB()}) / {lcmGcd()} = {lcmResult()}
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div class="info-panel">
              <h3>最小公倍数 (Least Common Multiple)</h3>
              <p>利用最大公约数计算最小公倍数：LCM(a, b) = (a x b) / GCD(a, b)。</p>
              <div class="complexity">
                <div class="complexity-item"><div class="label">时间复杂度</div><div class="value">O(log min(a,b))</div></div>
                <div class="complexity-item"><div class="label">空间复杂度</div><div class="value">O(1)</div></div>
                <div class="complexity-item"><div class="label">公式</div><div class="value">LCM = (a x b) / GCD</div></div>
              </div>
            </div>
          </div>
        )}

        <div class="steps-panel">
          <h3>执行步骤</h3>
          <div>
            {steps().length === 0 ? (
              <div class="step-item">选择标签页并点击"开始"查看数学算法执行过程</div>
            ) : (
              steps().map(step => <div class="step-item active">{step}</div>)
            )}
          </div>
        </div>

        <CodePanel category="math" algorithm={activeTab() === 'sieve' ? 'prime' : activeTab()} />
      </div>
    </main>
  );
}
