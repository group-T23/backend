const express = require('express');
const router = express.Router();
const wishlistController = require('../controllers/wishlist');

router.post('/', wishlistController.getItems);
router.put('/add', wishlistController.insertItem);
router.delete('/', wishlistController.deleteOneItem);

module.exports = router;