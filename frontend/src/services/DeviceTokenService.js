import { supabase } from '../config/supabase';

const TABLE = 'device_tokens';

/**
 * DeviceTokenService
 *
 * Saves and deletes FCM push notification device tokens in Supabase.
 * Every logged-in user can register multiple device tokens (e.g. phone, desktop).
 */

export async function registerDeviceToken(token, platform = 'web') {
  if (!supabase) {
    return { data: null, error: 'Supabase client is not initialised.' };
  }

  try {
    const { data: authData, error: userError } = await supabase.auth.getUser();

    if (userError || !authData?.user) {
      return { data: null, error: 'User is not authenticated.' };
    }

    const payload = {
      user_id: authData.user.id,
      token: token,
      platform: platform,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from(TABLE)
      .upsert(payload, { onConflict: 'user_id,token' })
      .select()
      .single();

    if (error) {
      console.error('[DeviceTokenService] Failed to upsert token:', error);
      return { data: null, error: error.message };
    }

    console.log('[DeviceTokenService] Token successfully registered.');
    return { data, error: null };
  } catch (err) {
    console.error('[DeviceTokenService] Unexpected error during token registration:', err);
    return { data: null, error: err.message || 'An unexpected error occurred.' };
  }
}

export async function deleteDeviceToken(token) {
  if (!supabase) {
    return { error: 'Supabase client is not initialised.' };
  }

  try {
    const { error } = await supabase
      .from(TABLE)
      .delete()
      .eq('token', token);

    if (error) {
      console.error('[DeviceTokenService] Failed to delete token:', error);
      return { error: error.message };
    }

    console.log('[DeviceTokenService] Token successfully deleted.');
    return { error: null };
  } catch (err) {
    console.error('[DeviceTokenService] Unexpected error during token deletion:', err);
    return { error: err.message || 'An unexpected error occurred.' };
  }
}
