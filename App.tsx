
import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { Home } from './components/Home';
import { About } from './components/About';
import { Login } from './components/Login';
import { Dashboard } from './components/Dashboard';
import { Recap } from './components/Recap';
import { VehicleUsage } from './components/VehicleUsage';
import { BuildingUsage } from './components/BuildingUsage';
import { ViewState, ServiceRequest, RequestStatus, ServiceCategory, Announcement } from './types';

// Mock Data
const INITIAL_REQUESTS: ServiceRequest[] = [
  { 
    id: '1', 
    category: ServiceCategory.AC, 
    requesterName: 'Budi Santoso', 
    location: 'R. Server Lt. 2', 
    description: 'AC bocor menetes ke rak server', 
    date: '2023-10-25T10:00:00', 
    status: RequestStatus.PENDING, 
    priority: 'High' 
  },
  { 
    id: '2', 
    category: ServiceCategory.GEDUNG, 
    requesterName: 'Divisi Humas', 
    location: 'Aula Utama', 
    description: 'Persiapan Rapat Umum Pemegang Saham', 
    activityName: 'Rapat Umum Pemegang Saham (RUPS)',
    participantCount: 150,
    scheduleDate: '2023-11-15T09:00:00',
    date: '2023-10-24T14:30:00', 
    status: RequestStatus.IN_PROGRESS, 
    priority: 'High' 
  },
  { 
    id: '3', 
    category: ServiceCategory.KENDARAAN, 
    requesterName: 'Sektretariat', 
    location: 'Kantor Pusat', 
    description: 'Kunjungan kerja ke cabang Bandung', 
    destination: 'Bandung',
    participantCount: 4,
    scheduleDate: '2023-11-01T07:00:00',
    date: '2023-10-23T09:15:00', 
    status: RequestStatus.PENDING, 
    priority: 'Medium' 
  },
  { 
    id: '4', 
    category: ServiceCategory.AIR_BERSIH, 
    requesterName: 'Siti Aminah', 
    location: 'Pantry Lt. 3', 
    description: 'Kran air patah, air meluber', 
    date: '2023-10-26T08:00:00', 
    status: RequestStatus.PENDING, 
    priority: 'Medium' 
  },
  { 
    id: '5', 
    category: ServiceCategory.LISTRIK, 
    requesterName: 'Keamanan', 
    location: 'Pos Jaga Depan', 
    description: 'Lampu sorot parkiran mati', 
    date: '2023-10-20T11:00:00', 
    status: RequestStatus.COMPLETED, 
    priority: 'Low' 
  },
];

const INITIAL_ANNOUNCEMENTS: Announcement[] = [
  { id: '1', text: 'Pemeliharaan Server akan dilakukan pada tgl 30 Nov pukul 22:00 WIB.', isActive: true },
  { id: '2', text: 'Penggunaan Aula Utama ditutup sementara untuk renovasi AC.', isActive: true },
];

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>('HOME');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [requests, setRequests] = useState<ServiceRequest[]>(INITIAL_REQUESTS);
  const [announcements, setAnnouncements] = useState<Announcement[]>(INITIAL_ANNOUNCEMENTS);

  const handleLogin = () => {
    setIsLoggedIn(true);
    setCurrentView('DASHBOARD');
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentView('HOME');
  };

  const handleNewRequest = (req: Omit<ServiceRequest, 'id' | 'status' | 'date'>) => {
    const newRequest: ServiceRequest = {
      ...req,
      id: Math.random().toString(36).substr(2, 9),
      status: RequestStatus.PENDING,
      date: new Date().toISOString(),
    };
    setRequests(prev => [newRequest, ...prev]);
  };

  const handleUpdateRequest = (updatedReq: ServiceRequest) => {
    setRequests(prev => prev.map(req => 
      req.id === updatedReq.id ? updatedReq : req
    ));
  };

  const handleDeleteRequest = (id: string) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus data ini secara permanen?")) {
      setRequests(prev => prev.filter(req => req.id !== id));
    }
  };

  const handleStatusChange = (id: string, newStatus: RequestStatus) => {
    setRequests(prev => prev.map(req => 
      req.id === id ? { ...req, status: newStatus } : req
    ));
  };

  // Announcement Handlers
  const handleAddAnnouncement = (text: string) => {
    const newAnnouncement: Announcement = {
      id: Math.random().toString(36).substr(2, 9),
      text,
      isActive: true,
    };
    setAnnouncements(prev => [...prev, newAnnouncement]);
  };

  const handleDeleteAnnouncement = (id: string) => {
    setAnnouncements(prev => prev.filter(a => a.id !== id));
  };

  const renderContent = () => {
    switch (currentView) {
      case 'HOME':
        return <Home requests={requests} announcements={announcements} />;
      case 'ABOUT':
        return <About />;
      case 'LOGIN':
        return <Login onLogin={handleLogin} />;
      case 'DASHBOARD':
        return isLoggedIn ? (
          <Dashboard 
            requests={requests} 
            onStatusChange={handleStatusChange} 
            onAddRequest={handleNewRequest}
            onUpdateRequest={handleUpdateRequest}
            onDeleteRequest={handleDeleteRequest}
            announcements={announcements}
            onAddAnnouncement={handleAddAnnouncement}
            onDeleteAnnouncement={handleDeleteAnnouncement}
          />
        ) : <Login onLogin={handleLogin} />;
      case 'VEHICLE_USAGE':
        return (
          <VehicleUsage 
            requests={requests}
            onAddRequest={handleNewRequest}
            onStatusChange={handleStatusChange}
            isLoggedIn={isLoggedIn}
          />
        );
      case 'BUILDING_USAGE':
        return (
          <BuildingUsage 
            requests={requests}
            onAddRequest={handleNewRequest}
            onStatusChange={handleStatusChange}
            isLoggedIn={isLoggedIn}
          />
        );
      case 'RECAP':
        return isLoggedIn ? <Recap requests={requests} /> : <Login onLogin={handleLogin} />;
      default:
        return <Home requests={requests} announcements={announcements} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar 
        currentView={currentView} 
        changeView={setCurrentView} 
        isLoggedIn={isLoggedIn}
        logout={handleLogout}
      />
      <main>
        {renderContent()}
      </main>
      
      <footer className="bg-white border-t border-gray-200 mt-auto py-6">
        <div className="max-w-7xl mx-auto px-4 text-center text-gray-500 text-sm">
          &copy; {new Date().getFullYear()} Unit Pemeliharaan Sarana & Prasarana. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default App;
