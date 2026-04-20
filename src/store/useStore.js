import { create } from 'zustand';
import { io } from 'socket.io-client';

const URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000'; // Backend URL

const useStore = create((set, get) => ({
  socket: null,
  isConnected: false,
  zones: [],
  alerts: [],
  suggestions: [],
  emergency: null,
  currentUser: JSON.parse(localStorage.getItem('currentUser')) || null,
  theme: localStorage.getItem('theme') || 'dark',
  incidents: [],
  selectedVenue: null,

  setTheme: (theme) => {
    localStorage.setItem('theme', theme);
    set({ theme });
  },

  setVenue: (venue) => {
    set({ selectedVenue: venue });
  },

  login: (userData) => {
    localStorage.setItem('currentUser', JSON.stringify(userData));
    set({ currentUser: userData });
  },

  logout: () => {
    localStorage.removeItem('currentUser');
    set({ currentUser: null });
  },

  connectSocket: () => {
    if (get().socket) return;
    
    const socket = io(URL, {
      transports: ['websocket'],
    });

    socket.on('connect', () => {
      set({ isConnected: true });
      console.log('Connected to WebSocket');
    });

    socket.on('disconnect', () => {
      set({ isConnected: false });
    });

    socket.on('zone_update', (zones) => {
      set({ zones });
    });

    socket.on('new_alert', (alert) => {
      set((state) => ({ alerts: [alert, ...state.alerts].slice(0, 50) }));
    });

    socket.on('emergency', (emergencyData) => {
      set({ emergency: emergencyData });
    });

    socket.on('ai_suggestions', (suggestions) => {
        set({ suggestions });
    });

    socket.on('incident_list', (incidents) => {
      console.log('[STORE] Received incident list:', incidents.length);
      set({ incidents });
    });

    socket.on('new_incident', (incident) => {
      console.log('[STORE] New incident received:', incident.id);
      set(state => ({ incidents: [incident, ...state.incidents] }));
    });

    socket.on('incident_updated', ({ id, status }) => {
      set(state => ({
        incidents: state.incidents.map(inc => 
          inc.id === id ? { ...inc, status } : inc
        )
      }));
    });

    set({ socket });
  },

  disconnectSocket: () => {
    const { socket } = get();
    if (socket) {
      socket.disconnect();
      set({ socket: null, isConnected: false });
    }
  },

  triggerPanic: (zoneId) => {
    const { socket } = get();
    if (socket) {
      socket.emit('trigger_panic', { zoneId });
    }
  },

  reportIncident: (incidentData) => {
    const { socket } = get();
    if (socket) {
      console.log('[STORE] Emitting report_incident:', incidentData.category);
      socket.emit('report_incident', incidentData);
    } else {
      console.warn('[STORE] Cannot report incident: Socket not connected');
    }
  },

  updateIncidentStatus: (id, status) => {
    const { socket } = get();
    if (socket) {
      socket.emit('update_incident', { id, status });
    }
  }
}));

export default useStore;
