import { createSignal, Show } from 'solid-js';
import './ControlPanel.css';

export interface ControlPanelProps {
  isRunning: boolean;
  speed: number;
  currentStep: number;
  totalSteps: number;
  onPlay: () => void;
  onPause: () => void;
  onReset: () => void;
  onStepForward: () => void;
  onStepBackward: () => void;
  onSpeedChange: (speed: number) => void;
  onGenerate: () => void;
}

export default function ControlPanel(props: ControlPanelProps) {
  const progress = () => {
    if (props.totalSteps === 0) return 0;
    return Math.round((props.currentStep / props.totalSteps) * 100);
  };

  const formatStep = () => {
    if (props.currentStep < 0) return '就绪';
    return `${props.currentStep + 1} / ${props.totalSteps}`;
  };

  return (
    <div class="control-panel">
      <div class="control-panel-inner">
        <div class="control-buttons">
          <button
            class="control-btn"
            onClick={props.onStepBackward}
            disabled={props.currentStep <= 0}
            title="上一步 (←)"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M6 6h2v12H6V6zm3.5 6l8.5 6V6l-8.5 6z"/>
            </svg>
          </button>

          <Show
            when={props.isRunning}
            fallback={
              <button
                class="control-btn control-btn-primary"
                onClick={props.onPlay}
                disabled={props.currentStep >= props.totalSteps - 1 && props.totalSteps > 0}
                title="播放 (Space)"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5v14l11-7L8 5z"/>
                </svg>
              </button>
            }
          >
            <button
              class="control-btn control-btn-primary"
              onClick={props.onPause}
              title="暂停 (Space)"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
              </svg>
            </button>
          </Show>

          <button
            class="control-btn"
            onClick={props.onStepForward}
            disabled={props.currentStep >= props.totalSteps - 1}
            title="下一步 (→)"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M6 18l8.5-6L6 6v12zm10-12v12h2V6h-2z"/>
            </svg>
          </button>
        </div>

        <div class="control-progress">
          <div class="progress-bar">
            <div
              class="progress-fill"
              style={{ width: `${progress()}%` }}
            />
          </div>
          <span class="progress-text">{formatStep()}</span>
        </div>

        <div class="control-speed">
          <label>速度</label>
          <input
            type="range"
            min="1"
            max="100"
            value={props.speed}
            onInput={(e) => props.onSpeedChange(parseInt(e.currentTarget.value))}
          />
        </div>

        <div class="control-actions">
          <button class="control-btn" onClick={props.onReset} title="重置 (R)">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.65 6.35A7.958 7.958 0 0012 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08A5.99 5.99 0 0112 18c-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/>
            </svg>
          </button>
          <button class="control-btn" onClick={props.onGenerate} title="生成新数据">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 8l-4 4h3c0 3.31-2.69 6-6 6-1.01 0-1.97-.25-2.8-.7l-1.46 1.46C8.97 19.54 10.43 20 12 20c4.42 0 8-3.58 8-8h3l-4-4zM6 12c0-3.31 2.69-6 6-6 1.01 0 1.97.25 2.8.7l1.46-1.46C15.03 4.46 13.57 4 12 4c-4.42 0-8 3.58-8 8H1l4 4 4-4H6z"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
