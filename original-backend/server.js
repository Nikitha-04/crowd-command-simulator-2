require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { simulateZones } = require('./simulator');

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

let currentZones = simulateZones();
let activeIncidents = [];

io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`);
  
  // Send initial data
  socket.emit('zone_update', currentZones);

  socket.on('trigger_panic', (data) => {
    console.log(`Panic triggered for zone ${data.zoneId}`);
    io.emit('emergency', {
      zoneId: data.zoneId,
      timestamp: new Date().toISOString(),
      message: `EMERGENCY DECLARED — Zone ${data.zoneId}`
    });
  });

  // Incident System
  socket.emit('incident_list', activeIncidents);

  socket.on('report_incident', (incidentData) => {
    console.log(`[BACKEND] Received incident report from: ${incidentData.reporter}`);
    console.log(`[BACKEND] Detail: ${incidentData.detail}`);
    const newIncident = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      status: 'pending',
      ...incidentData
    };
    activeIncidents.unshift(newIncident);
    io.emit('new_incident', newIncident);
    console.log(`[BACKEND] Broadcasted new incident. Total active: ${activeIncidents.length}`);
  });

  socket.on('update_incident', (data) => {
    activeIncidents = activeIncidents.map(inc => 
      inc.id === data.id ? { ...inc, status: data.status } : inc
    );
    io.emit('incident_updated', data);
    console.log(`Incident ${data.id} updated to ${data.status}`);
  });

  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
});

// Simulate updates every 5 seconds
setInterval(() => {
  currentZones = simulateZones(currentZones);
  io.emit('zone_update', currentZones);
  
  // Call Python AI Microservice
  const AI_URL = process.env.AI_SERVICE_URL || 'http://127.0.0.1:5000';
  fetch(`${AI_URL}/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ zones: currentZones })
  })
  .then(res => res.json())
  .then(data => {
      if (data.alerts && data.alerts.length > 0) {
          data.alerts.forEach(alert => {
              io.emit('new_alert', {
                  id: Math.random().toString(36).substr(2, 9),
                  severity: alert.severity,
                  zone: alert.zone,
                  message: alert.message,
                  timestamp: new Date().toISOString()
              });
          });
      }
      if (data.suggestions && data.suggestions.length > 0) {
          const formattedSuggestions = data.suggestions.map(s => ({
              id: Math.random().toString(36).substr(2, 9),
              ...s
          }));
          io.emit('ai_suggestions', formattedSuggestions);
      }
  })
  .catch(err => {
      console.error('AI Service unreachable:', err.message);
  });


}, 5000);

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});
