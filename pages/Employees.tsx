
import React, { useState } from 'react';
import { MOCK_EMPLOYEES } from '../constants';
import { Employee, EmployeeStatus } from '../types';
import { Search, Filter, Plus, MoreVertical, MapPin, X, ChevronRight, Check, Briefcase, CreditCard, User, FileText, ChevronLeft, PenTool, ShieldCheck, Download, Trash2, Calendar, DollarSign, Building, AlertTriangle } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';

const Employees: React.FC = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [employees, setEmployees] = useState<Employee[]>(MOCK_EMPLOYEES);
  
  // View State
  const [viewMode, setViewMode] = useState<'list' | 'create' | 'details' | 'offboard'>('list');
  const [step, setStep] = useState(1);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

  // Offboarding State
  const [offboardDate, setOffboardDate] = useState('');
  const [offboardReason, setOffboardReason] = useState('Resignation');

  const [newEmployee, setNewEmployee] = useState<Omit<Partial<Employee>, 'tags'> & { 
    firstName: string; 
    lastName: string;
    email: string;
    phone: string;
    idType: string;
    idNumber: string;
    jobTitle: string;
    contractType: string;
    bankName: string;
    accountNumber: string;
    swiftCode: string;
    accountHolder: string;
    baseSalary: string;
    salaryCurrency: string;
    workScope: string;
    dob: string;
    tags: string;
  }>({
    firstName: '', lastName: '', email: '', phone: '',
    country: '', idType: 'Passport', idNumber: '',
    jobTitle: '', department: '', contractType: 'Regular',
    startDate: '', salaryCurrency: 'USD', baseSalary: '',
    bankName: '', accountNumber: '', swiftCode: '', accountHolder: '',
    workScope: '', dob: '', tags: ''
  });

  const getStatusColor = (status: EmployeeStatus) => {
    switch (status) {
      case EmployeeStatus.ACTIVE: return 'bg-green-100 text-green-700';
      case EmployeeStatus.ONBOARDING: return 'bg-blue-100 text-blue-700';
      case EmployeeStatus.OFFBOARDING: return 'bg-amber-100 text-amber-700';
      case EmployeeStatus.TERMINATED: return 'bg-red-100 text-red-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const handleStartCreate = () => {
    setStep(1);
    setNewEmployee({
      firstName: '', lastName: '', email: '', phone: '',
      country: '', idType: 'Passport', idNumber: '',
      jobTitle: '', department: '', contractType: 'Regular',
      startDate: '', salaryCurrency: 'USD', baseSalary: '',
      bankName: '', accountNumber: '', swiftCode: '', accountHolder: '',
      workScope: '', dob: '', tags: ''
    });
    setViewMode('create');
  };

  const handleViewDetails = (emp: Employee) => {
    setSelectedEmployee(emp);
    setViewMode('details');
  };

  const handleStartOffboard = (emp: Employee) => {
    setSelectedEmployee(emp);
    setOffboardDate(new Date().toISOString().split('T')[0]);
    setViewMode('offboard');
  };

  const confirmOffboard = () => {
    if (!selectedEmployee) return;
    setEmployees(prev => prev.map(e => 
      e.id === selectedEmployee.id 
        ? { ...e, status: EmployeeStatus.OFFBOARDING } 
        : e
    ));
    setViewMode('list');
    setSelectedEmployee(null);
  };

  const handleSubmit = () => {
    // Construct new employee object
    const emp: Employee = {
      id: `EMP-${Math.floor(Math.random() * 10000)}`,
      name: `${newEmployee.firstName} ${newEmployee.lastName}`,
      role: newEmployee.jobTitle,
      country: newEmployee.country || 'Unknown',
      salary: parseFloat(newEmployee.baseSalary) || 0,
      currency: newEmployee.salaryCurrency,
      status: EmployeeStatus.ONBOARDING,
      startDate: newEmployee.startDate || new Date().toISOString().split('T')[0],
      department: newEmployee.department || 'General',
      avatar: `https://ui-avatars.com/api/?name=${newEmployee.firstName}+${newEmployee.lastName}&background=random`,
      dob: newEmployee.dob,
      tags: newEmployee.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
      employmentType: newEmployee.contractType as 'Regular' | 'Contractor',
      beneficiaries: [{
        id: `BEN-${Math.floor(Math.random() * 10000)}`,
        bankName: newEmployee.bankName,
        accountNumber: newEmployee.accountNumber,
        accountName: newEmployee.accountHolder,
        currency: newEmployee.salaryCurrency
      }]
    };
    
    setEmployees(prev => [emp, ...prev]);
    setViewMode('list');
  };

  // --- DETAILS VIEW ---
  if (viewMode === 'details' && selectedEmployee) {
    return (
      <div className="space-y-6 animate-in slide-in-from-right-4 duration-300 pb-12">
        <div className="flex items-center gap-4 mb-6">
          <button 
            onClick={() => setViewMode('list')}
            className="p-2 bg-white border border-slate-200 rounded-lg text-slate-500 hover:text-indigo-600 hover:border-indigo-200 transition-colors shadow-sm"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{t('employeeDetails')}</h1>
            <div className="flex items-center gap-2 text-sm text-slate-500 mt-1">
               <span>ID: {selectedEmployee.id}</span>
               <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedEmployee.status)}`}>
                 {selectedEmployee.status}
               </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Profile Card */}
          <div className="xl:col-span-1 space-y-6">
             <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center text-center">
                <img src={selectedEmployee.avatar} alt={selectedEmployee.name} className="w-24 h-24 rounded-full border-4 border-slate-50 mb-4" />
                <h2 className="text-xl font-bold text-slate-900">{selectedEmployee.name}</h2>
                <p className="text-slate-500 mb-4">{selectedEmployee.role}</p>
                <div className="flex gap-2 mb-6">
                   {selectedEmployee.employmentType === 'Regular' ? (
                     <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-bold">{t('typeRegular')}</span>
                   ) : (
                     <span className="px-3 py-1 bg-amber-50 text-amber-700 rounded-full text-xs font-bold">{t('typeContractor')}</span>
                   )}
                </div>
                
                <div className="w-full border-t border-slate-100 pt-6 grid grid-cols-2 gap-4">
                   <div className="text-left">
                      <p className="text-xs text-slate-400 uppercase font-semibold mb-1">{t('department')}</p>
                      <p className="font-medium text-slate-700">{selectedEmployee.department}</p>
                   </div>
                   <div className="text-left">
                      <p className="text-xs text-slate-400 uppercase font-semibold mb-1">{t('location')}</p>
                      <div className="flex items-center gap-1.5 font-medium text-slate-700">
                         <img 
                           src={`https://flagcdn.com/w20/${
                              selectedEmployee.country === 'Singapore' ? 'sg' : 
                              selectedEmployee.country === 'United Kingdom' ? 'gb' : 
                              selectedEmployee.country === 'Germany' ? 'de' : 
                              selectedEmployee.country === 'Japan' ? 'jp' : 
                              selectedEmployee.country === 'Spain' ? 'es' : 
                              selectedEmployee.country === 'China' ? 'cn' : 'us'
                           }.png`} 
                           alt={selectedEmployee.country} 
                           className="w-4 h-3 object-cover rounded-[1px]"
                         />
                         {selectedEmployee.country}
                      </div>
                   </div>
                   <div className="text-left">
                      <p className="text-xs text-slate-400 uppercase font-semibold mb-1">{t('startDate')}</p>
                      <p className="font-medium text-slate-700">{selectedEmployee.startDate}</p>
                   </div>
                   <div className="text-left">
                      <p className="text-xs text-slate-400 uppercase font-semibold mb-1">{t('dob')}</p>
                      <p className="font-medium text-slate-700">{selectedEmployee.dob || 'N/A'}</p>
                   </div>
                </div>
             </div>
             
             {/* Actions */}
             <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-2">
                <button 
                   onClick={() => handleStartOffboard(selectedEmployee)}
                   className="w-full py-2.5 px-4 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                >
                   <Trash2 className="w-4 h-4" /> {t('offboard')}
                </button>
             </div>
          </div>

          {/* Details */}
          <div className="xl:col-span-2 space-y-6">
             {/* Compensation */}
             <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
                <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                   <div className="p-1.5 bg-green-100 rounded text-green-600"><DollarSign className="w-4 h-4" /></div>
                   {t('salary')} & Compensation
                </h3>
                <div className="grid grid-cols-2 gap-6">
                   <div>
                      <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">{t('baseSalary')}</label>
                      <div className="text-xl font-bold text-slate-900">{selectedEmployee.currency} {selectedEmployee.salary.toLocaleString()}</div>
                   </div>
                   <div>
                      <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">{t('paymentMethod')}</label>
                      <div className="text-base font-medium text-slate-700">Bank Transfer</div>
                   </div>
                </div>
             </div>

             {/* Bank Accounts */}
             <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
                <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                   <div className="p-1.5 bg-indigo-100 rounded text-indigo-600"><Building className="w-4 h-4" /></div>
                   {t('stepBank')}
                </h3>
                {selectedEmployee.beneficiaries?.map((ben, idx) => (
                  <div key={ben.id} className={`flex items-start justify-between ${idx > 0 ? 'mt-4 pt-4 border-t border-slate-100' : ''}`}>
                     <div>
                        <div className="font-bold text-slate-800">{ben.bankName}</div>
                        <div className="text-sm text-slate-500 mt-1 font-mono">{ben.accountNumber}</div>
                        <div className="text-xs text-slate-400 mt-1">{ben.accountName}</div>
                     </div>
                     <div className="text-right">
                        <span className="px-2 py-1 bg-slate-100 rounded text-xs font-bold text-slate-600">{ben.currency}</span>
                     </div>
                  </div>
                ))}
             </div>
          </div>
        </div>
      </div>
    );
  }

  // --- OFFBOARD VIEW ---
  if (viewMode === 'offboard' && selectedEmployee) {
    return (
      <div className="max-w-2xl mx-auto py-12 animate-in slide-in-from-bottom-4 duration-300">
         <div className="bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden">
            <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
               <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                 <AlertTriangle className="w-5 h-5 text-amber-500" />
                 {t('offboardingWizard')}
               </h2>
               <button onClick={() => setViewMode('list')} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
            </div>
            
            <div className="p-8 space-y-6">
               <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <img src={selectedEmployee.avatar} alt="" className="w-12 h-12 rounded-full" />
                  <div>
                     <h3 className="font-bold text-slate-900">{selectedEmployee.name}</h3>
                     <p className="text-sm text-slate-500">{selectedEmployee.role} • {selectedEmployee.department}</p>
                  </div>
               </div>

               <div className="space-y-4">
                  <div className="space-y-2">
                     <label className="text-sm font-medium text-slate-700">{t('lastWorkingDay')}</label>
                     <input 
                       type="date" 
                       value={offboardDate}
                       onChange={(e) => setOffboardDate(e.target.value)}
                       className="w-full h-12 px-4 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-slate-700"
                     />
                  </div>

                  <div className="space-y-2">
                     <label className="text-sm font-medium text-slate-700">{t('reasonForLeaving')}</label>
                     <select 
                       value={offboardReason}
                       onChange={(e) => setOffboardReason(e.target.value)}
                       className="w-full h-12 px-4 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                     >
                        <option value="Resignation">{t('resignation')}</option>
                        <option value="Termination">{t('termination')}</option>
                        <option value="Contract Expiry">{t('contractExpiry')}</option>
                     </select>
                  </div>

                  <div className="space-y-2">
                     <label className="text-sm font-medium text-slate-700">Notes (Optional)</label>
                     <textarea 
                        className="w-full p-4 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-none h-24"
                        placeholder="Additional details..."
                     ></textarea>
                  </div>
               </div>

               <div className="bg-amber-50 p-4 rounded-lg text-amber-800 text-sm flex gap-3 items-start">
                  <AlertTriangle className="w-5 h-5 shrink-0" />
                  <p>Proceeding will change the employee status to <strong>Offboarding</strong> and schedule final payroll settlements.</p>
               </div>
            </div>

            <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
               <button 
                 onClick={() => setViewMode('list')}
                 className="px-5 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-lg font-medium hover:bg-slate-50"
               >
                 {t('cancel')}
               </button>
               <button 
                 onClick={confirmOffboard}
                 className="px-5 py-2.5 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 shadow-sm"
               >
                 {t('confirmOffboard')}
               </button>
            </div>
         </div>
      </div>
    );
  }

  // --- WIZARD VIEW ---
  if (viewMode === 'create') {
    return (
      <div className="space-y-8 animate-in slide-in-from-right-4 duration-300 pb-12">
        {/* Header */}
        <div className="flex items-center justify-between">
           <div className="flex items-center gap-4">
              <button 
                onClick={() => setViewMode('list')}
                className="p-2.5 bg-white border border-slate-200 rounded-lg text-slate-500 hover:text-indigo-600 hover:border-indigo-200 transition-colors shadow-sm"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">{t('onboardNewEmployee')}</h1>
                <div className="flex items-center gap-2 text-sm text-slate-500 mt-1">
                   <span>{t('fillInEnglish')}</span>
                </div>
              </div>
           </div>
        </div>

        {/* Wizard Container */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden flex flex-col min-h-[750px] max-w-7xl mx-auto w-full">
           {/* Stepper */}
           <div className="px-8 py-8 border-b border-slate-100 bg-slate-50/50">
               <div className="flex items-center justify-center max-w-4xl mx-auto">
                  {[
                     { id: 1, label: t('stepBasicInfo'), icon: User },
                     { id: 2, label: t('stepSalaryBank'), icon: CreditCard },
                     { id: 3, label: t('stepContract'), icon: FileText }
                  ].map((s, idx) => (
                     <React.Fragment key={s.id}>
                        <div className={`flex flex-col items-center gap-3 relative z-10 cursor-pointer group ${step === s.id ? 'text-indigo-600' : step > s.id ? 'text-green-600' : 'text-slate-400'}`}
                             onClick={() => step > s.id && setStep(s.id)}>
                           <div className={`w-14 h-14 rounded-full flex items-center justify-center border-2 transition-all duration-300 shadow-sm
                              ${step === s.id ? 'border-indigo-600 bg-indigo-50 shadow-indigo-100 scale-110' : step > s.id ? 'border-green-600 bg-green-50' : 'border-slate-200 bg-white group-hover:border-slate-300'}
                           `}>
                              {step > s.id ? <Check className="w-7 h-7" /> : <s.icon className="w-6 h-6" />}
                           </div>
                           <span className="text-sm font-bold tracking-wide">{s.label}</span>
                        </div>
                        {idx < 2 && (
                           <div className="flex-1 h-0.5 bg-slate-200 mx-6 mb-8 relative overflow-hidden rounded-full">
                              <div className={`absolute top-0 left-0 h-full bg-green-500 transition-all duration-700 ease-out ${step > idx + 1 ? 'w-full' : 'w-0'}`}></div>
                           </div>
                        )}
                     </React.Fragment>
                  ))}
               </div>
           </div>

           {/* Content Area */}
           <div className="flex-1 p-10 bg-slate-50/30">
              <div className="max-w-6xl mx-auto">
                 {/* STEP 1: Basic Info */}
                 {step === 1 && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                       <h3 className="text-xl font-bold text-slate-900 mb-8 flex items-center gap-3">
                          <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
                             <User className="w-5 h-5" />
                          </div>
                          {t('stepBasicInfo')}
                       </h3>
                       
                       <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                          {/* Personal Details Card */}
                          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                             <h4 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2 border-b border-slate-100 pb-4">
                                {t('personalDetails')}
                             </h4>
                             
                             <div className="space-y-6">
                                <div className="grid grid-cols-2 gap-6">
                                   <div className="space-y-2">
                                      <label className="text-sm font-medium text-slate-700">{t('firstName')}<span className="text-red-500 ml-1">*</span></label>
                                      <input type="text" placeholder="John" className="w-full h-12 px-4 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all" 
                                         value={newEmployee.firstName} onChange={e => setNewEmployee({...newEmployee, firstName: e.target.value})}
                                      />
                                   </div>
                                   <div className="space-y-2">
                                      <label className="text-sm font-medium text-slate-700">{t('lastName')}</label>
                                      <input type="text" placeholder="Doe" className="w-full h-12 px-4 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all" 
                                         value={newEmployee.lastName} onChange={e => setNewEmployee({...newEmployee, lastName: e.target.value})}
                                      />
                                   </div>
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                   <div className="space-y-2">
                                      <label className="text-sm font-medium text-slate-700">{t('dob')}</label>
                                      <input type="date" className="w-full h-12 px-4 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-slate-600" 
                                         value={newEmployee.dob} onChange={e => setNewEmployee({...newEmployee, dob: e.target.value})}
                                      />
                                   </div>
                                   <div className="space-y-2">
                                      <label className="text-sm font-medium text-slate-700">{t('gender')}</label>
                                      <div className="flex gap-6 h-12 items-center px-2">
                                         <label className="flex items-center gap-3 cursor-pointer group">
                                            <input type="radio" name="gender" className="w-5 h-5 text-indigo-600 focus:ring-indigo-500" />
                                            <span className="text-slate-700 group-hover:text-indigo-600 transition-colors">Male</span>
                                         </label>
                                         <label className="flex items-center gap-3 cursor-pointer group">
                                            <input type="radio" name="gender" className="w-5 h-5 text-indigo-600 focus:ring-indigo-500" />
                                            <span className="text-slate-700 group-hover:text-indigo-600 transition-colors">Female</span>
                                         </label>
                                      </div>
                                   </div>
                                </div>

                                <div className="space-y-2">
                                   <label className="text-sm font-medium text-slate-700">{t('nationality')}<span className="text-red-500 ml-1">*</span></label>
                                   <select className="w-full h-12 px-4 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                      value={newEmployee.country} onChange={e => setNewEmployee({...newEmployee, country: e.target.value})}
                                   >
                                      <option value="">Select Country</option>
                                      <option value="China">China</option>
                                      <option value="Singapore">Singapore</option>
                                      <option value="United Kingdom">United Kingdom</option>
                                      <option value="United States">United States</option>
                                      <option value="Germany">Germany</option>
                                      <option value="Japan">Japan</option>
                                   </select>
                                </div>

                                <div className="space-y-2">
                                   <label className="text-sm font-medium text-slate-700">{t('idType')}<span className="text-red-500 ml-1">*</span></label>
                                   <div className="flex gap-4">
                                      <select className="w-40 h-12 px-4 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all">
                                         <option>Passport</option>
                                         <option>ID Card</option>
                                         <option>SSN</option>
                                      </select>
                                      <input type="text" placeholder={t('idNumber')} className="flex-1 h-12 px-4 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all" 
                                         value={newEmployee.idNumber} onChange={e => setNewEmployee({...newEmployee, idNumber: e.target.value})}
                                      />
                                   </div>
                                </div>
                             </div>
                          </div>

                          {/* Employment Details Card */}
                          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                             <h4 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2 border-b border-slate-100 pb-4">
                                {t('employmentDetails')}
                             </h4>
                             
                             <div className="space-y-6">
                                <div className="space-y-2">
                                   <label className="text-sm font-medium text-slate-700">{t('jobTitle')}<span className="text-red-500 ml-1">*</span></label>
                                   <div className="relative">
                                      <input type="text" placeholder="e.g. Senior Software Engineer" className="w-full h-12 pl-12 pr-4 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all" 
                                         value={newEmployee.jobTitle} onChange={e => setNewEmployee({...newEmployee, jobTitle: e.target.value})}
                                      />
                                      <Briefcase className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
                                   </div>
                                </div>

                                <div className="space-y-2">
                                   <label className="text-sm font-medium text-slate-700">{t('department')}</label>
                                   <select className="w-full h-12 px-4 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                      value={newEmployee.department} onChange={e => setNewEmployee({...newEmployee, department: e.target.value})}
                                   >
                                      <option value="">Select Department</option>
                                      <option value="Engineering">Engineering</option>
                                      <option value="Product">Product</option>
                                      <option value="Sales">Sales</option>
                                      <option value="Marketing">Marketing</option>
                                      <option value="HR">HR</option>
                                   </select>
                                </div>

                                <div className="space-y-2">
                                   <label className="text-sm font-medium text-slate-700">{t('startDate')}<span className="text-red-500 ml-1">*</span></label>
                                   <div className="relative">
                                      <input type="date" className="w-full h-12 pl-12 pr-4 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-slate-600" 
                                         value={newEmployee.startDate} onChange={e => setNewEmployee({...newEmployee, startDate: e.target.value})}
                                      />
                                      <Calendar className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
                                   </div>
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                   <div className="space-y-2">
                                      <label className="text-sm font-medium text-slate-700">{t('email')}<span className="text-red-500 ml-1">*</span></label>
                                      <input type="email" placeholder="work@email.com" className="w-full h-12 px-4 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all" 
                                         value={newEmployee.email} onChange={e => setNewEmployee({...newEmployee, email: e.target.value})}
                                      />
                                   </div>
                                   <div className="space-y-2">
                                      <label className="text-sm font-medium text-slate-700">{t('phone')}</label>
                                      <input type="tel" placeholder="+1 234 567 890" className="w-full h-12 px-4 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all" 
                                         value={newEmployee.phone} onChange={e => setNewEmployee({...newEmployee, phone: e.target.value})}
                                      />
                                   </div>
                                </div>

                                <div className="space-y-2">
                                   <label className="text-sm font-medium text-slate-700">{t('tags')}</label>
                                   <input type="text" placeholder={t('tagsPlaceholder')} className="w-full h-12 px-4 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all" 
                                      value={newEmployee.tags} onChange={e => setNewEmployee({...newEmployee, tags: e.target.value})}
                                   />
                                </div>
                             </div>
                          </div>
                       </div>
                    </div>
                 )}

                 {/* STEP 2: Salary & Bank */}
                 {step === 2 && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                       <h3 className="text-xl font-bold text-slate-900 mb-8 flex items-center gap-3">
                          <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
                             <CreditCard className="w-5 h-5" />
                          </div>
                          {t('stepSalaryBank')}
                       </h3>

                       <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                          {/* Compensation Card */}
                          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                             <h4 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2 border-b border-slate-100 pb-4">
                                <DollarSign className="w-5 h-5 text-green-600" />
                                {t('salary')} & Compensation
                             </h4>
                             
                             <div className="space-y-6">
                                <div className="grid grid-cols-3 gap-4">
                                   <div className="col-span-1 space-y-2">
                                      <label className="text-sm font-medium text-slate-700">{t('salaryCurrency')}</label>
                                      <select className="w-full h-12 px-3 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                         value={newEmployee.salaryCurrency} onChange={e => setNewEmployee({...newEmployee, salaryCurrency: e.target.value})}
                                      >
                                         <option value="USD">USD</option>
                                         <option value="EUR">EUR</option>
                                         <option value="GBP">GBP</option>
                                         <option value="SGD">SGD</option>
                                         <option value="JPY">JPY</option>
                                         <option value="CNY">CNY</option>
                                      </select>
                                   </div>
                                   <div className="col-span-2 space-y-2">
                                      <label className="text-sm font-medium text-slate-700">{t('baseSalary')}</label>
                                      <div className="relative">
                                         <input type="number" placeholder="0.00" className="w-full h-12 pl-12 pr-4 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-mono text-lg" 
                                            value={newEmployee.baseSalary} onChange={e => setNewEmployee({...newEmployee, baseSalary: e.target.value})}
                                         />
                                         <div className="absolute left-4 top-3 text-slate-400 font-bold">{newEmployee.salaryCurrency === 'USD' ? '$' : newEmployee.salaryCurrency === 'EUR' ? '€' : newEmployee.salaryCurrency === 'GBP' ? '£' : newEmployee.salaryCurrency}</div>
                                      </div>
                                   </div>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-6">
                                   <div className="space-y-2">
                                      <label className="text-sm font-medium text-slate-700">{t('allowance')} (Optional)</label>
                                      <input type="number" placeholder="0.00" className="w-full h-12 px-4 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all" />
                                   </div>
                                   <div className="space-y-2">
                                      <label className="text-sm font-medium text-slate-700">{t('bonus')} (Optional)</label>
                                      <input type="number" placeholder="0.00" className="w-full h-12 px-4 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all" />
                                   </div>
                                </div>

                                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                                   <div className="flex justify-between items-center">
                                      <span className="text-sm font-medium text-slate-500">{t('monthlyGross')}</span>
                                      <span className="text-2xl font-bold text-slate-900">
                                         {newEmployee.salaryCurrency} {newEmployee.baseSalary ? parseFloat(newEmployee.baseSalary).toLocaleString() : '0.00'}
                                      </span>
                                   </div>
                                </div>
                             </div>
                          </div>

                          {/* Bank Details Card */}
                          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                             <h4 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2 border-b border-slate-100 pb-4">
                                <Building className="w-5 h-5 text-indigo-600" />
                                {t('stepBank')}
                             </h4>
                             
                             <div className="space-y-6">
                                <div className="space-y-2">
                                   <label className="text-sm font-medium text-slate-700">{t('holderName')}</label>
                                   <input type="text" placeholder="Account Holder Name" className="w-full h-12 px-4 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all" 
                                      value={newEmployee.accountHolder} onChange={e => setNewEmployee({...newEmployee, accountHolder: e.target.value})}
                                   />
                                </div>

                                <div className="space-y-2">
                                   <label className="text-sm font-medium text-slate-700">{t('bankName')}</label>
                                   <input type="text" placeholder="e.g. Citibank NA" className="w-full h-12 px-4 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all" 
                                      value={newEmployee.bankName} onChange={e => setNewEmployee({...newEmployee, bankName: e.target.value})}
                                   />
                                </div>

                                <div className="space-y-2">
                                   <label className="text-sm font-medium text-slate-700">{t('accountNumber')}</label>
                                   <div className="relative">
                                      <input type="text" placeholder="Account Number / IBAN" className="w-full h-12 pl-12 pr-4 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-mono" 
                                         value={newEmployee.accountNumber} onChange={e => setNewEmployee({...newEmployee, accountNumber: e.target.value})}
                                      />
                                      <CreditCard className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
                                   </div>
                                </div>

                                <div className="space-y-2">
                                   <label className="text-sm font-medium text-slate-700">{t('swiftCode')}</label>
                                   <input type="text" placeholder="SWIFT / BIC" className="w-full h-12 px-4 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-mono uppercase" 
                                      value={newEmployee.swiftCode} onChange={e => setNewEmployee({...newEmployee, swiftCode: e.target.value})}
                                   />
                                </div>
                             </div>
                          </div>
                       </div>
                    </div>
                 )}

                 {/* STEP 3: Contract */}
                 {step === 3 && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                       <h3 className="text-xl font-bold text-slate-900 mb-8 flex items-center gap-3">
                          <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
                             <FileText className="w-5 h-5" />
                          </div>
                          {t('stepContract')}
                       </h3>

                       <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                          {/* Contract Configuration */}
                          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow h-fit">
                             <h4 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2 border-b border-slate-100 pb-4">
                                {t('employmentType')} & Terms
                             </h4>
                             
                             <div className="space-y-6">
                                <div className="space-y-2">
                                   <label className="text-sm font-medium text-slate-700">{t('employmentType')}</label>
                                   <select className="w-full h-12 px-4 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                      value={newEmployee.contractType} onChange={e => setNewEmployee({...newEmployee, contractType: e.target.value})}
                                   >
                                      <option value="Regular">{t('typeRegular')}</option>
                                      <option value="Contractor">{t('typeContractor')}</option>
                                   </select>
                                </div>

                                <div className="space-y-2">
                                   <label className="text-sm font-medium text-slate-700">{t('probationPeriod')}</label>
                                   <select className="w-full h-12 px-4 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all">
                                      <option value="3">3 Months</option>
                                      <option value="6">6 Months</option>
                                      <option value="0">No Probation</option>
                                   </select>
                                </div>

                                <div className="space-y-2">
                                   <label className="text-sm font-medium text-slate-700">{t('workScope')}</label>
                                   <textarea 
                                      className="w-full p-4 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-none min-h-[160px]"
                                      placeholder="Describe the employee's main responsibilities..."
                                      value={newEmployee.workScope} onChange={e => setNewEmployee({...newEmployee, workScope: e.target.value})}
                                   ></textarea>
                                </div>
                             </div>
                          </div>

                          {/* Contract Preview */}
                          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-lg relative min-h-[600px] flex flex-col">
                             <div className="absolute top-0 right-0 p-4 bg-slate-100 rounded-bl-2xl border-l border-b border-slate-200 text-xs font-mono text-slate-500">
                                DRAFT PREVIEW
                             </div>
                             
                             <div className="flex-1 px-4 py-2 font-serif text-slate-800 leading-relaxed">
                                <div className="text-center mb-10">
                                   <h2 className="text-2xl font-bold uppercase tracking-wide mb-2">{t('employmentAgreement')}</h2>
                                   <p className="text-sm text-slate-500 italic">ID: {Date.now().toString().slice(-8)}</p>
                                </div>

                                <div className="space-y-6 text-sm">
                                   <p>{t('contractDesc')}</p>
                                   
                                   <div className="p-4 bg-slate-50 rounded border border-slate-100 my-6">
                                      <p className="mb-2"><strong>{t('contractBetween')}:</strong></p>
                                      <div className="flex justify-between pl-4">
                                         <div>
                                            <span className="text-slate-500 block text-xs uppercase">{t('partyA')}</span>
                                            <span className="font-bold">{user?.company || 'Acme Global Ltd.'}</span>
                                         </div>
                                         <div className="text-right">
                                            <span className="text-slate-500 block text-xs uppercase">{t('partyB')}</span>
                                            <span className="font-bold">{newEmployee.firstName} {newEmployee.lastName || '[Name]'}</span>
                                         </div>
                                      </div>
                                   </div>

                                   <p>
                                      <strong>1. {t('jobTitle')}:</strong> The Employee shall serve as <u>{newEmployee.jobTitle || '[Title]'}</u> in the <u>{newEmployee.department || '[Dept]'}</u> department.
                                   </p>

                                   <p>
                                      <strong>2. {t('salary')}:</strong> The Company shall pay the Employee a base salary of <u>{newEmployee.salaryCurrency} {newEmployee.baseSalary || '0.00'}</u> per month.
                                   </p>
                                   
                                   <p>
                                      <strong>3. {t('startDate')}:</strong> Employment shall commence on <u>{newEmployee.startDate || '[Date]'}</u>.
                                   </p>

                                   <p>
                                      <strong>4. Date of Birth:</strong> The Employee confirms their date of birth as <u>{newEmployee.dob || '[DOB]'}</u>.
                                   </p>

                                   <p className="mt-8">
                                      {t('contractDate')}: <u>{new Date().toLocaleDateString()}</u>
                                   </p>
                                </div>
                             </div>

                             <div className="mt-8 pt-6 border-t border-slate-100 flex justify-between items-end">
                                <div className="text-center">
                                   <div className="w-32 h-10 border-b border-slate-300 mb-2"></div>
                                   <span className="text-xs text-slate-400 uppercase">{t('signedBy')} {t('partyA')}</span>
                                </div>
                                <div className="w-16 h-16 opacity-20">
                                   <ShieldCheck className="w-full h-full text-slate-400" />
                                </div>
                                <div className="text-center">
                                   <div className="w-32 h-10 border-b border-slate-300 mb-2"></div>
                                   <span className="text-xs text-slate-400 uppercase">{t('signedBy')} {t('partyB')}</span>
                                </div>
                             </div>
                          </div>
                       </div>
                    </div>
                 )}
              </div>
           </div>
           
           {/* Footer Actions */}
           <div className="p-6 border-t border-slate-200 bg-white flex justify-between items-center">
              <button 
                onClick={() => setStep(Math.max(1, step - 1))}
                disabled={step === 1}
                className="px-6 py-3 border border-slate-200 text-slate-600 rounded-xl font-semibold hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {t('prevStep')}
              </button>
              
              {step < 3 ? (
                 <button 
                   onClick={() => setStep(step + 1)}
                   className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2"
                 >
                   {t('nextStep')} <ChevronRight className="w-5 h-5" />
                 </button>
              ) : (
                 <button 
                   onClick={handleSubmit}
                   className="px-8 py-3 bg-green-600 text-white rounded-xl font-bold shadow-lg shadow-green-200 hover:bg-green-700 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2"
                 >
                   {t('submitEmployee')} <Check className="w-5 h-5" />
                 </button>
              )}
           </div>
        </div>
      </div>
    );
  }

  // --- LIST VIEW ---
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
       <div className="flex justify-between items-center">
          <div>
             <h1 className="text-2xl font-bold text-slate-900">{t('employees')}</h1>
             <p className="text-slate-500 mt-1">{t('manageWorkforce')}</p>
          </div>
          <button 
            onClick={handleStartCreate}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg text-sm font-bold shadow-lg shadow-indigo-200 transition-all hover:scale-[1.02] flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            {t('addEmployee')}
          </button>
       </div>

       {/* Filters Bar */}
       <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="flex flex-1 gap-4 w-full">
             <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input type="text" placeholder={t('searchPlaceholder')} className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border-none rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm transition-all" />
             </div>
             <button className="flex items-center gap-2 px-4 py-2.5 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-colors bg-white">
                <Filter className="w-4 h-4" />
                {t('filters')}
             </button>
          </div>
       </div>

       {/* Employee Table */}
       <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
             <thead className="bg-slate-50/50 border-b border-slate-200">
                <tr>
                   <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">{t('employees')}</th>
                   <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">{t('roleDept')}</th>
                   <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">{t('startDate')}</th>
                   <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">{t('salaryAmount')}</th>
                   <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">{t('tags')}</th>
                   <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">{t('location')}</th>
                   <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">{t('status')}</th>
                   <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">{t('actions')}</th>
                </tr>
             </thead>
             <tbody className="divide-y divide-slate-100">
                {employees.map(emp => (
                   <tr key={emp.id} className="hover:bg-slate-50/80 transition-colors group">
                      <td className="px-6 py-4">
                         <div className="flex items-center gap-3">
                            <div className="relative">
                               <img src={emp.avatar} alt="" className="w-10 h-10 rounded-full border border-slate-200 object-cover" />
                               <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${emp.status === EmployeeStatus.ACTIVE ? 'bg-green-500' : 'bg-slate-400'}`}></div>
                            </div>
                            <div>
                               <div className="font-bold text-slate-900">{emp.name}</div>
                               <div className="text-xs text-slate-500">
                                   {emp.employmentType === 'Regular' ? t('typeRegular') : t('typeContractor')}
                               </div>
                            </div>
                         </div>
                      </td>
                      <td className="px-6 py-4">
                         <div className="text-sm font-medium text-slate-900">{emp.role}</div>
                         <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                            <Briefcase className="w-3 h-3" /> {emp.department}
                         </div>
                      </td>
                      <td className="px-6 py-4">
                         <div className="text-sm text-slate-600">{emp.startDate}</div>
                      </td>
                      <td className="px-6 py-4">
                         <div className="text-sm font-medium text-slate-900">
                            {emp.currency} {emp.salary.toLocaleString()}
                         </div>
                      </td>
                      <td className="px-6 py-4">
                         <div className="flex flex-wrap gap-1">
                            {emp.tags?.map((tag, i) => (
                              <span key={i} className="inline-flex px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
                                {tag}
                              </span>
                            ))}
                         </div>
                      </td>
                      <td className="px-6 py-4">
                         <div className="flex items-center gap-1.5 text-sm text-slate-600">
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
                               className="w-5 h-3.5 object-cover rounded-[1px]"
                            />
                            {emp.country}
                         </div>
                      </td>
                      <td className="px-6 py-4">
                         <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${getStatusColor(emp.status)}`}>
                            <span className={`w-1.5 h-1.5 rounded-full bg-current opacity-60`}></span>
                            {emp.status}
                         </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                         <div className="flex justify-end gap-2">
                           <button 
                             onClick={() => handleViewDetails(emp)}
                             className="text-indigo-600 hover:text-indigo-900 text-xs font-medium px-2 py-1 bg-indigo-50 rounded hover:bg-indigo-100 transition-colors"
                           >
                             {t('viewDetails')}
                           </button>
                           <button 
                             onClick={() => handleStartOffboard(emp)}
                             className="text-red-600 hover:text-red-900 text-xs font-medium px-2 py-1 bg-red-50 rounded hover:bg-red-100 transition-colors"
                           >
                             {t('offboard')}
                           </button>
                         </div>
                      </td>
                   </tr>
                ))}
             </tbody>
          </table>
       </div>
    </div>
  );
};

export default Employees;
