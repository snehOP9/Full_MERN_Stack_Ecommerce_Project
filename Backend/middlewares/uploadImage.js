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

const resizeUploadedImages = async (files, folder) => {
  const results = await Promise.allSettled(
    files.map(async (file) => {
      const outputPath = path.join(__dirname, "../public/images", folder, file.filename);
      try {
        await sharp(file.path)
          .resize(300, 300)
          .toFormat("jpeg")
          .jpeg({ quality: 90 })
          .toFile(outputPath);
      } catch (error) {
        await fs.promises.unlink(outputPath).catch(() => {});
        throw error;
      } finally {
        await fs.promises.unlink(file.path).catch(() => {});
      }
    })
  );

  const failed = results.find((result) => result.status === "rejected");
  if (failed) throw failed.reason;
};

const resizeMiddleware = (folder) => async (req, res, next) => {
  if (!req.files) return next();

  try {
    await resizeUploadedImages(req.files, folder);
    next();
  } catch (error) {
    next(error);
  }
};

const productImgResize = resizeMiddleware("products");
const blogImgResize = resizeMiddleware("blogs");

module.exports = { uploadPhoto, productImgResize, blogImgResize };
