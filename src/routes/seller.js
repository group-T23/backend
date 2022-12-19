const express = require('express');
const router = express.Router();
const sellerController = require('../controllers/seller');
const { verifyAuthentication } = require('../utils/auth');

// C - create
router.post('/', verifyAuthentication, sellerController.create);

// R - read
router.get('/', verifyAuthentication, sellerController.getInfo)
router.get('/public/:username', sellerController.getPublicInfo)

// D - delete
router.delete('/', verifyAuthentication, sellerController.remove);

module.exports = router;