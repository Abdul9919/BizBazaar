import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../Contexts/AuthContext';
import axios from 'axios';
import { loadStripe } from '@stripe/stripe-js';

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const { user } = useContext(AuthContext);
  const token = localStorage.getItem('token');
  const [total, setTotal] = useState(0);

  const fetchCartItems = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/cart`, {
        headers: { authorization: `Bearer ${token}` }
      });
      setCartItems(response.data);
    } catch (error) {
      console.error('Error fetching cart items:', error);
    }
  };

  useEffect(() => {
    fetchCartItems();
  }, []);

  const handleQuantityChange = async (id, newQuantity) => {
    if (newQuantity < 1) return;
    
    const updatedCart = cartItems.map(item =>
      item._id === id ? { ...item, quantity: newQuantity } : item
    );
    setCartItems(updatedCart);

    try {
      await axios.put(`${process.env.REACT_APP_API_URL}/api/cart/${id}`, { quantity: newQuantity }, {
        headers: { authorization: `Bearer ${token}` }
      });
    } catch (error) {
      console.error('Error updating quantity:', error);
      fetchCartItems();
    }
  };

  const handleRemoveItem = async (id) => {
    const updatedCart = cartItems.filter(item => item._id !== id);
    setCartItems(updatedCart);

    try {
      await axios.delete(`${process.env.REACT_APP_API_URL}/api/cart/${id}`, {
        headers: { authorization: `Bearer ${token}` }
      });
    } catch (error) {
      console.error('Error removing item:', error);
      fetchCartItems();
    }
  };

  useEffect(() => {
    const tempTotal = cartItems.reduce((acc, item) => acc + item?.product?.price * item?.quantity, 0);
    setTotal(tempTotal);
  }, [cartItems]);

  const makePayment = async () => {
    const stripe = await loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/payment/create-checkout-session`,
        { products: cartItems },
        { headers: { "Content-Type": "application/json" } }
      );

      const session = response.data;
      await stripe.redirectToCheckout({ sessionId: session.id });
    } catch (error) {
      console.error("Error during payment:", error.message);
    }
  };

  return (
    <div className="px-3 sm:px-8 my-4">
      <h1 className="text-lg sm:text-2xl font-bold mb-4">Your Cart</h1>

      {/* Cart Items (Aligned Left) */}
      <div className="bg-gray-100 p-3 sm:p-6 rounded-lg shadow-md w-full max-w-4xl">
        {cartItems.length > 0 ? (
          cartItems.map(item => (
            <div key={item._id} 
                 className="flex items-center justify-between border-b border-gray-300 py-3 gap-x-2 sm:gap-x-4 text-sm sm:text-base">

              {/* Product Image */}
              <img src={item?.product?.image} alt={item?.product?.name} 
                   className="w-12 h-12 sm:w-16 sm:h-16 object-cover rounded-lg" />

              {/* Product Details */}
              <div className="flex-1 min-w-20">
                <h2 className="text-sm sm:text-lg font-semibold">{item?.product?.name}</h2>
                <p className="text-gray-600 text-xs sm:text-sm">${item?.product?.price.toFixed(2)}</p>
              </div>

              {/* Quantity Controls */}
              <div className="flex items-center gap-x-1 sm:gap-x-2">
                <button onClick={() => handleQuantityChange(item._id, item.quantity - 1)}
                  className="px-2 sm:px-3 py-1 bg-gray-800 rounded-l text-white hover:bg-gray-600">-</button>
                <span className="px-2 sm:px-3 py-1 bg-gray-200">{item.quantity}</span>
                <button onClick={() => handleQuantityChange(item._id, item.quantity + 1)}
                  className="px-2 sm:px-3 py-1 bg-gray-800 rounded-r text-white hover:bg-gray-600">+</button>
              </div>

              {/* Total Price (Fixed Width to Prevent Overflow) */}
              <div className="font-semibold text-xs sm:text-md w-16 sm:w-auto text-right">
                ${(item.product.price * item.quantity).toFixed(2)}
              </div>

              {/* Remove Button */}
              <button onClick={() => handleRemoveItem(item._id)}
                className="text-red-500 hover:text-red-700 text-xs sm:text-sm">
                Remove
              </button>
            </div>
          ))
        ) : (
          <p className="text-gray-500 text-sm">Your cart is empty.</p>
        )}

        {/* Total & Checkout */}
        <div className="mt-4 pt-3 border-t border-gray-300">
          <div className="flex justify-between text-sm sm:text-lg font-bold">
            <span>Total:</span>
            <span>${total.toFixed(2)}</span>
          </div>
          <button onClick={makePayment} disabled={cartItems.length === 0}
            className="w-full mt-4 bg-blue-600 text-white py-2 sm:py-3 rounded-lg hover:bg-blue-700 transition 
            disabled:cursor-not-allowed disabled:opacity-50 text-sm sm:text-base">
            Checkout
          </button>
        </div>
      </div>
    </div>
  );
};

export default Cart;
