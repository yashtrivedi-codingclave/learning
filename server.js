import 'dotenv/config'; // load .env first, before anything else
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import connectDB from './config/db.js';
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import productRoutes from './routes/product.routes.js';

const app = express();

// Needed when deployed behind a proxy (Render, Nginx) so the rate limiter sees the real IP
app.set('trust proxy', 1);

// Global middlewares
app.use(helmet()); // secure HTTP headers
app.use(cors({ origin: process.env.CLIENT_URL })); // only our frontend can call the API
app.use(express.json()); // read JSON request bodies

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);

// Error handler: Express 5 sends every error thrown in an async controller here,
// so controllers don't need try/catch
app.use((err, req, res, next) => {
  let status = err.status || 500;

  if (err.name === 'CastError') status = 400; // invalid MongoDB id
  if (err.name === 'ValidationError') status = 400; // model validation failed
  if (err.name === 'MulterError') status = 400; // e.g. file bigger than 5 MB
  if (err.code === 11000) status = 409; // duplicate value (email already used)

  res.status(status).json({ message: err.message });
});

// Connect to MongoDB, then start the server
await connectDB();
app.listen(process.env.PORT, () => {
  console.log(`Server running on http://localhost:${process.env.PORT}`);
});
