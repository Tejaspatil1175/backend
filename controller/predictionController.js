import Prediction from "../models/predictionModel.js";
import { analyzeFinancialTrends } from "../utils/aiModel.js";
import axios from 'axios';

const ALPHA_VANTAGE_KEY = process.env.ALPHA_VANTAGE_API_KEY;
const BASE_URL = 'https://www.alphavantage.co/query';

const POLYGON_API_KEY = process.env.POLYGON_API_KEY;
const POLYGON_BASE_URL = 'https://api.polygon.io/v2';

const INDIAN_STOCKS = {
  'RELIANCE': {
    name: 'Reliance Industries Limited',
    symbol: 'RELIANCE',
    sector: 'Oil & Gas'
  },
  'TCS': {
    name: 'Tata Consultancy Services',
    symbol: 'TCS',
    sector: 'Information Technology'
  },
  'INFY': {
    name: 'Infosys Limited',
    symbol: 'INFY',
    sector: 'Information Technology'
  },
  'HDFCBANK': {
    name: 'HDFC Bank Limited',
    symbol: 'HDFCBANK',
    sector: 'Banking'
  },
  'ICICIBANK': {
    name: 'ICICI Bank Limited',
    symbol: 'ICICIBANK',
    sector: 'Banking'
  }
};

export const getPredictions = async (req, res) => {
  try {
    const { userId } = req.params;

    const predictions = await Prediction.find({ user: userId });

    if (!predictions) {
      return res.status(404).json({ success: false, message: "No predictions found" });
    }

    res.status(200).json({ success: true, predictions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const generateFinancialPrediction = async (req, res) => {
  try {
    const { userId, financialData } = req.body;

    if (!userId || !financialData) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const predictionData = analyzeFinancialTrends(financialData);

    let prediction = await Prediction.findOne({ user: userId });

    if (prediction) {
      prediction.data = predictionData;
    } else {
      prediction = new Prediction({ user: userId, data: predictionData });
    }

    await prediction.save();

    res.status(200).json({ success: true, message: "Prediction generated successfully", prediction });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const addPrediction = async (req, res) => {
  try {
    const { userId, predictionData } = req.body;

    const prediction = await Prediction.create({
      user: userId,
      data: predictionData,
    });

    res.status(201).json({ success: true, prediction });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deletePrediction = async (req, res) => {
  try {
    const { predictionId } = req.params;

    const prediction = await Prediction.findByIdAndDelete(predictionId);
    if (!prediction) return res.status(404).json({ success: false, message: "Prediction not found" });

    res.status(200).json({ success: true, message: "Prediction deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updatePrediction = async (req, res) => {
  try {
    const { predictionId } = req.params;
    const { predictionData } = req.body;

    const prediction = await Prediction.findByIdAndUpdate(
      predictionId,
      { data: predictionData },
      { new: true }
    );

    if (!prediction) return res.status(404).json({ success: false, message: "Prediction not found" });

    res.status(200).json({ success: true, message: "Prediction updated successfully", prediction });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getStockData = async (req, res) => {
  try {
    let symbol = (req.query.symbol || 'RELIANCE').toUpperCase();
    symbol = symbol.replace('.NS', '').replace('.BSE', '');
    
    if (!INDIAN_STOCKS[symbol]) {
      throw new Error('Invalid stock symbol. Please use a valid Indian stock symbol.');
    }

    // Format symbol for Indian stocks (NSE)
    const stockSymbol = `${symbol}.NS`;

    // Get current stock data
    const response = await axios.get(`${POLYGON_BASE_URL}/last/trade/${stockSymbol}`, {
      params: {
        apiKey: POLYGON_API_KEY
      }
    });

    // Get historical data (last 30 days)
    const endDate = new Date().toISOString().split('T')[0];
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);
    const startDateStr = startDate.toISOString().split('T')[0];

    const historicalResponse = await axios.get(
      `${POLYGON_BASE_URL}/aggs/ticker/${stockSymbol}/range/1/day/${startDateStr}/${endDate}`, {
        params: {
          adjusted: true,
          sort: 'desc',
          limit: 30,
          apiKey: POLYGON_API_KEY
        }
      }
    );

    const currentData = response.data.results;
    const historical = historicalResponse.data.results.map(item => ({
      date: new Date(item.t).toISOString().split('T')[0],
      open: item.o,
      high: item.h,
      low: item.l,
      close: item.c,
      volume: item.v
    }));

    const analysis = {
      realTime: {
        symbol: stockSymbol,
        price: currentData.p,
        change: currentData.p - historical[0].open,
        changePercent: ((currentData.p - historical[0].open) / historical[0].open * 100).toFixed(2),
        open: historical[0].open,
        high: historical[0].high,
        low: historical[0].low,
        volume: currentData.s,
        previousClose: historical[0].close,
        lastUpdated: new Date(currentData.t).toISOString()
      },
      historical,
      insights: {
        averagePrice: calculateAverage(historical.map(day => day.close)),
        volatility: calculateVolatility(historical.map(day => day.close)),
        trend: determineTrend(historical.map(day => day.close)),
        highestPrice: Math.max(...historical.map(day => day.high)),
        lowestPrice: Math.min(...historical.map(day => day.low)),
        volumeAverage: calculateAverage(historical.map(day => day.volume))
      },
      metadata: {
        ...INDIAN_STOCKS[symbol],
        exchange: 'NSE',
        currency: 'INR',
        timezone: 'IST'
      }
    };

    res.json({
      success: true,
      message: "Stock data fetched successfully",
      data: analysis
    });

  } catch (error) {
    console.error("Stock API error:", error.response?.data || error.message);
    res.status(500).json({
      success: false,
      message: "Error fetching stock data",
      error: error.response?.data?.message || error.message
    });
  }
};

// Helper functions for analysis
function calculateAverage(prices) {
  return prices.reduce((a, b) => a + b, 0) / prices.length;
}

function calculateVolatility(prices) {
  const avg = calculateAverage(prices);
  const squaredDiffs = prices.map(price => Math.pow(price - avg, 2));
  return Math.sqrt(calculateAverage(squaredDiffs));
}

function determineTrend(prices) {
  const firstPrice = prices[0];
  const lastPrice = prices[prices.length - 1];
  const percentChange = ((lastPrice - firstPrice) / firstPrice) * 100;
  
  if (percentChange > 5) return "STRONG_UPTREND";
  if (percentChange > 0) return "SLIGHT_UPTREND";
  if (percentChange < -5) return "STRONG_DOWNTREND";
  if (percentChange < 0) return "SLIGHT_DOWNTREND";
  return "NEUTRAL";
}

// Advanced prediction function
export const generateStockPrediction = async (req, res) => {
  try {
    let symbol = (req.query.symbol || 'RELIANCE').toUpperCase();
    symbol = symbol.replace('.NS', '').replace('.BSE', '');
    const days = parseInt(req.query.days) || 7;

    // Get 90 days of historical data for better prediction
    const endDate = new Date().toISOString().split('T')[0];
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 90);
    const startDateStr = startDate.toISOString().split('T')[0];

    const response = await axios.get(
      `${POLYGON_BASE_URL}/aggs/ticker/X:${symbol}INR/range/1/day/${startDateStr}/${endDate}?adjusted=true&sort=asc&limit=90&apiKey=${POLYGON_API_KEY}`
    );

    const historical = response.data.results.map(item => ({
      date: new Date(item.t).toISOString().split('T')[0],
      close: item.c
    }));

    const prices = historical.map(day => day.close);

    // Calculate indicators
    const sma20 = calculateSMA(prices, 20);
    const sma50 = calculateSMA(prices, 50);
    
    // Generate prediction
    const prediction = {
      symbol,
      currentPrice: prices[prices.length - 1],
      predictedPrices: generatePredictedPrices(prices, days),
      technicalIndicators: {
        sma20: sma20[sma20.length - 1],
        sma50: sma50[sma50.length - 1],
        rsi: calculateRSI(prices),
        trend: determineTrend(prices)
      },
      recommendation: generateRecommendation(prices, sma20, sma50),
      historicalPrices: historical.slice(-30)
    };

    res.json({
      success: true,
      message: "Stock prediction generated successfully",
      prediction
    });

  } catch (error) {
    console.error("Prediction error:", error.response?.data || error.message);
    res.status(500).json({
      success: false,
      message: "Error generating prediction",
      error: error.response?.data?.message || error.message
    });
  }
};

// Technical analysis helpers
function calculateSMA(prices, period) {
  const sma = [];
  for (let i = period - 1; i < prices.length; i++) {
    const avg = prices.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0) / period;
    sma.push(avg);
  }
  return sma;
}

function calculateRSI(prices) {
  const period = 14;
  const gains = [];
  const losses = [];
  
  for (let i = 1; i < prices.length; i++) {
    const change = prices[i] - prices[i - 1];
    gains.push(change > 0 ? change : 0);
    losses.push(change < 0 ? -change : 0);
  }
  
  const avgGain = calculateAverage(gains.slice(-period));
  const avgLoss = calculateAverage(losses.slice(-period));
  
  const rs = avgGain / avgLoss;
  return 100 - (100 / (1 + rs));
}

function generatePredictedPrices(prices, days) {
  const lastPrice = prices[prices.length - 1];
  const volatility = calculateVolatility(prices);
  
  return Array(days).fill(0).map((_, i) => {
    const randomFactor = 1 + (Math.random() - 0.5) * (volatility / lastPrice);
    return +(lastPrice * randomFactor).toFixed(2);
  });
}

function generateRecommendation(prices, sma20, sma50) {
  const currentPrice = prices[prices.length - 1];
  const currentSMA20 = sma20[sma20.length - 1];
  const currentSMA50 = sma50[sma50.length - 1];
  
  if (currentPrice > currentSMA20 && currentSMA20 > currentSMA50) {
    return "STRONG_BUY";
  } else if (currentPrice > currentSMA20) {
    return "BUY";
  } else if (currentPrice < currentSMA20 && currentSMA20 < currentSMA50) {
    return "STRONG_SELL";
  } else if (currentPrice < currentSMA20) {
    return "SELL";
  }
  return "HOLD";
}
