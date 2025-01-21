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
    // If the user is authenticated, filter products by user_id
    const filter = req.user ? { user_id: req.user.id } : {};  // If no user, no filter applied

    const { search } = req.query;
    
    // If a search query is provided, filter products by name
    if (search) {
      filter.name = { $regex: search, $options: 'i' }; // Case-insensitive search
    }

    // Fetch products based on the filter criteria
    const allProducts = await Product.find(filter)
      .populate('user_id', 'userName')
      .exec();

    res.status(200).json(allProducts); // Return the fetched products
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
      name: { $regex: name, $options: 'i' },
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
    if (!req.user) {
      return res.status(401).json({ message: 'User is not authenticated' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'Image file is required' });
    }

    const imagePath = `/uploads/${req.file.filename}`;

    const newProduct = await Product.create({
      name: req.body.name,
      price: req.body.price,
      quantity: req.body.quantity,
      description: req.body.description,
      image: imagePath,
      user_id: req.user.id,
      userName: req.user.userName,
    });

    res.status(201).json({
      message: 'Product created successfully',
      product: {
        ...newProduct.toObject(),
        image: `${req.protocol}://${req.get('host')}${imagePath}`,
      },
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

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    if (product.user_id.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized action' });
    }

    const updatedProduct = await Product.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json(updatedProduct);
  } catch (error) {
    console.error('Error updating product:', error.message);
    res.status(500).json({ message: error.message });
  }
};

// Update a product by name
const updateProductByName = async (req, res) => {
  try {
    const { name } = req.params;
    const updatedProduct = await Product.findOneAndUpdate(
      { name: { $regex: `^${name}$`, $options: 'i' } },
      req.body,
      {
        new: true,
        runValidators: true,
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

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    if (product.user_id.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized action' });
    }

    await Product.findByIdAndDelete(id);
    res.status(200).json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error.message);
    res.status(500).json({ message: error.message });
  }
};

// Delete a product by name
const deleteProductByName = async (req, res) => {
  try {
    const { name } = req.params;
    const deletedProduct = await Product.findOneAndDelete({
      name: { $regex: `^${name}$`, $options: 'i' },
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
  deleteProductByName, // Ensure this function is exported
  upload
};
