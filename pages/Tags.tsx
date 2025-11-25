

import React, { useState } from 'react';
import { MOCK_TAGS, MOCK_EMPLOYEES } from '../constants';
import { Tag } from '../types';
import { Plus, Search, Tag as TagIcon, MoreVertical, Edit2, Trash2, Users, X, Check } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const Tags: React.FC = () => {
  const { t } = useLanguage();
  const [tags, setTags] = useState<Tag[]>(MOCK_TAGS);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: 'indigo'
  });

  // Members Drawer State
  const [selectedTag, setSelectedTag] = useState<Tag | null>(null);

  const colors = ['indigo', 'green', 'blue', 'amber', 'red', 'purple', 'pink', 'slate'];

  const filteredTags = tags.filter(tag => 
    tag.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getMemberCount = (tagName: string) => {
    return MOCK_EMPLOYEES.filter(emp => emp.tags?.includes(tagName)).length;
  };

  const getColorClass = (color: string) => {
    const map: Record<string, string> = {
      indigo: 'bg-indigo-100 text-indigo-700 border-indigo-200',
      green: 'bg-green-100 text-green-700 border-green-200',
      blue: 'bg-blue-100 text-blue-700 border-blue-200',
      amber: 'bg-amber-100 text-amber-700 border-amber-200',
      red: 'bg-red-100 text-red-700 border-red-200',
      purple: 'bg-purple-100 text-purple-700 border-purple-200',
      pink: 'bg-pink-100 text-pink-700 border-pink-200',
      slate: 'bg-slate-100 text-slate-700 border-slate-200',
    };
    return map[color] || map.slate;
  };

  const getBgClass = (color: string) => {
    const map: Record<string, string> = {
      indigo: 'bg-indigo-500',
      green: 'bg-green-500',
      blue: 'bg-blue-500',
      amber: 'bg-amber-500',
      red: 'bg-red-500',
      purple: 'bg-purple-500',
      pink: 'bg-pink-500',
      slate: 'bg-slate-500',
    };
    return map[color] || map.slate;
  };

  const handleOpenCreate = () => {
    setEditingTag(null);
    setFormData({ name: '', description: '', color: 'indigo' });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (tag: Tag, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingTag(tag);
    setFormData({ 
      name: tag.name, 
      description: tag.description, 
      color: tag.color 
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm(t('deleteTagConfirm'))) {
      setTags(prev => prev.filter(t => t.id !== id));
      if (selectedTag?.id === id) setSelectedTag(null);
    }
  };

  const handleSave = () => {
    if (!formData.name.trim()) return;

    if (editingTag) {
      setTags(prev => prev.map(t => t.id === editingTag.id ? { ...t, ...formData } as Tag : t));
    } else {
      const newTag: Tag = {
        id: `TAG-${Date.now()}`,
        name: formData.name,
        description: formData.description,
        color: formData.color as any,
        createdAt: new Date().toISOString().split('T')[0]
      };
      setTags(prev => [...prev, newTag]);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="flex h-full animate-fade-in relative">
      <div className="flex-1 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{t('empTags')}</h1>
            <p className="text-slate-500 mt-1">{t('tagsOverview')}</p>
          </div>
          <button 
            onClick={handleOpenCreate}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg text-sm font-bold shadow-lg shadow-indigo-200 transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            {t('createTag')}
          </button>
        </div>

        {/* Search */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
           <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={t('searchPlaceholder')}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border-none rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm transition-all" 
              />
           </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
           {filteredTags.map(tag => (
             <div 
               key={tag.id} 
               onClick={() => setSelectedTag(tag)}
               className={`bg-white p-6 rounded-xl border transition-all cursor-pointer group relative
                 ${selectedTag?.id === tag.id ? 'border-indigo-500 ring-2 ring-indigo-100 shadow-md' : 'border-slate-200 hover:border-indigo-300 hover:shadow-md'}
               `}
             >
                <div className="flex justify-between items-start mb-4">
                   <div className={`px-3 py-1 rounded-full text-xs font-bold border ${getColorClass(tag.color)}`}>
                      {tag.name}
                   </div>
                   <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={(e) => handleOpenEdit(tag, e)}
                        className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded"
                      >
                         <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button 
                        onClick={(e) => handleDelete(tag.id, e)}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded"
                      >
                         <Trash2 className="w-3.5 h-3.5" />
                      </button>
                   </div>
                </div>
                
                <p className="text-sm text-slate-500 mb-6 min-h-[40px] line-clamp-2">
                  {tag.description || 'No description provided.'}
                </p>

                <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                   <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Users className="w-4 h-4 text-slate-400" />
                      <span className="font-medium">{getMemberCount(tag.name)}</span>
                      <span className="text-slate-400">{t('tagMembers')}</span>
                   </div>
                   <span className="text-xs text-slate-400">{tag.createdAt}</span>
                </div>
             </div>
           ))}
           {filteredTags.length === 0 && (
             <div className="col-span-full py-12 text-center text-slate-400 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
                <TagIcon className="w-8 h-8 mx-auto mb-3 opacity-20" />
                <p>{t('noTagsFound')}</p>
             </div>
           )}
        </div>
      </div>

      {/* Members Slide-over */}
      <div className={`fixed top-0 right-0 h-full w-96 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out z-30 border-l border-slate-200 flex flex-col ${selectedTag ? 'translate-x-0' : 'translate-x-full'}`}>
         {selectedTag && (
           <>
             <div className="p-6 border-b border-slate-100 bg-slate-50">
                <div className="flex justify-between items-center mb-4">
                   <h2 className="text-lg font-bold text-slate-900">{t('tagMembers')}</h2>
                   <button onClick={() => setSelectedTag(null)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
                </div>
                <div className="flex items-center gap-2">
                   <span className={`px-2 py-0.5 rounded text-xs font-bold border ${getColorClass(selectedTag.color)}`}>
                      {selectedTag.name}
                   </span>
                   <span className="text-sm text-slate-500">{selectedTag.description}</span>
                </div>
             </div>
             
             <div className="flex-1 overflow-y-auto p-4 space-y-2">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 px-2">{t('taggedEmployees')}</h3>
                {MOCK_EMPLOYEES.filter(emp => emp.tags?.includes(selectedTag.name)).map(emp => (
                  <div key={emp.id} className="flex items-center gap-3 p-3 hover:bg-slate-50 rounded-lg transition-colors border border-transparent hover:border-slate-100">
                     <img src={emp.avatar} alt="" className="w-10 h-10 rounded-full border border-slate-200" />
                     <div className="flex-1 min-w-0">
                        <div className="font-medium text-slate-900 truncate">{emp.name}</div>
                        <div className="text-xs text-slate-500 truncate">{emp.role}</div>
                     </div>
                     <span className={`w-2 h-2 rounded-full ${emp.status === 'Active' ? 'bg-green-500' : 'bg-slate-300'}`}></span>
                  </div>
                ))}
                {getMemberCount(selectedTag.name) === 0 && (
                   <div className="text-center py-8 text-slate-400 text-sm italic">
                      No members assigned to this tag yet.
                   </div>
                )}
             </div>
           </>
         )}
      </div>

      {/* Create/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
           <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95">
              <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                 <h2 className="text-xl font-bold text-slate-900">{editingTag ? t('editTag') : t('createTag')}</h2>
                 <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
              </div>
              
              <div className="p-6 space-y-4">
                 <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">{t('tagName')}</label>
                    <input 
                      type="text" 
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                      placeholder="e.g. Remote Team"
                    />
                 </div>
                 
                 <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">{t('tagColor')}</label>
                    <div className="flex flex-wrap gap-3">
                       {colors.map(c => (
                         <button 
                           key={c}
                           onClick={() => setFormData({...formData, color: c})}
                           className={`w-8 h-8 rounded-full ${getBgClass(c)} flex items-center justify-center transition-transform hover:scale-110 ${formData.color === c ? 'ring-2 ring-offset-2 ring-slate-400 scale-110' : ''}`}
                         >
                            {formData.color === c && <Check className="w-4 h-4 text-white" />}
                         </button>
                       ))}
                    </div>
                 </div>

                 <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">{t('tagDesc')}</label>
                    <textarea 
                      value={formData.description}
                      onChange={e => setFormData({...formData, description: e.target.value})}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none resize-none h-24"
                      placeholder="Optional description..."
                    />
                 </div>
              </div>

              <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
                 <button 
                   onClick={() => setIsModalOpen(false)}
                   className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50"
                 >
                   {t('cancel')}
                 </button>
                 <button 
                   onClick={handleSave}
                   className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 shadow-sm"
                 >
                   {t('save')}
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default Tags;