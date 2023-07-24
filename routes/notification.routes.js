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
  let notificationsArr = [];
  let groupId = "";
  User.findById(req.payload._id)
    .then((foundUser) => {
      return (groupId = foundUser.group);
    })
    .then(() => {
      console.log("groupId=", groupId);
      return Project.find({ group: groupId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(10);
    })
    .then((projectsFromDB) => {
      //console.log('projectsFromDB =', projectsFromDB)
      notificationsArr.push(...projectsFromDB);
      console.log("NotificationArr after projects =", notificationsArr);
    })
    .then(() => {
      return Event.find({ group: groupId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(10);
    })
    .then((eventsFromDB) => {
      notificationsArr.push(...eventsFromDB);
      console.log("NotificationArr after events =", notificationsArr);

      console.log("NotificationArr after both =", notificationsArr);
      notificationsArr.sort(function (a, b) {
        return a.createdAt - b.createdAt;
      });
      res.status(200).json(notificationsArr);
    })
    .catch((err) => next(err));
});

// PUT /api/notifications Met à jour la date de lecture des notifs
router.put("/notifications", (req, res, next) => {
  const today = Date.now();
  User.findByIdAndUpdate(req.payload._id, {lastReadNotif : today}, {new:true})
    .then((updatedUser) => {res.status(200).json(updatedUser)})
    .catch((err) => next(err))
})

// GET /api/newnotifs Affichage du badge avec les nouvelles notifications
router.get("/notifications-number", (req, res, next) => {
  let groupId = "";
  let lastRead = new Date();
  let unreadNotifs = 0;
  User.findById(req.payload._id)
    .then((foundUser) => {
      return (groupId = foundUser.group), (lastRead = foundUser.lastReadNotif);
    })
    .then(() => {
      console.log("groupId=", groupId);
      return (Project.find({
        group: groupId,
        createdAt: { $gte: lastRead },
      }).count());
    })
    .then((unreadProjectNotifs) => {
      console.log("unreadNotifs after projects", unreadProjectNotifs)
      unreadNotifs += unreadProjectNotifs
      return (Event.find({
        group: groupId,
        createdAt: { $gte: lastRead },
      }).count());
    })
    .then((unreadEventNotifs) => {
      console.log("unreadNotifs after events", unreadEventNotifs)
      unreadNotifs += unreadEventNotifs
      console.log("unreadNotifs total = ", unreadNotifs)
      res.status(200).json(unreadNotifs);
    })
    .catch((err) => next(err));
});

module.exports = router;
