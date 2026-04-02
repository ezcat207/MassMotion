#!/usr/bin/env node
// Migrate drama data: ONLY Editor Picks from marsdrama + selected from youtubeshortsdata
import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Read marsdrama Editor Picks
const marsdramaPath = '../marsdrama/marsdrama/src/data/dramas.json';
const marsdramaData = JSON.parse(
  readFileSync(join(__dirname, marsdramaPath), 'utf8')
);

// Read youtubeshortsdata channels
const youtubeDataPath = '/Volumes/Lexar/oneweekoneproject/myshortslist/youtubeshortsdata';

console.log('📊 Source data:');
console.log(`  - Marsdrama Editor Picks: ${marsdramaData.editorPicks.length}`);

// Helper: Infer ending from tropes and genre
function inferEnding(drama) {
  const title = (drama.title + (drama.titleEn || '') + drama.titleChinese).toLowerCase();
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

// Transform marsdrama Editor Pick to MassMotion format
function transformMarsdrama(drama) {
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

// Transform youtubeshortsdata video to MassMotion format
function transformYoutubeData(video) {
  // Extract title (remove hashtags and extra metadata)
  let cleanTitle = video.title;

  // Extract from 《》 if present (this is the actual drama name)
  const dramaNameMatch = cleanTitle.match(/《([^》]+)》/);
  if (dramaNameMatch) {
    cleanTitle = dramaNameMatch[1];
  } else {
    // Otherwise clean up the title
    cleanTitle = cleanTitle
      .replace(/#[^\s]+/g, '') // Remove hashtags
      .replace(/\[MULTI SUB\]/gi, '')
      .replace(/【[^】]+】/g, '') // Remove 【】 brackets
      .replace(/「([^」]+)」/g, '$1') // Extract content from 「」
      .replace(/\|.*?[剧場].*?\|/gi, '') // Remove | channel |
      .replace(/第\d+~\d+集/g, '') // Remove episode numbers
      .replace(/\([^)]+\)/g, '') // Remove () parentheses
      .split('|')[0] // Take first part before |
      .split('？')[0] // Take first part before ？
      .split('！')[0] // Take first part before ！
      .replace(/\s+/g, ' ') // Normalize spaces
      .trim();
  }

  // Fallback: use first 30 chars if still looks messy
  if (!cleanTitle || cleanTitle.length < 2) {
    cleanTitle = video.title.slice(0, 30).replace(/#[^\s]+/g, '').trim();
  }

  // Final cleanup
  cleanTitle = cleanTitle
    .replace(/\[MULTI SUB\]/gi, '')
    .replace(/【完整版】/g, '')
    .replace(/（高清全集）/g, '')
    .replace(/^\|\s*/, '') // Remove leading |
    .replace(/\s+/g, ' ')
    .trim();

  if (cleanTitle.length > 50) {
    cleanTitle = cleanTitle.slice(0, 50).trim() + '...';
  }

  // Infer genre from title/description
  let genre = 'Romance';
  const text = (video.title + video.description).toLowerCase();
  if (text.includes('霸总') || text.includes('ceo')) genre = 'CEO Romance';
  if (text.includes('穿越') || text.includes('time travel')) genre = 'Time Travel';
  if (text.includes('重生') || text.includes('rebirth')) genre = 'Rebirth';
  if (text.includes('复仇') || text.includes('revenge')) genre = 'Revenge';
  if (text.includes('医生') || text.includes('doctor')) genre = 'Medical Romance';

  // Infer tropes
  const tropes = [];
  if (text.includes('ceo') || text.includes('霸总')) tropes.push('CEO Romance');
  if (text.includes('contract') || text.includes('契约')) tropes.push('Contract Marriage');
  if (text.includes('baby') || text.includes('萌宝')) tropes.push('Secret Baby');
  if (text.includes('revenge') || text.includes('复仇')) tropes.push('Revenge Plot');
  if (text.includes('cinderella') || text.includes('灰姑娘')) tropes.push('Cinderella Story');
  if (tropes.length === 0) tropes.push('Sweet Romance');

  // Calculate episodes (assume 8 min per episode)
  const episodeCount = Math.max(1, Math.round(video.duration / (8 * 60)));

  const drama = {
    videoId: video.videoId,
    title: cleanTitle,
    titleChinese: cleanTitle,
    youtubeUrl: video.url,
    thumbnail: `https://i.ytimg.com/vi/${video.videoId}/maxresdefault.jpg`,
    episodeCount,
    totalDuration: Math.round(video.duration / 60), // Convert seconds to minutes
    viewCount: video.viewCount,
    genre,
    tropes,
    rating: 8.0, // Default rating
  };

  return {
    id: video.videoId,
    videoId: video.videoId,
    title: cleanTitle,
    titleChinese: cleanTitle,
    youtubeUrl: video.url,
    thumbnail: `https://i.ytimg.com/vi/${video.videoId}/maxresdefault.jpg`,
    episodeCount,
    totalDurationHours: Math.round((video.duration / 3600) * 10) / 10,
    ending: inferEnding(drama),
    vibes: inferVibes(drama),
    tropes,
    scoreV0: calculateScore(drama),
    why: generateWhy(drama),
  };
}

// Process Editor Picks (all 22)
const editorPicks = marsdramaData.editorPicks.map(transformMarsdrama);

console.log('✅ Processed Editor Picks:', editorPicks.length);

// Read selected youtubeshortsdata channels
const selectedChannels = [
  'niuniuduanju',
  'tinghuadrama',
  'shengshidrama',
  'sweet-dream-drama',
];

let youtubeVideos = [];
for (const channel of selectedChannels) {
  const jsonPath = join(youtubeDataPath, channel, `${channel}-videos-by-views.json`);
  try {
    const videos = JSON.parse(readFileSync(jsonPath, 'utf8'));
    console.log(`  - ${channel}: ${videos.length} videos available`);
    youtubeVideos.push(...videos);
  } catch (err) {
    console.log(`  - ${channel}: file not found, skipping`);
  }
}

// Sort by viewCount and take top 18 to reach ~40 total
const selectedYoutube = youtubeVideos
  .filter((v) => v.viewCount > 500000 && v.duration > 3000) // Min quality filter
  .sort((a, b) => b.viewCount - a.viewCount)
  .slice(0, 18)
  .map(transformYoutubeData);

console.log('✅ Processed YouTube dramas:', selectedYoutube.length);

// Combine all dramas
const allDramas = [...editorPicks, ...selectedYoutube];

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
console.log('   3. Deploy: git add . && git commit -m "data: fix drama sources (Editor Picks + youtubeshortsdata)" && git push');
