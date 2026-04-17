const multer = require('multer');

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
  fileFilter: (req, file, cb) => {
    if (file.fieldname === 'image') {
      if (!file.mimetype.startsWith('image/')) {
        return cb(new Error('Only image files allowed for image field'));
      }
    }
    if (file.fieldname === 'audio') {
      if (!file.mimetype.startsWith('audio/') && file.mimetype !== 'application/octet-stream') {
        return cb(new Error('Only audio files allowed for audio field'));
      }
    }
    cb(null, true);
  },
});

module.exports = upload;
