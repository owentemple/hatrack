import express from 'express'
import path from 'path'
import fs from 'fs'
import authRoutes from './routes/auth'
import hatRoutes from './routes/hats'
import sessionRoutes from './routes/sessions'
import settingsRoutes from './routes/settings'
import smsWebhookRoutes from './routes/smsWebhook'

const app = express()

// Twilio sends form-encoded data
app.use('/api/webhooks', express.urlencoded({ extended: false }))
app.use(express.json())

// API routes
app.use('/api/auth', authRoutes)
app.use('/api/hats', hatRoutes)
app.use('/api/sessions', sessionRoutes)
app.use('/api/settings', settingsRoutes)
app.use('/api/webhooks', smsWebhookRoutes)

// In production, serve the built client
if (process.env.NODE_ENV === 'production') {
  const clientDist = path.resolve(__dirname, '../client/dist')
  app.use(express.static(clientDist, { index: false }))

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
        <p class="switch-link"><a href="/signup">Create an account</a> to save across devices</p>
        <div class="landing-how">
          <h3>How it works</h3>
          <p>Add your activities to the rack.</p>
          <p>Start a session — HatRack picks one at random with a short timer.</p>
          <p>Finish and earn points. Then go again.</p>
          <p style="margin-top:1rem;opacity:0.7">Works on any device. Best in your pocket.</p>
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
          <a href="/blog/you-have-twenty-minutes" class="blog-card">
            <h3>You Have Twenty Minutes. What Do You Work On?</h3>
            <p class="blog-card-subtitle">Why the hardest part of doing what matters is deciding to start</p>
            <span class="blog-card-date">March 10, 2026</span>
          </a>
          <a href="/blog/building-habits-for-creative-work" class="blog-card">
            <h3>Building Habits for Creative Work</h3>
            <p class="blog-card-subtitle">Stop Choosing, Start Doing</p>
            <span class="blog-card-date">March 8, 2026</span>
          </a>
          <a href="/blog/the-hats-you-wear" class="blog-card">
            <h3>The Hats You Wear</h3>
            <p class="blog-card-subtitle">Why recurring activities need a different kind of tool</p>
            <span class="blog-card-date">July 7, 2016</span>
          </a>
          <a href="/blog/fifty-words-one-song-one-chord-two-pages" class="blog-card">
            <h3>Fifty Words, One Song, One Chord, Two Pages</h3>
            <p class="blog-card-subtitle">The case for making your goals embarrassingly small</p>
            <span class="blog-card-date">January 9, 2016</span>
          </a>
          <a href="/blog/wear-many-hats-make-a-habit" class="blog-card">
            <h3>Wear Many Hats, Make a Habit, Build a Dream</h3>
            <p class="blog-card-subtitle">How a songwriter&rsquo;s problem became a productivity app</p>
            <span class="blog-card-date">September 8, 2015</span>
          </a>
        </div>
      </div>`),
    '/blog/you-have-twenty-minutes': shell(publicNav, `
      <div class="blog-page">
        <a href="/blog" class="back-link">&larr; Back to Blog</a>
        <article class="blog-article">
          <h2>You Have Twenty Minutes. What Do You Work On?</h2>
          <p class="blog-subtitle">Why the hardest part of doing what matters is deciding to start</p>
          <p class="blog-date">March 10, 2026</p>
          <div class="blog-body">
            <p>You finally have a free window. Twenty minutes, maybe thirty. The kids are occupied or the meeting ended early or you just woke up before your alarm.</p>
            <p>You could meditate. You could read that book that&rsquo;s been on your nightstand for three months. You could stretch. You could write. You could practice guitar.</p>
            <p>By the time you&rsquo;ve weighed the options, ten minutes are gone and you&rsquo;re scrolling your phone.</p>
            <p>This happens every time. Not because you&rsquo;re lazy &mdash; because you care about too many things equally. If you only had one thing, you&rsquo;d do it. But you have five, and choosing one means not choosing four, and that tiny negotiation is enough friction to stop you cold.</p>
            <h3>The quiet things lose</h3>
            <p>There&rsquo;s a version of this problem that productivity people love to talk about &mdash; urgent vs. important. The idea is simple: important things rarely feel urgent, and urgent things rarely matter much. Emails feel urgent. Meditating doesn&rsquo;t. Posting on social media feels urgent. Practicing your craft doesn&rsquo;t. So the urgent stuff wins every day, and the important stuff gets pushed to &ldquo;later.&rdquo;</p>
            <p>But here&rsquo;s what they don&rsquo;t tell you: &ldquo;later&rdquo; isn&rsquo;t a time. It&rsquo;s a lie you tell yourself so you don&rsquo;t have to feel bad right now. Meditation is not the thing you do when everything else is done. Everything else is never done. If you wait for a clear schedule to do the things that matter, you will wait forever.</p>
            <p>The cruelest part is that the things you keep deferring aren&rsquo;t small. They&rsquo;re the things that made you who you are. You started writing songs, then got busy promoting songs, and now you don&rsquo;t write anymore. You used to read for an hour a day, then life filled in around it, and now you read the back of shampoo bottles. These activities didn&rsquo;t stop being important. They just stopped being loud.</p>
            <h3>The real problem isn&rsquo;t discipline</h3>
            <p>When people can&rsquo;t start, they blame themselves. Not enough discipline. Not enough focus. Not enough willpower. So they download an app, build a system, buy a planner, write out a schedule.</p>
            <p>Now they have a new problem: maintaining the system. Updating the planner. Reorganizing the schedule when Monday&rsquo;s plan falls apart by Tuesday. The system becomes its own urgent thing, crowding out the work it was supposed to protect.</p>
            <p>You don&rsquo;t need a better system. You need fewer decisions.</p>
            <h3>What if you didn&rsquo;t have to choose?</h3>
            <p>Put everything you care about on a list. Don&rsquo;t prioritize it. Don&rsquo;t rank it. Don&rsquo;t assign days or time blocks. Just list the things that matter.</p>
            <p>Now pick one at random.</p>
            <p>Set a timer &mdash; not for an hour, not for a Pomodoro, just for some random number of minutes. Maybe it&rsquo;s four. Maybe it&rsquo;s nineteen. You don&rsquo;t know in advance, which means you can&rsquo;t dread it or negotiate with it.</p>
            <p>Do that thing until the timer ends. Then stop.</p>
            <p>That&rsquo;s it. No optimizing. No guilt about what you didn&rsquo;t pick &mdash; it&rsquo;ll come up next time. The randomness means nothing gets neglected over time. The short timer means you actually start. And starting is 90% of the battle, because the person who meditates for four minutes today is infinitely closer to their goal than the person who plans to meditate for thirty minutes tomorrow.</p>
            <h3>Why randomness works</h3>
            <p>It sounds too simple, maybe even frivolous. Drawing from a hat? That&rsquo;s a productivity strategy?</p>
            <p>Yes. Because the bottleneck was never the work. The work is fine once you&rsquo;re doing it. The bottleneck was the moment before the work &mdash; that gap between &ldquo;I have time&rdquo; and &ldquo;I&rsquo;m doing something,&rdquo; where every option competes and nothing wins.</p>
            <p>Randomness skips that moment entirely. There&rsquo;s nothing to decide, nothing to justify, nothing to feel guilty about. You just start.</p>
            <p>And something surprising happens when you do this for a while: you stop thinking of these activities as things you <em>should</em> do and start thinking of them as things you <em>did</em> do. Today you read. Yesterday you meditated. The day before, you stretched. None of them got neglected. None of them required a heroic act of will. You just showed up and let the randomness handle the rest.</p>
            <p><a href="https://www.hatrack.it/">HatRack</a> does exactly this. Add your activities, tap a button, and start. It&rsquo;s free.</p>
          </div>
        </article>
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
            <p>In 2015, I wrote <a href="https://songfarmer.com/book/" target="_blank" rel="noopener noreferrer">a book</a> with Gordy Quist about songwriting habits. Chapter 3 laid out this idea that there are really only four things a songwriter needs to do: Write. Read. Listen. Perform. Not in heroic bursts. Just a little, every day. Free write 50 words. Read 2 pages of poetry. Listen to one song. Play one chord progression. Stupid small. That was the whole point.</p>
            <p>We borrowed <a href="https://minihabits.com/about-mini-habits/" target="_blank" rel="noopener noreferrer">Stephen Guise&rsquo;s Mini-Habits</a> idea and <a href="https://en.wikipedia.org/wiki/The_Happiness_Hypothesis" target="_blank" rel="noopener noreferrer">Jonathan Haidt&rsquo;s metaphor of the rider and the elephant</a>. The rider is your conscious mind &mdash; the one making plans, setting goals, buying the nice notebook. The elephant is the part of you that actually does things. And the elephant doesn&rsquo;t care about your plans. The elephant cares about the path of least resistance. You have to make the right path the easy path.</p>
            <p>The problem I kept running into wasn&rsquo;t motivation. It was the moment of choosing. I&rsquo;d sit down with time to work and think: should I write? Practice guitar? Read that book of poems I keep meaning to start? And by the time I&rsquo;d decided, half my energy had gone to the deciding. That&rsquo;s decision fatigue &mdash; the thing that makes you order the same lunch every day not because you love it but because choosing is expensive.</p>
            <p>So that same year, I built something.</p>
            <p>I called it <a href="https://www.hatrack.it/">HatRack</a>. The idea was simple: you put your activities on the rack &mdash; your many hats &mdash; and when you&rsquo;re ready to work, the app picks one for you. Randomly. Then it rolls a random timer. Maybe it&rsquo;s 3 minutes. Maybe it&rsquo;s 22. You don&rsquo;t know until it rolls. And then you just do the thing until the bell rings.</p>
            <p>That&rsquo;s it. The randomness is the feature, not a bug. You don&rsquo;t decide what to work on. You don&rsquo;t decide how long. You just start. The elephant walks the path because there&rsquo;s only one path.</p>
            <p>Maybe a hat is a role you step into. You put on the writing hat and you&rsquo;re a writer &mdash; not someone thinking about writing. You put on the listening hat and you&rsquo;re a listener. The app picks the hat, you wear it until the bell rings.</p>
            <p>You earn points equal to the minutes you complete &mdash; a small scoreboard that adds up through the day. It saves a history too &mdash; a record of daily victories against distraction and sloth. It scratches that same itch as a video game without requiring you to do anything other than the work you already wanted to do. The points aren&rsquo;t the point. The points are just enough to make the elephant want to walk that path again tomorrow.</p>
            <p>There&rsquo;s a mini mode for the days when you can&rsquo;t imagine sitting with anything for 25 minutes. Mini mode rolls 1 to 5 minutes. That&rsquo;s it. Five minutes of writing. Three minutes of listening. It&rsquo;s Guise&rsquo;s &ldquo;stupid small&rdquo; idea with a random timer strapped to it. And the thing about stupid small is that it compounds. The Grand Canyon wasn&rsquo;t carved in an afternoon.</p>
            <p>I originally built HatRack in July 2015 at hatrackapp.com &mdash; for cycling through those four songwriting habits without burning out on any one of them. It&rsquo;s been rebuilt and expanded over the years, but the core concept hasn&rsquo;t changed: pick a hat, start a timer, do the work. And it turns out the hatrack holds all kinds of hats. Meditating. Exercising. Studying. Drawing. Anything where showing up daily matters more than showing up perfectly.</p>
            <p>If you&rsquo;re a songwriter, I&rsquo;d suggest starting with four hats: Writing, Reading, Listening, Performing. Those are the fundamentals. You can get more specific as you go.</p>
            <p>If you&rsquo;re someone who wants to mix creative work with meditation or exercise, throw those on the rack too. The app doesn&rsquo;t care what the hats are. It just picks one and starts the clock.</p>
            <p>You can set up your own hatrack at <a href="/signup">hatrack.it</a>. It&rsquo;s free. Sign up, add your hats, and see what happens when you stop choosing and start doing.</p>
            <p>Sometimes the elephant just needs someone to point at the path.</p>
          </div>
        </article>
      </div>`),
    '/blog/the-hats-you-wear': shell(publicNav, `
      <div class="blog-page">
        <a href="/blog" class="back-link">&larr; Back to Blog</a>
        <article class="blog-article">
          <h2>The Hats You Wear</h2>
          <p class="blog-subtitle">Why recurring activities need a different kind of tool</p>
          <p class="blog-date">July 7, 2016</p>
          <div class="blog-body">
            <p>For most of us, life and work require wearing multiple hats. There are multiple roles or task categories we need to perform on a daily basis.</p>
            <p>Some jobs require Selling, Preparing Estimates, Providing Technical Support, and Expense Reporting. Other jobs require Writing, Shipping, Booking, and Reading. Think about the activities that should happen on a daily basis in your life &mdash; the hats you need to wear &mdash; to keep your life going smoothly.</p>
            <p>These recurring activities usually end in &ldquo;-ing.&rdquo; Emailing. Designing. Composing. Performing. Networking. They&rsquo;re not one-time tasks with a finish line. They&rsquo;re ongoing practices &mdash; things that need your attention regularly, not perfectly.</p>
            <p>That&rsquo;s what makes them hard to manage. A task has a deadline. A hat doesn&rsquo;t. Nobody sends you a reminder that you haven&rsquo;t practiced guitar in two weeks. Nobody puts &ldquo;read for pleasure&rdquo; on your calendar. These activities fall through the cracks not because they&rsquo;re unimportant, but because they&rsquo;re never urgent.</p>
            <p>HatRack is built for exactly this. You add your hats to the rack &mdash; whatever they are, however many you have. When you&rsquo;re ready to focus, you click one button. A random hat is selected. A random timer between 1 and 25 minutes rolls. And you work on that activity until the timer ends.</p>
            <p>You don&rsquo;t decide what to work on. You don&rsquo;t decide how long. You just start. And when you&rsquo;re done, the hat goes back on the rack, ready for next time.</p>
            <p>Every hat gets its turn. Nothing gets neglected. And you stop spending your limited energy on the meta-work of choosing, scheduling, and prioritizing &mdash; so you can spend it on the work itself.</p>
          </div>
        </article>
      </div>`),
    '/blog/fifty-words-one-song-one-chord-two-pages': shell(publicNav, `
      <div class="blog-page">
        <a href="/blog" class="back-link">&larr; Back to Blog</a>
        <article class="blog-article">
          <h2>Fifty Words, One Song, One Chord, Two Pages</h2>
          <p class="blog-subtitle">The case for making your goals embarrassingly small</p>
          <p class="blog-date">January 9, 2016</p>
          <div class="blog-body">
            <p>When I set up my first HatRack, I made each micro goal embarrassingly small.</p>
            <p>Writing: 50 words. Not a polished paragraph. Not a finished verse. Just 50 words of something &mdash; freewriting, stream of consciousness, whatever comes.</p>
            <p>Listening: 1 song. Not an album. Not a curated playlist. One song, with actual attention.</p>
            <p>Performing: 1 chord. Not a full practice session. Not running scales for an hour. One chord progression. Play it and you&rsquo;re done.</p>
            <p>Reading: 2 pages. Not a chapter. Two pages.</p>
            <p>Coding: 3 lines. Three.</p>
            <p>These aren&rsquo;t goals that inspire motivational posters. They&rsquo;re goals that actually happen. That&rsquo;s the whole point.</p>
            <p>Stephen Guise calls this &ldquo;stupid small&rdquo; &mdash; making the target so easy that it feels ridiculous not to do it. The trick is that nobody writes exactly 50 words and stops. You write 50, and then you write 200 because you&rsquo;re already going. You read 2 pages and suddenly you&rsquo;ve read twelve. The micro goal isn&rsquo;t the ceiling. It&rsquo;s the doorway.</p>
            <p>The original HatRack had tokens you could drag across a slider &mdash; five positions from left to right. Slot one meant you hadn&rsquo;t started. Slot five meant you&rsquo;d blown past the micro goal. You could see your progress across every hat at a glance: some tokens at the start, some in the middle, some all the way to the right.</p>
            <p>Weekly hats worked the same way but with bigger goals: compose a draft, write a joke, review a text, work through a page of music theory. Monthly hats zoomed out further: attend a networking meetup, prepare a lesson, write a blog post for fans.</p>
            <p>The system had three tiers &mdash; daily, weekly, and monthly &mdash; because some hats you wear every day and some you only need once a month. But they all got the same treatment: define the smallest possible step, then take it.</p>
            <p>The micro goals have changed over the years. The principle hasn&rsquo;t. Make it small enough that you can&rsquo;t say no.</p>
          </div>
        </article>
      </div>`),
    '/blog/wear-many-hats-make-a-habit': shell(publicNav, `
      <div class="blog-page">
        <a href="/blog" class="back-link">&larr; Back to Blog</a>
        <article class="blog-article">
          <h2>Wear Many Hats, Make a Habit, Build a Dream</h2>
          <p class="blog-subtitle">How a songwriter&rsquo;s problem became a productivity app</p>
          <p class="blog-date">September 8, 2015</p>
          <div class="blog-body">
            <p>I built HatRack because I couldn&rsquo;t stop dropping hats.</p>
            <p>I&rsquo;m a songwriter, which means I need to write, read, listen, and perform &mdash; every day, if I&rsquo;m serious about it. But every day I&rsquo;d sit down, stare at all four, and do none of them. Not because I didn&rsquo;t care. Because I cared about all of them equally, and choosing felt impossible.</p>
            <p>So I built a hatrack. A literal one, at first &mdash; tokens you could slide along a track to mark progress. One tier for daily habits, one for weekly, one for monthly. You&rsquo;d define a micro goal for each activity: write 50 words, listen to 1 song, play 1 chord, read 2 pages. Stupid small on purpose. Then you&rsquo;d move the token when you did the thing.</p>
            <p>The name might have also come from the idea of building an app to habit-track &mdash; but it was the image of all those hats, hanging on a rack and waiting to be worn, that stuck.</p>
            <p>The digital version does the same thing, plus something the physical one couldn&rsquo;t: it picks a hat at random and rolls a timer for you. Click the button, and HatRack assigns you a focus session &mdash; a random activity for a random number of minutes. No choosing. No negotiating with yourself. Just start.</p>
            <p>The idea is simple. Most of us wear many hats. We have multiple roles, multiple projects, multiple things that matter. And most productivity tools assume you have one goal. HatRack assumes you have several, and that the hardest part isn&rsquo;t the work &mdash; it&rsquo;s deciding which work to do right now.</p>
            <p>So you don&rsquo;t decide. The hatrack decides for you. You just wear the hat.</p>
            <p>An app to help you wear many hats, make a habit, and build a dream.</p>
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

  if (process.env.SMS_REMINDERS_ENABLED === 'true') {
    import('./services/reminderScheduler').then(m => m.startReminderScheduler())
  }
})

export default app
