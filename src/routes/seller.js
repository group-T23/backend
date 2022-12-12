const express = require('express');
const router = express.Router();
const sellerController = require('../controllers/seller');
const { verifyAuthentication } = require('../utils/auth');

router.get('/seller', verifyAuthentication, sellerController.getInfo)
router.get('/seller/public/username=:username', sellerController.getPublicInfo)
router.get('/seller/items/username=:username', sellerController.getItems);
router.post('/seller', verifyAuthentication, sellerController.create);
router.patch('/seller', verifyAuthentication, sellerController.addItem);
router.delete('/seller', verifyAuthentication, sellerController.remove);