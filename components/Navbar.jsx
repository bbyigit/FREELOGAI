import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const router = useRouter();

  // Scroll edilince arka planı koyulaştırma efekti
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) setScrolled(true)
      else setScrolled(false)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Aktif link stili (Turuncu ve Parlak)
  const isActive = (path) => router.pathname === path 
    ? "text-orange-500 font-bold drop-shadow-[0_0_5px_rgba(249,115,22,0.5)]" 
    : "text-slate-300 hover:text-white transition-colors duration-300";

  return (
    // fixed: Sayfa kayınca tepede kalır. z-50: Her şeyin üstünde durur.
    <nav className={`fixed w-full top-0 z-[100] transition-all duration-300 border-b border-white/5 
      ${scrolled ? 'bg-[#0a192f]/95 shadow-2xl backdrop-blur-md' : 'bg-[#0a192f]/80 backdrop-blur-sm'}`}>
      
      <div className="container mx-auto px-6">
        <div className="flex justify-between items-center h-24">
          
          {/* --- LOGO ALANI (ANIMASYONLU GİRİŞ) --- */}
          {/* href="/" olduğu için animasyon OYNAR */}
          <Link href="/" className="flex items-center gap-3 group">
            {/* Logo görseli */}
            <img 
              src="/images/logo.png" 
              alt="Freelog Logo" 
              className="h-16 w-auto object-contain group-hover:scale-105 transition-transform duration-300" 
            />
            {/* Yazı */}
            <span className="text-2xl font-bold text-white tracking-tight font-sans">
              FREELOG <span className="text-orange-500">AI</span>
            </span>
          </Link>

          {/* MASAÜSTÜ MENÜ */}
          <div className="hidden md:flex items-center gap-8 text-sm font-mono tracking-wide">
            
            {/* --- VİZYON LİNKİ (ANIMASYONSUZ GİRİŞ) --- */}
            {/* href="/?skip=true" olduğu için animasyon ATLANIR */}
            <Link href="/?skip=true" className={`${isActive('/')} transition`}>
              VİZYON
            </Link>
            
            <Link href="/teknolojiler" className={`${isActive('/teknolojiler')} transition`}>
              SİSTEM
            </Link>

            <Link href="/iletisim" className={`${isActive('/iletisim')} transition`}>
              İLETİŞİM
            </Link>
            
            {/* Dikey Çizgi Ayıracı */}
            <div className="h-6 w-px bg-slate-700 mx-2"></div>

            {/* BUTONLAR */}
            <Link 
              href="/teklif-ver" 
              className="text-white font-bold hover:text-orange-400 transition flex items-center gap-2 group"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-orange-500 group-hover:animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              YÜK HAVUZU
            </Link>

            <Link 
              href="/demo" 
              className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white px-6 py-2.5 rounded-full font-bold text-xs shadow-lg shadow-orange-900/40 transition-all transform hover:scale-105 flex items-center gap-2"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
              </span>
              CANLI TAKİP
            </Link>
          </div>

          {/* MOBİL MENÜ İKONU */}
          <button onClick={() => setIsOpen(!isOpen)} className="md:hidden text-white p-2 focus:outline-none">
            {isOpen ? (
               <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            ) : (
               <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" /></svg>
            )}
          </button>
        </div>

        {/* MOBİL MENÜ AÇILIR LİSTE (Dark Theme) */}
        {isOpen && (
          <div className="md:hidden py-6 border-t border-slate-700 space-y-4 bg-[#0a192f] absolute left-0 right-0 px-6 shadow-2xl z-50">
            {/* Mobil Ana Sayfa da Hızlı Geçiş Yapsın (skip=true) */}
            <Link href="/?skip=true" onClick={() => setIsOpen(false)} className="block text-slate-300 hover:text-white font-mono">ANA SAYFA</Link>
            
            <Link href="/teknolojiler" onClick={() => setIsOpen(false)} className="block text-slate-300 hover:text-white font-mono">SİSTEM & VİZYON</Link>
            <Link href="/iletisim" onClick={() => setIsOpen(false)} className="block text-slate-300 hover:text-white font-mono">İLETİŞİM</Link>
            <div className="border-t border-slate-700 my-2"></div>
            <Link href="/teklif-ver" onClick={() => setIsOpen(false)} className="block text-white font-bold flex items-center gap-2">
               <span className="text-orange-500">✚</span> YÜK İLANI VER
            </Link>
            <Link href="/demo" onClick={() => setIsOpen(false)} className="block text-orange-400 font-bold flex items-center gap-2 animate-pulse">
               <span>●</span> CANLI TAKİP PANELİ
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}