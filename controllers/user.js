const User = require("../models/user");
const Session = require("../models/session");
const bcryptjs = require("bcryptjs");
const { validationResult } = require("express-validator");

//-----------------------------register----------------------------
exports.register = async (req, res, next) => {
  const name = req.body.name;
  const email = req.body.email;
  const password = req.body.password;
  const phoneNumber = req.body.phoneNumber;
  const role = req.body.role;

  const errorValidate = validationResult(req);
  try {
    //-------------------------kiểm tra đầu vào----------------------
    if (!errorValidate.isEmpty()) {
      //--------------email exists-------------
      if (
        errorValidate.array()[0].msg ===
        "Email exists already, please pick a different one"
      ) {
        return res.status(202).json({
          message: errorValidate.array()[0].msg,
        });
      }
      //------------
      const error = new Error("Validation failed");
      error.statusError = 422;
      throw error;
    }
    //---------------------băm password-------------------
    const hashedPassword = await bcryptjs.hash(password, 12);
    //----------------lưu vào mongoodb--------------------
    const user = new User({
      name,
      email,
      password: hashedPassword,
      phoneNumber,
      role,
      cart: { items: [] },
    });

    const userSave = await user.save();
    res
      .status(201)
      .json({ message: "create user success", userId: userSave._id });
  } catch (err) {
    console.log("register err :", err);
    next(err);
  }
};

//---------------------------------------------login---------------------------------------
exports.login = async (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;

  const errorValidate = validationResult(req);
  try {
    //-----------------------kiểm tra đầu vào---------------------------

    if (!errorValidate.isEmpty()) {
      if (errorValidate.array()[0].msg === "Email does not exists") {
        return res.status(202).json({ message: errorValidate.array()[0].msg });
      }
      const error = new Error("Validation failed");
      console.log(errorValidate.array());
      error.statusError = 422;
      throw error;
    }
    //-------------------------tìm kiếm email và so sánh password-----------------------
    const user = await User.findOne({ email: email });
    const doMatch = await bcryptjs.compare(password, user.password);

    if (!doMatch) {
      return res.status(202).json({ message: "Incorrect password" });
    }

    req.session.user = user;
    await req.session.save();

    res.cookie("sessionId", req.session.id, {
      maxAge: 1000 * 60 * 60 * 24,
      sameSite: "none",
      secure: true,
    });
    res.status(200).json({ message: "Logged in successfully", user: user });
  } catch (err) {
    next(err);
  }
};

//-----------------------------logout----------------------------
exports.logout = async (req, res, next) => {
  try {
    await Session.findByIdAndRemove(req.sessionId);
    res.status(200).json({ message: "Logout success" });
  } catch (err) {
    next(err);
  }
};
