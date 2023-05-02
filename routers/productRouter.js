const express = require("express");
const router = express.Router();

const productController = require("../controllers/product");

router.get("/get_products", productController.getAllProducts);

module.exports = router;
