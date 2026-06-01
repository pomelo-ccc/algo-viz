import { createSignal } from 'solid-js';
import CodePanel from '../components/CodePanel';

export default function ImageProcessing() {
  const [activeTab, setActiveTab] = createSignal('edge');
  const [isRunning, setIsRunning] = createSignal(false);
  const [steps, setSteps] = createSignal<string[]>([]);
  const [speed, setSpeed] = createSignal(50);

  // Edge Detection
  const [edgeImage, setEdgeImage] = createSignal<number[][]>([
    [0, 0, 0, 0, 0],
    [0, 255, 255, 255, 0],
    [0, 255, 0, 255, 0],
    [0, 255, 255, 255, 0],
    [0, 0, 0, 0, 0],
  ]);
  const [edgeResult, setEdgeResult] = createSignal<number[][]>([]);

  // Blur
  const [blurImage, setBlurImage] = createSignal<number[][]>([
    [0, 0, 0, 0, 0],
    [0, 255, 255, 255, 0],
    [0, 255, 0, 255, 0],
    [0, 255, 255, 255, 0],
    [0, 0, 0, 0, 0],
  ]);
  const [blurResult, setBlurResult] = createSignal<number[][]>([]);

  // Sharpen
  const [sharpenImage, setSharpenImage] = createSignal<number[][]>([
    [0, 0, 0, 0, 0],
    [0, 255, 255, 255, 0],
    [0, 255, 0, 255, 0],
    [0, 255, 255, 255, 0],
    [0, 0, 0, 0, 0],
  ]);
  const [sharpenResult, setSharpenResult] = createSignal<number[][]>([]);

  const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));
  const addStep = (text: string) => setSteps(prev => [text, ...prev].slice(0, 30));

  // Edge Detection (Sobel)
  const runEdgeDetection = async () => {
    if (isRunning()) return;
    setIsRunning(true);
    setSteps([]);
    addStep('Sobel边缘检测');

    const img = [...edgeImage().map(row => [...row])];
    const rows = img.length;
    const cols = img[0].length;
    const result: number[][] = Array.from({ length: rows }, () => Array(cols).fill(0));

    const sobelX = [
      [-1, 0, 1],
      [-2, 0, 2],
      [-1, 0, 1],
    ];
    const sobelY = [
      [-1, -2, -1],
      [0, 0, 0],
      [1, 2, 1],
    ];

    for (let i = 1; i < rows - 1; i++) {
      for (let j = 1; j < cols - 1; j++) {
        let gx = 0;
        let gy = 0;
        for (let k = -1; k <= 1; k++) {
          for (let l = -1; l <= 1; l++) {
            gx += img[i + k][j + l] * sobelX[k + 1][l + 1];
            gy += img[i + k][j + l] * sobelY[k + 1][l + 1];
          }
        }
        const magnitude = Math.sqrt(gx * gx + gy * gy);
        result[i][j] = Math.min(255, magnitude);
        addStep(`像素 (${i}, ${j}): Gx=${gx}, Gy=${gy}, 梯度=${magnitude.toFixed(2)}`);
        await sleep(Math.max(1, 101 - speed()) * 1);
      }
    }

    setEdgeResult(result);
    addStep('边缘检测完成');
    setIsRunning(false);
  };

  // Blur (Gaussian)
  const runBlur = async () => {
    if (isRunning()) return;
    setIsRunning(true);
    setSteps([]);
    addStep('高斯模糊');

    const img = [...blurImage().map(row => [...row])];
    const rows = img.length;
    const cols = img[0].length;
    const result: number[][] = Array.from({ length: rows }, () => Array(cols).fill(0));

    const kernel = [
      [1, 2, 1],
      [2, 4, 2],
      [1, 2, 1],
    ];
    const kernelSum = 16;

    for (let i = 1; i < rows - 1; i++) {
      for (let j = 1; j < cols - 1; j++) {
        let sum = 0;
        for (let k = -1; k <= 1; k++) {
          for (let l = -1; l <= 1; l++) {
            sum += img[i + k][j + l] * kernel[k + 1][l + 1];
          }
        }
        result[i][j] = sum / kernelSum;
        addStep(`像素 (${i}, ${j}): 模糊值=${result[i][j].toFixed(2)}`);
        await sleep(Math.max(1, 101 - speed()) * 1);
      }
    }

    setBlurResult(result);
    addStep('高斯模糊完成');
    setIsRunning(false);
  };

  // Sharpen
  const runSharpen = async () => {
    if (isRunning()) return;
    setIsRunning(true);
    setSteps([]);
    addStep('图像锐化');

    const img = [...sharpenImage().map(row => [...row])];
    const rows = img.length;
    const cols = img[0].length;
    const result: number[][] = Array.from({ length: rows }, () => Array(cols).fill(0));

    const kernel = [
      [0, -1, 0],
      [-1, 5, -1],
      [0, -1, 0],
    ];

    for (let i = 1; i < rows - 1; i++) {
      for (let j = 1; j < cols - 1; j++) {
        let sum = 0;
        for (let k = -1; k <= 1; k++) {
          for (let l = -1; l <= 1; l++) {
            sum += img[i + k][j + l] * kernel[k + 1][l + 1];
          }
        }
        result[i][j] = Math.min(255, Math.max(0, sum));
        addStep(`像素 (${i}, ${j}): 锐化值=${result[i][j]}`);
        await sleep(Math.max(1, 101 - speed()) * 1);
      }
    }

    setSharpenResult(result);
    addStep('图像锐化完成');
    setIsRunning(false);
  };

  const renderImage = (image: number[][]) => {
    return (
      <div style={{ display: 'grid', 'grid-template-columns': `repeat(${image[0].length}, 20px)`, gap: '1px' }}>
        {image.flatMap((row, i) =>
          row.map((val, j) => (
            <div
              style={{
                width: '20px',
                height: '20px',
                background: `rgb(${val}, ${val}, ${val})`,
              }}
            />
          ))
        )}
      </div>
    );
  };

  const tabs = [
    { id: 'edge', label: '边缘检测' },
    { id: 'blur', label: '模糊' },
    { id: 'sharpen', label: '锐化' },
  ];

  return (
    <main class="visualization-page">
      <div class="container">
        <div class="visualization-header">
          <h1>图像处理算法</h1>
          <p class="description">图像处理算法用于图像增强、特征提取等，包括边缘检测、模糊、锐化等经典算法。</p>
        </div>
        <div style={{ display: 'flex', gap: '0', 'border-bottom': '1px solid var(--border)', 'margin-bottom': '2rem' }}>
          {tabs.map(tab => (
            <div
              class="ip-tab"
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

        {activeTab() === 'edge' && (
          <div>
            <div class="controls">
              <div class="controls-group">
                <button class="btn btn-primary" onClick={runEdgeDetection} disabled={isRunning()}>
                  {isRunning() ? '运行中...' : '边缘检测'}
                </button>
              </div>
            </div>
            <div class="canvas-container" style={{ padding: '2rem', 'min-height': '200px' }}>
              <div style={{ display: 'flex', gap: '2rem', 'justify-content': 'center' }}>
                <div>
                  <h4>原图</h4>
                  {renderImage(edgeImage())}
                </div>
                {edgeResult().length > 0 && (
                  <div>
                    <h4>结果</h4>
                    {renderImage(edgeResult())}
                  </div>
                )}
              </div>
            </div>
            <div class="info-panel">
              <h3>Sobel边缘检测</h3>
              <p>使用Sobel算子计算图像梯度，检测边缘位置。</p>
              <div class="complexity">
                <div class="complexity-item"><div class="label">时间复杂度</div><div class="value">O(n²)</div></div>
                <div class="complexity-item"><div class="label">空间复杂度</div><div class="value">O(n²)</div></div>
                <div class="complexity-item"><div class="label">算子大小</div><div class="value">3x3</div></div>
              </div>
            </div>
          </div>
        )}

        {activeTab() === 'blur' && (
          <div>
            <div class="controls">
              <div class="controls-group">
                <button class="btn btn-primary" onClick={runBlur} disabled={isRunning()}>
                  {isRunning() ? '运行中...' : '高斯模糊'}
                </button>
              </div>
            </div>
            <div class="canvas-container" style={{ padding: '2rem', 'min-height': '200px' }}>
              <div style={{ display: 'flex', gap: '2rem', 'justify-content': 'center' }}>
                <div>
                  <h4>原图</h4>
                  {renderImage(blurImage())}
                </div>
                {blurResult().length > 0 && (
                  <div>
                    <h4>结果</h4>
                    {renderImage(blurResult())}
                  </div>
                )}
              </div>
            </div>
            <div class="info-panel">
              <h3>高斯模糊</h3>
              <p>使用高斯核进行卷积，平滑图像。</p>
              <div class="complexity">
                <div class="complexity-item"><div class="label">时间复杂度</div><div class="value">O(n²)</div></div>
                <div class="complexity-item"><div class="label">空间复杂度</div><div class="value">O(n²)</div></div>
                <div class="complexity-item"><div class="label">核大小</div><div class="value">3x3</div></div>
              </div>
            </div>
          </div>
        )}

        {activeTab() === 'sharpen' && (
          <div>
            <div class="controls">
              <div class="controls-group">
                <button class="btn btn-primary" onClick={runSharpen} disabled={isRunning()}>
                  {isRunning() ? '运行中...' : '图像锐化'}
                </button>
              </div>
            </div>
            <div class="canvas-container" style={{ padding: '2rem', 'min-height': '200px' }}>
              <div style={{ display: 'flex', gap: '2rem', 'justify-content': 'center' }}>
                <div>
                  <h4>原图</h4>
                  {renderImage(sharpenImage())}
                </div>
                {sharpenResult().length > 0 && (
                  <div>
                    <h4>结果</h4>
                    {renderImage(sharpenResult())}
                  </div>
                )}
              </div>
            </div>
            <div class="info-panel">
              <h3>图像锐化</h3>
              <p>使用锐化核增强图像边缘，使图像更清晰。</p>
              <div class="complexity">
                <div class="complexity-item"><div class="label">时间复杂度</div><div class="value">O(n²)</div></div>
                <div class="complexity-item"><div class="label">空间复杂度</div><div class="value">O(n²)</div></div>
                <div class="complexity-item"><div class="label">核大小</div><div class="value">3x3</div></div>
              </div>
            </div>
          </div>
        )}

        <div class="steps-panel">
          <h3>执行步骤</h3>
          <div>
            {steps().length === 0 ? (
              <div class="step-item">选择标签页并点击"开始"查看图像处理算法执行过程</div>
            ) : (
              steps().map(step => <div class="step-item active">{step}</div>)
            )}
          </div>
        </div>
        <CodePanel category="imageprocessing" algorithm={activeTab()} />
      </div>
    </main>
  );
}
