import React from 'react';

const ProductGrid = ({ products = [], loading, error, username }) => {
  console.log('Products data:', products); // Debug log

  return (
    <div className="container mt-4">
      {username && <h3 className="text-center mb-4">Welcome, {username}!</h3>}
      <h2 className="text-center mb-4">Our Products</h2>

      {loading && <p className="text-center">Loading products...</p>}
      {error && <p className="text-center text-red-500">{error}</p>}

      {!loading && !error && (
        <div className="mt-6 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4 xl:gap-x-8">
          {!Array.isArray(products) ? (
            <p className="text-center">Invalid products data received.</p>
          ) : products.length === 0 ? (
            <p className="text-center">No products found.</p>
          ) : (
            products.map((product) => (
              <div key={product._id} className="...">
                <img
                  src={product.image || 'https://via.placeholder.com/150'}
                  alt={product.name}
                  className="..."
                />
                <div className="...">
                  <h5 className="...">{product.name}</h5>
                  <p className="...">Quantity: {product.quantity}</p>
                  <p className="...">Price: ${product.price}</p>
                  <p className="...">Description: {product.description}</p>
                  {product.user_id?.userName && (
                    <p className="...">
                      Added by: <strong>{product.user_id.userName}</strong>
                    </p>
                  )}
                  <button className="...">Buy Now</button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default ProductGrid;
