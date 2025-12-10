
import React, { useState } from 'react';
import { ServiceRequest, RequestStatus, ServiceCategory, Announcement } from '../types';
import { Check, X, Clock, Sparkles, Filter, AlertCircle, Plus, Calendar, Users, MapPin, Pencil, Trash2, Megaphone } from 'lucide-react';
import { analyzeMaintenanceData } from '../services/geminiService';

const AVAILABLE_FACILITIES = [
  "Aula Lantai III",
  "Ruang Sidang Lantai II",
  "Gedung Teater Museum",
  "Auditorium Ali Hasjmy",
  "Gedung Aula Gedung Psikologi"
];

interface DashboardProps {
  requests: ServiceRequest[];
  onStatusChange: (id: string, newStatus: RequestStatus) => void;
  onAddRequest: (req: Omit<ServiceRequest, 'id' | 'status' | 'date'>) => void;
  onUpdateRequest: (req: ServiceRequest) => void;
  onDeleteRequest: (id: string) => void;
  announcements?: Announcement[];
  onAddAnnouncement?: (text: string) => void;
  onDeleteAnnouncement?: (id: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ 
    requests, 
    onStatusChange, 
    onAddRequest, 
    onUpdateRequest, 
    onDeleteRequest,
    announcements = [],
    onAddAnnouncement,
    onDeleteAnnouncement
}) => {
  const [filterCategory, setFilterCategory] = useState<ServiceCategory | 'All'>('All');
  const [filterStatus, setFilterStatus] = useState<RequestStatus | 'All'>('All');
  const [aiAnalysis, setAiAnalysis] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Announcement State
  const [isManagingAnnouncements, setIsManagingAnnouncements] = useState(false);
  const [newAnnouncementText, setNewAnnouncementText] = useState('');

  // Form State for Manual Add/Edit
  const [formState, setFormState] = useState<{
    category: ServiceCategory;
    name: string;
    location: string;
    description: string;
    priority: 'Low' | 'Medium' | 'High';
    activityName: string;
    participantCount: string;
    destination: string;
    scheduleDate: string;
  }>({
    category: ServiceCategory.AIR_BERSIH,
    name: '',
    location: '',
    description: '',
    priority: 'Low',
    activityName: '',
    participantCount: '',
    destination: '',
    scheduleDate: '',
  });

  const filteredRequests = requests.filter(req => {
    const matchCat = filterCategory === 'All' || req.category === filterCategory;
    const matchStat = filterStatus === 'All' || req.status === filterStatus;
    return matchCat && matchStat;
  });

  const handleAiAnalysis = async () => {
    setIsAnalyzing(true);
    const result = await analyzeMaintenanceData(requests);
    setAiAnalysis(result);
    setIsAnalyzing(false);
  };

  const handleEditClick = (req: ServiceRequest) => {
    setEditingId(req.id);
    
    // Format scheduleDate for datetime-local input (YYYY-MM-DDTHH:mm)
    const formattedSchedule = req.scheduleDate ? new Date(req.scheduleDate).toISOString().slice(0, 16) : '';

    setFormState({
        category: req.category,
        name: req.requesterName,
        location: req.location,
        description: req.description,
        priority: req.priority,
        activityName: req.activityName || '',
        participantCount: req.participantCount ? req.participantCount.toString() : '',
        destination: req.destination || '',
        scheduleDate: formattedSchedule,
    });
    setIsAdding(true);
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const requestData: any = {
      category: formState.category,
      requesterName: formState.name,
      location: formState.location,
      description: formState.description,
      priority: formState.priority,
    };

    // Add specific fields based on category
    if (formState.category === ServiceCategory.GEDUNG) {
       requestData.activityName = formState.activityName;
       requestData.participantCount = parseInt(formState.participantCount) || 0;
       requestData.scheduleDate = formState.scheduleDate;
    } else if (formState.category === ServiceCategory.KENDARAAN) {
       requestData.destination = formState.destination;
       requestData.participantCount = parseInt(formState.participantCount) || 0;
       requestData.scheduleDate = formState.scheduleDate;
    }

    if (editingId) {
        // UPDATE Existing
        const originalReq = requests.find(r => r.id === editingId);
        if (originalReq) {
            onUpdateRequest({
                ...originalReq,
                ...requestData
            });
        }
    } else {
        // ADD New
        onAddRequest(requestData);
    }

    setIsAdding(false);
    resetForm();
  };

  const resetForm = () => {
    setEditingId(null);
    setFormState({
      category: ServiceCategory.AIR_BERSIH,
      name: '',
      location: '',
      description: '',
      priority: 'Low',
      activityName: '',
      participantCount: '',
      destination: '',
      scheduleDate: '',
    });
  }

  const handleAddAnnouncementSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newAnnouncementText.trim() && onAddAnnouncement) {
        onAddAnnouncement(newAnnouncementText.trim());
        setNewAnnouncementText('');
    }
  };

  const handleCategoryChange = (newCategory: ServiceCategory) => {
    setFormState(prev => ({
      ...prev,
      category: newCategory,
      location: newCategory === ServiceCategory.GEDUNG ? AVAILABLE_FACILITIES[0] : '',
    }));
  };

  const getStatusBadge = (status: RequestStatus) => {
    const styles = {
      [RequestStatus.PENDING]: 'bg-amber-100 text-amber-700 border-amber-200',
      [RequestStatus.IN_PROGRESS]: 'bg-blue-100 text-blue-700 border-blue-200',
      [RequestStatus.COMPLETED]: 'bg-green-100 text-green-700 border-green-200',
      [RequestStatus.REJECTED]: 'bg-red-100 text-red-700 border-red-200',
    };
    const icon = {
      [RequestStatus.PENDING]: <Clock className="w-3.5 h-3.5 mr-1.5" />,
      [RequestStatus.IN_PROGRESS]: <Clock className="w-3.5 h-3.5 mr-1.5" />,
      [RequestStatus.COMPLETED]: <Check className="w-3.5 h-3.5 mr-1.5" />,
      [RequestStatus.REJECTED]: <X className="w-3.5 h-3.5 mr-1.5" />,
    };

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center w-fit ${styles[status]}`}>
        {icon[status]} {status}
      </span>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pt-24 min-h-screen bg-slate-50">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
        <div>
           <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight">Dashboard</h2>
           <p className="text-slate-500 mt-1">Overview aktivitas pemeliharaan & perbaikan.</p>
        </div>
        
        <div className="flex space-x-3">
          <button
            onClick={() => setIsManagingAnnouncements(true)}
            className="flex items-center px-4 py-3 bg-white text-slate-700 border border-slate-200 rounded-xl hover:bg-slate-50 shadow-sm transition-all font-medium"
          >
            <Megaphone className="w-5 h-5 mr-2 text-orange-500" />
            Pengumuman
          </button>

          <button
            onClick={() => { resetForm(); setIsAdding(true); }}
            className="flex items-center px-5 py-3 bg-white text-slate-700 border border-slate-200 rounded-xl hover:bg-slate-50 shadow-sm transition-all font-medium"
          >
            <Plus className="w-5 h-5 mr-2 text-blue-600" />
            Buat Tiket
          </button>
          
          <button
            onClick={handleAiAnalysis}
            disabled={isAnalyzing}
            className="flex items-center px-5 py-3 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-xl hover:shadow-lg hover:shadow-indigo-500/30 transition-all disabled:opacity-70 font-medium group"
          >
            <Sparkles className={`w-5 h-5 mr-2 ${isAnalyzing ? 'animate-spin' : 'group-hover:text-yellow-200'}`} />
            {isAnalyzing ? 'Menganalisis...' : 'AI Analysis'}
          </button>
        </div>
      </div>

      {/* AI Result Section */}
      {aiAnalysis && (
        <div className="mb-8 relative overflow-hidden bg-white rounded-2xl p-8 shadow-xl border border-indigo-100">
           <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full -mr-32 -mt-32 z-0"></div>
          <h3 className="text-xl font-bold text-indigo-900 mb-4 flex items-center relative z-10">
            <div className="p-2 bg-indigo-100 rounded-lg mr-3">
               <Sparkles className="w-6 h-6 text-indigo-600" />
            </div>
            Insight & Rekomendasi
          </h3>
          <div className="prose prose-indigo max-w-none text-slate-600 relative z-10">
             <p className="whitespace-pre-line leading-relaxed">{aiAnalysis}</p>
          </div>
        </div>
      )}

      {/* Filters Bar */}
      <div className="bg-white p-2 rounded-2xl shadow-sm border border-slate-200 mb-6 flex flex-wrap gap-2 items-center">
        <div className="flex items-center px-4 py-2 text-slate-500 font-medium text-sm">
          <Filter className="w-4 h-4 mr-2" /> Filter View:
        </div>
        <div className="h-8 w-px bg-slate-200 mx-2"></div>
        <select 
          className="bg-slate-50 border-none rounded-xl text-sm font-bold text-black py-2.5 px-4 focus:ring-2 focus:ring-blue-100 cursor-pointer hover:bg-slate-100 transition-colors"
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value as any)}
        >
          <option value="All">Semua Kategori</option>
          {Object.values(ServiceCategory).map(c => <option key={c} value={c}>{c}</option>)}
        </select>

        <select 
          className="bg-slate-50 border-none rounded-xl text-sm font-bold text-black py-2.5 px-4 focus:ring-2 focus:ring-blue-100 cursor-pointer hover:bg-slate-100 transition-colors"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as any)}
        >
          <option value="All">Semua Status</option>
          {Object.values(RequestStatus).map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {/* Modern Table */}
      <div className="bg-white shadow-xl shadow-slate-200/50 rounded-3xl border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100">
            <thead className="bg-slate-50/50">
              <tr>
                <th className="px-8 py-5 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Tanggal & ID</th>
                <th className="px-6 py-5 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Detail Request</th>
                <th className="px-6 py-5 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Keterangan / Tujuan</th>
                <th className="px-6 py-5 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Jadwal</th>
                <th className="px-6 py-5 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-5 text-right text-xs font-bold text-slate-400 uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-100">
              {filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center text-slate-400 flex flex-col items-center justify-center">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                       <AlertCircle className="w-8 h-8 text-slate-300" />
                    </div>
                    <p className="font-medium">Tidak ada data ditemukan.</p>
                  </td>
                </tr>
              ) : (
                filteredRequests.map((req) => (
                  <tr key={req.id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="px-8 py-5 whitespace-nowrap">
                      <div className="text-sm font-bold text-slate-900">{new Date(req.date).toLocaleDateString('id-ID', {day: 'numeric', month: 'short'})}</div>
                      <div className="text-xs text-slate-400 font-mono mt-1">#{req.id}</div>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                       <div className="flex flex-col">
                          <span className="text-sm font-semibold text-slate-900">{req.requesterName}</span>
                          <span className="text-xs text-slate-500 mt-0.5">{req.category}</span>
                          <div className="flex items-center text-xs text-slate-500 mt-1">
                             <MapPin className="w-3 h-3 mr-1" />
                             {req.location}
                             {req.participantCount && req.participantCount > 0 && (
                                <span className="ml-2 flex items-center bg-slate-100 px-1.5 rounded">
                                   <Users className="w-3 h-3 mr-1" /> {req.participantCount} Orang
                                </span>
                             )}
                          </div>
                       </div>
                    </td>
                    <td className="px-6 py-5">
                       {req.category === ServiceCategory.GEDUNG && req.activityName ? (
                          <div className="text-sm font-medium text-indigo-600 mb-0.5">{req.activityName}</div>
                       ) : null}
                       
                       {req.category === ServiceCategory.KENDARAAN && req.destination ? (
                          <div className="text-sm font-medium text-emerald-600 mb-0.5">Ke: {req.destination}</div>
                       ) : null}

                      <p className="text-sm text-slate-600 max-w-xs truncate" title={req.description}>
                        {req.description}
                      </p>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                       {req.scheduleDate ? (
                          <div className="flex items-center text-sm font-bold text-slate-700 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
                             <Calendar className="w-4 h-4 mr-2 text-blue-500" />
                             {new Date(req.scheduleDate).toLocaleString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'})}
                          </div>
                       ) : (
                          <span className="text-xs text-slate-400 italic">ASAP</span>
                       )}
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      {getStatusBadge(req.status)}
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap text-right text-sm font-medium">
                       <div className="flex items-center justify-end space-x-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                          
                          {/* Edit Button */}
                          <button onClick={() => handleEditClick(req)} className="p-2 bg-slate-50 text-slate-600 rounded-lg hover:bg-indigo-50 hover:text-indigo-600 transition-colors" title="Edit Tiket">
                            <Pencil className="w-4 h-4" />
                          </button>

                          {/* Delete Button */}
                          <button onClick={() => onDeleteRequest(req.id)} className="p-2 bg-slate-50 text-slate-600 rounded-lg hover:bg-red-50 hover:text-red-600 transition-colors" title="Hapus Tiket">
                             <Trash2 className="w-4 h-4" />
                          </button>

                          {/* Divider */}
                          <div className="w-px h-4 bg-slate-200 mx-1"></div>

                          {/* Process Actions */}
                          {req.status === RequestStatus.PENDING && (
                            <>
                              <button onClick={() => onStatusChange(req.id, RequestStatus.IN_PROGRESS)} className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors" title="Proses">
                                <Clock className="w-4 h-4" />
                              </button>
                              <button onClick={() => onStatusChange(req.id, RequestStatus.REJECTED)} className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors" title="Tolak">
                                <X className="w-4 h-4" />
                              </button>
                            </>
                          )}
                          {req.status === RequestStatus.IN_PROGRESS && (
                            <button onClick={() => onStatusChange(req.id, RequestStatus.COMPLETED)} className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors" title="Selesai">
                              <Check className="w-4 h-4" />
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
      </div>

      {/* Announcement Modal */}
      {isManagingAnnouncements && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
           <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={() => setIsManagingAnnouncements(false)}></div>
           <div className="relative bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden">
               <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                  <h3 className="text-lg font-bold text-slate-900 flex items-center">
                     <Megaphone className="w-5 h-5 mr-2 text-orange-500" />
                     Kelola Pengumuman (Running Text)
                  </h3>
                  <button onClick={() => setIsManagingAnnouncements(false)} className="p-1 rounded-full hover:bg-slate-200">
                    <X className="h-5 w-5 text-slate-500" />
                  </button>
               </div>
               
               <div className="p-6">
                  {/* Add New */}
                  <form onSubmit={handleAddAnnouncementSubmit} className="mb-6 flex gap-2">
                     <input 
                       type="text" 
                       className="flex-1 rounded-xl border-slate-300 bg-slate-50 px-4 py-2 focus:ring-2 focus:ring-orange-500 outline-none text-sm"
                       placeholder="Tulis pengumuman baru..."
                       value={newAnnouncementText}
                       onChange={(e) => setNewAnnouncementText(e.target.value)}
                       required
                     />
                     <button type="submit" className="bg-orange-500 text-white px-4 py-2 rounded-xl font-bold text-sm hover:bg-orange-600 transition-colors">
                        Tambah
                     </button>
                  </form>

                  {/* List */}
                  <div className="space-y-3 max-h-60 overflow-y-auto">
                     {announcements.length === 0 ? (
                        <p className="text-center text-slate-400 text-sm py-4">Belum ada pengumuman aktif.</p>
                     ) : (
                        announcements.map((ann) => (
                           <div key={ann.id} className="flex justify-between items-center bg-slate-50 p-3 rounded-lg border border-slate-100">
                              <p className="text-sm text-slate-700 font-medium line-clamp-1 mr-2">{ann.text}</p>
                              <button 
                                onClick={() => onDeleteAnnouncement && onDeleteAnnouncement(ann.id)}
                                className="text-red-500 hover:text-red-700 p-1 bg-white rounded-md border border-slate-200 hover:bg-red-50"
                              >
                                 <Trash2 className="w-4 h-4" />
                              </button>
                           </div>
                        ))
                     )}
                  </div>
               </div>
           </div>
        </div>
      )}

      {/* Dynamic Modal Form (Used for ADD and EDIT) */}
      {isAdding && (
         <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={() => { setIsAdding(false); resetForm(); }}></div>
            <div className="relative bg-white rounded-3xl shadow-2xl max-w-xl w-full overflow-hidden transform transition-all scale-100 max-h-[90vh] overflow-y-auto">
               <div className="px-8 py-6 bg-slate-50 border-b border-slate-100 flex justify-between items-center sticky top-0 z-10">
                  <h3 className="text-xl font-bold text-slate-900">
                     {editingId ? 'Edit Tiket' : 'Buat Tiket Baru'}
                     <span className="ml-2 text-sm font-normal text-slate-500">{formState.category}</span>
                  </h3>
                  <button onClick={() => { setIsAdding(false); resetForm(); }} className="p-2 rounded-full hover:bg-slate-200 transition-colors">
                    <X className="h-6 w-6 text-slate-500" />
                  </button>
               </div>
               
               <form onSubmit={handleManualSubmit} className="p-8 space-y-5">
                  <div>
                    <label className="block text-sm font-bold text-black mb-1">Kategori Layanan</label>
                    <select 
                       className="w-full rounded-xl border-slate-300 bg-white text-black px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none font-medium"
                       value={formState.category}
                       onChange={e => handleCategoryChange(e.target.value as ServiceCategory)}
                       disabled={!!editingId} // Disable category change when editing
                    >
                      {Object.values(ServiceCategory).map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>

                  {/* FORM GEDUNG / AULA */}
                  {formState.category === ServiceCategory.GEDUNG && (
                     <>
                        <div>
                           <label className="block text-sm font-bold text-black mb-1">Nama Kegiatan</label>
                           <input required type="text" className="w-full rounded-xl border-slate-300 bg-white text-black px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Contoh: Rapat Evaluasi Tahunan" value={formState.activityName} onChange={e => setFormState({...formState, activityName: e.target.value})} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                           <div>
                              <label className="block text-sm font-bold text-black mb-1">Tempat Digunakan</label>
                              <select 
                                 className="w-full rounded-xl border-slate-300 bg-white text-black px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none"
                                 value={formState.location}
                                 onChange={e => setFormState({...formState, location: e.target.value})}
                              >
                                 {AVAILABLE_FACILITIES.map(f => (
                                    <option key={f} value={f}>{f}</option>
                                 ))}
                              </select>
                           </div>
                           <div>
                              <label className="block text-sm font-bold text-black mb-1">Jadwal Penggunaan</label>
                              <input required type="datetime-local" className="w-full rounded-xl border-slate-300 bg-white text-black px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none" value={formState.scheduleDate} onChange={e => setFormState({...formState, scheduleDate: e.target.value})} />
                           </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                           <div>
                              <label className="block text-sm font-bold text-black mb-1">Nama Pengguna (User)</label>
                              <input required type="text" className="w-full rounded-xl border-slate-300 bg-white text-black px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none" value={formState.name} onChange={e => setFormState({...formState, name: e.target.value})} />
                           </div>
                           <div>
                              <label className="block text-sm font-bold text-black mb-1">Jumlah Peserta</label>
                              <input required type="number" className="w-full rounded-xl border-slate-300 bg-white text-black px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none" value={formState.participantCount} onChange={e => setFormState({...formState, participantCount: e.target.value})} />
                           </div>
                        </div>
                        <div>
                           <label className="block text-sm font-bold text-black mb-1">Keterangan Tambahan (Opsional)</label>
                           <textarea rows={2} className="w-full rounded-xl border-slate-300 bg-white text-black px-4 py-3 outline-none resize-none" value={formState.description} onChange={e => setFormState({...formState, description: e.target.value})}></textarea>
                        </div>
                        <div>
                           <label className="block text-sm font-bold text-black mb-1">Prioritas</label>
                           <div className="grid grid-cols-3 gap-3">
                              {['Low', 'Medium', 'High'].map((p) => (
                                 <button
                                   key={p}
                                   type="button"
                                   onClick={() => setFormState({...formState, priority: p as any})}
                                   className={`py-2 rounded-lg text-sm font-bold border transition-all ${
                                     formState.priority === p 
                                     ? (p === 'High' ? 'bg-red-50 border-red-500 text-red-700' : p === 'Medium' ? 'bg-orange-50 border-orange-500 text-orange-700' : 'bg-green-50 border-green-500 text-green-700')
                                     : 'bg-white border-slate-300 text-black hover:border-slate-400'
                                   }`}
                                 >
                                   {p}
                                 </button>
                              ))}
                           </div>
                        </div>
                     </>
                  )}

                  {/* FORM KENDARAAN */}
                  {formState.category === ServiceCategory.KENDARAAN && (
                     <>
                        <div className="grid grid-cols-2 gap-4">
                           <div>
                              <label className="block text-sm font-bold text-black mb-1">Jadwal Penggunaan</label>
                              <input required type="datetime-local" className="w-full rounded-xl border-slate-300 bg-white text-black px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none" value={formState.scheduleDate} onChange={e => setFormState({...formState, scheduleDate: e.target.value})} />
                           </div>
                           <div>
                              <label className="block text-sm font-bold text-black mb-1">Tanggal Kosong (Cek)</label>
                              <div className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-black text-sm flex items-center cursor-not-allowed font-medium">
                                 <Calendar className="w-4 h-4 mr-2" /> Cek Ketersediaan
                              </div>
                           </div>
                        </div>
                         <div>
                           <label className="block text-sm font-bold text-black mb-1">Tujuan Acara / Keperluan</label>
                           <textarea required rows={2} className="w-full rounded-xl border-slate-300 bg-white text-black px-4 py-3 outline-none resize-none" placeholder="Menjelaskan tujuan perjalanan dinas..." value={formState.description} onChange={e => setFormState({...formState, description: e.target.value})}></textarea>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                           <div>
                              <label className="block text-sm font-bold text-black mb-1">Tempat Tujuan (Kota/Lokasi)</label>
                              <input required type="text" className="w-full rounded-xl border-slate-300 bg-white text-black px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none" value={formState.destination} onChange={e => setFormState({...formState, destination: e.target.value})} />
                           </div>
                           <div>
                              <label className="block text-sm font-bold text-black mb-1">Kapasitas (Orang)</label>
                              <input required type="number" className="w-full rounded-xl border-slate-300 bg-white text-black px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none" value={formState.participantCount} onChange={e => setFormState({...formState, participantCount: e.target.value})} />
                           </div>
                        </div>
                         <div>
                            <label className="block text-sm font-bold text-black mb-1">Nama Pemohon</label>
                            <input required type="text" className="w-full rounded-xl border-slate-300 bg-white text-black px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none" value={formState.name} onChange={e => setFormState({...formState, name: e.target.value})} />
                         </div>
                        <div>
                           <label className="block text-sm font-bold text-black mb-1">Prioritas</label>
                           <div className="grid grid-cols-3 gap-3">
                              {['Low', 'Medium', 'High'].map((p) => (
                                 <button
                                   key={p}
                                   type="button"
                                   onClick={() => setFormState({...formState, priority: p as any})}
                                   className={`py-2 rounded-lg text-sm font-bold border transition-all ${
                                     formState.priority === p 
                                     ? (p === 'High' ? 'bg-red-50 border-red-500 text-red-700' : p === 'Medium' ? 'bg-orange-50 border-orange-500 text-orange-700' : 'bg-green-50 border-green-500 text-green-700')
                                     : 'bg-white border-slate-300 text-black hover:border-slate-400'
                                   }`}
                                 >
                                   {p}
                                 </button>
                              ))}
                           </div>
                        </div>
                     </>
                  )}

                  {/* FORM MAINTENANCE (Air, Listrik, AC) */}
                  {formState.category !== ServiceCategory.GEDUNG && formState.category !== ServiceCategory.KENDARAAN && (
                     <>
                        <div>
                          <label className="block text-sm font-bold text-black mb-1">Nama Pemohon</label>
                          <input
                            required
                            type="text"
                            className="w-full rounded-xl border-slate-300 bg-white text-black px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none"
                            value={formState.name}
                            onChange={e => setFormState({...formState, name: e.target.value})}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-black mb-1">Lokasi Perbaikan</label>
                          <input
                            required
                            type="text"
                            className="w-full rounded-xl border-slate-300 bg-white text-black px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="Gedung/Ruang"
                            value={formState.location}
                            onChange={e => setFormState({...formState, location: e.target.value})}
                          />
                        </div>
                        <div>
                           <label className="block text-sm font-bold text-black mb-1">Prioritas</label>
                           <div className="grid grid-cols-3 gap-3">
                              {['Low', 'Medium', 'High'].map((p) => (
                                 <button
                                   key={p}
                                   type="button"
                                   onClick={() => setFormState({...formState, priority: p as any})}
                                   className={`py-2 rounded-lg text-sm font-bold border transition-all ${
                                     formState.priority === p 
                                     ? (p === 'High' ? 'bg-red-50 border-red-500 text-red-700' : p === 'Medium' ? 'bg-orange-50 border-orange-500 text-orange-700' : 'bg-green-50 border-green-500 text-green-700')
                                     : 'bg-white border-slate-300 text-black hover:border-slate-400'
                                   }`}
                                 >
                                   {p}
                                 </button>
                              ))}
                           </div>
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-black mb-1">Deskripsi Kerusakan ({formState.category})</label>
                          <textarea
                            required
                            rows={3}
                            className="w-full rounded-xl border-slate-300 bg-white text-black px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                            value={formState.description}
                            onChange={e => setFormState({...formState, description: e.target.value})}
                          ></textarea>
                        </div>
                     </>
                  )}

                  <button
                    type="submit"
                    className="w-full py-3 rounded-xl bg-blue-600 text-white font-bold shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:-translate-y-0.5 transition-all"
                  >
                    {editingId ? 'Update Tiket' : 'Simpan Tiket'}
                  </button>
               </form>
            </div>
         </div>
      )}

    </div>
  );
};
