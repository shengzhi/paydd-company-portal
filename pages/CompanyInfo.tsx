
import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { Shareholder } from '../types';
import { companyService } from '../services/companyService';
import {
   CheckCircle2, Plus, RefreshCw, ChevronLeft, ChevronRight, Upload, Calendar,
   Building, Phone, FileText, Users, ShieldCheck, ArrowRight, Save, X
} from 'lucide-react';

const CompanyInfo: React.FC = () => {
   const { t, language } = useLanguage();
   const [activeTab, setActiveTab] = useState<'basic' | 'contact' | 'legal' | 'shareholders'>('basic');
   const [shareholders, setShareholders] = useState<Shareholder[]>([]);
   const [isAddShareholderOpen, setIsAddShareholderOpen] = useState(false);
   const [newShareholder, setNewShareholder] = useState<Partial<Shareholder>>({
      entityType: 'Individual',
      country: 'USA',
      idType: 'Passport'
   });

   const [formData, setFormData] = useState({
      localName: '测试企业A',
      engName: 'Test Corp A',
      regNo: '91320507MA1P1DK26R',
      regDate: '2017-02-09',
      regCountry: 'HK',
      size: '51-200',
      address: '中国香港特别行政区湾仔区铜锣湾轩尼诗道500号',
      capital: '100000',
      currency: 'USD',
      scope: 'Business',
      website: 'www.baidu.com',
      contact: '布施',
      phoneCode: '+1-869',
      phone: '111111',
      email: 'demo@paydd.ai',
      contactAddress: '中国香港特别行政区湾仔区铜锣湾轩尼诗道500号',
      intro: '中国香港特别行政区湾仔区铜锣湾轩尼诗道500号',
      signerName: 'DD',
   });

   useEffect(() => {
      if (activeTab === 'shareholders') {
         loadShareholders();
      }
   }, [activeTab]);

   const loadShareholders = async () => {
      try {
         const res = await companyService.getShareholders();
         setShareholders(res.list);
      } catch (err) {
         console.error("Failed to load shareholders", err);
      }
   };

   const handleAddShareholder = async () => {
      try {
         await companyService.addShareholder(newShareholder);
         setIsAddShareholderOpen(false);
         loadShareholders();
         setNewShareholder({ entityType: 'Individual', country: 'USA', idType: 'Passport' });
      } catch (err) {
         console.error("Failed to add shareholder", err);
         alert("Failed to add shareholder");
      }
   };

   const sections = [
      { id: 'basic', label: t('basicInfo'), icon: Building, description: t('basicInfoDesc') },
      { id: 'contact', label: t('contactInfo'), icon: Phone, description: t('contactInfoDesc') },
      { id: 'legal', label: t('legalDocs'), icon: FileText, description: t('legalDocsDesc') },
      { id: 'shareholders', label: t('shareholderInfo'), icon: Users, description: t('shareholderInfoDesc') },
   ] as const;

   const handleNext = () => {
      const currentIndex = sections.findIndex(s => s.id === activeTab);
      if (currentIndex < sections.length - 1) {
         setActiveTab(sections[currentIndex + 1].id);
      }
   };

   const handlePrev = () => {
      const currentIndex = sections.findIndex(s => s.id === activeTab);
      if (currentIndex > 0) {
         setActiveTab(sections[currentIndex - 1].id);
      }
   };

   const renderFooterButtons = () => (
      <div className="flex justify-between items-center pt-8 mt-4 border-t border-slate-100">
         <button
            onClick={handlePrev}
            disabled={activeTab === 'basic'}
            className="px-4 py-2 text-sm text-slate-500 hover:text-slate-900 disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-2"
         >
            <ChevronLeft className="w-4 h-4" />
            {t('previous')}
         </button>
         <div className="flex gap-3">
            <button className="px-5 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 flex items-center gap-2">
               <Save className="w-4 h-4" />
               {t('save')}
            </button>
            {activeTab !== 'shareholders' && (
               <button
                  onClick={handleNext}
                  className="px-5 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 shadow-sm flex items-center gap-2"
               >
                  {t('next')}
                  <ArrowRight className="w-4 h-4" />
               </button>
            )}
         </div>
      </div>
   );

   return (
      <div className="space-y-6 animate-fade-in pb-10">
         {/* Page Header with Status */}
         <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-4">
               <div className="w-16 h-16 rounded-lg bg-indigo-50 flex items-center justify-center border border-indigo-100">
                  <Building className="w-8 h-8 text-indigo-600" />
               </div>
               <div>
                  <div className="flex items-center gap-2 mb-1">
                     <h1 className="text-xl font-bold text-slate-900">{formData.localName}</h1>
                     <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-bold rounded-full flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3" />
                        {t('enterpriseVerified')}
                     </span>
                  </div>
                  <p className="text-sm text-slate-500">ID: {formData.regNo}</p>
               </div>
            </div>

            <div className="w-full md:w-64">
               <div className="flex justify-between text-xs mb-1.5">
                  <span className="font-semibold text-slate-700">{t('profileCompletion')}</span>
                  <span className="text-indigo-600 font-bold">85%</span>
               </div>
               <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-600 w-[85%] rounded-full"></div>
               </div>
            </div>
         </div>

         <div className="flex flex-col lg:flex-row gap-6 items-start">
            {/* Navigation Sidebar */}
            <div className="w-full lg:w-72 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex-shrink-0">
               <div className="p-4 bg-slate-50 border-b border-slate-200">
                  <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider">{t('enterpriseInfo')}</h2>
               </div>
               <div className="p-2 space-y-1">
                  {sections.map((section) => {
                     const Icon = section.icon;
                     const isActive = activeTab === section.id;
                     return (
                        <button
                           key={section.id}
                           onClick={() => setActiveTab(section.id as any)}
                           className={`w-full text-left p-3 rounded-lg flex items-start gap-3 transition-all ${isActive
                              ? 'bg-indigo-50 text-indigo-700 border border-indigo-100 shadow-sm'
                              : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                              }`}
                        >
                           <Icon className={`w-5 h-5 mt-0.5 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                           <div>
                              <div className="text-sm font-semibold">{section.label}</div>
                              <div className={`text-xs mt-0.5 line-clamp-1 ${isActive ? 'text-indigo-500' : 'text-slate-400'}`}>
                                 {section.description}
                              </div>
                           </div>
                        </button>
                     );
                  })}
               </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden w-full">
               <div className="p-6">
                  <div className="mb-6">
                     <h2 className="text-lg font-bold text-slate-900">{sections.find(s => s.id === activeTab)?.label}</h2>
                     <p className="text-sm text-slate-500 mt-1">{sections.find(s => s.id === activeTab)?.description}</p>
                  </div>

                  {/* Basic Info Tab */}
                  {activeTab === 'basic' && (
                     <div className="animate-fade-in space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                           <div className="space-y-1.5">
                              <label className="text-sm font-medium text-slate-700"><span className="text-red-500 mr-1">*</span>{t('companyNameLocal')}</label>
                              <input type="text" value={formData.localName} onChange={e => setFormData({ ...formData, localName: e.target.value })} className="form-input" />
                           </div>
                           <div className="space-y-1.5">
                              <label className="text-sm font-medium text-slate-700"><span className="text-red-500 mr-1">*</span>{t('companyNameEn')}</label>
                              <input type="text" value={formData.engName} onChange={e => setFormData({ ...formData, engName: e.target.value })} className="form-input" />
                           </div>
                           <div className="space-y-1.5">
                              <label className="text-sm font-medium text-slate-700"><span className="text-red-500 mr-1">*</span>{t('regNumber')}</label>
                              <input type="text" value={formData.regNo} onChange={e => setFormData({ ...formData, regNo: e.target.value })} className="form-input" />
                           </div>
                           <div className="space-y-1.5">
                              <label className="text-sm font-medium text-slate-700"><span className="text-red-500 mr-1">*</span>{t('regDate')}</label>
                              <div className="relative">
                                 <input type="text" value={formData.regDate} onChange={e => setFormData({ ...formData, regDate: e.target.value })} className="form-input pl-10" />
                                 <Calendar className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                              </div>
                           </div>
                           <div className="space-y-1.5">
                              <label className="text-sm font-medium text-slate-700"><span className="text-red-500 mr-1">*</span>{t('regCountry')}</label>
                              <select className="form-select" value={formData.regCountry} onChange={e => setFormData({ ...formData, regCountry: e.target.value })}>
                                 <option value="HK">Hong Kong, China</option>
                                 <option value="CN">China</option>
                                 <option value="US">USA</option>
                              </select>
                           </div>
                           <div className="space-y-1.5">
                              <label className="text-sm font-medium text-slate-700"><span className="text-red-500 mr-1">*</span>{t('companySize')}</label>
                              <select className="form-select" value={formData.size} onChange={e => setFormData({ ...formData, size: e.target.value })}>
                                 <option value="51-200">51-200</option>
                                 <option value="200+">200+</option>
                              </select>
                           </div>
                           <div className="md:col-span-2 space-y-1.5">
                              <label className="text-sm font-medium text-slate-700"><span className="text-red-500 mr-1">*</span>{t('regAddress')}</label>
                              <input type="text" value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} className="form-input" />
                           </div>
                           <div className="space-y-1.5">
                              <label className="text-sm font-medium text-slate-700"><span className="text-red-500 mr-1">*</span>{t('regCapital')}</label>
                              <div className="flex">
                                 <input type="text" value={formData.capital} onChange={e => setFormData({ ...formData, capital: e.target.value })} className="form-input rounded-r-none border-r-0" />
                                 <div className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-r-md text-sm text-slate-600 font-medium">{formData.currency}</div>
                              </div>
                           </div>
                           <div className="space-y-1.5">
                              <label className="text-sm font-medium text-slate-700"><span className="text-red-500 mr-1">*</span>{t('businessScope')}</label>
                              <select className="form-select" value={formData.scope} onChange={e => setFormData({ ...formData, scope: e.target.value })}>
                                 <option value="Business">Business</option>
                                 <option value="Technology">Technology</option>
                              </select>
                           </div>
                        </div>
                        {renderFooterButtons()}
                     </div>
                  )}

                  {/* Contact Info Tab */}
                  {activeTab === 'contact' && (
                     <div className="animate-fade-in space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                           <div className="space-y-1.5">
                              <label className="text-sm font-medium text-slate-700">{t('website')}</label>
                              <input type="text" value={formData.website} onChange={e => setFormData({ ...formData, website: e.target.value })} className="form-input" />
                           </div>
                           <div className="space-y-1.5">
                              <label className="text-sm font-medium text-slate-700">{t('contactPerson')}</label>
                              <input type="text" value={formData.contact} onChange={e => setFormData({ ...formData, contact: e.target.value })} className="form-input" />
                           </div>
                           <div className="space-y-1.5">
                              <label className="text-sm font-medium text-slate-700">{t('contactPhone')}</label>
                              <div className="flex gap-2">
                                 <select className="w-24 form-select"><option value="+1-869">+1-869</option></select>
                                 <input type="text" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} className="form-input flex-1" />
                              </div>
                           </div>
                           <div className="space-y-1.5">
                              <label className="text-sm font-medium text-slate-700">{t('contactEmail')}</label>
                              <input type="text" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} className="form-input" />
                           </div>
                           <div className="md:col-span-2 space-y-1.5">
                              <label className="text-sm font-medium text-slate-700">{t('contactAddress')}</label>
                              <input type="text" value={formData.contactAddress} onChange={e => setFormData({ ...formData, contactAddress: e.target.value })} className="form-input" />
                           </div>
                           <div className="md:col-span-2 space-y-1.5">
                              <label className="text-sm font-medium text-slate-700">{t('companyIntro')}</label>
                              <textarea rows={4} value={formData.intro} onChange={e => setFormData({ ...formData, intro: e.target.value })} className="form-input resize-none" />
                           </div>
                        </div>
                        {renderFooterButtons()}
                     </div>
                  )}

                  {/* Legal & Docs Tab */}
                  {activeTab === 'legal' && (
                     <div className="animate-fade-in space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                           {/* Documents */}
                           <div className="space-y-4">
                              <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">{t('legalDocs')}</h3>

                              <div className="space-y-2">
                                 <label className="text-sm font-medium text-slate-700">{t('companySeal')}</label>
                                 <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 hover:border-indigo-400 transition-colors">
                                    <Plus className="w-8 h-8 text-slate-400 mb-2" />
                                    <span className="text-xs text-slate-500">Click to upload seal</span>
                                 </div>
                              </div>

                              <div className="space-y-2">
                                 <label className="text-sm font-medium text-slate-700"><span className="text-red-500 mr-1">*</span>{t('businessLicense')}</label>
                                 <div className="border border-slate-200 rounded-lg p-4 bg-slate-50 flex items-center gap-4">
                                    <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center">
                                       <FileText className="w-8 h-8" />
                                    </div>
                                    <div className="flex-1">
                                       <p className="text-sm font-medium text-slate-900">license_2023.pdf</p>
                                       <p className="text-xs text-slate-500">2.4 MB • Uploaded just now</p>
                                    </div>
                                    <button className="text-slate-400 hover:text-red-500"><Plus className="w-5 h-5 rotate-45" /></button>
                                 </div>
                              </div>
                           </div>

                           {/* Signatory */}
                           <div className="space-y-4">
                              <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">Signatory Configuration</h3>

                              <div className="space-y-1.5">
                                 <label className="text-sm font-medium text-slate-700"><span className="text-red-500 mr-1">*</span>{t('authSignatoryName')}</label>
                                 <input type="text" value={formData.signerName} onChange={e => setFormData({ ...formData, signerName: e.target.value })} className="form-input" />
                              </div>

                              <div className="space-y-1.5">
                                 <label className="text-sm font-medium text-slate-700">{t('authSignatorySign')}</label>
                                 <div className="border border-slate-200 rounded-lg p-4 h-32 bg-white flex items-center justify-center relative">
                                    <svg viewBox="0 0 100 40" className="h-full w-full stroke-slate-800 fill-none" strokeWidth="2">
                                       <path d="M10,20 Q30,5 50,20 T90,20" />
                                       <path d="M15,20 Q35,35 55,20" />
                                    </svg>
                                    <button className="absolute bottom-2 right-2 text-xs bg-slate-100 hover:bg-slate-200 px-2 py-1 rounded">Clear</button>
                                 </div>
                              </div>
                           </div>
                        </div>
                        {renderFooterButtons()}
                     </div>
                  )}

                  {/* Shareholders Tab */}
                  {activeTab === 'shareholders' && (
                     <div className="animate-fade-in space-y-4">
                        <div className="flex justify-between items-center mb-4">
                           <div className="relative w-64">
                              <input type="text" placeholder={t('search')} className="form-input pl-9" />
                              <Users className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                           </div>
                           <button
                              onClick={() => setIsAddShareholderOpen(true)}
                              className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-indigo-700"
                           >
                              <Plus className="w-4 h-4" />
                              Add Shareholder
                           </button>
                        </div>

                        <div className="overflow-hidden border border-slate-200 rounded-lg">
                           <table className="w-full text-left border-collapse">
                              <thead className="bg-slate-50 border-b border-slate-200">
                                 <tr>
                                    <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase">{t('entityType')}</th>
                                    <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase">{t('shareholderName')}</th>
                                    <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase">{t('regCountry')}</th>
                                    <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase">{t('idNumber')}</th>
                                    <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase text-right">{t('actions')}</th>
                                 </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-200">
                                 {shareholders.map((item) => (
                                    <tr key={item.id} className="hover:bg-slate-50">
                                       <td className="px-4 py-3 text-sm text-slate-900 font-medium">{language === 'zh-CN' || language === 'zh-TW' ? (item.entityType === 'Individual' ? '个人' : '企业') : item.entityType}</td>
                                       <td className="px-4 py-3 text-sm text-slate-700">{item.name}</td>
                                       <td className="px-4 py-3 text-sm text-slate-600 flex items-center gap-2">
                                          <img src={`https://flagcdn.com/w20/${item.country === 'USA' ? 'us' : 'cn'}.png`} alt={item.country} className="w-5 h-3.5 object-cover rounded-[1px]" />
                                          {item.country}
                                       </td>
                                       <td className="px-4 py-3 text-sm text-slate-600 font-mono">{item.idNumber}</td>
                                       <td className="px-4 py-3 text-sm text-right">
                                          <div className="flex justify-end gap-2">
                                             <button className="text-indigo-600 hover:text-indigo-800 text-xs font-medium px-2 py-1 rounded bg-indigo-50">{t('edit')}</button>
                                             <button className="text-red-600 hover:text-red-800 text-xs font-medium px-2 py-1 rounded bg-red-50">{t('delete')}</button>
                                          </div>
                                       </td>
                                    </tr>
                                 ))}
                                 {shareholders.length === 0 && (
                                    <tr>
                                       <td colSpan={5} className="py-8 text-center text-slate-400">No shareholders found.</td>
                                    </tr>
                                 )}
                              </tbody>
                           </table>
                        </div>
                        {renderFooterButtons()}

                        {/* Add Shareholder Modal */}
                        {isAddShareholderOpen && (
                           <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-in fade-in">
                              <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6 space-y-4">
                                 <h3 className="text-lg font-bold text-slate-900">Add Shareholder</h3>
                                 <div className="grid grid-cols-2 gap-4">
                                    <div>
                                       <label className="text-sm font-medium text-slate-700 block mb-1">Type</label>
                                       <select
                                          className="form-select"
                                          value={newShareholder.entityType}
                                          onChange={e => setNewShareholder({ ...newShareholder, entityType: e.target.value })}
                                       >
                                          <option value="Individual">Individual</option>
                                          <option value="Corporate">Corporate</option>
                                       </select>
                                    </div>
                                    <div>
                                       <label className="text-sm font-medium text-slate-700 block mb-1">Name</label>
                                       <input
                                          type="text"
                                          className="form-input"
                                          value={newShareholder.name}
                                          onChange={e => setNewShareholder({ ...newShareholder, name: e.target.value })}
                                       />
                                    </div>
                                    <div>
                                       <label className="text-sm font-medium text-slate-700 block mb-1">ID Type</label>
                                       <select
                                          className="form-select"
                                          value={newShareholder.idType}
                                          onChange={e => setNewShareholder({ ...newShareholder, idType: e.target.value })}
                                       >
                                          <option value="Passport">Passport</option>
                                          <option value="ID Card">ID Card</option>
                                       </select>
                                    </div>
                                    <div>
                                       <label className="text-sm font-medium text-slate-700 block mb-1">ID Number</label>
                                       <input
                                          type="text"
                                          className="form-input"
                                          value={newShareholder.idNumber}
                                          onChange={e => setNewShareholder({ ...newShareholder, idNumber: e.target.value })}
                                       />
                                    </div>
                                    <div>
                                       <label className="text-sm font-medium text-slate-700 block mb-1">Country</label>
                                       <select
                                          className="form-select"
                                          value={newShareholder.country}
                                          onChange={e => setNewShareholder({ ...newShareholder, country: e.target.value })}
                                       >
                                          <option value="USA">USA</option>
                                          <option value="China">China</option>
                                          <option value="Hong Kong">Hong Kong</option>
                                       </select>
                                    </div>
                                    <div>
                                       <label className="text-sm font-medium text-slate-700 block mb-1">Mobile</label>
                                       <input
                                          type="text"
                                          className="form-input"
                                          value={newShareholder.mobile}
                                          onChange={e => setNewShareholder({ ...newShareholder, mobile: e.target.value })}
                                       />
                                    </div>
                                    <div className="col-span-2">
                                       <label className="text-sm font-medium text-slate-700 block mb-1">Email</label>
                                       <input
                                          type="email"
                                          className="form-input"
                                          value={newShareholder.email}
                                          onChange={e => setNewShareholder({ ...newShareholder, email: e.target.value })}
                                       />
                                    </div>
                                 </div>
                                 <div className="flex justify-end gap-3 pt-4">
                                    <button
                                       onClick={() => setIsAddShareholderOpen(false)}
                                       className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
                                    >
                                       Cancel
                                    </button>
                                    <button
                                       onClick={handleAddShareholder}
                                       className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700"
                                    >
                                       Add Shareholder
                                    </button>
                                 </div>
                              </div>
                           </div>
                        )}
                     </div>
                  )}
               </div>
            </div>
         </div>

         <style>{`
        .form-input {
          width: 100%;
          padding: 0.5rem 0.75rem;
          background-color: #fff;
          border: 1px solid #e2e8f0;
          border-radius: 0.5rem;
          font-size: 0.875rem;
          color: #334155;
          outline: none;
          transition: all 0.2s;
        }
        .form-input:focus {
          border-color: #6366f1;
          box-shadow: 0 0 0 1px #6366f1;
        }
        .form-select {
          width: 100%;
          padding: 0.5rem 0.75rem;
          background-color: #fff;
          border: 1px solid #e2e8f0;
          border-radius: 0.5rem;
          font-size: 0.875rem;
          color: #334155;
          outline: none;
          cursor: pointer;
        }
        .form-select:focus {
          border-color: #6366f1;
        }
      `}</style>
      </div>
   );
};

export default CompanyInfo;
