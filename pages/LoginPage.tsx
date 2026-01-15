import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useUser } from '../context/UserContext';

const LoginPage: React.FC = () => {
  const { login } = useUser();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const success = await login(email, password);
      if (success) {
        navigate('/dashboard');
      } else {
        setError(t('loginFailed'));
      }
    } catch (err) {
      setError(t('loginError'));
    } finally {
      setLoading(false);
    }
  };

  // Demo credentials info
  const demoCredentials = [
    { email: 'user@example.com', password: 'password', role: t('regularUser') },
    { email: 'admin@example.com', password: 'password', role: t('adminUser') },
    { email: 'superadmin@example.com', password: 'password', role: t('superAdminUser') },
    { email: 'john@example.com', password: 'password123', role: t('regularUser') }
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-blue-500 bg-clip-text text-transparent mb-2">
            TradeSense AI
          </h1>
          <p className="text-slate-400">{t('welcomeBack')}</p>
        </div>

        <div className="modern-card p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
                {t('email')}
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                placeholder="your@email.com"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-2">
                {t('password')}
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                placeholder={t('enterPassword')}
                required
              />
            </div>

            {error && (
              <div className="text-red-400 text-sm text-center py-2">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-4 rounded-lg transition duration-200 disabled:opacity-50"
            >
              {loading ? t('loggingIn') : t('login')}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-700">
            <p className="text-center text-slate-400 text-sm mb-4">{t('demoCredentials')}</p>
            <div className="space-y-2 text-xs">
              {demoCredentials.map((cred, index) => (
                <div key={index} className="flex justify-between bg-slate-700/50 p-2 rounded">
                  <span className="text-slate-300">{cred.email}</span>
                  <span className="text-emerald-400">{cred.role}</span>
                </div>
              ))}
              <div className="text-center text-slate-300 text-xs mt-2">
                {t('password')}: password / password123
              </div>
            </div>
          </div>

          <div className="mt-6 text-center text-sm text-slate-400">
            {t('noAccount')}{' '}
            <Link to="/register" className="text-emerald-400 hover:text-emerald-300 font-medium">
              {t('register')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;