import { createSignal, For } from 'solid-js';

interface CodePanelProps {
  category: string;
  algorithm: string;
}

export default function CodePanel(props: CodePanelProps) {
  const [lang, setLang] = createSignal('javascript');

  const codeContent = () => {
    // Placeholder - would fetch from codeData based on category/algorithm/lang
    return `// ${props.algorithm} in ${lang()}
// Select a language to view the code`;
  };

  return (
    <div class="code-panel">
      <div class="code-panel-header">
        <h3>算法代码</h3>
        <select class="code-lang-select" value={lang()} onChange={(e) => setLang(e.currentTarget.value)}>
          <option value="javascript">JavaScript</option>
          <option value="typescript">TypeScript</option>
          <option value="python">Python</option>
          <option value="cpp">C++</option>
          <option value="java">Java</option>
        </select>
      </div>
      <pre class="code-block"><code>{codeContent()}</code></pre>
    </div>
  );
}
