import { createSignal, Show } from 'solid-js';
import {
  sortingCodes, searchingCodes, graphCodes,
  dpCodes, pathfindingCodes, backtrackingCodes,
  greedyCodes, divideConquerCodes,
  type Language
} from '../utils/codeData';

const codeMap: Record<string, Record<string, any>> = {
  sorting: sortingCodes,
  searching: searchingCodes,
  graph: graphCodes,
  dp: dpCodes,
  pathfinding: pathfindingCodes,
  backtracking: backtrackingCodes,
  greedy: greedyCodes,
  divideConquer: divideConquerCodes,
};

interface CodePanelProps {
  category: string;
  algorithm: string;
}

export default function CodePanel(props: CodePanelProps) {
  const [lang, setLang] = createSignal<Language>('javascript');

  const codeContent = () => {
    const catCodes = codeMap[props.category];
    if (!catCodes) {
      return `// ${props.algorithm} 代码数据待添加
// 当前分类: ${props.category}`;
    }
    const algoCode = catCodes[props.algorithm];
    if (!algoCode) {
      return `// ${props.algorithm} 算法代码待添加`;
    }
    return algoCode[lang()] || `// ${lang()} 版本待添加`;
  };

  const availableLanguages: Language[] = ['javascript', 'typescript', 'python', 'cpp', 'java'];

  return (
    <Show when={codeMap[props.category]?.[props.algorithm]}>
      <div class="info-panel">
        <h3>算法代码</h3>
        <div style={{ 'margin-bottom': '0.75rem' }}>
          <select
            value={lang()}
            onChange={(e) => setLang(e.currentTarget.value as Language)}
            style={{
              padding: '0.4rem 0.75rem',
              border: '1px solid var(--border)',
              background: '#fff',
              'font-family': 'var(--font-mono)',
              'font-size': '0.8rem',
              cursor: 'pointer',
            }}
          >
            {availableLanguages.map(l => (
              <option value={l}>{l.charAt(0).toUpperCase() + l.slice(1)}</option>
            ))}
          </select>
        </div>
        <pre style={{
          background: '#f5f5f5',
          padding: '1rem',
          'border-radius': '4px',
          'overflow-x': 'auto',
          'font-family': 'var(--font-mono)',
          'font-size': '0.8rem',
          'line-height': '1.5',
          'max-height': '400px',
          overflow: 'auto',
        }}>
          <code>{codeContent()}</code>
        </pre>
      </div>
    </Show>
  );
}
