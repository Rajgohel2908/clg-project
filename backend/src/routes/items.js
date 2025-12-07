const express = require('express');
const { listItems, getItem, createItem, updateItem, deleteItem, getUserItems } = require('../controllers/itemController');
const auth = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const router = express.Router();

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer config for image uploads
const storage = multer.diskStorage({
  destination: uploadsDir,
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage });

// List items (public, but only approved)
router.get('/', listItems);

// Get user's items (protected)
router.get('/my-items', auth, getUserItems);

// Get item detail (public)
router.get('/:id', getItem);

// Create item (protected, with upload)
router.post('/', auth, upload.array('images', 5), createItem);

// Update item (protected, uploader only, with upload)
router.put('/:id', auth, upload.array('images', 5), updateItem);

// Delete item (protected, uploader or admin)
router.delete('/:id', auth, deleteItem);

module.exports = router;
