import { useState, useEffect, useRef } from 'react';
import { 
  doc, 
  getDoc, 
  collection, 
  addDoc, 
  query, 
  where, 
  onSnapshot, 
  serverTimestamp, 
  writeBatch, 
  deleteDoc,
  updateDoc 
} from 'firebase/firestore';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { db, auth } from '../firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import { useAuthModal } from '../context/AuthModalContext';

// Google Maps API Key
const GOOGLE_MAPS_API_KEY = "AIzaSyA5U4UUjpet8KkN1S4R1LjAEtHp9PH2uWI"; 

// Harita Stili (Dark Mode)
const DARK_MAP_STYLE = [
  { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#38414e" }] },
  { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#212a37" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#17263c" }] },
];

export default function YukVerenler() {
  const router = useRouter();
  const { openLogin } = useAuthModal();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // --- VERİ STATE'LERİ ---
  const [myLoads, setMyLoads] = useState([]); 
  const [applications, setApplications] = useState({}); 
  const [activeShipments, setActiveShipments] = useState([]); 
  const [truckLocations, setTruckLocations] = useState({}); 

  // --- REVIZE MODAL STATE'LERİ ---
  const [showReviseModal, setShowReviseModal] = useState(false);
  const [selectedAppForRevise, setSelectedAppForRevise] = useState(null);
  const [reviseAmount, setReviseAmount] = useState('');

  // --- FİLTRELEME STATE'LERİ (GERİ GELDİ) ---
  const [truckFilter, setTruckFilter] = useState('ALL'); 
  const [searchPlate, setSearchPlate] = useState('');

  // --- HARİTA STATE'LERİ ---
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markersRef = useRef({});
  const directionsService = useRef(null);
  const directionsRenderer = useRef(null);
  const infoWindowRef = useRef(null);

  // 1. GÜVENLİK VE GİRİŞ KONTROLÜ
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        router.push('/');
        setTimeout(() => openLogin(), 200);
      } else {
        const userDoc = await getDoc(doc(db, "users", currentUser.uid));
        if (userDoc.exists() && (userDoc.data().role === 'shipper' || userDoc.data().role === 'admin')) {
          setUser({ ...currentUser, ...userDoc.data() });
          setLoading(false);
        } else {
          alert("Erişim yetkiniz yok.");
          router.push('/');
        }
      }
    });
    return () => unsubscribe();
  }, [router]);

  // 2. VERİ DİNLEME
  useEffect(() => {
    if (!user) return;

    // A) İLANLARIM
    const qJobs = query(collection(db, "available_jobs"), where("createdByUID", "==", user.uid));
    const unsubJobs = onSnapshot(qJobs, (snapshot) => {
      const loads = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      loads.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
      setMyLoads(loads);
      
      // "GOING_TO_PICKUP" ve "LOADING" statülerini de ekledik.
      // Artık araç yük almaya giderken de haritada canlı görünecek.
      setActiveShipments(loads.filter(l => [
          'ASSIGNED', 
          'PICKUP', 
          'GOING_TO_PICKUP', 
          'LOADING',         
          'ON_WAY', 
          'FULL'
      ].includes(l.status)));
    });

    // B) BAŞVURULAR
    const qApps = query(collection(db, "job_applications"), where("shipperId", "==", user.uid));
    const unsubApps = onSnapshot(qApps, (snapshot) => {
      const apps = {};
      snapshot.docs.forEach(doc => {
        const data = doc.data();
        if (!apps[data.jobId]) apps[data.jobId] = [];
        apps[data.jobId].push({ id: doc.id, ...data });
      });
      setApplications(apps);
    });

    // C) ARAÇ KONUMLARI
    const unsubTrucks = onSnapshot(collection(db, "truck_locations"), (snapshot) => {
      const locs = {};
      snapshot.docs.forEach(doc => { locs[doc.id] = doc.data(); });
      setTruckLocations(locs);
    });

    return () => { unsubJobs(); unsubApps(); unsubTrucks(); };
  }, [user]);

  // 3. HARİTA YÜKLEME
  useEffect(() => {
    if (activeTab !== 'dashboard' || loading) return;
    const initMap = () => {
      if (!mapRef.current || mapInstance.current) return;
      mapInstance.current = new google.maps.Map(mapRef.current, {
        center: { lat: 39.0, lng: 35.0 },
        zoom: 6,
        styles: DARK_MAP_STYLE,
        disableDefaultUI: true,
      });
      directionsService.current = new google.maps.DirectionsService();
      directionsRenderer.current = new google.maps.DirectionsRenderer({
        map: mapInstance.current, suppressMarkers: true, polylineOptions: { strokeColor: "#f97316", strokeWeight: 4 }
      });
      infoWindowRef.current = new google.maps.InfoWindow();
    };

    if (!window.google) {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places,geometry`;
      script.async = true; script.defer = true; script.onload = initMap;
      document.body.appendChild(script);
    } else { initMap(); }
  }, [activeTab, loading]);

  // 4. HARİTA MARKER GÜNCELLEME (REVİZE EDİLDİ)
  useEffect(() => {
    // Harita veya veri yoksa çalışma
    if (!mapInstance.current || activeShipments.length === 0) return;

    // A) Debug için verileri kontrol edelim (F12 Konsoluna bak)
    console.log("Aktif Sefer Sayısı:", activeShipments.length);
    console.log("Mevcut Konum Verileri:", truckLocations);

    // B) Eşleştirme Mantığı
    const myTrucks = activeShipments.map(shipment => {
        // Truck Locations içindeki araçları tarıyoruz
        const truck = Object.values(truckLocations).find(t => t.driverId === shipment.assignedDriverId);
        
        if (!truck) {
            console.warn(`Sürücü ID eşleşmedi veya konum yok: ${shipment.assignedDriverId}`);
            return null;
        }

        // Koordinat Kontrolü (0,0 ise veya yoksa gösterme)
        if (!truck.lat || !truck.lng || (truck.lat === 0 && truck.lng === 0)) {
            console.warn(`Geçersiz koordinat: ${truck.plate}`);
            return null;
        }
        
        // Filtreleme
        const matchesStatus = truckFilter === 'ALL' || truck.status === truckFilter;
        const matchesPlate = (truck.plate || "").toLowerCase().includes(searchPlate.toLowerCase());
        
        if (matchesStatus && matchesPlate) {
            return { ...truck, shipmentInfo: shipment };
        }
        return null;
    }).filter(Boolean);

    console.log("Haritaya Çizilecek Araçlar:", myTrucks);

    // C) Marker Temizliği (Eski araçları sil)
    Object.keys(markersRef.current).forEach(truckId => {
        if (!myTrucks.find(t => t.id === truckId)) {
            if(markersRef.current[truckId]) markersRef.current[truckId].setMap(null);
            delete markersRef.current[truckId];
        }
    });

    // D) İkon Ayarları (NOKTA YERİNE TIR SİMGESİ)
    const getTruckIcon = (status) => {
        let color = "#64748b"; // GRİ (BOŞTA)
        
        if (status === 'SOS') color = "#ef4444"; 
        else if (['FULL', 'ON_WAY'].includes(status)) color = "#3b82f6"; // MAVİ (YÜKTE)
        else if (['ASSIGNED', 'PICKUP', 'GOING_TO_PICKUP', 'LOADING'].includes(status)) color = "#eab308"; // SARI (YÜKE GİDİYOR)

        // TIR SVG PATH
        const truckPath = "M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4zM6 18.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm13.5-9l1.96 2.5H17V9.5h2.5zm-1.5 9c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z";

        return {
            path: truckPath, 
            scale: 1.5, // Boyut ayarı
            fillColor: color, 
            fillOpacity: 1, 
            strokeWeight: 1, 
            strokeColor: "#ffffff",
            anchor: new google.maps.Point(12, 12) // Merkezi ortala
        };
    };

    // E) Markerları Çiz / Güncelle
    myTrucks.forEach(truck => {
      const pos = { lat: truck.lat, lng: truck.lng };
      
      // SÜRÜCÜ ADI KONTROLÜ (Undefined gelirse 'Sürücü' yazsın)
      const driverName = truck.driverName || "Sürücü";

      if (markersRef.current[truck.id]) {
          markersRef.current[truck.id].setPosition(pos);
          markersRef.current[truck.id].setIcon(getTruckIcon(truck.status));
      } else {
          const marker = new google.maps.Marker({
            position: pos, 
            map: mapInstance.current, 
            icon: getTruckIcon(truck.status), 
            title: `Plaka: ${truck.plate}`,
            zIndex: 9999, // <--- KRİTİK: Çizgilerin üstünde dursun
            animation: google.maps.Animation.DROP
          });

          marker.addListener("click", () => {
              infoWindowRef.current.setContent(`
                <div style="color:#333; padding:5px; min-width:160px;">
                   <h3 style="margin:0; font-size:16px; font-weight:bold; color:#0f172a;">${truck.plate}</h3>
                   <div style="font-size:12px; margin-top:5px; color:#64748b; line-height: 1.5;">
                      <strong>Sürücü:</strong> <span style="color:#000;">${driverName}</span><br/>
                      <strong>Hız:</strong> ${truck.speed || 0} km/s<br/>
                      <strong style="color:${truck.status === 'FULL' || truck.status === 'ON_WAY' ? '#3b82f6' : '#eab308'}">
                        ${getTurkishStatus(truck.status)}
                      </strong>
                   </div>
                </div>
              `);
              infoWindowRef.current.open(mapInstance.current, marker);
              if(truck.shipmentInfo) drawRouteOnMap(truck.shipmentInfo);
          });
          
          markersRef.current[truck.id] = marker;
      }
    });
  }, [activeShipments, truckLocations, truckFilter, searchPlate]);

  // --- YARDIMCI FONKSİYONLAR ---
  
  // DÜZELTME 2: Eksik statüler eklendi ve Türkçe yapıldı.
  const getTurkishStatus = (status) => {
      const statusMap = {
          'WAITING': 'SÜRÜCÜ ARANIYOR',
          'ASSIGNED': 'ATANDI / YOLA ÇIKACAK',
          'GOING_TO_PICKUP': 'YÜKLEMEYE GİDİYOR', 
          'PICKUP': 'YÜKLEMEYE GİDİYOR', 
          'LOADING': 'YÜKLENİYOR',              
          'ON_WAY': 'YOLDA / TESLİMATA GİDİYOR',
          'FULL': 'YÜKTE',
          'COMPLETED': 'TAMAMLANDI',
          'EMPTY': 'BOŞTA',
          'SOS': 'ACİL DURUM'
      };
      return statusMap[status] || status;
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    if (!lat1 || !lon1 || !lat2 || !lon2) return "0 km";
    const R = 6371; 
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return (R * c).toFixed(0) + " km";
  };

  // --- İŞLEMLER ---

  const handleDeleteLoad = async (jobId) => {
    if(!confirm("Bu ilanı silmek istediğinize emin misiniz?")) return;
    try { await deleteDoc(doc(db, "available_jobs", jobId)); } catch (e) { alert(e.message); }
  };

  const handleCreateLoad = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());
    const dist = calculateDistance(data.pickupLat, data.pickupLng, data.destLat, data.destLng);

    try {
        await addDoc(collection(db, "available_jobs"), {
            ...data,
            price: Number(data.price), tonnage: Number(data.tonnage),
            pickupLat: parseFloat(data.pickupLat), pickupLng: parseFloat(data.pickupLng),
            destLat: parseFloat(data.destLat), destLng: parseFloat(data.destLng),
            distance: dist, status: "WAITING", 
            createdByUID: user.uid, createdByEmail: user.email, companyName: user.companyName, 
            createdAt: serverTimestamp(), applicantCount: 0
        });
        alert(`✅ İlan oluşturuldu! Mesafe: ${dist}`);
        setActiveTab('loads'); e.target.reset();
    } catch (e) { alert(e.message); }
  };

  const handleRejectDriver = async (appId) => {
      if(!confirm("Teklifi reddetmek istiyor musunuz?")) return;
      try { await updateDoc(doc(db, "job_applications", appId), { status: "REJECTED" }); alert("Teklif reddedildi."); } catch (e) { alert(e.message); }
  };

  const handleOpenRevise = (app) => {
      setSelectedAppForRevise(app);
      setReviseAmount(app.offerPrice || app.originalPrice || "");
      setShowReviseModal(true);
  };

  const handleSubmitRevise = async (e) => {
      e.preventDefault();
      if(!selectedAppForRevise) return;
      try {
          await updateDoc(doc(db, "job_applications", selectedAppForRevise.id), { offerPrice: Number(reviseAmount), isRevisedByShipper: true });
          alert("✅ Revize teklif gönderildi."); setShowReviseModal(false);
      } catch (e) { alert(e.message); }
  };

  const handleApproveDriver = async (jobId, applicant) => {
    const finalPrice = applicant.offerPrice ? applicant.offerPrice : applicant.originalPrice;
    if(!confirm(`${applicant.driverName} için ${finalPrice} TL fiyatı onaylıyor musunuz?`)) return;

    try {
        const batch = writeBatch(db);
        const jobRef = doc(db, "available_jobs", jobId);
        batch.update(jobRef, {
            status: "ASSIGNED", assignedDriverId: applicant.driverId, 
            assignedDriverName: applicant.driverName, price: finalPrice, assignedAt: serverTimestamp()
        });
        const appRef = doc(db, "job_applications", applicant.id);
        batch.update(appRef, { status: "APPROVED" });

        if (applications[jobId]) {
            applications[jobId].filter(a => a.id !== applicant.id).forEach(app => {
                batch.update(doc(db, "job_applications", app.id), { status: "REJECTED" });
            });
        }
        await batch.commit();
        alert(`🚀 Sürücü atandı!`); setActiveTab('dashboard');
    } catch (e) { alert(e.message); }
  };

  const drawRouteOnMap = (job) => {
      if(!directionsService.current || !directionsRenderer.current) return;
      const start = { lat: parseFloat(job.pickupLat), lng: parseFloat(job.pickupLng) };
      const end = { lat: parseFloat(job.destLat), lng: parseFloat(job.destLng) };
      directionsService.current.route({ origin: start, destination: end, travelMode: google.maps.TravelMode.DRIVING }, (res, status) => {
          if (status === google.maps.DirectionsStatus.OK) directionsRenderer.current.setDirections(res);
      });
  };

  if (loading) return <div className="min-h-screen bg-[#0a192f] text-white flex items-center justify-center">Yükleniyor...</div>;

  return (
    <div className="min-h-screen bg-[#0a192f] font-sans text-slate-200 flex flex-col">
      <Head><title>Operasyon Kulesi | Freelog</title></Head>
      <Navbar />

      {/* NAVBAR BOŞLUĞU İÇİN PADDING EKLENDİ */}
      <main className="flex-grow container mx-auto px-4 pb-20" style={{ paddingTop: '140px' }}>
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-8 border-b border-white/10 pb-6">
          <div>
             <h1 className="text-3xl font-bold text-white mb-1">Operasyon Kulesi</h1>
             <p className="text-slate-400 text-sm">Firma: <span className="text-orange-500 font-bold uppercase">{user.companyName || user.email}</span></p>
          </div>
          <div className="flex gap-2">
             <StatCard label="Açık İlan" val={myLoads.filter(l => l.status === 'WAITING').length} />
             <StatCard label="Aktif Sefer" val={activeShipments.length} color="green" />
          </div>
        </div>

        {/* MENÜ */}
        <div className="flex gap-4 mb-6 overflow-x-auto">
           <TabBtn id="dashboard" label="📡 Canlı İzleme & Filo" icon="🌍" active={activeTab} onClick={setActiveTab} />
           <TabBtn id="loads" label="📦 İlan Yönetimi" icon="📋" active={activeTab} onClick={setActiveTab} />
           <TabBtn id="create" label="➕ Yük Ekle" icon="🚚" active={activeTab} onClick={setActiveTab} />
        </div>

        <div className="bg-[#112240] border border-slate-700 rounded-2xl overflow-hidden min-h-[600px] relative shadow-2xl">
          
          {/* 1. DASHBOARD - FİLO FİLTRESİ GERİ GELDİ */}
          {activeTab === 'dashboard' && (
            <div className="flex flex-col md:flex-row h-[600px]">
               <div className="md:w-1/3 border-r border-slate-700 bg-[#0d1b2a] flex flex-col">
                  
                  {/* FİLTRE PANELİ */}
                  <div className="p-4 border-b border-slate-700 bg-[#1b263b]">
                     <h3 className="text-xs font-bold text-white uppercase mb-2">FİLO FİLTRESİ</h3>
                     <input type="text" placeholder="Plaka Ara..." value={searchPlate} onChange={(e) => setSearchPlate(e.target.value)} className="w-full bg-[#0f172a] border border-slate-600 rounded p-1.5 text-xs text-white outline-none mb-2 focus:border-blue-500" />
                     
                     <div className="grid grid-cols-2 gap-1">
                        <FilterBtn label="Tümü" active={truckFilter === 'ALL'} onClick={() => setTruckFilter('ALL')} color="slate" />
                        <FilterBtn label="Yükte" active={truckFilter === 'FULL'} onClick={() => setTruckFilter('FULL')} color="blue" />
                        <FilterBtn label="Gidiyor" active={truckFilter === 'PICKUP'} onClick={() => setTruckFilter('PICKUP')} color="yellow" />
                        <FilterBtn label="Boşta" active={truckFilter === 'EMPTY'} onClick={() => setTruckFilter('EMPTY')} color="gray" />
                     </div>
                  </div>

                  <div className="flex-1 overflow-y-auto p-2 space-y-2">
                     {activeShipments.length === 0 ? <div className="p-4 text-slate-500 text-xs">Aktif sefer yok.</div> : 
                      activeShipments
                      .filter(job => {
                          const truck = Object.values(truckLocations).find(t => t.driverId === job.assignedDriverId);
                          if (!truck) return false;
                          const matchesStatus = truckFilter === 'ALL' || truck.status === truckFilter;
                          const matchesPlate = (truck.plate || "").toLowerCase().includes(searchPlate.toLowerCase());
                          return matchesStatus && matchesPlate;
                      })
                      .map(job => (
                        <div key={job.id} onClick={() => drawRouteOnMap(job)} className="p-3 rounded-lg border border-slate-700 bg-[#112240] hover:border-blue-500 cursor-pointer transition">
                           <div className="flex justify-between font-bold text-white text-sm">
                               <span>{job.assignedDriverName}</span> 
                               <span className="text-xs font-normal text-slate-400">({getTurkishStatus(job.status)})</span>
                           </div>
                           <div className="text-[10px] text-slate-400 mt-1">{job.pickupName} ➔ {job.destName}</div>
                        </div>
                     ))}
                  </div>
               </div>
               <div className="md:w-2/3 relative bg-slate-900"><div ref={mapRef} className="w-full h-full" /></div>
            </div>
          )}

          {/* 2. İLANLAR VE BAŞVURULAR (TÜRKÇE) */}
          {activeTab === 'loads' && (
             <div className="p-6">
                <h2 className="text-xl font-bold text-white mb-6">İlanlarım ve Başvurular</h2>
                <div className="space-y-4">
                   {myLoads.length === 0 && <div className="text-slate-500">İlan yok.</div>}
                   {myLoads.map(job => (
                      <div key={job.id} className="border border-slate-700 bg-[#0a192f] rounded-xl p-4 relative group">
                         {job.status === 'WAITING' && <button onClick={() => handleDeleteLoad(job.id)} className="absolute top-4 right-4 text-slate-500 hover:text-red-500">🗑️</button>}
                         
                         <div className="mb-4">
                             <div className="flex items-center gap-2">
                                 <h3 className="font-bold text-white text-lg">{job.title}</h3> 
                                 <span className={`text-[10px] px-2 rounded font-bold ${job.status === 'WAITING' ? 'bg-yellow-500/20 text-yellow-500' : 'bg-green-500/20 text-green-500'}`}>
                                     {getTurkishStatus(job.status)}
                                 </span>
                             </div>
                             <div className="text-xs text-slate-400">{job.pickupName} ➔ {job.destName} • {job.price} TL</div>
                         </div>

                         {job.status === 'WAITING' && applications[job.id]?.length > 0 && (
                            <div className="mt-4 bg-[#112240] border border-slate-600 rounded-lg p-3">
                               <h4 className="text-xs font-bold text-orange-400 uppercase mb-3">⚡ Gelen Teklifler</h4>
                               <div className="grid md:grid-cols-1 gap-3">
                                  {applications[job.id].filter(a => a.status !== 'REJECTED').map(app => (
                                     <div key={app.id} className="bg-[#0a192f] p-3 rounded border border-slate-700 flex flex-col md:flex-row items-center justify-between gap-4">
                                        <div className="flex items-center gap-3 w-full md:w-auto">
                                           <div className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center text-lg">🚛</div>
                                           <div>
                                              <div className="font-bold text-white text-sm">{app.driverName}</div>
                                              <div className="text-[10px] text-slate-400">{app.plate}</div>
                                              <div className="text-xs mt-1">
                                                  Teklif: <span className={`font-bold ${app.offerPrice < job.price ? 'text-green-400' : 'text-white'}`}>{app.offerPrice || app.originalPrice} TL</span>
                                                  {app.isRevisedByShipper && <span className="text-[9px] text-orange-400 ml-2">(Siz Revize Ettiniz)</span>}
                                              </div>
                                           </div>
                                        </div>
                                        
                                        <div className="flex gap-2 w-full md:w-auto justify-end">
                                            <button onClick={() => handleRejectDriver(app.id)} className="px-3 py-1.5 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded text-xs font-bold transition">
                                                ❌ RED
                                            </button>
                                            <button onClick={() => handleOpenRevise(app)} className="px-3 py-1.5 bg-blue-500/10 text-blue-400 hover:bg-blue-500 hover:text-white rounded text-xs font-bold transition">
                                                🔄 REVIZE
                                            </button>
                                            <button onClick={() => handleApproveDriver(job.id, app)} className="px-4 py-1.5 bg-green-600 hover:bg-green-500 text-white rounded text-xs font-bold transition shadow-lg">
                                                İŞİ VER ✅
                                            </button>
                                        </div>
                                     </div>
                                  ))}
                               </div>
                            </div>
                         )}
                      </div>
                   ))}
                </div>
             </div>
          )}

          {/* 3. YÜK EKLEME (TAM FORM) */}
          {activeTab === 'create' && (
             <div className="p-8 max-w-3xl mx-auto">
                <h2 className="text-2xl font-bold text-white mb-6">Yeni Taşıma İlanı Oluştur</h2>
                <form onSubmit={handleCreateLoad} className="space-y-6">
                   <div className="grid md:grid-cols-2 gap-6">
                      <InputGroup label="Yük Cinsi" name="title" placeholder="Örn: Tekstil Kolileri" required />
                      <InputGroup label="Tonaj (Ton)" name="tonnage" type="number" step="0.1" placeholder="24" required />
                   </div>

                   <div className="p-4 bg-[#0a192f] border border-slate-700 rounded-xl grid md:grid-cols-2 gap-6">
                      <div>
                         <label className="text-xs text-blue-400 font-bold uppercase mb-2 block">Yükleme Noktası</label>
                         <input name="pickupName" placeholder="Adres Tanımı" className="w-full bg-[#112240] border border-slate-600 rounded p-2 text-white text-sm mb-2 outline-none" required />
                         <div className="flex gap-2">
                            <input name="pickupLat" type="number" step="any" placeholder="Enlem (Lat)" className="w-1/2 bg-[#112240] border border-slate-600 rounded p-2 text-white text-xs outline-none" required />
                            <input name="pickupLng" type="number" step="any" placeholder="Boylam (Lng)" className="w-1/2 bg-[#112240] border border-slate-600 rounded p-2 text-white text-xs outline-none" required />
                         </div>
                      </div>
                      <div>
                         <label className="text-xs text-orange-400 font-bold uppercase mb-2 block">Teslimat Noktası</label>
                         <input name="destName" placeholder="Adres Tanımı" className="w-full bg-[#112240] border border-slate-600 rounded p-2 text-white text-sm mb-2 outline-none" required />
                         <div className="flex gap-2">
                            <input name="destLat" type="number" step="any" placeholder="Enlem (Lat)" className="w-1/2 bg-[#112240] border border-slate-600 rounded p-2 text-white text-xs outline-none" required />
                            <input name="destLng" type="number" step="any" placeholder="Boylam (Lng)" className="w-1/2 bg-[#112240] border border-slate-600 rounded p-2 text-white text-xs outline-none" required />
                         </div>
                      </div>
                   </div>

                   <div className="grid md:grid-cols-2 gap-6">
                      <InputGroup label="Teklif Fiyatı (TL)" name="price" type="number" placeholder="25000" required />
                      <div>
                         <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Notlar</label>
                         <textarea name="notes" className="w-full bg-[#0a192f] border border-slate-600 rounded-lg p-3 text-white focus:border-orange-500 outline-none h-[50px] resize-none"></textarea>
                      </div>
                   </div>

                   <button type="submit" className="w-full bg-orange-600 hover:bg-orange-500 text-white font-bold py-4 rounded-xl shadow-lg transition">
                      SİSTEME KAYDET VE YAYINLA
                   </button>
                </form>
             </div>
          )}
        </div>
      </main>

      {/* --- REVIZE MODALI --- */}
      {showReviseModal && selectedAppForRevise && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
              <div className="bg-[#112240] w-full max-w-md rounded-2xl border border-slate-700 shadow-2xl animate-fade-in-up p-6">
                  <h3 className="text-xl font-bold text-white mb-1">Karşı Teklif (Revize)</h3>
                  <p className="text-sm text-slate-400 mb-6">{selectedAppForRevise.driverName} için yeni bir fiyat belirleyin.</p>
                  
                  <div className="bg-[#0a192f] p-3 rounded-lg mb-4 text-sm flex justify-between">
                       <span className="text-slate-400">Sürücünün Son Teklifi:</span>
                       <span className="text-white font-bold">{selectedAppForRevise.offerPrice || selectedAppForRevise.originalPrice} TL</span>
                  </div>

                  <form onSubmit={handleSubmitRevise}>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Sizin Yeni Fiyatınız</label>
                      <input 
                          type="number" required value={reviseAmount} onChange={(e) => setReviseAmount(e.target.value)}
                          className="w-full bg-[#0a192f] border border-slate-500 rounded-xl px-4 py-3 text-white text-lg font-bold focus:border-orange-500 outline-none mb-6"
                      />
                      <div className="flex gap-3">
                          <button type="button" onClick={() => setShowReviseModal(false)} className="flex-1 bg-slate-700 text-white font-bold py-3 rounded-xl">İPTAL</button>
                          <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl">KAYDET 💾</button>
                      </div>
                  </form>
              </div>
          </div>
      )}

      <Footer />
    </div>
  );
}

// --- BİLEŞENLER ---
function TabBtn({ id, label, icon, active, onClick }) {
   return <button onClick={() => onClick(id)} className={`px-6 py-3 rounded-xl font-bold text-sm transition flex items-center gap-2 ${active === id ? 'bg-orange-600 text-white shadow-lg' : 'bg-[#112240] text-slate-400'}`}><span>{icon}</span> {label}</button>
}
function StatCard({ label, val, color="orange" }) {
   return <div className="bg-[#112240] border border-slate-700 px-4 py-2 rounded-lg text-center"><div className="text-[10px] text-slate-500 font-bold uppercase">{label}</div><div className={`text-xl font-mono font-bold text-${color}-500`}>{val}</div></div>
}
function InputGroup({ label, name, type="text", placeholder, required, step }) {
   return (
      <div>
         <label className="block text-xs font-bold text-slate-500 uppercase mb-2">{label}</label>
         <input name={name} type={type} step={step} placeholder={placeholder} required={required} className="w-full bg-[#0a192f] border border-slate-600 rounded-lg p-3 text-white focus:border-orange-500 outline-none transition" />
      </div>
   )
}
function FilterBtn({ label, active, onClick, color }) {
    const activeClass = color === 'blue' ? 'bg-blue-600 text-white' : 
                        color === 'orange' ? 'bg-orange-600 text-white' :
                        color === 'yellow' ? 'bg-yellow-600 text-white' : // Yeni eklendi
                        color === 'gray' ? 'bg-slate-500 text-white' :    // Yeni eklendi
                        color === 'slate' ? 'bg-slate-600 text-white' : 'bg-slate-500 text-white';
    return (
        <button onClick={onClick} className={`text-[10px] py-1 rounded font-bold transition ${active ? activeClass : 'bg-[#0f172a] border border-slate-700 text-slate-400 hover:bg-slate-800'}`}>
            {label}
        </button>
    )
}