// import du module "mongoose" pour l'accès à la base de données
const mongoose = require('mongoose');

//import du plugin "mongoose error" pour la gestion des erreurs 
const MongooseErrors = require('mongoose-errors');

// import du plugin "mongoose-unique-validator" qui s'assure, en plus de (unique : true), qu'une adresse e-mail ne peut être utilisée que pour un seul compte utilisateur
const uniqueValidator = require('mongoose-unique-validator');

// déclaration de notre schéma pour "user"
const userSchema = mongoose.Schema({

  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }
  
});

userSchema.plugin(MongooseErrors);
userSchema.plugin(uniqueValidator);


module.exports = mongoose.model('User', userSchema);