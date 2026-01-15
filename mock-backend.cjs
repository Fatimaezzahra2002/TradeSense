const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// Define data file paths
const DATA_DIR = path.join(__dirname, 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const CHALLENGES_FILE = path.join(DATA_DIR, 'challenges.json');
const TRADES_FILE = path.join(DATA_DIR, 'trades.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Load or initialize data
let users = [];
let challenges = [];
let trades = [];

try {
  users = JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'));
} catch (err) {
  // Default users if file doesn't exist
  users = [
    { id: 1, email: 'admin@test.com', name: 'Admin User', password: 'admin123', role: 'admin' },
    { id: 2, email: 'user@test.com', name: 'Regular User', password: 'user123', role: 'user' }
  ];
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

try {
  challenges = JSON.parse(fs.readFileSync(CHALLENGES_FILE, 'utf8'));
} catch (err) {
  // Default challenges if file doesn't exist
  challenges = [
    { id: 1, userId: 2, initialBalance: 10000, currentBalance: 12500, status: 'active', maxDailyLoss: 500, maxTotalLoss: 2000, profitTarget: 2000 },
    { id: 2, userId: 2, initialBalance: 15000, currentBalance: 14200, status: 'active', maxDailyLoss: 750, maxTotalLoss: 3000, profitTarget: 3000 },
    { id: 3, userId: 2, initialBalance: 8000, currentBalance: 9600, status: 'passed', maxDailyLoss: 400, maxTotalLoss: 1600, profitTarget: 1600 }
  ];
  fs.writeFileSync(CHALLENGES_FILE, JSON.stringify(challenges, null, 2));
}

try {
  trades = JSON.parse(fs.readFileSync(TRADES_FILE, 'utf8'));
} catch (err) {
  // Default trades if file doesn't exist
  trades = [
    { id: 1, userId: 2, challengeId: 1, symbol: 'AAPL', type: 'BUY', price: 150.25, quantity: 10, timestamp: new Date().toISOString(), pnl: 250 }
  ];
  fs.writeFileSync(TRADES_FILE, JSON.stringify(trades, null, 2));
}

// Function to save data to files
const saveData = () => {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
  fs.writeFileSync(CHALLENGES_FILE, JSON.stringify(challenges, null, 2));
  fs.writeFileSync(TRADES_FILE, JSON.stringify(trades, null, 2));
};

// Function to get next ID
const getNextId = (array) => {
  return array.length > 0 ? Math.max(...array.map(item => item.id)) + 1 : 1;
};

// Login endpoint
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  const user = users.find(u => u.email === email && u.password === password);
  
  if (user) {
    const { password, ...userWithoutPassword } = user;
    res.json({ success: true, user: { ...userWithoutPassword, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() } });
  } else {
    res.status(401).json({ success: false, error: 'Invalid credentials' });
  }
});

// Register endpoint
app.post('/api/register', (req, res) => {
  const { name, email, password } = req.body;
  
  if (users.find(u => u.email === email)) {
    return res.status(400).json({ success: false, error: 'Email already used' });
  }
  
  const newUser = {
    id: getNextId(users),
    name,
    email,
    password,
    role: 'user'
  };
  
  users.push(newUser);
  saveData(); // Persist data
  res.json({ success: true, userId: newUser.id });
});

// Get user challenges
app.get('/api/user/:userId/challenges', (req, res) => {
  const userId = parseInt(req.params.userId);
  const userChallenges = challenges.filter(c => c.user_id === userId);
  res.json(userChallenges);
});

// Get user trades
app.get('/api/user/:userId/trades', (req, res) => {
  const userId = parseInt(req.params.userId);
  const userTrades = trades.filter(t => t.user_id === userId);
  res.json(userTrades);
});

// Update challenge
app.put('/api/challenge/:challengeId', (req, res) => {
  const challengeId = parseInt(req.params.challengeId);
  const updates = req.body;
  
  // Map field names if needed
  const mappedUpdates = {};
  for (const [key, value] of Object.entries(updates)) {
    // Convert camelCase to snake_case for our data structure
    const snakeCaseKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
    mappedUpdates[snakeCaseKey] = value;
  }
  
  const challengeIndex = challenges.findIndex(c => c.id === challengeId);
  if (challengeIndex !== -1) {
    challenges[challengeIndex] = { ...challenges[challengeIndex], ...mappedUpdates };
    saveData(); // Persist data
    res.json({ success: true });
  } else {
    res.json({ success: false });
  }
});

// Add challenge
app.post('/api/challenges', (req, res) => {
  const challengeData = req.body;
  
  // Map the fields correctly
  const newChallenge = {
    id: getNextId(challenges),
    user_id: challengeData.user_id,
    initial_balance: challengeData.initial_balance,
    current_balance: challengeData.current_balance || challengeData.initial_balance,
    status: challengeData.status || 'active',
    max_daily_loss: challengeData.max_daily_loss,
    max_total_loss: challengeData.max_total_loss,
    profit_target: challengeData.profit_target,
    created_at: challengeData.created_at || new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  
  challenges.push(newChallenge);
  saveData(); // Persist data
  res.json({ success: true, id: newChallenge.id });
});

// Add trade
app.post('/api/trade', (req, res) => {
  const tradeData = req.body;
  
  const newTrade = {
    id: getNextId(trades),
    user_id: tradeData.user_id,
    challenge_id: tradeData.challengeId || tradeData.challenge_id,
    symbol: tradeData.symbol,
    type: tradeData.type,
    price: tradeData.price,
    quantity: tradeData.quantity,
    pnl: tradeData.pnl || 0,
    timestamp: new Date().toISOString()
  };
  
  trades.push(newTrade);
  saveData(); // Persist data
  res.json({ success: true });
});

app.listen(PORT, () => {
  console.log(`Mock backend server running on http://localhost:${PORT}`);
});