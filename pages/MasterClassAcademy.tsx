import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

const MasterClassAcademy: React.FC = () => {
  const { t } = useTranslation();
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);

  // Mock course data
  const courses = [
    {
      id: 'trading-lessons',
      title: t('tradingLessons'),
      description: t('tradingLessonsDesc'),
      icon: '📚',
      level: t('beginnerToAdvanced'),
      modules: [
        t('basicTradingConcepts'),
        t('advancedStrategies'),
        t('marketPsychology'),
        t('positionSizing')
      ]
    },
    {
      id: 'technical-analysis',
      title: t('technicalFundamentalAnalysis'),
      description: t('technicalFundamentalAnalysisDesc'),
      icon: '📊',
      level: t('intermediateToAdvanced'),
      modules: [
        t('chartPatterns'),
        t('indicators'),
        t('fundamentalFactors'),
        t('economicIndicators')
      ]
    },
    {
      id: 'risk-management',
      title: t('riskWorkshops'),
      description: t('riskWorkshopsDesc'),
      icon: '🛡️',
      level: t('allLevels'),
      modules: [
        t('capitalProtection'),
        t('positionSizing'),
        t('stopLossStrategies'),
        t('portfolioDiversification')
      ]
    },
    {
      id: 'webinars',
      title: t('liveWebinars'),
      description: t('liveWebinarsDesc'),
      icon: '🎤',
      level: t('allLevels'),
      modules: [
        t('weeklyWebinars'),
        t('qnaSessions'),
        t('expertInterviews'),
        t('marketOutlook')
      ]
    },
    {
      id: 'ai-learning',
      title: t('aiLearningPaths'),
      description: t('aiLearningPathsDesc'),
      icon: '🧠',
      level: t('personalized'),
      modules: [
        t('adaptiveLearning'),
        t('skillAssessment'),
        t('progressTracking'),
        t('recommendations')
      ]
    },
    {
      id: 'practice-challenges',
      title: t('practiceChallenges'),
      description: t('practiceChallengesDesc'),
      icon: '🎯',
      level: t('handsOn'),
      modules: [
        t('simulatedTrading'),
        t('quizChallenges'),
        t('realMarketScenarios'),
        t('performanceMetrics')
      ]
    }
  ];

  const handleCourseClick = (courseId: string) => {
    setSelectedCourse(selectedCourse === courseId ? null : courseId);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white p-6">
      <div className="max-w-6xl mx-auto">
        <header className="text-center mb-12 pt-8">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-emerald-400 to-blue-500 bg-clip-text text-transparent mb-4">
            {t('masterclassAcademy')}
          </h1>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto">
            {t('masterclassDescription')}
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {courses.map((course) => (
            <div 
              key={course.id}
              className={`bg-slate-800/50 backdrop-blur-sm border rounded-xl p-6 cursor-pointer transition-all transform hover:scale-105 hover:border-emerald-500 ${
                selectedCourse === course.id ? 'border-emerald-500 scale-105' : 'border-slate-700'
              }`}
              onClick={() => handleCourseClick(course.id)}
            >
              <div className="text-emerald-400 text-3xl mb-4">{course.icon}</div>
              <h3 className="text-xl font-bold mb-2">{course.title}</h3>
              <p className="text-slate-300 mb-3">{course.description}</p>
              <div className="text-xs text-emerald-400 bg-emerald-900/30 px-2 py-1 rounded inline-block">
                {course.level}
              </div>
              
              {selectedCourse === course.id && (
                <div className="mt-4 pt-4 border-t border-slate-700">
                  <h4 className="font-bold text-emerald-400 mb-2">{t('modules')}:</h4>
                  <ul className="space-y-1">
                    {course.modules.map((module, index) => (
                      <li key={index} className="text-sm text-slate-300 flex items-start">
                        <span className="text-emerald-400 mr-2">•</span> {module}
                      </li>
                    ))}
                  </ul>
                  <button className="mt-4 w-full py-2 bg-emerald-600 hover:bg-emerald-500 rounded-lg transition">
                    {t('startLearning')}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-8 mb-12 text-center">
          <h2 className="text-2xl font-bold mb-4">{t('masterclassHeading')}</h2>
          <p className="text-slate-300 text-lg max-w-3xl mx-auto">
            {t('masterclassSubheading')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
            <h3 className="text-xl font-bold mb-4 text-emerald-400">{t('beginnerToAdvanced')}</h3>
            <ul className="space-y-3 text-slate-300">
              <li className="flex items-start">
                <span className="text-emerald-400 mr-2">✓</span>
                <span>{t('basicTradingConcepts')}</span>
              </li>
              <li className="flex items-start">
                <span className="text-emerald-400 mr-2">✓</span>
                <span>{t('advancedStrategies')}</span>
              </li>
              <li className="flex items-start">
                <span className="text-emerald-400 mr-2">✓</span>
                <span>{t('marketPsychology')}</span>
              </li>
              <li className="flex items-start">
                <span className="text-emerald-400 mr-2">✓</span>
                <span>{t('positionSizing')}</span>
              </li>
            </ul>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
            <h3 className="text-xl font-bold mb-4 text-emerald-400">{t('expertLedTraining')}</h3>
            <ul className="space-y-3 text-slate-300">
              <li className="flex items-start">
                <span className="text-emerald-400 mr-2">✓</span>
                <span>{t('liveSessions')}</span>
              </li>
              <li className="flex items-start">
                <span className="text-emerald-400 mr-2">✓</span>
                <span>{t('qnaWithExperts')}</span>
              </li>
              <li className="flex items-start">
                <span className="text-emerald-400 mr-2">✓</span>
                <span>{t('caseStudies')}</span>
              </li>
              <li className="flex items-start">
                <span className="text-emerald-400 mr-2">✓</span>
                <span>{t('performanceReviews')}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MasterClassAcademy;