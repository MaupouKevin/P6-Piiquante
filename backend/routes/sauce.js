// import du package "express" (Framework)
const express = require('express');

// import du module "router" d'express
const router = express.Router();

// import du middleware "auth" d'authentification à mettre sur les routes
const auth = require('../middlewares/auth');

// import du middleware "multer" pour la gestion et le stockage des images 
const multer = require('../middlewares/multer-config');

// import du controller "sauce"
const sauceCtrl = require('../controllers/sauce');

// création d'une sauce
router.post('/', auth, multer, sauceCtrl.createSauce);

// modifier une sauce | ":id" est un segment dynamique (req.params.id)
router.put('/:id',auth, multer, sauceCtrl.modifySauce);

// supression d'une sauce
router.delete('/:id', auth, multer,  sauceCtrl.deleteOneSauce);

// récupérer UNE sauce
router.get('/:id',auth, sauceCtrl.getOneSauce);

// récupérer TOUTES les sauces
router.get('/',auth, sauceCtrl.getAllSauce);

// route pour liker ou disliker une sauce 
router.post('/:id/like', auth, sauceCtrl.likeOrDislike)


// export du module "router"
module.exports = router;