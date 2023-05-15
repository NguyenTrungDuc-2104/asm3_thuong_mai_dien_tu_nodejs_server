const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },

  password: {
    type: String,
    required: true,
  },
  phoneNumber: {
    type: Number,
    required: true,
  },
  role: {
    type: String,
    required: true,
  },
  cart: {
    items: [
      {
        product: {
          type: Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
        },
      },
    ],
  },
});
//----------------------------add to cart------------------------
userSchema.methods.addToCart = function (product, quantity) {
  const cartProductIndex = this.cart.items.findIndex(
    (item) => item.product.toString() === product._id.toString()
  );

  const updatedCartItems = [...this.cart.items];
  if (cartProductIndex >= 0) {
    const newQuantity = this.cart.items[cartProductIndex].quantity + quantity;
    updatedCartItems[cartProductIndex].quantity = newQuantity;
  } else {
    updatedCartItems.push({
      product: product._id,
      quantity: quantity,
    });
  }
  const updatedCart = { items: updatedCartItems };
  this.cart = updatedCart;
  return this.save();
};
//-------------------change cart--------------------
userSchema.methods.changeCart = function (type, productId) {
  const cartProductIndex = this.cart.items.findIndex(
    (item) => item._id.toString() === productId.toString()
  );
  let updatedCartItems = [...this.cart.items];
  let quantity = updatedCartItems[cartProductIndex].quantity;

  if (type === "increase") {
    quantity = quantity + 1;
    updatedCartItems[cartProductIndex].quantity = quantity;
  }
  if (type === "decrease") {
    if (quantity <= 1) {
      updatedCartItems = updatedCartItems.filter(
        (item) => item._id.toString() !== productId.toString()
      );
    } else {
      quantity = quantity - 1;
      updatedCartItems[cartProductIndex].quantity = quantity;
    }
  }
  if (type === "remove") {
    updatedCartItems = updatedCartItems.filter(
      (item) => item._id.toString() !== productId.toString()
    );
  }

  const updatedCart = { items: updatedCartItems };
  this.cart = updatedCart;
  return this.save();
};

//-------------------clear cart--------------------

userSchema.methods.clearCart = function () {
  this.cart = { items: [] };
  this.save();
};

module.exports = mongoose.model("User", userSchema);
