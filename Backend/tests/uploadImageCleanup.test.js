const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { randomUUID } = require("node:crypto");
const sharp = require("sharp");
const { productImgResize } = require("../middlewares/uploadImage");

test("image resizing removes the original and leaves the processed staging file", async () => {
  const stagingDirectory = path.join(__dirname, "../public/images");
  fs.mkdirSync(stagingDirectory, { recursive: true });
  const filename = `test-${randomUUID()}.jpeg`;
  const originalPath = path.join(stagingDirectory, filename);
  const file = { filename, path: originalPath };
  let processedPath;

  try {
    await sharp({
      create: { width: 8, height: 8, channels: 3, background: { r: 20, g: 80, b: 140 } },
    }).jpeg().toFile(originalPath);

    await new Promise((resolve, reject) => {
      productImgResize({ files: [file] }, {}, (error) => error ? reject(error) : resolve());
    });

    processedPath = file.path;
    assert.equal(fs.existsSync(originalPath), false);
    assert.equal(fs.existsSync(processedPath), true);
    assert.match(processedPath, /images[\\/]products[\\/]/);
  } finally {
    for (const filePath of [originalPath, processedPath]) {
      if (filePath && fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }
  }
});
