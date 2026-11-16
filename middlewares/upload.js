import multer from 'multer';

// Multer reads the file from form-data and keeps it in memory (req.file.buffer).
// Nothing is saved on disk - the controller uploads it straight to Cloudinary.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // max 5 MB
});

export default upload;
