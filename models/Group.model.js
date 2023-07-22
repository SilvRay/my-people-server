const { Schema, model } = require("mongoose");

const groupSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "A group name is required"],
    },
    invitedUsers: [String],
    // belongsToGroup: {
    //   type: Boolean,
    //   default: false,
    // },
  },
  {
    // this second object adds extra properties: `createdAt` and `updatedAt`
    timestamps: true,
  }
);

module.exports = model("Group", groupSchema);
