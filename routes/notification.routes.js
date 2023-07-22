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
  const groupId = req.payload.group;
  let newNotifs = [];
  User.find({ group: groupId })
    .then((usersFromGroup) => {
      // Renvoie un tableau d'objets avec les Users du group
      for (let el of usersFromGroup) {
        Event.find({
          organizer: el._id,
          createdAt: { $gte: req.payload.lastReadNotif },
        })
          .then((newEvents) => newNotifs.push(newEvents))
          .catch((err) =>
            console.log("there was an error looking for new Events", err)
          );
        Project.find({
          creator: el._id,
          createdAt: { $gte: req.payload.lastReadNotif },
        })
          .then((newProjects) => newNotifs.push(newProjects))
          .catch((err) =>
            console.log("there was an error looking for new Projects", err)
          );
      }
    })
    .then(() => {
      newNotifs.sort(function (a, b) {
        return a.createdAt - b.createdAt;
      });
      res.status(200).json(newNotifs);
    })
    .catch((err) => next(err));
});

module.exports = router;
