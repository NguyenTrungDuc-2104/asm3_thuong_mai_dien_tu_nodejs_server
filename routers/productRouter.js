const express = require("express");
const { body } = require("express-validator");
const router = express.Router();
const isAuth = require("../middleware/is-auth");
const isRole = require("../middleware/is-role");
const multer = require("../middleware/multer_image");
const productController = require("../controllers/product");

//=======================user==============================

//-------------------get products-------------------------
router.get("/get_products", productController.getHomeProducts);
//-------------------shop--------------------------
router.get("/get_products/:shopType", productController.getShopProducts);
//-------------------detail-------------------------
router.get("/get_detail/:detailId", productController.getDetailProducts);
//-------------------add cart------------------------
router.post("/post_addToCart", isAuth, productController.addToCart);
//------------------get cart-------------------------
router.get("/get_cart", isAuth, productController.getCart);
//-----------------change cart-----------------------
router.patch("/change_cart", isAuth, productController.changeCart);
//----------------get checkout-----------------------
router.get("/get_checkout", isAuth, productController.getCheckout);
//----------------post checkout-----------------------
router.post(
  "/post_order",
  isAuth,
  [
    body("name", "Please enter your name").trim().notEmpty(),
    body("email", "Please enter your email")
      .isEmail()
      .trim()
      .notEmpty()
      .normalizeEmail(),
    body("phoneNumber", "Please enter your phone number")
      .isNumeric()
      .trim()
      .isLength({ min: 10, max: 10 }),
    body("address", "Please enter your address").trim().notEmpty(),
    body("total").isNumeric().trim().notEmpty(),
  ],
  productController.postOrder
);
//----------------------------------get orders--------------------------
router.get("/get_orders", isAuth, productController.getOrders);
//-----------------------------get detail orders------------------------
router.get("/get_order/:orderId", isAuth, productController.getDetailOrder);

//=================================admin================================
//-------------------------get dashboard------------------------
router.get("/admin/get_dashboard", productController.getDashboard);
//------------------------post new product----------------------
router.post(
  "/admin/post_product",
  isAuth,
  isRole.admin,
  multer,
  [
    body("images").custom((value, { req }) => {
      if (req.files && req.files.length === 4) {
        return true;
      }
      throw new Error("Please choose 4 images");
    }),
    body("name", "Please enter the product name").trim().notEmpty(),
    body("category", "Please enter the category").trim().notEmpty(),
    body("price", "Please enter the price").trim().notEmpty(),
    body("count", "Please enter the count").trim().notEmpty(),
    body("short_desc", "Please enter the short description").trim().notEmpty(),
    body("long_desc", "Please enter the long description").trim().notEmpty(),
  ],
  productController.potsProduct
);

//----------------get update product-----------------
router.get(
  "/admin/get_product/:detailId",
  isAuth,
  isRole.admin,
  productController.getDetailProducts
);
//------------------patch update product--------------
router.patch(
  "/admin/update-product",
  isAuth,
  isRole.admin,
  [
    body("name", "Please enter the product name").trim().notEmpty(),
    body("category", "Please enter the category").trim().notEmpty(),
    body("price", "Please enter the price").trim().notEmpty(),
    body("count", "Please enter the count").trim().notEmpty(),
    body("short_desc", "Please enter the short description").trim().notEmpty(),
    body("long_desc", "Please enter the long description").trim().notEmpty(),
  ],
  productController.patchUpdateProduct
);
//------------------delete product--------------
router.delete(
  "/admin/delete_product/:productId",
  isAuth,
  isRole.admin,
  productController.deleteProduct
);
module.exports = router;
