import { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { auth, db, storage } from '../firebaseConfig'; 
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { onAuthStateChanged, signOut, sendPasswordResetEmail } from 'firebase/auth';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useRouter } from 'next/router';
import { useAuthModal } from '../context/AuthModalContext';

export default function Profil() {
  const router = useRouter();
  const { openLogin } = useAuthModal();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({});
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        const userRef = doc(db, "users", currentUser.uid);
        const userSnap = await getDoc(userRef);
        
        if (userSnap.exists()) {
          const data = userSnap.data();
          setUser({ ...currentUser, ...data });
          setFormData(data);
        }
      } else {
        router.push('/');
        // Kullanıcı giriş yapmamışsa anasayfaya at ve pencereyi aç
        setTimeout(() => openLogin(), 200);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [router]);

  const handleLogout = async () => {
      await signOut(auth);
      router.push('/');
  };

  // --- ŞİFRE SIFIRLAMA ---
  const handlePasswordReset = async () => {
      if(!user?.email) return;
      if(confirm(`"${user.email}" adresine şifre sıfırlama bağlantısı gönderilsin mi?`)) {
          try {
              await sendPasswordResetEmail(auth, user.email);
              alert("✅ E-posta gönderildi! Lütfen gelen kutunuzu (ve spam klasörünü) kontrol edin.");
          } catch (error) {
              alert("Hata: " + error.message);
          }
      }
  };

  // --- FOTOĞRAF YÜKLEME ---
  const handlePhotoUpload = async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      setUploading(true);
      try {
          const storageRef = ref(storage, `avatars/${user.uid}`);
          await uploadBytes(storageRef, file);
          const photoURL = await getDownloadURL(storageRef);
          
          await updateDoc(doc(db, "users", user.uid), { photoURL });
          setUser(prev => ({ ...prev, photoURL }));
          alert("Profil fotoğrafı güncellendi!");
      } catch (error) {
          console.error(error);
          alert("Yükleme hatası: " + error.message);
      }
      setUploading(false);
  };

  // --- PROFİL GÜNCELLEME ---
  const handleSave = async () => {
      setLoading(true);
      try {
          const updates = {
              phone: formData.phone,
              name: formData.name.toUpperCase(),
              surname: formData.surname.toUpperCase(),
              // Sürücüye özel
              ...(user.role === 'driver' && { 
                  plate: formData.plate?.toUpperCase(),
                  licenseClass: formData.licenseClass 
              }),
              // Firmaya özel
              ...(user.role === 'shipper' && { 
                  companyName: formData.companyName.toUpperCase(),
                  taxId: formData.taxId
              })
          };

          await updateDoc(doc(db, "users", user.uid), updates);
          setUser(prev => ({ ...prev, ...updates }));
          setEditing(false);
          alert("✅ Profil bilgileri başarıyla kaydedildi.");
      } catch (error) {
          alert("Hata: " + error.message);
      }
      setLoading(false);
  };

  if (loading) return <div className="min-h-screen bg-[#0a192f] flex items-center justify-center text-white">Yükleniyor...</div>;

  // --- KRİTİK DÜZELTME BURASI ---
  // Eğer kullanıcı verisi henüz yoksa (yönlendirme aşamasındaysa) sayfayı render etme.
  if (!user) return null; 
  // ------------------------------

  return (
    <div className="min-h-screen bg-[#0a192f] font-sans text-slate-200 selection:bg-orange-500 selection:text-white">
      <Head>
        <title>Profil Ayarları | Freelog AI</title>
      </Head>

      <Navbar />

      <div className="container mx-auto px-6 pb-20" style={{ paddingTop: '160px' }}>
        
        {/* BAŞLIK & BUTONLAR */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-10 border-b border-white/10 pb-6 gap-6">
            <div>
                <h1 className="text-3xl font-black text-white tracking-tight">HESAP AYARLARI</h1>
                <p className="text-slate-400 text-sm mt-1">Kişisel bilgilerinizi ve tercihlerinizi yönetin.</p>
            </div>
            <div className="flex gap-3">
                {user.role === 'driver' && (
                    <button onClick={() => router.push('/suruculer')} className="bg-orange-600 hover:bg-orange-500 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition shadow-lg shadow-orange-900/20 flex items-center gap-2">
                        <span>🚛</span> PANEL
                    </button>
                )}
                {user.role === 'shipper' && (
                    <button onClick={() => router.push('/yuk-verenler')} className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition shadow-lg shadow-blue-900/20 flex items-center gap-2">
                        <span>📦</span> PANEL
                    </button>
                )}
                <button onClick={handleLogout} className="bg-slate-800 hover:bg-red-600 hover:text-white text-slate-300 px-5 py-2.5 rounded-xl text-sm font-bold transition border border-slate-700">
                    ÇIKIŞ
                </button>
            </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-8">
            
            {/* SOL: KİMLİK KARTI (AVATAR) */}
            <div className="lg:col-span-4 space-y-6">
                <div className="bg-[#112240] rounded-2xl p-8 border border-slate-700 text-center relative overflow-hidden group">
                    
                    {/* Arka Plan Dekoru */}
                    <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-blue-600/20 to-transparent"></div>

                    {/* Avatar */}
                    <div className="relative w-32 h-32 mx-auto mb-4">
                        <div className="w-full h-full rounded-full border-4 border-[#0a192f] shadow-2xl overflow-hidden bg-slate-800 flex items-center justify-center">
                            {user.photoURL ? (
                                <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-4xl">👤</span>
                            )}
                        </div>
                        {/* Kamera İkonu (Yükleme) */}
                        <button 
                            onClick={() => fileInputRef.current.click()}
                            className="absolute bottom-0 right-0 bg-orange-500 hover:bg-orange-400 text-white p-2 rounded-full shadow-lg transition border-2 border-[#0a192f]"
                            disabled={uploading}
                        >
                            {uploading ? '...' : '📷'}
                        </button>
                        <input type="file" ref={fileInputRef} onChange={handlePhotoUpload} className="hidden" accept="image/*" />
                    </div>

                    <h2 className="text-xl font-bold text-white mb-1">{user.name} {user.surname}</h2>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800 border border-slate-600 text-xs font-bold text-slate-300">
                        {user.role === 'driver' ? 'SÜRÜCÜ' : user.role === 'shipper' ? 'YÜK VEREN' : 'YÖNETİCİ'}
                    </div>

                    <div className="mt-8 pt-6 border-t border-slate-700 space-y-3 text-left">
                         <div className="flex justify-between text-sm">
                             <span className="text-slate-400">Üyelik Tarihi</span>
                             <span className="text-white font-mono">{user.createdAt ? new Date(user.createdAt.seconds * 1000).toLocaleDateString() : '-'}</span>
                         </div>
                         <div className="flex justify-between text-sm">
                             <span className="text-slate-400">Durum</span>
                             <span className="text-green-400 font-bold">Aktif ✅</span>
                         </div>
                    </div>
                </div>

                {/* SÜRÜCÜ İÇİN EKSTRA BİLGİ */}
                {user.role === 'driver' && (
                    <div className="bg-gradient-to-br from-orange-900/40 to-[#112240] rounded-2xl p-6 border border-orange-500/20 relative">
                        <h3 className="text-white font-bold mb-4 flex items-center gap-2">📱 Mobil Giriş</h3>
                        <div className="bg-black/40 p-3 rounded-lg border border-white/10 mb-2">
                             <div className="text-[10px] text-slate-400 uppercase">TC Kimlik / User ID</div>
                             <div className="text-xl font-mono text-white tracking-widest">{user.tcNo}</div>
                        </div>
                        <p className="text-xs text-slate-400">Tablet uygulamasında bu ID ile giriş yapmalısınız.</p>
                    </div>
                )}
            </div>

            {/* SAĞ: DÜZENLENEBİLİR FORM */}
            <div className="lg:col-span-8">
                <div className="bg-[#112240] rounded-2xl p-8 border border-slate-700">
                    <div className="flex justify-between items-center mb-8">
                        <h3 className="text-xl font-bold text-white">Profil Bilgileri</h3>
                        <button 
                           onClick={() => setEditing(!editing)} 
                           className={`text-xs font-bold px-4 py-2 rounded-lg transition ${editing ? 'bg-red-500/10 text-red-400' : 'bg-blue-500/10 text-blue-400'}`}
                        >
                           {editing ? 'İPTAL ET' : 'DÜZENLE ✏️'}
                        </button>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        <InputGroup label="Ad" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} disabled={!editing} />
                        <InputGroup label="Soyad" value={formData.surname} onChange={(e) => setFormData({...formData, surname: e.target.value})} disabled={!editing} />
                        
                        <div className="md:col-span-2">
                            <InputGroup label="E-Posta (Değiştirilemez)" value={user.email} disabled={true} />
                        </div>

                        <InputGroup label="Telefon" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} disabled={!editing} />

                        {/* ROLE GÖRE DEĞİŞEN ALANLAR */}
                        {user.role === 'driver' ? (
                            <>
                                <InputGroup label="Ehliyet Sınıfı" value={formData.licenseClass} onChange={(e) => setFormData({...formData, licenseClass: e.target.value})} disabled={!editing} />
                                <InputGroup label="Plaka" value={formData.plate} onChange={(e) => setFormData({...formData, plate: e.target.value})} disabled={!editing} placeholder="34 XX 000" />
                            </>
                        ) : (
                            <>
                                <InputGroup label="Firma Adı" value={formData.companyName} onChange={(e) => setFormData({...formData, companyName: e.target.value})} disabled={!editing} />
                                <InputGroup label="Vergi No" value={formData.taxId} onChange={(e) => setFormData({...formData, taxId: e.target.value})} disabled={!editing} />
                            </>
                        )}
                    </div>

                    {/* AKSİYON BUTONLARI */}
                    <div className="mt-8 pt-8 border-t border-slate-700 flex flex-col md:flex-row justify-between items-center gap-4">
                        <button 
                           onClick={handlePasswordReset}
                           className="text-slate-400 hover:text-white text-sm font-bold flex items-center gap-2 transition"
                        >
                           🔒 Şifre Sıfırlama E-postası Gönder
                        </button>

                        {editing && (
                            <button 
                               onClick={handleSave}
                               className="bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded-xl font-bold shadow-lg transition w-full md:w-auto"
                            >
                                DEĞİŞİKLİKLERİ KAYDET
                            </button>
                        )}
                    </div>
                </div>
            </div>

        </div>
      </div>
      <Footer />
    </div>
  )
}

function InputGroup({ label, value, onChange, disabled, placeholder }) {
    return (
        <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-2">{label}</label>
            <input 
                type="text" 
                value={value || ''} 
                onChange={onChange} 
                disabled={disabled}
                placeholder={placeholder}
                className={`w-full bg-[#0a192f] border rounded-lg px-4 py-3 text-sm text-white outline-none transition
                ${disabled ? 'border-slate-700 opacity-60 cursor-not-allowed' : 'border-slate-500 focus:border-orange-500'}`}
            />
        </div>
    )
}