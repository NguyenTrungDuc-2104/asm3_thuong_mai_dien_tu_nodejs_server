const Product = require("../models/product");
const User = require("../models/user");
//-------------------get home products-------------
exports.getHomeProducts = async (req, res, next) => {
  const perPage = 8;

  try {
    const totalProduct = await Product.countDocuments();
    const products = await Product.find({}).limit(perPage);
    res.status(200).json({ products, totalProduct });
  } catch (err) {
    next(err);
  }
};
//-------------------get shop product----------------
exports.getShopProducts = async (req, res, next) => {
  const shopType = req.params.shopType;
  try {
    if (shopType === "all") {
      const totalProduct = await Product.countDocuments();
      const products = await Product.find({});
      res.status(200).json({ products, totalProduct });
    } else {
      const totalProduct = await Product.countDocuments();
      const products = await Product.find({ category: shopType });
      res.status(200).json({ products, totalProduct });
    }
  } catch (err) {
    next(err);
  }
};
//-------------------get detail product----------------
exports.getDetailProducts = async (req, res, next) => {
  const detailId = req.params.detailId;
  try {
    const product = await Product.findById(detailId);
    if (!product) {
      const error = new Error("Not found");
      error.statusError = 404;
      throw error;
    }
    const relatedProducts = await Product.find({
      category: product.category,
    }).select("img1 name price");
    res.status(200).json({ product, relatedProducts });
  } catch (err) {
    next(err);
  }
};
//-------------------add cart----------------
exports.addToCart = async (req, res, next) => {
  const productId = req.body.productId;
  const quantity = +req.body.quantity;
  try {
    const product = await Product.findById(productId);
    if (!product) {
      const error = new Error("Not found");
      error.statusError = 404;
      throw error;
    }
    const user = await User.findById(req.userId);
    user.addToCart(product, quantity);
    res.status(201).json({ message: "add to cart successful" });
  } catch (err) {
    next(err);
  }
};
// -------------------------get cart--------------------------
exports.getCart = async (req, res, next) => {
  try {
    const cart = await User.findById(req.userId)
      .select("cart -_id")
      .populate("cart.items.product");
    if (!cart) {
      const error = new Error("Not found");
      error.statusError(404);
      throw error;
    }
    res.status(200).json(cart);
  } catch (err) {
    next(err);
  }
};
// ----------------------change cart------------------------
exports.changeCart = async (req, res, next) => {
  const type = req.body.type;
  const productId = req.body.productId;
  try {
    const user = await User.findById(req.userId);
    user.changeCart(type, productId);
    res.status(201).json({ message: "change cart successful" });
  } catch (err) {
    next(err);
  }
};
