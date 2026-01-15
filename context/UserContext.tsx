import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { FrontendAuthService } from '../services/frontendAuthService';
import { UserDataService } from '../services/userDataService';
import { ChallengeStatus } from '../types';

export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
  SUPER_ADMIN = 'super_admin'
}

export interface User {
  id: number;
  email: string;
  name: string;
  role: UserRole;
  created_at: Date;
  updated_at: Date;
}

export interface Challenge {
  id: string;
  userId: string;
  initialBalance: number;
  currentBalance: number;
  status: ChallengeStatus;
  maxDailyLoss: number;
  maxTotalLoss: number;
  profitTarget: number;
  createdAt: string;
}

export interface Trade {
  id: string;
  symbol: string;
  type: 'BUY' | 'SELL';
  price: number;
  quantity: number;
  timestamp: string;
  pnl?: number;
}

interface UserContextType {
  currentUser: User | null;
  user: User | null; // Alias pour currentUser
  activeChallenge: Challenge | null;
  allChallenges: Challenge[];
  trades: Trade[];
  login: (email: string, password: string) => Promise<boolean>;
  register: (username: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  setActiveChallenge: (challenge: Challenge) => void;
  updateChallenge: (updates: Partial<Challenge>) => Promise<void>;
  addChallenge: (challengeData: Omit<Challenge, 'id'>) => Promise<Challenge>;
  addTrade: (trade: Trade) => void;
  executeTrade: (symbol: string, type: 'BUY' | 'SELL', price: number, quantity: number) => void;
  isAdmin: boolean;
  isSuperAdmin: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeChallenge, setActiveChallengeState] = useState<Challenge | null>(null);
  const [allChallenges, setAllChallenges] = useState<Challenge[]>([]);
  const [trades, setTrades] = useState<Trade[]>([]);

  // Function to add a new challenge
  const addChallenge = async (challengeData: Omit<Challenge, 'id'>) => {
    console.log('Adding challenge with data:', challengeData);
    
    try {
      // Use the service to create the challenge
      const result = await UserDataService.createChallenge(challengeData);
      
      console.log('Challenge creation result:', result);
      
      // Create the challenge object with the returned ID
      const newChallenge = {
        ...challengeData,
        id: result.id ? result.id.toString() : Date.now().toString(),
      };
      
      // Update local state
      setAllChallenges(prev => {
        const updated = [...prev, newChallenge as Challenge];
        
        // Save to localStorage as backup
        if (currentUser) {
          localStorage.setItem(`user_${currentUser.id}_challenges`, JSON.stringify(updated));
        }
        
        return updated;
      });
      
      // Set this as the active challenge if it's active
      if (challengeData.status === 'active') {
        setActiveChallengeState(newChallenge as Challenge);
      }
      
      return newChallenge;
    } catch (error) {
      console.error('Error adding challenge (will use fallback):', error);
      
      // Create a local challenge as fallback
      const fallbackChallenge = {
        ...challengeData,
        id: Date.now().toString(),
      };
      
      // Update local state
      setAllChallenges(prev => {
        const updated = [...prev, fallbackChallenge as Challenge];
        
        // Save to localStorage as backup
        if (currentUser) {
          localStorage.setItem(`user_${currentUser.id}_challenges`, JSON.stringify(updated));
        }
        
        return updated;
      });
      
      if (challengeData.status === 'active') {
        setActiveChallengeState(fallbackChallenge as Challenge);
      }
      
      // Still return the fallback challenge even if API failed
      return fallbackChallenge;
    }
  };

  // Function to check challenge status and update if failed
  const checkChallengeStatus = (challenge: Challenge, newBalance: number) => {
    // Calculate losses
    const initialBalance = challenge.initialBalance;
    const lossAmount = initialBalance - newBalance;
    const lossPercentage = (lossAmount / initialBalance) * 100;
    
    // Check if total loss threshold exceeded
    const totalLossThreshold = challenge.maxTotalLoss;
    
    // Update challenge status if it failed
    if (lossAmount >= totalLossThreshold) {
      return { ...challenge, status: 'failed' as const };
    }
    
    // Return the same challenge if no failure condition is met
    return challenge;
  };

  // Récupérer l'utilisateur depuis le localStorage au chargement
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setCurrentUser(parsedUser);
        
        // Charger les données spécifiques à l'utilisateur
        loadUserData(parsedUser.id);
      } catch (error) {
        console.error('Error parsing user from localStorage:', error);
      }
    }
  }, []);

  const loadUserData = async (userId: number) => {
    try {
      console.log('Loading user data for userId:', userId);
      
      // Charger les défis de l'utilisateur
      const userChallenges = await UserDataService.getUserChallenges(userId);
      console.log('Loaded challenges from API:', userChallenges);
      
      // Load challenges from localStorage as backup
      const localChallengesStr = localStorage.getItem(`user_${userId}_challenges`);
      const localChallenges = localChallengesStr ? JSON.parse(localChallengesStr) : [];
      
      // Combine API challenges with local challenges, prioritizing API data
      const allChallenges = [...userChallenges];
      
      // Add any local challenges not present in API data
      localChallenges.forEach((localChallenge: any) => {
        if (!allChallenges.some((apiChallenge: any) => apiChallenge.id === localChallenge.id)) {
          allChallenges.push(localChallenge);
        }
      });
      
      setAllChallenges(allChallenges);
      
      // Charger les transactions de l'utilisateur
      const userTrades = await UserDataService.getUserTrades(userId);
      console.log('Loaded trades:', userTrades);
      setTrades(userTrades);
      
      // Définir le défi actif s'il y en a un
      const active = allChallenges.find((challenge: Challenge) => challenge.status === 'active');
      console.log('Found active challenge:', active);
      if (active) {
        setActiveChallengeState(active);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      
      // Fallback: load challenges from localStorage
      const user = currentUser;
      if (user) {
        const localChallengesStr = localStorage.getItem(`user_${user.id}_challenges`);
        if (localChallengesStr) {
          try {
            const localChallenges = JSON.parse(localChallengesStr);
            setAllChallenges(localChallenges);
            const active = localChallenges.find((challenge: Challenge) => challenge.status === 'active');
            if (active) {
              setActiveChallengeState(active);
            }
          } catch (parseError) {
            console.error('Error parsing local challenges:', parseError);
          }
        }
      }
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    // Vérifier avec le service d'authentification
    const result = await FrontendAuthService.login(email, password);
    
    if (result.success && result.user) {
      setCurrentUser(result.user);
      localStorage.setItem('user', JSON.stringify(result.user));
      
      // Charger les données spécifiques à l'utilisateur connecté
      await loadUserData(result.user.id);
      
      return true;
    }
    
    return false;
  };

  const register = async (username: string, email: string, password: string): Promise<boolean> => {
    try {
      const response = await FrontendAuthService.register(username, email, password);
      
      if (response.success) {
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Registration error:', error);
      return false;
    }
  };

  const logout = () => {
    // Effacer correctement toutes les données utilisateur
    setCurrentUser(null);
    setActiveChallengeState(null);
    setAllChallenges([]);
    setTrades([]);
    localStorage.removeItem('user');
  };

  const setActiveChallenge = (challenge: Challenge) => {
    setActiveChallengeState(challenge);
  };

  const updateChallenge = async (updates: Partial<Challenge>) => {
    if (activeChallenge && currentUser) {
      try {
        // Prepare updated challenge
        let updatedChallenge = {
          ...activeChallenge,
          ...updates
        };
        
        // Check if this update might cause a failure
        if (updates.currentBalance !== undefined) {
          updatedChallenge = checkChallengeStatus(activeChallenge, updates.currentBalance);
        }
        
        // Update in the backend
        const success = await UserDataService.updateChallenge(activeChallenge.id, updatedChallenge);
        
        if (success) {
          // Update locally
          setActiveChallengeState(updatedChallenge);
          
          // Also update in the allChallenges array
          setAllChallenges(prev => prev.map(c => 
            c.id === updatedChallenge.id ? updatedChallenge : c
          ));
        }
      } catch (error) {
        console.error('Error updating challenge:', error);
        // Fallback to local state update
        let updatedChallenge = {
          ...activeChallenge,
          ...updates
        };
        
        // Check if this update might cause a failure
        if (updates.currentBalance !== undefined) {
          updatedChallenge = checkChallengeStatus(activeChallenge, updates.currentBalance);
        }
        
        setActiveChallengeState(updatedChallenge);
        
        // Also update in the allChallenges array
        setAllChallenges(prev => prev.map(c => 
          c.id === activeChallenge.id ? updatedChallenge : c
        ));
      }
    }
  };

  // Enhanced addTrade function with challenge status checking
  const addTrade = async (trade: Trade) => {
    if (currentUser && activeChallenge) {
      try {
        // Add to backend
        const success = await UserDataService.addTrade(currentUser.id, activeChallenge.id, trade);
        
        if (success) {
          // Update trades locally
          setTrades(prev => [...prev, trade]);
          
          // If the trade affects the balance, check challenge status
          if (trade.pnl !== undefined) {
            const newBalance = activeChallenge.currentBalance + trade.pnl;
            
            // Update the challenge balance
            const updatedChallenge = {
              ...activeChallenge,
              currentBalance: newBalance
            };
            
            // Check if the new balance causes the challenge to fail
            const checkedChallenge = checkChallengeStatus(activeChallenge, newBalance);
            
            if (checkedChallenge.status !== activeChallenge.status) {
              // Challenge status changed (likely to failed)
              setActiveChallengeState(checkedChallenge);
              
              // Update in the allChallenges array
              setAllChallenges(prev => prev.map(c => 
                c.id === checkedChallenge.id ? checkedChallenge : c
              ));
              
              // Also update in the backend
              await UserDataService.updateChallenge(checkedChallenge.id, { status: checkedChallenge.status });
            } else {
              // Update the balance normally
              setActiveChallengeState(updatedChallenge);
              
              // Update in the allChallenges array
              setAllChallenges(prev => prev.map(c => 
                c.id === updatedChallenge.id ? updatedChallenge : c
              ));
              
              // Update in the backend
              await UserDataService.updateChallenge(updatedChallenge.id, { currentBalance: newBalance });
            }
          }
        }
      } catch (error) {
        console.error('Error adding trade:', error);
        // Fallback to local state update
        setTrades(prev => [...prev, trade]);
        
        // Handle balance update locally if needed
        if (trade.pnl !== undefined && activeChallenge) {
          const newBalance = activeChallenge.currentBalance + trade.pnl;
          
          const updatedChallenge = {
            ...activeChallenge,
            currentBalance: newBalance
          };
          
          // Check if the new balance causes the challenge to fail
          const checkedChallenge = checkChallengeStatus(activeChallenge, newBalance);
          
          if (checkedChallenge.status !== activeChallenge.status) {
            // Challenge status changed (likely to failed)
            setActiveChallengeState(checkedChallenge);
            
            // Update in the allChallenges array
            setAllChallenges(prev => prev.map(c => 
              c.id === checkedChallenge.id ? checkedChallenge : c
            ));
          } else {
            // Update the balance normally
            setActiveChallengeState(updatedChallenge);
            
            // Update in the allChallenges array
            setAllChallenges(prev => prev.map(c => 
              c.id === updatedChallenge.id ? updatedChallenge : c
            ));
          }
        }
      }
    }
  };

  const executeTrade = (symbol: string, type: 'BUY' | 'SELL', price: number, quantity: number) => {
    if (currentUser && activeChallenge) {
      const trade: Trade = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, // ID unique
        symbol,
        type,
        price,
        quantity,
        timestamp: new Date().toISOString(),
        pnl: type === 'BUY' ? (Math.random() * 100 - 50) : (Math.random() * -100 + 50) // P&L simulé
      };
      
      addTrade(trade);
    }
  };

  const isAdmin = currentUser?.role === UserRole.ADMIN || currentUser?.role === UserRole.SUPER_ADMIN;
  const isSuperAdmin = currentUser?.role === UserRole.SUPER_ADMIN;

  const value: UserContextType = {
    currentUser,
    user: currentUser,  // Alias for currentUser
    activeChallenge,
    allChallenges, // Add all challenges to the context
    trades,
    login,
    register,
    logout,
    setActiveChallenge,
    updateChallenge,
    addChallenge,
    addTrade,
    executeTrade,
    isAdmin,
    isSuperAdmin
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};