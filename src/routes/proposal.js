const express = require('express');
const router = express.Router();
const proposalController = require('../controllers/proposal');
const { verifyAuthentication } = require('../utils/auth').default;

// C - create
router.post('/', verifyAuthentication, proposalController.create);

// R - read
router.get('/id=:id', verifyAuthentication, proposalController.getInfo)
router.get('/in', verifyAuthentication, proposalController.getAllIn);
router.get('/out', verifyAuthentication, proposalController.getAllOut);

// U - update
router.put('/accept/id=:id', verifyAuthentication, proposalController.accept);
router.put('/reject/id=:id', verifyAuthentication, proposalController.reject);

// D - delete
router.delete('/?id=:id', verifyAuthentication, proposalController.remove);

module.exports = router;