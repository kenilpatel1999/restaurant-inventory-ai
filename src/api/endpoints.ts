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

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const api = {
  /**
   * Stream AI recommendations from the backend using fetch with manual SSE parsing
   * @param query - Natural language query for supplier recommendations
   * @param onChunk - Callback for each text chunk received
   * @param onComplete - Callback when streaming completes
   * @param onError - Callback for errors
   * @returns AbortController instance for connection management
   */
  streamRecommendations: (
    query: string,
    onChunk: (chunk: string) => void,
    onComplete: () => void,
    onError: (error: Error) => void
  ): AbortController => {
    const url = `${API_BASE_URL}/recommend?query=${encodeURIComponent(query)}`;
    const abortController = new AbortController();
    let chunkCount = 0;

    fetch(url, { signal: abortController.signal })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const reader = response.body?.getReader();
        const decoder = new TextDecoder();

        if (!reader) {
          throw new Error('Response body is not readable');
        }

        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          buffer += chunk;

          // Parse SSE format: "data: <content>\n\n"
          // Split by double newline to get complete SSE events
          const events = buffer.split('\n\n');
          buffer = events.pop() || ''; // Keep the last incomplete event in buffer

          for (const event of events) {
            const lines = event.split('\n');
            let eventData = '';
            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const data = line.substring(6); // Remove "data: " prefix
                eventData += data;
              } else if (line.trim()) {
                // Also capture non-data lines (content before data: prefix)
                eventData += line;
              }
            }
            if (eventData) {
              chunkCount++;
              console.log(`[Fetch] Chunk #${chunkCount}:`, eventData);
              onChunk(eventData);
            }
          }
        }

        // Process any remaining buffer
        if (buffer.includes('data: ')) {
          const lines = buffer.split('\n');
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.substring(6);
              if (data) {
                chunkCount++;
                console.log(`[Fetch] Final chunk #${chunkCount}:`, data);
                onChunk(data);
              }
            }
          }
        }

        console.log(`[Fetch] Stream completed. Total chunks: ${chunkCount}`);
        onComplete();
      })
      .catch((error) => {
        if (error.name === 'AbortError') {
          console.log('[Fetch] Stream aborted');
        } else {
          console.error('[Fetch] Stream error:', error);
          onError(error);
        }
      });

    return abortController;
  },

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
