import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

// Demo users for frontend testing (no backend required)
const DEMO_USERS = [
  {
    id: 1,
    name: 'Admin User',
    email: 'admin@example.com',
    password: 'admin123',
    phone: '+8801234567890',
    role: 'admin',
  },
  {
    id: 2,
    name: 'Dr. Smith',
    email: 'doctor@example.com',
    password: 'doctor123',
    phone: '+8801987654321',
    role: 'doctor',
  },
  {
    id: 3,
    name: 'Ahmed Hassan',
    email: 'patient@example.com',
    password: 'patient123',
    phone: '+8801555666777',
    role: 'patient',
  },
];

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState({
    isAuthenticated: false,
    role: 'guest',
    name: 'Guest',
    id: null,
    email: null,
    token: null,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check localStorage on mount
  useEffect(() => {
    const storedAuth = localStorage.getItem('authUser');
    if (storedAuth) {
      try {
        const parsedAuth = JSON.parse(storedAuth);
        setUser(parsedAuth);
      } catch (err) {
        console.error('Failed to parse stored auth:', err);
      }
    }
    setLoading(false);
  }, []);

  const loginAPI = async (username, password) => {
    try {
      setError(null);
      setLoading(true);

      // console.log('Login request payload:', { username, password });
      const response = await axios.post('http://localhost:8080/auth/login', { username, password });
      // console.log('Login response:', response);

      const authData = response.data;
      const userData = {
        isAuthenticated: true,
        token: authData.token,
        ...authData.user,
      };

      setUser(userData);
      localStorage.setItem('authUser', JSON.stringify(userData));
      return userData;
    } catch (err) {
        console.error('Login API error:', err.response?.status, err.response?.data, err.message);
        const errorMsg = err.response?.data?.message || err.message || 'Login failed. Please try again.';
        setError(errorMsg);
        throw err;
    } finally {
      setLoading(false);
    }
  };

  const registerAPI = async (userData) => {
    try {
      setError(null);
      setLoading(true);

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));

      // Check if email already exists in demo users
      const emailExists = DEMO_USERS.some(u => u.email === userData.email);
      if (emailExists) {
        throw new Error('Email already registered');
      }

      // Create new demo user
      const newUser = {
        id: DEMO_USERS.length + 1,
        name: userData.name,
        email: userData.email,
        password: userData.password,
        phone: userData.phone,
        role: 'patient',
      };

      // Add to demo users (in-memory only)
      DEMO_USERS.push(newUser);

      // Generate fake token
      const token = `demo-token-${newUser.id}-${Date.now()}`;

      const authData = {
        isAuthenticated: true,
        role: newUser.role,
        name: newUser.name,
        id: newUser.id,
        email: newUser.email,
        token,
      };

      setUser(authData);
      localStorage.setItem('authUser', JSON.stringify(authData));

      return authData;
    } catch (err) {
      const errorMsg = err.message || 'Registration failed. Please try again.';
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser({
      isAuthenticated: false,
      role: 'guest',
      name: 'Guest',
      id: null,
      email: null,
      token: null,
    });
    localStorage.removeItem('authUser');
    setError(null);
  };

  return (
    <AuthContext.Provider value={{ user, loginAPI, registerAPI, logout, loading, error, setError }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
