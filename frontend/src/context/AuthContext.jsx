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
    // If Supabase Auth feature flag is disabled, just mock a logged-in state or bypass
    if (!isFeatureEnabled('SUPABASE_AUTH')) {
      setUser({ email: 'demo@lifelink.ai', id: '123' });
      setLoading(false);
      return;
    }

    const initSession = async () => {
      const { session } = await AuthService.getCurrentSession();
      setSession(session);
      setUser(session?.user || null);
      setLoading(false);
    };

    initSession();

    // Listen for auth changes
    const { data: { subscription } } = AuthRepository.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user || null);
      setLoading(false);
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
    await AuthService.logout();
    setUser(null);
    setSession(null);
  };

  const value = {
    user,
    session,
    login,
    register,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
