const express = require('express');
const router = express.Router();
const searchController = require('../controllers/search');

//TODO aggiornare swagger, ultimare implementazione, schema lucid

//per non inserire dei parametri, indicarli con ""
//es: /?key=libro&category=""&location=""
router.get('/?key=:key&category=:category&location=:location', searchController.newSearch);
router.get('/?category=:category', searchController.newSearchCateogries);
router.get('/?min-price=:minPrice&max-price=:maxPrice&shipmentAvailable=:shipment&review=:review&orderBy=:orderBy', searchController.newSearchFilters);

module.exports = router;