import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area, PieChart, Pie, Cell 
} from 'recharts';
import { ArrowUpRight, Users, Globe2, DollarSign, Wallet } from 'lucide-react';
import { PAYROLL_TREND_DATA, COST_BY_COUNTRY_DATA } from '../constants';
import { useLanguage } from '../contexts/LanguageContext';
import BankCalendar from '../components/BankCalendar';

const StatCard: React.FC<{ 
  title: string; 
  value: string; 
  change: string; 
  icon: React.ElementType;
  trend: 'up' | 'down' 
}> = ({ title, value, change, icon: Icon, trend }) => (
  <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
    <div className="flex justify-between items-start mb-4">
      <div className="p-2 bg-indigo-50 rounded-lg">
        <Icon className="w-6 h-6 text-indigo-600" />
      </div>
      <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
        trend === 'up' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
      }`}>
        {change}
      </span>
    </div>
    <h3 className="text-slate-500 text-sm font-medium mb-1">{title}</h3>
    <p className="text-2xl font-bold text-slate-900">{value}</p>
  </div>
);

const Dashboard: React.FC = () => {
  const { t } = useLanguage();
  const COLORS = ['#4f46e5', '#818cf8', '#a5b4fc', '#c7d2fe', '#e0e7ff'];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-end">
        <div>
           <h1 className="text-2xl font-bold text-slate-900">{t('dashboard')}</h1>
           <p className="text-slate-500 mt-1">{t('dashboardOverview')}</p>
        </div>
        <div className="text-sm text-slate-500">
          {t('lastUpdated')}: Today, 09:41 AM
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title={t('totalPayrollCost')} 
          value="$142,500" 
          change="+12.5%" 
          icon={DollarSign} 
          trend="up" 
        />
        <StatCard 
          title={t('activeEmployees')} 
          value="42" 
          change="+4" 
          icon={Users} 
          trend="up" 
        />
        <StatCard 
          title={t('countriesActive')} 
          value="12" 
          change="+2" 
          icon={Globe2} 
          trend="up" 
        />
        <StatCard 
          title={t('pendingPayments')} 
          value="$12,250" 
          change="-5.2%" 
          icon={Wallet} 
          trend="down" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Trend Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm h-full flex flex-col">
          <h2 className="text-lg font-bold text-slate-900 mb-6 flex-shrink-0">{t('payrollHistory')}</h2>
          <div className="flex-1 w-full min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={PAYROLL_TREND_DATA}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b'}} tickFormatter={(value) => `$${value/1000}k`} />
                <Tooltip 
                  contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                  formatter={(value: number) => [`$${value.toLocaleString()}`, t('totalPayrollCost')]}
                />
                <Area type="monotone" dataKey="value" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Breakdown Chart */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm h-full flex flex-col">
          <h2 className="text-lg font-bold text-slate-900 mb-6 flex-shrink-0">{t('costByCountry')}</h2>
          <div className="h-64 w-full relative flex-shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={COST_BY_COUNTRY_DATA}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {COST_BY_COUNTRY_DATA.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => `$${value.toLocaleString()}`} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none">
                <span className="text-2xl font-bold text-slate-900">5</span>
                <span className="text-xs text-slate-500 uppercase font-semibold">{t('topMkts')}</span>
            </div>
          </div>
          <div className="mt-4 space-y-3 flex-1">
             {COST_BY_COUNTRY_DATA.slice(0, 3).map((item, idx) => (
               <div key={item.name} className="flex items-center justify-between text-sm">
                 <div className="flex items-center gap-2">
                   <div className="w-3 h-3 rounded-full" style={{backgroundColor: COLORS[idx]}}></div>
                   <span className="text-slate-600">{item.name}</span>
                 </div>
                 <span className="font-semibold text-slate-900">${(item.value / 1000).toFixed(1)}k</span>
               </div>
             ))}
          </div>
        </div>
      </div>
      
      {/* Bottom Row: Quick Actions & Calendar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <div className="md:col-span-2 bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-xl p-6 text-white shadow-lg flex flex-col justify-center items-start h-full">
            <h3 className="font-bold text-xl mb-2">{t('hireNewCountry')}</h3>
            <p className="text-indigo-100 text-sm mb-6 max-w-lg">{t('hireNewCountryDesc')}</p>
            <button className="bg-white text-indigo-700 px-5 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-indigo-50 transition-colors shadow-md mt-auto">
              {t('startOnboarding')} <ArrowUpRight className="w-4 h-4" />
            </button>
         </div>

         <div className="md:col-span-1 h-full">
           <BankCalendar className="h-full" />
         </div>
      </div>
    </div>
  );
};

export default Dashboard;