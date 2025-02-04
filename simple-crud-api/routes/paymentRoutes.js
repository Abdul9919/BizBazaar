import dotenv from 'dotenv'
dotenv.config()
import axios from 'axios'
import express from 'express'
const router = express.Router()

import {createStripeSession} from '../controllers/paymentController.js'



router.post('/create-checkout-session', createStripeSession)


export default router