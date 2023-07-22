const { Schema, model } = require("mongoose");

const projectSchema = new Schema(
  {
    creator: { type: Schema.Types.ObjectId, ref: "User" },
    group: {type: Schema.Types.ObjectId, ref:"Group"},
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    endDate: Date,
    raisedMoney: [
      {
        contactId: { type: Schema.Types.ObjectId, ref: "User" },
        date: Date,
        amount: { value: Number, currency: String },
      },
    ],
  },
  {
    // this second object adds extra properties: `createdAt` and `updatedAt`
    timestamps: true,
  }
);

module.exports = model("Project", projectSchema);
