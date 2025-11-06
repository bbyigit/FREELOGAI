
import Link from 'next/link'
import Image from 'next/image'

export default function Navbar(){
  return (
    <nav className="container flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Image src="/images/logo.png" width={40} height={40} alt="FREELOG AI Logo" className="rounded-md"/>
        <span className="font-bold">FREELOG AI</span>
      </div>
      <div className="hidden md:flex items-center gap-5 text-sm">
        <Link href="/">Ana Sayfa</Link>
        <Link href="/urun">Ürün</Link>
        <Link href="/demo">Demo</Link>
        <Link href="/fiyatlandirma">Fiyatlandırma</Link>
        <Link href="/iletisim">İletişim</Link>
        <Link href="/demo" className="btn btn-primary">Demoyu Dene</Link>
      </div>
    </nav>
  )
}
