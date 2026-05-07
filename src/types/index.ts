export type InventoryStatus = 'healthy' | 'low' | 'critical';

export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  currentStock: number;
  unit: string;
  dailyUsage: number;
  predictedRunOut: string;
  suggestedOrder: number;
  status: InventoryStatus;
  lastRestocked: string;
  supplier: string;
  unitPrice: number;
}

export interface Prediction {
  id: string;
  itemName: string;
  currentStock: number;
  depletionDate: string;
  confidence: number;
  reorderDate: string;
  suggestedQuantity: number;
  estimatedCost: number;
  reasoning: string;
}

export interface Supplier {
  id: string;
  name: string;
  item: string;
  price: number;
  contractPrice: number | null;
  rating: number;
  leadTimeDays: number;
  isAiRecommended: boolean;
  reliability: number;
  location: string;
}

export interface Contract {
  id: string;
  supplier: string;
  item: string;
  quantity: number;
  frequency: string;
  currentPrice: number;
  contractPrice: number;
  savings: number;
  status: 'pending' | 'accepted' | 'rejected' | 'modified';
  startDate: string;
  endDate: string;
}

export interface Order {
  id: string;
  supplier: string;
  items: { name: string; quantity: number; unitPrice: number }[];
  total: number;
  status: 'scheduled' | 'pending' | 'confirmed' | 'delivered' | 'cancelled';
  orderDate: string;
  deliveryDate: string;
  isAiScheduled: boolean;
}

export type ChatMessageType = 'text' | 'action' | 'table' | 'chart' | 'alert';

export interface ChatAction {
  label: string;
  action: string;
  variant?: 'primary' | 'secondary' | 'outline';
}

export interface ChatTableData {
  headers: string[];
  rows: string[][];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  type: ChatMessageType;
  actions?: ChatAction[];
  tableData?: ChatTableData;
  chartData?: { name: string; value: number }[];
}

export interface DashboardMetric {
  label: string;
  value: string | number;
  change: number;
  changeLabel: string;
  icon: string;
}

export interface UsageTrend {
  date: string;
  usage: number;
  predicted: number;
}

export interface SupplierCostComparison {
  supplier: string;
  currentCost: number;
  aiSuggestedCost: number;
}

export interface PredictionConfidence {
  item: string;
  confidence: number;
}
