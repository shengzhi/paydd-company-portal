
import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Users, Calculator, FileText, 
  Settings, LogOut, Hexagon, Building, CreditCard, 
  Files, Tags, FileSignature, Receipt, Shield, ShieldCheck, Home
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';

const Sidebar: React.FC = () => {
  const location = useLocation();
  const { t } = useLanguage();
  const { logout, user } = useAuth();

  const menuGroups = [
    {
      title: null, // Top level
      items: [
        { path: '/', label: t('dashboard'), icon: Home },
      ]
    },
    {
      title: t('groupFinancials'),
      items: [
        { path: '/wallet', label: t('accountTopUp'), icon: CreditCard },
        { path: '/payroll', label: t('payroll'), icon: Calculator },
        { path: '/expenses', label: t('reimbursements'), icon: Receipt },
        { path: '/social-security', label: t('socialSecurity'), icon: Shield },
      ]
    },
    {
      title: t('groupWorkforce'),
      items: [
        { path: '/employees', label: t('employees'), icon: Users },
        { path: '/tags', label: t('empTags'), icon: Tags },
        { path: '/emp-contracts', label: t('empContracts'), icon: FileSignature },
      ]
    },
    {
      title: t('groupEnterprise'),
      items: [
        { path: '/company', label: t('companyInfo'), icon: Building },
        { path: '/contracts', label: t('entContracts'), icon: Files },
      ]
    },
    {
      title: t('groupSystem'),
      items: [
        { path: '/security', label: t('securitySettings'), icon: ShieldCheck },
      ]
    }
  ];

  return (
    <div className="flex flex-col h-screen w-64 bg-slate-900 text-slate-300 transition-all duration-300 fixed left-0 top-0 z-20 border-r border-slate-800 scrollbar-hide">
      <div className="flex items-center gap-3 p-6 h-16 border-b border-slate-800 flex-shrink-0">
        <div className="bg-indigo-600 p-1.5 rounded-lg">
           <Hexagon className="w-6 h-6 text-white fill-indigo-600 stroke-white" strokeWidth={1.5} />
        </div>
        <span className="text-xl font-bold text-white tracking-tight">PayDD</span>
      </div>

      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
        {menuGroups.map((group, groupIdx) => (
          <div key={groupIdx}>
            {group.title && (
              <div className="px-3 mb-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                {group.title}
              </div>
            )}
            <div className="space-y-1">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      isActive 
                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50' 
                        : 'hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${isActive ? 'text-indigo-100' : 'text-slate-400'}`} />
                    {item.label}
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 border-t border-slate-800 flex-shrink-0 bg-slate-900">
        <div className="flex items-center gap-3 px-2 py-2">
          <img src={user?.avatar || "https://picsum.photos/40/40"} alt="User" className="w-8 h-8 rounded-full border border-slate-600" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{user?.name || 'User'}</p>
            <p className="text-xs text-slate-500 truncate">{user?.company || 'Company'}</p>
          </div>
          <button 
            onClick={logout}
            className="text-slate-400 hover:text-white transition-colors" 
            title={t('logout')}
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
