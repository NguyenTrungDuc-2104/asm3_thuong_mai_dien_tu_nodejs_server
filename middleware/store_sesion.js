const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);

const MONGODB_URI = `mongodb+srv://${process.env.MONGODB_USER}:${process.env.MONGODB_PASSWORD}@cluster0.xvwm5ml.mongodb.net/${process.env.MONGODB_DEFAULT_DATABASE}?retryWrites=true&w=majority`;
const store = new MongoDBStore({
  uri: MONGODB_URI,
  collection: "sessions",
  autoRemove: "interval",
  autoRemoveInterval: 1000 * 60 * 60,
});

module.exports = store;
