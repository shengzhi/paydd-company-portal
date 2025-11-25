
import React, { useState, useEffect, useMemo } from 'react';
import { MOCK_PAYROLL_RUNS, MOCK_EMPLOYEES } from '../constants';
import { PayrollStatus, PayrollRun } from '../types';
import { 
  Calendar, CheckCircle2, AlertCircle, Clock, Download, ChevronRight, X, 
  Search, CheckSquare, Square, Save, ArrowRight, Receipt, Info, RefreshCcw,
  ChevronLeft, Filter, Users, CreditCard, Wallet, Bitcoin, ChevronDown, FileText,
  Trash2, ClipboardList, PenLine, PlusCircle
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import BankCalendar from '../components/BankCalendar';

// Mock Exchange Rates (Base: 1 Unit = X USD)
// Expanded list to simulate ~100 currencies for search functionality demo
const EXCHANGE_RATES: Record<string, number> = {
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
  'ZAR': 0.053,
  'MXN': 0.058,
  'SEK': 0.096,
  'NZD': 0.61,
  'KRW': 0.00075,
  'AED': 0.27, 
  'AFN': 0.014, 
  'ALL': 0.011, 
  'AMD': 0.0025, 
  'ANG': 0.56,
  'AOA': 0.0012, 
  'ARS': 0.0012, 
  'AWG': 0.56, 
  'AZN': 0.59, 
  'BAM': 0.55,
  'BBD': 0.50, 
  'BDT': 0.0091, 
  'BGN': 0.55, 
  'BHD': 2.65, 
  'BIF': 0.00035,
  'USDT': 1.0,    // Crypto for Payment
  'BTC': 65000.0, // Crypto for Payment
  'ETH': 3500.0   // Crypto for Payment
};

interface PayrollAdjustment {
  amount: number; // Local Currency Amount
  currency: string;
  beneficiaryId: string;
  
  // Real-time calculated fields (frontend simulation)
  exchangeRate: number;
  salaryUSD: number;
  feeUSD: number;
}

const ITEMS_PER_PAGE = 5; // Low number to demonstrate pagination with small mock data
const CRYPTO_FEE_PERCENT = 0.005; // 0.5% extra fee for crypto payments
const PLATFORM_FEE_PER_EMPLOYEE = 25.00; // Mock platform fee per employee

const Payroll: React.FC = () => {
  const { t } = useLanguage();
  const [isCreating, setIsCreating] = useState(false);
  const [step, setStep] = useState(1);
  const [selectedEmployees, setSelectedEmployees] = useState<Set<string>>(new Set());
  const [adjustments, setAdjustments] = useState<Record<string, PayrollAdjustment>>({});
  const [showDraftToast, setShowDraftToast] = useState(false);
  const [paymentCurrency, setPaymentCurrency] = useState('USD');
  const [isPaymentComplete, setIsPaymentComplete] = useState(false);
  
  // State for Runs (moved from constants to state to allow deletion)
  const [allRuns, setAllRuns] = useState<PayrollRun[]>(MOCK_PAYROLL_RUNS);

  // New State for Details View
  const [viewingRun, setViewingRun] = useState<PayrollRun | null>(null);
  const [paymentRunData, setPaymentRunData] = useState<PayrollRun | null>(null); // To carry existing run data to checkout

  // Pagination & Filter State
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDept, setFilterDept] = useState('All');
  const [filterCountry, setFilterCountry] = useState('All');

  // Currency Selector Modal State
  const [editingCurrencyId, setEditingCurrencyId] = useState<string | null>(null);
  const [currencySearch, setCurrencySearch] = useState('');

  // --- Logic for Calculation ---
  const calculateUsdValues = (amount: number, currency: string) => {
    const rate = EXCHANGE_RATES[currency] || 1.0;
    const salaryUSD = amount * rate;
    
    // Mock Fee Logic: $20 Base + 0.5% FX Fee (if not USD)
    // If USD, flat fee $10
    let feeUSD = 0;
    if (currency === 'USD') {
        feeUSD = 10.00; 
    } else {
        feeUSD = 20.00 + (salaryUSD * 0.005);
    }

    return { rate, salaryUSD, feeUSD };
  };

  const getEmpCalcData = (empId: string): PayrollAdjustment | null => {
     const emp = MOCK_EMPLOYEES.find(e => e.id === empId);
     if (!emp) return null;
     const { rate, salaryUSD, feeUSD } = calculateUsdValues(emp.salary, emp.currency);
     return {
        amount: emp.salary,
        currency: emp.currency,
        beneficiaryId: emp.beneficiaries?.[0]?.id || '',
        exchangeRate: rate,
        salaryUSD,
        feeUSD
     };
  };

  const toggleEmployee = (id: string) => {
    const newSelected = new Set(selectedEmployees);
    if (newSelected.has(id)) {
      newSelected.delete(id);
      const newAdjustments = { ...adjustments };
      delete newAdjustments[id];
      setAdjustments(newAdjustments);
    } else {
      newSelected.add(id);
      const calcData = getEmpCalcData(id);
      if (calcData) {
        setAdjustments(prev => ({ ...prev, [id]: calcData }));
      }
    }
    setSelectedEmployees(newSelected);
  };

  const updateAdjustment = (empId: string, field: keyof PayrollAdjustment, value: any) => {
    setAdjustments(prev => {
        const currentAdj = prev[empId];
        let newAdj = { ...currentAdj, [field]: value };

        // If amount or currency changes, recalculate USD values
        if (field === 'amount' || field === 'currency') {
            const amount = field === 'amount' ? value : currentAdj.amount;
            const currency = field === 'currency' ? value : currentAdj.currency;
            const { rate, salaryUSD, feeUSD } = calculateUsdValues(amount, currency);
            newAdj.exchangeRate = rate;
            newAdj.salaryUSD = salaryUSD;
            newAdj.feeUSD = feeUSD;
        }

        return { ...prev, [empId]: newAdj };
    });
  };

  const handleSaveDraft = () => {
    setShowDraftToast(true);
    setTimeout(() => setShowDraftToast(false), 3000);
  };

  const handleDeleteRun = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm(t('confirmDelete'))) {
        setAllRuns(prev => prev.filter(r => r.id !== id));
    }
  };

  const handleCreateNew = () => {
    setIsCreating(true);
    setStep(1);
    setPaymentRunData(null);
    setSelectedEmployees(new Set());
    setAdjustments({});
  };

  // Continue editing a draft
  const handleContinueDraft = (run: PayrollRun) => {
    // 1. Set metadata
    setPaymentRunData(run);
    setIsCreating(true);
    setStep(1);
    setViewingRun(null);

    // 2. Mock population of data based on the 'draft'
    // Since we don't have a real backend, we select the first N employees
    // to match the run.employeeCount, simulating a saved state.
    const savedCount = run.employeeCount;
    const employeesToSelect = MOCK_EMPLOYEES.slice(0, savedCount);
    const newSelected = new Set<string>();
    const newAdjustments: Record<string, PayrollAdjustment> = {};

    employeesToSelect.forEach(emp => {
        newSelected.add(emp.id);
        const calc = getEmpCalcData(emp.id);
        if(calc) newAdjustments[emp.id] = calc;
    });

    setSelectedEmployees(newSelected);
    setAdjustments(newAdjustments);
  };

  // --- Filtering & Pagination Logic ---
  const uniqueDepts = useMemo(() => ['All', ...Array.from(new Set(MOCK_EMPLOYEES.map(e => e.department)))], []);
  const uniqueCountries = useMemo(() => ['All', ...Array.from(new Set(MOCK_EMPLOYEES.map(e => e.country)))], []);

  const filteredEmployees = useMemo(() => {
    return MOCK_EMPLOYEES.filter(emp => {
      const matchesSearch = emp.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            emp.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            emp.role.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesDept = filterDept === 'All' || emp.department === filterDept;
      const matchesCountry = filterCountry === 'All' || emp.country === filterCountry;
      return matchesSearch && matchesDept && matchesCountry;
    });
  }, [searchTerm, filterDept, filterCountry]);

  const totalPages = Math.ceil(filteredEmployees.length / ITEMS_PER_PAGE);
  const paginatedEmployees = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredEmployees.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredEmployees, currentPage]);

  const allFilteredSelected = filteredEmployees.length > 0 && filteredEmployees.every(e => selectedEmployees.has(e.id));
  const pageSelected = paginatedEmployees.length > 0 && paginatedEmployees.every(e => selectedEmployees.has(e.id));

  // Bulk Select Logic
  const handleSelectPage = () => {
    const newSelected = new Set(selectedEmployees);
    const newAdjustments = { ...adjustments };
    const allOnPageSelected = paginatedEmployees.every(e => selectedEmployees.has(e.id));

    paginatedEmployees.forEach(emp => {
      if (allOnPageSelected) {
        newSelected.delete(emp.id);
        delete newAdjustments[emp.id];
      } else {
        newSelected.add(emp.id);
        if (!newAdjustments[emp.id]) {
           const calcData = getEmpCalcData(emp.id);
           if (calcData) newAdjustments[emp.id] = calcData;
        }
      }
    });
    setSelectedEmployees(newSelected);
    setAdjustments(newAdjustments);
  };

  const handleSelectAllFiltered = () => {
    const newSelected = new Set(selectedEmployees);
    const newAdjustments = { ...adjustments };
    
    filteredEmployees.forEach(emp => {
      newSelected.add(emp.id);
      if (!newAdjustments[emp.id]) {
         const calcData = getEmpCalcData(emp.id);
         if (calcData) newAdjustments[emp.id] = calcData;
      }
    });
    setSelectedEmployees(newSelected);
    setAdjustments(newAdjustments);
  };
  
  const clearSelection = () => {
    setSelectedEmployees(new Set());
    setAdjustments({});
  };

  // Reset page when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterDept, filterCountry]);

  // --- Aggregation Logic ---
  const calculateSummary = () => {
    // Check if we are in override mode (paying an existing run)
    // ONLY if we are at step 4 AND status is AWAITING_APPROVAL (or processing directly)
    // If it's a draft (step < 4 or manually editing), use the realtime calculation.
    if (paymentRunData && step === 4 && paymentRunData.status !== PayrollStatus.DRAFT) {
      // Return a simulated summary based on the passed Run Data
      const simulatedFee = paymentRunData.employeeCount * PLATFORM_FEE_PER_EMPLOYEE;
      return {
        breakdown: {},
        totalSalaryUSD: paymentRunData.totalAmount, 
        totalFeeUSD: simulatedFee 
      };
    }

    const breakdown: Record<string, { count: number, salaryUSD: number, feeUSD: number }> = {};
    let totalSalaryUSD = 0;
    let totalFeeUSD = 0;

    selectedEmployees.forEach(id => {
      const adj = adjustments[id];
      if (adj) {
        if (!breakdown[adj.currency]) {
            breakdown[adj.currency] = { count: 0, salaryUSD: 0, feeUSD: 0 };
        }
        breakdown[adj.currency].count += 1;
        breakdown[adj.currency].salaryUSD += adj.salaryUSD;
        breakdown[adj.currency].feeUSD += adj.feeUSD;

        totalSalaryUSD += adj.salaryUSD;
        totalFeeUSD += adj.feeUSD;
      }
    });

    return { breakdown, totalSalaryUSD, totalFeeUSD };
  };

  const getStatusIcon = (status: PayrollStatus) => {
    switch (status) {
      case PayrollStatus.PAID: return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case PayrollStatus.AWAITING_APPROVAL: return <AlertCircle className="w-5 h-5 text-amber-500" />;
      case PayrollStatus.PROCESSING: return <Clock className="w-5 h-5 text-blue-500" />;
      default: return <PenLine className="w-5 h-5 text-slate-400" />;
    }
  };

  const handleProcessPayment = () => {
    setIsPaymentComplete(true);
    setTimeout(() => {
       setIsCreating(false);
       setStep(1);
       setSelectedEmployees(new Set());
       setAdjustments({});
       setPaymentRunData(null); // Clear override
       setIsPaymentComplete(false);
       setViewingRun(null); // Return to dashboard
    }, 3000);
  };

  // Switch to Payment View for an existing run
  const handlePayFromDetails = (run: PayrollRun) => {
    setPaymentRunData(run);
    setIsCreating(true);
    setStep(4);
    setViewingRun(null); // Close details
  };

  // --- Render Views ---

  // Currency Selector Modal Component
  const CurrencySelector = () => {
    if (!editingCurrencyId) return null;

    const availableCurrencies = Object.keys(EXCHANGE_RATES).filter(c => 
      !['USDT', 'BTC', 'ETH'].includes(c) && 
      c.toLowerCase().includes(currencySearch.toLowerCase())
    );

    const handleSelect = (curr: string) => {
      updateAdjustment(editingCurrencyId, 'currency', curr);
      setEditingCurrencyId(null);
    };

    return (
      <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm flex flex-col max-h-[80vh] overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex justify-between items-center">
             <h3 className="font-bold text-slate-900">{t('selectCurrency')}</h3>
             <button onClick={() => setEditingCurrencyId(null)} className="p-1 hover:bg-slate-100 rounded-full text-slate-400">
               <X className="w-5 h-5" />
             </button>
          </div>
          <div className="p-4 border-b border-slate-100 bg-slate-50">
            <div className="relative">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
               <input 
                 type="text" 
                 autoFocus
                 placeholder={t('searchCurrency')}
                 value={currencySearch}
                 onChange={(e) => setCurrencySearch(e.target.value)}
                 className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" 
               />
            </div>
          </div>
          <div className="overflow-y-auto flex-1 p-2">
             {availableCurrencies.length === 0 ? (
               <div className="p-4 text-center text-slate-500 text-sm">No currency found</div>
             ) : (
               <div className="grid grid-cols-2 gap-2">
                 {availableCurrencies.map(curr => (
                   <button 
                     key={curr}
                     onClick={() => handleSelect(curr)}
                     className={`px-4 py-3 text-left text-sm font-medium rounded-lg transition-colors hover:bg-indigo-50 hover:text-indigo-700
                       ${adjustments[editingCurrencyId]?.currency === curr ? 'bg-indigo-100 text-indigo-800' : 'text-slate-700'}
                     `}
                   >
                     {curr}
                   </button>
                 ))}
               </div>
             )}
          </div>
        </div>
      </div>
    );
  };

  const renderDetailsView = () => {
    if (!viewingRun) return null;

    const canPay = viewingRun.status === PayrollStatus.AWAITING_APPROVAL;
    const isDraft = viewingRun.status === PayrollStatus.DRAFT;
    const isPaid = viewingRun.status === PayrollStatus.PAID;
    
    // Mock Calculation for Details View to show Fees
    const mockServiceFee = viewingRun.employeeCount * PLATFORM_FEE_PER_EMPLOYEE; // Mock $25 per employee platform fee
    const grandTotal = viewingRun.totalAmount + mockServiceFee;

    return (
      <div className="space-y-6 animate-fade-in">
         {/* Header */}
         <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setViewingRun(null)}
                className="p-2 bg-white border border-slate-200 rounded-lg text-slate-500 hover:text-indigo-600 hover:border-indigo-200 transition-colors shadow-sm"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">{t('runDetails')}</h1>
                <div className="flex items-center gap-2 text-sm text-slate-500 mt-1">
                   <span>ID: {viewingRun.id}</span>
                   <span>•</span>
                   <span>{viewingRun.period}</span>
                </div>
              </div>
            </div>
            <div className="flex gap-3">
               <button className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  {t('downloadReport')}
               </button>
               
               {isDraft && (
                 <button 
                   onClick={() => handleContinueDraft(viewingRun)}
                   className="px-6 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 shadow-sm flex items-center gap-2"
                 >
                    <ArrowRight className="w-4 h-4" />
                    {t('continue')}
                 </button>
               )}

               {canPay && (
                 <button 
                   onClick={() => handlePayFromDetails(viewingRun)}
                   className="px-6 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 shadow-sm flex items-center gap-2"
                 >
                    <CreditCard className="w-4 h-4" />
                    {t('payNow')}
                 </button>
               )}
            </div>
         </div>

         {/* Status Banner */}
         <div className={`p-4 rounded-xl border flex items-center gap-4 ${
             isPaid ? 'bg-green-50 border-green-200' : 'bg-slate-50 border-slate-200'
         }`}>
            <div className={`p-2 rounded-full ${isPaid ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-600'}`}>
               {isPaid ? <CheckCircle2 className="w-6 h-6" /> : <Info className="w-6 h-6" />}
            </div>
            <div className="flex-1">
               <h3 className={`font-bold ${isPaid ? 'text-green-800' : 'text-slate-800'}`}>{t('paymentStatus')}: {viewingRun.status}</h3>
               <p className={`text-sm ${isPaid ? 'text-green-600' : 'text-slate-600'}`}>
                  {isPaid ? 'This payroll run has been fully processed and paid.' : 
                   isDraft ? 'This order is in Draft status. Click Continue to resume.' :
                   'This run is awaiting payment approval. Please review and pay.'}
               </p>
            </div>
         </div>

         {/* Summary Stats with Fees */}
         <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
               <div className="text-sm text-slate-500 mb-1">{t('subtotal')}</div>
               <div className="text-xl font-bold text-slate-900">{viewingRun.currency} {viewingRun.totalAmount.toLocaleString()}</div>
            </div>
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
               <div className="text-sm text-slate-500 mb-1">{t('estServiceFee')}</div>
               <div className="text-xl font-bold text-slate-900">{viewingRun.currency} {mockServiceFee.toLocaleString()}</div>
            </div>
            <div className="bg-white p-6 rounded-xl border border-indigo-200 shadow-sm bg-indigo-50">
               <div className="text-sm text-indigo-600 font-medium mb-1">{t('grandTotal')}</div>
               <div className="text-2xl font-bold text-indigo-900">{viewingRun.currency} {grandTotal.toLocaleString()}</div>
            </div>
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
               <div className="text-sm text-slate-500 mb-1">{t('totalHeadcount')}</div>
               <div className="text-xl font-bold text-slate-900">{viewingRun.employeeCount}</div>
            </div>
         </div>

         {/* Employee List (Mock for View) */}
         <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
               <h3 className="font-bold text-slate-900">{t('employeeList')}</h3>
               <button className="text-sm text-indigo-600 hover:underline">{t('downloadInvoice')}</button>
            </div>
            <table className="w-full text-left border-collapse">
               <thead className="bg-slate-50">
                  <tr>
                     <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">{t('employees')}</th>
                     <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">{t('roleDept')}</th>
                     <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">{t('status')}</th>
                     <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase text-right">{t('salary')}</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-100">
                  {/* Simulate employees in this run by taking first N employees */}
                  {MOCK_EMPLOYEES.slice(0, 4).map(emp => (
                     <tr key={emp.id} className="hover:bg-slate-50">
                        <td className="px-6 py-4">
                           <div className="flex items-center gap-3">
                              <img src={emp.avatar} alt="" className="w-8 h-8 rounded-full" />
                              <div>
                                 <div className="font-semibold text-slate-900">{emp.name}</div>
                                 <div className="text-xs text-slate-500">{emp.id}</div>
                              </div>
                           </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">
                           <div>{emp.role}</div>
                           <div className="text-xs text-slate-400">{emp.department}</div>
                        </td>
                        <td className="px-6 py-4">
                           <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${isPaid ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'}`}>
                              {isPaid ? 'Paid' : 'Pending'}
                           </span>
                        </td>
                        <td className="px-6 py-4 text-right font-medium text-slate-900">
                           {emp.currency} {emp.salary.toLocaleString()}
                        </td>
                     </tr>
                  ))}
               </tbody>
            </table>
         </div>
      </div>
    );
  };

  const renderCreateView = () => (
    <div className="space-y-6 animate-fade-in relative pb-8">
      {/* Creation Header */}
      <div className="flex items-center justify-between mb-2">
         <div className="flex items-center gap-4">
           <button onClick={() => { setIsCreating(false); setPaymentRunData(null); }} className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition-colors">
             <X className="w-5 h-5" />
           </button>
           <div>
             <h1 className="text-2xl font-bold text-slate-900">{step === 4 ? t('paymentCheckout') : t('createPayrollRun')}</h1>
             
             {/* Hide stepper if directly paying an existing run that is NOT a draft */}
             {!(paymentRunData && paymentRunData.status !== PayrollStatus.DRAFT) && (
               <div className="flex gap-2 mt-2">
                  <div className={`h-1 w-12 rounded-full ${step >= 1 ? 'bg-indigo-600' : 'bg-slate-200'}`}></div>
                  <div className={`h-1 w-12 rounded-full ${step >= 2 ? 'bg-indigo-600' : 'bg-slate-200'}`}></div>
                  <div className={`h-1 w-12 rounded-full ${step >= 3 ? 'bg-indigo-600' : 'bg-slate-200'}`}></div>
                  <div className={`h-1 w-12 rounded-full ${step >= 4 ? 'bg-indigo-600' : 'bg-slate-200'}`}></div>
               </div>
             )}
           </div>
         </div>
         <div className="flex gap-3">
            {step < 4 && !(paymentRunData && paymentRunData.status !== PayrollStatus.DRAFT) && (
              <button onClick={handleSaveDraft} className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 flex items-center gap-2">
                 <Save className="w-4 h-4" /> {t('saveDraft')}
              </button>
            )}
            
            {/* Navigation Logic */}
            {!(paymentRunData && paymentRunData.status !== PayrollStatus.DRAFT) ? (
               <>
                  {step < 3 ? (
                    <button 
                      onClick={() => setStep(step + 1)} 
                      disabled={selectedEmployees.size === 0}
                      className="px-6 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {t('nextStep')} <ArrowRight className="w-4 h-4" />
                    </button>
                  ) : step === 3 ? (
                    <div className="flex gap-2">
                      <button 
                        onClick={() => setStep(step - 1)} 
                        className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50"
                      >
                        {t('prevStep')}
                      </button>
                      <button 
                        onClick={() => setStep(4)}
                        className="px-6 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 flex items-center gap-2 shadow-lg shadow-indigo-200"
                      >
                        <CreditCard className="w-4 h-4" />
                        {t('submitOrder')}
                      </button>
                    </div>
                  ) : (
                     <div className="flex gap-2">
                        <button 
                          onClick={() => setStep(step - 1)} 
                          disabled={isPaymentComplete}
                          className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50 disabled:opacity-50"
                        >
                          {t('prevStep')}
                        </button>
                     </div>
                  )}
               </>
            ) : (
               // Simple navigation for Payment Override
               <div className="text-sm text-slate-500 flex items-center gap-2">
                  <Receipt className="w-4 h-4" />
                  ID: {paymentRunData.id}
               </div>
            )}
         </div>
      </div>

      {/* Step 1: Select Employees */}
      {step === 1 && (
        <div className="space-y-4">
          {/* Filters Toolbar */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
             <div className="flex flex-1 gap-4 w-full">
                <div className="relative flex-1 max-w-md">
                   <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                   <input 
                      type="text" 
                      placeholder={t('searchPlaceholder')} 
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" 
                   />
                </div>
                <select 
                   value={filterDept}
                   onChange={(e) => setFilterDept(e.target.value)}
                   className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 bg-white"
                >
                   <option value="All">{t('allDepartments')}</option>
                   {uniqueDepts.filter(d => d !== 'All').map(d => (
                      <option key={d} value={d}>{d}</option>
                   ))}
                </select>
                <select 
                   value={filterCountry}
                   onChange={(e) => setFilterCountry(e.target.value)}
                   className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 bg-white"
                >
                   <option value="All">{t('allCountries')}</option>
                   {uniqueCountries.filter(c => c !== 'All').map(c => (
                      <option key={c} value={c}>{c}</option>
                   ))}
                </select>
             </div>
          </div>

          {/* Bulk Action & Info Bar */}
          {selectedEmployees.size > 0 && (
            <div className="bg-indigo-50 border border-indigo-100 px-4 py-2 rounded-lg flex items-center justify-between text-sm animate-in fade-in slide-in-from-top-2">
               <div className="flex items-center gap-2">
                  <span className="font-semibold text-indigo-900">{selectedEmployees.size} {t('selected')}</span>
                  {/* If filter is active and we haven't selected everything in the filter yet */}
                  {!allFilteredSelected && filteredEmployees.length > selectedEmployees.size && (
                     <>
                        <span className="text-indigo-300">|</span>
                        <button onClick={handleSelectAllFiltered} className="text-indigo-600 hover:text-indigo-800 font-medium hover:underline">
                           {t('selectAllResults', { count: filteredEmployees.length })}
                        </button>
                     </>
                  )}
               </div>
               <button onClick={clearSelection} className="text-indigo-600 hover:text-indigo-800 text-xs font-semibold uppercase tracking-wider">
                  {t('clearAll')}
               </button>
            </div>
          )}

          {/* Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col min-h-[400px]">
            <div className="flex-1 overflow-auto">
               <table className="w-full text-left border-collapse">
                  <thead className="bg-slate-50 sticky top-0 z-10 shadow-sm">
                    <tr>
                      <th className="w-16 px-6 py-4">
                        <button onClick={handleSelectPage} className="flex items-center group" title="Select current page">
                           {pageSelected ? (
                             <CheckSquare className="w-5 h-5 text-indigo-600" />
                           ) : (
                             <Square className="w-5 h-5 text-slate-300 group-hover:text-slate-400" />
                           )}
                        </button>
                      </th>
                      <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">{t('employees')}</th>
                      <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">{t('roleDept')}</th>
                      <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">{t('location')}</th>
                      <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">{t('salary')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {paginatedEmployees.length === 0 ? (
                       <tr>
                          <td colSpan={5} className="py-12 text-center text-slate-400">
                             No employees found matching your criteria.
                          </td>
                       </tr>
                    ) : (
                       paginatedEmployees.map(emp => {
                         const isSelected = selectedEmployees.has(emp.id);
                         return (
                           <tr 
                              key={emp.id} 
                              className={`hover:bg-indigo-50/30 transition-colors cursor-pointer ${isSelected ? 'bg-indigo-50/20' : ''}`} 
                              onClick={() => toggleEmployee(emp.id)}
                           >
                             <td className="px-6 py-4" onClick={(e) => { e.stopPropagation(); toggleEmployee(emp.id); }}>
                                {isSelected ? <CheckSquare className="w-5 h-5 text-indigo-600" /> : <Square className="w-5 h-5 text-slate-300" />}
                             </td>
                             <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                  <img src={emp.avatar} alt="" className="w-8 h-8 rounded-full" />
                                  <div>
                                    <div className="font-semibold text-slate-900">{emp.name}</div>
                                    <div className="text-xs text-slate-500">{emp.id}</div>
                                  </div>
                                </div>
                             </td>
                             <td className="px-6 py-4 text-sm text-slate-600">
                                <div>{emp.role}</div>
                                <div className="text-xs text-slate-400">{emp.department}</div>
                             </td>
                             <td className="px-6 py-4 text-sm text-slate-600">{emp.country}</td>
                             <td className="px-6 py-4 text-right font-medium text-slate-900">{emp.currency} {emp.salary.toLocaleString()}</td>
                           </tr>
                         );
                       })
                    )}
                  </tbody>
               </table>
            </div>
            
            {/* Pagination Footer */}
            <div className="border-t border-slate-200 p-4 bg-slate-50 flex justify-between items-center">
               <div className="text-xs text-slate-500">
                  {t('showingRange', { 
                     start: filteredEmployees.length === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1,
                     end: Math.min(currentPage * ITEMS_PER_PAGE, filteredEmployees.length),
                     total: filteredEmployees.length 
                  })}
               </div>
               <div className="flex items-center gap-2">
                  <button 
                     onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                     disabled={currentPage === 1}
                     className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed text-slate-600"
                  >
                     <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-xs font-medium text-slate-700 px-2">
                     {currentPage} / {totalPages || 1}
                  </span>
                  <button 
                     onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                     disabled={currentPage === totalPages || totalPages === 0}
                     className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed text-slate-600"
                  >
                     <ChevronRight className="w-4 h-4" />
                  </button>
               </div>
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Review & Edit */}
      {step === 2 && (
        <>
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex justify-between items-center">
             <span className="font-semibold text-slate-700">{t('stepReviewDetails')}</span>
             {step > 1 && (
                <button 
                  onClick={() => setStep(step - 1)} 
                  className="text-xs text-slate-500 hover:text-indigo-600 flex items-center gap-1"
                >
                  {t('prevStep')}
                </button>
             )}
          </div>
          <table className="w-full text-left border-collapse">
             <thead className="bg-slate-50">
               <tr>
                 <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider w-[20%]">{t('employees')}</th>
                 <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider w-[25%]">{t('beneficiary')}</th>
                 <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider w-[30%]">{t('paymentAmount')}</th>
                 <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider w-[25%]">{t('fxRateInfo')} (USD)</th>
               </tr>
             </thead>
             <tbody className="divide-y divide-slate-100">
               {MOCK_EMPLOYEES.filter(e => selectedEmployees.has(e.id)).map(emp => {
                 const adj = adjustments[emp.id];
                 return (
                   <tr key={emp.id} className="hover:bg-slate-50">
                     <td className="px-6 py-4 align-top">
                        <div className="flex items-center gap-3">
                          <img src={emp.avatar} alt="" className="w-8 h-8 rounded-full" />
                          <div>
                            <div className="font-semibold text-slate-900">{emp.name}</div>
                            <div className="text-xs text-slate-500">{emp.country}</div>
                          </div>
                        </div>
                     </td>
                     <td className="px-6 py-4 align-top">
                        <select 
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
                          value={adj?.beneficiaryId}
                          onChange={(e) => updateAdjustment(emp.id, 'beneficiaryId', e.target.value)}
                        >
                          {emp.beneficiaries.map(ben => (
                            <option key={ben.id} value={ben.id}>
                              {ben.bankName} - {ben.accountNumber.slice(-4)} ({ben.currency})
                            </option>
                          ))}
                          {emp.beneficiaries.length === 0 && <option value="">No beneficiary</option>}
                        </select>
                     </td>
                     <td className="px-6 py-4 align-top">
                        <div className="flex gap-2 mb-2">
                            <input 
                              type="number"
                              value={adj?.amount}
                              onChange={(e) => updateAdjustment(emp.id, 'amount', parseFloat(e.target.value))}
                              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none font-semibold text-slate-800"
                            />
                            <button
                              onClick={() => {
                                setEditingCurrencyId(emp.id);
                                setCurrencySearch('');
                              }}
                              className="w-24 px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 flex items-center justify-between"
                            >
                              {adj?.currency}
                              <ChevronDown className="w-3 h-3 text-slate-400" />
                            </button>
                        </div>
                     </td>
                     <td className="px-6 py-4 align-top">
                        {/* Real-time breakdown card */}
                        <div className="bg-slate-50 rounded-lg p-3 text-xs border border-slate-100">
                           <div className="flex justify-between mb-1">
                              <span className="text-slate-500">{t('oneUsdEquals')}</span>
                              <span className="font-mono text-slate-700">{(1 / (adj?.exchangeRate || 1)).toFixed(4)} {adj?.currency}</span>
                           </div>
                           <div className="flex justify-between mb-1">
                              <span className="text-slate-500">{t('equivUSD')}:</span>
                              <span className="font-semibold text-slate-900">${adj?.salaryUSD.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                           </div>
                           <div className="flex justify-between border-t border-slate-200 pt-1 mt-1">
                              <span className="text-slate-500">{t('serviceFeeUSD')}:</span>
                              <span className="font-medium text-slate-900">${adj?.feeUSD.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                           </div>
                        </div>
                     </td>
                   </tr>
                 );
               })}
             </tbody>
          </table>
        </div>
        {/* Currency Selector Modal */}
        <CurrencySelector />
        </>
      )}

      {/* Step 3: Summary (Denominated in USD) */}
      {step === 3 && (
        <div className="animate-fade-in space-y-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
             <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-indigo-50 rounded-lg">
                   <Receipt className="w-6 h-6 text-indigo-600" />
                </div>
                <div>
                   <h2 className="text-lg font-bold text-slate-900">{t('orderDetail')}</h2>
                   <p className="text-sm text-slate-500">{t('stepSummary')}</p>
                </div>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Breakdown by Currency Group */}
                <div>
                   <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
                     <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></span>
                     {t('currencyBreakdown')}
                   </h3>
                   <div className="space-y-4">
                      {Object.entries(calculateSummary().breakdown).map(([currency, data]) => (
                        <div key={currency} className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                           <div className="flex justify-between items-center mb-2">
                              <span className="font-bold text-slate-900 flex items-center gap-2">
                                 {currency} 
                                 <RefreshCcw className="w-3 h-3 text-slate-400" /> 
                                 <span className="text-xs font-normal text-slate-500">USD</span>
                              </span>
                              <span className="text-xs font-medium text-slate-500 bg-white px-2 py-1 rounded border border-slate-200">
                                {data.count} Emps
                              </span>
                           </div>
                           <div className="space-y-1 text-sm">
                              <div className="flex justify-between text-slate-600">
                                 <span>{t('subtotal')}</span>
                                 <span>$ {data.salaryUSD.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                              </div>
                              <div className="flex justify-between text-slate-500 text-xs">
                                 <span>{t('estServiceFee')}</span>
                                 <span>$ {data.feeUSD.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                              </div>
                              <div className="border-t border-slate-200 pt-2 mt-2 flex justify-between font-bold text-slate-900">
                                 <span>{t('totalCostUSD')}</span>
                                 <span>$ {(data.salaryUSD + data.feeUSD).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                              </div>
                           </div>
                        </div>
                      ))}
                   </div>
                </div>

                {/* Grand Summary Box (USD) */}
                <div className="bg-indigo-900 rounded-xl p-6 text-white flex flex-col justify-between">
                   <div>
                      <h3 className="text-lg font-bold mb-6">{t('grandTotal')}</h3>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center border-b border-indigo-800 pb-4">
                           <span className="text-indigo-200">{t('totalHeadcount')}</span>
                           <span className="text-2xl font-bold">{selectedEmployees.size}</span>
                        </div>
                        
                        <div className="flex justify-between items-start pt-2">
                           <span className="text-indigo-200">{t('subtotal')}</span>
                           <span className="font-medium text-lg">$ {calculateSummary().totalSalaryUSD.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                        </div>

                        <div className="flex justify-between items-start">
                           <div className="flex flex-col">
                               <span className="text-indigo-200">{t('estServiceFee')}</span>
                               <span className="text-xs text-indigo-400 mt-0.5">{t('platformFeeDesc')}</span>
                           </div>
                           <div className="text-right">
                              <span className="font-medium">$ {calculateSummary().totalFeeUSD.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                           </div>
                        </div>
                        
                        <div className="border-t border-indigo-700 pt-4 mt-2 flex justify-between items-center">
                            <span className="text-xl font-bold">Total (USD)</span>
                            <span className="text-3xl font-bold">$ {(calculateSummary().totalSalaryUSD + calculateSummary().totalFeeUSD).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                        </div>
                      </div>
                   </div>
                   
                   <div className="mt-8 p-4 bg-indigo-800/50 rounded-lg flex gap-3 text-xs text-indigo-200">
                      <Info className="w-5 h-5 flex-shrink-0" />
                      <p>{t('exchangeRateNotice')}</p>
                   </div>
                </div>
             </div>
          </div>
        </div>
      )}

      {/* Step 4: Payment Checkout */}
      {step === 4 && (
        <div className="animate-fade-in space-y-6">
           {isPaymentComplete ? (
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-12 flex flex-col items-center text-center animate-in zoom-in-95">
                 <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
                    <CheckCircle2 className="w-10 h-10 text-green-600" />
                 </div>
                 <h2 className="text-2xl font-bold text-slate-900 mb-2">{t('paymentSuccess')}</h2>
                 <p className="text-slate-500 mb-8">{t('paymentSuccessDesc')}</p>
                 <button 
                    onClick={() => { setIsCreating(false); setStep(1); setSelectedEmployees(new Set()); setIsPaymentComplete(false); setPaymentRunData(null); }}
                    className="px-6 py-2.5 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 transition-colors"
                 >
                    {t('returnToDashboard')}
                 </button>
              </div>
           ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                 {/* Left: Payment Method & Currency */}
                 <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                       <h3 className="text-lg font-bold text-slate-900 mb-4">{t('paymentMethod')}</h3>
                       <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                          <button 
                            className={`p-4 rounded-xl border-2 text-left transition-all ${paymentCurrency === 'USD' ? 'border-indigo-600 bg-indigo-50' : 'border-slate-200 hover:border-indigo-300'}`}
                            onClick={() => setPaymentCurrency('USD')}
                          >
                             <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-white rounded-lg shadow-sm">
                                   <Wallet className="w-5 h-5 text-indigo-600" />
                                </div>
                                <span className="font-semibold text-slate-900">{t('walletBalance')}</span>
                             </div>
                             <p className="text-sm text-slate-500">Pay with USD Balance</p>
                          </button>
                          
                          <button 
                             className={`p-4 rounded-xl border-2 text-left transition-all ${['BTC', 'USDT', 'ETH'].includes(paymentCurrency) ? 'border-indigo-600 bg-indigo-50' : 'border-slate-200 hover:border-indigo-300'}`}
                             onClick={() => setPaymentCurrency('USDT')}
                          >
                             <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-white rounded-lg shadow-sm">
                                   <Bitcoin className="w-5 h-5 text-amber-500" />
                                </div>
                                <span className="font-semibold text-slate-900">{t('cryptoPayment')}</span>
                             </div>
                             <p className="text-sm text-slate-500">Pay with USDT, BTC, ETH</p>
                          </button>
                       </div>

                       <div className="space-y-2">
                          <label className="text-sm font-medium text-slate-700">{t('selectPaymentCurrency')}</label>
                          <select 
                             value={paymentCurrency}
                             onChange={(e) => setPaymentCurrency(e.target.value)}
                             className="w-full p-3 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                          >
                             <optgroup label="Fiat">
                                <option value="USD">USD - US Dollar</option>
                                <option value="EUR">EUR - Euro</option>
                                <option value="GBP">GBP - British Pound</option>
                             </optgroup>
                             <optgroup label="Crypto">
                                <option value="USDT">USDT - Tether</option>
                                <option value="BTC">BTC - Bitcoin</option>
                                <option value="ETH">ETH - Ethereum</option>
                             </optgroup>
                          </select>
                       </div>
                    </div>

                    {/* Balance Info */}
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-center justify-between">
                       <div className="flex items-center gap-3">
                          <div className="p-2 bg-white rounded-full shadow-sm">
                             {['BTC', 'ETH', 'USDT'].includes(paymentCurrency) ? <Bitcoin className="w-5 h-5 text-amber-500" /> : <Wallet className="w-5 h-5 text-indigo-500" />}
                          </div>
                          <div>
                             <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">{t('availableBalance')}</p>
                             <p className="font-bold text-slate-900">
                                {paymentCurrency === 'USD' ? '19,576.99' : paymentCurrency === 'BTC' ? '0.45' : '0.00'} {paymentCurrency}
                             </p>
                          </div>
                       </div>
                       {paymentCurrency !== 'USD' && paymentCurrency !== 'BTC' && (
                          <span className="text-xs font-bold text-red-500 bg-red-50 px-2 py-1 rounded">{t('insufficientBalance')}</span>
                       )}
                    </div>
                 </div>

                 {/* Right: Payment Summary */}
                 <div className="bg-white rounded-xl border border-slate-200 shadow-xl overflow-hidden flex flex-col h-fit">
                    <div className="p-6 border-b border-slate-100 bg-slate-50">
                       <h3 className="font-bold text-lg text-slate-900">{t('amountToPay')}</h3>
                       <p className="text-sm text-slate-500">Order ID: #{paymentRunData ? paymentRunData.id : Math.floor(Math.random() * 1000000)}</p>
                    </div>
                    
                    <div className="p-6 space-y-4">
                       <div className="flex justify-between items-center text-sm">
                          <span className="text-slate-500">{t('subtotal')}</span>
                          <span className="font-medium">$ {calculateSummary().totalSalaryUSD.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                       </div>
                       <div className="flex justify-between items-center text-sm">
                          <span className="text-slate-500">{t('estServiceFee')}</span>
                          <span className="font-medium">$ {calculateSummary().totalFeeUSD.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                       </div>

                       {['USDT', 'BTC', 'ETH'].includes(paymentCurrency) && (
                         <div className="flex justify-between items-center text-sm animate-in fade-in">
                            <span className="text-slate-500 flex items-center gap-1.5">
                               {t('cryptoProcessingFee')}
                               <Info className="w-3.5 h-3.5 text-slate-400" />
                            </span>
                            <span className="font-medium text-amber-600">
                               + $ {((calculateSummary().totalSalaryUSD + calculateSummary().totalFeeUSD) * CRYPTO_FEE_PERCENT).toLocaleString(undefined, {minimumFractionDigits: 2})}
                            </span>
                         </div>
                       )}
                       
                       <div className="flex justify-between items-center text-sm">
                          <span className="text-slate-500">{t('finalExchangeRate')}</span>
                          <div className="text-right">
                             <span className="font-medium text-indigo-600 block">
                                1 USD ≈ {(1 / (EXCHANGE_RATES[paymentCurrency] || 1)).toLocaleString(undefined, {maximumFractionDigits: 8})} {paymentCurrency}
                             </span>
                          </div>
                       </div>
                       
                       <div className="border-t border-dashed border-slate-200 pt-4 mt-2">
                          <div className="flex justify-between items-end">
                             <span className="font-bold text-slate-900 text-lg">{t('amountToPay')}</span>
                             <span className="font-bold text-2xl text-indigo-600">
                                {(() => {
                                   const baseTotal = calculateSummary().totalSalaryUSD + calculateSummary().totalFeeUSD;
                                   const isCrypto = ['USDT', 'BTC', 'ETH'].includes(paymentCurrency);
                                   const fee = isCrypto ? baseTotal * CRYPTO_FEE_PERCENT : 0;
                                   const totalUSD = baseTotal + fee;
                                   const rate = EXCHANGE_RATES[paymentCurrency] || 1;
                                   return (totalUSD / rate).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 6});
                                })()} 
                                <span className="text-sm font-medium ml-1">{paymentCurrency}</span>
                             </span>
                          </div>
                       </div>
                    </div>
                    
                    <div className="p-4 bg-slate-50 border-t border-slate-100">
                       <button 
                          onClick={handleProcessPayment}
                          className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold shadow-lg shadow-indigo-200 transition-all active:scale-95 flex justify-center items-center gap-2"
                       >
                          {t('confirmPayment')} <ArrowRight className="w-4 h-4" />
                       </button>
                    </div>
                 </div>
              </div>
           )}
        </div>
      )}

      {/* Toast Notification */}
      {showDraftToast && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-slate-800 text-white px-6 py-3 rounded-lg shadow-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 z-50">
          <CheckCircle2 className="w-5 h-5 text-green-400" />
          <div>
            <div className="font-semibold text-sm">{t('draftSaved')}</div>
            <div className="text-xs text-slate-300">{t('draftDesc')}</div>
          </div>
        </div>
      )}
    </div>
  );

  const renderDashboardView = () => {
    const activeRuns = allRuns.filter(r => r.status !== PayrollStatus.PAID);
    const paidRuns = allRuns.filter(r => r.status === PayrollStatus.PAID);
    
    return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
           <h1 className="text-2xl font-bold text-slate-900">{t('payroll')}</h1>
           <p className="text-slate-500 mt-1">{t('reviewPayroll')}</p>
        </div>
        <div className="flex gap-3">
           <button className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50">
             {t('reportCenter')}
           </button>
           <button 
             onClick={handleCreateNew}
             className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-sm transition-colors"
           >
             {t('offCycleRun')}
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Run Card */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider">{t('activeRuns')}</h2>
          
          {activeRuns.length === 0 ? (
            <div className="bg-white rounded-xl border-2 border-dashed border-slate-200 p-8 flex flex-col items-center justify-center text-center h-64 hover:border-indigo-300 transition-colors">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 border border-slate-100">
                    <ClipboardList className="w-8 h-8 text-slate-300" />
                </div>
                <h3 className="text-lg font-medium text-slate-900 mb-2">{t('noActiveRuns')}</h3>
                <p className="text-slate-500 text-sm mb-6 max-w-sm">{t('noActiveRunsDesc')}</p>
                <button 
                    onClick={handleCreateNew}
                    className="px-5 py-2.5 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2 shadow-sm"
                >
                    <PlusCircle className="w-4 h-4" />
                    {t('createRunNow')}
                </button>
            </div>
          ) : (
            activeRuns.map(run => (
              <div key={run.id} className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 hover:shadow-md transition-shadow relative overflow-hidden group">
                 {run.status === PayrollStatus.AWAITING_APPROVAL && (
                   <div className="absolute top-0 right-0 bg-amber-100 text-amber-700 text-xs font-bold px-3 py-1 rounded-bl-xl">
                      {t('actionRequired')}
                   </div>
                 )}
                 <div className="flex justify-between items-start mb-6">
                   <div className="flex items-center gap-4">
                      <div className="bg-indigo-50 p-3 rounded-lg">
                        <Calendar className="w-6 h-6 text-indigo-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-slate-900">{run.period}</h3>
                        <p className="text-sm text-slate-500">ID: {run.id}</p>
                      </div>
                   </div>
                   <div className="text-right">
                      <p className="text-sm text-slate-500">{t('totalPayroll')}</p>
                      <p className="text-2xl font-bold text-slate-900">{run.currency} {run.totalAmount.toLocaleString()}</p>
                   </div>
                 </div>
  
                 <div className="grid grid-cols-3 gap-4 mb-6 p-4 bg-slate-50 rounded-lg">
                    <div>
                      <p className="text-xs text-slate-500 mb-1">{t('dueDate')}</p>
                      <p className="text-sm font-medium text-slate-900">{run.dueDate}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 mb-1">{t('employees')}</p>
                      <p className="text-sm font-medium text-slate-900">{run.employeeCount}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 mb-1">{t('status')}</p>
                      <div className="flex items-center gap-2">
                         {getStatusIcon(run.status)}
                         <span className="text-sm font-medium text-slate-900">{run.status}</span>
                      </div>
                    </div>
                 </div>
  
                 <div className="flex gap-3 justify-end items-center">
                    {run.status === PayrollStatus.DRAFT && (
                        <button 
                            onClick={(e) => handleDeleteRun(run.id, e)}
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors mr-auto"
                            title={t('delete')}
                        >
                            <Trash2 className="w-5 h-5" />
                        </button>
                    )}

                    {run.status !== PayrollStatus.DRAFT && (
                        <button 
                            onClick={() => setViewingRun(run)}
                            className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900"
                        >
                            {t('viewDetails')}
                        </button>
                    )}
                    
                    {run.status === PayrollStatus.DRAFT && (
                       <button 
                         onClick={() => handleContinueDraft(run)}
                         className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm flex items-center gap-2"
                       >
                         {t('continue')} <ArrowRight className="w-4 h-4" />
                       </button>
                    )}

                    {run.status === PayrollStatus.AWAITING_APPROVAL && (
                      <button 
                        onClick={() => handlePayFromDetails(run)}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
                      >
                        {t('approvePay')}
                      </button>
                    )}
                 </div>
              </div>
            ))
          )}
        </div>

        {/* Right Column: Calendar & History */}
        <div className="space-y-6">
           <BankCalendar />

           <div className="space-y-4">
             <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider">{t('history')}</h2>
             <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="divide-y divide-slate-100">
                  {paidRuns.map(run => (
                    <div 
                      key={run.id} 
                      className="p-4 hover:bg-slate-50 transition-colors cursor-pointer group"
                      onClick={() => setViewingRun(run)}
                    >
                       <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-slate-900">{run.period}</span>
                          <CheckCircle2 className="w-4 h-4 text-green-500" />
                       </div>
                       <div className="flex justify-between items-center text-sm text-slate-500">
                          <span>{run.currency} {run.totalAmount.toLocaleString()}</span>
                          <span className="group-hover:translate-x-1 transition-transform">
                            <ChevronRight className="w-4 h-4 text-slate-300" />
                          </span>
                       </div>
                    </div>
                  ))}
                  {/* Fake older history items */}
                  <div className="p-4 hover:bg-slate-50 transition-colors cursor-pointer group">
                       <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-slate-900">September 2023</span>
                          <CheckCircle2 className="w-4 h-4 text-green-500" />
                       </div>
                       <div className="flex justify-between items-center text-sm text-slate-500">
                          <span>USD 135,000</span>
                          <span className="group-hover:translate-x-1 transition-transform">
                            <ChevronRight className="w-4 h-4 text-slate-300" />
                          </span>
                       </div>
                    </div>
                </div>
                <div className="p-3 bg-slate-50 border-t border-slate-100 text-center">
                   <button className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center justify-center gap-1">
                     {t('downloadAll')} <Download className="w-3 h-3" />
                   </button>
                </div>
             </div>
           </div>
        </div>
      </div>
    </div>
  )};

  if (viewingRun) return renderDetailsView();
  return isCreating ? renderCreateView() : renderDashboardView();
};

export default Payroll;
