import Stripe from 'stripe';
import dotenv from 'dotenv'
dotenv.config()
const stripe = new Stripe(process.env.STRIPE_SECRET);

const createStripeSession = async (req, res) => {
    try {
        const { products } = req.body;
        
        const lineItems = products.map((product) => ({
            price_data: {
                currency: 'usd',
                product_data: {
                    name: product.product.name,
                    images: [product.product.image]
                },
                unit_amount: product.product.price * 100,
            },
            quantity: product.quantity
        }));

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: lineItems,
            mode: 'payment',
            success_url: `${process.env.FRONTEND_URL}/success`,
            cancel_url: `${process.env.FRONTEND_URL}/cancel`,
        })

        res.json({ id: session.id })

    } catch (error) {
        console.error("Stripe Error:", error);
        res.status(500).json({ error: error.message });
    }
}


export { createStripeSession }