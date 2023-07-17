const { Schema, model } = require("mongoose");

const postSchema = new Schema(
  {
    creator: { type: Schema.Types.ObjectId, ref: "User" },
    posts: [String],
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

module.exports = model("Post", postSchema);
