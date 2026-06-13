import { useEffect, useCallback } from 'react';

interface KeyboardShortcuts {
  onToggleCamera?: () => void;
  onToggleMic?: () => void;
  onScreenshot?: () => void;
  onClearMessages?: () => void;
  onToggleSettings?: () => void;
}

export function useKeyboardShortcuts({
  onToggleCamera,
  onToggleMic,
  onScreenshot,
  onClearMessages,
  onToggleSettings,
}: KeyboardShortcuts) {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      // 忽略输入框中的快捷键
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      // Ctrl/Cmd + 组合键
      const isCtrlOrCmd = event.ctrlKey || event.metaKey;

      switch (event.key.toLowerCase()) {
        case 'c':
          if (isCtrlOrCmd) return; // 不拦截复制
          onToggleCamera?.();
          break;
        case 'm':
          if (isCtrlOrCmd) return; // 不拦截最小化
          onToggleMic?.();
          break;
        case 's':
          if (isCtrlOrCmd) return; // 不拦截保存
          onScreenshot?.();
          break;
        case 'd':
          if (isCtrlOrCmd) return; // 不拦截书签
          onClearMessages?.();
          break;
        case ',':
          if (isCtrlOrCmd) {
            event.preventDefault();
            onToggleSettings?.();
          }
          break;
        case 'escape':
          // ESC 关闭设置面板
          onToggleSettings?.();
          break;
      }
    },
    [onToggleCamera, onToggleMic, onScreenshot, onClearMessages, onToggleSettings]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}
