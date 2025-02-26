import Budget from "../models/budgetModel.js";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { parse } from "date-fns";
import { createWorker } from 'tesseract.js';
import { v2 as cloudinary } from "cloudinary";
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Add this for debugging
console.log('Using Gemini API Key:', process.env.GEMINI_API_KEY ? 'Key is set' : 'Key is missing');

export const addBudget = async (req, res) => {
  try {
    const { amount, category } = req.body;
    const userId = req.user.id;

    // Log the user ID and budget details
    console.log("Creating/updating budget for user ID:", userId);
    console.log("Budget details:", { amount, category });

    // Create or update budget
    const budget = await Budget.findOneAndUpdate(
      { user: userId },
      { amount, category },
      { new: true, upsert: true }
    );

    // Log the created/updated budget
    console.log("Budget created/updated successfully:", budget);

    res.status(201).json({ success: true, budget });
  } catch (error) {
    console.error("Error creating/updating budget:", error.message);
    res.status(500).json({ message: error.message });
  }
};

export const getBudgets = async (req, res) => {
  try {
    const budgets = await Budget.find({ user: req.user.id });
    res.status(200).json({ success: true, budgets });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const checkBudgetStatus = async (req, res) => {
  try {
    const { expense } = req.body;
    const userId = req.user.id;

    // Log the user ID and expense
    console.log("Checking budget status for user ID:", userId);
    console.log("Expense to check:", expense);

    // Log the database query
    console.log("Searching for budget in database...");

    const budget = await Budget.findOne({ user: userId });

    if (!budget) {
      console.log("Budget not found in database");
      return res.status(404).json({ success: false, message: "Budget not set" });
    }

    // Log the budget details
    console.log("Budget found:", budget);

    if (expense > budget.amount) {
      console.log("Budget limit exceeded");
      return res.status(400).json({ success: false, message: "Budget limit exceeded" });
    }

    console.log("Within budget");
    res.status(200).json({ success: true, message: "Within budget" });
  } catch (error) {
    console.error("Error checking budget status:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteBudget = async (req, res) => {
  try {
    const { id } = req.params;

    // Log the budget ID
    console.log("Deleting budget with ID:", id);

    // Log the database query
    console.log("Searching for budget in database...");

    const budget = await Budget.findByIdAndDelete(id);

    if (!budget) {
      console.log("Budget not found in database");
      return res.status(404).json({ success: false, message: "Budget not found" });
    }

    console.log("Budget deleted successfully:", budget);
    res.status(200).json({ success: true, message: "Budget deleted successfully" });
  } catch (error) {
    console.error("Error deleting budget:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateBudget = async (req, res) => {
  try {
    const { budgetId } = req.params;
    const { amount, category } = req.body;

    // Log the budget ID
    console.log("Updating budget with ID:", budgetId);

    // Log the database query
    console.log("Searching for budget in database...");

    const budget = await Budget.findByIdAndUpdate(
      budgetId,
      { amount, category },
      { new: true }
    );

    if (!budget) {
      console.log("Budget not found in database");
      return res.status(404).json({ success: false, message: "Budget not found" });
    }

    console.log("Budget updated successfully:", budget);
    res.status(200).json({ success: true, message: "Budget updated successfully", budget });
  } catch (error) {
    console.error("Error updating budget:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const scanBillAndUpdateBudget = async (req, res) => {
  try {
    if (!req.fileUrl) {
      return res.status(400).json({ 
        success: false, 
        message: "No image URL found" 
      });
    }

    console.log('Starting image analysis...');

    // Define available models in order of preference
    const models = [
      'google/gemini-2.0-pro-exp-02-05:free',
      'anthropic/claude-3-haiku-20240307',
      'openai/gpt-4-vision-preview',
      'google/gemini-pro-vision'
    ];

    let lastError = null;
    let result = null;

    // Try each model until one works
    for (const model of models) {
      try {
        console.log(`Trying model: ${model}...`);

        const openRouterRequest = {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
            'HTTP-Referer': process.env.SITE_URL,
            'X-Title': process.env.SITE_NAME,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: model,
            messages: [
              {
                role: 'user',
                content: [
                  {
                    type: 'text',
                    text: 'Extract the following information from this receipt image and return ONLY a JSON object with these fields: amount (number), category (string), date (string in DD/MM/YYYY format). Do not include any other text.'
                  },
                  {
                    type: 'image_url',
                    image_url: {
                      url: req.fileUrl
                    }
                  }
                ]
              }
            ],
            max_tokens: 300,
            temperature: 0.1
          })
        };

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 30000);

        try {
          console.log(`Calling OpenRouter API with ${model}...`);
          const aiResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            ...openRouterRequest,
            signal: controller.signal
          });
          clearTimeout(timeout);

          if (!aiResponse.ok) {
            const errorData = await aiResponse.json();
            throw new Error(errorData.error?.message || aiResponse.statusText);
          }

          result = await aiResponse.json();
          console.log('Raw API response:', result);

          if (result.error) {
            throw new Error(result.error.message || 'Unknown API error');
          }

          // If we get here, the API call was successful
          break;

        } catch (fetchError) {
          if (fetchError.name === 'AbortError') {
            throw new Error('Request timed out');
          }
          throw fetchError;
        } finally {
          clearTimeout(timeout);
        }

      } catch (modelError) {
        console.log(`Error with model ${model}:`, modelError.message);
        lastError = modelError;
        
        // If error is not rate limit related, throw immediately
        if (!modelError.message.includes('429') && 
            !modelError.message.includes('quota') && 
            !modelError.message.includes('rate limit')) {
          throw modelError;
        }
        
        // Wait before trying next model
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    if (!result) {
      throw lastError || new Error('All models failed');
    }

    // Parse the response
    let data;
    try {
      const responseText = result.choices[0]?.message?.content;
      console.log('Response text:', responseText);

      if (!responseText) {
        throw new Error('Empty response from API');
      }

      // Try to parse JSON directly first
      try {
        data = JSON.parse(responseText);
      } catch {
        // If direct parse fails, try to extract JSON from text
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          throw new Error('No JSON found in response');
        }
        data = JSON.parse(jsonMatch[0]);
      }

      // Clean up the data
      if (data.amount && typeof data.amount === 'string') {
        data.amount = parseFloat(data.amount.replace(/[^0-9.]/g, ''));
      }
      if (data.category) {
        data.category = data.category.trim();
      }
      if (data.date) {
        data.date = data.date.trim();
      }

    } catch (parseError) {
      console.error('Error parsing response:', parseError);
      data = {
        amount: null,
        category: null,
        date: null
      };
    }

    return res.status(200).json({
      success: true,
      data: data,
      model: result.model, // Include which model was used
      rawText: result.choices?.[0]?.message?.content || 'No raw text available'
    });

  } catch (error) {
    console.error("Analysis Error:", error);
    return res.status(500).json({
      success: false,
      message: "Error analyzing image",
      error: error.message,
      details: error.response?.data || error.result || 'No additional details available'
    });
  }
};
