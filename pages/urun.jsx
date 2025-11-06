import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import Image from 'next/image'

export default function Urun(){
  return (
    <div>
      <Navbar/>
      <section className="container py-12">
        <h1 className="h1">Ürün</h1>
        <p className="p mt-3">FREELOG AI tablet, sürücüye rota, hız ve kilometre bilgilerini sunar; merkeze otomatik konum ve durum iletir. Kritik uyarılar anında görünür.</p>

        <div className="grid md:grid-cols-2 gap-6 mt-8">
          <div className="relative aspect-video rounded-2xl overflow-hidden shadow-soft border border-slate-200">
            <Image
              src="/images/tablet-drive.jpg"
              alt="Sürüş ekranı — rota, hız, kilometre"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
          <div className="relative aspect-video rounded-2xl overflow-hidden shadow-soft border border-slate-200">
            <Image
              src="/images/tablet-alert.jpg"
              alt="Acil uyarı — motor sıcaklığı"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
        </div>

        <div className="grid md:grid-cols-4 gap-4 mt-8">
          <div className="card"><b>Gerçek zamanlı</b><div className="text-slate-600">Konum ve olay akışı</div></div>
          <div className="card"><b>Basit</b><div className="text-slate-600">Tek dokunuş operasyon</div></div>
          <div className="card"><b>Güvenli</b><div className="text-slate-600">Veri gizliliği ve kontrol</div></div>
          <div className="card"><b>Esnek</b><div className="text-slate-600">API & entegrasyon</div></div>
        </div>
      </section>
      <Footer/>
    </div>
  )
}
