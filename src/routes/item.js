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
router.get('/id=:id', itemController.getInfo);
router.get('/username=:username', itemController.getByUser);
router.get('/seller/id=:id', itemController.getInfoSeller);
router.get('/buyer/id=:id', itemController.getInfoBuyer);


// U - update
router.put('/id=:id', verifyAuthentication, itemController.edit);
router.put('/publish/id=:id', verifyAuthentication, itemController.publish);
router.put('/retire/id=:id', verifyAuthentication, itemController.retire);
router.put('/buy/id=:id', verifyAuthentication, itemController.buy);

// D - delete
router.delete('/id=:id', verifyAuthentication, itemController.remove);

module.exports = router;