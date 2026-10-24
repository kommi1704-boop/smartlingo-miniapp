import { useEffect } from 'react';
import { loadVoices, speak, ttsAvailable } from '../lib/tts';
import { Icon } from './Icon';
import { cx } from '../lib/utils';

/** Reads English text aloud with the device voice (the voice/speed are chosen in Settings). Hidden when the device has no speech synthesis. */
export function SpeakButton({ text, className, label = 'Talaffuzni tinglash', rate }: { text: string; className?: string; label?: string; rate?: number }) {
  useEffect(() => {
    void loadVoices();
  }, []);
  if (!ttsAvailable()) return null;
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        speak(text, rate ? { rate } : {});
      }}
      aria-label={label}
      title={label}
      className={cx('flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600 hover:bg-indigo-200 dark:bg-indigo-500/20 dark:text-indigo-300', className)}
    >
      <Icon name="volume" className="h-4 w-4" />
    </button>
  );
}
