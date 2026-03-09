export interface BlogPost {
  slug: string
  title: string
  subtitle: string
  date: string
  body: string
}

export const blogPosts: BlogPost[] = [
  {
    slug: 'building-habits-for-creative-work',
    title: 'Building Habits for Creative Work',
    subtitle: 'Stop Choosing, Start Doing',
    date: '2026-03-08',
    body: `<p>Most of us wear a lot of hats. Parent, worker, friend, musician &mdash; we play a dozen roles before lunch. The problem isn&rsquo;t the number of hats. It&rsquo;s that the important ones, the creative ones, keep ending up at the bottom of the stack.</p>

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

<p>Sometimes the elephant just needs someone to point at the path.</p>`,
  },
]

export function getPostBySlug(slug: string): BlogPost | undefined {
  return blogPosts.find((p) => p.slug === slug)
}
