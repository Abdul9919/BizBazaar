const Product = require('../models/product.model.js');

// Get all products or search products
const getProducts = async (req, res) => {
  try {
    const { search } = req.query;
    let filter = {};

    if (search) {
      filter.name = { $regex: search, $options: 'i' }; // Case-insensitive search
    }

    const allProducts = await Product.find(filter);
    res.status(200).json(allProducts);
  } catch (error) {
    console.error('Error fetching products:', error.message);
    res.status(500).json({ message: error.message });
  }
};

// Get a single product by ID
const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const singleProduct = await Product.findById(id);
    if (!singleProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.status(200).json(singleProduct);
  } catch (error) {
    console.error('Error fetching product by ID:', error.message);
    res.status(500).json({ message: error.message });
  }
};

// Get products by name
const getProductByName = async (req, res) => {
  try {
    const { name } = req.params;
    const products = await Product.find({
      name: { $regex: name, $options: 'i' }, // Case-insensitive partial match
    });
    if (products.length === 0) {
      return res.status(404).json({ message: 'No products found with that name' });
    }
    res.status(200).json(products);
  } catch (error) {
    console.error('Error fetching product by name:', error.message);
    res.status(500).json({ message: error.message });
  }
};

// Create a new product
const createProduct = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Image file is required' });
    }

    const newProduct = await Product.create({
      name: req.body.name,
      price: req.body.price,
      quantity: req.body.quantity,
      description: req.body.description,
      image: {
        filename: req.file.originalname,
        contentType: req.file.mimetype,
        imageBase64: req.file.buffer.toString('base64'),
      },
    });

    res.status(201).json(newProduct); // Use 201 for created
  } catch (error) {
    console.error('Error creating product:', error.message);
    res.status(500).json({ message: error.message });
  }
};

// Update a product by ID
const updateProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedProduct = await Product.findByIdAndUpdate(id, req.body, {
      new: true, // Return the updated document
      runValidators: true, // Validate updates
    });

    if (!updatedProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.status(200).json(updatedProduct);
  } catch (error) {
    console.error('Error updating product by ID:', error.message);
    res.status(500).json({ message: error.message });
  }
};

// Update a product by name
const updateProductByName = async (req, res) => {
  try {
    const { name } = req.params;
    const updatedProduct = await Product.findOneAndUpdate(
      { name: { $regex: `^${name}$`, $options: 'i' } }, // Exact case-insensitive match
      req.body,
      {
        new: true, // Return the updated document
        runValidators: true, // Validate updates
      }
    );

    if (!updatedProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.status(200).json(updatedProduct);
  } catch (error) {
    console.error('Error updating product by name:', error.message);
    res.status(500).json({ message: error.message });
  }
};

// Delete a product by ID
const deleteProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedProduct = await Product.findByIdAndDelete(id);

    if (!deletedProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.status(200).json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product by ID:', error.message);
    res.status(500).json({ message: error.message });
  }
};

// Delete a product by name
const deleteProductByName = async (req, res) => {
  try {
    const { name } = req.params;
    const deletedProduct = await Product.findOneAndDelete({
      name: { $regex: `^${name}$`, $options: 'i' }, // Exact case-insensitive match
    });

    if (!deletedProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.status(200).json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product by name:', error.message);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProductById,
  deleteProductById,
  getProductByName,
  updateProductByName,
  deleteProductByName,
};
