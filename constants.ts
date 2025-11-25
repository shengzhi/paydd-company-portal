
import { Employee, EmployeeStatus, PayrollRun, PayrollStatus, ChartData } from './types';

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
    beneficiaries: [
       { id: 'BEN-005-A', bankName: 'MUFG Bank', accountNumber: '1234567', accountName: 'Yuki Tanaka', currency: 'JPY' }
    ]
  }
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

export const COST_BY_COUNTRY_DATA: ChartData[] = [
  { name: 'USA', value: 45000 },
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
