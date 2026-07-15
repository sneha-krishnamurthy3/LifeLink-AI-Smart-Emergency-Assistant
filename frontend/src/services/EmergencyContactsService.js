import { supabase } from '../config/supabase';

const TABLE = 'emergency_contacts';

/**
 * EmergencyContactsService
 *
 * Handles CRUD operations for emergency contacts in Supabase.
 * Enforces security via Row Level Security (RLS) on Supabase.
 */

export async function getEmergencyContacts() {
  if (!supabase) {
    return { data: [], error: 'Supabase is not configured.' };
  }

  try {
    const { data, error } = await supabase
      .from(TABLE)
      .select('*')
      .order('priority', { ascending: true })
      .order('created_at', { ascending: true });

    if (error) {
      return { data: [], error: error.message };
    }
    return { data: data || [], error: null };
  } catch (err) {
    return { data: [], error: err.message || 'An unexpected error occurred.' };
  }
}

export async function addEmergencyContact(contact) {
  if (!supabase) {
    return { data: null, error: 'Supabase is not configured.' };
  }

  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return { data: null, error: 'Not authenticated.' };
    }

    const payload = {
      ...contact,
      user_id: user.id,
    };

    // Ensure id is not sent if it's new
    delete payload.id;
    delete payload.created_at;
    delete payload.updated_at;

    const { data, error } = await supabase
      .from(TABLE)
      .insert(payload)
      .select()
      .single();

    if (error) {
      // Check for unique constraint violation (duplicate phone number)
      if (error.code === '23505') {
        return { data: null, error: 'A contact with this phone number already exists.' };
      }
      return { data: null, error: error.message };
    }
    return { data, error: null };
  } catch (err) {
    return { data: null, error: err.message || 'An unexpected error occurred.' };
  }
}

export async function updateEmergencyContact(contact) {
  if (!supabase) {
    return { data: null, error: 'Supabase is not configured.' };
  }

  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return { data: null, error: 'Not authenticated.' };
    }

    const payload = {
      ...contact,
      user_id: user.id,
    };
    
    delete payload.created_at;
    delete payload.updated_at;

    const { data, error } = await supabase
      .from(TABLE)
      .update(payload)
      .eq('id', contact.id)
      .eq('user_id', user.id) // security check
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        return { data: null, error: 'A contact with this phone number already exists.' };
      }
      return { data: null, error: error.message };
    }
    return { data, error: null };
  } catch (err) {
    return { data: null, error: err.message || 'An unexpected error occurred.' };
  }
}

export async function deleteEmergencyContact(contactId) {
  if (!supabase) {
    return { error: 'Supabase is not configured.' };
  }

  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return { error: 'Not authenticated.' };
    }

    const { error } = await supabase
      .from(TABLE)
      .delete()
      .eq('id', contactId)
      .eq('user_id', user.id); // security check

    if (error) {
      return { error: error.message };
    }
    return { error: null };
  } catch (err) {
    return { error: err.message || 'An unexpected error occurred.' };
  }
}
