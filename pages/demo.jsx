import { useEffect, useRef, useState } from 'react'
import Head from 'next/head'
import Navbar from '../components/Navbar'
import { db } from '../firebaseConfig'
import { collection, onSnapshot } from 'firebase/firestore'

// --- HARİTA STİLLERİ (JSON) ---
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
  { elementType: "labels.text.fill", stylers: [{ color: "#616161" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#f5f5f5" }] },
  { featureType: "administrative.land_parcel", elementType: "labels.text.fill", stylers: [{ color: "#bdbdbd" }] },
  { featureType: "poi", elementType: "geometry", stylers: [{ color: "#eeeeee" }] },
  { featureType: "poi", elementType: "labels.text.fill", stylers: [{ color: "#757575" }] },
  { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#e5e5e5" }] },
  { featureType: "poi.park", elementType: "labels.text.fill", stylers: [{ color: "#9e9e9e" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#ffffff" }] },
  { featureType: "road.arterial", elementType: "labels.text.fill", stylers: [{ color: "#757575" }] },
  { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#dadada" }] },
  { featureType: "road.highway", elementType: "labels.text.fill", stylers: [{ color: "#616161" }] },
  { featureType: "road.local", elementType: "labels.text.fill", stylers: [{ color: "#9e9e9e" }] },
  { featureType: "transit.line", elementType: "geometry", stylers: [{ color: "#e5e5e5" }] },
  { featureType: "transit.station", elementType: "geometry", stylers: [{ color: "#eeeeee" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#c9c9c9" }] },
  { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#9e9e9e" }] }
];

export default function Demo() {
  // --- STATE VE REF TANIMLAMALARI ---
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [passwordInput, setPasswordInput] = useState("")
  const [loginError, setLoginError] = useState(false)

  // TEMA & UI STATE
  const [isDarkMode, setIsDarkMode] = useState(true)
  const [isCardMinimized, setIsCardMinimized] = useState(false) 

  // Harita Referansları
  const mapRef = useRef(null)
  const mapInstance = useRef(null)
  const markers = useRef({})      
  const poiMarkers = useRef([])   
  const selectedTruckIdRef = useRef(null)

  const directionsService = useRef(null)
  const directionsRenderer = useRef(null)
  
  // Data State
  const [selectedTruck, setSelectedTruck] = useState(null)
  const [searchTerm, setSearchTerm] = useState("") 
  const [activeFilter, setActiveFilter] = useState("ALL") 

  // --- LOGIN FONKSİYONU ---
  const handleLogin = (e) => {
    e.preventDefault()
    if (passwordInput === "1234") { 
      setIsAuthenticated(true)
      setLoginError(false)
    } else {
      setLoginError(true)
    }
  }

  // --- TEMA DEĞİŞTİRME ---
  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    if (mapInstance.current) {
        mapInstance.current.setOptions({
            styles: !isDarkMode ? DARK_MAP_STYLE : LIGHT_MAP_STYLE
        });
    }
  }

  // --- HARİTA BAŞLATMA ---
  useEffect(() => {
    if (!isAuthenticated) return; 

    const initMap = () => {
      if (typeof google !== 'undefined' && !mapInstance.current && mapRef.current) {
        
        mapInstance.current = new google.maps.Map(mapRef.current, {
          center: { lat: 39.0, lng: 35.0 }, 
          zoom: 6,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
          styles: isDarkMode ? DARK_MAP_STYLE : LIGHT_MAP_STYLE, 
        })

        directionsService.current = new google.maps.DirectionsService()
        directionsRenderer.current = new google.maps.DirectionsRenderer({
          map: mapInstance.current, 
          suppressMarkers: true, 
          polylineOptions: { strokeColor: "#f97316", strokeWeight: 5 } 
        })

        listenToFirebase()
      }
    }

    if (typeof google === 'undefined') {
      window.initMap = initMap
    } else {
      initMap()
    }
  }, [isAuthenticated]) 

  // --- FİLTRELEME ---
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

  // --- ROTA VE KART YÖNETİMİ ---
  useEffect(() => {
    clearRouteAndPois();
    
    if (selectedTruck) {
        if (selectedTruck.status === "GOING_TO_PICKUP" && selectedTruck.pickupLat) {
            calculateAndDrawRoute(
            { lat: selectedTruck.lat, lng: selectedTruck.lng }, 
            { lat: selectedTruck.pickupLat, lng: selectedTruck.pickupLng }
            );
            addPoiMarker(selectedTruck.pickupLat, selectedTruck.pickupLng, "Yükleme Noktası", "http://maps.google.com/mapfiles/ms/icons/purple-dot.png"); 
        } 
        else if (selectedTruck.status === "FULL" && selectedTruck.destLat) {
            calculateAndDrawRoute(
            { lat: selectedTruck.lat, lng: selectedTruck.lng }, 
            { lat: selectedTruck.destLat, lng: selectedTruck.destLng }
            );
            addPoiMarker(selectedTruck.destLat, selectedTruck.destLng, "Teslimat Noktası", "http://maps.google.com/mapfiles/ms/icons/blue-dot.png"); 
        }
    }
  }, [selectedTruck]) 

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
    return () => unsubscribe()
  }

  // --- ARAMA ---
  const handleSearch = (e) => {
    e.preventDefault();
    const plate = searchTerm.toUpperCase().trim(); 
    
    if (markers.current[plate]) {
      const marker = markers.current[plate];
      mapInstance.current.setZoom(14); 
      mapInstance.current.panTo(marker.getPosition());
      new google.maps.event.trigger( marker, 'click' );
    } else {
      alert(`"${plate}" plakalı araç şu an haritada bulunamıyor.`);
    }
  }

  // --- HARİTA YARDIMCILARI ---
  const clearRouteAndPois = () => {
    if (directionsRenderer.current) {
        directionsRenderer.current.setDirections({ routes: [] }); 
    }
    poiMarkers.current.forEach(m => m.setMap(null)); 
    poiMarkers.current = [];
  }

  const addPoiMarker = (lat, lng, title, iconUrl) => {
    if (!lat || !lng) return;
    const marker = new google.maps.Marker({
      position: { lat: parseFloat(lat), lng: parseFloat(lng) },
      map: mapInstance.current,
      title: title,
      icon: { url: iconUrl },
      animation: google.maps.Animation.DROP
    });
    poiMarkers.current.push(marker);
  }

  const calculateAndDrawRoute = (origin, destination) => {
    if(!directionsService.current || !origin.lat || !destination.lat) return
    
    if (directionsRenderer.current && mapInstance.current) {
        directionsRenderer.current.setMap(mapInstance.current);
    }

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

  // --- MARKER GÜNCELLEME ---
  const updateMarker = (id, data) => {
    if (!mapInstance.current || !window.google) return
    const position = { lat: data.lat, lng: data.lng }
    
    let iconColor = "gray"
    let statusLabel = data.status

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
        className: "bg-slate-900 px-1 rounded" 
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
  }

  const removeMarker = (id) => {
    if (markers.current[id]) {
      markers.current[id].setMap(null)
      delete markers.current[id]
    }
    if (selectedTruckIdRef.current === id) {
        setSelectedTruck(null);
        selectedTruckIdRef.current = null;
        clearRouteAndPois();
    }
  }

  const formatTime = (data) => {
    if (!data) return "Bilinmiyor";
    const rawTime = data.updatedAt || data.timestamp || data.time;
    if (!rawTime) return "Bilinmiyor";
    let dateObj;
    try {
        if (rawTime.seconds) dateObj = new Date(rawTime.seconds * 1000);
        else if (rawTime instanceof Date) dateObj = rawTime;
        else dateObj = new Date(rawTime);
        if (isNaN(dateObj.getTime())) return "Hatalı Tarih";
        return dateObj.toLocaleString('tr-TR', { 
            timeZone: 'Europe/Istanbul',
            hour: '2-digit', minute: '2-digit', second: '2-digit',
            day: 'numeric', month: 'long'
        });
    } catch (e) { return "Format Hatası"; }
  }

  const bgClass = isDarkMode ? "bg-[#0a192f] text-slate-200" : "bg-slate-50 text-slate-800";
  const panelClass = isDarkMode 
      ? "bg-[#0a192f]/95 border-slate-700 text-white" 
      : "bg-white/95 border-slate-300 text-slate-800";
  const inputClass = isDarkMode
      ? "bg-[#112240] border-slate-600 text-white placeholder-slate-500"
      : "bg-slate-100 border-slate-300 text-slate-800 placeholder-slate-400";
  const secondaryText = isDarkMode ? "text-slate-400" : "text-slate-500";
  const cardBg = isDarkMode ? "bg-[#112240]" : "bg-slate-50";

  return (
    <div className={`flex flex-col h-screen font-sans transition-colors duration-500 ${bgClass}`}>
      <Head>
        <title>Canlı İzleme | Freelog</title>
        <script 
          src={`https://maps.googleapis.com/maps/api/js?key=AIzaSyDPh0Z89MVbMU1_heWaHotFHh5pH7RCEnM&callback=initMap&libraries=places`} 
          async defer
        ></script>
      </Head>

      {/* KRAL DÜZELTME: z-[200] vererek Navbar'ı Login ekranının üstüne çıkardık */}
      <div className={`absolute top-0 w-full z-[200] border-b backdrop-blur-md transition-colors duration-500 ${isDarkMode ? 'bg-[#0a192f]/90 border-white/5' : 'bg-white/90 border-slate-200'}`}>
        <Navbar/>
      </div>
      
      <div className="flex-grow relative mt-16">
        
        {/* --- 1. GÜVENLİK EKRANI (z-index: 100) --- */}
        {!isAuthenticated && (
          <div className={`absolute inset-0 z-[100] flex items-center justify-center ${isDarkMode ? 'bg-[#0a192f]' : 'bg-slate-100'}`}>
            <div className={`p-8 rounded-2xl shadow-2xl w-96 text-center border transition-all ${isDarkMode ? 'bg-[#112240] border-slate-700' : 'bg-white border-slate-200'}`}>
              <div className="mb-6 flex justify-center">
                  <div className="w-16 h-16 bg-orange-600 rounded-full flex items-center justify-center shadow-lg shadow-orange-500/30">
                    <span className="text-3xl">🛡️</span>
                  </div>
              </div>
              <h2 className={`text-xl font-bold mb-1 tracking-wide ${isDarkMode ? 'text-white' : 'text-[#0a192f]'}`}>Canlı İzleme Yetkisi</h2>
              
              <p className={`text-xs mb-6 ${secondaryText}`}>
                DEMO'yu görüntülemek için İletişim Menüsünden <br/>
                <span className="text-orange-500 font-bold">Demo Şifresini Talep Edin.</span>
              </p>
              
              <form onSubmit={handleLogin} className="space-y-4">
                <input 
                  type="password" 
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="GÜVENLİK KODU"
                  className={`w-full px-4 py-3 rounded-lg border text-center font-bold tracking-[0.3em] focus:border-orange-500 focus:outline-none transition ${inputClass}`}
                  autoFocus
                />
                {loginError && <p className="text-red-500 text-xs font-bold animate-pulse">Erişim Reddedildi</p>}
                <button type="submit" className="w-full bg-[#0a192f] hover:bg-orange-600 text-white font-bold py-3 rounded-lg transition-colors shadow-lg">SİSTEMİ BAŞLAT</button>
              </form>
            </div>
          </div>
        )}

        {/* HARİTA */}
        <div ref={mapRef} className="w-full h-full" />

        {/* --- 2. ÜST SAĞ --- */}
        {isAuthenticated && (
          <div className="absolute top-24 right-4 z-50 flex flex-col items-end gap-3 pointer-events-none">
             <div className={`pointer-events-auto backdrop-blur-md p-2 rounded-xl border shadow-2xl flex gap-2 transition-colors duration-300 ${panelClass}`}>
               <button onClick={() => setActiveFilter("ALL")} className={`px-3 py-2 text-xs font-bold rounded transition ${activeFilter === 'ALL' ? 'bg-orange-600 text-white' : 'bg-transparent hover:bg-slate-500/10'}`}>TÜMÜ</button>
               <button onClick={() => setActiveFilter("FULL")} className={`px-3 py-2 text-xs font-bold rounded transition ${activeFilter === 'FULL' ? 'bg-blue-600 text-white' : 'bg-transparent hover:bg-slate-500/10'}`}>YÜKTE</button>
               <button onClick={() => setActiveFilter("PICKUP")} className={`px-3 py-2 text-xs font-bold rounded transition ${activeFilter === 'PICKUP' ? 'bg-purple-600 text-white' : 'bg-transparent hover:bg-slate-500/10'}`}>GİDİYOR</button>
               <button onClick={() => setActiveFilter("SOS")} className={`px-3 py-2 text-xs font-bold rounded transition ${activeFilter === 'SOS' ? 'bg-red-600 text-white' : 'bg-transparent hover:bg-slate-500/10'}`}>SOS</button>
             </div>
             <div className="pointer-events-auto">
                 <button onClick={toggleTheme} className={`p-3 rounded-xl border shadow-xl transition hover:scale-105 ${isDarkMode ? 'bg-[#112240] border-slate-700 text-yellow-400' : 'bg-white border-slate-200 text-[#0a192f]'}`}>
                    {isDarkMode ? '☀️' : '🌙'}
                 </button>
             </div>
          </div>
        )}

        {/* --- 3. SOL ALT: PLAKA ARAMA --- */}
        {isAuthenticated && (
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
        )}

        {/* --- 4. SOL ÜST: TIR DETAY KARTI --- */}
        {selectedTruck && isAuthenticated && (
          <div className={`absolute top-24 left-4 z-50 animate-fade-in-up pointer-events-none`}>
            
            {!isCardMinimized ? (
              <div className={`pointer-events-auto backdrop-blur-md p-4 rounded-2xl border shadow-2xl w-80 transition-colors duration-300 ${panelClass}`}>
                <div className={`flex justify-between items-center mb-4 pb-3 border-b ${isDarkMode ? 'border-white/10' : 'border-slate-200'}`}>
                  <div>
                    <h2 className="text-xl font-bold tracking-wider">{selectedTruck.id}</h2>
                    <span className={`text-[9px] uppercase tracking-widest ${secondaryText}`}>Canlı Bağlantı</span>
                  </div>
                  <span className={`px-2 py-1 rounded text-[10px] font-bold tracking-widest border shadow-lg 
                    ${selectedTruck.status === 'SOS' ? 'border-red-500 bg-red-500/10 text-red-500 animate-pulse' : 'border-blue-400 bg-blue-400/10 text-blue-400'}`}>
                    {selectedTruck.statusLabel}
                  </span>
                </div>
                
                <div className={`space-y-3 text-sm ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                  <div className={`flex justify-between items-center p-2 rounded-lg border ${cardBg} ${isDarkMode ? 'border-slate-800' : 'border-slate-200'}`}>
                    <span className={`text-[10px] uppercase ${secondaryText}`}>Hız</span>
                    <span className={`font-bold text-base ${isDarkMode ? 'text-white' : 'text-[#0a192f]'}`}>{selectedTruck.speed ? selectedTruck.speed.toFixed(1) : 0} <span className="text-[10px] font-normal text-slate-500">KM/S</span></span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className={`text-[10px] uppercase ${secondaryText}`}>Son Sinyal</span>
                    <span className="text-orange-500 font-mono text-[10px]">{formatTime(selectedTruck)}</span>
                  </div>
                  
                  {selectedTruck.status === 'GOING_TO_PICKUP' && (
                    <div className="bg-purple-900/10 p-3 rounded-lg border border-purple-500/30 mt-2">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse"></span>
                        <p className="text-[10px] text-purple-600 dark:text-purple-300 uppercase font-bold">Hedef: Yükleme</p>
                      </div>
                      <span className={`font-bold block truncate text-sm ${isDarkMode ? 'text-white' : 'text-[#0a192f]'}`}>{selectedTruck.pickupName || "Bilinmiyor"}</span>
                    </div>
                  )}
                  {selectedTruck.status === 'FULL' && (
                    <div className="bg-blue-900/10 p-3 rounded-lg border border-blue-500/30 mt-2">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
                        <p className="text-[10px] text-blue-600 dark:text-blue-300 uppercase font-bold">Hedef: Teslimat</p>
                      </div>
                      <span className={`font-bold block truncate text-sm ${isDarkMode ? 'text-white' : 'text-[#0a192f]'}`}>{selectedTruck.destinationName || "Bilinmiyor"}</span>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2 mt-4">
                   <button 
                     onClick={() => setIsCardMinimized(true)}
                     className={`py-2 rounded-lg text-[10px] font-bold border transition flex items-center justify-center gap-2 ${isDarkMode ? 'bg-slate-800 hover:bg-slate-700 border-slate-600 text-slate-300' : 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-700'}`}
                   >
                     <span>🔽</span> GİZLE
                   </button>
                   <button 
                     onClick={() => { setSelectedTruck(null); selectedTruckIdRef.current = null; clearRouteAndPois(); }}
                     className="py-2 rounded-lg text-[10px] font-bold border transition bg-red-600 hover:bg-red-500 border-red-500 text-white flex items-center justify-center gap-2"
                   >
                     <span>✖</span> KAPAT
                   </button>
                </div>
              </div>
            ) : (
              <div className={`pointer-events-auto backdrop-blur-md p-2 rounded-xl border shadow-xl flex items-center gap-3 animate-fade-in-up transition-colors duration-300 ${panelClass}`}>
                 <span className="font-bold text-sm pl-2">{selectedTruck.id}</span>
                 <div className="h-4 w-px bg-slate-500/30"></div>
                 <button onClick={() => setIsCardMinimized(false)} className="text-[10px] font-bold bg-blue-600 text-white px-3 py-1.5 rounded hover:bg-blue-500 transition">GÖSTER</button>
                 <button onClick={() => { setSelectedTruck(null); selectedTruckIdRef.current = null; clearRouteAndPois(); setIsCardMinimized(false); }} className="text-slate-400 hover:text-red-500 px-2 font-bold">✕</button>
              </div>
            )}

          </div>
        )}

      </div>

      <style jsx>{`
        .animate-fade-in-up {
          animation: fadeInUp 0.3s ease-out forwards;
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}