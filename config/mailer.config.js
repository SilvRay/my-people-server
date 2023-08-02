const nodemailer = require("nodemailer");
const nodemailerSendgrid = require("nodemailer-sendgrid")


const transporter = nodemailer.createTransport(
  nodemailerSendgrid({ apiKey:process.env.APIKey2 })
);

// Vérifier la configuration de la connexion
/* transporter
  .verify()
  .then((success) => console.log("mailer ready", success))
  .catch((err) => console.error("oops mailer", err));
*/
module.exports = transporter;
