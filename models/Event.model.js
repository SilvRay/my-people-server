const { Schema, model } = require("mongoose");

const eventSchema = new Schema(
  {
    organizer: { type: Schema.Types.ObjectId, ref: "User" },
    type: {
      type: String,
      required: true,
    },
    place: {
      type: String,
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    kids: {
      type: Number,
      required: true,
    },
    meal: {
      type: String,
      required: true,
    },
    games: {
      type: String,
      required: true,
    },
    theme: {
      type: String,
      required: true,
    },
    participants: [{ type: Schema.Types.ObjectId, ref: "User" }],
  },
  {
    // this second object adds extra properties: `createdAt` and `updatedAt`
    timestamps: true,
  }
);

const Event = model("Event", eventSchema);

module.exports = Event;
