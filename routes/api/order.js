const express = require('express')
const router = express.Router()
// const config = require('config')

// MODEL
const Order = require('../../models/Order')
const OrderItem = require('../../models/OrderItem')

router.post('/createOrder/:clientID', async (req, res) => {

  const client = req.params.clientID

  const {
    shippingFirstName,
    shippingLastName,
    shippingPhoneNumber,
    shippingEmail,
    shippingAddress,
    shippingCity,
    shippingState,
    shippingZipCode,
    billingNameOnCard,
    billingAddress,
    billingCity,
    billingState,
    billingZipCode,
    paymentIntent
  } = req.body.orderDetail

  const cartLines = req.body.cartLines

  let subTotal = 0, shippingFee = 0

  cartLines.forEach(line => {
    subTotal += line.product.price * line.quantity
    shippingFee += line.product.shippingFee * line.quantity
  })

  const newOrder = new Order({
    client,
    shippingFirstName,
    shippingLastName,
    shippingPhoneNumber,
    shippingEmail,
    shippingAddress,
    shippingCity,
    shippingState,
    shippingZipCode,
    billingNameOnCard,
    billingAddress,
    billingCity,
    billingState,
    billingZipCode,
    paymentIntent,
    subTotal,
    shippingFee
  })

  await newOrder.save()

  cartLines.forEach(async line => {
    let newOrderItem = new OrderItem({
      order: newOrder._id,
      productName: line.product.name,
      price: line.product.price,
      vendor: line.product.vendor,
      shippingFee: line.product.shippingFee,
      quantity: line.quantity,
      trackingNumber: ''
    })

    await newOrderItem.save()
  })

  res.json({
    success: true
  })
})

router.get('/getAllOrders', async (req, res) => {
  const orders = await Order.find().populate('client')

  res.json({
    success: true,
    orders
  })
})

router.get('/getAllOpenedOrders', async (req, res) => {
  const orders = await Order.find({ status: 'opened' }).populate('client')

  res.json({
    success: true,
    orders
  })
})

router.get('/getAllInfulfillmentOrders', async (req, res) => {
  const orders = await Order.find({ status: 'infulfillment' }).populate('client')

  res.json({
    success: true,
    orders
  })
})

router.get('/getAllClosedOrders', async (req, res) => {
  const orders = await Order.find({ status: 'closed' }).populate('client')

  res.json({
    success: true,
    orders
  })
})

router.get('/getOrders/:clientID', async (req, res) => {
  const orders = await Order.find({ client: req.params.clientID })

  res.json({
    success: true,
    orders
  })
})

router.get('/getOrder/:orderID', async (req, res) => {
  const order = await Order.findById(req.params.orderID)

  res.json({
    success: true,
    order
  })
})

router.get('/getOrderItems/:orderID', async (req, res) => {
  const orderItems = await OrderItem.find({ order: req.params.orderID })

  res.json({
    success: true,
    orderItems
  })
})

router.get('/updateOrder', async (req, res) => {

  res.json({
    success: true
  })
})

router.post('/addTrackingNumber', async (req, res) => {
  const { orderItemIDs, trackingNumber } = req.body

  orderItemIDs.forEach(async orderItemID => {
    await OrderItem.findByIdAndUpdate(orderItemID, { trackingNumber })
  })

  res.json({
    success: true
  })
})

router.post('/setOrderStatus', async (req, res) => {
  const { status, orderID } = req.body

  await Order.findByIdAndUpdate(orderID, { status })

  res.json({
    success: true
  })
})

module.exports = router
