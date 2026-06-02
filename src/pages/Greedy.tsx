import { createSignal, onMount, onCleanup } from 'solid-js';
import { greedyCodes, languageLabels, type Language } from '../utils/codeData';
import CodePanel from '../components/CodePanel';
import ControlPanel from '../components/ControlPanel';
import Dropdown from '../components/Dropdown';
import { AnimationController, type AnimStep } from '../utils/animation';

interface Activity {
  id: number;
  start: number;
  end: number;
  selected: boolean;
  considering: boolean;
  rejected: boolean;
}

interface KnapsackItem {
  id: number;
  weight: number;
  value: number;
  ratio: number;
  taken: number;
  considering: boolean;
}

type GreedyState =
  | { type: 'activity'; activities: Activity[]; currentId: number; lastEnd: number }
  | { type: 'knapsack'; items: KnapsackItem[]; currentId: number; remaining: number; totalValue: number; totalWeight: number };

export default function Greedy() {
  const [activeTab, setActiveTab] = createSignal('activity');
  const [isRunning, setIsRunning] = createSignal(false);
  const [steps, setSteps] = createSignal<string[]>([]);
  const [speed, setSpeed] = createSignal(50);
  const [lang, setLang] = createSignal<Language>('javascript');
  const [currentStep, setCurrentStep] = createSignal(-1);
  const [totalSteps, setTotalSteps] = createSignal(0);
  const [state, setState] = createSignal<GreedyState>({
    type: 'activity',
    activities: [],
    currentId: -1,
    lastEnd: -1,
  });
  const [knapsackCapacity, setKnapsackCapacity] = createSignal(50);
  let controller: AnimationController<GreedyState>;

  onMount(() => {
    controller = new AnimationController<GreedyState>({ speed: speed() });
    controller.setCallbacks(
      (step: AnimStep<GreedyState>) => {
        setState(step.state);
        setSteps(prev => [step.description, ...prev].slice(0, 30));
      },
      (s, index, total) => {
        setCurrentStep(index);
        setTotalSteps(total);
      }
    );

    const handleKeydown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;
      if (e.key === ' ' || e.key === 'Space') {
        e.preventDefault();
        if (isRunning()) pause();
        else play();
      }
      if (e.key === 'ArrowLeft') { e.preventDefault(); controller.stepBackward(); }
      if (e.key === 'ArrowRight') { e.preventDefault(); controller.stepForward(); }
      if (e.key === 'r' || e.key === 'R') { e.preventDefault(); reset(); }
    };
    window.addEventListener('keydown', handleKeydown);

    onCleanup(() => {
      controller.destroy();
      window.removeEventListener('keydown', handleKeydown);
    });

    reset();
  });

  const defaultActivities: Activity[] = [
    { id: 1, start: 1, end: 4, selected: false, considering: false, rejected: false },
    { id: 2, start: 3, end: 5, selected: false, considering: false, rejected: false },
    { id: 3, start: 0, end: 6, selected: false, considering: false, rejected: false },
    { id: 4, start: 5, end: 7, selected: false, considering: false, rejected: false },
    { id: 5, start: 3, end: 8, selected: false, considering: false, rejected: false },
    { id: 6, start: 5, end: 9, selected: false, considering: false, rejected: false },
    { id: 7, start: 6, end: 10, selected: false, considering: false, rejected: false },
    { id: 8, start: 8, end: 11, selected: false, considering: false, rejected: false },
  ];

  const defaultItems: KnapsackItem[] = [
    { id: 1, weight: 10, value: 60, ratio: 6, taken: 0, considering: false },
    { id: 2, weight: 20, value: 100, ratio: 5, taken: 0, considering: false },
    { id: 3, weight: 30, value: 120, ratio: 4, taken: 0, considering: false },
  ];

  const buildActivitySteps = (activities: Activity[]): AnimStep<GreedyState>[] => {
    const steps: AnimStep<GreedyState>[] = [];
    const sorted = [...activities].sort((a, b) => a.end - b.end);
    const updated: Activity[] = activities.map(a => ({ ...a, selected: false, considering: false, rejected: false }));
    let lastEnd = -1;
    const selectedIds: number[] = [];

    steps.push({
      state: { type: 'activity', activities: updated.map(a => ({ ...a })), currentId: -1, lastEnd },
      description: '活动选择: 按结束时间排序后贪心选取',
    });

    for (const activity of sorted) {
      const idx = updated.findIndex(a => a.id === activity.id);
      if (idx < 0) continue;

      updated[idx].considering = true;
      steps.push({
        state: { type: 'activity', activities: updated.map(a => ({ ...a })), currentId: activity.id, lastEnd },
        description: `检查活动 ${activity.id}: [${activity.start}, ${activity.end}], 当前结束时间 ${lastEnd}`,
      });

      if (activity.start >= lastEnd) {
        updated[idx].selected = true;
        updated[idx].considering = false;
        selectedIds.push(activity.id);
        lastEnd = activity.end;
        steps.push({
          state: { type: 'activity', activities: updated.map(a => ({ ...a })), currentId: activity.id, lastEnd },
          description: `选择活动 ${activity.id}: [${activity.start}, ${activity.end}]`,
        });
      } else {
        updated[idx].rejected = true;
        updated[idx].considering = false;
        steps.push({
          state: { type: 'activity', activities: updated.map(a => ({ ...a })), currentId: activity.id, lastEnd },
          description: `跳过活动 ${activity.id}: 与已选活动冲突`,
        });
      }
    }

    steps.push({
      state: { type: 'activity', activities: updated.map(a => ({ ...a })), currentId: -1, lastEnd },
      description: `完成: 共选择 ${selectedIds.length} 个活动`,
    });

    return steps;
  };

  const buildKnapsackSteps = (items: KnapsackItem[], capacity: number): AnimStep<GreedyState>[] => {
    const steps: AnimStep<GreedyState>[] = [];
    const sorted = [...items].sort((a, b) => b.ratio - a.ratio);
    const updated: KnapsackItem[] = items.map(i => ({ ...i, taken: 0, considering: false }));
    let remaining = capacity;
    let totalValue = 0;
    let totalWeight = 0;

    steps.push({
      state: { type: 'knapsack', items: updated.map(i => ({ ...i })), currentId: -1, remaining, totalValue, totalWeight },
      description: `分数背包: 容量 ${capacity}, 按单位价值贪心`,
    });

    for (const item of sorted) {
      const idx = updated.findIndex(i => i.id === item.id);
      if (idx < 0) continue;

      updated[idx].considering = true;
      steps.push({
        state: { type: 'knapsack', items: updated.map(i => ({ ...i })), currentId: item.id, remaining, totalValue, totalWeight },
        description: `检查物品 ${item.id}: 单位价值 ${item.ratio}, 重量 ${item.weight}, 价值 ${item.value}`,
      });

      if (remaining <= 0) {
        updated[idx].considering = false;
        break;
      }

      const take = Math.min(item.weight, remaining);
      updated[idx].taken = take;
      updated[idx].considering = false;
      remaining -= take;
      totalValue += (take / item.weight) * item.value;
      totalWeight += take;

      steps.push({
        state: { type: 'knapsack', items: updated.map(i => ({ ...i })), currentId: item.id, remaining, totalValue, totalWeight },
        description: `选取物品 ${item.id}: 重量 ${take}/${item.weight}, 增加价值 ${((take / item.weight) * item.value).toFixed(1)}`,
      });
    }

    steps.push({
      state: { type: 'knapsack', items: updated.map(i => ({ ...i })), currentId: -1, remaining, totalValue, totalWeight },
      description: `完成: 总重量 ${totalWeight}, 总价值 ${Math.round(totalValue)}`,
    });

    return steps;
  };

  const start = () => {
    if (isRunning()) return;
    setIsRunning(true);
    setSteps([]);

    let animSteps: AnimStep<GreedyState>[] = [];
    if (activeTab() === 'activity') {
      animSteps = buildActivitySteps(defaultActivities);
    } else if (activeTab() === 'knapsack') {
      animSteps = buildKnapsackSteps(defaultItems, knapsackCapacity());
    }

    controller.setSteps(animSteps);
    controller.setSpeed(speed());
    controller.play().then(() => {
      setIsRunning(false);
      setSteps(prev => ['贪心算法完成', ...prev]);
    });
  };

  const play = () => {
    if (controller.isAtEnd() || controller.isEmpty()) {
      start();
    } else {
      setIsRunning(true);
      controller.play().then(() => setIsRunning(false));
    }
  };

  const pause = () => { controller.pause(); setIsRunning(false); };

  const reset = () => {
    controller.pause();
    setIsRunning(false);
    if (activeTab() === 'activity') {
      setState({
        type: 'activity',
        activities: defaultActivities.map(a => ({ ...a, selected: false, considering: false, rejected: false })),
        currentId: -1,
        lastEnd: -1,
      });
    } else {
      setState({
        type: 'knapsack',
        items: defaultItems.map(i => ({ ...i, taken: 0, considering: false })),
        currentId: -1,
        remaining: knapsackCapacity(),
        totalValue: 0,
        totalWeight: 0,
      });
    }
    setSteps([]);
    setCurrentStep(-1);
    setTotalSteps(0);
  };

  const handleStepForward = () => { if (!isRunning()) controller.stepForward(); };
  const handleStepBackward = () => { if (!isRunning()) controller.stepBackward(); };
  const handleSpeedChange = (newSpeed: number) => { setSpeed(newSpeed); controller.setSpeed(newSpeed); };

  const codeContent = () => {
    const algoKey = activeTab() === 'activity' ? 'activity' : 'knapsack';
    const code = greedyCodes[algoKey];
    if (!code) return '// 暂无代码';
    return code[lang()];
  };

  const tabs = [
    { id: 'activity', label: '活动选择' },
    { id: 'knapsack', label: '分数背包' },
  ];

  return (
    <main class="visualization-page">
      <div class="container">
        <div class="visualization-header">
          <h1>贪心算法</h1>
          <p class="description">贪心算法在每一步选择中都采取当前状态下最好或最优的选择，从而希望导致结果是全局最好或最优的算法。</p>
        </div>
        <div style={{ display: 'flex', gap: '0', 'border-bottom': '1px solid var(--border)', 'margin-bottom': '2rem' }}>
          {tabs.map(tab => (
            <div
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
              onClick={() => { setActiveTab(tab.id); reset(); }}
            >
              {tab.label}
            </div>
          ))}
        </div>

        {activeTab() === 'activity' && (
          <div>
            <div class="controls">
              <div class="controls-group">
                <label>语言</label>
                <Dropdown
                  value={lang()}
                  onChange={(value) => setLang(value as Language)}
                  options={Object.entries(languageLabels).map(([k, v]) => ({ value: k, label: v }))}
                />
              </div>
            </div>
            <div class="canvas-container canvas-container-enhanced" style={{ padding: '2rem', 'min-height': '300px' }}>
              {(() => {
                const s = state();
                if (s.type !== 'activity') return null;
                return (
                  <div style={{ display: 'flex', 'flex-direction': 'column', gap: '0.75rem' }}>
                    {s.activities.map(activity => {
                      const isCurrent = activity.id === s.currentId;
                      let bg = activity.selected ? '#1a1a1a' : activity.rejected ? '#bbbbbb' : '#cccccc';
                      let color = activity.selected ? '#fff' : '#1a1a1a';
                      let shadow = '';
                      if (isCurrent && activity.considering) {
                        bg = activity.selected ? '#1a1a1a' : '#666666';
                        shadow = '0 0 16px rgba(0, 0, 0, 0.5)';
                      }
                      return (
                        <div style={{ display: 'flex', 'align-items': 'center', gap: '1rem' }}>
                          <span style={{ width: '80px', 'font-size': '0.85rem', 'font-family': 'var(--font-mono)' }}>活动 {activity.id}</span>
                          <div style={{
                            position: 'relative', height: '36px', 'flex-grow': '1',
                            background: 'var(--bg-secondary)', border: '1px solid var(--border)',
                          }}>
                            <div style={{
                              position: 'absolute',
                              left: `${(activity.start / 12) * 100}%`,
                              width: `${((activity.end - activity.start) / 12) * 100}%`,
                              height: '100%',
                              background: bg, color,
                              transition: 'all 0.3s ease',
                              display: 'flex', 'align-items': 'center', 'justify-content': 'center',
                              'font-size': '0.75rem', 'font-family': 'var(--font-mono)',
                              'box-shadow': shadow,
                              opacity: activity.rejected && !activity.selected ? 0.4 : 1,
                            }}>
                              [{activity.start}, {activity.end}]
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>
            <ControlPanel
              isRunning={isRunning()}
              speed={speed()}
              currentStep={currentStep()}
              totalSteps={totalSteps()}
              onPlay={play}
              onPause={pause}
              onReset={reset}
              onStepForward={handleStepForward}
              onStepBackward={handleStepBackward}
              onSpeedChange={handleSpeedChange}
              onGenerate={reset}
            />
            <div class="info-panel">
              <h3>活动选择问题</h3>
              <p>给定一组活动，每个活动有开始和结束时间。选择尽可能多的互不重叠的活动。</p>
              <div class="complexity">
                <div class="complexity-item"><div class="label">贪心策略</div><div class="value">优先选择结束时间最早的活动</div></div>
                <div class="complexity-item"><div class="label">时间复杂度</div><div class="value">O(n log n)</div></div>
                <div class="complexity-item"><div class="label">空间复杂度</div><div class="value">O(1)</div></div>
              </div>
            </div>
          </div>
        )}

        {activeTab() === 'knapsack' && (
          <div>
            <div class="controls">
              <div class="controls-group">
                <label>背包容量</label>
                <input type="number" value={knapsackCapacity()} onChange={e => { setKnapsackCapacity(parseInt(e.currentTarget.value) || 50); reset(); }} style={{ width: '80px', padding: '0.5rem', border: '1px solid var(--border)' }} />
              </div>
              {(() => {
                const s = state();
                if (s.type !== 'knapsack') return null;
                return (
                  <>
                    <div class="controls-group">
                      <span style={{ 'font-size': '0.85rem' }}>当前重量: <strong>{s.totalWeight}</strong></span>
                    </div>
                    <div class="controls-group">
                      <span style={{ 'font-size': '0.85rem' }}>当前价值: <strong>{Math.round(s.totalValue)}</strong></span>
                    </div>
                  </>
                );
              })()}
            </div>
            <div class="canvas-container canvas-container-enhanced" style={{ padding: '2rem', 'min-height': '300px' }}>
              {(() => {
                const s = state();
                if (s.type !== 'knapsack') return null;
                return (
                  <div style={{ display: 'flex', 'flex-direction': 'column', gap: '1rem' }}>
                    {s.items.map(item => {
                      const isCurrent = item.id === s.currentId;
                      const percent = item.weight > 0 ? (item.taken / item.weight) * 100 : 0;
                      return (
                        <div style={{ display: 'flex', 'flex-direction': 'column', gap: '0.5rem' }}>
                          <div style={{ display: 'flex', 'align-items': 'center', gap: '1rem' }}>
                            <span style={{ width: '100px', 'font-size': '0.85rem', 'font-family': 'var(--font-mono)' }}>物品 {item.id} (v/w={item.ratio})</span>
                            <span style={{ 'font-size': '0.8rem', color: 'var(--text-secondary)' }}>w={item.weight} v={item.value}</span>
                          </div>
                          <div style={{
                            position: 'relative', height: '32px',
                            background: 'var(--bg-secondary)', border: '1px solid var(--border)',
                          }}>
                            <div style={{
                              position: 'absolute', left: '0', top: '0', bottom: '0',
                              width: `${percent}%`,
                              background: item.taken >= item.weight ? '#1a1a1a' : '#666666',
                              transition: 'width 0.3s ease',
                              display: 'flex', 'align-items': 'center', 'justify-content': 'center',
                              color: '#fff', 'font-size': '0.75rem', 'font-family': 'var(--font-mono)',
                              'box-shadow': isCurrent ? '0 0 12px rgba(0, 0, 0, 0.4)' : 'none',
                            }}>
                              {item.taken > 0 ? `已取 ${item.taken}` : ''}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>
            <ControlPanel
              isRunning={isRunning()}
              speed={speed()}
              currentStep={currentStep()}
              totalSteps={totalSteps()}
              onPlay={play}
              onPause={pause}
              onReset={reset}
              onStepForward={handleStepForward}
              onStepBackward={handleStepBackward}
              onSpeedChange={handleSpeedChange}
              onGenerate={reset}
            />
            <div class="info-panel">
              <h3>分数背包问题</h3>
              <p>每个物品可以部分装入背包，按单位价值（v/w）从高到低贪心选取。</p>
              <div class="complexity">
                <div class="complexity-item"><div class="label">贪心策略</div><div class="value">按单位价值降序选取</div></div>
                <div class="complexity-item"><div class="label">时间复杂度</div><div class="value">O(n log n)</div></div>
              </div>
            </div>
          </div>
        )}

        <div class="steps-panel">
          <h3>执行步骤</h3>
          <div>
            {steps().length === 0 ? (
              <div class="step-item">点击播放按钮开始贪心算法可视化</div>
            ) : (
              steps().map(step => <div class="step-item active">{step}</div>)
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
