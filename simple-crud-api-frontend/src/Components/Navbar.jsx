import React, { useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom'; // Import Link
import { AuthContext } from './AuthContext';
import icon from '../Assets/favicon.png';
import { FaSearch, FaUser, FaBars, FaTimes } from 'react-icons/fa';

export const Navbar = ({ onProductsFetched }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [username, setUsername] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { isAuthenticated, logout, user } = useContext(AuthContext);

  // ... (keep your existing useEffect and other logic unchanged)

  return (
    <nav className="rounded-lg flex items-center justify-between bg-gradient-to-tr from-slate-950 to-slate-500 px-6 py-4">
      {/* Left Section */}
      <div className="flex items-center space-x-6">
        <Link to="/"> {/* Replace <a> with <Link> for the logo */}
          <img src={icon} alt="" className="h-10 w-10 mr-1" />
        </Link>
        <Link to="/" className="text-white text-2xl font-bold m-0"> {/* Replace <a> */}
          Biz Bazaar
        </Link>

        {/* Hamburger Icon */}
        <div className="lg:hidden">
          <button onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <FaTimes className="text-white text-2xl" /> : <FaBars className="text-white text-2xl" />}
          </button>
        </div>

        {/* Menu Items - Replace <a> with <Link> */}
        <ul className={`flex space-x-4 ${menuOpen ? 'block' : 'hidden'} lg:flex`}>
          <li>
            <Link 
              to="/" 
              className="relative text-stone-600 hover:text-white text-lg font-medium border-slate-400 py-2 px-4 rounded-lg group focus:outline-none overflow-hidden bg-slate-200"
            >
              <span className="absolute inset-0 bg-slate-700 transition-all duration-800 ease-in-out transform scale-x-0 group-hover:scale-x-100 origin-left rounded-lg"></span>
              <span className="relative z-10">Home</span>
            </Link>
          </li>
          <li>
            <Link 
              to="/about" // Update to your actual route
              className="relative text-stone-600 hover:text-white text-lg font-medium border-slate-400 py-2 px-4 rounded-lg group focus:outline-none overflow-hidden bg-slate-200"
            >
              <span className="absolute inset-0 bg-slate-700 transition-all duration-800 ease-in-out transform scale-x-0 group-hover:scale-x-100 origin-left rounded-lg"></span>
              <span className="relative z-10">About</span>
            </Link>
          </li>
          <li>
            <Link 
              to="/services" // Update to your actual route
              className="relative text-stone-600 hover:text-white text-lg font-medium border-slate-400 py-2 px-4 rounded-lg group focus:outline-none overflow-hidden bg-slate-200"
            >
              <span className="absolute inset-0 bg-slate-700 transition-all duration-800 ease-in-out transform scale-x-0 group-hover:scale-x-100 origin-left rounded-lg"></span>
              <span className="relative z-10">Services</span>
            </Link>
          </li>
          <li>
            <Link 
              to="/contact" // Update to your actual route
              className="relative text-stone-600 hover:text-white text-lg font-medium border-slate-200 py-2 px-4 rounded-lg group focus:outline-none overflow-hidden bg-slate-200"
            >
              <span className="absolute inset-0 bg-slate-700 transition-all duration-800 ease-in-out transform scale-x-0 group-hover:scale-x-100 origin-left rounded-lg"></span>
              <span className="relative z-10">Contact</span>
            </Link>
          </li>
        </ul>
      </div>

      {/* Right Section - Keep buttons as-is (they use navigate()) */}
      <div className="flex items-center space-x-6">
        {/* ... (rest of your existing code for search and auth buttons) */}
      </div>
    </nav>
  );
};
