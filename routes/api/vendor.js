const express = require('express')
const router = express.Router()

// MODEL
const Vendor = require('../../models/Vendor')

router.post('/createVendor', async (req, res) => {
  let newVendor = new Vendor({ ...req.body })
  await newVendor.save()

  res.json({
    success: true
  })
})

router.get('/getVendors', async (req, res) => {
  const vendors = await Vendor.find()

  res.json({
    success: true,
    vendors
  })
})

router.get('/getVendor/:id', async (req, res) => {
  const vendor = await Vendor.findById(req.params.id)

  res.json({
    success: true,
    vendor
  })
})

router.post('/updateVendor/:id', async (req, res) => {
  const vendorID = req.params.id

  const update = { ...req.body }

  await Vendor.findByIdAndUpdate(vendorID, update, { new: true })

  res.json({
    success: true
  })
})

router.delete('/deleteVendor/:id', async (req, res) => {
  await Vendor.findByIdAndDelete(req.params.id)

  res.json({
    success: true
  })
})

module.exports = router