
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import dynamic from 'next/dynamic'

const Map = dynamic(()=>import('../components/Map'), { ssr:false })

export default function Demo(){
  return (
    <div>
      <Navbar/>
      <section className="container py-8">
        <h1 className="h1">Demo — Canlı Harita</h1>
        <p className="p mt-2">Bu ekran, saha tabletinden gelen verilerin panele nasıl yansıdığını gösterir.</p>
        <div className="grid md:grid-cols-3 gap-5 mt-6">
          <div className="md:col-span-2"><Map deviceId={1}/></div>
          <div className="card">
            <div className="font-semibold mb-2">Event Feed</div>
            <div className="text-slate-500 text-sm">Harita ile birlikte olay akışını sayfanıza entegre edin. (Frontend tarafında events listesi eklenebilir.)</div>
          </div>
        </div>
      </section>
      <Footer/>
    </div>
  )
}
