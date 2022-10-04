const express = require('express')
const router = express.Router()
const config = require('config')

// Stripe Info
const secret_key = config.get('stripe.secret_key')
const stripe = require('stripe')(secret_key)

// Model
const User = require('../../models/User')
const Ebook = require('../../models/Ebook')

router.get('/enableStripeEndpoint', async (req, res) => {
  const webhookEndpoints = await stripe.webhookEndpoints.list()
  console.log(webhookEndpoints.data.length)
  for (var index = 0; index < webhookEndpoints.data.length; index++) {
    let tempEndPoint = webhookEndpoints.data[index]
    await stripe.webhookEndpoints.del(tempEndPoint.id)
  }
  await stripe.webhookEndpoints.create({
    url: 'https://myketomarketplace.com/api/stripe/webhook',
    enabled_events: ['*'],
  })

  res.json({
    success: true
  })
})

router.post('/makeEbookPayment', async (req, res) => {
  const { userID, number, expMonth, expYear, cvc, postalCode, ebookID } = req.body

  const ebook = await Ebook.findById(ebookID)
  const user = await User.findById(userID)
  const stripePriceID = ebook.stripePriceID

  try {
    // CREATE PAYMENT METHOD WITH CUSTOMER GIVEN INFO
    const paymentMethod = await stripe.paymentMethods.create({
      type: 'card',
      card: {
        number: number,
        exp_month: Number(expMonth),
        exp_year: Number(expYear),
        cvc: cvc
      },
    })

    // CREATE STRIPE CUSTOMER WITH CUSTOMER GIVEN INFO
    const stripeCustomer = await stripe.customers.create({
      payment_method: paymentMethod.id,
      name: user.name,
      email: user.email,
      invoice_settings: {
        default_payment_method: paymentMethod.id
      }
    })

    await stripe.invoiceItems.create({
      customer: stripeCustomer.id,
      price: stripePriceID
    })

    const invoice = await stripe.invoices.create({
      customer: stripeCustomer.id,
    })

    await stripe.invoices.finalizeInvoice(invoice.id)
    await stripe.invoices.pay(invoice.id)

    const paidEbooks = user.paidEbooks
    let newPaidEbooks = []

    for (var i = 0; i < paidEbooks.length; i++) {
      newPaidEbooks.push(paidEbooks[i])
    }
    newPaidEbooks.push(ebookID)

    await User.findByIdAndUpdate(userID, { paidEbooks: newPaidEbooks }, { new: true })
  } catch (err) {
    res.json({
      success: false,
      message: err.message
    })
  }

  res.json({
    success: true
  })
})

router.post('/makeDietPayment', async (req, res) => {
  const customer = await User.findById(req.body.clientID)

  try {
    const product1 = await stripe.products.create({
      name: 'MEAL PLAN'
    })
    const price1 = await stripe.prices.create({
      product: product1.id,
      unit_amount: req.body.promotionCode === 'metavip' ? 0 : 2995,
      currency: 'usd'
    })

    const product2 = await stripe.products.create({
      name: 'STORE ACCESS'
    })
    const price2 = await stripe.prices.create({
      product: product2.id,
      unit_amount: 199,
      currency: 'usd',
      recurring: { interval: 'month' }
    })

    // CREATE PAYMENT METHOD WITH CUSTOMER GIVEN INFO
    const paymentMethod = await stripe.paymentMethods.create({
      type: 'card',
      card: {
        number: req.body.number,
        exp_month: Number(req.body.expMonth),
        exp_year: Number(req.body.expYear),
        cvc: req.body.cvc
      },
    })

    // CREATE STRIPE CUSTOMER WITH CUSTOMER GIVEN INFO
    const stripeCustomer = await stripe.customers.create({
      payment_method: paymentMethod.id,
      name: customer.name,
      email: customer.email,
      invoice_settings: {
        default_payment_method: paymentMethod.id
      }
    })

    // UPDATE CUSTOMER INFO IN MONGO DB
    await User.findByIdAndUpdate(req.body.clientID, {
      stripeCustomerID: stripeCustomer.id,
      customerStatus: 'Pending',
      number: req.body.number,
      expYear: req.body.expYear,
      expMonth: req.body.expMonth,
      cvc: req.body.cvc,
      customerStatus: 'active'
    }, { new: true })

    // MEAL PLAN INVOICE CREATE
    if (req.body.promotionCode === 'metavip') {
      await User.findByIdAndUpdate(req.body.clientID, {
        mealPlanPaid: true,
      }, { new: true })
    } else {
      await stripe.invoiceItems.create({
        customer: stripeCustomer.id,
        price: price1.id
      })

      const invoice = await stripe.invoices.create({
        customer: stripeCustomer.id,
      })

      await stripe.invoices.finalizeInvoice(invoice.id)
      await stripe.invoices.pay(invoice.id)
    }

    // CREATE STORE ACCESS SUBSCRIPTION
    const subscription = await stripe.subscriptions.create({
      customer: stripeCustomer.id,
      items: [{ price: price2.id }],
      expand: ['latest_invoice.payment_intent']
    })

    await User.findByIdAndUpdate(req.body.clientID, {
      stripeSubscription: subscription.id,
    }, { new: true })

  } catch (err) {
    res.json({
      success: false,
      message: err.message
    })
  }

  res.json({
    success: true
  })
})

module.exports = router