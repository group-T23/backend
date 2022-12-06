const express = require('express');
const router = express.Router();
const searchController = require('../controllers/search');

router.get('/?key=:key', searchController.newSearch);

module.exports = router;