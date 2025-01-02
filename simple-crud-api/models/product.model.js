const mongoose = require('mongoose')

const productSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Please enter product name'],
        },
        quantity: {
            type: Number,
            required: true,
            default: 0,
        },
        price: {
            type: Number,
            required: true,
            default: 0,
        },
        description : {
            type: String,
            required: false,
        },
        image: {
            filename: { type: String, required: true },
            contentType: { type: String, required: true },
            imageBase64: { type: String, required: true },
        }
    },
    {
        timestamps: true,
    }
)

const product = mongoose.model('Product', productSchema)
module.exports = product