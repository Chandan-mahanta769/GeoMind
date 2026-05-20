import React, { useEffect, useState, useRef } from 'react'
import Sidebar from './components/Sidebar'
import MapView from './components/MapView'
import AddReminderModal from './components/AddReminderModal'

function distanceMeters(lat1, lon1, lat2, lon2){
  const toRad = (v)=>v*Math.PI/180
  const R = 6371000
  const dLat = toRad(lat2-lat1)
  const dLon = toRad(lon2-lon1)
  const a = Math.sin(dLat/2)**2 + Math.cos(toRad(lat1))*Math.cos(toRad(lat2))*Math.sin(dLon/2)**2
  const c = 2*Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  return R*c
}

function Icon({name}){
  const map = {map:'🗺️',add:'➕',edit:'✏️',trash:'🗑️',pin:'📍',clock:'⏰'}
  return <span className="icon">{map[name]||'•'}</span>
}

export default function App(){
  const [reminders, setReminders] = useState(()=>{
    try{ return JSON.parse(localStorage.getItem('geomind.reminders')||'[]') }catch(e){return []}
  })
  const [pos, setPos] = useState(null)
  const [selected, setSelected] = useState(null)
  const [activity, setActivity] = useState([])
  const [addMode, setAddMode] = useState(false)
  const [filter, setFilter] = useState('All')
  const [newReminder, setNewReminder] = useState({title:'',category:'',lat:'',lon:'',radius:200,emergency:false})
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [centerSignal, setCenterSignal] = useState(0)
  const watchIdRef = useRef(null)

  useEffect(()=>{ localStorage.setItem('geomind.reminders', JSON.stringify(reminders)) },[reminders])

  useEffect(()=>{
    if(!('geolocation' in navigator)) return
    watchIdRef.current = navigator.geolocation.watchPosition(p=>{
      const {latitude, longitude} = p.coords
      setPos({latitude, longitude})
      checkReminders(latitude, longitude)
    }, err=>console.warn(err), {enableHighAccuracy:true, maximumAge:5000, timeout:10000})
    return ()=>{ if(watchIdRef.current) navigator.geolocation.clearWatch(watchIdRef.current) }
  }, [reminders])

  async function checkReminders(lat, lon){
    for(const r of reminders){
      if(r.triggered) continue
      const d = distanceMeters(lat, lon, r.lat, r.lon)
      if(d <= r.radius){
        triggerReminder(r)
      }
    }
  }

  function pushActivity(text){
    setActivity(a=>[{text, time:new Date().toLocaleTimeString()}, ...a].slice(0,20))
  }

  async function triggerReminder(r){
    r.triggered = true
    setReminders(rs=>rs.map(x=>x.id===r.id?r:x))
    pushActivity(`Entered zone near ${r.title}`)
    if(window.Notification && Notification.permission!=='denied'){
      try{ await Notification.requestPermission() }catch(e){}
      if(Notification.permission==='granted') new Notification(r.title || 'GeoMind Reminder')
    }
    const audio = new Audio('/alert.mp3')
    audio.play().catch(()=>{})
    fetch('/api/triggered', {method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(r)}).catch(()=>{})
  }

  function addReminder(data){
    const r = { id: Date.now().toString(36), triggered:false, ...data }
    setReminders(rs=>[r,...rs])
    pushActivity(`New reminder added: ${r.title}`)
    fetch('/api/reminders', {method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(r)}).catch(()=>{})
  }

  function openAddModal(){
    setNewReminder({
      title:'', category:'', lat:pos?.latitude || '', lon:pos?.longitude || '', radius:200, emergency:false
    })
    setAddMode(true)
  }

  function openAddModalAt(latlng){
    setNewReminder({
      title:'', category:'', lat:latlng.lat, lon:latlng.lng, radius:200, emergency:false
    })
    setAddMode(true)
  }

  function closeAddModal(){
    setAddMode(false)
  }

  function handleModalChange(field, value){
    setNewReminder(n=>({ ...n, [field]: field==='emergency' ? value : value }))
  }

  function handleSaveReminder(){
    addReminder({
      ...newReminder,
      lat: parseFloat(newReminder.lat),
      lon: parseFloat(newReminder.lon),
      radius: Number(newReminder.radius)
    })
    setAddMode(false)
  }

  function useCurrentLocation(){
    if(!navigator.geolocation) return pushActivity('Geolocation not available')
    navigator.geolocation.getCurrentPosition(p=>{
      const {latitude, longitude} = p.coords
      setNewReminder(n=>({ ...n, lat:latitude, lon:longitude }))
      pushActivity('Current location loaded')
    }, err=>pushActivity('Location error: '+err.message))
  }

  function deleteReminder(id){
    setReminders(rs=>rs.filter(r=>r.id!==id))
    if(selected && selected.id===id) setSelected(null)
    fetch(`/api/reminders/${id}`, {method:'DELETE'}).catch(()=>{})
    pushActivity('Deleted reminder')
  }

  function useHere(setField){
    if(!navigator.geolocation) return pushActivity('Geolocation not available')
    navigator.geolocation.getCurrentPosition(p=>{
      const {latitude, longitude} = p.coords
      setField({lat:latitude, lon:longitude})
    }, err=>pushActivity('Location error: '+err.message))
  }

  return (
    <div className={`geomind-root ${sidebarCollapsed? 'sidebar-collapsed':''}`}>
      <Sidebar reminders={reminders} onSelect={(r)=>setSelected(r)} onDelete={deleteReminder} onAddToggle={openAddModal} addMode={addMode} onCenter={()=>setCenterSignal(v=>v+1)} filter={filter} setFilter={setFilter} onToggleSidebar={()=>setSidebarCollapsed(v=>!v)} />

      <main className="map-area">
        <div className="map-overlay top-search">
          <div className="search-pill">
            <span className="search-icon">📍</span>
            <input placeholder="Search here" />
            <button className="mic-btn">🎤</button>
          </div>
        </div>

        <div className="map-overlay quick-actions">
          <button className="quick-btn active">Ask Maps</button>
          <button className="quick-btn">Restaurants</button>
          <button className="quick-btn">Hotels</button>
        </div>

        <div className="map-overlay suggestion-bar">
          <span>Suggestions:</span>
          <button className="suggestion-btn" onClick={()=>openAddModalAt({lat: pos?.latitude || 20.5937, lng: pos?.longitude || 78.9629})}>Set reminder</button>
          <button className="suggestion-btn" onClick={()=>setCenterSignal(v=>v+1)}>Center me</button>
          <button className="suggestion-btn" onClick={openAddModal}>Add zone</button>
        </div>

        <MapView reminders={reminders} pos={pos} centerSignal={centerSignal} onMapClick={openAddModalAt} addMode={addMode} />

        <div className="map-bottom-card">
          <div>
            <div className="bottom-title">4th Block</div>
            <div className="bottom-subtitle">Tap the map to place a reminder and use zoom controls.</div>
          </div>
          <div className="bottom-actions">
            <button onClick={()=>setCenterSignal(v=>v+1)}>Center</button>
            <button onClick={openAddModal}>New reminder</button>
          </div>
        </div>
      </main>

      <aside className="panel">
        <div className="panel-card">
          <h3>Selected Reminder</h3>
          {selected ? (
            <div className="selected">
              <h4>{selected.title}</h4>
              <div className="row"><strong>Category:</strong><span>{selected.category||'—'}</span></div>
              <div className="row"><strong>Status:</strong><span>{selected.triggered? 'Nearby':'Active'}</span></div>
              <div className="row"><strong>Trigger radius:</strong><span>{selected.radius}m</span></div>
              <div className="buttons"><button>Edit</button><button onClick={()=>deleteReminder(selected.id)}>Delete</button></div>
            </div>
          ) : (
            <div className="empty">No reminder selected</div>
          )}
        </div>

        <div className="activity-card">
          <h4>Recent activity</h4>
          <ul>
            {activity.map((a,i)=>(<li key={i}><span className="dot"/> {a.text}</li>))}
          </ul>
        </div>

        <div className="categories">
          <h4>Categories</h4>
          <div className="cats">
            <div className="cat">Grocery</div>
            <div className="cat">Health</div>
            <div className="cat">Errand</div>
            <div className="cat">Personal</div>
          </div>
        </div>
      </aside>
      <footer className="app-footer">
        <button className="footer-item active"><span>Explore</span></button>
        <button className="footer-item"><span>You</span></button>
        <button className="footer-item"><span>Contribute</span></button>
      </footer>
      <AddReminderModal
        open={addMode}
        onClose={closeAddModal}
        reminder={newReminder}
        onChange={handleModalChange}
        onSave={handleSaveReminder}
        onUseCurrent={useCurrentLocation}
      />
    </div>
  )
}
