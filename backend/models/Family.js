const mongoose = require('mongoose');

const familySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a family name'],
      trim: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Family = mongoose.model('Family', familySchema);
module.exports = Family;
