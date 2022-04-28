const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  try {
    const token = req.headers.authorization;
    const decodeToken = jwt.verify(token, process.env.AUTH_SECRET);
    req.userData = {
      phoneNo: decodeToken.phoneNo,
      _id: decodeToken.userId,
      vendorId: decodeToken.vendorId,
    };
    next();
  } catch (error) {
    console.log('error', error.message);
    res.status(401).json({ message: 'Auth Failed' });
  }
};
