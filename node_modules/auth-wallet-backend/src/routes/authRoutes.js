const express = require('express');
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const validateRequest = require('../middleware/validateRequest');
const { authLimiter } = require('../middleware/rateLimiters');

const router = express.Router();

const signupValidation = [
  body('username')
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username may contain only letters, numbers, and underscores'),
  body('email')
    .trim()
    .isEmail()
    .withMessage('A valid email address is required')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 8, max: 72 })
    .withMessage('Password must be between 8 and 72 characters')
];

const loginValidation = [
  body('email')
    .trim()
    .isEmail()
    .withMessage('A valid email address is required')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 8, max: 72 })
    .withMessage('Password must be between 8 and 72 characters')
];

router.post('/signup', authLimiter, signupValidation, validateRequest, authController.signup);
router.post('/login', authLimiter, loginValidation, validateRequest, authController.login);
router.post('/refresh', authLimiter, authController.refresh);
router.post('/logout', authController.logout);

module.exports = router;
