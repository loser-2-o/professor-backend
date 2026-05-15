const express = require('express')
const cors = require('cors')
const mongoose = require('mongoose')
require('dotenv').config()
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')

const app = express()
app.use(express.json())
app.use(cors())

// MongoDB connect
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected!'))
  .catch((err) => console.log('Error:', err))

// Publication Schema
const publicationSchema = new mongoose.Schema({
  id: Number,
  title: String
})

const Publication = mongoose.model('Publication', publicationSchema)

// Route 1 - Home
app.get('/', (req, res) => {
  res.send('Server is running!')
})
// Admin Schema
const adminSchema = new mongoose.Schema({
  username: String,
  password: String
})

const Admin = mongoose.model('Admin', adminSchema)

// Admin Register (শুধু একবার করবে)
app.post('/register', async (req, res) => {
  const { username, password } = req.body
  const hashed = await bcrypt.hash(password, 10)
  const admin = new Admin({ username, password: hashed })
  await admin.save()
  res.json({ message: 'Admin created!' })
})

// Admin Login
app.post('/login', async (req, res) => {
  const { username, password } = req.body
  const admin = await Admin.findOne({ username })
  if (!admin) return res.status(404).json({ message: 'Admin not found' })
  const isMatch = await bcrypt.compare(password, admin.password)
  if (!isMatch) return res.status(401).json({ message: 'Wrong password' })
  const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET)
  res.json({ message: 'Login successful!', token })
})

// Route 2 - Profile
app.get('/profile', (req, res) => {
  res.json({
    name: 'Professor Anamur Rashid',
    department: 'CSE',
    email: 'muhammadanamurrashid@gmail.com'
  })
})

// Route 3 - Get all publications
app.get('/publications', async (req, res) => {
  const publications = await Publication.find()
  res.json(publications)
})

// Route 4 - Add new publication
app.post('/publications', async (req, res) => {
  const { id, title } = req.body
  const publication = new Publication({ id, title })
  await publication.save()
  res.json({ message: 'Publication added!', publication })
})
// Delete publication
app.delete('/publications/:id', async (req, res) => {
  await Publication.findByIdAndDelete(req.params.id)
  res.json({ message: 'Publication deleted!' })
})

app.listen(process.env.PORT, () => {
  console.log('Server started on port', process.env.PORT)
})