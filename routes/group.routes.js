const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

const Group = require("../models/Group.model");
const User = require("../models/User.model");

// POST /api/groups - Create a new group
router.post("/groups", (req, res, next) => {
  console.log("req.payload._id", req.payload._id);
  Group.create({ name: req.body.name })
    .then((newGroup) => {
      User.findByIdAndUpdate(
        req.payload._id,
        { group: newGroup._id },
        { new: true }
      ).then((userUpdated) => {
        console.log("updatedUser", userUpdated);
        console.log("newGroup", newGroup);
        res.status(201).json(newGroup);
      });
    })
    .catch((err) => console.log("stg went wrong while creating group", err));
});

// PUT /api/group - Add a new member in the group
router.put("/group", (req, res, next) => {
  const invitedUsers = req.body.emailsList;

  // Créer une variable pour l'id du groupe
  let groupId = "";

  User.findById(req.payload._id)
    .then((userFromDB) => {
      return (groupId = userFromDB.group);
    })
    .then(() => {
      return Group.findByIdAndUpdate(
        groupId,
        { $push: { invitedUsers: invitedUsers } },
        { new: true }
      );
    })
    .catch((err) => {
      console.log("Error", err);
      next(err);
    });
});

// GET /api/group/me - Récupérer le groupe associé au user connecté
router.get("/group/me", (req, res, next) => {
  // Récupérer l'ID de l'utilisateur authentifié depuis le token
  const userId = req.payload._id;
  console.log("userId ===", userId);

  // On recherche le user
  User.findById(userId)
    .populate("group") // Populate pour remplacer l'ID du groupe par l'objet complet du groupe
    .then((userFromDB) => {
      // Récupérer le groupe associé à l'utilisateur
      const group = userFromDB.group;
      //Vérifier si le user a bien un groupe
      if (!group) {
        return res.status(404).json({ message: "There is no group yet" });
      }

      res.status(200).json(group);
    })
    .catch((err) => next(err));
});

module.exports = router;
