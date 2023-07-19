const { Schema, model } = require("mongoose");

const mediaSchema = new Schema(
  {
    creator: { type: Schema.Types.ObjectId, ref: "User" },
    medias: [String],
    legend: String,
    comments: [
      {
        userId: { type: Schema.Types.ObjectId, ref: "User" },
        content: String,
        // timestamp: true,
      },
    ],
  },
  {
    // this second object adds extra properties: `createdAt` and `updatedAt`
    timestamps: true,
  }
);

module.exports = model("Media", mediaSchema);
