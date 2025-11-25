import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const HOLIDAYS = [
  { date: '2023-11-23', name: 'Thanksgiving', country: 'US', code: 'US' },
  { date: '2023-11-24', name: 'Black Friday', country: 'US', code: 'US' },
  { date: '2023-12-25', name: 'Christmas Day', country: 'Global', code: 'GL' },
  { date: '2023-12-26', name: 'Boxing Day', country: 'UK/AU', code: 'UK' },
  { date: '2024-01-01', name: 'New Year', country: 'Global', code: 'GL' },
  { date: '2024-02-10', name: 'Chinese New Year', country: 'CN/SG', code: 'CN' },
];

interface BankCalendarProps {
  className?: string;
}

const BankCalendar: React.FC<BankCalendarProps> = ({ className = '' }) => {
  const { t } = useLanguage();
  const today = new Date();
  // Fixed to Nov 2023 for demo consistency with mock data, in a real app use actual date
  const currentMonth = new Date(2023, 10, 1); // November 2023
  
  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
  const firstDayOfWeek = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();
  
  const days = [];
  for (let i = 0; i < firstDayOfWeek; i++) {
    days.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  const getHolidayForDay = (day: number) => {
    const dateStr = `2023-11-${day.toString().padStart(2, '0')}`;
    return HOLIDAYS.find(h => h.date === dateStr);
  };

  const upcomingHolidays = HOLIDAYS.filter(h => new Date(h.date) >= new Date('2023-11-01')).slice(0, 3);

  return (
    <div className={`bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col ${className}`}>
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-sm font-bold text-slate-900">{t('bankCalendar')}</h2>
        <div className="flex gap-1 items-center">
           <button className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-600 transition-colors">
             <ChevronLeft className="w-3.5 h-3.5" />
           </button>
           <span className="text-xs font-medium text-slate-600 w-16 text-center">Nov 2023</span>
           <button className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-600 transition-colors">
             <ChevronRight className="w-3.5 h-3.5" />
           </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center mb-1">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => (
          <div key={d} className="text-[10px] font-medium text-slate-400 py-0.5">{d}</div>
        ))}
      </div>
      
      <div className="grid grid-cols-7 gap-y-1 gap-x-0.5 text-center flex-1 content-start">
        {days.map((day, idx) => {
          if (!day) return <div key={`empty-${idx}`} />;
          
          const holiday = getHolidayForDay(day);
          const isToday = day === 15; // Mock today

          return (
            <div key={day} className="relative group flex justify-center py-0.5">
              <div 
                className={`w-6 h-6 flex items-center justify-center rounded-full text-xs transition-colors cursor-default
                  ${isToday ? 'bg-indigo-600 text-white font-bold shadow-sm' : 'text-slate-700 hover:bg-slate-100'}
                  ${holiday ? 'font-bold bg-slate-50' : ''}
                `}
              >
                {day}
              </div>
              {holiday && (
                <>
                  <div className="absolute bottom-0 w-1 h-1 bg-red-500 rounded-full"></div>
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block z-10 w-max max-w-[150px]">
                    <div className="bg-slate-800 text-white text-[10px] rounded py-1 px-2 shadow-lg">
                      <div className="font-semibold mb-0.5">{holiday.code}</div>
                      <div>{holiday.name}</div>
                    </div>
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-3 pt-3 border-t border-slate-100">
        <h3 className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">{t('upcomingHolidays')}</h3>
        <div className="space-y-2">
          {upcomingHolidays.map((h, i) => (
            <div key={i} className="flex items-center justify-between text-xs group cursor-default">
              <div className="flex items-center gap-2">
                <div className="font-mono text-[10px] text-slate-500 bg-slate-100 px-1 py-0.5 rounded leading-none group-hover:bg-slate-200 transition-colors">{h.date.slice(5)}</div>
                <span className="text-slate-700 truncate max-w-[100px]">{h.name}</span>
              </div>
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded leading-none
                ${h.code === 'US' ? 'bg-blue-100 text-blue-700' : 
                  h.code === 'CN' ? 'bg-red-100 text-red-700' : 
                  'bg-slate-100 text-slate-700'}`}>
                {h.country.split('/')[0]}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BankCalendar;