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
    // If we are on Vercel/Production, use HTTP Polling instead of WebSockets
    const isProduction = window.location.hostname !== 'localhost';
    
    if (isProduction) {
      console.log('[STORE] Using Vercel Serverless Polling Mode');
      const fetchUpdates = async () => {
        try {
          const res = await fetch('/api/zones');
          const data = await res.json();
          set({ zones: data, isConnected: true });
          
          const incRes = await fetch('/api/incidents');
          const incData = await incRes.json();
          set({ incidents: incData });
        } catch (err) {
          console.error('Polling error:', err);
        }
      };
      
      fetchUpdates();
      const interval = setInterval(fetchUpdates, 5000);
      set({ pollingInterval: interval });
      return;
    }

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
      set({ incidents });
    });

    socket.on('new_incident', (incident) => {
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
    const { socket, pollingInterval } = get();
    if (pollingInterval) clearInterval(pollingInterval);
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

  reportIncident: async (incidentData) => {
    const { socket } = get();
    const isProduction = window.location.hostname !== 'localhost';

    if (isProduction) {
      try {
        const res = await fetch('/api/incidents', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(incidentData)
        });
        const data = await res.json();
        set(state => ({ incidents: [data, ...state.incidents] }));
        return;
      } catch (err) {
        console.error('Failed to report incident:', err);
      }
    }

    if (socket) {
      socket.emit('report_incident', incidentData);
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
