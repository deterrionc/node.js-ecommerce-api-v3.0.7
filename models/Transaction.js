const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TransactionSchema = new Schema({
  customerID: { 
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user'
  },
  amount: {
    type: Number
  },
  stripeTransferID: {
    type: String
  },
  date: {
    type: Date,
    default: Date.now
  }
})

module.exports = mongoose.model('transaction', TransactionSchema);