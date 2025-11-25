
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
