const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cart');

router.post('/', cartController.getItems);
router.delete('/', cartController.deleteOneItem);

module.exports = router;