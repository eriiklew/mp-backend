const mongoose = require('mongoose');
const Contact = require('../models/contact');
const sendEmail = require('../utils/email');

const addContact = async (req, res) => {
  try {
    const contact = await Contact.addContact(req);
    console.log('contact backend', req.body.email_from);
    const emails = [req.body.email, req.body.email_from];
    // await sendEmail({
    //   email: req.body.email,
    //   subject: 'Message recieved',
    //   text: "Thanks for contacting us. We'll get back to you soon.",
    // });
    // Have to change it by the user status
    // LoggedIn user's details will be sent to creator@merchpals.com
    // Not logged in user's email will be sent support@merchpals.com
    await sendEmail({
      email: emails,
      subject: 'Message recieved',
      text: `Thanks for contacting us. We've received your message with the following details.\nName: ${req.body.name}\nPhone No: ${req.body.phoneNo}\nMessage: ${req.body.message}`,
    });
    res.status(200).json({ contact, message: 'Contact added successfully' });
  } catch (error) {
    console.log('add contact controller', error);
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  addContact,
};
