const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cart');

router.post('/', cartController.getItems);
router.put('/', cartController.updateQuantity);
router.delete('/', cartController.deleteOneItem);

module.exports = router;