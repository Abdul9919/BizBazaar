import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();

// Import models FIRST
import './models/userModel.js'; // Force model registration
import './models/product.model.js';

// Connect to MongoDB
import connectDB from './database/db.js';
await connectDB();

// Now import other dependencies
import session from 'express-session';
import path from 'path';
import http from 'http';
import productRoutes from './routes/product.routes.js';
import userRoutes from './routes/userRoutes.js';
import { initSocket } from './webSocket/socket.js';

const __dirname = path.dirname(decodeURIComponent(new URL(import.meta.url).pathname).substring(1));

const port = process.env.PORT || 5000;
const app = express();
const server = http.createServer(app);

const allowedOrigins = [
  ...(process.env.FRONTEND_URL ? process.env.FRONTEND_URL.split(',') : []),
  'http://localhost:3000',
  'http://192.168.18.41:3000'
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`Origin ${origin} not allowed by CORS`));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ['Content-Type', 'authorization', 'Cache-Control']
}));

app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  }
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, authorization');
  next();
});

initSocket(server);

app.use(session({
  secret: process.env.SESSION_SECRET || 'mysecretkey',
  resave: false,
  saveUninitialized: true,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
  },
}));

// Routes setup AFTER models and DB connection
app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes);

app.get('/', (req, res) => {
  res.send('Chat Server Running');
});

server.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
  console.log('Allowed origins:', allowedOrigins);
});