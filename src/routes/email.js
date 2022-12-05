const express = require('express');
const router = express.Router();
const emailController = require('../controllers/email');

router.get('/', emailController.checkEmail);
router.post('/', emailController.verifyEmail);

module.exports = router;