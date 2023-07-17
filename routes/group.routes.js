const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

const Group = require("../models/Group.model");
const User = require("../models/User.model");

// POST /api/groups - Create a new group
router.post("/groups", (req, res, next) => {
  Group.create({ name: req.body.name, invitedUsers: req.bodyUsers })
    .then((newGroup) => {
      console.log("newGroup", newGroup);
      res.status(201).json(newGroup);
    })
    .catch((err) => next(err));
});

// router.get("/groups/:groupId", (req, res, next) => {
//   const { groupId } = req.params;
//   User.find({ group: groupId })
//     .populate("group")
//     .then((users) => {
//       res.status(200).json(users);
//     })
//     .catch((err) => res.json(err));
// });

// PUT /api/groups - Add a new member in the group
router.put("/group/:groupId", (req, res, next) => {
  console.log("req.body", req.body); // ["a@a.com", "b@b.com", c@c.com, d@d.com]
  // 1. filtrer req.body des emails deja presents en tant que users
  // 2. ne ajouter un email qui s'y trouverait deja
  const { groupId } = req.params;

  // älready present users: [{..}, {..}, {..}]
  const alreadyPresentUsers = User.find({ email: { $in: req.body } })
    .then(() => {
      const emailsArrFiltered = req.body.filter(function (email) {
        // chercher parmi alreadyPresentUsers si email .some()
        return !alreadyPresentUsers.some((el) => el.email === email);
      });
    })
    .then(() => {
      Group.findByIdAndUpdate(
        groupId,
        { invitedUsers: emailsArrFiltered },
        { new: true }
      ).then((updatedGroup) => {
        res.status(204).json(updatedGroup);
      });
    })
    .catch((err) => next(err));
});

//   Group.findByIdAndUpdate(
//     groupId,
//     { invitedUsers: emailsArrFiltered },
//     { new: true }
//   )
//     .then((updatedGroup) => {
//       res.status(204).json(updatedGroup);
//     })
//     .catch((err) => next(err));
// });

module.exports = router;
