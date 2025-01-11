import React, { useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from './AuthContext';

export const Navbar = ({ onProductsFetched }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [username, setUsername] = useState('');
    const navigate = useNavigate();
    const { isAuthenticated, logout, user } = useContext(AuthContext);  // Destructure `user` too

    useEffect(() => {
        const storedUsername = localStorage.getItem('username');
        if (storedUsername) {
            setUsername(storedUsername);
        }
    }, []);

    // Debugging: check isAuthenticated value
    useEffect(() => {
        console.log('isAuthenticated:', isAuthenticated);
    }, [isAuthenticated]);

    const handleSearch = async (event) => {
        event.preventDefault();
        if (searchTerm.trim()) {
            try {
                const response = await axios.get(`/api/products?search=${searchTerm}`);
                console.log('Fetched products:', response.data);
                onProductsFetched(response.data);
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
        <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
            <div className="container-fluid">
                <a className="navbar-brand" href="/">Biz Bazaar</a>
                <button
                    className="navbar-toggler"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#navbarNav"
                    aria-controls="navbarNav"
                    aria-expanded="false"
                    aria-label="Toggle navigation"
                >
                    <span className="navbar-toggler-icon"></span>
                </button>
                <div className="collapse navbar-collapse" id="navbarNav">
                    <ul className="navbar-nav me-auto">
                        <li className="nav-item">
                            <a className="nav-link active" aria-current="page" href="/">Home</a>
                        </li>
                        <li className="nav-item">
                            <a className="nav-link" href="/">About</a>
                        </li>
                        <li className="nav-item">
                            <a className="nav-link" href="/">Services</a>
                        </li>
                        <li className="nav-item">
                            <a className="nav-link" href="/">Contact</a>
                        </li>
                    </ul>

                    <form className="d-flex me-2" onSubmit={handleSearch}>
                        <input
                            className="form-control me-2"
                            type="search"
                            placeholder="Search"
                            aria-label="Search"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <button className="btn btn-outline-light" type="submit">
                            Search
                        </button>
                    </form>

                    {isAuthenticated ? (
                        <div className="d-flex align-items-center">
                            <span className="navbar-text text-light me-2">Welcome, {username}</span>
                            <button
                                className="btn btn-outline-light"
                                type="button"
                                onClick={handleLogout}
                            >
                                Logout
                            </button>
                            <button
                                className="btn btn-outline-light ms-2"
                                type="button"
                                onClick={handleDashboardClick}  // Add this click handler
                            >
                                Dashboard
                            </button>
                        </div>
                    ) : (
                        <div className="d-flex">
                            <button
                                className="btn btn-outline-light me-2"
                                type="button"
                                onClick={() => navigate('/login')}
                            >
                                Login
                            </button>
                            <button
                                className="btn btn-outline-light"
                                type="button"
                                onClick={() => navigate('/register')}
                            >
                                Register
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
};
