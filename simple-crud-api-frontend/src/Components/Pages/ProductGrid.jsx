import React from 'react';
import ChatButton from '../ChatButton';
import { useNavigate } from 'react-router-dom';

const ProductGrid = ({ products = [], loading, error, username }) => {
  const navigate = useNavigate();
  const onProductClick = (id) => {
    localStorage.setItem('selectedProductId', id);
    navigate('/productpage')
  }
  return (
    <div className="container mx-auto px-4 mt-4">
      {username && <h3 className="text-center mb-4 text-lg md:text-xl">Welcome, {username}!</h3>}
      <h2 className="text-center mb-4 text-2xl md:text-3xl font-semibold">Our Products</h2>

      {loading && <p className="text-center md:text-lg">Loading products...</p>}
      {error && <p className="text-center text-red-500 md:text-lg">{error}</p>}

      {!loading && !error && (
        <div className="mt-6 grid grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-4 md:gap-6">

          {!Array.isArray(products) ? (
            <p className="text-center col-span-full">Invalid products data received.</p>
          ) : products.length === 0 ? (
            <p className="text-center col-span-full">No products found.</p>
          ) : (
            products.map((product) => (
              <div onClick={() => onProductClick(product._id)} key={product._id} className="group relative bg-white border rounded-lg shadow-md overflow-hidden hover:shadow-lg lg:max-w-[250px] transition-shadow duration-300">
                <div className="aspect-square lg:w-[250px] md:w-full sm:w-full overflow-hidden">
                  <img
                    src={product.image || 'https://via.placeholder.com/150'}
                    alt={product.name}
                    className="lg:w-[250px] lg:h-[250px] sm:w-full sm:h-full md:w-full md:h-full object-cover transform group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-2 sm:p-4 flex flex-col">
                  <h5 className="text-sm sm:text-lg md:text-xl font-semibold text-gray-900 mb-1 sm:mb-2">{product.name}</h5>
                  <div className="space-y-1 sm:space-y-2">
                    <p className="text-xs sm:text-sm md:text-base text-gray-500">
                      Quantity: {product.quantity}
                    </p>
                    <p className="text-sm sm:text-base md:text-lg font-medium text-gray-900">
                      Price: ${product.price}
                    </p>
                    <p className="text-xs sm:text-sm md:text-base text-gray-500 line-clamp-2">
                      {product.description}
                    </p>
                    {product.user_id?.userName && (
                      <p className="text-xs sm:text-sm md:text-base text-gray-500 mt-1 sm:mt-2">
                        Added by: <strong>{product.user_id.userName}</strong>
                      </p>
                    )}
                  </div>
                  <button className="mt-2 sm:mt-4 bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 sm:px-4 sm:py-2 text-xs sm:text-sm md:text-base rounded-lg transition-colors duration-300">
                    Buy Now
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
      <ChatButton/>
    </div>
  );
};

export default ProductGrid;