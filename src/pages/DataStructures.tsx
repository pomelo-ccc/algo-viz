import { createSignal, For } from 'solid-js';

// ---------- Types ----------
interface TreeNode {
  value: number;
  left?: TreeNode;
  right?: TreeNode;
  x?: number;
  y?: number;
}

interface TrieNode {
  children: Map<string, TrieNode>;
  isEnd: boolean;
}

// ---------- Component ----------
export default function DataStructures() {
  const [activeTab, setActiveTab] = createSignal('array');
  const [isRunning, setIsRunning] = createSignal(false);
  const [steps, setSteps] = createSignal<string[]>([]);
  const [speed, setSpeed] = createSignal(50);

  // BST state
  const [bstRoot, setBstRoot] = createSignal<TreeNode | null>(null);
  const [bstInput, setBstInput] = createSignal('50,30,70,20,40,60,80');

  // Array state
  const [array, setArray] = createSignal<number[]>([12, 34, 56, 7, 23, 89, 45]);
  const [arrayIndex, setArrayIndex] = createSignal(-1);
  const [arrayValue, setArrayValue] = createSignal('');

  // Linked list state
  const [linkedList, setLinkedList] = createSignal<number[]>([10, 20, 30, 40, 50]);

  // Stack & Queue state
  const [stack, setStack] = createSignal<number[]>([]);
  const [queue, setQueue] = createSignal<number[]>([]);

  // Heap state
  const [heapArray, setHeapArray] = createSignal<number[]>([64, 25, 12, 22, 11]);

  // Hash table state
  const [hashTable, setHashTable] = createSignal<Map<number, number[]>>(new Map());
  const [hashInput, setHashInput] = createSignal('5,28,19,15,20,33,12,17,10');
  const [hashTableSize, setHashTableSize] = createSignal(10);

  // Union-Find state
  const [ufSize, setUfSize] = createSignal(10);
  const [ufParent, setUfParent] = createSignal<number[]>([]);
  const [ufOperations, setUfOperations] = createSignal<string[]>([]);

  // Trie state
  const [trieRoot, setTrieRoot] = createSignal<TrieNode | null>(null);
  const [trieWords, setTrieWords] = createSignal('cat,car,card,cardio,cardboard');

  const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));
  const addStep = (text: string) => setSteps(prev => [text, ...prev].slice(0, 30));

  // ---------- BST ----------
  const insertBST = (root: TreeNode | null | undefined, value: number): TreeNode => {
    if (!root) return { value };
    if (value < root.value) root.left = insertBST(root.left, value);
    else if (value > root.value) root.right = insertBST(root.right, value);
    return root;
  };

  const buildBST = () => {
    const values = bstInput().split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n));
    let root: TreeNode | null = null;
    for (const val of values) root = insertBST(root, val);
    setBstRoot(root);
    addStep(`构建 BST: ${values.join(', ')}`);
  };

  const calculatePositions = (node: TreeNode | null, depth: number = 0, x: number = 400, spread: number = 200): TreeNode | null => {
    if (!node) return null;
    node.x = x;
    node.y = depth * 60 + 40;
    if (node.left) calculatePositions(node.left, depth + 1, x - spread / Math.pow(2, depth), spread);
    if (node.right) calculatePositions(node.right, depth + 1, x + spread / Math.pow(2, depth), spread);
    return node;
  };

  const drawBST = () => {
    const root = bstRoot();
    if (!root) return null;
    calculatePositions(root);
    const nodes: any[] = [];
    const edges: any[] = [];
    const collect = (node: TreeNode) => {
      if (!node) return;
      nodes.push(node);
      if (node.left) {
        edges.push({ from: node, to: node.left });
        collect(node.left);
      }
      if (node.right) {
        edges.push({ from: node, to: node.right });
        collect(node.right);
      }
    };
    collect(root);
    return { nodes, edges };
  };

  // ---------- Array ----------
  const generateArray = () => {
    const arr: number[] = [];
    for (let i = 0; i < 8; i++) arr.push(Math.floor(Math.random() * 100));
    setArray(arr);
    setArrayIndex(-1);
    addStep(`生成新数组: [${arr.join(', ')}]`);
  };

  const accessArray = async () => {
    const idx = parseInt(arrayValue());
    if (isNaN(idx) || idx < 0 || idx >= array().length) {
      addStep('索引无效');
      return;
    }
    setArrayIndex(idx);
    addStep(`访问 array[${idx}] = ${array()[idx]}`);
    await sleep(500);
    setArrayIndex(-1);
  };

  const insertArray = () => {
    const val = parseInt(arrayValue());
    if (isNaN(val)) { addStep('请输入有效数字'); return; }
    setArray(prev => [...prev, val]);
    addStep(`在尾部插入 ${val}`);
  };

  const deleteArray = () => {
    const idx = parseInt(arrayValue());
    if (isNaN(idx) || idx < 0 || idx >= array().length) {
      addStep('索引无效');
      return;
    }
    setArray(prev => { const arr = [...prev]; arr.splice(idx, 1); return arr; });
    addStep(`删除索引 ${idx}`);
  };

  // ---------- Linked List ----------
  const addToLinkedList = () => {
    const val = Math.floor(Math.random() * 100);
    setLinkedList(prev => [...prev, val]);
    addStep(`链表尾部添加 ${val}`);
  };

  const insertLinkedList = () => {
    const val = parseInt(arrayValue());
    if (isNaN(val)) { addStep('请输入有效数字'); return; }
    setLinkedList(prev => [val, ...prev]);
    addStep(`链表头部插入 ${val}`);
  };

  const removeFromLinkedList = () => {
    setLinkedList(prev => {
      if (prev.length === 0) return prev;
      addStep(`移除链表头部 ${prev[0]}`);
      return prev.slice(1);
    });
  };

  // ---------- Stack & Queue ----------
  const pushStack = () => {
    const val = Math.floor(Math.random() * 100);
    setStack(prev => [...prev, val]);
    addStep(`Push ${val} 到栈`);
  };

  const popStack = () => {
    setStack(prev => {
      if (prev.length === 0) return prev;
      addStep(`Pop ${prev[prev.length - 1]} 从栈`);
      return prev.slice(0, -1);
    });
  };

  const enqueue = () => {
    const val = Math.floor(Math.random() * 100);
    setQueue(prev => [...prev, val]);
    addStep(`Enqueue ${val} 到队列`);
  };

  const dequeue = () => {
    setQueue(prev => {
      if (prev.length === 0) return prev;
      addStep(`Dequeue ${prev[0]} 从队列`);
      return prev.slice(1);
    });
  };

  // ---------- Heap ----------
  const addToHeap = () => {
    const val = Math.floor(Math.random() * 100);
    setHeapArray(prev => {
      const newHeap = [...prev, val];
      addStep(`向堆中添加 ${val}`);
      return newHeap;
    });
  };

  const removeFromHeap = () => {
    setHeapArray(prev => {
      if (prev.length === 0) return prev;
      const newHeap = prev.slice(1);
      addStep(`移除堆顶 ${prev[0]}`);
      return newHeap;
    });
  };

  // ---------- Hash Table ----------
  const buildHashTable = () => {
    const size = hashTableSize();
    const values = hashInput().split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n));
    const table = new Map<number, number[]>();
    for (let i = 0; i < size; i++) table.set(i, []);
    for (const val of values) {
      const idx = val % size;
      table.get(idx)!.push(val);
    }
    setHashTable(table);
    addStep(`构建哈希表 (大小: ${size})`);
  };

  const hashInsert = () => {
    const val = parseInt(arrayValue());
    if (isNaN(val)) { addStep('请输入有效数字'); return; }
    const size = hashTableSize();
    const idx = val % size;
    setHashTable(prev => {
      const table = new Map(prev);
      const bucket = [...(table.get(idx) || [])];
      bucket.push(val);
      table.set(idx, bucket);
      return table;
    });
    addStep(`插入 ${val} -> 桶 ${idx}`);
  };

  // ---------- Union-Find ----------
  const initUF = () => {
    const n = ufSize();
    const parent: number[] = [];
    for (let i = 0; i < n; i++) parent.push(i);
    setUfParent(parent);
    setUfOperations([]);
    addStep(`初始化并查集，共 ${n} 个元素`);
  };

  const find = (parent: number[], x: number): number => {
    if (parent[x] !== x) parent[x] = find(parent, parent[x]);
    return parent[x];
  };

  const union = () => {
    const parent = [...ufParent()];
    if (parent.length === 0) { addStep('请先初始化并查集'); return; }
    const a = Math.floor(Math.random() * parent.length);
    let b = Math.floor(Math.random() * parent.length);
    while (b === a) b = Math.floor(Math.random() * parent.length);
    const pa = find(parent, a);
    const pb = find(parent, b);
    if (pa !== pb) {
      parent[pa] = pb;
      setUfParent(parent);
      setUfOperations(prev => [...prev, `Union(${a}, ${b}) -> 合并集合`].slice(-20));
      addStep(`Union(${a}, ${b}): 合并两个集合`);
    } else {
      setUfOperations(prev => [...prev, `Union(${a}, ${b}) -> 已在同一集合`].slice(-20));
      addStep(`Union(${a}, ${b}): 已在同一集合`);
    }
  };

  // ---------- Trie ----------
  const buildTrie = () => {
    const root: TrieNode = { children: new Map(), isEnd: false };
    const words = trieWords().split(',').map(s => s.trim()).filter(w => w.length > 0);
    for (const word of words) {
      let node = root;
      for (const char of word) {
        if (!node.children.has(char)) {
          node.children.set(char, { children: new Map(), isEnd: false });
        }
        node = node.children.get(char)!;
      }
      node.isEnd = true;
    }
    setTrieRoot(root);
    addStep(`构建字典树: ${words.join(', ')}`);
  };

  const renderTrie = (node: TrieNode | null, prefix: string = '', depth: number = 0): any[] => {
    if (!node) return [];
    const result: any[] = [];
    node.children.forEach((child, char) => {
      result.push(
        <div style={{ 'margin-left': `${depth * 20}px`, display: 'flex', 'align-items': 'center', gap: '0.5rem', padding: '0.25rem 0' }}>
          <span style={{
            display: 'inline-flex',
            'align-items': 'center',
            'justify-content': 'center',
            width: '28px',
            height: '28px',
            'border-radius': '4px',
            background: child.isEnd ? '#1a1a1a' : '#e5e5e5',
            color: child.isEnd ? '#fff' : '#1a1a1a',
            'font-family': 'var(--font-mono)',
            'font-size': '0.85rem',
          }}>{char}</span>
          {child.isEnd && <span style={{ 'font-size': '0.75rem', color: 'var(--text-tertiary)' }}>单词结束</span>}
        </div>
      );
      result.push(...renderTrie(child, prefix + char, depth + 1));
    });
    return result;
  };

  const tabs = [
    { id: 'array', label: '数组' },
    { id: 'linkedlist', label: '链表' },
    { id: 'stack', label: '栈与队列' },
    { id: 'bst', label: '二叉搜索树' },
    { id: 'heap', label: '堆' },
    { id: 'hashtable', label: '哈希表' },
    { id: 'unionfind', label: '并查集' },
    { id: 'trie', label: '字典树' },
  ];

  const bstData = bstRoot() ? drawBST() : null;

  return (
    <main class="visualization-page">
      <div class="container">
        <div class="visualization-header">
          <h1>数据结构</h1>
          <p class="description">可视化展示常见数据结构的操作过程，帮助理解不同数据结构的特性与适用场景。</p>
        </div>
        <div style={{ display: 'flex', gap: '0', 'border-bottom': '1px solid var(--border)', 'margin-bottom': '2rem', 'overflow-x': 'auto' }}>
          {tabs.map(tab => (
            <div
              class="ds-tab"
              style={{
                padding: '0.75rem 1.5rem',
                cursor: 'pointer',
                'font-size': '0.85rem',
                'text-transform': 'uppercase',
                'letter-spacing': '0.05em',
                color: activeTab() === tab.id ? 'var(--text-primary)' : 'var(--text-secondary)',
                'border-bottom': activeTab() === tab.id ? '1px solid var(--text-primary)' : '1px solid transparent',
                'margin-bottom': '-1px',
                'white-space': 'nowrap',
              }}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </div>
          ))}
        </div>

        {/* ---------- Array ---------- */}
        {activeTab() === 'array' && (
          <div>
            <div class="controls">
              <div class="controls-group">
                <label>操作</label>
                <input type="text" placeholder="输入数字" value={arrayValue()} onInput={e => setArrayValue(e.currentTarget.value)} style={{ padding: '0.5rem', border: '1px solid var(--border)', width: '120px' }} />
              </div>
              <div class="controls-group">
                <button class="btn" onClick={generateArray}>生成新数组</button>
                <button class="btn" onClick={accessArray}>访问</button>
                <button class="btn" onClick={insertArray}>尾部插入</button>
                <button class="btn" onClick={deleteArray}>删除</button>
              </div>
            </div>
            <div class="canvas-container" style={{ padding: '2rem', 'min-height': '120px', display: 'flex', 'align-items': 'center', 'justify-content': 'center' }}>
              <div style={{ display: 'flex', gap: '4px', 'align-items': 'flex-end' }}>
                {array().map((val, i) => (
                  <div style={{ display: 'flex', 'flex-direction': 'column', 'align-items': 'center', gap: '0.25rem' }}>
                    <div style={{
                      width: '50px',
                      height: '50px',
                      display: 'flex',
                      'align-items': 'center',
                      'justify-content': 'center',
                      background: i === arrayIndex() ? '#1a1a1a' : '#f5f5f5',
                      color: i === arrayIndex() ? '#fff' : '#1a1a1a',
                      border: '1px solid var(--border)',
                      'font-family': 'var(--font-mono)',
                      'font-size': '0.9rem',
                      transition: 'all 0.3s ease',
                    }}>{val}</div>
                    <span style={{ 'font-size': '0.7rem', color: 'var(--text-tertiary)', 'font-family': 'var(--font-mono)' }}>{i}</span>
                  </div>
                ))}
              </div>
            </div>
            <div class="info-panel">
              <h3>数组 (Array)</h3>
              <p>连续内存空间存储的线性数据结构，支持通过索引 O(1) 时间复杂度随机访问。</p>
              <div class="complexity">
                <div class="complexity-item"><div class="label">随机访问</div><div class="value">O(1)</div></div>
                <div class="complexity-item"><div class="label">尾部插入</div><div class="value">O(1) 均摊</div></div>
                <div class="complexity-item"><div class="label">中间插入/删除</div><div class="value">O(n)</div></div>
                <div class="complexity-item"><div class="label">空间复杂度</div><div class="value">O(n)</div></div>
              </div>
            </div>
          </div>
        )}

        {/* ---------- Linked List ---------- */}
        {activeTab() === 'linkedlist' && (
          <div>
            <div class="controls">
              <div class="controls-group">
                <label>数值</label>
                <input type="text" placeholder="输入数字" value={arrayValue()} onInput={e => setArrayValue(e.currentTarget.value)} style={{ padding: '0.5rem', border: '1px solid var(--border)', width: '120px' }} />
              </div>
              <div class="controls-group">
                <button class="btn" onClick={insertLinkedList}>头部插入</button>
                <button class="btn" onClick={addToLinkedList}>尾部添加</button>
                <button class="btn" onClick={removeFromLinkedList}>头部移除</button>
                <button class="btn" onClick={() => setLinkedList([])}>清空</button>
              </div>
            </div>
            <div class="canvas-container" style={{ padding: '2rem', 'min-height': '150px', display: 'flex', 'align-items': 'center', 'justify-content': 'center' }}>
              {linkedList().length === 0 ? (
                <p style={{ color: 'var(--text-secondary)' }}>空链表，点击"头部插入"或"尾部添加"添加元素</p>
              ) : (
                <div style={{ display: 'flex', 'align-items': 'center', gap: '0', 'flex-wrap': 'wrap' }}>
                  {linkedList().map((val, i) => (
                    <div style={{ display: 'flex', 'align-items': 'center' }}>
                      <div style={{
                        padding: '0.75rem 1.5rem', background: '#1a1a1a', color: '#fff',
                        'font-family': 'var(--font-mono)', 'border-radius': '4px',
                      }}>{val}</div>
                      {i < linkedList().length - 1 && <span style={{ padding: '0 0.5rem', color: 'var(--text-secondary)', 'font-size': '1.2rem' }}>→</span>}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div class="info-panel">
              <h3>链表 (Linked List)</h3>
              <p>由节点组成的线性数据结构，每个节点包含数据和指向下一个节点的指针。</p>
              <div class="complexity">
                <div class="complexity-item"><div class="label">头部插入/删除</div><div class="value">O(1)</div></div>
                <div class="complexity-item"><div class="label">尾部插入</div><div class="value">O(n)</div></div>
                <div class="complexity-item"><div class="label">查找</div><div class="value">O(n)</div></div>
              </div>
            </div>
          </div>
        )}

        {/* ---------- Stack & Queue ---------- */}
        {activeTab() === 'stack' && (
          <div>
            <div class="controls">
              <div class="controls-group">
                <button class="btn" onClick={pushStack}>Push</button>
                <button class="btn" onClick={popStack}>Pop</button>
              </div>
              <div class="controls-group">
                <button class="btn" onClick={enqueue}>Enqueue</button>
                <button class="btn" onClick={dequeue}>Dequeue</button>
              </div>
            </div>
            <div style={{ display: 'grid', 'grid-template-columns': '1fr 1fr', gap: '2rem' }}>
              <div class="canvas-container" style={{ padding: '2rem', 'min-height': '200px' }}>
                <h4 style={{ 'margin-bottom': '1rem', 'font-size': '0.85rem', color: 'var(--text-tertiary)', 'text-transform': 'uppercase', 'letter-spacing': '0.05em' }}>栈 (Stack) - LIFO</h4>
                <div style={{ display: 'flex', 'flex-direction': 'column', 'align-items': 'center', gap: '2px' }}>
                  {stack().length === 0 ? <p style={{ color: 'var(--text-secondary)' }}>空栈</p> : stack().slice().reverse().map((val) => (
                    <div style={{ padding: '0.5rem 1.5rem', background: '#1a1a1a', color: '#fff', 'font-family': 'var(--font-mono)', 'min-width': '80px', 'text-align': 'center' }}>{val}</div>
                  ))}
                </div>
              </div>
              <div class="canvas-container" style={{ padding: '2rem', 'min-height': '200px' }}>
                <h4 style={{ 'margin-bottom': '1rem', 'font-size': '0.85rem', color: 'var(--text-tertiary)', 'text-transform': 'uppercase', 'letter-spacing': '0.05em' }}>队列 (Queue) - FIFO</h4>
                <div style={{ display: 'flex', 'flex-direction': 'row', 'align-items': 'center', gap: '2px', 'flex-wrap': 'wrap' }}>
                  {queue().length === 0 ? <p style={{ color: 'var(--text-secondary)' }}>空队列</p> : queue().map((val) => (
                    <div style={{ padding: '0.5rem 1rem', background: '#1a1a1a', color: '#fff', 'font-family': 'var(--font-mono)', 'text-align': 'center' }}>{val}</div>
                  ))}
                </div>
              </div>
            </div>
            <div class="info-panel">
              <h3>栈与队列</h3>
              <div class="complexity">
                <div class="complexity-item"><div class="label">栈 (LIFO)</div><div class="value">Push/Pop O(1)</div></div>
                <div class="complexity-item"><div class="label">队列 (FIFO)</div><div class="value">Enqueue/Dequeue O(1)</div></div>
              </div>
            </div>
          </div>
        )}

        {/* ---------- BST ---------- */}
        {activeTab() === 'bst' && (
          <div>
            <div class="controls">
              <div class="controls-group">
                <label>节点值</label>
                <input type="text" value={bstInput()} onInput={e => setBstInput(e.currentTarget.value)} style={{ padding: '0.5rem', border: '1px solid var(--border)', width: '250px' }} />
              </div>
              <div class="controls-group">
                <button class="btn btn-primary" onClick={buildBST}>构建二叉搜索树</button>
              </div>
            </div>
            <div class="canvas-container" style={{ padding: '2rem', 'min-height': '300px', position: 'relative', overflow: 'auto' }}>
              {bstData ? (
                <svg width="800" height="400" viewBox="0 0 800 400">
                  {bstData.edges.map((edge) => (
                    <line x1={edge.from.x} y1={edge.from.y} x2={edge.to.x} y2={edge.to.y} stroke="#cccccc" stroke-width="1" />
                  ))}
                  {bstData.nodes.map((node) => (
                    <g>
                      <circle cx={node.x} cy={node.y} r="20" fill="#1a1a1a" />
                      <text x={node.x} y={node.y} dy="0.35em" text-anchor="middle" fill="#ffffff" font-size="12" font-family="var(--font-mono)">{node.value}</text>
                    </g>
                  ))}
                </svg>
              ) : (
                <p style={{ color: 'var(--text-secondary)', 'text-align': 'center', padding: '2rem' }}>输入逗号分隔的数字，点击"构建二叉搜索树"</p>
              )}
            </div>
            <div class="info-panel">
              <h3>二叉搜索树 (BST)</h3>
              <p>左子树所有节点值小于根节点，右子树所有节点值大于根节点。</p>
              <div class="complexity">
                <div class="complexity-item"><div class="label">查找</div><div class="value">O(log n) 平均</div></div>
                <div class="complexity-item"><div class="label">插入</div><div class="value">O(log n) 平均</div></div>
                <div class="complexity-item"><div class="label">删除</div><div class="value">O(log n) 平均</div></div>
              </div>
            </div>
          </div>
        )}

        {/* ---------- Heap ---------- */}
        {activeTab() === 'heap' && (
          <div>
            <div class="controls">
              <div class="controls-group">
                <button class="btn" onClick={addToHeap}>添加元素</button>
                <button class="btn" onClick={removeFromHeap}>移除堆顶</button>
                <button class="btn" onClick={() => setHeapArray([])}>清空</button>
              </div>
            </div>
            <div class="canvas-container" style={{ padding: '2rem', 'min-height': '200px', display: 'flex', 'align-items': 'center', 'justify-content': 'center' }}>
              <div style={{ display: 'flex', gap: '0.5rem', 'flex-wrap': 'wrap', 'align-items': 'center', 'justify-content': 'center' }}>
                {heapArray().length === 0 ? (
                  <p style={{ color: 'var(--text-secondary)' }}>点击"添加元素"向堆中添加元素</p>
                ) : (
                  heapArray().map((val, i) => (
                    <div style={{
                      width: '50px', height: '50px', 'border-radius': '50%',
                      background: i === 0 ? '#1a1a1a' : '#e5e5e5',
                      color: i === 0 ? '#fff' : '#1a1a1a',
                      display: 'flex', 'align-items': 'center', 'justify-content': 'center',
                      'font-family': 'var(--font-mono)', 'font-size': '0.85rem',
                    }}>{val}</div>
                  ))
                )}
              </div>
            </div>
            <div class="info-panel">
              <h3>堆 (Heap)</h3>
              <p>完全二叉树，父节点值大于（大顶堆）或小于（小顶堆）子节点。常用于优先队列和堆排序。</p>
              <div class="complexity">
                <div class="complexity-item"><div class="label">插入</div><div class="value">O(log n)</div></div>
                <div class="complexity-item"><div class="label">删除堆顶</div><div class="value">O(log n)</div></div>
                <div class="complexity-item"><div class="label">获取堆顶</div><div class="value">O(1)</div></div>
              </div>
            </div>
          </div>
        )}

        {/* ---------- Hash Table ---------- */}
        {activeTab() === 'hashtable' && (
          <div>
            <div class="controls">
              <div class="controls-group">
                <label>哈希表大小</label>
                <input type="number" value={hashTableSize()} onChange={e => setHashTableSize(parseInt(e.currentTarget.value) || 10)} style={{ padding: '0.5rem', border: '1px solid var(--border)', width: '60px' }} />
              </div>
              <div class="controls-group">
                <label>初始数据</label>
                <input type="text" value={hashInput()} onInput={e => setHashInput(e.currentTarget.value)} style={{ padding: '0.5rem', border: '1px solid var(--border)', width: '200px' }} />
              </div>
              <div class="controls-group">
                <input type="text" placeholder="插入值" value={arrayValue()} onInput={e => setArrayValue(e.currentTarget.value)} style={{ padding: '0.5rem', border: '1px solid var(--border)', width: '80px' }} />
                <button class="btn" onClick={hashInsert}>插入</button>
                <button class="btn btn-primary" onClick={buildHashTable}>构建哈希表</button>
              </div>
            </div>
            <div class="canvas-container" style={{ padding: '2rem', 'min-height': '200px' }}>
              <div style={{ display: 'flex', 'flex-direction': 'column', gap: '0.5rem' }}>
                {Array.from({ length: hashTableSize() }, (_, i) => {
                  const bucket = hashTable().get(i) || [];
                  return (
                    <div style={{ display: 'flex', 'align-items': 'center', gap: '0.5rem' }}>
                      <div style={{
                        width: '40px', height: '40px', display: 'flex', 'align-items': 'center', 'justify-content': 'center',
                        background: '#f5f5f5', border: '1px solid var(--border)',
                        'font-family': 'var(--font-mono)', 'font-size': '0.85rem',
                      }}>{i}</div>
                      <div style={{ display: 'flex', gap: '0.25rem', 'align-items': 'center' }}>
                        {bucket.length === 0 ? (
                          <span style={{ color: 'var(--text-tertiary)', 'font-size': '0.8rem' }}>空</span>
                        ) : (
                          bucket.map((val, idx) => (
                            <div style={{
                              padding: '0.4rem 0.75rem', background: '#1a1a1a', color: '#fff',
                              'font-family': 'var(--font-mono)', 'font-size': '0.85rem', 'border-radius': '4px',
                            }}>{val}</div>
                          ))
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div class="info-panel">
              <h3>哈希表 (Hash Table)</h3>
              <p>通过哈希函数将键映射到存储位置，实现平均 O(1) 时间复杂度的查找、插入和删除。使用链地址法处理冲突。</p>
              <div class="complexity">
                <div class="complexity-item"><div class="label">查找</div><div class="value">O(1) 平均</div></div>
                <div class="complexity-item"><div class="label">插入</div><div class="value">O(1) 平均</div></div>
                <div class="complexity-item"><div class="label">删除</div><div class="value">O(1) 平均</div></div>
              </div>
            </div>
          </div>
        )}

        {/* ---------- Union-Find ---------- */}
        {activeTab() === 'unionfind' && (
          <div>
            <div class="controls">
              <div class="controls-group">
                <label>元素数量</label>
                <input type="range" min="5" max="20" value={ufSize()} onInput={e => setUfSize(parseInt(e.currentTarget.value))} />
                <span>{ufSize()}</span>
              </div>
              <div class="controls-group">
                <button class="btn" onClick={initUF}>初始化</button>
                <button class="btn btn-primary" onClick={union}>Union</button>
              </div>
            </div>
            <div class="canvas-container" style={{ padding: '2rem', 'min-height': '200px' }}>
              {ufParent().length === 0 ? (
                <p style={{ color: 'var(--text-secondary)', 'text-align': 'center' }}>点击"初始化"创建并查集</p>
              ) : (
                <div style={{ display: 'grid', 'grid-template-columns': 'repeat(auto-fill, minmax(80px, 1fr))', gap: '1rem' }}>
                  {ufParent().map((parent, i) => (
                    <div style={{ display: 'flex', 'flex-direction': 'column', 'align-items': 'center', gap: '0.25rem' }}>
                      <div style={{
                        width: '40px', height: '40px', 'border-radius': '50%',
                        background: parent === i ? '#1a1a1a' : '#e5e5e5',
                        color: parent === i ? '#fff' : '#1a1a1a',
                        display: 'flex', 'align-items': 'center', 'justify-content': 'center',
                        'font-family': 'var(--font-mono)', 'font-size': '0.85rem',
                      }}>{i}</div>
                      <span style={{ 'font-size': '0.7rem', color: 'var(--text-tertiary)' }}>父: {parent}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div class="info-panel">
              <h3>并查集 (Union-Find)</h3>
              <p>用于处理不相交集合的合并与查询问题。支持路径压缩优化，几乎达到常数时间复杂度。</p>
              <div class="complexity">
                <div class="complexity-item"><div class="label">Union</div><div class="value">O(alpha(n))</div></div>
                <div class="complexity-item"><div class="label">Find</div><div class="value">O(alpha(n))</div></div>
                <div class="complexity-item"><div class="label">空间</div><div class="value">O(n)</div></div>
              </div>
            </div>
          </div>
        )}

        {/* ---------- Trie ---------- */}
        {activeTab() === 'trie' && (
          <div>
            <div class="controls">
              <div class="controls-group">
                <label>单词</label>
                <input type="text" value={trieWords()} onInput={e => setTrieWords(e.currentTarget.value)} style={{ padding: '0.5rem', border: '1px solid var(--border)', width: '250px' }} />
              </div>
              <div class="controls-group">
                <button class="btn btn-primary" onClick={buildTrie}>构建字典树</button>
              </div>
            </div>
            <div class="canvas-container" style={{ padding: '2rem', 'min-height': '200px' }}>
              {trieRoot() ? (
                <div>{renderTrie(trieRoot())}</div>
              ) : (
                <p style={{ color: 'var(--text-secondary)', 'text-align': 'center' }}>输入逗号分隔的单词，点击"构建字典树"</p>
              )}
            </div>
            <div class="info-panel">
              <h3>字典树 (Trie)</h3>
              <p>前缀树，用于高效存储和检索字符串集合。常用于自动补全、拼写检查等场景。</p>
              <div class="complexity">
                <div class="complexity-item"><div class="label">插入</div><div class="value">O(m)</div></div>
                <div class="complexity-item"><div class="label">查找</div><div class="value">O(m)</div></div>
                <div class="complexity-item"><div class="label">前缀匹配</div><div class="value">O(m)</div></div>
              </div>
            </div>
          </div>
        )}

        <div class="steps-panel">
          <h3>执行步骤</h3>
          <div>
            {steps().length === 0 ? (
              <div class="step-item">选择标签页并操作数据结构</div>
            ) : (
              steps().map(step => <div class="step-item active">{step}</div>)
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
