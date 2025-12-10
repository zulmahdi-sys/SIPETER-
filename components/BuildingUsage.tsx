
import React, { useState } from 'react';
import { ServiceRequest, RequestStatus, ServiceCategory } from '../types';
import { Building2, Plus, Calendar as CalendarIcon, MapPin, Users, Clock, Check, X, AlertTriangle, Lock, Presentation, Info, ChevronLeft, ChevronRight } from 'lucide-react';

const AVAILABLE_FACILITIES = [
  "Aula Lantai III",
  "Ruang Sidang Lantai II",
  "Gedung Teater Museum",
  "Auditorium Ali Hasjmy",
  "Gedung Aula Gedung Psikologi"
];

interface BuildingUsageProps {
  requests: ServiceRequest[];
  onAddRequest: (req: Omit<ServiceRequest, 'id' | 'status' | 'date'>) => void;
  onStatusChange: (id: string, newStatus: RequestStatus) => void;
  isLoggedIn: boolean;
}

export const BuildingUsage: React.FC<BuildingUsageProps> = ({ requests, onAddRequest, onStatusChange, isLoggedIn }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date()); // Calendar Navigation
  const [selectedDate, setSelectedDate] = useState<Date | null>(null); // Filter

  // Filter Active Building Requests
  const buildingRequests = requests
    .filter(r => r.category === ServiceCategory.GEDUNG && r.status !== RequestStatus.REJECTED && r.status !== RequestStatus.COMPLETED)
    .sort((a, b) => {
       const dateA = a.scheduleDate ? new Date(a.scheduleDate).getTime() : 0;
       const dateB = b.scheduleDate ? new Date(b.scheduleDate).getTime() : 0;
       return dateA - dateB;
    });

  const [formState, setFormState] = useState({
    name: '',
    activityName: '',
    description: '',
    location: AVAILABLE_FACILITIES[0],
    participantCount: '',
    scheduleDate: '',
    priority: 'Medium' as 'Low' | 'Medium' | 'High',
  });

  // --- CALENDAR LOGIC ---
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    return new Date(year, month, 1).getDay();
  };

  const handlePrevMonth = () => {
    const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
    const today = new Date();
    // Allow looking back slightly but focus on future
    if (newDate.getMonth() < today.getMonth() - 1 && newDate.getFullYear() === today.getFullYear()) return; 
    setCurrentDate(newDate);
  };

  const handleNextMonth = () => {
    const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
    const today = new Date();
    if (newDate > new Date(today.getFullYear() + 1, today.getMonth(), 1)) return;
    setCurrentDate(newDate);
  };

  const getRequestsForDate = (day: number, currentMonthDate: Date) => {
    const targetStr = new Date(currentMonthDate.getFullYear(), currentMonthDate.getMonth(), day).toDateString();
    return buildingRequests.filter(r => {
      if (!r.scheduleDate) return false;
      return new Date(r.scheduleDate).toDateString() === targetStr;
    });
  };

  const handleDateClick = (day: number) => {
    const clickedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    setSelectedDate(clickedDate);
    
    if (isLoggedIn) {
       const year = clickedDate.getFullYear();
       const month = String(clickedDate.getMonth() + 1).padStart(2, '0');
       const d = String(clickedDate.getDate()).padStart(2, '0');
       setFormState(prev => ({
         ...prev,
         scheduleDate: `${year}-${month}-${d}T09:00`
       }));
       // Automatically open form when clicking a date if logged in
       setIsAdding(true);
    }
  };

  const handleOpenForm = () => {
    if (!formState.scheduleDate) {
        const now = new Date();
        now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
        setFormState(prev => ({...prev, scheduleDate: now.toISOString().slice(0, 16)}));
    }
    setIsAdding(true);
  };

  // --- FORM LOGIC ---
  const existingSchedules = buildingRequests.filter(r => {
      if(!r.scheduleDate || !formState.scheduleDate) return false;
      // Check strict date overlap logic if needed, currently just checking same day
      return new Date(r.scheduleDate).toDateString() === new Date(formState.scheduleDate).toDateString();
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddRequest({
      category: ServiceCategory.GEDUNG,
      requesterName: formState.name,
      activityName: formState.activityName,
      description: formState.description,
      location: formState.location,
      participantCount: parseInt(formState.participantCount),
      scheduleDate: formState.scheduleDate,
      priority: formState.priority,
    });
    setIsAdding(false);
    setFormState({
      name: '',
      activityName: '',
      description: '',
      location: AVAILABLE_FACILITIES[0],
      participantCount: '',
      scheduleDate: '',
      priority: 'Medium',
    });
    setSelectedDate(null);
  };

  // --- RENDER HELPERS ---
  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);
  const monthNames = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];

  const filteredList = selectedDate 
    ? buildingRequests.filter(r => r.scheduleDate && new Date(r.scheduleDate).toDateString() === selectedDate.toDateString())
    : buildingRequests;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pt-24 min-h-screen bg-slate-50">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
        <div>
           <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight flex items-center">
             <div className="p-3 bg-emerald-100 rounded-xl mr-4">
                <Building2 className="w-8 h-8 text-emerald-600" />
             </div>
             Manajemen Gedung
           </h2>
           <p className="text-slate-500 mt-2 ml-20">Jadwal pemakaian Aula, Ruang Rapat, dan Fasilitas Umum.</p>
        </div>
        
        {isLoggedIn ? (
          <button
            onClick={handleOpenForm}
            className="flex items-center px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 shadow-lg shadow-emerald-500/30 transition-all font-bold"
          >
            <Plus className="w-5 h-5 mr-2" />
            Booking Ruangan
          </button>
        ) : (
          <div className="flex items-center px-4 py-2 bg-slate-100 text-slate-500 rounded-xl font-medium border border-slate-200">
             <Lock className="w-4 h-4 mr-2" /> View Only
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: CALENDAR (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
            <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
                {/* Calendar Header */}
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-emerald-50/50">
                    <h3 className="text-xl font-bold text-slate-800">
                        {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                    </h3>
                    <div className="flex items-center space-x-2">
                        <button onClick={handlePrevMonth} className="p-2 hover:bg-white rounded-full transition-colors text-slate-600">
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <button onClick={() => setCurrentDate(new Date())} className="text-xs font-bold px-3 py-1 bg-white border border-slate-200 rounded-full text-slate-600 hover:text-emerald-600">
                            Hari Ini
                        </button>
                        <button onClick={handleNextMonth} className="p-2 hover:bg-white rounded-full transition-colors text-slate-600">
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Calendar Grid */}
                <div className="p-6">
                    <div className="grid grid-cols-7 mb-4">
                        {['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'].map(d => (
                            <div key={d} className="text-center text-xs font-bold text-slate-400 uppercase tracking-wider py-2">{d}</div>
                        ))}
                    </div>
                    <div className="grid grid-cols-7 gap-2">
                        {/* Empty cells */}
                        {Array.from({ length: firstDay }).map((_, i) => (
                            <div key={`empty-${i}`} className="aspect-square"></div>
                        ))}

                        {/* Days */}
                        {Array.from({ length: daysInMonth }).map((_, i) => {
                            const day = i + 1;
                            const reqs = getRequestsForDate(day, currentDate);
                            const hasBooking = reqs.length > 0;
                            const isToday = new Date().toDateString() === new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toDateString();
                            const isSelected = selectedDate && selectedDate.getDate() === day && selectedDate.getMonth() === currentDate.getMonth();
                            const isPast = new Date(currentDate.getFullYear(), currentDate.getMonth(), day) < new Date(new Date().setHours(0,0,0,0));

                            return (
                                <button 
                                    key={day} 
                                    onClick={() => handleDateClick(day)}
                                    disabled={isPast && !hasBooking}
                                    title={isLoggedIn ? "Klik untuk booking tanggal ini" : "Lihat detail"}
                                    className={`
                                        aspect-square rounded-2xl relative flex flex-col items-center justify-center transition-all duration-200 border
                                        ${isSelected ? 'ring-2 ring-emerald-500 ring-offset-2 z-10' : ''}
                                        ${isPast && !hasBooking ? 'bg-slate-50 text-slate-300 border-transparent cursor-default' : 
                                          hasBooking 
                                            ? 'bg-amber-50 border-amber-200 hover:border-amber-400 hover:shadow-md' 
                                            : 'bg-emerald-50 border-emerald-100 hover:bg-emerald-100 text-emerald-700 hover:shadow-md'
                                        }
                                    `}
                                >
                                    <span className={`text-sm font-bold ${isToday ? 'bg-emerald-600 text-white w-6 h-6 rounded-full flex items-center justify-center' : ''}`}>
                                        {day}
                                    </span>
                                    
                                    {hasBooking ? (
                                        <div className="mt-1 flex flex-col items-center">
                                            <span className="text-[9px] font-bold text-amber-700 uppercase tracking-tight">Terpakai</span>
                                            <div className="flex space-x-0.5 mt-0.5">
                                                {reqs.slice(0, 3).map((_, idx) => (
                                                    <div key={idx} className="w-1.5 h-1.5 rounded-full bg-amber-500"></div>
                                                ))}
                                            </div>
                                        </div>
                                    ) : (
                                        !isPast && <span className="text-[9px] font-medium mt-1 text-emerald-600/70">Kosong</span>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>
                
                {/* Legend */}
                <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex gap-4 text-xs font-medium text-slate-600">
                    <div className="flex items-center"><div className="w-3 h-3 rounded-full bg-emerald-100 border border-emerald-200 mr-2"></div> Kosong (Tersedia)</div>
                    <div className="flex items-center"><div className="w-3 h-3 rounded-full bg-amber-100 border border-amber-300 mr-2"></div> Terpakai (Ada Kegiatan)</div>
                    <div className="flex items-center"><div className="w-3 h-3 rounded-full bg-emerald-600 mr-2"></div> Hari Ini</div>
                </div>
            </div>
            
            {/* Facilities List (Included here per requirement) */}
            <div className="bg-white rounded-2xl shadow-lg shadow-slate-200/50 border border-slate-100 p-6">
                <h3 className="font-bold text-slate-800 text-lg mb-4 flex items-center">
                    <Presentation className="w-5 h-5 mr-2 text-emerald-600" />
                    Daftar Fasilitas
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {AVAILABLE_FACILITIES.map((facility, idx) => (
                    <div key={idx} className="flex items-center p-2 rounded-lg bg-slate-50 border border-slate-100 text-xs font-semibold text-slate-600">
                        <div className="w-2 h-2 rounded-full bg-emerald-400 mr-2"></div>
                        {facility}
                    </div>
                    ))}
                </div>
            </div>
        </div>

        {/* RIGHT COLUMN: LIST DETAILS (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
            <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 p-6 min-h-[600px] flex flex-col">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h3 className="text-lg font-bold text-slate-800">
                            {selectedDate 
                                ? `Kegiatan: ${selectedDate.toLocaleDateString('id-ID', {weekday: 'long', day: 'numeric', month: 'long'})}` 
                                : 'Jadwal Kegiatan Mendatang'}
                        </h3>
                        {selectedDate && (
                            <button onClick={() => setSelectedDate(null)} className="text-xs text-emerald-600 font-bold hover:underline">
                                Tampilkan Semua
                            </button>
                        )}
                    </div>
                    {isLoggedIn && selectedDate && (
                         <button onClick={() => { setIsAdding(true); }} className="p-2 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 transition-colors" title="Tambah di tanggal ini">
                            <Plus className="w-5 h-5" />
                         </button>
                    )}
                </div>

                <div className="space-y-4 overflow-y-auto custom-scrollbar pr-2 flex-grow">
                    {filteredList.length === 0 ? (
                        <div className="text-center py-12 border-2 border-dashed border-slate-100 rounded-2xl h-full flex flex-col justify-center items-center">
                            <CalendarIcon className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                            <p className="text-slate-500 font-medium">Tidak ada kegiatan terjadwal.</p>
                            {selectedDate && (
                                <div className="mt-4 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-lg text-sm font-bold flex items-center">
                                    <Check className="w-4 h-4 mr-2" /> Gedung Kosong / Tersedia
                                </div>
                            )}
                        </div>
                    ) : (
                        filteredList.map((req) => (
                            <div key={req.id} className="p-5 rounded-2xl border border-slate-100 hover:border-emerald-200 hover:shadow-md transition-all bg-white group relative overflow-hidden">
                                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-amber-400"></div>
                                
                                <div className="flex justify-between items-start mb-2 pl-2">
                                    <div className="flex items-center text-xs text-slate-500 font-bold bg-slate-50 px-2 py-1 rounded-md">
                                        <Clock className="w-3.5 h-3.5 mr-1.5" />
                                        {req.scheduleDate ? new Date(req.scheduleDate).toLocaleTimeString('id-ID', {hour: '2-digit', minute:'2-digit'}) : '-'}
                                        {!selectedDate && (
                                            <span className="ml-2 pl-2 border-l border-slate-300">
                                                {new Date(req.scheduleDate!).toLocaleDateString('id-ID', {day: 'numeric', month: 'short'})}
                                            </span>
                                        )}
                                    </div>
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                        req.status === RequestStatus.IN_PROGRESS ? 'bg-blue-50 text-blue-600' : 'bg-amber-50 text-amber-600'
                                    }`}>
                                        {req.status}
                                    </span>
                                </div>
                                
                                <div className="pl-2">
                                    <h4 className="font-bold text-slate-900 leading-tight mb-1 text-lg">{req.activityName}</h4>
                                    
                                    <div className="flex items-center text-emerald-600 text-sm font-bold mb-3">
                                        <MapPin className="w-4 h-4 mr-1.5" />
                                        {req.location}
                                    </div>

                                    <div className="flex flex-col gap-2 bg-slate-50 p-3 rounded-xl text-sm border border-slate-100">
                                        <div className="flex items-center">
                                            <Users className="w-4 h-4 mr-2 text-slate-400" />
                                            <span className="text-slate-500">Pemohon:</span>
                                            <span className="ml-2 font-bold text-slate-800">{req.requesterName}</span>
                                        </div>
                                        <div className="flex items-center">
                                            <Info className="w-4 h-4 mr-2 text-slate-400" />
                                            <span className="text-slate-500">Peserta:</span>
                                            <span className="ml-2 font-bold text-slate-800">{req.participantCount || '-'} Orang</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Admin Actions */}
                                {isLoggedIn && req.status === RequestStatus.PENDING && (
                                    <div className="mt-4 ml-2 pt-3 border-t border-slate-100 flex gap-2">
                                        <button onClick={() => onStatusChange(req.id, RequestStatus.IN_PROGRESS)} className="flex-1 py-2 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700">
                                            Setujui
                                        </button>
                                        <button onClick={() => onStatusChange(req.id, RequestStatus.REJECTED)} className="px-3 py-2 bg-red-100 text-red-600 text-xs font-bold rounded-lg hover:bg-red-200">
                                            Tolak
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
      </div>

      {/* Admin Form Modal */}
      {isAdding && isLoggedIn && (
         <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={() => setIsAdding(false)}></div>
            <div className="relative bg-white rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden transform transition-all scale-100 max-h-[90vh] overflow-y-auto">
               <div className="px-8 py-6 bg-emerald-50 border-b border-emerald-100 flex justify-between items-center sticky top-0 z-10">
                  <h3 className="text-xl font-bold text-emerald-900 flex items-center">
                     <Building2 className="w-6 h-6 mr-2" /> Booking Penggunaan Gedung
                  </h3>
                  <button onClick={() => setIsAdding(false)} className="p-2 rounded-full hover:bg-emerald-200/50 transition-colors text-emerald-700">
                    <X className="h-6 w-6" />
                  </button>
               </div>
               
               <form onSubmit={handleSubmit} className="p-8 space-y-6">
                  
                  {/* Schedule Section */}
                  <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                     <h4 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider mb-4 flex items-center">
                        <Clock className="w-4 h-4 mr-2 text-slate-500" /> Waktu & Ketersediaan
                     </h4>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                           <label className="block text-sm font-bold text-black mb-1">Tanggal & Jam Kegiatan</label>
                           <input 
                              required 
                              type="datetime-local" 
                              className="w-full rounded-xl border-slate-300 bg-white text-black px-4 py-3 focus:ring-2 focus:ring-emerald-500 outline-none" 
                              value={formState.scheduleDate} 
                              onChange={e => setFormState({...formState, scheduleDate: e.target.value})} 
                           />
                        </div>
                        <div>
                           <label className="block text-sm font-bold text-black mb-1">Cek Bentrok Jadwal</label>
                           <div className={`w-full rounded-xl border px-4 py-3 text-sm flex items-center min-h-[46px] ${
                              !formState.scheduleDate ? 'bg-slate-100 border-slate-200 text-slate-400' :
                              existingSchedules.length > 0 ? 'bg-amber-50 border-amber-200 text-amber-700' : 'bg-emerald-50 border-emerald-200 text-emerald-700'
                           }`}>
                              {!formState.scheduleDate ? (
                                 <span>Pilih tanggal dahulu</span>
                              ) : existingSchedules.length > 0 ? (
                                 <span className="flex items-center font-bold"><AlertTriangle className="w-4 h-4 mr-2" /> {existingSchedules.length} Kegiatan Lain</span>
                              ) : (
                                 <span className="flex items-center font-bold"><Check className="w-4 h-4 mr-2" /> Tanggal Aman</span>
                              )}
                           </div>
                        </div>
                     </div>
                     {/* Show existing schedules if any */}
                     {existingSchedules.length > 0 && (
                        <div className="mt-3 text-xs text-amber-700 bg-amber-50 p-3 rounded-lg">
                           <p className="font-bold mb-1">Kegiatan pada tanggal ini:</p>
                           <ul className="list-disc list-inside space-y-0.5">
                              {existingSchedules.map(s => (
                                 <li key={s.id}>[{new Date(s.scheduleDate!).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}] {s.location} - {s.activityName}</li>
                              ))}
                           </ul>
                        </div>
                     )}
                  </div>

                  {/* Details */}
                  <div>
                      <label className="block text-sm font-bold text-black mb-1">Nama Kegiatan / Acara</label>
                      <input 
                         required 
                         type="text" 
                         className="w-full rounded-xl border-slate-300 bg-white text-black px-4 py-3 focus:ring-2 focus:ring-emerald-500 outline-none" 
                         placeholder="Contoh: Rapat Koordinasi Bulanan"
                         value={formState.activityName} 
                         onChange={e => setFormState({...formState, activityName: e.target.value})} 
                      />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div>
                        <label className="block text-sm font-bold text-black mb-1">Ruangan / Lokasi</label>
                        <select 
                           className="w-full rounded-xl border-slate-300 bg-white text-black px-4 py-3 focus:ring-2 focus:ring-emerald-500 outline-none cursor-pointer"
                           value={formState.location}
                           onChange={e => setFormState({...formState, location: e.target.value})}
                        >
                           {AVAILABLE_FACILITIES.map(facility => (
                             <option key={facility} value={facility}>{facility}</option>
                           ))}
                        </select>
                     </div>
                     <div>
                        <label className="block text-sm font-bold text-black mb-1">Perkiraan Peserta</label>
                        <input 
                           required 
                           type="number" 
                           className="w-full rounded-xl border-slate-300 bg-white text-black px-4 py-3 focus:ring-2 focus:ring-emerald-500 outline-none" 
                           placeholder="0"
                           value={formState.participantCount} 
                           onChange={e => setFormState({...formState, participantCount: e.target.value})} 
                        />
                     </div>
                  </div>

                  <div>
                     <label className="block text-sm font-bold text-black mb-1">Keterangan Tambahan / Fasilitas</label>
                     <textarea 
                        rows={2} 
                        className="w-full rounded-xl border-slate-300 bg-white text-black px-4 py-3 outline-none resize-none focus:ring-2 focus:ring-emerald-500" 
                        placeholder="Contoh: Perlu sound system, projector, dan 50 kursi tambahan." 
                        value={formState.description} 
                        onChange={e => setFormState({...formState, description: e.target.value})}
                     ></textarea>
                  </div>

                  {/* Requester Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                         <label className="block text-sm font-bold text-black mb-1">Penanggung Jawab (PIC)</label>
                         <input 
                            required 
                            type="text" 
                            className="w-full rounded-xl border-slate-300 bg-white text-black px-4 py-3 focus:ring-2 focus:ring-emerald-500 outline-none" 
                            value={formState.name} 
                            onChange={e => setFormState({...formState, name: e.target.value})} 
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
                                 className={`py-3 rounded-xl text-sm font-bold border transition-all ${
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
                  </div>

                  <button
                    type="submit"
                    className="w-full py-4 rounded-xl bg-emerald-600 text-white font-bold shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 hover:-translate-y-0.5 transition-all text-lg mt-4"
                  >
                    Simpan Booking Gedung
                  </button>
               </form>
            </div>
         </div>
      )}

    </div>
  );
};
