import { useState, useEffect } from 'react';
import { Flame, Heart, Laugh, Frown } from 'lucide-react';
import { cn } from '../lib/utils';
import {
  addReaction,
  getReactionCounts,
  hasUserReacted,
  isSupabaseConfigured,
  type ReactionType,
  type ReactionCounts,
} from '../lib/supabase';

interface ReactionButtonsProps {
  dramaId: string;
}

const REACTIONS = [
  { type: 'hype' as ReactionType, icon: Flame, label: 'Hype', color: 'text-orange-500' },
  { type: 'cry' as ReactionType, icon: Frown, label: 'Cry', color: 'text-blue-500' },
  { type: 'sweet' as ReactionType, icon: Heart, label: 'Sweet', color: 'text-pink-500' },
  { type: 'laugh' as ReactionType, icon: Laugh, label: 'Funny', color: 'text-yellow-500' },
];

export function ReactionButtons({ dramaId }: ReactionButtonsProps) {
  const [counts, setCounts] = useState<ReactionCounts>({ hype: 0, cry: 0, sweet: 0, laugh: 0 });
  const [userReaction, setUserReaction] = useState<ReactionType | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isSupabaseConfigured()) return;

    // Load reaction counts and user's reaction
    Promise.all([getReactionCounts(dramaId), hasUserReacted(dramaId)]).then(
      ([newCounts, reaction]) => {
        setCounts(newCounts);
        setUserReaction(reaction);
      }
    );
  }, [dramaId]);

  const handleReaction = async (type: ReactionType) => {
    if (!isSupabaseConfigured()) {
      alert('Reactions are not configured. Add Supabase credentials to .env');
      return;
    }

    if (userReaction) {
      // Already reacted
      return;
    }

    setLoading(true);
    const result = await addReaction(dramaId, type);

    if (result.success) {
      // Optimistically update UI
      setCounts((prev) => ({ ...prev, [type]: prev[type] + 1 }));
      setUserReaction(type);
    } else {
      alert(`Failed to add reaction: ${result.error}`);
    }

    setLoading(false);
  };

  if (!isSupabaseConfigured()) {
    return null; // Hide reactions if Supabase not configured
  }

  return (
    <div className="flex items-center gap-2 pt-4 border-t border-gray-100">
      {REACTIONS.map(({ type, icon: Icon, label, color }) => {
        const count = counts[type];
        const isSelected = userReaction === type;

        return (
          <button
            key={type}
            onClick={() => handleReaction(type)}
            disabled={loading || !!userReaction}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-full',
              'text-sm font-medium transition-all duration-200',
              'hover:scale-105 active:scale-95',
              isSelected
                ? 'bg-gray-900 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200',
              (loading || userReaction) && 'cursor-not-allowed opacity-60'
            )}
            title={isSelected ? 'You reacted' : label}
          >
            <Icon className={cn('w-4 h-4', isSelected && 'text-white', !isSelected && color)} />
            {count > 0 && <span className="text-xs">{count}</span>}
          </button>
        );
      })}
    </div>
  );
}
