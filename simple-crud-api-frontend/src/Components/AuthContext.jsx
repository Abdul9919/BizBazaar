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
      console.log("Token found in localStorage:", token);
      
      // Fetch user profile with the token to verify if it's valid
      axios.get('/api/users/me', { headers: { authorization: `Bearer ${token}` } })
        .then(response => {
          console.log("User authenticated:", response.data);
          setUser(response.data); // Store the user data
          setIsAuthenticated(true);
        })
        .catch(error => {
          console.error("Error verifying token:", error);
          localStorage.removeItem('token'); // Remove invalid token
          setIsAuthenticated(false);
        });
    } else {
      console.log("No token found in localStorage");
      setIsAuthenticated(false);
    }
  }, []);
  

  const login = (token, userInfo) => {
    localStorage.setItem('token', token);
    setUser(userInfo); // Set the user data (username, email, etc.)
    setIsAuthenticated(true);
    console.log("User logged in:", userInfo);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setIsAuthenticated(false);
    console.log("User logged out.");
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
