const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  name: {
    type: String,
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'category'
  },
  vendor: {
    type: String
  },
  price: {
    type: Number
  },
  shippingFee: {
    type: Number,
    default: 0
  },
  description: {
    type: String
  },
  pictures: [],
  clicks: {
    type: Number,
    default: 0
  },
  conversion: {
    type: Number,
    default: 100
  },
  rate: {
    type: Number,
    default: 4.5 + Math.random() / 2
  },
  stripeProductID: {
    type: String,
    required: true
  },
  stripePriceID: {
    type: String,
    required: true
  },
});

module.exports = mongoose.model('product', ProductSchema);
