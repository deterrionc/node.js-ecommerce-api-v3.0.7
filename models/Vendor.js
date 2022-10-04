const mongoose = require('mongoose')

const VendorSchema = new mongoose.Schema({
  name: {
    type: String
  },
  shippingCost: {
    type: Number
  },
})

module.exports = mongoose.model('vendor', VendorSchema)