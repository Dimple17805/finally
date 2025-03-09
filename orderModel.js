const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  product: {
    name: String,
    price: String,
    images: [String],
    features: [String],
    terms: [String],
  },
  userDetails: {
    name: String,
    email: String,
    phone: String,
    address: String,
    paymentMethod: String,
  },
  date: { type: Date, default: Date.now },
});

const Order = mongoose.model("Order", orderSchema);
