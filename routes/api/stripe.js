const express = require('express')
const router = express.Router()
const config = require('config')

// Model
const User = require('../../models/User')

// Stripe Info
const secret_key = config.get('stripe.secret_key')
const publishable_key = config.get('stripe.publishable_key')
const stripe = require('stripe')(secret_key)

router.get('/getStripePubKey', async (req, res) => {
  res.json({
    success: true,
    stripePubKey: publishable_key
  })
})

router.post('/createPaymentIntent', async (req, res) => {
  const paymentIntent = await stripe.paymentIntents.create({
    amount: req.body.price,
    currency: 'usd',
    automatic_payment_methods: {
      enabled: true,
    },
  })

  res.json({
    success: true,
    clientSecret: paymentIntent.client_secret,
  })
})

router.post('/webhook', async (req, res) => {
  const event = req.body

  // Handle the event

  if (event.type === 'invoice.payment_succeeded') {
    console.log('Invoice Payment Succeed!')
    const invoice = event.data.object
    const customerID = invoice.customer
    if (invoice.subscription === null) {
      console.log('ONE TIME PAYMENT')
      await User.findOneAndUpdate({ email: invoice.customer_email }, {
        mealPlanPaid: true
      }, { new: true })
    } else {
      console.log('Subscription')
      const subscriptionID = invoice.subscription
      const subscription = await stripe.subscriptions.retrieve(subscriptionID)
      const subscriptionStartDate = subscription.current_period_start
      const subscriptionEndDate = subscription.current_period_end
      await User.findOneAndUpdate({ stripeCustomerID: customerID }, {
        subscriptionStartDate: subscriptionStartDate,
        subscriptionEndDate: subscriptionEndDate
      }, { new: true })
    }
  }

  // Return a 200 res to acknowledge receipt of the event
  res.send()
})

module.exports = router
