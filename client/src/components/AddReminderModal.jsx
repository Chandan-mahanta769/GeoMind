import React from 'react'

export default function AddReminderModal({open, onClose, reminder, onChange, onSave, onUseCurrent}){
  if(!open) return null
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={e=>e.stopPropagation()}>
        <div className="modal-header">
          <h3>Add reminder</h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        <form onSubmit={e=>{e.preventDefault(); onSave()}}>
          <label>Title<input value={reminder.title} onChange={e=>onChange('title', e.target.value)} required /></label>
          <label>Category<input value={reminder.category} onChange={e=>onChange('category', e.target.value)} /></label>
          <label>Latitude<input value={reminder.lat} onChange={e=>onChange('lat', e.target.value)} required /></label>
          <label>Longitude<input value={reminder.lon} onChange={e=>onChange('lon', e.target.value)} required /></label>
          <label>Radius (meters)<input type="number" value={reminder.radius} onChange={e=>onChange('radius', e.target.value)} required /></label>
          <label className="row-inline"><input type="checkbox" checked={reminder.emergency} onChange={e=>onChange('emergency', e.target.checked)} /> Emergency notification</label>
          <div className="modal-actions">
            <button type="button" className="secondary" onClick={onUseCurrent}>Use current location</button>
            <button type="submit">Save reminder</button>
          </div>
        </form>
      </div>
    </div>
  )
}
