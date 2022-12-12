const express = require('express');
const router = express.Router();
const buyerController = require('../controllers/buyer');
const { verifyAuthentication } = require('../utils/auth');

router.get('/user', verifyAuthentication, buyerController.getInfo);
router.post('/user', buyerController.create);
router.patch('/user', verifyAuthentication, buyerController.edit);
router.delete('/user', verifyAuthentication, buyerController.remove);