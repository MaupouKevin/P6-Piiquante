// import du module File System
const fs  = require ('fs');

const Sauce = require('../models/Sauce');


exports.createSauce = async (req, res, next) => {
  try {
    const sauceObject = JSON.parse(req.body.sauce);
    // supression de l'id de la requête car il sera créé automatiquement par la BDD
    delete sauceObject._id;
    // supression de l'userId pour éviter les requêtes malveillantes. On va utiliser l'userId du token d'identification à la place
    delete sauceObject._userId;

    // création d'une nouvelle sauce via le schéma "SAUCE"
    const sauce = new Sauce({
      ...sauceObject, // on parcourt l'objet pour récupérer les informations
      userId: req.auth.userId, // on remplace de userId de la requête par l'userID du token
      imageUrl: `${req.protocol}://${req.get("host")}/images/${req.file.filename}`,
    });

    // Enregistre la sauce dans la base de données
    await sauce.save();

    res.status(201).json({ message: "Nouvelle sauce enregistrée !" });
  } catch (error) {
    // Si une erreur se produit, supprime l'image enregistrée sur le serveur par multer
    if (req.file) {
      fs.unlink(`images/${req.file.filename}`, (err) => {
        if (err) console.log(err);
      });
    }
    res.status(400).json({ error });
  }
};


exports.getAllSauce = (req, res, next) => {
  
    Sauce.find() // utilisation de la méthode .find() pour récupérer la liste complète des sauces
      .then((sauces) => res.status(200).json(sauces) , console.log('Récupération Sauces Réussie !')) 
      .catch((error) => res.status(400).json({ error }));
};


exports.getOneSauce = (req, res, next) => {
    Sauce.findOne({_id: req.params.id}) // utilisation de la méthode .findOne avec en paramètre la comparaison de l'id en paramètre de requête et les id de la BDD
        .then((sauce) => res.status(200).json(sauce))
        .catch((error) => res.status(404).json({ error }));
};



exports.deleteOneSauce = (req, res, next) => {
  Sauce.findOne({_id: req.params.id})
      .then((sauce) => {
       // on vérifie que l'userID de la BDD correspond au userID récupéré du TOKEN
      if (sauce.userId !== req.auth.userId) { 
        return res.status(403).json({message : 'Unauthorized request !'});
      } else {
        const filename = sauce.imageUrl.split('/images/')[1]; // on récupère le nom de l'image après le dossier "images" dans l'URL

        fs.unlink(`images/${filename}`, () => { // la méthode fs.unlink() est utilisée pour supprimer le fichier "filename" dans "images". Elle prend 2 paramètres (le path : string/url un callback : fonction qui sera appelée lors de l'exécution)
            Sauce.deleteOne({_id: req.params.id})
                .then(() => res.status(200).json({message: "La sauce a bien été supprimée !"}))
                .catch((error) => res.status(400).json({ error }));
        })
      }
    })
    .catch((error) => res.status(500).json({ error }));
};

exports.modifySauce = async (req, res, next) => {
  try {
    const sauceObject = req.file
      ? { // Si une image est incluse dans la requête, crée un nouvel objet `sauceObject` qui inclut toutes les données de la requête JSON et le chemin de l'image téléchargée.
          ...JSON.parse(req.body.sauce),
          imageUrl: `${req.protocol}://${req.get("host")}/images/${ // Construit l'URL de l'image
            req.file.filename
          }`,
        }
      : { ...req.body }; // Si aucune image n'est incluse dans la requête, création nouvel objet `sauceObject` à partir des données de la requête JSON.

    delete sauceObject._userId;

    const sauce = await Sauce.findOne({ _id: req.params.id });
    if (sauce.userId !== req.auth.userId) {
      return res.status(403).json({ message: "Forbidden request !" });
    }

    let filenameToDelete;
    if (req.file) {
      filenameToDelete = sauce.imageUrl.split("/images/")[1];
    }

    await Sauce.updateOne(
      { _id: req.params.id },
      { ...sauceObject, userId: req.auth.userId, _id: req.params.id }
    );

    if (filenameToDelete) {
      await new Promise((resolve, reject) => {
        fs.unlink(`images/${filenameToDelete}`, (error) => {
          if (error) {
            reject(error);
          } else {
            resolve();
          }
        });
      });
    }

    return res.status(200).json({ message: "La sauce a bien été modifiée !" });
  } catch (error) {
    // Si une erreur survient, on supprime l'image enregistrée sur le serveur par multer
    if (req.file) {
      fs.unlink(`images/${req.file.filename}`, (err) => {
        if (err) {
          console.log(err);
        }
      });
    }
    return res.status(500).json({ error });
  }
};


// like/dislike sauce
exports.likeOrDislike = (req, res, next) => {
  like = req.body.like;
  sauceId = req.params.id;
  userId = req.auth.userId;

  // Fonction pour gérer la réussite
  const handleSuccess = (res, message) => {
    res.status(200).json({ message });
  };

  // Fonction pour gérer l'erreur
  const handleError = (res, error) => {
    res.status(400).json({ error });
  };

  if (like === -1) {
    Sauce.updateOne(
      { _id: sauceId },
      { $push: { usersDisliked: userId }, $inc: { dislikes: +1 } }
    )
      .then(() => handleSuccess(res, "Je n'aime pas !"))
      .catch((error) => handleError(res, error));

  } else if (like === 0) {
    Sauce.findOne({ _id: sauceId })
      .then((sauce) => {
        if (sauce.usersLiked.includes(userId)) {
          Sauce.updateOne(
            { _id: sauceId },
            { $pull: { usersLiked: userId }, $inc: { likes: -1 } }
          )
            .then(() => handleSuccess(res, "Sans avis !"))
            .catch((error) => handleError(res, error));
        }
        if (sauce.usersDisliked.includes(userId)) {
          Sauce.updateOne(
            { _id: sauceId },
            { $pull: { usersDisliked: userId }, $inc: { dislikes: -1 } }
          )
            .then(() => handleSuccess(res, "Sans avis !"))
            .catch((error) => handleError(res, error));
        }
      })
      .catch((error) => handleError(res, error));

  } else if (like == 1) {
    Sauce.updateOne(
      { _id: sauceId },
      { $push: { usersLiked: userId }, $inc: { likes: +1 } }
    )
      .then(() => handleSuccess(res, "J'aime !"))
      .catch((error) => handleError(res, error));
  }
};