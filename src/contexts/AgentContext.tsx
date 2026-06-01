import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { WorkflowState, DeliveryItem, OrderableItem, PredictiveItem } from '@/components/FloatingChat/types';
import type { ChatMessage } from '@/types';

interface AgentContextType {
  // Workflow state
  workflowState: WorkflowState;
  setWorkflowState: (state: WorkflowState) => void;

  // Delivery items
  items: DeliveryItem[];
  setItems: React.Dispatch<React.SetStateAction<DeliveryItem[]>>;

  // Orderable items
  orderableItems: OrderableItem[];
  setOrderableItems: React.Dispatch<React.SetStateAction<OrderableItem[]>>;

  // Predictive items
  predictiveItems: PredictiveItem[];
  setPredictiveItems: React.Dispatch<React.SetStateAction<PredictiveItem[]>>;

  // Chat messages (for AI Assistant)
  chatMessages: ChatMessage[];
  addChatMessage: (message: ChatMessage) => void;
  updateChatMessage: (id: string, updater: (msg: ChatMessage) => ChatMessage) => void;
  clearChatMessages: () => void;

  // Sync flag
  lastUpdatedBy: 'agent' | 'assistant' | null;
  setLastUpdatedBy: (source: 'agent' | 'assistant') => void;
}

const AgentContext = createContext<AgentContextType | undefined>(undefined);

const INITIAL_ITEMS: DeliveryItem[] = [
  { id: '1', name: 'Olives', quantity: 10, unit: 'lb', status: 'pending', checked: false },
  { id: '2', name: 'Chicken', quantity: 7, unit: 'lb', status: 'pending', checked: false },
  { id: '3', name: 'Tofu', quantity: 15, unit: 'lb', status: 'pending', checked: false },
  { id: '4', name: 'Cilantro', quantity: 3, unit: 'lb', status: 'pending', checked: false },
  { id: '5', name: 'Olive Oil', quantity: 7, unit: 'oz', status: 'pending', checked: false },
  { id: '6', name: 'Onions', quantity: 20, unit: 'lb', status: 'pending', checked: false },
];

const PREDICTIVE_ITEMS: PredictiveItem[] = [
  {
    id: 'p1',
    name: 'Onions',
    quantity: 25,
    unit: 'lb',
    ordered: false,
    reasoning: 'High usage over the past 3 days (avg 8 lb/day) with tomorrow\'s forecast showing 60% increase in orders containing onion-based dishes.',
  },
  {
    id: 'p2',
    name: 'Tomatoes',
    quantity: 18,
    unit: 'lb',
    ordered: false,
    reasoning: 'Current inventory at 15% below optimal level. Weekend forecast predicts 40% surge in salad orders and pasta dishes requiring fresh tomatoes.',
  },
  {
    id: 'p3',
    name: 'Cheese',
    quantity: 12,
    unit: 'lb',
    ordered: false,
    reasoning: 'Historical data shows cheese consumption spikes on Thursdays. Current stock will run out by Friday morning based on projected demand.',
  },
];

export function AgentProvider({ children }: { children: ReactNode }) {
  const [workflowState, setWorkflowState] = useState<WorkflowState>('greeting');
  const [items, setItems] = useState<DeliveryItem[]>(INITIAL_ITEMS);
  const [orderableItems, setOrderableItems] = useState<OrderableItem[]>([]);
  const [predictiveItems, setPredictiveItems] = useState<PredictiveItem[]>(PREDICTIVE_ITEMS);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [lastUpdatedBy, setLastUpdatedBy] = useState<'agent' | 'assistant' | null>(null);

  const addChatMessage = (message: ChatMessage) => {
    setChatMessages(prev => [...prev, message]);
  };

  const updateChatMessage = (id: string, updater: (msg: ChatMessage) => ChatMessage) => {
    setChatMessages(prev => prev.map(msg => msg.id === id ? updater(msg) : msg));
  };

  const clearChatMessages = () => {
    setChatMessages([]);
  };

  // Sync workflow state changes to chat messages
  useEffect(() => {
    if (lastUpdatedBy === 'agent' && workflowState !== 'greeting') {
      // Add system message to chat when workflow progresses
      const stateMessages: Record<WorkflowState, string> = {
        greeting: '',
        verification: 'Verifying delivery items...',
        ordering: 'Processing missing items for ordering...',
        complete: 'All items verified! Moving to predictive analysis...',
        predictive: 'Analyzing inventory trends for predictive recommendations...',
        final: 'Workflow completed successfully.',
      };

      const message = stateMessages[workflowState];
      if (message) {
        addChatMessage({
          id: `workflow_${Date.now()}`,
          role: 'assistant',
          content: message,
          timestamp: new Date().toISOString(),
          type: 'text',
        });
      }
    }
  }, [workflowState, lastUpdatedBy]);

  const value: AgentContextType = {
    workflowState,
    setWorkflowState,
    items,
    setItems,
    orderableItems,
    setOrderableItems,
    predictiveItems,
    setPredictiveItems,
    chatMessages,
    addChatMessage,
    updateChatMessage,
    clearChatMessages,
    lastUpdatedBy,
    setLastUpdatedBy,
  };

  return <AgentContext.Provider value={value}>{children}</AgentContext.Provider>;
}

export function useAgent() {
  const context = useContext(AgentContext);
  if (context === undefined) {
    throw new Error('useAgent must be used within an AgentProvider');
  }
  return context;
}
