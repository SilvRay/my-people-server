const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

const Post = require("../models/Post.model");

// POST /api/posts Create a post
router.post("/posts", (req, res, next) => {
  const { posts, legend, creator } = req.body;
  Post.create({ posts, legend, creator })
    .then((newPost) => {
      res.status(201).json(newPost);
    })
    .catch((err) => res.json(err));
});

// GET /api/posts List the last 10 posts
router.get("/posts", (req, res, next) => {
  const page = req.query.page;
  const skip = (page - 1) * 10;

  Post.find()
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(10)
    .populate("creator")
    .then((posts) => {
      console.log("posts =", posts);

      res.status(200).json(posts);
    })
    .catch((err) => {
      console.log("here is the error", err);
      //res.json(err);
      next(err);
    });
});

// GET /api/posts/:postId Display a post
router.get("/posts/:postId", (req, res, next) => {
  const { postId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(postId)) {
    res.status(400).json({ message: "Specified id is not valid" });
    return;
  }

  Post.findById(postId)
    .then((foundedPost) => {
      res.status(200).json(foundedPost);
    })
    .catch((err) => res.json(err));
});

module.exports = router;
