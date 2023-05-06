const { validationResult } = require("express-validator");
const Product = require("../models/product");
const User = require("../models/user");
const Order = require("../models/order");

const nodemailer = require("nodemailer");
const sendgridTransport = require("nodemailer-sendgrid-transport");

const transport = nodemailer.createTransport(
  sendgridTransport({
    auth: {
      // api_user: "nguyentrungduc2104@gmail.com",
      api_key:
        "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",
    },
  })
);

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
    await user.addToCart(product, quantity);
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
    await user.changeCart(type, productId);
    res.status(201).json({ message: "change cart successful" });
  } catch (err) {
    next(err);
  }
};
// ----------------------get checkout------------------------
exports.getCheckout = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId)
      .select("name email phoneNumber cart")
      .populate("cart.items.product", "category name price");
    res.status(200).json(user);
  } catch (err) {
    next(err);
  }
};
// ----------------------post checkout------------------------
exports.postOrder = async (req, res, next) => {
  const name = req.body.name;
  const email = req.body.email;
  const phoneNumber = req.body.phoneNumber;
  const address = req.body.address;
  const total = req.body.total;
  const errorValidate = validationResult(req);
  try {
    if (!errorValidate.isEmpty()) {
      console.log(errorValidate.array()[0]);

      const error = new Error("Validation failed");
      error.statusError = 422;
      throw error;
    }

    const user = await User.findById(req.userId).populate(
      "cart.items.product",
      "category img1 name price"
    );
    const products = user.cart.items.map((prod) => {
      return { product: { ...prod.product._doc }, quantity: prod.quantity };
    });
    const order = new Order({
      products: products,
      total: total,
      user: {
        userId: req.userId,
        name,
        email,
        phoneNumber,
        address,
      },
    });
    await order.save();
    await user.clearCart();
    const producsHtml = products
      .map((prod) => {
        return ` 
        <tr>
          <td style="width: 10rem; border: 1px solid #ddd; padding: 0.5rem;">${
            prod.product.name
          }</td>
          <td style="width: 5rem; border: 1px solid #ddd; padding: 0.5rem;"><img src=${
            prod.product.img1
          } alt=${prod.product.name} style="width:100%" /></td>
          <td style="width: 5rem; border: 1px solid #ddd; padding: 0.5rem;">${prod.product.price.toLocaleString()} VND</td>
          <td style="width: 3rem; border: 1px solid #ddd; padding: 0.5rem;">${
            prod.quantity
          }</td>
          <td style="width: 5rem; border: 1px solid #ddd; padding: 0.5rem;">${(
            prod.product.price * prod.quantity
          ).toLocaleString()} VND</td>
      </tr>
      `;
      })
      .join("");

    const html = `
    <h2>Xin chào ${name}</h2>
    <p>Phone: ${phoneNumber}</p>
    <p>Address: ${address}</p>
    <table style="border-collapse: collapse; text-align: center;">
      <thead >
        <tr style="border: 1px solid #ddd; padding: 0.5rem;">
          <th style="border: 1px solid #ddd; padding: 0.5rem;">Tên Sản Phẩm</th>
          <th style="border: 1px solid #ddd; padding: 0.5rem;">Hình Ảnh</th>
          <th style="border: 1px solid #ddd; padding: 0.5rem;">Giá</th>
          <th style="border: 1px solid #ddd; padding: 0.5rem;">Số Lượng</th>
          <th style="border: 1px solid #ddd; padding: 0.5rem;">Thành Tiền</th>
        </tr>
      </thead>
        <tbody style="border: 1px solid #ddd; padding: 0.5rem;">
        ${producsHtml}
        </tbody>
      </table>
      <h2>Tổng Thanh Toán:</h2>
      <h2>${parseFloat(total).toLocaleString()} VND</h2>
    `;

    await transport.sendMail({
      to: email,
      from: "nguyentrungduc2104@gmail.com",
      subject: "Order succeeded",
      html: html,
    });
    res.status(201).json({ message: "order successful" });
  } catch (err) {
    next(err);
  }
};
