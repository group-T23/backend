const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cart');

router.post('/', cartController.getItems);
router.put('/', cartController.updateQuantity);
router.put('/add', cartController.insertItem);
router.delete('/', cartController.deleteOneItem);
router.delete('/all', cartController.deleteAll);
router.post('/checkout', cartController.checkout);

module.exports = router;