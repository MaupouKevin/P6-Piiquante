const express = require ('express');
const httpStatus = require('http-status');
const mongoose = require('mongoose');
mongoose.set('strictQuery', false)
// import module "path" pour la gestion de chemins de stockage
const path = require('path');
// import du module "cors" afin d'accepter les requêtes provenant de sources différentes 
const cors = require('cors');
// import du module "morgan" pour que les informations sur les requêtes soient envoyées dans le terminal
const morgan = require('morgan');
const dotenv = require('dotenv');
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI; //import de la variabe d'environnement pour la connexion à la base da données
const helmet = require('helmet');
const xss = require("xss");
const html = xss('<script>alert("xss");</script>');
console.log(html);
const rateLimiter = require('express-rate-limit');
const limiter = rateLimiter({ 
  max: 100, // un maximum de 100 requêtes
  windowMs:60 * 250 * 10, // toutes les 2minutes30 (60 * 250ms  = 60 * 0.25s = 15s * 10 = 2mn30 )
  message: "Trop de requêtes effectuées depuis cette adresse IP" // affichera ce message une fois que le nombre de requêtes autorisées sera dépassé
});

const userRoutes = require('./routes/user');
const sauceRoutes = require('./routes/sauce');

mongoose.connect(MONGODB_URI,
  { useNewUrlParser: true,
    useUnifiedTopology: true })
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch(() => console.log('Connexion à MongoDB échouée !'));


  const app = express();

  app.use(cors());
  
  app.use(express.json());
  
  app.use(helmet());
 app.use(helmet({ crossOriginResourcePolicy: { policy: "same-site" } }));
  
  app.use(morgan('combined'));
  
  app.use(limiter);
  
  app.use('/api/sauces', sauceRoutes);
  app.use('/api/auth', userRoutes);
  
  app.use("/images", express.static(path.join(__dirname, "images"))); // on récupère le répertoire où s'execute le server + le dossier (image)
  
  module.exports = app;