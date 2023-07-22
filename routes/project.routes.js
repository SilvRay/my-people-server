const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const User = require("../models/User.model");

const Project = require("../models/Project.model");

// POST /api/projects Création d'un projet
router.post("/projects", (req, res, next) => {
  const { title, description } = req.body;

  // Ajouter 2 mois à la date actuelle
  const endDate = new Date();
  endDate.setMonth(endDate.getMonth() + 2);  

  const creator = req.payload._id;
  User.findById(creator)
    .then((userFromDB) => {
      const group = userFromDB.group
      if (!group){return res.status(500).json({message : "there is no group yet"})}

      Project.create({ creator, group, title, description, endDate })
        .then((newProject) => {
          res.status(201).json(newProject);
        })
      })
    .catch((err) => next(err));
});

// GET /api/projects Affichage des projects de tous les utilisateurs
router.get("/projects", (req, res, next) => {
  const page = req.query.page;
  const skip = (page - 1) * 10;
  User.findById(req.payload._id)
    .then((foundUser) => {
      const groupId = foundUser.group;
      return Project.find({group:groupId, endDate: { $gte: Date.now() }})
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(10)
      .populate("creator")
      })
    .then((allProjects) => {
      res.status(200).json(allProjects);
    })
    .catch((err) => next(err));
})


// GET /api/projects/:projectId Affichage d'un projet
router.get("/projects/:projectId", (req, res, next) => {
  const { projectId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(projectId)) {
    res.status(400).json({ message: "Specified id is not valid" });
    return;
  }

  Project.findById(projectId)
    .then((foundedProject) => {
      res.status(200).json(foundedProject);
    })
    .catch((err) => next(err));
});

module.exports = router;
