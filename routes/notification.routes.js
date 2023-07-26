const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

const User = require("../models/User.model");
const Event = require("../models/Event.model");
const Project = require("../models/Project.model");
const Media = require("../models/Media.model");
const Group = require("../models/Group.model");

// GET /api/notifications Affichage des notifications
router.get("/notifications", (req, res, next) => {
  const page = req.query.page;
  const skip = (page - 1) * 10;
  // Créer tab de notif vide au départ
  let notificationsArr = [];
  // Créer une variable pour l'id du groupe
  let groupId = "";
  // Trouver le user connecté et retourner son groupe
  User.findById(req.payload._id)
    .then((foundUser) => {
      return (groupId = foundUser.group);
    })
    .then(() => {
      console.log("groupId=", groupId);

      return Project.find({ group: groupId }) // Trouver tous les projets du groupe
        .skip(skip) // En fonction de la page, skiper les 10 notif précédentes
        .limit(10); // limiter l'affichage des notifs à 10
    })
    .then((projectsFromDB) => {
      //console.log('projectsFromDB =', projectsFromDB)

      notificationsArr.push(...projectsFromDB); // On push les projets récupérés dans le tab de notif

      console.log("NotificationArr after projects =", notificationsArr);
    })
    .then(() => {
      return Event.find({ group: groupId }) // Trouver tous les events du groupe
        .skip(skip) // En fonction de la page, skiper les 10 notif précédentes
        .limit(10); // limiter l'affichage des notifs à 10
    })
    .then((eventsFromDB) => {
      notificationsArr.push(...eventsFromDB); // On push les events récupérés dans le tab de notif

      console.log("NotificationArr after both =", notificationsArr);

      // Trier toutes les notifs du plus récent au plus ancien
      notificationsArr.sort(function (a, b) {
        return a.createdAt - b.createdAt;
      });
      res.status(200).json(notificationsArr); // Renvoyer le tab de notif
    })
    .catch((err) => next(err));
});

// PUT /api/notifications Met à jour la date de lecture des notifs
router.put("/notifications", (req, res, next) => {
  // Récuperer la date d'aujorud'hui
  const today = Date.now();

  // Trouver le user connecté et mettre à jour le champ qui permet de savoir la dernière lecture des notifs
  User.findByIdAndUpdate(
    req.payload._id,
    { lastReadNotif: today },
    { new: true }
  )
    .then((updatedUser) => {
      // Récupérer le user mit à jour
      res.status(200).json(updatedUser); // Renvoyer en réponse le user mit à jour
    })
    .catch((err) => next(err));
});

// GET /api/newnotifs Affichage du badge avec les nouvelles notifications
router.get("/notifications-number", (req, res, next) => {
  // Créer une variable pour l'id du groupe
  let groupId = "";

  // Récuperer la date d'aujourd'hui
  let lastRead = new Date();

  // Notif non lues au départ sont de 0
  let unreadNotifs = 0;

  // Trouver le user connecté et retourner son groupe et la dernière fois qu'il a lu ses notifs
  User.findById(req.payload._id)
    .then((foundUser) => {
      return (groupId = foundUser.group), (lastRead = foundUser.lastReadNotif);
    })
    .then(() => {
      // console.log("groupId=", groupId);

      // Trouver tous les projets du groupe créés que le user n'a pas encore vu
      return Project.find({
        group: groupId,
        createdAt: { $gte: lastRead },
      }).count();
    })
    .then((unreadProjectNotifs) => {
      // console.log("unreadNotifs after projects", unreadProjectNotifs);

      // Ajouter au total de notifs non lues
      unreadNotifs += unreadProjectNotifs;

      // Trouver tous les events du groupe créés que le user n'a pas encore vu
      return Event.find({
        group: groupId,
        createdAt: { $gte: lastRead },
      }).count();
    })
    .then((unreadEventNotifs) => {
      // console.log("unreadNotifs after events", unreadEventNotifs);

      // Ajouter au total de notifs non lues
      unreadNotifs += unreadEventNotifs;

      // console.log("unreadNotifs total = ", unreadNotifs);

      res.status(200).json(unreadNotifs); // Renvoyer le total de notifs non lues
    })
    .catch((err) => next(err));
});

module.exports = router;
