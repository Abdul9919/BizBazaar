import React, { useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../Contexts/AuthContext';
import icon from '../../Assets/favicon.png';
import { FaSearch, FaUser, FaBars, FaTimes, FaShoppingCart } from 'react-icons/fa';
import { SocketProvider } from '../Contexts/socketContext';
import NotificationIcon from '../NotificationIcon';

export const Navbar = ({ onProductsFetched, products, currentPage }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [username, setUsername] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { isAuthenticated, logout, user } = useContext(AuthContext);

  useEffect(() => {
    const fetchUsername = async () => {
      if (user?.id) {
        try {
          const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/users/profile/${user.id}`);
          setUsername(response.data.userName);
        } catch (error) {
          console.error('Error fetching username:', error.message);
        }
      }
    };

    fetchUsername();
  }, [user]);

  const handleSearch = async (event) => {
    event.preventDefault();
    if (searchTerm.trim()) {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/products?search=${searchTerm}`);
        onProductsFetched(response.data.allProducts);
      } catch (error) {
        console.error('Error fetching products:', error.message);
        alert('Failed to fetch products.');
      }
    } else {
      alert('Please enter a search term!');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleDashboardClick = () => {
    if (isAuthenticated) {
      navigate('/dashboard');
    } else {
      navigate('/login');
    }
  };

  return (
    <nav className="flex flex-wrap items-center gap-4 bg-gradient-to-tr from-slate-950 to-slate-500 px-4 py-3 md:px-6 md:py-4">
      {/* Left Section */}
      <div className="flex items-center justify-between w-full md:w-auto">
        <div className="flex items-center space-x-4 md:space-x-6">
          <Link to="/">
            <img src={icon} alt="" className="h-8 w-8 md:h-10 md:w-10" />
          </Link>
          <Link
            to="/"
            onClick={async (e) => {
              e.preventDefault(); // Prevent default navigation behavior
              try {
                const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/products`, {
                  params: {
                    page: currentPage,
                    limit: 8,
                  },
                });
                onProductsFetched(response.data.allProducts);
                navigate('/'); // Navigate to the home page without reloading
              } catch (error) {
                console.error('Error fetching products:', error.message);
              }
            }}
            className="text-white text-xl md:text-2xl font-bold"
          >
            Biz Bazar
          </Link>
        </div>

        {/* Hamburger Icon - Mobile Only */}
        <div className="md:hidden">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="text-white hover:text-gray-300 focus:outline-none"
          >
            {menuOpen ? <FaTimes className="text-2xl" /> : <FaBars className="text-2xl" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`w-full md:w-auto md:flex md:items-center ${menuOpen ? 'block' : 'hidden'}`}>
        <div className="flex flex-col md:flex-row md:items-center gap-4 mt-4 md:mt-0">
          {/* Navigation Links */}

          {/* Search Form - Mobile */}
          <form className="md:hidden flex flex-col space-y-2" onSubmit={handleSearch}>
            <div className="flex items-center space-x-2">
              <FaSearch className="text-slate-300 text-lg" />
              <input
                className="px-3 py-2 rounded-lg border border-gray-300 text-gray-700 flex-grow"
                type="search"
                placeholder="Search"
                aria-label="Search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button
              className="relative text-stone-800 hover:text-white px-4 py-2 rounded-lg overflow-hidden group bg-slate-200 w-full"
              type="submit"
              onClick={() => navigate('/')}
            >
              <span className="absolute inset-0 bg-slate-700 transition-all duration-800 ease-in-out transform scale-x-0 group-hover:scale-x-100 origin-left"></span>
              <span className="relative z-10">Search</span>
            </button>
          </form>

          {/* Auth Buttons - Mobile */}
          <div className="md:hidden flex flex-col space-y-4">
            {isAuthenticated ? (
              <>
                <span className="text-white text-center">
                  Welcome, <span className='text-zinc-800 font-bold text-lg'>{username}</span>
                </span>
                <button
                  className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-400 w-full"
                  type="button"
                  onClick={handleLogout}
                >
                  Logout
                </button>
                <button
                  className="bg-gray-700 text-white px-4 py-2 rounded-lg hover:bg-gray-600 w-full"
                  type="button"
                  onClick={handleDashboardClick}
                >
                  Dashboard
                </button>
                <button
                  onClick={() => navigate('/my-cart')}
                  className="text-white flex items-center gap-2 w-full justify-center py-2 hover:bg-slate-700 rounded-lg"
                >
                  <FaShoppingCart size={24} color="white" />
                  <span>My Cart</span>
                </button>
                <SocketProvider>
                  <NotificationIcon className='ml-[50%]' />
                </SocketProvider>


              </>
            ) : (
              <>
                <button
                  className="relative text-white transition-all text-lg font-medium border-slate-400 py-2 px-4 rounded-lg group focus:outline-none overflow-hidden bg-stone-950 w-full"
                  type="button"
                  onClick={() => navigate('/login')}
                >
                  <span className="absolute inset-0 bg-slate-200 transition-all duration-800 ease-in-out transform scale-x-0 group-hover:scale-x-100 origin-left rounded-lg"></span>
                  <span className="relative z-10 hover:text-stone-600 transition">Login</span>
                </button>
                <button
                  className="relative text-white text-lg font-medium border-slate-400 py-2 px-4 rounded-lg group focus:outline-none overflow-hidden bg-stone-950 w-full"
                  type="button"
                  onClick={() => navigate('/register')}
                >
                  <span className="absolute inset-0 bg-slate-200 transition-all duration-800 ease-in-out transform scale-x-0 group-hover:scale-x-100 origin-left rounded-lg"></span>
                  <span className="relative z-10 hover:text-stone-600 transition">Register</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Desktop Right Section */}
      <div className="hidden lg:flex items-center space-x-6 w-[80%]">
        <form className="flex items-center space-x-2" onSubmit={handleSearch}>
          <FaSearch className="text-slate-300 text-lg" />
          <input
            className="pl-3 pr-[15rem] py-2 rounded-lg border border-gray-300 text-gray-700 w-[75%]"
            type="search"
            placeholder="Search"
            aria-label="Search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button
            className="relative text-stone-800 hover:text-white px-4 py-2 rounded-lg overflow-hidden group bg-slate-200"
            type="submit"
            onClick={() => navigate('/')}
          >
            <span className="absolute inset-0 bg-slate-700 transition-all duration-800 ease-in-out transform scale-x-0 group-hover:scale-x-100 origin-left"></span>
            <span className="relative z-10">Search</span>
          </button>
        </form>

        {isAuthenticated ? (
          <div className="flex items-center space-x-4">
            <span className="text-white">
              Welcome, <span className='text-zinc-800 font-bold text-lg'>{username}</span>
            </span>
            <button
              className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-400"
              type="button"
              onClick={handleLogout}
            >
              Logout
            </button>
            <button
              className="bg-gray-700 text-white px-4 py-2 rounded-lg hover:bg-gray-600 flex items-center space-x-2"
              type="button"
              onClick={handleDashboardClick}
            >
              <FaUser className="text-white text-sm" />
              <span>Dashboard</span>
            </button>
            <button
              onClick={() => navigate('/my-cart')}
              className='flex items-center space-x-2 text-white gap-2 text-md font-semibold hover:scale-110 transition-transform duration-300'
            >
              <FaShoppingCart size={30} color="white" />
              My Cart
            </button>
            <SocketProvider>
              <NotificationIcon className='ml-[50%]' />
            </SocketProvider>
          </div>
        ) : (
          <div className="flex items-right space-x-4" style={{ marginLeft: '15rem' }}>
            <button
              className="relative text-white transition-all text-lg font-medium border-slate-400 py-2 px-4 rounded-lg group focus:outline-none overflow-hidden bg-stone-950"
              type="button"
              onClick={() => navigate('/login')}
            >
              <span className="absolute inset-0 bg-slate-200 transition-all duration-800 ease-in-out transform scale-x-0 group-hover:scale-x-100 origin-left rounded-lg"></span>
              <span className="relative z-10 hover:text-stone-600 transition">Login</span>
            </button>
            <button
              className="relative text-white text-lg font-medium border-slate-400 py-2 px-4 rounded-lg group focus:outline-none overflow-hidden bg-stone-950"
              type="button"
              onClick={() => navigate('/register')}
            >
              <span className="absolute inset-0 bg-slate-200 transition-all duration-800 ease-in-out transform scale-x-0 group-hover:scale-x-100 origin-left rounded-lg"></span>
              <span className="relative z-10 hover:text-stone-600 transition">Register</span>
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};
