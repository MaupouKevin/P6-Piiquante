//import du schema de mot de passe
const passwordSchema = require('../models/Password');

// export du module de vérification de mots de passe
exports.password = (req, res, next) => {
    if (!passwordSchema.validate(req.body.password)) {
        console.log(passwordSchema.validate(req.body.password, { details: true }));
        res.writeHead(400, " Mot de passe incorrect : Le mot de passe doit comprendre entre 6 et 30 caractères, au moins une minuscule, au moins une majuscule, un chiffre, pas d'espaces ", {"content-type": "application/json"});
        res.end(" Mot de passe incorrect ! ");

        return;

    } else {

        next();
    }
}; 