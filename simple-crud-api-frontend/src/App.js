import React, { useState, useEffect, useContext } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import axios from 'axios';
import { Navbar } from './Components/Navbar/Navbar';
import ProductGrid from './Components/Pages/ProductGrid';
import Register from './Components/Pages/RegisterPage';
import Login from './Components/Pages/LoginPage';
import Dashboard from './Components/Pages/Dashboard';
import { AuthProvider, AuthContext } from './Components/Contexts/AuthContext';
import { SocketProvider } from './Components/Contexts/socketContext';
import ChatWindow from './Components/Chat/ChatWindow';
import UserList from './Components/Chat/UserList';

const App = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/products`);
        setProducts(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching products:', err.message);
        setError('Failed to fetch products.');
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleProductsFetched = (newProducts) => {
    setProducts(newProducts);
  };

  return (
    <AuthProvider>
      <SocketProvider>
        <Router>
          <div className="app-container">
            <Navbar onProductsFetched={handleProductsFetched} />
            <Routes>
              <Route
                path="/"
                element={<ProductGridWrapper products={products} loading={loading} error={error} />}
              />
              <Route path="/register" element={<Register />} />
              <Route path="/login" element={<Login />} />
              <Route
                path="/dashboard"
                element={<PrivateRoute />}
              />
              <Route
                path="/chat"
                element={
                  <PrivateRoute>
                    <ChatInterface />
                  </PrivateRoute>
                }
              />
            </Routes>
          </div>
        </Router>
      </SocketProvider>
    </AuthProvider>
  );
};

const ChatInterface = () => {
  const [selectedUser, setSelectedUser] = useState(null);

  // Debug selected user changes
  useEffect(() => {
    console.log('Selected User in ChatInterface:', {
      id: selectedUser?.id,
      valid: selectedUser?.id ? /^[0-9a-fA-F]{24}$/.test(selectedUser.id) : false
    });
  }, [selectedUser]);

  return (
    <div className="flex h-screen">
      {/* User List Sidebar */}
      <div className="w-1/4 border-r bg-white">
        <UserList 
          onSelectUser={(user) => {
            console.log('User selected:', user);
            setSelectedUser({
              id: user.id,
              name: user.name,
              email: user.email
            });
          }}
        />
      </div>

      {/* Chat Window */}
      <div className="flex-1 bg-gray-50">
        {selectedUser?.id ? (
          <ChatWindow key={selectedUser._id} selectedUser={selectedUser} />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500 text-lg">
            Select a user from the sidebar to start chatting
          </div>
        )}
      </div>
    </div>
  );
};

const ProductGridWrapper = ({ products, loading, error }) => {
  return <ProductGrid products={products} loading={loading} error={error} />;
};

const PrivateRoute = ({ children }) => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children || <Dashboard />;
};

const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default App;