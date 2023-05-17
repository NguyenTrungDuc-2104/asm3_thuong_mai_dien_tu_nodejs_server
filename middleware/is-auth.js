const Session = require("../models/session");

const isAuth = async (req, res, next) => {
  const sessionId = req.cookies.sessionId;

  try {
    const session = await Session.findOne({ _id: sessionId });
    if (!session) {
      const error = new Error("Not authenticated");
      error.statusError = 401;
      throw error;
    }
    req.userId = session.session.user._id;
    req.sessionId = sessionId;
    next();
  } catch (err) {
    next(err);
  }
};

module.exports = isAuth;
