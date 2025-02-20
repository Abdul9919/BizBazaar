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
import ProductPage from './Components/Pages/ProductPage';
import DirectChat from './Components/Chat/DirectChat';
import Cart from './Components/Pages/Cart.jsx';
import Success from './Components/Pages/Success.jsx';
import Cancel from './Components/Pages/Cancel.jsx';
import { ChevronDown, ChevronUp } from "lucide-react";


const App = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [clickedProduct, setClickedProduct] = useState([]);

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
  /*
    const handleProductClick = () => {
     const tempProduct = products.filter((product) => product.id === clickedProduct.id);
      if (tempProduct.id === clickedProduct.id) {
        console.log('Clicked Product', tempProduct);
    }*/
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
              <Route path='/my-cart' element={<Cart />} />
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
              <Route
                path="/direct-chat"
                element={
                  <PrivateRoute>
                    <DirectChatInterface />
                  </PrivateRoute>
                }
              />
              <Route path="/productpage" element={<ProductPage products={products} />} />
              <Route path='/success' element={<Success />} />
              <Route path='/cancel' element={<Cancel />} />
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
    <div className="flex flex-col md:flex-row h-screen">
      {/* User List Sidebar (Top on Mobile, Sidebar on Desktop) */}
      <div className="w-full md:w-[30%] lg:w-1/4 border-b md:border-r md:border-b-0 bg-white">
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

      {/* Chat Window (Below on Mobile, Right on Desktop) */}
      <div className="flex-1 bg-gray-50">
        {selectedUser?.id ? (
          <ChatWindow key={selectedUser?.id} selectedUser={selectedUser} />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500 text-lg">
            Select a user from the sidebar to start chatting
          </div>
        )}
      </div>
    </div>

  );
};

const DirectChatInterface = () => {
  const [selectedUser, setSelectedUser] = useState(null);
  const [sellerId, setSellerId] = useState(null);

  // Debug selected user changes
  useEffect(() => {
    console.log('Selected User in ChatInterface:', {
      id: selectedUser?.id,
      valid: selectedUser?.id ? /^[0-9a-fA-F]{24}$/.test(selectedUser.id) : false
    });
  }, [selectedUser]);

  const fetchSellerId = async () => {
    try {
      const sellerId = localStorage.getItem('sellerId');
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/users/profile/${sellerId}`);
      setSellerId(response.data);
    } catch (error) {
      console.log('Error fetching seller id:', error.message);
    }
  }

  useEffect(() => {
    fetchSellerId();
  }, [])


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

        <DirectChat key={sellerId?._id} selectedUser={sellerId} />

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