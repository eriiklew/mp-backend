const mongoose = require('mongoose');
const Vendor = require('../models/vendor');
const User = require('../models/user');
const Escrow = require('../models/escrow');

const getVendorInfo = async (req, res) => {
  try {
    const vendor = await Vendor.getVendorInfo(req);

    res.status(200).json({ vendor, message: 'Vendor fetched successfully' });
  } catch (error) {
    console.log('get vendor info controller', error);
    res.status(400).json({ message: error.message });
  }
};

const matchPassword = async (req, res) => {
  try {
    console.log(req.userData);
    const isPasswordmatched = await User.matchPassword(req.userData._id, req.body.currentPassword);

    res.status(200).json({ isPasswordmatched, message: 'Password matched' });
  } catch (error) {
    console.log('match password controller', error);
    res.status(400).json({ message: error.message });
  }
};

const updatePassword = async (req, res) => {
  try {
    const data = {
      phoneNo: req.userData.phoneNo,
      password: req.body.newPassword,
    };
    const user = await User.updatePassword(data);

    res.status(200).json({ message: 'Password updated successfully' });
  } catch (error) {
    console.log('update password controller', error);
    res.status(400).json({ message: error.message });
  }
};

const updateName = async (req, res) => {
  try {
    console.log(req.body.name);
    await User.updateName(req.userData._id, req.body.name);
    await Vendor.updateName(req.userData._id, req.body.name);

    res.status(200).json({ message: 'Name updated successfully' });
  } catch (error) {
    console.log('update name controller', error);
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  getVendorInfo,
  updatePassword,
  matchPassword,
  updatePassword,
  updateName,
};
