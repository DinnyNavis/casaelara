require('dotenv').config()
const express = require('express')
const cors = require('cors')
const contactRoutes = require('./routes/contactRoutes')

const app = express()
const PORT = process.env.PORT || 5000

const allowedOrigins = [
  'https://casaelara.vercel.app',
  'https://casa-elara.vercel.app',
  'https://casa-elara-frontend.onrender.com',
  'https://casaelara.onrender.com',
  'https://www.casaelara.co.in'
]
app.use(cors({
  origin: (origin, callback) => {
    // Allow all localhost origins (any port) for local development
    if (!origin || /^http:\/\/localhost(:\d+)?$/.test(origin)) return callback(null, true)
    if (allowedOrigins.includes(origin)) return callback(null, true)
    callback(new Error('Not allowed by CORS'))
  },
  methods: ['POST'],
  allowedHeaders: ['Content-Type']
}))

app.use(express.json())

app.use('/api/contact', contactRoutes)

app.listen(PORT, () => {
  console.log(`Casa Elara backend running on port ${PORT}`)
})
