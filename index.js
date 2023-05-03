const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const session = require("express-session");

const store = require("./middleware/store_sesion");
const productRouter = require("./routers/productRouter");
const userRouter = require("./routers/userRouter");

const MONGODB_URI = `mongodb+srv://${process.env.MONGODB_USER}:${process.env.MONGODB_PASSWORD}@cluster0.xvwm5ml.mongodb.net/${process.env.MONGODB_DEFAULT_DATABASE}?retryWrites=true&w=majority`;

const app = express();

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

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
app.use((error, req, res, next) => {
  const statusError = error.statusError || 500;
  const messageError = error.message;
  res.status(statusError).json({ message: messageError });
});

mongoose
  .connect(MONGODB_URI)
  .then((result) => {
    app.listen(process.env.PORT || 5000);
  })
  .catch((err) => console.log("connect error :", err));
