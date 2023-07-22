const { Schema, model } = require("mongoose");

const eventSchema = new Schema(
  {
    organizer: { type: Schema.Types.ObjectId, ref: "User" },
    type: {
      type: String,
      enum: [
        "Let's eat good",
        "Movie Time",
        "Playground",
        "Go out",
        "Real Talk",
      ],
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
    },
    meal: {
      type: String,
    },
    games: {
      type: String,
    },
    theme: {
      type: String,
    },
    participants: [{ type: Schema.Types.ObjectId, ref: "User" }],
  },
  {
    // this second object adds extra properties: `createdAt` and `updatedAt`
    timestamps: true,
  }
);

module.exports = model("Event", eventSchema);
