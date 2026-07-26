import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini Client
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
};

// Simulated Cloud Storage for Cloud Sync across devices
const cloudDatabase: {
  users: Record<string, any>;
  leaderboards: Array<{
    id: string;
    username: string;
    avatar: string;
    score: number;
    ageGroup: string;
    category: string;
    date: string;
    country: string;
  }>;
  submittedQuestions: Array<any>;
} = {
  users: {},
  leaderboards: [
    { id: '1', username: 'TriviaKing_Maya', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80', score: 2850, ageGroup: 'Adults', category: 'All Topics', date: new Date().toISOString().split('T')[0], country: 'US' },
    { id: '2', username: 'JuniorEinstein_Sam', avatar: 'https://images.unsplash.com/photo-1543610892-0b1f7e6d8ac1?auto=format&fit=crop&w=150&q=80', score: 2640, ageGroup: 'Kids', category: 'Kid\'s Wonders', date: new Date().toISOString().split('T')[0], country: 'IN' },
    { id: '3', username: 'Grandpa_Arthur', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80', score: 2510, ageGroup: 'Seniors', category: 'History & Myths', date: new Date().toISOString().split('T')[0], country: 'UK' },
    { id: '4', username: 'QuizWhiz_Elena', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80', score: 2420, ageGroup: 'Adults', category: 'Pop Culture', date: new Date().toISOString().split('T')[0], country: 'CA' },
    { id: '5', username: 'LittleExplorer_Leo', avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=150&q=80', score: 2180, ageGroup: 'Kids', category: 'Science & Nature', date: new Date().toISOString().split('T')[0], country: 'DE' },
  ],
  submittedQuestions: [
    {
      id: 'sub-1',
      question: 'Which gas gives Neptune and Uranus their characteristic blue color?',
      options: ['Methane', 'Oxygen', 'Nitrogen', 'Helium'],
      correctAnswer: 0,
      category: 'Science & Nature',
      difficulty: 'Adults',
      imageUrl: 'https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?auto=format&fit=crop&w=800&q=80',
      explanation: 'Methane in the upper atmospheres absorbs red light and reflects blue light back into space!',
      author: 'AstroGeek_42',
      votes: 14
    }
  ]
};

// API: Geo Location & Lifetime Price endpoint (as low as 10 cents equivalent)
app.get('/api/pricing/geo-discount', (req, res) => {
  const userAgent = req.headers['user-agent'] || '';
  const acceptLanguage = req.headers['accept-language'] || '';

  // Detect country preference from accept-language or default
  let country = 'US';
  let currency = 'USD';
  let priceText = '$0.10';
  let rawAmount = 0.10;
  let symbol = '$';

  if (acceptLanguage.includes('hi') || acceptLanguage.includes('IN') || userAgent.includes('IN')) {
    country = 'IN';
    currency = 'INR';
    priceText = '₹10.00';
    rawAmount = 10;
    symbol = '₹';
  } else if (acceptLanguage.includes('de') || acceptLanguage.includes('fr') || acceptLanguage.includes('es') || acceptLanguage.includes('EU')) {
    country = 'EU';
    currency = 'EUR';
    priceText = '€0.10';
    rawAmount = 0.10;
    symbol = '€';
  } else if (acceptLanguage.includes('pt') || acceptLanguage.includes('BR')) {
    country = 'BR';
    currency = 'BRL';
    priceText = 'R$0.50';
    rawAmount = 0.50;
    symbol = 'R$';
  } else if (acceptLanguage.includes('ja') || acceptLanguage.includes('JP')) {
    country = 'JP';
    currency = 'JPY';
    priceText = '¥15';
    rawAmount = 15;
    symbol = '¥';
  }

  res.json({
    country,
    currency,
    priceText,
    rawAmount,
    symbol,
    discountPercentage: '90% OFF Regional Promo',
    unlockedFeatures: [
      'Lifetime Unlimited Pro Access',
      'All Categories & Senior/Kids Modes Unlocked',
      'Voice-Command Smart Speech Engine',
      'Unlimited Cloud Syncing & Cross-Platform Save',
      'Multiplayer Matchmaking & Private Room Hosting',
      'Community Question Submitter & Visual AI Creator'
    ]
  });
});

// API: AI Generate Questions via Gemini
app.post('/api/gemini/generate-questions', async (req, res) => {
  try {
    const { category, difficulty, count = 3 } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      return res.status(500).json({ error: 'Gemini API key is missing. Please check Settings > Secrets.' });
    }

    const prompt = `Generate ${count} high quality picture-focused trivia questions for category "${category}" at difficulty level "${difficulty}".
    For difficulty:
    - 'Kids': Keep language super clear, fun, engaging, simple choices.
    - 'Adults': General knowledge, balanced difficulty, interesting facts.
    - 'Seniors': Classic culture, history, nostalgic themes, relaxed clarity.

    Return JSON matching the schema with appropriate unsplash image queries for pictures.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              question: { type: Type.STRING },
              options: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
              correctAnswer: { type: Type.INTEGER, description: 'Index 0 to 3' },
              explanation: { type: Type.STRING },
              imageKeyword: { type: Type.STRING, description: 'Specific keyword for an illustrative photograph' }
            },
            required: ['question', 'options', 'correctAnswer', 'explanation', 'imageKeyword']
          }
        }
      }
    });

    const parsed = JSON.parse(response.text || '[]');
    // Attach Unsplash dynamic image URLs
    const questionsWithImages = parsed.map((q: any, idx: number) => ({
      id: `ai-gen-${Date.now()}-${idx}`,
      question: q.question,
      options: q.options,
      correctAnswer: q.correctAnswer,
      category: category || 'General Knowledge',
      difficulty: difficulty || 'Adults',
      imageUrl: `https://images.unsplash.com/photo-${1500000000000 + (Math.floor(Math.random() * 9000000))}?auto=format&fit=crop&w=800&q=80&sig=${Math.floor(Math.random() * 10000)}` || `https://picsum.photos/seed/${encodeURIComponent(q.imageKeyword || 'trivia')}/800/600`,
      explanation: q.explanation,
      author: 'MindSpark AI'
    }));

    res.json({ questions: questionsWithImages });
  } catch (err: any) {
    console.error('Gemini error:', err);
    res.status(500).json({ error: err?.message || 'Failed to generate AI questions' });
  }
});

// API: AI Explain Answer via Gemini
app.post('/api/gemini/explain-answer', async (req, res) => {
  try {
    const { question, answer, difficulty } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      return res.status(500).json({ error: 'Gemini API key is missing' });
    }

    const prompt = `Explain why "${answer}" is the correct answer to the question: "${question}".
    Tailor explanation style for audience level: "${difficulty}". Make it fascinating and memorable in 2-3 sentences.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
    });

    res.json({ explanation: response.text });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// API: Cloud Sync Sync Endpoint
app.post('/api/cloud-sync/save', (req, res) => {
  const { userId, userData } = req.body;
  if (!userId) return res.status(400).json({ error: 'UserId required' });

  cloudDatabase.users[userId] = {
    ...userData,
    lastSyncedAt: new Date().toISOString()
  };

  // If score update included, add to leaderboard
  if (userData.highestScore) {
    const existingIndex = cloudDatabase.leaderboards.findIndex(l => l.id === userId);
    const leaderboardEntry = {
      id: userId,
      username: userData.username || 'Anonymous Spark',
      avatar: userData.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
      score: userData.highestScore,
      ageGroup: userData.ageGroup || 'Adults',
      category: 'Overall',
      date: new Date().toISOString().split('T')[0],
      country: userData.country || 'US'
    };

    if (existingIndex >= 0) {
      cloudDatabase.leaderboards[existingIndex] = leaderboardEntry;
    } else {
      cloudDatabase.leaderboards.push(leaderboardEntry);
    }

    // Sort top scores
    cloudDatabase.leaderboards.sort((a, b) => b.score - a.score);
  }

  res.json({ success: true, syncedAt: cloudDatabase.users[userId].lastSyncedAt });
});

// API: Submit User Trivia Question
app.post('/api/community/submit-question', (req, res) => {
  const { question, options, correctAnswer, category, difficulty, imageUrl, explanation, author } = req.body;
  if (!question || !options || options.length < 4) {
    return res.status(400).json({ error: 'Incomplete question details' });
  }

  const newQuestion = {
    id: `comm-${Date.now()}`,
    question,
    options,
    correctAnswer: Number(correctAnswer) || 0,
    category: category || 'General Knowledge',
    difficulty: difficulty || 'Adults',
    imageUrl: imageUrl || 'https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?auto=format&fit=crop&w=800&q=80',
    explanation: explanation || 'Submitted by community member!',
    author: author || 'Community Contributor',
    votes: 1
  };

  cloudDatabase.submittedQuestions.unshift(newQuestion);
  res.json({ success: true, question: newQuestion });
});

// API: Fetch Community Questions
app.get('/api/community/questions', (req, res) => {
  res.json({ questions: cloudDatabase.submittedQuestions });
});

// API: Hourly Pro AI Trivia Generator & Database Updater
app.post('/api/trivia/hourly-refresh', async (req, res) => {
  try {
    const { isPro } = req.body;
    if (!isPro) {
      return res.status(403).json({ 
        error: 'Hourly trivia updates are exclusively available for Pro Lifetime members.',
        isPro: false 
      });
    }

    const ai = getGeminiClient();
    const hourlyTimestamp = Date.now();
    const hourlyBatchId = `hourly-${Math.floor(hourlyTimestamp / 3600000)}`;

    if (ai) {
      const prompt = `Generate 6 diverse, engaging, picture-focused trivia questions across categories:
      "Science & Nature", "History & Myths", "Geography & World", "Pop Culture & Movies", "Sports & Games", "Kid's Wonders".
      Provide distinct interesting facts and image search keywords. Return JSON array matching the schema.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                question: { type: Type.STRING },
                options: { type: Type.ARRAY, items: { type: Type.STRING } },
                correctAnswer: { type: Type.INTEGER },
                category: { type: Type.STRING },
                difficulty: { type: Type.STRING },
                explanation: { type: Type.STRING },
                hint: { type: Type.STRING },
                imageKeyword: { type: Type.STRING }
              },
              required: ['question', 'options', 'correctAnswer', 'category', 'difficulty', 'explanation', 'hint', 'imageKeyword']
            }
          }
        }
      });

      const parsed = JSON.parse(response.text || '[]');
      const generatedQuestions = parsed.map((q: any, idx: number) => ({
        id: `${hourlyBatchId}-${idx}-${Math.random().toString(36).substring(2, 7)}`,
        question: q.question,
        options: q.options,
        correctAnswer: q.correctAnswer,
        category: q.category || 'General Knowledge',
        difficulty: q.difficulty || 'Adults',
        imageUrl: `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random() * 9000000)}?auto=format&fit=crop&w=800&q=80`,
        explanation: q.explanation,
        hint: q.hint || 'Think carefully about the details!',
        author: 'Hourly AI Refresh ⚡',
        isHourlyPro: true,
        generatedAt: hourlyTimestamp,
      }));

      return res.json({
        success: true,
        hourlyBatchId,
        refreshedAt: hourlyTimestamp,
        questions: generatedQuestions,
      });
    }

    // Fallback if GEMINI_API_KEY is not configured
    const fallbackHourly = [
      {
        id: `${hourlyBatchId}-sn-rot`,
        question: 'Which element makes up roughly 78% of Earth’s atmosphere by volume?',
        options: ['Oxygen', 'Nitrogen', 'Carbon Dioxide', 'Argon'],
        correctAnswer: 1,
        category: 'Science & Nature',
        difficulty: 'Adults',
        imageUrl: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?auto=format&fit=crop&w=800&q=80',
        explanation: 'Nitrogen gas (N2) is the most abundant gas in Earth’s atmosphere!',
        hint: 'It comes before Oxygen in abundance in air.',
        author: 'Hourly Pro Database ⚡',
        isHourlyPro: true,
        generatedAt: hourlyTimestamp,
      },
      {
        id: `${hourlyBatchId}-gw-rot`,
        question: 'Which European city is famously built across a archipelago of 118 small islands separated by canals?',
        options: ['Amsterdam', 'Venice', 'Stockholm', 'Copenhagen'],
        correctAnswer: 1,
        category: 'Geography & World',
        difficulty: 'Adults',
        imageUrl: 'https://images.unsplash.com/photo-1514890547357-a9ee288728e0?auto=format&fit=crop&w=800&q=80',
        explanation: 'Venice, Italy is world-renowned for its grand canals, gondolas, and brick architecture built on wooden piles!',
        hint: 'Famous Italian city with gondolas instead of cars.',
        author: 'Hourly Pro Database ⚡',
        isHourlyPro: true,
        generatedAt: hourlyTimestamp,
      },
      {
        id: `${hourlyBatchId}-hm-rot`,
        question: 'Which ancient civilization built the impressive stone city of Machu Picchu high in the Andes mountains?',
        options: ['Mayans', 'Aztecs', 'Incas', 'Olmecs'],
        correctAnswer: 2,
        category: 'History & Myths',
        difficulty: 'Seniors',
        imageUrl: 'https://images.unsplash.com/photo-1526392060635-9d6019884377?auto=format&fit=crop&w=800&q=80',
        explanation: 'Machu Picchu was built by the Inca Empire in the 15th century under Emperor Pachacuti!',
        hint: 'Built in modern-day Peru in South America.',
        author: 'Hourly Pro Database ⚡',
        isHourlyPro: true,
        generatedAt: hourlyTimestamp,
      },
      {
        id: `${hourlyBatchId}-pcm-rot`,
        question: 'What is the highest-grossing film of all time (unadjusted for inflation)?',
        options: ['Titanic', 'Avengers: Endgame', 'Avatar', 'Star Wars: The Force Awakens'],
        correctAnswer: 2,
        category: 'Pop Culture & Movies',
        difficulty: 'Adults',
        imageUrl: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=800&q=80',
        explanation: 'James Cameron’s 2009 sci-fi epic Avatar has grossed over $2.9 billion worldwide!',
        hint: 'Directed by James Cameron and takes place on Pandora.',
        author: 'Hourly Pro Database ⚡',
        isHourlyPro: true,
        generatedAt: hourlyTimestamp,
      },
      {
        id: `${hourlyBatchId}-kw-rot`,
        question: 'Which flightless ocean bird is famous for living in cold Antarctica and waddling on ice?',
        options: ['Puffin', 'Penguin', 'Albatross', 'Flamingo'],
        correctAnswer: 1,
        category: "Kid's Wonders",
        difficulty: 'Kids',
        imageUrl: 'https://images.unsplash.com/photo-1598439210625-5067c578f3f6?auto=format&fit=crop&w=800&q=80',
        explanation: 'Penguins are aquatic birds that tuxedo up and slide on their bellies on ice!',
        hint: 'Black and white tuxedo-looking bird that loves fish.',
        author: 'Hourly Pro Database ⚡',
        isHourlyPro: true,
        generatedAt: hourlyTimestamp,
      }
    ];

    res.json({
      success: true,
      hourlyBatchId,
      refreshedAt: hourlyTimestamp,
      questions: fallbackHourly,
    });
  } catch (err: any) {
    console.error('Hourly refresh error:', err);
    res.status(500).json({ error: 'Failed to update hourly trivia database' });
  }
});

// API: Leaderboards
app.get('/api/leaderboards', (req, res) => {
  res.json({ leaderboards: cloudDatabase.leaderboards });
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
