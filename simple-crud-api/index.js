const express = require('express');
const cors = require('cors');
const session = require('express-session');
const mongoose = require('mongoose');
const productRoutes = require('./routes/product.routes.js');
const userRoutes = require('./routes/userRoutes');
const product = require('./models/product.model.js');
const user = require('./models/userModel.js');
require('dotenv').config();
const connectDB = require('./database/db');

const port = process.env.PORT || 5000;
const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Connect to Database
connectDB();

// AdminJS setup
(async () => {
  const { default: AdminJS } = await import('adminjs');
  const AdminJSExpress = await import('@adminjs/express');
  const AdminJSMongoose = await import('@adminjs/mongoose');

  // Register Mongoose adapter
  AdminJS.registerAdapter({
    Resource: AdminJSMongoose.Resource,
    Database: AdminJSMongoose.Database,
  });

  const adminJs = new AdminJS({
    databases: [], // AdminJS uses registered Mongoose models
    rootPath: '/admin',
    resources: [
      {
        resource: product,
        options: {
          properties: {
            name: { isTitle: true },
            price: { isRequired: true },
          },
        },
      },
      {
        resource: user,
        options: {
          properties: {
            name: { isTitle: true },
            email: { isRequired: true },
          },
        },
      },
    ],
  });

  const adminRouter = AdminJSExpress.buildRouter(adminJs);
  app.use(adminJs.options.rootPath, adminRouter);
})();

// Session setup (required for AdminJS authentication)
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

// Regular routes
app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes);

// Root Endpoint
app.get('/', (req, res) => {
  res.send('Hello World!');
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
