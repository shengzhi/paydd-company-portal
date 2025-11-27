
import React, { useState } from 'react';
import { MOCK_ENTERPRISE_CONTRACTS } from '../constants';
import { EnterpriseContract } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { 
  FileText, Download, Eye, Feather, CheckCircle2, Clock, AlertTriangle, 
  Search, Plus, X, FileSignature
} from 'lucide-react';

const Contracts: React.FC = () => {
  const { t } = useLanguage();
  const [contracts, setContracts] = useState<EnterpriseContract[]>(MOCK_ENTERPRISE_CONTRACTS);
  const [filter, setFilter] = useState<'All' | 'Active' | 'Pending'>('All');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Signature Modal State
  const [signingContract, setSigningContract] = useState<EnterpriseContract | null>(null);
  const [legalName, setLegalName] = useState('');
  const [isSigning, setIsSigning] = useState(false);

  // Stats
  const activeCount = contracts.filter(c => c.status === 'Active').length;
  const pendingCount = contracts.filter(c => c.status === 'Pending Signature').length;
  const expiringCount = 0; // Mock

  // Filtered List
  const filteredContracts = contracts.filter(c => {
    const matchesFilter = filter === 'All' || 
      (filter === 'Active' && c.status === 'Active') || 
      (filter === 'Pending' && c.status === 'Pending Signature');
    const matchesSearch = c.title.toLowerCase().includes(searchTerm.toLowerCase()) || c.id.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'Active': return 'bg-green-100 text-green-700';
      case 'Pending Signature': return 'bg-amber-100 text-amber-700';
      case 'Expired': return 'bg-slate-100 text-slate-500';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const handleSign = (contract: EnterpriseContract) => {
    setSigningContract(contract);
    setLegalName('');
  };

  const confirmSignature = () => {
    if (!signingContract) return;
    setIsSigning(true);
    
    setTimeout(() => {
      setContracts(prev => prev.map(c => 
        c.id === signingContract.id 
          ? { ...c, status: 'Active', signedBy: legalName, startDate: new Date().toISOString().split('T')[0] } 
          : c
      ));
      setIsSigning(false);
      setSigningContract(null);
    }, 1500);
  };

  return (
    <div className="space-y-6 animate-fade-in relative">
      <div className="flex justify-between items-center">
        <div>
           <h1 className="text-2xl font-bold text-slate-900">{t('entContracts')}</h1>
           <p className="text-slate-500 mt-1">{t('contractsOverview')}</p>
        </div>
        <button className="bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-50 flex items-center gap-2 shadow-sm">
           <Plus className="w-4 h-4" /> {t('uploadContract')}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
               <p className="text-slate-500 text-sm font-medium mb-1">{t('contractsActive')}</p>
               <p className="text-2xl font-bold text-slate-900">{activeCount}</p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
               <CheckCircle2 className="w-6 h-6 text-green-600" />
            </div>
         </div>
         <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
               <p className="text-slate-500 text-sm font-medium mb-1">{t('contractsPending')}</p>
               <p className="text-2xl font-bold text-slate-900">{pendingCount}</p>
            </div>
            <div className="p-3 bg-amber-50 rounded-lg">
               <Clock className="w-6 h-6 text-amber-600" />
            </div>
         </div>
         <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
               <p className="text-slate-500 text-sm font-medium mb-1">{t('contractsExpiring')}</p>
               <p className="text-2xl font-bold text-slate-900">{expiringCount}</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg">
               <AlertTriangle className="w-6 h-6 text-slate-500" />
            </div>
         </div>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
         {/* Toolbar */}
         <div className="p-4 border-b border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex gap-2 bg-slate-100 p-1 rounded-lg">
               {['All', 'Active', 'Pending'].map(f => (
                  <button
                    key={f}
                    onClick={() => setFilter(f as any)}
                    className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
                       filter === f ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                     {f === 'All' ? t('allCountries') /* Reusing 'All' translation logic roughly */ : t(`status${f}` as any)}
                  </button>
               ))}
            </div>
            <div className="relative w-full md:w-64">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
               <input 
                 type="text" 
                 placeholder={t('search')}
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
                 className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
               />
            </div>
         </div>

         {/* Table */}
         <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200">
               <tr>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">{t('contractName')}</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">{t('contractType')}</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">{t('effectiveDate')}</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">{t('contractStatus')}</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase text-right">{t('contractActions')}</th>
               </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
               {filteredContracts.length === 0 ? (
                  <tr>
                     <td colSpan={5} className="py-12 text-center text-slate-400">No contracts found.</td>
                  </tr>
               ) : (
                  filteredContracts.map(contract => (
                     <tr key={contract.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4">
                           <div className="flex items-center gap-3">
                              <div className="p-2 bg-indigo-50 rounded text-indigo-600">
                                 <FileText className="w-5 h-5" />
                              </div>
                              <div>
                                 <div className="font-medium text-slate-900">{contract.title}</div>
                                 <div className="text-xs text-slate-500">{contract.id}</div>
                              </div>
                           </div>
                        </td>
                        <td className="px-6 py-4">
                           <span className="text-sm text-slate-600 bg-slate-100 px-2 py-1 rounded border border-slate-200">
                              {contract.type}
                           </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">
                           {contract.startDate}
                           {contract.signedBy && (
                              <div className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                                 <FileSignature className="w-3 h-3" /> {contract.signedBy}
                              </div>
                           )}
                        </td>
                        <td className="px-6 py-4">
                           <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(contract.status)}`}>
                              {t(`status${contract.status.split(' ')[0]}` as any)}
                           </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                           <div className="flex justify-end gap-2">
                              <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors" title={t('viewContract')}>
                                 <Eye className="w-4 h-4" />
                              </button>
                              <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors" title={t('downloadPdf')}>
                                 <Download className="w-4 h-4" />
                              </button>
                              {contract.status === 'Pending Signature' && (
                                 <button 
                                    onClick={() => handleSign(contract)}
                                    className="p-2 text-amber-600 hover:text-amber-700 hover:bg-amber-50 rounded transition-colors flex items-center gap-1 font-medium text-xs px-3"
                                 >
                                    <Feather className="w-4 h-4" /> {t('signContract')}
                                 </button>
                              )}
                           </div>
                        </td>
                     </tr>
                  ))
               )}
            </tbody>
         </table>
      </div>

      {/* Signature Modal */}
      {signingContract && (
         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 flex flex-col max-h-[90vh]">
               <div className="p-6 border-b border-slate-200 flex justify-between items-center">
                  <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                     <Feather className="w-5 h-5 text-indigo-600" />
                     {t('signModalTitle')}
                  </h2>
                  <button onClick={() => setSigningContract(null)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
               </div>
               
               <div className="flex-1 overflow-y-auto p-8 bg-slate-50">
                  <div className="bg-white border border-slate-200 shadow-sm p-8 min-h-[400px] mx-auto max-w-xl">
                     <div className="text-center mb-8">
                        <h3 className="text-lg font-bold uppercase mb-2">{signingContract.title}</h3>
                        <p className="text-sm text-slate-500">Ref: {signingContract.id}</p>
                     </div>
                     <div className="space-y-4 text-sm text-slate-600 leading-relaxed">
                        <p>This agreement is entered into by and between <strong>PayDD Inc.</strong> and <strong>The Client</strong>.</p>
                        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
                        <p>Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident.</p>
                        <div className="my-8 border-t border-slate-200"></div>
                        <p className="font-bold text-slate-900">IN WITNESS WHEREOF, the parties have executed this Agreement as of the date first above written.</p>
                     </div>
                  </div>
               </div>

               <div className="p-6 border-t border-slate-200 bg-white">
                  <p className="text-sm text-slate-500 mb-4">{t('signModalDesc')}</p>
                  <div className="flex gap-4 items-end">
                     <div className="flex-1">
                        <label className="block text-sm font-medium text-slate-700 mb-1">{t('legalName')}</label>
                        <input 
                           type="text" 
                           value={legalName}
                           onChange={(e) => setLegalName(e.target.value)}
                           placeholder="Type your full name"
                           className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none font-serif text-lg italic"
                        />
                     </div>
                     <button 
                        onClick={confirmSignature}
                        disabled={!legalName.trim() || isSigning}
                        className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-200 min-w-[140px]"
                     >
                        {isSigning ? 'Signing...' : t('adoptAndSign')}
                     </button>
                  </div>
               </div>
            </div>
         </div>
      )}
    </div>
  );
};

export default Contracts;
