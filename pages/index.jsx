import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import Link from 'next/link'
import Image from 'next/image'

export default function Home(){
  return (
    <div>
      <Navbar/>
      <section className="relative">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-blue/5 via-white to-brand-blue/10 pointer-events-none"></div>
        <div className="container py-16 grid md:grid-cols-2 gap-10 items-center">
          <div>
            <div className="kicker">Kara Yolu Taşımacılığında Akıl</div>
            <h1 className="h1 mt-2">FREELOG AI — Akıllı Araç İçi Operasyon Sistemi</h1>
            <p className="p mt-4">
              Sürücü tabletinden merkeze anlık durum ve konum akışı. Güvenli, şeffaf ve izlenebilir operasyon.
            </p>
            <div className="mt-6 flex items-center gap-3">
              <Link href="/demo" className="btn btn-primary">Demoyu Dene</Link>
              <Link href="/urun" className="btn btn-ghost">Ürünü İncele</Link>
            </div>
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="card"><b>Tek dokunuş</b><div className="text-slate-600 mt-1">Full / Empty / SOS</div></div>
              <div className="card"><b>Canlı takip</b><div className="text-slate-600 mt-1">Konum & hız</div></div>
              <div className="card"><b>Bulut entegrasyon</b><div className="text-slate-600 mt-1">API ile akış</div></div>
            </div>
          </div>

          {/* HERO GÖRSELİ */}
          <div className="relative aspect-video rounded-2xl overflow-hidden shadow-soft border border-slate-200">
            <Image
              src="/images/hero-truck.jpg"
              alt="FREELOG AI ile karayolu lojistiğinde akıllı yönetim"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-tr from-black/30 via-transparent to-transparent" />
          </div>
        </div>
      </section>
      <Footer/>
    </div>
  )
}
