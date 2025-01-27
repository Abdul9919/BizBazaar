import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { AuthContext } from '../Contexts/AuthContext';

const Dashboard = () => {
    const { user } = React.useContext(AuthContext);
    const [products, setProducts] = useState([]);
    const [newProduct, setNewProduct] = useState({
        name: '',
        price: '',
        description: '',
        quantity: '',
        image: null,
        user_id: user.id, // User's ID from context
        userName: user.userName,
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const token = localStorage.getItem('token'); // Ensure the token is stored in localStorage

    const fetchProducts = async () => {
        if (!user?.id) return; // Changed to user.id

        setLoading(true);
        try {
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/products`, {
                headers: { authorization: `Bearer ${token}` }
            });

            const userProducts = response.data.filter(product => {
                // Convert both IDs to strings for reliable comparison
                const productUserId = product.user_id?._id || product.user_id;
                return productUserId?.toString() === user.id.toString();
            });

            console.log('Filtered products:', userProducts);
            setProducts(userProducts);
        } catch (err) {
            console.error('Fetch error:', err);
            setError(err.response?.data?.message || 'Failed to fetch products');
        } finally {
            setLoading(false);
        }
    };

    // Updated useEffect
    useEffect(() => {
        if (user?.id && token) { // Changed to user.id
            fetchProducts();
        }
    }, [token, user?.id]);// Proper dependencies

    const handleAddProduct = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        
        // Add user reference
        formData.append('user_id', user.id); // REQUIRED FIELD
        formData.append('userName', user.userName); // Optional but useful
        
        // Existing fields
        formData.append('name', newProduct.name);
        formData.append('price', newProduct.price);
        formData.append('description', newProduct.description);
        formData.append('quantity', newProduct.quantity);
        formData.append('image', newProduct.image);

        try {
            await axios.post(`${process.env.REACT_APP_API_URL}/api/products`, formData, {
                headers: {
                    authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data',
                },
            });
            setNewProduct({
                name: '',
                price: '',
                description: '',
                quantity: '',
                image: null,
            });
            window.location.reload();
            fetchProducts(); // Refresh product list
        } catch (err) {
            setError('Failed to add product');
        }
    };

    const handleDeleteProduct = async (productId) => {
        try {
            await axios.delete(`${process.env.REACT_APP_API_URL}/api/products/${productId}`, {
                headers: { authorization: `Bearer ${token}` },
            });
            fetchProducts();
        } catch (err) {
            setError('Failed to delete product');
        }
    };

    const handleProductChange = (e) => {
        const { name, value } = e.target;
        setNewProduct({ ...newProduct, [name]: value });
    };

    return (
        <div className="container mx-auto p-6 my-9">
            <h1 className="text-4xl font-bold text-center mb-6">User Dashboard</h1>

            {/* Add Product Form */}
            <div className="bg-white shadow-md p-6 rounded-lg mb-8">
                <h2 className="text-2xl font-semibold mb-4">Add Product</h2>
                <form onSubmit={handleAddProduct}>
                    <div className="mb-4">
                        <label className="block text-gray-700">Product Name</label>
                        <input
                            type="text"
                            name="name"
                            value={newProduct.name}
                            onChange={handleProductChange}
                            className="w-full p-3 border border-gray-300 rounded-lg"
                            placeholder="Enter product name"
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-gray-700">Price</label>
                        <input
                            type="number"
                            name="price"
                            value={newProduct.price}
                            onChange={handleProductChange}
                            className="w-full p-3 border border-gray-300 rounded-lg"
                            placeholder="Enter price"
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-gray-700">Description</label>
                        <textarea
                            name="description"
                            value={newProduct.description}
                            onChange={handleProductChange}
                            className="w-full p-3 border border-gray-300 rounded-lg"
                            placeholder="Enter product description"
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-gray-700">Quantity</label>
                        <input
                            type="number"
                            name="quantity"
                            value={newProduct.quantity}
                            onChange={handleProductChange}
                            className="w-full p-3 border border-gray-300 rounded-lg"
                            placeholder="Enter product quantity"
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-gray-700">Product Image</label>
                        <input
                            type="file"
                            name="image"
                            onChange={(e) => setNewProduct({ ...newProduct, image: e.target.files[0] })}
                            className="w-full p-3 border border-gray-300 rounded-lg"
                        />
                    </div>

                    <button type="submit" className="w-full bg-blue-500 text-white p-3 rounded-lg">
                        Add Product
                    </button>
                </form>
            </div>

            {/* Error Handling */}
            {error && <div className="text-red-500 text-center mb-4">{error}</div>}

            {/* Product List */}
            {loading ? (
                <div className="text-center">Loading products...</div>
            ) : (
                <div className="bg-white shadow-md p-6 rounded-lg">
                    <h2 className="text-2xl font-semibold mb-4">Your Products</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {products.length === 0 ? (
                            <p className="text-center">You have not added any products yet.</p>
                        ) : (
                            products.map((product) => (
                                <div key={product._id} className="border border-gray-300 rounded-lg p-4">
                                    <img
                                        src={product.image}
                                        alt={product.name}
                                        className="w-full h-40 object-cover mb-4 rounded-lg"
                                    />
                                    <h3 className="font-semibold text-lg">{product.name}</h3>
                                    <p className="text-gray-500">{product.description}</p>
                                    <p className="text-xl font-semibold mt-2">${product.price}</p>
                                    <p className="text-sm text-gray-600">
                                        Quantity: {product.quantity}
                                    </p>
                                    <p className="text-muted mt-2">
                                        Added by: <strong>{product.user_id ? product.user_id.userName : 'Unknown'}</strong>
                                    </p>

                                    <div className="mt-4 flex justify-between">
                                        <button
                                            className="bg-yellow-500 text-gray-700 px-4 py-2 rounded-lg"
                                            onClick={() => alert('Update Product functionality goes here')}
                                        >
                                            Update
                                        </button>
                                        <button
                                            className="bg-red-500 text-white px-4 py-2 rounded-lg"
                                            onClick={() => handleDeleteProduct(product._id)}
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
