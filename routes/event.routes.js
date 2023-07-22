const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

const Event = require("../models/Event.model");
const User = require("../models/User.model");

//POST /api/events Création d'un event
router.post("/events", (req, res, next) => {
  const organizer = req.payload._id
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
  const groupId = req.payload._id  
 /*    .then((foundUser) => {
      console.log("foundUser",foundUser)
      return  */
    Event.find({'organizer.group':groupId, date: { $gte: Date.now() } })
        .populate('organizer')
        .sort({ createdAt: -1 })
    // })
    .then((allEvents) => {
      res.status(200).json(allEvents);
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
