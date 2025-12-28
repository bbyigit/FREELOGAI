import { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useRouter } from 'next/router';
import { auth, db } from '../firebaseConfig';
import { 
  collection, onSnapshot, query, where, orderBy, addDoc, 
  serverTimestamp, doc, getDoc, updateDoc, setDoc, writeBatch, deleteDoc 
} from 'firebase/firestore'; 
import { onAuthStateChanged } from 'firebase/auth';
import { useAuthModal } from '../context/AuthModalContext'; 

// --- HARİTA AYARLARI ---
const GOOGLE_MAPS_API_KEY = "AIzaSyA5U4UUjpet8KkN1S4R1LjAEtHp9PH2uWI"; 
const DARK_MAP_STYLE = [
  { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#38414e" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#17263c" }] },
];

export default function Suruculer() {
  const router = useRouter();
  const { openLogin } = useAuthModal();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('cockpit'); 

  // --- VERİ STATE'LERİ ---
  const [marketJobs, setMarketJobs] = useState([]); 
  const [myApplications, setMyApplications] = useState([]); 
  const [activeJob, setActiveJob] = useState(null); 
  const [driverStatus, setDriverStatus] = useState('EMPTY'); 

  // --- TEKLİF MODAL STATE'LERİ (YENİ) ---
  const [showBidModal, setShowBidModal] = useState(false);
  const [selectedJobForBid, setSelectedJobForBid] = useState(null);
  const [bidAmount, setBidAmount] = useState('');

  // --- HARİTA REF ---
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const directionsService = useRef(null);
  const directionsRenderer = useRef(null);

  // 1. KİMLİK DOĞRULAMA & PROFİL ÇEKME
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        router.push('/'); // Önce anasayfaya at
        setTimeout(() => openLogin(), 200);
      } else {
        const userDoc = await getDoc(doc(db, "users", currentUser.uid));
        if (userDoc.exists() && userDoc.data().role === 'driver') {
          const userData = { ...currentUser, ...userDoc.data() };
          setUser(userData);
          
          if (userData.plate) {
              const truckDoc = await getDoc(doc(db, "truck_locations", userData.plate));
              if(truckDoc.exists()) {
                 setDriverStatus(truckDoc.data().status);
              } else {
                 await setDoc(doc(db, "truck_locations", userData.plate), {
                    plate: userData.plate,
                    driverName: `${userData.name} ${userData.surname}`, 
                    driverId: userData.uid,
                    status: 'EMPTY',
                    lat: 41.0, lng: 29.0, 
                    updatedAt: serverTimestamp()
                });
             }
          }
          setLoading(false);
        } else {
          alert("Sadece Sürücü hesabı ile giriş yapabilirsiniz.");
          router.push('/');
        }
      }
    });
    return () => unsubscribe();
  }, [router]);

  // 2. VERİLERİ DİNLE
  useEffect(() => {
    if (!user) return;

    // A) Yük Havuzu (İndeksleme yapıldıysa çalışır)
    const qMarket = query(collection(db, "available_jobs"), where("status", "==", "WAITING"), orderBy("createdAt", "desc"));
    const unsubMarket = onSnapshot(qMarket, (snap) => {
       setMarketJobs(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    // B) Başvurularım
    const qApps = query(collection(db, "job_applications"), where("driverId", "==", user.uid));
    const unsubApps = onSnapshot(qApps, (snap) => {
       // Tarihe göre sıralayalım (Client-side sort)
       const apps = snap.docs.map(d => ({ id: d.id, ...d.data() }));
       apps.sort((a,b) => (b.appliedAt?.seconds || 0) - (a.appliedAt?.seconds || 0));
       setMyApplications(apps);
    });

    // C) Aktif Görevim
    const qActive = query(collection(db, "available_jobs"), where("assignedDriverId", "==", user.uid));
    const unsubActive = onSnapshot(qActive, (snap) => {
       const jobs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
       const current = jobs.find(j => ['ASSIGNED', 'PICKUP', 'ON_WAY', 'FULL'].includes(j.status));
       setActiveJob(current || null);
       
       if(current && activeTab === 'market') setActiveTab('cockpit');
    });

    return () => { unsubMarket(); unsubApps(); unsubActive(); };
  }, [user, activeTab]);

  // 3. HARİTA YÖNETİMİ
  useEffect(() => {
     if(activeTab === 'cockpit' && activeJob) {
        const initMap = () => {
            if(!mapInstance.current && mapRef.current) {
                mapInstance.current = new google.maps.Map(mapRef.current, {
                    zoom: 7, center: { lat: 39, lng: 35 }, styles: DARK_MAP_STYLE, disableDefaultUI: true
                });
                directionsService.current = new google.maps.DirectionsService();
                directionsRenderer.current = new google.maps.DirectionsRenderer({
                    map: mapInstance.current, polylineOptions: { strokeColor: "#f97316", strokeWeight: 5 }
                });
            }
            if(directionsService.current && directionsRenderer.current) {
                const start = { lat: parseFloat(activeJob.pickupLat), lng: parseFloat(activeJob.pickupLng) };
                const end = { lat: parseFloat(activeJob.destLat), lng: parseFloat(activeJob.destLng) };
                directionsService.current.route(
                    { origin: start, destination: end, travelMode: google.maps.TravelMode.DRIVING },
                    (res, status) => { if(status === 'OK') directionsRenderer.current.setDirections(res); }
                );
            }
        };

        if(!window.google) {
            const script = document.createElement('script');
            script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places,geometry`;
            script.async = true; 
            script.defer = true;
            script.onload = initMap;
            document.body.appendChild(script);
        } else {
            initMap();
        }
     }
  }, [activeTab, activeJob]);


  // --- İŞLEMLER ---

  // 1. PLAKA KONTROLÜ VE MODAL AÇMA (YENİ)
  const handleOpenBidModal = (job) => {
      // Plaka Kontrolü
      if(!user.plate || user.plate.trim() === "") {
          if(confirm("⚠️ Yük alabilmek için önce profilinizde araç PLAKASI tanımlamalısınız. Profil sayfasına gitmek ister misiniz?")) {
              router.push('/profil');
          }
          return;
      }

      setSelectedJobForBid(job);
      setBidAmount(job.price); // Varsayılan olarak ilan fiyatını koy
      setShowBidModal(true);
  };

  // 2. TEKLİF GÖNDERME (YENİ)
  const handleSubmitBid = async (e) => {
      e.preventDefault();
      if(!selectedJobForBid) return;

      try {
        await addDoc(collection(db, "job_applications"), {
            jobId: selectedJobForBid.id, 
            jobTitle: selectedJobForBid.title,
            shipperId: selectedJobForBid.createdByUID,
            driverId: user.uid, 
            driverName: `${user.name} ${user.surname}`,
            driverPhone: user.phone || "555-0000",
            plate: user.plate,
            offerPrice: Number(bidAmount), // Sürücünün teklifi
            originalPrice: Number(selectedJobForBid.price),
            status: 'PENDING', 
            appliedAt: serverTimestamp()
        });
        
        // Başvuru sayısını artır (Opsiyonel ama iyi olur)
        await updateDoc(doc(db, "available_jobs", selectedJobForBid.id), {
            applicantCount: (selectedJobForBid.applicantCount || 0) + 1
        });

        alert("✅ Teklifiniz firmaya iletildi!");
        setShowBidModal(false);
        setBidAmount('');
        setSelectedJobForBid(null);
      } catch(e) {
          alert("Hata: " + e.message);
      }
  };

  // 3. BAŞVURU SİLME (YENİ)
  const handleDeleteApplication = async (appId) => {
      if(!confirm("Bu başvuruyu listeden silmek istiyor musunuz?")) return;
      try {
          await deleteDoc(doc(db, "job_applications", appId));
      } catch(e) {
          console.error(e);
          alert("Silinemedi: " + e.message);
      }
  };

  // 4. DURUM DEĞİŞTİRME
  const handleStatusChange = async (newStatus) => {
      if(!user.plate) return alert("Profilinizde plaka tanımlı değil!");
      try {
          await updateDoc(doc(db, "truck_locations", user.plate), {
              status: newStatus,
              updatedAt: serverTimestamp()
          });
          setDriverStatus(newStatus);
      } catch(e) { console.error(e); }
  };

  // 5. GÖREV İLERLETME
  const advanceJobStatus = async () => {
      if(!activeJob) return;
      let nextStatus = '';
      if(activeJob.status === 'ASSIGNED') nextStatus = 'PICKUP'; 
      else if(activeJob.status === 'PICKUP') nextStatus = 'ON_WAY'; 
      else if(activeJob.status === 'ON_WAY') nextStatus = 'COMPLETED'; 

      if(nextStatus === 'COMPLETED') {
          if(!confirm("Yükü teslim ettiğinizi onaylıyor musunuz?")) return;
      }

      // DÜZELTİLDİ: writeBatch kullanımı
      const batch = writeBatch(db);
      
      const jobRef = doc(db, "available_jobs", activeJob.id);
      batch.update(jobRef, { status: nextStatus });
      
      if(user.plate) {
          const truckRef = doc(db, "truck_locations", user.plate);
          const truckStatus = nextStatus === 'COMPLETED' ? 'EMPTY' : 'FULL';
          batch.update(truckRef, { status: truckStatus });
      }

      await batch.commit(); // Batch işlemini uygula

      if(nextStatus === 'COMPLETED') {
          alert("Tebrikler Kaptan! Görev tamamlandı.");
          setDriverStatus('EMPTY');
      }
  };

  if (loading) return <div className="min-h-screen bg-[#0a192f] flex items-center justify-center text-white">Yükleniyor...</div>;

  return (
    <div className="min-h-screen bg-[#0a192f] font-sans text-slate-200 pb-20 relative">
      <Head><title>Sürücü Paneli | Freelog</title></Head>
      <Navbar />

      <main className="container mx-auto px-4 pb-20" style={{ paddingTop: '180px' }}>
         
         {/* ÜST BİLGİ KARTI */}
         <div className="bg-[#112240] rounded-2xl p-6 border border-slate-700 mb-6 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl">
            <div className="flex items-center gap-4">
                <div className="relative">
                    <div className="w-16 h-16 rounded-full border-2 border-orange-500 overflow-hidden bg-slate-800 flex items-center justify-center">
                        {user.photoURL ? (
                            <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                            <span className="text-2xl font-bold text-slate-400">{user.name?.charAt(0)}</span>
                        )}
                    </div>
                    <div className="absolute bottom-1 right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-[#112240]"></div>
                </div>
                <div>
                    <h1 className="text-xl font-bold text-white">Merhaba, {user.name} {user.surname}</h1>
                    <div className="text-sm text-slate-400 font-mono mt-1 flex items-center gap-2">
                        <span className="bg-slate-700 px-2 rounded text-xs text-white">{user.plate || "PLAKA YOK"}</span>
                        <span>•</span>
                        <span>{user.licenseClass || "Sınıf Yok"} Ehliyet</span>
                    </div>
                </div>
            </div>

            <div className="flex bg-[#0a192f] p-1 rounded-lg border border-slate-600">
                <button onClick={() => handleStatusChange('EMPTY')} className={`px-4 py-2 rounded text-xs font-bold transition ${driverStatus === 'EMPTY' ? 'bg-green-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}>MÜSAİT</button>
                <button onClick={() => handleStatusChange('FULL')} className={`px-4 py-2 rounded text-xs font-bold transition ${driverStatus === 'FULL' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}>YÜKTE</button>
                <button onClick={() => handleStatusChange('SOS')} className={`px-4 py-2 rounded text-xs font-bold transition ${driverStatus === 'SOS' ? 'bg-red-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}>SOS</button>
            </div>
         </div>

         {/* MENÜ */}
         <div className="flex overflow-x-auto gap-3 mb-6 pb-2">
            <NavBtn id="cockpit" icon="🚀" label="Kokpit" active={activeTab} onClick={setActiveTab} />
            <NavBtn id="market" icon="📦" label="Yük Borsası" active={activeTab} onClick={setActiveTab} />
            <NavBtn id="applications" icon="📝" label="Başvurularım" active={activeTab} onClick={setActiveTab} />
            <NavBtn id="wallet" icon="💰" label="Cüzdan" active={activeTab} onClick={setActiveTab} />
         </div>

         {/* --- 1. KOKPİT --- */}
         {activeTab === 'cockpit' && (
             <div className="grid md:grid-cols-3 gap-6">
                 <div className="md:col-span-1 space-y-4">
                     {activeJob ? (
                         <div className="bg-[#112240] border border-orange-500/50 rounded-2xl p-6 relative overflow-hidden shadow-lg">
                             <div className="absolute top-0 left-0 w-full h-1 bg-orange-500 animate-pulse"></div>
                             <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h2 className="text-lg font-bold text-white">AKTİF GÖREV</h2>
                                    <p className="text-xs text-orange-400 font-bold uppercase">{activeJob.status === 'ASSIGNED' ? 'Yükleme Bekleniyor' : activeJob.status === 'ON_WAY' ? 'Yolda' : 'Teslimatta'}</p>
                                </div>
                                <div className="bg-orange-500/10 text-orange-500 p-2 rounded-lg">🔥</div>
                             </div>
                             
                             <div className="space-y-6 relative">
                                 <div className="absolute left-[7px] top-3 bottom-3 w-0.5 bg-slate-600 border-l border-dashed border-slate-500"></div>
                                 <div className="relative pl-6">
                                     <div className="absolute left-0 top-1 w-4 h-4 bg-slate-800 border-2 border-blue-500 rounded-full z-10"></div>
                                     <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">YÜKLEME NOKTASI</div>
                                     <div className="text-sm font-bold text-white">{activeJob.pickupName}</div>
                                 </div>
                                 <div className="relative pl-6">
                                     <div className="absolute left-0 top-1 w-4 h-4 bg-slate-800 border-2 border-green-500 rounded-full z-10"></div>
                                     <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">TESLİMAT NOKTASI</div>
                                     <div className="text-sm font-bold text-white">{activeJob.destName}</div>
                                 </div>
                             </div>

                             <div className="mt-6 pt-4 border-t border-slate-700">
                                 <div className="flex justify-between items-center mb-4 bg-black/20 p-3 rounded-lg">
                                     <span className="text-slate-400 text-xs font-bold uppercase">Kazanç</span>
                                     <span className="text-xl font-mono font-bold text-green-400">{activeJob.price} TL</span>
                                 </div>
                                 <button onClick={advanceJobStatus} className="w-full py-3 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white font-bold rounded-xl shadow-lg transition active:scale-95">
                                    {activeJob.status === 'ASSIGNED' ? 'YÜKLEMEYE GİDİYORUM 🚚' : 
                                     activeJob.status === 'PICKUP' ? 'YÜKÜ ALDIM, YOLA ÇIKTIM 🏁' : 
                                     'TESLİM ETTİM, BİTİR ✅'}
                                 </button>
                             </div>
                         </div>
                     ) : (
                         <div className="bg-[#112240] border border-slate-700 rounded-2xl p-8 text-center flex flex-col items-center justify-center h-full min-h-[300px]">
                             <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center text-4xl mb-4 text-slate-600">💤</div>
                             <h3 className="text-white font-bold text-lg mb-2">Boşta bekliyorsunuz</h3>
                             <p className="text-slate-400 text-sm mb-6 max-w-xs">Yeni bir iş almak için yük borsasına göz atın.</p>
                             <button onClick={()=>setActiveTab('market')} className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-xl font-bold text-sm shadow-lg transition">Yük Bul</button>
                         </div>
                     )}
                     <div className="grid grid-cols-2 gap-4">
                         <StatCard title="Aylık Kazanç" val="₺24.500" />
                         <StatCard title="Tamamlanan" val="12 Sefer" />
                     </div>
                 </div>
                 <div className="md:col-span-2 h-[500px] bg-slate-900 rounded-2xl border border-slate-700 overflow-hidden relative shadow-2xl">
                     {activeJob ? (
                         <>
                            <div ref={mapRef} className="w-full h-full" />
                            <div className="absolute bottom-4 left-4 right-4 bg-black/80 backdrop-blur-md p-4 rounded-xl border border-white/10 flex justify-between items-center shadow-lg">
                                <div><div className="text-xs text-slate-400 font-bold uppercase">Kalan Mesafe</div><div className="text-white font-mono font-bold text-lg">{activeJob.distance || "..."}</div></div>
                                <button className="bg-white hover:bg-slate-200 text-black px-6 py-3 rounded-xl text-sm font-bold flex items-center gap-2 transition shadow-lg"><span>📍</span> Navigasyon</button>
                            </div>
                         </>
                     ) : (
                         <div className="w-full h-full flex items-center justify-center text-slate-600 flex-col bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]">
                             <div className="text-6xl mb-4 opacity-20">🌍</div>
                             <p className="font-bold text-slate-500">Harita aktif görev alındığında açılır.</p>
                         </div>
                     )}
                 </div>
             </div>
         )}

         {/* --- 2. MARKET (GÜNCELLENDİ: TEKLİF SİSTEMİ) --- */}
         {activeTab === 'market' && (
             <div className="space-y-4">
                 <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2"><span>📦</span> Açık İlanlar</h2>
                 {marketJobs.length === 0 && <div className="text-slate-500 text-center py-10 border border-dashed border-slate-700 rounded-xl">Uygun yük bulunamadı.</div>}
                 {marketJobs.map(job => (
                     <div key={job.id} className="bg-[#112240] border border-slate-700 p-6 rounded-2xl hover:border-blue-500 transition group flex flex-col md:flex-row items-center justify-between gap-6 shadow-lg">
                         <div className="flex items-center gap-5 w-full md:w-auto">
                             <div className="w-14 h-14 bg-[#0a192f] rounded-xl flex items-center justify-center text-2xl group-hover:bg-blue-600/20 group-hover:text-blue-400 transition">📦</div>
                             <div>
                                 <h3 className="font-bold text-white text-lg">{job.title}</h3>
                                 <div className="text-sm text-slate-400 flex items-center gap-2 mt-1">
                                     <span className="font-bold text-white">{job.pickupName}</span> <span className="text-slate-600">➔</span> <span className="font-bold text-white">{job.destName}</span>
                                 </div>
                                 <div className="flex gap-3 mt-2">
                                     <span className="text-[10px] bg-slate-700 text-slate-300 px-2 py-0.5 rounded font-bold">{job.tonnage} Ton</span>
                                     <span className="text-[10px] bg-slate-700 text-slate-300 px-2 py-0.5 rounded font-bold">{job.distance}</span>
                                 </div>
                             </div>
                         </div>
                         <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end">
                             <div className="text-right">
                                 <div className="text-xs text-slate-500 uppercase font-bold">Fiyat</div>
                                 <div className="text-2xl font-mono font-bold text-green-400">{job.price} TL</div>
                             </div>
                             {myApplications.find(a => a.jobId === job.id) ? (
                                 <button disabled className="bg-slate-700 text-slate-400 px-6 py-3 rounded-xl font-bold text-sm cursor-not-allowed">BAŞVURULDU</button>
                             ) : (
                                 // BURASI GÜNCELLENDİ: Modal Aç
                                 <button onClick={() => handleOpenBidModal(job)} className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-xl font-bold text-sm shadow-lg transition transform active:scale-95">TEKLİF VER</button>
                             )}
                         </div>
                     </div>
                 ))}
             </div>
         )}

         {/* --- 3. BAŞVURULARIM (GÜNCELLENDİ: SİLME BUTONU) --- */}
         {activeTab === 'applications' && (
             <div className="space-y-4">
                 <h2 className="text-xl font-bold text-white mb-4">Başvuru Geçmişi</h2>
                 {myApplications.length === 0 && <div className="text-slate-500 text-center py-10 border border-dashed border-slate-700 rounded-xl">Henüz başvuru yapmadınız.</div>}
                 {myApplications.map(app => (
                     <div key={app.id} className="bg-[#112240] border border-slate-700 p-5 rounded-xl flex justify-between items-center hover:bg-slate-800/50 transition">
                         <div>
                             <div className="font-bold text-white text-lg">{app.jobTitle}</div>
                             <div className="text-xs text-slate-400 mt-1">
                                 Tarih: {app.appliedAt ? new Date(app.appliedAt.seconds * 1000).toLocaleDateString() : '-'} • 
                                 <span className="text-orange-400 font-bold ml-1">Teklifiniz: {app.offerPrice} TL</span>
                             </div>
                         </div>
                         <div className="flex items-center gap-3">
                             <span className={`px-4 py-2 rounded-lg text-xs font-bold tracking-wide shadow-sm ${
                                 app.status === 'PENDING' ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20' :
                                 app.status === 'APPROVED' ? 'bg-green-500/10 text-green-500 border border-green-500/20' :
                                 'bg-red-500/10 text-red-500 border border-red-500/20'
                             }`}>
                                 {app.status === 'PENDING' ? 'BEKLİYOR' : app.status === 'APPROVED' ? 'ONAYLANDI' : 'REDDEDİLDİ'}
                             </span>
                             {/* SİLME BUTONU */}
                             <button onClick={() => handleDeleteApplication(app.id)} className="p-2 bg-slate-800 text-slate-500 hover:bg-red-500 hover:text-white rounded-lg transition" title="Listeden Sil">
                                 🗑️
                             </button>
                         </div>
                     </div>
                 ))}
             </div>
         )}

         {/* --- 4. CÜZDAN --- */}
         {activeTab === 'wallet' && (
             <div className="text-center py-20 bg-[#112240] rounded-2xl border border-slate-700">
                 <div className="text-6xl mb-6">🚧</div>
                 <h2 className="text-2xl font-bold text-white mb-2">Finans Paneli Yakında</h2>
                 <p className="text-slate-400 max-w-md mx-auto">Geliştirme aşamasında.</p>
             </div>
         )}

      </main>

      {/* --- TEKLİF VERME MODALI (POPUP) --- */}
      {showBidModal && selectedJobForBid && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
              <div className="bg-[#112240] w-full max-w-md rounded-2xl border border-slate-700 shadow-2xl overflow-hidden animate-fade-in-up">
                  <div className="p-6">
                      <h3 className="text-xl font-bold text-white mb-1">Teklif Ver</h3>
                      <p className="text-sm text-slate-400 mb-6">"{selectedJobForBid.title}" için fiyat teklifinizi girin.</p>
                      
                      <div className="bg-[#0a192f] p-4 rounded-xl border border-slate-700 mb-6">
                          <div className="flex justify-between text-sm mb-2">
                              <span className="text-slate-400">İlan Fiyatı:</span>
                              <span className="text-green-400 font-bold decoration-dotted underline">{selectedJobForBid.price} TL</span>
                          </div>
                          <div className="flex justify-between text-sm">
                              <span className="text-slate-400">Mesafe:</span>
                              <span className="text-white">{selectedJobForBid.distance}</span>
                          </div>
                      </div>

                      <form onSubmit={handleSubmitBid}>
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Sizin Teklifiniz (TL)</label>
                          <input 
                              type="number" 
                              required
                              value={bidAmount}
                              onChange={(e) => setBidAmount(e.target.value)}
                              className="w-full bg-[#0a192f] border border-slate-500 rounded-xl px-4 py-3 text-white text-lg font-bold focus:border-orange-500 outline-none mb-6"
                              placeholder="Fiyat girin..."
                          />
                          <div className="flex gap-3">
                              <button type="button" onClick={() => setShowBidModal(false)} className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 rounded-xl transition">İPTAL</button>
                              <button type="submit" className="flex-1 bg-orange-600 hover:bg-orange-500 text-white font-bold py-3 rounded-xl shadow-lg transition">TEKLİFİ GÖNDER 🚀</button>
                          </div>
                      </form>
                  </div>
              </div>
          </div>
      )}

      <Footer />
    </div>
  );
}

// --- BİLEŞENLER ---
function NavBtn({ id, icon, label, active, onClick }) {
    return (
        <button 
           onClick={() => onClick(id)}
           className={`px-6 py-3 rounded-xl border transition-all duration-300 flex items-center gap-3 whitespace-nowrap min-w-[140px] justify-center shadow-md
           ${active === id ? 'bg-orange-600 text-white border-orange-500 scale-105' : 'bg-[#112240] border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-white'}`}
        >
            <span className="text-lg">{icon}</span>
            <span className="font-bold text-sm">{label}</span>
        </button>
    )
}

function StatCard({ title, val }) {
    return (
        <div className="bg-[#112240] border border-slate-700 p-4 rounded-xl text-center shadow-lg hover:border-slate-500 transition">
            <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">{title}</div>
            <div className="text-2xl font-mono font-bold text-white mt-1">{val}</div>
        </div>
    )
}