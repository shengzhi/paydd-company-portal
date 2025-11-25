

import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Employees from './pages/Employees';
import Tags from './pages/Tags';
import Payroll from './pages/Payroll';
import Expenses from './pages/Expenses'; // New Import
import CompanyInfo from './pages/CompanyInfo';
import Wallet from './pages/Wallet';
import Login from './pages/Login';
import AICopilot from './components/AICopilot';
import { Bell, Search, Globe } from 'lucide-react';
import { LanguageProvider, useLanguage, Language } from './contexts/LanguageContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { t, language, setLanguage } = useLanguage();
  const { user } = useAuth();

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <div className="flex-1 ml-64">
        {/* Top Navigation Bar */}
        <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-slate-200 px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4 w-96">
            <div className="text-slate-500 font-medium italic text-lg tracking-tight">
               {t('headerSlogan')}
            </div>
          </div>
          <div className="flex items-center gap-4">
             {/* Language Switcher */}
             <div className="flex items-center gap-2 bg-slate-100 rounded-lg px-3 py-1.5">
               <Globe className="w-4 h-4 text-slate-500" />
               <select 
                  value={language}
                  onChange={(e) => setLanguage(e.target.value as Language)}
                  className="bg-transparent border-none text-sm font-medium text-slate-700 focus:outline-none cursor-pointer"
               >
                 <option value="en">English</option>
                 <option value="zh-CN">简体中文</option>
                 <option value="zh-TW">繁體中文</option>
                 <option value="ru">Русский</option>
               </select>
             </div>

             <div className="h-6 w-px bg-slate-200"></div>

             <button className="relative p-2 text-slate-400 hover:bg-slate-100 rounded-lg transition-colors">
               <Bell className="w-5 h-5" />
               <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
             </button>
             <div className="h-8 w-px bg-slate-200 mx-2"></div>
             <div className="flex items-center gap-2">
               <span className="text-sm font-semibold text-slate-700">{user?.company || 'Acme Global'}</span>
             </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-8">
          {children}
        </main>
      </div>
      
      {/* AI Assistant Widget */}
      <AICopilot />
    </div>
  );
};

// Placeholder for new pages
const ComingSoon: React.FC<{title: string}> = ({title}) => (
  <div className="flex flex-col items-center justify-center h-[60vh] text-slate-400">
    <div className="text-6xl mb-4 opacity-20">🚧</div>
    <h2 className="text-2xl font-bold text-slate-600 mb-2">{title}</h2>
    <p>This feature is currently under development.</p>
  </div>
);

const AuthenticatedApp = () => {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        
        {/* Enterprise Group */}
        <Route path="/company" element={<CompanyInfo />} />
        <Route path="/contracts" element={<ComingSoon title="Enterprise Contracts" />} />
        
        {/* Workforce Group */}
        <Route path="/employees" element={<Employees />} />
        <Route path="/tags" element={<Tags />} />
        <Route path="/emp-contracts" element={<ComingSoon title="Employee Contracts" />} />
        
        {/* Financials Group */}
        <Route path="/wallet" element={<Wallet />} />
        <Route path="/payroll" element={<Payroll />} />
        <Route path="/expenses" element={<Expenses />} />
        <Route path="/social-security" element={<ComingSoon title="Social Security" />} />
        
        {/* System Group */}
        <Route path="/security" element={<ComingSoon title="Security Settings" />} />
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
};

const AppContent = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50">Loading...</div>;
  }

  return isAuthenticated ? <AuthenticatedApp /> : <Login />;
};

const App: React.FC = () => {
  return (
    <LanguageProvider>
      <AuthProvider>
        <HashRouter>
          <AppContent />
        </HashRouter>
      </AuthProvider>
    </LanguageProvider>
  );
};

export default App;