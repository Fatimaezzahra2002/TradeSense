// services/marketDataService.ts

// Mock data service - in a real implementation, this would connect to real APIs
export interface MarketData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  region: 'International' | 'Morocco';
  timestamp: Date;
}

// International assets
const internationalAssets: MarketData[] = [
  { symbol: 'AAPL', name: 'Apple Inc.', price: 189.45, change: -0.5, region: 'International', timestamp: new Date() },
  { symbol: 'MSFT', name: 'Microsoft Corp.', price: 420.72, change: 0.8, region: 'International', timestamp: new Date() },
  { symbol: 'GOOGL', name: 'Alphabet Inc.', price: 175.43, change: -0.2, region: 'International', timestamp: new Date() },
  { symbol: 'AMZN', name: 'Amazon.com Inc.', price: 178.22, change: 1.1, region: 'International', timestamp: new Date() },
  { symbol: 'TSLA', name: 'Tesla Inc.', price: 248.50, change: 2.3, region: 'International', timestamp: new Date() },
  { symbol: 'BTC-USD', name: 'Bitcoin USD', price: 65230.50, change: 1.2, region: 'International', timestamp: new Date() },
  { symbol: 'ETH-USD', name: 'Ethereum USD', price: 3840.20, change: 0.7, region: 'International', timestamp: new Date() },
];

// Moroccan assets (mock data since there's no public API)
const moroccanAssets: MarketData[] = [
  { symbol: 'IAM', name: 'Maroc Telecom', price: 92.50, change: 0.3, region: 'Morocco', timestamp: new Date() },
  { symbol: 'ATW', name: 'Attijariwafa Bank', price: 465.20, change: 1.1, region: 'Morocco', timestamp: new Date() },
  { symbol: 'MNG', name: 'Managem', price: 128.70, change: -0.4, region: 'Morocco', timestamp: new Date() },
  { symbol: 'CIH', name: 'CIH Bank', price: 312.60, change: 0.6, region: 'Morocco', timestamp: new Date() },
  { symbol: 'MSE', name: 'Medi1 Sat', price: 85.30, change: 0.9, region: 'Morocco', timestamp: new Date() },
];

let allAssets = [...internationalAssets, ...moroccanAssets];

// Simulate real-time updates
export const simulateRealTimeUpdates = (callback: (data: MarketData[]) => void) => {
  setInterval(() => {
    allAssets = allAssets.map(asset => {
      // Simulate small price changes
      const changeAmount = (Math.random() - 0.5) * 0.5; // Random change between -0.25 and 0.25
      const newPrice = asset.price * (1 + changeAmount / 100);
      const newChange = parseFloat((changeAmount + asset.change).toFixed(2));
      
      return {
        ...asset,
        price: parseFloat(newPrice.toFixed(2)),
        change: newChange,
        timestamp: new Date()
      };
    });
    
    callback(allAssets);
  }, 10000); // Update every 10 seconds
};

// Get initial data
export const getInitialMarketData = (): MarketData[] => {
  return allAssets;
};

// Get specific asset
export const getAssetBySymbol = (symbol: string): MarketData | undefined => {
  return allAssets.find(asset => asset.symbol === symbol);
};

// Get assets by region
export const getAssetsByRegion = (region: 'International' | 'Morocco'): MarketData[] => {
  return allAssets.filter(asset => asset.region === region);
};

// For a real implementation, we would use:
/*
// For international assets
import yahooFinance from 'yahoo-finance2';

// For Moroccan assets
import axios from 'axios';
import * as cheerio from 'cheerio';

export const fetchInternationalData = async (): Promise<MarketData[]> => {
  const symbols = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'BTC-USD', 'ETH-USD'];
  const promises = symbols.map(async (symbol) => {
    try {
      const quote = await yahooFinance.quote(symbol);
      return {
        symbol: quote.symbol,
        name: quote.shortName || symbol,
        price: quote.regularMarketPrice,
        change: quote.regularMarketChangePercent,
        region: 'International' as const,
        timestamp: new Date(),
      };
    } catch (error) {
      console.error(`Error fetching data for ${symbol}:`, error);
      return null;
    }
  });

  const results = await Promise.all(promises);
  return results.filter(result => result !== null) as MarketData[];
};

export const fetchMoroccanData = async (): Promise<MarketData[]> => {
  try {
    // Scraping example - would need to adapt to actual BVC website structure
    const response = await axios.get('https://www.casablanca-bourse.ma/fr/marches/indices/bvc20');
    const $ = cheerio.load(response.data);
    
    // Parse HTML to extract stock data
    // This is a simplified example - actual implementation would depend on BVC website structure
    const moroccanData: MarketData[] = [];
    
    // Example parsing logic would go here
    // Return parsed data
    
    return moroccanData;
  } catch (error) {
    console.error('Error fetching Moroccan market data:', error);
    return [];
  }
};
*/