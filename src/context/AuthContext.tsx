import React, { createContext, useState, useEffect, useContext } from 'react';
import API from '../services/api';

interface SavedLibraryItem {
  _id?: string;
  title?: string;
  thumbnailUrl?: string;
  category?: {
    displayName?: string;
  };
}

interface BookmarkedBlogItem {
  _id?: string;
  title?: string;
  coverImage?: string;
  category?: {
    displayName?: string;
  };
  readingTime?: number;
}

interface UserType {
  _id: string;
  username: string;
  email: string;
  role: 'user' | 'admin';
  avatar: string;
  savedLibrary?: Array<SavedLibraryItem | string>;
  bookmarkedBlogs?: Array<BookmarkedBlogItem | string>;
}

interface AuthResponse {
  success: boolean;
  message?: string;
  token?: string;
  user?: UserType;
  resetToken?: string;
}

interface AuthContextType {
  user: UserType | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<AuthResponse>;
  register: (username: string, email: string, password: string, role?: string) => Promise<AuthResponse>;
  logout: () => void;
  forgotPassword: (email: string) => Promise<AuthResponse>;
  resetPassword: (token: string, password: string) => Promise<AuthResponse>;
  updateUserSession: () => Promise<void>;
}

const getErrorMessage = (error: unknown, fallbackMessage: string) => {
  if (typeof error === 'object' && error !== null && 'response' in error) {
    const response = (error as { response?: { data?: { message?: string } } }).response;
    if (typeof response?.data?.message === 'string') {
      return response.data.message;
    }
  }
  return fallbackMessage;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserType | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Re-verify session on startup
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        try {
          const res = await API.get('/auth/profile');
          if (res.data.success) {
            setUser(res.data.user);
            setToken(storedToken);
          } else {
            // invalid session
            localStorage.removeItem('token');
            setUser(null);
            setToken(null);
          }
        } catch (error) {
          console.error('Session restoration failed:', error);
          localStorage.removeItem('token');
          setUser(null);
          setToken(null);
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string): Promise<AuthResponse> => {
    try {
      const res = await API.post('/auth/login', { email, password });
      if (res.data.success) {
        localStorage.setItem('token', res.data.token);
        setToken(res.data.token);
        setUser(res.data.user);
        return { success: true };
      }
      return { success: false, message: res.data.message || 'Login failed' };
    } catch (error: unknown) {
      return {
        success: false,
        message: getErrorMessage(error, 'Invalid email or password'),
      };
    }
  };

  const register = async (username: string, email: string, password: string, role = 'user'): Promise<AuthResponse> => {
    try {
      const res = await API.post('/auth/register', { username, email, password, role });
      if (res.data.success) {
        localStorage.setItem('token', res.data.token);
        setToken(res.data.token);
        setUser(res.data.user);
        return { success: true };
      }
      return { success: false, message: res.data.message || 'Registration failed' };
    } catch (error: unknown) {
      return {
        success: false,
        message: getErrorMessage(error, 'Username or email already taken'),
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  const forgotPassword = async (email: string): Promise<AuthResponse> => {
    try {
      const res = await API.post('/auth/forgot-password', { email });
      return res.data;
    } catch (error: unknown) {
      return {
        success: false,
        message: getErrorMessage(error, 'Password reset request failed'),
      };
    }
  };

  const resetPassword = async (resetToken: string, password: string): Promise<AuthResponse> => {
    try {
      const res = await API.post(`/auth/reset-password/${resetToken}`, { password });
      return res.data;
    } catch (error: unknown) {
      return {
        success: false,
        message: getErrorMessage(error, 'Password reset failed'),
      };
    }
  };

  const updateUserSession = async () => {
    if (!localStorage.getItem('token')) return;
    try {
      const res = await API.get('/auth/profile');
      if (res.data.success) {
        setUser(res.data.user);
      }
    } catch (error) {
      console.error('Failed to update user session details:', error);
    }
  };

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        isLoading,
        login,
        register,
        logout,
        forgotPassword,
        resetPassword,
        updateUserSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
