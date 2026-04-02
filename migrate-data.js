#!/usr/bin/env node
// Migrate drama data from marsdrama to MassMotion
import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Read marsdrama data
const marsdramaPath = '../marsdrama/marsdrama/src/data/dramas.json';
const marsdramaData = JSON.parse(
  readFileSync(join(__dirname, marsdramaPath), 'utf8')
);

console.log('📊 Source data:');
console.log(`  - Editor picks: ${marsdramaData.editorPicks.length}`);
console.log(`  - Free dramas: ${marsdramaData.freeDramas.length}`);

// Helper: Infer ending from tropes and genre
function inferEnding(drama) {
  const title = (drama.title + drama.titleEn + drama.titleChinese).toLowerCase();
  const tropes = drama.tropes?.join(' ').toLowerCase() || '';
  const genre = drama.genre?.toLowerCase() || '';

  // Bad ending indicators
  if (
    title.includes('revenge') ||
    title.includes('tragic') ||
    genre.includes('revenge') ||
    tropes.includes('revenge')
  ) {
    return 'BE';
  }

  // Most short dramas have happy endings (CEO romance, sweet love, etc.)
  if (
    tropes.includes('ceo') ||
    tropes.includes('romance') ||
    tropes.includes('sweet') ||
    genre.includes('romance')
  ) {
    return 'HE';
  }

  return 'unknown';
}

// Helper: Infer vibes from tropes and genre
function inferVibes(drama) {
  const tropes = drama.tropes?.join(' ').toLowerCase() || '';
  const genre = drama.genre?.toLowerCase() || '';
  const vibes = [];

  if (
    tropes.includes('sweet') ||
    tropes.includes('romance') ||
    genre.includes('romance') ||
    genre.includes('sweet')
  ) {
    vibes.push('sweet');
  }

  if (
    tropes.includes('revenge') ||
    tropes.includes('wronged') ||
    genre.includes('revenge')
  ) {
    vibes.push('hype');
  }

  if (
    genre.includes('family') ||
    tropes.includes('family') ||
    tropes.includes('melodrama')
  ) {
    vibes.push('cry');
  }

  if (tropes.includes('comedy') || genre.includes('comedy')) {
    vibes.push('laugh');
  }

  if (
    tropes.includes('dog blood') ||
    tropes.includes('dogblood') ||
    genre.includes('melodrama')
  ) {
    vibes.push('dogblood');
  }

  // Default: at least one vibe
  if (vibes.length === 0) {
    if (tropes.includes('ceo') || genre.includes('ceo')) {
      vibes.push('sweet');
    } else {
      vibes.push('hype');
    }
  }

  return vibes;
}

// Helper: Calculate scoreV0 (0-10)
function calculateScore(drama) {
  const viewCount = drama.viewCount || 0;
  const rating = drama.rating || 8.0;

  // View score: 0-5 points
  let viewScore = 0;
  if (viewCount > 10000000) viewScore = 5;
  else if (viewCount > 5000000) viewScore = 4;
  else if (viewCount > 1000000) viewScore = 3;
  else if (viewCount > 500000) viewScore = 2;
  else if (viewCount > 100000) viewScore = 1;

  // Rating score: 0-5 points (normalize from 10-point scale)
  const ratingScore = (rating / 10) * 5;

  return Math.min(10, Math.round((viewScore + ratingScore) * 10) / 10);
}

// Helper: Generate one-line recommendation
function generateWhy(drama) {
  const tropes = drama.tropes || [];
  const viewCount = drama.viewCount || 0;
  const genre = drama.genre || '';

  const tropesText = tropes.slice(0, 2).join(' + ');
  const viewsText =
    viewCount > 1000000
      ? `${Math.round(viewCount / 1000000)}M views`
      : `${Math.round(viewCount / 1000)}K views`;

  if (tropesText) {
    return `${tropesText} — ${viewsText}, ${genre.toLowerCase() || 'high engagement'}`;
  }

  return `${genre || 'Popular drama'} with ${viewsText} — compelling storyline`;
}

// Transform drama to MassMotion format
function transformDrama(drama) {
  return {
    id: drama.id,
    videoId: drama.videoId,
    title: drama.title,
    titleChinese: drama.titleChinese,
    youtubeUrl: drama.youtubeUrl,
    thumbnail: drama.thumbnail,
    episodeCount: drama.episodeCount,
    totalDurationHours: Math.round((drama.totalDuration / 60) * 10) / 10,
    ending: inferEnding(drama),
    vibes: inferVibes(drama),
    tropes: drama.tropes || [],
    scoreV0: calculateScore(drama),
    why: generateWhy(drama),
  };
}

// Process editor picks (all 18)
const editorPicks = marsdramaData.editorPicks.map(transformDrama);

console.log('\n✅ Processed editor picks:', editorPicks.length);

// Process free dramas: sort by viewCount, take top 22 (to reach 40 total)
const sortedFreeDramas = marsdramaData.freeDramas
  .filter((d) => d.viewCount && d.viewCount > 10000) // Filter low-quality
  .sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0))
  .slice(0, 22)
  .map(transformDrama);

console.log('✅ Processed free dramas:', sortedFreeDramas.length);

// Combine all dramas
const allDramas = [...editorPicks, ...sortedFreeDramas];

console.log('\n📊 Total dramas:', allDramas.length);
console.log('   - HE:', allDramas.filter((d) => d.ending === 'HE').length);
console.log('   - BE:', allDramas.filter((d) => d.ending === 'BE').length);
console.log('   - Unknown:', allDramas.filter((d) => d.ending === 'unknown').length);

// Trope definitions (keep existing + add new ones)
const tropeDefinitions = [
  {
    id: 'ceo-romance',
    name: 'CEO Romance',
    description: 'Wealthy, powerful male lead falls for ordinary female lead',
    emoji: '💼',
  },
  {
    id: 'contract-marriage',
    name: 'Contract Marriage',
    description: 'Fake relationship that turns real',
    emoji: '💍',
  },
  {
    id: 'secret-baby',
    name: 'Secret Baby',
    description: 'Hidden child brings separated lovers back together',
    emoji: '👶',
  },
  {
    id: 'blended-family',
    name: 'Blended Family',
    description: 'Step-family navigates relationships and conflicts',
    emoji: '👨‍👩‍👧‍👦',
  },
  {
    id: 'revenge',
    name: 'Revenge Plot',
    description: 'Protagonist seeks revenge against those who wronged them',
    emoji: '⚔️',
  },
  {
    id: 'cinderella-story',
    name: 'Cinderella Story',
    description: 'Poor girl meets rich man, classic rags-to-riches',
    emoji: '👗',
  },
  {
    id: 'medical-romance',
    name: 'Medical Romance',
    description: 'Doctor/hospital setting romance',
    emoji: '⚕️',
  },
  {
    id: 'wronged-woman',
    name: 'Wronged Woman',
    description: 'Female lead falsely accused, seeks vindication',
    emoji: '⚖️',
  },
];

// Output
const output = {
  dramas: allDramas,
  tropes: tropeDefinitions,
};

// Write to MassMotion data file
const outputPath = join(__dirname, 'src/data/dramas.json');
writeFileSync(outputPath, JSON.stringify(output, null, 2));

console.log('\n✅ Data migrated successfully!');
console.log(`   Output: ${outputPath}`);
console.log('\n🎯 Next steps:');
console.log('   1. Review data: cat src/data/dramas.json | jq ".dramas | length"');
console.log('   2. Test locally: npm run dev');
console.log('   3. Deploy: git add . && git commit -m "data: migrate 40 dramas" && git push');
