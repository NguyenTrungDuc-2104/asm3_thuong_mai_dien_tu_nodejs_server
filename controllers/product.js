const { validationResult } = require("express-validator");
const path = require("path");
const Product = require("../models/product");
const User = require("../models/user");
const Order = require("../models/order");
const fileHelper = require("../utils/file");

const nodemailer = require("nodemailer");
const sendgridTransport = require("nodemailer-sendgrid-transport");

const transport = nodemailer.createTransport(
  sendgridTransport({
    auth: {
      api_key: process.env.API_KEY_SENDGRID,
    },
  })
);

//-------------------get products-------------
exports.getHomeProducts = async (req, res, next) => {
  try {
    const totalProduct = await Product.countDocuments();
    const products = await Product.find({});
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
      _id: { $ne: detailId },
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
    res.status(201).json({ message: "Add to cart successful" });
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
    res.status(201).json({ message: "Change cart successful" });
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
    //----------check validate---------
    if (!errorValidate.isEmpty()) {
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
    //-------------------change count product-----------
    for (let item of products) {
      const prod = await Product.findById(item.product._id);
      prod.count = prod.count - item.quantity;
      await prod.save();
    }
    //---------------------------save order------------------
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
      delivery: "Waiting for progressing",
      status: "Waiting for pay",
    });
    await order.save();
    user.clearCart();

    //----------------------------send email--------------------
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
    //-------------------------
    res.status(201).json({ message: "Order successful" });
  } catch (err) {
    next(err);
  }
};
//---------------------------------get orders----------------------
exports.getOrders = async (req, res, next) => {
  try {
    const order = await Order.find({ "user.userId": req.userId }).select(
      "user total delivery status "
    );

    res.status(200).json({ orders: order });
  } catch (err) {
    next(err);
  }
};
//-----------------------------get detail orders--------------------
exports.getDetailOrder = async (req, res, next) => {
  const orderId = req.params.orderId;

  try {
    const order = await Order.findById(orderId);
    res.status(200).json(order);
  } catch (err) {
    next(err);
  }
};

//-----------------------------get dashboard--------------------------
exports.getDashboard = async (req, res, next) => {
  try {
    const countUser = await User.countDocuments({
      $or: [{ role: "customer" }, { role: "seller" }],
    });
    const countNewOrder = await Order.countDocuments({
      delivery: "Waiting for progressing",
    });
    const order = await Order.find({});

    res.status(200).json({ order, countUser, countNewOrder });
  } catch (err) {
    next(err);
  }
};
//-----------------------------post new product--------------------------
exports.potsProduct = async (req, res, next) => {
  const name = req.body.name;
  const price = req.body.price;
  const count = req.body.count;
  const category = req.body.category;
  const short_desc = req.body.short_desc;
  const long_desc = req.body.long_desc;
  const images = req.files;
  const domain = req.get("host");
  const errors = validationResult(req);

  try {
    if (!errors.isEmpty()) {
      const error = new Error(errors.array()[0].msg);
      error.statusError = 422;
      throw error;
    }
    const imageURL = images.map((item) => {
      return "http://" + domain + "/" + item.path.replace("\\", "/");
    });
    const [img1, img2, img3, img4] = imageURL;

    const product = new Product({
      name,
      price,
      count,
      category,
      short_desc,
      long_desc,
      img1,
      img2,
      img3,
      img4,
    });
    await product.save();
    res.status(201).json({ message: "Add new product success" });
  } catch (err) {
    next(err);
  }
};

//------------------------------update product---------------------
exports.patchUpdateProduct = async (req, res, next) => {
  const productId = req.body.productId;
  const updateName = req.body.name;
  const updateCategory = req.body.category;
  const updatePrice = req.body.price;
  const updateCount = req.body.count;
  const updateShort_desc = req.body.short_desc;
  const updateLong_desc = req.body.long_desc;
  const errors = validationResult(req);

  try {
    const product = await Product.findById(productId);
    if (!product) {
      const error = new Error("Not found");
      error.statusError = 404;
      throw error;
    }
    if (!errors.isEmpty()) {
      const error = new Error(errors.array()[0].msg);
      error.statusError = 422;
      throw error;
    }
    product.name = updateName;
    product.category = updateCategory;
    product.price = updatePrice;
    product.count = updateCount;
    product.short_desc = updateShort_desc;
    product.long_desc = updateLong_desc;

    await product.save();
    res.status(201).json({ message: "Update product success", product });
  } catch (err) {
    next(err);
  }
};
//------------------------------delete product---------------------
exports.deleteProduct = async (req, res, next) => {
  const productId = req.params.productId;
  try {
    const product = await Product.findById(productId);
    if (!product) {
      const error = new Error("Not found");
      error.statusError = 404;
      throw error;
    }

    const imagArr = [product.img1, product.img2, product.img3, product.img4];
    imagArr.forEach((item) => {
      const imgName = item.split("/")[4];
      const imgPath = path.join("images", imgName);
      fileHelper.deleteFile(imgPath);
    });
    await Product.findByIdAndRemove(productId);
    res.status(200).json({ message: "Delete product success" });
  } catch (err) {
    next(err);
  }
};
