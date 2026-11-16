# MVC REST API — Auth, RBAC, Cloudinary, Nodemailer

Express 5 + MongoDB (Mongoose) REST API using ES modules and an MVC folder structure.

## Features
- **Auth** — register / login with JWT, passwords hashed with bcrypt
- **RBAC** — `admin` can manage all users and all products; `user` can only manage their own products
- **Cloudinary** — profile picture (`dp`) and product images go straight from memory to Cloudinary (nothing is stored on disk); old images are deleted on update/delete
- **Nodemailer** — welcome email on registration
- **Validation** — request bodies validated with Zod; unknown fields are stripped
- **CORS** — restricted to `CLIENT_URL`
- **Cascade delete** — deleting a user also deletes their products and images
- **Pagination** — list endpoints accept `?page=` and `?limit=` (max 100)
- **Login rate limit** — max 5 failed logins per IP per 15 minutes (successful logins don't count)

## Tech stack
Node.js · Express 5 · MongoDB · Mongoose · JWT · bcryptjs · Zod · Multer · Cloudinary · Nodemailer · express-rate-limit

## Folder structure
```
config/         db, cloudinary, mailer setup
models/         User, Product (Mongoose schemas)
controllers/    auth controller + one generic CRUD controller
middlewares/    auth (JWT + roles), upload (Multer -> Cloudinary), validate (Zod)
validators/     Zod schemas for every request body
routes/         auth, users, products
server.js       app entry point
```

## Getting started
1. Install dependencies
   ```bash
   npm install
   ```
2. Copy `.env.example` to `.env` and fill in the values
   ```bash
   cp .env.example .env
   ```
   | Variable | Description |
   |---|---|
   | `PORT` | Server port |
   | `MONGO_URI` | MongoDB connection string (local or Atlas) |
   | `JWT_SECRET` | Long random string used to sign tokens |
   | `CLIENT_URL` | Frontend origin allowed by CORS |
   | `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` | From the Cloudinary dashboard |
   | `CLOUDINARY_FOLDER` | Cloudinary folder where images are stored |
   | `EMAIL_USER` | Gmail address that sends emails |
   | `EMAIL_PASS` | Gmail **App Password** (Google Account → Security → App passwords), not your normal password |
3. Start the server
   ```bash
   npm run dev
   ```

### Creating the first admin
Register a user normally, then set that user's `role` to `"admin"` in MongoDB (e.g. with MongoDB Compass). After that, the admin can create more admins through `POST /api/users`.

## API

Protected routes need the header `Authorization: Bearer <token>`.
Routes that accept an image use **multipart/form-data**; all others accept JSON or form-data.

### Auth — `/api/auth`
| Method | Route | Access | Body |
|---|---|---|---|
| POST | `/register` | Public | `name`, `email`, `password` (min 6), `dp` (image file, optional) |
| POST | `/login` | Public (rate limited) | `email`, `password` → returns `{ token, role }` |
| GET | `/me` | Logged in | — |

### Products — `/api/products`
A `user` sees and changes only their own products. An `admin` sees and changes all products.

| Method | Route | Body |
|---|---|---|
| GET | `/` | — |
| GET | `/:id` | — |
| POST | `/` | `name`, `price` (optional), `image` (file, optional) |
| PUT | `/:id` | any of `name`, `price`, `image` |
| DELETE | `/:id` | — |

### Users — `/api/users` (admin only)
| Method | Route | Body |
|---|---|---|
| GET | `/` | — |
| GET | `/:id` | — |
| POST | `/` | `name`, `email`, `password`, `role` (optional), `dp` (file, optional) |
| PUT | `/:id` | any of the above |
| DELETE | `/:id` | — (also deletes the user's products and images) |

### Pagination
`GET /api/products` and `GET /api/users` return newest first:
```
GET /api/products?page=2&limit=10
```
```json
{ "data": [ ... ], "page": 2, "limit": 10, "total": 25, "pages": 3 }
```
Defaults: `page=1`, `limit=10`. `limit` is capped at 100.

### Error responses
| Status | Meaning |
|---|---|
| 400 | Validation failed or invalid id |
| 401 | Not logged in / invalid token |
| 403 | Logged in but role not allowed |
| 404 | Not found (or not yours) |
| 409 | Email already registered |
| 429 | Too many failed login attempts |
| 500 | Server error |

All errors return `{ "message": "..." }`.
