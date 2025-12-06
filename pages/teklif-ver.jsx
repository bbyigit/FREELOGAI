import { useState, useEffect } from 'react';
import Head from 'next/head';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { db } from '../firebaseConfig';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export default function TeklifVer() {
  // --- GÜVENLİK STATE'LERİ ---
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [loginError, setLoginError] = useState(false);

  // --- FORM STATE'LERİ ---
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    pickupName: '', pickupLat: '', pickupLng: '',
    destName: '', destLat: '', destLng: '',
    price: '', distance: '', tonnage: '', 
    notes: ''
  });

  const handleLogin = (e) => {
    e.preventDefault();
    if (passwordInput === "1234") { 
      setIsAuthenticated(true);
      setLoginError(false);
    } else {
      setLoginError(true);
    }
  };

  useEffect(() => {
    if (formData.pickupLat && formData.pickupLng && formData.destLat && formData.destLng) {
      const dist = calculateDistance(
        formData.pickupLat, formData.pickupLng,
        formData.destLat, formData.destLng
      );
      setFormData(prev => ({ ...prev, distance: dist.toFixed(0) })); 
    }
  }, [formData.pickupLat, formData.pickupLng, formData.destLat, formData.destLng]);

  function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; 
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon/2) * Math.sin(dLon/2); 
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    return R * c;
  }

  function deg2rad(deg) { return deg * (Math.PI/180); }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await addDoc(collection(db, "available_jobs"), {
        ...formData,
        pickupLat: parseFloat(formData.pickupLat),
        pickupLng: parseFloat(formData.pickupLng),
        destLat: parseFloat(formData.destLat),
        destLng: parseFloat(formData.destLng),
        price: formData.price + " ₺",      
        distance: formData.distance + " km", 
        tonnage: formData.tonnage + " Ton",  
        createdAt: serverTimestamp()
      });
      alert("✅ İŞ EMRİ YAYINLANDI");
      setFormData({ 
        title: '', pickupName: '', pickupLat: '', pickupLng: '', 
        destName: '', destLat: '', destLng: '', 
        price: '', distance: '', tonnage: '', notes: '' 
      });
    } catch (error) {
      console.error("Hata:", error);
      alert("Hata: " + error.message);
    }
    setLoading(false);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 flex flex-col">
      <Head><title>Yük Havuzu Yönetimi | Freelog</title></Head>

      {/* Navbar Fixed olduğu için yer kaplamaz, üstte yüzer */}
      <Navbar />

      {/* KRAL DİKKAT: 
          Buraya 'style={{ paddingTop: '150px' }}' ekledim.
          Bu, CSS sınıflarını ezer ve zorla yukarıdan 150 piksel boşluk bıraktırır.
          Navbar yaklaşık 100px olduğu için, 150px onu rahat rahat kurtarır.
      */}
      <main 
        className="flex-grow container mx-auto px-4 flex justify-center items-start"
        style={{ paddingTop: '150px', paddingBottom: '50px' }}
      >
        
        {/* --- 1. GÜVENLİK EKRANI --- */}
        {!isAuthenticated ? (
           <div className="bg-white p-10 rounded-2xl shadow-xl w-full max-w-md text-center border border-slate-200">
             <div className="mb-6 text-5xl">🔐</div>
             {/* Bu başlığı değiştirdim, dosyanın güncellendiğini buradan anlayabilirsin */}
             <h2 className="text-xl font-bold text-slate-800 mb-2">Yönetici Girişi (Güvenli)</h2>
             <p className="text-slate-500 text-sm mb-8">İş emri oluşturmak için güvenlik kodunu giriniz.</p>
             
             <form onSubmit={handleLogin} className="space-y-4">
               <input 
                 type="password" 
                 value={passwordInput}
                 onChange={(e) => setPasswordInput(e.target.value)}
                 placeholder="Güvenlik Kodu"
                 className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 text-center tracking-[0.5em] focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition font-bold"
                 autoFocus
               />
               {loginError && <p className="text-red-600 text-xs font-bold">Hatalı Kod</p>}
               
               <button 
                 type="submit"
                 className="w-full bg-[#0a192f] hover:bg-[#112240] text-white font-bold py-3 rounded-lg transition shadow-lg"
               >
                 GİRİŞ YAP
               </button>
             </form>
           </div>
        ) : (
          /* --- 2. VERİ GİRİŞ FORMU --- */
          <div className="w-full max-w-4xl bg-white p-8 md:p-12 rounded-2xl shadow-xl border border-slate-200 relative">
            
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-orange-500 to-red-600 rounded-t-2xl"></div>

            <div className="mb-10 border-b border-slate-100 pb-6 flex flex-col md:flex-row justify-between items-center gap-4">
              <div>
                <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
                  📋 Yeni İş Emri
                </h1>
                <p className="text-slate-500 text-sm mt-1">Lütfen taşıma detaylarını eksiksiz giriniz.</p>
              </div>
              <div className="bg-green-50 text-green-700 px-4 py-1.5 rounded-full border border-green-200 text-xs font-bold flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                SİSTEM AKTİF
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wide">Yük Tipi / Başlık</label>
                  <input name="title" type="text" required placeholder="Örn: İnşaat Demiri" className="w-full bg-slate-50 border border-slate-300 rounded-lg p-3 text-slate-800 focus:border-orange-500 outline-none transition font-medium" value={formData.title} onChange={handleChange} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wide">Tonaj (Ton)</label>
                  <input name="tonnage" type="number" required placeholder="Örn: 24" className="w-full bg-slate-50 border border-slate-300 rounded-lg p-3 text-slate-800 focus:border-orange-500 outline-none transition font-medium" value={formData.tonnage} onChange={handleChange} />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-blue-50/50 p-6 rounded-xl border border-blue-100">
                  <h3 className="text-blue-700 font-bold mb-4 flex items-center gap-2 text-sm uppercase tracking-wide"><span className="bg-blue-100 p-1 rounded">📍 A</span> Yükleme Noktası</h3>
                  <div className="space-y-4">
                    <input name="pickupName" required placeholder="Yer Adı (Örn: Gebze Depo)" className="w-full bg-white border border-slate-300 p-2.5 rounded-lg text-slate-800 text-sm focus:border-blue-500 outline-none" value={formData.pickupName} onChange={handleChange} />
                    <div className="grid grid-cols-2 gap-3">
                       <input name="pickupLat" type="number" step="any" required placeholder="Latitude" className="w-full bg-white border border-slate-300 p-2.5 rounded-lg text-slate-800 text-sm font-mono focus:border-blue-500 outline-none" value={formData.pickupLat} onChange={handleChange} />
                       <input name="pickupLng" type="number" step="any" required placeholder="Longitude" className="w-full bg-white border border-slate-300 p-2.5 rounded-lg text-slate-800 text-sm font-mono focus:border-blue-500 outline-none" value={formData.pickupLng} onChange={handleChange} />
                    </div>
                  </div>
                </div>

                <div className="bg-orange-50/50 p-6 rounded-xl border border-orange-100">
                  <h3 className="text-orange-700 font-bold mb-4 flex items-center gap-2 text-sm uppercase tracking-wide"><span className="bg-orange-100 p-1 rounded">🏁 B</span> Teslimat Noktası</h3>
                  <div className="space-y-4">
                    <input name="destName" required placeholder="Yer Adı (Örn: Ankara Ostim)" className="w-full bg-white border border-slate-300 p-2.5 rounded-lg text-slate-800 text-sm focus:border-orange-500 outline-none" value={formData.destName} onChange={handleChange} />
                    <div className="grid grid-cols-2 gap-3">
                       <input name="destLat" type="number" step="any" required placeholder="Latitude" className="w-full bg-white border border-slate-300 p-2.5 rounded-lg text-slate-800 text-sm font-mono focus:border-orange-500 outline-none" value={formData.destLat} onChange={handleChange} />
                       <input name="destLng" type="number" step="any" required placeholder="Longitude" className="w-full bg-white border border-slate-300 p-2.5 rounded-lg text-slate-800 text-sm font-mono focus:border-orange-500 outline-none" value={formData.destLng} onChange={handleChange} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wide">Navlun Bedeli (TL)</label>
                  <div className="relative">
                    <input name="price" type="number" required placeholder="15000" className="w-full bg-slate-50 border border-slate-300 rounded-lg p-3 text-slate-900 focus:border-green-500 outline-none text-lg font-bold pl-10" value={formData.price} onChange={handleChange} />
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₺</span>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wide">Mesafe (Otomatik)</label>
                  <input name="distance" type="text" readOnly className="w-full bg-gray-100 border border-gray-200 rounded-lg p-3 text-slate-500 cursor-not-allowed font-mono text-lg" value={formData.distance ? formData.distance + " KM" : "..."} />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wide">Operasyonel Notlar</label>
                <textarea name="notes" maxLength="150" rows="3" placeholder="Sürücü için özel notlar..." className="w-full bg-slate-50 border border-slate-300 rounded-lg p-3 text-slate-800 focus:border-orange-500 outline-none resize-none" value={formData.notes} onChange={handleChange} />
              </div>

              <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-orange-500/30 transition transform active:scale-[0.99] text-lg">
                {loading ? 'SİSTEME İŞLENİYOR...' : 'İŞ EMRİNİ YAYINLA 🚀'}
              </button>
            </form>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}