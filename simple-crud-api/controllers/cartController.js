import mongoose from "mongoose";
import express from 'express'
import Cart from '../models/cartModel.js'

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
        const user = req.user;
        const { product, quantity } = req.body;
        const cartItem = await Cart.create({
            user: user._id,
            product,
            quantity
        })
        res.status(200).json({
            success: true,
            message: "Product added to cart successfully",
            cartItem
          });
    }
    
    catch (error) {
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

export {
    getCartItems,
    addItemToCart,
    deleteItemFromCart
}