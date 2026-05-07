import {
  inventoryItems,
  predictions,
  suppliers,
  contracts,
  orders,
  usageTrends,
  supplierCostComparison,
  predictionConfidence,
  weeklyForecast,
  depletionPrediction,
  reorderSchedule,
  initialChatMessages,
} from './mockData';
import type { ChatMessage } from '@/types';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const api = {
  getInventory: async () => {
    await delay(400);
    return inventoryItems;
  },

  getPredictions: async () => {
    await delay(500);
    return predictions;
  },

  getSuppliers: async () => {
    await delay(400);
    return suppliers;
  },

  getContracts: async () => {
    await delay(400);
    return contracts;
  },

  getOrders: async () => {
    await delay(400);
    return orders;
  },

  getDashboardMetrics: async () => {
    await delay(300);
    return {
      healthScore: 72,
      predictedStockouts: 4,
      costSavings: 645,
      nextOrders: 3,
      supplierDeals: 5,
    };
  },

  getUsageTrends: async () => {
    await delay(300);
    return usageTrends;
  },

  getSupplierCostComparison: async () => {
    await delay(300);
    return supplierCostComparison;
  },

  getPredictionConfidence: async () => {
    await delay(300);
    return predictionConfidence;
  },

  getWeeklyForecast: async () => {
    await delay(300);
    return weeklyForecast;
  },

  getDepletionPrediction: async () => {
    await delay(300);
    return depletionPrediction;
  },

  getReorderSchedule: async () => {
    await delay(300);
    return reorderSchedule;
  },

  getChatMessages: async () => {
    await delay(200);
    return initialChatMessages;
  },

  sendChatMessage: async (message: string): Promise<ChatMessage> => {
    await delay(800);

    const lowerMessage = message.toLowerCase();

    if (lowerMessage.includes('supplier') || lowerMessage.includes('compare')) {
      return {
        id: Date.now().toString(),
        role: 'assistant',
        content: "Here's a comparison of your top suppliers for vegetables:",
        timestamp: new Date().toISOString(),
        type: 'table',
        tableData: {
          headers: ['Supplier', 'Price/kg', 'Delivery', 'Rating'],
          rows: [
            ['Fresh Farms Co.', '$2.85', '1 day', '⭐ 4.7'],
            ['Valley Produce', '$3.50', '1 day', '⭐ 4.1'],
            ['Green Valley', '$3.10', '2 days', '⭐ 4.3'],
          ],
        },
        actions: [
          { label: 'Order from Fresh Farms', action: 'order_fresh_farms', variant: 'primary' },
          { label: 'View All Suppliers', action: 'view_suppliers', variant: 'outline' },
        ],
      };
    }

    if (lowerMessage.includes('order') || lowerMessage.includes('reorder')) {
      return {
        id: Date.now().toString(),
        role: 'assistant',
        content: "I've prepared an optimized order based on your current needs and upcoming demand. Here's what I recommend:",
        timestamp: new Date().toISOString(),
        type: 'action',
        actions: [
          { label: 'Approve Order ($1,634)', action: 'approve_order', variant: 'primary' },
          { label: 'Modify Quantities', action: 'modify_order', variant: 'secondary' },
          { label: 'Schedule for Later', action: 'schedule_later', variant: 'outline' },
        ],
      };
    }

    if (lowerMessage.includes('trend') || lowerMessage.includes('usage')) {
      return {
        id: Date.now().toString(),
        role: 'assistant',
        content: 'Your tomato usage has been trending upward. Weekend usage is 40% higher than weekdays. I predict you\'ll need 30kg for the upcoming week based on your current menu and reservation count.',
        timestamp: new Date().toISOString(),
        type: 'text',
      };
    }

    if (lowerMessage.includes('save') || lowerMessage.includes('cost') || lowerMessage.includes('money')) {
      return {
        id: Date.now().toString(),
        role: 'assistant',
        content: "Based on my analysis, here are your top cost-saving opportunities this month:",
        timestamp: new Date().toISOString(),
        type: 'table',
        tableData: {
          headers: ['Strategy', 'Monthly Savings', 'Effort'],
          rows: [
            ['Contract with Fresh Farms', '$168/mo', 'Low'],
            ['Switch to Artisan Dairy', '$88/mo', 'Medium'],
            ['Bulk seafood order', '$250/mo', 'Low'],
            ['Reduce food waste', '$120/mo', 'High'],
          ],
        },
      };
    }

    return {
      id: Date.now().toString(),
      role: 'assistant',
      content: `I understand you're asking about "${message}". Based on your current inventory data, I can help you with stock predictions, supplier comparisons, order optimization, and cost analysis. What would you like to explore?`,
      timestamp: new Date().toISOString(),
      type: 'action',
      actions: [
        { label: 'Check Stock Levels', action: 'check_stock', variant: 'primary' },
        { label: 'View Predictions', action: 'view_predictions', variant: 'secondary' },
        { label: 'Cost Analysis', action: 'cost_analysis', variant: 'outline' },
      ],
    };
  },
};
