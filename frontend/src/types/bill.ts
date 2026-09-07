export interface LineItem {
  id: string;
  name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  confidence: number;
}

export interface BillData {
  items: LineItem[];
  subtotal: number;
  tax: number;
  service_charge: number;
  tip: number;
  discount: number;
  total: number;
  currency: string;
  confidence_overall: number;
}

export type ExtractionStatus = 'idle' | 'uploading' | 'processing' | 'success' | 'error';

export interface SampleReceiptOption {
  id: string;
  title: string;
  subtitle: string;
  category: 'cafe' | 'restaurant' | 'grocery';
  imageUrl: string;
  filename: string;
  data: BillData;
}

export interface Participant {
  id: string;
  name: string;
  colorIndex: number;
}

export type ItemAssignments = Record<string, string[]>; // itemId -> participantId[]

export interface ItemSplitShare {
  itemId: string;
  itemName: string;
  itemTotalPrice: number;
  splitCount: number;
  shareAmount: number;
}

export interface PersonShareBreakdown {
  participantId: string;
  participantName: string;
  colorIndex: number;
  assignedItemsCount: number;
  itemsSubtotal: number;
  proportionalTax: number;
  proportionalServiceCharge: number;
  proportionalTip: number;
  proportionalDiscount: number;
  totalOwed: number;
  itemBreakdowns: ItemSplitShare[];
}
