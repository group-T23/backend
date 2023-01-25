const express = require('express');
const router = express.Router();
const wishlistController = require('../controllers/wishlist');
const { verifyAuthentication } = require('../utils/auth');

router.post('/', verifyAuthentication, wishlistController.getItems);
router.put('/add', verifyAuthentication, wishlistController.insertItem);
router.delete('/', verifyAuthentication, wishlistController.deleteOneItem);

module.exports = router;