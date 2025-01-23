import express from 'express';
import cors from 'cors';
import session from 'express-session';
import mongoose from 'mongoose';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
dotenv.config();

import connectDB from './database/db.js';
import productRoutes from './routes/product.routes.js';
import userRoutes from './routes/userRoutes.js';
import Product from './models/product.model.js';
import User from './models/userModel.js';

// ES Module-compatible __dirname
const __dirname = path.dirname(decodeURIComponent(new URL(import.meta.url).pathname).substring(1));

const port = process.env.PORT || 5000;
const app = express();

// Middleware
app.use(express.json());
app.use(cors({
  origin: process.env.FRONTEND_URL, // Replace with your frontend URL
}));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Connect to Database
connectDB();

// AdminJS setup
(async () => {
  try {
    const { default: AdminJS } = await import('adminjs');
    const AdminJSExpress = await import('@adminjs/express');
    const AdminJSMongoose = await import('@adminjs/mongoose');
    const { uploadFeature } = await import('@adminjs/upload');  // Using correct import

    AdminJS.registerAdapter({
      Resource: AdminJSMongoose.Resource,
      Database: AdminJSMongoose.Database,
    });

    // Create the 'uploads' directory if it doesn't exist
    const uploadDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // AdminJS configuration
    const adminJs = new AdminJS({
      databases: [],
      rootPath: '/admin',
      resources: [
        {
          resource: Product,
          options: {
            properties: {
              name: { isTitle: true }, // Used as the title in AdminJS UI
              price: { isRequired: true },
              imageUrl: {
                isVisible: { list: true, show: true, edit: false },
                type: 'string',
              },
              imageFilename: { isVisible: false },
              imageContentType: { isVisible: false },
              createdAt: { isVisible: { list: true, filter: true, show: true, edit: false } },
              updatedAt: { isVisible: { list: true, filter: true, show: true, edit: false } },
            },
          },
          features: [
            uploadFeature({
              provider: {
                local: {
                  bucket: uploadDir, // Directory to store images
                },
              },
              properties: {
                key: 'imageFilename', // Field to store the filename
                mimeType: 'imageContentType', // Field to store the MIME type
                bucket: 'imageUrl', // Field to store the accessible URL
              },
              validation: {
                mimeTypes: ['image/png', 'image/jpeg', 'image/gif'], // Allowed MIME types
              },
              uploadPath: (record, filename) => {
                const uniqueFolder = record.id || new Date().getTime();
                return `${uniqueFolder}/${filename}`;
              },
            }),
          ],
        },
        {
          resource: User,
          options: {
            properties: {
              name: { isTitle: true },
              email: { isRequired: true },
            },
          },
        },
      ],
      branding: {
        companyName: 'My Admin Panel',
        logo: '/uploads/admin-logo.png', // Optional custom logo
        favicon: '/uploads/favicon.ico',
      },
      dashboard: {
        handler: async () => {
          const numberOfProducts = await Product.countDocuments();
          const numberOfUsers = await User.countDocuments();
          return { numberOfProducts, numberOfUsers };
        },
        component: 'DashboardComponent', // Custom component reference
      },
    });

    // Build and mount AdminJS router
    const adminRouter = AdminJSExpress.buildRouter(adminJs);
    app.use(adminJs.options.rootPath, adminRouter);
  } catch (error) {
    console.error('Error setting up AdminJS:', error);
  }
})();

// Session middleware
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'mysecretkey',
    resave: false,
    saveUninitialized: true,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
    },
  })
);

app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes);

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
