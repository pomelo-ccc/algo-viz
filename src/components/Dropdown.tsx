import { createSignal, For, onCleanup } from 'solid-js';

export interface DropdownOption {
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
    if (e.key === 'Escape') setIsOpen(false);
  };

  document.addEventListener('click', handleClickOutside);
  document.addEventListener('keydown', handleKeyDown);

  onCleanup(() => {
    document.removeEventListener('click', handleClickOutside);
    document.removeEventListener('keydown', handleKeyDown);
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
    >
      <button
        type="button"
        class="dropdown-trigger"
        onClick={toggle}
        aria-haspopup="listbox"
        aria-expanded={isOpen()}
      >
        <span class="dropdown-label">{selectedLabel()}</span>
        <svg
          width="10"
          height="10"
          viewBox="0 0 10 10"
          fill="none"
          class={isOpen() ? 'dropdown-arrow open' : 'dropdown-arrow'}
        >
          <path d="M1.5 3.5L5 7L8.5 3.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </button>
      {isOpen() && (
        <div class="dropdown-menu" role="listbox">
          <For each={props.options}>
            {option => (
              <div
                class={option.value === props.value ? 'dropdown-option active' : 'dropdown-option'}
                onClick={() => select(option.value)}
                role="option"
                aria-selected={option.value === props.value}
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
