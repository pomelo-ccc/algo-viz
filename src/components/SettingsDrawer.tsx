import { Show, onCleanup, onMount, type JSX } from 'solid-js';

interface SettingsDrawerProps {
  open: boolean;
  title: string;
  description?: string;
  onClose: () => void;
  children: JSX.Element;
}

export default function SettingsDrawer(props: SettingsDrawerProps) {
  onMount(() => {
    const handleKeydown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && props.open) {
        props.onClose();
      }
    };

    document.addEventListener('keydown', handleKeydown);
    onCleanup(() => document.removeEventListener('keydown', handleKeydown));
  });

  return (
    <Show when={props.open}>
      <div class="settings-drawer-root" aria-hidden={!props.open}>
        <button class="settings-drawer-backdrop" type="button" aria-label="关闭设置抽屉" onClick={props.onClose} />
        <aside class="settings-drawer" role="dialog" aria-modal="true" aria-labelledby="settings-drawer-title">
          <div class="settings-drawer-header">
            <div>
              <h2 id="settings-drawer-title">{props.title}</h2>
              <Show when={props.description}>
                <p>{props.description}</p>
              </Show>
            </div>
            <button class="settings-drawer-close" type="button" onClick={props.onClose} aria-label="关闭">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round">
                <path d="M6 6l12 12" />
                <path d="M18 6L6 18" />
              </svg>
            </button>
          </div>
          <div class="settings-drawer-body">{props.children}</div>
        </aside>
      </div>
    </Show>
  );
}
