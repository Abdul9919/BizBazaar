import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Menu, Package, Settings, Plus, User, LogOut, ChevronRight, Search, Trash2, Edit, Eye } from 'lucide-react';
import { AuthContext } from '../Contexts/AuthContext.jsx';

const Dashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('products');
  const useMobileResolution = () => {
    const [isMobile, setIsMobile] = useState(
      window.matchMedia("(max-width: 768px)").matches
    );
  
    useEffect(() => {
      const mediaQuery = window.matchMedia("(max-width: 768px)");
      const handleChange = () => setIsMobile(mediaQuery.matches);
  
      mediaQuery.addEventListener("change", handleChange);
      return () => mediaQuery.removeEventListener("change", handleChange);
    }, []);
  
    return isMobile;
  };

  const isMobile = useMobileResolution();
  const [state, setState] = useState(isMobile);
  const [isSidebarOpen, setSidebarOpen] = useState(state ? false : true);
  const [products, setProducts] = useState([]);
  const [newProduct, setNewProduct] = useState({
    name: '',
    price: '',
    description: '',
    quantity: '',
    image: null,
    user_id: user?.id || '',
    userName: user?.userName || '',
  });
  const [userSettings, setUserSettings] = useState({
    userName: user?.userName || '',
    email: user?.email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);


  // Get token from localStorage
  const token = localStorage.getItem('token');

  /*const useMobileResolution = () => {
    const [isMobile, setIsMobile] = useState(
      window.matchMedia("(max-width: 768px)").matches
    );
  
    useEffect(() => {
      const mediaQuery = window.matchMedia("(max-width: 768px)");
      const handleChange = () => setIsMobile(mediaQuery.matches);
  
      mediaQuery.addEventListener("change", handleChange);
      return () => mediaQuery.removeEventListener("change", handleChange);
    }, []);
  
    return isMobile;
  };*/

  //const isMobile = useMobileResolution();
  //const [state, setState] = useState(isMobile); 

  useEffect(() => {
    setState(isMobile); // Update state based on resolution
  }, [isMobile]);

  // Fetch products from API
  const fetchProducts = async () => {
    if (!user?.id || !token) return;
    
    setLoading(true);
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/products`, {
        headers: { authorization: `Bearer ${token}` }
      });
      
      // Filter products by user ID if needed
      const userProducts = response.data.allProducts.filter(product => {
        const productUserId = product.user_id?._id || product.user_id;
        return productUserId?.toString() === user.id.toString();
      });
      
      setProducts(userProducts);
      setError(null);
    } catch (err) {
      console.error('Fetch error:', err);
      setError(err.response?.data?.message || 'Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id && token) {
      fetchProducts();
    }
  }, [token, user?.id]);

  const handleAddProduct = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const formData = new FormData();
      
      // Add user reference
      formData.append('user_id', user.id);
      formData.append('userName', user.userName);
      
      // Add product details
      formData.append('name', newProduct.name);
      formData.append('price', newProduct.price);
      formData.append('description', newProduct.description);
      formData.append('quantity', newProduct.quantity);
      if (newProduct.image) {
        formData.append('image', newProduct.image);
      }
      
      // Send request to API
      await axios.post(`${process.env.REACT_APP_API_URL}/api/products`, formData, {
        headers: {
          authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      
      // Reset form
      setNewProduct({
        name: '',
        price: '',
        description: '',
        quantity: '',
        image: null,
        user_id: user.id,
        userName: user.userName,
      });
      
      setSuccess('Product added successfully!');
      
      // Refresh product list
      fetchProducts();
      
      // Switch to products tab
      setActiveTab('products');
    } catch (err) {
      console.error('Add product error:', err);
      setError(err.response?.data?.message || 'Failed to add product');
    } finally {
      setLoading(false);
      
      // Clear success/error message after 3 seconds
      setTimeout(() => {
        setSuccess(null);
        setError(null);
      }, 3000);
    }
  };

  const handleDeleteProduct = async (productId) => {
    try {
      await axios.delete(`${process.env.REACT_APP_API_URL}/api/products/${productId}`, {
        headers: { authorization: `Bearer ${token}` },
      });
      
      // Refresh product list
      fetchProducts();
      
      setSuccess('Product deleted successfully!');
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (err) {
      console.error('Delete product error:', err);
      setError(err.response?.data?.message || 'Failed to delete product');
      
      // Clear error message after 3 seconds
      setTimeout(() => {
        setError(null);
      }, 3000);
    }
  };

  const handleProductChange = (e) => {
    const { name, value } = e.target;
    setNewProduct({ ...newProduct, [name]: value });
  };

  const handleSettingsChange = (e) => {
    const { name, value } = e.target;
    setUserSettings({ ...userSettings, [name]: value });
  };

  const handleUpdateSettings = async (e) => {
    e.preventDefault();
    
    // Validate passwords match
    if (userSettings.newPassword !== userSettings.confirmPassword) {
      setError('New passwords do not match');
      return;
    }
    
    setLoading(true);
    setError(null);
    setSuccess(null);
  
    try {
      // Send PUT request to update user settings
      const response = await axios.put(
        `${process.env.REACT_APP_API_URL}/api/users/${user.id}`,  // Replace with actual user ID
        {
          userName: userSettings.userName,
          email: userSettings.email,
          currentPassword: userSettings.currentPassword,
          newPassword: userSettings.newPassword,
        },
        {
          headers: {
            authorization: `Bearer ${user.token}`,  // Pass token in header
            'Content-Type': 'application/json',
          },
        }
      );
  
      setSuccess(response.data.message || 'Settings updated successfully!');
      
      // Reset password fields
      setUserSettings((prev) => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      }));
  
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to update settings');
    } finally {
      setLoading(false);
    }
  };
  

  const handleLogout = () => {
    logout();
    // Redirect to login page or home page
    window.location.href = '/';
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div 
        className={`${
          isSidebarOpen ? 'lg:w-64' : 'md:w-20 sm:w-20'
        } bg-gradient-to-b from-slate-800 to-slate-500 text-white transition-all duration-300 ease-in-out flex flex-col`}
      >
        <div className="p-4 flex items-center justify-between border-b bg-slate-850">
          <h1 className={`font-bold text-xl ${!isSidebarOpen && 'hidden'}`}>Dashboard</h1>
          <button
            onClick={() => !state && setSidebarOpen(!isSidebarOpen)}
            className="p-1 rounded-md hover:bg-indigo-800 transition-colors"
          >
            <Menu size={24} />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto py-4">
          <nav className="px-2 space-y-1">
            <button
              onClick={() => setActiveTab('products')}
              className={`w-full flex items-center px-4 py-3 rounded-md transition-colors ${
                activeTab === 'products' 
                  ? 'bg-indigo-800 text-white' 
                  : 'text-indigo-100 hover:bg-indigo-800'
              }`}
            >
              <Package size={20} />
              {isSidebarOpen && <span className="ml-3">Your Products</span>}
            </button>
            
            <button
              onClick={() => setActiveTab('add-product')}
              className={`w-full flex items-center px-4 py-3 rounded-md transition-colors ${
                activeTab === 'add-product' 
                  ? 'bg-indigo-800 text-white' 
                  : 'text-indigo-100 hover:bg-indigo-800'
              }`}
            >
              <Plus size={20} />
              {isSidebarOpen && <span className="ml-3">Add Product</span>}
            </button>
            
            <button
              onClick={() => setActiveTab('settings')}
              className={`w-full flex items-center px-4 py-3 rounded-md transition-colors ${
                activeTab === 'settings' 
                  ? 'bg-indigo-800 text-white' 
                  : 'text-indigo-100 hover:bg-indigo-800'
              }`}
            >
              <Settings size={20} />
              {isSidebarOpen && <span className="ml-3">Settings</span>}
            </button>
          </nav>
        </div>
        
        <div className="p-4 border-t border-indigo-800">
          <div className={`flex items-center ${!isSidebarOpen && 'justify-center'}`}>
            <div className="flex-shrink-0">
              <div className="h-10 w-10 rounded-full bg-indigo-700 flex items-center justify-center">
                <User size={20} />
              </div>
            </div>
            {isSidebarOpen && (
              <div className="ml-3">
                <p className="text-sm font-medium">{user?.userName || 'User'}</p>
                <button 
                  onClick={handleLogout}
                  className="flex items-center text-xs text-indigo-300 hover:text-white"
                >
                  <LogOut size={14} className="mr-1" />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {/* Header */}
        <header className="bg-white shadow-sm">
          <div className="px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
            <div className="flex items-center">
              <h2 className="text-xl font-semibold text-gray-800">
                {activeTab === 'products' && 'Your Products'}
                {activeTab === 'add-product' && 'Add New Product'}
                {activeTab === 'settings' && 'Account Settings'}
              </h2>
            </div>
            
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={18} className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>
        </header>
        
        {/* Content */}
        <main className="p-6">
          {/* Notifications */}
          {error && (
            <div className="mb-4 bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded shadow-md">
              <div className="flex items-center">
                <span className="font-medium">Error:</span>
                <span className="ml-2">{error}</span>
              </div>
            </div>
          )}
          
          {success && (
            <div className="mb-4 bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded shadow-md">
              <div className="flex items-center">
                <span className="font-medium">Success:</span>
                <span className="ml-2">{success}</span>
              </div>
            </div>
          )}
          
          {/* Products Tab */}
          {activeTab === 'products' && (
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800">Your Products</h3>
                <p className="text-sm text-gray-600">Manage your product inventory</p>
              </div>
              
              {loading ? (
                <div className="p-6 text-center">
                  <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-indigo-600 border-r-transparent"></div>
                  <p className="mt-2 text-gray-600">Loading products...</p>
                </div>
              ) : products.length === 0 ? (
                <div className="p-6 text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-100 text-indigo-600 mb-4">
                    <Package size={32} />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900">No products yet</h3>
                  <p className="mt-1 text-gray-500">Get started by adding your first product.</p>
                  <button 
                    onClick={() => setActiveTab('add-product')}
                    className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    <Plus size={16} className="mr-2" />
                    Add Product
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Product
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Price
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Quantity
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {products.map((product) => (
                        <tr key={product._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="h-10 w-10 flex-shrink-0">
                                <img 
                                  className="h-10 w-10 rounded-md object-cover" 
                                  src={product.image} 
                                  alt={product.name} 
                                />
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{product.name}</div>
                                <div className="text-sm text-gray-500 truncate max-w-xs">{product.description}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">${parseFloat(product.price).toFixed(2)}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{product.quantity}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              product.quantity > 0 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {product.quantity > 0 ? 'In Stock' : 'Out of Stock'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex justify-end space-x-2">
                              <button 
                                className="text-indigo-600 hover:text-indigo-900 p-1 rounded-full hover:bg-indigo-50"
                                title="View details"
                              >
                                <Eye size={18} />
                              </button>
                              <button 
                                className="text-blue-600 hover:text-blue-900 p-1 rounded-full hover:bg-blue-50"
                                title="Edit product"
                              >
                                <Edit size={18} />
                              </button>
                              <button 
                                onClick={() => handleDeleteProduct(product._id)}
                                className="text-red-600 hover:text-red-900 p-1 rounded-full hover:bg-red-50"
                                title="Delete product"
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
          
          {/* Add Product Tab */}
          {activeTab === 'add-product' && (
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800">Add New Product</h3>
                <p className="text-sm text-gray-600">Fill in the details to add a new product to your inventory</p>
              </div>
              
              <div className="p-6">
                <form onSubmit={handleAddProduct}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="col-span-2 md:col-span-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Product Name
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={newProduct.name}
                        onChange={handleProductChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="Enter product name"
                      />
                    </div>
                    
                    <div className="col-span-2 md:col-span-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Price ($)
                      </label>
                      <input
                        type="number"
                        name="price"
                        value={newProduct.price}
                        onChange={handleProductChange}
                        required
                        min="0"
                        step="0.01"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="0.00"
                      />
                    </div>
                    
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description
                      </label>
                      <textarea
                        name="description"
                        value={newProduct.description}
                        onChange={handleProductChange}
                        required
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="Enter product description"
                      />
                    </div>
                    
                    <div className="col-span-2 md:col-span-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Quantity
                      </label>
                      <input
                        type="number"
                        name="quantity"
                        value={newProduct.quantity}
                        onChange={handleProductChange}
                        required
                        min="0"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="0"
                      />
                    </div>
                    
                    <div className="col-span-2 md:col-span-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Product Image
                      </label>
                      <div className="flex items-center">
                        <div className="flex-grow">
                          <input
                            type="file"
                            name="image"
                            onChange={(e) => setNewProduct({ ...newProduct, image: e.target.files[0] })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          />
                        </div>
                        {newProduct.image && (
                          <div className="ml-4 h-10 w-10 flex-shrink-0">
                            <img 
                              className="h-10 w-10 rounded-md object-cover" 
                              src={URL.createObjectURL(newProduct.image)} 
                              alt="Preview" 
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-8 flex justify-end">
                    <button
                      type="button"
                      onClick={() => setActiveTab('products')}
                      className="mr-3 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <span className="flex items-center">
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Processing...
                        </span>
                      ) : (
                        'Add Product'
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
          
          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800">Account Settings</h3>
                <p className="text-sm text-gray-600">Update your account information and password</p>
              </div>
              
              <div className="p-6">
                <form onSubmit={handleUpdateSettings}>
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-base font-medium text-gray-900 mb-4">Profile Information</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Username
                          </label>
                          <input
                            type="text"
                            name="userName"
                            value={userSettings.userName}
                            onChange={handleSettingsChange}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Email Address
                          </label>
                          <input
                            type="email"
                            name="email"
                            value={userSettings.email}
                            onChange={handleSettingsChange}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div className="pt-6 border-t border-gray-200">
                      <h4 className="text-base font-medium text-gray-900 mb-4">Change Password</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Current Password
                          </label>
                          <input
                            type="password"
                            name="currentPassword"
                            value={userSettings.currentPassword}
                            onChange={handleSettingsChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="Enter current password"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            New Password
                          </label>
                          <input
                            type="password"
                            name="newPassword"
                            value={userSettings.newPassword}
                            onChange={handleSettingsChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="Enter new password"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Confirm New Password
                          </label>
                          <input
                            type="password"
                            name="confirmPassword"
                            value={userSettings.confirmPassword}
                            onChange={handleSettingsChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="Confirm new password"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-8 flex justify-end">
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <span className="flex items-center">
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Saving...
                        </span>
                      ) : (
                        'Save Changes'
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;