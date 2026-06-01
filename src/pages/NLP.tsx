import { createSignal } from 'solid-js';
import CodePanel from '../components/CodePanel';

export default function NLP() {
  const [activeTab, setActiveTab] = createSignal('wordfreq');
  const [isRunning, setIsRunning] = createSignal(false);
  const [steps, setSteps] = createSignal<string[]>([]);
  const [speed, setSpeed] = createSignal(50);

  // Word Frequency
  const [wordFreqText, setWordFreqText] = createSignal('this is a test this is only a test');
  const [wordFreqResult, setWordFreqResult] = createSignal<Map<string, number>>(new Map());

  // TF-IDF
  const [tfidfDocs, setTfidfDocs] = createSignal<string[]>([
    'this is a test',
    'this is only a test',
    'test test test',
  ]);
  const [tfidfResult, setTfidfResult] = createSignal<Map<string, number>>(new Map());

  // Sentiment Analysis
  const [sentimentText, setSentimentText] = createSignal('I love this product');
  const [sentimentResult, setSentimentResult] = createSignal<string>('');

  const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));
  const addStep = (text: string) => setSteps(prev => [text, ...prev].slice(0, 30));

  // Word Frequency
  const runWordFreq = async () => {
    if (isRunning()) return;
    setIsRunning(true);
    setSteps([]);
    addStep('词频统计');

    const text = wordFreqText().toLowerCase();
    const words = text.split(/\s+/);
    const freq = new Map<string, number>();

    for (const word of words) {
      if (word) {
        freq.set(word, (freq.get(word) || 0) + 1);
        addStep(`统计: ${word} -> ${freq.get(word)}`);
        await sleep(Math.max(1, 101 - speed()) * 5);
      }
    }

    setWordFreqResult(new Map(freq));
    addStep('词频统计完成');
    setIsRunning(false);
  };

  // TF-IDF
  const runTfidf = async () => {
    if (isRunning()) return;
    setIsRunning(true);
    setSteps([]);
    addStep('TF-IDF: 计算词频-逆文档频率');

    const docs = tfidfDocs();
    const wordCount: Map<string, number> = new Map();
    const docCount = docs.length;

    // Count word frequency in all documents
    for (const doc of docs) {
      const words = doc.toLowerCase().split(/\s+/);
      const seen = new Set<string>();
      for (const word of words) {
        if (word) {
          wordCount.set(word, (wordCount.get(word) || 0) + 1);
          if (!seen.has(word)) {
            seen.add(word);
          }
        }
      }
    }

    // Calculate TF-IDF for each word in each document
    const tfidf = new Map<string, number>();
    for (const doc of docs) {
      const words = doc.toLowerCase().split(/\s+/);
      const docWordCount = new Map<string, number>();
      for (const word of words) {
        if (word) {
          docWordCount.set(word, (docWordCount.get(word) || 0) + 1);
        }
      }

      for (const [word, count] of docWordCount.entries()) {
        const tf = count / words.length;
        const idf = Math.log(docCount / (wordCount.get(word) || 1));
        tfidf.set(word, (tfidf.get(word) || 0) + tf * idf);
        addStep(`TF-IDF(${word}): TF=${tf.toFixed(4)}, IDF=${idf.toFixed(4)}, TF-IDF=${(tf * idf).toFixed(4)}`);
        await sleep(Math.max(1, 101 - speed()) * 5);
      }
    }

    setTfidfResult(new Map(tfidf));
    addStep('TF-IDF计算完成');
    setIsRunning(false);
  };

  // Sentiment Analysis
  const runSentiment = async () => {
    if (isRunning()) return;
    setIsRunning(true);
    setSteps([]);
    addStep('情感分析');

    const text = sentimentText().toLowerCase();
    const positiveWords = ['love', 'great', 'excellent', 'good', 'amazing', 'wonderful', 'fantastic', 'best', 'happy', 'joy'];
    const negativeWords = ['hate', 'terrible', 'bad', 'awful', 'worst', 'sad', 'angry', 'disappointed', 'horrible', 'poor'];

    let positive = 0;
    let negative = 0;

    const words = text.split(/\s+/);
    for (const word of words) {
      if (positiveWords.includes(word)) {
        positive++;
        addStep(`正面词: ${word}`);
        await sleep(Math.max(1, 101 - speed()) * 5);
      } else if (negativeWords.includes(word)) {
        negative++;
        addStep(`负面词: ${word}`);
        await sleep(Math.max(1, 101 - speed()) * 5);
      }
    }

    if (positive > negative) {
      setSentimentResult('正面');
    } else if (negative > positive) {
      setSentimentResult('负面');
    } else {
      setSentimentResult('中性');
    }

    addStep(`情感分析结果: ${sentimentResult()}`);
    setIsRunning(false);
  };

  const tabs = [
    { id: 'wordfreq', label: '词频统计' },
    { id: 'tfidf', label: 'TF-IDF' },
    { id: 'sentiment', label: '情感分析' },
  ];

  return (
    <main class="visualization-page">
      <div class="container">
        <div class="visualization-header">
          <h1>自然语言处理</h1>
          <p class="description">自然语言处理算法用于文本分析，包括词频统计、TF-IDF、情感分析等经典算法。</p>
        </div>
        <div style={{ display: 'flex', gap: '0', 'border-bottom': '1px solid var(--border)', 'margin-bottom': '2rem' }}>
          {tabs.map(tab => (
            <div
              class="nlp-tab"
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

        {activeTab() === 'wordfreq' && (
          <div>
            <div class="controls">
              <div class="controls-group">
                <label>文本</label>
                <input type="text" value={wordFreqText()} onChange={e => setWordFreqText(e.currentTarget.value)} style={{ width: '300px', padding: '0.5rem', border: '1px solid var(--border)' }} />
              </div>
              <div class="controls-group">
                <button class="btn btn-primary" onClick={runWordFreq} disabled={isRunning()}>
                  {isRunning() ? '运行中...' : '词频统计'}
                </button>
              </div>
            </div>
            <div class="canvas-container" style={{ padding: '2rem', 'min-height': '200px' }}>
              <div style={{ display: 'flex', 'flex-direction': 'column', gap: '1rem', 'align-items': 'center' }}>
                {wordFreqResult().size > 0 && (
                  <div style={{ display: 'flex', 'flex-direction': 'column', gap: '0.5rem', width: '100%', 'max-width': '400px' }}>
                    <h4 style={{ 'font-size': '0.85rem', color: 'var(--text-tertiary)', 'text-transform': 'uppercase', 'letter-spacing': '0.05em', 'margin-bottom': '0.5rem' }}>词频统计</h4>
                    {Array.from(wordFreqResult().entries()).map(([word, count]) => (
                      <div style={{ display: 'flex', 'align-items': 'center', gap: '1rem', padding: '0.5rem', background: 'var(--bg-secondary)', border: '1px solid var(--border)', 'font-family': 'var(--font-mono)', 'font-size': '0.85rem' }}>
                        <span style={{ width: '100px' }}>{word}</span>
                        <span>{count}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div class="info-panel">
              <h3>词频统计</h3>
              <p>统计文本中每个词出现的次数，是文本分析的基础。</p>
              <div class="complexity">
                <div class="complexity-item"><div class="label">时间复杂度</div><div class="value">O(n)</div></div>
                <div class="complexity-item"><div class="label">空间复杂度</div><div class="value">O(n)</div></div>
                <div class="complexity-item"><div class="label">应用</div><div class="value">文本分析</div></div>
              </div>
            </div>
          </div>
        )}

        {activeTab() === 'tfidf' && (
          <div>
            <div class="controls">
              <div class="controls-group">
                <label>文档数量</label>
                <input type="number" value={tfidfDocs().length} onChange={e => setTfidfDocs(new Array(parseInt(e.currentTarget.value)).fill(''))} style={{ width: '60px', padding: '0.5rem', border: '1px solid var(--border)' }} />
              </div>
              <div class="controls-group">
                <button class="btn btn-primary" onClick={runTfidf} disabled={isRunning()}>
                  {isRunning() ? '运行中...' : '计算TF-IDF'}
                </button>
              </div>
            </div>
            <div class="canvas-container" style={{ padding: '2rem', 'min-height': '200px' }}>
              <div style={{ display: 'flex', 'flex-direction': 'column', gap: '1rem', 'align-items': 'center' }}>
                {tfidfResult().size > 0 && (
                  <div style={{ display: 'flex', 'flex-direction': 'column', gap: '0.5rem', width: '100%', 'max-width': '400px' }}>
                    <h4 style={{ 'font-size': '0.85rem', color: 'var(--text-tertiary)', 'text-transform': 'uppercase', 'letter-spacing': '0.05em', 'margin-bottom': '0.5rem' }}>TF-IDF</h4>
                    {Array.from(tfidfResult().entries()).map(([word, score]) => (
                      <div style={{ display: 'flex', 'align-items': 'center', gap: '1rem', padding: '0.5rem', background: 'var(--bg-secondary)', border: '1px solid var(--border)', 'font-family': 'var(--font-mono)', 'font-size': '0.85rem' }}>
                        <span style={{ width: '100px' }}>{word}</span>
                        <span>{score.toFixed(4)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div class="info-panel">
              <h3>TF-IDF</h3>
              <p>评估一个词在文档集中的重要程度，是信息检索和文本挖掘的常用方法。</p>
              <div class="complexity">
                <div class="complexity-item"><div class="label">时间复杂度</div><div class="value">O(n * m)</div></div>
                <div class="complexity-item"><div class="label">空间复杂度</div><div class="value">O(n * m)</div></div>
                <div class="complexity-item"><div class="label">应用</div><div class="value">信息检索</div></div>
              </div>
            </div>
          </div>
        )}

        {activeTab() === 'sentiment' && (
          <div>
            <div class="controls">
              <div class="controls-group">
                <label>文本</label>
                <input type="text" value={sentimentText()} onChange={e => setSentimentText(e.currentTarget.value)} style={{ width: '300px', padding: '0.5rem', border: '1px solid var(--border)' }} />
              </div>
              <div class="controls-group">
                <button class="btn btn-primary" onClick={runSentiment} disabled={isRunning()}>
                  {isRunning() ? '运行中...' : '情感分析'}
                </button>
              </div>
            </div>
            <div class="canvas-container" style={{ padding: '2rem', 'min-height': '200px' }}>
              <div style={{ display: 'flex', 'flex-direction': 'column', gap: '1rem', 'align-items': 'center' }}>
                {sentimentResult() && (
                  <div style={{ padding: '1rem', background: 'var(--bg-secondary)', border: '1px solid var(--border)', 'text-align': 'center', 'font-family': 'var(--font-mono)', 'font-size': '1.25rem' }}>
                    情感: {sentimentResult()}
                  </div>
                )}
              </div>
            </div>
            <div class="info-panel">
              <h3>情感分析</h3>
              <p>通过识别文本中的情感词来判断文本的情感倾向。</p>
              <div class="complexity">
                <div class="complexity-item"><div class="label">时间复杂度</div><div class="value">O(n)</div></div>
                <div class="complexity-item"><div class="label">空间复杂度</div><div class="value">O(1)</div></div>
                <div class="complexity-item"><div class="label">方法</div><div class="value">词典匹配</div></div>
              </div>
            </div>
          </div>
        )}

        <div class="steps-panel">
          <h3>执行步骤</h3>
          <div>
            {steps().length === 0 ? (
              <div class="step-item">选择标签页并点击"开始"查看自然语言处理算法执行过程</div>
            ) : (
              steps().map(step => <div class="step-item active">{step}</div>)
            )}
          </div>
        </div>
        <CodePanel category="nlp" algorithm={activeTab()} />
      </div>
    </main>
  );
}
