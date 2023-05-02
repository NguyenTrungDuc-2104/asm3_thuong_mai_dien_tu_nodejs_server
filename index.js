const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");

const productRouter = require("./routers/productRouter");

const MONGODB_URI = `mongodb+srv://${process.env.MONGODB_USER}:${process.env.MONGODB_PASSWORD}@cluster0.xvwm5ml.mongodb.net/${process.env.MONGODB_DEFAULT_DATABASE}?retryWrites=true&w=majority`;

const app = express();
app.use(cors());
app.use(bodyParser.json());

//-------------------------router-----------------------
app.use("/product", productRouter);

app.use((error, req, res, next) => {
  const statusError = error.statusError || 500;
  const messageError = error.messageError;
  res.status(statusError).json({ message: messageError });
});

mongoose
  .connect(MONGODB_URI)
  .then((result) => {
    app.listen(process.env.PORT || 5000);
  })
  .catch((err) => console.log("connect error :", err));
