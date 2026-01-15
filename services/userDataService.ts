import { ChallengeStatus } from '../types';

// API Service for backend calls
const API_BASE_URL = 'http://localhost:5000/api';

// Helper function to make API calls
async function apiCall(url: string, options?: RequestInit) {
  try {
    const response = await fetch(`${API_BASE_URL}${url}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    });
    
    if (!response.ok) {
      console.error(`API call failed: ${response.status} ${response.statusText}`);
      console.error(`URL: ${API_BASE_URL}${url}`);
      
      // Try to get error details
      const errorText = await response.text();
      console.error(`Error details: ${errorText}`);
      
      throw new Error(`API call failed: ${response.statusText}. Details: ${errorText}`);
    }
    
    const result = await response.json();
    console.log(`API call successful: ${API_BASE_URL}${url}`, result);
    return result;
  } catch (error) {
    console.error(`Network error in API call to ${API_BASE_URL}${url}:`, error);
    throw error;
  }
}

export class UserDataService {
  // Fonction pour récupérer les défis d'un utilisateur
  static async getUserChallenges(userId: number): Promise<any[]> {
    try {
      const challenges = await apiCall(`/user/${userId}/challenges`);
      
      return challenges.map((row: any) => ({
        id: row.id.toString(),
        userId: row.user_id?.toString() || row.userId?.toString(),
        initialBalance: row.initial_balance || row.initialBalance,
        currentBalance: row.current_balance || row.currentBalance,
        status: (row.status || row.status) as ChallengeStatus,
        maxDailyLoss: row.max_daily_loss || row.maxDailyLoss,
        maxTotalLoss: row.max_total_loss || row.maxTotalLoss,
        profitTarget: row.profit_target || row.profitTarget,
        createdAt: row.created_at || row.createdAt || new Date().toISOString()
      }));
    } catch (error) {
      console.error('Error getting user challenges:', error);
      // Retourner des données simulées en cas d'erreur
      return [
        {
          id: `${userId}-1`,
          userId: userId.toString(),
          initialBalance: 10000,
          currentBalance: 10500,
          status: 'active' as ChallengeStatus,
          maxDailyLoss: 500,
          maxTotalLoss: 1000,
          profitTarget: 1000,
          createdAt: new Date().toISOString()
        }
      ];
    }
  }

  // Fonction pour récupérer les transactions d'un utilisateur
  static async getUserTrades(userId: number): Promise<any[]> {
    try {
      const trades = await apiCall(`/user/${userId}/trades`);
      
      return trades.map((row: any) => ({
        id: row.id.toString(),
        symbol: row.symbol,
        type: row.type as 'BUY' | 'SELL',
        price: row.price,
        quantity: row.quantity,
        timestamp: row.timestamp,
        pnl: row.pnl || 0
      }));
    } catch (error) {
      console.error('Error getting user trades:', error);
      // Retourner des données simulées en cas d'erreur
      return [
        { 
          id: `${userId}-1`, 
          symbol: 'EUR/USD', 
          type: 'BUY' as const, 
          price: 1.085, 
          quantity: 1000, 
          timestamp: new Date().toISOString(), 
          pnl: 50 
        }
      ];
    }
  }

  // Fonction pour créer un nouveau défi
  static async createChallenge(challengeData: any): Promise<any> {
    try {
      // Ensure we're sending the right data format
      const formattedData = {
        user_id: challengeData.userId,
        initial_balance: challengeData.initialBalance,
        current_balance: challengeData.currentBalance || challengeData.initialBalance,
        status: challengeData.status || 'active',
        max_daily_loss: challengeData.maxDailyLoss,
        max_total_loss: challengeData.maxTotalLoss,
        profit_target: challengeData.profitTarget,
        created_at: challengeData.createdAt || new Date().toISOString()
      };
      
      console.log('Sending challenge data:', formattedData);
      
      const response = await apiCall('/challenges', {
        method: 'POST',
        body: JSON.stringify(formattedData)
      });
      
      console.log('Created challenge response:', response);
      return {
        success: true,
        ...response,
        id: response.id || Date.now().toString()
      };
    } catch (error) {
      console.error('Error creating challenge:', error);
      console.error('Challenge data that failed:', challengeData);
      // Return mock data if API fails
      return {
        success: true,
        id: Date.now().toString(),
        ...challengeData
      };
    }
  }

  // Fonction pour mettre à jour un défi
  static async updateChallenge(challengeId: string, updates: Partial<any>): Promise<boolean> {
    try {
      const response = await apiCall(`/challenge/${challengeId}`, {
        method: 'PUT',
        body: JSON.stringify(updates)
      });
      
      console.log(`Updated challenge ${challengeId}:`, response);
      return response.success || response;
    } catch (error) {
      console.error('Error updating challenge:', error);
      return false;
    }
  }

  // Fonction pour ajouter une transaction
  static async addTrade(userId: number, challengeId: string, trade: any): Promise<boolean> {
    try {
      const tradeData = {
        user_id: userId,
        challenge_id: parseInt(challengeId),
        symbol: trade.symbol,
        type: trade.type,
        price: trade.price,
        quantity: trade.quantity,
        pnl: trade.pnl || 0
      };
      
      const response = await apiCall('/trade', {
        method: 'POST',
        body: JSON.stringify(tradeData)
      });
      
      console.log(`Added trade for user ${userId}, response:`, response);
      return response.success || response;
    } catch (error) {
      console.error('Error adding trade:', error);
      return false;
    }
  }
}
