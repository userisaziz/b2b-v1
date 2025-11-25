import cloudinary from "../config/cloudinary.js";

// Upload buffer to Cloudinary
export const uploadToCloudinary = (buffer, folder = "products") => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: folder,
        resource_type: "image"
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      }
    );
    
    uploadStream.end(buffer);
  });
};

// Upload multiple images to Cloudinary
export const uploadMultipleToCloudinary = async (files, folder = "products") => {
  const uploadPromises = files.map(file => 
    uploadToCloudinary(file.buffer, folder)
  );
  
  return Promise.all(uploadPromises);
};