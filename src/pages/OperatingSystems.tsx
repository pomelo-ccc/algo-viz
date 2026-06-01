import { createSignal } from 'solid-js';
import CodePanel from '../components/CodePanel';

interface Process {
  id: number;
  burstTime: number;
  arrivalTime: number;
  priority: number;
}

export default function OperatingSystems() {
  const [activeTab, setActiveTab] = createSignal('scheduling');
  const [isRunning, setIsRunning] = createSignal(false);
  const [steps, setSteps] = createSignal<string[]>([]);
  const [speed, setSpeed] = createSignal(50);

  // CPU Scheduling
  const [processes, setProcesses] = createSignal<Process[]>([
    { id: 1, burstTime: 10, arrivalTime: 0, priority: 2 },
    { id: 2, burstTime: 5, arrivalTime: 1, priority: 1 },
    { id: 3, burstTime: 8, arrivalTime: 2, priority: 3 },
  ]);
  const [schedulingResult, setSchedulingResult] = createSignal<string>('');

  // Memory Management
  const [pageSize, setPageSize] = createSignal(4);
  const [memorySize, setMemorySize] = createSignal(16);
  const [memoryResult, setMemoryResult] = createSignal<string>('');

  // File System
  const [fileCount, setFileCount] = createSignal(5);
  const [fileResult, setFileResult] = createSignal<string>('');

  const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));
  const addStep = (text: string) => setSteps(prev => [text, ...prev].slice(0, 30));

  // CPU Scheduling
  const runScheduling = async () => {
    if (isRunning()) return;
    setIsRunning(true);
    setSteps([]);
    addStep('CPU调度: 开始模拟');

    const procs = [...processes()];
    procs.sort((a, b) => a.arrivalTime - b.arrivalTime);

    addStep(`进程列表:`);
    for (const p of procs) {
      addStep(`P${p.id}: 到达=${p.arrivalTime}, 执行=${p.burstTime}, 优先级=${p.priority}`);
      await sleep(Math.max(1, 101 - speed()) * 3);
    }

    // FCFS
    addStep('FCFS调度:');
    let currentTime = 0;
    for (const p of procs) {
      if (currentTime < p.arrivalTime) {
        currentTime = p.arrivalTime;
      }
      addStep(`P${p.id} 开始执行 at t=${currentTime}`);
      currentTime += p.burstTime;
      addStep(`P${p.id} 完成 at t=${currentTime}`);
      await sleep(Math.max(1, 101 - speed()) * 5);
    }

    // SJF
    addStep('SJF调度:');
    const sjfProcs = [...procs].sort((a, b) => a.burstTime - b.burstTime);
    currentTime = 0;
    for (const p of sjfProcs) {
      if (currentTime < p.arrivalTime) {
        currentTime = p.arrivalTime;
      }
      addStep(`P${p.id} 开始执行 at t=${currentTime}`);
      currentTime += p.burstTime;
      addStep(`P${p.id} 完成 at t=${currentTime}`);
      await sleep(Math.max(1, 101 - speed()) * 5);
    }

    // RR
    addStep('RR调度 (时间片=2):');
    const rrProcs = procs.map(p => ({ ...p, remaining: p.burstTime }));
    currentTime = 0;
    let queue = [...rrProcs];
    while (queue.length > 0) {
      const p = queue.shift()!;
      if (p.remaining > 2) {
        p.remaining -= 2;
        currentTime += 2;
        addStep(`P${p.id} 执行2单位, 剩余=${p.remaining}`);
        queue.push(p);
      } else {
        currentTime += p.remaining;
        addStep(`P${p.id} 完成 at t=${currentTime}`);
      }
      await sleep(Math.max(1, 101 - speed()) * 5);
    }

    setSchedulingResult('调度模拟完成');
    addStep('CPU调度模拟完成');
    setIsRunning(false);
  };

  // Memory Management
  const runMemory = async () => {
    if (isRunning()) return;
    setIsRunning(true);
    setSteps([]);
    addStep('内存管理: 开始模拟');

    const pages = pageSize();
    const memory = memorySize();
    const pageTable: number[] = [];

    addStep(`页大小: ${pages}KB, 内存: ${memory}KB`);
    await sleep(Math.max(1, 101 - speed()) * 5);

    for (let i = 0; i < memory / pages; i++) {
      pageTable.push(Math.floor(Math.random() * (memory / pages)));
      addStep(`页 ${i} -> 帧 ${pageTable[i]}`);
      await sleep(Math.max(1, 101 - speed()) * 3);
    }

    setMemoryResult(`页表建立完成: ${pageTable.length} 个页表项`);
    addStep('内存管理模拟完成');
    setIsRunning(false);
  };

  // File System
  const runFileSystem = async () => {
    if (isRunning()) return;
    setIsRunning(true);
    setSteps([]);
    addStep('文件系统: 开始模拟');

    const files = fileCount();
    const fileTable: { name: string; size: number; blocks: number[] }[] = [];

    for (let i = 0; i < files; i++) {
      const blocks = Array.from({ length: Math.floor(Math.random() * 5) + 1 }, () => Math.floor(Math.random() * 100));
      fileTable.push({
        name: `file${i + 1}.txt`,
        size: Math.floor(Math.random() * 1024) + 1,
        blocks,
      });
      addStep(`创建文件: ${fileTable[i].name}, 大小=${fileTable[i].size}B, 块数=${blocks.length}`);
      await sleep(Math.max(1, 101 - speed()) * 3);
    }

    setFileResult(`文件系统模拟完成: ${files} 个文件`);
    addStep('文件系统模拟完成');
    setIsRunning(false);
  };

  const tabs = [
    { id: 'scheduling', label: 'CPU调度' },
    { id: 'memory', label: '内存管理' },
    { id: 'filesystem', label: '文件系统' },
  ];

  return (
    <main class="visualization-page">
      <div class="container">
        <div class="visualization-header">
          <h1>操作系统算法</h1>
          <p class="description">操作系统中的经典算法，包括CPU调度、内存管理和文件系统等。</p>
        </div>
        <div style={{ display: 'flex', gap: '0', 'border-bottom': '1px solid var(--border)', 'margin-bottom': '2rem' }}>
          {tabs.map(tab => (
            <div
              class="os-tab"
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

        {activeTab() === 'scheduling' && (
          <div>
            <div class="controls">
              <div class="controls-group">
                <label>进程数</label>
                <input type="number" value={processes().length} onChange={e => {
                  const count = parseInt(e.currentTarget.value);
                  const newProcs: Process[] = [];
                  for (let i = 0; i < count; i++) {
                    newProcs.push({
                      id: i + 1,
                      burstTime: Math.floor(Math.random() * 10) + 1,
                      arrivalTime: i,
                      priority: Math.floor(Math.random() * 5) + 1,
                    });
                  }
                  setProcesses(newProcs);
                }} style={{ width: '60px', padding: '0.5rem', border: '1px solid var(--border)' }} />
              </div>
              <div class="controls-group">
                <button class="btn btn-primary" onClick={runScheduling} disabled={isRunning()}>
                  {isRunning() ? '运行中...' : '运行调度'}
                </button>
              </div>
            </div>
            <div class="canvas-container" style={{ padding: '2rem', 'min-height': '200px' }}>
              <div style={{ display: 'flex', 'flex-direction': 'column', gap: '1rem', 'align-items': 'center' }}>
                {schedulingResult() && (
                  <div style={{ padding: '1rem', background: 'var(--bg-secondary)', border: '1px solid var(--border)', 'text-align': 'center', 'font-family': 'var(--font-mono)', 'font-size': '1.25rem' }}>
                    {schedulingResult()}
                  </div>
                )}
              </div>
            </div>
            <div class="info-panel">
              <h3>CPU调度</h3>
              <p>操作系统通过调度算法决定进程的执行顺序，包括FCFS、SJF、RR等经典算法。</p>
              <div class="complexity">
                <div class="complexity-item"><div class="label">FCFS</div><div class="value">O(n)</div></div>
                <div class="complexity-item"><div class="label">SJF</div><div class="value">O(n log n)</div></div>
                <div class="complexity-item"><div class="label">RR</div><div class="value">O(n)</div></div>
              </div>
            </div>
          </div>
        )}

        {activeTab() === 'memory' && (
          <div>
            <div class="controls">
              <div class="controls-group">
                <label>页大小(KB)</label>
                <input type="number" value={pageSize()} onChange={e => setPageSize(parseInt(e.currentTarget.value))} style={{ width: '60px', padding: '0.5rem', border: '1px solid var(--border)' }} />
              </div>
              <div class="controls-group">
                <label>内存大小(KB)</label>
                <input type="number" value={memorySize()} onChange={e => setMemorySize(parseInt(e.currentTarget.value))} style={{ width: '60px', padding: '0.5rem', border: '1px solid var(--border)' }} />
              </div>
              <div class="controls-group">
                <button class="btn btn-primary" onClick={runMemory} disabled={isRunning()}>
                  {isRunning() ? '运行中...' : '运行内存管理'}
                </button>
              </div>
            </div>
            <div class="canvas-container" style={{ padding: '2rem', 'min-height': '200px' }}>
              <div style={{ display: 'flex', 'flex-direction': 'column', gap: '1rem', 'align-items': 'center' }}>
                {memoryResult() && (
                  <div style={{ padding: '1rem', background: 'var(--bg-secondary)', border: '1px solid var(--border)', 'text-align': 'center', 'font-family': 'var(--font-mono)', 'font-size': '1.25rem' }}>
                    {memoryResult()}
                  </div>
                )}
              </div>
            </div>
            <div class="info-panel">
              <h3>内存管理</h3>
              <p>操作系统通过分页、分段等机制管理内存，实现虚拟内存和物理内存的映射。</p>
              <div class="complexity">
                <div class="complexity-item"><div class="label">页表查找</div><div class="value">O(1)</div></div>
                <div class="complexity-item"><div class="label">页置换</div><div class="value">O(n)</div></div>
                <div class="complexity-item"><div class="label">应用</div><div class="value">虚拟内存</div></div>
              </div>
            </div>
          </div>
        )}

        {activeTab() === 'filesystem' && (
          <div>
            <div class="controls">
              <div class="controls-group">
                <label>文件数</label>
                <input type="number" value={fileCount()} onChange={e => setFileCount(parseInt(e.currentTarget.value))} style={{ width: '60px', padding: '0.5rem', border: '1px solid var(--border)' }} />
              </div>
              <div class="controls-group">
                <button class="btn btn-primary" onClick={runFileSystem} disabled={isRunning()}>
                  {isRunning() ? '运行中...' : '运行文件系统'}
                </button>
              </div>
            </div>
            <div class="canvas-container" style={{ padding: '2rem', 'min-height': '200px' }}>
              <div style={{ display: 'flex', 'flex-direction': 'column', gap: '1rem', 'align-items': 'center' }}>
                {fileResult() && (
                  <div style={{ padding: '1rem', background: 'var(--bg-secondary)', border: '1px solid var(--border)', 'text-align': 'center', 'font-family': 'var(--font-mono)', 'font-size': '1.25rem' }}>
                    {fileResult()}
                  </div>
                )}
              </div>
            </div>
            <div class="info-panel">
              <h3>文件系统</h3>
              <p>操作系统通过inode、目录结构等机制管理文件，实现文件的存储和访问。</p>
              <div class="complexity">
                <div class="complexity-item"><div class="label">查找</div><div class="value">O(log n)</div></div>
                <div class="complexity-item"><div class="label">插入</div><div class="value">O(1)</div></div>
                <div class="complexity-item"><div class="label">删除</div><div class="value">O(1)</div></div>
              </div>
            </div>
          </div>
        )}

        <div class="steps-panel">
          <h3>执行步骤</h3>
          <div>
            {steps().length === 0 ? (
              <div class="step-item">选择标签页并点击"开始"查看操作系统算法执行过程</div>
            ) : (
              steps().map(step => <div class="step-item active">{step}</div>)
            )}
          </div>
        </div>
        <CodePanel category="operatingsystems" algorithm={activeTab()} />
      </div>
    </main>
  );
}
