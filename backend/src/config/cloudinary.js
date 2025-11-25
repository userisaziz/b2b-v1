import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dhdd2b7jd',
  api_key: process.env.CLOUDINARY_API_KEY || '931255687947351',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'UWny_wKOX3qy-zGic-88O4vHITw'
});

export default cloudinary;