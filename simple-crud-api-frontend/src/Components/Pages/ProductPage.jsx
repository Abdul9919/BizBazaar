import React, { useEffect, useState } from 'react'

const ProductPage = ({ products }) => {
  const [product, setProduct] = useState({});
  
  useEffect(() => {
    const matchProduct = () => {
      const selectedProductId = localStorage.getItem('selectedProductId');
      const matchedProduct = products.find(product => product.id === selectedProductId);
      
      if (matchedProduct) {
        setProduct(matchedProduct);
      } else {
        console.log('No product matched the selected ID.');
      }
    };

    matchProduct();
  }, [products]); // Added products to dependency array

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row gap-8 bg-white rounded-lg shadow-lg p-6">
          {/* Product Image Section */}
          <div className="w-full md:w-1/2">
            <img 
              src={product?.image} 
              alt={product?.name} 
              className="w-full h-96 object-contain rounded-lg"
            />
          </div>

          {/* Product Details Section */}
          <div className="w-full md:w-1/2 flex flex-col gap-4">
            {/* Product Name */}
            <h1 className="text-3xl font-bold text-gray-900">
              {product?.name}
            </h1>

            {/* Added By User */}
            <div className="flex items-center gap-2">
              <span className="text-gray-600">Added by:</span>
              <span className="text-gray-900 font-medium">
                {product?.user_id?.userName}
              </span>
            </div>

            {/* Price */}
            <div className="mt-4">
              <h3 className="text-lg text-gray-600">Price</h3>
              <p className="text-2xl font-bold text-blue-600">
                ${product?.price}
              </p>
            </div>

            {/* Quantity */}
            <div className="mt-2">
              <h3 className="text-lg text-gray-600">Available Quantity</h3>
              <p className="text-xl text-gray-900 font-semibold">
                {product?.quantity}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductPage