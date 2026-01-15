import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { ChallengeStatus } from '../types';
import { useTranslation } from 'react-i18next';

const PricingPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const { setActiveChallenge } = useUser();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handlePayment = async (plan: string, amount: number) => {
    setLoading(true);
    // Simulate payment API call
    await new Promise(res => setTimeout(res, 2000));

    const newChallenge = {
      id: Math.random().toString(36).substr(2, 9),
      userId: 'usr_123',
      initialBalance: amount * 10, // Virtual balance is 10x the fee
      currentBalance: amount * 10,
      status: ChallengeStatus.ACTIVE,
      maxDailyLoss: (amount * 10) * 0.05,
      maxTotalLoss: (amount * 10) * 0.10,
      profitTarget: (amount * 10) * 0.10,
      createdAt: new Date().toISOString()
    };

    setActiveChallenge(newChallenge);
    setLoading(false);
    navigate('/dashboard');
  };

  const PlanCard = ({ name, price, capital, popular, onSelect, loading }: {
    name: string;
    price: string;
    capital: string;
    popular?: boolean;
    onSelect: () => void;
    loading: boolean;
  }) => (
    <div className={`relative p-8 modern-card ${popular ? 'border-emerald-500 shadow-emerald-500/20 shadow-2xl scale-105 z-10' : ''}`}>
      {popular && <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-emerald-500 text-white px-4 py-1 rounded-full text-sm font-bold shadow-lg">{t('popular')}</span>}
      <h3 className="text-2xl font-bold mb-2">{name}</h3>
      <div className="text-4xl font-extrabold mb-6">{price}</div>
      <ul className="space-y-4 mb-8 text-slate-300">
        <li className="flex items-center gap-2">✅ {t('capital')} : <span className="text-white font-bold">{capital}</span></li>
        <li className="flex items-center gap-2">✅ {t('dailyDrawdown')} : 5%</li>
        <li className="flex items-center gap-2">✅ {t('totalDrawdown')} : 10%</li>
        <li className="flex items-center gap-2">✅ {t('profitTarget')} : 10%</li>
      </ul>
      <button
        onClick={onSelect}
        disabled={loading}
        className={`w-full py-4 rounded-xl font-bold transition ${popular ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30' : 'bg-slate-700 hover:bg-slate-600 text-white'} disabled:opacity-50`}
      >
        {loading ? t('processing') : t('begin')}
      </button>
    </div>
  );

  return (
    <div className="py-20 px-6 w-full max-w-full">
      <div className="text-center mb-16">
        <h2 className="text-4xl font-bold mb-4">{t('chooseChallenge')}</h2>
        <p className="text-slate-400">{t('proveSkills')}</p>
      </div>

      <div className="w-full grid md:grid-cols-3 gap-8">
        <PlanCard
          name={t('starter')}
          price="200 DH"
          capital="2 000 $"
          onSelect={() => handlePayment('Starter', 2000)}
          loading={loading}
        />
        <PlanCard
          name={t('pro')}
          price="500 DH"
          capital="5 000 $"
          popular
          onSelect={() => handlePayment('Pro', 5000)}
          loading={loading}
        />
        <PlanCard
          name={t('elite')}
          price="1000 DH"
          capital="10 000 $"
          onSelect={() => handlePayment('Elite', 10000)}
          loading={loading}
        />
      </div>

      <div className="mt-16 text-center max-w-2xl mx-auto modern-card p-8">
        <h3 className="text-xl font-bold mb-4">{t('securePayment')}</h3>
        <div className="flex flex-wrap justify-center gap-6 opacity-60">
          <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" alt="PayPal" className="h-6" />
          <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" alt="Visa" className="h-6" />
          <img src="https://cryptologos.cc/logos/bitcoin-btc-logo.svg" alt="BTC" className="h-6" />
        </div>
      </div>
    </div>
  );
};

export default PricingPage;