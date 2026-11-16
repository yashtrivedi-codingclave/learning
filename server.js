import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import connectDB from './config/db.js';
import authRoutes from './routes/auth.routes.js';
import productRoutes from './routes/product.routes.js';
import userRoutes from './routes/user.routes.js';

const app = express();
app.set('trust proxy', 1); // behind one proxy (Render, Nginx...) so rate limiting sees the real client IP
app.use(helmet(), cors({ origin: process.env.CLIENT_URL }), express.json());
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes);

// 11000 = duplicate email, CastError = invalid id, ValidationError = missing/invalid field
const status = (err) =>
  err.code === 11000 ? 409 : ['CastError', 'ValidationError'].includes(err.name) ? 400 : 500;
app.use((err, req, res, next) =>
  res.status(err.status || status(err)).json({ message: err.message }),
);

await connectDB();
app.listen(process.env.PORT, () => console.log(`Server on ${process.env.PORT}`));
