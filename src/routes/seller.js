const express = require('express');
const router = express.Router();
const sellerController = require('../controllers/seller');
const { verifyAuthentication } = require('../utils/auth');

// C - create
router.post('/seller', verifyAuthentication, sellerController.create);

// R - read
router.get('/seller', verifyAuthentication, sellerController.getInfo)
router.get('/seller/public/username=:username', sellerController.getPublicInfo)

// U - update
router.patch('/seller', verifyAuthentication, sellerController.addItem);

// D - delete
router.delete('/seller', verifyAuthentication, sellerController.remove);