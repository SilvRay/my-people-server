const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const User = require("../models/User.model");
const fileUploader = require("../config/cloudinary.config");

const Media = require("../models/Media.model");

// POST "/api/upload" => Route that receives the image, sends it to Cloudinary via the fileUploader and returns the image URL
router.post(
  "/upload/post",
  fileUploader.fields([{ name: "mediasUrl", maxCount: 10 }]),
  (req, res, next) => {
    //router.post("/upload", fileUploader.single("mediasUrl"), (req, res, next) => {

    console.log("files are: ", req.files.mediasUrl[0]);
    //const filesUrl = req.files.mediasUrl.map((el) => el.path)
    if (!req.files.mediasUrl) {
      next(new Error("No file uploaded!"));
      return;
    }
    let urlArr = [];
    for (let el of req.files.mediasUrl) {
      urlArr.push(el.path);
    }

    // Get the URL of the uploaded file and send it as a response.
    // 'fileUrl' can be any name, just make sure you remember to use the same when accessing it on the frontend
    res.json({ filesUrl: urlArr });
  }
);

// POST /api/medias Create a post
router.post("/medias", (req, res, next) => {
  //const legend = req.body.legend;
  const medias = req.body;
  console.log("media passed from client ==", medias);
  const creator = req.payload._id;
  //const mediasFromPost = req.files.postMedia.map((el) => el.path);

  User.findById(creator)
    .then((userFromDB) => {
      const group = userFromDB.group;
      if (!group) {
        return res.status(500).json({ message: "there is no group yet" });
      }
      Media.create({ group, medias, creator }).then((newMedia) => {
        res.status(201).json(newMedia);
      });
    })

    .catch((err) => res.json(err));
});

// GET /api/medias List the last 10 posts
router.get("/medias", (req, res, next) => {
  const page = req.query.page;
  const skip = (page - 1) * 10;

  User.findById(req.payload._id)
    .then((foundUser) => {
      const groupId = foundUser.group;
      console.log("groupId=", groupId);
      Media.find({ group: groupId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(10)
        .populate("creator")
        .then((medias) => {
          console.log("medias =", medias);
          res.status(200).json(medias);
        });
    })
    .catch((err) => {
      console.log("here is the error", err);
      //res.json(err);
      next(err);
    });
});

// GET /api/medias/:mediaId Display a post
router.get("/medias/:mediaId", (req, res, next) => {
  const { mediaId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(mediaId)) {
    res.status(400).json({ message: "Specified id is not valid" });
    return;
  }

  Media.findById(mediaId)
    .then((foundedMedia) => {
      const mediaUrls = foundedMedia.medias;
      res.status(200).json({ medias: mediaUrls });
    })
    .catch((err) => res.json(err));
});

// PUT /api/medias/:mediaId/legend pour rajouter une légende au post
router.put("/medias/:mediaId/legend", (req, res, next) => {
  const { mediaId } = req.params;
  const legend = req.body.legend;

  console.log("req.body ===", req.body);
  console.log("mediaId ===", mediaId);

  if (!mongoose.Types.ObjectId.isValid(mediaId)) {
    return res.status(400).json({ message: "Specified id is not valid" });
  }

  // Trouver le media par son ID
  Media.findByIdAndUpdate(mediaId, { legend }, { new: true })
    .then((updatedMedia) => {
      res.status(200).json(updatedMedia);
    })
    .catch((err) => next(err));
});

// PUT /api/medias/:mediaId/comments Ajouter des commentaires
router.post("/medias/:mediaId/comments", (req, res, next) => {
  const { mediaId } = req.params;
  const content = req.body.content;

  console.log("req.body ===", req.body);
  console.log("mediaId ===", mediaId);

  if (!mongoose.Types.ObjectId.isValid(mediaId)) {
    return res.status(400).json({ message: "Specified id is not valid" });
  }

  // Trouver le media par son ID
  Media.findByIdAndUpdate(
    mediaId,
    {
      $push: {
        comments: {
          userId: req.payload._id,
          content,
        },
      },
    },
    { new: true }
  )
    .then((updatedMedia) => {
      if (!updatedMedia) {
        return res.status(404).json({ message: "Media not found" });
      }

      res.status(200).json(updatedMedia);
    })

    .catch((err) => next(err));
});

// GeET /api/medias/:mediaId/comments Affichage des commentaires
router.get("/medias/:mediaId/comments", (req, res, next) => {
  const { mediaId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(mediaId)) {
    return res.status(400).json({ message: "Specified id is not valid" });
  }

  // Trouver le media par son ID
  Media.findById(mediaId)
    .populate("comments.userId")
    .then((foundedMedia) => {
      res.status(200).json(foundedMedia.comments);
    })
    .catch((err) => next(err));
});

module.exports = router;
