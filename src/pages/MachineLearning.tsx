import { createSignal } from 'solid-js';
import CodePanel from '../components/CodePanel';

export default function MachineLearning() {
  const [activeTab, setActiveTab] = createSignal('kmeans');
  const [isRunning, setIsRunning] = createSignal(false);
  const [steps, setSteps] = createSignal<string[]>([]);
  const [speed, setSpeed] = createSignal(50);

  // K-Means
  const [kmeansPoints, setKmeansPoints] = createSignal<{ x: number; y: number }[]>([
    { x: 1, y: 1 }, { x: 1, y: 2 }, { x: 2, y: 1 }, { x: 2, y: 2 },
    { x: 8, y: 8 }, { x: 8, y: 9 }, { x: 9, y: 8 }, { x: 9, y: 9 },
    { x: 1, y: 8 }, { x: 1, y: 9 }, { x: 2, y: 8 }, { x: 2, y: 9 },
  ]);
  const [kmeansCentroids, setKmeansCentroids] = createSignal<{ x: number; y: number }[]>([]);
  const [kmeansClusters, setKmeansClusters] = createSignal<number[]>([]);
  const [kmeansK, setKmeansK] = createSignal(3);

  // KNN
  const [knnPoints, setKnnPoints] = createSignal<{ x: number; y: number; label: string }[]>([
    { x: 1, y: 1, label: 'A' }, { x: 1, y: 2, label: 'A' }, { x: 2, y: 1, label: 'A' },
    { x: 8, y: 8, label: 'B' }, { x: 8, y: 9, label: 'B' }, { x: 9, y: 8, label: 'B' },
  ]);
  const [knnQuery, setKnnQuery] = createSignal<{ x: number; y: number }>({ x: 2, y: 2 });
  const [knnK, setKnnK] = createSignal(3);
  const [knnResult, setKnnResult] = createSignal<string>('');

  // Linear Regression
  const [regPoints, setRegPoints] = createSignal<{ x: number; y: number }[]>([
    { x: 1, y: 2 }, { x: 2, y: 3 }, { x: 3, y: 5 }, { x: 4, y: 4 }, { x: 5, y: 6 },
  ]);
  const [regSlope, setRegSlope] = createSignal(0);
  const [regIntercept, setRegIntercept] = createSignal(0);

  const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));
  const addStep = (text: string) => setSteps(prev => [text, ...prev].slice(0, 30));

  // K-Means
  const runKMeans = async () => {
    if (isRunning()) return;
    setIsRunning(true);
    setSteps([]);
    addStep('K-Means: 聚类算法');

    const points = [...kmeansPoints()];
    const k = kmeansK();
    const centroids: { x: number; y: number }[] = [];
    const clusters: number[] = new Array(points.length).fill(0);

    // Initialize centroids randomly
    for (let i = 0; i < k; i++) {
      centroids.push({ ...points[i] });
    }
    setKmeansCentroids([...centroids]);
    addStep('初始化质心');
    await sleep(Math.max(1, 101 - speed()) * 10);

    let changed = true;
    let iterations = 0;
    while (changed && iterations < 100) {
      changed = false;
      iterations++;

      // Assign points to clusters
      for (let i = 0; i < points.length; i++) {
        let minDist = Infinity;
        let closest = 0;
        for (let j = 0; j < k; j++) {
          const dist = Math.sqrt((points[i].x - centroids[j].x) ** 2 + (points[i].y - centroids[j].y) ** 2);
          if (dist < minDist) {
            minDist = dist;
            closest = j;
          }
        }
        if (clusters[i] !== closest) {
          clusters[i] = closest;
          changed = true;
        }
      }

      setKmeansClusters([...clusters]);
      addStep(`第 ${iterations} 次迭代: 分配点到最近质心`);
      await sleep(Math.max(1, 101 - speed()) * 5);

      // Update centroids
      for (let j = 0; j < k; j++) {
        let sumX = 0;
        let sumY = 0;
        let count = 0;
        for (let i = 0; i < points.length; i++) {
          if (clusters[i] === j) {
            sumX += points[i].x;
            sumY += points[i].y;
            count++;
          }
        }
        if (count > 0) {
          centroids[j] = { x: sumX / count, y: sumY / count };
        }
      }

      setKmeansCentroids([...centroids]);
      addStep(`更新质心位置`);
      await sleep(Math.max(1, 101 - speed()) * 5);
    }

    addStep(`K-Means 完成，共 ${iterations} 次迭代`);
    setIsRunning(false);
  };

  // KNN
  const runKnn = async () => {
    if (isRunning()) return;
    setIsRunning(true);
    setSteps([]);
    addStep('KNN: 最近邻分类');

    const points = [...knnPoints()];
    const query = knnQuery();
    const k = knnK();

    // Calculate distances
    const distances = points.map(p => ({
      ...p,
      dist: Math.sqrt((p.x - query.x) ** 2 + (p.y - query.y) ** 2),
    }));

    distances.sort((a, b) => a.dist - b.dist);
    const nearest = distances.slice(0, k);

    addStep(`查询点: (${query.x}, ${query.y})`);
    await sleep(Math.max(1, 101 - speed()) * 10);

    for (let i = 0; i < nearest.length; i++) {
      addStep(`第 ${i + 1} 近: (${nearest[i].x}, ${nearest[i].y}), 距离: ${nearest[i].dist.toFixed(2)}, 标签: ${nearest[i].label}`);
      await sleep(Math.max(1, 101 - speed()) * 5);
    }

    // Count labels
    const labelCount: Map<string, number> = new Map();
    for (const p of nearest) {
      labelCount.set(p.label, (labelCount.get(p.label) || 0) + 1);
    }

    let maxCount = 0;
    let result = '';
    for (const [label, count] of labelCount.entries()) {
      if (count > maxCount) {
        maxCount = count;
        result = label;
      }
    }

    setKnnResult(result);
    addStep(`分类结果: ${result}`);
    setIsRunning(false);
  };

  // Linear Regression
  const runLinearRegression = async () => {
    if (isRunning()) return;
    setIsRunning(true);
    setSteps([]);
    addStep('线性回归: 拟合数据');

    const points = [...regPoints()];
    const n = points.length;
    let sumX = 0;
    let sumY = 0;
    let sumXY = 0;
    let sumX2 = 0;

    for (const p of points) {
      sumX += p.x;
      sumY += p.y;
      sumXY += p.x * p.y;
      sumX2 += p.x * p.x;
      addStep(`累加: x=${p.x}, y=${p.y}`);
      await sleep(Math.max(1, 101 - speed()) * 5);
    }

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    setRegSlope(slope);
    setRegIntercept(intercept);
    addStep(`斜率: ${slope.toFixed(4)}, 截距: ${intercept.toFixed(4)}`);
    setIsRunning(false);
  };

  const tabs = [
    { id: 'kmeans', label: 'K-Means' },
    { id: 'knn', label: 'KNN' },
    { id: 'regression', label: '线性回归' },
  ];

  return (
    <main class="visualization-page">
      <div class="container">
        <div class="visualization-header">
          <h1>机器学习算法</h1>
          <p class="description">机器学习算法通过数据学习规律，包括聚类、分类、回归等经典算法。</p>
        </div>
        <div style={{ display: 'flex', gap: '0', 'border-bottom': '1px solid var(--border)', 'margin-bottom': '2rem' }}>
          {tabs.map(tab => (
            <div
              class="ml-tab"
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

        {activeTab() === 'kmeans' && (
          <div>
            <div class="controls">
              <div class="controls-group">
                <label>K值</label>
                <input type="number" value={kmeansK()} onChange={e => setKmeansK(parseInt(e.currentTarget.value) || 3)} style={{ width: '60px', padding: '0.5rem', border: '1px solid var(--border)' }} />
              </div>
              <div class="controls-group">
                <button class="btn btn-primary" onClick={runKMeans} disabled={isRunning()}>
                  {isRunning() ? '运行中...' : 'K-Means聚类'}
                </button>
              </div>
            </div>
            <div class="canvas-container" style={{ padding: '2rem', 'min-height': '200px' }}>
              <div style={{ display: 'flex', 'flex-direction': 'column', gap: '1rem', 'align-items': 'center' }}>
                <svg width="300" height="300" style={{ border: '1px solid var(--border)' }}>
                  {kmeansPoints().map((p, i) => (
                    <circle
                      cx={p.x * 25 + 50}
                      cy={300 - p.y * 25 - 50}
                      r="5"
                      fill={kmeansClusters()[i] !== undefined ? ['#1a1a1a', '#999', '#e5e5e5'][kmeansClusters()[i] % 3] : '#1a1a1a'}
                    />
                  ))}
                  {kmeansCentroids().map((c, i) => (
                    <circle
                      cx={c.x * 25 + 50}
                      cy={300 - c.y * 25 - 50}
                      r="8"
                      fill="none"
                      stroke="#1a1a1a"
                      stroke-width="2"
                    />
                  ))}
                </svg>
              </div>
            </div>
            <div class="info-panel">
              <h3>K-Means聚类</h3>
              <p>将数据点分成K个簇，通过迭代优化质心位置，使得簇内距离最小。</p>
              <div class="complexity">
                <div class="complexity-item"><div class="label">时间复杂度</div><div class="value">O(n * k * i)</div></div>
                <div class="complexity-item"><div class="label">空间复杂度</div><div class="value">O(n + k)</div></div>
                <div class="complexity-item"><div class="label">收敛</div><div class="value">局部最优</div></div>
              </div>
            </div>
          </div>
        )}

        {activeTab() === 'knn' && (
          <div>
            <div class="controls">
              <div class="controls-group">
                <label>K值</label>
                <input type="number" value={knnK()} onChange={e => setKnnK(parseInt(e.currentTarget.value) || 3)} style={{ width: '60px', padding: '0.5rem', border: '1px solid var(--border)' }} />
              </div>
              <div class="controls-group">
                <button class="btn btn-primary" onClick={runKnn} disabled={isRunning()}>
                  {isRunning() ? '运行中...' : 'KNN分类'}
                </button>
              </div>
            </div>
            <div class="canvas-container" style={{ padding: '2rem', 'min-height': '200px' }}>
              <div style={{ display: 'flex', 'flex-direction': 'column', gap: '1rem', 'align-items': 'center' }}>
                <svg width="300" height="300" style={{ border: '1px solid var(--border)' }}>
                  {knnPoints().map((p, i) => (
                    <circle
                      cx={p.x * 25 + 50}
                      cy={300 - p.y * 25 - 50}
                      r="5"
                      fill={p.label === 'A' ? '#1a1a1a' : '#999'}
                    />
                  ))}
                  <circle
                    cx={knnQuery().x * 25 + 50}
                    cy={300 - knnQuery().y * 25 - 50}
                    r="5"
                    fill="red"
                  />
                </svg>
                {knnResult() && (
                  <div style={{ padding: '1rem', background: 'var(--bg-secondary)', border: '1px solid var(--border)', 'text-align': 'center', 'font-family': 'var(--font-mono)', 'font-size': '1.25rem' }}>
                    分类结果: {knnResult()}
                  </div>
                )}
              </div>
            </div>
            <div class="info-panel">
              <h3>KNN分类</h3>
              <p>根据最近的K个邻居的类别来预测新数据点的类别。</p>
              <div class="complexity">
                <div class="complexity-item"><div class="label">时间复杂度</div><div class="value">O(n)</div></div>
                <div class="complexity-item"><div class="label">空间复杂度</div><div class="value">O(n)</div></div>
                <div class="complexity-item"><div class="label">特点</div><div class="value">懒惰学习</div></div>
              </div>
            </div>
          </div>
        )}

        {activeTab() === 'regression' && (
          <div>
            <div class="controls">
              <div class="controls-group">
                <button class="btn btn-primary" onClick={runLinearRegression} disabled={isRunning()}>
                  {isRunning() ? '运行中...' : '线性回归'}
                </button>
              </div>
            </div>
            <div class="canvas-container" style={{ padding: '2rem', 'min-height': '200px' }}>
              <div style={{ display: 'flex', 'flex-direction': 'column', gap: '1rem', 'align-items': 'center' }}>
                <svg width="300" height="300" style={{ border: '1px solid var(--border)' }}>
                  {regPoints().map((p, i) => (
                    <circle
                      cx={p.x * 50 + 50}
                      cy={300 - p.y * 25 - 50}
                      r="5"
                      fill="#1a1a1a"
                    />
                  ))}
                  {regSlope() !== 0 && (
                    <line
                      x1={0 * 50 + 50}
                      y1={300 - (regSlope() * 0 + regIntercept()) * 25 - 50}
                      x2={6 * 50 + 50}
                      y2={300 - (regSlope() * 6 + regIntercept()) * 25 - 50}
                      stroke="#1a1a1a"
                      stroke-width="2"
                    />
                  )}
                </svg>
                {regSlope() !== 0 && (
                  <div style={{ padding: '1rem', background: 'var(--bg-secondary)', border: '1px solid var(--border)', 'text-align': 'center', 'font-family': 'var(--font-mono)', 'font-size': '1.25rem' }}>
                    y = {regSlope().toFixed(4)}x + {regIntercept().toFixed(4)}
                  </div>
                )}
              </div>
            </div>
            <div class="info-panel">
              <h3>线性回归</h3>
              <p>通过最小二乘法拟合数据点的线性关系，找到最佳拟合直线。</p>
              <div class="complexity">
                <div class="complexity-item"><div class="label">时间复杂度</div><div class="value">O(n)</div></div>
                <div class="complexity-item"><div class="label">空间复杂度</div><div class="value">O(1)</div></div>
                <div class="complexity-item"><div class="label">方法</div><div class="value">最小二乘法</div></div>
              </div>
            </div>
          </div>
        )}

        <div class="steps-panel">
          <h3>执行步骤</h3>
          <div>
            {steps().length === 0 ? (
              <div class="step-item">选择标签页并点击"开始"查看机器学习算法执行过程</div>
            ) : (
              steps().map(step => <div class="step-item active">{step}</div>)
            )}
          </div>
        </div>
        <CodePanel category="machinelearning" algorithm={activeTab()} />
      </div>
    </main>
  );
}
