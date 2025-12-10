import React from 'react';

export const About: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="bg-white shadow-xl rounded-2xl overflow-hidden">
        <div className="md:flex">
          <div className="md:flex-shrink-0">
            <img className="h-64 w-full object-cover md:w-64" src="https://picsum.photos/400/600" alt="Office Building" />
          </div>
          <div className="p-8">
            <div className="uppercase tracking-wide text-sm text-indigo-500 font-semibold">Tentang Kami</div>
            <h2 className="block mt-1 text-2xl leading-tight font-medium text-black">Unit Layanan Pemeliharaan Terpadu</h2>
            <p className="mt-4 text-gray-500">
              Sistem Pemeliharaan Terpadu (SIPETER) dikembangkan untuk mempermudah proses pelaporan gangguan fasilitas serta manajemen peminjaman aset kantor.
              Kami berkomitmen untuk memberikan pelayanan cepat dan tanggap dalam menjaga kenyamanan lingkungan kerja.
            </p>
            <div className="mt-6">
              <h3 className="font-bold text-gray-900">Lingkup Kerja:</h3>
              <ul className="list-disc list-inside text-gray-600 mt-2 space-y-1">
                <li>Instalasi dan sanitasi air bersih & kotor</li>
                <li>Jaringan kelistrikan dan penerangan</li>
                <li>Pemeliharaan pendingin ruangan (AC)</li>
                <li>Manajemen kendaraan operasional dinas</li>
                <li>Pengelolaan ruang rapat dan aula</li>
              </ul>
            </div>
            <div className="mt-8 border-t pt-4">
              <p className="text-sm text-gray-400">Hubungi Hotline: (021) 555-0199 | Email: maintenance@kantor.id</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
