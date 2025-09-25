import cloudinary from './cloudinary';
import { Readable } from 'stream';

export async function uploadToCloudinary(file: Express.Multer.File) {
  return new Promise((resolve, rejects) => {
    const upload = cloudinary.uploader.upload_stream(
      {
        folder: 'chattingAppProfile',
        resource_type: 'image',
      },
      (err, result) => {
        // eslint-disable-next-line @typescript-eslint/prefer-promise-reject-errors
        if (err) return rejects(err);
        resolve(result);
      },
    );
    Readable.from(file.buffer).pipe(upload);
  });
}
