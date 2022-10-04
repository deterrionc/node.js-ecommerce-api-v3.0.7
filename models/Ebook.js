const mongoose = require('mongoose');

const EbookSchema = new mongoose.Schema({
  name: {
    type: String,
  },
  price: {
    type: Number,
    default: 0
  },
  description: {
    type: String
  },
  book: {
    type: String
  },
  image: {
    type: String
  },
  stripeProductID: {
    type: String
  },
  stripePriceID: {
    type: String
  }
});

module.exports = mongoose.model('ebook', EbookSchema);
