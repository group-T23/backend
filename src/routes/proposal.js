const express = require('express');
const router = express.Router();
const proposalController = require('../controllers/proposal');

// C - create
router.post('/create', proposalController.create);

// R - read
router.post('/incoming', proposalController.getAllIn);
router.post('/outgoing', proposalController.getAllOut);

// U - update
router.put('/accept/?id=:id', proposalController.accept);
router.put('/reject/?id=:id', proposalController.reject);

// D - delete
router.delete('/delete/?id=:id', proposalController.remove);


module.exports = router;