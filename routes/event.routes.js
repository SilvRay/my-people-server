const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

const Event = require("../models/Event.model");
const User = require("../models/User.model");

//POST /api/events Création d'un event
router.post("/events", (req, res, next) => {
  // Récupérer l'ID de l'utilisateur authentifié depuis le token
  const creator = req.payload._id;
  // On recherche le user
  User.findById(creator).then((userFromDB) => {
    // Destructuration
    const { type, place, date, meal, games, theme } = req.body;
    // Récupérer le groupe de l'utilisateur trouvé
    const group = userFromDB.group;
    const kids = 0;
    // Vérifier si l'utilisateur a bien un groupe
    if (!group) {
      return res.status(500).json({ message: "there is no group yet" });
    }
    // Création de l'évènement
    Event.create({ creator, kids, group, type, place, date, meal, games, theme })
      .then((newEvent) => {
        res.status(201).json(newEvent);
      })
      .catch((err) => next(err));
  });
});

// GET /api/events Affichage des events de tous les utilisateurs de ton group
router.get("/events", (req, res, next) => {
  const creator = req.payload._id;
  User.findById(creator)
    .then((userFromDB) => {
      const groupId = userFromDB.group;
      Event.find({ group: groupId }).then((eventsFromGroup) => {
        res.status(200).json(eventsFromGroup);
      });
    })
    .catch((err) => next(err)); // on recup le group du user connecte
});

// GET /api/events Affichage d'un event
router.get("/events/:eventId", (req, res, next) => {
  const { eventId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(eventId)) {
    res.status(400).json({ message: "Specified id is not valid" });
    return;
  }

  Event.findById(eventId)
  .populate("creator")
  .then((foundedEvent) => {
      res.status(200).json(foundedEvent);
    })
    .catch((err) => next(err));
});

// PUT /api/events/:eventId/participate Participation à un évènement
router.put("/events/:eventId/participate", (req, res, next) => {
  const { eventId } = req.params;
  const newKids = req.body.kids;
  // const { userId } = req.payload;

  console.log("newKids =", newKids)

  Event.findByIdAndUpdate(
    eventId,
    { $inc: {kids : newKids}, $push: { participants: req.payload._id } }, //req.payload._id est l'id du user connecté qui participe à l'event
    { new: true }
  )
    .then((updatedEvent) => {
      if (!updatedEvent) {
        return res
          .status(404)
          .json({ message: "The event hasn't been found." });
      } else {
        res.status(200).json(updatedEvent);
      }
    })
    .catch((err) => next(err));
});

module.exports = router;
