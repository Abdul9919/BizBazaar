const product = require('../models/product.model.js');

const getProducts = async (req, res) => {
  try {
    const { search } = req.query;
    let filter = {};

    if (search) {
      filter.name = { $regex: search, $options: 'i' }; // case-insensitive search
    }

    // Fetch the products based on the filter (empty filter returns all products)
    const allProducts = await product.find(filter);
    res.status(200).json(allProducts);
  } catch (error) {
    console.error('Error fetching products:', error.message);
    res.status(500).json({ message: error.message });
  }
};




const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const singleProduct = await product.findById(id);
    if (!singleProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.status(200).json(singleProduct);
  } catch (error) {
    console.error('Error fetching product by ID:', error.message);
    res.status(500).json({ message: error.message });
  }
};

const getProductByName = async (req, res) => {
  try {
    const { name } = req.params;
    const products = await product.find({
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

const createProduct = async (req, res) => {
  try {
    const newProduct = await product.create(req.body);
    res.status(201).json(newProduct); // Use 201 for created
  } catch (error) {
    console.error('Error creating product:', error.message);
    res.status(500).json({ message: error.message });
  }
};

const updateProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedProduct = await product.findByIdAndUpdate(id, req.body, {
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

const updateProductByName = async (req, res) => {
  try {
    const { name } = req.params;
    const updatedProduct = await product.findOneAndUpdate(
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

const deleteProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedProduct = await product.findByIdAndDelete(id);

    if (!deletedProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.status(200).json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product by ID:', error.message);
    res.status(500).json({ message: error.message });
  }
};

const deleteProductByName = async (req, res) => {
  try {
    const { name } = req.params;
    const deletedProduct = await product.findOneAndDelete({
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
