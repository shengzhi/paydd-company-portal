
import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { 
  Plus, Download, RefreshCw, ChevronLeft, ChevronRight,
  Wallet as WalletIcon, ArrowUpRight, ArrowDownLeft, X,
  Bitcoin, CircleDollarSign, Coins, CreditCard, Repeat, ExternalLink
} from 'lucide-react';

// Mock Data for Assets (Unified)
const ASSETS = [
  { code: 'USD', name: 'US Dollar', amount: 19576.99, flag: 'us', type: 'fiat' },
  { code: 'USDT', name: 'Tether USD', amount: 1450.50, icon: 'crypto', type: 'crypto' },
  { code: 'AUD', name: 'Australian Dollar', amount: 1005.00, flag: 'au', type: 'fiat' },
  { code: 'BTC', name: 'Bitcoin', amount: 0.45, icon: 'bitcoin', type: 'crypto' },
  { code: 'JPY', name: 'Japanese Yen', amount: 1000.00, flag: 'jp', type: 'fiat' },
  { code: 'CAD', name: 'Canadian Dollar', amount: 1000.00, flag: 'ca', type: 'fiat' },
  { code: 'CNY', name: 'Chinese Yuan', amount: 108.00, flag: 'cn', type: 'fiat' },
];

// Mock Data for Transactions (Flow)
const TRANSACTIONS = [
  { id: '1914923939044425728', date: '2025-04-23 14:06:59', type: 'fiatTopUp', amount: '1000 JPY', balance: '1000 JPY', note: '' },
  { id: '1914621232693805056', date: '2025-04-22 18:04:08', type: 'fiatTopUp', amount: '108 CNY', balance: '108 CNY', note: '' },
  { id: '1914589182909644800', date: '2025-04-22 15:56:47', type: 'fiatTopUp', amount: '1000 CAD', balance: '1000 CAD', note: '' },
  { id: '1914583202736979968', date: '2025-04-22 15:33:01', type: 'fiatTopUp', amount: '1005 AUD', balance: '1005 AUD', note: '' },
  { id: '1911723688939147264', date: '2025-04-14 18:10:20', type: 'payrollPayment', amount: '40.01 USD', balance: '19576.99 USD', note: '1911723558957158400' },
  { id: '1911723590444064768', date: '2025-04-14 18:09:56', type: 'refund', amount: '40.01 USD', balance: '19536.98 USD', note: '' },
  { id: '1911722192759046144', date: '2025-04-14 18:04:23', type: 'refund', amount: '44 USD', balance: '19576.99 USD', note: '' },
  { id: '1907732836631322624', date: '2025-04-03 17:52:06', type: 'refund', amount: '40.01 USD', balance: '19620.99 USD', note: '' },
  { id: '1905188839169933312', date: '2025-03-27 17:23:10', type: 'refund', amount: '30339 USD', balance: '19661 USD', note: '' },
  { id: '1905187115093377024', date: '2025-03-27 17:16:19', type: 'fiatTopUp', amount: '50000 USD', balance: '50000 USD', note: '' },
];

// Interface for TopUp Records
interface TopUpRecord {
  id: string;
  date: string;
  type: 'fiatTopUp' | 'cryptoTopUp';
  amount: number;
  currency: string;
  status: 'statusCancelled' | 'statusPending' | 'statusSuccess';
  details: {
    country: string;
    bankName: string;
    accountNo: string;
    accountName: string;
    bankCode: string;
    address: string;
    branchCode: string;
    swift: string;
    method: string;
  }
}

// Mock Data for Top Up Records
const TOPUP_RECORDS: TopUpRecord[] = [
  {
    id: 'FD1920325641408561152',
    date: '2025-05-08 11:51',
    type: 'fiatTopUp',
    amount: 5000,
    currency: 'USD',
    status: 'statusCancelled',
    details: {
      country: 'Hong Kong',
      bankName: 'DBS Bank Ltd (Hong Kong) - 9362',
      accountNo: '7950119362',
      accountName: 'BRIDGE TECHNOLOGY LIMITED',
      bankCode: '016',
      address: '18th Floor, The Center, 99 Queen\'s Road Central, Central,HK SAR',
      branchCode: '478',
      swift: 'DHBKHKHH',
      method: 'ACH(Domestic)/RTGS (Domestic) /SWIFT'
    }
  },
  {
    id: 'FD1920325641408561153',
    date: '2025-05-07 10:30',
    type: 'fiatTopUp',
    amount: 10000,
    currency: 'USD',
    status: 'statusSuccess',
    details: {
      country: 'Hong Kong',
      bankName: 'DBS Bank Ltd (Hong Kong) - 9362',
      accountNo: '7950119362',
      accountName: 'BRIDGE TECHNOLOGY LIMITED',
      bankCode: '016',
      address: '18th Floor, The Center, 99 Queen\'s Road Central, Central,HK SAR',
      branchCode: '478',
      swift: 'DHBKHKHH',
      method: 'ACH(Domestic)/RTGS (Domestic) /SWIFT'
    }
  },
  {
    id: 'FD1920325641408561154',
    date: '2025-05-06 14:20',
    type: 'fiatTopUp',
    amount: 1250,
    currency: 'USD',
    status: 'statusPending',
    details: {
      country: 'Hong Kong',
      bankName: 'DBS Bank Ltd (Hong Kong) - 9362',
      accountNo: '7950119362',
      accountName: 'BRIDGE TECHNOLOGY LIMITED',
      bankCode: '016',
      address: '18th Floor, The Center, 99 Queen\'s Road Central, Central,HK SAR',
      branchCode: '478',
      swift: 'DHBKHKHH',
      method: 'ACH(Domestic)/RTGS (Domestic) /SWIFT'
    }
  }
];

const AssetCard: React.FC<{ asset: typeof ASSETS[0] }> = ({ asset }) => {
  const { t } = useLanguage();
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 flex flex-col justify-between hover:shadow-lg transition-all duration-300 group cursor-pointer relative overflow-hidden h-full">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity transform translate-x-1/4 -translate-y-1/4">
        {asset.type === 'crypto' ? <Bitcoin className="w-24 h-24" /> : <CircleDollarSign className="w-24 h-24" />}
      </div>

      <div className="flex justify-between items-start mb-4 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center overflow-hidden shadow-sm">
            {asset.flag ? (
              <img 
                src={`https://flagcdn.com/w40/${asset.flag}.png`} 
                alt={asset.code} 
                className="w-full h-full object-cover"
              />
            ) : (
              asset.icon === 'bitcoin' ? <Bitcoin className="w-6 h-6 text-amber-500" /> : <Coins className="w-6 h-6 text-indigo-500" />
            )}
          </div>
          <div>
            <h3 className="font-bold text-slate-900">{asset.code}</h3>
            <p className="text-xs text-slate-500">{asset.name}</p>
          </div>
        </div>
        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
          asset.type === 'fiat' 
            ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' 
            : 'bg-indigo-50 text-indigo-600 border border-indigo-200'
        }`}>
          {asset.type === 'fiat' ? t('fiat') : t('crypto')}
        </span>
      </div>

      <div className="relative z-10">
         <h4 className="text-2xl font-bold text-slate-900">
           {asset.amount.toLocaleString()} <span className="text-sm font-medium text-slate-500">{asset.code}</span>
         </h4>
         <p className="text-xs text-slate-500 mt-1">≈ $ {(asset.amount * (asset.code === 'USD' ? 1 : 0.75)).toLocaleString()} USD</p>
      </div>
    </div>
  );
};

const Wallet: React.FC = () => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'assets' | 'transactions'>('assets');
  
  return (
    <div className="space-y-6 animate-fade-in">
       {/* Header */}
       <div className="flex justify-between items-center">
          <div>
             <h1 className="text-2xl font-bold text-slate-900">{t('myAssets')}</h1>
             <p className="text-slate-500 mt-1">{t('totalAssetsValuation')}: <span className="font-bold text-slate-900">$ 45,250.00 USD</span></p>
          </div>
          <div className="flex gap-3">
             <button className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 flex items-center gap-2">
                <ArrowDownLeft className="w-4 h-4" />
                {t('withdraw')}
             </button>
             <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 shadow-sm flex items-center gap-2">
                <Plus className="w-4 h-4" />
                {t('topUp')}
             </button>
          </div>
       </div>

       {/* Assets Grid */}
       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {ASSETS.map((asset) => (
             <AssetCard key={asset.code} asset={asset} />
          ))}
          <button className="border-2 border-dashed border-slate-200 rounded-xl p-6 flex flex-col items-center justify-center text-slate-400 hover:text-indigo-600 hover:border-indigo-300 hover:bg-indigo-50 transition-all group">
             <div className="w-12 h-12 rounded-full bg-slate-50 group-hover:bg-white flex items-center justify-center mb-3 transition-colors">
                <Plus className="w-6 h-6" />
             </div>
             <span className="text-sm font-medium">{t('addAsset')}</span>
          </button>
       </div>
       
       {/* Transactions */}
       <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-200 flex justify-between items-center">
             <h2 className="text-lg font-bold text-slate-900">{t('transactionFlow')}</h2>
             <button className="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1">
                {t('viewDetails')} <ChevronRight className="w-4 h-4" />
             </button>
          </div>
          <div className="overflow-x-auto">
             <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-200">
                   <tr>
                      <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">{t('transactionNo')}</th>
                      <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">{t('transactionType')}</th>
                      <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">{t('amount')}</th>
                      <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">{t('transactionDate')}</th>
                      <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase text-right">{t('status')}</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                   {TRANSACTIONS.map((tx) => (
                      <tr key={tx.id} className="hover:bg-slate-50">
                         <td className="px-6 py-4 text-sm font-mono text-slate-600">{tx.id}</td>
                         <td className="px-6 py-4">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium 
                               ${tx.type === 'fiatTopUp' ? 'bg-green-100 text-green-700' : 
                                 tx.type === 'refund' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-700'}`}>
                               {t(tx.type as any)}
                            </span>
                         </td>
                         <td className="px-6 py-4 text-sm font-medium text-slate-900">{tx.amount}</td>
                         <td className="px-6 py-4 text-sm text-slate-500">{tx.date}</td>
                         <td className="px-6 py-4 text-right">
                            <span className="text-xs font-medium text-green-600 flex items-center justify-end gap-1">
                               <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                               {t('statusSuccess')}
                            </span>
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

export default Wallet;
