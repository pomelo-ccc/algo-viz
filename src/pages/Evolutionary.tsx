import { createSignal } from 'solid-js';

export default function Evolutionary() {
  const [activeTab, setActiveTab] = createSignal('genetic');
  const [isRunning, setIsRunning] = createSignal(false);
  const [steps, setSteps] = createSignal<string[]>([]);
  const [speed, setSpeed] = createSignal(50);

  // Genetic Algorithm
  const [gaPopulation, setGaPopulation] = createSignal(20);
  const [gaGenerations, setGaGenerations] = createSignal(50);
  const [gaMutationRate, setGaMutationRate] = createSignal(0.01);
  const [gaResult, setGaResult] = createSignal<string>('');

  // Particle Swarm Optimization
  const [psoParticles, setPsoParticles] = createSignal(30);
  const [psoIterations, setPsoIterations] = createSignal(100);
  const [psoResult, setPsoResult] = createSignal<string>('');

  // Ant Colony Optimization
  const [acoAnts, setAcoAnts] = createSignal(10);
  const [acoIterations, setAcoIterations] = createSignal(50);
  const [acoResult, setAcoResult] = createSignal<string>('');

  const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));
  const addStep = (text: string) => setSteps(prev => [text, ...prev].slice(0, 30));

  // Genetic Algorithm
  const runGA = async () => {
    if (isRunning()) return;
    setIsRunning(true);
    setSteps([]);
    addStep('遗传算法：初始化种群');

    const population = gaPopulation();
    const generations = gaGenerations();
    const mutationRate = gaMutationRate();

    // Initialize population with random binary strings
    let pop: string[] = [];
    for (let i = 0; i < population; i++) {
      pop.push(Array.from({ length: 10 }, () => Math.random() > 0.5 ? '1' : '0').join(''));
    }
    addStep(`初始化种群: ${population}个个体`);
    await sleep(Math.max(1, 101 - speed()) * 5);

    for (let gen = 0; gen < generations; gen++) {
      // Evaluate fitness (count of 1s)
      const fitness = pop.map(ind => ind.split('').filter(c => c === '1').length);
      const maxFitness = Math.max(...fitness);
      const best = pop[fitness.indexOf(maxFitness)];
      
      addStep(`第${gen + 1}代: 最优适应度=${maxFitness}, 最优个体=${best}`);
      await sleep(Math.max(1, 101 - speed()) * 2);

      // Selection (tournament)
      const newPop: string[] = [];
      for (let i = 0; i < population; i++) {
        const a = Math.floor(Math.random() * population);
        const b = Math.floor(Math.random() * population);
        newPop.push(fitness[a] > fitness[b] ? pop[a] : pop[b]);
      }

      // Crossover
      for (let i = 0; i < population - 1; i += 2) {
        if (Math.random() < 0.7) {
          const point = Math.floor(Math.random() * 10);
          const child1 = newPop[i].slice(0, point) + newPop[i + 1].slice(point);
          const child2 = newPop[i + 1].slice(0, point) + newPop[i].slice(point);
          newPop[i] = child1;
          newPop[i + 1] = child2;
        }
      }

      // Mutation
      for (let i = 0; i < population; i++) {
        const chars = newPop[i].split('');
        for (let j = 0; j < chars.length; j++) {
          if (Math.random() < mutationRate) {
            chars[j] = chars[j] === '1' ? '0' : '1';
          }
        }
        newPop[i] = chars.join('');
      }

      pop = newPop;
    }

    const finalFitness = pop.map(ind => ind.split('').filter(c => c === '1').length);
    const maxFitness = Math.max(...finalFitness);
    const best = pop[finalFitness.indexOf(maxFitness)];
    setGaResult(`最优个体: ${best} (适应度=${maxFitness})`);
    addStep(`遗传算法完成: ${gaResult()}`);
    setIsRunning(false);
  };

  // Particle Swarm Optimization
  const runPSO = async () => {
    if (isRunning()) return;
    setIsRunning(true);
    setSteps([]);
    addStep('粒子群优化：初始化粒子群');

    const particles = psoParticles();
    const iterations = psoIterations();

    // Initialize particles
    let positions: number[] = [];
    let velocities: number[] = [];
    let bestPositions: number[] = [];
    let bestFitness = -Infinity;
    let globalBest = 0;

    for (let i = 0; i < particles; i++) {
      positions[i] = Math.random() * 10 - 5;
      velocities[i] = Math.random() * 2 - 1;
      bestPositions[i] = positions[i];
      const fitness = -positions[i] * positions[i]; // Simple quadratic function
      if (fitness > bestFitness) {
        bestFitness = fitness;
        globalBest = positions[i];
      }
    }

    addStep(`初始化粒子: ${particles}个`);
    await sleep(Math.max(1, 101 - speed()) * 5);

    for (let iter = 0; iter < iterations; iter++) {
      for (let i = 0; i < particles; i++) {
        // Update velocity
        velocities[i] = 0.7 * velocities[i] + 
          1.5 * Math.random() * (bestPositions[i] - positions[i]) +
          1.5 * Math.random() * (globalBest - positions[i]);
        
        // Update position
        positions[i] += velocities[i];
        
        // Update best position
        const fitness = -positions[i] * positions[i];
        if (fitness > -bestPositions[i] * bestPositions[i]) {
          bestPositions[i] = positions[i];
        }
        if (fitness > bestFitness) {
          bestFitness = fitness;
          globalBest = positions[i];
        }
      }

      if (iter % 10 === 0) {
        addStep(`第${iter + 1}次迭代: 全局最优=${globalBest.toFixed(4)}`);
        await sleep(Math.max(1, 101 - speed()) * 2);
      }
    }

    setPsoResult(`全局最优解: x=${globalBest.toFixed(4)}, f(x)=${bestFitness.toFixed(4)}`);
    addStep(`粒子群优化完成: ${psoResult()}`);
    setIsRunning(false);
  };

  // Ant Colony Optimization
  const runACO = async () => {
    if (isRunning()) return;
    setIsRunning(true);
    setSteps([]);
    addStep('蚁群算法：初始化蚁群');

    const ants = acoAnts();
    const iterations = acoIterations();
    const cities = 5;
    const distances = [
      [0, 2, 9, 10, 7],
      [2, 0, 6, 4, 3],
      [9, 6, 0, 8, 5],
      [10, 4, 8, 0, 6],
      [7, 3, 5, 6, 0],
    ];

    // Initialize pheromones
    let pheromones: number[][] = Array.from({ length: cities }, () => 
      Array.from({ length: cities }, () => 1.0)
    );

    let bestPath: number[] = [];
    let bestLength = Infinity;

    addStep(`初始化蚁群: ${ants}只蚂蚁, ${cities}个城市`);
    await sleep(Math.max(1, 101 - speed()) * 5);

    for (let iter = 0; iter < iterations; iter++) {
      const allPaths: number[][] = [];
      const allLengths: number[] = [];

      for (let ant = 0; ant < ants; ant++) {
        const visited = new Set<number>();
        const path: number[] = [];
        let current = Math.floor(Math.random() * cities);
        path.push(current);
        visited.add(current);

        while (visited.size < cities) {
          const next = Math.floor(Math.random() * cities);
          if (!visited.has(next)) {
            path.push(next);
            visited.add(next);
            current = next;
          }
        }

        // Calculate path length
        let length = 0;
        for (let i = 0; i < path.length - 1; i++) {
          length += distances[path[i]][path[i + 1]];
        }
        length += distances[path[path.length - 1]][path[0]]; // Return to start

        allPaths.push(path);
        allLengths.push(length);

        if (length < bestLength) {
          bestLength = length;
          bestPath = [...path];
        }
      }

      // Update pheromones
      for (let i = 0; i < cities; i++) {
        for (let j = 0; j < cities; j++) {
          pheromones[i][j] *= 0.9; // Evaporation
        }
      }

      for (let ant = 0; ant < ants; ant++) {
        const path = allPaths[ant];
        const length = allLengths[ant];
        for (let i = 0; i < path.length - 1; i++) {
          pheromones[path[i]][path[i + 1]] += 1.0 / length;
        }
        pheromones[path[path.length - 1]][path[0]] += 1.0 / length;
      }

      if (iter % 10 === 0) {
        addStep(`第${iter + 1}次迭代: 最优路径长度=${bestLength}`);
        await sleep(Math.max(1, 101 - speed()) * 2);
      }
    }

    setAcoResult(`最优路径: ${bestPath.join(' -> ')} (长度=${bestLength})`);
    addStep(`蚁群算法完成: ${acoResult()}`);
    setIsRunning(false);
  };

  const tabs = [
    { id: 'genetic', label: '遗传算法' },
    { id: 'pso', label: '粒子群优化' },
    { id: 'aco', label: '蚁群算法' },
  ];

  return (
    <main class="visualization-page">
      <div class="container">
        <div class="visualization-header">
          <h1>演化算法</h1>
          <p class="description">演化算法模拟自然界的演化过程，通过选择、交叉、变异等机制搜索最优解。</p>
        </div>
        <div style={{ display: 'flex', gap: '0', 'border-bottom': '1px solid var(--border)', 'margin-bottom': '2rem' }}>
          {tabs.map(tab => (
            <div
              class="evolutionary-tab"
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

        {activeTab() === 'genetic' && (
          <div>
            <div class="controls">
              <div class="controls-group">
                <label>种群大小</label>
                <input type="number" value={gaPopulation()} onChange={e => setGaPopulation(parseInt(e.currentTarget.value))} style={{ width: '60px', padding: '0.5rem', border: '1px solid var(--border)' }} />
              </div>
              <div class="controls-group">
                <label>迭代次数</label>
                <input type="number" value={gaGenerations()} onChange={e => setGaGenerations(parseInt(e.currentTarget.value))} style={{ width: '60px', padding: '0.5rem', border: '1px solid var(--border)' }} />
              </div>
              <div class="controls-group">
                <label>变异率</label>
                <input type="number" value={gaMutationRate()} onChange={e => setGaMutationRate(parseFloat(e.currentTarget.value))} step="0.01" style={{ width: '60px', padding: '0.5rem', border: '1px solid var(--border)' }} />
              </div>
              <div class="controls-group">
                <button class="btn btn-primary" onClick={runGA} disabled={isRunning()}>
                  {isRunning() ? '运行中...' : '运行遗传算法'}
                </button>
              </div>
            </div>
            <div class="canvas-container" style={{ padding: '2rem', 'min-height': '200px' }}>
              <div style={{ display: 'flex', 'flex-direction': 'column', gap: '1rem', 'align-items': 'center' }}>
                {gaResult() && (
                  <div style={{ padding: '1rem', background: 'var(--bg-secondary)', border: '1px solid var(--border)', 'text-align': 'center', 'font-family': 'var(--font-mono)', 'font-size': '1.25rem' }}>
                    {gaResult()}
                  </div>
                )}
              </div>
            </div>
            <div class="info-panel">
              <h3>遗传算法</h3>
              <p>模拟自然选择和遗传机制，通过选择、交叉、变异等操作搜索最优解。</p>
              <div class="complexity">
                <div class="complexity-item"><div class="label">时间复杂度</div><div class="value">O(g * p)</div></div>
                <div class="complexity-item"><div class="label">空间复杂度</div><div class="value">O(p)</div></div>
                <div class="complexity-item"><div class="label">应用</div><div class="value">优化问题</div></div>
              </div>
            </div>
          </div>
        )}

        {activeTab() === 'pso' && (
          <div>
            <div class="controls">
              <div class="controls-group">
                <label>粒子数</label>
                <input type="number" value={psoParticles()} onChange={e => setPsoParticles(parseInt(e.currentTarget.value))} style={{ width: '60px', padding: '0.5rem', border: '1px solid var(--border)' }} />
              </div>
              <div class="controls-group">
                <label>迭代次数</label>
                <input type="number" value={psoIterations()} onChange={e => setPsoIterations(parseInt(e.currentTarget.value))} style={{ width: '60px', padding: '0.5rem', border: '1px solid var(--border)' }} />
              </div>
              <div class="controls-group">
                <button class="btn btn-primary" onClick={runPSO} disabled={isRunning()}>
                  {isRunning() ? '运行中...' : '运行粒子群优化'}
                </button>
              </div>
            </div>
            <div class="canvas-container" style={{ padding: '2rem', 'min-height': '200px' }}>
              <div style={{ display: 'flex', 'flex-direction': 'column', gap: '1rem', 'align-items': 'center' }}>
                {psoResult() && (
                  <div style={{ padding: '1rem', background: 'var(--bg-secondary)', border: '1px solid var(--border)', 'text-align': 'center', 'font-family': 'var(--font-mono)', 'font-size': '1.25rem' }}>
                    {psoResult()}
                  </div>
                )}
              </div>
            </div>
            <div class="info-panel">
              <h3>粒子群优化</h3>
              <p>模拟鸟群觅食行为，通过粒子间的协作搜索最优解。</p>
              <div class="complexity">
                <div class="complexity-item"><div class="label">时间复杂度</div><div class="value">O(i * p)</div></div>
                <div class="complexity-item"><div class="label">空间复杂度</div><div class="value">O(p)</div></div>
                <div class="complexity-item"><div class="label">应用</div><div class="value">连续优化</div></div>
              </div>
            </div>
          </div>
        )}

        {activeTab() === 'aco' && (
          <div>
            <div class="controls">
              <div class="controls-group">
                <label>蚂蚁数</label>
                <input type="number" value={acoAnts()} onChange={e => setAcoAnts(parseInt(e.currentTarget.value))} style={{ width: '60px', padding: '0.5rem', border: '1px solid var(--border)' }} />
              </div>
              <div class="controls-group">
                <label>迭代次数</label>
                <input type="number" value={acoIterations()} onChange={e => setAcoIterations(parseInt(e.currentTarget.value))} style={{ width: '60px', padding: '0.5rem', border: '1px solid var(--border)' }} />
              </div>
              <div class="controls-group">
                <button class="btn btn-primary" onClick={runACO} disabled={isRunning()}>
                  {isRunning() ? '运行中...' : '运行蚁群算法'}
                </button>
              </div>
            </div>
            <div class="canvas-container" style={{ padding: '2rem', 'min-height': '200px' }}>
              <div style={{ display: 'flex', 'flex-direction': 'column', gap: '1rem', 'align-items': 'center' }}>
                {acoResult() && (
                  <div style={{ padding: '1rem', background: 'var(--bg-secondary)', border: '1px solid var(--border)', 'text-align': 'center', 'font-family': 'var(--font-mono)', 'font-size': '1.25rem' }}>
                    {acoResult()}
                  </div>
                )}
              </div>
            </div>
            <div class="info-panel">
              <h3>蚁群算法</h3>
              <p>模拟蚂蚁觅食行为，通过信息素引导搜索最优路径。</p>
              <div class="complexity">
                <div class="complexity-item"><div class="label">时间复杂度</div><div class="value">O(i * a * n^2)</div></div>
                <div class="complexity-item"><div class="label">空间复杂度</div><div class="value">O(n^2)</div></div>
                <div class="complexity-item"><div class="label">应用</div><div class="value">路径优化</div></div>
              </div>
            </div>
          </div>
        )}

        <div class="steps-panel">
          <h3>执行步骤</h3>
          <div>
            {steps().length === 0 ? (
              <div class="step-item">选择标签页并点击"开始"查看演化算法执行过程</div>
            ) : (
              steps().map(step => <div class="step-item active">{step}</div>)
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
