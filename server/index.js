const express = require('express')
const cors = require('cors')
const app = express()
app.use(cors())
app.use(express.json())
app.use(express.static('../client'))

let reminders = []

app.get('/api/reminders', (req,res)=> res.json(reminders))

app.post('/api/reminders', (req,res)=>{
  const r = req.body
  reminders.unshift(r)
  res.status(201).json(r)
})

app.delete('/api/reminders/:id', (req,res)=>{
  const id = req.params.id
  reminders = reminders.filter(r=>r.id!==id)
  res.status(204).end()
})

app.post('/api/triggered', (req,res)=>{
  const t = req.body
  console.log('Triggered:', t.title || t.id)
  res.json({ok:true})
})

const port = process.env.PORT||4000
app.listen(port, ()=> console.log('GeoMind server running on', port))
