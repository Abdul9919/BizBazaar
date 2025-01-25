// database/db.js
import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB || 'mongodb+srv://admin:admin@backenddb.fek2y.mongodb.net/node-api?retryWrites=true&w=majority&appName=backendDB', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);

    if (!mongoose.models.User) {
      throw new Error('User model not registered!');
    }
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1); // Exit process with failure
  }
};

export default connectDB;
