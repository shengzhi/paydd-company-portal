
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { MOCK_EXPENSE_BATCHES, MOCK_EMPLOYEES, SHARED_EXCHANGE_RATES } from '../constants';
import { ExpenseBatch, ExpenseItem, ExpenseCategory, Employee } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { 
  Plus, Receipt, FileText, CheckCircle2, Clock, AlertCircle, 
  ChevronRight, ArrowRight, X, Trash2, Upload, Wallet, Bitcoin, Info, Search, ChevronDown, Briefcase, Check, LayoutDashboard, Download
} from 'lucide-react';

const Expenses: React.FC = () => {
  const { t } = useLanguage();
  const [batches, setBatches] = useState<ExpenseBatch[]>(MOCK_EXPENSE_BATCHES);
  
  // View State
  const [viewMode, setViewMode] = useState<'list' | 'create'>('list');
  const [step, setStep] = useState(1);
  
  // Creation Wizard State
  const [currentBatchItems, setCurrentBatchItems] = useState<ExpenseItem[]>([]);
  
  // Temp Item Form State
  const [selectedEmpId, setSelectedEmpId] = useState('');
  const [isEmpDropdownOpen, setIsEmpDropdownOpen] = useState(false);
  const [employeeSearchTerm, setEmployeeSearchTerm] = useState(''); 
  const [selectedBeneficiaryId, setSelectedBeneficiaryId] = useState(''); 
  const [category, setCategory] = useState<ExpenseCategory>('Travel');
  const [date, setDate] = useState('');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [description, setDescription] = useState('');
  const [paymentCurrency, setPaymentCurrency] = useState('USD');
  const [isPaymentComplete, setIsPaymentComplete] = useState(false);
  const [lastAddedId, setLastAddedId] = useState<string | null>(null); // For visual feedback

  // Currency Dropdown State
  const [isCurrencyOpen, setIsCurrencyOpen] = useState(false);
  const [currencySearch, setCurrencySearch] = useState('');

  const empDropdownRef = useRef<HTMLDivElement>(null);
  const currencyDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (empDropdownRef.current && !empDropdownRef.current.contains(event.target as Node)) {
        setIsEmpDropdownOpen(false);
      }
      if (currencyDropdownRef.current && !currencyDropdownRef.current.contains(event.target as Node)) {
        setIsCurrencyOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Constants
  const CRYPTO_FEE_PERCENT = 0.005;

  const handleStartCreate = () => {
    setViewMode('create');
    setStep(1);
    setCurrentBatchItems([]);
    setPaymentCurrency('USD');
    setIsPaymentComplete(false);
    // Reset Form
    setSelectedEmpId('');
    setEmployeeSearchTerm('');
    setSelectedBeneficiaryId('');
    setAmount('');
    setDescription('');
    setDate('');
    setCurrency('USD');
  };

  // Filter employees for dropdown
  const filteredEmployees = useMemo(() => {
    return MOCK_EMPLOYEES.filter(e => 
      e.name.toLowerCase().includes(employeeSearchTerm.toLowerCase()) || 
      e.id.toLowerCase().includes(employeeSearchTerm.toLowerCase())
    );
  }, [employeeSearchTerm]);

  // Filter currencies
  const availableCurrencies = useMemo(() => {
    return Object.keys(SHARED_EXCHANGE_RATES).filter(c => 
        !['USDT', 'BTC', 'ETH'].includes(c) &&
        c.toLowerCase().includes(currencySearch.toLowerCase())
    );
  }, [currencySearch]);

  // Get Selected Employee Object
  const selectedEmployee = useMemo(() => 
    MOCK_EMPLOYEES.find(e => e.id === selectedEmpId), 
  [selectedEmpId]);

  // Update beneficiary when employee is selected
  useEffect(() => {
    if (selectedEmployee && selectedEmployee.beneficiaries.length > 0) {
      setSelectedBeneficiaryId(selectedEmployee.beneficiaries[0].id);
    } else {
      setSelectedBeneficiaryId('');
    }
  }, [selectedEmployee]);

  const addItemToBatch = () => {
    if (!selectedEmpId || !amount || !date) return;

    const beneficiary = selectedEmployee?.beneficiaries.find(b => b.id === selectedBeneficiaryId);
    const rate = SHARED_EXCHANGE_RATES[currency] || 1;
    const amountVal = parseFloat(amount);
    const newItemId = `ITEM-${Date.now()}`;
    
    const newItem: ExpenseItem = {
      id: newItemId,
      employeeId: selectedEmpId,
      employeeName: selectedEmployee?.name || 'Unknown',
      beneficiaryId: selectedBeneficiaryId,
      beneficiaryName: beneficiary ? `${beneficiary.bankName} - ${beneficiary.accountNumber}` : undefined,
      date,
      category,
      amount: amountVal,
      currency,
      description,
      exchangeRate: rate,
      amountUSD: amountVal * rate
    };

    setCurrentBatchItems(prev => [...prev, newItem]);
    setLastAddedId(newItemId);
    
    // Visual feedback timing
    setTimeout(() => setLastAddedId(null), 2000);

    // Reset Form (keep employee selected for ease of bulk entry for same person)
    setAmount('');
    setDescription('');
    // We keep date and category as they might be same for next receipt
  };

  const removeBatchItem = (id: string) => {
    setCurrentBatchItems(prev => prev.filter(i => i.id !== id));
  };

  const calculateTotalUSD = () => {
    return currentBatchItems.reduce((acc, item) => acc + item.amountUSD, 0);
  };

  const handlePayment = () => {
    setIsPaymentComplete(true);
    setTimeout(() => {
        // Create the batch
        const newBatch: ExpenseBatch = {
            id: `EXP-${Date.now()}`,
            date: new Date().toISOString().split('T')[0],
            totalItems: currentBatchItems.length,
            totalAmountUSD: calculateTotalUSD(),
            status: 'Paid', // Assume instant for demo
            items: currentBatchItems
        };
        setBatches(prev => [newBatch, ...prev]);
        
        // Return to list after delay
        setTimeout(() => {
            setViewMode('list');
            setIsPaymentComplete(false);
        }, 2000);
    }, 2000);
  };

  const getStatusColor = (status: string) => {
      switch(status) {
          case 'Paid': return 'bg-green-100 text-green-700';
          case 'Processing': return 'bg-blue-100 text-blue-700';
          default: return 'bg-slate-100 text-slate-700';
      }
  };

  const categories: ExpenseCategory[] = ['Travel', 'Meals', 'Accommodation', 'Office', 'Training', 'Other'];

  // Stats Logic: Count total number of items in PAID batches
  const totalReimbursedCount = batches
    .filter(b => b.status === 'Paid')
    .reduce((acc, b) => acc + b.totalItems, 0);

  // --- Render Wizards ---

  if (viewMode === 'create') {
    return (
      <div className="space-y-6 animate-fade-in relative pb-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
           <div className="flex items-center gap-4">
             <button onClick={() => setViewMode('list')} className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition-colors">
               <X className="w-5 h-5" />
             </button>
             <div>
               <h1 className="text-2xl font-bold text-slate-900">{step === 3 ? t('paymentCheckout') : t('newExpense')}</h1>
               <div className="flex gap-2 mt-2">
                  <div className={`h-1 w-16 rounded-full ${step >= 1 ? 'bg-indigo-600' : 'bg-slate-200'}`}></div>
                  <div className={`h-1 w-16 rounded-full ${step >= 2 ? 'bg-indigo-600' : 'bg-slate-200'}`}></div>
                  <div className={`h-1 w-16 rounded-full ${step >= 3 ? 'bg-indigo-600' : 'bg-slate-200'}`}></div>
               </div>
             </div>
           </div>
        </div>

        {/* Step 1: Add Items */}
        {step === 1 && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Form */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                        <h3 className="text-lg font-bold text-slate-900 mb-4 flex justify-between items-center">
                           {t('addItem')}
                           {lastAddedId && <span className="text-xs font-medium text-green-600 flex items-center gap-1 animate-in fade-in"><Check className="w-3 h-3"/> Added</span>}
                        </h3>
                        
                        <div className="space-y-4">
                            {/* Custom Employee Search & Select */}
                            <div className="relative" ref={empDropdownRef}>
                                <label className="text-sm font-medium text-slate-700 mb-1 block">{t('employees')}</label>
                                
                                {/* Dropdown Trigger */}
                                <div 
                                  onClick={() => setIsEmpDropdownOpen(!isEmpDropdownOpen)}
                                  className={`w-full p-3 border rounded-xl cursor-pointer transition-all flex items-center justify-between bg-white ${isEmpDropdownOpen ? 'border-indigo-500 ring-2 ring-indigo-100' : 'border-slate-200 hover:border-slate-300'}`}
                                >
                                   {selectedEmployee ? (
                                      <div className="flex items-center gap-3">
                                         <img src={selectedEmployee.avatar} alt="" className="w-8 h-8 rounded-full border border-slate-100" />
                                         <div>
                                            <div className="text-sm font-bold text-slate-900">{selectedEmployee.name}</div>
                                            <div className="text-xs text-slate-500">{selectedEmployee.role}</div>
                                         </div>
                                      </div>
                                   ) : (
                                      <span className="text-sm text-slate-400">Select Employee...</span>
                                   )}
                                   <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isEmpDropdownOpen ? 'rotate-180' : ''}`} />
                                </div>

                                {/* Dropdown Panel */}
                                {isEmpDropdownOpen && (
                                   <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl border border-slate-200 shadow-xl z-50 max-h-[320px] flex flex-col animate-in fade-in zoom-in-95">
                                      <div className="p-3 border-b border-slate-100 sticky top-0 bg-white rounded-t-xl z-10">
                                         <div className="relative">
                                            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                                            <input 
                                               type="text" 
                                               placeholder={t('searchEmployee')} 
                                               value={employeeSearchTerm}
                                               onChange={(e) => setEmployeeSearchTerm(e.target.value)}
                                               autoFocus
                                               className="w-full pl-9 pr-3 py-2 bg-slate-50 border-none rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                                            />
                                         </div>
                                      </div>
                                      <div className="overflow-y-auto p-2 space-y-1">
                                         {filteredEmployees.length === 0 ? (
                                            <div className="p-4 text-center text-sm text-slate-400">No employees found.</div>
                                         ) : (
                                            filteredEmployees.map(emp => (
                                               <div 
                                                  key={emp.id}
                                                  onClick={() => {
                                                     setSelectedEmpId(emp.id);
                                                     setIsEmpDropdownOpen(false);
                                                     setEmployeeSearchTerm('');
                                                  }}
                                                  className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${selectedEmpId === emp.id ? 'bg-indigo-50' : 'hover:bg-slate-50'}`}
                                               >
                                                  <img src={emp.avatar} alt="" className="w-9 h-9 rounded-full border border-slate-100" />
                                                  <div className="flex-1 min-w-0">
                                                     <div className="flex justify-between items-center">
                                                        <div className="text-sm font-bold text-slate-900 truncate">{emp.name}</div>
                                                        <img 
                                                           src={`https://flagcdn.com/w20/${
                                                              emp.country === 'Singapore' ? 'sg' : 
                                                              emp.country === 'United Kingdom' ? 'gb' : 
                                                              emp.country === 'Germany' ? 'de' : 
                                                              emp.country === 'Japan' ? 'jp' : 
                                                              emp.country === 'Spain' ? 'es' : 
                                                              emp.country === 'China' ? 'cn' : 'us'
                                                           }.png`} 
                                                           alt={emp.country} 
                                                           className="w-4 h-3 object-cover rounded-[2px] opacity-70"
                                                        />
                                                     </div>
                                                     <div className="flex items-center gap-2 text-xs text-slate-500">
                                                        <span className="truncate">{emp.role}</span>
                                                        <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                                                        <span className="truncate">{emp.department}</span>
                                                     </div>
                                                  </div>
                                                  {selectedEmpId === emp.id && <CheckCircle2 className="w-4 h-4 text-indigo-600" />}
                                               </div>
                                            ))
                                         )}
                                      </div>
                                   </div>
                                )}
                            </div>
                            
                            {/* Bank Selection */}
                            <div>
                                <label className="text-sm font-medium text-slate-700 mb-1 block">{t('selectBankAccount')}</label>
                                <select 
                                    className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none disabled:bg-slate-50 disabled:text-slate-400"
                                    value={selectedBeneficiaryId}
                                    onChange={(e) => setSelectedBeneficiaryId(e.target.value)}
                                    disabled={!selectedEmpId}
                                >
                                    {selectedEmpId ? (
                                       selectedEmployee?.beneficiaries.map(b => (
                                          <option key={b.id} value={b.id}>{b.bankName} - {b.accountNumber} ({b.currency})</option>
                                       ))
                                    ) : (
                                       <option value="">Select Employee First</option>
                                    )}
                                    {selectedEmpId && selectedEmployee?.beneficiaries.length === 0 && (
                                       <option value="">No bank accounts found</option>
                                    )}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-slate-700 mb-1 block">{t('expenseCategory')}</label>
                                    <select 
                                        className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-sm"
                                        value={category}
                                        onChange={(e) => setCategory(e.target.value as any)}
                                    >
                                        {categories.map(c => <option key={c} value={c}>{t(`cat${c}` as any)}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-slate-700 mb-1 block">{t('expenseDate')}</label>
                                    <input 
                                        type="date" 
                                        className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-sm"
                                        value={date}
                                        onChange={(e) => setDate(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-slate-700 mb-1 block">{t('expenseAmount')}</label>
                                    <input 
                                        type="number" 
                                        className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-sm"
                                        placeholder="0.00"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                    />
                                </div>
                                <div className="relative" ref={currencyDropdownRef}>
                                    <label className="text-sm font-medium text-slate-700 mb-1 block">{t('expenseCurrency')}</label>
                                    <div 
                                       onClick={() => setIsCurrencyOpen(!isCurrencyOpen)}
                                       className={`w-full p-2.5 bg-white border rounded-lg text-sm flex justify-between items-center cursor-pointer ${isCurrencyOpen ? 'border-indigo-500 ring-1 ring-indigo-500' : 'border-slate-200'}`}
                                    >
                                       <span>{currency}</span>
                                       <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isCurrencyOpen ? 'rotate-180' : ''}`} />
                                    </div>

                                    {isCurrencyOpen && (
                                       <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-20 max-h-60 overflow-hidden flex flex-col">
                                          <div className="p-2 border-b border-slate-50">
                                             <input 
                                                autoFocus
                                                type="text"
                                                placeholder="Search..."
                                                value={currencySearch}
                                                onChange={(e) => setCurrencySearch(e.target.value)}
                                                className="w-full px-2 py-1 text-sm bg-slate-50 border-none rounded focus:ring-0 outline-none"
                                             />
                                          </div>
                                          <div className="overflow-y-auto flex-1 p-1">
                                             {availableCurrencies.map(c => (
                                                <div 
                                                   key={c}
                                                   onClick={() => {
                                                      setCurrency(c);
                                                      setIsCurrencyOpen(false);
                                                      setCurrencySearch('');
                                                   }}
                                                   className={`px-3 py-2 text-sm rounded cursor-pointer hover:bg-slate-50 ${currency === c ? 'bg-indigo-50 text-indigo-600 font-medium' : 'text-slate-700'}`}
                                                >
                                                   {c}
                                                </div>
                                             ))}
                                             {availableCurrencies.length === 0 && (
                                                <div className="p-2 text-xs text-slate-400 text-center">No results</div>
                                             )}
                                          </div>
                                       </div>
                                    )}
                                </div>
                            </div>
                            
                            {/* Real-time FX Display */}
                            {amount && (
                               <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-3 text-xs">
                                  <div className="flex justify-between mb-1">
                                     <span className="text-slate-500">{t('exchangeRateDisplay')}:</span>
                                     <span className="font-mono text-slate-700">1 {currency} ≈ {(SHARED_EXCHANGE_RATES[currency] || 1).toFixed(4)} USD</span>
                                  </div>
                                  <div className="flex justify-between border-t border-indigo-100 pt-1 mt-1 font-bold">
                                     <span className="text-slate-700">{t('convertedAmount')}:</span>
                                     <span className="text-indigo-700">$ {(parseFloat(amount) * (SHARED_EXCHANGE_RATES[currency] || 1)).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})} USD</span>
                                  </div>
                               </div>
                            )}

                            <div>
                                <label className="text-sm font-medium text-slate-700 mb-1 block">{t('expenseDesc')}</label>
                                <textarea 
                                    className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-sm h-20 resize-none"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                />
                            </div>

                            <div>
                                <label className="text-sm font-medium text-slate-700 mb-1 block">{t('expenseAttachment')}</label>
                                <div className="border-2 border-dashed border-slate-300 rounded-lg p-4 text-center cursor-pointer hover:bg-slate-50 transition-colors">
                                    <Upload className="w-6 h-6 text-slate-400 mx-auto mb-2" />
                                    <span className="text-xs text-slate-500">{t('dragDrop')}</span>
                                </div>
                            </div>

                            <button 
                                onClick={addItemToBatch}
                                disabled={!selectedEmpId || !amount || !date || !selectedBeneficiaryId}
                                className="w-full py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95"
                            >
                                {lastAddedId ? t('addItem') + '...' : t('addItem')}
                            </button>
                        </div>
                    </div>
                </div>

                {/* List */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full">
                        <div className="p-4 border-b border-slate-200 bg-slate-50">
                            <h3 className="font-bold text-slate-900">{t('stepReviewExpenses')}</h3>
                        </div>
                        
                        {currentBatchItems.length === 0 ? (
                            <div className="flex-1 flex flex-col items-center justify-center p-12 text-slate-400">
                                <Receipt className="w-12 h-12 mb-4 opacity-20" />
                                <p>{t('noItemsAdded')}</p>
                            </div>
                        ) : (
                            <div className="flex-1 overflow-y-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-slate-50 border-b border-slate-100">
                                        <tr>
                                            <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">{t('employees')}</th>
                                            <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">{t('expenseCategory')}</th>
                                            <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">{t('expenseAmount')}</th>
                                            <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">{t('equivUSD')}</th>
                                            <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {currentBatchItems.map(item => (
                                            <tr key={item.id} className={`hover:bg-slate-50 transition-colors ${lastAddedId === item.id ? 'bg-green-50' : ''}`}>
                                                <td className="px-6 py-4">
                                                    <div className="text-sm font-medium text-slate-900">{item.employeeName}</div>
                                                    <div className="text-xs text-slate-500">{item.date}</div>
                                                    {item.beneficiaryName && (
                                                       <div className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1">
                                                          <Wallet className="w-3 h-3" />
                                                          {item.beneficiaryName}
                                                       </div>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="inline-flex px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-700">
                                                        {t(`cat${item.category}` as any)}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-slate-900">
                                                    {item.currency} {item.amount.toLocaleString()}
                                                </td>
                                                <td className="px-6 py-4 text-sm font-medium text-indigo-600">
                                                    $ {item.amountUSD.toLocaleString(undefined, {minimumFractionDigits: 2})}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <button onClick={() => removeBatchItem(item.id)} className="text-red-400 hover:text-red-600">
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-between items-center">
                            <div>
                                <p className="text-sm text-slate-500">{t('totalItems')}: {currentBatchItems.length}</p>
                            </div>
                            <div className="flex gap-4 items-center">
                                <div className="text-right">
                                    <p className="text-xs text-slate-500 uppercase font-bold">{t('totalAmount')}</p>
                                    <p className="text-xl font-bold text-slate-900">$ {calculateTotalUSD().toLocaleString(undefined, {minimumFractionDigits: 2})}</p>
                                </div>
                                <button 
                                    onClick={() => setStep(3)}
                                    disabled={currentBatchItems.length === 0}
                                    className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 shadow-lg shadow-indigo-200"
                                >
                                    {t('submitOrder')}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )}

        {/* Step 3: Payment */}
        {step === 3 && (
            <div className="max-w-4xl mx-auto">
                 {isPaymentComplete ? (
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-12 flex flex-col items-center text-center animate-in zoom-in-95">
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
                            <CheckCircle2 className="w-10 h-10 text-green-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900 mb-2">{t('paymentSuccess')}</h2>
                        <p className="text-slate-500 mb-8">{t('paymentSuccessDesc')}</p>
                    </div>
                 ) : (
                    <div className="bg-white rounded-xl border border-slate-200 shadow-xl overflow-hidden grid grid-cols-1 md:grid-cols-2">
                        <div className="p-8 border-r border-slate-200">
                            <h3 className="text-lg font-bold text-slate-900 mb-6">{t('paymentMethod')}</h3>
                            
                            <div className="space-y-4">
                                <label className="block p-4 border-2 rounded-xl cursor-pointer transition-all border-indigo-600 bg-indigo-50">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-white rounded-full shadow-sm">
                                            <Wallet className="w-5 h-5 text-indigo-600" />
                                        </div>
                                        <div>
                                            <div className="font-bold text-slate-900">{t('walletBalance')}</div>
                                            <div className="text-sm text-slate-500">USD Balance</div>
                                        </div>
                                        <input type="radio" checked readOnly className="ml-auto w-5 h-5 text-indigo-600" />
                                    </div>
                                </label>
                            </div>

                            <div className="mt-8 pt-8 border-t border-slate-100">
                                <h3 className="text-lg font-bold text-slate-900 mb-4">{t('selectPaymentCurrency')}</h3>
                                <select 
                                    value={paymentCurrency}
                                    onChange={(e) => setPaymentCurrency(e.target.value)}
                                    className="w-full p-3 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                                >
                                    <optgroup label="Fiat">
                                        <option value="USD">USD - US Dollar</option>
                                    </optgroup>
                                    <optgroup label="Crypto">
                                        <option value="USDT">USDT - Tether</option>
                                        <option value="BTC">BTC - Bitcoin</option>
                                    </optgroup>
                                </select>
                            </div>
                        </div>

                        <div className="p-8 bg-slate-50">
                            <h3 className="text-lg font-bold text-slate-900 mb-6">{t('orderDetail')}</h3>
                            
                            <div className="space-y-4 mb-8">
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-500">{t('totalItems')}</span>
                                    <span className="font-medium text-slate-900">{currentBatchItems.length}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-500">{t('subtotal')}</span>
                                    <span className="font-medium text-slate-900">$ {calculateTotalUSD().toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                                </div>
                                {['USDT', 'BTC'].includes(paymentCurrency) && (
                                     <div className="flex justify-between text-sm">
                                        <span className="text-slate-500 flex items-center gap-1">{t('cryptoProcessingFee')} <Info className="w-3 h-3"/></span>
                                        <span className="font-medium text-amber-600">$ {(calculateTotalUSD() * CRYPTO_FEE_PERCENT).toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                                    </div>
                                )}
                            </div>

                            <div className="border-t border-dashed border-slate-300 pt-6">
                                <div className="flex justify-between items-end mb-6">
                                    <span className="font-bold text-slate-900 text-lg">{t('amountToPay')}</span>
                                    <div className="text-right">
                                        <div className="text-2xl font-bold text-indigo-600">
                                            {(() => {
                                                const totalUSD = calculateTotalUSD() * (['USDT', 'BTC'].includes(paymentCurrency) ? (1 + CRYPTO_FEE_PERCENT) : 1);
                                                const rate = SHARED_EXCHANGE_RATES[paymentCurrency] || 1;
                                                return (totalUSD / rate).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 6});
                                            })()}
                                            <span className="text-base ml-1">{paymentCurrency}</span>
                                        </div>
                                    </div>
                                </div>

                                <button 
                                    onClick={handlePayment}
                                    className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 transition-all active:scale-95 flex justify-center items-center gap-2"
                                >
                                    {t('confirmPayment')} <ArrowRight className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </div>
                 )}
            </div>
        )}
      </div>
    );
  }

  // --- Dashboard (List View) ---
  return (
    <div className="space-y-6 animate-fade-in">
       <div className="flex justify-between items-center">
          <div>
             <h1 className="text-2xl font-bold text-slate-900">{t('reimbursements')}</h1>
             <p className="text-slate-500 mt-1">{t('expensesOverview')}</p>
          </div>
          <button 
            onClick={handleStartCreate}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg text-sm font-bold shadow-lg shadow-indigo-200 transition-all hover:scale-[1.02] flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            {t('newExpense')}
          </button>
       </div>

       {/* Stats Cards */}
       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
             <div className="flex justify-between items-start mb-4">
                <div className="p-2 bg-indigo-50 rounded-lg"><Receipt className="w-6 h-6 text-indigo-600" /></div>
                <span className="text-xs font-semibold bg-green-100 text-green-700 px-2 py-1 rounded-full">+8.2%</span>
             </div>
             <h3 className="text-slate-500 text-sm font-medium mb-1">{t('totalReimbursed')}</h3>
             <p className="text-2xl font-bold text-slate-900">$ 12,450.00</p>
          </div>
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
             <div className="flex justify-between items-start mb-4">
                <div className="p-2 bg-blue-50 rounded-lg"><FileText className="w-6 h-6 text-blue-600" /></div>
             </div>
             <h3 className="text-slate-500 text-sm font-medium mb-1">{t('totalReimbursedCount')}</h3>
             <p className="text-2xl font-bold text-slate-900">{totalReimbursedCount}</p>
          </div>
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
             <div className="flex justify-between items-start mb-4">
                <div className="p-2 bg-amber-50 rounded-lg"><Clock className="w-6 h-6 text-amber-600" /></div>
             </div>
             <h3 className="text-slate-500 text-sm font-medium mb-1">{t('pendingApproval')}</h3>
             <p className="text-2xl font-bold text-slate-900">3</p>
          </div>
       </div>

       {/* Batches List */}
       <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-200 flex justify-between items-center">
             <h2 className="text-lg font-bold text-slate-900">{t('history')}</h2>
             <button className="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-2">
                <Download className="w-4 h-4" /> {t('downloadAll')}
             </button>
          </div>
          <table className="w-full text-left">
             <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                   <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">{t('batchId')}</th>
                   <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">{t('expenseDate')}</th>
                   <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">{t('totalItems')}</th>
                   <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">{t('totalAmount')} (USD)</th>
                   <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">{t('status')}</th>
                   <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase text-right">{t('actions')}</th>
                </tr>
             </thead>
             <tbody className="divide-y divide-slate-100">
                {batches.map((batch) => (
                   <tr key={batch.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-mono text-sm text-slate-600">{batch.id}</td>
                      <td className="px-6 py-4 text-sm text-slate-900">{batch.date}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">{batch.totalItems}</td>
                      <td className="px-6 py-4 text-sm font-medium text-slate-900">$ {batch.totalAmountUSD.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                      <td className="px-6 py-4">
                         <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(batch.status)}`}>
                            <div className="w-1.5 h-1.5 rounded-full bg-current opacity-60"></div>
                            {batch.status}
                         </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                         <button className="text-sm font-medium text-slate-500 hover:text-indigo-600 px-3 py-1 rounded hover:bg-slate-100 transition-colors">
                            {t('viewDetails')}
                         </button>
                      </td>
                   </tr>
                ))}
                {batches.length === 0 && (
                   <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-400">
                         No reimbursement history found.
                      </td>
                   </tr>
                )}
             </tbody>
          </table>
       </div>
    </div>
  );
};

export default Expenses;
