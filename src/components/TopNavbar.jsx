import React, { useState, useEffect } from 'react';
import useStore from '../store/useStore';
import { AlertTriangle, Bell, Clock, LogOut, Sun, Moon } from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const TopNavbar = () => {
  const [time, setTime] = useState(new Date());
  const { alerts, triggerPanic, zones, theme, setTheme, logout, currentUser } = useStore();
  const [isPanicModalOpen, setIsPanicModalOpen] = useState(false);
  const [selectedZone, setSelectedZone] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handlePanicConfirm = () => {
    if (!selectedZone) {
      toast.error('Please select a zone first');
      return;
    }
    triggerPanic(selectedZone);
    setIsPanicModalOpen(false);
    toast.success(`Emergency declared for ${selectedZone}`);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const activeAlerts = alerts.filter(a => !a.resolved).length;

  return (
    <>
      <div className="h-16 bg-white dark:bg-dark-surface border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-6 z-50 transition-colors">
        <div className="flex items-center gap-4">
          <div className="text-xl font-bold bg-gradient-to-r from-accent-blue to-accent-green bg-clip-text text-transparent">
            CrowdCommand
          </div>
          <div className="h-6 w-px bg-gray-300 dark:bg-gray-700 mx-2"></div>
          <div className="flex items-center text-gray-500 dark:text-gray-400 gap-2">
            <Clock size={16} />
            <span className="font-mono text-sm">{time.toLocaleTimeString()}</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          
          <button 
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:text-accent-blue transition-colors"
            title="Toggle Theme"
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          <div className="relative cursor-pointer mr-2">
            <Bell size={20} className="text-gray-400 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors" />
            {activeAlerts > 0 && (
              <span className="absolute -top-1 -right-1 bg-accent-red text-white text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center">
                {activeAlerts}
              </span>
            )}
          </div>
          
          <button 
            onClick={() => setIsPanicModalOpen(true)}
            className="flex items-center gap-2 px-4 py-1.5 bg-accent-red/10 dark:bg-accent-red/20 text-accent-red hover:bg-accent-red hover:text-white border border-accent-red/50 rounded-md font-bold transition-all shadow-[0_0_15px_rgba(239,68,68,0.2)] hover:shadow-[0_0_25px_rgba(239,68,68,0.6)]"
          >
            <AlertTriangle size={18} />
            PANIC
          </button>
          
          <button onClick={handleLogout} className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white rounded-lg transition-colors ml-2 border border-gray-200 dark:border-gray-800">
            <LogOut size={16} /> Logout
          </button>
        </div>
      </div>

      {isPanicModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[100]">
          <div className="bg-dark-surface p-6 rounded-xl border border-accent-red shadow-2xl max-w-md w-full">
            <h2 className="text-2xl font-bold text-accent-red flex items-center gap-2 mb-4">
              <AlertTriangle /> Declare Emergency
            </h2>
            <p className="text-gray-300 mb-6">
              This will lock the selected zone, broadcast an emergency to all screens, and automatically dispatch medical & security support.
            </p>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-400 mb-2">Select Affected Zone:</label>
              <select 
                className="w-full bg-dark-bg border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-accent-red"
                value={selectedZone}
                onChange={(e) => setSelectedZone(e.target.value)}
              >
                <option value="">-- Choose Zone --</option>
                {zones.map(z => (
                  <option key={z.id} value={z.id}>{z.name}</option>
                ))}
                <option value="ALL">Entire Venue</option>
              </select>
            </div>
            <div className="flex gap-4 justify-end">
              <button 
                onClick={() => setIsPanicModalOpen(false)}
                className="px-4 py-2 text-gray-400 hover:text-white"
              >
                Cancel
              </button>
              <button 
                onClick={handlePanicConfirm}
                className="px-6 py-2 bg-accent-red hover:bg-red-600 text-white font-bold rounded-lg transition-colors"
              >
                CONFIRM EMERGENCY
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TopNavbar;
