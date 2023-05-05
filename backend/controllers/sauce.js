// import du module File System
const fs = require("fs");
const status = require('http-status');
const Sauce = require("../models/Sauce");

// Fonction pour supprimer une image
const deleteImage = (filename) => {
  fs.unlink(`images/${filename}`, (err) => {
    if (err) console.log(err);
  });
};

exports.createSauce = async (req, res, next) => {
  try {

     const host = req.get("host");
    const imagesFolder = 'images';
    const imageName = req.file.filename;
    
    const sauceObject = JSON.parse(req.body.sauce);
    // supression de l'id de la requête car il sera créé automatiquement par la BDD
    delete sauceObject._id;
    // supression de l'userId pour éviter les requêtes malveillantes. On va utiliser l'userId du token d'identification à la place
    delete sauceObject._userId;

    // création d'une nouvelle sauce via le schéma "SAUCE"
    const sauce = new Sauce({
      ...sauceObject, // on parcourt l'objet pour récupérer les informations
      userId: req.auth.userId, // on remplace de userId de la requête par l'userID du token
      imageUrl: `${req.protocol}://${host}/${imagesFolder}/${imageName}`,
    });

    // Enregistre la sauce dans la base de données
    await sauce.save();

    res.status(status.OK).json({ message: "Nouvelle sauce enregistrée !" });
  } catch (error) {
    // Si une erreur se produit, supprime l'image enregistrée sur le serveur par multer
    if (req.file) {
      deleteImage(req.file.filename);
    }
    res.status(status.BAD_REQUEST).json({ error : "Une erreur est survenue veuillez réessayer svp" });
  }
};

exports.getAllSauce = (req, res, next) => {
  Sauce.find() // utilisation de la méthode .find() pour récupérer la liste complète des sauces
    .then(
      (sauces) => res.status(status.OK).json(sauces),
      console.log("Récupération Sauces Réussie !")
    )
    .catch((error) => res.status(status.BAD_REQUEST).json({ error }));
};

exports.getOneSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id }) // utilisation de la méthode .findOne avec en paramètre la comparaison de l'id en paramètre de requête et les id de la BDD
    .then((sauce) => res.status(status.OK).json(sauce))
    .catch((error) => res.status(404).json({ error }));
};

exports.deleteOneSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
    .then((sauce) => {
      // on vérifie que l'userID de la BDD correspond au userID récupéré du TOKEN
      if (sauce.userId !== req.auth.userId) {
        return res
          .status(status.FORBIDDEN)
          .json({ message: "Unauthorized request !" });
      } else {
        const filename = sauce.imageUrl.split("/images/")[1]; // on récupère le nom de l'image après le dossier "images" dans l'URL

        fs.unlink(`images/${filename}`, () => {
          // la méthode fs.unlink() est utilisée pour supprimer le fichier "filename" dans "images". Elle prend 2 paramètres (le path : string/url un callback : fonction qui sera appelée lors de l'exécution)
          Sauce.deleteOne({ _id: req.params.id })
            .then(() =>
              res
                .status(status.OK)
                .json({ message: "La sauce a bien été supprimée !" })
            )
            .catch((error) =>
              res.status(status.BAD_REQUEST).json({ error })
            );
        });
      }
    })
    .catch((error) =>
      res.status(status.INTERNAL_SERVER_ERROR).json({  })
    );
};

exports.modifySauce = async (req, res, next) => {
  try {
    const sauceObject = req.file
      ? {
          // Si une image est incluse dans la requête, crée un nouvel objet `sauceObject` qui inclut toutes les données de la requête JSON et le chemin de l'image téléchargée.
          ...JSON.parse(req.body.sauce),
          imageUrl: `${req.protocol}://${req.get("host")}/images/${
            // Construit l'URL de l'image
            req.file.filename
          }`,
        }
      : { ...req.body }; // Si aucune image n'est incluse dans la requête, création nouvel objet `sauceObject` à partir des données de la requête JSON.

    delete sauceObject._userId;

    const sauce = await Sauce.findOne({ _id: req.params.id });
    if (sauce.userId !== req.auth.userId) {
      return res
        .status(status.FORBIDDEN)
        .json({ message: "Forbidden request !" });
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

    return res
      .status(status.OK)
      .json({ message: "La sauce a bien été modifiée !" });
  } catch (error) {
    // Si une erreur survient, on supprime l'image enregistrée sur le serveur par multer
    if (req.file) {
      fs.unlink(`images/${req.file.filename}`, (err) => {
        if (err) {
          console.log(err);
        }
      });
    }
    return res.status(status.INTERNAL_SERVER_ERROR).json({  message: "Erreur serveur ! Veuillez ré-essayer !" });
  }
};

const likeMessage = "J'aime !";
const dislikeMessage = "Je n'aime pas !";
const anythingsMessage = "Sans avis !";
const alreadyLikeMessage =
  "Merci de votre retour ! Nous savons déjà que vous aimez.";
const alreadyDislikeMessage =
  "Merci de votre retour ! Nous savons déjà que vous n'aimez pas.";
const alreadyAnythingsMessage = "Merci de votre retour !";
const invalidParamsMessage = "Valeur 'like' invalide";
const allowableValues = [0, 1, -1];

// Objets contenant les messages correspondants à chaque règle
const messagesByRule = {
  1: { message: likeMessage, alreadyMessage: alreadyLikeMessage },
  "-1": { message: dislikeMessage, alreadyMessage: alreadyDislikeMessage },
  0: { message: anythingsMessage, alreadyMessage: alreadyAnythingsMessage },
};

// Fonction pour gérer la réussite
const handleSuccess = (res, message) => {
  console.log(res.path, message);
  res.status(status.OK).json;
};

// Fonction pour gérer l'erreur
const handleError = (res, error) => {
  console.log(res.path, error);
  res.status(status.BAD_REQUEST).json;
};

// Fonction pour préparer les paramètres à passer à la fonction updateOne
async function getPreparedFunction(chosenRuleString, message, userInfos) {
  const { userId, isLiked, isDisliked } = userInfos;

  const paramsForLike = {
    $pull: { usersDisliked: userId },
    $push: { usersLiked: userId },
    $inc: { likes: 1 },
  };
  const paramsForDislike = {
    $push: { usersDisliked: userId },
    $inc: { dislikes: 1 },
  };
  const paramsForAnything = { $pull: {}, $inc: {} };

  // Si la règle choisie est d'aimer et que l'utilisateur a déjà indiqué ne pas aimer la sauce, on retire son avis de "je n'aime pas"
  if (chosenRuleString === "1" && isDisliked) {
    paramsForLike.$pull.usersDisliked = userId;
    paramsForLike.$inc.dislikes = -1;
  }
  // Si la règle choisie est de ne pas aimer et que l'utilisateur a déjà indiqué aimer la sauce, on retire son avis de "j'aime"
  if (chosenRuleString === "-1" && isLiked) {
    paramsForDislike.$pull.usersLiked = userId;
    paramsForDislike.$inc.likes = -1;
  }
  // Si la règle choisie est de retirer son avis, on retire l'avis de l'utilisateur de la liste correspondante
  if (chosenRuleString === "0") {
    if (isLiked) {
      paramsForAnything.$pull.usersLiked = userId;
      paramsForAnything.$inc.likes = -1;
    }
    if (isDisliked) {
      paramsForAnything.$pull.usersDisliked = userId;
      paramsForAnything.$inc.dislikes = -1;
    }
  }

  // Dictionnaire des paramètres pour chaque règle
  const paramsManager = {
    1: paramsForLike,
    "-1": paramsForDislike,
    0: paramsForAnything,
  };

  // Fonction renvoyée qui applique la règle correspondante à une sauce donnée
  return async (res, itemTarget, itemId) => {
    try {
      // Met à jour la ressource correspondante avec les paramètres de la règle choisie
      await itemTarget.updateOne(
        { _id: itemId },
        paramsManager[chosenRuleString]
      );
      return res.status(status.OK).json;

    } catch (error) {
        return res.status(status.INTERNAL_SERVER_ERROR).json({  message: "Erreur serveur ! Veuillez ré-essayer !" });
  
    }
  };
}
// Cette fonction applique une règle à une ressource en fonction de l'action de l'utilisateur sur la ressource.
// Elle reçoit une repons(res) et un objet contenant des informations(userInfos).
const applyRuleByRessourceId = async (res, userInfos) => {

  const { // Déstructurer les userInfos pour obtenir des informations pertinentes sur l'action de l'utilisateur sur la ressource.
    isLiked,
    isDisliked,
    isAnything,
    likeParamStatus,
    ressource,
    ressourceId,
  } = userInfos;

  // Conversion du likeParamStatus en une chaîne de caractères, qui est utilisée pour rechercher le message approprié pour la règle.
  const likeParamString = likeParamStatus.toString();

  // On récupère les messages à afficher en fonction de la règle appliquée
  const { message, alreadyMessage } = messagesByRule[likeParamString];

  // Si l'utilisateur a déjà indiqué son avis et qu'il essaye de le changer, on renvoie un message d'erreur
  if (
    (likeParamStatus === 1 && isLiked) ||
    (likeParamStatus === -1 && isDisliked) ||
    (likeParamStatus === 0 && isAnything)
  ) {
    return handleSuccess(res, alreadyMessage);
  }

  try {
    // On récupère la fonction préparée qui appliquera la règle correspondante
    const applyRule = await getPreparedFunction(
      likeParamString,
      message,
      userInfos
    );
    // On applique la règle à la sauce correspondante
    await applyRule(res, ressource, ressourceId);
    return handleSuccess(res, message);
  } catch (error) {
    return handleError(
      res, 
      "Une erreur s'est produite lors de l'application de la règle ${likeParamString} à la ressource avec ID ${ressourceId}:"
    );
  }
};

exports.likeOrDislike = async (req, res, next) => {
  try {
    const like = Number(req.body.like); // utilisation de Number() pour s'assurer que like est un nombre
    const sauceId = req.params.id;
    const userId = req.auth.userId;

    if (!allowableValues.includes(like)) {
      return handleError(res, invalidParamsMessage);
    }

    const { usersLiked, usersDisliked } = await Sauce.findOne({ _id: sauceId });

    const isLiked = usersLiked.includes(userId);
    const isDisliked = usersDisliked.includes(userId);
    const isAnything = !isLiked && !isDisliked;

    const userInfosForSauce = {
      userId,
      isLiked,
      isDisliked,
      isAnything,
      likeParamStatus: like,
      ressource: Sauce,
      ressourceId: sauceId,
    };

    await applyRuleByRessourceId(res, userInfosForSauce);
    return res.status(OK).json({  message: "Requete effectuée ! Merci de votre retour !" });
  } catch (error) {
    return res.status(status.INTERNAL_SERVER_ERROR).json({  message: "Erreur serveur ! Veuillez ré-essayer !" });
  }
};
