import { supabase } from '../config/supabase';

/**
 * HealthProfileService
 *
 * Business logic layer for health_profiles.
 * Interacts with Supabase — RLS on the database ensures each
 * user can only read/write their own row.
 */

const TABLE = 'health_profiles';

/**
 * Fetch the authenticated user's health profile.
 * Returns null if no profile exists yet.
 */
export async function getHealthProfile() {
  if (!supabase) return { data: null, error: 'Supabase not configured.' };

  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .single();

  if (error?.code === 'PGRST116') {
    // PostgREST "no rows found" — not an error, profile just doesn't exist yet
    return { data: null, error: null };
  }

  if (error) return { data: null, error: error.message };
  return { data, error: null };
}

/**
 * Create or update the user's health profile (upsert).
 * The user_id is injected here from the current auth session.
 */
export async function saveHealthProfile(profile) {
  if (!supabase) return { data: null, error: 'Supabase not configured.' };

  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) return { data: null, error: 'Not authenticated.' };

  const payload = {
    ...profile,
    user_id: user.id,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from(TABLE)
    .upsert(payload, { onConflict: 'user_id' })
    .select()
    .single();

  if (error) return { data: null, error: error.message };
  return { data, error: null };
}
