const express = require('express');
const router = express.Router();
const { generateContract } = require('../controllers/contractController');

router.post('/generate', generateContract);

module.exports = router;