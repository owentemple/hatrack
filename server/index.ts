import express from 'express'
import path from 'path'
import authRoutes from './routes/auth'
import hatRoutes from './routes/hats'
import sessionRoutes from './routes/sessions'
import settingsRoutes from './routes/settings'

const app = express()

app.use(express.json())

// API routes
app.use('/api/auth', authRoutes)
app.use('/api/hats', hatRoutes)
app.use('/api/sessions', sessionRoutes)
app.use('/api/settings', settingsRoutes)

// In production, serve the built client
if (process.env.NODE_ENV === 'production') {
  const clientDist = path.resolve(__dirname, '../client/dist')
  app.use(express.static(clientDist))
  app.get('*', (_req, res) => {
    res.sendFile(path.join(clientDist, 'index.html'))
  })
}

const port = process.env.PORT || 4000
app.listen(port, () => {
  console.log(`Server listening on port ${port}`)
})

export default app
