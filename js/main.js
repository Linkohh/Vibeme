// js/main.js - VibeMe Enhanced JavaScript (No Modules)

// ===== GLOBAL CONFIGURATION =====
const VibeMe = {
    // Application state
    state: {
        currentQuoteIndex: 0,
        countdown: 10,
        isPaused: false,
        timerInterval: null,
        effectsEnabled: true,
        isDarkMode: JSON.parse(localStorage.getItem('vibeme-dark-mode') || 'false'),
        favorites: JSON.parse(localStorage.getItem('vibeme-favorites') || '[]'),
        customQuotes: JSON.parse(localStorage.getItem('vibeme-custom-quotes') || '[]'),
        quoteRatings: JSON.parse(localStorage.getItem('vibeme-ratings') || '{}'),
        stats: JSON.parse(localStorage.getItem('vibeme-stats') || '{"quotesGenerated": 0, "quotesShared": 0, "dayStreak": 0, "lastVisit": null}')
    },

    // Audio context for enhanced sound effects
    audioContext: null,
    audioNodes: {},

    // Advanced Matrix Effect Configuration - Enhanced with Dual Rendering
    matrixConfig: {
        columnWidth: 16,
        updateInterval: 500,
        colors: ['#CC00FF', '#A104C1', '#4400F6', '#0050FF', '#03A0C5', '#00E5FF'],
        densityMultiplier: 1.5,
        isLightBackground: false,
        backgroundLuminance: 0.2,
        // New dual rendering system properties
        renderMode: 'dom', // 'dom', 'canvas', 'hybrid'
        bidirectional: true, // Enable up/down movement
        trailLength: 20, // Maximum trail length for enhanced effects
        trailFadeRate: 0.05, // Opacity fade rate for trails
        characters: ['0', '1', '|', '/', '\\', '-', '+', '*', '#', '@', '&', '%', '$', '〃', '¦', '｜'], // Enhanced character set
        canvasConfig: {
            fontSize: 28,
            columnSpacing: 10,
            glowIntensity: 10,
            shadowBlur: 5,
            globalOpacity: 1.0,
            // Performance optimization settings
            maxFPS: 60,
            adaptivePerformance: true,
            enableObjectPooling: true,
            memoryManagement: true
        }
    },

    // Matrix Effect State Management - Enhanced for Dual Rendering
    matrixState: {
        interval: null,
        activeColumns: [],
        resizeHandler: null,
        // Canvas-specific state
        canvas: null,
        canvasContext: null,
        canvasAnimationId: null,
        canvasDrops: [],
        // Bidirectional movement state
        columnDirections: new Map(), // Store direction for each column
        trailData: new Map(), // Store trail information for enhanced effects
        // Performance optimization state
        lastFrameTime: 0,
        frameCount: 0,
        avgFrameTime: 16.67, // Target 60fps
        performanceMode: 'auto', // 'auto', 'high', 'balanced', 'low'
        dropPool: [], // Object pool for reusing drop objects
        memoryCleanupInterval: null,
        canvasRecoveryAttempted: false // Flag to prevent infinite recovery loops
    },

    // Theme system
    themes: {
        colorPalettes: {
            love: [
                {color1: "#ff758c", color2: "#ff7eb3", color3: "#ff8e9e"},
                {color1: "#ff6b6b", color2: "#ff8e8e", color3: "#ffb3b3"},
                {color1: "#f78fb3", color2: "#f8a5c2", color3: "#f9b7d1"}
            ],
            perseverance: [
                {color1: "#1e3c72", color2: "#2a5298", color3: "#1e4d8c"},
                {color1: "#0a192f", color2: "#172a45", color3: "#303f60"},
                {color1: "#00416A", color2: "#005792", color3: "#0066B2"}
            ],
            originality: [
                {color1: "#8e44ad", color2: "#9b59b6", color3: "#d2b4de"},
                {color1: "#e74c3c", color2: "#f39c12", color3: "#3498db"},
                {color1: "#1abc9c", color2: "#2ecc71", color3: "#3498db"},
                {color1: "#9b59b6", color2: "#e74c3c", color3: "#f1c40f"}
            ],
            change: [
                {color1: "#4CAF50", color2: "#8BC34A", color3: "#CDDC39"},
                {color1: "#2196F3", color2: "#64B5F6", color3: "#90CAF9"}
            ],
            inner_strength: [
                {color1: "#795548", color2: "#8D6E63", color3: "#A1887F"},
                {color1: "#424242", color2: "#616161", color3: "#757575"}
            ],
            default: [
                {color1: "#6366f1", color2: "#8b5cf6", color3: "#a855f7"}
            ]
        }
    },

    // Quote database
    quotes: [
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
        {text: "Every great project begins with a tiny spark of 'wouldn't it be cool if...'.", author: " LO & Claude/GPT", category: "claude_wisdom"},
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
        {text: "Today's impossible is tomorrow's 'how did we ever live without this?'.", author: " LO & Claude/GPT", category: "claude_wisdom"},
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
        {text: "Like Lincoln says, limitations don't define you—your response to them writes your story.", author: "Lincoln Ogden", category: "claude_wisdom"},
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
    ],

    // Binary messages for matrix effect
    binaryMessages: [
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
    ],

    // Initialize the application
    init: function() {
        this.initializeAudio();
        this.setupEventListeners();
        this.loadUserPreferences();
        this.initializeEffects();
        this.initializeThemes();
        this.initializeDarkMode();
        this.initializeQuoteValidation();
        this.updateSocialLinks(this.getCurrentQuote());
        this.startTimer();
        this.updateStats();
        
        console.log('✅ VibeMe Enhanced loaded successfully!');
    },

    // ===== CORE FUNCTIONALITY =====
    getCurrentQuote: function() {
        const allQuotes = [...this.quotes, ...this.state.customQuotes];
        return allQuotes[this.state.currentQuoteIndex] || this.quotes[0];
    },

    getRandomQuote: function() {
        const allQuotes = [...this.quotes, ...this.state.customQuotes];
        let newIndex;
        do {
            newIndex = Math.floor(Math.random() * allQuotes.length);
        } while (newIndex === this.state.currentQuoteIndex && allQuotes.length > 1);
        
        this.state.currentQuoteIndex = newIndex;
        return allQuotes[newIndex];
    },

    updateQuote: function() {
        const quote = this.getRandomQuote();
        const quoteText = document.getElementById('quote-text');
        const quoteAuthor = document.getElementById('quote-author');
        
        // Add button press effect to generate button
        const generateBtn = document.getElementById('generate-btn');
        if (generateBtn) {
            generateBtn.classList.add('button-press');
            setTimeout(() => generateBtn.classList.remove('button-press'), 150);
        }

        // Play sound effect
        this.playSound('generate');
        
        if (quoteText) {
            quoteText.classList.add('exit-active');
            setTimeout(() => {
                quoteText.textContent = quote.text;
                quoteText.classList.remove('exit-active');
                quoteText.classList.add('enter-active');
                setTimeout(() => {
                    quoteText.classList.remove('enter-active');
                }, 800);
            }, 400);
        }
        
        if (quoteAuthor) {
            quoteAuthor.classList.add('author-exit');
            setTimeout(() => {
                quoteAuthor.textContent = `— ${quote.author}`;
                quoteAuthor.classList.remove('author-exit');
                quoteAuthor.classList.add('author-enter');
                setTimeout(() => {
                    quoteAuthor.classList.remove('author-enter');
                }, 600);
            }, 300);
        }

        this.updateSocialLinks(quote);
        this.triggerHapticFeedback('light');
        
        // Apply new theme with each quote
        this.applyRandomTheme();
        
        // Update rating display for new quote
        this.updateRatingDisplay();
        
        // Update stats
        this.state.stats.quotesGenerated++;
        this.saveStats();
    },

    // ===== TIMER FUNCTIONALITY =====
    startTimer: function() {
        if (this.state.timerInterval) clearInterval(this.state.timerInterval);
        
        this.state.countdown = 10;
        const countdownEl = document.getElementById('countdown');
        if (countdownEl) countdownEl.textContent = this.state.countdown;
        
        if (!this.state.isPaused) {
            this.state.timerInterval = setInterval(() => {
                this.state.countdown--;
                if (countdownEl) countdownEl.textContent = this.state.countdown;
                
                if (this.state.countdown <= 0) {
                    this.updateQuote();
                    this.startTimer();
                }
            }, 1000);
        }
    },

    toggleTimer: function() {
        this.state.isPaused = !this.state.isPaused;
        const btn = document.getElementById('timer-toggle-btn');
        const icon = btn ? btn.querySelector('i') : null;
        
        if (this.state.isPaused) {
            clearInterval(this.state.timerInterval);
            if (icon) {
                icon.classList.remove('fa-pause');
                icon.classList.add('fa-play');
            }
        } else {
            this.startTimer();
            if (icon) {
                icon.classList.remove('fa-play');
                icon.classList.add('fa-pause');
            }
        }

        this.playSound('click');
        this.triggerHapticFeedback('light');
    },

    // ===== COPY FUNCTIONALITY =====
    copyQuote: async function() {
        const quoteText = document.getElementById('quote-text');
        const quoteAuthor = document.getElementById('quote-author');
        
        if (quoteText && quoteAuthor) {
            const text = `${quoteText.textContent} ${quoteAuthor.textContent}`;
            
            try {
                await navigator.clipboard.writeText(text);
                this.showFeedback("Copied to clipboard!", 'success');
                this.playSound('success');
                this.triggerHapticFeedback('medium');
            } catch (err) {
                this.showFeedback("Copy failed", 'error');
                this.playSound('error');
            }
        }
    },

    // ===== FAVORITES FUNCTIONALITY =====
    toggleFavorite: function() {
        const quote = this.getCurrentQuote();
        const favoriteBtn = document.getElementById('favorite-quote-btn');
        const icon = favoriteBtn ? favoriteBtn.querySelector('i') : null;
        
        const existingIndex = this.state.favorites.findIndex(fav => 
            fav.text === quote.text && fav.author === quote.author
        );
        
        if (existingIndex >= 0) {
            // Remove from favorites
            this.state.favorites.splice(existingIndex, 1);
            if (icon) {
                icon.classList.remove('fas');
                icon.classList.add('far');
            }
            this.showFeedback("Removed from favorites", 'info');
            this.playSound('click');
        } else {
            // Add to favorites
            this.state.favorites.push(quote);
            if (icon) {
                icon.classList.remove('far');
                icon.classList.add('fas');
                icon.classList.add('pulse-favorite');
                setTimeout(() => icon.classList.remove('pulse-favorite'), 600);
            }
            this.showFeedback("Added to favorites! ❤️", 'success');
            this.playSound('favorite');
            this.triggerHapticFeedback('medium');
            this.createHeartParticles();
        }
        
        this.saveFavorites();
    },

    // ===== SOCIAL SHARING =====
    updateSocialLinks: function(quote) {
        const text = `"${quote.text}" — ${quote.author}`;
        const url = window.location.href;
        
        const links = {
            'twitter-share': `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
            'facebook-share': `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(text)}`,
            'linkedin-share': `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(url)}&title=Inspirational%20Quote&summary=${encodeURIComponent(text)}`,
            'whatsapp-share': `https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`,
            'pinterest-share': `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(url)}&description=${encodeURIComponent(text)}`
        };
        
        Object.entries(links).forEach(([id, href]) => {
            const element = document.getElementById(id);
            if (element) element.href = href;
        });
    },

    // ===== SETTINGS & PREFERENCES =====
    toggleSettings: function() {
        const panel = document.getElementById('settings-panel');
        if (panel) {
            panel.classList.toggle('hidden');
            this.playSound('click');
        }
    },

    toggleEffects: function() {
        const checkbox = document.getElementById('effects-toggle-checkbox');
        if (checkbox) {
            this.state.effectsEnabled = checkbox.checked;
            document.body.classList.toggle('effects-disabled', !this.state.effectsEnabled);
            localStorage.setItem('vibeme-effects', this.state.effectsEnabled);
            
            // Handle effects cleanup/restart for both renderers
            if (!this.state.effectsEnabled) {
                this.stopMouseGlow();
                this.stopMatrixEffect();
                this.stopCanvasMatrix();
            } else {
                this.setupMouseGlow();
                
                // Restart matrix effects based on render mode
                if (this.matrixConfig.renderMode === 'dom' || this.matrixConfig.renderMode === 'hybrid') {
                    this.setupMatrixEffect();
                }
                if (this.matrixConfig.renderMode === 'canvas' || this.matrixConfig.renderMode === 'hybrid') {
                    this.initializeCanvasMatrix();
                }
            }
            
            this.playSound('click');
        }
    },

    stopMouseGlow: function() {
        if (this.mouseGlowState) {
            // Clean up animation frames
            if (this.mouseGlowState.animationId) {
                cancelAnimationFrame(this.mouseGlowState.animationId);
                this.mouseGlowState.animationId = null;
            }
            
            if (this.mouseGlowState.colorAnimationId) {
                cancelAnimationFrame(this.mouseGlowState.colorAnimationId);
                this.mouseGlowState.colorAnimationId = null;
            }
            
            if (this.mouseGlowState.profileChangeInterval) {
                clearInterval(this.mouseGlowState.profileChangeInterval);
                this.mouseGlowState.profileChangeInterval = null;
            }
            
            // Hide the element
            const element = document.getElementById('mouse-glow');
            if (element) {
                element.style.opacity = '0';
                element.style.transform = 'translate3d(0, 0, 0)';
            }
        }
    },

    clearFavorites: function() {
        if (confirm('Are you sure you want to clear all favorites?')) {
            this.state.favorites = [];
            this.saveFavorites();
            this.showFeedback("Favorites cleared", 'info');
            this.playSound('click');
        }
    },

    // ===== CUSTOM QUOTES =====
    toggleAddQuoteForm: function() {
        const form = document.getElementById('add-quote-form');
        if (form) {
            form.classList.toggle('hidden');
            this.playSound('click');
        }
    },

    submitQuote: function() {
        const textInput = document.getElementById('new-quote-text');
        const authorInput = document.getElementById('new-quote-author');
        
        if (textInput && textInput.value.trim()) {
            const newQuote = {
                text: textInput.value.trim(),
                author: authorInput ? authorInput.value.trim() || 'Anonymous' : 'Anonymous'
            };
            
            this.state.customQuotes.push(newQuote);
            this.saveCustomQuotes();
            
            textInput.value = '';
            if (authorInput) authorInput.value = '';
            
            this.toggleAddQuoteForm();
            this.showFeedback("Quote added successfully!", 'success');
            this.playSound('success');
        }
    },

    // ===== AUDIO SYSTEM =====
    initializeAudio: function() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (error) {
            console.log('Audio context not supported');
        }
    },

    playSound: function(type) {
        if (!this.audioContext || !this.state.effectsEnabled) return;

        const frequencies = {
            click: 800,
            generate: 600,
            success: 523.25, // C5
            favorite: 659.25, // E5
            error: 200
        };

        const frequency = frequencies[type] || frequencies.click;
        
        try {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
            oscillator.type = type === 'error' ? 'sawtooth' : 'sine';
            
            gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.2);
            
            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + 0.2);
        } catch (error) {
            // Silent failure for audio
        }
    },

    // ===== HAPTIC FEEDBACK =====
    triggerHapticFeedback: function(intensity = 'light') {
        if ('vibrate' in navigator && this.state.effectsEnabled) {
            const patterns = {
                light: [10],
                medium: [20],
                strong: [30]
            };
            navigator.vibrate(patterns[intensity] || patterns.light);
        }
    },

    // ===== VISUAL EFFECTS =====
    initializeEffects: function() {
        this.setupMouseGlow();
        
        // Initialize matrix effects based on render mode
        if (this.matrixConfig.renderMode === 'dom' || this.matrixConfig.renderMode === 'hybrid') {
            this.setupMatrixEffect();
        }
        if (this.matrixConfig.renderMode === 'canvas' || this.matrixConfig.renderMode === 'hybrid') {
            this.initializeCanvasMatrix();
        }
    },

    // ===== THEME SYSTEM =====
    initializeThemes: function() {
        this.applyRandomTheme();
    },

    // Enhanced theme generation with user preferences
    getRandomTheme: function() {
        // Check if user has color preferences stored
        const colorPrefs = JSON.parse(localStorage.getItem('vibeme-color-preferences') || '{}');
        
        const options = {
            harmonyType: colorPrefs.harmonyType || 'auto',
            vibrancy: colorPrefs.vibrancy || 0.7,
            warmth: colorPrefs.warmth || 0.5,
            accessibility: colorPrefs.accessibility !== false, // default to true
            baseHue: colorPrefs.baseHue || null
        };
        
        return this.generateIntelligentTheme(options);
    },

    applyRandomTheme: function() {
        const theme = this.getRandomTheme();
        this.applyTheme(theme);
        
        // Store the current theme for matrix adaptation
        this.currentTheme = theme;
        
        // Update matrix colors to complement the new theme
        this.updateMatrixColors(theme);
        
        // Debug logging with theme info
        console.log('🎨 Applied new theme:', {
            harmony: theme.harmonyType,
            colors: [theme.color1, theme.color2, theme.color3],
            vibrancy: theme.vibrancy,
            baseHue: theme.baseHue
        });
    },

    applyTheme: function(theme) {
        const root = document.documentElement;
        root.style.setProperty('--color1', theme.color1);
        root.style.setProperty('--color2', theme.color2);
        root.style.setProperty('--color3', theme.color3);
        
        // Calculate optimal text colors using WCAG standards
        const backgroundColor = theme.color1; // Primary background color
        
        // Get optimal text colors that meet accessibility standards
        const textMain = this.generateAccessibleTextColor(backgroundColor, 'main');
        const textSecondary = this.generateAccessibleTextColor(theme.color2, 'secondary');
        const socialBg = this.generateAccessibleSocialBg(theme);
        
        root.style.setProperty('--text-color-main', textMain);
        root.style.setProperty('--text-color-secondary', textSecondary);
        root.style.setProperty('--social-icon-bg', socialBg);
        
        // Debug contrast ratios
        const mainContrast = this.getContrastRatio(textMain, backgroundColor);
        console.log('🔍 Contrast ratios:', {
            main: mainContrast.toFixed(2),
            wcagAA: mainContrast >= 4.5 ? '✅' : '❌',
            wcagAAA: mainContrast >= 7.0 ? '✅' : '❌'
        });
    },

    // Generate accessible text color for different text types
    generateAccessibleTextColor: function(backgroundColor, textType = 'main') {
        const minContrast = textType === 'main' ? 4.5 : 3.0; // WCAG AA standards
        
        // Try optimal colors first
        const optimal = this.getOptimalTextColor(backgroundColor);
        if (this.getContrastRatio(optimal, backgroundColor) >= minContrast) {
            return optimal;
        }
        
        // If optimal doesn't work, generate a contrasting color
        let contrastColor = this.generateContrastingColor(backgroundColor, minContrast);
        
        // Final fallback: pure black or white
        if (this.getContrastRatio(contrastColor, backgroundColor) < minContrast) {
            const luminance = this.getRelativeLuminance(backgroundColor);
            contrastColor = luminance > 0.5 ? '#000000' : '#ffffff';
        }
        
        return contrastColor;
    },

    // Generate accessible social icon background
    generateAccessibleSocialBg: function(theme) {
        // Try a slightly darker version of color1 first
        let socialBg = this.adjustBrightness(theme.color1, -20);
        
        // Ensure it contrasts well with white icons
        if (this.getContrastRatio('#ffffff', socialBg) < 3.0) {
            socialBg = this.adjustBrightness(theme.color1, -40);
        }
        
        // Final fallback
        if (this.getContrastRatio('#ffffff', socialBg) < 3.0) {
            const luminance = this.getRelativeLuminance(theme.color1);
            socialBg = luminance > 0.5 ? '#333333' : '#cccccc';
        }
        
        return socialBg;
    },

    // ===== ADAPTIVE MATRIX COLORS =====
    
    // Enhanced matrix color system with intelligent blend modes
    updateMatrixColors: function(theme) {
        // Calculate background luminance for blend mode decision
        const avgLuminance = this.calculateAverageBackgroundLuminance(theme);
        const isLightBackground = avgLuminance > 0.4; // Slightly lower threshold for better contrast
        
        // Apply intelligent blend mode
        this.applyMatrixBlendMode(isLightBackground, avgLuminance);
        
        // Generate enhanced complementary colors with contrast validation
        const baseHue = theme.baseHue || 0;
        const matrixBaseHue = (baseHue + 180) % 360; // True complementary color
        
        // Create optimized matrix color palette
        const matrixColors = this.generateOptimizedMatrixPalette(matrixBaseHue, isLightBackground, avgLuminance);
        
        // Update the matrix configuration
        this.matrixConfig.colors = matrixColors;
        this.matrixConfig.isLightBackground = isLightBackground;
        this.matrixConfig.backgroundLuminance = avgLuminance;
        
        // Refresh existing columns with new colors and blend modes
        if (this.matrixState.activeColumns.length > 0) {
            this.refreshMatrixColors();
        }
        
        // Also update Canvas renderer if it's active
        if ((this.matrixConfig.renderMode === 'canvas' || this.matrixConfig.renderMode === 'hybrid') && 
            this.matrixState.canvasDrops.length > 0) {
            this.refreshCanvasColors();
        }
        
        console.log('🔮 Enhanced matrix system updated:', {
            backgroundType: isLightBackground ? 'light' : 'dark',
            luminance: avgLuminance.toFixed(3),
            blendMode: this.getActiveBlendMode(),
            baseHue: matrixBaseHue,
            colors: matrixColors,
            renderMode: this.matrixConfig.renderMode
        });
    },

    // Calculate average luminance across all background colors
    calculateAverageBackgroundLuminance: function(theme) {
        const colors = [theme.color1, theme.color2, theme.color3];
        const luminances = colors.map(color => this.getRelativeLuminance(color));
        
        // Weighted average (give more weight to primary color)
        const weights = [0.5, 0.3, 0.2];
        const weightedSum = luminances.reduce((sum, lum, index) => sum + (lum * weights[index]), 0);
        
        return weightedSum;
    },

    // Apply intelligent blend mode based on background analysis
    applyMatrixBlendMode: function(isLightBackground, luminance) {
        const body = document.body;
        
        // Remove existing matrix mode classes
        body.classList.remove('matrix-mode-dark-bg', 'matrix-mode-light-bg', 'matrix-mode-high-contrast');
        
        // Get user preference for matrix mode
        const matrixPrefs = JSON.parse(localStorage.getItem('vibeme-matrix-preferences') || '{}');
        const forceHighContrast = matrixPrefs.highContrast || false;
        const blendModeOverride = matrixPrefs.blendModeOverride || 'auto';
        
        if (forceHighContrast || blendModeOverride === 'high-contrast') {
            body.classList.add('matrix-mode-high-contrast');
        } else if (blendModeOverride !== 'auto') {
            // Manual override
            body.classList.add(`matrix-mode-${blendModeOverride}`);
        } else {
            // Intelligent automatic selection
            if (isLightBackground) {
                body.classList.add('matrix-mode-light-bg');
            } else {
                body.classList.add('matrix-mode-dark-bg');
            }
        }
    },

    // Get the currently active blend mode for debugging
    getActiveBlendMode: function() {
        const body = document.body;
        if (body.classList.contains('matrix-mode-high-contrast')) return 'high-contrast';
        if (body.classList.contains('matrix-mode-light-bg')) return 'light-bg (multiply)';
        if (body.classList.contains('matrix-mode-dark-bg')) return 'dark-bg (screen)';
        return 'none';
    },

    // Generate optimized matrix color palette with contrast validation
    generateOptimizedMatrixPalette: function(baseHue, isLightBackground, backgroundLuminance) {
        const colors = [];
        
        for (let i = 0; i < 6; i++) {
            const hueVariation = (baseHue + (i * 25)) % 360; // Slightly wider spread for more variety
            
            let saturation, lightness;
            
            if (isLightBackground) {
                // For light backgrounds: use darker, more saturated colors
                saturation = Math.max(70, 85 + (i * 2)); // High saturation
                lightness = Math.max(15, 25 + (i * 8));  // Dark colors
            } else {
                // For dark backgrounds: use brighter, vibrant colors
                saturation = Math.max(60, 75 + (i * 3)); // High saturation
                lightness = Math.max(50, 65 + (i * 5));  // Bright colors
            }
            
            // Clamp values to valid ranges
            saturation = Math.min(95, saturation);
            lightness = Math.min(85, lightness);
            
            const color = this.hslToHex(hueVariation, saturation, lightness);
            
            // Validate contrast and adjust if necessary
            const validatedColor = this.validateMatrixColorContrast(color, backgroundLuminance, isLightBackground);
            
            colors.push(validatedColor);
        }
        
        return colors;
    },

    // Validate and adjust matrix color contrast
    validateMatrixColorContrast: function(color, backgroundLuminance, isLightBackground) {
        const colorLuminance = this.getRelativeLuminance(color);
        const contrastRatio = backgroundLuminance > colorLuminance 
            ? (backgroundLuminance + 0.05) / (colorLuminance + 0.05)
            : (colorLuminance + 0.05) / (backgroundLuminance + 0.05);
        
        const minContrast = 3.0; // Minimum contrast for matrix visibility
        
        if (contrastRatio < minContrast) {
            const hsl = this.hexToHsl(color);
            if (!hsl) return color;
            
            // Adjust lightness to improve contrast
            if (isLightBackground) {
                // Make darker for light backgrounds
                hsl.l = Math.max(5, hsl.l - 20);
            } else {
                // Make brighter for dark backgrounds
                hsl.l = Math.min(95, hsl.l + 20);
            }
            
            return this.hslToHex(hsl.h, hsl.s, hsl.l);
        }
        
        return color;
    },

    // Refresh existing matrix columns with new colors
    refreshMatrixColors: function() {
        const columns = document.querySelectorAll('.binary-column');
        columns.forEach((column, index) => {
            const colorIndex = index % this.matrixConfig.colors.length;
            const color = this.matrixConfig.colors[colorIndex];
            
            // Update the column's text color
            column.style.color = color;
            column.style.textShadow = `0 0 5px ${color}`;
        });
    },

    // Enhanced matrix creation with bidirectional movement and advanced trail effects
    createMatrixColumn: function() {
        if (!this.state.effectsEnabled) return;
        
        const column = document.createElement('div');
        column.className = 'binary-column';
        
        // Use current matrix colors with rotation
        const colorIndex = this.matrixState.activeColumns.length % this.matrixConfig.colors.length;
        const color = this.matrixConfig.colors[colorIndex];
        
        // Bidirectional movement: randomly choose direction if enabled
        const direction = this.matrixConfig.bidirectional ? 
            (Math.random() < 0.5 ? 1 : -1) : 1; // 1 = down, -1 = up
        
        // Store direction for this column
        const columnId = `column_${Date.now()}_${Math.random()}`;
        column.dataset.columnId = columnId;
        this.matrixState.columnDirections.set(columnId, direction);
        
        // Generate matrix characters with enhanced character set
        const chars = this.matrixConfig.characters;
        const streamLength = Math.floor(Math.random() * this.matrixConfig.trailLength) + 10;
        let columnContent = '';
        
        for (let i = 0; i < streamLength; i++) {
            const char = chars[Math.floor(Math.random() * chars.length)];
            let charClass = '';
            
            if (i === 0) {
                // Leading character - gets special highlight
                charClass = 'matrix-head';
            } else if (i <= 5) {
                // Trailing characters with enhanced fade effect
                charClass = `matrix-trail-${Math.min(i, 5)}`;
            }
            
            columnContent += `<span class="${charClass}">${char}</span>`;
        }
        
        // Apply adaptive styling with bidirectional animation support
        const startPosition = direction === 1 ? '-100vh' : '100vh'; // Start above or below screen
        const animationName = direction === 1 ? 'matrix-fall' : 'matrix-rise';
        
        column.style.cssText = `
            position: fixed;
            top: ${startPosition};
            width: ${this.matrixConfig.columnWidth}px;
            font-family: 'Courier New', 'Roboto Mono', monospace;
            font-size: ${this.getMatrixFontSize()}px;
            font-weight: bold;
            line-height: 1.1;
            pointer-events: none;
            z-index: -1;
            color: ${color};
            animation: ${animationName} ${this.getMatrixFallDuration()}s linear forwards;
            will-change: transform, opacity;
            --direction: ${direction};
        `;
        
        column.innerHTML = columnContent;
        
        // Position randomly with better distribution
        const maxLeft = window.innerWidth - this.matrixConfig.columnWidth;
        const leftPosition = Math.random() * maxLeft;
        column.style.left = `${leftPosition}px`;
        
        // Add slight random delay for more organic feel
        const delay = Math.random() * 1000;
        setTimeout(() => {
            if (this.state.effectsEnabled) {
                document.body.appendChild(column);
                this.matrixState.activeColumns.push(column);
            }
        }, delay);
        
        // Remove after animation with cleanup
        const fallDuration = this.getMatrixFallDuration();
        setTimeout(() => {
            this.removeMatrixColumn(column);
        }, (fallDuration * 1000) + delay);
    },

    // Get responsive font size for matrix
    getMatrixFontSize: function() {
        if (window.innerWidth <= 640) return 11; // Mobile
        if (window.innerWidth <= 1024) return 12; // Tablet  
        return 14; // Desktop
    },

    // Get matrix fall duration based on user preferences
    getMatrixFallDuration: function() {
        const matrixPrefs = JSON.parse(localStorage.getItem('vibeme-matrix-preferences') || '{}');
        const speedMultiplier = matrixPrefs.animationSpeed || 1.0;
        return Math.max(4, Math.min(12, 8 / speedMultiplier)); // 4-12 second range
    },

    // Safe matrix column removal
    removeMatrixColumn: function(column) {
        try {
            if (column && column.parentNode) {
                column.parentNode.removeChild(column);
            }
            const index = this.matrixState.activeColumns.indexOf(column);
            if (index > -1) {
                this.matrixState.activeColumns.splice(index, 1);
            }
        } catch (error) {
            console.warn('Matrix column removal error:', error);
        }
    },

    darkenColor: function(color, percent) {
        // Remove # if present
        color = color.replace('#', '');
        
        // Parse RGB values
        const r = parseInt(color.substring(0, 2), 16);
        const g = parseInt(color.substring(2, 4), 16);
        const b = parseInt(color.substring(4, 6), 16);
        
        // Darken by percentage
        const newR = Math.max(0, Math.floor(r * (1 - percent / 100)));
        const newG = Math.max(0, Math.floor(g * (1 - percent / 100)));
        const newB = Math.max(0, Math.floor(b * (1 - percent / 100)));
        
        // Convert back to hex
        return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
    },

    // ===== ADVANCED COLOR SCIENCE UTILITIES =====
    
    // Convert HEX to RGB
    hexToRgb: function(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    },

    // Convert RGB to HEX
    rgbToHex: function(r, g, b) {
        return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    },

    // Convert RGB to HSL
    rgbToHsl: function(r, g, b) {
        r /= 255;
        g /= 255;
        b /= 255;
        
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        let h, s, l = (max + min) / 2;

        if (max === min) {
            h = s = 0; // achromatic
        } else {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            
            switch (max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }
            h /= 6;
        }

        return { h: h * 360, s: s * 100, l: l * 100 };
    },

    // Convert HSL to RGB
    hslToRgb: function(h, s, l) {
        h /= 360;
        s /= 100;
        l /= 100;
        
        const hue2rgb = (p, q, t) => {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1/6) return p + (q - p) * 6 * t;
            if (t < 1/2) return q;
            if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
            return p;
        };

        let r, g, b;

        if (s === 0) {
            r = g = b = l; // achromatic
        } else {
            const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            const p = 2 * l - q;
            r = hue2rgb(p, q, h + 1/3);
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - 1/3);
        }

        return {
            r: Math.round(r * 255),
            g: Math.round(g * 255),
            b: Math.round(b * 255)
        };
    },

    // Convert HEX to HSL
    hexToHsl: function(hex) {
        const rgb = this.hexToRgb(hex);
        return rgb ? this.rgbToHsl(rgb.r, rgb.g, rgb.b) : null;
    },

    // Convert HSL to HEX
    hslToHex: function(h, s, l) {
        const rgb = this.hslToRgb(h, s, l);
        return this.rgbToHex(rgb.r, rgb.g, rgb.b);
    },

    // Calculate relative luminance (WCAG 2.1 standard)
    getRelativeLuminance: function(hex) {
        const rgb = this.hexToRgb(hex);
        if (!rgb) return 0;
        
        // Convert to sRGB
        const rsRGB = rgb.r / 255;
        const gsRGB = rgb.g / 255;
        const bsRGB = rgb.b / 255;
        
        // Apply gamma correction
        const gamma = (c) => c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
        
        const rLinear = gamma(rsRGB);
        const gLinear = gamma(gsRGB);
        const bLinear = gamma(bsRGB);
        
        // Calculate luminance using WCAG formula
        return 0.2126 * rLinear + 0.7152 * gLinear + 0.0722 * bLinear;
    },

    // Calculate contrast ratio between two colors (WCAG 2.1 standard)
    getContrastRatio: function(color1, color2) {
        const lum1 = this.getRelativeLuminance(color1);
        const lum2 = this.getRelativeLuminance(color2);
        
        const lightest = Math.max(lum1, lum2);
        const darkest = Math.min(lum1, lum2);
        
        return (lightest + 0.05) / (darkest + 0.05);
    },

    // Check if color combination meets WCAG accessibility standards
    meetsWCAGStandards: function(foreground, background, level = 'AA') {
        const contrast = this.getContrastRatio(foreground, background);
        
        switch (level) {
            case 'AA': return contrast >= 4.5;
            case 'AAA': return contrast >= 7.0;
            case 'AA-large': return contrast >= 3.0; // For large text (18pt+ or 14pt+ bold)
            default: return contrast >= 4.5;
        }
    },

    // Get optimal text color (black or white) for a background
    getOptimalTextColor: function(backgroundColor) {
        const contrastWithWhite = this.getContrastRatio('#ffffff', backgroundColor);
        const contrastWithBlack = this.getContrastRatio('#000000', backgroundColor);
        
        return contrastWithWhite > contrastWithBlack ? '#ffffff' : '#000000';
    },

    // Adjust color brightness while maintaining hue
    adjustBrightness: function(hex, amount) {
        const hsl = this.hexToHsl(hex);
        if (!hsl) return hex;
        
        // Adjust lightness, keeping within bounds
        hsl.l = Math.max(0, Math.min(100, hsl.l + amount));
        
        return this.hslToHex(hsl.h, hsl.s, hsl.l);
    },

    // Adjust color saturation
    adjustSaturation: function(hex, amount) {
        const hsl = this.hexToHsl(hex);
        if (!hsl) return hex;
        
        // Adjust saturation, keeping within bounds
        hsl.s = Math.max(0, Math.min(100, hsl.s + amount));
        
        return this.hslToHex(hsl.h, hsl.s, hsl.l);
    },

    // Generate a color that contrasts well with the given color
    generateContrastingColor: function(baseColor, minContrast = 4.5) {
        const baseLuminance = this.getRelativeLuminance(baseColor);
        
        // Try white first, then black
        if (this.getContrastRatio('#ffffff', baseColor) >= minContrast) {
            return '#ffffff';
        }
        if (this.getContrastRatio('#000000', baseColor) >= minContrast) {
            return '#000000';
        }
        
        // If neither works, adjust the base color
        const hsl = this.hexToHsl(baseColor);
        if (!hsl) return '#ffffff';
        
        // Make it much lighter or darker
        if (baseLuminance > 0.5) {
            hsl.l = Math.max(0, hsl.l - 50); // Make much darker
        } else {
            hsl.l = Math.min(100, hsl.l + 50); // Make much lighter
        }
        
        return this.hslToHex(hsl.h, hsl.s, hsl.l);
    },

    // ===== COLOR HARMONY GENERATORS =====
    
    // Generate analogous color scheme (colors next to each other on color wheel)
    generateAnalogousColors: function(baseHue, saturation = 70, lightness = 60, spread = 30) {
        const colors = [];
        for (let i = -1; i <= 1; i++) {
            const hue = (baseHue + (i * spread) + 360) % 360;
            colors.push(this.hslToHex(hue, saturation, lightness));
        }
        return colors;
    },

    // Generate triadic color scheme (three colors evenly spaced on color wheel)
    generateTriadicColors: function(baseHue, saturation = 70, lightness = 60) {
        const colors = [];
        for (let i = 0; i < 3; i++) {
            const hue = (baseHue + (i * 120)) % 360;
            colors.push(this.hslToHex(hue, saturation, lightness));
        }
        return colors;
    },

    // Generate complementary color scheme (opposite colors on color wheel)
    generateComplementaryColors: function(baseHue, saturation = 70, lightness = 60) {
        const baseColor = this.hslToHex(baseHue, saturation, lightness);
        const complementaryHue = (baseHue + 180) % 360;
        const complementaryColor = this.hslToHex(complementaryHue, saturation, lightness);
        
        // Add a third color that's a variation of the base
        const accentColor = this.hslToHex(baseHue, saturation * 0.8, lightness * 1.2);
        
        return [baseColor, complementaryColor, accentColor];
    },

    // Generate split-complementary color scheme
    generateSplitComplementaryColors: function(baseHue, saturation = 70, lightness = 60) {
        const baseColor = this.hslToHex(baseHue, saturation, lightness);
        const comp1Hue = (baseHue + 150) % 360;
        const comp2Hue = (baseHue + 210) % 360;
        
        return [
            baseColor,
            this.hslToHex(comp1Hue, saturation, lightness),
            this.hslToHex(comp2Hue, saturation, lightness)
        ];
    },

    // Generate tetradic (rectangle) color scheme
    generateTetradicColors: function(baseHue, saturation = 70, lightness = 60) {
        const colors = [];
        const offsets = [0, 60, 180, 240];
        
        for (const offset of offsets) {
            const hue = (baseHue + offset) % 360;
            colors.push(this.hslToHex(hue, saturation, lightness));
        }
        
        return colors.slice(0, 3); // Return only first 3 for consistency
    },

    // Generate monochromatic color scheme (same hue, different saturation/lightness)
    generateMonochromaticColors: function(baseHue, baseSaturation = 70, baseLightness = 60) {
        return [
            this.hslToHex(baseHue, baseSaturation, baseLightness),
            this.hslToHex(baseHue, baseSaturation * 0.7, baseLightness * 1.3),
            this.hslToHex(baseHue, baseSaturation * 1.2, baseLightness * 0.8)
        ];
    },

    // Generate a vibrant color palette with constraints
    generateVibriantPalette: function(baseHue, vibrancy = 0.8, warmth = 0.5) {
        // Adjust saturation and lightness based on vibrancy
        const saturation = Math.max(40, Math.min(95, 50 + (vibrancy * 45)));
        const lightness = Math.max(30, Math.min(80, 45 + (vibrancy * 25)));
        
        // Adjust hue slightly based on warmth preference
        const hueShift = (warmth - 0.5) * 60; // Shift towards warm/cool
        const adjustedHue = (baseHue + hueShift + 360) % 360;
        
        // Generate harmonious colors based on golden ratio
        const goldenAngle = 137.5; // Golden angle in degrees
        const colors = [];
        
        for (let i = 0; i < 3; i++) {
            const hue = (adjustedHue + (i * goldenAngle)) % 360;
            const sat = saturation + (Math.sin(i * Math.PI / 3) * 15); // Vary saturation
            const light = lightness + (Math.cos(i * Math.PI / 3) * 15); // Vary lightness
            
            colors.push(this.hslToHex(
                hue,
                Math.max(20, Math.min(95, sat)),
                Math.max(25, Math.min(85, light))
            ));
        }
        
        return colors;
    },

    // Intelligent theme generator that chooses the best harmony type
    generateIntelligentTheme: function(options = {}) {
        const {
            harmonyType = 'auto',
            vibrancy = 0.7,
            warmth = 0.5,
            accessibility = true,
            baseHue = null
        } = options;
        
        // Generate or use provided base hue
        const hue = baseHue !== null ? baseHue : Math.floor(Math.random() * 360);
        
        // Calculate optimal saturation and lightness
        const saturation = Math.max(30, Math.min(90, 40 + (vibrancy * 50)));
        const lightness = Math.max(35, Math.min(75, 45 + (vibrancy * 20)));
        
        let colors;
        
        // Choose harmony type intelligently or use specified type
        if (harmonyType === 'auto') {
            const harmonies = ['analogous', 'triadic', 'complementary', 'vibrant'];
            const chosenHarmony = harmonies[Math.floor(Math.random() * harmonies.length)];
            
            switch (chosenHarmony) {
                case 'analogous': colors = this.generateAnalogousColors(hue, saturation, lightness); break;
                case 'triadic': colors = this.generateTriadicColors(hue, saturation, lightness); break;
                case 'complementary': colors = this.generateComplementaryColors(hue, saturation, lightness); break;
                case 'vibrant': colors = this.generateVibriantPalette(hue, vibrancy, warmth); break;
                default: colors = this.generateAnalogousColors(hue, saturation, lightness);
            }
        } else {
            switch (harmonyType) {
                case 'analogous': colors = this.generateAnalogousColors(hue, saturation, lightness); break;
                case 'triadic': colors = this.generateTriadicColors(hue, saturation, lightness); break;
                case 'complementary': colors = this.generateComplementaryColors(hue, saturation, lightness); break;
                case 'split-complementary': colors = this.generateSplitComplementaryColors(hue, saturation, lightness); break;
                case 'tetradic': colors = this.generateTetradicColors(hue, saturation, lightness); break;
                case 'monochromatic': colors = this.generateMonochromaticColors(hue, saturation, lightness); break;
                case 'vibrant': colors = this.generateVibriantPalette(hue, vibrancy, warmth); break;
                default: colors = this.generateAnalogousColors(hue, saturation, lightness);
            }
        }
        
        // Apply accessibility constraints if requested
        if (accessibility) {
            colors = this.ensureAccessibilityCompliance(colors);
        }
        
        return {
            color1: colors[0],
            color2: colors[1],
            color3: colors[2],
            harmonyType: harmonyType === 'auto' ? 'intelligent' : harmonyType,
            baseHue: hue,
            vibrancy,
            warmth
        };
    },

    // Ensure color palette meets accessibility standards
    ensureAccessibilityCompliance: function(colors) {
        const improvedColors = [...colors];
        
        // Check each color against white and black text
        for (let i = 0; i < improvedColors.length; i++) {
            const color = improvedColors[i];
            const contrastWhite = this.getContrastRatio('#ffffff', color);
            const contrastBlack = this.getContrastRatio('#000000', color);
            
            // If neither meets minimum standards, adjust the color
            if (contrastWhite < 3.0 && contrastBlack < 3.0) {
                const hsl = this.hexToHsl(color);
                if (hsl) {
                    // Adjust lightness to improve contrast
                    if (hsl.l > 50) {
                        hsl.l = Math.max(25, hsl.l - 30); // Make darker
                    } else {
                        hsl.l = Math.min(75, hsl.l + 30); // Make lighter
                    }
                    improvedColors[i] = this.hslToHex(hsl.h, hsl.s, hsl.l);
                }
            }
        }
        
        return improvedColors;
    },

    setupMouseGlow: function() {
        const mouseGlow = document.getElementById('mouse-glow');
        if (!mouseGlow) return;

        // Simple state for color animation
        this.mouseGlowState = {
            hue: 200
        };

        // Track mouse movement with direct positioning
        document.addEventListener('mousemove', (e) => {
            if (!this.state.effectsEnabled) return;
            
            // Use requestAnimationFrame for smooth animations
            requestAnimationFrame(() => {
                // Update position directly using left/top instead of transform
                mouseGlow.style.left = `${e.clientX}px`;
                mouseGlow.style.top = `${e.clientY}px`;
                mouseGlow.style.opacity = '0.8';
            });
        });

        // Handle hover effects on interactive elements
        const interactiveElements = document.querySelectorAll('a, button, .social-bubble, .quote-container-inner, .quote-container-outer, [role="button"], .action-button, .generate-btn');
        
        interactiveElements.forEach(el => {
            el.addEventListener('mouseenter', () => {
                if (this.state.effectsEnabled) {
                    mouseGlow.classList.add('hover-effect');
                }
            });
            
            el.addEventListener('mouseleave', () => {
                mouseGlow.classList.remove('hover-effect');
            });
        });

        // Hide glow when mouse leaves the page
        document.body.addEventListener('mouseleave', () => {
            mouseGlow.style.opacity = '0';
        });

        // Start color animation
        this.animateMouseGlowColor(mouseGlow);
    },

    animateMouseGlowColor: function(element) {
        const animate = () => {
            if (!this.state.effectsEnabled || !element) {
                requestAnimationFrame(animate);
                return;
            }
            
            // Increment hue for color cycling
            this.mouseGlowState.hue = (this.mouseGlowState.hue + 0.5) % 360;
            
            // Update CSS variable for color
            element.style.setProperty('--glow-hue', this.mouseGlowState.hue.toFixed(2));
            
            // Continue animation
            requestAnimationFrame(animate);
        };
        
        animate();
    },

    // Enhanced hue extraction with better color detection
    extractHueFromColor: function(hexColor) {
        const rgb = this.hexToRgb(hexColor);
        if (!rgb) return 0;
        
        const r = rgb.r / 255;
        const g = rgb.g / 255;
        const b = rgb.b / 255;
        
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        const diff = max - min;
        
        if (diff === 0) return 0;
        
        let hue = 0;
        if (max === r) {
            hue = ((g - b) / diff) % 6;
        } else if (max === g) {
            hue = (b - r) / diff + 2;
        } else {
            hue = (r - g) / diff + 4;
        }
        
        hue = Math.round(hue * 60);
        return hue < 0 ? hue + 360 : hue;
    },

    getLuminance: function(r, g, b) {
        const [rs, gs, bs] = [r, g, b].map(c => {
            c = c / 255;
            return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
        });
        return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
    },

    // Matrix Color Interpolation Helpers
    interpolateColor: function(color1, color2, factor) {
        const c1 = this.hexToRgb(color1);
        const c2 = this.hexToRgb(color2);
        if (!c1 || !c2) return '#00ff00'; // Fallback
        const r = Math.round(c1.r + (c2.r - c1.r) * factor);
        const g = Math.round(c1.g + (c2.g - c1.g) * factor);
        const b = Math.round(c1.b + (c2.b - c1.b) * factor);
        return `rgb(${r}, ${g}, ${b})`;
    },

    convertToRgba: function(color, alpha = 1) {
        if (!color) return 'rgba(255, 255, 255, 0.5)';
        if (color.startsWith('rgb')) return color.replace('rgb', 'rgba').replace(')', `, ${alpha})`);
        if (color.startsWith('#')) {
            const r = parseInt(color.slice(1, 3), 16);
            const g = parseInt(color.slice(3, 5), 16);
            const b = parseInt(color.slice(5, 7), 16);
            return `rgba(${r}, ${g}, ${b}, ${alpha})`;
        }
        return 'rgba(255, 255, 255, 0.5)';
    },

    // Debounce utility for performance
    debounce: function(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func.apply(this, args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    setupMatrixEffect: function() {
        // Clean up any existing matrix effect
        this.stopMatrixEffect();
        
        this.matrixBg = document.getElementById('matrix-bg');
        if (!this.matrixBg || !this.state.effectsEnabled) return;

        console.log('🌌 Starting Advanced Matrix Effect...');
        
        // Initialize columns based on screen width
        this.createMatrixColumns();
        
        // Start the update interval
        this.startMatrixUpdates();
        
        // Add resize listener with debouncing
        this.matrixState.resizeHandler = this.debounce(() => this.handleMatrixResize(), 250);
        window.addEventListener('resize', this.matrixState.resizeHandler, { passive: true });
    },

    stopMatrixEffect: function() {
        // Clear interval
        if (this.matrixState.interval) {
            clearInterval(this.matrixState.interval);
            this.matrixState.interval = null;
        }
        
        // Remove resize listener
        if (this.matrixState.resizeHandler) {
            window.removeEventListener('resize', this.matrixState.resizeHandler);
            this.matrixState.resizeHandler = null;
        }
        
        // Clean up all active columns
        this.matrixState.activeColumns.forEach(column => {
            if (column && column.parentNode) {
                column.parentNode.removeChild(column);
            }
        });
        this.matrixState.activeColumns = [];
    },

    createMatrixColumns: function() {
        if (!this.matrixBg || !this.state.effectsEnabled) return;
        
        // Calculate target column count using dynamic density multiplier
        const baseColumnCount = Math.floor(window.innerWidth / this.matrixConfig.columnWidth);
        const densityMultiplier = this.matrixConfig.densityMultiplier || 1.5;
        const targetColumns = Math.floor(baseColumnCount * densityMultiplier);
        const neededColumns = targetColumns - this.matrixState.activeColumns.length;

        if (neededColumns > 0) {
            for (let i = 0; i < neededColumns; i++) {
                this.createSingleMatrixColumn();
            }
        } else if (neededColumns < 0) {
            // Remove excess columns
            for (let i = 0; i < Math.abs(neededColumns); i++) {
                this.removeSingleMatrixColumn();
            }
        }
    },

    createSingleMatrixColumn: function() {
        if (!this.matrixBg || !this.state.effectsEnabled) return;
        
        const column = document.createElement('div');
        column.className = 'binary-column';
        
        // Initialize with recycled content
        this.recycleMatrixColumn(column);
        
        this.matrixBg.appendChild(column);
        this.matrixState.activeColumns.push(column);
        
        // Fade in the column
        requestAnimationFrame(() => setTimeout(() => column.classList.add('visible'), 10));
        
        // Time-based recycling - no event listeners needed
    },

    recycleMatrixColumn: function(column) {
        if (!this.state.effectsEnabled) return;
        
        // Set new horizontal position
        column.style.left = `${Math.random() * 100}%`;
        
        // Generate new matrix content
        column.innerHTML = this.generateMatrixContent();
        
        // Apply position-based gradient color
        this.applyMatrixThemeColors(column);
        
        // Set new animation duration and delay
        const duration = 12 + Math.random() * 8; // 12-20 seconds
        const delay = Math.random() * 4; // 0-4 seconds
        
        // Store animation timing for heartbeat monitoring
        column.dataset.startTime = Date.now() + (delay * 1000);
        column.dataset.duration = duration * 1000;
        
        // Reset and restart animation
        column.style.animation = 'none';
        requestAnimationFrame(() => {
            column.style.animation = `fall ${duration}s linear ${delay}s`;
        });
    },

    checkMatrixColumns: function() {
        if (!this.state.effectsEnabled) return;
        const now = Date.now();
        this.matrixState.activeColumns.forEach(column => {
            const startTime = parseFloat(column.dataset.startTime || 0);
            const duration = parseFloat(column.dataset.duration || 0);
            // If the animation's time is up, recycle it forcefully
            if (startTime && duration && now > startTime + duration) {
                this.recycleMatrixColumn(column);
            }
        });
    },

    generateMatrixContent: function() {
        const chars = this.matrixConfig.characters;
        const maxLength = this.matrixConfig.trailLength;
        const fadeRate = this.matrixConfig.trailFadeRate;
        
        // Variable length trails for more organic appearance
        const length = Math.floor(Math.random() * maxLength) + Math.floor(maxLength * 0.3);
        let content = '';
        
        for (let i = 0; i < length; i++) {
            const char = chars[Math.floor(Math.random() * chars.length)];
            
            // Enhanced opacity calculation with exponential decay
            let opacity;
            if (i === 0) {
                // Leading character - maximum brightness
                opacity = 1.0;
            } else if (i <= 3) {
                // High-intensity trail (near head)
                opacity = Math.max(0.7, 1 - (i * 0.15));
            } else {
                // Gradual exponential fade for trailing characters
                const fadePosition = (i - 3) / (length - 3);
                opacity = Math.max(0.1, Math.exp(-fadePosition * 3) * 0.7);
            }
            
            // Apply enhanced opacity with trail fade rate
            const finalOpacity = Math.max(fadeRate, opacity);
            
            // Add enhanced character classes for better styling
            let charClass = 'matrix-char';
            if (i === 0) {
                charClass += ' matrix-head';
            } else if (i <= 5) {
                charClass += ` matrix-trail-${Math.min(i, 5)}`;
            }
            
            content += `<span class="${charClass}" style="opacity: ${finalOpacity.toFixed(3)}">${char}</span>`;
        }
        
        return content;
    },

    applyMatrixThemeColors: function(column) {
        const colors = this.matrixConfig.colors;
        const position = parseFloat(column.style.left) / 100; // 0.0 to 1.0
        
        // Determine color blend
        const segmentIndex = Math.floor(position * (colors.length - 1));
        const nextSegmentIndex = Math.min(segmentIndex + 1, colors.length - 1);
        const localPosition = (position * (colors.length - 1)) - segmentIndex;
        
        // Interpolate between colors
        const primaryColor = this.interpolateColor(colors[segmentIndex], colors[nextSegmentIndex], localPosition);
        
        // Apply color and glow
        column.style.setProperty('color', primaryColor, 'important');
        const glowColor = this.convertToRgba(primaryColor, 0.9);
        column.style.setProperty('text-shadow', `0 0 2px ${glowColor}, 0 0 4px ${glowColor}`, 'important');
    },

    // ===== EVENT LISTENERS =====
    setupEventListeners: function() {
        document.getElementById('generate-btn').addEventListener('click', () => this.updateQuote());
        document.getElementById('timer-toggle-btn').addEventListener('click', () => this.toggleTimer());
        document.getElementById('copy-quote-btn').addEventListener('click', () => this.copyQuote());
        document.getElementById('favorite-quote-btn').addEventListener('click', () => this.toggleFavorite());
        document.getElementById('dark-mode-toggle').addEventListener('click', () => this.toggleDarkMode());
        document.getElementById('settings-toggle').addEventListener('click', () => this.toggleSettings());
        document.getElementById('effects-toggle-checkbox').addEventListener('change', () => this.toggleEffects());
        document.getElementById('clear-favorites-btn').addEventListener('click', () => this.clearFavorites());
        document.getElementById('toggle-add-quote-form').addEventListener('click', () => this.toggleAddQuoteForm());
        document.getElementById('submit-quote-btn').addEventListener('click', () => this.submitQuote());
        
        // Matrix render mode selector
        const renderModeSelector = document.getElementById('matrix-render-mode');
        if (renderModeSelector) {
            renderModeSelector.addEventListener('change', (e) => {
                this.updateMatrixRenderMode(e.target.value);
            });
            
            // Initialize canvas performance settings visibility
            this.toggleCanvasPerformanceSettings(
                renderModeSelector.value === 'canvas' || renderModeSelector.value === 'hybrid'
            );
        }
    },

    // ===== DARK MODE =====
    initializeDarkMode: function() {
        if (this.state.isDarkMode) {
            document.body.classList.add('dark-mode');
        }
    },

    toggleDarkMode: function() {
        this.state.isDarkMode = !this.state.isDarkMode;
        document.body.classList.toggle('dark-mode');
        localStorage.setItem('vibeme-dark-mode', this.state.isDarkMode);
        this.playSound('click');
    },

    // ===== QUOTE VALIDATION =====
    initializeQuoteValidation: function() {
        // This is a placeholder for a more robust validation system.
        // In a real-world application, this would involve more sophisticated checks.
        const textInput = document.getElementById('new-quote-text');
        const submitBtn = document.getElementById('submit-quote-btn');
        if (textInput && submitBtn) {
            textInput.addEventListener('input', () => {
                if (textInput.value.trim().length > 10) {
                    submitBtn.disabled = false;
                } else {
                    submitBtn.disabled = true;
                }
            });
        }
    },

    // ===== STATS =====
    updateStats: function() {
        // This is a placeholder for displaying stats.
    },

    saveStats: function() {
        localStorage.setItem('vibeme-stats', JSON.stringify(this.state.stats));
    },

    // ===== FEEDBACK =====
    showFeedback: function(message, type = 'info') {
        const feedback = document.getElementById('copy-feedback');
        if (feedback) {
            feedback.textContent = message;
            feedback.className = `text-center text-sm mt-3 h-4 ${type === 'success' ? 'text-green-500' : 'text-red-500'}`;
            setTimeout(() => {
                feedback.textContent = '';
            }, 3000);
        }
    },

    // ===== PARTICLES =====
    createHeartParticles: function() {
        // This is a placeholder for creating heart particles.
    },

    // ===== RATING =====
    updateRatingDisplay: function() {
        // This is a placeholder for updating the rating display.
    },

    // ===== USER PREFERENCES =====
    loadUserPreferences: function() {
        const effectsEnabled = localStorage.getItem('vibeme-effects');
        if (effectsEnabled !== null) {
            this.state.effectsEnabled = JSON.parse(effectsEnabled);
            const checkbox = document.getElementById('effects-toggle-checkbox');
            if (checkbox) {
                checkbox.checked = this.state.effectsEnabled;
            }
            document.body.classList.toggle('effects-disabled', !this.state.effectsEnabled);
        }
    },

    saveFavorites: function() {
        localStorage.setItem('vibeme-favorites', JSON.stringify(this.state.favorites));
    },

    saveCustomQuotes: function() {
        localStorage.setItem('vibeme-custom-quotes', JSON.stringify(this.state.customQuotes));
    },

    // ===== MATRIX RESIZE =====
    handleMatrixResize: function() {
        this.createMatrixColumns();
    },

    // ===== MATRIX UPDATES =====
    startMatrixUpdates: function() {
        if (this.matrixState.interval) clearInterval(this.matrixState.interval);
        this.matrixState.interval = setInterval(() => {
            this.checkMatrixColumns();
        }, this.matrixConfig.updateInterval);
    },

    // ===== CANVAS MATRIX =====
    initializeCanvasMatrix: function() {
        if (!this.state.effectsEnabled) return;

        console.log('🎨 Initializing Canvas Matrix Rain...');

        try {
            // Get canvas element and context
            this.matrixState.canvas = document.getElementById('matrix-canvas');
            if (!this.matrixState.canvas) {
                console.warn('⚠️ Canvas element not found');
                return;
            }

            this.matrixState.canvasContext = this.matrixState.canvas.getContext('2d');
            if (!this.matrixState.canvasContext) {
                console.warn('⚠️ Canvas context not available');
                return;
            }

            // Show canvas
            this.matrixState.canvas.style.display = 'block';

            // Set up canvas size
            this.resizeCanvasMatrix();

            // Initialize drop system
            this.initializeCanvasDrops();

            // Start animation loop
            this.startCanvasAnimation();

            // Add resize listener
            if (!this.matrixState.canvasResizeHandler) {
                this.matrixState.canvasResizeHandler = this.debounce(() => {
                    this.resizeCanvasMatrix();
                    this.initializeCanvasDrops();
                }, 250);
                window.addEventListener('resize', this.matrixState.canvasResizeHandler, { passive: true });
            }

            console.log('✅ Canvas Matrix Rain initialized successfully');

        } catch (error) {
            console.error('❌ Canvas Matrix initialization failed:', error);
            // Fallback to DOM mode if canvas fails
            this.matrixConfig.renderMode = 'dom';
        }
    },

    resizeCanvasMatrix: function() {
        if (!this.matrixState.canvas) return;

        // Set canvas size to match viewport
        this.matrixState.canvas.width = window.innerWidth;
        this.matrixState.canvas.height = window.innerHeight;

        // Update canvas configuration
        const config = this.matrixConfig.canvasConfig;
        config.columns = Math.floor(this.matrixState.canvas.width / config.columnSpacing);

        console.log(`📐 Canvas resized: ${this.matrixState.canvas.width}x${this.matrixState.canvas.height}, Columns: ${config.columns}`);
    },

    initializeCanvasDrops: function() {
        if (!this.matrixState.canvas) return;

        const config = this.matrixConfig.canvasConfig;
        const columns = config.columns || Math.floor(this.matrixState.canvas.width / config.columnSpacing);
        
        // Clear existing drops
        this.matrixState.canvasDrops = [];

        // Initialize drops for each column
        for (let i = 0; i < columns; i++) {
            const drop = this.createCanvasDrop(i);
            this.matrixState.canvasDrops.push(drop);
        }

        console.log(`💧 Initialized ${columns} canvas drops`);
    },

    createCanvasDrop: function(columnIndex) {
        const config = this.matrixConfig.canvasConfig;
        const characters = this.matrixConfig.characters || ['0', '1'];
        
        return {
            x: columnIndex * config.columnSpacing,
            y: Math.random() * this.matrixState.canvas.height / config.fontSize,
            direction: Math.random() < 0.5 ? 1 : -1, // 1 for down, -1 for up
            trail: [],
            length: Math.floor(Math.random() * (this.matrixConfig.trailLength || 20)) + 5,
            speed: 0.8 + Math.random() * 0.4, // Slight speed variation
            opacity: 0.8 + Math.random() * 0.2,
            characters: characters,
            lastCharChange: 0,
            charChangeInterval: 100 + Math.random() * 200 // Character change timing
        };
    },

    startCanvasAnimation: function() {
        if (this.matrixState.canvasAnimationId) {
            cancelAnimationFrame(this.matrixState.canvasAnimationId);
        }

        const animate = (currentTime) => {
            if (!this.matrixState.canvas || !this.state.effectsEnabled) return;

            try {
                // Check for canvas context loss
                if (!this.matrixState.canvasContext || this.matrixState.canvasContext.isContextLost?.()) {
                    console.warn('⚠️ Canvas context lost, attempting recovery...');
                    this.handleCanvasContextLoss();
                    return;
                }

                // Performance monitoring
                if (this.matrixState.lastFrameTime) {
                    const frameTime = currentTime - this.matrixState.lastFrameTime;
                    this.matrixState.frameCount++;
                    
                    // Update average frame time every 60 frames
                    if (this.matrixState.frameCount % 60 === 0) {
                        this.matrixState.avgFrameTime = frameTime;
                        
                        // Adjust performance every 5 seconds
                        if (this.matrixState.frameCount % 300 === 0) {
                            this.adjustCanvasPerformance();
                        }
                    }
                }
                this.matrixState.lastFrameTime = currentTime;

                // Draw matrix frame
                this.drawCanvasMatrix(currentTime);

                // Continue animation
                this.matrixState.canvasAnimationId = requestAnimationFrame(animate);

            } catch (error) {
                console.error('❌ Canvas animation error:', error);
                // Attempt to recover or fallback to DOM mode
                this.handleCanvasError(error);
            }
        };

        this.matrixState.canvasAnimationId = requestAnimationFrame(animate);
        console.log('🎬 Canvas animation started');
    },

    handleCanvasContextLoss: function() {
        if (this.matrixState.canvasRecoveryAttempted) {
            console.error('❌ Canvas recovery failed, switching to DOM mode');
            this.matrixConfig.renderMode = 'dom';
            this.stopCanvasMatrix();
            this.setupMatrixEffect();
            return;
        }

        this.matrixState.canvasRecoveryAttempted = true;
        
        setTimeout(() => {
            try {
                this.matrixState.canvasContext = this.matrixState.canvas.getContext('2d');
                if (this.matrixState.canvasContext) {
                    console.log('✅ Canvas context recovered');
                    this.matrixState.canvasRecoveryAttempted = false;
                }
            } catch (error) {
                console.error('❌ Canvas recovery failed:', error);
                this.matrixConfig.renderMode = 'dom';
                this.stopCanvasMatrix();
                this.setupMatrixEffect();
            }
        }, 1000);
    },

    handleCanvasError: function(error) {
        console.error('❌ Canvas error occurred:', error);
        
        // Stop canvas animation to prevent error loops
        if (this.matrixState.canvasAnimationId) {
            cancelAnimationFrame(this.matrixState.canvasAnimationId);
            this.matrixState.canvasAnimationId = null;
        }

        // Fallback to DOM mode if canvas is causing issues
        if (error.message.includes('context') || error.message.includes('canvas')) {
            console.log('🔄 Falling back to DOM matrix mode due to canvas error');
            this.matrixConfig.renderMode = 'dom';
            this.stopCanvasMatrix();
            this.setupMatrixEffect();
        }
    },

    drawCanvasMatrix: function(currentTime) {
        const ctx = this.matrixState.canvasContext;
        const canvas = this.matrixState.canvas;
        const config = this.matrixConfig.canvasConfig;

        if (!ctx || !canvas) return;

        // Performance-based frame skipping for adaptive performance
        if (config.adaptivePerformance && this.matrixState.avgFrameTime > 25) { // 40fps threshold
            // Skip every other frame if performance is poor
            if (this.matrixState.frameCount % 2 === 0) return;
        }

        // Clear canvas with fade effect (adjustable based on performance)
        const fadeOpacity = config.adaptivePerformance && this.matrixState.avgFrameTime > 20 ? 0.06 : 0.04;
        ctx.fillStyle = `rgba(0, 0, 0, ${fadeOpacity})`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Set font
        ctx.font = `${config.fontSize}px monospace`;
        ctx.textAlign = 'center';

        // Draw each drop with potential performance optimizations
        this.matrixState.canvasDrops.forEach((drop, dropIndex) => {
            this.updateCanvasDrop(drop, currentTime);
            this.drawCanvasDrop(ctx, drop, dropIndex);
        });

        // Memory management - periodic cleanup
        if (config.memoryManagement && this.matrixState.frameCount % 3600 === 0) { // Every minute at 60fps
            this.performCanvasMemoryCleanup();
        }
    },

    performCanvasMemoryCleanup: function() {
        console.log('🧹 Performing canvas memory cleanup...');
        
        try {
            // Force garbage collection of trail arrays that are too large
            this.matrixState.canvasDrops.forEach(drop => {
                if (drop.trail.length > drop.length * 1.5) {
                    drop.trail = drop.trail.slice(0, drop.length);
                }
            });

            // Reset performance tracking occasionally
            if (this.matrixState.frameCount > 216000) { // Reset after 1 hour at 60fps
                this.matrixState.frameCount = 0;
                this.matrixState.lastFrameTime = 0;
            }

        } catch (error) {
            console.error('❌ Memory cleanup error:', error);
        }
    },

    // Adaptive performance adjustment based on frame rate
    adjustCanvasPerformance: function() {
        const config = this.matrixConfig.canvasConfig;
        
        if (!config.adaptivePerformance) return;

        const avgFrameTime = this.matrixState.avgFrameTime;
        const targetFrameTime = 1000 / (config.maxFPS || 60);

        if (avgFrameTime > targetFrameTime * 1.5) {
            // Performance is poor, reduce quality
            if (config.glowIntensity > 2) {
                config.glowIntensity = Math.max(2, config.glowIntensity - 1);
                console.log(`📉 Reduced glow intensity to ${config.glowIntensity} for performance`);
            }
        } else if (avgFrameTime < targetFrameTime * 0.8) {
            // Performance is good, can increase quality
            if (config.glowIntensity < 10) {
                config.glowIntensity = Math.min(10, config.glowIntensity + 1);
                console.log(`📈 Increased glow intensity to ${config.glowIntensity}`);
            }
        }
    },

    updateCanvasDrop: function(drop, currentTime) {
        const config = this.matrixConfig.canvasConfig;
        const canvas = this.matrixState.canvas;

        // Add new character to trail head
        if (currentTime - drop.lastCharChange > drop.charChangeInterval) {
            const newChar = drop.characters[Math.floor(Math.random() * drop.characters.length)];
            drop.trail.unshift(newChar);
            drop.lastCharChange = currentTime;
        }

        // Limit trail length
        if (drop.trail.length > drop.length) {
            drop.trail.pop();
        }

        // Move drop
        drop.y += drop.direction * drop.speed;

        // Reset drop when off screen
        if (drop.direction === 1 && drop.y * config.fontSize > canvas.height + drop.length * config.fontSize) {
            // Moving down, reset from top
            drop.y = -drop.length;
            drop.direction = Math.random() < 0.5 ? 1 : -1;
            drop.trail = [];
        } else if (drop.direction === -1 && drop.y * config.fontSize < -drop.length * config.fontSize) {
            // Moving up, reset from bottom
            drop.y = canvas.height / config.fontSize + drop.length;
            drop.direction = Math.random() < 0.5 ? 1 : -1;
            drop.trail = [];
        }
    },

    drawCanvasDrop: function(ctx, drop, dropIndex) {
        const config = this.matrixConfig.canvasConfig;
        const colors = this.matrixConfig.colors;
        
        // Calculate base color for this column using 6-color gradient
        const ratio = dropIndex / (this.matrixState.canvasDrops.length - 1);
        const baseColor = this.interpolateCanvasColors(colors, ratio);

        // Draw each character in the trail
        drop.trail.forEach((char, charIndex) => {
            let charY;
            
            if (drop.direction === 1) {
                charY = (drop.y - charIndex) * config.fontSize;
            } else {
                charY = (drop.y + charIndex) * config.fontSize;
            }

            // Calculate opacity for fading effect
            const trailOpacity = Math.max(0, 1 - (charIndex / drop.trail.length));
            const finalOpacity = trailOpacity * drop.opacity;

            // Apply color with opacity
            const r = parseInt(baseColor.r * finalOpacity);
            const g = parseInt(baseColor.g * finalOpacity);
            const b = parseInt(baseColor.b * finalOpacity);

            ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
            
            // Add glow effect
            if (config.glowIntensity > 0) {
                ctx.shadowColor = `rgb(${r}, ${g}, ${b})`;
                ctx.shadowBlur = config.glowIntensity * finalOpacity;
            }

            // Draw character
            ctx.fillText(char, drop.x + config.columnSpacing / 2, charY);
        });

        // Reset shadow for next draw
        ctx.shadowBlur = 0;
    },

    interpolateCanvasColors: function(colors, ratio) {
        if (!colors || colors.length === 0) {
            return { r: 0, g: 255, b: 0 }; // Default green
        }

        const segmentSize = 1 / (colors.length - 1);
        const segmentIndex = Math.floor(ratio / segmentSize);
        const segmentRatio = (ratio % segmentSize) / segmentSize;

        const color1 = this.hexToRgb(colors[segmentIndex] || colors[0]);
        const color2 = this.hexToRgb(colors[segmentIndex + 1] || colors[colors.length - 1]);

        return {
            r: Math.round(color1.r + (color2.r - color1.r) * segmentRatio),
            g: Math.round(color1.g + (color2.g - color1.g) * segmentRatio),
            b: Math.round(color1.b + (color2.b - color1.b) * segmentRatio)
        };
    },

    hexToRgb: function(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : { r: 0, g: 255, b: 0 };
    },

    stopCanvasMatrix: function() {
        console.log('🛑 Stopping Canvas Matrix Rain...');

        try {
            // Stop animation loop
            if (this.matrixState.canvasAnimationId) {
                cancelAnimationFrame(this.matrixState.canvasAnimationId);
                this.matrixState.canvasAnimationId = null;
            }

            // Hide canvas
            if (this.matrixState.canvas) {
                this.matrixState.canvas.style.display = 'none';
            }

            // Clear drops array
            this.matrixState.canvasDrops = [];

            // Remove resize listener
            if (this.matrixState.canvasResizeHandler) {
                window.removeEventListener('resize', this.matrixState.canvasResizeHandler);
                this.matrixState.canvasResizeHandler = null;
            }

            // Clear performance tracking
            this.matrixState.lastFrameTime = 0;
            this.matrixState.frameCount = 0;

            // Clear canvas if available
            if (this.matrixState.canvasContext && this.matrixState.canvas) {
                this.matrixState.canvasContext.clearRect(0, 0, this.matrixState.canvas.width, this.matrixState.canvas.height);
            }

            console.log('✅ Canvas Matrix Rain stopped successfully');

        } catch (error) {
            console.error('❌ Error stopping Canvas Matrix:', error);
        }
    },

    refreshCanvasColors: function() {
        if (!this.matrixState.canvas || !this.matrixState.canvasDrops.length) return;

        console.log('🎨 Refreshing Canvas Matrix colors...');

        try {
            // Colors are automatically applied in the drawing loop via this.matrixConfig.colors
            // This function exists for any future color-specific optimizations or caching
            
            // Optionally, we could pre-calculate color gradients for performance
            const colors = this.matrixConfig.colors;
            if (colors && colors.length > 0) {
                // The color interpolation happens in real-time during drawing
                // This ensures the canvas always uses the latest theme colors
                console.log(`✅ Canvas colors refreshed using palette: [${colors.join(', ')}]`);
            }

        } catch (error) {
            console.error('❌ Error refreshing Canvas Matrix colors:', error);
        }
    },

    // ===== RENDERING MODE SWITCHING =====
    switchMatrixRenderMode: function(newMode) {
        if (!['dom', 'canvas', 'hybrid'].includes(newMode)) {
            console.warn(`⚠️ Invalid render mode: ${newMode}`);
            return;
        }

        const oldMode = this.matrixConfig.renderMode;
        if (oldMode === newMode) return;

        console.log(`🔄 Switching matrix render mode: ${oldMode} → ${newMode}`);

        try {
            // Stop all current matrix effects
            this.stopAllMatrixEffects();

            // Update configuration
            this.matrixConfig.renderMode = newMode;

            // Start effects for new mode (if effects are enabled)
            if (this.state.effectsEnabled) {
                this.startMatrixEffectsForCurrentMode();
            }

            console.log(`✅ Matrix render mode switched to: ${newMode}`);

        } catch (error) {
            console.error('❌ Error switching matrix render mode:', error);
            // Fallback to DOM mode on error
            this.matrixConfig.renderMode = 'dom';
            this.startMatrixEffectsForCurrentMode();
        }
    },

    stopAllMatrixEffects: function() {
        // Stop DOM matrix effect
        this.stopMatrixEffect();
        
        // Stop Canvas matrix effect
        this.stopCanvasMatrix();
    },

    startMatrixEffectsForCurrentMode: function() {
        const mode = this.matrixConfig.renderMode;
        
        // Start DOM matrix (for 'dom' and 'hybrid' modes)
        if (mode === 'dom' || mode === 'hybrid') {
            this.setupMatrixEffect();
        }
        
        // Start Canvas matrix (for 'canvas' and 'hybrid' modes)
        if (mode === 'canvas' || mode === 'hybrid') {
            this.initializeCanvasMatrix();
        }
    },

    // Helper function to update matrix render mode from settings panel
    updateMatrixRenderMode: function(mode) {
        this.switchMatrixRenderMode(mode);
        
        // Update UI to reflect the change
        const selector = document.getElementById('matrix-render-mode');
        if (selector && selector.value !== mode) {
            selector.value = mode;
        }

        // Show/hide canvas performance settings based on mode
        this.toggleCanvasPerformanceSettings(mode === 'canvas' || mode === 'hybrid');
    },

    toggleCanvasPerformanceSettings: function(show) {
        const settings = document.getElementById('canvas-performance-settings');
        if (settings) {
            if (show) {
                settings.classList.remove('hidden');
            } else {
                settings.classList.add('hidden');
            }
        }
    }
};

// Wait for the DOM to be fully loaded before initializing the application
document.addEventListener('DOMContentLoaded', () => {
    VibeMe.init();
});
