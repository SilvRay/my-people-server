const { Schema, model } = require("mongoose");

const notificationSchema = new Schema(
  {
    read: {
      type: String,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = model("Notification", notificationSchema);
