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
    Event.create({
      creator,
      kids,
      group,
      type,
      place,
      date,
      meal,
      games,
      theme,
    })
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
      const groupId = userFromDB.group; // on recup le group du user connecte
      Event.find({ group: groupId }).then((eventsFromGroup) => {
        res.status(200).json(eventsFromGroup);
      });
    })
    .catch((err) => next(err));
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
    .populate("participants")
    .then((foundedEvent) => {
      res.status(200).json(foundedEvent);
    })
    .catch((err) => next(err));
});

// PUT /api/events/:eventId Modification de son propre évènement
router.put("/events/:eventId", (req, res, next) => {
  const { eventId } = req.params;
  const { type, place, date, meal, games, theme } = req.body;

  if (!mongoose.Types.ObjectId.isValid(eventId)) {
    res.status(400).json({ message: "Specified id is not valid" });
    return;
  }

  // Rechercher l'event par son ID et vérifier si le créateur correspond au user connecté
  Event.findOneAndUpdate(
    { _id: eventId, creator: req.payload._id },
    { type, place, date, meal, games, theme },
    { new: true }
  )
    .then((updatedEvent) => {
      if (!updatedEvent) {
        return res
          .status(404)
          .json({ message: "The event hasn't been found." });
      }
      res.status(200).json(updatedEvent);
    })
    .catch((err) => next(err));
});

// PUT /api/events/:eventId/participate Participation à un évènement
router.put("/events/:eventId/participate", (req, res, next) => {
  const { eventId } = req.params;
  const newKids = req.body.kidsNb;
  const userId = req.payload._id;

  // Récupérer l'événement pour voir si l'utilisateur participe déjà
  Event.findById(eventId)
    .then((eventFromDB) => {
      if (!eventFromDB) {
        return res
          .status(404)
          .json({ message: "The event hasn't been found." });
      }

      // Vérifier si l'utilisateur participe déjà
      const participation = eventFromDB.participants.includes(userId);

      // Construire l'objet de MAJ
      const updateParticipation = { $inc: { kids: newKids } };

      // Vérifier si l'utilisateur participe déjà à l'évènement ou pas
      if (!participation) {
        updateParticipation.$push = { participants: userId }; // Retirer l'utilisateur
      } else {
        updateParticipation.$pull = { participants: userId }; // Ajouter l'utilisateur
      }

      // Mettre à jour l'événement
      return Event.findByIdAndUpdate(
        eventId,
        updateParticipation, // userId est l'id du user connecté qui participe à l'event
        { new: true }
      );
    })
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

router.delete("/events/:eventId", (req, res, next) => {
  const { eventId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(eventId)) {
    res.status(400).json({ message: "Specified id is not valid" });
    return;
  }

  Event.findByIdAndRemove(eventId)
    .then((foundedEvent) => {
      res.status(204).json({
        message: `Event with ${eventId} is removed successfully.`,
      });
    })
    .catch((err) => next(err));
});

router.delete("/events", (req, res, next) => {
  Event.find()
    .then((allEvents) => {
      console.log("All EVENTS from DB ===", allEvents);

      const today = Date.now();

      // Créer un tableau de promesses de suppression d'un event
      const removalPromises = allEvents.map((event) => {
        console.log("One of all events ===", event);

        if (event.date < today) {
          // Retourner une promesse pour chaque suppression
          return Event.findByIdAndRemove(event._id).then(() => {
            console.log("One Event removed successfully");
          });
        }
      });

      // Attendre que toutes les suppressions ont eu lieu grâce à Promise.all
      Promise.all(removalPromises)
        .then(() => {
          // Renvoyer une seule réponse après que tous les events ont été traités
          res.status(204).json({
            message: `Events is removed successfully`,
          });
        })
        .catch((err) => next(err));
    })
    .catch((err) => next(err));
});

module.exports = router;
