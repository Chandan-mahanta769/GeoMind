import React, {useState} from 'react'
import SidebarButton from './SidebarButton'

export default function Sidebar({reminders, onSelect, onDelete, onAddToggle, addMode, onCenter, filter, setFilter, onToggleSidebar}){
  const [q, setQ] = useState('')
  const filtered = reminders.filter(r=>{
    if(filter==='Nearby') return r.triggered
    if(filter==='Done') return r.done
    return true
  }).filter(r=> r.title.toLowerCase().includes(q.toLowerCase()))

  return (
    <aside className="sidebar">
      <div className="top">
        <div className="title-row">
          <button className="hamburger" onClick={onToggleSidebar} aria-label="Toggle menu">☰</button>
          <h2>GeoMind</h2>
        </div>
        <div className="search"><input placeholder="Search here" value={q} onChange={e=>setQ(e.target.value)} /></div>
      </div>

      <div className="filters">
        <SidebarButton label="All" icon="📋" active={filter==='All'} onClick={()=>setFilter('All')} />
        <SidebarButton label="Nearby" icon="📍" active={filter==='Nearby'} onClick={()=>setFilter('Nearby')} />
        <SidebarButton label="Done" icon="✅" active={filter==='Done'} onClick={()=>setFilter('Done')} />
      </div>

      <div className="reminder-list">
        {filtered.map(r=> (
          <div key={r.id} className={`reminder ${r.triggered? 'nearby':''}`} onClick={()=>onSelect(r)}>
            <div className="left">📍</div>
            <div className="body">
              <div className="title">{r.title}</div>
              <div className="meta">{r.category || 'General'} • {r.radius}m</div>
            </div>
            <div className="right">
              <button className="small" onClick={(e)=>{e.stopPropagation(); onDelete(r.id)}}>Delete</button>
            </div>
          </div>
        ))}
      </div>

      <div className="footer">
        <button className={`add-btn ${addMode? 'active':''}`} onClick={onAddToggle}>{addMode? 'Cancel':'Add zone'}</button>
        <button className="action" onClick={onCenter}>Center</button>
      </div>
    </aside>
  )
}
