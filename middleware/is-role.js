const User = require("../models/user");

//----------both customers and sellers can access-------
exports.sellerAndAdmin = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);
    if (user.role === "admin" || user.role === "seller") {
      next();
    } else {
      const error = new Error();
      error.statusError = 401;
      throw error;
    }
  } catch (err) {
    next(err);
  }
};
//-----------------only seller can access----------------
exports.admin = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);
    if (user.role === "admin") {
      next();
    } else {
      const error = new Error();
      error.statusError = 401;
      throw error;
    }
  } catch (err) {
    next(err);
  }
};
