import { useEffect, useRef, useState } from 'react'
import Head from 'next/head'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { useAuthModal } from '../context/AuthModalContext';


// --- SABİT VERİ HAVUZU (8 FARKLI ARAÇ) ---
// Kral, buradaki araçları çeşitlendirdim. Hepsi farklı plaka ve isimde.
const DRIVER_POOL = [
  // 1. MEHMET YILMAZ (Demo Kahramanı - İstanbul) -> ID: 1 ÖNEMLİ
  { id: 1, name: "Mehmet Yılmaz", plate: "34 VR 101", lat: 41.0082, lng: 28.9784, status: "PICKUP", heading: 90, rating: "4.9", image: "https://randomuser.me/api/portraits/men/32.jpg" },
  // Diğer Araçlar
  { id: 2, name: "Ayşe Demir", plate: "06 AB 202", lat: 39.9, lng: 32.8, status: "EMPTY", heading: 0, rating: "5.0", image: "https://randomuser.me/api/portraits/women/44.jpg" }, // Ankara
  { id: 3, name: "Caner Erkin", plate: "35 KSK 35", lat: 38.4, lng: 27.1, status: "FULL", heading: 180, rating: "4.7", image: "https://randomuser.me/api/portraits/men/85.jpg" }, // İzmir
  { id: 4, name: "Murat Şahin", plate: "16 BUR 16", lat: 40.2, lng: 29.0, status: "LOADING", heading: 45, rating: "4.8", image: "https://randomuser.me/api/portraits/men/22.jpg" }, // Bursa
  { id: 5, name: "Selin Yücel", plate: "07 ANT 07", lat: 36.9, lng: 30.7, status: "TRANSIT", heading: 120, rating: "4.9", image: "https://randomuser.me/api/portraits/women/65.jpg" }, // Antalya
  { id: 6, name: "Hakan Çalhanoğlu", plate: "55 SAM 55", lat: 41.3, lng: 36.3, status: "PICKUP", heading: 270, rating: "4.6", image: "https://randomuser.me/api/portraits/men/11.jpg" }, // Samsun
  { id: 7, name: "Zeynep Kaya", plate: "27 GAZ 27", lat: 37.0, lng: 37.4, status: "EMPTY", heading: 90, rating: "5.0", image: "https://randomuser.me/api/portraits/women/29.jpg" }, // Gaziantep
  { id: 8, name: "Oğuzhan Özyakup", plate: "61 TS 61", lat: 41.0, lng: 39.7, status: "FULL", heading: 300, rating: "4.8", image: "https://randomuser.me/api/portraits/men/55.jpg" }, // Trabzon
];

// --- HARİTA STİLİ (DARK MODE) ---
const DARK_MAP_STYLE = [
  { elementType: "geometry", stylers: [{ color: "#1e293b" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#334155" }] },
  { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#334155" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#0f172a" }] },
];

const GOOGLE_MAPS_API_KEY = "AIzaSyA5U4UUjpet8KkN1S4R1LjAEtHp9PH2uWI"; 

export default function NasilCalisir() {
  const { openRegister } = useAuthModal();
  // --- STATE ---
  const [isSimulating, setIsSimulating] = useState(false);
  const [demoStatus, setDemoStatus] = useState("IDLE");
  const [selectedTruck, setSelectedTruck] = useState(null); 
  const [activeFilter, setActiveFilter] = useState("ALL"); 
  
  // Referanslar
  const mapRef = useRef(null) 
  const mapInstance = useRef(null) 
  const demoMarker = useRef(null) 
  const dummyMarkers = useRef([]) 
  const poiMarkers = useRef([])
  const directionsService = useRef(null)
  const directionsRenderer = useRef(null)
  const simulationInterval = useRef(null)

  // --- HARİTA BAŞLATMA ---
  useEffect(() => {
    const initializeMap = () => {
      if (!mapRef.current || mapInstance.current) return;

      try {
        mapInstance.current = new google.maps.Map(mapRef.current, {
          center: { lat: 39.0, lng: 35.0 }, // Türkiye Ortası
          zoom: 6,
          disableDefaultUI: true, 
          styles: DARK_MAP_STYLE,
          backgroundColor: '#0a192f',
        });

        directionsService.current = new google.maps.DirectionsService();
        directionsRenderer.current = new google.maps.DirectionsRenderer({
          map: mapInstance.current,
          suppressMarkers: true,
          preserveViewport: true,
          polylineOptions: { strokeColor: "#3b82f6", strokeWeight: 4 } // Mavi Rota
        });

        // Ortam şenlensin diye rastgele araçlar ekle
        addStaticTrucks();

      } catch (error) {
        console.error("Harita hatası:", error);
      }
    };

    const loadScript = () => {
      if (window.google && window.google.maps) { initializeMap(); return; }
      const existingScript = document.getElementById('googleMapsScript');
      if (existingScript) { existingScript.addEventListener('load', initializeMap); return; }
      const script = document.createElement('script');
      script.id = 'googleMapsScript';
      script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places,geometry`;
      script.async = true; script.defer = true; script.onload = initializeMap;
      document.body.appendChild(script);
    };

    loadScript();

    return () => {
      if (simulationInterval.current) clearInterval(simulationInterval.current);
    };
  }, []);

  // --- FİLTRELEME MANTIĞI ---
  useEffect(() => {
    dummyMarkers.current.forEach(marker => {
        // Simülasyon sırasında Mehmet Yılmaz (ID 1) gizli kalmalı, çünkü o hareket ediyor
        if(isSimulating && marker.customData.id === 1) {
            marker.setVisible(false);
            return;
        }

        const status = marker.customData.status;
        let isVisible = true;
        if (activeFilter === "EMPTY" && status !== "EMPTY") isVisible = false;
        if (activeFilter === "FULL" && status !== "FULL") isVisible = false;
        if (activeFilter === "LOADING" && status !== "LOADING") isVisible = false;
        marker.setVisible(isVisible);
    });
  }, [activeFilter, isSimulating]);

  // --- SİMÜLASYON BAŞLAT (ARTIK MEHMET YILMAZ SÜRÜYOR) ---
  const startSimulation = () => {
    if(isSimulating) return;
    setIsSimulating(true);
    setDemoStatus("PICKUP");
    
    // 1. DRIVER_POOL'dan ID'si 1 olan Mehmet Yılmaz'ı bul
    const mehmetProfile = DRIVER_POOL.find(d => d.id === 1);
    
    if (!mehmetProfile) return; // Güvenlik

    // Kartı Aç
    setSelectedTruck({
        ...mehmetProfile,
        pickup: "Gebze Lojistik",
        dest: "Ankara Merkez",
        policy: "ALLIANZ-TR-2025"
    });

    // Haritadaki Statik Mehmet'i Gizle (Çünkü hareketli olan gelecek)
    const staticMehmet = dummyMarkers.current.find(m => m.customData.id === 1);
    if(staticMehmet) staticMehmet.setVisible(false);

    // Rota: İstanbul -> Gebze -> Ankara
    const points = {
        start: { lat: 41.0082, lng: 28.9784 }, 
        pickup: { lat: 40.8028, lng: 29.4307 }, 
        dest: { lat: 39.9334, lng: 32.8597 }    
    };

    if(mapInstance.current) {
        mapInstance.current.setZoom(8);
        mapInstance.current.panTo(points.pickup);
    }

    if(directionsService.current) {
        directionsService.current.route(
        {
            origin: points.start,
            destination: points.dest,
            waypoints: [{ location: points.pickup, stopover: true }],
            travelMode: google.maps.TravelMode.DRIVING
        },
        (result, status) => {
            if (status === google.maps.DirectionsStatus.OK) {
                directionsRenderer.current.setDirections(result);
                drawStationMarkers(points.pickup, points.dest);
                const path = result.routes[0].overview_path; 
                // Mehmet Profilini animasyona gönder
                animateTruckOnPath(path, mehmetProfile);
            }
        });
    }
  };

  const drawStationMarkers = (pickupPos, destPos) => {
      poiMarkers.current.forEach(m => m.setMap(null));
      poiMarkers.current = [];

      const pickupMarker = new google.maps.Marker({
        position: pickupPos, map: mapInstance.current,
        label: { text: "📦", fontSize: "24px" },
        icon: { path: google.maps.SymbolPath.CIRCLE, scale: 0 }, zIndex: 100
      });
      const destMarker = new google.maps.Marker({
        position: destPos, map: mapInstance.current,
        label: { text: "🏁", fontSize: "24px" },
        icon: { path: google.maps.SymbolPath.CIRCLE, scale: 0 }, zIndex: 100
      });
      poiMarkers.current.push(pickupMarker, destMarker);
  }

  const animateTruckOnPath = (path, profile) => {
    if(demoMarker.current) demoMarker.current.setMap(null);
    
    demoMarker.current = new google.maps.Marker({
      position: path[0],
      map: mapInstance.current,
      icon: getIcon("PICKUP", 90),
      // Burada profile.plate (34 VR 101) yazacak
      label: { text: profile.plate, color: "white", fontSize: "10px", className: "bg-orange-600 px-2 rounded font-bold" },
      zIndex: 999
    });

    // Demo Araca Tıklayınca Kartı Aç
    demoMarker.current.addListener("click", () => {
        setSelectedTruck({ ...profile, status: demoStatus }); // Güncel status ile aç
    });

    let step = 0;
    let isWaiting = false;
    let waitCounter = 0;

    simulationInterval.current = setInterval(() => {
        if (step >= path.length - 1) { endSimulation(); return; }

        const progress = step / path.length;
        const pos = path[step];
        const nextPos = path[step + 1]; 
        let heading = google.maps.geometry.spherical.computeHeading(pos, nextPos);
        let currentStatus = "PICKUP";

        // DURUM BELİRLEME
        if (progress < 0.15 && !isWaiting) {
             currentStatus = "PICKUP";
        } 
        else if (progress >= 0.15 && progress < 0.16 && !isWaiting && waitCounter === 0) {
             isWaiting = true;
             currentStatus = "LOADING";
        }
        
        if (isWaiting) {
            waitCounter++;
            currentStatus = "LOADING";
            if (waitCounter > 20) isWaiting = false;
            else { 
                // Kart açıksa güncelle
                if(selectedTruck && selectedTruck.id === 1) {
                    setSelectedTruck(prev => ({...prev, status: "LOADING", speed: 0}));
                }
                return; 
            }
        }

        if (!isWaiting && progress >= 0.16 && progress < 0.95) {
             currentStatus = "TRANSIT";
        } 
        else if (progress >= 0.95) {
             currentStatus = "DELIVERED";
        }

        setDemoStatus(currentStatus);
        
        // Marker Güncelle
        if(demoMarker.current) {
            demoMarker.current.setPosition(pos);
            demoMarker.current.setIcon(getIcon(currentStatus, heading));
        }

        // Kart Açık İse Verileri Canlı Güncelle
        if(selectedTruck && selectedTruck.id === 1) {
            setSelectedTruck(prev => ({
                ...prev, 
                status: currentStatus,
                speed: currentStatus === "LOADING" ? 0 : (80 + Math.random() * 10).toFixed(0)
            }));
        }

        step++;
    }, 50);
  };

  const endSimulation = () => {
      clearInterval(simulationInterval.current);
      setTimeout(() => {
          setIsSimulating(false);
          setDemoStatus("IDLE");
          if(directionsRenderer.current) directionsRenderer.current.setDirections({ routes: [] });
          if(demoMarker.current) demoMarker.current.setMap(null);
          poiMarkers.current.forEach(m => m.setMap(null));
          setSelectedTruck(null);
          
          // Statik Mehmet'i geri getir
          const staticMehmet = dummyMarkers.current.find(m => m.customData.id === 1);
          if(staticMehmet) staticMehmet.setVisible(true);

          if(mapInstance.current) {
              mapInstance.current.setZoom(6);
              mapInstance.current.panTo({ lat: 39.0, lng: 35.0 });
          }
      }, 3000);
  }

  // --- STATİK ARAÇLARI EKLE ---
  const addStaticTrucks = () => {
      DRIVER_POOL.forEach((driver) => {
          const marker = new google.maps.Marker({
              position: { lat: driver.lat, lng: driver.lng },
              map: mapInstance.current,
              icon: getIcon(driver.status, driver.heading),
              title: driver.name
          });
          
          marker.customData = driver; // Filtreleme için veriyi sakla

          marker.addListener("click", () => {
              setSelectedTruck({
                  ...driver,
                  pickup: "İstanbul Liman", 
                  dest: "Ankara Depo",
                  policy: "AXA-SIGORTA-24"
              });
          });

          dummyMarkers.current.push(marker);
      });
  }

  // --- RENK PALETİ ---
  const getIcon = (status, heading) => {
    let color = "#64748b"; // GRİ (EMPTY - BOŞ)
    
    // YEŞİL (PICKUP - YÜKLEMEYE GİDİYOR / LOADING - YÜKLENİYOR)
    if (status === "PICKUP" || status === "LOADING") color = "#22c55e"; 
    
    // MAVİ (TRANSIT - YOLDA / FULL - DOLU)
    if (status === "TRANSIT" || status === "FULL" || status === "DELIVERED") color = "#3b82f6"; 
    
    return {
      path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
      scale: 6, fillColor: color, fillOpacity: 1, strokeWeight: 2, strokeColor: "white", rotation: heading
    };
  }

  // --- KART DURUMU METNİ ---
  const getStatusLabel = (status) => {
      if(status === "EMPTY") return { text: "BOŞTA", color: "text-slate-400", bg: "bg-slate-500/10", border: "border-slate-500" };
      if(status === "PICKUP") return { text: "YÜKE GİDİYOR", color: "text-green-400", bg: "bg-green-500/10", border: "border-green-500" };
      if(status === "LOADING") return { text: "YÜKLENİYOR", color: "text-green-400", bg: "bg-green-500/10", border: "border-green-500" };
      if(status === "TRANSIT" || status === "FULL") return { text: "YÜKTE / YOLDA", color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500" };
      if(status === "DELIVERED") return { text: "TESLİM EDİLDİ", color: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500" };
      return { text: "BİLİNMİYOR", color: "text-gray-400", bg: "bg-gray-500/10", border: "border-gray-500" };
  }

  return (
    <div className="min-h-screen bg-[#0a192f] font-sans text-slate-200 selection:bg-orange-500 selection:text-white overflow-x-hidden">
      <Head>
        <title>Sistem Nasıl Çalışır? | Freelog AI</title>
      </Head>

      <Navbar />

      {/* --- HERO SECTION --- */}
      {/* BURASI DÜZELTİLDİ: pt-32 yerine style ile 180px verildi. Kesin çözüm. */}
      <section 
        className="pb-6 text-center container mx-auto px-6"
        style={{ paddingTop: '180px' }}
      >
        <h1 className="text-3xl md:text-5xl font-bold text-white mb-2">
          Operasyonu <span className="text-orange-500">Canlı İzleyin</span>
        </h1>
        <p className="text-slate-400 text-sm md:text-base max-w-xl mx-auto">
          Freelog ile yükleme anından teslimata kadar tüm süreç dijital ve şeffaf.
        </p>
      </section>

      {/* --- İNTERAKTİF HARİTA (DEMO) --- */}
      <section className="container mx-auto px-6 mb-20 relative">
        <div className="relative rounded-2xl overflow-hidden border border-slate-700 shadow-2xl h-[600px] group">
            
            {/* HARİTA */}
            <div ref={mapRef} className="w-full h-full bg-[#1e293b]" />

            {/* --- ARAÇ DETAY KARTI --- */}
            {selectedTruck && (
              <div className="absolute top-6 left-6 z-20 w-80 animate-fade-in-up">
                 <div className="bg-[#112240]/95 backdrop-blur-md border border-slate-600 rounded-2xl shadow-2xl overflow-hidden">
                    
                    {/* Üst Kısım: Sürücü */}
                    <div className="p-4 border-b border-white/10 flex items-center gap-4">
                       <div className="relative">
                          <img src={selectedTruck.image} alt="Driver" className="w-14 h-14 rounded-full border-2 border-slate-500 object-cover" />
                          <div className="absolute -bottom-1 -right-1 bg-slate-900 text-[10px] text-white px-1.5 rounded border border-slate-500">
                             {selectedTruck.rating} ★
                          </div>
                       </div>
                       <div>
                          <h3 className="font-bold text-white text-lg leading-tight">{selectedTruck.name}</h3>
                          <div className="text-xs text-slate-400 font-mono mt-1">{selectedTruck.plate}</div>
                       </div>
                       <button onClick={() => setSelectedTruck(null)} className="ml-auto text-slate-400 hover:text-white p-2">✕</button>
                    </div>

                    {/* Orta Kısım: Veriler */}
                    <div className="p-4 space-y-3">
                       <div className="flex justify-between items-center bg-black/20 p-2 rounded-lg">
                          <span className="text-xs text-slate-400 uppercase">Hız</span>
                          <span className="font-mono font-bold text-white">{selectedTruck.speed || 0} KM/S</span>
                       </div>
                       
                       {/* Dinamik Durum Badge */}
                       <div className={`flex items-center gap-2 p-2 rounded-lg border ${getStatusLabel(selectedTruck.status).bg} ${getStatusLabel(selectedTruck.status).border}`}>
                          <div className={`w-2 h-2 rounded-full animate-pulse ${selectedTruck.status === 'EMPTY' ? 'bg-slate-400' : selectedTruck.status === 'PICKUP' || selectedTruck.status === 'LOADING' ? 'bg-green-500' : 'bg-blue-500'}`}></div>
                          <span className={`text-xs font-bold ${getStatusLabel(selectedTruck.status).color}`}>
                             {getStatusLabel(selectedTruck.status).text}
                          </span>
                       </div>

                       {selectedTruck.status !== 'EMPTY' && (
                           <div className="space-y-1 pt-2">
                              <div className="flex justify-between text-[10px] text-slate-400">
                                 <span>Nereden:</span>
                                 <span className="text-white">{selectedTruck.pickup}</span>
                              </div>
                              <div className="flex justify-between text-[10px] text-slate-400">
                                 <span>Nereye:</span>
                                 <span className="text-white">{selectedTruck.dest}</span>
                              </div>
                              {selectedTruck.policy && (
                                <div className="mt-2 text-[9px] text-green-400 border border-green-500/20 bg-green-500/5 p-1 rounded text-center">
                                   🛡️ Sigortalı Yük: {selectedTruck.policy}
                                </div>
                              )}
                           </div>
                       )}
                    </div>
                 </div>
              </div>
            )}

            {/* --- ÜST ORTA: SİMÜLASYON KONTROL --- */}
            <div className="absolute top-6 left-1/2 -translate-x-1/2 z-10">
                {!isSimulating ? (
                    <button 
                      onClick={startSimulation}
                      className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white px-6 py-2 rounded-full font-bold text-sm shadow-[0_0_20px_rgba(234,88,12,0.5)] transition transform hover:scale-105 flex items-center gap-2"
                    >
                      <span>▶</span> SİMÜLASYONU BAŞLAT
                    </button>
                ) : (
                    <div className="bg-black/70 backdrop-blur px-6 py-2 rounded-full text-orange-500 font-bold text-sm border border-orange-500/30 animate-pulse">
                      SİMÜLASYON AKTİF...
                    </div>
                )}
            </div>

            {/* --- SAĞ ALT: FİLTRELEME (İSİMLER SİLİNDİ) --- */}
            <div className="absolute bottom-6 right-6 z-10 flex flex-col gap-2">
                <div className="bg-[#112240]/90 backdrop-blur p-2 rounded-xl border border-slate-600 shadow-xl flex flex-col gap-1 w-32">
                    <span className="text-[9px] text-slate-500 font-bold uppercase text-center mb-1">Araç Durumu</span>
                    
                    <FilterBtn label="TÜMÜ" color="white" active={activeFilter === "ALL"} onClick={() => setActiveFilter("ALL")} />
                    <FilterBtn label="BOŞTA" color="gray" active={activeFilter === "EMPTY"} onClick={() => setActiveFilter("EMPTY")} />
                    <FilterBtn label="YÜKLEME" color="green" active={activeFilter === "LOADING"} onClick={() => setActiveFilter("LOADING")} />
                    <FilterBtn label="YOLDA" color="blue" active={activeFilter === "FULL"} onClick={() => setActiveFilter("FULL")} />
                </div>
            </div>
        </div>
      </section>

      {/* --- ADIM ADIM SÜREÇ --- */}
      <section className="py-16 bg-[#112240]/30 border-t border-white/5">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8">
            <InfoCard icon="📝" title="1. İlan Oluşturma" desc="Yük veren, panelden yük detaylarını girer. Sistem anında fiyat ve rota önerir." color="orange" />
            <InfoCard icon="🤖" title="2. Akıllı Eşleşme" desc="Freelog AI, konumu en uygun sürücüye bildirimi gönderir. Sürücü tek tuşla kabul eder." color="blue" />
            <InfoCard icon="📡" title="3. Canlı Takip" desc="Haritada gördüğünüz gibi; yükleme anından teslimata kadar araç canlı izlenir." color="green" />
            <InfoCard icon="✅" title="4. Dijital Teslimat" desc="Sürücü teslimat fotoğrafını uygulamadan yükler. Fatura otomatik kesilir." color="purple" />
          </div>
        </div>
      </section>

      {/* --- ALT ÇAĞRI --- */}
      <section className="py-20 text-center">
    <h2 className="text-3xl font-bold text-white mb-6">Sistemi Kullanmaya Hazır mısınız?</h2>
    <div className="flex justify-center gap-4">
        {/* LİNK YERİNE BUTON */}
        <button onClick={openRegister} className="bg-white text-[#0a192f] hover:bg-slate-200 px-8 py-3 rounded-xl font-bold transition">
          Hesap Oluştur
        </button>
    </div>
  </section>

      <Footer />
      
      <style jsx global>{`
        @keyframes fade-in-up {
           from { opacity: 0; transform: translateY(10px); }
           to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up { animation: fade-in-up 0.3s ease-out; }
      `}</style>
    </div>
  )
}

// --- YARDIMCI COMPONENTLER ---

function FilterBtn({ label, color, active, onClick }) {
    const colors = {
        white: "bg-white",
        gray: "bg-slate-500",
        green: "bg-green-500",
        blue: "bg-blue-500"
    };

    return (
        <button 
            onClick={onClick}
            className={`flex items-center justify-between px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all
            ${active ? 'bg-white/10 text-white border border-white/20' : 'text-slate-500 hover:bg-white/5 hover:text-slate-300'}`}
        >
            <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${colors[color]}`}></span>
                {label}
            </div>
            {active && <span>✓</span>}
        </button>
    )
}

function InfoCard({ icon, title, desc, color }) {
    const colors = {
        orange: "group-hover:bg-orange-500",
        blue: "group-hover:bg-blue-500",
        green: "group-hover:bg-green-500",
        purple: "group-hover:bg-purple-500"
    };

    return (
        <div className="bg-[#0a192f] p-6 rounded-2xl border border-slate-700 hover:border-slate-500 transition duration-300 group">
            <div className={`w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center text-2xl mb-4 ${colors[color]} group-hover:text-white transition-colors`}>
              {icon}
            </div>
            <h3 className="text-white font-bold text-lg mb-2">{title}</h3>
            <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
        </div>
    )
}