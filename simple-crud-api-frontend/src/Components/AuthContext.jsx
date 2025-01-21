import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  // Check if a valid token exists on initial load
  useEffect(() => {
    const token = localStorage.getItem('token');
    
    if (token) {
      
      // Fetch user profile with the token to verify if it's valid
      axios.get('/api/users/me', { headers: { authorization: `Bearer ${token}` } })
        .then(response => {
          setUser(response.data); // Store the user data
          setIsAuthenticated(true);
        })
        .catch(error => {
          localStorage.removeItem('token'); // Remove invalid token
          setIsAuthenticated(false);
        });
    } else {
      setIsAuthenticated(false);
    }
  }, []);
  

  const login = (token, userInfo) => {
    localStorage.setItem('token', token);
    setUser(userInfo); // Set the user data (username, email, etc.)
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
