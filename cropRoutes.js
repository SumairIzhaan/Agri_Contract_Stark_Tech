const express = require('express');
const router = express.Router();
const { getCrops } = require('../controllers/cropController');

router.get('/', getCrops);

module.exports = router;
