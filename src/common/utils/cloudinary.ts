import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const CloudinaryStorageConfig = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: () => ({
    folder: 'chattingAppProfile',
    allowed_formats: ['jpg', 'jpeg', 'png'],
  }),
});

export default cloudinary;
