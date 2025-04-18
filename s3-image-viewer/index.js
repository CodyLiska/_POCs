const express = require('express')
const path = require('path')
const app = express()
const port = 3000

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')))

// Mount album-related routes under /api and /
const albumRoutes = require('./routes/albums')
app.use('/api', albumRoutes)
app.use('/', albumRoutes) // This allows /image/... to still work

// Fallback for unmatched routes
app.get('*', (req, res) => {
  res.status(404).send('Page not found')
})

app.listen(port, '0.0.0.0', () => {
  console.log(`Server listening on http://localhost:${port}`)
})