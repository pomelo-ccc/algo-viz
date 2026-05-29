import { createSignal, For, onCleanup, createEffect } from 'solid-js';

interface DropdownOption {
  label: string;
  value: string;
}

interface DropdownProps {
  options: DropdownOption[];
  value: string;
  onChange: (value: string) => void;
  class?: string;
  id?: string;
}

export default function Dropdown(props: DropdownProps) {
  const [isOpen, setIsOpen] = createSignal(false);
  let containerEl: HTMLDivElement;

  const handleClickOutside = (e: MouseEvent) => {
    if (containerEl && !containerEl.contains(e.target as Node)) {
      setIsOpen(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  createEffect(() => {
    document.addEventListener('click', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    onCleanup(() => {
      document.removeEventListener('click', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    });
  });

  const toggle = (e: MouseEvent) => {
    e.stopPropagation();
    setIsOpen(!isOpen());
  };

  const select = (value: string) => {
    props.onChange(value);
    setIsOpen(false);
  };

  const selectedLabel = () => {
    const option = props.options.find(o => o.value === props.value);
    return option ? option.label : props.value;
  };

  return (
    <div
      ref={el => { containerEl = el; }}
      class={`custom-dropdown ${props.class || ''}`}
      style={{ position: 'relative', display: 'inline-block', 'min-width': '120px' }}
    >
      <button
        type="button"
        class="dropdown-trigger"
        onClick={toggle}
        style={{
          display: 'inline-flex',
          'align-items': 'center',
          'justify-content': 'space-between',
          padding: '0.6rem 1rem',
          'font-size': '0.85rem',
          'font-weight': '400',
          color: 'var(--text-primary)',
          background: 'transparent',
          border: '1px solid var(--border)',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          width: '100%',
          gap: '0.5rem',
          'font-family': 'var(--font-sans)',
        }}
      >
        <span>{selectedLabel()}</span>
        <svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          style={{
            transform: isOpen() ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.3s ease',
            'flex-shrink': 0,
          }}
        >
          <path d="M2 4L6 8L10 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </button>
      {isOpen() && (
        <div
          class="dropdown-menu"
          style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            left: '0',
            'min-width': '100%',
            background: 'var(--bg-primary)',
            border: '1px solid var(--border)',
            'z-index': '100',
            'box-shadow': '0 4px 12px rgba(0,0,0,0.08)',
            overflow: 'hidden',
          }}
        >
          <For each={props.options}>
            {option => (
              <div
                class="dropdown-option"
                onClick={() => select(option.value)}
                style={{
                  padding: '0.6rem 1rem',
                  'font-size': '0.85rem',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s ease',
                  'white-space': 'nowrap',
                  'border-bottom': '1px solid var(--border-light)',
                  background: option.value === props.value ? 'var(--bg-secondary)' : 'var(--bg-primary)',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--bg-tertiary)';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.backgroundColor = option.value === props.value ? 'var(--bg-secondary)' : 'var(--bg-primary)';
                }}
              >
                {option.label}
              </div>
            )}
          </For>
        </div>
      )}
    </div>
  );
}
