import React, { useState, useEffect, useContext } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import axios from 'axios';
import { Navbar } from './Components/Navbar'; // Import your Navbar component
import ProductGrid from './Components/ProductGrid'; // Import your ProductGrid component
import Register from './Components/RegisterPage'; // Import the Register component
import Login from './Components/LoginPage'; // Import the Login component
import { AuthProvider, AuthContext } from './Components/AuthContext'; // Import AuthProvider and AuthContext

const App = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch all products initially when the page loads
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get('/api/products');
        setProducts(response.data); // Update the products state with the fetched data
        setLoading(false);
      } catch (err) {
        console.error('Error fetching products:', err.message);
        setError('Failed to fetch products.');
        setLoading(false);
      }
    };

    fetchProducts();
  }, []); // Empty dependency array ensures this only runs once on page load

  // Function to update the products state based on search results
  const handleProductsFetched = (newProducts) => {
    setProducts(newProducts);
  };

  return (
    <AuthProvider>
      <Router>
        <div>
          <Navbar onProductsFetched={handleProductsFetched} /> {/* Pass handleProductsFetched to Navbar */}
          <Routes>
            <Route
              path="/"
              element={<ProductGridWrapper products={products} loading={loading} error={error} />}
            />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
};

const ProductGridWrapper = ({ products, loading, error }) => {
  const { user } = useContext(AuthContext);
  const username = user ? user.username : null;

  return (
    <ProductGrid products={products} loading={loading} error={error} username={username} />
  );
};

export default App;