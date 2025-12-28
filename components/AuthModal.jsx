import { useState } from 'react';
import { useRouter } from 'next/router';
import { auth, db } from '../firebaseConfig';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';

export default function AuthModal({ isOpen, onClose, initialView = 'login' }) {
  const [view, setView] = useState(initialView); // 'login' veya 'register'
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Form State
  const [formData, setFormData] = useState({
    email: '', password: '', name: '', surname: '',
    phone: '', companyName: '', taxId: '', tcNo: '', licenseClass: ''
  });
  const [userType, setUserType] = useState('shipper'); // 'shipper' | 'driver'

  if (!isOpen) return null;

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  // --- VALIDASYON FONKSİYONU ---
  const validateForm = () => {
    // 1. Ortak Alan Kontrolleri
    if (!formData.email || !formData.password) {
      alert("E-Posta ve Şifre alanları zorunludur.");
      return false;
    }
    
    // Sadece Kayıt ekranında geçerli kontroller
    if (view === 'register') {
      if (!formData.name || !formData.surname || !formData.phone) {
        alert("Ad, Soyad ve Telefon alanları zorunludur.");
        return false;
      }
      if (formData.password.length < 6) {
        alert("Şifre en az 6 karakter olmalıdır.");
        return false;
      }
      if (formData.phone.length < 10) {
        alert("Lütfen geçerli bir telefon numarası giriniz.");
        return false;
      }

      // Role Özel Kontroller
      if (userType === 'shipper') {
        if (!formData.companyName) { alert("Firma adı zorunludur."); return false; }
        if (formData.taxId.length !== 10) { alert("Vergi Numarası 10 haneli olmalıdır."); return false; }
      } else { // driver
        if (formData.tcNo.length !== 11) { alert("TC Kimlik No 11 haneli olmalıdır."); return false; }
        if (!formData.licenseClass) { alert("Ehliyet sınıfı seçilmelidir."); return false; }
      }
    }
    return true;
  };

  // --- GİRİŞ YAPMA ---
  const handleLogin = async (e) => {
    e.preventDefault();
    if (!validateForm()) return; // Validasyon kontrolü

    setLoading(true);
    try {
      const cred = await signInWithEmailAndPassword(auth, formData.email, formData.password);
      
      // Rol Kontrolü ve Yönlendirme
      const docSnap = await getDoc(doc(db, "users", cred.user.uid));
      if (docSnap.exists()) {
        const role = docSnap.data().role;
        if (role === 'admin') router.push('/yonetim');
        else if (role === 'shipper') router.push('/yuk-verenler');
        else if (role === 'driver') router.push('/suruculer');
      }
      
      onClose(); // Pencereyi kapat
    } catch (err) {
      alert("Giriş Hatası: " + err.message);
    }
    setLoading(false);
  };

  // --- KAYIT OLMA ---
  const handleRegister = async (e) => {
    e.preventDefault();
    if (!validateForm()) return; // Validasyon kontrolü

    setLoading(true);
    try {
      const cred = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      
      // Veritabanına Yazılacak Veriyi Hazırla
      const userData = {
        uid: cred.user.uid,
        email: formData.email,
        name: formData.name.toUpperCase(),
        surname: formData.surname.toUpperCase(),
        phone: formData.phone,
        role: userType,
        createdAt: serverTimestamp(),
      };

      // Tipe Özel Alanları Ekle
      if (userType === 'shipper') {
        userData.companyName = formData.companyName.toUpperCase();
        userData.taxId = formData.taxId;
      } else {
        userData.tcNo = formData.tcNo;
        userData.licenseClass = formData.licenseClass;
        userData.rating = "5.0"; // Başlangıç puanı
      }

      // Firestore'a Kaydet
      await setDoc(doc(db, "users", cred.user.uid), userData);
      
      alert("Kayıt Başarılı! Yönlendiriliyorsunuz...");
      
      // Kayıt Sonrası Yönlendirme
      if (userType === 'shipper') router.push('/yuk-verenler');
      else router.push('/suruculer');
      
      onClose();
    } catch (err) {
      alert("Kayıt Hatası: " + err.message);
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#112240] border border-slate-700 w-full max-w-lg rounded-2xl shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* KAPAT BUTONU */}
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white z-10">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
        </button>

        {/* --- HEADER (SEKMELER) --- */}
        <div className="flex text-center border-b border-slate-700">
          <button 
            onClick={() => setView('login')}
            className={`flex-1 py-4 font-bold text-sm transition ${view === 'login' ? 'bg-[#0a192f] text-orange-500 border-b-2 border-orange-500' : 'text-slate-400 hover:text-white'}`}
          >
            GİRİŞ YAP
          </button>
          <button 
            onClick={() => setView('register')}
            className={`flex-1 py-4 font-bold text-sm transition ${view === 'register' ? 'bg-[#0a192f] text-orange-500 border-b-2 border-orange-500' : 'text-slate-400 hover:text-white'}`}
          >
            KAYIT OL
          </button>
        </div>

        {/* --- İÇERİK (SCROLLABLE) --- */}
        <div className="p-8 overflow-y-auto custom-scrollbar">
          
          {/* LOGO */}
          <div className="text-center mb-6">
             <h2 className="text-2xl font-black text-white tracking-tighter">FREELOG<span className="text-orange-500">.</span></h2>
             <p className="text-xs text-slate-400 mt-1">
               {view === 'login' ? 'Hesabınıza erişin.' : 'Aramıza katılın.'}
             </p>
          </div>

          {/* === GİRİŞ FORMU === */}
          {view === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <Input label="E-Posta" name="email" type="email" onChange={handleChange} />
              <Input label="Şifre" name="password" type="password" onChange={handleChange} />
              
              <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white font-bold py-3 rounded-xl shadow-lg transition mt-4">
                {loading ? 'GİRİŞ YAPILIYOR...' : 'GİRİŞ YAP'}
              </button>
            </form>
          )}

          {/* === KAYIT FORMU === */}
          {view === 'register' && (
            <div className="space-y-4">
              {/* TİP SEÇİMİ */}
              <div className="flex bg-[#0a192f] p-1 rounded-lg border border-slate-700 mb-4">
                <button type="button" onClick={() => setUserType('shipper')} className={`flex-1 py-1.5 text-[10px] font-bold rounded transition ${userType === 'shipper' ? 'bg-orange-600 text-white' : 'text-slate-400'}`}>KURUMSAL</button>
                <button type="button" onClick={() => setUserType('driver')} className={`flex-1 py-1.5 text-[10px] font-bold rounded transition ${userType === 'driver' ? 'bg-blue-600 text-white' : 'text-slate-400'}`}>SÜRÜCÜ</button>
              </div>

              <form onSubmit={handleRegister} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <Input label="Ad" name="name" onChange={handleChange} />
                  <Input label="Soyad" name="surname" onChange={handleChange} />
                </div>

                {userType === 'shipper' ? (
                  <>
                    <Input label="Firma Adı" name="companyName" onChange={handleChange} />
                    <div className="grid grid-cols-2 gap-3">
                      <Input label="Vergi No" name="taxId" type="number" onChange={handleChange} />
                      <Input label="Telefon" name="phone" type="tel" onChange={handleChange} />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="grid grid-cols-2 gap-3">
                      <Input label="TC No" name="tcNo" type="number" onChange={handleChange} />
                      <div className="flex flex-col">
                         <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Ehliyet</label>
                         <select name="licenseClass" onChange={handleChange} className="w-full bg-[#0a192f] border border-slate-600 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-white">
                            <option value="">Seçiniz</option>
                            <option value="C">C (Kamyon)</option>
                            <option value="CE">CE (Tır)</option>
                         </select>
                      </div>
                    </div>
                    <Input label="Telefon" name="phone" type="tel" onChange={handleChange} />
                  </>
                )}

                <Input label="E-Posta" name="email" type="email" onChange={handleChange} />
                <Input label="Şifre" name="password" type="password" onChange={handleChange} />

                <button type="submit" disabled={loading} className={`w-full font-bold py-3 rounded-xl shadow-lg text-white mt-2 ${userType === 'shipper' ? 'bg-orange-600' : 'bg-blue-600'}`}>
                  {loading ? 'KAYDEDİLİYOR...' : 'HESAP OLUŞTUR'}
                </button>
              </form>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

function Input({ label, name, type="text", onChange }) {
  return (
    <div>
      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">{label}</label>
      <input name={name} type={type} onChange={onChange} className="w-full bg-[#0a192f] border border-slate-600 rounded-lg px-3 py-2 text-sm text-white focus:border-white outline-none" />
    </div>
  )
}