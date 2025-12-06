import { useState } from 'react'
import Head from 'next/head'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

export default function Iletisim() {
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      setSent(true)
    }, 1500)
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 flex flex-col">
      <Head>
        <title>İletişim & Entegrasyon | Freelog AI</title>
      </Head>

      <Navbar />

      {/* KRAL AYAR (FIX): 
          style={{ paddingTop: '150px' }} -> Bu satır, içeriği zorla 150px aşağı iter.
          Navbar üstte kalır, içerik tertemiz başlar.
      */}
      <div 
        className="container mx-auto px-6 pb-20 flex-grow"
        style={{ paddingTop: '150px' }}
      >
        
        <div className="grid lg:grid-cols-2 gap-16 items-start">
          
          {/* --- SOL KOLON: Sloganlar ve İletişim Kartı --- */}
          <div className="space-y-10">
            
            {/* 1. Üst Yazılar (Slogan) */}
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 border border-blue-200 mb-6">
                <span className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></span>
                <span className="text-xs font-bold text-blue-700 tracking-widest uppercase">7/24 Operasyon Merkezi</span>
              </div>
              
              <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-6 leading-tight">
                Ekosisteme <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-600">
                  Dahil Olun.
                </span>
              </h1>
              
              <p className="text-slate-600 text-lg leading-relaxed max-w-lg">
                Filo entegrasyonu, yatırımcı ilişkileri veya teknik destek... 
                Freelog mühendislik ekibi, lojistik süreçlerinizi dijitalleştirmek için bir mesaj uzağınızda.
              </p>
            </div>

            {/* 2. Merkez Ofis Kartı */}
            <div className="bg-white p-8 rounded-2xl shadow-lg border border-slate-200 relative overflow-hidden group hover:border-orange-300 transition duration-300">
               {/* Arka plan dekoru */}
               <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition">
                 <svg className="w-32 h-32 text-slate-900" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
               </div>
               
               <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                 🏢 Merkez Ofis
               </h3>
               
               <div className="space-y-6">
                 <div className="flex items-start gap-4">
                   <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 shrink-0 border border-blue-100">✉️</div>
                   <div>
                     <div className="text-xs text-slate-400 font-bold uppercase tracking-wide mb-1">Kurumsal E-Posta</div>
                     <a href="mailto:info@freelogai.com" className="text-slate-900 hover:text-orange-600 transition font-bold text-lg">info@freelogai.com</a>
                   </div>
                 </div>

                 <div className="flex items-start gap-4">
                   <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 shrink-0 border border-blue-100">📍</div>
                   <div>
                     <div className="text-xs text-slate-400 font-bold uppercase tracking-wide mb-1">Lokasyon</div>
                     <span className="text-slate-900 font-bold block">Kadıköy / İSTANBUL </span>
                     <span className="text-slate-500 text-sm">19 Mayıs mah. Sümko Sitesi Kozyatağı Kadıköy/İstanbul</span>
                   </div>
                 </div>
               </div>
            </div>

          </div>

          {/* --- SAĞ KOLON: İLETİŞİM FORMU --- */}
          <div className="bg-white p-8 md:p-10 rounded-2xl shadow-2xl border border-slate-200 relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 to-red-500 rounded-t-2xl"></div>
            
            <h2 className="text-2xl font-bold text-slate-800 mb-6">İletişim Formu</h2>

            {!sent ? (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid md:grid-cols-2 gap-5">
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Adınız Soyadınız</label>
                    <input required type="text" placeholder="Örn: Ahmet Yılmaz" className="w-full bg-slate-50 border border-slate-300 rounded-lg px-4 py-3 text-slate-800 focus:border-orange-500 focus:ring-1 focus:ring-orange-200 outline-none transition" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Firma Adı</label>
                    <input type="text" placeholder="Örn: Lojistik A.Ş." className="w-full bg-slate-50 border border-slate-300 rounded-lg px-4 py-3 text-slate-800 focus:border-orange-500 focus:ring-1 focus:ring-orange-200 outline-none transition" />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">E-Posta Adresi</label>
                  <input required type="email" placeholder="ahmet@sirket.com" className="w-full bg-slate-50 border border-slate-300 rounded-lg px-4 py-3 text-slate-800 focus:border-orange-500 focus:ring-1 focus:ring-orange-200 outline-none transition" />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Konu</label>
                  <div className="relative">
                    <select className="w-full bg-slate-50 border border-slate-300 rounded-lg px-4 py-3 text-slate-800 focus:border-orange-500 focus:ring-1 focus:ring-orange-200 outline-none transition appearance-none cursor-pointer">
                        <option>Filo Entegrasyonu Hakkında</option>
                        <option>Yatırımcı İlişkileri</option>
                        <option>Teknik Destek / API</option>
                        <option>Diğer</option>
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500 text-xs">▼</div>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Mesajınız</label>
                  <textarea required rows="4" placeholder="Projenizle ilgileniyorum..." className="w-full bg-slate-50 border border-slate-300 rounded-lg px-4 py-3 text-slate-800 focus:border-orange-500 focus:ring-1 focus:ring-orange-200 outline-none transition resize-none"></textarea>
                </div>

                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full bg-[#0a192f] hover:bg-[#152a4d] text-white font-bold py-4 rounded-xl shadow-lg transition transform active:scale-[0.98] flex items-center justify-center gap-3 mt-2"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                      <span>GÖNDERİLİYOR...</span>
                    </>
                  ) : (
                    <>
                      <span>MESAJI GÖNDER</span>
                      <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                    </>
                  )}
                </button>
              </form>
            ) : (
              // GÖNDERİLDİKTEN SONRAKİ BAŞARI EKRANI
              <div className="flex flex-col items-center justify-center h-[500px] text-center">
                <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mb-6 border border-green-100">
                  <svg className="w-12 h-12 text-green-600 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-2">Mesajınız Alındı!</h3>
                <p className="text-slate-500 max-w-xs mx-auto mb-8 leading-relaxed">
                  Talebiniz operasyon merkezimize başarıyla iletildi. Ekibimiz en kısa sürede dönüş yapacaktır.
                </p>
                <button onClick={() => setSent(false)} className="text-blue-600 font-bold text-sm border border-blue-200 px-8 py-3 rounded-full hover:bg-blue-50 transition">
                  Yeni Mesaj Gönder
                </button>
              </div>
            )}
            
          </div>

        </div>
      </div>
      
      <Footer />
    </div>
  )
}