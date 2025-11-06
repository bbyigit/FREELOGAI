
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

export default function Iletisim(){
  return (
    <div>
      <Navbar/>
      <section className="container py-12 grid md:grid-cols-2 gap-8">
        <div>
          <h1 className="h1">İletişim</h1>
          <p className="p mt-3">FREELOG AI hakkında bilgi ve teklif için e‑posta gönderebilirsiniz.</p>
          <div className="card mt-6">
            <div className="text-sm text-slate-600">E‑posta</div>
            <a className="font-semibold hover:underline" href="mailto:info@freelogai.com">info@freelogai.com</a>
          </div>
        </div>
        <div className="card">
          <form action="mailto:info@freelogai.com" method="post" encType="text/plain" className="grid gap-3">
            <label className="text-sm">İsim</label>
            <input name="name" className="border rounded-xl px-3 py-2" />
            <label className="text-sm">E‑posta</label>
            <input name="email" className="border rounded-xl px-3 py-2" />
            <label className="text-sm">Mesaj</label>
            <textarea name="message" rows="5" className="border rounded-xl px-3 py-2"></textarea>
            <button className="btn btn-primary mt-2" type="submit">Gönder</button>
          </form>
        </div>
      </section>
      <Footer/>
    </div>
  )
}
