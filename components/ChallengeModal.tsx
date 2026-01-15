import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { X, CreditCard, Banknote, Smartphone } from 'lucide-react';
import { useUser } from '../context/UserContext';

interface Challenge {
  id: string;
  userId: string;
  initialBalance: number;
  currentBalance: number;
  status: 'active' | 'passed' | 'failed';
  maxDailyLoss: number;
  maxTotalLoss: number;
  profitTarget: number;
  createdAt: string;
}

interface ChallengeModalProps {
  challenge?: Challenge;
  action?: string;
  isOpen: boolean;
  onClose: () => void;
  onCreateChallenge?: (challengeData: any) => void;
}

const ChallengeModal: React.FC<ChallengeModalProps> = ({ 
  challenge,
  action,
  isOpen, 
  onClose, 
  onCreateChallenge 
}) => {
  const { t } = useTranslation();
  const { user, updateChallenge, addTrade, addChallenge } = useUser();
  
  // State for creating new challenges
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('');
  const [initialBalance, setInitialBalance] = useState<number>(10000);
  const [maxDailyLossPercent, setMaxDailyLossPercent] = useState<number>(5);
  const [maxTotalLossPercent, setMaxTotalLossPercent] = useState<number>(20);
  const [profitTargetPercent, setProfitTargetPercent] = useState<number>(20);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  // Predefined challenge templates
  const challengeTemplates = [
    {
      id: 'starter',
      name: t('starterChallenge'),
      initialBalance: 2000,
      cost: 200,
      maxDailyLossPercent: 5,
      maxTotalLossPercent: 10,
      profitTargetPercent: 10,
      description: t('starterChallengeDescription')
    },
    {
      id: 'standard',
      name: t('standardChallenge'),
      initialBalance: 5000,
      cost: 500,
      maxDailyLossPercent: 5,
      maxTotalLossPercent: 15,
      profitTargetPercent: 15,
      description: t('standardChallengeDescription')
    },
    {
      id: 'professional',
      name: t('professionalChallenge'),
      initialBalance: 10000,
      cost: 1000,
      maxDailyLossPercent: 5,
      maxTotalLossPercent: 20,
      profitTargetPercent: 20,
      description: t('professionalChallengeDescription')
    }
  ];
  
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  
  // Determine if this is a new challenge creation or existing challenge view
  const isNewChallenge = !challenge || action === 'create';

  const paymentMethods = [
    { id: 'credit_card', name: t('creditCard'), icon: CreditCard },
    { id: 'bank_transfer', name: t('bankTransfer'), icon: Banknote },
    { id: 'mobile_payment', name: t('mobilePayment'), icon: Smartphone },
  ];

  if (!isOpen) return null;

  const handleCreateChallenge = async () => {
    if (!selectedTemplate || !selectedPaymentMethod) {
      alert(selectedTemplate ? t('pleaseSelectPaymentMethod') : t('pleaseSelectChallengeType'));
      return;
    }

    setIsLoading(true);
    
    try {
      // Calculate values based on percentage
      const maxDailyLoss = (initialBalance * maxDailyLossPercent) / 100;
      const maxTotalLoss = (initialBalance * maxTotalLossPercent) / 100;
      const profitTarget = (initialBalance * profitTargetPercent) / 100;
      
      // Create challenge data in the format expected by the Challenge interface
      const challengeData = {
        userId: user?.id?.toString(),
        initialBalance,
        currentBalance: initialBalance,
        status: 'active' as const,
        maxDailyLoss,
        maxTotalLoss,
        profitTarget,
        createdAt: new Date().toISOString(),
        paymentMethod: selectedPaymentMethod
      };

      console.log('Creating challenge with data:', challengeData);
      
      try {
        // Add the challenge using the context function
        const newChallenge = await addChallenge(challengeData);
        
        console.log('Challenge creation result:', newChallenge);
        
        if (newChallenge) {
          // Call onCreateChallenge if provided
          if (onCreateChallenge) {
            onCreateChallenge(newChallenge);
          }
          
          onClose();
        } else {
          alert(t('errorCreatingChallenge'));
        }
      } catch (error) {
        console.error('Direct error in handleCreateChallenge:', error);
        alert(t('errorCreatingChallenge') + ': ' + (error as Error).message);
      }
    } catch (error) {
      console.error('Error creating challenge:', error);
      alert(t('errorCreatingChallenge'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-xl w-full max-w-lg border border-slate-700 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b border-slate-700">
          <h2 className="text-xl font-bold text-white">
            {isNewChallenge ? t('startNewChallenge') : 
             action === 'view' ? t('viewChallengeDetails') : 
             action === 'manage' ? t('manageChallenge') : t('challengeDetails')}
          </h2>
          <button 
            onClick={onClose} 
            className="text-slate-400 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {isNewChallenge ? (
          // New Challenge Creation Form
          <div className="p-6 space-y-6">
            {/* Challenge Template Selection */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-3">
                {t('selectChallengeType')}
              </label>
              <div className="grid grid-cols-1 gap-3">
                {challengeTemplates.map((template) => (
                  <div 
                    key={template.id}
                    onClick={() => {
                      setSelectedTemplate(template.id);
                      setInitialBalance(template.initialBalance);
                      setMaxDailyLossPercent(template.maxDailyLossPercent);
                      setMaxTotalLossPercent(template.maxTotalLossPercent);
                      setProfitTargetPercent(template.profitTargetPercent);
                    }}
                    className={`p-4 rounded-lg border cursor-pointer transition-all ${
                      selectedTemplate === template.id
                        ? 'border-emerald-500 bg-emerald-500/10'
                        : 'border-slate-600 bg-slate-700 hover:border-slate-500'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-white">{template.name}</h3>
                        <p className="text-xs text-slate-400 mt-1">{template.description}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-white">{template.cost}DH - ${template.initialBalance.toLocaleString()}</div>
                        <div className="text-xs text-slate-400">{template.profitTargetPercent}% {t('target')}</div>
                      </div>
                    </div>
                    <div className="flex gap-4 mt-2 text-xs text-slate-400">
                      <div>{t('dailyLossLimit')}: {template.maxDailyLossPercent}%</div>
                      <div>{t('totalLossLimit')}: {template.maxTotalLossPercent}%</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Payment Method Selection */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                {t('paymentMethod')}
              </label>
              <div className="grid grid-cols-1 gap-3">
                {paymentMethods.map((method) => {
                  const IconComponent = method.icon;
                  return (
                    <button
                      key={method.id}
                      type="button"
                      onClick={() => setSelectedPaymentMethod(method.id)}
                      className={`flex items-center p-3 rounded-lg border transition-colors ${
                        selectedPaymentMethod === method.id
                          ? 'border-emerald-500 bg-emerald-500/10'
                          : 'border-slate-600 bg-slate-700 hover:border-slate-500'
                      }`}
                    >
                      <IconComponent size={20} className="mr-3 text-slate-300" />
                      <span className="text-slate-300">{method.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Challenge Summary */}
            {selectedTemplate && (
              <div className="bg-slate-700/50 p-4 rounded-lg">
                <h3 className="font-medium text-slate-300 mb-2">{t('challengeSummary')}</h3>
                <div className="space-y-1 text-sm text-slate-400">
                  <div className="flex justify-between">
                    <span>{t('initialBalance')}:</span>
                    <span className="text-white">${initialBalance.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{t('profitTarget')}:</span>
                    <span className="text-emerald-400">
                      ${(initialBalance * profitTargetPercent / 100).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>{t('maxDailyLoss')}:</span>
                    <span className="text-red-400">
                      ${(initialBalance * maxDailyLossPercent / 100).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>{t('maxTotalLoss')}:</span>
                    <span className="text-red-400">
                      ${(initialBalance * maxTotalLossPercent / 100).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          // Existing Challenge Details View
          <div className="p-6 space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-400">{t('challengeId')}:</span>
                <span className="text-white">#{challenge?.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">{t('status')}:</span>
                <span className={`px-2 py-1 rounded-full text-xs ${
                  challenge?.status === 'active' ? 'bg-emerald-500/20 text-emerald-400' :
                  challenge?.status === 'passed' ? 'bg-blue-500/20 text-blue-400' :
                  challenge?.status === 'failed' ? 'bg-red-500/20 text-red-400' :
                  'bg-yellow-500/20 text-yellow-400'
                }`}>
                  {t(challenge?.status || '')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">{t('initialBalance')}:</span>
                <span className="text-white">${challenge?.initialBalance?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">{t('currentBalance')}:</span>
                <span className="text-white">${challenge?.currentBalance?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">{t('profitTarget')}:</span>
                <span className="text-emerald-400">${challenge?.profitTarget?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">{t('maxDailyLoss')}:</span>
                <span className="text-red-400">${challenge?.maxDailyLoss?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">{t('maxTotalLoss')}:</span>
                <span className="text-red-400">${challenge?.maxTotalLoss?.toLocaleString()}</span>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-end space-x-3 p-6 border-t border-slate-700">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-slate-600 text-slate-300 hover:bg-slate-700 transition-colors"
          >
            {t('close')}
          </button>
          {isNewChallenge && (
            <button
              type="button"
              onClick={handleCreateChallenge}
              disabled={!selectedPaymentMethod || isLoading}
              className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? t('processing') : t('startChallenge')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChallengeModal;