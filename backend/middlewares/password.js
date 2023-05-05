//import du schema de mot de passe
const passwordSchema = require('../models/Password');
const status = require('http-status');

// export du module de vérification de mots de passe
exports.password = (req, res, next) => {
    // si le mot de passe ne passe pas le test de compléxité alors :
    if (!passwordSchema.validate(req.body.password)) { 
        // on affiche les details dans la console et on renvoie un message d'erreur dans la réponse
        console.log(passwordSchema.validate(req.body.password, { details: true })); 
        res.status(status.BAD_REQUEST).json({ error: "Mot de passe incorrect : Le mot de passe doit comprendre entre 6 et 30 caractères, au moins une minuscule, au moins une majuscule, un chiffre, pas d'espaces" });    
        return res.status(status.OK).json({message: 'Mot de passe validé'})

    } else {
        next();
    }
}; 