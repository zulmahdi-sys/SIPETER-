
import React, { useState, useEffect } from 'react';
import { ServiceRequest, RequestStatus, ServiceCategory } from '../types';
import { Car, Plus, Calendar as CalendarIcon, MapPin, Users, Clock, Check, X, AlertTriangle, Lock, ChevronLeft, ChevronRight, Info } from 'lucide-react';

interface VehicleUsageProps {
  requests: ServiceRequest[];
  onAddRequest: (req: Omit<ServiceRequest, 'id' | 'status' | 'date'>) => void;
  onStatusChange: (id: string, newStatus: RequestStatus) => void;
  isLoggedIn: boolean;
}

export const VehicleUsage: React.FC<VehicleUsageProps> = ({ requests, onAddRequest, onStatusChange, isLoggedIn }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date()); // For Calendar Navigation
  const [selectedDate, setSelectedDate] = useState<Date | null>(null); // For Filtering List

  // Filter only Vehicle Requests
  const vehicleRequests = requests
    .filter(r => r.category === ServiceCategory.KENDARAAN && r.status !== RequestStatus.REJECTED && r.status !== RequestStatus.COMPLETED)
    .sort((a, b) => {
       const dateA = a.scheduleDate ? new Date(a.scheduleDate).getTime() : 0;
       const dateB = b.scheduleDate ? new Date(b.scheduleDate).getTime() : 0;
       return dateA - dateB; // Closest date first
    });

  const [formState, setFormState] = useState({
    name: '',
    description: '',
    destination: '',
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
    // Don't go back past current month
    const today = new Date();
    if (newDate.getMonth() < today.getMonth() && newDate.getFullYear() === today.getFullYear()) return;
    setCurrentDate(newDate);
  };

  const handleNextMonth = () => {
    const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
    // Limit to 1 year ahead
    const today = new Date();
    const oneYearLater = new Date(today.getFullYear() + 1, today.getMonth(), 1);
    if (newDate > oneYearLater) return;
    setCurrentDate(newDate);
  };

  const getRequestsForDate = (day: number, currentMonthDate: Date) => {
    const targetStr = new Date(currentMonthDate.getFullYear(), currentMonthDate.getMonth(), day).toDateString();
    return vehicleRequests.filter(r => {
      if (!r.scheduleDate) return false;
      return new Date(r.scheduleDate).toDateString() === targetStr;
    });
  };

  const handleDateClick = (day: number) => {
    const clickedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    setSelectedDate(clickedDate);
    
    // If admin clicks a date, prepare form AND open it
    if (isLoggedIn) {
       // Format for datetime-local input: YYYY-MM-DDTHH:mm
       const year = clickedDate.getFullYear();
       const month = String(clickedDate.getMonth() + 1).padStart(2, '0');
       const d = String(clickedDate.getDate()).padStart(2, '0');
       setFormState(prev => ({
         ...prev,
         scheduleDate: `${year}-${month}-${d}T09:00`
       }));
       setIsAdding(true);
    }
  };

  const handleOpenForm = () => {
    // If no date selected, default to today
    if (!formState.scheduleDate) {
        const now = new Date();
        now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
        setFormState(prev => ({...prev, scheduleDate: now.toISOString().slice(0, 16)}));
    }
    setIsAdding(true);
  };

  // --- FORM LOGIC ---
  const existingSchedules = vehicleRequests.filter(r => {
      if(!r.scheduleDate || !formState.scheduleDate) return false;
      return new Date(r.scheduleDate).toDateString() === new Date(formState.scheduleDate).toDateString();
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddRequest({
      category: ServiceCategory.KENDARAAN,
      requesterName: formState.name,
      description: formState.description,
      destination: formState.destination,
      participantCount: parseInt(formState.participantCount),
      scheduleDate: formState.scheduleDate,
      location: 'Kantor Pusat',
      priority: formState.priority,
    });
    setIsAdding(false);
    setFormState({
      name: '',
      description: '',
      destination: '',
      participantCount: '',
      scheduleDate: '',
      priority: 'Medium',
    });
    setSelectedDate(null); // Reset filter
  };

  // --- RENDER HELPERS ---
  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);
  const monthNames = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];

  const filteredList = selectedDate 
    ? vehicleRequests.filter(r => r.scheduleDate && new Date(r.scheduleDate).toDateString() === selectedDate.toDateString())
    : vehicleRequests;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pt-24 min-h-screen bg-slate-50">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
        <div>
           <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight flex items-center">
             <div className="p-3 bg-red-100 rounded-xl mr-4">
                <Car className="w-8 h-8 text-red-600" />
             </div>
             Manajemen Kendaraan
           </h2>
           <p className="text-slate-500 mt-2 ml-20">Jadwal ketersediaan & booking kendaraan (1 Tahun ke depan).</p>
        </div>
        
        {isLoggedIn ? (
          <button
            onClick={handleOpenForm}
            className="flex items-center px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 shadow-lg shadow-red-500/30 transition-all font-bold"
          >
            <Plus className="w-5 h-5 mr-2" />
            Booking Baru
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
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-red-50/50">
                    <h3 className="text-xl font-bold text-slate-800">
                        {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                    </h3>
                    <div className="flex items-center space-x-2">
                        <button onClick={handlePrevMonth} className="p-2 hover:bg-white rounded-full transition-colors text-slate-600">
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <button onClick={() => setCurrentDate(new Date())} className="text-xs font-bold px-3 py-1 bg-white border border-slate-200 rounded-full text-slate-600 hover:text-red-600">
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
                        {/* Empty cells for padding */}
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
                                        ${isSelected ? 'ring-2 ring-red-500 ring-offset-2 z-10' : ''}
                                        ${isPast && !hasBooking ? 'bg-slate-50 text-slate-300 border-transparent cursor-default' : 
                                          hasBooking 
                                            ? 'bg-white border-slate-200 hover:border-red-300 shadow-sm' 
                                            : 'bg-emerald-50 border-emerald-100 hover:bg-emerald-100 text-emerald-700 hover:shadow-md'
                                        }
                                    `}
                                >
                                    <span className={`text-sm font-bold ${isToday ? 'bg-red-600 text-white w-6 h-6 rounded-full flex items-center justify-center' : ''}`}>
                                        {day}
                                    </span>
                                    
                                    {hasBooking ? (
                                        <div className="flex space-x-0.5 mt-1">
                                            {reqs.slice(0, 3).map((_, idx) => (
                                                <div key={idx} className="w-1.5 h-1.5 rounded-full bg-red-400"></div>
                                            ))}
                                            {reqs.length > 3 && <div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div>}
                                        </div>
                                    ) : (
                                        !isPast && <span className="text-[10px] font-medium mt-1 text-emerald-600/70">Kosong</span>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>
                
                {/* Legend */}
                <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex gap-4 text-xs font-medium text-slate-600">
                    <div className="flex items-center"><div className="w-3 h-3 rounded-full bg-emerald-100 border border-emerald-200 mr-2"></div> Kosong (Tersedia)</div>
                    <div className="flex items-center"><div className="w-3 h-3 rounded-full bg-white border border-slate-200 mr-2 relative flex justify-center items-center"><div className="w-1 h-1 bg-red-400 rounded-full"></div></div> Terjadwal</div>
                    <div className="flex items-center"><div className="w-3 h-3 rounded-full bg-red-600 mr-2"></div> Hari Ini</div>
                </div>
            </div>
        </div>

        {/* RIGHT COLUMN: LIST DETAILS (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
            <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 p-6 min-h-[500px]">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h3 className="text-lg font-bold text-slate-800">
                            {selectedDate 
                                ? `Jadwal: ${selectedDate.toLocaleDateString('id-ID', {weekday: 'long', day: 'numeric', month: 'long'})}` 
                                : 'Semua Jadwal Mendatang'}
                        </h3>
                        {selectedDate && (
                            <button onClick={() => setSelectedDate(null)} className="text-xs text-red-600 font-bold hover:underline">
                                Tampilkan Semua
                            </button>
                        )}
                    </div>
                    {isLoggedIn && selectedDate && (
                         <button onClick={() => { setIsAdding(true); }} className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors" title="Tambah di tanggal ini">
                            <Plus className="w-5 h-5" />
                         </button>
                    )}
                </div>

                <div className="space-y-4 max-h-[600px] overflow-y-auto custom-scrollbar pr-2">
                    {filteredList.length === 0 ? (
                        <div className="text-center py-12 border-2 border-dashed border-slate-100 rounded-2xl">
                            <CalendarIcon className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                            <p className="text-slate-500 font-medium">Tidak ada jadwal pada periode ini.</p>
                            {selectedDate && !isLoggedIn && (
                                <p className="text-emerald-600 text-sm font-bold mt-2">Kendaraan Tersedia ✅</p>
                            )}
                        </div>
                    ) : (
                        filteredList.map((req) => (
                            <div key={req.id} className="p-4 rounded-2xl border border-slate-100 hover:border-red-200 hover:shadow-md transition-all bg-white group">
                                <div className="flex justify-between items-start mb-2">
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
                                
                                <h4 className="font-bold text-slate-900 leading-tight mb-1">Ke: {req.destination}</h4>
                                <div className="text-xs text-slate-500 flex items-center mb-3">
                                    <Users className="w-3 h-3 mr-1" /> {req.requesterName} ({req.participantCount} pax)
                                </div>
                                
                                <p className="text-sm text-slate-600 bg-slate-50 p-2 rounded-lg italic">
                                    "{req.description}"
                                </p>

                                {/* Admin Actions */}
                                {isLoggedIn && req.status === RequestStatus.PENDING && (
                                    <div className="mt-3 pt-3 border-t border-slate-50 flex gap-2">
                                        <button onClick={() => onStatusChange(req.id, RequestStatus.IN_PROGRESS)} className="flex-1 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700">
                                            Setujui
                                        </button>
                                        <button onClick={() => onStatusChange(req.id, RequestStatus.REJECTED)} className="px-3 py-1.5 bg-red-100 text-red-600 text-xs font-bold rounded-lg hover:bg-red-200">
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
               <div className="px-8 py-6 bg-red-50 border-b border-red-100 flex justify-between items-center sticky top-0 z-10">
                  <h3 className="text-xl font-bold text-red-900 flex items-center">
                     <Car className="w-6 h-6 mr-2" /> Input Penggunaan Kendaraan
                  </h3>
                  <button onClick={() => setIsAdding(false)} className="p-2 rounded-full hover:bg-red-200/50 transition-colors text-red-700">
                    <X className="h-6 w-6" />
                  </button>
               </div>
               
               <form onSubmit={handleSubmit} className="p-8 space-y-6">
                  
                  {/* Schedule Section */}
                  <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                     <h4 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider mb-4 flex items-center">
                        <Clock className="w-4 h-4 mr-2 text-slate-500" /> Jadwal & Ketersediaan
                     </h4>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                           <label className="block text-sm font-bold text-black mb-1">Tanggal & Jam Penggunaan</label>
                           <input 
                              required 
                              type="datetime-local" 
                              className="w-full rounded-xl border-slate-300 bg-white text-black px-4 py-3 focus:ring-2 focus:ring-red-500 outline-none" 
                              value={formState.scheduleDate} 
                              onChange={e => setFormState({...formState, scheduleDate: e.target.value})} 
                           />
                        </div>
                        <div>
                           <label className="block text-sm font-bold text-black mb-1">Status Tanggal (Cek)</label>
                           <div className={`w-full rounded-xl border px-4 py-3 text-sm flex items-center min-h-[46px] ${
                              !formState.scheduleDate ? 'bg-slate-100 border-slate-200 text-slate-400' :
                              existingSchedules.length > 0 ? 'bg-amber-50 border-amber-200 text-amber-700' : 'bg-emerald-50 border-emerald-200 text-emerald-700'
                           }`}>
                              {!formState.scheduleDate ? (
                                 <span>Pilih tanggal dahulu</span>
                              ) : existingSchedules.length > 0 ? (
                                 <span className="flex items-center font-bold"><AlertTriangle className="w-4 h-4 mr-2" /> Ada {existingSchedules.length} jadwal lain</span>
                              ) : (
                                 <span className="flex items-center font-bold"><Check className="w-4 h-4 mr-2" /> Kendaraan Tersedia</span>
                              )}
                           </div>
                        </div>
                     </div>
                     {/* Show existing schedules if any */}
                     {existingSchedules.length > 0 && (
                        <div className="mt-3 text-xs text-amber-700 bg-amber-50 p-3 rounded-lg">
                           <p className="font-bold mb-1">Jadwal pada tanggal ini:</p>
                           <ul className="list-disc list-inside space-y-0.5">
                              {existingSchedules.map(s => (
                                 <li key={s.id}>{new Date(s.scheduleDate!).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - {s.destination} ({s.requesterName})</li>
                              ))}
                           </ul>
                        </div>
                     )}
                  </div>

                  {/* Trip Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div className="md:col-span-2">
                        <label className="block text-sm font-bold text-black mb-1">Tujuan Acara / Keperluan</label>
                        <textarea 
                           required 
                           rows={2} 
                           className="w-full rounded-xl border-slate-300 bg-white text-black px-4 py-3 outline-none resize-none focus:ring-2 focus:ring-red-500" 
                           placeholder="Jelaskan keperluan perjalanan dinas..." 
                           value={formState.description} 
                           onChange={e => setFormState({...formState, description: e.target.value})}
                        ></textarea>
                     </div>
                     <div>
                        <label className="block text-sm font-bold text-black mb-1">Tempat Tujuan (Kota/Lokasi)</label>
                        <input 
                           required 
                           type="text" 
                           className="w-full rounded-xl border-slate-300 bg-white text-black px-4 py-3 focus:ring-2 focus:ring-red-500 outline-none" 
                           placeholder="Contoh: Kantor Cabang Bandung"
                           value={formState.destination} 
                           onChange={e => setFormState({...formState, destination: e.target.value})} 
                        />
                     </div>
                     <div>
                        <label className="block text-sm font-bold text-black mb-1">Kapasitas Penumpang</label>
                        <input 
                           required 
                           type="number" 
                           className="w-full rounded-xl border-slate-300 bg-white text-black px-4 py-3 focus:ring-2 focus:ring-red-500 outline-none" 
                           