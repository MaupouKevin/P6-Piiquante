const jwt = require('jsonwebtoken');

// import du module "dotenv" pour utiliser les variables d'environnement (ici la variable TOKEN pour la clé d'encodage)
const TOKEN = process.env.TOKEN;

// Export d'un middleware qui vérifie l'autorisation / l'authentification de la requête
module.exports = (req, res, next) => {
    try {
        // On récupère le token (crypté) qui est après "bearer" et l'espace dans les entêtes de requête "authorization"
        const token = req.headers.authorization.split(' ')[1]; 

        // On décode le token récupéré avec la clé secrète grâce à la méthode ".verify" de jsonwebtoken
        const decodedToken = jwt.verify(token, TOKEN); 
         
        // On récupère l'userId du token décodé et on l'ajoute à l'objet "request" qui sera transmis aux routes 
        const userId = decodedToken.userId;
        req.auth = {userId};

        next();

    } catch(error) {
        return res.status(401).json({ error });
    }
}