import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) setScrolled(true)
      else setScrolled(false)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const isActive = (path) => router.pathname === path 
    ? "text-orange-500 font-bold drop-shadow-[0_0_5px_rgba(249,115,22,0.5)]" 
    : "text-slate-300 hover:text-white transition-colors duration-300";

  return (
    // KRAL AYAR: py-1 yaparak dikey boşlukları minimuma indirdik ki logolar çerçeveye sığsın.
    <nav className={`fixed w-full top-0 z-[100] transition-all duration-500 border-b border-white/5 
      ${scrolled ? 'bg-[#0a192f]/95 shadow-xl backdrop-blur-md py-1' : 'bg-[#0a192f]/90 backdrop-blur-sm py-2'}`}>
      
      <div className="container mx-auto px-6">
        <div className="flex justify-between items-center h-20"> {/* h-20 ile Navbar yüksekliğini sabitledik */}
          
          {/* --- MEGA LOGO ALANI --- */}
          <Link href="/" className="flex items-center gap-4 group h-full">
            
            {/* 1. SİMGE (SOLDA - ANİMASYONLU) */}
            <div className="relative h-full flex items-center">
               {/* Arkadaki Hare */}
               <div className="absolute inset-0 bg-orange-500/20 blur-xl rounded-full animate-pulse-slow group-hover:bg-orange-500/40 transition-all scale-110"></div>
               
               {/* Simge Görseli */}
               <img 
                 src="/images/logo_simge.png" 
                 alt="Freelog Simge" 
                 // h-14 (Mobile) -> h-full (Desktop): Navbar boyu kadar
                 className="h-14 md:h-full w-auto relative z-10 drop-shadow-2xl transition-transform duration-500 group-hover:rotate-6" 
               />
               
               {/* Uçuş Animasyonu (Simge Üzerinde Kalsın Dedik) */}
               <div className="absolute top-0 left-0 w-full h-full z-20 overflow-hidden rounded-full pointer-events-none">
                 <div className="w-8 h-8 bg-orange-400 rounded-full blur-md absolute animate-phoenix-fly opacity-0"></div>
               </div>
            </div>

            {/* 2. YAZI (SAĞDA - ANİMASYONSUZ & DEVASA) */}
            <div className="relative h-full flex items-center">
                {/* KRAL AYAR: 
                    - Animasyonlar (shimmer, reflection) SİLİNDİ.
                    - Boyut: h-10 (Mobile) -> h-16 (Desktop). 
                    - h-16 = 64px. Navbar zaten h-20 (80px). 
                    - Bu görsel neredeyse navbar'ı doldurur. 5 kat büyüdü.
                */}
                <img 
                    src="/images/logo_yazi.png" 
                    alt="Freelog Yazı"
                    className="h-10 md:h-36 w-auto object-contain drop-shadow-lg brightness-110"
                />
            </div>

          </Link>

          {/* --- MASAÜSTÜ MENÜ --- */}
          <div className="hidden md:flex items-center gap-8 text-sm font-mono tracking-wide font-bold">
            
            <Link href="/?skip=true" className={`${isActive('/')} hover:text-orange-400 transition hover:scale-105 transform`}>
              VİZYON
            </Link>
            
            <Link href="/teknolojiler" className={`${isActive('/teknolojiler')} hover:text-orange-400 transition hover:scale-105 transform`}>
              SİSTEM
            </Link>

            <Link href="/iletisim" className={`${isActive('/iletisim')} hover:text-orange-400 transition hover:scale-105 transform`}>
              İLETİŞİM
            </Link>
            
            <div className="h-8 w-px bg-slate-700 mx-2"></div>

            {/* BUTONLAR */}
            <Link 
              href="/teklif-ver" 
              className="text-slate-300 hover:text-orange-400 transition flex items-center gap-2 group border border-slate-700 hover:border-orange-500/50 px-4 py-2 rounded-lg text-xs"
            >
              <svg className="w-4 h-4 text-orange-500 group-hover:rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
              YÜK HAVUZU
            </Link>

            <Link 
              href="/demo" 
              className="relative overflow-hidden bg-gradient-to-r from-orange-700 to-red-700 hover:from-orange-600 hover:to-red-600 text-white px-6 py-2.5 rounded-lg shadow-lg transition-all transform hover:scale-105 flex items-center gap-2 group text-xs tracking-wider"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
              </span>
              CANLI TAKİP
              <div className="absolute top-0 -left-full w-1/2 h-full bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-[-20deg] group-hover:animate-shine"></div>
            </Link>
          </div>

          {/* MOBİL MENÜ İKONU */}
          <button onClick={() => setIsOpen(!isOpen)} className="md:hidden text-white p-2 focus:outline-none z-50">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16m-7 6h7"} /></svg>
          </button>
        </div>

        {/* MOBİL MENÜ LİSTESİ */}
        {isOpen && (
          <div className="md:hidden py-6 border-t border-slate-700 space-y-4 bg-[#0a192f] absolute left-0 right-0 px-6 shadow-2xl z-40 animate-fade-in-down top-full">
            <Link href="/?skip=true" onClick={() => setIsOpen(false)} className="block text-slate-300 hover:text-orange-500 font-mono text-sm">ANA SAYFA</Link>
            <Link href="/teknolojiler" onClick={() => setIsOpen(false)} className="block text-slate-300 hover:text-orange-500 font-mono text-sm">SİSTEM</Link>
            <Link href="/iletisim" onClick={() => setIsOpen(false)} className="block text-slate-300 hover:text-orange-500 font-mono text-sm">İLETİŞİM</Link>
            <div className="border-t border-slate-700 my-2"></div>
            <Link href="/teklif-ver" onClick={() => setIsOpen(false)} className="block text-white font-bold flex items-center gap-2 text-sm">
               <span className="text-orange-500">+</span> YÜK İLANI VER
            </Link>
            <Link href="/demo" onClick={() => setIsOpen(false)} className="block text-orange-400 font-bold flex items-center gap-2 text-sm animate-pulse">
               <span>●</span> CANLI TAKİP PANELİ
            </Link>
          </div>
        )}
      </div>

      <style jsx global>{`
        /* Turuncu Işık Kuşu Animasyonu */
        @keyframes phoenixFly {
          0% { left: -20%; top: 80%; opacity: 0; transform: scale(0.5); }
          30% { opacity: 1; }
          100% { left: 120%; top: -20%; opacity: 0; transform: scale(1.5); }
        }
        .animate-phoenix-fly { animation: phoenixFly 4s ease-in-out infinite; }

        /* Yavaş Nabız Efekti */
        @keyframes pulseSlow {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.15); }
        }
        .animate-pulse-slow { animation: pulseSlow 3s infinite; }
        
        /* Diğer Animasyonlar */
        @keyframes shine { 100% { left: 125%; } }
        .group-hover\\:animate-shine:hover { animation: shine 1s; }
        @keyframes fadeInDown { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in-down { animation: fadeInDown 0.3s ease-out; }
      `}</style>
    </nav>
  );
}