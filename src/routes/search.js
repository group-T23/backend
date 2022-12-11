const express = require('express');
const router = express.Router();
const searchController = require('../controllers/search');

router.get('', searchController.search);
router.get('/category/:category', searchController.searchCategory);

module.exports = router;