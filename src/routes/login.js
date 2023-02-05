const express = require('express');
const router = express.Router();
const userController = require('../controllers/login');

router.post('/', userController.loginUser);
router.get('/reset', userController.resetPassword);

module.exports = router;