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
router.put("/group/:groupId", (req, res, next) => {
  console.log("req.body", req.body);

  const { groupId } = req.params;
  const { invitedUsers } = req.body;

  // Rechercher les users déjà présents dans la base de données
  User.find({ email: { $in: invitedUsers } })
    .then((alreadyPresentUsers) => {
      // Filtrer les emails, à la fin il ne doit rester que ceux non trouvés dans les objets users
      const emailsArrFiltered = invitedUsers.filter((email) => {
        return !alreadyPresentUsers.some((user) => user.email === email);
      });

      if (emailsArrFiltered.length === 0) {
        return res.status(200).json({ message: "No Adresses to add." });
      } else {
        return Group.findByIdAndUpdate(
          groupId,
          { invitedUsers: emailsArrFiltered },
          { new: true }
        );
      }
    })
    .then((updatedGroup) => {
      if (!updatedGroup) {
        return res
          .status(404)
          .json({ message: "The group hasn't been found." });
      }

      res.status(200).json(updatedGroup);
    })
    .catch((err) => next(err));
});

// GET /api/group/me - Récupéerer le groupe associé au user connecté
router.get("/group/me", (req, res, next) => {
  // Récupérer l'ID de l'utilisateur authentifié depuis le token
  const userId = req.payload._id;

  // On recherche le user
  User.findById(userId)
    .populate("group") // Populate pour remplacer l'ID du groupe par l'objet complet du groupe
    .then((userFromDB) => {
      // Récupérer le groupe associé à l'utilisateur
      const group = userFromDB.group;
      //Vérifier si le user a bien un groupe
      if (!group) {
        return res
          .status(404)
          .json({ message: "User is not associated with any group." });
      }

      res.status(200).json(group);
    })
    .catch((err) => next(err));
});

module.exports = router;
