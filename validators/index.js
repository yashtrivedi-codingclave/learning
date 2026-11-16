import { z } from 'zod';

// Zod checks the request body before it reaches the controller.
// Any field NOT listed in a schema is removed automatically, so a user can never
// send fields like role, owner or imageId by themselves.

export const registerSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters'),
  email: z.email('A valid email is required').toLowerCase(),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const loginSchema = z.object({
  email: z.email('A valid email is required').toLowerCase(),
  password: z.string().min(1, 'Password is required'),
});

// Admin creating a user can also choose the role
export const createUserSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters'),
  email: z.email('A valid email is required').toLowerCase(),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['user', 'admin']).optional(),
});

// When updating, every field is optional (send only what you want to change)
export const updateUserSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').optional(),
  email: z.email('A valid email is required').toLowerCase().optional(),
  password: z.string().min(6, 'Password must be at least 6 characters').optional(),
  role: z.enum(['user', 'admin']).optional(),
});

// z.coerce.number() because form-data sends numbers as text ("500")
export const createProductSchema = z.object({
  name: z.string().trim().min(1, 'Product name is required'),
  price: z.coerce.number().min(0, 'Price must be 0 or more').optional(),
});

export const updateProductSchema = z.object({
  name: z.string().trim().min(1, 'Product name is required').optional(),
  price: z.coerce.number().min(0, 'Price must be 0 or more').optional(),
});
