import { v2 as cloudinary } from "cloudinary";

export const uploadImageBuffer = (buffer, folder) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { resource_type: "image", folder },
      (error, result) => {
        if (error) {
          reject(error);
          return;
        }

        resolve(result);
      }
    );

    stream.end(buffer);
  });

export const uploadImagePath = async (filePath, folder) => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      resource_type: "image",
      folder: folder
    });
    return result;
  } catch (error) {
    throw error;
  }
};
