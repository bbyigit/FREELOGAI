import Head from 'next/head';
import Link from 'next/link';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useState, useEffect } from 'react';
import { useAuthModal } from '../context/AuthModalContext';

export default function Home() {
   const { openRegister } = useAuthModal();
   const [stats, setStats] = useState({ drivers: 0, loads: 0, cities: 0 });

  // Sayaç Animasyonu (Basit Simülasyon)
  useEffect(() => {
    const interval = setInterval(() => {
      setStats(prev => ({
        drivers: prev.drivers < 850 ? prev.drivers + 17 : 850,
        loads: prev.loads < 1240 ? prev.loads + 24 : 1240,
        cities: 81
      }));
    }, 50);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[#0a192f] font-sans text-slate-200 selection:bg-orange-500 selection:text-white overflow-x-hidden">
      <Head>
        <title>Freelog AI | Lojistiğin Dijital Omurgası</title>
        <meta name="description" content="Yük verenler ve sürücüler için yapay zeka destekli yeni nesil lojistik platformu." />
      </Head>

      <Navbar />

      {/* --- HERO SECTION (ANA GİRİŞ) --- */}
      <header className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        {/* Arka Plan Efektleri */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-blue-600/20 blur-[120px] rounded-full pointer-events-none opacity-50"></div>
        <div className="absolute bottom-0 right-0 w-[800px] h-[800px] bg-orange-500/10 blur-[100px] rounded-full pointer-events-none opacity-30"></div>

        <div className="container mx-auto px-6 relative z-10 text-center">
          
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 mb-8 animate-fade-in-down">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            <span className="text-xs font-bold text-blue-400 tracking-[0.2em] uppercase">Donanım & Yazılım Bütünleşik Çözüm</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-black text-white leading-tight mb-8 tracking-tight drop-shadow-2xl">
            FREELOG <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-500">AKILLI</span> TAŞIMA
          </h1>

          <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed mb-12">
            Sürücülerimize özel geliştirdiğimiz <strong>Freelog Tablet</strong> ile 
            navigasyon, yük bulma ve iletişim tek ekranda. Telefon karmaşasına son.
          </p>

            {/* --- CTA BUTONLARI (GÜNCELLENDİ: MODAL AÇIYOR) --- */}
          <div className="flex flex-col md:flex-row justify-center gap-6 mb-16">
            
            {/* KURUMSAL BUTON */}
            <button 
              onClick={openRegister}
              className="group relative px-8 py-5 bg-white text-[#0a192f] rounded-2xl font-black text-lg shadow-xl shadow-white/10 hover:shadow-white/20 transition transform hover:-translate-y-1 overflow-hidden"
            >
              <div className="absolute inset-0 bg-slate-200 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
              <span className="relative flex items-center gap-3">
                🏢 YÜK VERENİM
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
              </span>
            </button>

            {/* SÜRÜCÜ BUTONU */}
            <button 
              onClick={openRegister}
              className="group relative px-8 py-5 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-2xl font-black text-lg shadow-xl shadow-orange-900/40 hover:shadow-orange-900/60 transition transform hover:-translate-y-1"
            >
              <span className="relative flex items-center gap-3">
                🚛 SÜRÜCÜYÜM
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
              </span>
            </button>
          </div>

          {/* SAYAÇLAR */}
          <div className="grid grid-cols-3 gap-4 md:gap-12 border-t border-white/5 pt-12 max-w-4xl mx-auto">
             <div>
                <div className="text-3xl md:text-5xl font-mono font-bold text-white mb-2">{stats.drivers}+</div>
                <div className="text-[10px] md:text-xs text-slate-500 uppercase tracking-widest font-bold">Dağıtılan Tablet</div>
             </div>
             <div className="border-x border-white/5 px-4">
                <div className="text-3xl md:text-5xl font-mono font-bold text-orange-500 mb-2">{stats.loads}</div>
                <div className="text-[10px] md:text-xs text-slate-500 uppercase tracking-widest font-bold">Anlık Sinyal</div>
             </div>
             <div>
                <div className="text-3xl md:text-5xl font-mono font-bold text-blue-500 mb-2">{stats.cities}</div>
                <div className="text-[10px] md:text-xs text-slate-500 uppercase tracking-widest font-bold">Kapsama Alanı</div>
             </div>
          </div>

        </div>
      </header>

      {/* --- TABLET / KIOSK TANITIM BÖLÜMÜ (YENİLENMİŞ) --- */}
      <section className="py-24 bg-[#112240] border-y border-slate-700 relative overflow-hidden">
         <div className="container mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center relative z-10">
            
            {/* SOL: METİN ALANI */}
            <div className="space-y-8">
               <div className="inline-block bg-blue-600/20 text-blue-400 text-xs font-bold px-3 py-1 rounded-lg border border-blue-500/30">
                  📟 FREELOG PAD v2.0
               </div>
               <h2 className="text-3xl md:text-5xl font-bold text-white leading-tight">
                  Sürücüler İçin Hazır <br/>
                  <span className="text-slate-400">Akıllı Kokpit Deneyimi.</span>
               </h2>
               <p className="text-slate-400 text-lg leading-relaxed">
                  Kendi telefonunuzu yormayın, şarjını bitirmeyin. Freelog'a kayıtlı her araca
                  özel <strong>Tablet</strong> entegre ediyoruz. Radar sistemiyle 250 km çapındaki yükleri 
                  anlık tarayın, navigasyonla hedefe kilitlenin.
               </p>
               
               <ul className="space-y-4 mt-4">
                  <li className="flex items-center gap-3 text-slate-300">
                     <div className="w-6 h-6 rounded-full bg-green-500/20 text-green-500 flex items-center justify-center text-xs">✓</div>
                     <span>7/24 Canlı Destek Bağlantısı</span>
                  </li>
                  <li className="flex items-center gap-3 text-slate-300">
                     <div className="w-6 h-6 rounded-full bg-green-500/20 text-green-500 flex items-center justify-center text-xs">✓</div>
                     <span>Özelleştirilmiş Kamyon Navigasyonu</span>
                  </li>
                  <li className="flex items-center gap-3 text-slate-300">
                     <div className="w-6 h-6 rounded-full bg-green-500/20 text-green-500 flex items-center justify-center text-xs">✓</div>
                     <span>Tek Tuşla Yük Kabul & Dijital İmza</span>
                  </li>
               </ul>

               <div className="pt-4">
                   <div className="text-xs text-slate-500 font-bold uppercase mb-2">PARTNER ÜRETİCİLER</div>
                   <div className="flex gap-4 opacity-50 grayscale hover:grayscale-0 transition duration-500">
                       <span className="text-xl font-black text-white">SAMSUNG</span>
                       <span className="text-xl font-black text-white">?</span>
                   </div>
               </div>
            </div>

            {/* SAĞ: TABLET MOCKUP (GÖRSELDEKİ GİBİ YATAY) */}
            <div className="relative flex justify-center lg:justify-end">
               <div className="absolute inset-0 bg-blue-500/20 blur-[100px] rounded-full pointer-events-none"></div>
               
               {/* TABLET ÇERÇEVESİ (CSS İLE ÇİZİM) */}
               <div className="relative w-[600px] h-[380px] bg-black rounded-[2rem] border-[12px] border-slate-800 shadow-2xl shadow-blue-900/50 overflow-hidden transform rotate-1 hover:rotate-0 transition duration-700">
                  
                  {/* Kamera Deliği */}
                  <div className="absolute top-1/2 left-2 -translate-y-1/2 w-2 h-2 bg-slate-700 rounded-full z-20"></div>

                  {/* EKRAN İÇERİĞİ */}
                  <div className="w-full h-full bg-[#0f172a] relative flex">
                     
                     {/* SOL MENÜ (RADAR AYARLARI) - GÖRSELDEKİ GİBİ */}
                     <div className="w-24 bg-[#0a1420]/90 backdrop-blur border-r border-white/5 flex flex-col items-center py-6 gap-6 z-10 relative">
                        <div className="w-10 h-10 rounded-full bg-orange-600 flex items-center justify-center text-white text-xs font-bold shadow-lg shadow-orange-900/50">
                            Radar
                        </div>
                        
                        {/* MESAFE SLIDER GÖRÜNÜMÜ */}
                        <div className="flex-1 w-12 bg-slate-800/50 rounded-full py-2 flex flex-col justify-between items-center relative">
                            {/* Seçili Olan */}
                            <div className="w-10 h-10 rounded-full bg-orange-500 text-white flex items-center justify-center text-[10px] font-bold z-10 shadow-lg">
                                25 km
                            </div>
                            <div className="w-8 h-8 rounded-full bg-slate-700/50 text-slate-400 flex items-center justify-center text-[9px]">50</div>
                            <div className="w-8 h-8 rounded-full bg-slate-700/50 text-slate-400 flex items-center justify-center text-[9px]">100</div>
                            <div className="w-8 h-8 rounded-full bg-slate-700/50 text-slate-400 flex items-center justify-center text-[9px]">250</div>
                            
                            {/* Çizgi */}
                            <div className="absolute top-2 bottom-2 w-0.5 bg-slate-600 z-0"></div>
                        </div>

                        <div className="text-[8px] text-slate-500 font-bold uppercase rotate-180" style={{writingMode: 'vertical-rl'}}>
                           MENZİL AYARI
                        </div>
                     </div>

                     {/* HARİTA ALANI (SAĞ TARAF) */}
                     <div className="flex-1 relative bg-slate-800 overflow-hidden group">
                        {/* Harita Arka Planı (Temsili Görsel veya Renk) */}
                        <div className="absolute inset-0 bg-[#3b82f6]/10">
                            {/* Temsili Harita Çizgileri */}
                            <svg className="absolute w-full h-full opacity-20" viewBox="0 0 100 100" preserveAspectRatio="none">
                                <path d="M0 20 Q 50 10 100 30" stroke="white" strokeWidth="0.5" fill="none"/>
                                <path d="M10 0 Q 30 50 20 100" stroke="white" strokeWidth="0.5" fill="none"/>
                                <path d="M60 0 Q 70 50 90 100" stroke="white" strokeWidth="0.5" fill="none"/>
                                <path d="M0 80 Q 50 60 100 90" stroke="white" strokeWidth="0.5" fill="none"/>
                            </svg>
                        </div>

                        {/* KONUM NOKTASI (RADAR MERKEZİ) */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                            <div className="relative">
                                <div className="w-4 h-4 bg-orange-500 rounded-full border-2 border-white shadow-xl z-20 relative"></div>
                                {/* Radar Dalgası Animasyonu */}
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 border border-orange-500/30 rounded-full animate-ping"></div>
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 border border-orange-500/10 rounded-full"></div>
                            </div>
                        </div>

                        {/* YÜK NOKTALARI (Temsili) */}
                        <div className="absolute top-1/3 left-2/3 w-8 h-8 bg-white text-blue-900 rounded-lg shadow-lg flex items-center justify-center text-xs font-bold animate-bounce cursor-pointer hover:scale-110 transition">
                            📦
                        </div>
                        <div className="absolute bottom-1/4 left-1/3 w-8 h-8 bg-white text-blue-900 rounded-lg shadow-lg flex items-center justify-center text-xs font-bold cursor-pointer hover:scale-110 transition">
                            📦
                        </div>

                        {/* ÜST BİLGİ ÇUBUĞU */}
                        <div className="absolute top-4 right-4 bg-black/60 backdrop-blur px-3 py-1 rounded text-[10px] text-white border border-white/10">
                           ● CANLI: İSTANBUL
                        </div>
                     </div>
                  </div>
               </div>
               
               {/* YANSIMA EFEKTİ */}
               <div className="absolute -bottom-10 w-[500px] h-10 bg-black/50 blur-xl rounded-[100%]"></div>
            </div>

         </div>
      </section>

      {/* --- AVANTAJLAR --- */}
      <section className="py-20 container mx-auto px-6">
         <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white">Neden Freelog?</h2>
            <p className="text-slate-400">Geleneksel lojistiği teknolojiyle yeniden yazdık.</p>
         </div>
         
         <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard icon="🚀" title="Donanım Destekli" desc="Size verdiğimiz tablet ile işinizi yönetin. Telefonunuz şahsi kalsın." />
            <FeatureCard icon="🛡️" title="Sigortalı Taşıma" desc="Tüm taşımalar X Sigorta güvencesiyle koruma altında." />
            <FeatureCard icon="💰" title="Garantili Ödeme" desc="Teslimat onayı verildiği an ödemeniz hesabınızda." />
         </div>
      </section>

      <Footer />
    </div>
  )
}

function FeatureCard({ icon, title, desc }) {
   return (
      <div className="bg-[#112240] p-8 rounded-2xl border border-slate-700 hover:border-orange-500/50 transition group">
         <div className="text-4xl mb-6 group-hover:scale-110 transition duration-300">{icon}</div>
         <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
         <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
      </div>
   )
}