const express = require('express');
const userCtrl = require('../controllers/user');
const passwordValidator = require('../middlewares/password');
// import du module "router" d'express
const router = express.Router();

router.post('/signup', passwordValidator.password, userCtrl.signup);
router.post('/login', userCtrl.login);

module.exports = router;