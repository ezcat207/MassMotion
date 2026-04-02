/**
 * Watch Later functionality using localStorage
 * No backend required - pure client-side storage
 */

const STORAGE_KEY = 'massmotion_watch_later';

export function getWatchLater(): string[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function addToWatchLater(dramaId: string): boolean {
  try {
    const current = getWatchLater();
    if (current.includes(dramaId)) {
      return false; // Already in list
    }
    const updated = [...current, dramaId];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return true;
  } catch {
    return false;
  }
}

export function removeFromWatchLater(dramaId: string): boolean {
  try {
    const current = getWatchLater();
    const updated = current.filter(id => id !== dramaId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return true;
  } catch {
    return false;
  }
}

export function isInWatchLater(dramaId: string): boolean {
  return getWatchLater().includes(dramaId);
}

export function toggleWatchLater(dramaId: string): boolean {
  if (isInWatchLater(dramaId)) {
    removeFromWatchLater(dramaId);
    return false;
  } else {
    addToWatchLater(dramaId);
    return true;
  }
}
