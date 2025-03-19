import { useState, useEffect } from 'react';
import { api } from '../config/Api';
import { jwtDecode } from "jwt-decode";
import { useAppDispatch, useAppSelector } from '../state/Store';
import { getUserProfile } from '../state/customer/AuthSliceCus';

interface User {
  id: number;
  email: string;
  fullName?: string;
  role?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
}

interface DecodedToken {
  userId: number;
  email: string;
  sub?: string;
  role?: string;
  exp: number;
}

export const useAuth = () => {
  const dispatch = useAppDispatch();
  const [authState, setAuthState] = useState<AuthState>(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode<DecodedToken>(token);
        if (!decoded.userId) {
          throw new Error('Invalid token: missing userId');
        }
        return {
          user: {
            id: Number(decoded.userId),
            email: decoded.email || decoded.sub || '',
            role: decoded.role
          },
          isAuthenticated: true,
          loading: true
        };
      } catch (error) {
        return {
          user: null,
          isAuthenticated: false,
          loading: true
        };
      }
    }
    return {
      user: null,
      isAuthenticated: false,
      loading: true
    };
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    
    const checkAuth = async () => {
      if (!token) {
        setAuthState({
          user: null,
          isAuthenticated: false,
          loading: false
        });
        return;
      }
      
      try {
        const decoded = jwtDecode<DecodedToken>(token);
        const currentTime = Date.now() / 1000;
        
        if (decoded.exp < currentTime) {
          localStorage.removeItem('token');
          setAuthState({
            user: null,
            isAuthenticated: false,
            loading: false
          });
          return;
        }
        
        // Validate token with backend
        const response = await api.get('/api/auth/validate-token', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        if (response.status === 200) {
          // Gọi API để lấy thông tin user đầy đủ
          const userProfile = await dispatch(getUserProfile(token)).unwrap();
          
          // Cập nhật state với thông tin đầy đủ từ server
          setAuthState({
            user: {
              id: userProfile.id ?? 0,
              email: userProfile.email,
              fullName: userProfile.fullName,
              role: userProfile.role
            },
            isAuthenticated: true,
            loading: false
          });
        }
      } catch (error) {
        console.error('Auth validation error:', error);
        localStorage.removeItem('token');
        setAuthState({
          user: null,
          isAuthenticated: false,
          loading: false
        });
      }
    };
    
    checkAuth();
  }, [dispatch]);
  
  const login = async (email: string, password: string) => {
    try {
      const response = await api.post('/api/auth/login', { email, password });
      const { token } = response.data;
      
      localStorage.setItem('token', token);
      
      // Decode token to get user info
      const decoded = jwtDecode<DecodedToken>(token);
      if (!decoded.userId) {
        throw new Error('Invalid token: missing userId');
      }
      
      // Set initial state from token
      setAuthState({
        user: {
          id: Number(decoded.userId),
          email: decoded.email || decoded.sub || '',
          role: decoded.role
        },
        isAuthenticated: true,
        loading: true
      });
      
      // Get full user profile
      const userProfile = await dispatch(getUserProfile(token)).unwrap();
      
      // Update state with full profile
      setAuthState({
        user: {
          id: userProfile.id ?? 0,
          email: userProfile.email,
          fullName: userProfile.fullName,
          role: userProfile.role
        },
        isAuthenticated: true,
        loading: false
      });
      
      return { success: true };
    } catch (error: any) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Login failed' 
      };
    }
  };
  
  const logout = () => {
    localStorage.removeItem('token');
    setAuthState({
      user: null,
      isAuthenticated: false,
      loading: false
    });
  };
  
  return {
    user: authState.user,
    isAuthenticated: authState.isAuthenticated,
    loading: authState.loading,
    login,
    logout
  };
};