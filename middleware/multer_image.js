const multer = require("multer");

//-------check folder------
const fs = require("fs");
const path = require("path");
const imgFolder = path.join(path.dirname(require.main.filename), "images");
if (!fs.existsSync(imgFolder)) {
  fs.mkdirSync(imgFolder);
}

//--------------------read img from request-------------
const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "images");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/jpeg"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

module.exports = multer({
  storage: fileStorage,
  fileFilter: fileFilter,
}).array("images", 5);
