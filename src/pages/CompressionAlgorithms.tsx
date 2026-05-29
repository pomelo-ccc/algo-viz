import { createSignal } from 'solid-js';

export default function CompressionAlgorithms() {
  const [activeTab, setActiveTab] = createSignal('rle');
  const [isRunning, setIsRunning] = createSignal(false);
  const [steps, setSteps] = createSignal<string[]>([]);
  const [speed, setSpeed] = createSignal(50);

  // Run-Length Encoding
  const [rleText, setRleText] = createSignal('AAABBBCCCDDDD');
  const [rleResult, setRleResult] = createSignal<string>('');
  const [rleCompression, setRleCompression] = createSignal(0);

  // LZW
  const [lzwText, setLzwText] = createSignal('ABABABA');
  const [lzwResult, setLzwResult] = createSignal<number[]>([]);
  const [lzwDict, setLzwDict] = createSignal<Map<string, number>>(new Map());

  // Huffman
  const [huffmanText, setHuffmanText] = createSignal('this is an example of a huffman tree');
  const [huffmanCodes, setHuffmanCodes] = createSignal<Map<string, string>>(new Map());
  const [huffmanResult, setHuffmanResult] = createSignal('');

  const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));
  const addStep = (text: string) => setSteps(prev => [text, ...prev].slice(0, 30));

  // Run-Length Encoding
  const runRle = async () => {
    if (isRunning()) return;
    setIsRunning(true);
    setSteps([]);
    addStep('Run-Length Encoding: 编码字符串');

    const text = rleText();
    let result = '';
    let count = 1;

    for (let i = 1; i < text.length; i++) {
      if (text[i] === text[i - 1]) {
        count++;
      } else {
        result += text[i - 1] + count;
        addStep(`编码: ${text[i - 1]} x ${count}`);
        await sleep(Math.max(1, 101 - speed()) * 5);
        count = 1;
      }
    }
    result += text[text.length - 1] + count;
    addStep(`编码: ${text[text.length - 1]} x ${count}`);

    setRleResult(result);
    const compression = ((text.length - result.length) / text.length) * 100;
    setRleCompression(compression);
    addStep(`压缩率: ${compression.toFixed(2)}%`);
    setIsRunning(false);
  };

  // LZW
  const runLzw = async () => {
    if (isRunning()) return;
    setIsRunning(true);
    setSteps([]);
    addStep('LZW: 压缩字符串');

    const text = lzwText();
    const dict = new Map<string, number>();
    const result: number[] = [];
    let dictSize = 256;

    // Initialize dictionary with single characters
    for (let i = 0; i < 256; i++) {
      dict.set(String.fromCharCode(i), i);
    }

    let w = '';
    for (let i = 0; i < text.length; i++) {
      const c = text[i];
      const wc = w + c;
      if (dict.has(wc)) {
        w = wc;
      } else {
        result.push(dict.get(w)!);
        addStep(`输出: ${dict.get(w)} (${w})`);
        await sleep(Math.max(1, 101 - speed()) * 5);
        dict.set(wc, dictSize++);
        addStep(`添加到字典: ${wc} -> ${dictSize - 1}`);
        await sleep(Math.max(1, 101 - speed()) * 5);
        w = c;
      }
    }

    if (w) {
      result.push(dict.get(w)!);
      addStep(`输出: ${dict.get(w)} (${w})`);
    }

    setLzwResult(result);
    setLzwDict(new Map(dict));
    addStep('LZW压缩完成');
    setIsRunning(false);
  };

  // Huffman
  const runHuffman = async () => {
    if (isRunning()) return;
    setIsRunning(true);
    setSteps([]);
    addStep('Huffman: 构建Huffman树');

    const text = huffmanText();
    const freq: Map<string, number> = new Map();
    for (const c of text) {
      freq.set(c, (freq.get(c) || 0) + 1);
    }

    // Build Huffman tree
    interface Node {
      char: string;
      freq: number;
      left: Node | null;
      right: Node | null;
    }

    const nodes: Node[] = Array.from(freq.entries()).map(([char, f]) => ({ char, freq: f, left: null, right: null }));

    while (nodes.length > 1) {
      nodes.sort((a, b) => a.freq - b.freq);
      const left = nodes.shift()!;
      const right = nodes.shift()!;
      const parent: Node = { char: '', freq: left.freq + right.freq, left, right };
      nodes.push(parent);
      addStep(`合并节点: ${left.freq} + ${right.freq} = ${parent.freq}`);
      await sleep(Math.max(1, 101 - speed()) * 5);
    }

    // Generate codes
    const codes = new Map<string, string>();
    const generateCodes = (node: Node | null, code: string) => {
      if (!node) return;
      if (node.left === null && node.right === null) {
        codes.set(node.char, code || '0');
      }
      if (node.left) generateCodes(node.left, code + '0');
      if (node.right) generateCodes(node.right, code + '1');
    };

    if (nodes.length > 0) {
      generateCodes(nodes[0], '');
    }

    setHuffmanCodes(new Map(codes));

    let result = '';
    for (const c of text) {
      result += codes.get(c) || '';
    }
    setHuffmanResult(result);
    addStep('Huffman编码完成');
    setIsRunning(false);
  };

  const tabs = [
    { id: 'rle', label: 'Run-Length' },
    { id: 'lzw', label: 'LZW' },
    { id: 'huffman', label: 'Huffman' },
  ];

  return (
    <main class="visualization-page">
      <div class="container">
        <div class="visualization-header">
          <h1>压缩算法</h1>
          <p class="description">压缩算法用于减少数据存储空间，包括无损压缩和有损压缩两大类。常见的无损压缩算法有Run-Length、LZW、Huffman等。</p>
        </div>
        <div style={{ display: 'flex', gap: '0', 'border-bottom': '1px solid var(--border)', 'margin-bottom': '2rem' }}>
          {tabs.map(tab => (
            <div
              class="comp-tab"
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

        {activeTab() === 'rle' && (
          <div>
            <div class="controls">
              <div class="controls-group">
                <label>字符串</label>
                <input type="text" value={rleText()} onChange={e => setRleText(e.currentTarget.value)} style={{ width: '200px', padding: '0.5rem', border: '1px solid var(--border)' }} />
              </div>
              <div class="controls-group">
                <button class="btn btn-primary" onClick={runRle} disabled={isRunning()}>
                  {isRunning() ? '运行中...' : 'Run-Length编码'}
                </button>
              </div>
            </div>
            <div class="canvas-container" style={{ padding: '2rem', 'min-height': '200px' }}>
              <div style={{ display: 'flex', 'flex-direction': 'column', gap: '1rem', 'align-items': 'center' }}>
                <div style={{ 'font-family': 'var(--font-mono)', 'font-size': '0.85rem' }}>
                  <strong>原始:</strong> {rleText()}
                </div>
                {rleResult() && (
                  <div style={{ 'font-family': 'var(--font-mono)', 'font-size': '0.85rem' }}>
                    <strong>编码:</strong> {rleResult()}
                  </div>
                )}
                {rleCompression() !== 0 && (
                  <div style={{ padding: '1rem', background: 'var(--bg-secondary)', border: '1px solid var(--border)', 'text-align': 'center', 'font-family': 'var(--font-mono)', 'font-size': '1.25rem' }}>
                    压缩率: {rleCompression().toFixed(2)}%
                  </div>
                )}
              </div>
            </div>
            <div class="info-panel">
              <h3>Run-Length Encoding</h3>
              <p>将连续相同的字符替换为字符和其重复次数。适用于有大量连续重复字符的数据。</p>
              <div class="complexity">
                <div class="complexity-item"><div class="label">时间复杂度</div><div class="value">O(n)</div></div>
                <div class="complexity-item"><div class="label">空间复杂度</div><div class="value">O(n)</div></div>
                <div class="complexity-item"><div class="label">适用</div><div class="value">连续重复数据</div></div>
              </div>
            </div>
          </div>
        )}

        {activeTab() === 'lzw' && (
          <div>
            <div class="controls">
              <div class="controls-group">
                <label>字符串</label>
                <input type="text" value={lzwText()} onChange={e => setLzwText(e.currentTarget.value)} style={{ width: '200px', padding: '0.5rem', border: '1px solid var(--border)' }} />
              </div>
              <div class="controls-group">
                <button class="btn btn-primary" onClick={runLzw} disabled={isRunning()}>
                  {isRunning() ? '运行中...' : 'LZW压缩'}
                </button>
              </div>
            </div>
            <div class="canvas-container" style={{ padding: '2rem', 'min-height': '200px' }}>
              <div style={{ display: 'flex', 'flex-direction': 'column', gap: '1rem', 'align-items': 'center' }}>
                <div style={{ 'font-family': 'var(--font-mono)', 'font-size': '0.85rem' }}>
                  <strong>原始:</strong> {lzwText()}
                </div>
                {lzwResult().length > 0 && (
                  <div style={{ 'font-family': 'var(--font-mono)', 'font-size': '0.85rem' }}>
                    <strong>压缩结果:</strong> {lzwResult().join(', ')}
                  </div>
                )}
              </div>
            </div>
            <div class="info-panel">
              <h3>LZW压缩</h3>
              <p>动态构建字典来替换重复的字符串模式。广泛用于GIF、TIFF等文件格式。</p>
              <div class="complexity">
                <div class="complexity-item"><div class="label">时间复杂度</div><div class="value">O(n)</div></div>
                <div class="complexity-item"><div class="label">空间复杂度</div><div class="value">O(n)</div></div>
                <div class="complexity-item"><div class="label">应用</div><div class="value">GIF、TIFF</div></div>
              </div>
            </div>
          </div>
        )}

        {activeTab() === 'huffman' && (
          <div>
            <div class="controls">
              <div class="controls-group">
                <label>字符串</label>
                <input type="text" value={huffmanText()} onChange={e => setHuffmanText(e.currentTarget.value)} style={{ width: '200px', padding: '0.5rem', border: '1px solid var(--border)' }} />
              </div>
              <div class="controls-group">
                <button class="btn btn-primary" onClick={runHuffman} disabled={isRunning()}>
                  {isRunning() ? '运行中...' : 'Huffman编码'}
                </button>
              </div>
            </div>
            <div class="canvas-container" style={{ padding: '2rem', 'min-height': '200px' }}>
              <div style={{ display: 'flex', 'flex-direction': 'column', gap: '1rem', 'align-items': 'center' }}>
                <div style={{ 'font-family': 'var(--font-mono)', 'font-size': '0.85rem' }}>
                  <strong>原始:</strong> {huffmanText()}
                </div>
                {huffmanCodes().size > 0 && (
                  <div style={{ display: 'flex', 'flex-direction': 'column', gap: '0.5rem', width: '100%', 'max-width': '400px' }}>
                    <h4 style={{ 'font-size': '0.85rem', color: 'var(--text-tertiary)', 'text-transform': 'uppercase', 'letter-spacing': '0.05em', 'margin-bottom': '0.5rem' }}>Huffman编码表</h4>
                    {Array.from(huffmanCodes().entries()).map(([char, code]) => (
                      <div style={{ display: 'flex', 'align-items': 'center', gap: '1rem', padding: '0.5rem', background: 'var(--bg-secondary)', border: '1px solid var(--border)', 'font-family': 'var(--font-mono)', 'font-size': '0.85rem' }}>
                        <span style={{ width: '30px' }}>{char}</span>
                        <span>{code}</span>
                      </div>
                    ))}
                  </div>
                )}
                {huffmanResult() && (
                  <div style={{ padding: '1rem', background: 'var(--bg-secondary)', border: '1px solid var(--border)', 'text-align': 'center', 'font-family': 'var(--font-mono)', 'font-size': '0.85rem' }}>
                    <strong>编码结果:</strong> {huffmanResult()}
                  </div>
                )}
              </div>
            </div>
            <div class="info-panel">
              <h3>Huffman编码</h3>
              <p>根据字符出现频率构建最优前缀码，高频字符使用短编码，低频字符使用长编码。</p>
              <div class="complexity">
                <div class="complexity-item"><div class="label">构建时间</div><div class="value">O(n log n)</div></div>
                <div class="complexity-item"><div class="label">编码时间</div><div class="value">O(n)</div></div>
                <div class="complexity-item"><div class="label">最优性</div><div class="value">前缀码最优</div></div>
              </div>
            </div>
          </div>
        )}

        <div class="steps-panel">
          <h3>执行步骤</h3>
          <div>
            {steps().length === 0 ? (
              <div class="step-item">选择标签页并点击"开始"查看压缩算法执行过程</div>
            ) : (
              steps().map(step => <div class="step-item active">{step}</div>)
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
