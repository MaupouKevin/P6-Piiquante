const express = require('express');
<<<<<<< HEAD
// import du controller "user"
const userCtrl = require('../controllers/user');
const passwordValidator = require('../middlewares/password');
// import du module "router" d'express
=======
const userCtrl = require('../controllers/user');
const passwordValidator = require('../middlewares/password');

>>>>>>> modif
const router = express.Router();

router.post('/signup', passwordValidator.password, userCtrl.signup);
<<<<<<< HEAD
// connexion d'un utilisateur
=======
>>>>>>> modif
router.post('/login', userCtrl.login);

module.exports = router;