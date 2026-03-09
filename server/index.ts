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
    <a href="/blog">Blog</a>
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
        <p class="about-footer"><a href="/blog">Read the blog</a></p>
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
    '/blog': shell(publicNav, `
      <div class="blog-page">
        <h2>Blog</h2>
        <div class="blog-list">
          <a href="/blog/building-habits-for-creative-work" class="blog-card">
            <h3>Building Habits for Creative Work</h3>
            <p class="blog-card-subtitle">Stop Choosing, Start Doing</p>
            <span class="blog-card-date">March 8, 2026</span>
          </a>
        </div>
      </div>`),
    '/blog/building-habits-for-creative-work': shell(publicNav, `
      <div class="blog-page">
        <a href="/blog" class="back-link">&larr; Back to Blog</a>
        <article class="blog-article">
          <h2>Building Habits for Creative Work</h2>
          <p class="blog-subtitle">Stop Choosing, Start Doing</p>
          <p class="blog-date">March 8, 2026</p>
          <div class="blog-body">
            <p>Most of us wear a lot of hats. Parent, worker, friend, musician &mdash; we play a dozen roles before lunch. The problem isn&rsquo;t the number of hats. It&rsquo;s that the important ones, the creative ones, keep ending up at the bottom of the stack.</p>
            <p>A few years ago I wrote a book with Gordy Quist about songwriting habits. Chapter 3 laid out this idea that there are really only four things a songwriter needs to do: Write. Read. Listen. Perform. Not in heroic bursts. Just a little, every day. Free write 50 words. Read 2 pages of poetry. Listen to one song. Play one chord progression. Stupid small. That was the whole point.</p>
            <p>We borrowed Stephen Guise&rsquo;s Mini-Habits idea and Jonathan Haidt&rsquo;s metaphor of the rider and the elephant. The rider is your conscious mind &mdash; the one making plans, setting goals, buying the nice notebook. The elephant is the part of you that actually does things. And the elephant doesn&rsquo;t care about your plans. The elephant cares about the path of least resistance. You have to make the right path the easy path.</p>
            <p>The problem I kept running into wasn&rsquo;t motivation. It was the moment of choosing. I&rsquo;d sit down with time to work and think: should I write? Practice guitar? Read that book of poems I keep meaning to start? And by the time I&rsquo;d decided, half my energy had gone to the deciding. That&rsquo;s decision fatigue &mdash; the thing that makes you order the same lunch every day not because you love it but because choosing is expensive.</p>
            <p>So I built something.</p>
            <p>It&rsquo;s called HatRack. The idea is simple: you put your activities on the rack &mdash; your many hats &mdash; and when you&rsquo;re ready to work, the app picks one for you. Randomly. Then it rolls a random timer. Maybe it&rsquo;s 3 minutes. Maybe it&rsquo;s 22. You don&rsquo;t know until it rolls. And then you just do the thing until the bell rings.</p>
            <p>That&rsquo;s it. The randomness is the feature, not a bug. You don&rsquo;t decide what to work on. You don&rsquo;t decide how long. You just start. The elephant walks the path because there&rsquo;s only one path.</p>
            <p>Maybe a hat is a role you step into. You put on the writing hat and you&rsquo;re a writer &mdash; not someone thinking about writing. You put on the listening hat and you&rsquo;re a listener. The app picks the hat, you wear it until the bell rings.</p>
            <p>You earn points equal to the minutes you complete &mdash; a small scoreboard that adds up through the day. It saves a history too &mdash; a record of daily victories against distraction and sloth. It scratches that same itch as a video game without requiring you to do anything other than the work you already wanted to do. The points aren&rsquo;t the point. The points are just enough to make the elephant want to walk that path again tomorrow.</p>
            <p>There&rsquo;s a mini mode for the days when you can&rsquo;t imagine sitting with anything for 25 minutes. Mini mode rolls 1 to 5 minutes. That&rsquo;s it. Five minutes of writing. Three minutes of listening. It&rsquo;s Guise&rsquo;s &ldquo;stupid small&rdquo; idea with a random timer strapped to it. And the thing about stupid small is that it compounds. The Grand Canyon wasn&rsquo;t carved in an afternoon.</p>
            <p>I originally built this for myself &mdash; for cycling through those four songwriting habits without burning out on any one of them. But it turns out the hat rack holds all kinds of hats. Meditating. Exercising. Studying. Drawing. Anything where showing up daily matters more than showing up perfectly.</p>
            <p>If you&rsquo;re a songwriter, I&rsquo;d suggest starting with four hats: Writing, Reading, Listening, Performing. Those are the fundamentals. You can get more specific as you go.</p>
            <p>If you&rsquo;re someone who wants to mix creative work with meditation or exercise, throw those on the rack too. The app doesn&rsquo;t care what the hats are. It just picks one and starts the clock.</p>
            <p>You can set up your own hat rack at <a href="/signup">hatrack.it</a>. It&rsquo;s free. Sign up, add your hats, and see what happens when you stop choosing and start doing.</p>
            <p>Sometimes the elephant just needs someone to point at the path.</p>
          </div>
        </article>
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
