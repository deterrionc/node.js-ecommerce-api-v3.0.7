const mongoose = require('mongoose')

const OrderSchema = new mongoose.Schema({
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user'
  },
  shippingFirstName: {
    type: String
  },
  shippingLastName: {
    type: String
  },
  shippingPhoneNumber: {
    type: String
  },
  shippingEmail: {
    type: String
  },
  shippingAddress: {
    type: String
  },
  shippingCity: {
    type: String
  },
  shippingState: {
    type: String
  },
  shippingZipCode: {
    type: String
  },
  billingNameOnCard: {
    type: String
  },
  billingAddress: {
    type: String
  },
  billingCity: {
    type: String
  },
  billingState: {
    type: String
  },
  billingZipCode: {
    type: String
  },
  subTotal: {
    type: String
  },
  shippingFee: {
    type: String
  },
  paymentIntent: {
    type: String
  },
  status: {
    type: String,
    default: 'opened'
  },
  date: {
    type: Date,
    default: Date.now
  },
})

module.exports = mongoose.model('order', OrderSchema)