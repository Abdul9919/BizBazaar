import Product from '../models/product.model.js';
import path from 'path';
import multer from 'multer';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Directory to save the images
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  },
});
const upload = multer({ storage });
// Get all products or search products
const getProducts = async (req, res) => {
  try {
    const { search } = req.query;
    let filter = {};

    // If search query exists, apply a case-insensitive search filter
    if (search) {
      filter.name = { $regex: search, $options: 'i' }; // Case-insensitive search
    }

    // Fetch products and populate the `user` field to get the username
    const allProducts = await Product.find(filter)
      .populate('user_id', 'userName')  // Populate username from User model using the user_id
      .exec();

    // Send the products with the username included
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
    // Ensure the user is authenticated (you might already have middleware for that)
    if (!req.user) {
      return res.status(401).json({ message: 'User is not authenticated' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'Image file is required' });
    }

    // Generate image URL from uploaded file
    const imageUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;

    // Create a new product, including the logged-in user's username
    const newProduct = await Product.create({
      name: req.body.name,
      price: req.body.price,
      quantity: req.body.quantity,
      description: req.body.description,
      image: imageUrl,
      user_id: req.user.id,     // Assuming the user ID is available in req.user
      userName: req.user.userName, // Get the logged-in user's username from req.user
    });

    // Send a success response with the created product
    res.status(201).json({
      message: 'Product created successfully',
      product: newProduct,
    });
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

export {
  getProducts,
  getProductById,
  createProduct,
  updateProductById,
  deleteProductById,
  getProductByName,
  updateProductByName,
  deleteProductByName,
  upload
};
