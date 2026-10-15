const fs = require("fs");
const asyncHandler = require("express-async-handler");

const {
  cloudinaryUploadImg,
  cloudinaryDeleteImg,
} = require("../utils/cloudinary");
const uploadImages = asyncHandler(async (req, res) => {
  const files = req.files || [];
  const urls = [];
  const uploader = (filePath) => cloudinaryUploadImg(filePath, "images");
  try {
    for (const file of files) {
      urls.push(await uploader(file.path));
    }
    return res.json(urls);
  } finally {
    for (const file of files) {
      if (file.path && fs.existsSync(file.path)) fs.unlinkSync(file.path);
    }
  }
});
const deleteImages = asyncHandler(async (req, res) => {
  const { id } = req.params;
  try {
    const deleted = cloudinaryDeleteImg(id, "images");
    res.json({ message: "Deleted" });
  } catch (error) {
    throw new Error(error);
  }
});

module.exports = {
  uploadImages,
  deleteImages,
};
