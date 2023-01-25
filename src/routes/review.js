const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/review');
const { verifyAuthentication } = require('../utils/auth');

// C - create
router.post('/', verifyAuthentication, reviewController.create);

// R - read
router.get('/seller/id=:id', reviewController.getSellerReviews);
router.get('/id=:id', reviewController.getInfo);
router.get('/in', verifyAuthentication, reviewController.getAllIn)
router.get('/out', verifyAuthentication, reviewController.getAllOut)

// U - update

// D - delete
router.delete('/', verifyAuthentication, reviewController.remove);


module.exports = router;