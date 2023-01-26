const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order');
const { verifyAuthentication } = require('../utils/auth');

router.post('/', verifyAuthentication, orderController.create);
router.post('/get', verifyAuthentication, orderController.get);
router.post('/getAll', verifyAuthentication, orderController.getAll);


router.put('/', verifyAuthentication, orderController.edit);

module.exports = router;