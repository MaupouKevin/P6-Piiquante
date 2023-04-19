//import du module "bcrypt" pour le hachage du mot de passe avant d'être enregistré en BDD
const bcrypt = require('bcrypt');

// import du module "jsonwebtoken" pour créer le token d'authentification
const jwt = require('jsonwebtoken');

// import de notre modèle "User"
const User = require('../models/User');

// export de la fonction "signup"
exports.signup =(req, res, next) => {
    bcrypt.hash(req.body.password, 10) // Une fois le formulaire d'inscription rempli on crypte le mot de passe avec la méthode ".hash" de "bcrypt"
    .then(hash => {
        const user = new User({ // on utilise notre schéma "User" pour créer un nouvel utilisateur avec le mot de passe crypté
            email: req.body.email,
            password: hash,
        });
        user.save() // On enregistre le nouvel utilisateur dans la base de données
        .then(() => res.status(201).json({ message : 'utilisateur créé !' }))
        .catch (error => res.status(400).json({ error }));
    })
    .catch(error => res.status(500).json({ error }));
};

// export de la fonction "login"
exports.login = async (req, res, next) => {
    try {
      const user = await User.findOne({ email: req.body.email });
      if (!user) {
        return res.status(401).json({ message: "Combinaison identifiant/mot de passe incorrecte" });
      }

      const valid = await bcrypt.compare(req.body.password, user.password);
      if (!valid) {
        return res.status(401).json({ message: "Combinaison identifiant/mot de passe incorrecte" });
      }

      return res.status(200).json({
        userId: user._id,
        token: jwt.sign(
          { userId: user._id },
          TOKEN,
          { expiresIn: '24h' }
        )
      });
    } catch (error) {
      return res.status(500).json({ error });
    }
  };

