import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getVibeEmoji(vibe: string): string {
  const emojiMap: Record<string, string> = {
    cry: '😭',
    sweet: '💕',
    hype: '🔥',
    laugh: '😂',
    dogblood: '🩸',
  };
  return emojiMap[vibe] || '❓';
}

export function getVibeLabel(vibe: string): string {
  const labelMap: Record<string, string> = {
    cry: 'Cry',
    sweet: 'Sweet',
    hype: 'Hype',
    laugh: 'Funny',
    dogblood: 'Dog Blood',
  };
  return labelMap[vibe] || vibe;
}

export function getEndingBadge(ending: string): { label: string; color: string } {
  switch (ending) {
    case 'HE':
      return { label: 'Happy Ending', color: 'bg-green-100 text-green-800' };
    case 'BE':
      return { label: 'Bad Ending', color: 'bg-red-100 text-red-800' };
    default:
      return { label: 'Unknown', color: 'bg-gray-100 text-gray-600' };
  }
}
