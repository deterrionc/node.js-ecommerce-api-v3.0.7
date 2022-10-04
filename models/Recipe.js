const mongoose = require('mongoose')

const RecipeSchema = new mongoose.Schema({
  name: {
    type: String
  },
  calories: {
    type: String
  },
  fats: {
    type: String
  },
  servings: {
    type: String
  },
  sugar: {
    type: String
  },
  protein: {
    type: String
  },
  preparationTime: {
    type: String
  },
  netCarbs: {
    type: String
  },
  image: {
    type: String,
    default: null
  },
  video: {
    type: String,
    default: null,
  },
  category: {
    type: String
  },
  type: {
    type: String
  },
  description: {
    type: String
  },
  ingredients: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ingredient'
    }
  ],
  instructions: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'instruction'
    }
  ],
  date: {
    type: Date,
    default: Date.now
  },
})

module.exports = mongoose.model('recipe', RecipeSchema)