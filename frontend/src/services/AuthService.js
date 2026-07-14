import AuthRepository from '../repositories/AuthRepository';

/**
 * AuthService
 * 
 * Handles business logic, validation, and error transformation for Authentication.
 * This is the layer components interact with, NOT the repository directly.
 */
class AuthService {
  /**
   * Register a new user
   * @param {string} email 
   * @param {string} password 
   */
  async register(email, password) {
    try {
      this._validateCredentials(email, password);
      const data = await AuthRepository.signUp(email, password);
      return { user: data.user, error: null };
    } catch (err) {
      return { user: null, error: this._formatErrorMessage(err) };
    }
  }

  /**
   * Log in an existing user
   * @param {string} email 
   * @param {string} password 
   */
  async login(email, password) {
    try {
      this._validateCredentials(email, password);
      const data = await AuthRepository.signIn(email, password);
      return { user: data.user, error: null };
    } catch (err) {
      return { user: null, error: this._formatErrorMessage(err) };
    }
  }

  /**
   * Log out the current user
   */
  async logout() {
    try {
      await AuthRepository.signOut();
      return { error: null };
    } catch (err) {
      return { error: this._formatErrorMessage(err) };
    }
  }

  /**
   * Fetch current session
   */
  async getCurrentSession() {
    try {
      const data = await AuthRepository.getSession();
      return { session: data.session, error: null };
    } catch (err) {
      return { session: null, error: this._formatErrorMessage(err) };
    }
  }

  /**
   * Internal validation rule
   */
  _validateCredentials(email, password) {
    if (!email || !email.includes('@')) {
      throw new Error("Invalid email address format.");
    }
    if (!password || password.length < 6) {
      throw new Error("Password must be at least 6 characters long.");
    }
  }

  /**
   * Internal error formatter to ensure consistent UI messages
   */
  _formatErrorMessage(err) {
    // Handle Supabase specific errors if needed
    if (err.message === "Invalid login credentials") {
      return "Incorrect email or password. Please try again.";
    }
    return err.message || "An unexpected error occurred during authentication.";
  }
}

export default new AuthService();
