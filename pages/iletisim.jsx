import { useState, useRef } from 'react'
import Head from 'next/head'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import emailjs from '@emailjs/browser';

export default function Iletisim() {
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const form = useRef();

  const handleSubmit = (e) => {
    e.preventDefault()
    setLoading(true)

    // --- EMAILJS ENTEGRASYONU (BAŞLANGIÇ) ---
    emailjs
      .sendForm(
        'service_qkltwda',       // Senin SERVICE ID
        'template_842kwjc',      // Senin TEMPLATE ID
        form.current,
        {
          publicKey: 'uGkIdashfmllBvHqN', // Senin PUBLIC KEY
        }
      )
      .then(
        () => {
          // Başarılı olursa
          console.log('BAŞARILI!');
          setLoading(false)
          setSent(true)
          e.target.reset() // Formu temizle
        },
        (error) => {
          // Hata olursa
          console.log('HATA...', error.text);
          setLoading(false)
          alert('Bir hata oluştu, lütfen tekrar deneyin: ' + error.text);
        },
      );
    // --- EMAILJS ENTEGRASYONU (BİTİŞ) ---
  }

  return (
    // KRAL AYAR: Arka plan artık Sitenin geneli gibi KOYU (#0a192f)
    <div className="min-h-screen bg-[#0a192f] font-sans text-slate-200 flex flex-col selection:bg-orange-500 selection:text-white">
      <Head>
        <title>İletişim & Entegrasyon | Freelog AI</title>
      </Head>

      <Navbar />

      <div 
        className="container mx-auto px-6 pb-20 flex-grow"
        style={{ paddingTop: '150px' }}
      >
        
        <div className="grid lg:grid-cols-2 gap-16 items-start">
          
          {/* --- SOL KOLON: BİLGİLER (KOYU TEMAYA UYGUN) --- */}
          <div className="space-y-10">
            
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-900/30 border border-blue-500/30 mb-6">
                <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                <span className="text-xs font-bold text-blue-400 tracking-widest uppercase">7/24 Operasyon Merkezi</span>
              </div>
              
              <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-6 leading-tight">
                Ekosisteme <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500">
                  Dahil Olun.
                </span>
              </h1>
              
              <p className="text-slate-400 text-lg leading-relaxed max-w-lg">
                Filo entegrasyonu, yatırımcı ilişkileri veya teknik destek... 
                Freelog mühendislik ekibi, lojistik süreçlerinizi dijitalleştirmek için bir mesaj uzağınızda.
              </p>
            </div>

            {/* MERKEZ OFİS KARTI (DARK MODE UYUMLU) */}
            <div className="bg-[#112240] p-8 rounded-2xl shadow-xl border border-slate-700 relative overflow-hidden group hover:border-orange-500/30 transition duration-500">
               {/* Arka plan dekoru */}
               <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition">
                 <svg className="w-32 h-32 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
               </div>
               
               <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                 🏢 Merkez Ofis
               </h3>
               
               <div className="space-y-6">
                 <div className="flex items-start gap-4">
                   <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400 shrink-0 border border-blue-500/20">✉️</div>
                   <div>
                     <div className="text-xs text-slate-500 font-bold uppercase tracking-wide mb-1">Kurumsal E-Posta</div>
                     <a href="mailto:info@freelogai.com" className="text-white hover:text-orange-400 transition font-bold text-lg">info@freelogai.com</a>
                   </div>
                 </div>

                 <div className="flex items-start gap-4">
                   <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400 shrink-0 border border-blue-500/20">📍</div>
                   <div>
                     <div className="text-xs text-slate-500 font-bold uppercase tracking-wide mb-1">Lokasyon</div>
                     <span className="text-white font-bold block">Kadıköy / İSTANBUL </span>
                     <span className="text-slate-400 text-sm">19 Mayıs mah. Sümko Sitesi Kozyatağı</span>
                   </div>
                 </div>
               </div>
            </div>

          </div>

          {/* --- SAĞ KOLON: İLETİŞİM FORMU (AYDINLIK & OKUNABİLİR) --- */}
          <div className="bg-slate-100 p-8 md:p-10 rounded-2xl shadow-2xl border border-slate-300 relative text-slate-800">
            
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 to-red-500 rounded-t-2xl"></div>
            
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Bize Ulaşın</h2>

            {!sent ? (
              <form ref={form} onSubmit={handleSubmit} className="space-y-5">
                <div className="grid md:grid-cols-2 gap-5">
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Adınız Soyadınız</label>
                    {/* ÖNEMLİ: name="name" yapıldı (Template {{name}} ile eşleşmesi için) */}
                    <input name="name" required type="text" placeholder="Örn: Ahmet Yılmaz" className="w-full bg-white border border-slate-300 rounded-lg px-4 py-3 text-slate-800 focus:border-orange-500 focus:ring-1 focus:ring-orange-200 outline-none transition font-medium" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Firma Adı</label>
                    {/* Not: Template'e {{company_name}} eklersen bu da mailde görünür */}
                    <input name="company_name" type="text" placeholder="Örn: Lojistik A.Ş." className="w-full bg-white border border-slate-300 rounded-lg px-4 py-3 text-slate-800 focus:border-orange-500 focus:ring-1 focus:ring-orange-200 outline-none transition font-medium" />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">E-Posta Adresi</label>
                  {/* ÖNEMLİ: name="email" yapıldı (Reply To özelliği için) */}
                  <input name="email" required type="email" placeholder="ahmet@sirket.com" className="w-full bg-white border border-slate-300 rounded-lg px-4 py-3 text-slate-800 focus:border-orange-500 focus:ring-1 focus:ring-orange-200 outline-none transition font-medium" />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Konu</label>
                  <div className="relative">
                    <select name="subject" className="w-full bg-white border border-slate-300 rounded-lg px-4 py-3 text-slate-800 focus:border-orange-500 focus:ring-1 focus:ring-orange-200 outline-none transition appearance-none cursor-pointer font-medium">
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
                  {/* name="message" Template {{message}} ile eşleşiyor */}
                  <textarea name="message" required rows="4" placeholder="Projenizle ilgileniyorum..." className="w-full bg-white border border-slate-300 rounded-lg px-4 py-3 text-slate-800 focus:border-orange-500 focus:ring-1 focus:ring-orange-200 outline-none transition resize-none font-medium"></textarea>
                </div>

                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full bg-[#0a192f] hover:bg-[#152a4d] text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-900/20 transition transform active:scale-[0.98] flex items-center justify-center gap-3 mt-4"
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
              // BAŞARI EKRANI
              <div className="flex flex-col items-center justify-center h-[500px] text-center animate-fade-in-up">
                <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6 border border-green-200 shadow-inner">
                  <svg className="w-12 h-12 text-green-600 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-2">Mesajınız Alındı!</h3>
                <p className="text-slate-600 max-w-xs mx-auto mb-8 leading-relaxed">
                  Talebiniz operasyon merkezimize başarıyla iletildi. Ekibimiz en kısa sürede dönüş yapacaktır.
                </p>
                <button onClick={() => setSent(false)} className="text-blue-700 font-bold text-sm border-2 border-blue-200 px-8 py-3 rounded-full hover:bg-blue-50 transition">
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