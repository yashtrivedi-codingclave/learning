import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Upload a file (that multer kept in memory) to Cloudinary.
// Returns { url, id } - save both: url to show the image, id to delete it later.
export const uploadImage = async (file) => {
  const base64 = file.buffer.toString('base64');
  const dataUri = `data:${file.mimetype};base64,${base64}`;

  const result = await cloudinary.uploader.upload(dataUri, {
    folder: process.env.CLOUDINARY_FOLDER,
  });

  return { url: result.secure_url, id: result.public_id };
};

// Delete an image from Cloudinary using its id
export const deleteImage = async (id) => {
  if (id) await cloudinary.uploader.destroy(id);
};
