const express = require('express');
const router = express.Router();
const searchController = require('../controllers/search');

router.get('', searchController.search);
router.get('/categories', searchController.getCategories);

module.exports = router;