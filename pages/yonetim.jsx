import { useState, useEffect } from 'react';
import Head from 'next/head';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { db } from '../firebaseConfig';
import { collection, onSnapshot, deleteDoc, doc } from 'firebase/firestore';

export default function Yonetim() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  
  // İki farklı veri seti tutuyoruz
  const [jobs, setJobs] = useState([]);
  const [trucks, setTrucks] = useState([]);

  // Sekme Kontrolü (Jobs veya Trucks)
  const [activeTab, setActiveTab] = useState('jobs'); // 'jobs' veya 'trucks'

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === '123456') { // Şifren burada
      setIsAuthenticated(true);
    } else {
      alert("Hatalı Şifre!");
    }
  };

  // VERİLERİ CANLI DİNLEME
  useEffect(() => {
    if (!isAuthenticated) return;

    // 1. İş İlanlarını Dinle
    const unsubscribeJobs = onSnapshot(collection(db, "available_jobs"), (snapshot) => {
      setJobs(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    // 2. Aktif Tırları Dinle
    const unsubscribeTrucks = onSnapshot(collection(db, "truck_locations"), (snapshot) => {
      setTrucks(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => {
      unsubscribeJobs();
      unsubscribeTrucks();
    };
  }, [isAuthenticated]);

  // SİLME FONKSİYONLARI
  const handleDeleteJob = async (id) => {
    if (confirm("Bu iş ilanını silmek istediğine emin misin?")) {
      await deleteDoc(doc(db, "available_jobs", id));
    }
  };

  const handleDeleteTruck = async (id) => {
    if (confirm(`Bu aracı (${id}) haritadan kaldırmak istiyor musun?`)) {
      await deleteDoc(doc(db, "truck_locations", id));
    }
  };

  // --- ZAMAN FORMATLAYICI ---
  const formatTime = (timestamp) => {
    if (!timestamp) return "Bilinmiyor";
    return new Date(timestamp.seconds * 1000).toLocaleString('tr-TR');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Head><title>Freelog - Yönetim Merkezi</title></Head>
      <Navbar />

      <main className="flex-grow container mx-auto py-10 px-4">
        
        {!isAuthenticated ? (
          <div className="max-w-md mx-auto bg-white p-8 rounded-xl shadow-lg mt-20 text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Yönetici Girişi</h2>
            <form onSubmit={handleLogin} className="space-y-4">
              <input 
                type="password" placeholder="Şifre"
                className="w-full p-3 border border-gray-300 rounded-lg outline-none focus:border-blue-500"
                value={password} onChange={(e) => setPassword(e.target.value)}
              />
              <button type="submit" className="w-full bg-blue-900 text-white font-bold py-3 rounded-lg hover:bg-blue-800 transition">
                GİRİŞ YAP
              </button>
            </form>
          </div>
        ) : (
          
          <div className="bg-white rounded-xl shadow-lg overflow-hidden min-h-[600px]">
            {/* --- ÜST SEKMELER (TABS) --- */}
            <div className="flex border-b">
              <button 
                onClick={() => setActiveTab('jobs')}
                className={`flex-1 py-4 text-center font-bold text-lg transition ${activeTab === 'jobs' ? 'bg-blue-50 text-blue-900 border-b-4 border-blue-900' : 'text-gray-500 hover:bg-gray-50'}`}
              >
                📋 Yük Havuzu ({jobs.length})
              </button>
              <button 
                onClick={() => setActiveTab('trucks')}
                className={`flex-1 py-4 text-center font-bold text-lg transition ${activeTab === 'trucks' ? 'bg-orange-50 text-orange-600 border-b-4 border-orange-500' : 'text-gray-500 hover:bg-gray-50'}`}
              >
                🚛 Aktif Araçlar ({trucks.length})
              </button>
            </div>

            {/* --- İÇERİK ALANI --- */}
            <div className="p-6">
              
              {/* TAB 1: İŞ İLANLARI */}
              {activeTab === 'jobs' && (
                <div className="overflow-x-auto">
                  <table className="min-w-full text-left text-sm">
                    <thead className="bg-gray-100 text-gray-700 uppercase font-bold">
                      <tr>
                        <th className="px-6 py-3">Başlık</th>
                        <th className="px-6 py-3">Rota</th>
                        <th className="px-6 py-3">Fiyat</th>
                        <th className="px-6 py-3 text-center">İşlem</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {jobs.map((job) => (
                        <tr key={job.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 font-medium">{job.title}</td>
                          <td className="px-6 py-4">{job.pickupName} ➔ {job.destName}</td>
                          <td className="px-6 py-4 text-green-600 font-bold">{job.price}</td>
                          <td className="px-6 py-4 text-center">
                            <button onClick={() => handleDeleteJob(job.id)} className="text-red-500 hover:text-red-700 font-bold">SİL</button>
                          </td>
                        </tr>
                      ))}
                      {jobs.length === 0 && <tr><td colSpan="4" className="text-center py-10 text-gray-400">İlan yok.</td></tr>}
                    </tbody>
                  </table>
                </div>
              )}

              {/* TAB 2: AKTİF ARAÇLAR (Senin İstediğin Kısım) */}
              {activeTab === 'trucks' && (
                <div className="overflow-x-auto">
                  <table className="min-w-full text-left text-sm">
                    <thead className="bg-orange-50 text-orange-800 uppercase font-bold">
                      <tr>
                        <th className="px-6 py-3">Plaka (ID)</th>
                        <th className="px-6 py-3">Son Durum</th>
                        <th className="px-6 py-3">Hız</th>
                        <th className="px-6 py-3">Son Sinyal</th>
                        <th className="px-6 py-3 text-center">İşlem</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {trucks.map((truck) => (
                        <tr key={truck.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 font-bold text-blue-900">{truck.truckId}</td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 rounded text-xs font-bold text-white
                              ${truck.status === 'FULL' ? 'bg-blue-600' : 
                                truck.status === 'SOS' ? 'bg-red-600' : 
                                truck.status === 'GOING_TO_PICKUP' ? 'bg-purple-600' : 'bg-yellow-500'}`}>
                              {truck.status}
                            </span>
                          </td>
                          <td className="px-6 py-4">{truck.speed ? truck.speed.toFixed(1) : 0} km/s</td>
                          <td className="px-6 py-4 text-gray-500">{formatTime(truck.updatedAt)}</td>
                          <td className="px-6 py-4 text-center">
                            <button 
                              onClick={() => handleDeleteTruck(truck.id)} 
                              className="bg-red-100 text-red-600 hover:bg-red-600 hover:text-white px-3 py-1 rounded transition font-bold text-xs"
                            >
                              HARİTADAN AT
                            </button>
                          </td>
                        </tr>
                      ))}
                      {trucks.length === 0 && <tr><td colSpan="5" className="text-center py-10 text-gray-400">Aktif araç yok.</td></tr>}
                    </tbody>
                  </table>
                </div>
              )}

            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}