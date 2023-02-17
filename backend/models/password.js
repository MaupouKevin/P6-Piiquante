// import du module "password-validator" pour vérifier la complexité des mots de passe
const passwordValidator = require('password-validator');

// création du modèle de schéma pour le mot de passe
const passwordSchema = new passwordValidator();

// compléxité du mot de passe requise :
passwordSchema
    .is().min(6) // minimum de 8 caractères
    .is().max(30) // maximum de 30 caractères
    .has().uppercase() // doit contenir "au moins 1 majuscule"
    .has().lowercase() // doit contenir "au moins 1 minuscule"
    .has().digits(1) // doit contenir "au moins 1 chiffre"
    .has().not().spaces() // NE doit PAS contenir d'espaces
    .is().not().oneOf(['Passw0rd', 'Password123', 'P4ssword', 'P4ssw0rd']); // ces mots de passe sont interdits car trop simples

module.exports = passwordSchema;