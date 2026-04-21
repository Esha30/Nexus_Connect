import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import api from '../api/api';
import { User, UserRole, AuthContextType } from '../types';
import toast from 'react-hot-toast';

// Create Auth Context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Local storage keys
const USER_STORAGE_KEY = 'business_nexus_user';
const TOKEN_KEY = 'business_nexus_token';

// Auth Provider Component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {

  // Helper to synchronize nested profile data to top-level access for UI consistency
  const syncUserAvatar = (userData: User | null): User | null => {
    if (!userData) return null;
    
    let synchronized = { ...userData };
    
    // Sync Avatar
    if (userData.profile?.avatarUrl) {
      synchronized.avatarUrl = userData.profile.avatarUrl;
    }
    
    // Sync Subscription (Ensures dashboard badges update immediately after payment)
    if (userData.profile?.subscription) {
      synchronized.subscription = userData.profile.subscription;
    }
    
    return synchronized;
  };

  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem(USER_STORAGE_KEY);
    try {
      return savedUser ? syncUserAvatar(JSON.parse(savedUser)) : null;
    } catch {
      return null;
    }
  });
  const [isLoading, setIsLoading] = useState(false);

  // Configure global authorization defaults
  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  }, []);

  const login = async (email: string, password: string, role: UserRole): Promise<void | { requires2FA: boolean; message: string }> => {
    if (!password) {
      throw new Error("Password is required for local login.");
    }
    
    try {
      const res = await api.post('/auth/login', { email, password });

      if (res.data.requires2FA) {
        return res.data;
      }

      if (res.data.role !== role) {
        throw new Error(`Account registered as ${res.data.role}, not ${role}`);
      }

      const userData = syncUserAvatar({
        ...res.data,
        id: res.data._id,
      }) as User;

      setUser(userData);
      localStorage.setItem(TOKEN_KEY, res.data.token);
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userData));
      toast.success('Logged in successfully!');
    } catch (error) {
      let msg = 'Login failed';
      if (axios.isAxiosError(error)) {
        msg = error.response?.data?.message || msg;
      } else if (error instanceof Error) {
        msg = error.message;
      }
      toast.error(msg);
      throw new Error(msg);
    }
  };

  const verifyOTP = async (email: string, otp: string, role: UserRole): Promise<void> => {
    setIsLoading(true);
    try {
      const res = await api.post('/auth/verify-otp', { email, otp });

      if (res.data.role !== role) {
        throw new Error(`Account registered as ${res.data.role}, not ${role}`);
      }

      const userData = syncUserAvatar({
        ...res.data,
        id: res.data._id,
      }) as User;

      setUser(userData);
      localStorage.setItem(TOKEN_KEY, res.data.token);
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userData));
      toast.success('Security code verified. Logged in!');
    } catch (error) {
      let msg = 'Verification failed';
      if (axios.isAxiosError(error)) {
        msg = error.response?.data?.message || msg;
      } else if (error instanceof Error) {
        msg = error.message;
      }
      toast.error(msg);
      throw new Error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string, role: UserRole): Promise<void | { requiresVerification: boolean; message: string }> => {
    setIsLoading(true);
    try {
      const res = await api.post('/auth/register', { name, email, password, role });

      if (res.data.requiresVerification) {
        toast.success(res.data.message);
        return res.data;
      }

      const userData = syncUserAvatar({
        ...res.data,
        id: res.data._id,
      }) as User;

      setUser(userData);
      localStorage.setItem(TOKEN_KEY, res.data.token);
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userData));
      toast.success('Account created successfully!');
    } catch (error) {
      let msg = 'Registration failed';
      if (axios.isAxiosError(error)) {
        msg = error.response?.data?.message || msg;
      } else if (error instanceof Error) {
        msg = error.message;
      }
      toast.error(msg);
      throw new Error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const forgotPassword = async (email: string): Promise<void> => {
    setIsLoading(true);
    try {
      const res = await api.post('/auth/forgot-password', { email });
      toast.success(res.data.message);
    } catch (error) {
      let msg = 'Failed to send reset link';
      if (axios.isAxiosError(error)) {
        msg = error.response?.data?.message || msg;
      }
      toast.error(msg);
      throw new Error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const updatePartialUser = (updates: Partial<User>) => {
    if (!user) return;
    const updatedUser = syncUserAvatar({ ...user, ...updates }) as User;
    setUser(updatedUser);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updatedUser));
  };

  const resetPassword = async (token: string, password: string): Promise<void> => {
    setIsLoading(true);
    try {
      const res = await api.post('/auth/reset-password', { token, password });
      toast.success(res.data.message);
    } catch (error) {
      let msg = 'Failed to reset password';
      if (axios.isAxiosError(error)) {
        msg = error.response?.data?.message || msg;
      }
      toast.error(msg);
      throw new Error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = (): void => {
    setUser(null);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_STORAGE_KEY);
    localStorage.removeItem('nexus_pending_role');
    // Sign out logic
    toast.success('Logged out successfully');
  };

  const updateProfile = async (userId: string, updates: Partial<User>): Promise<void> => {
    setIsLoading(true);
    try {
      const res = await api.put('/auth/profile', updates);
      const updatedData = syncUserAvatar({ ...res.data, id: res.data._id }) as User;
      setUser(updatedData);
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updatedData));

      if (res.data.token) {
        localStorage.setItem(TOKEN_KEY, res.data.token);
        api.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
      }

      toast.success('Profile updated successfully!');
    } catch (error) {
      let msg = 'Failed to update profile';
      if (axios.isAxiosError(error)) {
        msg = error.response?.data?.message || msg;
      }
      toast.error(msg);
      throw new Error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const googleLogin = async (credential: string, role: UserRole): Promise<void | { requires2FA: boolean; message: string }> => {
    setIsLoading(true);
    try {
      const res = await api.post('/auth/google-login', { credential, role });

      if (res.data.requires2FA) {
        return res.data;
      }

      const userData = syncUserAvatar({
        ...res.data,
        id: res.data._id,
      }) as User;

      setUser(userData);
      localStorage.setItem(TOKEN_KEY, res.data.token);
      api.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userData));
      toast.success('Logged in with Google successfully!');
    } catch (error) {
      let msg = 'Google login failed';
      if (axios.isAxiosError(error)) {
        msg = error.response?.data?.message || msg;
      }
      toast.error(msg);
      throw new Error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const setup2FA = async (): Promise<{ secret: string; qrCode: string }> => {
    try {
      const res = await api.post('/auth/setup-2fa');
      return res.data;
    } catch (error) {
      let msg = 'Failed to setup 2FA';
      if (axios.isAxiosError(error)) {
        msg = error.response?.data?.message || msg;
      }
      toast.error(msg);
      throw new Error(msg);
    }
  };

  const confirm2FA = async (token: string): Promise<boolean> => {
    try {
      const res = await api.post('/auth/confirm-2fa', { token });
      if (res.data.enabled && user) {
        // We will optimistically update the user context
        const updatedUser = syncUserAvatar({
          ...user,
          profile: {
            ...user.profile,
            twoFactorEnabled: true
          }
        }) as User;
        setUser(updatedUser);
      }
      return res.data.enabled;
    } catch (error) {
      let msg = 'Failed to confirm 2FA token';
      if (axios.isAxiosError(error)) {
        msg = error.response?.data?.message || msg;
      }
      toast.error(msg);
      throw new Error(msg);
    }
  };

  const value: AuthContextType = {
    user,
    login,
    register,
    googleLogin,
    logout,
    forgotPassword,
    resetPassword,
    updateProfile,
    verifyOTP,
    setup2FA,
    confirm2FA,
    updatePartialUser,
    isAuthenticated: !!user,
    isLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};