const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

const Media = require("../models/Media.model");

// POST /api/medias Create a post
router.post("/medias", (req, res, next) => {
  const { medias, legend, creator } = req.body;
  Media.create({ medias, legend, creator })
    .then((newMedia) => {
      res.status(201).json(newMedia);
    })
    .catch((err) => res.json(err));
});

// GET /api/medias List the last 10 posts
router.get("/medias", (req, res, next) => {
  const page = req.query.page;
  const skip = (page - 1) * 10;

  Media.find()
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(10)
    .populate("creator")
    .then((medias) => {
      console.log("medias =", medias);

      res.status(200).json(medias);
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
      res.status(200).json(foundedMedia);
    })
    .catch((err) => res.json(err));
});

module.exports = router;
