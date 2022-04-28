const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
    },
    phoneNo: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
  },
  { timestamps: true },
);

contactSchema.statics.addContact = async function (req) {
  // add the contact to Contact table
  console.log('req.body', { ...req.body });
  const contact = await this.create({ ...req.body });

  return contact;
};

module.exports = mongoose.model('contact', contactSchema);
