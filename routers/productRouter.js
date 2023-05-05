const express = require("express");
const router = express.Router();
const isAuth = require("../middleware/is-auth");
const productController = require("../controllers/product");

//-------------------home-------------------------
router.get("/get_products", productController.getHomeProducts);
//-------------------shop--------------------------
router.get("/get_products/:shopType", productController.getShopProducts);
//-------------------detail-------------------------
router.get("/get_detail/:detailId", productController.getDetailProducts);
//-------------------add cart------------------------
router.post("/post_addToCart", isAuth, productController.addToCart);
//------------------get cart-------------------------
router.get("/get_cart", isAuth, productController.getCart);
//-----------------change cart--------------
router.patch("/change_cart", isAuth, productController.changeCart);
module.exports = router;
