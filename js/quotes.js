// js/quotes.js
const quotes = [
    // Love & Relationships
    {text: "Love isn't just finding the perfect person, but building a perfect bond with an imperfect soul.", author: "", category: "love"},
    {text: "To love deeply is to offer a piece of your vulnerability, trusting it will be held gently.", author: "", category: "love"},
    {text: "Love speaks loudest in the quiet moments: a shared glance, a knowing smile, a hand held tight.", author: "", category: "love"},
    {text: "Self-love is the anchor that keeps you steady, even when the storms of life rage.", author: "", category: "love"},
    {text: "Love is the thread that stitches moments into memories worth keeping.", author: "", category: "love"},
    {text: "The greatest act of love is often listening without judgment.", author: "", category: "love"},
    {text: "Love doesn't demand perfection; it celebrates growth, together.", author: "", category: "love"},

    // Perseverance & Growth
    {text: "Even the mightiest river began as a single drop refusing to stand still.", author: "", category: "perseverance"},
    {text: "Don't measure progress by the finish line, but by the strength it took to take the next step.", author: "", category: "perseverance"},
    {text: "Resilience is the art of bending without breaking, and rising stronger after the storm.", author: "", category: "perseverance"},
    {text: "When hope feels distant, let determination be your guide through the darkness.", author: "", category: "perseverance"},
    {text: "Failure isn't falling down; it's refusing to get back up.", author: "", category: "perseverance"},
    {text: "Keep climbing, not because the mountain shrinks, but because your spirit grows.", author: "", category: "perseverance"},
    {text: "Persistence turns whispers of doubt into echoes of strength.", author: "", category: "perseverance"},

    // Originality & Authenticity
    {text: "Don't just echo the melody; compose your own symphony.", author: "", category: "originality"},
    {text: "The well-trodden path offers comfort, but the untamed trail reveals wonders.", author: "", category: "originality"},
    {text: "Your unique spark isn't meant to be hidden; it's meant to ignite something new.", author: "", category: "originality"},
    {text: "Conformity builds cages; originality crafts keys.", author: "", category: "originality"},
    {text: "Listen to the whispers of your own insight; they speak a language no one else knows.", author: "", category: "originality"},
    {text: "To be original is to translate the universe through your own distinct lens.", author: "", category: "originality"},
    {text: "Be yourself; everyone else is already taken.", author: "Oscar Wilde", category: "originality"},
    {text: "To be yourself in a world that is constantly trying to make you something else is the greatest accomplishment.", author: "Ralph Waldo Emerson", category: "originality"},

    // Change & Growth
    {text: "Change is not a threat—it's an invitation.", author: "", category: "change"},
    {text: "Your next version requires a burial of the old one.", author: "", category: "change"},
    {text: "Change feels chaotic because growth is unfamiliar.", author: "", category: "change"},
    {text: "The future starts the moment you say 'I'm done settling.'", author: "", category: "change"},
    {text: "When life breaks you, rebuild with boundaries.", author: "", category: "change"},
    {text: "Nothing changes unless you choose it.", author: "", category: "change"},
    {text: "Evolve louder than your excuses.", author: "", category: "change"},
    {text: "The caterpillar thought it was the end—until it flew.", author: "", category: "change"},

    // Inner Strength & Mindset
    {text: "Strength is the art of showing up—especially when it's hard.", author: "", category: "inner_strength"},
    {text: "Emotional intelligence is silent strength.", author: "", category: "inner_strength"},
    {text: "You can't heal what you won't feel.", author: "", category: "inner_strength"},
    {text: "Peace is the new power.", author: "", category: "inner_strength"},
    {text: "Inner calm doesn't mean life is quiet—it means you are.", author: "", category: "inner_strength"},
    {text: "Know your triggers so they can't own you.", author: "", category: "inner_strength"},
    {text: "Awareness is the gateway to transformation.", author: "", category: "inner_strength"},
    {text: "Stillness is a weapon when the world is loud.", author: "", category: "inner_strength"},

    // Famous Quotes
    {text: "Be the change that you wish to see in the world.", author: "Mahatma Gandhi", category: "famous_quotes"},
    {text: "In the middle of every difficulty lies opportunity.", author: "Albert Einstein", category: "famous_quotes"},
    {text: "Success is not final, failure is not fatal: it is the courage to continue that counts.", author: "Winston Churchill", category: "famous_quotes"},
    {text: "The time is always right to do what is right.", author: "Martin Luther King Jr.", category: "famous_quotes"},
    {text: "I have not failed. I've just found 10,000 ways that won't work.", author: "Thomas Edison", category: "famous_quotes"},
    {text: "Only those who dare to fail greatly can ever achieve greatly.", author: "Robert F. Kennedy", category: "famous_quotes"},
    {text: "I learned that courage was not the absence of fear, but the triumph over it.", author: "Nelson Mandela", category: "famous_quotes"},

    // Wisdom Collection
    {text: "You don't grow through perfection—you grow through persistence.", author: "", category: "wisdom"},
    {text: "Confidence is built when you stop waiting for permission to exist loudly.", author: "", category: "wisdom"},
    {text: "Peace is the loudest form of rebellion in a chaotic world.", author: "", category: "wisdom"},
    {text: "Your healing doesn't need to be pretty—it just needs to be yours.", author: "", category: "wisdom"},
    {text: "Purpose is when your actions align with your highest self.", author: "", category: "wisdom"},
    {text: "You are not stuck—you're preparing for your next level.", author: "", category: "wisdom"},
    {text: "If the door didn't open, maybe it wasn't your door.", author: "", category: "wisdom"},
    {text: "The way you speak to yourself becomes the way you live your life.", author: "", category: "wisdom"},
    {text: "Sometimes the greatest flex is peace.", author: "", category: "wisdom"},
    {text: "You weren't born to fit into systems—you were born to build them.", author: "", category: "wisdom"}
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