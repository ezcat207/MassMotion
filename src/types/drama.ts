/**
 * Core data types for MassMotion
 * Based on emotion-first short drama discovery design
 */

export type Ending = 'HE' | 'BE' | 'unknown';
export type Vibe = 'cry' | 'sweet' | 'hype' | 'laugh' | 'dogblood';

export interface Drama {
  // Core identifiers
  id: string;                    // YouTube playlist or video ID
  videoId: string;               // Primary video ID for embedding

  // Title & metadata
  title: string;                 // English title
  titleChinese: string;          // Chinese title
  youtubeUrl: string;            // Full YouTube URL
  thumbnail: string;             // Thumbnail image URL

  // Drama info
  episodeCount: number;          // Number of episodes
  totalDurationHours: number;    // Total runtime in hours

  // Core discovery features
  ending: Ending;                // HE (happy) / BE (bad) / unknown
  vibes: Vibe[];                 // Emotion tags (cry, sweet, hype, laugh, dogblood)
  tropes: string[];              // Genre/trope tags (CEO, fake-dating, etc.)
  warnings?: string[];           // Content warnings (optional)

  // Quality & recommendation
  scoreV0: number;               // 0-10 curator-assigned quality score
  why: string;                   // One-line recommendation reason

  // Social signals (populated from Supabase)
  reactions?: {
    hype: number;
    cry: number;
    sweet: number;
    laugh: number;
  };
}

export interface DramaData {
  dramas: Drama[];
  tropes: TropeDefinition[];
}

export interface TropeDefinition {
  id: string;
  name: string;
  description: string;
  emoji: string;
}
