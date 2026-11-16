import { z } from 'zod';

// Zod strips unknown fields (role, owner, image, imageId, dp, dpId...).
// Image fields are only ever set by the upload middleware, never from the request body.
const email = z.email('A valid email is required').toLowerCase();
const password = z.string().min(6, 'Password must be at least 6 characters');
const name = z.string().trim().min(2, 'Name must be at least 2 characters');

export const registerSchema = z.object({ name, email, password });
export const loginSchema = z.object({ email, password: z.string().min(1, 'Password is required') });

// Admins can also set the role when creating or updating a user
export const userSchema = registerSchema.extend({ role: z.enum(['user', 'admin']).optional() });
export const userUpdateSchema = userSchema.partial();

export const productSchema = z.object({
  name: z.string().trim().min(1, 'Product name is required'),
  price: z.coerce.number().min(0, 'Price must be 0 or more').optional(), // form-data sends numbers as strings
});
export const productUpdateSchema = productSchema.partial();
