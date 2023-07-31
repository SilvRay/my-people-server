const nodemailer = require("nodemailer");
const transporter = nodemailer.createTransport(process.env.SMTP_URI);

// Vérifier la configuration de la connexion
transporter
  .verify()
  .then((success) => console.log("mailer ready", success))
  .catch((err) => console.error("oops mailer", err));

module.exports = transporter;
