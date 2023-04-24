const bcrypt = require('bcrypt');

const jwt = require('jsonwebtoken');

const dotenv = require('dotenv');
dotenv.config();
const processToken = process.env.TOKEN;

const User = require('../models/User');

exports.signup =(req, res, next) => {
    bcrypt.hash(req.body.password, 10) // Une fois le formulaire d'inscription rempli on crypte le mot de passe avec la méthode ".hash" de "bcrypt"
    .then(hash => {
        const user = new User({ // on utilise notre schéma "User" pour créer un nouvel utilisateur avec le mot de passe crypté
            email: req.body.email,
            password: hash,
        });
        user.save()
        .then(() => res.status(httpStatus.CREATED).json({ message : 'utilisateur créé !' }))
        .catch (error => res.status(httpStatus.BADREQUEST).json({ error }));
    })
    .catch(error => res.status(httpStatus.SERVERERROR).json({ error }));
};

exports.login = async (req, res, next) => {
    try {
      const user = await User.findOne({ email: req.body.email });
      if (!user) {
        return res.status(httpStatus.UNAUTHORIZED).json({ message: "Combinaison identifiant/mot de passe incorrecte" });
      }

      const valid = await bcrypt.compare(req.body.password, user.password);
      if (!valid) {
        return res.status(httpStatus.UNAUTHORIZED).json({ message: "Combinaison identifiant/mot de passe incorrecte" });
      }

      return res.status(httpStatus.OK).json({
        userId: user._id,
        token: jwt.sign(
          { userId: user._id },
          processToken,
          { expiresIn: '24h' }
        )
      });
    } catch (error) {
      return res.status(httpStatus.SERVERERROR).json({ error });
    }
  };

