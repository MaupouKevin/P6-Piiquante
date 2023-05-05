const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const multer = require('../middlewares/multer-config');
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