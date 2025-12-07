import Head from 'next/head'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

export default function Technologies() {
  return (
    <div className="min-h-screen bg-[#0a192f] font-sans text-slate-200 selection:bg-orange-500 selection:text-white overflow-x-hidden">
      <Head>
        <title>Sistem Yetenekleri | Freelog AI</title>
      </Head>

      <div className="fixed top-0 w-full z-50 border-b border-white/5 bg-[#0a192f]/90 backdrop-blur-md">
        <Navbar />
      </div>

      {/* --- HERO SECTION --- */}
      {/* KRAL AYAR: pt-32 ile başlıklar yukarı alındı */}
      <section className="relative pt-32 pb-16 text-center overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-blue-600/10 blur-[100px] rounded-full pointer-events-none"></div>
        
        <div className="container mx-auto px-6 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded border border-blue-400/30 bg-blue-500/5 mb-6">
            <span className="text-xs font-mono text-blue-400 tracking-widest uppercase">Drıver Applıcatıon V1.0</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Sürücü Odaklı <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">Akıllı Arayüz</span>
          </h1>
          
          <p className="text-slate-400 max-w-2xl mx-auto text-lg leading-relaxed">
            Yapay zeka asistanı, tek tuşla durum yönetimi ve dinamik navigasyon. <br className="hidden md:block"/> Hepsi tek ekranda.
          </p>
        </div>
      </section>

      {/* --- ANA GÖSTERİM: TABLET UI VE ÖZELLİKLER --- */}
      <section className="py-4 relative">
        
        {/* ARKA PLAN: TÜRKİYE HARİTASI */}
        <div className="absolute inset-0 z-0">
           <img 
             src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop"
             alt="Turkey Map Background"
             className="w-full h-full object-cover opacity-40 scale-125 mix-blend-screen"
           />
           <div className="absolute inset-0 bg-[#0a192f]/70"></div>
        </div>

        <div className="container mx-auto px-6 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            
            {/* SOL: TABLET MOCKUP */}
            <div className="lg:w-3/5 relative group perspective-1000">
              <div className="absolute -inset-4 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-3xl blur opacity-25 group-hover:opacity-40 transition duration-500 animate-pulse"></div>
              
              {/* Tablet Çerçevesi */}
              <div className="relative bg-[#050505] rounded-[2rem] border-[12px] border-[#111] shadow-2xl overflow-hidden transform rotate-y-6 hover:rotate-y-0 transition duration-700 ease-out ring-1 ring-white/10">
                
                {/* EKRAN İÇERİĞİ */}
                <div className="aspect-[16/10] bg-slate-900 relative overflow-hidden font-sans">
                  
                  {/* HARİTA ZEMİNİ */}
                  <div className="absolute inset-0 bg-[url('https://api.mapbox.com/styles/v1/mapbox/dark-v10/static/29.0,41.0,11,0/800x500?access_token=YOUR_TOKEN')] bg-cover bg-center opacity-60 contrast-125"></div>
                  <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 opacity-60 mix-blend-overlay"></div>

                  {/* ROTA ÇİZGİSİ */}
                  <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 800 500" preserveAspectRatio="none">
                      <path d="M -50 550 Q 200 450 350 350 T 900 100"
                            stroke="#3b82f6" strokeWidth="8" fill="none" strokeLinecap="round"
                            style={{filter: 'drop-shadow(0 0 8px rgba(59,130,246,0.8))'}} />
                      <circle cx="350" cy="350" r="8" fill="white" className="animate-ping" opacity="0.5"/>
                      <circle cx="350" cy="350" r="5" fill="#3b82f6"/>
                  </svg>

                  {/* SOL ÜST: DURUM BUTONLARI */}
                  <div className="absolute top-6 left-6 flex flex-col gap-3 z-30">
                      <div className="bg-black/60 backdrop-blur border-l-4 border-blue-500 pl-3 py-1 pr-4 rounded-r mb-2">
                          <p className="text-[9px] text-slate-400 uppercase tracking-widest">AKTİF ARAÇ</p>
                          <p className="text-white font-bold font-mono text-sm">34 FRE 25</p>
                      </div>
                      <button className="flex items-center gap-3 bg-blue-600/90 hover:bg-blue-500 backdrop-blur-md px-4 py-2 rounded-lg text-white shadow-lg transition transform active:scale-95 w-32 border border-blue-400/30">
                          <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                          <span className="text-xs font-bold tracking-wide">YÜKTE</span>
                      </button>
                      <button className="flex items-center gap-3 bg-slate-800/80 hover:bg-slate-700/80 backdrop-blur-md px-4 py-2 rounded-lg text-slate-300 border border-slate-600 transition w-32">
                          <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                          <span className="text-xs font-bold tracking-wide">BOŞ</span>
                      </button>
                      <button className="flex items-center gap-3 bg-red-600/80 hover:bg-red-500/80 backdrop-blur-md px-4 py-2 rounded-lg text-white border border-red-400/30 transition w-32 mt-2">
                          <span className="text-xs">🚨</span>
                          <span className="text-xs font-bold tracking-wide">SOS</span>
                      </button>
                  </div>

                  {/* SOL ALT: AI ASİSTAN (YEDEK GÖRSELLİ) */}
                  <div className="absolute bottom-6 left-6 z-30 flex items-center gap-4">
                      <div className="relative w-16 h-16 rounded-full p-0.5 bg-gradient-to-tr from-cyan-400 to-blue-600 shadow-[0_0_20px_rgba(34,211,238,0.5)]">
                          <div className="w-full h-full rounded-full overflow-hidden bg-black relative">
                             {/* Asıl Resim */}
                             <img 
                               src="/images/ai_avatar.png"
                            
                             />
                             <div className="absolute inset-0 bg-cyan-500/10 mix-blend-overlay"></div>
                          </div>
                          <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-black flex items-center justify-center">
                             <div className="w-2 h-2 bg-white rounded-full animate-ping"></div>
                          </div>
                      </div>
                      <div className="bg-black/70 backdrop-blur-xl border border-cyan-500/30 px-4 py-2 rounded-2xl rounded-bl-none shadow-lg animate-float-up max-w-[200px]">
                          <p className="text-[9px] text-cyan-400 font-bold mb-0.5 uppercase tracking-wider">Freelog Asistan</p>
                          <p className="text-xs text-white leading-snug">"Trafik yoğunluğu var. Alternatif rotaya geçiliyor..."</p>
                      </div>
                  </div>

                  {/* SAĞ ALT: HIZ GÖSTERGESİ */}
                  <div className="absolute bottom-6 right-6 z-30">
                      <div className="w-20 h-20 bg-black/40 backdrop-blur rounded-full border-4 border-orange-500 flex flex-col items-center justify-center shadow-xl">
                          <span className="text-2xl font-black text-white leading-none">84</span>
                          <span className="text-[8px] text-slate-300 font-bold uppercase">km/s</span>
                      </div>
                  </div>

                </div>
              </div>
            </div>

            {/* SAĞ: ÖZELLİK ANLATIMI (FOTOĞRAFLI - EMOJİSİZ) */}
            <div className="lg:w-2/5 space-y-6">
              <h3 className="text-3xl font-bold text-white mb-8">OPERASYONUN KALBİ</h3>
              
              {/* Kart 1: Asistan */}
              <div className="group relative rounded-xl overflow-hidden p-6 border border-slate-700 hover:border-cyan-500/50 transition duration-500 h-32 flex items-center">
                 <img src="https://images.unsplash.com/photo-1531746790731-6c087fecd65a?q=80&w=2000&auto=format&fit=crop" className="absolute inset-0 w-full h-full object-cover opacity-20 group-hover:opacity-30 transition duration-500" alt="AI Tech" />
                 <div className="absolute inset-0 bg-gradient-to-r from-[#0a192f] to-transparent"></div>
                 <div className="relative z-10 pl-2 border-l-4 border-cyan-500">
                    <h4 className="text-white font-bold text-lg mb-1">Yapay Zeka Asistanı</h4>
                    <p className="text-sm text-slate-300 leading-relaxed">Sürücü ekrana bakmadan, sesli komutlarla yük bilgisini sorgular.</p>
                 </div>
              </div>

              {/* Kart 2: Tek Tuş */}
              <div className="group relative rounded-xl overflow-hidden p-6 border border-slate-700 hover:border-blue-500/50 transition duration-500 h-32 flex items-center">
                 <img src="https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=1974&auto=format&fit=crop" className="absolute inset-0 w-full h-full object-cover opacity-20 group-hover:opacity-30 transition duration-500" alt="Touch Interface" />
                 <div className="absolute inset-0 bg-gradient-to-r from-[#0a192f] to-transparent"></div>
                 <div className="relative z-10 pl-2 border-l-4 border-blue-500">
                    <h4 className="text-white font-bold text-lg mb-1">Tek Tuşla Yönetim</h4>
                    <p className="text-sm text-slate-300 leading-relaxed">Karmaşık formlar yok. Tek dokunuşla tüm operasyon güncellenir.</p>
                 </div>
              </div>

              {/* Kart 3: SOS */}
              <div className="group relative rounded-xl overflow-hidden p-6 border border-slate-700 hover:border-red-500/50 transition duration-500 h-32 flex items-center">
                 <img src="https://images.unsplash.com/photo-1599256621730-d3b69c167645?q=80&w=2069&auto=format&fit=crop" className="absolute inset-0 w-full h-full object-cover opacity-20 group-hover:opacity-30 transition duration-500" alt="Emergency Light" />
                 <div className="absolute inset-0 bg-gradient-to-r from-[#0a192f] to-transparent"></div>
                 <div className="relative z-10 pl-2 border-l-4 border-red-500">
                    <h4 className="text-white font-bold text-lg mb-1">Acil Durum (SOS)</h4>
                    <p className="text-sm text-slate-300 leading-relaxed">Kaza anında konum ve acil durum kodu merkeze öncelikli iletilir.</p>
                 </div>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* --- GELECEK VİZYONU (ROADMAP) --- */}
      <section className="py-20 bg-[#050e1c] border-t border-white/5">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-4">Gelecek Sürüm Hedefleri</h2>
            <p className="text-slate-400">Şu an laboratuvar ortamında geliştirmekte olduğumuz V2.0 modülleri.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            
            {/* KART 1: KOLEKTİF ZEKA */}
            <div className="relative rounded-2xl border border-slate-800 p-8 overflow-hidden group hover:border-blue-500/50 transition duration-300 h-64 flex flex-col justify-end">
               <img src="https://images.unsplash.com/photo-1485827404703-89b55fcc595e?q=80&w=2070&auto=format&fit=crop" className="absolute inset-0 w-full h-full object-cover opacity-20 group-hover:opacity-30 transition duration-500" alt="Network" />
               <div className="absolute inset-0 bg-gradient-to-t from-[#050e1c] via-[#050e1c]/80 to-transparent"></div>
               <div className="relative z-10">
                 <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2"><span className="text-blue-400">🧩</span> Kolektif Zeka</h3>
                 <p className="text-sm text-slate-400 leading-relaxed">Tüm filonun birbirine bağlı olduğu otonom ağ. Trafik verisi anlık paylaşılır.</p>
               </div>
            </div>

            {/* KART 2: PREDICTIVE AI */}
            <div className="relative rounded-2xl border border-slate-800 p-8 overflow-hidden group hover:border-purple-500/50 transition duration-300 h-64 flex flex-col justify-end">
               <img src="https://images.unsplash.com/photo-1620712943543-bcc4688e7485?q=80&w=1965&auto=format&fit=crop" className="absolute inset-0 w-full h-full object-cover opacity-20 group-hover:opacity-30 transition duration-500" alt="AI Brain" />
               <div className="absolute inset-0 bg-gradient-to-t from-[#050e1c] via-[#050e1c]/80 to-transparent"></div>
               <div className="relative z-10">
                 <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2"><span className="text-purple-400">🔮</span> Talep Tahminleme</h3>
                 <p className="text-sm text-slate-400 leading-relaxed">Geçmiş verilerle geleceği analiz edip, yük talebini önceden bildiren AI.</p>
               </div>
            </div>

            {/* KART 3: DİJİTAL İKİZ */}
            <div className="relative rounded-2xl border border-slate-800 p-8 overflow-hidden group hover:border-orange-500/50 transition duration-300 h-64 flex flex-col justify-end">
               <img src="https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=2070&auto=format&fit=crop" className="absolute inset-0 w-full h-full object-cover opacity-20 group-hover:opacity-30 transition duration-500" alt="Digital Twin" />
               <div className="absolute inset-0 bg-gradient-to-t from-[#050e1c] via-[#050e1c]/80 to-transparent"></div>
               <div className="relative z-10">
                 <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2"><span className="text-orange-400">🌐</span> Dijital İkiz</h3>
                 <p className="text-sm text-slate-400 leading-relaxed">Operasyonun sanal kopyası üzerinde simülasyon yaparak riskleri sıfıra indirme.</p>
               </div>
            </div>

          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}