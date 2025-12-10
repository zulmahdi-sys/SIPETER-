
export enum ServiceCategory {
  AIR_BERSIH = 'Jaringan Air Bersih',
  AIR_KOTOR = 'Jaringan Air Kotor',
  LISTRIK = 'Perbaikan Jaringan Listrik',
  AC = 'Perbaikan AC',
  KENDARAAN = 'Penggunaan Kendaraan Dinas',
  GEDUNG = 'Pemakaian Gedung / Aula',
}

export enum RequestStatus {
  PENDING = 'Pending',
  IN_PROGRESS = 'In Progress',
  COMPLETED = 'Completed',
  REJECTED = 'Rejected',
}

export interface ServiceRequest {
  id: string;
  category: ServiceCategory;
  requesterName: string; // Nama Pemohon / Nama Pengguna
  description: string; // Deskripsi Masalah / Keperluan
  location: string; // Lokasi / Tempat yang digunakan
  date: string; // Tanggal Input
  status: RequestStatus;
  priority: 'Low' | 'Medium' | 'High';
  
  // Optional Fields for Specific Forms
  activityName?: string; // Untuk Gedung
  participantCount?: number; // Untuk Gedung & Kendaraan (Kapasitas)
  destination?: string; // Untuk Kendaraan
  scheduleDate?: string; // Jadwal Penggunaan (ISO String / Date String)
}

export interface Announcement {
  id: string;
  text: string;
  isActive: boolean;
}

export interface NavItem {
  label: string;
  view: ViewState;
}

export type ViewState = 'HOME' | 'ABOUT' | 'LOGIN' | 'DASHBOARD' | 'RECAP' | 'VEHICLE_USAGE' | 'BUILDING_USAGE';
