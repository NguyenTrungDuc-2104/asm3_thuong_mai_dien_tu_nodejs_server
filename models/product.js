const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const productSchema = new Schema({
  category: {
    type: String,
    required: true,
  },
  img1: {
    type: String,
    require: true,
  },
  img2: {
    type: String,
    require: true,
  },
  img3: {
    type: String,
    require: true,
  },
  img4: {
    type: String,
    require: true,
  },
  long_desc: {
    type: String,
    require: true,
  },
  name: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  short_desc: {
    type: String,
    require: true,
  },
});
module.exports = mongoose.model("Product", productSchema);
