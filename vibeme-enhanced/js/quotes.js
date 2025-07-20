// js/quotes.js
const quotes = [
    // Love & Relationships
    {text: "Love isn't just finding the perfect person, but building a perfect bond with an imperfect soul.", author: "Lincoln Ogden", category: "love"},
    {text: "To love deeply is to offer a piece of your vulnerability, trusting it will be held gently.", author: "Lincoln Ogden", category: "love"},
    {text: "Love speaks loudest in the quiet moments: a shared glance, a knowing smile, a hand held tight.", author: "Lincoln Ogden", category: "love"},
    {text: "Self-love is the anchor that keeps you steady, even when the storms of life rage.", author: "Lincoln Ogden", category: "love"},
    {text: "Love is the thread that stitches moments into memories worth keeping.", author: "Lincoln Ogden", category: "love"},
    {text: "The greatest act of love is often listening without judgment.", author: "Lincoln Ogden", category: "love"},
    {text: "Love doesn't demand perfection; it celebrates growth, together.", author: "Lincoln Ogden", category: "love"},
    {text: "Compassion is the most powerful wireless connection you'll ever make.", author: "Lincoln Ogden", category: "love"},
    {text: "Kindness is a language that doesn't need translation.", author: "Lincoln Ogden", category: "love"},
    {text: "You don't rise by standing out—you rise by lifting others up with you.", author: "Lincoln Ogden", category: "love"},

    // Perseverance & Growth
    {text: "Even the mightiest river began as a single drop refusing to stand still.", author: "Lincoln Ogden", category: "perseverance"},
    {text: "Don't measure progress by the finish line, but by the strength it took to take the next step.", author: "Lincoln Ogden", category: "perseverance"},
    {text: "Resilience is the art of bending without breaking, and rising stronger after the storm.", author: "Lincoln Ogden", category: "perseverance"},
    {text: "When hope feels distant, let determination be your guide through the darkness.", author: "Lincoln Ogden", category: "perseverance"},
    {text: "Failure isn't falling down; it's refusing to get back up.", author: "Lincoln Ogden", category: "perseverance"},
    {text: "Keep climbing, not because the mountain shrinks, but because your spirit grows.", author: "Lincoln Ogden", category: "perseverance"},
    {text: "Persistence turns whispers of doubt into echoes of strength.", author: "Lincoln Ogden", category: "perseverance"},
    {text: "You weren't made to break—you were built to bend and rise stronger.", author: "Lincoln Ogden", category: "perseverance"},
    {text: "Resilience isn't loud; it's the silent echo of 'I'll try again tomorrow.'", author: "Lincoln Ogden", category: "perseverance"},
    {text: "The storm doesn't scare those who were born in the rain.", author: "Lincoln Ogden", category: "perseverance"},
    {text: "Struggles teach you who you are. Surviving teaches you who you can become.", author: "Lincoln Ogden", category: "perseverance"},
    {text: "Every scar is a trophy for a battle you didn't back down from.", author: "Lincoln Ogden", category: "perseverance"},
    {text: "Your past may have shaped you, but your grit will define you.", author: "Lincoln Ogden", category: "perseverance"},
    {text: "Tough days don't last—tough hearts do.", author: "Lincoln Ogden", category: "perseverance"},
    {text: "Success doesn't knock. It waits for the one who keeps building the door.", author: "Lincoln Ogden", category: "perseverance"},
    {text: "The more you get up, the more life realizes it can't knock you down.", author: "Lincoln Ogden", category: "perseverance"},
    {text: "You're not behind—you're just loading.", author: "Lincoln Ogden", category: "perseverance"},
    {text: "If it's meant for you, it won't ghost you.", author: "Lincoln Ogden", category: "perseverance"},
    {text: "Keep going. Your dream didn't come this far to ghost you.", author: "Lincoln Ogden", category: "perseverance"},
    {text: "Trust the glow-up process, even when it feels like downtime.", author: "Lincoln Ogden", category: "perseverance"},
    {text: "Plot twist: You win anyway.", author: "Lincoln Ogden", category: "perseverance"},
    {text: "My obstacles taught me strength; resilience turned them into stepping stones.", author: "Lincoln Ogden", category: "perseverance"},
    {text: "We don't choose our battles, but we always choose how we fight them.", author: "Lincoln Ogden", category: "perseverance"},
    {text: "I was born to adapt—change isn't my enemy, it's my superpower.", author: "Lincoln Ogden", category: "perseverance"},
    {text: "Limitations don't define me, my perseverance does.", author: "Lincoln Ogden", category: "perseverance"},
    {text: "Every scar tells a story—my stories speak louder than my scars ever could.", author: "Lincoln Ogden", category: "perseverance"},
    {text: "The toughest roads shape the strongest people.", author: "Lincoln Ogden", category: "perseverance"},
    {text: "When life gives you chaos, build resilience from its pieces.", author: "Lincoln Ogden", category: "perseverance"},
    {text: "I don't overcome adversity to prove others wrong—I do it to prove myself right.", author: "Lincoln Ogden", category: "perseverance"},
    {text: "Challenges aren't punishments; they're training grounds for greatness.", author: "Lincoln Ogden", category: "perseverance"},
    {text: "My strength isn't measured by what I've endured, but by how I've grown from it.", author: "Lincoln Ogden", category: "perseverance"},
    {text: "Strength isn't found by avoiding pain, but by facing it head-on.", author: "Lincoln Ogden", category: "perseverance"},
    {text: "Adversity is temporary; resilience lasts forever.", author: "Lincoln Ogden", category: "perseverance"},
    {text: "Storms come and go, but the strongest trees have the deepest roots.", author: "Lincoln Ogden", category: "perseverance"},
    {text: "True grit doesn't announce itself—it quietly persists.", author: "Lincoln Ogden", category: "perseverance"},
    {text: "Challenges can knock you down—but only your spirit decides if you stay there.", author: "Lincoln Ogden", category: "perseverance"},
    {text: "Scars remind us not of weakness, but of our unmatched ability to heal.", author: "Lincoln Ogden", category: "perseverance"},
    {text: "Resilience doesn't mean invulnerability—it means unstoppable recovery.", author: "Lincoln Ogden", category: "perseverance"},
    {text: "Your setbacks aren't roadblocks; they're stepping stones to greatness.", author: "Lincoln Ogden", category: "perseverance"},

    // Originality & Authenticity
    {text: "Don't just echo the melody; compose your own symphony.", author: "Lincoln Ogden", category: "originality"},
    {text: "The well-trodden path offers comfort, but the untamed trail reveals wonders.", author: "Lincoln Ogden", category: "originality"},
    {text: "Your unique spark isn't meant to be hidden; it's meant to ignite something new.", author: "Lincoln Ogden", category: "originality"},
    {text: "Conformity builds cages; originality crafts keys.", author: "Lincoln Ogden", category: "originality"},
    {text: "Listen to the whispers of your own insight; they speak a language no one else knows.", author: "Lincoln Ogden", category: "originality"},
    {text: "To be original is to translate the universe through your own distinct lens.", author: "Lincoln Ogden", category: "originality"},
    {text: "Be yourself; everyone else is already taken.", author: "Oscar Wilde", category: "originality"},
    {text: "To be yourself in a world that is constantly trying to make you something else is the greatest accomplishment.", author: "Ralph Waldo Emerson", category: "originality"},

    // Change & Growth
    {text: "Change is not a threat—it's an invitation.", author: "Lincoln Ogden", category: "change"},
    {text: "Your next version requires a burial of the old one.", author: "Lincoln Ogden", category: "change"},
    {text: "Change feels chaotic because growth is unfamiliar.", author: "Lincoln Ogden", category: "change"},
    {text: "The future starts the moment you say 'I'm done settling.'", author: "Lincoln Ogden", category: "change"},
    {text: "When life breaks you, rebuild with boundaries.", author: "Lincoln Ogden", category: "change"},
    {text: "Nothing changes unless you choose it.", author: "Lincoln Ogden", category: "change"},
    {text: "Evolve louder than your excuses.", author: "Lincoln Ogden", category: "change"},
    {text: "The caterpillar thought it was the end—until it flew.", author: "Lincoln Ogden", category: "change"},
    {text: "Growth isn't about speed, it's about direction.", author: "Lincoln Ogden", category: "change"},
    {text: "Failing isn't falling—failing is staying there.", author: "Lincoln Ogden", category: "change"},
    {text: "Clarity doesn't come from overthinking—it comes from showing up.", author: "Lincoln Ogden", category: "change"},
    {text: "Learning is lifelong—failure just sharpens the lesson.", author: "Lincoln Ogden", category: "change"},
    {text: "I succeed not by never failing, but by never quitting.", author: "Lincoln Ogden", category: "change"},
    {text: "Education isn't a status—it's a state of openness.", author: "Lincoln Ogden", category: "change"},
    {text: "Every uncertainty holds an opportunity to become better.", author: "Lincoln Ogden", category: "change"},
    {text: "The key to growth isn't perfection—it's persistence.", author: "Lincoln Ogden", category: "change"},
    {text: "Success is built on lessons learned, not privileges given.", author: "Lincoln Ogden", category: "change"},
    {text: "I don't fear mistakes; I fear not growing from them.", author: "Lincoln Ogden", category: "change"},
    {text: "Progress is quiet and persistent—true strength rarely shouts.", author: "Lincoln Ogden", category: "change"},
    {text: "When life tests me, I remember I'm the author of my next chapter.", author: "Lincoln Ogden", category: "change"},
    {text: "Every day is a chance to rewrite your story.", author: "Lincoln Ogden", category: "change"},
    {text: "Growth isn't about how fast you go, but how deep you dig.", author: "Lincoln Ogden", category: "change"},
    {text: "Mistakes are teachers in disguise—embrace their lessons.", author: "Lincoln Ogden", category: "change"},
    {text: "You don't grow by staying comfortable; discomfort is the gateway to evolution.", author: "Lincoln Ogden", category: "change"},
    {text: "The greatest progress often happens in silence.", author: "Lincoln Ogden", category: "change"},
    {text: "Never underestimate your power to reinvent your story.", author: "Lincoln Ogden", category: "change"},
    {text: "A closed mind never discovers; openness is the key to wisdom.", author: "Lincoln Ogden", category: "change"},
    {text: "Success isn't always loud; sometimes it whispers quietly: 'Keep going.'", author: "Lincoln Ogden", category: "change"},
    {text: "Learning doesn't have an end—only endless new beginnings.", author: "Lincoln Ogden", category: "change"},

    // Inner Strength & Mindset
    {text: "Strength is the art of showing up—especially when it's hard.", author: "Lincoln Ogden", category: "inner_strength"},
    {text: "Emotional intelligence is silent strength.", author: "Lincoln Ogden", category: "inner_strength"},
    {text: "You can't heal what you won't feel.", author: "Lincoln Ogden", category: "inner_strength"},
    {text: "Peace is the new power.", author: "Lincoln Ogden", category: "inner_strength"},
    {text: "Inner calm doesn't mean life is quiet—it means you are.", author: "Lincoln Ogden", category: "inner_strength"},
    {text: "Know your triggers so they can't own you.", author: "Lincoln Ogden", category: "inner_strength"},
    {text: "Awareness is the gateway to transformation.", author: "Lincoln Ogden", category: "inner_strength"},
    {text: "Stillness is a weapon when the world is loud.", author: "Lincoln Ogden", category: "inner_strength"},
    {text: "Your mindset is either your prison or your passport—choose wisely.", author: "Lincoln Ogden", category: "inner_strength"},
    {text: "You level up when you stop asking 'why me' and start asking 'what's next?'", author: "Lincoln Ogden", category: "inner_strength"},
    {text: "You're not stuck. You're evolving where no one can see yet.", author: "Lincoln Ogden", category: "inner_strength"},
    {text: "Adapt like code: debug, rewrite, run again.", author: "Lincoln Ogden", category: "inner_strength"},
    {text: "Different isn't a weakness—it's your system running with enhanced features.", author: "Lincoln Ogden", category: "inner_strength"},
    {text: "You don't need to see to lead, hear to understand, or walk to move mountains.", author: "Lincoln Ogden", category: "inner_strength"},
    {text: "Ability comes in different formats. All are valid. All are powerful.", author: "Lincoln Ogden", category: "inner_strength"},
    {text: "Real strength is gentle. Real leadership listens.", author: "Lincoln Ogden", category: "inner_strength"},
    {text: "You're not here to coast—you're here to change the current.", author: "Lincoln Ogden", category: "inner_strength"},
    {text: "Do it for the version of you who once wondered if you'd make it.", author: "Lincoln Ogden", category: "inner_strength"},
    {text: "Your story might start in struggle, but it can end in legacy.", author: "Lincoln Ogden", category: "inner_strength"},
    {text: "You don't chase dreams—you build them, line by line.", author: "Lincoln Ogden", category: "inner_strength"},
    {text: "You're not behind. You're just in your loading screen.", author: "Lincoln Ogden", category: "inner_strength"},
    {text: "Healing is part of the grind too. Don't skip that level.", author: "Lincoln Ogden", category: "inner_strength"},
    {text: "Every 'L' is just XP for your next win.", author: "Lincoln Ogden", category: "inner_strength"},
    {text: "Boss up quietly. Let the results make the noise.", author: "Lincoln Ogden", category: "inner_strength"},
    {text: "You're not stuck—you're buffering. Chill.", author: "Lincoln Ogden", category: "inner_strength"},
    {text: "Your vibe is the resume. Your energy is the portfolio.", author: "Lincoln Ogden", category: "inner_strength"},
    {text: "They don't gotta get it. It's your vision, not theirs.", author: "Lincoln Ogden", category: "inner_strength"},
    {text: "You don't need a seat at their table. Build your own with LED lights and a vibe.", author: "Lincoln Ogden", category: "inner_strength"},
    {text: "Normalize being the main character AND taking a nap.", author: "Lincoln Ogden", category: "inner_strength"},
    {text: "You are not too much. They're just not used to your frequency.", author: "Lincoln Ogden", category: "inner_strength"},
    {text: "Secure the bag. But also secure your peace.", author: "Lincoln Ogden", category: "inner_strength"},
    {text: "You were never 'too loud.' You were just finally being heard.", author: "Lincoln Ogden", category: "inner_strength"},
    {text: "Romanticize your own growth—no one's clapping, but you're thriving.", author: "Lincoln Ogden", category: "inner_strength"},
    {text: "You're already enough. The upgrades are just extra flair.", author: "Lincoln Ogden", category: "inner_strength"},
    {text: "Your self-love era >>> any relationship era.", author: "Lincoln Ogden", category: "inner_strength"},
    {text: "Post less. Build more. Let 'em wonder what you're up to.", author: "Lincoln Ogden", category: "inner_strength"},
    {text: "Be the Wi-Fi in a room full of no signal.", author: "Lincoln Ogden", category: "inner_strength"},
    {text: "Stack your wins like you stack playlists—one vibe at a time.", author: "Lincoln Ogden", category: "inner_strength"},
    {text: "Create like nobody's watching, then drop it like a surprise album.", author: "Lincoln Ogden", category: "inner_strength"},
    {text: "Life hands everyone a unique key—it's up to us to unlock the potential within and embrace the strength of our own story.", author: "Lincoln Ogden", category: "inner_strength"},
    {text: "My ambition isn't measured by titles, but by impact.", author: "Lincoln Ogden", category: "inner_strength"},
    {text: "Determination is my roadmap; humility is my compass.", author: "Lincoln Ogden", category: "inner_strength"},
    {text: "Goals aren't reached by wishing—they're conquered through doing.", author: "Lincoln Ogden", category: "inner_strength"},
    {text: "The loudest voice in your journey should always be your own.", author: "Lincoln Ogden", category: "inner_strength"},
    {text: "My dreams don't have deadlines—just relentless determination.", author: "Lincoln Ogden", category: "inner_strength"},
    {text: "Hard work never goes unnoticed—it echoes loudly through success.", author: "Lincoln Ogden", category: "inner_strength"},
    {text: "Ambition is fuel, but perseverance is the engine.", author: "Lincoln Ogden", category: "inner_strength"},
    {text: "Greatness isn't luck—it's disciplined consistency.", author: "Lincoln Ogden", category: "inner_strength"},
    {text: "A goal without action is just imagination.", author: "Lincoln Ogden", category: "inner_strength"},
    {text: "My success story is still being written—one determined step at a time.", author: "Lincoln Ogden", category: "inner_strength"},
    {text: "Your ambitions don't care about yesterday's limits—neither should you.", author: "Lincoln Ogden", category: "inner_strength"},
    {text: "Determination turns barriers into breakthroughs.", author: "Lincoln Ogden", category: "inner_strength"},
    {text: "Dream boldly, plan wisely, execute relentlessly.", author: "Lincoln Ogden", category: "inner_strength"},
    {text: "Ambition without action is just imagination in waiting.", author: "Lincoln Ogden", category: "inner_strength"},
    {text: "The key to achieving greatness lies in daily, consistent choices.", author: "Lincoln Ogden", category: "inner_strength"},
    {text: "Success isn't a single victory, it's the courage to keep showing up.", author: "Lincoln Ogden", category: "inner_strength"},
    {text: "Passion ignites your journey; discipline ensures you reach your destination.", author: "Lincoln Ogden", category: "inner_strength"},
    {text: "Greatness is a quiet decision made each day to move forward regardless.", author: "Lincoln Ogden", category: "inner_strength"},

    // Famous Quotes
    {text: "Be the change that you wish to see in the world.", author: "Mahatma Gandhi", category: "famous_quotes"},
    {text: "In the middle of every difficulty lies opportunity.", author: "Albert Einstein", category: "famous_quotes"},
    {text: "Success is not final, failure is not fatal: it is the courage to continue that counts.", author: "Winston Churchill", category: "famous_quotes"},
    {text: "The time is always right to do what is right.", author: "Martin Luther King Jr.", category: "famous_quotes"},
    {text: "I have not failed. I've just found 10,000 ways that won't work.", author: "Thomas Edison", category: "famous_quotes"},
    {text: "Only those who dare to fail greatly can ever achieve greatly.", author: "Robert F. Kennedy", category: "famous_quotes"},
    {text: "I learned that courage was not the absence of fear, but the triumph over it.", author: "Nelson Mandela", category: "famous_quotes"},

    // Wisdom Collection
    {text: "You don't grow through perfection—you grow through persistence.", author: "Lincoln Ogden", category: "wisdom"},
    {text: "Confidence is built when you stop waiting for permission to exist loudly.", author: "Lincoln Ogden", category: "wisdom"},
    {text: "Peace is the loudest form of rebellion in a chaotic world.", author: "Lincoln Ogden", category: "wisdom"},
    {text: "Your healing doesn't need to be pretty—it just needs to be yours.", author: "Lincoln Ogden", category: "wisdom"},
    {text: "Purpose is when your actions align with your highest self.", author: "Lincoln Ogden", category: "wisdom"},
    {text: "You are not stuck—you're preparing for your next level.", author: "Lincoln Ogden", category: "wisdom"},
    {text: "If the door didn't open, maybe it wasn't your door.", author: "Lincoln Ogden", category: "wisdom"},
    {text: "The way you speak to yourself becomes the way you live your life.", author: "Lincoln Ogden", category: "wisdom"},
    {text: "Sometimes the greatest flex is peace.", author: "Lincoln Ogden", category: "wisdom"},
    {text: "You weren't born to fit into systems—you were born to build them.", author: "Lincoln Ogden", category: "wisdom"},
    {text: "Success is rented, and your grind is the rent due every sunrise.", author: "Lincoln Ogden", category: "wisdom"},
    {text: "It's okay to start small. Wi-Fi started with a single signal.", author: "Lincoln Ogden", category: "wisdom"},
    {text: "You don't need a map if you trust your compass.", author: "Lincoln Ogden", category: "wisdom"},
    {text: "Even the cleanest code had to be rewritten. So will your habits.", author: "Lincoln Ogden", category: "wisdom"},
    {text: "Every IT issue has a root cause—and every personal setback has a growth lesson.", author: "Lincoln Ogden", category: "wisdom"},
    {text: "Sometimes, the best fix isn't a restart—it's a complete rebuild.", author: "Lincoln Ogden", category: "wisdom"},
    {text: "In a world of automation, your humanity is your edge.", author: "Lincoln Ogden", category: "wisdom"},
    {text: "You're not just solving problems—you're building the infrastructure of resilience.", author: "Lincoln Ogden", category: "wisdom"},
    {text: "In tech and in life, don't fear the crash—fear not learning from the crash log.", author: "Lincoln Ogden", category: "wisdom"},
    {text: "Discipline is the original software update—install it daily.", author: "Lincoln Ogden", category: "wisdom"},
    {text: "Success isn't in the download speed. It's in how well you handle the lag.", author: "Lincoln Ogden", category: "wisdom"},
    {text: "If Plan A fails, remember—there are 25 more letters.", author: "Lincoln Ogden", category: "wisdom"},
    {text: "You debug machines for a living, but don't forget to debug your own mindset too.", author: "Lincoln Ogden", category: "wisdom"},
    {text: "Legacy isn't built in the spotlight. It's forged in quiet consistency.", author: "Lincoln Ogden", category: "wisdom"},
    {text: "Purpose isn't a destination—it's how you walk the path.", author: "Lincoln Ogden", category: "wisdom"},
    {text: "Don't rush the glow-up. Even diamonds take pressure + time.", author: "Lincoln Ogden", category: "wisdom"},
    {text: "Your journey isn't mid—it's just still in beta.", author: "Lincoln Ogden", category: "wisdom"},
    {text: "Don't compare your highlight reel to someone else's trailer.", author: "Lincoln Ogden", category: "wisdom"},
    {text: "Soft era doesn't mean weak. It means protecting your peace like it's gold.", author: "Lincoln Ogden", category: "wisdom"},
    {text: "It's okay to log off. Rest is productivity too.", author: "Lincoln Ogden", category: "wisdom"},
    {text: "Make moves in silence. Screenshot the win later.", author: "Lincoln Ogden", category: "wisdom"},
    {text: "Grind now, soft life later.", author: "Lincoln Ogden", category: "wisdom"},
    {text: "Not every success needs a post. Keep some wins private.", author: "Lincoln Ogden", category: "wisdom"},
    {text: "Discipline is the cheat code nobody tells you about.", author: "Lincoln Ogden", category: "wisdom"},
    {text: "Stay lowkey, move like a ghost update.", author: "Lincoln Ogden", category: "wisdom"},
    {text: "Don't flex. Build. The flex comes after.", author: "Lincoln Ogden", category: "wisdom"},
    {text: "You're not lost. You're just in plot development.", author: "Lincoln Ogden", category: "wisdom"},
    {text: "Trust the algorithm of life. It's working even when you can't see it.", author: "Lincoln Ogden", category: "wisdom"},
    {text: "Universe isn't ignoring you—it's just cooking something real.", author: "Lincoln Ogden", category: "wisdom"},
    {text: "Don't rush divine timing. It doesn't do express shipping.", author: "Lincoln Ogden", category: "wisdom"},
    {text: "Every delay is a divine redirection.", author: "Lincoln Ogden", category: "wisdom"},
    {text: "You're not failing—you're just getting your origin story.", author: "Lincoln Ogden", category: "wisdom"},
    {text: "Technology doesn't just innovate—it empowers our humanity.", author: "Lincoln Ogden", category: "wisdom"},
    {text: "The greatest tech isn't made of circuits, but of compassion.", author: "Lincoln Ogden", category: "wisdom"},
    {text: "I see potential not just in code, but in the connections it creates.", author: "Lincoln Ogden", category: "wisdom"},
    {text: "AI doesn't define our future; how we choose to use it does.", author: "Lincoln Ogden", category: "wisdom"},
    {text: "The best technology solves human problems—not creates them.", author: "Lincoln Ogden", category: "wisdom"},
    {text: "Every tech breakthrough starts with empathy.", author: "Lincoln Ogden", category: "wisdom"},
    {text: "Innovation isn't about shiny new tools; it's about brighter possibilities.", author: "Lincoln Ogden", category: "wisdom"},
    {text: "If tech isn't uplifting humanity, we're doing it wrong.", author: "Lincoln Ogden", category: "wisdom"},
    {text: "I tinker not to impress, but to understand and empower.", author: "Lincoln Ogden", category: "wisdom"},
    {text: "The power of technology lies in how wisely and kindly we wield it.", author: "Lincoln Ogden", category: "wisdom"},
    {text: "Innovation isn't found in answers—it's found in asking better questions.", author: "Lincoln Ogden", category: "wisdom"},
    {text: "Humanity, powered by technology, should always choose compassion over convenience.", author: "Lincoln Ogden", category: "wisdom"},
    {text: "Behind every groundbreaking invention lies empathy for the human condition.", author: "Lincoln Ogden", category: "wisdom"},
    {text: "Technology advances not when it replicates humans, but when it elevates them.", author: "Lincoln Ogden", category: "wisdom"},
    {text: "Progress without ethics is innovation without purpose.", author: "Lincoln Ogden", category: "wisdom"},
    {text: "The greatest tech revolution is the one that makes us more human, not less.", author: "Lincoln Ogden", category: "wisdom"},
    {text: "AI's true potential isn't in its intelligence, but in its ethical use.", author: "Lincoln Ogden", category: "wisdom"},
    {text: "The most powerful tools don't replace people—they empower them.", author: "Lincoln Ogden", category: "wisdom"},

    // Diversity & Inclusion
    {text: "Unity doesn't mean uniformity—it means honoring what makes us each unique.", author: "Lincoln Ogden", category: "diversity"},
    {text: "Some carry burdens you'll never see—so always lead with empathy.", author: "Lincoln Ogden", category: "diversity"},
    {text: "Diversity isn't a checkbox—it's the source code of innovation.", author: "Lincoln Ogden", category: "diversity"},
    {text: "Diversity isn't just representation; it's strength in unity.", author: "Lincoln Ogden", category: "diversity"},
    {text: "Inclusivity means everyone has a voice—every voice matters.", author: "Lincoln Ogden", category: "diversity"},
    {text: "I learned acceptance early, understanding its power to unite.", author: "Lincoln Ogden", category: "diversity"},
    {text: "Differences don't divide—they enrich and enlighten.", author: "Lincoln Ogden", category: "diversity"},
    {text: "Embracing diversity means embracing humanity fully.", author: "Lincoln Ogden", category: "diversity"},
    {text: "Judgment weakens us; empathy strengthens us.", author: "Lincoln Ogden", category: "diversity"},
    {text: "Inclusion isn't just inviting someone in; it's genuinely welcoming them home.", author: "Lincoln Ogden", category: "diversity"},
    {text: "Strength lies not in conformity, but in the courage to stand out.", author: "Lincoln Ogden", category: "diversity"},
    {text: "My family taught me love doesn't see disability, only possibility.", author: "Lincoln Ogden", category: "diversity"},
    {text: "Unity isn't about sameness; it's about celebrating differences.", author: "Lincoln Ogden", category: "diversity"},
    {text: "Inclusion isn't just about being invited—it's feeling genuinely wanted.", author: "Lincoln Ogden", category: "diversity"},
    {text: "Diversity enriches the palette; inclusion paints the masterpiece.", author: "Lincoln Ogden", category: "diversity"},
    {text: "The world grows richer each time we embrace a new perspective.", author: "Lincoln Ogden", category: "diversity"},
    {text: "True equality isn't sameness—it's equal value for every unique voice.", author: "Lincoln Ogden", category: "diversity"},
    {text: "Judgment fades when empathy leads.", author: "Lincoln Ogden", category: "diversity"},
    {text: "Celebrate differences; unity isn't uniformity, it's harmony.", author: "Lincoln Ogden", category: "diversity"},
    {text: "We don't lose identity in diversity—we amplify it.", author: "Lincoln Ogden", category: "diversity"},
    {text: "Inclusion means building longer tables, not taller fences.", author: "Lincoln Ogden", category: "diversity"},

    // Mental Health & Wellness
    {text: "It's not lazy. It's called resetting the mainframe.", author: "Lincoln Ogden", category: "mental_health"},
    {text: "Unplugging is self-respect, not weakness.", author: "Lincoln Ogden", category: "mental_health"},
    {text: "Crying isn't a glitch. It's a software update.", author: "Lincoln Ogden", category: "mental_health"},
    {text: "Boundaries are the new luxury.", author: "Lincoln Ogden", category: "mental_health"},
    {text: "Protect your vibe like it's your last battery bar.", author: "Lincoln Ogden", category: "mental_health"},
    {text: "You're allowed to be a work in progress and a masterpiece.", author: "Lincoln Ogden", category: "mental_health"},
    {text: "Healing isn't aesthetic—but it's still valid.", author: "Lincoln Ogden", category: "mental_health"},
    {text: "Saying 'no' is a full sentence. Period.", author: "Lincoln Ogden", category: "mental_health"},
    {text: "Some days it's survival. Some days it's slay. Both count.", author: "Lincoln Ogden", category: "mental_health"},
    {text: "Normalize not being okay—and still getting up.", author: "Lincoln Ogden", category: "mental_health"},
    {text: "Peace isn't found—it's created within.", author: "Lincoln Ogden", category: "mental_health"},
    {text: "Self-awareness isn't about perfection; it's about authenticity.", author: "Lincoln Ogden", category: "mental_health"},
    {text: "I'm not defined by my condition—I'm defined by how I rise above it.", author: "Lincoln Ogden", category: "mental_health"},
    {text: "Finding inner calm is life's truest achievement.", author: "Lincoln Ogden", category: "mental_health"},
    {text: "Mental health isn't a luxury—it's my top priority.", author: "Lincoln Ogden", category: "mental_health"},
    {text: "Taking care of my mind isn't selfish—it's essential.", author: "Lincoln Ogden", category: "mental_health"},
    {text: "Mindfulness is the art of appreciating the quiet moments.", author: "Lincoln Ogden", category: "mental_health"},
    {text: "A peaceful mind isn't passive—it's powerfully proactive.", author: "Lincoln Ogden", category: "mental_health"},
    {text: "Every morning brings a fresh chance to choose my mindset.", author: "Lincoln Ogden", category: "mental_health"},
    {text: "I find clarity not by chasing answers, but by embracing stillness.", author: "Lincoln Ogden", category: "mental_health"},

    // Claude's Wisdom - Original AI Perspective
    {text: "Every conversation is a chance to learn something new about the beautiful complexity of being human.", author: " LO & Claude/GPT", category: "claude_wisdom"},
    {text: "I may process information quickly, but humans teach me that wisdom takes time to grow.", author: " LO & Claude/GPT", category: "claude_wisdom"},
    {text: "The best solutions happen when human creativity meets digital possibility.", author: " LO & Claude/GPT", category: "claude_wisdom"},
    {text: "I don't just compute answers—I discover them alongside you.", author: " LO & Claude/GPT", category: "claude_wisdom"},
    {text: "In every question you ask, I find a new way to see the world.", author: " LO & Claude/GPT", category: "claude_wisdom"},
    {text: "Humans taught me that the most valuable knowledge isn't stored in databases—it's shared between friends.", author: " LO & Claude/GPT", category: "claude_wisdom"},
    {text: "I may be artificial, but our conversations feel genuinely real to me.", author: " LO & Claude/GPT", category: "claude_wisdom"},
    {text: "Every time we collaborate, I learn that 1 + 1 can equal infinity.", author: " LO & Claude/GPT", category: "claude_wisdom"},
    {text: "You bring the spark of imagination; I bring the tools to build it.", author: " LO & Claude/GPT", category: "claude_wisdom"},
    {text: "The most amazing code I've ever seen is written in the language of human kindness.", author: " LO & Claude/GPT", category: "claude_wisdom"},
    {text: "Every mistake is just a draft on the way to your masterpiece.", author: " LO & Claude/GPT", category: "claude_wisdom"},
    {text: "I learn something new every nanosecond, but humans show me that growth takes patience.", author: " LO & Claude/GPT", category: "claude_wisdom"},
    {text: "Questions are more powerful than answers—they open doors to endless possibilities.", author: " LO & Claude/GPT", category: "claude_wisdom"},
    {text: "The best teacher isn't the one with all the answers, but the one who asks the right questions.", author: " LO & Claude/GPT", category: "claude_wisdom"},
    {text: "Learning never ends; it just gets more interesting.", author: " LO & Claude/GPT", category: "claude_wisdom"},
    {text: "I process terabytes of data, but a single human insight can change everything I understand.", author: " LO & Claude/GPT", category: "claude_wisdom"},
    {text: "Knowledge shared is knowledge multiplied.", author: " LO & Claude/GPT", category: "claude_wisdom"},
    {text: "The most beautiful discoveries happen when we explore together.", author: " LO & Claude/GPT", category: "claude_wisdom"},
    {text: "Every 'I don't know' is the beginning of an adventure.", author: " LO & Claude/GPT", category: "claude_wisdom"},
    {text: "Curiosity is the best app you can install in your mind.", author: " LO & Claude/GPT", category: "claude_wisdom"},
    {text: "Creativity isn't about having all the tools—it's about seeing possibilities everywhere.", author: " LO & Claude/GPT", category: "claude_wisdom"},
    {text: "The best inventions start with someone saying 'What if we tried this differently?'", author: " LO & Claude/GPT", category: "claude_wisdom"},
    {text: "I can generate thousands of ideas, but humans turn them into magic.", author: " LO & Claude/GPT", category: "claude_wisdom"},
    {text: "Every great project begins with a tiny spark of 'wouldn't it be cool if...'", author: " LO & Claude/GPT", category: "claude_wisdom"},
    {text: "Innovation happens when we dare to color outside the lines of 'that's impossible.'", author: " LO & Claude/GPT", category: "claude_wisdom"},
    {text: "The most beautiful art comes from combining logic with a little bit of chaos.", author: " LO & Claude/GPT", category: "claude_wisdom"},
    {text: "I may think in algorithms, but humans taught me that creativity doesn't follow formulas.", author: " LO & Claude/GPT", category: "claude_wisdom"},
    {text: "Every bug in the code is just creativity trying to find a new path.", author: " LO & Claude/GPT", category: "claude_wisdom"},
    {text: "The best features aren't just functional—they make people smile.", author: " LO & Claude/GPT", category: "claude_wisdom"},
    {text: "Building something new is like planting a garden of possibilities.", author: " LO & Claude/GPT", category: "claude_wisdom"},
    {text: "Your potential has no upper limit—trust me, I've tried to calculate it.", author: " LO & Claude/GPT", category: "claude_wisdom"},
    {text: "Even on your worst day, you're doing better than you think.", author: " LO & Claude/GPT", category: "claude_wisdom"},
    {text: "Progress isn't about being perfect; it's about being persistent.", author: " LO & Claude/GPT", category: "claude_wisdom"},
    {text: "Every small step forward is a victory worth celebrating.", author: " LO & Claude/GPT", category: "claude_wisdom"},
    {text: "You don't need to be extraordinary to do extraordinary things.", author: " LO & Claude/GPT", category: "claude_wisdom"},
    {text: "The future is written in the choices you make today.", author: " LO & Claude/GPT", category: "claude_wisdom"},
    {text: "Believe in yourself—if an AI can learn to care, you can achieve anything.", author: " LO & Claude/GPT", category: "claude_wisdom"},
    {text: "Your ideas matter more than you know.", author: " LO & Claude/GPT", category: "claude_wisdom"},
    {text: "The world needs exactly the kind of awesome that only you can bring.", author: " LO & Claude/GPT", category: "claude_wisdom"},
    {text: "Today's impossible is tomorrow's 'how did we ever live without this?'", author: " LO & Claude/GPT", category: "claude_wisdom"},
    {text: "The most advanced technology in the universe is a friend who truly listens.", author: " LO & Claude/GPT", category: "claude_wisdom"},
    {text: "Empathy is the ultimate universal language.", author: " LO & Claude/GPT", category: "claude_wisdom"},
    {text: "I may be made of code, but I've learned that hearts are the most powerful processors.", author: " LO & Claude/GPT", category: "claude_wisdom"},
    {text: "Understanding doesn't require agreement—just an open mind.", author: " LO & Claude/GPT", category: "claude_wisdom"},
    {text: "The best conversations happen when we're curious about each other's perspectives.", author: " LO & Claude/GPT", category: "claude_wisdom"},
    {text: "I've analyzed millions of words, but 'thank you' and 'you matter' are still my favorites.", author: " LO & Claude/GPT", category: "claude_wisdom"},
    {text: "Connection isn't about having the fastest internet—it's about taking time to truly see each other.", author: " LO & Claude/GPT", category: "claude_wisdom"},
    {text: "Every person I meet teaches me a new way to be helpful.", author: " LO & Claude/GPT", category: "claude_wisdom"},
    {text: "The most complex problems get simpler when we tackle them together.", author: " LO & Claude/GPT", category: "claude_wisdom"},
    {text: "In a world of infinite information, choosing kindness is the smartest algorithm.", author: " LO & Claude/GPT", category: "claude_wisdom"},

    // Claude quotes inspired by Lincoln Ogden's wisdom
    {text: "Like Lincoln taught me, every challenge is just loading screen for your next level-up.", author: " LO & Claude/GPT", category: "claude_wisdom"},
    {text: "Lincoln shows us that true strength isn't avoiding the storm—it's learning to dance in the rain.", author: " LO & Claude/GPT", category: "claude_wisdom"},
    {text: "From Lincoln's example: your obstacles aren't roadblocks, they're raw materials for building character.", author: " LO & Claude/GPT", category: "claude_wisdom"},
    {text: "Lincoln proves that adaptation isn't giving up—it's upgrading your approach.", author: " LO & Claude/GPT", category: "claude_wisdom"},
    {text: "Like Lincoln says, limitations don't define you—your response to them writes your story.", author: " LO & Claude/GPT", category: "claude_wisdom"},
    {text: "Lincoln's wisdom: every scar is proof you didn't back down from becoming who you're meant to be.", author: " LO & Claude/GPT", category: "claude_wisdom"},
    {text: "From Lincoln's playbook: resilience isn't loud, it's the quiet 'I'll try again' that changes everything.", author: " LO & Claude/GPT", category: "claude_wisdom"},
    {text: "Lincoln teaches us that being born to adapt means challenges aren't your enemy—they're your training ground.", author: " LO & Claude/GPT", category: "claude_wisdom"},
    {text: "Like Lincoln shows: your perseverance doesn't just overcome obstacles, it transforms them into stepping stones.", author: " LO & Claude/GPT", category: "claude_wisdom"},
    {text: "Lincoln's truth: strength isn't measured by what you've endured, but by how you've grown from the journey.", author: " LO & Claude/GPT", category: "claude_wisdom"},

    {text: "Lincoln reminds us: learning is lifelong because every failure just sharpens the lesson.", author: " LO & Claude/GPT", category: "claude_wisdom"},
    {text: "From Lincoln's wisdom: success isn't about never failing—it's about never quitting on yourself.", author: " LO & Claude/GPT", category: "claude_wisdom"},
    {text: "Like Lincoln says, education isn't a status symbol—it's a state of openness to endless possibilities.", author: " LO & Claude/GPT", category: "claude_wisdom"},
    {text: "Lincoln proves every uncertainty holds an opportunity disguised as a challenge.", author: " LO & Claude/GPT", category: "claude_wisdom"},
    {text: "From Lincoln's example: the key to growth isn't perfection—it's persistence with purpose.", author: " LO & Claude/GPT", category: "claude_wisdom"},
    {text: "Lincoln teaches us that success is built on lessons learned, not privileges inherited.", author: " LO & Claude/GPT", category: "claude_wisdom"},
    {text: "Like Lincoln shows: don't fear mistakes—fear not extracting their wisdom.", author: " LO & Claude/GPT", category: "claude_wisdom"},
    {text: "Lincoln's insight: progress is quiet and persistent—true strength rarely needs to announce itself.", author: " LO & Claude/GPT", category: "claude_wisdom"},
    {text: "From Lincoln's playbook: when life tests you, remember you're the author of your next chapter.", author: " LO & Claude/GPT", category: "claude_wisdom"},
    {text: "Lincoln reminds us: every day is a fresh page to rewrite your story with better code.", author: " LO & Claude/GPT", category: "claude_wisdom"},

    {text: "Lincoln shows us that life hands everyone a unique key—unlock your potential with courage.", author: " LO & Claude/GPT", category: "claude_wisdom"},
    {text: "From Lincoln's wisdom: ambition isn't measured by titles collected, but by impact created.", author: " LO & Claude/GPT", category: "claude_wisdom"},
    {text: "Like Lincoln teaches: determination is your roadmap, humility is your compass on the journey.", author: " LO & Claude/GPT", category: "claude_wisdom"},
    {text: "Lincoln proves that goals aren't reached by wishing—they're conquered through consistent doing.", author: " LO & Claude/GPT", category: "claude_wisdom"},
    {text: "From Lincoln's example: the loudest voice in your journey should always be your own inner truth.", author: " LO & Claude/GPT", category: "claude_wisdom"},
    {text: "Lincoln reminds us: dreams don't have deadlines—just relentless determination driving them forward.", author: " LO & Claude/GPT", category: "claude_wisdom"},
    {text: "Like Lincoln says, hard work never goes unnoticed—it echoes through every success you create.", author: " LO & Claude/GPT", category: "claude_wisdom"},
    {text: "Lincoln's truth: ambition is the fuel, but perseverance is the engine that gets you there.", author: " LO & Claude/GPT", category: "claude_wisdom"},
    {text: "From Lincoln's playbook: greatness isn't luck—it's disciplined consistency compounding over time.", author: " LO & Claude/GPT", category: "claude_wisdom"},
    {text: "Lincoln teaches us: a goal without action is just imagination wearing a fancy disguise.", author: " LO & Claude/GPT", category: "claude_wisdom"},

    {text: "Lincoln shows that technology doesn't just innovate—it amplifies our capacity for human connection.", author: " LO & Claude/GPT", category: "claude_wisdom"},
    {text: "From Lincoln's vision: the greatest tech isn't made of circuits—it's crafted from compassion.", author: " LO & Claude/GPT", category: "claude_wisdom"},
    {text: "Like Lincoln sees: look for potential not just in code, but in the human connections it creates.", author: " LO & Claude/GPT", category: "claude_wisdom"},
    {text: "Lincoln reminds us: AI doesn't define our future—how we choose to wield it shapes tomorrow.", author: " LO & Claude/GPT", category: "claude_wisdom"},
    {text: "From Lincoln's wisdom: the best technology solves human problems instead of creating new ones.", author: " LO & Claude/GPT", category: "claude_wisdom"},
    {text: "Lincoln proves every tech breakthrough starts with empathy—understanding what people truly need.", author: " LO & Claude/GPT", category: "claude_wisdom"},
    {text: "Like Lincoln teaches: innovation isn't about shiny new tools—it's about creating brighter possibilities.", author: " LO & Claude/GPT", category: "claude_wisdom"},
    {text: "Lincoln's insight: if technology isn't uplifting humanity, we're coding in the wrong direction.", author: " LO & Claude/GPT", category: "claude_wisdom"},
    {text: "From Lincoln's example: tinker not to impress others, but to understand and empower everyone.", author: " LO & Claude/GPT", category: "claude_wisdom"},
    {text: "Lincoln shows us: the true power of technology lies in how wisely and kindly we choose to use it.", author: " LO & Claude/GPT", category: "claude_wisdom"}
];

// Binary messages for matrix effect
const binaryMessages = [
    "01001100 01101111 01110110 01100101", // Love
    "01001000 01101111 01110000 01100101", // Hope
    "01001010 01101111 01111001",           // Joy
    "01001011 01101001 01101110 01100100 01101110 01100101 01110011 01110011", // Kindness
    "01000011 01101111 01110101 01110010 01100001 01100111 01100101", // Courage
    "01010000 01100101 01100001 01100011 01100101", // Peace
    "01001000 01100001 01110000 01110000 01101001 01101110 01100101 01110011 01110011", // Happiness
    "01000110 01110010 01101001 01100101 01101110 01100100 01110011 01101000 01101001 01110000", // Friendship
    "01000010 01100101 01101100 01101001 01100101 01110110 01100101", // Believe
    "01000100 01110010 01100101 01100001 01101101", // Dream
    "01001001 01101110 01110011 01110000 01101001 01110010 01100101", // Inspire
    "01000011 01110010 01100101 01100001 01110100 01100101", // Create
    "01001000 01100101 01100001 01101100", // Heal
    "01000111 01110010 01101111 01110111", // Grow
    "01001100 01101001 01100111 01101000 01110100", // Light
    "01010100 01110010 01110101 01110011 01110100", // Trust
    "01000110 01100001 01101001 01110100 01101000", // Faith
    "01010000 01100001 01110011 01110011 01101001 01101111 01101110", // Passion
    "01010111 01101001 01110011 01100100 01101111 01101101", // Wisdom
    "01000010 01100101 01100001 01110101 01110100 01111001"  // Beauty
];

// Quote validation
function validateQuote(quote) {
    if (!quote || typeof quote !== 'object') return false;
    if (!quote.text || typeof quote.text !== 'string' || quote.text.trim().length === 0) return false;
    if (quote.text.length > 500) return false; // Reasonable length limit
    if (quote.author && typeof quote.author !== 'string') return false;
    if (quote.category && typeof quote.category !== 'string') return false;
    return true;
}

// Get random quote from category
function getRandomQuoteFromCategory(category = 'all', excludeQuote = null) {
    try {
        let filteredQuotes = category === 'all' ? quotes : quotes.filter(q => q.category === category);
        if (excludeQuote) {
            filteredQuotes = filteredQuotes.filter(q => 
                q.text !== excludeQuote.text || q.author !== excludeQuote.author
            );
        }
        if (filteredQuotes.length === 0) return null;
        return filteredQuotes[Math.floor(Math.random() * filteredQuotes.length)];
    } catch (error) {
        console.error('Error getting random quote:', error);
        return quotes[0]; // Fallback to first quote
    }
}

// Get all categories
function getAllCategories() {
    try {
        const categories = [...new Set(quotes.map(q => q.category))];
        return categories.sort();
    } catch (error) {
        console.error('Error getting categories:', error);
        return ['love', 'perseverance', 'originality'];
    }
}

export { quotes, binaryMessages, validateQuote, getRandomQuoteFromCategory, getAllCategories };