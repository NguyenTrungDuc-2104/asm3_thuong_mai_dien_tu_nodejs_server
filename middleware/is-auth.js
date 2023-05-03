const store = require("../middleware/store_sesion");

const isAuth = () => {
  const sessionId = req.cookies.sessionId;
  store.get(sessionId, (err, session) => {
    if (err) {
      console.log(err);
    } else {
      console.log(session);
    }
  });
};

module.exports = isAuth;
