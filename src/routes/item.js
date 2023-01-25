const express = require('express');
const router = express.Router();
const itemController = require('../controllers/item');
const { verifyAuthentication } = require('../utils/auth');
const multer = require('multer');
const Buyer = require('../models/Buyer');
const Seller = require('../models/Seller');
const jwt = require('jsonwebtoken');

// C - create
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './media/products/images');
    },
    filename: async(req, file, cb) => {
        const token = req.headers['x-access-token'];
        const email = jwt.verify(token, process.env.ACCESS_TOKEN, (err, data) => data);
        const buyer = await Buyer.findOne({ email });
        const seller = await Seller.findById(buyer.sellerId);
        cb(null, `${buyer.sellerId}_${seller.items.length}.${req.body.ext}`);
    },
});
const upload = multer({ storage });
router.post('/', verifyAuthentication, upload.single('file'), itemController.create);

// R - read
router.get('/', itemController.getInfo);
router.get('/seller', itemController.getByUser);


// U - update
router.put('/', verifyAuthentication, itemController.edit);
router.put('/publish', verifyAuthentication, itemController.publish);
router.put('/retire', verifyAuthentication, itemController.retire);
router.put('/buy', verifyAuthentication, itemController.buy);
router.put('/buyMultiple', verifyAuthentication, itemController.buy);

// D - delete
router.delete('/', verifyAuthentication, itemController.remove);

module.exports = router;