// import du module "jsonwebtoken" vérifier le token d'authentification
const jwt = require('jsonwebtoken');

const processToken = process.env.TOKEN;

// Export d'un middleware qui vérifie l'autorisation / l'authentification de la requête
module.exports = (req, res, next) => {
    try {
        // On récupère le token (crypté) qui est après "bearer" et l'espace dans les entêtes de requête "authorization"
        const frontToken = req.headers.authorization.split(' ')[1]; 

        // On décode le token récupéré avec la clé secrète grâce à la méthode ".verify" de jsonwebtoken
        const decodedToken = jwt.verify(frontToken, processToken); 
         
        // On récupère l'userId du token décodé et on l'ajoute à l'objet "request" qui sera transmis aux routes 
        const userId = decodedToken.userId;

        if (userId === undefined) {
            // si userId n'est pas défini, on renvoie une erreur 401 Unauthorized
            return res.status(httpStatus.UNAUTHORIZED).json({ error: 'Autorisation Refusée  ! Veuillez vous reconnecter !' });
          }
        req.auth = {
            userId: userId,
        };

        next()

    } catch(error) {
        return res.status(httpStatus.UNAUTHORIZED).json({ error });
    }
}