import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState({
    isAuthenticated: false,
    role: 'guest',
    name: 'Guest',
  });

  const login = (role, name = 'User') => {
    setUser({ isAuthenticated: true, role, name });
  };

  const logout = () => {
    setUser({ isAuthenticated: false, role: 'guest', name: 'Guest' });
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
