import { supabase } from '../config/supabase';

/**
 * AuthRepository
 * 
 * Strictly handles data access for Authentication via Supabase.
 * No business logic should reside here.
 */
class AuthRepository {
  /**
   * Register a new user with email and password
   */
  async signUp(email, password) {
    if (!supabase) throw new Error("Supabase client is not initialized.");
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    
    if (error) throw error;
    return data;
  }

  /**
   * Log in an existing user
   */
  async signIn(email, password) {
    if (!supabase) throw new Error("Supabase client is not initialized.");
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) throw error;
    return data;
  }

  /**
   * Log out the current user
   */
  async signOut() {
    if (!supabase) return;
    
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }

  /**
   * Get the current session
   */
  async getSession() {
    if (!supabase) return { session: null };
    
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return data;
  }

  /**
   * Subscribe to auth state changes (e.g., token refreshes, logouts)
   */
  onAuthStateChange(callback) {
    if (!supabase) return { data: { subscription: { unsubscribe: () => {} } } };
    
    return supabase.auth.onAuthStateChange(callback);
  }
}

export default new AuthRepository();
