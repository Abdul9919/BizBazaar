import React from 'react';

const ProductGrid = ({ products, loading, error, username }) => {
  return (
    <div className="container mt-4">
      {/* Conditionally render the welcome message if the username exists */}
      {username && <h3 className="text-center mb-4">Welcome, {username}!</h3>}
      <h2 className="text-center mb-4">Our Products</h2>

      {loading && <p className="text-center">Loading products...</p>}
      {error && <p className="text-center text-danger">{error}</p>}

      {!loading && !error && (
        <div className="row">
          {products.length === 0 && <p className="text-center">No products found.</p>}
          {products.map((product) => (
            <div key={product._id} className="col-sm-6 col-md-4 col-lg-3 mb-4">
              <div className="card h-100">
                <img
                  src={product.image ? product.image : 'https://via.placeholder.com/150'}
                  className="card-img-top"
                  alt={product.name}
                />
                <div className="card-body d-flex flex-column">
                  <h5 className="card-title">{product.name}</h5>
                  <p className="card-text">{product.quantity}</p>
                  <p className="text-muted mt-auto">Price: ${product.price}</p>
                  <p className="card-text">Description: {product.description}</p>
                  {/* Check if userName exists and display it */}
                  {product.user_id && product.user_id.userName && (
                    <p className="text-muted mt-2">
                      Added by: <strong>{product.user_id.userName}</strong>
                    </p>
                  )}
                  <button className="btn btn-primary">Buy Now</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductGrid;
