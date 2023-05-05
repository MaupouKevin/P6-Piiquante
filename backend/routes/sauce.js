const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const multer = require('../middlewares/multer-config');
const sauceCtrl = require('../controllers/sauce');

router.post('/', auth, multer, sauceCtrl.createSauce);
router.put('/:id',auth, multer, sauceCtrl.modifySauce);
router.delete('/:id', auth, multer,  sauceCtrl.deleteOneSauce);
router.get('/:id',auth, sauceCtrl.getOneSauce);
router.get('/',auth, sauceCtrl.getAllSauce);
router.post('/:id/like', auth, sauceCtrl.likeOrDislike)

module.exports = router;