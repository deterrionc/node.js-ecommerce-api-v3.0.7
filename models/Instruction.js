const mongoose = require('mongoose')

const InstructionSchema = new mongoose.Schema({
  content: {
    type: String,
  },
  recipe: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'recipe'
  }
})

module.exports = mongoose.model('instruction', InstructionSchema)