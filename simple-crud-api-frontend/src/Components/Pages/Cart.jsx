import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../Contexts/AuthContext';
import axios from 'axios'
import Payment from '../Payment';
import { loadStripe } from '@stripe/stripe-js'

const Cart = () => {
  const [cartItems, setCartItems] = useState([
  ]);
  const { user } = useContext(AuthContext)

  const token = localStorage.getItem('token');

  const [total, setTotal] = useState(0);

  const fetchCartItems = async () => {
    const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/cart`, {
      headers: { authorization: `Bearer ${token}` }
    })
    setCartItems(response.data)
  }
  // Calculate total when component mounts or items change
  useEffect(() => {
    fetchCartItems()
  }, []);



  const makePayment = async () => {
    const stripe = await loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY)

    const body = {
      products: cartItems
    }

    const headers = {
      "Content-Type": "application/json"
    }

    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/payment/create-checkout-session`, body, { headers });

      const session = response.data;
      const result = await stripe.redirectToCheckout({
        sessionId: session.id
      })
      const cartId = cartItems._id
       await axios.delete(`${process.env.REACT_APP_API_URL}/api/cart/${cartId}`,
        { headers: { authorization: `Bearer ${token}` } }
      )
    } catch (error) {
      console.log(error.message)
    }

  }

  const handleQuantityChange = async (id, newQuantity) => {
    if (newQuantity < 1) return;
    try {
      await axios.put(`${process.env.REACT_APP_API_URL}/api/cart/${id}`,
        { quantity: newQuantity },
        { headers: { authorization: `Bearer ${token}` } }
      );
      fetchCartItems(); // Refresh cart data
    } catch (error) {
      console.error('Error updating quantity:', error);
    }
  };

  useEffect(() => {
    const tempTotal = cartItems.reduce((acc, item) => acc + item?.product?.price * item?.quantity, 0);
    setTotal(tempTotal);
  }, [cartItems]);

  const handleRemoveItem = async (id) => {
    try {
      await axios.delete(`${process.env.REACT_APP_API_URL}/api/cart/${id}`, {
        headers: { authorization: `Bearer ${token}` }
      });
      fetchCartItems(); // Refresh cart data
    } catch (error) {
      console.error('Error removing item:', error);
    }
  };

  return (
    <>
      <div className="container absolute left-0 w-1/2 border-r-[1px] bg-gray-200 border-slate-400 border-b rounded-lg pl-0 p-4 my-[2rem] shadow-lg">

        <h1 className="text-3xl font-bold mb-6">Your Cart</h1>

        <>
          {cartItems.map(item => (
            <div key={item._id} className="flex items-center border-b border-gray-200 py-4">
              <img
                src={item?.product?.image}
                alt={item?.product?.name}
                className="w-20 h-20 object-cover rounded mr-4"
              />
              <div className="flex-1">
                <h2 className="text-lg font-semibold">{item?.product?.name}</h2>
                <p className="text-gray-600">${!isNaN(item?.product?.price) ? item?.product?.price.toFixed(2) : '0.00'}</p>
              </div>
              <div className="flex items-center">
                <button
                  onClick={() => handleQuantityChange(item?._id, item?.quantity - 1)}
                  className="px-3 py-1 bg-gray-800 rounded-l text-white hover:bg-gray-300"
                >
                  -
                </button>
                <span className="px-4 py-1 bg-gray-100">{item?.quantity}</span>
                <button
                  onClick={() => handleQuantityChange(item?._id, item?.quantity + 1)}
                  className="px-3 py-1 bg-gray-800 rounded-r text-white hover:bg-gray-300"
                >
                  +
                </button>
              </div>
              <div className="ml-4">
                <p className="text-lg font-semibold">
                  ${(item?.totalPrice).toFixed(2)}
                </p>
              </div>
              <button
                onClick={() => handleRemoveItem(item?._id)}
                className="ml-6 text-red-500 hover:text-red-700"
              >
                Remove
              </button>
            </div>
          ))}

          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="flex justify-between items-center">
              <span className="text-xl font-bold">Total:</span>
              <span className="text-xl font-bold">${total.toFixed(2)}</span>
            </div>
            <button
              onClick={makePayment}
              disabled={cartItems.length === 0}
              className={`w-full mt-6 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors 
    ${cartItems.length === 0 ? "disabled:cursor-not-allowed disabled:opacity-50" : ""}`}
            >
              Checkout
            </button>
          </div>
        </>
      </div>
      <div className='flex items-center ml-[25%]'>
        {/*<Payment/>*/}
      </div>

    </>
  );
};

export default Cart;