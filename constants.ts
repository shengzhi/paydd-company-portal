

import { Employee, EmployeeStatus, PayrollRun, PayrollStatus, ChartData, Tag, ExpenseBatch, EnterpriseContract } from './types';

// Centralized Exchange Rates
export const SHARED_EXCHANGE_RATES: Record<string, number> = {
  'USD': 1.0,
  'EUR': 1.08,
  'GBP': 1.27,
  'SGD': 0.74,
  'JPY': 0.0067,
  'CNY': 0.138,
  'HKD': 0.128,
  'AUD': 0.65,
  'CAD': 0.73,
  'CHF': 1.10,
  'INR': 0.012,
  'BRL': 0.20,
  'USDT': 1.0,
  'BTC': 65000.0,
  'ETH': 3500.0
};

export const MOCK_EMPLOYEES: Employee[] = [
  {
    id: 'EMP-001',
    name: 'Sarah Chen',
    role: 'Senior Software Engineer',
    country: 'Singapore',
    salary: 8500,
    currency: 'SGD',
    status: EmployeeStatus.ACTIVE,
    startDate: '2023-01-15',
    department: 'Engineering',
    avatar: 'https://picsum.photos/100/100?random=1',
    dob: '1990-05-12',
    tags: ['Core Team', 'Remote'],
    employmentType: 'Regular',
    beneficiaries: [
      { id: 'BEN-001-A', bankName: 'DBS Bank', accountNumber: '123-456-789', accountName: 'Sarah Chen', currency: 'SGD' },
      { id: 'BEN-001-B', bankName: 'UOB', accountNumber: '987-654-321', accountName: 'Sarah Chen', currency: 'USD' }
    ]
  },
  {
    id: 'EMP-002',
    name: 'Marcus Weber',
    role: 'Product Designer',
    country: 'Germany',
    salary: 6200,
    currency: 'EUR',
    status: EmployeeStatus.ACTIVE,
    startDate: '2023-03-01',
    department: 'Product',
    avatar: 'https://picsum.photos/100/100?random=2',
    dob: '1988-11-23',
    tags: ['Design System', 'Hybrid'],
    employmentType: 'Regular',
    beneficiaries: [
      { id: 'BEN-002-A', bankName: 'Deutsche Bank', accountNumber: 'DE89 3704 ...', accountName: 'Marcus Weber', currency: 'EUR' }
    ]
  },
  {
    id: 'EMP-003',
    name: 'Elena Rodriguez',
    role: 'Marketing Manager',
    country: 'Spain',
    salary: 4500,
    currency: 'EUR',
    status: EmployeeStatus.ONBOARDING,
    startDate: '2023-11-01',
    department: 'Marketing',
    avatar: 'https://picsum.photos/100/100?random=3',
    dob: '1995-02-14',
    tags: ['Growth', 'Contractor'],
    employmentType: 'Contractor',
    beneficiaries: [
       { id: 'BEN-003-A', bankName: 'Santander', accountNumber: 'ES91 2100 ...', accountName: 'Elena Rodriguez', currency: 'EUR' }
    ]
  },
  {
    id: 'EMP-004',
    name: 'James O\'Connor',
    role: 'Account Executive',
    country: 'United Kingdom',
    salary: 5000,
    currency: 'GBP',
    status: EmployeeStatus.ACTIVE,
    startDate: '2022-06-15',
    department: 'Sales',
    avatar: 'https://picsum.photos/100/100?random=4',
    dob: '1992-08-30',
    tags: ['Enterprise', 'Quota Crusher'],
    employmentType: 'Regular',
    beneficiaries: [
       { id: 'BEN-004-A', bankName: 'Barclays', accountNumber: '20-45-67 ...', accountName: 'James O\'Connor', currency: 'GBP' }
    ]
  },
  {
    id: 'EMP-005',
    name: 'Yuki Tanaka',
    role: 'Data Analyst',
    country: 'Japan',
    salary: 600000,
    currency: 'JPY',
    status: EmployeeStatus.ACTIVE,
    startDate: '2023-08-20',
    department: 'Data',
    avatar: 'https://picsum.photos/100/100?random=5',
    dob: '1994-04-05',
    tags: ['Analytics', 'APAC'],
    employmentType: 'Contractor',
    beneficiaries: [
       { id: 'BEN-005-A', bankName: 'MUFG Bank', accountNumber: '1234567', accountName: 'Yuki Tanaka', currency: 'JPY' }
    ]
  },
  // Chinese Employees
  {
    id: 'EMP-006',
    name: 'Wang Wei',
    role: 'Frontend Developer',
    country: 'China',
    salary: 25000,
    currency: 'CNY',
    status: EmployeeStatus.ACTIVE,
    startDate: '2022-09-01',
    department: 'Engineering',
    avatar: 'https://ui-avatars.com/api/?name=Wang+Wei&background=random',
    dob: '1996-07-20',
    tags: ['Frontend', 'React', 'Core Team'],
    employmentType: 'Regular',
    beneficiaries: [
       { id: 'BEN-006-A', bankName: 'China Merchants Bank', accountNumber: '622588...', accountName: 'Wang Wei', currency: 'CNY' }
    ]
  },
  {
    id: 'EMP-007',
    name: 'Li Na',
    role: 'Operations Specialist',
    country: 'China',
    salary: 18000,
    currency: 'CNY',
    status: EmployeeStatus.ONBOARDING,
    startDate: '2023-12-01',
    department: 'Operations',
    avatar: 'https://ui-avatars.com/api/?name=Li+Na&background=random',
    dob: '1998-03-15',
    tags: ['Ops', 'Beijing'],
    employmentType: 'Contractor',
    beneficiaries: [
       { id: 'BEN-007-A', bankName: 'ICBC', accountNumber: '621226...', accountName: 'Li Na', currency: 'CNY' }
    ]
  },
  {
    id: 'EMP-008',
    name: '张敏',
    role: 'Product Manager',
    country: 'China',
    salary: 35000,
    currency: 'CNY',
    status: EmployeeStatus.ACTIVE,
    startDate: '2021-05-10',
    department: 'Product',
    avatar: 'https://ui-avatars.com/api/?name=Zhang+Min&background=random',
    dob: '1992-11-11',
    tags: ['Product', 'Mobile', 'High Potential'],
    employmentType: 'Regular',
    beneficiaries: [
       { id: 'BEN-008-A', bankName: 'Bank of China', accountNumber: '621785...', accountName: 'Zhang Min', currency: 'CNY' }
    ]
  }
];

export const MOCK_TAGS: Tag[] = [
  { id: 'TAG-001', name: 'Core Team', description: 'Essential personnel for platform stability', color: 'indigo', createdAt: '2023-01-01' },
  { id: 'TAG-002', name: 'Remote', description: 'Employees working fully remote', color: 'green', createdAt: '2023-01-01' },
  { id: 'TAG-003', name: 'Contractor', description: 'External consultants and freelancers', color: 'amber', createdAt: '2023-02-15' },
  { id: 'TAG-004', name: 'High Potential', description: 'Candidates for future leadership', color: 'purple', createdAt: '2023-06-10' },
  { id: 'TAG-005', name: 'APAC', description: 'Asia-Pacific regional team', color: 'blue', createdAt: '2023-08-20' },
  { id: 'TAG-006', name: 'Design System', description: 'UI/UX Guild members', color: 'pink', createdAt: '2023-03-01' },
];

export const MOCK_PAYROLL_RUNS: PayrollRun[] = [
  {
    id: 'PR-2023-10',
    period: 'October 2023',
    totalAmount: 142500,
    currency: 'USD',
    employeeCount: 42,
    status: PayrollStatus.PAID,
    dueDate: '2023-10-31'
  },
  {
    id: 'PR-2023-11',
    period: 'November 2023',
    totalAmount: 145200,
    currency: 'USD',
    employeeCount: 44,
    status: PayrollStatus.AWAITING_APPROVAL,
    dueDate: '2023-11-30'
  },
  {
    id: 'PR-2023-12',
    period: 'December 2023',
    totalAmount: 148000,
    currency: 'USD',
    employeeCount: 45,
    status: PayrollStatus.DRAFT,
    dueDate: '2023-12-31'
  }
];

export const MOCK_EXPENSE_BATCHES: ExpenseBatch[] = [
  {
    id: 'EXP-2023-10-001',
    date: '2023-10-15',
    totalItems: 3,
    totalAmountUSD: 1250.50,
    status: 'Paid',
    items: []
  },
  {
    id: 'EXP-2023-10-002',
    date: '2023-10-20',
    totalItems: 5,
    totalAmountUSD: 3400.00,
    status: 'Processing',
    items: []
  }
];

export const MOCK_ENTERPRISE_CONTRACTS: EnterpriseContract[] = [
  {
    id: 'CTR-001',
    title: 'Master Services Agreement (Global)',
    type: 'MSA',
    status: 'Active',
    startDate: '2023-01-01',
    signedBy: 'Alex Morgan',
  },
  {
    id: 'CTR-002',
    title: 'Data Processing Agreement (GDPR)',
    type: 'DPA',
    status: 'Active',
    startDate: '2023-01-01',
    signedBy: 'Alex Morgan',
  },
  {
    id: 'CTR-003',
    title: 'Non-Disclosure Agreement',
    type: 'NDA',
    status: 'Active',
    startDate: '2022-12-15',
    signedBy: 'Alex Morgan',
  },
  {
    id: 'CTR-004',
    title: 'Statement of Work: UK Expansion',
    type: 'SOW',
    status: 'Pending Signature',
    startDate: '2023-11-01',
  }
];

export const COST_BY_COUNTRY_DATA: ChartData[] = [
  { name: 'USA', value: 45000 },
  { name: 'China', value: 35000 },
  { name: 'UK', value: 32000 },
  { name: 'Germany', value: 28000 },
  { name: 'Singapore', value: 24000 },
  { name: 'Japan', value: 18000 },
];

export const PAYROLL_TREND_DATA: ChartData[] = [
  { name: 'Jun', value: 120000, secondary: 38 },
  { name: 'Jul', value: 125000, secondary: 39 },
  { name: 'Aug', value: 128000, secondary: 40 },
  { name: 'Sep', value: 135000, secondary: 41 },
  { name: 'Oct', value: 142500, secondary: 42 },
  { name: 'Nov', value: 145200, secondary: 44 },
];