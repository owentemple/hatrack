import express from 'express'
import path from 'path'
import fs from 'fs'
import authRoutes from './routes/auth'
import hatRoutes from './routes/hats'
import sessionRoutes from './routes/sessions'
import settingsRoutes from './routes/settings'
import billingRoutes from './routes/billing'
import smsWebhookRoutes from './routes/smsWebhook'
import stripeWebhookRoutes from './routes/stripeWebhook'

const app = express()

// Stripe webhook needs raw body for signature verification
app.use('/api/webhooks/stripe', express.raw({ type: 'application/json' }))
// Twilio sends form-encoded data
app.use('/api/webhooks', express.urlencoded({ extended: false }))
app.use(express.json())

// API routes
app.use('/api/auth', authRoutes)
app.use('/api/hats', hatRoutes)
app.use('/api/sessions', sessionRoutes)
app.use('/api/settings', settingsRoutes)
app.use('/api/billing', billingRoutes)
app.use('/api/webhooks', smsWebhookRoutes)
app.use('/api/webhooks', stripeWebhookRoutes)

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
        <h3 style="margin-top:24px;font-size:0.95rem">HatRack Premium</h3>
        <p style="font-size:0.85rem">HatRack is free to use &mdash; unlimited hats, sessions, and streaks. Upgrade to Premium to see your focus trends by day, week, month, and year, track your streak on a calendar, and discover your peak hours and most active days. $5/month &mdash; <a href="/settings">upgrade in Settings</a>.</p>
        <p style="font-size:0.8rem;color:#999">Cancel anytime from Settings. Your premium features remain active through the end of your billing period. No refunds for partial periods. Questions? <a href="mailto:info@hatrack.it">info@hatrack.it</a></p>
        <div class="about-blog-feature">
          <h3>From the Blog</h3>
          <a href="/blog/start-with-why" class="blog-card">
            <h3>Start With Why (Your Future Self Will Thank You)</h3>
            <p class="blog-card-subtitle">A new premium feature inspired by Simon Sinek&rsquo;s famous question</p>
          </a>
          <p style="margin-top:8px"><a href="/blog" style="color:#337ab7;font-size:0.85rem">All posts &rarr;</a></p>
        </div>
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
          <a href="/blog/start-with-why" class="blog-card">
            <h3>Start With Why (Your Future Self Will Thank You)</h3>
            <p class="blog-card-subtitle">A new premium feature inspired by Simon Sinek&rsquo;s famous question</p>
            <span class="blog-card-date">March 15, 2026</span>
          </a>
          <a href="/blog/hatrack-premium" class="blog-card">
            <h3>HatRack Premium: See Where Your Time Goes</h3>
            <p class="blog-card-subtitle">The new premium is about insight, not access</p>
            <span class="blog-card-date">March 14, 2026</span>
          </a>
          <a href="/blog/use-hatrack-for-meditation" class="blog-card">
            <h3>Use HatRack for Meditation (and Everything Else)</h3>
            <p class="blog-card-subtitle">You already know how to meditate. You just haven&rsquo;t started.</p>
            <span class="blog-card-date">March 13, 2026</span>
          </a>
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
          <a href="/blog/hatrack-in-your-pocket" class="blog-card">
            <h3>HatRack in Your Pocket</h3>
            <p class="blog-card-subtitle">Taking the hatrack mobile</p>
            <span class="blog-card-date">June 28, 2016</span>
          </a>
          <a href="/blog/a-farmer-of-songs" class="blog-card">
            <h3>A Farmer of Songs</h3>
            <p class="blog-card-subtitle">Why writing more songs is the best way to write better ones</p>
            <span class="blog-card-date">November 1, 2015</span>
          </a>
        </div>
      </div>`),
    '/blog/start-with-why': shell(publicNav, `
      <div class="blog-page">
        <a href="/blog" class="back-link">&larr; Back to Blog</a>
        <article class="blog-article">
          <h2>Start With Why (Your Future Self Will Thank You)</h2>
          <p class="blog-subtitle">A new premium feature inspired by Simon Sinek&rsquo;s famous question</p>
          <p class="blog-date">March 15, 2026</p>
          <div class="blog-body">
            <p>Simon Sinek&rsquo;s <a href="https://www.youtube.com/watch?v=u4ZoJKF_VuA" target="_blank" rel="noopener noreferrer">&ldquo;Start With Why&rdquo;</a> is one of the most-watched TED talks in history. The idea is simple: people don&rsquo;t buy what you do, they buy why you do it. Apple doesn&rsquo;t sell computers &mdash; they sell &ldquo;Think Different.&rdquo; Martin Luther King didn&rsquo;t have a 12-point plan &mdash; he had a dream. Start with why, and the what and how follow.</p>
            <p>It&rsquo;s a powerful framework for leaders and companies. But here&rsquo;s the thing nobody talks about: you need a why for yourself, too.</p>
            <p>Not a mission statement. Not a brand purpose. Just an honest answer to a quiet question: <em>why does this matter to me?</em></p>
            <h3>The gap between knowing and doing</h3>
            <p>You already know what your hats are. Reading, meditating, practicing music, exercising &mdash; whatever you&rsquo;ve put on your rack. You know they matter. You wouldn&rsquo;t have added them otherwise.</p>
            <p>And hatrack already handles the how. Random hat, random timer, start the clock. No deciding, no negotiating, no guilt.</p>
            <p>But there&rsquo;s a moment the app couldn&rsquo;t reach &mdash; the moment between seeing the hat and feeling like doing it. Your hat is Reading. You know you should. The timer is about to roll. But you&rsquo;re tired, or distracted, or just not feeling it. Knowing <em>what</em> to do isn&rsquo;t enough. Knowing <em>how</em> isn&rsquo;t either. What&rsquo;s missing is the <em>why</em>.</p>
            <h3>Not Sinek&rsquo;s why. Yours.</h3>
            <p>Sinek&rsquo;s why is outward-facing. It&rsquo;s about communicating purpose to others &mdash; customers, employees, movements. It works because shared purpose creates belonging.</p>
            <p>But the why you need at 7 AM when your hat comes up and you&rsquo;d rather scroll your phone &mdash; that why is private. It&rsquo;s not a slogan. It&rsquo;s the thing you&rsquo;d tell yourself on a bad day to get yourself moving.</p>
            <p>&ldquo;You never regret it once you start.&rdquo;</p>
            <p>&ldquo;Remember how good you felt after last time.&rdquo;</p>
            <p>&ldquo;You promised yourself 20 books this year.&rdquo;</p>
            <p>&ldquo;Just do five minutes. That&rsquo;s it.&rdquo;</p>
            <p>These aren&rsquo;t inspirational quotes. They&rsquo;re notes from your past self &mdash; the version of you who was clear-headed enough to name the reason, left there for the version of you who needs to hear it.</p>
            <h3>What would you tell yourself when you don&rsquo;t feel like it?</h3>
            <p>That&rsquo;s the question hatrack now asks, once, after you complete a session. Not during setup, not in a form, not as a required field. After you&rsquo;ve done the work &mdash; when you&rsquo;re in that good moment of having just shown up &mdash; the app asks: <em>What would you tell yourself when you don&rsquo;t feel like it?</em></p>
            <p>You can skip it. You can write one sentence or three. Whatever you write becomes a note attached to that hat.</p>
            <p>The next time that hat comes up &mdash; on the reveal screen, right before the timer rolls &mdash; your note is there. Not as a notification. Not as a reminder. Just your own words, quietly waiting.</p>
            <p>&ldquo;Your hat is&hellip; Reading.&rdquo;</p>
            <p><em>&ldquo;You promised yourself 20 books this year.&rdquo;</em></p>
            <p>Roll the dice.</p>
            <h3>A pep talk from your past self</h3>
            <p>The best part is that nobody writes these notes the way they&rsquo;d write a goal. When the question is &ldquo;what would you tell yourself,&rdquo; people write in their own voice. Casual. Honest. Sometimes funny. The kind of thing a good friend would say &mdash; because it <em>is</em> a good friend saying it. It&rsquo;s you.</p>
            <p>That&rsquo;s why this is a premium feature. Not because the text field is expensive to build, but because it belongs alongside the other premium tools that help you reflect on your practice. Stats show you where your time went. The streak calendar shows your consistency. Insights show your patterns. And now your why shows you the reason behind all of it.</p>
            <h3>Start with why</h3>
            <p>Sinek was right &mdash; why is where it starts. He just aimed it at the boardroom. HatRack aims it at the mirror.</p>
            <p>Your hats are the what. The random timer is the how. The note you leave yourself is the why. And on the days when you don&rsquo;t feel like it &mdash; which is most of them, if we&rsquo;re honest &mdash; that why is the thing that tips you from &ldquo;maybe later&rdquo; to &ldquo;okay, let&rsquo;s go.&rdquo;</p>
            <p>You can set your why for any hat after completing a session. It&rsquo;s available now for <a href="/settings">HatRack Premium</a> subscribers. And if you don&rsquo;t have anything to write yet, that&rsquo;s fine. The question will be there the next time you show up.</p>
          </div>
        </article>
      </div>`),
    '/blog/hatrack-premium': shell(publicNav, `
      <div class="blog-page">
        <a href="/blog" class="back-link">&larr; Back to Blog</a>
        <article class="blog-article">
          <h2>HatRack Premium: See Where Your Time Goes</h2>
          <p class="blog-subtitle">The new premium is about insight, not access</p>
          <p class="blog-date">March 14, 2026</p>
          <div class="blog-body">
            <p>HatRack has had a premium tier since 2015. Back then, &ldquo;premium&rdquo; meant your hats were saved. You&rsquo;d enter your daily, weekly, and monthly priorities, pay $5 through PayPal, and they&rsquo;d be stored and waiting for you the next time you opened the app. If you didn&rsquo;t pay, you re-entered them every day.</p>
            <p><img src="/assets/hatrackapp-2015.png" alt="HatRack at hatrackapp.com, 2015 — PayPal premium tier for stored hats" style="max-width:100%;border-radius:8px;margin:1rem 0" /></p>
            <p>That was the best I could offer at the time. The app was static HTML and jQuery. There were no user accounts, no database, no server-side anything. Saving your hats <em>was</em> the premium feature because saving your hats was technically hard.</p>
            <p>It&rsquo;s not hard anymore. Every hatrack user now gets a free account with unlimited hats, unlimited sessions, score tracking, streaks, and full session history. Hat storage &mdash; the thing premium used to solve &mdash; is just part of the app now.</p>
            <p>So premium is better than ever. And it means something different.</p>
            <h3>Patterns you can&rsquo;t see from a single session</h3>
            <p>After using hatrack for ten years, I started noticing things about my own data. Not &ldquo;I did 47 minutes today&rdquo; &mdash; I could already see that &mdash; but slower patterns. Which weeks I showed up consistently and which ones I didn&rsquo;t. Whether mornings or evenings were more productive. Whether I actually practiced more in January or just felt like I did.</p>
            <p>You can&rsquo;t see any of that from a daily score. You need to zoom out.</p>
            <p>That&rsquo;s what the new HatRack Premium does. It takes the sessions you&rsquo;re already logging and shows you what&rsquo;s in there.</p>
            <p><strong>Focus trends</strong> &mdash; Your minutes charted by day, week, month, or year. Navigate between periods. Watch your bar chart fill in as the week goes. Compare this month to last month. See your average and how it moves over time.</p>
            <p><strong>Streak calendar</strong> &mdash; A six-week grid showing every day you showed up. Top hats mark the active days. Today is circled. It answers the simplest question: am I being consistent?</p>
            <p><strong>Insights</strong> &mdash; Your best day ever. The hour you focus most. Your most active day of the week. Not to optimize your schedule into a spreadsheet &mdash; just to see that the work is adding up.</p>
            <p><img src="/assets/hatrack-premium-2026.png" alt="HatRack Premium — weekly focus trends, streak calendar, and insights" style="max-width:100%;border-radius:8px;margin:1rem 0" /></p>
            <h3>Still $5 a month</h3>
            <p>Same price as 2015. Cancel anytime from Settings. No annual lock-in, no pricing tiers.</p>
            <p>The difference is what you&rsquo;re paying for. Since 2015, you paid for storage. In 2026, you pay for insight. Every core feature &mdash; hats, sessions, scoring, streaks, history &mdash; stays free. Premium doesn&rsquo;t gate the practice. It shows you what the practice has built.</p>
            <h3>Upgrade</h3>
            <p>You can upgrade in <a href="/settings">Settings</a>. If you don&rsquo;t have an account yet, <a href="/signup">sign up free</a> &mdash; the premium features are there when you&rsquo;re ready.</p>
          </div>
        </article>
      </div>`),
    '/blog/use-hatrack-for-meditation': shell(publicNav, `
      <div class="blog-page">
        <a href="/blog" class="back-link">&larr; Back to Blog</a>
        <article class="blog-article">
          <h2>Use HatRack for Meditation (and Everything Else)</h2>
          <p class="blog-subtitle">You already know how to meditate. You just haven&rsquo;t started.</p>
          <p class="blog-date">March 13, 2026</p>
          <div class="blog-body">
            <p>You&rsquo;ve read about meditation. You&rsquo;ve read about the benefits of meditation. You&rsquo;ve read about the best apps for meditation, the best times to meditate, the best cushions to sit on, the best breathing techniques, the difference between mindfulness and transcendental and vipassana and loving-kindness.</p>
            <p>You have not meditated.</p>
            <p>This is the trap. As one meditation teacher <a href="https://satileadership.substack.com/p/be-careful-reading-about-meditation" target="_blank" rel="noopener noreferrer">put it</a>: reading about meditation is like taking a selfie at the park map and posting it. You haven&rsquo;t walked the trail. You&rsquo;ve just studied the sign. And studying the sign feels productive &mdash; it engages the thinking mind, which is exactly the mind meditation is trying to quiet.</p>
            <p>Did you learn to ride a bike by reading about it?</p>
            <h3>The whole instruction</h3>
            <p>Here is a complete meditation instruction, courtesy of <a href="https://www.lionsroar.com/a-meditation-instruction-march-2012/" target="_blank" rel="noopener noreferrer">Ch&ouml;gyam Trungpa Rinpoche</a>: Sit down. Straighten your back. Rest your hands on your knees. Breathe normally. Follow the outbreath as it dissolves into space. When thoughts come, let them pass. Come back to the breath.</p>
            <p>That&rsquo;s it. That&rsquo;s the whole thing.</p>
            <p>Trungpa called it &ldquo;irritatingly down to earth.&rdquo; No app required. No guided voice. No ambient rainforest. Just you and your breath for a few minutes.</p>
            <p>The problem was never not knowing how. The problem is the same one that kills every good intention: you sit down with time to spare, and you have to <em>decide</em> to meditate. And deciding is where things fall apart &mdash; because you could also stretch, or read, or practice guitar, or do any of the other things you keep meaning to do. By the time you&rsquo;ve weighed the options, you&rsquo;re scrolling your phone.</p>
            <h3>Put it on the rack</h3>
            <p>Meditation doesn&rsquo;t need its own app. It needs to be one hat among many.</p>
            <p>When you add Meditating to your hatrack alongside Reading, Stretching, Practicing music &mdash; whatever your hats are &mdash; two things happen. First, you stop having to decide <em>when</em> to meditate. It comes up in the rotation like everything else. Second, you stop having to decide <em>how long</em>. The timer rolls and you sit until the chime plays. Maybe it&rsquo;s three minutes. Maybe it&rsquo;s nineteen. You don&rsquo;t know in advance, which means you can&rsquo;t negotiate your way out of it.</p>
            <p>Three minutes of meditation is not nothing. Frequency matters more than duration. The person who sits for three minutes today is closer to a meditation practice than the person who plans to sit for thirty minutes tomorrow.</p>
            <h3>This is the pattern</h3>
            <p>Meditation isn&rsquo;t special here. This is how every &ldquo;I should do this more&rdquo; activity works. You don&rsquo;t need more information. You don&rsquo;t need a better app. You don&rsquo;t need the perfect conditions. You need to start, and starting is what gets blocked when you have to choose.</p>
            <p>HatRack removes the choosing. Add your activities, tap a button, and do whatever comes up for however long the timer says. Meditation gets the same treatment as reading, stretching, writing &mdash; no pedestal, no special UI, no subscription tier. Just another hat on the rack.</p>
            <p>You already know how to meditate. You already know how to read and stretch and practice. The only thing left is to <a href="https://www.hatrack.it/">start</a>.</p>
          </div>
        </article>
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
    '/blog/hatrack-in-your-pocket': shell(publicNav, `
      <div class="blog-page">
        <a href="/blog" class="back-link">&larr; Back to Blog</a>
        <article class="blog-article">
          <h2>HatRack in Your Pocket</h2>
          <p class="blog-subtitle">Taking the hatrack mobile</p>
          <p class="blog-date">June 28, 2016</p>
          <div class="blog-body">
            <p>The first version of HatRack lived at hatrackapp.com &mdash; a set of HTML pages with jQuery and draggable tokens. It worked on a laptop. On a phone, it was unusable. The tokens were too small to drag. The images didn&rsquo;t scale. The timer was a link to someone else&rsquo;s website that opened in a popup window.</p>
            <p>But a phone is where you actually need a focus tool. Not at your desk with three monitors &mdash; you&rsquo;re already working there. It&rsquo;s the in-between moments. Waiting for an appointment. Sitting on the couch after dinner. Ten minutes before you have to leave. That&rsquo;s when you need something to say: here, do this, for this long. Go.</p>
            <p>So I rebuilt HatRack from scratch as a mobile-friendly single-page app and put it at m.hatrackapp.com. Mithril.js on the frontend, Node and Express on the backend, deployed to Heroku. The whole thing fits on a phone screen.</p>
            <p><img src="/assets/m-hatrackapp-2016.jpg" alt="HatRack mobile app at m.hatrackapp.com, 2016" style="max-width:100%;border-radius:8px;margin:1rem 0" /></p>
            <p>The core idea didn&rsquo;t change &mdash; add your hats, start a focus session, wear one hat at a time. But the experience is completely different. Tap &ldquo;Focus Session&rdquo; and the app picks a random hat from your list and rolls a random number of minutes between 1 and 25. A countdown timer starts right on the screen, big enough to see from across the room. When it hits zero, you earn points and the app asks if you want to wear the same hat again or move on.</p>
            <p>No more dragging tokens. No more popup windows. No more switching tabs. You tap one button and you&rsquo;re working.</p>
            <p>The old version tried to do too much &mdash; daily, weekly, and monthly tiers, micro goals, draggable sliders, even a physical product you could order. The mobile version does one thing: pick a hat, start a timer, do the work. Turns out that&rsquo;s the whole app. Everything else was decoration.</p>
            <p>Your phone is already in your pocket. Now the hatrack is too.</p>
          </div>
        </article>
      </div>`),
    '/blog/a-farmer-of-songs': shell(publicNav, `
      <div class="blog-page">
        <a href="/blog" class="back-link">&larr; Back to Blog</a>
        <article class="blog-article">
          <h2>A Farmer of Songs</h2>
          <p class="blog-subtitle">Why writing more songs is the best way to write better ones</p>
          <p class="blog-date">November 1, 2015</p>
          <div class="blog-body">
            <p>Gordy Quist and I just published a book called <a href="https://www.amazon.com/Songfarmer-Writing-More-Better-Songs/dp/0990420205/" target="_blank" rel="noopener noreferrer">Songfarmer: Writing More and Better Songs</a>. It started as notes from a songwriting workshop we hosted in 2014, and it became a short book about the habits and processes that keep a songwriter moving forward.</p>
            <p>The core idea is this: a farmer doesn&rsquo;t walk outside one day and expect crops to burst from the ground. A farmer prepares the soil, plants seeds, tends them daily, and waits. A songwriter works the same way. You collect seeds &mdash; ideas for songs &mdash; and you improve your soil &mdash; the skills, knowledge, and memories in your brain &mdash; through daily habits. Then you grow songs from those seeds in composing sessions, watering them with a stream-of-consciousness writing mode we call FLOW, and pruning them with an evaluative mode we call EDIT.</p>
            <p>The important thing is to keep FLOW and EDIT separate. When you try to create and critique at the same time, the result is often &ldquo;getting stuck&rdquo; or writer&rsquo;s block. You can&rsquo;t feel free to make unexpected connections when the judging, critical side of your mind is watching with scrutiny. One of the biggest skills a songwriter can develop is a conscious separation of those two modes.</p>
            <p>But before you even sit down to compose, there are four habits that feed the process:</p>
            <p>I. Writing &mdash; noting ideas as they come, journaling, freewriting, singing voice memos</p>
            <p>II. Listening &mdash; paying real attention to songs, new and familiar</p>
            <p>III. Performing &mdash; sitting down with your instrument, learning a new chord or tuning, playing something you know</p>
            <p>IV. Reading &mdash; fiction, poetry, theater, spiritual texts, or just listening closely to how people talk</p>
            <p>Listening and reading are inputs. Writing and performing are outputs. All four enrich the soil.</p>
            <p>We borrowed Stephen Guise&rsquo;s &ldquo;stupid small&rdquo; idea from his book Mini Habits and set daily targets so low they&rsquo;re almost embarrassing: free write 50 words, listen to 1 song, play 1 chord on your instrument, read 2 pages of fiction or poetry. That&rsquo;s it. Every day, at varying times, before going to sleep.</p>
            <p>You might say that&rsquo;s not enough to make you a songwriter. Maybe. But remember that these four components happen every day, 365 days a year, and that the Grand Canyon was formed by many small drops of water over time. Some days you do far more than the minimum &mdash; you write 500 words, listen to 13 songs, play 50 chords, read 100 pages. The mini habit just gets you started. Starting is the hard part.</p>
            <p>There&rsquo;s a concept in the book we call the Rule of Nine, from John Vorhaus&rsquo;s <a href="https://www.amazon.com/Comic-Toolbox-Funny-Even-Youre/dp/1879505215" target="_blank" rel="noopener noreferrer">The Comic Toolbox</a>: for every ten ideas you produce, one will be very good. That means nine won&rsquo;t be. The Rule of Nine gives you permission to keep going when what you just made isn&rsquo;t amazing, because it turns out you have to make songs regularly and relentlessly to get the good stuff. One of our favorite mantras comes from University of Texas baseball coach Augie Garrido: &ldquo;Do your best, fail, and do your best again.&rdquo;</p>
            <p>Deciding to write songs is an act of courage. You are deciding to devote a portion of your time, attention, and problem-solving power to a recurring process of creation. You are deciding not to only consume but to produce. Your life has never been lived before. You are an original. Only you can write the songs that emerge from your hours, days, weeks, and years.</p>
            <p>That&rsquo;s what Songfarmer is about. And it&rsquo;s why I built <a href="https://www.hatrack.it/">HatRack</a> &mdash; to put those four habits on a rack and cycle through them daily without the friction of deciding which one to do next. The book gives you the philosophy. The hatrack gives you the push.</p>
          </div>
        </article>
      </div>`),
    '/sms-terms': shell(publicNav, `
      <div class="about-page">
        <h2>SMS Reminders</h2>
        <h3 style="margin-top:24px;font-size:0.95rem">How It Works</h3>
        <p>HatRack offers optional SMS reminders to help you stay on track with your focus sessions. When enabled, you'll receive a text message at a time based on when you typically use HatRack, nudging you to start a session.</p>
        <h3 style="margin-top:24px;font-size:0.95rem">Consent &amp; Opt-In Process</h3>
        <p>SMS reminders are entirely opt-in. No messages are ever sent without the user's explicit consent. The opt-in form is located within authenticated user account settings at hatrack.it/settings. To enable reminders, users must:</p>
        <ol style="font-size:0.9rem;line-height:1.8;padding-left:1.25rem">
          <li>Log in to their HatRack account</li>
          <li>Navigate to Settings</li>
          <li>Enter their phone number</li>
          <li>Select message frequency (daily, weekly, or monthly)</li>
          <li>Check an explicit consent checkbox (not pre-selected)</li>
          <li>Tap the &ldquo;Enable&rdquo; button to activate reminders</li>
        </ol>
        <h3 style="margin-top:24px;font-size:0.95rem">Opt-In Form</h3>
        <p style="font-size:0.85rem;color:#666;margin-bottom:8px">This is the consent form users see in their account settings:</p>
        <div style="border:1px solid #ddd;border-radius:8px;padding:16px;background:#fafafa;max-width:400px">
          <p style="font-weight:600;font-size:0.95rem;margin:0 0 4px"><strong>SMS Reminders</strong></p>
          <p style="color:#666;font-size:0.85rem;margin:0 0 12px">Get a text message reminder to start a focus session, timed to when you usually use HatRack.</p>
          <div style="margin-bottom:10px"><input type="tel" placeholder="Phone number" disabled style="width:100%;padding:8px;border:1px solid #ccc;border-radius:4px;font-size:0.85rem;background:#fff;box-sizing:border-box" /><p style="font-size:0.7rem;color:#999;margin:4px 0 0">US numbers only.</p></div>
          <div style="margin-bottom:10px"><p style="font-size:0.8rem;color:#666;margin:0 0 4px">How often?</p><div style="display:flex;border:1px solid #ccc;border-radius:6px;overflow:hidden"><span style="flex:1;text-align:center;padding:6px 0;font-size:0.75rem;background:#337ab7;color:#fff;font-weight:600">Daily</span><span style="flex:1;text-align:center;padding:6px 0;font-size:0.75rem;border-left:1px solid #ccc;color:#666">Weekly</span><span style="flex:1;text-align:center;padding:6px 0;font-size:0.75rem;border-left:1px solid #ccc;color:#666">Monthly</span></div></div>
          <div style="display:flex;align-items:flex-start;gap:8px;margin:12px 0"><input type="checkbox" disabled style="margin-top:2px" /><span style="font-size:0.7rem;color:#666;line-height:1.4">I agree to receive automated text messages from HatRack at the frequency selected above. Up to 1 msg/day. Msg &amp; data rates may apply. Reply HELP for help, STOP to cancel. <span style="color:#337ab7">SMS Terms</span></span></div>
          <div style="display:flex;gap:8px"><span style="display:inline-block;padding:6px 16px;background:#ccc;color:#fff;border-radius:4px;font-size:0.85rem">Enable</span><span style="display:inline-block;padding:6px 16px;background:#eee;color:#666;border-radius:4px;font-size:0.85rem">Cancel</span></div>
        </div>
        <p style="font-size:0.8rem;color:#666;margin-top:8px">The &ldquo;Enable&rdquo; button is disabled until the user checks the consent checkbox. The checkbox is never pre-selected. Phone numbers are never pre-populated or imported &mdash; users must manually enter their own number.</p>
        <h3 style="margin-top:24px;font-size:0.95rem">Confirmation Message</h3>
        <p>After opting in, users immediately receive a confirmation text:</p>
        <p style="padding:12px 16px;background:#f5f5f5;border-radius:6px;font-size:0.9rem">&ldquo;HatRack: Daily reminders enabled! Up to 1 msg/day. Reply HELP for help, STOP to cancel. Msg &amp; data rates may apply.&rdquo;</p>
        <h3 style="margin-top:24px;font-size:0.95rem">Message Frequency</h3>
        <p>Users control how often they receive messages. Options are daily, weekly, or monthly. No more than 1 message per day is sent.</p>
        <h3 style="margin-top:24px;font-size:0.95rem">Sample Message</h3>
        <p style="padding:12px 16px;background:#f5f5f5;border-radius:6px;font-size:0.9rem">&ldquo;Your hats are waiting. Tap to start &mdash; hatrack.it&rdquo;</p>
        <h3 style="margin-top:24px;font-size:0.95rem">Opt-Out</h3>
        <p>Users can stop receiving messages at any time by:</p>
        <ul style="font-size:0.9rem;line-height:1.8;padding-left:1.25rem">
          <li>Replying <strong>STOP</strong> to any HatRack text message</li>
          <li>Disabling reminders in their account settings</li>
        </ul>
        <p>Opting out takes effect immediately. No further messages are sent after opt-out.</p>
        <h3 style="margin-top:24px;font-size:0.95rem">Help</h3>
        <p>Users can reply <strong>HELP</strong> to any HatRack text message to receive:</p>
        <p style="padding:12px 16px;background:#f5f5f5;border-radius:6px;font-size:0.9rem">&ldquo;HatRack SMS Reminders from HatRack, LLC (hatrack.it). Up to 1 msg/day. Reply STOP to cancel, HELP for help. Msg &amp; data rates may apply. info@hatrack.it&rdquo;</p>
        <h3 style="margin-top:24px;font-size:0.95rem">Cost</h3>
        <p>HatRack does not charge for SMS reminders. Message and data rates from your carrier may apply.</p>
        <h3 style="margin-top:24px;font-size:0.95rem">Privacy</h3>
        <p>Phone numbers are stored securely and used only for sending HatRack reminders. We do not share, sell, or rent phone numbers to third parties. Messages are sent via Twilio. Phone numbers are deleted immediately when a user disables reminders.</p>
        <h3 style="margin-top:24px;font-size:0.95rem">Contact</h3>
        <p>Questions about SMS reminders? Email <a href="mailto:info@hatrack.it">info@hatrack.it</a>.</p>
        <p class="about-footer" style="margin-top:32px">&copy; 2015&ndash;2026 HatRack, LLC. Austin, Texas.</p>
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
