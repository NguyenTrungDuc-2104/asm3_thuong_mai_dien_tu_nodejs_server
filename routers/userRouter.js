const express = require("express");
const router = express.Router();
const User = require("../models/user");
const { body } = require("express-validator");
const userController = require("../controllers/user");

//-----------------------------register----------------------------
router.post(
  "/register",
  [
    body("name").trim().notEmpty(),
    body("email")
      .isEmail()
      .custom(async (value, { req }) => {
        const userDoc = await User.findOne({ email: value, isAdmin: false });
        if (userDoc) {
          return Promise.reject(
            "Email exists already, please pick a different one"
          );
        }
      })
      .normalizeEmail(),
    body(
      "password",
      "Please enter a password with only number and text and at least 6 characters"
    )
      .trim()
      .isLength({ min: 7 }),
    body("phoneNumber").isNumeric().isLength({ min: 10, max: 10 }),
  ],
  userController.register
);
//-----------------------------login----------------------------
router.post(
  "/login",
  [
    body("email")
      .isEmail()
      .custom(async (value, { req }) => {
        const user = await User.findOne({ email: value, isAdmin: false });
        if (!user) {
          return Promise.reject("Email does not exists");
        }
      })
      .normalizeEmail(),
    body("password").trim().isLength({ min: 7 }),
  ],
  userController.login
);
module.exports = router;
