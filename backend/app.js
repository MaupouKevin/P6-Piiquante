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

const MONGODB_URI = process.env.MONGODB_URI; 

const helmet = require('helmet');

const xss = require("xss");
const html = xss('<script>alert("xss");</script>');
console.log(html);

const rateLimiter = require('express-rate-limit');

const limiter = rateLimiter({ // configuration d'express-rate-limit
  max: 100, 
  windowMs:60 * 500 * 10, //(60 * 500ms  = 60 * 0.5s = 30s * 10 = 5 mn )
  message: "Trop de requêtes effectuées depuis cette adresse IP"
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
  // mettre "Cross-Origin-Resource-Policy: same-site" => Permet d'autoriser à "helmet" le partage de ressources entre deux origines différentes
  app.use(helmet({ crossOriginResourcePolicy: { policy: "same-site" } }));
  
  app.use(morgan('combined'));
  
  app.use(limiter);
  
  app.use('/api/sauces', sauceRoutes);
  app.use('/api/auth', userRoutes);
  
  app.use("/images", express.static(path.join(__dirname, "images"))); 
  
  module.exports = app;