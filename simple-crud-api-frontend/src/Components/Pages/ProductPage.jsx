
import React, { useContext, useEffect, useState } from 'react'
import { AuthContext } from '../Contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios'

const ProductPage = ({ products }) => {
  const [currentProduct, setProduct] = useState({});
  const [quantity, setQuantity] = useState(1)
  const navigate = useNavigate()

  const { user, isAuthenticated } = useContext(AuthContext)
  const token = localStorage.getItem('token');

  const navigateTo = () => {
    navigate('/direct-chat')
  }

  useEffect(() => {
    const matchProduct = () => {
      const selectedProductId = localStorage.getItem('selectedProductId');
      const matchedProduct = products.find(product => product.id === selectedProductId);

      if (matchedProduct) {
        setProduct(matchedProduct);
        localStorage.setItem('sellerId', matchedProduct.user_id._id);
      } else {
        console.log('No product matched the selected ID.');
      }
    };

    matchProduct();
  }, [products]); // Added products to dependency 
  
  const addProductToCart = async () => {
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/cart`,
        {
          product: currentProduct._id, // Send only the product ID, not the entire object
          quantity: quantity
        },
        {
          headers: { authorization: `Bearer ${token}` } // Authorization should be in headers
        }
      );
      let success = response.data.success
      if(success){
        alert('Item successfully added to cart')
      }
    } catch (error) {
      console.error(error.response?.data?.message || error.message);
    }
  };


  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:pt-0 md:px-6 md:pb-6 gap-8 bg-white rounded-lg shadow-lg p-6">
          {/* Product Image Section */}
          <div className="w-full md:w-1/2">
            <img
              src={currentProduct?.image}
              alt={currentProduct?.name}
              className="w-full h-96 md:h-42 object-contain rounded-lg"
            />
            <div className='my-6 ml-10'>
              <h3 className="text-xl text-gray-800 font-bold font-serif my-4">Product Description:</h3>
              <p className="text-gray-900 text-lg font-[Arial]">
                {currentProduct?.description}
              </p>
            </div>
          </div>

          {/* Product Details Section */}
          <div className="w-full md:w-1/2 flex flex-col gap-4">
            {/* Product Name */}
            <h1 className="text-3xl font-bold text-gray-900">
              {currentProduct?.name}
            </h1>

            {/* Added By User */}
            <div className="flex items-center gap-2">
              <span className="text-gray-600">Added by:</span>
              <span className="text-gray-900 font-medium">
                {currentProduct?.user_id?.userName}
              </span>
            </div>
            {isAuthenticated ? (currentProduct?.user_id?._id === user.id ? null : (
              <button onClick={navigateTo} className="max-w-[25%] text-blue-500 hover:underline hover:text-blue-700 transition duration-200">
                Message Seller
              </button>
            )) : (<p className="text-red-500">Please login to message the seller</p>)}


            {/* Price */}
            <div className="mt-4">
              <h3 className="text-lg text-gray-600">Price</h3>
              <p className="text-2xl font-bold text-blue-600">
                ${currentProduct?.price}
              </p>
            </div>

            {/* Quantity */}
            <div className="mt-2">
              <h3 className="text-lg text-gray-600">Available Quantity</h3>
              <p className="text-xl text-gray-900 font-semibold">
                {currentProduct?.quantity}
              </p>
            </div>
            <div className="flex space-x-4">
              {/* Add to Cart Button */}
              <button onClick={addProductToCart} className="bg-blue-500 text-white px-6 py-3 rounded-lg shadow-md hover:bg-blue-600 transition duration-300">
                Add to Cart
              </button>

              {/* Buy Now Button */}
              <button className="bg-orange-500 text-white px-6 py-3 rounded-lg shadow-md hover:bg-orange-600 transition duration-300">
                Buy Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductPage