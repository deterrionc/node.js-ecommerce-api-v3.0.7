const mongoose = require('mongoose')

const IngredientSchema = new mongoose.Schema({
  name: {
    type: String
  },
  quantity: {
    type: String
  },
  type: {
    type: String
  },
  recipe: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'recipe'
  }
})

module.exports = mongoose.model('ingredient', IngredientSchema)