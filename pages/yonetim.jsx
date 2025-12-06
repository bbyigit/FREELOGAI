import { useState, useEffect } from 'react';
import Head from 'next/head';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { db } from '../firebaseConfig';
import { collection, onSnapshot, deleteDoc, doc } from 'firebase/firestore';

export default function Yonetim() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  
  // Veriler
  const [jobs, setJobs] = useState([]);
  const [trucks, setTrucks] = useState([]);

  // Sekme Kontrolü
  const [activeTab, setActiveTab] = useState('jobs'); 

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === '1234') { // Şifreyi 1234 olarak güncelledim, diğerleriyle uyumlu olsun
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
    // Firestore Timestamp objesi mi kontrolü
    const date = timestamp.seconds ? new Date(timestamp.seconds * 1000) : new Date(timestamp);
    return date.toLocaleString('tr-TR', { 
        hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' 
    });
  };

  return (
    <div className="min-h-screen bg-[#0a192f] font-sans text-slate-200 selection:bg-orange-500 selection:text-white flex flex-col">
      <Head><title>Operasyon Yönetimi | Freelog</title></Head>
      
      {/* Navbar Fixed */}
      <Navbar />

      {/* KRAL AYAR: Navbar çakışmasını önlemek için padding */}
      <main 
        className="flex-grow container mx-auto px-4 flex justify-center items-start"
        style={{ paddingTop: '150px', paddingBottom: '50px' }}
      >
        
        {!isAuthenticated ? (
          /* --- GİRİŞ EKRANI (DARK MODE) --- */
          <div className="bg-[#112240] p-10 rounded-2xl shadow-2xl w-full max-w-md text-center border border-slate-700 mt-10">
            <div className="mb-6 text-5xl animate-bounce">🛡️</div>
            <h2 className="text-xl font-bold text-white mb-2 tracking-widest uppercase">Yönetim Paneli</h2>
            <p className="text-slate-400 text-xs mb-8 font-mono">Yetkili erişimi gereklidir.</p>
            
            <form onSubmit={handleLogin} className="space-y-4">
              <input 
                type="password" placeholder="GÜVENLİK KODU"
                className="w-full px-4 py-3 bg-[#0a192f] border border-slate-600 rounded-lg text-orange-500 font-mono text-center tracking-[0.5em] focus:border-orange-500 focus:outline-none transition font-bold"
                value={password} onChange={(e) => setPassword(e.target.value)}
                autoFocus
              />
              <button type="submit" className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 rounded-lg border border-slate-600 transition font-mono text-sm">
                GİRİŞ YAP
              </button>
            </form>
          </div>
        ) : (
          
          /* --- YÖNETİM PANELİ İÇERİĞİ --- */
          <div className="w-full max-w-5xl">
            
            {/* ÜST BAŞLIK */}
            <div className="flex justify-between items-end mb-8 border-b border-slate-700 pb-4">
               <div>
                 <h1 className="text-3xl font-bold text-white mb-1">Operasyon Merkezi</h1>
                 <p className="text-slate-400 text-sm">Veritabanı ve filo yönetimi.</p>
               </div>
               <div className="flex gap-2">
                  <span className="px-3 py-1 bg-green-500/10 text-green-400 border border-green-500/30 rounded text-xs font-mono">DB: ONLINE</span>
               </div>
            </div>

            {/* SEKMELER (TABS) */}
            <div className="flex gap-4 mb-8">
              <button 
                onClick={() => setActiveTab('jobs')}
                className={`flex-1 py-4 rounded-xl border font-bold text-sm tracking-wide transition-all flex items-center justify-center gap-3
                ${activeTab === 'jobs' 
                  ? 'bg-blue-600/20 border-blue-500 text-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.3)]' 
                  : 'bg-[#112240] border-slate-700 text-slate-400 hover:bg-slate-800'}`}
              >
                <span>📋</span> YÜK HAVUZU <span className="bg-slate-900 px-2 py-0.5 rounded text-xs ml-2">{jobs.length}</span>
              </button>
              
              <button 
                onClick={() => setActiveTab('trucks')}
                className={`flex-1 py-4 rounded-xl border font-bold text-sm tracking-wide transition-all flex items-center justify-center gap-3
                ${activeTab === 'trucks' 
                  ? 'bg-orange-600/20 border-orange-500 text-orange-400 shadow-[0_0_20px_rgba(249,115,22,0.3)]' 
                  : 'bg-[#112240] border-slate-700 text-slate-400 hover:bg-slate-800'}`}
              >
                <span>🚛</span> AKTİF FİLO <span className="bg-slate-900 px-2 py-0.5 rounded text-xs ml-2">{trucks.length}</span>
              </button>
            </div>

            {/* --- İÇERİK LİSTESİ --- */}
            <div className="space-y-4">
              
              {/* TAB 1: İŞ İLANLARI LİSTESİ */}
              {activeTab === 'jobs' && (
                <>
                  {jobs.length === 0 ? (
                    <div className="text-center py-20 text-slate-500 border border-dashed border-slate-700 rounded-xl">Havuzda aktif iş bulunmuyor.</div>
                  ) : (
                    jobs.map((job) => (
                      <div key={job.id} className="bg-[#112240] border border-slate-700 p-5 rounded-xl flex flex-col md:flex-row justify-between items-center gap-4 hover:border-blue-500 transition group">
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-white group-hover:text-blue-400 transition">{job.title}</h3>
                          <div className="flex items-center gap-2 text-sm text-slate-400 mt-1">
                             <span className="text-blue-300">A: {job.pickupName}</span> 
                             <span className="text-slate-600">➔</span> 
                             <span className="text-orange-300">B: {job.destName}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-6">
                           <div className="text-right">
                              <div className="text-lg font-bold text-green-400">{job.price}</div>
                              <div className="text-xs text-slate-500 font-mono">{job.distance} • {job.tonnage}</div>
                           </div>
                           <button onClick={() => handleDeleteJob(job.id)} className="bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white border border-red-500/30 p-3 rounded-lg transition">
                             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                           </button>
                        </div>
                      </div>
                    ))
                  )}
                </>
              )}

              {/* TAB 2: AKTİF ARAÇLAR LİSTESİ */}
              {activeTab === 'trucks' && (
                <>
                  {trucks.length === 0 ? (
                    <div className="text-center py-20 text-slate-500 border border-dashed border-slate-700 rounded-xl">Haritada aktif araç yok.</div>
                  ) : (
                    trucks.map((truck) => (
                      <div key={truck.id} className="bg-[#112240] border border-slate-700 p-5 rounded-xl flex flex-col md:flex-row justify-between items-center gap-4 hover:border-orange-500 transition group">
                        
                        <div className="flex items-center gap-4 flex-1">
                           <div className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center text-xl">🚛</div>
                           <div>
                              <h3 className="text-lg font-bold text-white font-mono group-hover:text-orange-400 transition">{truck.id || truck.truckId}</h3>
                              <p className="text-xs text-slate-500 font-mono">Son Sinyal: {formatTime(truck.updatedAt || truck.timestamp)}</p>
                           </div>
                        </div>

                        <div className="flex items-center gap-6">
                           <span className={`px-3 py-1 rounded text-xs font-bold border tracking-wider
                              ${truck.status === 'FULL' ? 'bg-blue-900/30 border-blue-500 text-blue-400' : 
                                truck.status === 'SOS' ? 'bg-red-900/30 border-red-500 text-red-500 animate-pulse' : 
                                truck.status === 'GOING_TO_PICKUP' ? 'bg-purple-900/30 border-purple-500 text-purple-400' : 
                                'bg-yellow-900/30 border-yellow-500 text-yellow-500'}`}>
                              {truck.status}
                           </span>
                           
                           <div className="text-right w-24">
                              <div className="text-lg font-bold text-white">{truck.speed ? truck.speed.toFixed(0) : 0} <span className="text-xs font-normal text-slate-500">KM/S</span></div>
                           </div>

                           <button onClick={() => handleDeleteTruck(truck.id)} className="bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white border border-red-500/30 px-4 py-2 rounded-lg transition text-xs font-bold">
                             AT
                           </button>
                        </div>
                      </div>
                    ))
                  )}
                </>
              )}

            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}