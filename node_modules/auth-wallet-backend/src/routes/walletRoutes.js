const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const walletController = require('../controllers/walletController');

const router = express.Router();

router.get('/', authMiddleware, walletController.getWallet);

module.exports = router;
