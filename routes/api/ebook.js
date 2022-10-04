const express = require('express')
const router = express.Router()
const config = require('config')

// MODEL
const Ebook = require('../../models/Ebook')

// Stripe Info
const secret_key = config.get('stripe.secret_key')
const stripe = require('stripe')(secret_key)

// FILE UPLOAD
const fileUpload = require('../../utils/fileUpload')

router.post('/createEbook', fileUpload.fields([{ name: 'image', maxCount: 1 }, { name: 'book', maxCount: 1 }]), async (req, res) => {
  const { price, name } = req.body
  let image = req.files["image"][0].filename
  let book = req.files["book"][0].filename

  const stripeProduct = await stripe.products.create({ name })
  const stripePrice = await stripe.prices.create({
    product: stripeProduct.id,
    unit_amount: price * 100,
    currency: 'usd'
  })

  let newEbook = new Ebook({
    ...req.body
  })
  newEbook.image = image
  newEbook.book = book
  newEbook.stripeProductID = stripeProduct.id
  newEbook.stripePriceID = stripePrice.id

  await newEbook.save()

  res.json({
    success: true
  })
})

router.get('/getEbooks', async (req, res) => {
  const ebooks = await Ebook.find()

  res.json({
    success: true,
    ebooks
  })
})

router.get('/getEbook/:id', async (req, res) => {
  const ebook = await Ebook.findById(req.params.id)

  res.json({
    success: true,
    ebook
  })
})

router.post('/updateEbook/:id', fileUpload.fields([{ name: 'image', maxCount: 1 }, { name: 'book', maxCount: 1 }]), async (req, res) => {
  const ebookID = req.params.id
  const { price, name } = req.body

  let image = req.files["image"] ? req.files["image"][0].filename : undefined
  let book = req.files["book"] ? req.files["book"][0].filename : undefined

  const ebook = await Ebook.findById(ebookID)

  let stripeProduct = null
  let stripePrice = null

  if (ebook.price > 0) {
    if (price > 0) {
      stripeProduct = await stripe.products.update(ebook.stripeProductID, { name })
      stripePrice = await stripe.prices.create({
        product: stripeProduct.id,
        unit_amount: price * 100,
        currency: 'usd'
      })
    } else {
      stripeProduct = await stripe.products.update(ebook.stripeProductID, { name })
      stripePrice = await stripe.prices.create({
        product: stripeProduct.id,
        unit_amount: 0,
        currency: 'usd'
      })
    }
  } else {
    if (price > 0) {
      stripeProduct = await stripe.products.create({ name })
      stripePrice = await stripe.prices.create({
        product: stripeProduct.id,
        unit_amount: price * 100,
        currency: 'usd'
      })
    }
  }

  let update = {
    ...req.body
  }

  if (stripePrice) {
    update.stripeProductID = stripeProduct.id
    update.stripePriceID = stripePrice.id
  }

  if (image) update.image = image
  if (book) update.image = book

  await Ebook.findByIdAndUpdate(ebookID, update, { new: true })

  res.json({
    success: true
  })
})

router.delete('/deleteEbook/:id', async (req, res) => {
  const ebookID = req.params.id
  await Ebook.findByIdAndDelete(ebookID)

  res.json({
    success: true
  })
})

module.exports = router