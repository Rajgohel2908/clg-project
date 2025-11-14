const express = require('express');
const { listItems, getItem, createItem, updateItem, deleteItem, getUserItems } = require('../controllers/itemController');
const auth = require('../middleware/auth');
const multer = require('multer');

const router = express.Router();

// Multer config for image uploads
const storage = multer.diskStorage({
  destination: 'src/uploads/',
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
