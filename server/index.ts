import express from 'express'
import path from 'path'
import fs from 'fs'
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

  // Pre-rendered HTML for public routes so crawlers see real content
  const indexHtml = fs.readFileSync(path.join(clientDist, 'index.html'), 'utf-8')

  const shell = (nav: string, content: string) => `
    <nav class="nav-bar">${nav}</nav>
    <img class="banner" src="/assets/logo.jpg" alt="HatRack" />
    <p class="subtitle">Make a habit. Wear your many hats.</p>
    ${content}`

  const publicNav = `
    <a href="/about">About</a>
    <a href="/login">Log in</a>
    <a href="/signup">Sign up</a>`

  const preRendered: Record<string, string> = {
    '/': shell(publicNav, `
      <div class="landing-page">
        <p class="landing-hook">Spend time on what matters — without overthinking where to start.</p>
        <a href="/signup" class="btn-primary" style="display:block;text-align:center;text-decoration:none;padding:10px 20px;margin:1.5rem 0">Get Started</a>
        <p class="switch-link">Already have an account? <a href="/login">Log in</a></p>
        <div class="landing-how">
          <h3>How it works</h3>
          <p>Add your activities to the rack.</p>
          <p>Start a session — HatRack picks one at random with a short timer.</p>
          <p>Finish and earn points. Then go again.</p>
        </div>
      </div>`),
    '/about': shell(publicNav, `
      <div class="about-page">
        <h2>About HatRack</h2>
        <p>Most of us juggle multiple roles and projects — we "wear many hats." HatRack™ lets you put all your hats on the rack. Writing, Meditating, Reading, Drawing, Coding — whatever you want to make progress on. Start a focus session, and HatRack draws a hat at random with a timer of varying length. Wear one hat, then move on to the next. Earn points for every focused minute.</p>
        <p>Randomness removes the burden of choosing. Gamification makes it fun. Nothing gets missed.</p>
        <p>HatRack was created by Owen Temple and originally launched at hatrackapp.com in July 2015. The app has been rebuilt and expanded over the years, but the core concept hasn't changed: pick a hat, start a timer, do the work.</p>
        <p class="about-footer">Made in Austin, Texas.</p>
        <p class="about-copyright">© 2015–2026 HatRack, LLC</p>
        <p class="about-source"><a href="https://github.com/owentemple/hatrack" target="_blank" rel="noopener noreferrer">View the source on GitHub</a></p>
      </div>`),
    '/login': shell(publicNav, `
      <div class="auth-form">
        <h2>Log In</h2>
        <form><div class="form-group"><input type="email" placeholder="Email" /></div><div class="form-group"><input type="password" placeholder="Password" /></div><button type="submit" class="btn-primary" style="width:100%">Log In</button></form>
        <p class="switch-link"><a href="/forgot-password">Forgot password?</a></p>
        <p class="switch-link">Don't have an account? <a href="/signup">Sign up</a></p>
      </div>`),
    '/signup': shell(publicNav, `
      <div class="auth-form">
        <h2>Sign Up</h2>
        <p style="color:#666;font-size:0.9rem;line-height:1.7">Add your activities. Roll a random timer. Focus. Earn points.</p>
        <p style="color:#666;font-size:0.9rem;line-height:1.7">Randomness removes decision fatigue so you just start.</p>
        <form><div class="form-group"><input type="text" placeholder="Name" /></div><div class="form-group"><input type="email" placeholder="Email" /></div><div class="form-group"><input type="password" placeholder="Password" /></div><button type="submit" class="btn-primary">Sign Up</button></form>
        <p class="switch-link">Already have an account? <a href="/login">Log in</a></p>
      </div>`),
  }

  app.get('*', (req, res) => {
    const content = preRendered[req.path]
    if (content) {
      res.send(indexHtml.replace('<div id="root"></div>', `<div id="root">${content}</div>`))
    } else {
      res.sendFile(path.join(clientDist, 'index.html'))
    }
  })
}

const port = process.env.PORT || 4000
app.listen(port, () => {
  console.log(`Server listening on port ${port}`)
})

export default app
