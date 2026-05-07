export type WorkflowState = 'greeting' | 'verification' | 'ordering' | 'complete' | 'predictive' | 'final';

export type ItemStatus = 'pending' | 'verified' | 'missing' | 'ordered';

export interface DeliveryItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  status: ItemStatus;
  checked?: boolean;
  orderedFrom?: string;
}

export interface Vendor {
  id: string;
  name: string;
  available: boolean;
}

export interface OrderableItem extends DeliveryItem {
  vendors: Vendor[];
}

export interface PredictiveItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  ordered: boolean;
  reasoning: string;
}
