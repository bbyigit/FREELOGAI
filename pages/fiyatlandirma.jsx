
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

export default function Fiyat(){
  return (
    <div>
      <Navbar/>
      <section className="container py-12">
        <h1 className="h1">Fiyatlandırma</h1>
        <p className="p mt-3">MVP evresindeyiz. Paket listeleri yerine doğrudan teklif alabilirsiniz.</p>
        <div className="grid md:grid-cols-4 gap-4 mt-8">
          {["Basic","Standard","Pro","Sınırsız"].map(t => (
            <div key={t} className="card flex flex-col items-start gap-3">
              <div className="kicker">Plan</div>
              <h3 className="text-xl font-bold">{t}</h3>
              <button className="btn btn-primary" onClick={()=>location.href='mailto:info@freelogai.com'}>Teklif Al</button>
            </div>
          ))}
        </div>
      </section>
      <Footer/>
    </div>
  )
}
