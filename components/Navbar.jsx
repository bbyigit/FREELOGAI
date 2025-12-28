import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { auth, db } from '../firebaseConfig';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { useAuthModal } from '../context/AuthModalContext';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [profileOpen, setProfileOpen] = useState(false);
  
  // MERKEZİ KUMANDAYI ÇAĞIRIYORUZ
  const { openLogin, openRegister, closeModal } = useAuthModal(); // closeModal'ı da aldık

  const dropdownRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => window.scrollY > 20 ? setScrolled(true) : setScrolled(false);
    window.addEventListener('scroll', handleScroll);

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          const docRef = doc(db, "users", currentUser.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) setUserRole(docSnap.data().role);
        } catch (error) { console.error(error); }
      } else {
        setUserRole(null);
      }
    });

    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener("mousedown", handleClickOutside);
      unsubscribe();
    };
  }, []);

  // --- DÜZELTİLMİŞ ÇIKIŞ FONKSİYONU ---
  const handleLogout = async () => {
    try {
      await signOut(auth); // Firebase oturumunu kapat
      setProfileOpen(false); // Dropdown'ı kapat
      setUser(null); // Local user state'ini temizle
      setUserRole(null); // Rolü temizle
      closeModal(); // Eğer açık modal varsa kapat (Önemli!)
      
      // Güvenli yönlendirme: Anasayfaya git
      router.push('/').then(() => {
         // İsteğe bağlı: Sayfa yenileme yapabilirsin ama SPA deneyimi için gerek yok.
         // window.location.reload(); 
      });
    } catch (error) {
      console.error("Çıkış hatası:", error);
    }
  };

  // Yük Veren Linkine Tıklama Kontrolü (Giriş Yoksa Modal Aç)
  const handleProtectedLink = (e, path) => {
    if (!user) {
      e.preventDefault(); 
      openLogin(); 
    }
  };

  const isActive = (path) => router.pathname === path 
    ? "text-orange-500 font-bold drop-shadow-[0_0_5px_rgba(249,115,22,0.5)]" 
    : "text-slate-300 hover:text-white transition-colors duration-300";

  return (
    <nav className={`fixed w-full top-0 z-[100] transition-all duration-500 border-b border-white/5 
      ${scrolled ? 'bg-[#0a192f]/95 shadow-xl backdrop-blur-md py-1' : 'bg-[#0a192f]/90 backdrop-blur-sm py-2'}`}>
      
      <div className="container mx-auto px-6">
        <div className="flex justify-between items-center h-20"> 
          
          <Link href="/" className="flex items-center gap-4 group h-full">
            <div className="relative h-full flex items-center">
               <div className="absolute inset-0 bg-orange-500/20 blur-xl rounded-full animate-pulse-slow group-hover:bg-orange-500/40 transition-all scale-110"></div>
               <img src="/images/logo_simge.png" alt="Freelog Simge" className="h-12 md:h-full w-auto relative z-10 drop-shadow-2xl transition-transform duration-500 group-hover:rotate-6" />
            </div>
            <div className="relative h-full flex items-center">
                <img src="/images/logo_yazi.png" alt="Freelog Yazı" className="h-8 md:h-28 w-auto object-contain drop-shadow-lg brightness-110" />
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-6 text-xs font-bold tracking-widest uppercase font-mono">
            <Link href="/vizyon" className={`${isActive('/vizyon')} hover:text-orange-400`}>KURUMSAL</Link>
            <Link href="/nasil-calisir" className={`${isActive('/nasil-calisir')} hover:text-orange-400`}>NASIL ÇALIŞIR?</Link>
            
            {/* SÜRÜCÜLER */}
          <Link
              href="/suruculer"
              onClick={(e) => handleProtectedLink(e)}
              className={`${isActive('/suruculer')} hover:text-orange-400`}
          >
              SÜRÜCÜLER
          </Link>

            {/* YÜK VERENLER */}
          <Link
              href="/yuk-verenler"
              onClick={(e) => handleProtectedLink(e)}
              className={`${isActive('/yuk-verenler')} hover:text-orange-400`}
          >
          YÜK VERENLER
          </Link>


            {userRole === 'admin' && (
              <Link href="/yonetim" className="text-red-500 border border-red-500/30 bg-red-500/10 px-3 py-1 rounded hover:bg-red-500 hover:text-white transition">
                YÖNETİM
              </Link>
            )}

            <Link href="/iletisim" className={`${isActive('/iletisim')} hover:text-orange-400`}>İLETİŞİM</Link>
          </div>

          <div className="hidden md:flex items-center gap-4 pl-4 border-l border-slate-700 ml-4">
            {!user ? (
              <>
                <button onClick={openLogin} className="text-slate-300 hover:text-white text-xs font-bold transition hover:underline decoration-orange-500 decoration-2 underline-offset-4">
                  GİRİŞ YAP
                </button>
                <button onClick={openRegister} className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white px-5 py-2.5 rounded-lg text-xs font-bold transition shadow-lg transform hover:scale-105 active:scale-95 tracking-wide">
                  KAYIT OL
                </button>
              </>
            ) : (
              <div className="relative" ref={dropdownRef}>
                <button onClick={() => setProfileOpen(!profileOpen)} className="flex items-center gap-2 bg-[#112240] border border-slate-700 hover:border-orange-500/50 px-4 py-2 rounded-lg transition group">
                   <div className="w-6 h-6 rounded bg-orange-500 text-white flex items-center justify-center text-[10px] font-bold group-hover:animate-pulse">
                     {user.email?.charAt(0)?.toUpperCase() || "U"}
                   </div>
                   <span className="text-xs text-slate-300 font-bold group-hover:text-white">Hesabım</span>
                   <svg className={`w-3 h-3 text-slate-500 transition-transform ${profileOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </button>

                {profileOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-[#112240] border border-slate-700 rounded-xl shadow-2xl overflow-hidden py-1 animate-fade-in-up z-50">
                    <div className="px-4 py-3 border-b border-slate-700 bg-slate-800/50">
                      <p className="text-[10px] text-orange-500 font-bold uppercase tracking-wider">Aktif Oturum</p>
                      <p className="text-xs text-white truncate font-mono mt-1">{user.email}</p>
                    </div>
                    <Link href="/profil" onClick={() => setProfileOpen(false)} className="block px-4 py-2 text-xs text-slate-300 hover:bg-white/5 hover:text-white flex items-center gap-2"><span>👤</span> Profilim</Link>
                    {userRole === 'admin' && (
                      <Link href="/yonetim" onClick={() => setProfileOpen(false)} className="block px-4 py-2 text-xs text-red-400 hover:bg-white/5 hover:text-red-300 flex items-center gap-2"><span>🛠</span> Admin Paneli</Link>
                    )}
                    <div className="border-t border-slate-700 my-1"></div>
                    <button onClick={handleLogout} className="block w-full text-left px-4 py-2 text-xs text-red-400 hover:bg-red-500/10 hover:text-red-300 flex items-center gap-2"><span>🚪</span> Çıkış Yap</button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* MOBİL MENÜ BUTONU */}
          <button onClick={() => setIsOpen(!isOpen)} className="md:hidden text-white p-2 focus:outline-none z-50">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16m-7 6h7"} /></svg>
          </button>
        </div>

        {/* MOBİL MENÜ İÇERİĞİ */}
        {isOpen && (
          <div className="md:hidden py-6 border-t border-slate-700 bg-[#0a192f] absolute left-0 right-0 px-6 shadow-2xl z-40 animate-fade-in-down top-full flex flex-col gap-4">
            <Link href="/vizyon" className="text-slate-300 hover:text-orange-500 text-sm font-bold font-mono">KURUMSAL</Link>
            <Link href="/nasil-calisir" className="text-slate-300 hover:text-orange-500 text-sm font-bold font-mono">NASIL ÇALIŞIR?</Link>
            
            {/* MOBİL İÇİN KORUMALI LİNKLER */}
            <Link href="/suruculer" onClick={(e) => { if(!user) { e.preventDefault(); openLogin(); setIsOpen(false); } }} className="text-slate-300 hover:text-orange-500 text-sm font-bold font-mono">SÜRÜCÜLER</Link>
            <Link href="/yuk-verenler" onClick={(e) => { if(!user) { e.preventDefault(); openLogin(); setIsOpen(false); } }} className="text-slate-300 hover:text-orange-500 text-sm font-bold font-mono">YÜK VERENLER</Link>
            
            {userRole === 'admin' && (
              <Link href="/yonetim" className="text-red-500 font-bold font-mono border border-red-500/30 p-2 rounded text-center">YÖNETİM PANELİ</Link>
            )}
            
            <div className="border-t border-slate-700 pt-5 flex flex-col gap-3">
               {!user ? (
                 <>
                   <button onClick={() => { openLogin(); setIsOpen(false); }} className="text-center w-full border border-slate-600 text-slate-300 py-3 rounded-lg font-bold text-sm">GİRİŞ YAP</button>
                   <button onClick={() => { openRegister(); setIsOpen(false); }} className="text-center w-full bg-orange-600 text-white py-3 rounded-lg font-bold text-sm">KAYIT OL</button>
                 </>
               ) : (
                 <button onClick={handleLogout} className="text-center w-full bg-red-600/20 text-red-500 border border-red-500/30 py-3 rounded-lg font-bold text-sm">ÇIKIŞ YAP</button>
               )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}