

export enum EmployeeStatus {
  ACTIVE = 'Active',
  ONBOARDING = 'Onboarding',
  OFFBOARDING = 'Offboarding',
  TERMINATED = 'Terminated'
}

export interface Beneficiary {
  id: string;
  bankName: string;
  accountNumber: string;
  accountName: string;
  currency: string;
}

export interface Employee {
  id: string;
  name: string;
  role: string;
  country: string;
  salary: number;
  currency: string;
  status: EmployeeStatus;
  startDate: string;
  department: string;
  avatar: string;
  beneficiaries: Beneficiary[];
  dob?: string;
  tags?: string[];
  employmentType: 'Regular' | 'Contractor';
}

export interface Tag {
  id: string;
  name: string;
  description: string;
  color: 'indigo' | 'green' | 'blue' | 'amber' | 'red' | 'purple' | 'pink' | 'slate';
  createdAt: string;
}

export enum PayrollStatus {
  DRAFT = 'Draft',
  PROCESSING = 'Processing',
  AWAITING_APPROVAL = 'Awaiting Approval',
  PAID = 'Paid'
}

export interface PayrollRun {
  id: string;
  period: string;
  totalAmount: number;
  currency: string;
  employeeCount: number;
  status: PayrollStatus;
  dueDate: string;
}

// --- NEW EXPENSE TYPES ---
export type ExpenseCategory = 'Travel' | 'Meals' | 'Accommodation' | 'Office' | 'Training' | 'Other';

export interface ExpenseItem {
  id: string;
  employeeId: string;
  employeeName: string; // Denormalized for ease
  beneficiaryId?: string;
  beneficiaryName?: string;
  date: string;
  category: ExpenseCategory;
  description: string;
  amount: number;
  currency: string;
  attachment?: string; // Mock URL
  exchangeRate: number; // Rate at time of entry
  amountUSD: number;
}

export interface ExpenseBatch {
  id: string;
  date: string;
  totalItems: number;
  totalAmountUSD: number;
  status: 'Draft' | 'Processing' | 'Paid';
  items: ExpenseItem[];
}
// -------------------------

export interface ChartData {
  name: string;
  value: number;
  secondary?: number;
  [key: string]: string | number | undefined;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  isStreaming?: boolean;
}

export interface Shareholder {
  id: string;
  entityType: string;
  personType: string;
  country: string;
  name: string;
  idNumber: string;
  idType: string;
  mobile: string;
  email: string;
}

export interface EnterpriseContract {
  id: string;
  title: string;
  type: 'MSA' | 'NDA' | 'DPA' | 'SOW' | 'Other';
  status: 'Active' | 'Pending Signature' | 'Expired' | 'Draft';
  startDate: string;
  endDate?: string;
  signedBy?: string;
  fileUrl?: string;
}