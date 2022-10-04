const express = require('express')
const router = express.Router()

// MODEL
const Recipe = require('../../models/Recipe')
const Ingredient = require('../../models/Ingredient')
const Instruction = require('../../models/Instruction')
const Plan = require('../../models/Plan')

// FILE UPLOAD
const fileUpload = require('../../utils/fileUpload')

router.post('/createRecipe', fileUpload.fields([{ name: 'image', maxCount: 1 }]), async (req, res) => {
  let image = req.files["image"][0].filename
  const ingredients = JSON.parse(req.body.ingredients)
  const instructions = JSON.parse(req.body.instructions)
  let ingredientIds = []
  let instructionIds = []


  let newRecipe = new Recipe({
    ...req.body
  })
  newRecipe.image = image

  for (var i = 0; i < ingredients.length; i++) {
    let newIngredient = new Ingredient({
      ...ingredients[i],
      recipe: newRecipe._id
    })
    await newIngredient.save()
    ingredientIds.push(newIngredient._id)
  }

  for (var i = 0; i < instructions.length; i++) {
    let newInstruction = new Instruction({
      content: instructions[i],
      recipe: newRecipe._id
    })
    await newInstruction.save()
    instructionIds.push(newInstruction._id)
  }

  newRecipe.ingredients = ingredientIds
  newRecipe.instructions = instructionIds

  await newRecipe.save()

  res.json({
    success: true
  })
})

router.get('/getRecipes', async (req, res) => {
  const recipes = await Recipe.find().populate(['ingredients', 'instructions'])

  res.json({
    success: true,
    recipes,
  })
})

router.get('/getRecipe/:id', async (req, res) => {
  const recipeID = req.params.id
  const recipe = await Recipe.findById(recipeID).populate(['ingredients', 'instructions'])

  res.json({
    success: true,
    recipe
  })
})

router.post('/updateRecipe/:id', fileUpload.fields([{ name: 'image', maxCount: 1 }]), async (req, res) => {
  const recipeID = req.params.id

  let image = req.files["image"] ? req.files["image"][0].filename : undefined
  const ingredients = JSON.parse(req.body.ingredients)
  const instructions = JSON.parse(req.body.instructions)
  let ingredientIds = []
  let instructionIds = []

  await Ingredient.deleteMany({ recipe: recipeID })
  await Instruction.deleteMany({ recipe: recipeID })

  let update = {
    ...req.body
  }
  if (image) update.image = image

  for (var i = 0; i < ingredients.length; i++) {
    let newIngredient = new Ingredient({
      ...ingredients[i],
      recipe: recipeID
    })
    await newIngredient.save()
    ingredientIds.push(newIngredient._id)
  }

  for (var i = 0; i < instructions.length; i++) {
    let newInstruction = new Instruction({
      content: instructions[i],
      recipe: recipeID
    })
    await newInstruction.save()
    instructionIds.push(newInstruction._id)
  }

  update.ingredients = ingredientIds
  update.instructions = instructionIds

  await Recipe.findByIdAndUpdate(recipeID, update, { new: true })

  res.json({
    success: true
  })
})

router.delete('/deleteRecipe/:id', async (req, res) => {
  const recipeID = req.params.id
  await Recipe.findByIdAndDelete(recipeID)
  await Ingredient.deleteMany({ recipe: recipeID })
  await Instruction.deleteMany({ recipe: recipeID })

  res.json({
    success: true
  })
})

module.exports = router