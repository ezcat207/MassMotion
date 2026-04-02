import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️ Supabase credentials missing. Reactions will not work.');
  console.warn('Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env file');
}

export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Check if Supabase is configured
export const isSupabaseConfigured = () => !!supabase;

// Get or create session ID (cookie-based fingerprint)
export function getSessionId(): string {
  const COOKIE_NAME = 'massmotion_session';
  const existing = document.cookie
    .split('; ')
    .find(row => row.startsWith(COOKIE_NAME + '='));

  if (existing) {
    return existing.split('=')[1];
  }

  // Generate new session ID
  const sessionId = crypto.randomUUID();
  // Set cookie for 365 days
  document.cookie = `${COOKIE_NAME}=${sessionId}; max-age=${365 * 24 * 60 * 60}; path=/; SameSite=Lax`;
  return sessionId;
}

export interface ReactionCounts {
  hype: number;
  cry: number;
  sweet: number;
  laugh: number;
}

export type ReactionType = keyof ReactionCounts;

// Add a reaction (idempotent - won't duplicate if already reacted)
export async function addReaction(
  dramaId: string,
  reactionType: ReactionType
): Promise<{ success: boolean; error?: string }> {
  if (!supabase) {
    return { success: false, error: 'Supabase not configured' };
  }

  const sessionId = getSessionId();

  const { error } = await supabase
    .from('reactions')
    .insert({
      drama_id: dramaId,
      reaction_type: reactionType,
      session_id: sessionId,
    });

  if (error) {
    // Unique constraint violation means already reacted - treat as success
    if (error.code === '23505') {
      return { success: true };
    }
    console.error('Failed to add reaction:', error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

// Get reaction counts for a drama
export async function getReactionCounts(dramaId: string): Promise<ReactionCounts> {
  if (!supabase) {
    return { hype: 0, cry: 0, sweet: 0, laugh: 0 };
  }

  const { data, error } = await supabase
    .from('reactions')
    .select('reaction_type')
    .eq('drama_id', dramaId);

  if (error) {
    console.error('Failed to get reactions:', error);
    return { hype: 0, cry: 0, sweet: 0, laugh: 0 };
  }

  // Count reactions
  const counts: ReactionCounts = { hype: 0, cry: 0, sweet: 0, laugh: 0 };
  data.forEach((row) => {
    if (row.reaction_type in counts) {
      counts[row.reaction_type as ReactionType]++;
    }
  });

  return counts;
}

// Check if user has already reacted to a drama
export async function hasUserReacted(dramaId: string): Promise<ReactionType | null> {
  if (!supabase) return null;

  const sessionId = getSessionId();

  const { data, error } = await supabase
    .from('reactions')
    .select('reaction_type')
    .eq('drama_id', dramaId)
    .eq('session_id', sessionId)
    .single();

  if (error || !data) return null;

  return data.reaction_type as ReactionType;
}
