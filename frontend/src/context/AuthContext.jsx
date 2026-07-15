import React, { createContext, useContext, useState, useEffect } from 'react';
import AuthService from '../services/AuthService';
import AuthRepository from '../repositories/AuthRepository';
import { isFeatureEnabled } from '../config/featureFlags';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // If Supabase Auth feature flag is disabled, treat everyone as anonymous
    if (!isFeatureEnabled('SUPABASE_AUTH')) {
      setUser(null);
      setLoading(false);
      return;
    }

    const initSession = async () => {
      try {
        const { session: currentSession } = await AuthService.getCurrentSession();
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        if (currentSession?.user) {
          import('../services/NotificationManager').then(({ default: nm }) => {
            nm.initialize().catch(err => console.error('[AuthContext] FCM init error:', err));
          });
        }
      } catch (err) {
        // Supabase may be unconfigured — gracefully degrade to anonymous
        console.warn('[AuthContext] Session init failed (Supabase may not be configured):', err.message);
        setUser(null);
        setSession(null);
      } finally {
        setLoading(false);
      }
    };

    initSession();

    // Listen for real-time auth state changes (token refresh, logout, login)
    const { data: { subscription } } = AuthRepository.onAuthStateChange(async (_event, newSession) => {
      setSession(newSession);
      setUser(newSession?.user ?? null);
      setLoading(false);

      try {
        const { default: nm } = await import('../services/NotificationManager');
        if (newSession?.user) {
          nm.initialize().catch(err => console.error('[AuthContext] FCM init error:', err));
        } else {
          nm.cleanup().catch(err => console.error('[AuthContext] FCM cleanup error:', err));
        }
      } catch (err) {
        console.error('[AuthContext] Failed to load NotificationManager:', err);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email, password) => {
    return await AuthService.login(email, password);
  };

  const register = async (email, password) => {
    return await AuthService.register(email, password);
  };

  const logout = async () => {
    const result = await AuthService.logout();
    setUser(null);
    setSession(null);
    return result;
  };

  const value = {
    user,
    session,
    loading,            // true while Supabase is resolving the initial session
    isAuthenticated: !!user,
    login,
    register,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {/*
        CRITICAL: Always render children immediately.
        Never gate the app on auth loading state.
        Anonymous users must see all pages without delay.
        Components that need auth status can read `loading` from useAuth().
      */}
      {children}
    </AuthContext.Provider>
  );
};
