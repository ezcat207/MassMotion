import { PlayCircle, Heart } from 'lucide-react';
import { cn, getVibeEmoji, getEndingBadge } from '../lib/utils';
import type { Drama } from '../types/drama';

interface DramaCardProps {
  drama: Drama;
  featured?: boolean;
}

export function DramaCard({ drama, featured = false }: DramaCardProps) {
  const endingBadge = getEndingBadge(drama.ending);

  return (
    <div
      className={cn(
        'bg-white rounded-[--radius-card] overflow-hidden shadow-md',
        'hover:shadow-xl transition-all duration-300',
        'border border-gray-100',
        featured && 'ring-2 ring-[--color-brand] ring-offset-4'
      )}
    >
      {/* Thumbnail */}
      <div className="relative aspect-video overflow-hidden bg-gray-100">
        <img
          src={drama.thumbnail}
          alt={drama.title}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
        />
        {/* Ending badge */}
        <div className="absolute top-3 right-3">
          <span
            className={cn(
              'px-2.5 py-1 rounded-full text-xs font-semibold',
              endingBadge.color
            )}
          >
            {endingBadge.label}
          </span>
        </div>
        {/* Play overlay */}
        <a
          href={drama.youtubeUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute inset-0 bg-black/0 hover:bg-black/20 flex items-center justify-center group transition-colors"
        >
          <PlayCircle className="w-16 h-16 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
        </a>
      </div>

      {/* Content */}
      <div className="p-5">
        {/* Title */}
        <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-2">
          {drama.title}
        </h3>
        <p className="text-sm text-gray-500 mb-3">{drama.titleChinese}</p>

        {/* Why */}
        <p className="text-sm text-gray-700 mb-4 leading-relaxed">
          "{drama.why}"
        </p>

        {/* Vibes */}
        <div className="flex flex-wrap gap-2 mb-4">
          {drama.vibes.map((vibe) => (
            <span
              key={vibe}
              className="px-2.5 py-1 bg-pink-50 text-pink-700 rounded-full text-xs font-medium"
            >
              {getVibeEmoji(vibe)}
            </span>
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex items-center gap-4 text-xs text-gray-600">
            <span>{drama.episodeCount} eps</span>
            <span>⭐ {drama.scoreV0.toFixed(1)}</span>
          </div>
          <button
            className="p-2 rounded-full hover:bg-pink-50 transition-colors group"
            title="Add to Watch Later"
          >
            <Heart className="w-5 h-5 text-gray-400 group-hover:text-pink-500 transition-colors" />
          </button>
        </div>
      </div>
    </div>
  );
}
