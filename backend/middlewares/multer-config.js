const multer = require('multer');

// objet dictionnaire pour traiter les extensions | c'est un standard permettant d'indiquer la nature et le format d'un document (cf mozilla)
const MIME_TYPES = {
  'images/jpg': 'jpg',
  'images/jpeg': 'jpg',
  'images/png': 'png',
  'images/webp': 'webp',
  'images/bmp': 'bmp',
  'images/gif': 'gif',
};

// création de la logique d'enregistrement des fichiers entrants sur le disque (.diskStorage)
const storage = multer.diskStorage({
  // indique à multer où enregistrer les fichiers :
  destination: (req, file, callback) => { 
    // null = pas d'erreurs | "images" = dossier de destination
    callback(null, 'images') 
  },
  // indique à multer d'utiliser pour le nom de fichier : 
  filename: (req, file, callback) => { 
    // le nom d'origine, de remplacer les espaces par des underscores 
    const name = file.originalname.split(' ').join('_') 
    // créer l'extension grâce au dictionnaire qui correspond au MIME_TYPE envoyé par le front-end
    const extension = MIME_TYPES[file.mimetype] 
    // et d'ajouter un timestamp "Date.now()" comme nom de fichier. Elle utilise ensuite la constante dictionnaire de type MIME pour l'extension de fichier appropriée
    callback(null, name + Date.now() + '.' + extension) 
  },
});

// appel "multer" à laquelle on passe l'objet "storage", ainsi que de la méthode "single" car c'est un fichier unique qui est une image
module.exports = multer({storage}).single('image');