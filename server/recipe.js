const express = require('express');
const mongoose = require('mongoose');
const util = require("util");
const multer = require("multer");
const { GridFsStorage } = require("multer-gridfs-storage");
const router = express.Router()

// Schema for recipes
const recipesSchema = new mongoose.Schema({
  author: String,
  title: String,
  description: String,
  calories: Number,
  ingredients: String,
  category: String,
  likes: Number,
  imageId: String
}, {
  versionKey: false // Get rid of __v when creating a document
});

// Mongoose model for recipes
const Recipe = mongoose.model('recipes', recipesSchema);

var storage = new GridFsStorage({
  db: mongoose.connection,
  options: {
    useNewUrlParser: true,
    useUnifiedTopology: true
  },
  file: (req, file) => {
    const match = ["image/png", "image/jpeg"];
    if (match.indexOf(file.mimetype) === -1) {
      console.log('Image type not supported');
      return null;
    } else {
      return {
        bucketName: 'image',
        filename: 'image_' + Date.now()
      };
    }
  }
});

// Filter out non png/jepg files when uploading
const fileFilter = (req, file, cb) => {
  const match = ["image/png", "image/jpeg"];
  // Reject a file of wrong type
  if (match.indexOf(file.mimetype) === -1) {
    req.fileValidationError = 'Image type not supported';
    cb(null, false, req.fileValidationError);
    console.log('Image type not supported');
  } else {
    cb(null, true);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter
}).single('image');

// Make an async version of upload()
const aSyncUpload = util.promisify(upload);

// Handle Recipe Upload
router.post('/upload', aSyncUpload, async (req, res) => {
  if ((req.fileValidationError)) {
    res.append('message', req.fileValidationError);
    res.send(false);
  } else {
    var author = req.body.author;
    var title = req.body.title;
    var calories = req.body.calories;
    var ingredient = req.body.ingredient;
    var description = req.body.description;
    var category = req.body.category;
    var imageId = req.file.id.toString();
    const newRecipe = new Recipe({
      author: author,
      title: title,
      description: description,
      calories: calories,
      ingredients: ingredient,
      category: category,
      imageId: imageId,
      likes: 0
    });
    await newRecipe.save()
    .then(doc => {
      res.append('message', title + ' uploaded successfully');
      res.send(true);
      console.log('Upload succeeded');
    })
    .catch(err => {
      res.append('message', 'An error occured while saving your recipe');
      res.send(false);
      console.log(err);
      console.log('Upload failed');
    });
  }
});

// Get an image by its objectId in databse. For example, the following url
// directs to the image whose objectId is 000000000000000000000000:
// http://localhost:4000/recipes/image/000000000000000000000000
router.get('/image/:imageId', (req, res) => {
  imageId = mongoose.Types.ObjectId(req.params.imageId);
  var bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
    bucketName: 'image',
  });
  bucket
  .find({
    _id: imageId
  })
  .toArray((err, files) => {
    if (!files || files.length === 0) {
      console.log('Image not found');
      res.status(404).send('Image not found');
    } else {
      bucket.openDownloadStream(imageId).pipe(res);
    }
  });
});

//Get all image data
router.get('/getImages', (req, res) => {
  var bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
    bucketName: 'image',
  });
  bucket.find().toArray((err, files) => {
    // Check if files
    if (!files || files.length === 0) {
      res.json("No image exists");
    } else {
      files.map(file => {
        if (file.contentType === 'image/jpeg' ||
            file.contentType === 'image/png') {
          file.isImage = true;
        }
        else {
          file.isImage = false;
        }
      });
      res.json({ files: files });
    }
  });
});

exports.router = router;