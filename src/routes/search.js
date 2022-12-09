const express = require('express');
const router = express.Router();
const searchController = require('../controllers/search');

//TODO aggiornare swagger, ultimare implementazione, schema lucid
router.get('', searchController.search);

module.exports = router;