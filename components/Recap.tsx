
import React, { useState } from 'react';
import { ServiceRequest, ServiceCategory, RequestStatus } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { FileDown, FileSpreadsheet, FileText, Filter, Wrench, Building2, Car } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

interface RecapProps {
  requests: ServiceRequest[];
}

type TabType = 'MAINTENANCE' | 'BUILDING' | 'VEHICLE';

export const Recap: React.FC<RecapProps> = ({ requests }) => {
  const [activeTab, setActiveTab] = useState<TabType>('MAINTENANCE');

  // --- DATA PROCESSING ---
  const categoryData = Object.values(ServiceCategory).map(cat => {
    return {
      name: cat.split(' ').slice(0, 2).join(' '), 
      count: requests.filter(r => r.category === cat).length
    };
  });

  const statusData = Object.values(RequestStatus).map(stat => {
    return {
      name: stat,
      value: requests.filter(r => r.status === stat).length
    };
  });

  // Grouping Requests
  const buildingRequests = requests.filter(r => r.category === ServiceCategory.GEDUNG);
  const vehicleRequests = requests.filter(r => r.category === ServiceCategory.KENDARAAN);
  const maintenanceRequests = requests.filter(r => r.category !== ServiceCategory.GEDUNG && r.category !== ServiceCategory.KENDARAAN);

  const COLORS = ['#F59E0B', '#3B82F6', '#10B981', '#EF4444'];

  const getCurrentData = () => {
      switch(activeTab) {
          case 'BUILDING': return buildingRequests;
          case 'VEHICLE': return vehicleRequests;
          default: return maintenanceRequests;
      }
  };

  // --- EXPORT FUNCTIONS ---

  const handleExportPDF = () => {
    const doc = new jsPDF();

    // Header
    doc.setFontSize(18);
    doc.text('Laporan Rekapitulasi SIPETER', 14, 20);
    doc.setFontSize(10);
    doc.text(`Dicetak pada: ${new Date().toLocaleString('id-ID')}`, 14, 26);

    let finalY = 30;

    // --- Table 1: Pemeliharaan ---
    doc.setFontSize(14);
    doc.text('1. Laporan Pemeliharaan (Maintenance)', 14, finalY + 10);
    autoTable(doc, {
        startY: finalY + 15,
        head: [['Tgl', 'Kategori', 'Pemohon', 'Lokasi', 'Masalah', 'Status']],
        body: maintenanceRequests.map(r => [
            new Date(r.date).toLocaleDateString('id-ID'),
            r.category,
            r.requesterName,
            r.location,
            r.description,
            r.status
        ]),
        theme: 'grid',
        headStyles: { fillColor: [59, 130, 246] } // Blue
    });
    finalY = (doc as any).lastAutoTable.finalY;

    // --- Table 2: Gedung ---
    if (finalY > 250) { doc.addPage(); finalY = 20; }
    doc.text('2. Laporan Penggunaan Gedung', 14, finalY + 15);
    autoTable(doc, {
        startY: finalY + 20,
        head: [['Jadwal', 'Gedung', 'Kegiatan', 'Pemohon', 'Peserta', 'Status']],
        body: buildingRequests.map(r => [
            r.scheduleDate ? new Date(r.scheduleDate).toLocaleString('id-ID') : '-',
            r.location,
            r.activityName || '-',
            r.requesterName,
            r.participantCount || '-',
            r.status
        ]),
        theme: 'grid',
        headStyles: { fillColor: [16, 185, 129] } // Emerald
    });
    finalY = (doc as any).lastAutoTable.finalY;

    // --- Table 3: Kendaraan ---
    if (finalY > 250) { doc.addPage(); finalY = 20; }
    doc.text('3. Laporan Penggunaan Kendaraan', 14, finalY + 15);
    autoTable(doc, {
        startY: finalY + 20,
        head: [['Jadwal', 'Tujuan', 'Keperluan', 'Pemohon', 'Penumpang', 'Status']],
        body: vehicleRequests.map(r => [
            r.scheduleDate ? new Date(r.scheduleDate).toLocaleString('id-ID') : '-',
            r.destination || '-',
            r.description,
            r.requesterName,
            r.participantCount || '-',
            r.status
        ]),
        theme: 'grid',
        headStyles: { fillColor: [239, 68, 68] } // Red
    });

    doc.save(`Laporan_SIPETER_${new Date().toISOString().slice(0,10)}.pdf`);
  };

  const handleExportExcel = () => {
    const wb = XLSX.utils.book_new();

    // Sheet 1: Maintenance
    const wsMaintenance = XLSX.utils.json_to_sheet(maintenanceRequests.map(r => ({
        Tanggal_Input: new Date(r.date).toLocaleDateString('id-ID'),
        Kategori: r.category,
        Pemohon: r.requesterName,
        Lokasi: r.location,
        Masalah: r.description,
        Prioritas: r.priority,
        Status: r.status
    })));
    XLSX.utils.book_append_sheet(wb, wsMaintenance, "Pemeliharaan");

    // Sheet 2: Gedung
    const wsBuilding = XLSX.utils.json_to_sheet(buildingRequests.map(r => ({
        Jadwal_Pakai: r.scheduleDate ? new Date(r.scheduleDate).toLocaleString('id-ID') : '-',
        Gedung: r.location,
        Kegiatan: r.activityName,
        Pemohon: r.requesterName,
        Jumlah_Peserta: r.participantCount,
        Keterangan: r.description,
        Status: r.status
    })));
    XLSX.utils.book_append_sheet(wb, wsBuilding, "Gedung");

    // Sheet 3: Kendaraan
    const wsVehicle = XLSX.utils.json_to_sheet(vehicleRequests.map(r => ({
        Jadwal_Berangkat: r.scheduleDate ? new Date(r.scheduleDate).toLocaleString('id-ID') : '-',
        Tujuan: r.destination,
        Keperluan: r.description,
        Pemohon: r.requesterName,
        Penumpang: r.participantCount,
        Status: r.status
    })));
    XLSX.utils.book_append_sheet(wb, wsVehicle, "Kendaraan");

    XLSX.writeFile(wb, `Laporan_SIPETER_${new Date().toISOString().slice(0,10)}.xlsx`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pt-24 min-h-screen bg-slate-50">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
        <div>
           <h2 className="text-4xl font-extrabold text-slate-900">Analitik & Laporan</h2>
           <p className="text-slate-500 mt-2">Visualisasi data dan ekspor laporan kinerja.</p>
        </div>
        <div className="flex space-x-3">
             <button onClick={handleExportPDF} className="flex items-center px-4 py-2 bg-slate-800 text-white rounded-xl hover:bg-slate-900 shadow-lg shadow-slate-900/20 transition-all font-bold text-sm">
                <FileText className="w-4 h-4 mr-2" /> Export PDF
             </button>
             <button onClick={handleExportExcel} className="flex items-center px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 shadow-lg shadow-green-600/20 transition-all font-bold text-sm">
                <FileSpreadsheet className="w-4 h-4 mr-2" /> Export Excel
             </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Card 1: By Category */}
        <div className="bg-white p-6 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Volume per Kategori</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#e2e8f0" />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" width={100} tick={{fontSize: 10, fill: '#64748b'}} interval={0} />
                <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{ borderRadius: '12px' }} />
                <Bar dataKey="count" fill="#6366f1" radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Card 2: By Status */}
        <div className="bg-white p-6 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Distribusi Status</h3>
          <div className="h-64 w-full flex items-center justify-center relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={statusData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '12px' }} />
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none pb-8">
                <div className="text-center">
                   <span className="text-2xl font-bold text-slate-800 block">{requests.length}</span>
                   <span className="text-[10px] text-slate-400 uppercase tracking-wider">Total Tiket</span>
                </div>
             </div>
          </div>
        </div>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        {[
          { label: 'Total Tiket', value: requests.length, color: 'bg-blue-600', subColor: 'bg-blue-500' },
          { label: 'Pending', value: requests.filter(r => r.status === RequestStatus.PENDING).length, color: 'bg-amber-500', subColor: 'bg-amber-400' },
          { label: 'Selesai', value: requests.filter(r => r.status === RequestStatus.COMPLETED).length, color: 'bg-emerald-500', subColor: 'bg-emerald-400' },
          { label: 'Aset', value: buildingRequests.length + vehicleRequests.length, color: 'bg-violet-600', subColor: 'bg-violet-500' }
        ].map((stat, idx) => (
          <div key={idx} className={`${stat.color} rounded-2xl p-5 text-white shadow-lg relative overflow-hidden group`}>
             <div className={`absolute -right-4 -top-4 w-20 h-20 rounded-full ${stat.subColor} opacity-50`}></div>
             <div className="relative z-10">
                <div className="text-3xl font-extrabold mb-1">{stat.value}</div>
                <div className="text-xs font-medium opacity-90">{stat.label}</div>
             </div>
          </div>
        ))}
      </div>

      {/* DETAILED DATA TABLE SECTION */}
      <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <h3 className="text-lg font-bold text-slate-800 flex items-center">
                  <Filter className="w-5 h-5 mr-2 text-slate-400" /> Detail Data & Arsip
              </h3>
              
              {/* Tabs */}
              <div className="flex p-1 bg-slate-100 rounded-xl">
                  <button 
                    onClick={() => setActiveTab('MAINTENANCE')}
                    className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center ${activeTab === 'MAINTENANCE' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    <Wrench className="w-3.5 h-3.5 mr-2" /> Pemeliharaan
                  </button>
                  <button 
                    onClick={() => setActiveTab('BUILDING')}
                    className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center ${activeTab === 'BUILDING' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    <Building2 className="w-3.5 h-3.5 mr-2" /> Gedung
                  </button>
                  <button 
                    onClick={() => setActiveTab('VEHICLE')}
                    className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center ${activeTab === 'VEHICLE' ? 'bg-white text-red-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    <Car className="w-3.5 h-3.5 mr-2" /> Kendaraan
                  </button>
              </div>
          </div>

          <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-100">
                  <thead className="bg-slate-50">
                      <tr>
                          <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Tgl / Jadwal</th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">
                              {activeTab === 'MAINTENANCE' ? 'Kategori & Masalah' : activeTab === 'BUILDING' ? 'Gedung & Kegiatan' : 'Tujuan & Keperluan'}
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Pemohon</th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Detail</th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
                      </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-100">
                      {getCurrentData().length === 0 ? (
                          <tr><td colSpan={5} className="px-6 py-10 text-center text-slate-400 text-sm">Tidak ada data arsip.</td></tr>
                      ) : (
                          getCurrentData().map(req => (
                              <tr key={req.id} className="hover:bg-slate-50 transition-colors">
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                                      {req.scheduleDate 
                                        ? new Date(req.scheduleDate).toLocaleString('id-ID', {day: 'numeric', month: 'short', hour: '2-digit', minute:'2-digit'}) 
                                        : new Date(req.date).toLocaleDateString('id-ID', {day: 'numeric', month: 'short', year: 'numeric'})}
                                  </td>
                                  <td className="px-6 py-4">
                                      {activeTab === 'MAINTENANCE' && (
                                          <div>
                                              <div className="text-xs font-bold text-slate-500 uppercase">{req.category}</div>
                                              <div className="text-sm font-semibold text-slate-800 line-clamp-1">{req.description}</div>
                                          </div>
                                      )}
                                      {activeTab === 'BUILDING' && (
                                          <div>
                                              <div className="text-sm font-bold text-emerald-700">{req.location}</div>
                                              <div className="text-xs text-slate-500">{req.activityName}</div>
                                          </div>
                                      )}
                                      {activeTab === 'VEHICLE' && (
                                          <div>
                                              <div className="text-sm font-bold text-red-700">Ke: {req.destination}</div>
                                              <div className="text-xs text-slate-500 line-clamp-1">{req.description}</div>
                                          </div>
                                      )}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700 font-medium">
                                      {req.requesterName}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-500">
                                      {activeTab === 'MAINTENANCE' && <span>{req.location}</span>}
                                      {activeTab === 'BUILDING' && <span>{req.participantCount} Peserta</span>}
                                      {activeTab === 'VEHICLE' && <span>{req.participantCount} Penumpang</span>}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                      <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
                                          req.status === RequestStatus.COMPLETED ? 'bg-green-100 text-green-700' :
                                          req.status === RequestStatus.IN_PROGRESS ? 'bg-blue-100 text-blue-700' :
                                          req.status === RequestStatus.REJECTED ? 'bg-red-100 text-red-700' :
                                          'bg-amber-100 text-amber-700'
                                      }`}>
                                          {req.status}
                                      </span>
                                  </td>
                              </tr>
                          ))
                      )}
                  </tbody>
              </table>
          </div>
      </div>
    </div>
  );
};
