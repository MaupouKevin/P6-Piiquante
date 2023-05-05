const bcrypt = require('bcrypt');

const jwt = require('jsonwebtoken');

const dotenv = require('dotenv');
dotenv.config();
const processToken = process.env.TOKEN;

const User = require('../models/User');

const status = require('http-status');

exports.signup = async (req, res, next) => {
  try {
    const hash = await bcrypt.hash(req.body.password, 10);
    const user = new User({
      email: req.body.email,
      password: hash
    });
    await user.save();
    res.status(status.CREATED).json;
    console.log('Utilisateur créé !')
  } catch (error) {
    res.status(status.INTERNAL_SERVER_ERROR).json;
    console.log('Erreur serveur ! Veuillez ré-essayer !')
  }
};

exports.login = async (req, res, next) => {
    try {
      const user = await User.findOne({ email: req.body.email });
      if (!user) {
        console.log('Combinaison identifiant/mot de passe incorrecte');
        return res.status(status.UNAUTHORIZED).json({ message: "Combinaison identifiant/mot de passe incorrecte" });
      }

      const valid = await bcrypt.compare(req.body.password, user.password);
      if (!valid) {
        console.log('Combinaison identifiant/mot de passe incorrecte');
        return res.status(status.UNAUTHORIZED).json({ message: "Combinaison identifiant/mot de passe incorrecte" });
        
      }

      return res.status(status.OK).json({
        userId: user._id,
        token: jwt.sign(
          { userId: user._id },
          processToken,
          { expiresIn: '24h' }
        )
      });
      
    } catch (error) {
      console.log('Erreur serveur ! Veuillez ré-essayer !');
      return res.status(status.INTERNAL_SERVER_ERROR).json({ error });
    }
  };

