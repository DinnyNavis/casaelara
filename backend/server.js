require('dotenv').config()
const express = require('express')
const cors = require('cors')
const contactRoutes = require('./routes/contactRoutes')

const app = express()
const PORT = process.env.PORT || 5000

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  'https://casaelara.vercel.app',
  'https://casa-elara.vercel.app',
  'https://casa-elara-frontend.onrender.com'
]
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) callback(null, true)
    else callback(new Error('Not allowed by CORS'))
  },
  methods: ['POST'],
  allowedHeaders: ['Content-Type']
}))

app.use(express.json())

app.use('/api/contact', contactRoutes)

app.listen(PORT, () => {
  console.log(`Casa Elara backend running on port ${PORT}`)
})
