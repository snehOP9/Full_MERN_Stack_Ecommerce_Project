const multer = require("multer");
const sharp = require("sharp");
const path = require("path");
const fs = require("fs");
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../public/images/"));
  },
  filename: function (req, file, cb) {
    const uniquesuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniquesuffix + ".jpeg");
  },
});

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb({ message: "Unsupported file format" }, false);
  }
};

const uploadPhoto = multer({
  storage: storage,
  fileFilter: multerFilter,
  limits: { fileSize: 1000000 },
});

const resizeImages = async (files, destination) => {
  await Promise.all(
    files.map(async (file) => {
      try {
        await sharp(file.path)
          .resize(300, 300)
          .toFormat("jpeg")
          .jpeg({ quality: 90 })
          .toFile(path.join(destination, file.filename));
      } finally {
        try {
          await fs.promises.unlink(file.path);
        } catch (error) {
          if (error.code !== "ENOENT") throw error;
        }
      }
    })
  );
};

const productImgResize = async (req, res, next) => {
  if (!req.files) return next();
  await resizeImages(req.files, path.join("public", "images", "products"));
  next();
};

const blogImgResize = async (req, res, next) => {
  if (!req.files) return next();
  await resizeImages(req.files, path.join("public", "images", "blogs"));
  next();
};
module.exports = { uploadPhoto, productImgResize, blogImgResize };
