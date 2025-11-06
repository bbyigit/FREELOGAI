
export default function Footer(){
  return (
    <footer className="mt-16 border-t border-slate-200">
      <div className="container py-8 text-sm text-slate-600 flex flex-col md:flex-row items-center justify-between gap-3">
        <div>© 2025 FREELOG AI — Tüm hakları saklıdır.</div>
        <div className="flex items-center gap-4">
          <a href="mailto:info@freelogai.com" className="hover:underline">info@freelogai.com</a>
          <a href="https://freelogai.com" className="hover:underline">freelogai.com</a>
        </div>
      </div>
    </footer>
  )
}
