const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);

const productRouter = require("./routers/productRouter");
const userRouter = require("./routers/userRouter");
const chatRouter = require("./routers/chat");

const MONGODB_URI = `mongodb+srv://${process.env.MONGODB_USER}:${process.env.MONGODB_PASSWORD}@cluster0.xvwm5ml.mongodb.net/${process.env.MONGODB_DEFAULT_DATABASE}?retryWrites=true&w=majority`;

const app = express();

app.use(
  cors({
    origin: [process.env.DOMAIN_CLIENT, process.env.DOMAIN_ADMIN],
    credentials: true,
  })
);
const store = new MongoDBStore({
  uri: MONGODB_URI,
  collection: "sessions",
  autoRemove: "interval",
  autoRemoveInterval: 1000 * 60 * 60,
});
app.use(bodyParser.json());

app.use(cookieParser());

app.use(
  session({
    secret: "my_secret",
    resave: false,
    saveUninitialized: false,
    store: store,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24,
      secure: true,
      sameSite: "none",
    },
  })
);

//-------------------------router-----------------------
app.use("/product", productRouter);
app.use("/user", userRouter);
app.use("/chat", chatRouter);
app.use((error, req, res, next) => {
  const statusError = error.statusError || 500;
  const messageError = error.message;
  res.status(statusError).json({ message: messageError });
});
//-----------------------------------------------------
mongoose
  .connect(MONGODB_URI)
  .then((result) => {
    const server = app.listen(process.env.PORT || 5000);
    const io = require("./socket").init(server);
    io.on("connection", (socket) => {
      // console.log("socket connect ");
      socket.on("create_room", (conversationId) => {
        socket.join(conversationId);
      });

      socket.on("leave_room", (conversationId) => {
        socket.leave(conversationId);
      });
    });
  })
  .catch((err) => console.log("connect error :", err));
