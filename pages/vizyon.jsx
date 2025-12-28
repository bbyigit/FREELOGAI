import Head from 'next/head'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

export default function Vizyon() {
  return (
    <div className="min-h-screen bg-[#0a192f] font-sans text-slate-300 selection:bg-orange-500 selection:text-white overflow-x-hidden">
      <Head>
        <title>Kurumsal & Vizyon | Freelog AI</title>
        <meta name="description" content="Lojistiğin dijital dönüşümüne liderlik ediyoruz." />
      </Head>

      <Navbar />

      {/* --- 1. HERO: SADE & GÜÇLÜ (Typography Odaklı + Lojistik BG) --- */}
      <section className="relative pt-48 pb-32 border-b border-white/5 overflow-hidden">
        {/* YENİ: Arka Plan Lojistik Görseli (Saydam) */}
        <div className="absolute inset-0 z-0">
            <img 
                src="https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=2070&auto=format&fit=crop" 
                alt="Global Logistics Network" 
                className="w-full h-full object-cover opacity-40 grayscale"
            />
             <div className="absolute inset-0 bg-[#0a192f]/80"></div> {/* Karartma Katmanı */}
        </div>

        <div className="container mx-auto px-6 relative z-10">
            <div className="max-w-4xl">
                <div className="inline-flex items-center gap-2 mb-6 opacity-60">
                    <span className="w-8 h-[1px] bg-orange-500"></span>
                    <span className="text-xs font-bold tracking-[0.2em] uppercase text-white">Kurumsal Manifesto</span>
                </div>
                <h1 className="text-5xl md:text-7xl font-bold text-white leading-[1.1] tracking-tight mb-8 drop-shadow-2xl">
                    Geleceği <br/>
                    <span className="text-slate-400">Tesadüfe Bırakmıyoruz.</span>
                </h1>
                <p className="text-xl text-slate-400 max-w-2xl leading-relaxed font-light">
                    Freelog olarak lojistiği sadece bir "taşıma işi" olarak görmüyoruz. 
                    Biz, verinin gücüyle ticaretin fiziksel altyapısını yeniden kodluyoruz.
                </p>
            </div>
        </div>
        
        {/* Sağ Taraf Işık Efekti */}
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-blue-900/20 to-transparent pointer-events-none z-10"></div>
      </section>

      {/* --- 2. HİKAYEMİZ & MİSYON (Split Layout - Dergi Tarzı) --- */}
      <section className="py-24 relative z-10">
        <div className="container mx-auto px-6">
            <div className="grid lg:grid-cols-2 gap-20">
                {/* Sol Taraf: Başlık */}
                <div>
                    <h2 className="text-3xl font-bold text-white mb-6">Kaosun İçinde <br/> Düzen Yaratmak.</h2>
                    <div className="w-16 h-1 bg-orange-500 mb-8"></div>
                    <p className="text-lg leading-relaxed mb-6">
                        Lojistik sektörü yıllardır verimsizlik, iletişim kopuklukları ve öngörülemez maliyetlerle boğuşuyor. 
                        Milyarlarca dolarlık bir sektörün "telefon trafiği" ile yönetilmesi sürdürülebilir değildi.
                    </p>
                    <p className="text-lg leading-relaxed">
                        Biz, <strong>Freelog AI</strong> olarak bu denklemi değiştirmek için yola çıktık. 
                        Amacımız basit: Yük veren için şeffaflık, sürücü için adalet, dünya için sürdürülebilirlik.
                    </p>
                </div>

                {/* Sağ Taraf: İstatistiksel Kanıt (Grid) */}
                <div className="grid grid-cols-2 gap-px bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden shadow-2xl">
                    <StatBox number="81" label="İl Kapsama Alanı" />
                    <StatBox number="24/7" label="Operasyonel Destek" />
                    <StatBox number="%40" label="Karbon Tasarrufu" />
                    <StatBox number="AI" label="Destekli Algoritma" />
                </div>
            </div>
        </div>
      </section>

      {/* --- 3. TEMEL PRENSİPLER (Minimalist Kartlar + Teknik BG) --- */}
      <section className="py-24 bg-[#0d1b2a] border-y border-white/5 relative overflow-hidden">
        {/* YENİ: Arka Plan Teknik Çizim Görseli (Saydam) */}
        <div className="absolute inset-0 z-0 opacity-40 pointer-events-none">
            <img 
                src="https://www.transparenttextures.com/patterns/axiom-pattern.png" 
                alt="Tech Pattern" 
                className="w-full h-full object-cover"
            />
        </div>

        <div className="container mx-auto px-6 relative z-10">
            <div className="mb-16 md:flex justify-between items-end">
                <div>
                    <h2 className="text-3xl font-bold text-white">Değerlerimiz</h2>
                    <p className="text-slate-500 mt-2">Bizi biz yapan değişmez kurallarımız.</p>
                </div>
                {/* Dekoratif Çizgi */}
                <div className="hidden md:block w-1/3 h-[1px] bg-slate-800 mb-2"></div>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
                <PrincipleCard 
                    num="01"
                    title="Şeffaflık"
                    desc="Gizli maliyetler, belirsiz konumlar yok. Her veri noktası, her kilometre kayıt altında ve erişilebilir."
                />
                <PrincipleCard 
                    num="02"
                    title="Teknoloji"
                    desc="Geleneksel yöntemleri reddediyoruz. Kararlarımızı hislerle değil, yapay zeka destekli verilerle alıyoruz."
                />
                <PrincipleCard 
                    num="03"
                    title="Sorumluluk"
                    desc="Sadece müşterilerimize karşı değil; sürücülerimize ve gezegenimize karşı da sorumluyuz."
                />
            </div>
        </div>
      </section>

      {/* --- 4. SÜRDÜRÜLEBİLİRLİK (Geniş Doğa Görseli) --- */}
      <section className="relative h-[500px] flex items-center justify-center overflow-hidden my-12 group">
          {/* YENİ: Doğa Odaklı Arka Plan Resmi */}
          <div className="absolute inset-0">
              <img 
                src="https://images.unsplash.com/photo-1508739773434-c26b3d09e071?q=80&w=2070&auto=format&fit=crop" 
                alt="Lush Green Forest Road" 
                className="w-full h-full object-cover opacity-50 grayscale group-hover:grayscale-0 transition duration-1000 ease-in-out transform group-hover:scale-105"
              />
              {/* Daha Koyu Gradyan Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a192f] via-[#0a192f]/60 to-transparent"></div>
          </div>

          <div className="relative z-10 text-center max-w-3xl px-6">
              <div className="inline-block border border-green-500/50 text-green-400 px-4 py-1 rounded-full text-xs font-bold tracking-widest uppercase mb-6 bg-green-900/20 backdrop-blur-sm">
                  Yeşil Lojistik
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 drop-shadow-lg">
                  Doğayla Rekabet Etmiyoruz,<br/> Uyum İçinde Çalışıyoruz.
              </h2>
              <p className="text-lg text-slate-300 font-light drop-shadow">
                  Boş dönen her tır, boşa harcanan milli servet ve doğaya zarar demektir. 
                  Akıllı eşleştirme sistemimizle boş seferleri minimuma indiriyoruz.
              </p>
          </div>
      </section>

      {/* --- 5. TARİHÇE (Clean Timeline) --- */}
      <section className="py-24 container mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
              <h2 className="text-2xl font-bold text-white">Kilometre Taşları</h2>
          </div>
          
          <div className="border-l border-slate-800 ml-4 md:ml-1/2 md:translate-x-[-1px] space-y-12">
              <CleanTimelineItem 
                  year="2023" 
                  title="Temellerin Atılması" 
                  desc="Freelog projesi, sektördeki veri eksikliğini gidermek amacıyla bir Ar-Ge projesi olarak başladı."
              />
              <CleanTimelineItem 
                  year="2024" 
                  title="Freelog Pad v1.0" 
                  desc="İlk donanım prototipi üretildi ve Marmara Bölgesi'nde 50 pilot araç ile test edildi."
              />
              <CleanTimelineItem 
                  year="2025" 
                  title="Ulusal Genişleme" 
                  desc="81 ilde operasyonel ağ kuruldu. Yapay zeka algoritması %92 doğruluk oranına ulaştı."
              />
          </div>
      </section>

      {/* --- 6. İLETİŞİM CTA (Professional) --- */}
      <section className="py-24 border-t border-slate-800 relative z-10 bg-[#0a192f]">
          <div className="container mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-8">
              <div>
                  <h2 className="text-3xl font-bold text-white">Yatırımcı İlişkileri & Medya</h2>
                  <p className="text-slate-400 mt-2">Kurumsal materyaller ve basın kiti için bizimle iletişime geçin.</p>
              </div>
              <div className="flex gap-4">
                  <a href="/iletisim" className="bg-white text-[#0a192f] hover:bg-slate-200 px-8 py-4 rounded-lg font-bold transition shadow-xl">
                      Bize Ulaşın
                  </a>
              </div>
          </div>
      </section>

      <Footer />
    </div>
  )
}

// --- ALT BİLEŞENLER ---

function StatBox({ number, label }) {
    return (
        <div className="bg-[#112240]/80 backdrop-blur p-10 flex flex-col items-center justify-center text-center hover:bg-[#152744] transition group">
            <span className="text-4xl md:text-5xl font-bold text-white mb-2 group-hover:text-orange-500 transition-colors">{number}</span>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">{label}</span>
        </div>
    )
}

function PrincipleCard({ num, title, desc }) {
    return (
        <div className="group bg-[#112240]/50 p-6 rounded-2xl border border-white/5 hover:border-orange-500/30 transition duration-300">
            <div className="text-5xl font-black text-slate-800 mb-4 group-hover:text-slate-700 transition-colors select-none">{num}</div>
            <h3 className="text-xl font-bold text-white mb-3 group-hover:text-orange-500 transition-colors">{title}</h3>
            <p className="text-slate-400 text-sm leading-relaxed border-l-2 border-slate-800 pl-4 group-hover:border-orange-500/50 transition-colors">
                {desc}
            </p>
        </div>
    )
}

function CleanTimelineItem({ year, title, desc }) {
    return (
        <div className="relative pl-12 md:pl-0 md:grid md:grid-cols-2 md:gap-16 group">
            {/* Nokta */}
            <div className="absolute left-[-5px] top-1 w-3 h-3 bg-[#0a192f] rounded-full border-4 border-slate-700 group-hover:border-orange-500 transition-colors md:left-1/2 md:-translate-x-[5px] z-10"></div>
            
            {/* Sol Taraf (Tarih - Desktop İçin) */}
            <div className="hidden md:block text-right">
                 <span className="text-3xl font-bold text-slate-700 group-hover:text-orange-500/50 transition-colors">{year}</span>
            </div>

            {/* Sağ Taraf (İçerik) */}
            <div className="bg-[#112240]/50 p-6 rounded-2xl border border-white/5 hover:border-orange-500/20 transition duration-300">
                 <span className="md:hidden text-xl font-bold text-slate-700 block mb-1">{year}</span>
                 <h4 className="text-lg font-bold text-white mb-2">{title}</h4>
                 <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
            </div>
        </div>
    )
}