import mongoose from 'mongoose'

const cartSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, required: true },
    totalPrice : {type:Number, required: true},
    timestamp: { type: Date, default: Date.now }
})

const Cart = mongoose.model('Cart', cartSchema)
export default Cart