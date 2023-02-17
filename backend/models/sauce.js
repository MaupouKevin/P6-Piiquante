// import du module "mongoose" pour l'accès à la base de données
const mongoose = require('mongoose');

// import du plugin "mongoose error" pour la gestion des erreurs
const mongooseErrors = require('mongoose-errors');

// déclaration de notre schéma pour "sauce"
const sauceSchema = mongoose.Schema({

  userId: { type: String, required: true },
  name: { type: String, required: true },
  manufacturer: { type: String, required: true },
  description: { type: String, required: true },
  mainPepper: { type: String, required: true },
  imageUrl: { type: String, required: true },
  heat: { type: Number, required: true },
  likes: { type: Number, default: 0}, // par défaut à 0 qui ne contient pas de note
  dislikes: { type: Number, default: 0},
  usersLiked: { type: Array, default: []}, // par défaut un tableau vide qui ne contient pas d'utilisateur
  usersDisliked: { type: Array, default: []},
  
});

// appel du plugin "mongoose-errors" pour les erreurs
sauceSchema.plugin(mongooseErrors);

module.exports = mongoose.model("Sauce", sauceSchema);