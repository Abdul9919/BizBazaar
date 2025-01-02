const express = require('express')
const product = require('../models/product.model.js')
const {getProductByName,updateProductByName,deleteProductByName,getProducts, getProductById,deleteProductById, createProduct,updateProductById} = require('../controllers/productController.js')
const { model } = require('mongoose')
const multer = require('multer');
const router = express.Router()

const storage = multer.memoryStorage();
const upload = multer({ storage });

 router.get('/', getProducts)

 router.get('/:id', getProductById)

 router.get('/byname/:name', getProductByName)
 
 router.post('/', upload.single('image'), createProduct)

 router.put('/:id', updateProductById)

 router.put('/byname/:name', updateProductByName)

 router.delete('/:id', deleteProductById)

 router.delete('/byname/:name', deleteProductByName)

 module.exports = router