import Head from 'next/head'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import { useRouter } from 'next/router'; // Router eklendi
import Footer from '../components/Footer'

export default function Home() {
  const [loading, setLoading] = useState(true)
  const [progress, setProgress] = useState(0)
  const [loadingText, setLoadingText] = useState("SİSTEM BAŞLATILIYOR...")

  const router = useRouter(); // Router tanımlandı

  // --- SİNEMATİK INTRO VE SKIP MANTIĞI ---
  useEffect(() => {
    // 1. Router hazır olana kadar bekle
    if (!router.isReady) return;

    // 2. Eğer URL'de ?skip=true varsa animasyonu ATLA
    if (router.query.skip === 'true') {
      setLoading(false);
      return;
    }

    // 3. Skip yoksa animasyonu oynat
    const texts = [
      "UYDU BAĞLANTISI KURULUYOR...",
      "VERİ TABANI SENKRONİZE EDİLİYOR...",
      "ROTA ALGORİTMALARI YÜKLENİYOR...",
      "SÜRÜCÜ ARAYÜZLERİ AKTİF...",
      "GÜVENLİK PROTOKOLLERİ HAZIR..."
    ]

    let step = 0;
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval)
          setTimeout(() => setLoading(false), 800)
          return 100
        }
        if (prev % 20 === 0 && step < texts.length) {
          setLoadingText(texts[step])
          step++
        }
        return prev + 2
      })
    }, 40)

    return () => clearInterval(interval)
  }, [router.isReady, router.query]) // Dependency array güncellendi

  // --- INTRO EKRANI (LOGO EKLENDİ) ---
  if (loading) {
    return (
      <div className="fixed inset-0 bg-[#0a192f] z-[100] flex flex-col items-center justify-center font-mono text-orange-500">
        
        {/* LOGO ALANI */}
        <div className="mb-6 relative animate-pulse">
           {/* Logo Arkasındaki Glow Efekti */}
           <div className="absolute inset-0 bg-orange-500 blur-3xl opacity-20 rounded-full"></div>
           {/* Logo Görseli */}
           <img 
              src="/images/logo.png" 
              alt="Freelog Logo" 
              className="w-44 h-auto relative z-10 drop-shadow-2xl" 
           />
        </div>
        
        {/* PROGRESS BAR */}
        <div className="w-80 h-1 bg-slate-800 rounded-full overflow-hidden relative border border-slate-700">
          <div 
            className="h-full bg-gradient-to-r from-orange-600 via-orange-500 to-yellow-400 shadow-[0_0_20px_rgba(249,115,22,1)] transition-all duration-75 ease-out"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        
        {/* YAZILAR */}
        <div className="mt-4 flex justify-between w-80 text-[10px] text-slate-400 uppercase tracking-widest font-bold">
          <span className="animate-pulse">{loadingText}</span>
          <span className="text-orange-500">%{progress}</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a192f] font-sans text-slate-200 selection:bg-orange-500 selection:text-white overflow-x-hidden">
      <Head>
        <title>Freelog AI | Geleceğin Lojistiği</title>
        <meta name="description" content="Yapay Zeka Destekli Otonom Lojistik" />
      </Head>

      <div className="fixed top-0 w-full z-50 border-b border-white/5 bg-[#0a192f]/90 backdrop-blur-md">
        <Navbar />
      </div>

      {/* --- HERO SECTION --- */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        
        <div className="absolute inset-0 z-0">
          {/* HERO ARKAPLAN GÖRSELİ */}
          <img 
            src="https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=2070&auto=format&fit=crop" 
            alt="AI Tech Background" 
            className="w-full h-full object-cover opacity-10 scale-110 animate-slow-zoom" 
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0a192f] via-transparent to-[#0a192f]"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#0a192f_100%)]"></div>
        </div>

        <div className="container mx-auto px-6 relative z-10 pt-20 text-center">
          
          <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full border border-orange-500/20 bg-orange-500/5 backdrop-blur-md mb-8 animate-fade-in-up">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
            </span>
            <span className="text-xs font-bold text-orange-400 tracking-[0.2em] uppercase">Canlı Veri Akışı Aktif</span>
          </div>

          <h1 className="text-5xl md:text-8xl font-black text-white leading-tight mb-8 tracking-tight animate-fade-in-up delay-100">
            SAHADAN MERKEZE <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-600 animate-gradient">
              DİJİTAL AKIŞ
            </span>
          </h1>

          <p className="text-lg md:text-2xl text-slate-400 max-w-3xl mx-auto mb-12 font-light leading-relaxed animate-fade-in-up delay-200">
            Gerçek zamanlı veri, tam görünürlük ve uçtan uca <strong className="text-white">lojistik orkestrasyonu.</strong><br/>
            Kaosu matematiğe çeviriyoruz.
          </p>

          <div className="flex justify-center animate-fade-in-up delay-300">
            <Link href="/demo" className="group relative w-72 h-16 bg-gradient-to-r from-orange-700 to-orange-600 rounded-xl overflow-hidden shadow-[0_0_30px_rgba(234,88,12,0.4)] hover:shadow-[0_0_50px_rgba(234,88,12,0.7)] transition-all duration-500">
              <div className="absolute inset-0 opacity-20 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,rgba(255,255,255,0.1)_10px,rgba(255,255,255,0.1)_20px)] animate-slide-bg"></div>
              <div className="absolute top-0 -left-full w-1/2 h-full bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-[-20deg] animate-shine"></div>
              <div className="relative h-full flex items-center justify-between px-6 z-10">
                <span className="font-bold text-white tracking-widest text-sm group-hover:text-orange-100 transition-colors">
                  SİSTEMİ BAŞLAT
                </span>
                <div className="relative w-8 h-8 text-white group-hover:translate-x-2 transition-transform duration-300">
                   <div className="absolute top-1/2 -left-4 w-6 h-[2px] bg-orange-300 rounded-full opacity-0 group-hover:opacity-100 group-hover:-translate-x-2 transition-all duration-500"></div>
                   <div className="absolute top-1/3 -left-6 w-4 h-[1px] bg-orange-300 rounded-full opacity-0 group-hover:opacity-70 group-hover:-translate-x-3 transition-all duration-700"></div>
                   <svg className="w-full h-full drop-shadow-[0_0_5px_rgba(255,255,255,0.8)]" fill="currentColor" viewBox="0 0 24 24"><path d="M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4zM6 18.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm13.5-9l1.96 2.5H17V9.5h2.5zm-1.5 9c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/></svg>
                </div>
              </div>
            </Link>
          </div>
        </div>
        
        <div className="absolute bottom-0 w-full h-32 bg-gradient-to-t from-[#0a192f] to-transparent z-20"></div>
      </section>

      {/* --- PROJENİN GERÇEK GÜÇLERİ (FOTOĞRAFLI KARTLAR - REVİZE EDİLDİ) --- */}
      <section className="py-24 bg-[#0a192f] relative">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-12">
            
            {/* KART 1: GERÇEK ZAMANLI VERİ */}
            <div className="group relative p-1 rounded-2xl bg-gradient-to-b from-white/10 to-transparent hover:from-orange-500/50 transition duration-500 h-full">
              <div className="bg-[#112240] p-8 rounded-xl h-full relative overflow-hidden">
                {/* ARKA PLAN FOTOĞRAFI */}
                <img 
                  src="https://images.unsplash.com/photo-1544197150-b99a580bb7a8?q=80&w=2070&auto=format&fit=crop" 
                  alt="Data Highway Speed" 
                  className="absolute inset-0 w-full h-full object-cover opacity-30 group-hover:opacity-40 transition-opacity duration-500"
                />
                <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-t from-[#112240] via-[#112240]/80 to-orange-900/10"></div>
                
                <div className="relative z-10">
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
                    <span className="text-3xl text-orange-500 drop-shadow-[0_0_10px_rgba(249,115,22,0.5)]">⚡</span>
                    Milisaniyelik Senkronizasyon
                  </h3>
                  <p className="text-slate-400 leading-relaxed text-sm">
                    Konvansiyonel GPS'in aksine; Freelog NoSQL mimarisiyle araç konumunu, yük durumunu (Dolu/Boş) ve sensör verilerini <span className="text-orange-400 font-bold">canlı yayın hızında</span> merkeze işler.
                  </p>
                </div>
              </div>
            </div>

            {/* KART 2: OTONOM İŞ AKIŞI */}
            <div className="group relative p-1 rounded-2xl bg-gradient-to-b from-white/10 to-transparent hover:from-blue-500/50 transition duration-500 h-full">
              <div className="bg-[#112240] p-8 rounded-xl h-full relative overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1569336415962-a4bd9f69cd83?q=80&w=2069&auto=format&fit=crop" 
                  alt="Digital GPS Map" 
                  className="absolute inset-0 w-full h-full object-cover opacity-25 group-hover:opacity-35 transition-opacity duration-500"
                />
                <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-t from-[#112240] via-[#112240]/80 to-blue-900/10"></div>

                <div className="relative z-10">
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
                    <span className="text-3xl text-blue-500 drop-shadow-[0_0_10px_rgba(59,130,246,0.5)]">🗺️</span>
                    Otonom Rota ve İş Akışı
                  </h3>
                  <p className="text-slate-400 leading-relaxed text-sm">
                    Manuel telefon trafiği bitti. Yük havuzundan seçilen iş, saniyeler içinde sürücü tabletine düşer ve Google Maps API üzerinden <span className="text-blue-400 font-bold">en optimize rota</span> otomatik çizilir.
                  </p>
                </div>
              </div>
            </div>

            {/* KART 3: SAHA ASİSTANI */}
            <div className="group relative p-1 rounded-2xl bg-gradient-to-b from-white/10 to-transparent hover:from-indigo-500/50 transition duration-500 h-full">
              <div className="bg-[#112240] p-8 rounded-xl h-full relative overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1605280263929-1c42c62ef169?q=80&w=2070&auto=format&fit=crop" 
                  alt="Truck Driver Cockpit" 
                  className="absolute inset-0 w-full h-full object-cover opacity-30 group-hover:opacity-40 transition-opacity duration-500"
                />
                <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-t from-[#112240] via-[#112240]/80 to-indigo-900/10"></div>

                <div className="relative z-10">
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
                    <span className="text-3xl text-indigo-500 drop-shadow-[0_0_10px_rgba(99,102,241,0.5)]">👩🏻</span>
                    Proaktif Saha Asistanı
                  </h3>
                  <p className="text-slate-400 leading-relaxed text-sm">
                    Sürücü dikkati yolda kalmalı. Text-to-Speech motorumuz sürücüyü sesli yönlendirir, tek tuşla durum bildirimi sayesinde operasyonel <span className="text-indigo-400 font-bold">iş yükü %80 azalır.</span>
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* --- TABLET KISMI --- */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop" 
            alt="Global Network Map Night" 
            className="w-full h-full object-cover opacity-40 scale-125" 
          />
           <div className="absolute inset-0 bg-gradient-to-r from-[#0a192f] via-[#0a192f]/60 to-[#0a192f]/90"></div>
        </div>

        <div className="container mx-auto px-6 relative z-10 flex flex-col md:flex-row items-center gap-16">
           <div className="md:w-1/2">
              <h2 className="text-4xl font-bold mb-6">Arayüz Değil, <br/><span className="text-orange-500">Yol Arkadaşı.</span></h2>
              <p className="text-slate-400 text-lg leading-relaxed mb-8">
                Karmaşık paneller mühendisler içindir. Sürücülerimiz için; dikkat dağıtmayan, sesle yönetilen ve proaktif bir asistan tasarladık.
              </p>
              
              <div className="pl-6 border-l-2 border-orange-500 space-y-4">
                <div className="text-sm text-slate-300">
                  <strong className="block text-white mb-1 text-lg">Text-to-Speech Motoru</strong>
                  Sürücü gözünü yoldan ayırmadan talimatları dinler.
                </div>
                <div className="text-sm text-slate-300">
                  <strong className="block text-white mb-1 text-lg">Otonom Durum Algılama</strong>
                  Araç hedefe vardığında sistem bunu GPS'ten anlar, manuel müdahaleyi sıfıra indirir.
                </div>
              </div>
           </div>

           <div className="md:w-1/2 relative">
             {/* TABLET ÇERÇEVESİ */}
             <div className="relative rounded-xl overflow-hidden border-[8px] border-slate-800 shadow-2xl bg-black transform rotate-2 hover:rotate-0 transition duration-700">
               <div className="aspect-video bg-[#0a192f] relative p-4 flex flex-col justify-between overflow-hidden">
                  <div className="absolute inset-0 opacity-40 bg-[url('https://api.mapbox.com/styles/v1/mapbox/dark-v10/static/29.0,41.0,10,0/800x600?access_token=YOUR_TOKEN')] bg-cover grayscale"></div>
                  
                  <div className="flex justify-between items-center relative z-10">
                    <div className="bg-[#112240]/90 backdrop-blur px-3 py-1 rounded-full text-[10px] text-green-400 border border-green-500/30 flex items-center gap-2">
                      <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span> ONLINE
                    </div>
                    <div className="text-xs font-bold text-white">34 AB 123</div>
                  </div>

                  <div className="absolute top-1/2 left-1/4 w-1/2 h-1 bg-slate-700 rounded overflow-hidden">
                    <div className="h-full bg-orange-500 w-full animate-progress-loading"></div>
                  </div>

                  <div className="bg-white/10 backdrop-blur border-l-4 border-orange-500 p-3 rounded relative z-10 animate-float-up">
                    <h4 className="text-white font-bold text-sm">Rota Güncellendi</h4>
                    <p className="text-[10px] text-slate-300">Trafik yoğunluğu algılandı. Alternatif rota oluşturuldu.</p>
                  </div>
               </div>
             </div>
           </div>
        </div>
      </section>

      <Footer />

      <style jsx global>{`
        @keyframes shine { 0% { left: -100%; opacity: 0; } 50% { opacity: 0.5; } 100% { left: 200%; opacity: 0; } }
        .animate-shine { animation: shine 3s infinite; }
        @keyframes slide-bg { 0% { background-position: 0 0; } 100% { background-position: 40px 0; } }
        .animate-slide-bg { animation: slide-bg 4s linear infinite; }
        @keyframes progress-loading { 0% { width: 0%; } 100% { width: 100%; } }
        .animate-progress-loading { animation: progress-loading 2s ease-in-out infinite; }
        .animate-slow-zoom { animation: zoom 20s infinite alternate; }
        @keyframes zoom { from { transform: scale(1.1); } to { transform: scale(1.2); } }
        @keyframes float-up { 0% { transform: translateY(20px); opacity: 0; } 100% { transform: translateY(0); opacity: 1; } }
        .animate-float-up { animation: float-up 1s ease-out forwards; animation-delay: 0.5s; opacity: 0; }
      `}</style>
    </div>
  )
}