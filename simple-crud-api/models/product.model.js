import mongoose from 'mongoose';

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
    description: {
      type: String,
      required: false,
    },
    image: { type: String },
 /*   },
    imageFilename: { 
      type: String, // Store the filename of the uploaded image
      required: false,
    },
    imageContentType: { 
      type: String, // Store the content type of the uploaded image
      required: false,
    },*/
  },
  {
    timestamps: true,
  }
);

const product = mongoose.model('Product', productSchema);
export default product;
