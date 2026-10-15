const multer = require("multer");
const sharp = require("sharp");
const path = require("path");
const fs = require("fs");

const stagingDirectory = path.join(__dirname, "../public/images");
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, stagingDirectory);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix + ".jpeg");
  },
});

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb({ message: "Unsupported file format" }, false);
  }
};

const uploadPhoto = multer({
  storage,
  fileFilter: multerFilter,
  limits: { fileSize: 1000000, files: 10 },
});

async function resizeAndStage(req, res, next, folder) {
  if (!req.files?.length) return next();
  try {
    await Promise.all(req.files.map(async (file) => {
      const originalPath = file.path;
      const outputDirectory = path.join(stagingDirectory, folder);
      const outputPath = path.join(outputDirectory, file.filename);
      fs.mkdirSync(outputDirectory, { recursive: true });
      try {
        await sharp(originalPath)
          .resize(300, 300)
          .toFormat("jpeg")
          .jpeg({ quality: 90 })
          .toFile(outputPath);
        fs.unlinkSync(originalPath);
        file.path = outputPath;
      } catch (error) {
        if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
        if (fs.existsSync(originalPath)) fs.unlinkSync(originalPath);
        throw error;
      }
    }));
    return next();
  } catch (error) {
    return next(error);
  }
}

const productImgResize = (req, res, next) => resizeAndStage(req, res, next, "products");
const blogImgResize = (req, res, next) => resizeAndStage(req, res, next, "blogs");

module.exports = { uploadPhoto, productImgResize, blogImgResize };
