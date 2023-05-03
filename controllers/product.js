const Product = require("../models/product");
const isAuth = require("../middleware/store_sesion");
//-------------------get all products-------------
exports.getAllProducts = async (req, res, next) => {
  const curentPage = req.query.page || 1;
  const perPage = 8;
  try {
    const totalProduct = await Product.countDocuments();
    const products = await Product.find({})
      .skip((curentPage - 1) * perPage)
      .limit(perPage);
    res.status(200).json({ products, totalProduct });
  } catch (err) {
    next(err);
  }
};
