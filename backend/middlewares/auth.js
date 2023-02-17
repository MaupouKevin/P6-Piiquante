//import du package de token chiffrer
const jwt = require('jsonwebtoken');

// import du module "dotenv" pour utiliser les variables d'environnement (ici la variable TOKEN pour la clé d'encodage)
const dotenv = require('dotenv');
dotenv.config();
const TOKEN = process.env.TOKEN;

module.exports = (req, res, next) => {
    try {
        const token = req.headers.authorization.split(' ')[1];
        const decodedToken = jwt.verify(token, TOKEN);
        const userId = decodedToken.userId;
        req.auth = {
            userId: userId,
        };
        next()
    } catch(error) {
        return res.status(401).json({error});
    }
}