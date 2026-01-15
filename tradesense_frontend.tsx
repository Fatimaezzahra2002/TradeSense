import React, { useState, useEffect, createContext, useContext } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Award, Users, Activity, CheckCircle, XCircle, Clock } from 'lucide-react';

// API Service
const API_URL = 'http://localhost:5000/api';

const apiService = {
  async login(email, password) {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    return res.json();
  },
  
  async register(data) {
    const res = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },
  
  async getChallenges(token) {
    const res = await fetch(`${API_URL}/trading/challenges`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return res.json();
  },
  
  async getChallengeDetails(challengeId, token) {
    const res = await fetch(`${API_URL}/trading/challenges/${challengeId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return res.json();
  },
  
  async executeTrade(data, token) {
    const res = await fetch(`${API_URL}/trading/execute`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });
    return res.json();
  },
  
  async closeTrade(tradeId, token) {
    const res = await fetch(`${API_URL}/trading/close/${tradeId}`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return res.json();
  },
  
  async getMarketData(ticker, marketType, token) {
    const res = await fetch(`${API_URL}/trading/market-data/${ticker}?market_type=${marketType}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return res.json();
  },
  
  async getPlans() {
    const res = await fetch(`${API_URL}/payment/plans`);
    return res.json();
  },
  
  async mockPayment(planId, method, token) {
    const res = await fetch(`${API_URL}/payment/mock`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ plan_id: planId, payment_method: method })
    });
    return res.json();
  },
  
  async getLeaderboard() {
    const res = await fetch(`${API_URL}/leaderboard`);
    return res.json();
  }
};

// Auth Context
const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  
  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }, [token]);
  
  const login = async (email, password) => {
    const data = await apiService.login(email, password);
    if (data.access_token) {
      setToken(data.access_token);
      setUser(data.user);
      return true;
    }
    return false;
  };
  
  const register = async (userData) => {
    const data = await apiService.register(userData);
    if (data.access_token) {
      setToken(data.access_token);
      setUser(data.user);
      return true;
    }
    return false;
  };
  
  const logout = () => {
    setToken(null);
    setUser(null);
  };
  
  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
};

const useAuth = () => useContext(AuthContext);

// Landing Page Component
const LandingPage = ({ onNavigate }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="p-6 flex justify-between items-center">
        <div className="text-3xl font-bold text-white">TradeSense AI</div>
        <div className="space-x-4">
          <button onClick={() => onNavigate('login')} className="px-6 py-2 text-white hover:text-purple-300 transition">
            Se connecter
          </button>
          <button onClick={() => onNavigate('register')} className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition">
            Commencer
          </button>
        </div>
      </header>
      
      {/* Hero Section */}
      <div className="container mx-auto px-6 py-20 text-center">
        <h1 className="text-6xl font-bold text-white mb-6">
          La Première Prop Firm <span className="text-purple-400">Assistée par IA</span> pour l'Afrique
        </h1>
        <p className="text-xl text-gray-300 mb-12 max-w-3xl mx-auto">
          TradeSense AI combine analyses IA en temps réel, signaux de trading intelligents et formation premium dans un écosystème puissant
        </p>
        <button onClick={() => onNavigate('pricing')} className="px-8 py-4 bg-purple-600 text-white text-lg rounded-lg hover:bg-purple-700 transition transform hover:scale-105">
          Passer un Challenge
        </button>
      </div>
      
      {/* Features */}
      <div className="container mx-auto px-6 py-20">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="bg-white/10 backdrop-blur-lg p-6 rounded-xl">
            <Activity className="w-12 h-12 text-purple-400 mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Trading IA</h3>
            <p className="text-gray-300">Signaux Achat/Vente en temps réel avec détection de risque</p>
          </div>
          <div className="bg-white/10 backdrop-blur-lg p-6 rounded-xl">
            <TrendingUp className="w-12 h-12 text-green-400 mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Marchés Réels</h3>
            <p className="text-gray-300">Données en direct des marchés US, Crypto et Maroc</p>
          </div>
          <div className="bg-white/10 backdrop-blur-lg p-6 rounded-xl">
            <Users className="w-12 h-12 text-blue-400 mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Communauté</h3>
            <p className="text-gray-300">Réseau social pour traders et experts</p>
          </div>
          <div className="bg-white/10 backdrop-blur-lg p-6 rounded-xl">
            <Award className="w-12 h-12 text-yellow-400 mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">MasterClass</h3>
            <p className="text-gray-300">Formation complète du débutant à l'expert</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Auth Components
const LoginForm = ({ onNavigate }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await login(email, password);
    if (success) {
      onNavigate('dashboard');
    } else {
      setError('Identifiants invalides');
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-purple-900 flex items-center justify-center p-6">
      <div className="bg-white/10 backdrop-blur-lg p-8 rounded-xl w-full max-w-md">
        <h2 className="text-3xl font-bold text-white mb-6">Connexion</h2>
        {error && <div className="bg-red-500/20 text-red-300 p-3 rounded mb-4">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400"
            required
          />
          <input
            type="password"
            placeholder="Mot de passe"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400"
            required
          />
          <button type="submit" className="w-full px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition">
            Se connecter
          </button>
        </form>
        <p className="text-gray-400 mt-4 text-center">
          Pas de compte? <button onClick={() => onNavigate('register')} className="text-purple-400 hover:underline">S'inscrire</button>
        </p>
      </div>
    </div>
  );
};

const RegisterForm = ({ onNavigate }) => {
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    full_name: '',
    country: 'Morocco'
  });
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await register(formData);
    if (success) {
      onNavigate('pricing');
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-purple-900 flex items-center justify-center p-6">
      <div className="bg-white/10 backdrop-blur-lg p-8 rounded-xl w-full max-w-md">
        <h2 className="text-3xl font-bold text-white mb-6">Inscription</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Nom d'utilisateur"
            value={formData.username}
            onChange={(e) => setFormData({...formData, username: e.target.value})}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400"
            required
          />
          <input
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400"
            required
          />
          <input
            type="password"
            placeholder="Mot de passe"
            value={formData.password}
            onChange={(e) => setFormData({...formData, password: e.target.value})}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400"
            required
          />
          <input
            type="text"
            placeholder="Nom complet"
            value={formData.full_name}
            onChange={(e) => setFormData({...formData, full_name: e.target.value})}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400"
          />
          <button type="submit" className="w-full px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition">
            S'inscrire
          </button>
        </form>
        <p className="text-gray-400 mt-4 text-center">
          Déjà un compte? <button onClick={() => onNavigate('login')} className="text-purple-400 hover:underline">Se connecter</button>
        </p>
      </div>
    </div>
  );
};

// Pricing Component
const PricingPage = ({ onNavigate }) => {
  const { token } = useAuth();
  const [plans] = useState([
    { id: 1, name: 'Starter', price: 200, balance: '5 000 $', description: 'Challenge de démarrage' },
    { id: 2, name: 'Pro', price: 500, balance: '15 000 $', description: 'Challenge professionnel' },
    { id: 3, name: 'Elite', price: 1000, balance: '50 000 $', description: 'Challenge élite' }
  ]);
  const [loading, setLoading] = useState(false);
  
  const handlePurchase = async (planId, method) => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    const result = await apiService.mockPayment(planId, method, token);
    setLoading(false);
    if (result.message) {
      alert('Paiement réussi! Votre challenge est activé.');
      onNavigate('dashboard');
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-purple-900 p-6">
      <div className="container mx-auto max-w-6xl">
        <h1 className="text-4xl font-bold text-white text-center mb-12">Choisissez votre Challenge</h1>
        <div className="grid md:grid-cols-3 gap-8">
          {plans.map(plan => (
            <div key={plan.id} className="bg-white/10 backdrop-blur-lg p-8 rounded-xl border-2 border-white/20">
              <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
              <div className="text-4xl font-bold text-purple-400 mb-4">{plan.price} DH</div>
              <div className="text-xl text-gray-300 mb-4">Solde: {plan.balance}</div>
              <p className="text-gray-400 mb-6">{plan.description}</p>
              <ul className="space-y-2 mb-6">
                <li className="text-gray-300 flex items-center"><CheckCircle className="w-5 h-5 text-green-400 mr-2" /> Objectif: +10%</li>
                <li className="text-gray-300 flex items-center"><CheckCircle className="w-5 h-5 text-green-400 mr-2" /> Perte max: -10%</li>
                <li className="text-gray-300 flex items-center"><CheckCircle className="w-5 h-5 text-green-400 mr-2" /> Perte journalière: -5%</li>
              </ul>
              <div className="space-y-2">
                <button
                  onClick={() => handlePurchase(plan.id, 'CMI_MOCK')}
                  disabled={loading}
                  className="w-full px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition disabled:opacity-50"
                >
                  {loading ? 'Traitement...' : 'Payer avec CMI'}
                </button>
                <button
                  onClick={() => handlePurchase(plan.id, 'PAYPAL')}
                  disabled={loading}
                  className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                >
                  Payer avec PayPal
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Trading Dashboard
const TradingDashboard = ({ onNavigate }) => {
  const { token, logout } = useAuth();
  const [challenges, setChallenges] = useState([]);
  const [activeChallenge, setActiveChallenge] = useState(null);
  const [marketData, setMarketData] = useState(null);
  const [selectedTicker, setSelectedTicker] = useState('AAPL');
  const [quantity, setQuantity] = useState(1);
  
  const tickers = [
    { symbol: 'AAPL', name: 'Apple', type: 'US' },
    { symbol: 'TSLA', name: 'Tesla', type: 'US' },
    { symbol: 'BTC-USD', name: 'Bitcoin', type: 'CRYPTO' },
    { symbol: 'ETH-USD', name: 'Ethereum', type: 'CRYPTO' }
  ];
  
  useEffect(() => {
    loadChallenges();
  }, []);
  
  useEffect(() => {
    if (activeChallenge) {
      loadMarketData();
      const interval = setInterval(loadMarketData, 30000);
      return () => clearInterval(interval);
    }
  }, [activeChallenge, selectedTicker]);
  
  const loadChallenges = async () => {
    const data = await apiService.getChallenges(token);
    setChallenges(data);
    const active = data.find(c => c.status === 'active');
    if (active) {
      const details = await apiService.getChallengeDetails(active.id, token);
      setActiveChallenge(details);
    }
  };
  
  const loadMarketData = async () => {
    const ticker = tickers.find(t => t.symbol === selectedTicker);
    const data = await apiService.getMarketData(selectedTicker, ticker.type, token);
    if (data && !data.error) {
      setMarketData(data);
    }
  };
  
  const executeTrade = async (type) => {
    if (!activeChallenge) return;
    const ticker = tickers.find(t => t.symbol === selectedTicker);
    await apiService.executeTrade({
      challenge_id: activeChallenge.id,
      ticker: selectedTicker,
      market_type: ticker.type,
      trade_type: type,
      quantity: quantity,
      ai_signal: type
    }, token);
    loadChallenges();
  };
  
  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <header className="bg-slate-800 p-4 flex justify-between items-center border-b border-slate-700">
        <div className="text-2xl font-bold text-white">TradeSense AI</div>
        <div className="flex items-center space-x-4">
          <button onClick={() => onNavigate('leaderboard')} className="px-4 py-2 text-white hover:text-purple-400">
            Classement
          </button>
          <button onClick={logout} className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">
            Déconnexion
          </button>
        </div>
      </header>
      
      {/* Main Content */}
      <div className="container mx-auto p-6">
        {!activeChallenge ? (
          <div className="text-center py-20">
            <h2 className="text-2xl text-white mb-4">Aucun challenge actif</h2>
            <button onClick={() => onNavigate('pricing')} className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
              Commencer un Challenge
            </button>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Challenge Stats */}
            <div className="lg:col-span-3 grid md:grid-cols-4 gap-4">
              <div className="bg-slate-800 p-4 rounded-lg">
                <div className="text-gray-400 text-sm">Équité Actuelle</div>
                <div className="text-2xl font-bold text-white">${activeChallenge.current_equity.toFixed(2)}</div>
              </div>
              <div className="bg-slate-800 p-4 rounded-lg">
                <div className="text-gray-400 text-sm">P&L Total</div>
                <div className={`text-2xl font-bold ${activeChallenge.total_profit_loss >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {activeChallenge.total_profit_loss >= 0 ? '+' : ''}{activeChallenge.total_profit_loss_percent.toFixed(2)}%
                </div>
              </div>
              <div className="bg-slate-800 p-4 rounded-lg">
                <div className="text-gray-400 text-sm">P&L Journalier</div>
                <div className={`text-2xl font-bold ${activeChallenge.daily_profit_loss >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {activeChallenge.daily_profit_loss >= 0 ? '+' : ''}{activeChallenge.daily_profit_loss_percent.toFixed(2)}%
                </div>
              </div>
              <div className="bg-slate-800 p-4 rounded-lg">
                <div className="text-gray-400 text-sm">Status</div>
                <div className="flex items-center mt-2">
                  {activeChallenge.status === 'active' && <Clock className="w-6 h-6 text-yellow-400" />}
                  {activeChallenge.status === 'passed' && <CheckCircle className="w-6 h-6 text-green-400" />}
                  {activeChallenge.status === 'failed' && <XCircle className="w-6 h-6 text-red-400" />}
                  <span className="ml-2 text-white capitalize">{activeChallenge.status}</span>
                </div>
              </div>
            </div>
            
            {/* Chart */}
            <div className="lg:col-span-2 bg-slate-800 p-6 rounded-lg">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-white">Graphique du Marché</h3>
                <select
                  value={selectedTicker}
                  onChange={(e) => setSelectedTicker(e.target.value)}
                  className="px-4 py-2 bg-slate-700 text-white rounded border border-slate-600"
                >
                  {tickers.map(t => (
                    <option key={t.symbol} value={t.symbol}>{t.name} ({t.symbol})</option>
                  ))}
                </select>
              </div>
              
              {marketData && (
                <>
                  <div className="mb-4">
                    <div className="text-3xl font-bold text-white">${marketData.current_price.toFixed(2)}</div>
                    <div className={`text-lg ${marketData.change_percent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {marketData.change_percent >= 0 ? '+' : ''}{marketData.change_percent.toFixed(2)}%
                    </div>
                  </div>
                  
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={marketData.historical}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis dataKey="time" stroke="#94a3b8" tick={{ fontSize: 12 }} />
                      <YAxis stroke="#94a3b8" domain={['auto', 'auto']} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }}
                        labelStyle={{ color: '#94a3b8' }}
                      />
                      <Line type="monotone" dataKey="price" stroke="#8b5cf6" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </>
              )}
            </div>
            
            {/* Trading Panel */}
            <div className="bg-slate-800 p-6 rounded-lg">
              <h3 className="text-xl font-bold text-white mb-4">Exécuter un Trade</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-gray-400 text-sm">Quantité</label>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    min="1"
                    className="w-full px-4 py-2 bg-slate-700 text-white rounded border border-slate-600 mt-1"
                  />
                </div>
                <button
                  onClick={() => executeTrade('BUY')}
                  className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center justify-center"
                >
                  <TrendingUp className="w-5 h-5 mr-2" /> Acheter
                </button>
                <button
                  onClick={() => executeTrade('SELL')}
                  className="w-full px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center justify-center"
                >
                  <TrendingDown className="w-5 h-5 mr-2" /> Vendre
                </button>
                
                <div className="mt-6 p-4 bg-purple-900/30 rounded-lg border border-purple-600/50">
                  <h4 className="text-white font-bold mb-2 flex items-center">
                    <Activity className="w-5 h-5 mr-2" /> Signal IA
                  </h4>
                  <div className="text-green-400 text-lg font-bold">ACHAT</div>
                  <div className="text-gray-400 text-sm">Confiance: 78%</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Leaderboard Component
const Leaderboard = ({ onNavigate }) => {
  const [leaders] = useState([
    { rank: 1, username: 'TraderPro', country: 'Morocco', profit: 15.8, trades: 45 },
    { rank: 2, username: 'CryptoKing', country: 'Algeria', profit: 12.3, trades: 38 },
    { rank: 3, username: 'AITrader', country: 'Tunisia', profit: 10.5, trades: 52 }
  ]);
  
  return (
    <div className="min-h-screen bg-slate-900 p-6">
      <div className="container mx-auto max-w-4xl">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-white">Classement</h1>
          <button onClick={() => onNavigate('dashboard')} className="px-4 py-2 bg-slate-700 text-white rounded hover:bg-slate-600">
            Retour
          </button>
        </div>
        
        <div className="bg-slate-800 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-700">
              <tr>
                <th className="px-6 py-4 text-left text-white">Rang</th>
                <th className="px-6 py-4 text-left text-white">Trader</th>
                <th className="px-6 py-4 text-left text-white">Pays</th>
                <th className="px-6 py-4 text-right text-white">Profit %</th>
                <th className="px-6 py-4 text-right text-white">Trades</th>
              </tr>
            </thead>
            <tbody>
              {leaders.map((leader) => (
                <tr key={leader.rank} className="border-t border-slate-700">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <Award className={`w-6 h-6 mr-2 ${leader.rank === 1 ? 'text-yellow-400' : leader.rank === 2 ? 'text-gray-400' : 'text-orange-600'}`} />
                      <span className="text-white font-bold">{leader.rank}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-white">{leader.username}</td>
                  <td className="px-6 py-4 text-gray-400">{leader.country}</td>
                  <td className="px-6 py-4 text-right text-green-400 font-bold">+{leader.profit}%</td>
                  <td className="px-6 py-4 text-right text-gray-400">{leader.trades}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// Main App Component
export default function App() {
  const [currentPage, setCurrentPage] = useState('landing');
  
  return (
    <AuthProvider>
      <div className="font-sans">
        {currentPage === 'landing' && <LandingPage onNavigate={setCurrentPage} />}
        {currentPage === 'login' && <LoginForm onNavigate={setCurrentPage} />}
        {currentPage === 'register' && <RegisterForm onNavigate={setCurrentPage} />}
        {currentPage === 'pricing' && <PricingPage onNavigate={setCurrentPage} />}
        {currentPage === 'dashboard' && <TradingDashboard onNavigate={setCurrentPage} />}
        {currentPage === 'leaderboard' && <Leaderboard onNavigate={setCurrentPage} />}
      </div>
    </AuthProvider>
  );
}