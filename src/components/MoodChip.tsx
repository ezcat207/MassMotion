import { cn, getVibeEmoji, getVibeLabel } from '../lib/utils';
import type { Vibe } from '../types/drama';

interface MoodChipProps {
  vibe: Vibe;
  selected: boolean;
  onClick: () => void;
}

export function MoodChip({ vibe, selected, onClick }: MoodChipProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'px-5 py-2.5 rounded-full font-medium text-sm',
        'border-2 transition-all duration-200',
        'hover:scale-105 active:scale-95',
        selected
          ? 'bg-[--color-brand] text-white border-[--color-brand] shadow-lg'
          : 'bg-white text-gray-700 border-gray-200 hover:border-[--color-brand-light]'
      )}
    >
      <span className="mr-1.5">{getVibeEmoji(vibe)}</span>
      {getVibeLabel(vibe)}
    </button>
  );
}
