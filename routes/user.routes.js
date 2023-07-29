const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

const User = require("../models/User.model");
const Event = require("../models/Event.model");
const Project = require("../models/Project.model");
const Media = require("../models/Media.model");
const Group = require("../models/Group.model");

// PUT /api/users Modification du profil
router.put("/users", (req, res, next) => {
  const { username, profile_img, birthday } = req.body;

  User.findByIdAndUpdate(
    req.payload._id,
    { username, profile_img, birthday },
    { new: true }
  )
    .then((updatedUser) => {
      res.status(200).json(updatedUser);
    })
    .catch((err) => next(err));
});

// GET /api/user/events Affichage des events créés par le user
router.get("/user/events", (req, res, next) => {
  console.log("req.payload._id is:", req.payload._id);

  Event.find({ creator: req.payload._id })
    .sort({ createdAt: -1 })
    .then((foundedEvents) => {
      res.status(200).json(foundedEvents);
    })
    .catch((err) => next(err));
});

// GET /api/user/projects Affichage des projects créés par le user
router.get("/user/projects", (req, res, next) => {
  Project.find({ creator: req.payload._id })
    .sort({ createdAt: -1 })
    .then((foundedProjects) => {
      res.status(200).json(foundedProjects);
    })
    .catch((err) => next(err));
});

// GET /api/user/medias Affichage des photos et vidéos postées par le user
router.get("/user/medias", (req, res, next) => {
  Media.find({ creator: req.payload._id })
    .sort({ createdAt: -1 })
    .then((foundedMedias) => {
      res.status(200).json(foundedMedias);
    })
    .catch((err) => next(err));
});

// GET /api/users Affichage des membres du groupe
router.get("/users/", (req, res, next) => {
  const groupId = req.payload.group;
  User.find({ group: groupId })
    .then((usersFromGroup) => {
      res.status(200).json(usersFromGroup);
    })
    .catch((err) => next(err));
});

// GET /api/users/search Affichage des membres du groupe en fonction de leur username
router.get("/users/search", (req, res, next) => {
  const groupId = req.payload.group;
  const searchUsername = req.query.username;

  User.find({
    group: groupId,
    username: { $regex: searchUsername, $options: "i" }, // Si l'utilisateur tape 'john' $regex permettra de trouver tous les username contenant la sous-chaîne 'john' et l'option "i" permet une recherche insensible à la casse
  })
    .then((usersFromdGroup) => {
      res.status(200).json(usersFromdGroup);
    })
    .catch((err) => next(err));
});

module.exports = router;
