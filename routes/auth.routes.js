const express = require("express");
const router = express.Router();

// ℹ️ Handles password encryption
const bcrypt = require("bcrypt");

// ℹ️ Handles password encryption
const jwt = require("jsonwebtoken");

// Require the User model in order to interact with the database
const User = require("../models/User.model");
const Group = require("../models/Group.model");

// Require necessary (isAuthenticated) middleware in order to control access to specific routes
const { isAuthenticated } = require("../middleware/jwt.middleware.js");

// How many rounds should bcrypt run the salt (default - 10 rounds)
const saltRounds = 10;

// HEAD /api/users?email= - Check the email availability
router.head("/users", (req, res, next) => {
  const email = req.query.email;

  if (!email) return next(new Error("?email is required"));

  // si email ne "ressemble" pas a un email => 400
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  if (!emailRegex.test(email)) {
    res.status(400).json({ message: "Provide a valid email address." });
    return;
  }

  User.findOne({ email })
    .then((foundUser) => {
      // If the user with the same email already exists, send an error response
      if (foundUser) {
        res.status(409).json({ message: "User already exists." });
      } else {
        res.status(204).send();
      }
    })
    .catch((err) => console.log(err));
});

// POST /auth/signup  - Creates a new user in the database
router.post("/signup", (req, res, next) => {
  console.log("Creation d'un User");

  const { email, username, password, profileImg } = req.body;
  const lastReadNotif = Date.now();

  // Check if email or password or name are provided as empty strings
  if (email === "" || password === "" || username === "") {
    res.status(400).json({ message: "Provide email, password and username" });
    return;
  }

  // This regular expression check that the email is of a valid format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  if (!emailRegex.test(email)) {
    res.status(400).json({ message: "Provide a valid email address." });
    return;
  }

  // This regular expression checks password for special characters and minimum length
  const passwordRegex = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}/;
  if (!passwordRegex.test(password)) {
    res.status(400).json({
      message:
        "Password must have at least 6 characters and contain at least one number, one lowercase and one uppercase letter.",
    });
    return;
  }

  // Proceed to hash the password
  const salt = bcrypt.genSaltSync(saltRounds);
  const hashedPassword = bcrypt.hashSync(password, salt);

  // Create the new user in the database
  // We return a pending promise, which allows us to chain another `then`

  //Check if email already belongs to a group through "Invited Users"
  Group.find({ invitedUsers: { $in: email } })
    .then((groupFromDB) => {
      console.log("groupfrom DB =", groupFromDB);

      if (groupFromDB.length === 0) {
        User.create({
          username,
          email,
          password: hashedPassword,
          lastReadNotif,
        }).then((userCreated) => {
          res.status(201).json(userCreated);
        });
      } else {
        return User.create({
          username,
          email,
          group: groupFromDB[0].id,
          password: hashedPassword,
          lastReadNotif,
        }).then((createdUser) => {
          // Deconstruct the newly created user object to omit the password
          // We should never expose passwords publicly
          const { email, username, _id, group, lastReadNotif } = createdUser;
          console.log("createdUser=", createdUser);
          // Create a new object that doesn't expose the password
          const user = { email, username, _id, group, lastReadNotif };

          // Send a json response containing the user object
          res.status(201).json({ user: user });
        });
      }
    })
    .catch((err) => {
      console.log("Error", err);

      next(err);
    }); // In this case, we send error handling to the error handling middleware.
});

// POST  /auth/login - Verifies email and password and returns a JWT
router.post("/login", (req, res, next) => {
  const { email, password } = req.body;

  // Check if email or password are provided as empty string
  if (email === "" || password === "") {
    res.status(400).json({ message: "Provide email and password." });
    return;
  }

  // Check the users collection if a user with the same email exists
  User.findOne({ email })
    .then((foundUser) => {
      if (!foundUser) {
        // If the user is not found, send an error response
        res.status(401).json({ message: "User not found." });
        return;
      }

      // Compare the provided password with the one saved in the database
      const passwordCorrect = bcrypt.compareSync(password, foundUser.password);

      if (passwordCorrect) {
        // Deconstruct the user object to omit the password
        const { _id, email, username, group, profileImg, lastReadNotif } =
          foundUser;

        // Create an object that will be set as the token payload
        const payload = {
          _id,
          email,
          username,
          group,
          profileImg,
          lastReadNotif,
        };

        // Create a JSON Web Token and sign it
        const authToken = jwt.sign(payload, process.env.TOKEN_SECRET, {
          algorithm: "HS256",
          expiresIn: "100000000000h",
        });

        // Send a json response containing the user object
        res.status(201).json({ authToken });
      } else {
        res.status(401).json({ message: "Unable to authenticate the user" });
      }
    })
    .catch((err) => next(err)); // In this case, we send error handling to the error handling middleware.
});

// GET  /auth/verify  -  Used to verify JWT stored on the client
router.get("/verify", isAuthenticated, (req, res, next) => {
  // If JWT token is valid the payload gets decoded by the
  // isAuthenticated middleware and is made available on `req.payload`
  console.log(`req.payload`, req.payload);

  // Send back the token payload object containing the user data
  res.status(200).json(req.payload);
});

module.exports = router;
