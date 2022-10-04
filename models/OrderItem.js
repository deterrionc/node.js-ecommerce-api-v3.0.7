const mongoose = require('mongoose')

const OrderItemSchema = new mongoose.Schema({
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'order'
  },
  productName: {
    type: String
  },
  price: {
    type: String
  },
  vendor: {
    type: String
  },
  shippingFee: {
    type: String
  },
  quantity: {
    type: Number
  },
  trackingNumber: {
    type: String,
    default: ''
  },
  date: {
    type: Date,
    default: Date.now
  },
})

module.exports = mongoose.model('orderitem', OrderItemSchema)