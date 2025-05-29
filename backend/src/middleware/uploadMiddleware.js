// src/middleware/uploadMiddleware.js
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const User = require('../models/UserModel');

const upload = (fieldName) => {
  return async (req, res, next) => {
    try {
      if (!req.user || !req.user.id) {
        return res.status(401).json({ msg: 'Unauthorized: User not found in request' });
      }

      const user = await User.findById(req.user.id).select('email');
      if (!user) {
        return res.status(404).json({ msg: 'User not found' });
      }

      req.user.email = user.email; // 🟩 This is the fix!

      const storage = multer.diskStorage({
        destination: function (req, file, cb) {
          const userDir = path.join(__dirname, '../uploads', user.email);
          if (!fs.existsSync(userDir)) {
            fs.mkdirSync(userDir, { recursive: true });
          }
          cb(null, userDir);
        },
        filename: function (req, file, cb) {
          const ext = path.extname(file.originalname);
          cb(null, 'profile' + ext);
        }
      });

      const uploader = multer({
        storage: storage,
        limits: { fileSize: 5 * 1024 * 1024 },
        fileFilter: (req, file, cb) => {
          if (file.mimetype.startsWith('image/')) {
            cb(null, true);
          } else {
            cb(new Error('Only image files are allowed!'));
          }
        }
      }).single(fieldName);

      uploader(req, res, function (err) {
        if (err) {
          console.error('Upload error:', err.message);
          return res.status(400).json({ msg: err.message });
        }
        next();
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ msg: 'Server error', error: err.message });
    }
  };
};

module.exports = upload;