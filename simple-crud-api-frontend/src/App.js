import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Navbar } from './Components/Navbar'; // Import your Navbar component
import ProductGrid from './Components/ProductGrid'; // Import your ProductGrid component

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
    <div>
      <Navbar onProductsFetched={handleProductsFetched} /> {/* Pass handleProductsFetched to Navbar */}
      <ProductGrid products={products} loading={loading} error={error} />
    </div>
  );
};

export default App;
