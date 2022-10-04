const express = require('express')
const router = express.Router()

// MODEL
const Plan = require('../../models/Plan')

router.post('/createPlan', async (req, res) => {
  let newPlan = new Plan({
    ...req.body
  })

  await newPlan.save()

  res.json({
    success: true
  })
})

router.get('/getPlans', async (req, res) => {
  const plans = await Plan.find()

  res.json({
    success: true,
    plans,
  })
})

router.get('/getTempPlan', async (req, res) => {
  const plans = await Plan.find()
  const planID = plans[0]._id
  
  const plan = await Plan.findById(planID).populate({
    path: 'days',
    populate: [{ path: 'breakfast' }, { path: 'lunch' }, { path: 'dinner' }, { path: 'snack' }]
  })

  res.json({
    success: true,
    plan
  })
})

router.get('/getPlan/:id', async (req, res) => {
  const planID = req.params.id
  const plan = await Plan.findById(planID)

  res.json({
    success: true,
    plan
  })
})

router.get('/getPlanInDetail/:id', async (req, res) => {
  const planID = req.params.id
  const plan = await Plan.findById(planID).populate({
    path: 'days',
    populate: [{ path: 'breakfast' }, { path: 'lunch' }, { path: 'dinner' }, { path: 'snack' }]
  })

  res.json({
    success: true,
    plan
  })
})

router.post('/updatePlan/:id', async (req, res) => {
  const planID = req.params.id
  const update = {
    ...req.body
  }

  await Plan.findByIdAndUpdate(planID, update, { new: true })

  res.json({
    success: true
  })
})

router.delete('/deletePlan/:id', async (req, res) => {
  const planID = req.params.id
  await Plan.findByIdAndDelete(planID)

  res.json({
    success: true
  })
})

module.exports = router