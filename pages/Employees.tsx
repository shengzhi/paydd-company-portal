
import React, { useState } from 'react';
import { MOCK_EMPLOYEES } from '../constants';
import { Employee, EmployeeStatus } from '../types';
import { Search, Filter, Plus, MoreVertical, MapPin, X, ChevronRight, Check, Briefcase, CreditCard, User, FileText, ChevronLeft, PenTool, ShieldCheck, Download } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';

const Employees: React.FC = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [employees, setEmployees] = useState<Employee[]>(MOCK_EMPLOYEES);
  
  // View State
  const [viewMode, setViewMode] = useState<'list' | 'create'>('list');
  const [step, setStep] = useState(1);

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
    jobTitle: '', department: '', contractType: 'Full-time',
    startDate: '', salaryCurrency: 'USD', baseSalary: '0',
    bankName: '', accountNumber: '', swiftCode: '', accountHolder: '',
    workScope: '', dob: '', tags: ''
  });

  const getStatusColor = (status: EmployeeStatus) => {
    switch (status) {
      case EmployeeStatus.ACTIVE: return 'bg-green-100 text-green-700';
      case EmployeeStatus.ONBOARDING: return 'bg-blue-100 text-blue-700';
      case EmployeeStatus.OFFBOARDING: return 'bg-amber-100 text-amber-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const handleStartCreate = () => {
    setStep(1);
    setNewEmployee({
      firstName: '', lastName: '', email: '', phone: '',
      country: '', idType: 'Passport', idNumber: '',
      jobTitle: '', department: '', contractType: 'Full-time',
      startDate: '', salaryCurrency: 'USD', baseSalary: '0',
      bankName: '', accountNumber: '', swiftCode: '', accountHolder: '',
      workScope: '', dob: '', tags: ''
    });
    setViewMode('create');
  };

  const handleSubmit = () => {
    // Construct new employee object
    const emp: Employee = {
      id: `EMP-${Math.floor(Math.random() * 10000)}`,
      name: `${newEmployee.firstName} ${newEmployee.lastName}`,
      role: newEmployee.jobTitle,
      country: newEmployee.country || 'Unknown',
      salary: parseFloat(newEmployee.baseSalary),
      currency: newEmployee.salaryCurrency,
      status: EmployeeStatus.ONBOARDING,
      startDate: newEmployee.startDate || new Date().toISOString().split('T')[0],
      department: newEmployee.department || 'General',
      avatar: `https://ui-avatars.com/api/?name=${newEmployee.firstName}+${newEmployee.lastName}&background=random`,
      dob: newEmployee.dob,
      tags: newEmployee.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
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

  // --- WIZARD VIEW ---
  if (viewMode === 'create') {
    return (
      <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
        {/* Header */}
        <div className="flex items-center justify-between">
           <div className="flex items-center gap-4">
              <button 
                onClick={() => setViewMode('list')}
                className="p-2 bg-white border border-slate-200 rounded-lg text-slate-500 hover:text-indigo-600 hover:border-indigo-200 transition-colors shadow-sm"
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
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col min-h-[600px]">
           {/* Stepper */}
           <div className="px-8 py-6 border-b border-slate-100 bg-slate-50/50">
               <div className="flex items-center justify-center max-w-3xl mx-auto">
                  {[
                     { id: 1, label: t('stepBasicInfo'), icon: User },
                     { id: 2, label: t('stepContract'), icon: FileText },
                     { id: 3, label: t('stepBank'), icon: CreditCard }
                  ].map((s, idx) => (
                     <React.Fragment key={s.id}>
                        <div className={`flex flex-col items-center gap-2 relative z-10 ${step === s.id ? 'text-indigo-600' : step > s.id ? 'text-green-600' : 'text-slate-400'}`}>
                           <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-300 shadow-sm
                              ${step === s.id ? 'border-indigo-600 bg-indigo-50 scale-110' : step > s.id ? 'border-green-600 bg-green-50' : 'border-slate-200 bg-white'}
                           `}>
                              {step > s.id ? <Check className="w-6 h-6" /> : <s.icon className="w-5 h-5" />}
                           </div>
                           <span className="text-sm font-semibold">{s.label}</span>
                        </div>
                        {idx < 2 && (
                           <div className="flex-1 h-0.5 bg-slate-200 mx-4 mb-6 relative overflow-hidden rounded-full">
                              <div className={`absolute top-0 left-0 h-full bg-green-500 transition-all duration-500 ${step > idx + 1 ? 'w-full' : 'w-0'}`}></div>
                           </div>
                        )}
                     </React.Fragment>
                  ))}
               </div>
           </div>

           {/* Content Area */}
           <div className="flex-1 p-8 bg-slate-50/30">
              <div className="max-w-6xl mx-auto">
                 {/* STEP 1: Basic Info */}
                 {step === 1 && (
                    <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm animate-in fade-in slide-in-from-bottom-2">
                       <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-4 mb-6 flex items-center gap-2">
                          <User className="w-5 h-5 text-indigo-600" />
                          {t('stepBasicInfo')}
                       </h3>
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          {/* Left Column: Personal Information */}
                          <div className="space-y-6">
                             <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">{t('personalDetails')}</h4>
                             
                             <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                   <label className="text-sm font-medium text-slate-700"><span className="text-red-500 mr-1">*</span>{t('firstName')}</label>
                                   <input type="text" placeholder="John" className="w-full form-input border-slate-300 rounded-lg p-2.5 border focus:ring-2 focus:ring-indigo-500 outline-none" 
                                      value={newEmployee.firstName} onChange={e => setNewEmployee({...newEmployee, firstName: e.target.value})}
                                   />
                                </div>
                                <div className="space-y-1.5">
                                   <label className="text-sm font-medium text-slate-700">{t('lastName')}</label>
                                   <input type="text" placeholder="Doe" className="w-full form-input border-slate-300 rounded-lg p-2.5 border focus:ring-2 focus:ring-indigo-500 outline-none" 
                                      value={newEmployee.lastName} onChange={e => setNewEmployee({...newEmployee, lastName: e.target.value})}
                                   />
                                </div>
                             </div>

                             <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                   <label className="text-sm font-medium text-slate-700">{t('dob')}</label>
                                   <input type="date" className="w-full form-input border-slate-300 rounded-lg p-2.5 border focus:ring-2 focus:ring-indigo-500 outline-none" 
                                      value={newEmployee.dob} onChange={e => setNewEmployee({...newEmployee, dob: e.target.value})}
                                   />
                                </div>
                                <div className="space-y-1.5">
                                   <label className="text-sm font-medium text-slate-700">{t('gender')}</label>
                                   <div className="flex gap-4 pt-2.5">
                                      <label className="flex items-center gap-2 cursor-pointer">
                                         <input type="radio" name="gender" className="text-indigo-600 focus:ring-indigo-500" />
                                         <span className="text-sm text-slate-700">Male</span>
                                      </label>
                                      <label className="flex items-center gap-2 cursor-pointer">
                                         <input type="radio" name="gender" className="text-indigo-600 focus:ring-indigo-500" />
                                         <span className="text-sm text-slate-700">Female</span>
                                      </label>
                                   </div>
                                </div>
                             </div>

                             <div className="space-y-1.5">
                                <label className="text-sm font-medium text-slate-700"><span className="text-red-500 mr-1">*</span>{t('nationality')}</label>
                                <select className="w-full form-select border-slate-300 rounded-lg p-2.5 border bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
                                   value={newEmployee.country} onChange={e => setNewEmployee({...newEmployee, country: e.target.value})}
                                >
                                   <option value="">Select Country</option>
                                   <option value="Singapore">Singapore</option>
                                   <option value="United Kingdom">United Kingdom</option>
                                   <option value="United States">United States</option>
                                   <option value="Germany">Germany</option>
                                   <option value="Japan">Japan</option>
                                   <option value="China">China</option>
                                </select>
                             </div>

                             <div className="space-y-1.5">
                                <label className="text-sm font-medium text-slate-700"><span className="text-red-500 mr-1">*</span>{t('idType')}</label>
                                <div className="flex gap-2">
                                   <select className="w-28 form-select border-slate-300 rounded-lg p-2.5 border bg-white focus:ring-2 focus:ring-indigo-500 outline-none">
                                      <option>Passport</option>
                                      <option>ID Card</option>
                                      <option>SSN</option>
                                   </select>
                                   <input type="text" placeholder={t('idNumber')} className="flex-1 form-input border-slate-300 rounded-lg p-2.5 border focus:ring-2 focus:ring-indigo-500 outline-none" 
                                      value={newEmployee.idNumber} onChange={e => setNewEmployee({...newEmployee, idNumber: e.target.value})}
                                   />
                                </div>
                             </div>
                          </div>

                          {/* Right Column: Employment & Contact */}
                          <div className="space-y-6">
                             <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">{t('employmentDetails')}</h4>
                             
                             <div className="space-y-1.5">
                                <label className="text-sm font-medium text-slate-700"><span className="text-red-500 mr-1">*</span>{t('jobTitle')}</label>
                                <input type="text" placeholder="e.g. Senior Software Engineer" className="w-full form-input border-slate-300 rounded-lg p-2.5 border focus:ring-2 focus:ring-indigo-500 outline-none" 
                                   value={newEmployee.jobTitle} onChange={e => setNewEmployee({...newEmployee, jobTitle: e.target.value})}
                                />
                             </div>

                             <div className="space-y-1.5">
                                <label className="text-sm font-medium text-slate-700">{t('department')}</label>
                                <input type="text" placeholder="e.g. Engineering" className="w-full form-input border-slate-300 rounded-lg p-2.5 border focus:ring-2 focus:ring-indigo-500 outline-none" 
                                   value={newEmployee.department} onChange={e => setNewEmployee({...newEmployee, department: e.target.value})}
                                />
                             </div>

                             <div className="space-y-1.5">
                                <label className="text-sm font-medium text-slate-700"><span className="text-red-500 mr-1">*</span>{t('startDate')}</label>
                                <input type="date" className="w-full form-input border-slate-300 rounded-lg p-2.5 border focus:ring-2 focus:ring-indigo-500 outline-none" 
                                   value={newEmployee.startDate} onChange={e => setNewEmployee({...newEmployee, startDate: e.target.value})}
                                />
                             </div>

                             <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                   <label className="text-sm font-medium text-slate-700"><span className="text-red-500 mr-1">*</span>{t('email')}</label>
                                   <input type="email" placeholder="john.doe@example.com" className="w-full form-input border-slate-300 rounded-lg p-2.5 border focus:ring-2 focus:ring-indigo-500 outline-none" 
                                      value={newEmployee.email} onChange={e => setNewEmployee({...newEmployee, email: e.target.value})}
                                   />
                                </div>
                                <div className="space-y-1.5">
                                   <label className="text-sm font-medium text-slate-700">{t('phone')}</label>
                                   <div className="flex gap-2">
                                      <select className="w-20 form-select border-slate-300 rounded-lg p-2.5 border bg-white focus:ring-2 focus:ring-indigo-500 outline-none text-xs">
                                         <option>+86</option>
                                         <option>+1</option>
                                         <option>+65</option>
                                         <option>+44</option>
                                      </select>
                                      <input type="text" className="flex-1 form-input border-slate-300 rounded-lg p-2.5 border focus:ring-2 focus:ring-indigo-500 outline-none" 
                                         value={newEmployee.phone} onChange={e => setNewEmployee({...newEmployee, phone: e.target.value})}
                                      />
                                   </div>
                                </div>
                             </div>

                             <div className="space-y-1.5">
                                <label className="text-sm font-medium text-slate-700">{t('tags')}</label>
                                <input 
                                   type="text" 
                                   placeholder={t('tagsPlaceholder')}
                                   className="w-full form-input border-slate-300 rounded-lg p-2.5 border focus:ring-2 focus:ring-indigo-500 outline-none"
                                   value={newEmployee.tags}
                                   onChange={e => setNewEmployee({...newEmployee, tags: e.target.value})}
                                />
                             </div>
                          </div>
                       </div>
                    </div>
                 )}

                 {/* STEP 2: Contract Details (Split View) */}
                 {step === 2 && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full animate-in fade-in slide-in-from-bottom-2">
                       {/* Left: Contract Config Form */}
                       <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm h-full overflow-y-auto">
                          <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-4 mb-6 flex items-center gap-2">
                             <PenTool className="w-5 h-5 text-indigo-600" />
                             {t('stepContract')}
                          </h3>
                          <div className="space-y-5">
                             {/* Job Title and Dept moved to Step 1, but we keep Contract specific fields here */}
                             
                             <div className="space-y-1.5">
                                <label className="text-sm font-medium text-slate-700"><span className="text-red-500 mr-1">*</span>{t('employmentType')}</label>
                                <select className="w-full form-select border-slate-300 rounded-lg p-2.5 border bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
                                   value={newEmployee.contractType} onChange={e => setNewEmployee({...newEmployee, contractType: e.target.value})}
                                >
                                   <option value="Full-time">Full-time</option>
                                   <option value="Part-time">Part-time</option>
                                   <option value="Contractor">Contractor</option>
                                   <option value="Internship">Internship</option>
                                </select>
                             </div>
                             <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                   <label className="text-sm font-medium text-slate-700">{t('contractTerm')}</label>
                                   <select className="w-full form-select border-slate-300 rounded-lg p-2.5 border bg-white focus:ring-2 focus:ring-indigo-500 outline-none">
                                      <option>Indefinite</option>
                                      <option>1 Year</option>
                                      <option>2 Years</option>
                                   </select>
                                </div>
                                <div className="space-y-1.5">
                                   <label className="text-sm font-medium text-slate-700">{t('probationPeriod')}</label>
                                   <select className="w-full form-select border-slate-300 rounded-lg p-2.5 border bg-white focus:ring-2 focus:ring-indigo-500 outline-none">
                                      <option>3 Months</option>
                                      <option>6 Months</option>
                                      <option>None</option>
                                   </select>
                                </div>
                             </div>
                             <div className="space-y-1.5">
                                <label className="text-sm font-medium text-slate-700">{t('workScope')}</label>
                                <textarea 
                                  rows={6} 
                                  placeholder="Describe the main responsibilities..." 
                                  className="w-full form-input border-slate-300 rounded-lg p-2.5 border resize-none focus:ring-2 focus:ring-indigo-500 outline-none"
                                  value={newEmployee.workScope}
                                  onChange={e => setNewEmployee({...newEmployee, workScope: e.target.value})}
                                ></textarea>
                             </div>
                          </div>
                       </div>

                       {/* Right: Contract Preview (Live Update) */}
                       <div className="flex flex-col h-full">
                          <div className="bg-slate-200 p-8 rounded-xl border border-slate-300 shadow-inner flex-1 overflow-y-auto flex justify-center items-start">
                              {/* Paper Layout */}
                              <div className="bg-white shadow-2xl w-full max-w-[210mm] min-h-[297mm] p-[20mm] text-slate-900 font-serif relative transition-all duration-300 ease-in-out">
                                 {/* Watermark/Logo */}
                                 <div className="absolute top-10 right-10 opacity-10">
                                    <ShieldCheck className="w-24 h-24" />
                                 </div>
                                 
                                 {/* Header */}
                                 <div className="text-center mb-12 border-b-2 border-slate-900 pb-6">
                                    <h2 className="text-2xl font-bold uppercase tracking-widest mb-2">{t('employmentAgreement')}</h2>
                                    <p className="text-sm text-slate-500 italic">Generated by PayDD</p>
                                 </div>

                                 {/* Body */}
                                 <div className="space-y-6 text-sm leading-relaxed text-justify">
                                    <p>
                                       This Employment Agreement (the "Agreement") is made and entered into as of <strong>{new Date().toLocaleDateString()}</strong>, by and between <strong>{user?.company || 'PayDD Inc.'}</strong> (the "Employer") and <strong>{newEmployee.firstName} {newEmployee.lastName || '________________'}</strong> (the "Employee", born on <strong>{newEmployee.dob || '____-__-__'}</strong>).
                                    </p>

                                    <h4 className="font-bold uppercase text-xs border-b border-slate-300 mt-6 mb-2 pt-2">1. Position and Duties</h4>
                                    <p>
                                       The Employer agrees to employ the Employee as <strong>{newEmployee.jobTitle || '[Job Title]'}</strong> in the <strong>{newEmployee.department || '[Department]'}</strong> department. The Employee agrees to perform the duties of this position and such other duties as may be assigned by the Employer.
                                    </p>

                                    <h4 className="font-bold uppercase text-xs border-b border-slate-300 mt-6 mb-2 pt-2">2. Term of Employment</h4>
                                    <p>
                                       The employment shall commence on <strong>{newEmployee.startDate || '[Start Date]'}</strong> and shall continue on a <strong>{newEmployee.contractType || '[Type]'}</strong> basis.
                                    </p>

                                    <h4 className="font-bold uppercase text-xs border-b border-slate-300 mt-6 mb-2 pt-2">3. Scope of Work</h4>
                                    <p className="whitespace-pre-wrap">
                                       {newEmployee.workScope || '[Scope of work details will appear here...]'}
                                    </p>

                                    {/* Signature Block Simulation */}
                                    <div className="grid grid-cols-2 gap-12 mt-24 pt-8">
                                       <div>
                                          <div className="h-12 border-b border-slate-800 mb-2 relative">
                                            {/* Fake signature */}
                                            <span className="font-handwriting text-2xl absolute bottom-2 left-4 text-slate-600 -rotate-3 opacity-70">PayDD Official</span>
                                          </div>
                                          <p className="text-xs uppercase font-bold">Signed by Employer</p>
                                          <p className="text-xs text-slate-500">{new Date().toLocaleDateString()}</p>
                                       </div>
                                       <div>
                                          <div className="h-12 border-b border-slate-800 mb-2"></div>
                                          <p className="text-xs uppercase font-bold">Signed by Employee</p>
                                       </div>
                                    </div>
                                 </div>
                              </div>
                          </div>
                          <div className="mt-4 flex justify-end">
                             <button className="text-sm text-indigo-600 hover:text-indigo-800 flex items-center gap-2 font-medium">
                                <Download className="w-4 h-4" /> Download Draft PDF
                             </button>
                          </div>
                       </div>
                    </div>
                 )}

                 {/* STEP 3: Salary & Bank Info (Split View) */}
                 {step === 3 && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-2">
                       {/* Salary Config */}
                       <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm h-full">
                          <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-4 mb-6 flex items-center gap-2">
                             <Briefcase className="w-5 h-5 text-indigo-600" />
                             {t('totalPackage')}
                          </h3>
                          <div className="space-y-6">
                             <div className="p-6 bg-indigo-50 rounded-xl border border-indigo-100 mb-6">
                                <div className="flex justify-between items-center mb-2">
                                   <span className="text-sm font-semibold text-indigo-900">{t('totalPackage')} (Monthly)</span>
                                   <Briefcase className="w-5 h-5 text-indigo-400" />
                                </div>
                                <div className="text-3xl font-bold text-indigo-700">
                                   {parseFloat(newEmployee.baseSalary || '0').toLocaleString(undefined, { minimumFractionDigits: 2 })} 
                                   <span className="text-lg ml-2 font-medium">{newEmployee.salaryCurrency}</span>
                                </div>
                             </div>

                             <div className="space-y-1.5">
                                <label className="text-sm font-medium text-slate-700">{t('salaryCurrency')}</label>
                                <select className="w-full form-select border-slate-300 rounded-lg p-2.5 border bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
                                  value={newEmployee.salaryCurrency} onChange={e => setNewEmployee({...newEmployee, salaryCurrency: e.target.value})}
                                >
                                   <option value="USD">USD - US Dollar</option>
                                   <option value="EUR">EUR - Euro</option>
                                   <option value="GBP">GBP - British Pound</option>
                                   <option value="SGD">SGD - Singapore Dollar</option>
                                   <option value="CNY">CNY - Chinese Yuan</option>
                                </select>
                             </div>
                             <div className="space-y-1.5">
                                <label className="text-sm font-medium text-slate-700"><span className="text-red-500 mr-1">*</span>{t('baseSalary')}</label>
                                <div className="relative">
                                   <input type="number" className="w-full form-input border-slate-300 rounded-lg p-2.5 pl-4 border focus:ring-2 focus:ring-indigo-500 outline-none text-lg font-medium text-slate-900" 
                                     value={newEmployee.baseSalary} onChange={e => setNewEmployee({...newEmployee, baseSalary: e.target.value})}
                                   />
                                </div>
                             </div>
                             <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                   <label className="text-sm font-medium text-slate-700">{t('allowance')}</label>
                                   <input type="number" className="w-full form-input border-slate-300 rounded-lg p-2.5 border focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="0.00" />
                                </div>
                                <div className="space-y-1.5">
                                   <label className="text-sm font-medium text-slate-700">{t('bonus')}</label>
                                   <input type="number" className="w-full form-input border-slate-300 rounded-lg p-2.5 border focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="0.00" />
                                </div>
                             </div>
                          </div>
                       </div>

                       {/* Bank Info */}
                       <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm h-full">
                          <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-4 mb-6 flex items-center gap-2">
                             <CreditCard className="w-5 h-5 text-indigo-600" />
                             {t('stepBank')}
                          </h3>
                          <div className="space-y-5">
                             <div className="space-y-1.5">
                                <label className="text-sm font-medium text-slate-700"><span className="text-red-500 mr-1">*</span>{t('paymentMethod')}</label>
                                <select className="w-full form-select border-slate-300 rounded-lg p-2.5 border bg-white focus:ring-2 focus:ring-indigo-500 outline-none">
                                   <option>Bank Transfer</option>
                                   <option>Crypto Wallet</option>
                                   <option>Wise</option>
                                   <option>Payoneer</option>
                                </select>
                             </div>
                             <div className="space-y-1.5">
                                <label className="text-sm font-medium text-slate-700"><span className="text-red-500 mr-1">*</span>{t('bankName')}</label>
                                <input type="text" className="w-full form-input border-slate-300 rounded-lg p-2.5 border focus:ring-2 focus:ring-indigo-500 outline-none" 
                                   value={newEmployee.bankName} onChange={e => setNewEmployee({...newEmployee, bankName: e.target.value})}
                                />
                             </div>
                             <div className="space-y-1.5">
                                <label className="text-sm font-medium text-slate-700"><span className="text-red-500 mr-1">*</span>{t('accountNumber')}</label>
                                <input type="text" className="w-full form-input border-slate-300 rounded-lg p-2.5 border focus:ring-2 focus:ring-indigo-500 outline-none font-mono" 
                                   value={newEmployee.accountNumber} onChange={e => setNewEmployee({...newEmployee, accountNumber: e.target.value})}
                                />
                             </div>
                             <div className="grid grid-cols-2 gap-4">
                                 <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-slate-700">{t('swiftCode')}</label>
                                    <input type="text" className="w-full form-input border-slate-300 rounded-lg p-2.5 border focus:ring-2 focus:ring-indigo-500 outline-none font-mono" 
                                       value={newEmployee.swiftCode} onChange={e => setNewEmployee({...newEmployee, swiftCode: e.target.value})}
                                    />
                                 </div>
                                 <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-slate-700">{t('holderName')}</label>
                                    <input type="text" className="w-full form-input border-slate-300 rounded-lg p-2.5 border focus:ring-2 focus:ring-indigo-500 outline-none" 
                                       value={newEmployee.accountHolder} onChange={e => setNewEmployee({...newEmployee, accountHolder: e.target.value})}
                                    />
                                 </div>
                             </div>
                          </div>
                       </div>
                    </div>
                 )}
              </div>
           </div>

           {/* Footer Actions */}
           <div className="px-8 py-6 border-t border-slate-200 bg-white flex justify-between items-center">
              <button 
                 onClick={() => setViewMode('list')}
                 className="text-slate-500 hover:text-slate-700 text-sm font-medium"
              >
                 Cancel
              </button>
              <div className="flex gap-4">
                 {step > 1 && (
                    <button 
                       onClick={() => setStep(step - 1)}
                       className="px-6 py-2.5 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                       {t('prevStep')}
                    </button>
                 )}
                 {step < 3 ? (
                    <button 
                       onClick={() => setStep(step + 1)}
                       className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 shadow-sm flex items-center gap-2"
                    >
                       {t('nextStep')} <ChevronRight className="w-4 h-4" />
                    </button>
                 ) : (
                    <button 
                       onClick={handleSubmit}
                       className="px-8 py-2.5 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 shadow-lg shadow-green-200 flex items-center gap-2"
                    >
                       {t('submitEmployee')} <Check className="w-4 h-4" />
                    </button>
                 )}
              </div>
           </div>
        </div>
      </div>
    );
  }

  // --- LIST VIEW (Default) ---
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
           <h1 className="text-2xl font-bold text-slate-900">{t('employees')}</h1>
           <p className="text-slate-500 mt-1">{t('manageWorkforce')}</p>
        </div>
        <button 
          onClick={handleStartCreate}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          {t('addEmployee')}
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder={t('searchPlaceholder')} 
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button className="flex items-center gap-2 px-3 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50">
            <Filter className="w-4 h-4" />
            {t('filters')}
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">{t('employees')}</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">{t('roleDept')}</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">{t('location')}</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">{t('status')}</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">{t('salary')}</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">{t('actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {employees.map((employee) => (
                <tr key={employee.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img src={employee.avatar} alt="" className="w-10 h-10 rounded-full object-cover border border-slate-200" />
                      <div>
                        <div className="font-semibold text-slate-900">{employee.name}</div>
                        <div className="text-xs text-slate-500">{employee.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-slate-900">{employee.role}</div>
                    <div className="text-xs text-slate-500">{employee.department}</div>
                    {employee.tags && employee.tags.length > 0 && (
                        <div className="flex gap-1 mt-1">
                          {employee.tags.slice(0, 2).map((tag, i) => (
                            <span key={i} className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded border border-slate-200">
                              {tag}
                            </span>
                          ))}
                        </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5 text-sm text-slate-600">
                      <MapPin className="w-4 h-4 text-slate-400" />
                      {employee.country}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(employee.status)}`}>
                      {employee.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-slate-900">
                      {employee.salary.toLocaleString()} <span className="text-slate-500">{employee.currency}</span>
                    </div>
                    <div className="text-xs text-slate-500">{t('monthlyGross')}</div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-slate-400 hover:text-indigo-600 transition-colors">
                      <MoreVertical className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Employees;
