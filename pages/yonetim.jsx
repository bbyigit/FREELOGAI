import { useState, useEffect } from 'react';
import Head from 'next/head';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { db } from '../firebaseConfig';
import { collection, onSnapshot, deleteDoc, doc, updateDoc, serverTimestamp } from 'firebase/firestore';

export default function Yonetim() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  
  // --- VERİLER ---
  const [jobs, setJobs] = useState([]);
  const [trucks, setTrucks] = useState([]);
  const [requests, setRequests] = useState([]); 

  // --- İSTATİSTİKLER ---
  const [stats, setStats] = useState({
    totalRevenue: 0,
    activeTrucks: 0,
    pendingRequests: 0,
    sosAlerts: 0
  });

  const [activeTab, setActiveTab] = useState('dashboard'); 

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === '1234') { 
      setIsAuthenticated(true);
    } else {
      alert("Hatalı Güvenlik Kodu!");
    }
  };

  // --- FIREBASE DİNLEYİCİLERİ ---
  useEffect(() => {
    if (!isAuthenticated) return;

    // 1. İş İlanları
    const unsubJobs = onSnapshot(collection(db, "available_jobs"), (snapshot) => {
      const jobData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setJobs(jobData);
      const revenue = jobData.reduce((acc, job) => {
        const price = parseFloat(job.price?.replace(/[^0-9.-]+/g,"")) || 0;
        return acc + price;
      }, 0);
      setStats(prev => ({ ...prev, totalRevenue: revenue }));
    });

    // 2. Aktif Tırlar
    const unsubTrucks = onSnapshot(collection(db, "truck_locations"), (snapshot) => {
      const truckData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTrucks(truckData);
      const sosCount = truckData.filter(t => t.status === 'SOS').length;
      setStats(prev => ({ 
        ...prev, 
        activeTrucks: truckData.length,
        sosAlerts: sosCount
      }));
    });

    // 3. Onay İstekleri
    const unsubRequests = onSnapshot(collection(db, "driver_requests"), (snapshot) => {
      const reqData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const pending = reqData.filter(r => r.status === 'PENDING');
      setRequests(pending);
      setStats(prev => ({ ...prev, pendingRequests: pending.length }));
    });

    return () => {
      unsubJobs();
      unsubTrucks();
      unsubRequests();
    };
  }, [isAuthenticated]);

  // --- İŞLEMLER ---
  const handleDeleteJob = async (id) => {
    if (confirm("Bu iş emrini iptal etmek istiyor musun?")) {
      await deleteDoc(doc(db, "available_jobs", id));
    }
  };

  const handleDeleteTruck = async (id) => {
    if (confirm(`Bu aracı (${id}) sistemden düşürmek istiyor musun?`)) {
      await deleteDoc(doc(db, "truck_locations", id));
    }
  };

  const handleApproveDriver = async (req) => {
    try {
      await updateDoc(doc(db, "driver_requests", req.id), {
        status: "APPROVED",
        approvedAt: serverTimestamp()
      });
      alert(`✅ ${req.name} (${req.plate}) sisteme kabul edildi.`);
    } catch (error) {
      console.error(error);
      alert("Hata oluştu.");
    }
  };

  const handleRejectDriver = async (id) => {
    if (confirm("Sürücü reddedilsin mi?")) {
      await updateDoc(doc(db, "driver_requests", id), {
        status: "REJECTED"
      });
    }
  };

  const formatMoney = (amount) => {
    return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(amount);
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return "---";
    const date = timestamp.seconds ? new Date(timestamp.seconds * 1000) : new Date(timestamp);
    return date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="min-h-screen bg-[#0a192f] font-sans text-slate-200 selection:bg-orange-500 selection:text-white flex flex-col">
      <Head><title>Operasyon Merkezi | Freelog</title></Head>
      
      <Navbar />

      <main 
        className="flex-grow container mx-auto px-4 flex justify-center items-start"
        // Navbar'dan iyice uzaklaştırdık (180px)
        style={{ paddingTop: '180px', paddingBottom: '50px' }}
      >
        
        {!isAuthenticated ? (
          /* --- GİRİŞ EKRANI --- */
          <div className="bg-[#112240] p-10 rounded-2xl shadow-2xl w-full max-w-md text-center border border-slate-700 mt-10 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 to-red-500"></div>
            <div className="flex justify-center mb-6">
                {/* Kilit İkonu SVG */}
                <svg className="w-16 h-16 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
            </div>
            <h2 className="text-xl font-bold text-white mb-2 tracking-widest uppercase">Komuta Merkezi</h2>
            <p className="text-slate-400 text-xs mb-8 font-mono">Yetkili personel girişi.</p>
            
            <form onSubmit={handleLogin} className="space-y-4">
              <input 
                type="password" placeholder="ERİŞİM KODU"
                className="w-full px-4 py-3 bg-[#0a192f] border border-slate-600 rounded-lg text-orange-500 font-mono text-center tracking-[0.5em] focus:border-orange-500 focus:outline-none transition font-bold text-lg"
                value={password} onChange={(e) => setPassword(e.target.value)}
                autoFocus
              />
              <button type="submit" className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 rounded-lg border border-slate-600 transition font-mono text-xs tracking-wider">
                GİRİŞ YAP
              </button>
            </form>
          </div>
        ) : (
          
          /* --- ANA PANEL --- */
          <div className="w-full max-w-7xl animate-fade-in-up">
            
            {/* ÜST DASHBOARD KARTLARI (EMOJİSİZ - PROFESYONEL SVG) */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              
              {/* KART 1: CİRO */}
              <div className="bg-[#112240] p-5 rounded-xl border border-slate-700/50 hover:border-green-500/30 transition group">
                <div className="flex justify-between items-start mb-2">
                    <h3 className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Havuz Değeri</h3>
                    <div className="p-1.5 bg-green-500/10 rounded text-green-500">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    </div>
                </div>
                <p className="text-2xl font-bold text-white font-mono">{formatMoney(stats.totalRevenue)}</p>
                <div className="mt-3 w-full h-0.5 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-green-500 w-[70%]"></div>
                </div>
              </div>

              {/* KART 2: AKTİF ARAÇ */}
              <div className="bg-[#112240] p-5 rounded-xl border border-slate-700/50 hover:border-blue-500/30 transition group">
                <div className="flex justify-between items-start mb-2">
                    <h3 className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Aktif Filo</h3>
                    <div className="p-1.5 bg-blue-500/10 rounded text-blue-500">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0"></path></svg>
                    </div>
                </div>
                <p className="text-2xl font-bold text-white font-mono">{stats.activeTrucks} <span className="text-xs text-slate-500 font-sans">Araç</span></p>
                <div className="mt-3 w-full h-0.5 bg-slate-800 rounded-full overflow-hidden">
                   <div className="h-full bg-blue-500 w-[45%]"></div>
                </div>
              </div>

              {/* KART 3: BEKLEYEN ONAY */}
              <div 
                onClick={() => setActiveTab('approvals')}
                className={`bg-[#112240] p-5 rounded-xl border relative cursor-pointer transition
                ${stats.pendingRequests > 0 ? 'border-orange-500/50 shadow-[0_0_15px_rgba(249,115,22,0.1)]' : 'border-slate-700/50 hover:border-orange-500/30'}`}
              >
                <div className="flex justify-between items-start mb-2">
                    <h3 className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Kayıt İsteği</h3>
                    <div className={`p-1.5 rounded ${stats.pendingRequests > 0 ? 'bg-orange-500 text-white animate-pulse' : 'bg-slate-700 text-slate-400'}`}>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path></svg>
                    </div>
                </div>
                <p className={`text-2xl font-bold font-mono ${stats.pendingRequests > 0 ? 'text-orange-500' : 'text-white'}`}>
                  {stats.pendingRequests} <span className="text-xs text-slate-500 font-sans">Bekleyen</span>
                </p>
              </div>

              {/* KART 4: SOS */}
              <div className={`bg-[#112240] p-5 rounded-xl border transition
                  ${stats.sosAlerts > 0 ? 'border-red-600 bg-red-900/10' : 'border-slate-700/50 hover:border-red-500/30'}`}>
                <div className="flex justify-between items-start mb-2">
                    <h3 className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Sistem Alarmı</h3>
                    <div className={`p-1.5 rounded ${stats.sosAlerts > 0 ? 'bg-red-500 text-white animate-pulse' : 'bg-slate-700 text-slate-400'}`}>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                    </div>
                </div>
                <p className={`text-2xl font-bold font-mono ${stats.sosAlerts > 0 ? 'text-red-500' : 'text-white'}`}>
                  {stats.sosAlerts} <span className="text-xs text-slate-500 font-sans">Olay</span>
                </p>
              </div>

            </div>

            {/* SEKMELER (BUTONLAR KÜÇÜLTÜLDÜ VE EMOJİSİZ) */}
            <div className="flex items-center gap-2 mb-4 border-b border-slate-700 pb-1">
              <button 
                onClick={() => setActiveTab('jobs')}
                className={`px-4 py-2 font-bold text-xs tracking-wide transition-colors rounded-t-lg ${activeTab === 'jobs' ? 'bg-blue-600/10 text-blue-400 border-b-2 border-blue-500' : 'text-slate-500 hover:text-slate-300'}`}
              >
                YÜK HAVUZU ({jobs.length})
              </button>
              <button 
                onClick={() => setActiveTab('trucks')}
                className={`px-4 py-2 font-bold text-xs tracking-wide transition-colors rounded-t-lg ${activeTab === 'trucks' ? 'bg-blue-600/10 text-blue-400 border-b-2 border-blue-500' : 'text-slate-500 hover:text-slate-300'}`}
              >
                FİLO DURUMU ({trucks.length})
              </button>
              <button 
                onClick={() => setActiveTab('approvals')}
                className={`px-4 py-2 font-bold text-xs tracking-wide transition-colors rounded-t-lg flex items-center gap-2 ${activeTab === 'approvals' ? 'bg-orange-600/10 text-orange-400 border-b-2 border-orange-500' : 'text-slate-500 hover:text-slate-300'}`}
              >
                KAYIT TALEPLERİ 
                {stats.pendingRequests > 0 && <span className="bg-orange-500 text-white text-[9px] px-1.5 py-0.5 rounded-full">{stats.pendingRequests}</span>}
              </button>
            </div>

            {/* --- İÇERİK LİSTESİ --- */}
            <div className="bg-[#112240]/40 border border-slate-700/50 rounded-xl p-4 min-h-[400px]">
              
              {/* TAB 1: İŞ İLANLARI */}
              {activeTab === 'jobs' && (
                <div className="space-y-2">
                  {jobs.length === 0 ? <EmptyState msg="Aktif iş emri bulunmuyor." /> : jobs.map((job) => (
                    <div key={job.id} className="bg-[#0a192f] border border-slate-800 hover:border-blue-500/30 p-3 rounded-lg flex flex-col md:flex-row items-center gap-4 transition group">
                        <div className="p-2 bg-blue-500/5 rounded-md text-blue-500">
                             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg>
                        </div>
                        <div className="flex-1">
                           <h4 className="font-bold text-white text-sm">{job.title}</h4>
                           <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                              <span className="text-slate-300">{job.pickupName}</span> ➔ <span className="text-slate-300">{job.destName}</span>
                           </div>
                        </div>
                        <div className="text-right px-4 border-l border-slate-800">
                           <div className="font-mono text-green-400 font-bold text-sm">{job.price}</div>
                           <div className="text-[10px] text-slate-500">{job.tonnage} Ton • {job.distance}</div>
                        </div>
                        <button onClick={() => handleDeleteJob(job.id)} className="text-slate-600 hover:text-red-500 transition p-2">
                             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                        </button>
                    </div>
                  ))}
                </div>
              )}

              {/* TAB 2: FİLO */}
              {activeTab === 'trucks' && (
                <div className="space-y-2">
                   {trucks.length === 0 ? <EmptyState msg="Sahada aktif araç yok." /> : trucks.map((truck) => (
                     <div key={truck.id} className="bg-[#0a192f] border border-slate-800 hover:border-blue-500/30 p-3 rounded-lg flex items-center justify-between transition">
                        <div className="flex items-center gap-3">
                           <div className="w-8 h-8 rounded bg-slate-800 flex items-center justify-center text-slate-400">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0"></path></svg>
                           </div>
                           <div>
                              <h4 className="font-bold text-white text-sm font-mono">{truck.truckId || truck.id}</h4>
                              <p className="text-[10px] text-slate-500">{truck.driverName || "İsimsiz Sürücü"}</p>
                           </div>
                        </div>
                        <div className="flex items-center gap-4">
                           <span className={`px-2 py-0.5 rounded text-[9px] font-bold tracking-wider border ${
                                truck.status === 'FULL' ? 'border-blue-500 text-blue-400 bg-blue-500/5' :
                                truck.status === 'SOS' ? 'border-red-500 text-red-500 bg-red-500/5 animate-pulse' :
                                'border-slate-600 text-slate-500'
                           }`}>
                               {truck.status}
                           </span>
                           <div className="text-right">
                              <div className="text-white font-mono font-bold text-sm">{truck.speed?.toFixed(0) || 0} <span className="text-[9px] text-slate-500">KM/S</span></div>
                              <div className="text-[9px] text-slate-600">{formatTime(truck.updatedAt)}</div>
                           </div>
                           <button onClick={() => handleDeleteTruck(truck.id)} className="text-slate-600 hover:text-red-500 text-[10px] font-bold border border-slate-700 hover:border-red-500 px-2 py-1 rounded transition">SİL</button>
                        </div>
                     </div>
                   ))}
                </div>
              )}

              {/* TAB 3: ONAY BEKLEYENLER */}
              {activeTab === 'approvals' && (
                <div className="space-y-2">
                  {requests.length === 0 ? <EmptyState msg="Bekleyen kayıt isteği yok." /> : requests.map((req) => (
                     <div key={req.id} className="bg-[#0a192f] border border-orange-500/20 p-3 rounded-lg flex flex-col md:flex-row items-center justify-between gap-4 animate-fade-in-up">
                        <div className="flex items-center gap-3">
                           <div className="w-10 h-10 rounded bg-orange-500/10 text-orange-500 flex items-center justify-center border border-orange-500/30">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                           </div>
                           <div>
                              <div className="flex items-center gap-2">
                                <h4 className="font-bold text-white text-sm">{req.name}</h4>
                                <span className="bg-slate-800 text-slate-300 text-[9px] px-1.5 py-0.5 rounded font-mono border border-slate-700">{req.plate}</span>
                              </div>
                              <p className="text-[10px] text-slate-500 mt-0.5">Sisteme giriş izni istiyor • {formatTime(req.createdAt)}</p>
                           </div>
                        </div>
                        
                        <div className="flex gap-2">
                           <button 
                             onClick={() => handleRejectDriver(req.id)}
                             className="px-3 py-1.5 rounded border border-red-500/30 text-red-500 hover:bg-red-500 hover:text-white transition text-[10px] font-bold tracking-wide"
                           >
                             REDDET
                           </button>
                           <button 
                             onClick={() => handleApproveDriver(req)}
                             className="px-4 py-1.5 rounded bg-green-600 hover:bg-green-500 text-white shadow-lg shadow-green-900/20 transition text-[10px] font-bold tracking-wide flex items-center gap-1"
                           >
                             <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                             ONAYLA
                           </button>
                        </div>
                     </div>
                  ))}
                </div>
              )}

            </div>
          </div>
        )}
      </main>
      <Footer />
      
      <style jsx global>{`
        @keyframes fade-in-up {
           from { opacity: 0; transform: translateY(10px); }
           to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up { animation: fade-in-up 0.5s ease-out; }
      `}</style>
    </div>
  );
}

// Boş Durum Bileşeni (Görseli güncellendi)
function EmptyState({ msg }) {
  return (
    <div className="flex flex-col items-center justify-center h-48 text-slate-600 border border-dashed border-slate-800 rounded-lg">
      <div className="mb-2 opacity-30">
         <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path></svg>
      </div>
      <p className="text-xs font-bold tracking-wide">{msg}</p>
    </div>
  )
}