
import { useEffect, useRef, useState } from 'react'

function loadScript(src){
  return new Promise((resolve, reject) => {
    const id = 'gmaps-script'
    if (document.getElementById(id)) return resolve()
    const s = document.createElement('script')
    s.id = id; s.src = src; s.async = true; s.defer = true
    s.onload = resolve
    s.onerror = () => reject(new Error('Google Maps script yüklenemedi'))
    document.body.appendChild(s)
  })
}

export default function Map({ deviceId=1, apiBase=process.env.NEXT_PUBLIC_API_URL }){
  const mapRef = useRef(null)
  const mapEl = useRef(null)
  const markerRef = useRef(null)
  const pathRef = useRef(null)
  const [err, setErr] = useState('')
  const [last, setLast] = useState(null)

  useEffect(()=>{
    const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
    if(!key){ setErr('Google Maps anahtarı bulunamadı (.env.local)'); return }
    loadScript(`https://maps.googleapis.com/maps/api/js?key=${key}`)
      .then(()=>{
        if(!mapEl.current) return
        const center = { lat: 41.0055, lng: 28.9770 }
        mapRef.current = new window.google.maps.Map(mapEl.current, { center, zoom: 9 })
        markerRef.current = new window.google.maps.Marker({ position: center, map: mapRef.current, title: `Cihaz ${deviceId}` })
        pathRef.current = new window.google.maps.Polyline({ path: [center], map: mapRef.current })
      })
      .catch(e => setErr(e.message))
  }, [deviceId])

  useEffect(()=>{
    if(!apiBase) return
    let t
    async function load(){
      try{
        const res = await fetch(`${apiBase}/ops/pings?device_id=${deviceId}&limit=1`)
        const js = await res.json()
        if(Array.isArray(js) && js.length){
          const p = js[0]; setLast(p)
          if(mapRef.current && markerRef.current){
            const pos = { lat: p.lat, lng: p.lon }
            markerRef.current.setPosition(pos)
            mapRef.current.panTo(pos)
            if(pathRef.current){
              const path = pathRef.current.getPath()
              path.push(pos)
            }
          }
        }
      }catch(e){ setErr('API okuma hatası: '+e.message) }
    }
    load(); t=setInterval(load, 5000); return ()=>clearInterval(t)
  }, [apiBase, deviceId])

  return (
    <div className="relative rounded-2xl border border-slate-200 overflow-hidden shadow-soft h-[520px]">
      <div ref={mapEl} className="w-full h-full" />
      <div className="absolute top-3 left-3 card text-sm">
        <div className="font-semibold">Cihaz #{deviceId}</div>
        <div>Konum: {last ? `${last.lat?.toFixed?.(5)}, ${last.lon?.toFixed?.(5)}` : '—'}</div>
        <div>Hız: {last?.speed ?? '—'} km/sa</div>
      </div>
      {err && <div className="absolute bottom-3 left-3 card text-xs text-red-700 bg-red-50 border-red-200">{err}</div>}
    </div>
  )
}
