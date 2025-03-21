import axios from "axios";

const uploadImage = async (file) => {
  const CLOUDINARY_URL = "https://api.cloudinary.com/v1_1/ddme9cxjs/image/upload";
  const CLOUDINARY_UPLOAD_PRESET = "images"; // Replace with your actual upload preset

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

  try {
    const response = await axios.post(CLOUDINARY_URL, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    console.log("Uploaded Image URL:", response.data.secure_url);
    return response.data.secure_url; // This is the public URL of the uploaded image
  } catch (error) {
    console.error("Upload failed:", error);
    return null;
  }
};

export default uploadImage;
