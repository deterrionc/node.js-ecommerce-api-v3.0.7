const mongoose = require('mongoose')

const PlanSchema = new mongoose.Schema({
  name: {
    type: String,
  },
  days: [
    {
      breakfast: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'recipe'
      },
      lunch: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'recipe'
      },
      dinner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'recipe'
      },
      snack: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'recipe'
      }
    }
  ]
})

module.exports = mongoose.model('plan', PlanSchema)