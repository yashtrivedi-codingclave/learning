import multer from 'multer';
import cloudinary from '../config/cloudinary.js';
import { validate } from './validate.js';

// upload('dp', schema): parse form-data -> validate -> only then upload to Cloudinary.
// The file goes from memory straight to Cloudinary; nothing is written to disk.
export const upload = (field, schema) => [
  multer({ limits: { fileSize: 5 * 1024 * 1024 } }).single(field),
  validate(schema), // validate first so invalid requests never upload anything
  async (req, res, next) => {
    if (req.file) {
      const r = await cloudinary.uploader.upload(
        `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`,
        { folder: process.env.CLOUDINARY_FOLDER },
      );
      Object.assign(req.body, { [field]: r.secure_url, [`${field}Id`]: r.public_id });
    }
    next();
  },
];
