const mongoose = require('mongoose');

const CategorySchema = new mongoose.Schema({
  name: {
    type: String,
  },
  description: {
    type: String
  },
});

module.exports = mongoose.model('category', CategorySchema);
