const express = require('express')
const router = express.Router()
const gravatar = require('gravatar')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const config = require('config')
const normalize = require('normalize-url')

// Model
const User = require('../../models/User')
// For Stripe
const secret_key = config.get('stripe.secret_key')
const stripe = require('stripe')(secret_key)
const returnURL = config.get('returnURL')
// Mailgun Info
const mailgunApiKey = config.get('mailgun.mailgunApiKey')
const mailgunDomain = config.get('mailgun.domain')
var mailgun = require('mailgun-js')({ apiKey: mailgunApiKey, domain: mailgunDomain })

router.post('/checkAffiliateEmail', async (req, res) => {
  let user2 = await User.findOne({ email: new RegExp(`^${req.body.email}$`, 'i') })
  let notification = ''
  let isExist = false
  if (user2) {
    notification = 'There is already a User that uses the email you entered. Please try with another one.'
    isExist = true
  }
  res.json({
    success: true,
    isExist,
    notification
  })
})

router.post('/clientRegister', async (req, res) => {
  const { type, name, email, password, affiliate } = req.body

  let user = await User.findOne({ email })

  if (user) {
    return res.status(400).json({ errors: [{ msg: 'User already exists' }] })
  }

  const avatar = normalize(gravatar.url(email, { s: '200', r: 'pg', d: 'mm' }), { forceHttps: true })

  user = new User({ type, name, email, avatar, passwordForUpdate: password, affiliate })

  const salt = await bcrypt.genSalt(10)

  user.password = await bcrypt.hash(password, salt)

  await user.save()

  const payload = {
    user: {
      id: user.id
    }
  }

  jwt.sign(payload, config.get('jwtSecret'), { expiresIn: '5 days' }, (err, token) => {
    if (err) throw err
    res.json({ token })
  })
})

router.post('/clientRegisterSelf', async (req, res) => {
  const { name, email, password, gender, bodyfat, activityLevel, age, height, weight, desiredWeight, goals, describes } = req.body

  let user = await User.findOne({ email })

  if (user) {
    return res
      .status(400)
      .json({ errors: [{ msg: 'Email already exists' }] })
  }

  const avatar = normalize(gravatar.url(email, { s: '200', r: 'pg', d: 'mm' }), { forceHttps: true })

  user = new User({ type: 'customer', name, email, avatar, passwordForUpdate: password, gender, bodyfat, activityLevel, age, height, weight, desiredWeight, goals, describes })

  const salt = await bcrypt.genSalt(10)

  user.password = await bcrypt.hash(password, salt)

  await user.save()

  res.json({
    success: true,
    user
  })
})

router.post('/affiliateRegister', async (req, res) => {
  const tempUser = await User.findOne({ _id: req.body.affiliateID })

  if (tempUser) {
    console.log('AGAIN')
    const filter = { _id: req.body.affiliateID }

    let update = { ...req.body }
    update.passwordForUpdate = req.body.password

    const avatar = normalize(
      gravatar.url(req.body.email, { s: '200', r: 'pg', d: 'mm' }),
      { forceHttps: true }
    )
    update.avatar = avatar

    const pendingAffiliate = await User.findOneAndUpdate(filter, update, { new: true })

    const accountLink = await stripe.accountLinks.create({
      account: pendingAffiliate.stripeConnectedAccount,
      refresh_url: returnURL + 'failedconnectaccount/' + pendingAffiliate._id,
      return_url: returnURL + 'thanks/' + pendingAffiliate._id,
      type: 'account_onboarding',
    })

    // TO MASTER ADMIN EMAIL -> NEW PARTNER APPLIED
    const masterAdmin = await User.findOne({ type: 'admin' })

    var emailContentToAdmin = {
      from: 'KETO <info@dcgonboarding.com>',
      to: masterAdmin.email,
      subject: 'Pending User(Affiliate) Updated His/Her Information.',
      text: `Hi ${masterAdmin.name}. Applied Affiliate, ${pendingAffiliate.name} updated his/her information. 
      You can check his/her information here https://dcgonboarding.com/home/pending 
      Best Regards.
      KETO Team.`
    }

    mailgun.messages().send(emailContentToAdmin, function (error, body) {
      console.log(body)
    })

    res.json({
      success: true,
      connectURL: accountLink.url,
      pendingAffiliate
    })
  } else {
    const emailSameUser = await User.findOne({ email: req.body.email })
    if (emailSameUser) {
      return res
        .status(400)
        .json({ errors: [{ msg: `DUPLICATE EMAIL! ${req.body.email} is already exist.` }] })
    }

    let newAffiliate = new User({ ...req.body })
    newAffiliate.status = 'inActive'
    newAffiliate.passwordForUpdate = req.body.password
    newAffiliate.inActiveReason = "Affiliateship is not approved yet."
    newAffiliate.connectedAccountStatus = "restricted"
    newAffiliate.mailSent = false

    const account = await stripe.accounts.create({
      type: 'express',
    })

    const avatar = normalize(
      gravatar.url(req.body.email, { s: '200', r: 'pg', d: 'mm' }),
      { forceHttps: true }
    )

    newAffiliate.stripeConnectedAccount = account.id
    newAffiliate.avatar = avatar

    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: returnURL + 'failedconnectaccount/' + newAffiliate._id,
      return_url: returnURL + 'thanks/' + newAffiliate._id,
      type: 'account_onboarding',
    })

    await newAffiliate.save()

    // TO MASTER ADMIN EMAIL -> NEW PARTNER APPLIED
    const masterAdmin = await User.findOne({ type: 'admin' })

    var emailContentToAdmin = {
      from: 'KETO <info@myketomarketplace.com>',
      to: masterAdmin.email,
      subject: 'New Affiliate Applied.',
      text: `Hi ${masterAdmin.name}. ${newAffiliate.name} applied as a affiliate of KETO. 
      You can check his/her information here https://myketomarketplace.com/home/pending 
      Best Regards.
      KETO Team.`
    }

    mailgun.messages().send(emailContentToAdmin, function (error, body) {
      console.log(body)
    })

    res.json({
      success: true,
      connectURL: accountLink.url,
      pendingAffiliate: newAffiliate
    })
  }
})

router.get('/updateAffiliateConnectedAccount/:id', async (req, res) => {
  try {
    let pendingAffiliate = await User.findOneAndUpdate({ _id: req.params.id }, { mailSent: false }, { new: true })
    const accountLink = await stripe.accountLinks.create({
      account: pendingAffiliate.stripeConnectedAccount,
      refresh_url: returnURL + 'failedconnectaccount/' + pendingAffiliate._id,
      return_url: returnURL + 'thanks/' + pendingAffiliate._id,
      type: 'account_onboarding',
    })

    var emailContentToAffiliate = {
      from: 'KETO <info@myketomarketplace.com>',
      to: pendingAffiliate.email,
      subject: 'KETO TEAM: Update Link Send',
      text: `Hi ${pendingAffiliate.name}. You need to provide more information to be approved as a AFFILIATE of KETO. We send you the update link. ${accountLink.url} We will let you know again when you have completed the updates. KETO Team.`
    }

    mailgun.messages().send(emailContentToAffiliate, function (error, body) {
      console.log(body)
    })

    res.json({
      success: true,
      connectURL: accountLink.url
    })
  } catch (err) {
    res.json({
      success: false
    })
  }
})

router.get('/getPendingAffiliateByUserId/:id', async (req, res) => {
  try {
    let pendingAffiliate = await User.findById(req.params.id)
    const account = await stripe.accounts.retrieve(pendingAffiliate.stripeConnectedAccount)
    if (account.charges_enabled && account.payouts_enabled && account.capabilities.transfers === 'active') {
      pendingAffiliate = await User.findOneAndUpdate({ _id: req.params.id }, { connectedAccountStatus: 'enabled', mailSent: true }, { new: true })

      var emailContentToAffiliate = {
        from: 'KETO <info@dcgonboarding.com>',
        to: pendingAffiliate.email,
        subject: 'Welcom to KETO',
        text: `Thank you ${pendingAffiliate.name}. Your affiliateship request is currently pending approval. If you have completed the connected account creation then your affiliateship will be approved soon. We will let you know again when you are approved. Thank you. KETO Team.`
      }

      mailgun.messages().send(emailContentToAffiliate, function (error, body) {
        console.log(body)
      })
    } else {
      if (pendingAffiliate.mailSent === false) {
        await User.findOneAndUpdate({ _id: req.params.id }, { mailSent: true }, { new: true })
        const accountLink = await stripe.accountLinks.create({
          account: pendingAffiliate.stripeConnectedAccount,
          refresh_url: returnURL + 'failedconnectaccount/' + pendingAffiliate._id,
          return_url: returnURL + 'thanks/' + pendingAffiliate._id,
          type: 'account_onboarding',
        })
        var emailContentToAffiliate = {
          from: 'KETO <info@dcgonboarding.com>',
          to: pendingAffiliate.email,
          subject: 'Some Issues On KETO',
          text: `Hi ${pendingAffiliate.name}. We detected some issues on your account connected to our stripe dashboard. You need to provide more information to Stripe to enable payments and payouts on this account. INFORMATION NEEDED - DUE NOW (Bank account or debit card). You can update here. ${accountLink.url}
          We will let you know again when your connected account is ENABLED. Thank you. KETO Team.`
        }

        mailgun.messages().send(emailContentToAffiliate, function (error, body) {
          console.log(body)
        })
      }
    }
    res.json({
      success: true,
      affiliate: pendingAffiliate
    })
  } catch (err) {
    // console.log(err)
    res.json({
      success: false
    })
  }
})

module.exports = router
