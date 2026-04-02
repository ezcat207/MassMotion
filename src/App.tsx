import { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { MoodChip } from './components/MoodChip';
import { DramaCard } from './components/DramaCard';
import type { Drama, Vibe } from './types/drama';
import { dramaData } from './data';

const VIBES: Vibe[] = ['cry', 'sweet', 'hype', 'laugh', 'dogblood'];

function App() {
  const [selectedVibes, setSelectedVibes] = useState<Vibe[]>([]);
  const [recommendations, setRecommendations] = useState<Drama[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  const toggleVibe = (vibe: Vibe) => {
    setSelectedVibes((prev) =>
      prev.includes(vibe)
        ? prev.filter((v) => v !== vibe)
        : [...prev, vibe]
    );
  };

  const getRecommendations = () => {
    setHasSearched(true);

    if (selectedVibes.length === 0) {
      // No filters: show top 3 by score
      const sorted = [...dramaData.dramas].sort((a, b) => b.scoreV0 - a.scoreV0);
      setRecommendations(sorted.slice(0, 3));
      return;
    }

    // Filter by vibes: drama must have at least one selected vibe
    const filtered = dramaData.dramas.filter((drama) =>
      drama.vibes.some((vibe) => selectedVibes.includes(vibe))
    );

    if (filtered.length === 0) {
      // No exact match: show top 3 by score
      const sorted = [...dramaData.dramas].sort((a, b) => b.scoreV0 - a.scoreV0);
      setRecommendations(sorted.slice(0, 3));
      return;
    }

    // Sort by score and return top 3
    const sorted = filtered.sort((a, b) => b.scoreV0 - a.scoreV0);
    setRecommendations(sorted.slice(0, 3));
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="py-12 px-6 text-center">
        <h1 className="text-5xl font-bold text-gray-900 mb-3">
          Mass<span className="text-[--color-brand]">Motion</span>
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Find your next binge-worthy Chinese short drama in 60 seconds.
          <br />
          Emotion-first discovery for free YouTube content.
        </p>
      </header>

      {/* Mood Selection */}
      <section className="max-w-4xl mx-auto px-6 mb-12">
        <h2 className="text-2xl font-semibold text-gray-900 mb-6 text-center">
          What mood are you in?
        </h2>
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          {VIBES.map((vibe) => (
            <MoodChip
              key={vibe}
              vibe={vibe}
              selected={selectedVibes.includes(vibe)}
              onClick={() => toggleVibe(vibe)}
            />
          ))}
        </div>

        {/* CTA Button */}
        <div className="text-center">
          <button
            onClick={getRecommendations}
            className="px-8 py-4 bg-[--color-brand] text-white font-semibold rounded-full
                     hover:bg-[--color-brand-dark] transition-all duration-200
                     shadow-lg hover:shadow-xl active:scale-95
                     flex items-center gap-2 mx-auto"
          >
            <Sparkles className="w-5 h-5" />
            Get me something good
          </button>
        </div>
      </section>

      {/* Recommendations */}
      {hasSearched && (
        <section className="max-w-6xl mx-auto px-6 pb-16">
          {recommendations.length > 0 ? (
            <>
              <h2 className="text-2xl font-semibold text-gray-900 mb-2 text-center">
                {selectedVibes.length === 0
                  ? 'Top picks for you'
                  : recommendations.some((d) =>
                      d.vibes.some((v) => selectedVibes.includes(v))
                    )
                  ? 'Perfect matches'
                  : 'No exact match — here are the highest-rated ones'}
              </h2>
              <p className="text-gray-600 text-center mb-8">
                {recommendations.length === 1
                  ? '1 recommendation'
                  : `${recommendations.length} recommendations`}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {recommendations.map((drama, index) => (
                  <DramaCard
                    key={drama.id}
                    drama={drama}
                    featured={index === 0}
                  />
                ))}
              </div>
            </>
          ) : (
            <div className="text-center text-gray-600">
              <p>No dramas found. Try adjusting your mood selection.</p>
            </div>
          )}
        </section>
      )}

      {/* Footer */}
      <footer className="py-8 text-center text-sm text-gray-500 border-t border-gray-200">
        <p>
          MassMotion — Emotion-first short drama discovery
          <br />
          All content is free on YouTube
        </p>
      </footer>
    </div>
  );
}

export default App;
