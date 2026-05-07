import type {
  InventoryItem,
  Prediction,
  Supplier,
  Contract,
  Order,
  ChatMessage,
  UsageTrend,
  SupplierCostComparison,
  PredictionConfidence,
} from '@/types';

export const inventoryItems: InventoryItem[] = [
  { id: '1', name: 'Tomatoes', category: 'Vegetables', currentStock: 12, unit: 'kg', dailyUsage: 4.5, predictedRunOut: '2026-03-14', suggestedOrder: 30, status: 'critical', lastRestocked: '2026-03-08', supplier: 'Fresh Farms Co.', unitPrice: 3.20 },
  { id: '2', name: 'Chicken Breast', category: 'Meat', currentStock: 45, unit: 'kg', dailyUsage: 8, predictedRunOut: '2026-03-17', suggestedOrder: 50, status: 'low', lastRestocked: '2026-03-09', supplier: 'Prime Meats Ltd.', unitPrice: 8.50 },
  { id: '3', name: 'Olive Oil', category: 'Oils', currentStock: 20, unit: 'L', dailyUsage: 1.5, predictedRunOut: '2026-03-24', suggestedOrder: 15, status: 'healthy', lastRestocked: '2026-03-05', supplier: 'Mediterranean Imports', unitPrice: 12.00 },
  { id: '4', name: 'Mozzarella', category: 'Dairy', currentStock: 8, unit: 'kg', dailyUsage: 3, predictedRunOut: '2026-03-14', suggestedOrder: 25, status: 'critical', lastRestocked: '2026-03-10', supplier: 'Dairy Direct', unitPrice: 9.80 },
  { id: '5', name: 'Flour (All Purpose)', category: 'Dry Goods', currentStock: 50, unit: 'kg', dailyUsage: 5, predictedRunOut: '2026-03-21', suggestedOrder: 40, status: 'healthy', lastRestocked: '2026-03-06', supplier: 'Grain Supply Co.', unitPrice: 1.20 },
  { id: '6', name: 'Basil (Fresh)', category: 'Herbs', currentStock: 2, unit: 'kg', dailyUsage: 0.8, predictedRunOut: '2026-03-13', suggestedOrder: 5, status: 'critical', lastRestocked: '2026-03-10', supplier: 'Herb Garden Ltd.', unitPrice: 15.00 },
  { id: '7', name: 'Salmon Fillet', category: 'Seafood', currentStock: 18, unit: 'kg', dailyUsage: 4, predictedRunOut: '2026-03-16', suggestedOrder: 30, status: 'low', lastRestocked: '2026-03-09', supplier: 'Ocean Catch', unitPrice: 22.00 },
  { id: '8', name: 'Heavy Cream', category: 'Dairy', currentStock: 15, unit: 'L', dailyUsage: 2, predictedRunOut: '2026-03-19', suggestedOrder: 20, status: 'healthy', lastRestocked: '2026-03-08', supplier: 'Dairy Direct', unitPrice: 4.50 },
  { id: '9', name: 'Garlic', category: 'Vegetables', currentStock: 5, unit: 'kg', dailyUsage: 1.2, predictedRunOut: '2026-03-15', suggestedOrder: 10, status: 'low', lastRestocked: '2026-03-07', supplier: 'Fresh Farms Co.', unitPrice: 6.00 },
  { id: '10', name: 'Parmesan', category: 'Dairy', currentStock: 6, unit: 'kg', dailyUsage: 1, predictedRunOut: '2026-03-17', suggestedOrder: 8, status: 'low', lastRestocked: '2026-03-08', supplier: 'Mediterranean Imports', unitPrice: 18.50 },
  { id: '11', name: 'Pasta (Spaghetti)', category: 'Dry Goods', currentStock: 40, unit: 'kg', dailyUsage: 6, predictedRunOut: '2026-03-18', suggestedOrder: 50, status: 'healthy', lastRestocked: '2026-03-05', supplier: 'Grain Supply Co.', unitPrice: 2.10 },
  { id: '12', name: 'Bell Peppers', category: 'Vegetables', currentStock: 10, unit: 'kg', dailyUsage: 2.5, predictedRunOut: '2026-03-15', suggestedOrder: 20, status: 'low', lastRestocked: '2026-03-09', supplier: 'Fresh Farms Co.', unitPrice: 4.20 },
  { id: '13', name: 'Butter', category: 'Dairy', currentStock: 12, unit: 'kg', dailyUsage: 1.8, predictedRunOut: '2026-03-18', suggestedOrder: 15, status: 'healthy', lastRestocked: '2026-03-07', supplier: 'Dairy Direct', unitPrice: 5.60 },
  { id: '14', name: 'Shrimp', category: 'Seafood', currentStock: 7, unit: 'kg', dailyUsage: 2.5, predictedRunOut: '2026-03-14', suggestedOrder: 20, status: 'critical', lastRestocked: '2026-03-10', supplier: 'Ocean Catch', unitPrice: 19.00 },
  { id: '15', name: 'Onions', category: 'Vegetables', currentStock: 25, unit: 'kg', dailyUsage: 3, predictedRunOut: '2026-03-19', suggestedOrder: 25, status: 'healthy', lastRestocked: '2026-03-06', supplier: 'Fresh Farms Co.', unitPrice: 1.80 },
];

export const predictions: Prediction[] = [
  { id: '1', itemName: 'Tomatoes', currentStock: 12, depletionDate: '2026-03-14', confidence: 94, reorderDate: '2026-03-12', suggestedQuantity: 30, estimatedCost: 96.00, reasoning: 'Based on 30-day usage pattern averaging 4.5kg/day with weekend spikes of 6kg. Seasonal demand increasing due to spring menu launch.' },
  { id: '2', itemName: 'Mozzarella', currentStock: 8, depletionDate: '2026-03-14', confidence: 91, reorderDate: '2026-03-12', suggestedQuantity: 25, estimatedCost: 245.00, reasoning: 'Pizza sales trending 15% higher this week. Friday/Saturday usage peaks at 5kg. Current stock insufficient for weekend rush.' },
  { id: '3', itemName: 'Basil (Fresh)', currentStock: 2, depletionDate: '2026-03-13', confidence: 97, reorderDate: '2026-03-11', suggestedQuantity: 5, estimatedCost: 75.00, reasoning: 'Critical stock level. Daily usage stable at 0.8kg but fresh herbs have short shelf life. Immediate reorder recommended.' },
  { id: '4', itemName: 'Shrimp', currentStock: 7, depletionDate: '2026-03-14', confidence: 88, reorderDate: '2026-03-12', suggestedQuantity: 20, estimatedCost: 380.00, reasoning: 'Seafood special running this weekend expected to increase demand by 40%. Lead time from Ocean Catch is 2 days.' },
  { id: '5', itemName: 'Chicken Breast', currentStock: 45, depletionDate: '2026-03-17', confidence: 86, reorderDate: '2026-03-14', suggestedQuantity: 50, estimatedCost: 425.00, reasoning: 'Steady consumption at 8kg/day. Catering order for March 16 will require additional 15kg. Contract pricing available with Prime Meats.' },
  { id: '6', itemName: 'Salmon Fillet', currentStock: 18, depletionDate: '2026-03-16', confidence: 82, reorderDate: '2026-03-13', suggestedQuantity: 30, estimatedCost: 660.00, reasoning: 'Weekend demand typically 30% higher. New salmon dish added to menu increasing daily consumption. Price may increase next week per market trends.' },
];

export const suppliers: Supplier[] = [
  { id: '1', name: 'Fresh Farms Co.', item: 'Vegetables', price: 3.20, contractPrice: 2.85, rating: 4.7, leadTimeDays: 1, isAiRecommended: true, reliability: 96, location: 'Local' },
  { id: '2', name: 'Prime Meats Ltd.', item: 'Chicken & Meats', price: 8.50, contractPrice: 7.80, rating: 4.5, leadTimeDays: 2, isAiRecommended: true, reliability: 94, location: 'Regional' },
  { id: '3', name: 'Mediterranean Imports', item: 'Specialty Items', price: 12.00, contractPrice: 10.50, rating: 4.8, leadTimeDays: 3, isAiRecommended: true, reliability: 98, location: 'Import' },
  { id: '4', name: 'Dairy Direct', item: 'Dairy Products', price: 9.80, contractPrice: 8.90, rating: 4.3, leadTimeDays: 1, isAiRecommended: false, reliability: 91, location: 'Local' },
  { id: '5', name: 'Ocean Catch', item: 'Seafood', price: 22.00, contractPrice: 19.50, rating: 4.6, leadTimeDays: 2, isAiRecommended: true, reliability: 93, location: 'Coastal' },
  { id: '6', name: 'Grain Supply Co.', item: 'Dry Goods', price: 1.20, contractPrice: 1.05, rating: 4.4, leadTimeDays: 2, isAiRecommended: false, reliability: 97, location: 'Regional' },
  { id: '7', name: 'Herb Garden Ltd.', item: 'Fresh Herbs', price: 15.00, contractPrice: 13.00, rating: 4.2, leadTimeDays: 1, isAiRecommended: false, reliability: 89, location: 'Local' },
  { id: '8', name: 'Valley Produce', item: 'Vegetables', price: 3.50, contractPrice: null, rating: 4.1, leadTimeDays: 1, isAiRecommended: false, reliability: 87, location: 'Local' },
  { id: '9', name: 'Pacific Seafood', item: 'Seafood', price: 24.00, contractPrice: 21.00, rating: 4.4, leadTimeDays: 3, isAiRecommended: false, reliability: 90, location: 'Coastal' },
  { id: '10', name: 'Artisan Dairy', item: 'Dairy Products', price: 10.50, contractPrice: 9.20, rating: 4.7, leadTimeDays: 1, isAiRecommended: true, reliability: 95, location: 'Local' },
];

export const contracts: Contract[] = [
  { id: '1', supplier: 'Fresh Farms Co.', item: 'Tomatoes & Vegetables', quantity: 120, frequency: 'Weekly', currentPrice: 384.00, contractPrice: 342.00, savings: 42.00, status: 'pending', startDate: '2026-04-01', endDate: '2026-09-30' },
  { id: '2', supplier: 'Prime Meats Ltd.', item: 'Chicken Breast', quantity: 200, frequency: 'Bi-weekly', currentPrice: 1700.00, contractPrice: 1560.00, savings: 140.00, status: 'pending', startDate: '2026-04-01', endDate: '2026-09-30' },
  { id: '3', supplier: 'Ocean Catch', item: 'Salmon & Shrimp', quantity: 100, frequency: 'Weekly', currentPrice: 2100.00, contractPrice: 1850.00, savings: 250.00, status: 'accepted', startDate: '2026-03-01', endDate: '2026-08-31' },
  { id: '4', supplier: 'Mediterranean Imports', item: 'Olive Oil & Parmesan', quantity: 50, frequency: 'Monthly', currentPrice: 925.00, contractPrice: 800.00, savings: 125.00, status: 'pending', startDate: '2026-04-01', endDate: '2026-12-31' },
  { id: '5', supplier: 'Artisan Dairy', item: 'Mozzarella & Cream', quantity: 80, frequency: 'Weekly', currentPrice: 736.00, contractPrice: 648.00, savings: 88.00, status: 'rejected', startDate: '2026-04-01', endDate: '2026-06-30' },
];

export const orders: Order[] = [
  { id: 'ORD-001', supplier: 'Fresh Farms Co.', items: [{ name: 'Tomatoes', quantity: 30, unitPrice: 2.85 }, { name: 'Bell Peppers', quantity: 20, unitPrice: 4.20 }, { name: 'Onions', quantity: 25, unitPrice: 1.80 }], total: 214.50, status: 'scheduled', orderDate: '2026-03-12', deliveryDate: '2026-03-13', isAiScheduled: true },
  { id: 'ORD-002', supplier: 'Prime Meats Ltd.', items: [{ name: 'Chicken Breast', quantity: 50, unitPrice: 7.80 }], total: 390.00, status: 'confirmed', orderDate: '2026-03-11', deliveryDate: '2026-03-13', isAiScheduled: true },
  { id: 'ORD-003', supplier: 'Ocean Catch', items: [{ name: 'Salmon Fillet', quantity: 30, unitPrice: 19.50 }, { name: 'Shrimp', quantity: 20, unitPrice: 19.00 }], total: 965.00, status: 'pending', orderDate: '2026-03-12', deliveryDate: '2026-03-14', isAiScheduled: true },
  { id: 'ORD-004', supplier: 'Herb Garden Ltd.', items: [{ name: 'Basil (Fresh)', quantity: 5, unitPrice: 13.00 }], total: 65.00, status: 'delivered', orderDate: '2026-03-09', deliveryDate: '2026-03-10', isAiScheduled: false },
  { id: 'ORD-005', supplier: 'Dairy Direct', items: [{ name: 'Mozzarella', quantity: 25, unitPrice: 8.90 }, { name: 'Heavy Cream', quantity: 20, unitPrice: 4.50 }], total: 312.50, status: 'delivered', orderDate: '2026-03-08', deliveryDate: '2026-03-09', isAiScheduled: false },
  { id: 'ORD-006', supplier: 'Mediterranean Imports', items: [{ name: 'Olive Oil', quantity: 15, unitPrice: 10.50 }, { name: 'Parmesan', quantity: 8, unitPrice: 18.50 }], total: 305.50, status: 'scheduled', orderDate: '2026-03-14', deliveryDate: '2026-03-17', isAiScheduled: true },
  { id: 'ORD-007', supplier: 'Grain Supply Co.', items: [{ name: 'Flour', quantity: 40, unitPrice: 1.05 }, { name: 'Pasta', quantity: 50, unitPrice: 2.10 }], total: 147.00, status: 'confirmed', orderDate: '2026-03-10', deliveryDate: '2026-03-12', isAiScheduled: false },
];

export const usageTrends: UsageTrend[] = [
  { date: 'Mon', usage: 42, predicted: 40 },
  { date: 'Tue', usage: 38, predicted: 39 },
  { date: 'Wed', usage: 45, predicted: 43 },
  { date: 'Thu', usage: 41, predicted: 42 },
  { date: 'Fri', usage: 58, predicted: 55 },
  { date: 'Sat', usage: 65, predicted: 62 },
  { date: 'Sun', usage: 48, predicted: 50 },
];

export const supplierCostComparison: SupplierCostComparison[] = [
  { supplier: 'Fresh Farms', currentCost: 384, aiSuggestedCost: 342 },
  { supplier: 'Prime Meats', currentCost: 1700, aiSuggestedCost: 1560 },
  { supplier: 'Ocean Catch', currentCost: 2100, aiSuggestedCost: 1850 },
  { supplier: 'Med. Imports', currentCost: 925, aiSuggestedCost: 800 },
  { supplier: 'Dairy Direct', currentCost: 736, aiSuggestedCost: 648 },
];

export const predictionConfidence: PredictionConfidence[] = [
  { item: 'Tomatoes', confidence: 94 },
  { item: 'Mozzarella', confidence: 91 },
  { item: 'Basil', confidence: 97 },
  { item: 'Shrimp', confidence: 88 },
  { item: 'Chicken', confidence: 86 },
  { item: 'Salmon', confidence: 82 },
];

export const weeklyForecast = [
  { week: 'Week 1', actual: 285, forecast: 278 },
  { week: 'Week 2', actual: 310, forecast: 305 },
  { week: 'Week 3', actual: 295, forecast: 298 },
  { week: 'Week 4', actual: null, forecast: 320 },
  { week: 'Week 5', actual: null, forecast: 315 },
  { week: 'Week 6', actual: null, forecast: 335 },
];

export const depletionPrediction = [
  { day: 'Day 1', tomatoes: 12, mozzarella: 8, basil: 2, shrimp: 7, chicken: 45 },
  { day: 'Day 2', tomatoes: 7.5, mozzarella: 5, basil: 1.2, shrimp: 4.5, chicken: 37 },
  { day: 'Day 3', tomatoes: 3, mozzarella: 2, basil: 0.4, shrimp: 2, chicken: 29 },
  { day: 'Day 4', tomatoes: 0, mozzarella: 0, basil: 0, shrimp: 0, chicken: 21 },
  { day: 'Day 5', tomatoes: 0, mozzarella: 0, basil: 0, shrimp: 0, chicken: 13 },
  { day: 'Day 6', tomatoes: 0, mozzarella: 0, basil: 0, shrimp: 0, chicken: 5 },
  { day: 'Day 7', tomatoes: 0, mozzarella: 0, basil: 0, shrimp: 0, chicken: 0 },
];

export const reorderSchedule = [
  { date: 'Mar 11', orders: 1, items: 3, cost: 65 },
  { date: 'Mar 12', orders: 2, items: 7, cost: 1180 },
  { date: 'Mar 13', orders: 1, items: 2, cost: 390 },
  { date: 'Mar 14', orders: 2, items: 4, cost: 618 },
  { date: 'Mar 15', orders: 0, items: 0, cost: 0 },
  { date: 'Mar 16', orders: 1, items: 3, cost: 425 },
  { date: 'Mar 17', orders: 1, items: 2, cost: 305 },
];

export const initialChatMessages: ChatMessage[] = [
  {
    id: '1',
    role: 'assistant',
    content: "Welcome! I'm your AI inventory assistant. I've analyzed your current stock levels and have some urgent recommendations.",
    timestamp: new Date().toISOString(),
    type: 'text',
  },
  {
    id: '2',
    role: 'assistant',
    content: '🚨 3 items are at critical stock levels and need immediate attention: Tomatoes, Mozzarella, and Fresh Basil.',
    timestamp: new Date().toISOString(),
    type: 'alert',
  },
  {
    id: '3',
    role: 'assistant',
    content: 'Your tomato stock will run out in 3 days. Would you like to:',
    timestamp: new Date().toISOString(),
    type: 'action',
    actions: [
      { label: 'Order from Fresh Farms Co.', action: 'order_tomatoes', variant: 'primary' },
      { label: 'Compare Suppliers', action: 'compare_suppliers', variant: 'secondary' },
      { label: 'View Usage Trend', action: 'view_trend', variant: 'outline' },
    ],
  },
];
