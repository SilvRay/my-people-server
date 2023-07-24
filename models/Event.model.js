const { Schema, model } = require("mongoose");

const eventSchema = new Schema(
  {
    creator: { type: Schema.Types.ObjectId, ref: "User" },
    type: {
      type: String,
      enum: ["Food Time", "Movie Time", "Game Time", "Trip Time", "Real Talk"],
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
    group: { type: Schema.Types.ObjectId, ref: "Group" },
  },
  {
    // this second object adds extra properties: `createdAt` and `updatedAt`
    timestamps: true,
  }
);

module.exports = model("Event", eventSchema);
