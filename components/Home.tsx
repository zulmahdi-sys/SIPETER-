
import React, { useState, useEffect } from 'react';
import { ServiceCategory, ServiceRequest, RequestStatus, Announcement } from '../types';
import { Droplet, Zap, Snowflake, Car, Building2, Trash2, CheckCircle, ArrowRight, Activity, Clock, Search, Filter, Calendar, Users, Megaphone, Bell } from 'lucide-react';

interface HomeProps {
  requests: ServiceRequest[];
  announcements?: Announcement[];
}

const services = [
  { id: ServiceCategory.AIR_BERSIH, icon: Droplet, color: 'text-blue-400', gradient: 'from-blue-500 to-cyan-400', desc: 'Pemeliharaan Air Bersih' },
  { id: ServiceCategory.AIR_KOTOR, icon: Trash2, color: 'text-amber-500', gradient: 'from-amber-500 to-orange-400', desc: 'Sanitasi & Air Kotor' },
  { id: ServiceCategory.LISTRIK, icon: Zap, color: 'text-yellow-400', gradient: 'from-yellow-400 to-orange-500', desc: 'Jaringan Kelistrikan' },
  { id: ServiceCategory.AC, icon: Snowflake, color: 'text-cyan-400', gradient: 'from-cyan-400 to-blue-500', desc: 'Pendingin Ruangan' },
  { id: ServiceCategory.KENDARAAN, icon: Car, color: 'text-red-400', gradient: 'from-red-500 to-pink-500', desc: 'Kendaraan Dinas' },
  { id: ServiceCategory.GEDUNG, icon: Building2, color: 'text-emerald-400', gradient: 'from-emerald-500 to-green-400', desc: 'Gedung & Aula' },
];

export const Home: React.FC<HomeProps> = ({ requests, announcements = [] }) => {
  const [selectedCategory, setSelectedCategory] = useState<ServiceCategory | 'All'>('All');
  const [currentSlide, setCurrentSlide] = useState(0);
  
  // Filter active requests
  const displayRequests = requests.filter(r => {
    const isPublicVisible = r.status !== RequestStatus.REJECTED;
    const isCategoryMatch = selectedCategory === 'All' || r.category === selectedCategory;
    return isPublicVisible && isCategoryMatch;
  });

  // Sort: In Progress first, then Pending, then Completed
  displayRequests.sort((a, b) => {
    const statusOrder = { [RequestStatus.IN_PROGRESS]: 1, [RequestStatus.PENDING]: 2, [RequestStatus.COMPLETED]: 3, [RequestStatus.REJECTED]: 4 };
    return statusOrder[a.status] - statusOrder[b.status];
  });

  // Filter Agenda Items (Gedung & Kendaraan with future dates)
  const agendaItems = requests
    .filter(r => (r.category === ServiceCategory.GEDUNG || r.category === ServiceCategory.KENDARAAN) && r.status !== RequestStatus.REJECTED && r.scheduleDate)
    .sort((a, b) => new Date(a.scheduleDate!).getTime() - new Date(b.scheduleDate!).getTime())
    .filter(r => new Date(r.scheduleDate!) >= new Date(new Date().setHours(0,0,0,0)));

  useEffect(() => {
    if (agendaItems.length === 0) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % agendaItems.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [agendaItems.length]);

  return (
    <div className="bg-slate-50 min-h-screen pb-12 overflow-hidden relative">
      
      {/* Dynamic Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-32 left-1/3 w-96 h-96 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>

      {/* Hero Section 3D */}
      <div className="relative pt-24 pb-10 mb-4 z-10">
        
        {/* Running Text / Announcement Bar */}
        {announcements.length > 0 && (
          <div className="w-full bg-slate-900 text-white overflow-hidden py-2.5 relative z-20 shadow-md mb-8">
            <div className="max-w-7xl mx-auto flex items-center px-4 relative">
               <div className="flex items-center bg-red-600 px-3 py-1 rounded-md mr-4 z-10 shadow-lg">
                  <Bell className="w-4 h-4 mr-2 animate-bounce" />
                  <span className="text-xs font-bold uppercase tracking-wider">Info</span>
               </div>
               <div className="flex-1 overflow-hidden relative">
                  <div className="animate-marquee inline-block whitespace-nowrap pl-[100%]">
                     {announcements.map((ann, idx) => (
                        <span key={ann.id} className="mr-20 text-sm font-medium tracking-wide">
                           {ann.text} <span className="text-slate-500 mx-2">|</span>
                        </span>
                     ))}
                  </div>
               </div>
            </div>
          </div>
        )}

        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="text-left space-y-6">
            <div className="inline-block px-4 py-1.5 rounded-full bg-blue-100 border border-blue-200 text-blue-700 font-semibold text-sm shadow-sm">
              📢 Informasi Publik
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 leading-tight tracking-tight">
              Monitoring <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Kinerja & Perbaikan</span>
            </h1>
            <p className="text-xl text-slate-600 max-w-lg leading-relaxed">
              Portal transparansi kegiatan pemeliharaan fasilitas. Pantau status pengerjaan, penggunaan aset, dan perbaikan secara real-time.
            </p>
            
            {/* Agenda Slider - Sub Header Integration */}
            {agendaItems.length > 0 && (
               <div className="mt-8 relative w-full max-w-lg">
                  <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur opacity-20"></div>
                  <div className="relative bg-white/80 backdrop-blur-md border border-white/50 rounded-xl p-4 shadow-xl overflow-hidden min-h-[100px] flex items-center">
                      <div className="flex items-center w-full">
                         <div className="mr-4 flex-shrink-0">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg">
                               <Megaphone className="w-6 h-6 animate-pulse" />
                            </div>
                         </div>
                         <div className="flex-1 overflow-hidden relative h-16">
                            {agendaItems.map((item, idx) => (
                               <div 
                                 key={item.id}
                                 className={`absolute inset-0 transition-all duration-700 ease-in-out flex flex-col justify-center ${
                                    idx === currentSlide 
                                    ? 'opacity-100 translate-y-0' 
                                    : 'opacity-0 translate-y-8'
                                 }`}
                               >
                                  <div className="text-xs font-bold text-indigo-600 uppercase tracking-wide flex items-center mb-0.5">
                                     <Calendar className="w-3 h-3 mr-1" />
                                     {new Date(item.scheduleDate!).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })}
                                     <span className="mx-1.5">•</span>
                                     <Clock className="w-3 h-3 mr-1" />
                                     {new Date(item.scheduleDate!).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                                  </div>
                                  <h3 className="font-bold text-slate-900 text-sm md:text-base truncate leading-tight">
                                     {item.category === ServiceCategory.GEDUNG ? item.activityName : `Perjalanan Dinas ke ${item.destination}`}
                                  </h3>
                                  <p className="text-xs text-slate-500 truncate mt-0.5">
                                     {item.category === ServiceCategory.GEDUNG ? item.location : item.description}
                                  </p>
                               </div>
                            ))}
                         </div>
                         
                         {/* Indicators */}
                         <div className="absolute bottom-2 right-2 flex space-x-1">
                            {agendaItems.slice(0, 5).map((_, idx) => (
                               <div 
                                 key={idx} 
                                 className={`w-1.5 h-1.5 rounded-full transition-colors ${idx === currentSlide % 5 ? 'bg-indigo-600' : 'bg-slate-300'}`}
                               ></div>
                            ))}
                         </div>
                      </div>
                  </div>
               </div>
            )}

            <div className="flex space-x-4 pt-4">
              <button onClick={() => document.getElementById('monitor')?.scrollIntoView({behavior: 'smooth'})} className="px-8 py-4 rounded-full bg-blue-600 text-white font-bold shadow-lg shadow-blue-500/40 hover:bg-blue-700 hover:shadow-blue-600/50 hover:-translate-y-1 transition-all duration-300 flex items-center">
                Lihat Data Pekerjaan <ArrowRight className="ml-2 w-5 h-5" />
              </button>
            </div>
          </div>

          {/* 3D Visual Illustration */}
          <div className="relative h-[400px] w-full hidden lg:block perspective-1000">
            <div className="absolute inset-0 flex items-center justify-center animate-float">
               {/* Central Hub */}
               <div className="w-48 h-48 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-3xl transform rotate-12 shadow-2xl shadow-blue-600/40 z-20 flex items-center justify-center border-t border-l border-white/20">
                  <Activity className="w-24 h-24 text-white opacity-90" />
               </div>
               
               {/* Floating Elements */}
               <div className="absolute -top-12 -right-4 w-24 h-24 bg-white rounded-2xl shadow-xl z-30 flex items-center justify-center animate-float-delayed backdrop-blur-md bg-opacity-80 border border-white/40">
                  <Clock className="w-10 h-10 text-blue-500" />
               </div>
               <div className="absolute -bottom-8 -left-8 w-28 h-28 bg-white rounded-2xl shadow-xl z-30 flex items-center justify-center animate-float-delayed animation-delay-2000 backdrop-blur-md bg-opacity-80 border border-white/40">
                  <CheckCircle className="w-12 h-12 text-green-500" />
               </div>
            </div>
          </div>
        </div>
      </div>

      <div id="monitor" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8">
           <div>
              <h2 className="text-3xl font-bold text-slate-900 mb-2">Daftar Pekerjaan & Fasilitas</h2>
              <div className="w-20 h-1.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
           </div>
           <div className="mt-4 md:mt-0 flex items-center bg-white rounded-full px-4 py-2 border border-slate-200 shadow-sm">
              <Filter className="w-4 h-4 text-slate-400 mr-2" />
              <select 
                className="bg-transparent border-none text-sm font-medium text-slate-700 focus:ring-0 cursor-pointer"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value as any)}
              >
                <option value="All">Semua Kategori</option>
                {Object.values(ServiceCategory).map(c => <option key={c} value={c}>{c}</option>)}
              </select>
           </div>
        </div>

        {/* Category Filter Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-10">
          {services.map((service) => (
            <div 
              key={service.id}
              onClick={() => setSelectedCategory(service.id === selectedCategory ? 'All' : service.id)}
              className={`relative rounded-xl p-4 cursor-pointer transition-all duration-300 border ${
                selectedCategory === service.id 
                ? 'bg-blue-600 text-white shadow-lg scale-105 border-blue-600' 
                : 'bg-white text-slate-600 shadow-sm hover:shadow-md border-slate-100 hover:border-blue-200'
              }`}
            >
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${selectedCategory === service.id ? 'bg-white/20 text-white' : 'bg-slate-100 ' + service.color}`}>
                <service.icon className="h-6 w-6" />
              </div>
              <div className="text-xs font-bold leading-tight">{service.id}</div>
            </div>
          ))}
        </div>

        {/* Status Lists */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Column 1: In Progress & Pending */}
          <div className="lg:col-span-2 space-y-6">
             <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                <h3 className="text-xl font-bold text-slate-800">Sedang Dikerjakan / Pending</h3>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {displayRequests.filter(r => r.status === RequestStatus.IN_PROGRESS || r.status === RequestStatus.PENDING).length === 0 && (
                   <div className="col-span-full bg-white rounded-2xl p-8 text-center border border-dashed border-slate-300">
                      <p className="text-slate-500">Tidak ada pekerjaan aktif saat ini.</p>
                   </div>
                )}
                
                {displayRequests.filter(r => r.status === RequestStatus.IN_PROGRESS || r.status === RequestStatus.PENDING).map((req) => (
                   <div key={req.id} className="bg-white rounded-2xl p-6 shadow-lg shadow-slate-200/50 border border-slate-100 relative overflow-hidden group hover:-translate-y-1 transition-transform">
                      {/* Status Strip */}
                      <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${req.status === RequestStatus.IN_PROGRESS ? 'bg-blue-500' : 'bg-amber-400'}`}></div>
                      
                      <div className="flex justify-between items-start mb-4 pl-3">
                         <div className="inline-flex items-center space-x-2">
                            {services.find(s => s.id === req.category)?.icon && React.createElement(services.find(s => s.id === req.category)!.icon, { className: "w-5 h-5 text-slate-400" })}
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{req.category}</span>
                         </div>
                         <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide ${
                            req.status === RequestStatus.IN_PROGRESS ? 'bg-blue-50 text-blue-600' : 'bg-amber-50 text-amber-600'
                         }`}>
                           {req.status}
                         </span>
                      </div>

                      {/* Display Specific Info based on Category */}
                      {req.category === ServiceCategory.GEDUNG && req.activityName ? (
                         <div className="pl-3 mb-2">
                            <h4 className="text-lg font-bold text-slate-900 leading-tight">{req.activityName}</h4>
                            <p className="text-xs text-emerald-600 font-semibold mt-1">Oleh: {req.requesterName}</p>
                         </div>
                      ) : req.category === ServiceCategory.KENDARAAN ? (
                         <div className="pl-3 mb-2">
                            <h4 className="text-lg font-bold text-slate-900 leading-tight">Ke: {req.destination || 'Tujuan Umum'}</h4>
                            <div className="inline-flex items-center mt-1 bg-red-50 px-2 py-1 rounded text-red-600">
                               <Users className="w-3 h-3 mr-1.5" /> 
                               <span className="text-xs font-bold">Pemohon: {req.requesterName}</span>
                            </div>
                         </div>
                      ) : (
                         <h4 className="text-lg font-bold text-slate-900 mb-2 pl-3">{req.location}</h4>
                      )}

                      {/* Description / Activity */}
                      <div className="pl-3 mb-4">
                        {(req.category === ServiceCategory.KENDARAAN || req.category === ServiceCategory.GEDUNG) && (
                          <span className="block text-[10px] font-bold text-slate-400 uppercase mb-0.5">
                             Kegiatan / Keperluan:
                          </span>
                        )}
                        <p className="text-slate-600 text-sm line-clamp-2" title={req.description}>
                           {req.description}
                        </p>
                      </div>
                      
                      {/* Schedule / Detail Footer */}
                      <div className="flex flex-wrap items-center justify-between pl-3 pt-4 border-t border-slate-50 text-xs text-slate-500 gap-2">
                         {req.scheduleDate ? (
                            <div className="flex items-center bg-blue-50 px-2 py-1 rounded-md text-blue-700 font-semibold">
                               <Calendar className="w-3.5 h-3.5 mr-1" />
                               {new Date(req.scheduleDate).toLocaleString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute:'2-digit' })}
                            </div>
                         ) : (
                            <div className="flex items-center">
                              <Clock className="w-3.5 h-3.5 mr-1" />
                              {new Date(req.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long' })}
                            </div>
                         )}

                         {req.participantCount && req.participantCount > 0 && (
                            <div className="flex items-center bg-slate-100 px-2 py-1 rounded-md">
                               <Users className="w-3.5 h-3.5 mr-1" /> {req.participantCount} Orang
                            </div>
                         )}
                      </div>
                   </div>
                ))}
             </div>
          </div>

          {/* Column 2: Completed (History) */}
          <div>
             <div className="flex items-center space-x-2 mb-6">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <h3 className="text-xl font-bold text-slate-800">Selesai / Terjadwal</h3>
             </div>

             <div className="bg-white rounded-3xl p-2 shadow-xl shadow-slate-200/50 border border-slate-100 max-h-[600px] overflow-y-auto custom-scrollbar">
                {displayRequests.filter(r => r.status === RequestStatus.COMPLETED).length === 0 && (
                   <div className="p-8 text-center">
                      <p className="text-slate-400 text-sm">Belum ada riwayat pekerjaan selesai.</p>
                   </div>
                )}

                {displayRequests.filter(r => r.status === RequestStatus.COMPLETED).map((req) => (
                   <div key={req.id} className="p-4 hover:bg-slate-50 rounded-2xl transition-colors border-b border-slate-50 last:border-0">
                      <div className="flex justify-between items-start">
                         <div>
                            <div className="flex items-center text-xs text-slate-400 mb-1">
                               <CheckCircle className="w-3 h-3 mr-1 text-green-500" />
                               <span>{new Date(req.date).toLocaleDateString()}</span>
                            </div>
                            <h5 className="font-bold text-slate-800 text-sm">
                               {req.category === ServiceCategory.GEDUNG && req.activityName ? req.activityName : req.category === ServiceCategory.KENDARAAN && req.destination ? `Ke: ${req.destination}` : req.location}
                            </h5>
                            <p className="text-xs text-slate-500 mt-1 line-clamp-1">
                               {req.category === ServiceCategory.KENDARAAN ? `${req.requesterName} - ` : ''} 
                               {req.description}
                            </p>
                         </div>
                         <div className={`w-2 h-2 rounded-full mt-1.5 ${
                            req.category === ServiceCategory.LISTRIK ? 'bg-yellow-400' :
                            req.category === ServiceCategory.AIR_BERSIH ? 'bg-blue-400' :
                            'bg-slate-300'
                         }`}></div>
                      </div>
                   </div>
                ))}
             </div>
             
             {/* Stats Summary Small */}
             <div className="mt-6 bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 text-white shadow-lg">
                <h4 className="text-sm font-semibold opacity-80 mb-4">Total Kinerja Bulan Ini</h4>
                <div className="flex justify-between items-end">
                   <div>
                      <div className="text-3xl font-bold">{requests.filter(r => r.status === RequestStatus.COMPLETED).length}</div>
                      <div className="text-xs opacity-60">Pekerjaan Selesai</div>
                   </div>
                   <div className="text-right">
                      <div className="text-3xl font-bold text-blue-400">{requests.filter(r => r.status === RequestStatus.IN_PROGRESS).length}</div>
                      <div className="text-xs opacity-60">Sedang Berjalan</div>
                   </div>
                </div>
             </div>
          </div>

        </div>
      </div>
    </div>
  );
};
