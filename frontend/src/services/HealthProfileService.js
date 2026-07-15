import { supabase } from '../config/supabase';

/**
 * HealthProfileService
 *
 * Business logic layer for health_profiles.
 * RLS on the database ensures each user can only read/write their own row.
 *
 * Every function returns: { data, error: string|null, errorCode: string|null }
 *
 * errorCode values:
 *   'NOT_CONFIGURED'    – supabase client is null (env vars missing)
 *   'TABLE_NOT_FOUND'   – health_profiles table does not exist yet
 *   'PERMISSION_DENIED' – RLS policy rejected the request
 *   'NOT_AUTHENTICATED' – no active session / JWT expired
 *   'NETWORK_ERROR'     – fetch failed (offline / Supabase unreachable)
 *   'NO_PROFILE'        – table exists, user simply has no profile yet (not an error)
 *   'UNKNOWN'           – any other error
 */

const TABLE = 'health_profiles';

// ── Error classifier ─────────────────────────────────────────────────────────
function classifyError(error) {
  if (!error) return { errorCode: null, message: null };

  const code = error.code   || '';
  const msg  = (error.message || '').toLowerCase();

  // Table does not exist — PostgreSQL 42P01 or PostgREST PGRST204
  if (
    code === '42P01'   ||
    code === 'PGRST204' ||
    msg.includes('relation') && msg.includes('does not exist') ||
    msg.includes('table') && msg.includes('does not exist') ||
    msg.includes('could not find the table')
  ) {
    return {
      errorCode: 'TABLE_NOT_FOUND',
      message: 'The health_profiles table does not exist. Run the SQL migration in Supabase Dashboard → SQL Editor.',
    };
  }

  // RLS / permission denied
  if (code === '42501' || code === 'PGRST301' || msg.includes('permission denied') || msg.includes('rls')) {
    return {
      errorCode: 'PERMISSION_DENIED',
      message: 'Row Level Security denied the request. Verify the RLS policies are applied in Supabase.',
    };
  }

  // JWT / auth expired
  if (code === 'PGRST302' || msg.includes('jwt') || msg.includes('invalid claim') || msg.includes('token')) {
    return {
      errorCode: 'NOT_AUTHENTICATED',
      message: 'Your session has expired. Please log out and log back in.',
    };
  }

  // Network failure
  if (msg.includes('failed to fetch') || msg.includes('networkerror') || msg.includes('network')) {
    return {
      errorCode: 'NETWORK_ERROR',
      message: 'Network error. Check your internet connection and try again.',
    };
  }

  return {
    errorCode: 'UNKNOWN',
    message: error.message || 'An unexpected error occurred.',
  };
}

// ── getHealthProfile ─────────────────────────────────────────────────────────
/**
 * Fetch the authenticated user's health profile.
 *
 * Returns:
 *   { data: profileObject, error: null, errorCode: null }       – profile found
 *   { data: null, error: null, errorCode: 'NO_PROFILE' }        – no profile yet (not an error)
 *   { data: null, error: message, errorCode: 'TABLE_NOT_FOUND'} – table missing
 *   … etc.
 */
export async function getHealthProfile() {
  if (!supabase) {
    return {
      data: null,
      error: 'Supabase is not initialised. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file.',
      errorCode: 'NOT_CONFIGURED',
    };
  }

  try {
    const { data, error } = await supabase
      .from(TABLE)
      .select('*')
      .maybeSingle();           // maybeSingle() returns null (not an error) when no rows exist

    if (error) {
      const classified = classifyError(error);
      return { data: null, error: classified.message, errorCode: classified.errorCode };
    }

    if (!data) {
      // Table exists but this user has no profile row yet — normal first-visit state
      return { data: null, error: null, errorCode: 'NO_PROFILE' };
    }

    return { data, error: null, errorCode: null };
  } catch (err) {
    const classified = classifyError(err);
    return { data: null, error: classified.message, errorCode: classified.errorCode };
  }
}

// ── saveHealthProfile ────────────────────────────────────────────────────────
/**
 * Create or update the user's health profile (upsert on user_id).
 * user_id is always injected from the live Supabase session — never from form data.
 */
export async function saveHealthProfile(profile) {
  if (!supabase) {
    return {
      data: null,
      error: 'Supabase is not initialised. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file.',
      errorCode: 'NOT_CONFIGURED',
    };
  }

  try {
    const { data: authData, error: userError } = await supabase.auth.getUser();

    if (userError || !authData?.user) {
      return {
        data: null,
        error: 'Not authenticated. Please log in again.',
        errorCode: 'NOT_AUTHENTICATED',
      };
    }

    // Build payload — strip fields managed by the database
    const payload = { ...profile };
    delete payload.id;
    delete payload.created_at;
    delete payload.updated_at;
    payload.user_id = authData.user.id;   // always overwrite with real session user_id

    const { data, error } = await supabase
      .from(TABLE)
      .upsert(payload, { onConflict: 'user_id' })
      .select()
      .single();

    if (error) {
      const classified = classifyError(error);
      return { data: null, error: classified.message, errorCode: classified.errorCode };
    }

    return { data, error: null, errorCode: null };
  } catch (err) {
    const classified = classifyError(err);
    return { data: null, error: classified.message, errorCode: classified.errorCode };
  }
}
