const express = require('express');
const router = express.Router();
const productController = require('../controllers/product');

router.get('/', productController.getAllProduct);
router.delete('/', productController.deleteAllProduct);

//nota che per la richiesta non è neccessario idicare :id= ma direttamente il valore
//es: product/?id=7473737377
router.post('/', productController.newProduct);
router.get('/id=:id', productController.getProduct);
//in riferimento al componente ProductCard.vue del frontend per il passaggio dei parametri
router.delete('/id=:id', productController.deleteProduct);

module.exports = router;