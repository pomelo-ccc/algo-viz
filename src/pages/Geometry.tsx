import { createSignal, onMount } from 'solid-js';
import CodePanel from '../components/CodePanel';

interface Point {
  x: number;
  y: number;
}

export default function Geometry() {
  const [activeTab, setActiveTab] = createSignal('convex');
  const [isRunning, setIsRunning] = createSignal(false);
  const [steps, setSteps] = createSignal<string[]>([]);
  const [speed, setSpeed] = createSignal(50);

  // Convex Hull
  const [convexPoints, setConvexPoints] = createSignal<Point[]>([]);
  const [convexHull, setConvexHull] = createSignal<Point[]>([]);
  const [convexCurrent, setConvexCurrent] = createSignal<Point | null>(null);

  // Point in Polygon
  const [polyPoints, setPolyPoints] = createSignal<Point[]>([]);
  const [testPoint, setTestPoint] = createSignal<Point>({ x: 150, y: 150 });
  const [pointInPolyResult, setPointInPolyResult] = createSignal<boolean | null>(null);

  // Closest Pair
  const [closestPoints, setClosestPoints] = createSignal<Point[]>([]);
  const [closestPair, setClosestPair] = createSignal<[Point, Point] | null>(null);
  const [closestDist, setClosestDist] = createSignal<number>(Infinity);

  const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));
  const addStep = (text: string) => setSteps(prev => [text, ...prev].slice(0, 30));

  // Generate random points
  const generateConvexPoints = () => {
    const points: Point[] = [];
    for (let i = 0; i < 10; i++) {
      points.push({
        x: Math.floor(Math.random() * 300) + 50,
        y: Math.floor(Math.random() * 300) + 50,
      });
    }
    setConvexPoints(points);
    setConvexHull([]);
    setConvexCurrent(null);
    setSteps([]);
  };

  const generatePolyPoints = () => {
    const points: Point[] = [];
    const centerX = 200;
    const centerY = 200;
    const radius = 120;
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2;
      points.push({
        x: centerX + Math.cos(angle) * radius + (Math.random() - 0.5) * 40,
        y: centerY + Math.sin(angle) * radius + (Math.random() - 0.5) * 40,
      });
    }
    setPolyPoints(points);
    setPointInPolyResult(null);
    setSteps([]);
  };

  const generateClosestPoints = () => {
    const points: Point[] = [];
    for (let i = 0; i < 12; i++) {
      points.push({
        x: Math.floor(Math.random() * 350) + 25,
        y: Math.floor(Math.random() * 350) + 25,
      });
    }
    setClosestPoints(points);
    setClosestPair(null);
    setClosestDist(Infinity);
    setSteps([]);
  };

  // Cross product for orientation
  const cross = (o: Point, a: Point, b: Point) => {
    return (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);
  };

  // Convex Hull (Graham Scan)
  const runConvexHull = async () => {
    if (isRunning()) return;
    setIsRunning(true);
    setSteps([]);
    addStep('Graham扫描: 计算凸包');

    const points = [...convexPoints()];
    if (points.length < 3) {
      addStep('点的数量不足，需要至少3个点');
      setIsRunning(false);
      return;
    }

    // Find lowest point
    let start = 0;
    for (let i = 1; i < points.length; i++) {
      if (points[i].y < points[start].y || (points[i].y === points[start].y && points[i].x < points[start].x)) {
        start = i;
      }
    }

    // Sort by polar angle
    const sorted = points.map((p, i) => ({ ...p, idx: i }));
    const pivot = sorted[start];
    addStep(`找到最低点: (${pivot.x}, ${pivot.y})`);
    await sleep(Math.max(1, 101 - speed()) * 10);

    sorted.sort((a, b) => {
      const cp = cross(pivot, a, b);
      if (cp === 0) {
        const da = (a.x - pivot.x) ** 2 + (a.y - pivot.y) ** 2;
        const db = (b.x - pivot.x) ** 2 + (b.y - pivot.y) ** 2;
        return da - db;
      }
      return cp > 0 ? -1 : 1;
    });

    const hull: Point[] = [sorted[0], sorted[1]];
    addStep(`按极角排序完成，开始扫描`);
    await sleep(Math.max(1, 101 - speed()) * 10);

    for (let i = 2; i < sorted.length; i++) {
      if (!isRunning()) break;
      setConvexCurrent(sorted[i]);
      addStep(`检查点 (${sorted[i].x}, ${sorted[i].y})`);
      await sleep(Math.max(1, 101 - speed()) * 5);

      while (hull.length > 1 && cross(hull[hull.length - 2], hull[hull.length - 1], sorted[i]) <= 0) {
        addStep(`弹出点 (${hull[hull.length - 1].x}, ${hull[hull.length - 1].y})，非左转`);
        hull.pop();
      }
      hull.push(sorted[i]);
      setConvexHull([...hull]);
      await sleep(Math.max(1, 101 - speed()) * 5);
    }

    addStep(`凸包计算完成，共 ${hull.length} 个点`);
    setIsRunning(false);
  };

  // Point in Polygon (Ray Casting)
  const runPointInPolygon = async () => {
    if (isRunning()) return;
    setIsRunning(true);
    setSteps([]);
    addStep('射线法: 判断点是否在多边形内');

    const poly = polyPoints();
    const p = testPoint();
    let inside = false;

    addStep(`测试点: (${p.x}, ${p.y})`);
    await sleep(Math.max(1, 101 - speed()) * 10);

    for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
      if (!isRunning()) break;
      const pi = poly[i];
      const pj = poly[j];

      addStep(`检查边 (${pj.x}, ${pj.y}) -> (${pi.x}, ${pi.y})`);
      await sleep(Math.max(1, 101 - speed()) * 8);

      if (((pi.y > p.y) !== (pj.y > p.y)) &&
        (p.x < (pj.x - pi.x) * (p.y - pi.y) / (pj.y - pi.y) + pi.x)) {
        inside = !inside;
        addStep(`射线与该边相交，切换状态: ${inside ? '内' : '外'}`);
      }
    }

    setPointInPolyResult(inside);
    addStep(`结果: 点${inside ? '在' : '不在'}多边形内`);
    setIsRunning(false);
  };

  // Closest Pair (Brute Force for visualization)
  const runClosestPair = async () => {
    if (isRunning()) return;
    setIsRunning(true);
    setSteps([]);
    addStep('最近点对: 暴力搜索');

    const points = closestPoints();
    let minDist = Infinity;
    let bestPair: [Point, Point] | null = null;

    for (let i = 0; i < points.length; i++) {
      if (!isRunning()) break;
      addStep(`检查点 ${i}`);
      setConvexCurrent(points[i]);
      await sleep(Math.max(1, 101 - speed()) * 5);

      for (let j = i + 1; j < points.length; j++) {
        const dx = points[i].x - points[j].x;
        const dy = points[i].y - points[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < minDist) {
          minDist = dist;
          bestPair = [points[i], points[j]];
          addStep(`发现更近点对: 距离 ${dist.toFixed(2)}`);
          setClosestPair(bestPair);
          setClosestDist(minDist);
        }
      }
    }

    if (bestPair) {
      addStep(`最近点对距离: ${minDist.toFixed(2)}`);
    }
    setIsRunning(false);
  };

  // SVG Render helpers
  const renderConvexSvg = () => {
    const points = convexPoints();
    const hull = convexHull();
    return (
      <svg width="400" height="400" style={{ border: '1px solid var(--border)' }}>
        {hull.length > 0 && (
          <polygon
            points={hull.map(p => `${p.x},${p.y}`).join(' ')}
            fill="rgba(26, 26, 26, 0.05)"
            stroke="#1a1a1a"
            stroke-width="1"
          />
        )}
        {points.map((p, i) => (
          <circle
            cx={p.x}
            cy={p.y}
            r={convexCurrent() === p ? 6 : 4}
            fill={convexCurrent() === p ? '#1a1a1a' : hull.includes(p) ? '#1a1a1a' : '#999'}
            stroke={convexCurrent() === p ? '#1a1a1a' : 'none'}
            stroke-width="1"
          />
        ))}
      </svg>
    );
  };

  const renderPolySvg = () => {
    const poly = polyPoints();
    const p = testPoint();
    return (
      <svg width="400" height="400" style={{ border: '1px solid var(--border)' }}>
        {poly.length > 0 && (
          <polygon
            points={poly.map(p => `${p.x},${p.y}`).join(' ')}
            fill="rgba(26, 26, 26, 0.05)"
            stroke="#1a1a1a"
            stroke-width="1"
          />
        )}
        {poly.map((p, i) => (
          <circle cx={p.x} cy={p.y} r="4" fill="#999" />
        ))}
        <circle cx={p.x} cy={p.y} r="6" fill={pointInPolyResult() === true ? '#1a1a1a' : pointInPolyResult() === false ? '#e5e5e5' : '#1a1a1a'} stroke="#1a1a1a" stroke-width="1" />
        {pointInPolyResult() !== null && (
          <line x1={p.x} y1={p.y} x2={400} y2={p.y} stroke="#1a1a1a" stroke-width="0.5" stroke-dasharray="4,4" />
        )}
      </svg>
    );
  };

  const renderClosestSvg = () => {
    const points = closestPoints();
    const pair = closestPair();
    return (
      <svg width="400" height="400" style={{ border: '1px solid var(--border)' }}>
        {pair && (
          <line
            x1={pair[0].x}
            y1={pair[0].y}
            x2={pair[1].x}
            y2={pair[1].y}
            stroke="#1a1a1a"
            stroke-width="2"
          />
        )}
        {points.map((p, i) => (
          <circle
            cx={p.x}
            cy={p.y}
            r={pair && (p === pair[0] || p === pair[1]) ? 6 : 4}
            fill={pair && (p === pair[0] || p === pair[1]) ? '#1a1a1a' : '#999'}
          />
        ))}
      </svg>
    );
  };

  const tabs = [
    { id: 'convex', label: '凸包' },
    { id: 'pointpoly', label: '点在多边形内' },
    { id: 'closest', label: '最近点对' },
  ];

  return (
    <main class="visualization-page">
      <div class="container">
        <div class="visualization-header">
          <h1>几何算法</h1>
          <p class="description">几何算法处理空间中的点、线、多边形等几何对象，广泛应用于计算机图形学、GIS、机器人等领域。</p>
        </div>
        <div style={{ display: 'flex', gap: '0', 'border-bottom': '1px solid var(--border)', 'margin-bottom': '2rem' }}>
          {tabs.map(tab => (
            <div
              class="geo-tab"
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

        {activeTab() === 'convex' && (
          <div>
            <div class="controls">
              <div class="controls-group">
                <button class="btn" onClick={generateConvexPoints}>生成随机点</button>
                <button class="btn btn-primary" onClick={runConvexHull} disabled={isRunning()}>
                  {isRunning() ? '运行中...' : '计算凸包'}
                </button>
              </div>
            </div>
            <div class="canvas-container" style={{ padding: '2rem', display: 'flex', 'justify-content': 'center' }}>
              {renderConvexSvg()}
            </div>
            <div class="info-panel">
              <h3>凸包 (Convex Hull)</h3>
              <p>找到包含所有点的最小凸多边形。Graham扫描法的时间复杂度为 O(n log n)。</p>
              <div class="complexity">
                <div class="complexity-item"><div class="label">时间复杂度</div><div class="value">O(n log n)</div></div>
                <div class="complexity-item"><div class="label">空间复杂度</div><div class="value">O(n)</div></div>
                <div class="complexity-item"><div class="label">方法</div><div class="value">Graham扫描</div></div>
              </div>
            </div>
          </div>
        )}

        {activeTab() === 'pointpoly' && (
          <div>
            <div class="controls">
              <div class="controls-group">
                <button class="btn" onClick={generatePolyPoints}>生成多边形</button>
                <button class="btn btn-primary" onClick={runPointInPolygon} disabled={isRunning()}>
                  {isRunning() ? '运行中...' : '判断点位置'}
                </button>
              </div>
              <div class="controls-group">
                <label>测试点 X</label>
                <input type="number" value={testPoint().x} onChange={e => setTestPoint({ ...testPoint(), x: parseInt(e.currentTarget.value) || 150 })} style={{ width: '60px', padding: '0.5rem', border: '1px solid var(--border)' }} />
                <label>测试点 Y</label>
                <input type="number" value={testPoint().y} onChange={e => setTestPoint({ ...testPoint(), y: parseInt(e.currentTarget.value) || 150 })} style={{ width: '60px', padding: '0.5rem', border: '1px solid var(--border)' }} />
              </div>
            </div>
            <div class="canvas-container" style={{ padding: '2rem', display: 'flex', 'justify-content': 'center' }}>
              {renderPolySvg()}
            </div>
            <div class="info-panel">
              <h3>点在多边形内 (Point in Polygon)</h3>
              <p>射线法（Ray Casting）通过从点出发向右发射水平射线，计算与多边形边界的交点数量来判断点是否在多边形内。</p>
              <div class="complexity">
                <div class="complexity-item"><div class="label">时间复杂度</div><div class="value">O(n)</div></div>
                <div class="complexity-item"><div class="label">空间复杂度</div><div class="value">O(1)</div></div>
                <div class="complexity-item"><div class="label">方法</div><div class="value">射线法</div></div>
              </div>
            </div>
          </div>
        )}

        {activeTab() === 'closest' && (
          <div>
            <div class="controls">
              <div class="controls-group">
                <button class="btn" onClick={generateClosestPoints}>生成随机点</button>
                <button class="btn btn-primary" onClick={runClosestPair} disabled={isRunning()}>
                  {isRunning() ? '运行中...' : '找最近点对'}
                </button>
              </div>
            </div>
            <div class="canvas-container" style={{ padding: '2rem', display: 'flex', 'justify-content': 'center' }}>
              {renderClosestSvg()}
            </div>
            <div class="info-panel">
              <h3>最近点对 (Closest Pair)</h3>
              <p>在平面点集中找到距离最近的两点。分治算法可将复杂度从 O(n²) 降到 O(n log n)。</p>
              <div class="complexity">
                <div class="complexity-item"><div class="label">暴力法</div><div class="value">O(n²)</div></div>
                <div class="complexity-item"><div class="label">分治法</div><div class="value">O(n log n)</div></div>
                <div class="complexity-item"><div class="label">空间复杂度</div><div class="value">O(n)</div></div>
              </div>
            </div>
          </div>
        )}

        <div class="steps-panel">
          <h3>执行步骤</h3>
          <div>
            {steps().length === 0 ? (
              <div class="step-item">选择标签页并点击"开始"查看几何算法执行过程</div>
            ) : (
              steps().map(step => <div class="step-item active">{step}</div>)
            )}
          </div>
        </div>

        <CodePanel category="geometry" algorithm={activeTab()} />
      </div>
    </main>
  );
}
