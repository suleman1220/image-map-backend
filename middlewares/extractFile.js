const multer = require('multer');

const MIME_TYPE_MAP = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
};

const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    const isValid = MIME_TYPE_MAP[file.mimetype];
    let error = new Error('Invalid mime type');

    if (isValid) {
      error = null;
    }

    callback(error, 'images');
  },
  filename: (_, file, callback) => {
    const extension = MIME_TYPE_MAP[file.mimetype];

    callback(null, 'uploaded-img' + '.' + extension);
  },
});

module.exports = multer({ storage }).single('image');
