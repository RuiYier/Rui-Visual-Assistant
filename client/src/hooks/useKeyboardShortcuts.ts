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
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      const isCtrlOrCmd = event.ctrlKey || event.metaKey;

      switch (event.key.toLowerCase()) {
        case 'c':
          if (!isCtrlOrCmd) onToggleCamera?.();
          break;
        case 'm':
          if (!isCtrlOrCmd) onToggleMic?.();
          break;
        case 's':
          if (!isCtrlOrCmd) onScreenshot?.();
          break;
        case 'd':
          if (!isCtrlOrCmd) onClearMessages?.();
          break;
        case ',':
          if (isCtrlOrCmd) {
            event.preventDefault();
            onToggleSettings?.();
          }
          break;
        case 'escape':
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
