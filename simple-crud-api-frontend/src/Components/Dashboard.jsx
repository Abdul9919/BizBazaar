import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Dashboard = () => {
    const [products, setProducts] = useState([]);
    const [newProduct, setNewProduct] = useState({
        name: '',
        price: '',
        description: '',
        quantity: '',
        image: null,
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const token = localStorage.getItem('token');  // Get JWT token from localStorage

    // Define fetchProducts function outside of useEffect
    const fetchProducts = async () => {
        setLoading(true);
        try {
            const response = await axios.get('/api/products', {
                headers: { authorization: `Bearer ${token}` },
            });
            setProducts(response.data);
        } catch (err) {
            setError('Failed to fetch products');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts(); // Call fetchProducts once on component mount
    }, [token]);

    const handleAddProduct = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('name', newProduct.name);
        formData.append('price', newProduct.price);
        formData.append('description', newProduct.description);
        formData.append('image', newProduct.image);
        formData.append('quantity', newProduct.quantity);

        try {
            await axios.post('/api/products', formData, {
                headers: {
                    authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data',
                },
            });
            setNewProduct({ quantity: '', name: '', price: '', description: '', image: null });
            fetchProducts();  // Refresh product list
        } catch (err) {
            setError('Failed to add product');
        }
    };

    const handleDeleteProduct = async (productId) => {
        try {
            await axios.delete(`/api/products/${productId}`, {
                headers: { authorization: `Bearer ${token}` },
            });
            fetchProducts();  // Refresh product list
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
                <h2 className="text-2xl font-semibold mb-4 text-black-500">Add Product</h2>
                <form onSubmit={handleAddProduct}>
                    <div className="mb-4">
                        <label className="block text-black-700">Product Name</label>
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
                        <textarea
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

                    <button type="submit" className="w-full bg-blue-500 text-gray-700 p-3 rounded-lg">
                        Add Product
                    </button>
                </form>
            </div>

            {/* Error handling */}
            {error && <div className="text-red-500 text-center mb-4">{error}</div>}

            {/* Product List */}
            {loading ? (
                <div className="text-center">Loading products...</div>
            ) : (
                <div className="bg-white shadow-md p-6 rounded-lg">
                    <h2 className="text-2xl font-semibold mb-4">Your Products</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {products.map((product) => (
                            <div key={product._id} className="border border-gray-300 rounded-lg p-4">
                                <img
                                    src={product.image}
                                    alt={product.name}
                                    className="w-20 h-20 object-cover mb-4 rounded-lg"
                                    style={{height: '8rem', width: '8rem'}}
                                />


                                <h3 className="font-semibold text-lg">{product.name}</h3>
                                <p className="text-gray-500">{product.description}</p>
                                <p className="text-xl font-semibold mt-2">${product.price}</p>
                                <p className="text-xl font-semibold mt-2">{product.quantity}</p>

                                <div className="mt-4 flex justify-between">
                                    <button
                                        className="bg-yellow-500 text-gray-700 px-4 py-2 rounded-lg"
                                        onClick={() => alert('Update Product functionality goes here')}
                                    >
                                        Update
                                    </button>
                                    <button
                                        className="bg-red-500 text-gray-700 px-4 py-2 rounded-lg"
                                        onClick={() => handleDeleteProduct(product._id)}
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;