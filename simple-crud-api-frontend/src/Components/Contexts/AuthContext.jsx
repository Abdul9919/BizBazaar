import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // Add loading state

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await axios.get(
            `${process.env.REACT_APP_API_URL}/api/users/me`,
            { headers: { authorization: `Bearer ${token}` } }
          );
          
          // Store both user data AND token in state
          setUser({
            ...response.data,
            token // Store token in user state
          });
          setIsAuthenticated(true);
        } catch (error) {
          console.error('Auth check failed:', error);
          localStorage.removeItem('token');
        }
      }
      setLoading(false); // Mark initialization complete
    };

    checkAuth();
  }, []);

  const login = (token, userData) => {
    if (!userData?._id) {
        console.error('Invalid user data in login:', userData);
        return;
    }
    
    localStorage.setItem('token', token);
    setUser({
        id: userData._id,
        userName: userData.userName,
        email: userData.email,
        token
    });
};

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setIsAuthenticated(false);
  };

  if (loading) {
    return <div>Loading authentication...</div>;
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Create and export the useAuth hook separately
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};