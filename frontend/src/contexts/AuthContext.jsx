import React, { createContext, useState, useEffect } from 'react';
import { isTokenExpired } from '../utils/auth';
import { useNavigate } from 'react-router-dom';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState(() => {
    const storedAuth = localStorage.getItem('auth');
    return storedAuth ? JSON.parse(storedAuth) : null;
  });
  const navigate = useNavigate();

  useEffect(() => {
    if (auth) {
      localStorage.setItem('auth', JSON.stringify(auth));
      if (isTokenExpired(auth.token)) {
        localStorage.removeItem('auth');
        setAuth(null)
        navigate('/login');
      }
    } else {
      localStorage.removeItem('auth');
    }

  }, [auth]);

  return (
    <AuthContext.Provider value={{ auth, setAuth }}>
      {children}
    </AuthContext.Provider>
  );
};