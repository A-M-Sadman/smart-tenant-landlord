export type PaymentStatus = 'pending' | 'paid' | 'overdue' | 'partial';
export type PaymentMethod = 'cash' | 'bank_transfer' | 'mobile_banking' | 'other';

export interface UserInfo {
  id: string;
  email: string;
  full_name: string | null;
}

export interface AgreementInfo {
  id: string;
  monthly_rent: string;
  start_date: string;
  end_date: string;
  status: string;
}

export interface Payment {
  id: string;
  agreement_id: string;
  tenant_id: string;
  amount: string;
  due_date: string;
  paid_date: string | null;
  payment_method: PaymentMethod;
  status: PaymentStatus;
  transaction_reference: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  tenant: UserInfo | null;
  agreement: AgreementInfo | null;
}

export interface PaymentCreate {
  agreement_id: string;
  amount: number;
  due_date: string;
  payment_method: PaymentMethod;
  paid_date?: string | null;
  status?: PaymentStatus;
  transaction_reference?: string | null;
  notes?: string | null;
}

export interface PaymentUpdate {
  amount?: number;
  due_date?: string;
  paid_date?: string | null;
  payment_method?: PaymentMethod;
  status?: PaymentStatus;
  transaction_reference?: string | null;
  notes?: string | null;
}