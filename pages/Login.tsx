import React, { useState, useEffect } from 'react';
import { useLanguage, Language } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { Hexagon, Globe, Mail, Phone, Lock, ArrowRight, CheckCircle2, Smartphone } from 'lucide-react';

const Login: React.FC = () => {
  const { t, language, setLanguage } = useLanguage();
  const { login } = useAuth();
  
  const [activeTab, setActiveTab] = useState<'email' | 'mobile'>('email');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [countryCode, setCountryCode] = useState('+86');
  const [mobile, setMobile] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  
  // Timer State
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    let timer: any;
    if (countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [countdown]);

  const handleSendCode = () => {
    if (!mobile) return; // In real app, add validation
    setCountdown(60);
    // Simulate sending code API call here
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      if (activeTab === 'email') {
        await login('email', { email, password });
      } else {
        await login('mobile', { countryCode, mobile, code: verificationCode });
      }
    } catch (error) {
      console.error('Login failed', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white">
      {/* Left Side - Brand Panel (Hidden on mobile) */}
      <div className="hidden lg:flex w-1/2 bg-slate-900 relative overflow-hidden flex-col justify-between p-12 text-white">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
           <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              <pattern id="hexagons" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M10 0 L20 5 L20 15 L10 20 L0 15 L0 5 Z" fill="currentColor" />
              </pattern>
              <rect width="100%" height="100%" fill="url(#hexagons)" />
           </svg>
        </div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600 rounded-full blur-[128px] opacity-20 transform translate-x-1/3 -translate-y-1/3"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-600 rounded-full blur-[128px] opacity-20 transform -translate-x-1/3 translate-y-1/3"></div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-12">
            <div className="bg-indigo-600 p-2 rounded-xl">
               <Hexagon className="w-8 h-8 text-white fill-indigo-600 stroke-white" strokeWidth={1.5} />
            </div>
            <span className="text-3xl font-bold tracking-tight">PayDD</span>
          </div>
          
          <div className="max-w-lg">
             <h1 className="text-5xl font-bold leading-tight mb-6">Global Payroll & Compliance Simplified.</h1>
             <p className="text-lg text-slate-300 leading-relaxed">
               Manage cross-border hiring, payroll, and compliance in one unified platform. Trusted by forward-thinking enterprises worldwide.
             </p>
          </div>
        </div>

        <div className="relative z-10 flex items-center gap-4 text-sm text-slate-400">
           <span>© 2024 PayDD Inc.</span>
           <span className="w-1 h-1 bg-slate-600 rounded-full"></span>
           <span>Privacy Policy</span>
           <span className="w-1 h-1 bg-slate-600 rounded-full"></span>
           <span>Terms of Service</span>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8 lg:p-24">
         <div className="w-full max-w-md space-y-8">
            {/* Mobile Header Logo */}
            <div className="lg:hidden flex items-center gap-2 mb-8">
               <div className="bg-indigo-600 p-1.5 rounded-lg">
                  <Hexagon className="w-6 h-6 text-white fill-indigo-600 stroke-white" strokeWidth={1.5} />
               </div>
               <span className="text-2xl font-bold text-slate-900">PayDD</span>
            </div>

            <div className="flex justify-between items-start">
               <div>
                  <h2 className="text-3xl font-bold text-slate-900">{t('welcomeBack')}</h2>
                  <p className="text-slate-500 mt-2">{t('loginSubtitle')}</p>
               </div>
               {/* Language Switcher */}
               <div className="flex items-center gap-2 bg-slate-50 rounded-lg px-3 py-1.5 border border-slate-200">
                  <Globe className="w-4 h-4 text-slate-500" />
                  <select 
                     value={language}
                     onChange={(e) => setLanguage(e.target.value as Language)}
                     className="bg-transparent border-none text-sm font-medium text-slate-700 focus:outline-none cursor-pointer"
                  >
                     <option value="en">EN</option>
                     <option value="zh-CN">简</option>
                     <option value="zh-TW">繁</option>
                     <option value="ru">RU</option>
                  </select>
               </div>
            </div>

            {/* Tabs */}
            <div className="flex p-1 bg-slate-100 rounded-xl">
               <button
                 onClick={() => setActiveTab('email')}
                 className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 flex items-center justify-center gap-2 ${
                   activeTab === 'email' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                 }`}
               >
                 <Mail className="w-4 h-4" />
                 {language === 'zh-CN' || language === 'zh-TW' ? '邮箱登录' : 'Email'}
               </button>
               <button
                 onClick={() => setActiveTab('mobile')}
                 className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 flex items-center justify-center gap-2 ${
                   activeTab === 'mobile' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                 }`}
               >
                 <Smartphone className="w-4 h-4" />
                 {language === 'zh-CN' || language === 'zh-TW' ? '手机登录' : 'Mobile'}
               </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
               {activeTab === 'email' ? (
                 <div className="space-y-4 animate-in fade-in slide-in-from-left-4 duration-300">
                    <div className="space-y-2">
                       <label className="text-sm font-medium text-slate-700">{t('emailLabel')}</label>
                       <div className="relative">
                          <input 
                            type="email" 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder={t('enterEmail')}
                            className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                            required
                          />
                          <Mail className="absolute left-3 top-3.5 w-5 h-5 text-slate-400" />
                       </div>
                    </div>
                    <div className="space-y-2">
                       <div className="flex justify-between">
                          <label className="text-sm font-medium text-slate-700">{t('passwordLabel')}</label>
                          <a href="#" className="text-sm font-medium text-indigo-600 hover:text-indigo-700">{t('forgotPassword')}</a>
                       </div>
                       <div className="relative">
                          <input 
                            type="password" 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder={t('enterPassword')}
                            className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                            required
                          />
                          <Lock className="absolute left-3 top-3.5 w-5 h-5 text-slate-400" />
                       </div>
                    </div>
                 </div>
               ) : (
                 <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                    <div className="space-y-2">
                       <label className="text-sm font-medium text-slate-700">{t('mobileLabel')}</label>
                       <div className="flex gap-3">
                          <select 
                             value={countryCode}
                             onChange={(e) => setCountryCode(e.target.value)}
                             className="w-24 px-3 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                          >
                             <option value="+86">+86</option>
                             <option value="+1">+1</option>
                             <option value="+852">+852</option>
                             <option value="+65">+65</option>
                          </select>
                          <input 
                            type="tel" 
                            value={mobile}
                            onChange={(e) => setMobile(e.target.value)}
                            placeholder={t('enterMobile')}
                            className="flex-1 px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                            required
                          />
                       </div>
                    </div>
                    <div className="space-y-2">
                       <label className="text-sm font-medium text-slate-700">{t('codeLabel')}</label>
                       <div className="flex gap-3">
                          <input 
                            type="text" 
                            value={verificationCode}
                            onChange={(e) => setVerificationCode(e.target.value)}
                            placeholder={t('enterCode')}
                            className="flex-1 px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                            required
                          />
                          <button
                             type="button"
                             onClick={handleSendCode}
                             disabled={countdown > 0 || !mobile}
                             className="px-4 py-3 bg-slate-50 border border-slate-200 text-slate-700 font-medium rounded-xl hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed min-w-[120px] transition-colors text-sm"
                          >
                             {countdown > 0 ? t('resendCode', {time: countdown}) : t('sendCode')}
                          </button>
                       </div>
                    </div>
                 </div>
               )}

               <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 bg-indigo-600 text-white rounded-xl font-bold text-lg hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-200 transition-all shadow-lg shadow-indigo-200 flex items-center justify-center gap-2 disabled:opacity-70"
               >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      {t('loggingIn')}
                    </>
                  ) : (
                    <>
                      {t('signIn')}
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
               </button>
            </form>
            
            <div className="text-center pt-4">
               <span className="text-slate-500">{t('noAccount')} </span>
               <a href="#" className="font-bold text-indigo-600 hover:text-indigo-700">{t('contactSales')}</a>
            </div>
         </div>
      </div>
    </div>
  );
};

export default Login;