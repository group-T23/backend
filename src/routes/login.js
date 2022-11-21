const express = require('express');
const router = express.Router();
const userController = require('../controllers/login');

router.post('/', userController.loginUser);
router.post('/verify', userController.verifyUser);

module.exports = router;