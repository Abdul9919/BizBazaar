import mongoose from "mongoose";
import express from 'express'
import Cart from '../models/cartModel.js'
import Product from "../models/product.model.js";

const getCartItems = async (req, res) => {
    try {
        const user = req.user;
        const cartItems = await Cart.find({ user: user._id }).populate('product');
        res.status(200).json(cartItems);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }

}

const addItemToCart = async (req, res) => {
    try {

        if (!req.user) {
            return res.status(401).json({ message: "Unauthorized - Please login first" });
        }

        const user = req.user;
        const { product, quantity } = req.body;

        if (!product || !quantity) {
            return res.status(400).json({ message: "Product ID and quantity are required" });
        }

        // Check if product exists
        const matchedProduct = await Product.findById(product);
        if (!matchedProduct) {
            return res.status(404).json({ message: "Product not found" });
        }

        // Check for existing cart item
        const existingCartItem = await Cart.findOne({ 
            user: user._id, 
            product: product 
        });

        if (existingCartItem) {
            // Update quantity and total price
            existingCartItem.quantity += quantity;
            existingCartItem.totalPrice = matchedProduct.price * existingCartItem.quantity;
            await existingCartItem.save();
            
            return res.status(200).json({
                success: true,
                message: "Cart item quantity updated",
                cartItem: existingCartItem
            });
        }

        // Create new cart item if it doesn't exist
        const newCartItem = await Cart.create({
            user: user._id,
            product,
            quantity,
            totalPrice: matchedProduct.price * quantity
        });

        res.status(200).json({
            success: true,
            message: "Product added to cart successfully",
            cartItem: newCartItem
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}


const deleteItemFromCart = async (req, res) => {
    try {
        const { id } = req.params;
        const user = req.user;
        const cartItem = await Cart.findById(id);
        if (cartItem.user.toString() !== user._id.toString()) {
            return res.status(403).json({ message: 'Unauthorized action' });
        }
        await Cart.findByIdAndDelete(id);
        res.status(200).json({ message: 'Item removed from cart' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const updateCartItem = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: "Unauthorized - Please login first" });
        }

        const { id } = req.params; // Cart item ID from the request URL
        const { quantity } = req.body;

        if (!quantity || quantity < 1) {
            return res.status(400).json({ message: "Invalid quantity" });
        }

        // Find the cart item
        const cartItem = await Cart.findById(id).populate("product");
        if (!cartItem) {
            return res.status(404).json({ message: "Cart item not found" });
        }

        // Update quantity and total price
        cartItem.quantity = quantity;
        cartItem.totalPrice = cartItem.product.price * quantity;
        await cartItem.save();

        res.status(200).json({
            success: true,
            message: "Cart item updated successfully",
            cartItem,
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export {
    getCartItems,
    addItemToCart,
    deleteItemFromCart,
    updateCartItem
}