// Shared data models for the Dairy application

export type MilkSession = 'morning' | 'evening';

export interface MilkEntry {
  session: MilkSession;
  date: string; // ISO date string (yyyy-mm-dd)
  farmerId: string;
  farmerName: string;
  liters: number;
  fat: number;
  snf: number;
  rate: number;
  totalAmount: number;
}

export interface CustomerProfile {
  farmerId: string;
  farmerName: string;
  address: string;
  mobileNumber: string;
}

export type InvoiceStatus = 'draft' | 'issued' | 'paid';

export interface BillingLineItem {
  date: string;
  session: MilkSession;
  liters: number;
  rate: number;
  amount: number;
}

export interface BillingInvoice {
  id: string;
  farmerId: string;
  farmerName: string;
  periodStart: string;
  periodEnd: string;
  totalLiters: number;
  grossAmount: number;
  status: InvoiceStatus;
  createdAt: string;
  notes?: string;
  lineItems: BillingLineItem[];
}

export interface InvoiceFilters {
  farmerId: string;
  periodStart: string;
  periodEnd: string;
  status: InvoiceStatus | 'all';
}
