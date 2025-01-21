import React from 'react';

const ProductGrid = ({ products, loading, error, username }) => {
  return (
    <div className="container mt-4">
      {/* Conditionally render the welcome message if the username exists */}
      {username && <h3 className="text-center mb-4">Welcome, {username}!</h3>}
      <h2 className="text-center mb-4">Our Products</h2>

      {loading && <p className="text-center">Loading products...</p>}
      {error && <p className="text-center text-red-500">{error}</p>}

      {!loading && !error && (
        <div className="mt-6 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4 xl:gap-x-8">
          {products.length === 0 && <p className="text-center">No products found.</p>}
          {products.map((product) => (
            <div key={product._id} className="group relative bg-white border rounded-lg shadow-md overflow-hidden">
              <img
                src={product.image ? product.image : 'https://via.placeholder.com/150'}
                alt={product.name}
                className="aspect-square w-full rounded-md bg-gray-200 object-cover group-hover:opacity-75 lg:aspect-auto lg:h-80"
              />
              <div className="p-4 flex flex-col">
                <h5 className="text-lg font-semibold text-gray-900">{product.name}</h5>
                <p className="text-sm text-gray-500">Quantity: {product.quantity}</p>
                <p className="text-sm font-medium text-gray-900 mt-auto">Price: ${product.price}</p>
                <p className="text-sm text-gray-500">Description: {product.description}</p>

                {/* Check if userName exists and display it */}
                {product.user_id && product.user_id.userName && (
                  <p className="text-sm text-gray-500 mt-2">
                    Added by: <strong>{product.user_id.userName}</strong>
                  </p>
                )}

                <button className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-400 transition-all duration-300 ease-in-out">
                  Buy Now
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductGrid;
