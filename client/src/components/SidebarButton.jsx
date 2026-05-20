import React from 'react'

export default function SidebarButton({icon, label, active, onClick}){
  return (
    <button className={`sb-btn ${active? 'active':''}`} onClick={onClick}>
      <span className="sb-icon">{icon}</span>
      <span className="sb-label">{label}</span>
    </button>
  )
}
