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

      switch (event.key.toLowerCase()) {
        case 'c':
          onToggleCamera?.();
          break;
        case 'm':
          onToggleMic?.();
          break;
        case 's':
          onScreenshot?.();
          break;
        case 'd':
          onClearMessages?.();
          break;
        case 'p':
          onToggleSettings?.();
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
