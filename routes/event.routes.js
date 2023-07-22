const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

const Event = require("../models/Event.model");
const User = require("../models/User.model");

//POST /api/events Création d'un event
router.post("/events", (req, res, next) => {
  const organizer = req.payload._id;
  const { type, place, date, meal, games, theme } = req.body;
  Event.create({ organizer, type, place, date, meal, games, theme })
    .then((newEvent) => {
      res.status(201).json(newEvent);
    })
    .catch((err) => next(err));
});

// GET /api/events Affichage des events de tous les utilisateurs de ton group
router.get("/events", (req, res, next) => {
  //User.findById(req.payload._id)
  const groupId = req.payload.group;
  console.log("here is the content of the payload", req.payload);
  let eventsFromGroup = [];
  User.find({ group: groupId })
    .then((usersFromGroup) => {
      console.log("usersFromGroups", usersFromGroup);
      for (let el of usersFromGroup) {
        Event.find({ organizer: el._id, date: { $gte: Date.now() } })
          .sort({ createdAt: -1 })
          .then((eventsFromUser) => eventsFromGroup.push(eventsFromUser));
      }
    })
    .then(() => {
      res.status(200).json(eventsFromGroup);
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
    .then((foundedEvent) => {
      res.status(200).json(foundedEvent);
    })
    .catch((err) => next(err));
});

// PUT /api/events/:eventId/participate Participation à un évènement
router.put("/events/:eventId/participate", (req, res, next) => {
  const { eventId } = req.params;
  const { kids } = req.body;
  // const { userId } = req.payload;

  Event.findByIdAndUpdate(
    eventId,
    { kids, $push: { participants: req.payload._id } }, //req.payload._id est l'id du user connecté qui participe à l'event
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
