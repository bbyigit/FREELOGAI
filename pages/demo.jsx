import { useEffect, useRef, useState } from 'react'
import Head from 'next/head'
import Navbar from '../components/Navbar'
import { db } from '../firebaseConfig'
import { collection, onSnapshot } from 'firebase/firestore'

// --- HARİTA STİLLERİ ---
const DARK_MAP_STYLE = [
  { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
  { featureType: "administrative.locality", elementType: "labels.text.fill", stylers: [{ color: "#d59563" }] },
  { featureType: "poi", elementType: "labels", stylers: [{ visibility: "off" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#38414e" }] },
  { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#212a37" }] },
  { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#9ca5b3" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#17263c" }] },
];

const LIGHT_MAP_STYLE = [
  { elementType: "geometry", stylers: [{ color: "#f5f5f5" }] },
  { elementType: "labels.icon", stylers: [{ visibility: "off" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#ffffff" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#c9c9c9" }] },
];

// Google Maps API Anahtarın
const GOOGLE_MAPS_API_KEY = "AIzaSyDPh0Z89MVbMU1_heWaHotFHh5pH7RCEnM"; // Buraya kendi keyini koydugundan emin ol

export default function Demo() {
  // --- STATE ---
  const [isDarkMode, setIsDarkMode] = useState(true)
  const [isCardMinimized, setIsCardMinimized] = useState(false)
  const [selectedTruck, setSelectedTruck] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [activeFilter, setActiveFilter] = useState("ALL")
  
  // Demo Simülasyon State'i
  const [isSimulating, setIsSimulating] = useState(false);

  // Referanslar
  const mapRef = useRef(null) // HTML Div Referansı
  const mapInstance = useRef(null) // Google Map Objesi
  const markers = useRef({})
  const demoMarker = useRef(null) 
  const poiMarkers = useRef([])
  const selectedTruckIdRef = useRef(null)
  const directionsService = useRef(null)
  const directionsRenderer = useRef(null)
  const simulationInterval = useRef(null)

  // --- HARİTA YÜKLEME (SAĞLAMLAŞTIRILMIŞ VERSİYON) ---
  useEffect(() => {
    // 1. Harita Kurulum Fonksiyonu
    const initializeMap = () => {
      // Eğer Div yoksa veya Harita zaten kuruluysa dur.
      if (!mapRef.current || mapInstance.current) return;

      try {
        mapInstance.current = new google.maps.Map(mapRef.current, {
          center: { lat: 39.0, lng: 35.0 },
          zoom: 6,
          disableDefaultUI: true, 
          styles: isDarkMode ? DARK_MAP_STYLE : LIGHT_MAP_STYLE,
        });

        directionsService.current = new google.maps.DirectionsService();
        directionsRenderer.current = new google.maps.DirectionsRenderer({
          map: mapInstance.current,
          suppressMarkers: true,
          polylineOptions: { strokeColor: "#f97316", strokeWeight: 5 }
        });

        // Firebase dinlemeyi başlat
        listenToFirebase();
      } catch (error) {
        console.error("Harita başlatılırken hata oluştu:", error);
      }
    };

    // 2. Script Kontrolü ve Yükleme (Singleton Pattern)
    const loadScript = () => {
      // A. Script zaten varsa ve Google objesi yüklendiyse direkt başlat
      if (window.google && window.google.maps) {
        initializeMap();
        return;
      }

      // B. Script tag'i sayfada var mı kontrol et
      const existingScript = document.getElementById('googleMapsScript');
      
      if (existingScript) {
        // Script var ama belki henüz yüklenmedi, listener ekle
        existingScript.addEventListener('load', initializeMap);
        return;
      }

      // C. Script yoksa sıfırdan oluştur ve ekle
      const script = document.createElement('script');
      script.id = 'googleMapsScript';
      script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places,geometry`;
      script.async = true;
      script.defer = true;
      script.onload = initializeMap;
      script.onerror = () => console.error("Google Maps Script yüklenemedi.");
      
      document.body.appendChild(script);
    };

    // İşlemi Başlat
    loadScript();

    // 3. Cleanup (Sayfadan çıkarken yapılacaklar)
    return () => {
      // Scripti SİLMİYORUZ (Sayfa değişimlerinde tekrar indirmesin diye)
      // Sadece interval ve instance temizliği
      if (simulationInterval.current) clearInterval(simulationInterval.current);
      // Map instance'ı null yapıyoruz ki geri gelince tekrar oluşturabilsin
      mapInstance.current = null; 
    };
  }, []); // Boş dependency array -> Sadece mount anında çalışır.

  // --- TEMA DEĞİŞİMİ ---
  useEffect(() => {
    if (mapInstance.current) {
      mapInstance.current.setOptions({ styles: isDarkMode ? DARK_MAP_STYLE : LIGHT_MAP_STYLE });
    }
  }, [isDarkMode]);

  // --- SİMÜLASYON MODU ---
  const startSimulation = () => {
    if(isSimulating) return;
    setIsSimulating(true);
    
    const points = {
        start: { lat: 41.0082, lng: 28.9784 }, // İstanbul
        pickup: { lat: 40.8028, lng: 29.4307 }, // Gebze
        dest: { lat: 39.9334, lng: 32.8597 }    // Ankara
    };

    if(mapInstance.current) {
        mapInstance.current.setZoom(8);
        mapInstance.current.panTo(points.start);
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
                const path = result.routes[0].overview_path; 
                animateTruckOnPath(path);
            } else {
                alert("Rota hesaplanamadı: " + status);
                setIsSimulating(false);
            }
        }
        );
    }
  };

  const animateTruckOnPath = (path) => {
    if(demoMarker.current) demoMarker.current.setMap(null);
    
    const demoId = "DEMO-34TR100";
    
    demoMarker.current = new google.maps.Marker({
      position: path[0],
      map: mapInstance.current,
      icon: getIcon("GOING_TO_PICKUP", 0),
      title: demoId,
      label: { 
        text: "DEMO", 
        color: "white", 
        fontSize: "10px", 
        className: "bg-orange-600 px-2 rounded-full font-bold" 
      },
      zIndex: 99999
    });

    let step = 0;
    const totalSteps = path.length;
    let currentStatus = "GOING_TO_PICKUP";
    let speed = 90;

    handleMarkerClick(demoId, { 
        lat: path[0].lat(), lng: path[0].lng(), 
        status: currentStatus, speed: 0,
        pickupName: "Gebze Lojistik Depo",
        destinationName: "Ankara Merkez Depo",
        driverName: "Sistem Test Pilotu",
        updatedAt: new Date()
    }, "YÜKE GİDİYOR");

    simulationInterval.current = setInterval(() => {
        if (step >= totalSteps - 1) { 
            endSimulation();
            return;
        }

        const pos = path[step];
        const nextPos = path[step + 1]; 
        
        let heading = 0;
        if (window.google && window.google.maps.geometry) {
            heading = google.maps.geometry.spherical.computeHeading(pos, nextPos);
        }

        const progress = step / totalSteps;

        if (progress < 0.2) {
             currentStatus = "GOING_TO_PICKUP";
             speed = 85 + Math.random() * 5;
        } else if (progress >= 0.2 && progress < 0.25) {
             currentStatus = "LOADING"; 
             speed = 0;
        } else if (progress >= 0.25 && progress < 0.95) {
             currentStatus = "FULL";
             speed = 80 + Math.random() * 10;
        } else {
             currentStatus = "EMPTY"; 
             speed = 0;
        }

        if (demoMarker.current) {
            demoMarker.current.setPosition(pos);
            demoMarker.current.setIcon(getIcon(currentStatus, heading));
        }

        if (selectedTruckIdRef.current === demoId) {
            let statusLabel = "YÜKE GİDİYOR";
            if (currentStatus === "FULL") statusLabel = "YÜKTE";
            if (currentStatus === "EMPTY") statusLabel = "BOŞ";
            if (currentStatus === "LOADING") statusLabel = "YÜKLENİYOR...";
            
            setSelectedTruck(prev => ({
                ...prev,
                lat: pos.lat(), lng: pos.lng(),
                speed: speed,
                status: currentStatus,
                statusLabel: statusLabel
            }));
        }

        step++;
    }, 100); 
  };

  const endSimulation = () => {
      if(simulationInterval.current) clearInterval(simulationInterval.current);
      setIsSimulating(false);
      if(demoMarker.current) demoMarker.current.setMap(null);
      if(directionsRenderer.current) directionsRenderer.current.setDirections({ routes: [] });
      if(selectedTruckIdRef.current === "DEMO-34TR100") {
          setSelectedTruck(null);
          selectedTruckIdRef.current = null;
      }
      alert("🏁 Simülasyon Başarıyla Tamamlandı!");
  }

  // --- ICON HELPER ---
  const getIcon = (status, heading) => {
    let color = "gray";
    if (status === "FULL") color = "#3b82f6";          
    else if (status === "GOING_TO_PICKUP") color = "#a855f7"; 
    else if (status === "EMPTY") color = "#eab308";      
    else if (status === "SOS") color = "#ef4444";        
    else if (status === "LOADING") color = "#10b981";    

    return {
      path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
      scale: 8, 
      fillColor: color,
      fillOpacity: 1,
      strokeWeight: 2,
      strokeColor: "white",
      rotation: heading || 0
    };
  }

  // --- FİLTRELEME MANTIĞI ---
  useEffect(() => {
    if (!mapInstance.current) return;
    Object.keys(markers.current).forEach(id => {
      const marker = markers.current[id];
      const status = marker.customData?.status;
      let isVisible = true;

      if (activeFilter !== "ALL") {
        if (activeFilter === "FULL" && status !== "FULL") isVisible = false;
        if (activeFilter === "EMPTY" && status !== "EMPTY") isVisible = false;
        if (activeFilter === "SOS" && status !== "SOS") isVisible = false;
        if (activeFilter === "PICKUP" && status !== "GOING_TO_PICKUP") isVisible = false;
      }
      marker.setVisible(isVisible);
    });
  }, [activeFilter])

  // --- FIREBASE LISTENERS ---
  const listenToFirebase = () => {
    const unsubscribe = onSnapshot(collection(db, "truck_locations"), (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        let truckData = change.doc.data();
        const truckId = change.doc.id;
        
        if (!truckData.timestamp && !truckData.time && !truckData.lastUpdated) {
            truckData.timestamp = new Date();
        }

        if (change.type === "added" || change.type === "modified") {
          updateMarker(truckId, truckData)
        }
        if (change.type === "removed") {
          removeMarker(truckId)
        }
      })
    })
    return () => unsubscribe() // Bu unsubscribe fonksiyonu useEffect içinde değil, çağırıldığı yerde yönetilmeli
  }

  // --- ARAMA İŞLEVİ ---
  const handleSearch = (e) => {
    e.preventDefault();
    const plate = searchTerm.toUpperCase().trim(); 
    
    if (markers.current[plate]) {
      const marker = markers.current[plate];
      if(mapInstance.current) {
          mapInstance.current.setZoom(14); 
          mapInstance.current.panTo(marker.getPosition());
          new google.maps.event.trigger( marker, 'click' );
      }
    } 
    else if (plate === "DEMO-34TR100" && demoMarker.current) {
       if(mapInstance.current) {
           mapInstance.current.setZoom(14); 
           mapInstance.current.panTo(demoMarker.current.getPosition());
           setSelectedTruckIdRef.current = plate;
       }
    }
    else {
      alert(`"${plate}" plakalı araç şu an haritada bulunamıyor.`);
    }
  }

  // --- MARKER UPDATE ---
  const updateMarker = (id, data) => {
    if (!mapInstance.current || !window.google) return
    const position = { lat: data.lat, lng: data.lng }
    
    let iconColor = "gray";
    let statusLabel = data.status;

    if (data.status === "FULL") { iconColor = "#3b82f6"; statusLabel = "YÜKTE" }          
    else if (data.status === "GOING_TO_PICKUP") { iconColor = "#a855f7"; statusLabel = "YÜKE GİDİYOR" } 
    else if (data.status === "EMPTY") { iconColor = "#eab308"; statusLabel = "BOŞ" }      
    else if (data.status === "SOS") { iconColor = "#ef4444"; statusLabel = "SOS" }        

    const icon = {
      path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
      scale: 6,
      fillColor: iconColor,
      fillOpacity: 1,
      strokeWeight: 2,
      strokeColor: "white",
      rotation: data.heading || 0
    }

    const labelOptions = {
        text: id, 
        color: "white",
        fontSize: "11px",
        fontWeight: "bold",
        className: "bg-slate-900 px-1 rounded shadow-md"
    };

    if (markers.current[id]) {
      markers.current[id].setPosition(position)
      markers.current[id].setIcon(icon)
      markers.current[id].setLabel(labelOptions)
      markers.current[id].customData = data;
      markers.current[id].setVisible(true);

      if (selectedTruckIdRef.current === id) {
         setSelectedTruck(prev => ({ ...prev, ...data, statusLabel }))
      }
    } else {
      const marker = new google.maps.Marker({
        position: position,
        map: mapInstance.current,
        title: id,
        icon: icon,
        label: labelOptions,
        animation: google.maps.Animation.DROP
      })
      marker.customData = data;
      marker.addListener("click", () => handleMarkerClick(id, data, statusLabel))
      markers.current[id] = marker
    }
  }

  const handleMarkerClick = (id, data, statusLabel) => {
    selectedTruckIdRef.current = id;
    setSelectedTruck({ id, ...data, statusLabel })
    setIsCardMinimized(false)
    
    // Rotayı Çiz
    if (id !== "DEMO-34TR100") {
        if (data.status === "GOING_TO_PICKUP" && data.pickupLat) {
            calculateAndDrawRoute({ lat: data.lat, lng: data.lng }, { lat: data.pickupLat, lng: data.pickupLng });
        } else if (data.status === "FULL" && data.destLat) {
            calculateAndDrawRoute({ lat: data.lat, lng: data.lng }, { lat: data.destLat, lng: data.destLng });
        } else {
            if(!isSimulating) clearRouteAndPois();
        }
    }
  }

  const removeMarker = (id) => {
    if (markers.current[id]) {
      markers.current[id].setMap(null)
      delete markers.current[id]
    }
  }

  // --- ROTA & POI YARDIMCILARI ---
  const clearRouteAndPois = () => {
    if (directionsRenderer.current) directionsRenderer.current.setDirections({ routes: [] });
    poiMarkers.current.forEach(m => m.setMap(null));
    poiMarkers.current = [];
  }

  const calculateAndDrawRoute = (origin, destination) => {
    if(!directionsService.current || !origin.lat || !destination.lat) return
    const start = new google.maps.LatLng(parseFloat(origin.lat), parseFloat(origin.lng));
    const end = new google.maps.LatLng(parseFloat(destination.lat), parseFloat(destination.lng));
    directionsService.current.route(
      { origin: start, destination: end, travelMode: google.maps.TravelMode.DRIVING },
      (result, status) => {
        if (status === google.maps.DirectionsStatus.OK) {
          directionsRenderer.current.setDirections(result)
        }
      }
    )
  }

  const formatTime = (data) => {
    if (!data) return "Bilinmiyor";
    const rawTime = data.updatedAt || data.timestamp || data.time;
    if (!rawTime) return "Canlı";
    
    let dateObj;
    if (rawTime.seconds) {
        dateObj = new Date(rawTime.seconds * 1000);
    } else {
        dateObj = new Date(rawTime);
    }
    return dateObj.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  }

  // --- STİL SINIFLARI ---
  const bgClass = isDarkMode ? "bg-[#0a192f] text-slate-200" : "bg-slate-50 text-slate-800";
  const panelClass = isDarkMode 
      ? "bg-[#0a192f]/90 border-slate-700 text-white" 
      : "bg-white/95 border-slate-300 text-slate-800";
  const inputClass = isDarkMode
      ? "bg-[#112240] border-slate-600 text-white placeholder-slate-500"
      : "bg-slate-100 border-slate-300 text-slate-800 placeholder-slate-400";

  return (
    <div className={`flex flex-col h-screen font-sans transition-colors duration-500 ${bgClass}`}>
      <Head>
        <title>Canlı İzleme | Freelog</title>
        {/* SCRIPT TAG'ini BURADAN KALDIRDIK. KOD İLE EKLİYORUZ. */}
      </Head>

      <div className={`absolute top-0 w-full z-[200] border-b backdrop-blur-md transition-colors duration-500 ${isDarkMode ? 'bg-[#0a192f]/90 border-white/5' : 'bg-white/90 border-slate-200'}`}>
        <Navbar/>
      </div>
      
      <div className="flex-grow relative mt-16">
        
        {/* HARİTA */}
        <div ref={mapRef} className="w-full h-full" />

        {/* --- ÜST SAĞ: FİLTRE VE DEMO --- */}
        <div className="absolute top-24 right-4 z-50 flex flex-col items-end gap-3 pointer-events-none">
             
             {/* SİMÜLASYON BUTONU */}
             <button 
                onClick={startSimulation}
                disabled={isSimulating}
                className={`pointer-events-auto px-4 py-2 rounded-xl font-bold shadow-xl flex items-center gap-2 border transition-all transform hover:scale-105 active:scale-95
                  ${isSimulating 
                    ? 'bg-orange-600/50 text-white cursor-not-allowed border-orange-500/50' 
                    : 'bg-gradient-to-r from-orange-600 to-red-600 text-white border-orange-500'}`}
             >
                <span className={`${isSimulating ? 'animate-spin' : ''}`}>⚙️</span> 
                {isSimulating ? 'DEMO SÜRÜYOR...' : 'DEMO SÜRÜŞÜ BAŞLAT'}
             </button>

             {/* FİLTRELER */}
             <div className={`pointer-events-auto backdrop-blur-md p-3 rounded-2xl border shadow-2xl flex flex-col gap-2 transition-colors duration-300 w-40 ${panelClass}`}>
               <div className="text-[10px] font-bold uppercase text-center opacity-50 mb-1 tracking-widest">Filtre & Lejant</div>
               
               <FilterBtn label="TÜMÜ" count="∞" color="gray" active={activeFilter === "ALL"} onClick={() => setActiveFilter("ALL")} />
               <FilterBtn label="YÜKTE" count="Mavi" color="blue" active={activeFilter === "FULL"} onClick={() => setActiveFilter("FULL")} />
               <FilterBtn label="YÜKE GİDİYOR" count="Mor" color="purple" active={activeFilter === "PICKUP"} onClick={() => setActiveFilter("PICKUP")} />
               <FilterBtn label="BOŞ" count="Sarı" color="yellow" active={activeFilter === "EMPTY"} onClick={() => setActiveFilter("EMPTY")} />
               <FilterBtn label="SOS / ACİL" count="Kırmızı" color="red" active={activeFilter === "SOS"} onClick={() => setActiveFilter("SOS")} />
             </div>

             <div className="pointer-events-auto">
                 <button onClick={() => setIsDarkMode(!isDarkMode)} className={`p-3 rounded-xl border shadow-xl transition hover:scale-105 ${isDarkMode ? 'bg-[#112240] border-slate-700 text-yellow-400' : 'bg-white border-slate-200 text-[#0a192f]'}`}>
                    {isDarkMode ? '☀️' : '🌙'}
                 </button>
             </div>
        </div>

        {/* --- SOL ALT: ARAMA --- */}
        <div className="absolute bottom-8 left-4 z-50 pointer-events-none">
            <form onSubmit={handleSearch} className={`pointer-events-auto backdrop-blur-md p-2 rounded-xl border shadow-2xl flex gap-2 w-72 transition-colors duration-300 ${panelClass}`}>
                <input 
                    type="text" placeholder="PLAKA ARA (34...)" 
                    className={`flex-grow border rounded px-3 py-2 text-sm outline-none focus:border-orange-500 uppercase font-bold tracking-wider ${inputClass}`}
                    value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                />
                <button type="submit" className="bg-orange-600 hover:bg-orange-500 text-white px-3 rounded text-sm font-bold transition">🔍</button>
            </form>
        </div>

        {/* --- SOL ÜST: TIR DETAY KARTI --- */}
        {selectedTruck && (
          <div className={`absolute top-24 left-4 z-50 animate-fade-in-up pointer-events-none`}>
            {!isCardMinimized ? (
              <div className={`pointer-events-auto backdrop-blur-md p-4 rounded-2xl border shadow-2xl w-80 transition-colors duration-300 ${panelClass}`}>
                <div className="flex justify-between items-center mb-4 pb-3 border-b border-white/10">
                  <div>
                    <h2 className="text-xl font-bold tracking-wider">{selectedTruck.id}</h2>
                    <p className="text-xs text-slate-400 font-bold">{selectedTruck.driverName || "Sürücü"}</p>
                  </div>
                  <span className={`px-2 py-1 rounded text-[10px] font-bold tracking-widest border shadow-lg ${getStatusStyle(selectedTruck.status)}`}>
                    {selectedTruck.statusLabel}
                  </span>
                </div>
                
                <div className="space-y-3 text-sm">
                  <div className={`flex justify-between items-center p-2 rounded-lg border bg-black/20 border-white/5`}>
                    <span className="text-[10px] uppercase opacity-70">Hız</span>
                    <span className="font-bold text-base">{selectedTruck.speed ? selectedTruck.speed.toFixed(1) : 0} <span className="text-[10px] font-normal opacity-70">KM/S</span></span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] uppercase opacity-70">Son Sinyal</span>
                    <span className="text-orange-500 font-mono text-[10px] font-bold">{formatTime(selectedTruck)}</span>
                  </div>
                  
                  {(selectedTruck.status === 'GOING_TO_PICKUP' || selectedTruck.status === 'FULL') && (
                    <div className={`p-3 rounded-lg border mt-2 ${selectedTruck.status === 'FULL' ? 'bg-blue-500/10 border-blue-500/30' : 'bg-purple-500/10 border-purple-500/30'}`}>
                       <div className="flex items-center gap-2 mb-1">
                          <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${selectedTruck.status === 'FULL' ? 'bg-blue-500' : 'bg-purple-500'}`}></span>
                          <p className={`text-[10px] uppercase font-bold ${selectedTruck.status === 'FULL' ? 'text-blue-400' : 'text-purple-400'}`}>
                            {selectedTruck.status === 'FULL' ? 'Hedef: Teslimat' : 'Hedef: Yükleme'}
                          </p>
                       </div>
                       <span className="font-bold block truncate text-sm">
                          {selectedTruck.status === 'FULL' ? selectedTruck.destinationName : selectedTruck.pickupName}
                       </span>
                    </div>
                  )}

                </div>

                <div className="grid grid-cols-2 gap-2 mt-4">
                   <button onClick={() => setIsCardMinimized(true)} className="py-2 rounded-lg text-[10px] font-bold border border-white/10 hover:bg-white/5 transition flex items-center justify-center gap-2">
                     <span>🔽</span> GİZLE
                   </button>
                   <button onClick={() => { setSelectedTruck(null); selectedTruckIdRef.current = null; clearRouteAndPois(); endSimulation(); }} className="py-2 rounded-lg text-[10px] font-bold bg-red-600/20 hover:bg-red-600/40 text-red-500 border border-red-500/30 transition flex items-center justify-center gap-2">
                     <span>✖</span> KAPAT
                   </button>
                </div>
              </div>
            ) : (
              <div className={`pointer-events-auto backdrop-blur-md p-2 rounded-xl border shadow-xl flex items-center gap-3 animate-fade-in-up transition-colors duration-300 ${panelClass}`}>
                 <span className="font-bold text-sm pl-2">{selectedTruck.id}</span>
                 <button onClick={() => setIsCardMinimized(false)} className="text-[10px] font-bold bg-blue-600 text-white px-3 py-1.5 rounded hover:bg-blue-500 transition">GÖSTER</button>
                 <button onClick={() => { setSelectedTruck(null); selectedTruckIdRef.current = null; clearRouteAndPois(); endSimulation(); }} className="text-slate-400 hover:text-red-500 px-2 font-bold">✕</button>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  )
}

// --- YARDIMCI BİLEŞENLER ---
function FilterBtn({ label, color, active, onClick }) {
    const colors = {
        gray: "bg-slate-500",
        blue: "bg-blue-500",
        purple: "bg-purple-500",
        yellow: "bg-yellow-500",
        red: "bg-red-500"
    };

    return (
        <button 
            onClick={onClick}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-[10px] font-bold border transition-all
            ${active 
                ? 'bg-white/10 border-white/40 shadow-inner translate-x-1' 
                : 'bg-transparent border-transparent opacity-60 hover:opacity-100 hover:bg-white/5'}`}
        >
            <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${colors[color]} ${active ? 'animate-pulse' : ''}`}></span>
                <span className={active ? 'text-white' : 'text-slate-400'}>{label}</span>
            </div>
            {active && <span className="text-xs">✓</span>}
        </button>
    )
}

function getStatusStyle(status) {
    if(status === 'FULL') return 'border-blue-500 bg-blue-500/10 text-blue-400';
    if(status === 'SOS') return 'border-red-500 bg-red-500/10 text-red-500 animate-pulse';
    if(status === 'GOING_TO_PICKUP') return 'border-purple-500 bg-purple-500/10 text-purple-400';
    if(status === 'EMPTY') return 'border-yellow-500 bg-yellow-500/10 text-yellow-500';
    if(status === 'LOADING') return 'border-green-500 bg-green-500/10 text-green-500 animate-pulse';
    return 'border-slate-500 text-slate-500';
}