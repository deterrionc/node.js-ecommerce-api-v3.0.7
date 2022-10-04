const express = require('express')
const router = express.Router()

// MODEL
const Course = require('../../models/Course')

// FILE UPLOAD
const fileUpload = require('../../utils/fileUpload')

router.post('/addNewCourse', fileUpload.fields([{ name: 'pdf', maxCount: 1 }]), async (req, res) => {
  let pdf = req.files["pdf"][0].filename

  let newCourse = new Course({
    ...req.body
  })
  newCourse.pdf = pdf

  await newCourse.save()

  res.json({
    success: true
  })
})

router.get('/getCourses', async (req, res) => {
  const courses = await Course.find()

  res.json({
    success: true,
    courses
  })
})

router.get('/getCourse/:id', async (req, res) => {
  const course = await Course.findById(req.params.id)

  res.json({
    success: true,
    course
  })
})

router.post('/updateCourse/:id', fileUpload.fields([{ name: 'pdf', maxCount: 1 }]), async (req, res) => {
  let pdf = req.files["pdf"] ? req.files["pdf"][0].filename : undefined

  let update = {
    title: req.body.title,
    description: req.body.description,
    video: req.body.video
  }

  if (pdf) {
    update.pdf = pdf
  }

  await Course.findByIdAndUpdate(req.params.id, update)

  res.json({
    success: true
  })
})

router.delete('/deleteCourse/:id', async (req, res) => {
  await Course.findByIdAndDelete(req.params.id)

  res.json({
    success: true
  })
})

module.exports = router