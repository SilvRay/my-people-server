const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

const Notification = require("../models/Notification.model");

// GET /api/notifications Affichage des notifications
router.get("/notifications", (req, res, next) => {});

module.exports = router;
