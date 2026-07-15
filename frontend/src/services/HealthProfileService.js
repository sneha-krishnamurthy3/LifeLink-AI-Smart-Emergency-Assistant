import { supabase } from '../config/supabase';

/**
 * HealthProfileService
 *
 * Business logic layer for health_profiles.
 * RLS on the database ensures each user can only read/write their own row.
 *
 * Error return shape: { data, error: string|null, errorCode: string|null }
 * errorCode values:
 *   'NOT_CONFIGURED'   – supabase client is null (env vars missing)
 *   'TABLE_NOT_FOUND'  – health_profiles table doesn't exist in DB yet
 *   'PERMISSION_DENIED'– RLS policy rejected the request
 *   'NOT_AUTHENTICATED'– no active session
 *   'NETWORK_ERROR'    – fetch failed (offline / backend down)
 *   'UNKNOWN'          – any other Supabase/PostgREST error
 */

const TABLE = 'health_profiles';

/**
 * Map raw Supabase/PostgREST error codes to our internal error types.
 */
function classifyError(error) {
  if (!error) return { errorCode: null, message: null };

  const code = error.code || '';
  const msg  = error.message || '';

  // Table/relation does not exist (PostgreSQL error 42P01)
  if (code === '42P01' || msg.includes('relation') && msg.includes('does not exist')) {
    return {
      errorCode: 'TABLE_NOT_FOUND',
      message: 'The health_profiles table has not been created yet. Please run the SQL schema in your Supabase dashboard.',
    };
  }

  // RLS / permission denied (PostgreSQL 42501 or PostgREST 403)
  if (code === '42501' || code === 'PGRST301' || msg.toLowerCase().includes('permission denied')) {
    return {
      errorCode: 'PERMISSION_DENIED',
      message: 'Permission denied. Please verify the Row Level Security policies are correctly applied in Supabase.',
    };
  }

  // JWT / auth errors
  if (code === 'PGRST302' || msg.includes('JWT') || msg.includes('invalid claim')) {
    return {
      errorCode: 'NOT_AUTHENTICATED',
      message: 'Your session has expired. Please log out and log back in.',
    };
  }

  // Network / fetch failure
  if (msg.includes('Failed to fetch') || msg.includes('NetworkError') || msg.includes('fetch')) {
    return {
      errorCode: 'NETWORK_ERROR',
      message: 'Network error. Please check your internet connection and try again.',
    };
  }

  // Generic fallback
  return {
    errorCode: 'UNKNOWN',
    message: `Unexpected error: ${msg}`,
  };
}

/**
 * Fetch the authenticated user's health profile.
 * Returns { data: null, error: null } when no profile exists yet — that is NOT an error.
 */
export async function getHealthProfile() {
  if (!supabase) {
    return {
      data: null,
      error: 'Supabase is not configured. Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file.',
      errorCode: 'NOT_CONFIGURED',
    };
  }

  try {
    const { data, error } = await supabase
      .from(TABLE)
      .select('*')
      .single();

    // PGRST116 = "no rows returned" — user simply has no profile yet, not an error
    if (error?.code === 'PGRST116') {
      return { data: null, error: null, errorCode: null };
    }

    if (error) {
      const { errorCode, message } = classifyError(error);
      return { data: null, error: message, errorCode };
    }

    return { data, error: null, errorCode: null };
  } catch (err) {
    const { errorCode, message } = classifyError(err);
    return { data: null, error: message, errorCode };
  }
}

/**
 * Create or update the user's health profile (upsert).
 * user_id is always injected from the live session — never trusted from the form.
 */
export async function saveHealthProfile(profile) {
  if (!supabase) {
    return {
      data: null,
      error: 'Supabase is not configured. Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file.',
      errorCode: 'NOT_CONFIGURED',
    };
  }

  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return {
        data: null,
        error: 'Not authenticated. Please log in again.',
        errorCode: 'NOT_AUTHENTICATED',
      };
    }

    const payload = {
      ...profile,
      user_id: user.id,
    };

    // Remove updated_at — the DB trigger handles it automatically
    delete payload.updated_at;
    delete payload.created_at;
    delete payload.id;

    const { data, error } = await supabase
      .from(TABLE)
      .upsert(payload, { onConflict: 'user_id' })
      .select()
      .single();

    if (error) {
      const { errorCode, message } = classifyError(error);
      return { data: null, error: message, errorCode };
    }

    return { data, error: null, errorCode: null };
  } catch (err) {
    const { errorCode, message } = classifyError(err);
    return { data: null, error: message, errorCode };
  }
}
