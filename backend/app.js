// import du package "express" (Framework node js)
const express = require ('express');

// import du module "mongoose" pour la base de données
const mongoose = require('mongoose');
mongoose.set('strictQuery', false)

// import module "path" pour la gestion de chemins de stockage
const path = require('path');

// import du module "cors" afin d'accepter les requêtes provenant de sources différentes 
const cors = require('cors');

// import du module "morgan" pour que les informations sur les requêtes soient envoyées dans le terminal
const morgan = require('morgan');

// import du module "dotenv" pour utiliser les variables d'environnement (ici cacher l'ID et le MDP de la base de données)
const dotenv = require('dotenv');
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI; // //import de la variabe d'environnement pour la connexion à la base da données

/* import du module "helmet" Helmet pour protéger de certaines des vulnérabilités bien connues du Web en configurant de manière appropriée des en-têtes HTTP.
Helmet est une collection de neuf fonctions middleware qui définissent des en-têtes HTTP liés à la sécurité */
const helmet = require('helmet');

// import du module "xss" pour se protéger des attaques XSS, ce sont l’injection d’un script dans notre serveur
const xss = require("xss");
const html = xss('<script>alert("xss");</script>');
console.log(html);

/* import du module "express-rate-limit" pour limiter le nombre de requêtes possibles par un même utilisateur dans un temps donné.
 Cela permet d'éviter de faire tomber le serveur avec des requêtes en boucle ou de hacker le site avec une méthode "Brute-Force" */
const rateLimiter = require('express-rate-limit');

const limiter = rateLimiter({ // configuration d'express-rate-limit
  max: 10, // un maximum de 5 requêtes
  windowMs:60 * 500 * 10, // toutes les 5 minutes (60 * 500ms  = 60 * 0.5s = 30s * 10 = 5 mn )
  message: "Trop de requêtes effectuées depuis cette adresse IP" // affichera ce message une fois que le nombre de requêtes autorisées sera dépassé
});

// importation de nos routes "user" et "sauce"
const userRoutes = require('./routes/user');
const sauceRoutes = require('./routes/sauce');

// connexion à la base de données grâce à la variable d'environnement comprenant ID & MDP 
mongoose.connect(MONGODB_URI,
  { useNewUrlParser: true,
    useUnifiedTopology: true })
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch(() => console.log('Connexion à MongoDB échouée !'));


  const app = express();

  app.use(cors());
  
  // la fonction "express.json()"" est une fonction middleware intégrée dans Express pour analyser le corps de la requête. (anciennement : body-parser)
  app.use(express.json());
  
  app.use(helmet());
  // mettre "Cross-Origin-Resource-Policy: same-site" => Permet d'autoriser à "helmet" le partage de ressources entre deux origines différentes
  app.use(helmet({ crossOriginResourcePolicy: { policy: "same-site" } }));
  
  app.use(morgan('combined'));
  
  // la limite de 100 requêtes toutes les 10 minutes sera effective sur toutes les routes
  app.use(limiter);
  
  // bases des routes auxquelles on ajoute les différentes routes "sauce" et "user" du dossier (routes)
  app.use('/api/sauces', sauceRoutes);
  app.use('/api/auth', userRoutes);
  
  // ajout d'une route pour pouvoir accéder à l'image de la sauce, grâce au middleware "static" d'express
  app.use("/images", express.static(path.join(__dirname, "images"))); // on récupère le répertoire où s'execute le server + le dossier (image)
  
  // export de app pour être utiliser sur le serveur
  module.exports = app;