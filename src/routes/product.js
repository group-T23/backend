const express = require('express');
const router = express.Router();
const productController = require('../controllers/product');

router.get('/', productController.getAllProduct);
router.delete('/', productController.deleteAllProduct);

router.get('/:id', productController.getProduct);
router.post('/', productController.newProduct);
router.delete('/:id', productController.deleteProduct);

module.exports = router;