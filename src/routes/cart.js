const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cart');
const { verifyAuthentication } = require('../utils/auth');

router.post('/', verifyAuthentication, cartController.getItems);
router.put('/', verifyAuthentication, cartController.updateQuantity);
router.put('/add', verifyAuthentication, cartController.insertItem);
router.delete('/', verifyAuthentication, cartController.deleteOneItem);
router.delete('/all', verifyAuthentication, cartController.deleteAll);
router.post('/checkout', verifyAuthentication, cartController.checkout);

module.exports = router;