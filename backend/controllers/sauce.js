// import du modèle "Sauce"
const Sauce = require('../models/Sauce');

// import du module FS (File System) pour créer et gérer des fichiers
const fs  = require ('fs');

// export du controlleur pour créer une sauce
exports.createSauce = (req, res, next) => {

    const sauceObject = JSON.parse(req.body.sauce); // on récupère l'objet en parsant la chaine de caractères JSON
    delete sauceObject._id; // supression de l'id de la requête car il sera créé automatiquement par la BDD
    delete sauceObject._userId; // supression de l'userId pour éviter les requêtes malveillantes. On va utiliser l'userId du token d'identification à la place
    
    const sauce = new Sauce({ // création d'une nouvelle sauce via le schéma "SAUCE" 
      ...sauceObject, // on parcourt l'objet pour récupérer les informations
      userId: req.auth.userId, // on remplace de userId de la requête par l'userID du token
      imageUrl: `${req.protocol}://${req.get("host")}/images/${req.file.filename}` // on créer l'URL de l'image : {http}://{localhost:3000}/images/{nom de limage par multer}
    });
    sauce.save() // On sauvegarde dans la BDD
      .then(() => res.status(201).json({message: "Nouvelle sauce enregistrée !"}))
      .catch((error) => res.status(400).json({ error }));
};

// export du controller qui affiche TOUTES les sauces
exports.getAllSauce = (req, res, next) => {
  
    Sauce.find() // utilisation de la méthode .find() pour récupérer la liste complète des sauces
      .then((sauces) => res.status(200).json(sauces)) // récupération du tableau de toutes les sauces dans la base
      .catch((error) => res.status(400).json({ error }));
};

// export du controller qui affiche UNE SEULE sauce
exports.getOneSauce = (req, res, next) => {
    Sauce.findOne({_id: req.params.id}) // utilisation de la méthode .findOne avec en paramètre la comparaison de l'id en paramètre de requête et les id de la BDD
        .then((sauce) => res.status(200).json(sauce)) // récupération des informations de la sauce récupérée
        .catch((error) => res.status(404).json({ error }));
};


// export du controller qui supprime une sauce
exports.deleteOneSauce = (req, res, next) => {
  Sauce.findOne({_id: req.params.id}) // utilisation de la méthode ".findOne" avec en paramètre la comparaison de l'id en paramètre de requête et les id de la BDD
    .then((sauce) => {
       // on vérifie que l'userID de la BDD correspond au userID récupéré du TOKEN
      if (sauce.userId != req.auth.userId) { // si ce n'est pas le cas on renvoie une erreur "requête non autorisée"
        res.status(403).json({message : 'Unauthorized request !'});
      } else {
        const filename = sauce.imageUrl.split('/images/')[1]; // on récupère le nom de l'image après le dossier "images" dans l'URL

        fs.unlink(`images/${filename}`, () => { // la méthode fs.unlink() est utilisée pour supprimer le fichier "filename" dans "images". Elle prend 2 paramètres (le path : string/url un callback : fonction qui sera appelée lors de l'exécution)
            Sauce.deleteOne({_id: req.params.id}) // puis on supprime la sauce de la BDD
                .then(() => res.status(200).json({message: "La sauce a bien été supprimée !"}))
                .catch((error) => res.status(400).json({ error }));
        })
      }
    })
    .catch((error) => res.status(500).json({ error }));
};

// export du controller qui modifie une sauce
exports.modifySauce = (req, res, next) => {
  const sauceObject = req.file ? { // est-ce que la requête contient un champs "File" ? si oui
    ...JSON.parse(req.body.sauce), // on récupère l'objet en parsant la chaine de caractères JSON
    imageUrl: `${req.protocol}://${req.get("host")}/images/${req.file.filename}`// on créer l'URL de l'image : {http}://{localhost:3000}/images/{nom de limage par multer}
  } 
  : {...req.body }; // sinon on récupère l'objet directement

  delete sauceObject._userId; // supression de l'userId pour éviter les requêtes malveillantes

  Sauce.findOne({_id: req.params.id}) // on récupère les informations de la sauce demandée
  .then((sauce) => {
    // on vérifie que l'userId de la BDD correspond au userId récupéré du TOKEN
    if (sauce.userId != req.auth.userId) { // Si ce n'est pas le cas on renvoie une erreur "requête non autorisée"
      res.status(403).json({message : "Unauthorized request !"});
    
    } else {

      if (req.file) { // si la requête contenait une image :
        const filename = sauce.imageUrl.split('/images/')[1];
        fs.unlink(`images/${filename}`, (error) => { // alors on supprime l'ancienne image du dossier image ou on affiche une erreur
          if (error) {
            console.log(error);
          }
        })
      }

      // Si c'est le bon utilisateur, on met à jour la sauce avec avec l'objet "sauceObject" le userId du token et l'id des paramètres de la requête
      Sauce.updateOne({ _id: req.params.id}, {...sauceObject, userId: req.auth.userId, _id: req.params.id})
        .then(() => res.status(200).json({message: "La sauce a bien été modifiée !"}))
        .catch((error) => res.status(401).json({ error }));
    }
  })
  .catch((error) => res.status(500).json({ error }));
};

// like/dislike sauce
exports.likeOrDislike = (req, res, next) => {

  like = req.body.like; // récupération de la valeur "like" dans le body de la requête
  sauceId = req.params.id;
  userId = req.auth.userId;

  if (like == -1) { // si la valeur de "like" est égale à -1 (donc "dislike" => clic sur le "je n'aime pas")

          /* on ajoute le userId dans la liste des "usersDisliked" dans la BDD 
          et on met à jour le nombre de dislikes de la sauce à +1 */
          Sauce.updateOne({ _id: sauceId }, {$push: { usersDisliked: userId }, $inc: { dislikes: +1 }})
            .then(() => res.status(200).json({ message: "Je n'aime pas !" }))
            .catch((error) => res.status(400).json({ error }));

  } else if (like == 0) { // si la valeur de "like" est égale 0 donc "neutre" (reclic sur le "j'aime" ou "je n'aime pas")

          // on cherche la sauce
          Sauce.findOne({ _id: sauceId })
            .then((sauce) => {
              // on vérifie si l'utilisateur a déjà like la sauce dans le tableau "usersLiked"
              if (sauce.usersLiked.includes(userId)) { // la méthode includes() permet de déterminer si un tableau (ici "usersLiked") contient une valeur (ici l'userId de l'utilisateur qui souhaite annuler son vote). Si c'est le cas alors :
              
                Sauce.updateOne({ _id: sauceId }, {$pull: { usersLiked: userId }, $inc: { likes: -1 }}) // On enlève l'utilisateur du tableau "usersLiked" et on donne "-1" aux likes pour enlever son avis
                    .then(() => res.status(200).json({ message: "Sans avis !" }))
                    .catch((error) => res.status(400).json({ error }));
              }

              // on vérifie si l'utilisateur a déjà dislike la sauce dans le tableau "usersDisLiked"
              if (sauce.usersDisliked.includes(userId)) { // la méthode includes() permet de déterminer si un tableau (ici "usersDisliked") contient une valeur. Si c'est le cas alors :

                  Sauce.updateOne({ _id: sauceId }, {$pull: { usersDisliked: userId }, $inc: { dislikes: -1 }}) // On enlève l'utilisateur du tableau "usersDisliked" et on donne "-1" aux Dislikes pour enlever son avis
                    .then(() => res.status(200).json({ message: "Sans avis !" }))
                    .catch((error) => res.status(400).json({ error }));
              }
          })
            .catch((error) => res.status(400).json({ message: error.message }));

  } else if (like == 1) { // si la valeur de "like" est égale à 1 ( donc "like" => clic sur le "j'aime")

          /* on ajoute le userId dans la liste des "usersLikes" dans la BDD 
          et on met à jour le nombre de likes de la sauce à +1 */
          Sauce.updateOne({ _id: sauceId }, {$push: { usersLiked: userId }, $inc: { likes: +1 }})
            .then(() => res.status(200).json({ message: "J'aime !" }))
            .catch((error) => res.status(400).json({ error }));
  }
}