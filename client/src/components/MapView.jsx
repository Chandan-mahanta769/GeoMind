import React, {useEffect, useRef} from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

export default function MapView({reminders, pos, centerSignal, onMapClick, addMode}){
  const mapRef = useRef(null)
  const userLayerRef = useRef(null)

  useEffect(()=>{
    if(mapRef.current) return
    try{
      mapRef.current = L.map('map', { center: [20.5937,78.9629], zoom: 14, zoomControl:true, attributionControl:false })
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap contributors &copy; CARTO'
      }).addTo(mapRef.current)
      L.control.scale({ position:'bottomleft', imperial:false }).addTo(mapRef.current)
    }catch(e){console.warn('Leaflet init failed', e)}
  }, [])

  useEffect(()=>{
    if(!mapRef.current) return
    // click handler for add mode
    const handler = (e)=>{
      if(addMode && onMapClick) onMapClick(e.latlng)
    }
    mapRef.current.on('click', handler)
    return ()=> mapRef.current.off('click', handler)
  }, [addMode, onMapClick])

  useEffect(()=>{
    if(!mapRef.current) return
    // clear previous reminder layers
    mapRef.current.eachLayer(layer=>{
      if(layer.options && layer.options._isReminder) mapRef.current.removeLayer(layer)
    })
    reminders.forEach(r=>{
      const circ = L.circle([r.lat, r.lon], {radius: r.radius, color: r.triggered? '#ffb86b' : '#7c5cff', fillOpacity:0.12})
      circ.options._isReminder = true
      circ.addTo(mapRef.current)
      L.circleMarker([r.lat, r.lon], {radius:8, color:'#fff', fillColor: r.triggered? '#ffb86b' : '#7c5cff', fillOpacity:1}).addTo(mapRef.current)
    })
  }, [reminders])

  useEffect(()=>{
    if(!mapRef.current) return
    if(!pos) return
    const {latitude, longitude} = pos
    // center map smoothly
    mapRef.current.setView([latitude, longitude], 16, { animate:true })
    // update user layer
    if(userLayerRef.current){ mapRef.current.removeLayer(userLayerRef.current) }
    userLayerRef.current = L.circleMarker([latitude, longitude], {radius:10, color:'#2dd4bf', fillColor:'#2dd4bf', fillOpacity:1}).addTo(mapRef.current)
  }, [pos])

  useEffect(()=>{
    if(!mapRef.current) return
    if(!pos) return
    const {latitude, longitude} = pos
    mapRef.current.setView([latitude, longitude], 16, { animate:true })
  }, [centerSignal, pos])

  return (<div id="map" style={{width:'100%', height:'100%'}} />)
}
