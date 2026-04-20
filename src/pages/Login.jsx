import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useStore from '../store/useStore';
import { ShieldAlert, Users, Sun, Moon, MapPin, Activity, Server, Radio, ArrowRight, CheckCircle } from 'lucide-react';
import clsx from 'clsx';

const Login = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'viewer'
  });
  
  const navigate = useNavigate();
  const { login, theme, setTheme } = useStore();

  const handleRoleChange = (role) => {
    setFormData({ ...formData, role });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    login(formData);
    if (formData.role === 'organizer') {
      navigate('/dashboard');
    } else {
      navigate('/viewer');
    }
  };

  const isOrg = formData.role === 'organizer';

  return (
    <div className={clsx(
      "min-h-screen flex flex-col md:flex-row transition-colors duration-500 relative overflow-hidden",
      theme === 'dark' ? "bg-dark-bg text-white" : "bg-gray-50 text-gray-900"
    )}>
      
      {/* Background Decor */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div className={clsx(
          "absolute top-[-20%] left-[-10%] w-[70vw] h-[70vw] rounded-full blur-[120px] opacity-20 transition-colors duration-1000",
          isOrg ? "bg-accent-red" : "bg-accent-blue"
        )}></div>
        <div className={clsx(
          "absolute bottom-[-20%] right-[-10%] w-[60vw] h-[60vw] rounded-full blur-[100px] opacity-20 transition-colors duration-1000",
          isOrg ? "bg-accent-amber" : "bg-accent-green"
        )}></div>
        <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
      </div>

      {/* Top Controls */}
      <div className="absolute top-6 right-6 z-50">
        <button 
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="p-3 rounded-full bg-white/10 dark:bg-black/20 backdrop-blur border border-white/20 dark:border-gray-800 shadow-lg text-gray-700 dark:text-gray-300 hover:scale-110 transition-transform"
        >
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </div>

      {/* Left Column: Hero/Info Section */}
      <div className="flex-1 z-10 flex flex-col justify-center px-8 md:px-16 lg:px-24 py-12 md:py-0 border-r border-gray-200/50 dark:border-gray-800/50 backdrop-blur-sm">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/50 dark:bg-black/30 border border-gray-200 dark:border-gray-800 text-sm font-bold w-max mb-8">
          <span className="w-2 h-2 rounded-full bg-accent-green animate-pulse"></span>
          System Live v2.0
        </div>
        
        <h1 className="text-5xl lg:text-7xl font-black tracking-tight mb-6 leading-tight">
          Crowd<span className={clsx("transition-colors duration-500", isOrg ? "text-accent-red" : "text-accent-blue")}>Command</span>
        </h1>
        
        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-lg mb-10 leading-relaxed font-light">
          The next-generation, AI-driven crowd management platform. Real-time density monitoring, dynamic wayfinding, and instant incident response.
        </p>

        <div className="space-y-6">
          <div className="flex items-start gap-4">
            <div className={clsx("p-3 rounded-xl", isOrg ? "bg-red-500/10 text-accent-red" : "bg-blue-500/10 text-accent-blue")}>
              <Activity size={24} />
            </div>
            <div>
              <h3 className="font-bold text-lg">Real-Time Anomaly Detection</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm">AI monitors high-risk zones and predicts surges.</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className={clsx("p-3 rounded-xl", isOrg ? "bg-red-500/10 text-accent-red" : "bg-blue-500/10 text-accent-blue")}>
              <MapPin size={24} />
            </div>
            <div>
              <h3 className="font-bold text-lg">Dynamic Wayfinding</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Live GPS routing directs attendees to safe zones.</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className={clsx("p-3 rounded-xl", isOrg ? "bg-red-500/10 text-accent-red" : "bg-blue-500/10 text-accent-blue")}>
              <ShieldAlert size={24} />
            </div>
            <div>
              <h3 className="font-bold text-lg">Instant Incident Reporting</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Direct bridge between viewers and organizers for emergencies.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column: Login Portal */}
      <div className="flex-1 z-10 flex flex-col justify-center items-center p-8 md:p-12 relative">
        <div className="w-full max-w-md bg-white/70 dark:bg-dark-surface/70 backdrop-blur-xl border border-white/50 dark:border-gray-700/50 rounded-3xl p-8 shadow-2xl">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-black mb-2">Access Portal</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Select your persona to enter the system.</p>
          </div>

          <div className="flex gap-4 mb-8">
            <button
              type="button"
              onClick={() => handleRoleChange('viewer')}
              className={clsx(
                "flex-1 flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all",
                !isOrg 
                  ? "border-accent-blue bg-accent-blue/10" 
                  : "border-gray-200 dark:border-gray-800 hover:border-gray-300"
              )}
            >
              <Users size={28} className={!isOrg ? "text-accent-blue" : "text-gray-400"} />
              <span className={clsx("font-bold text-sm", !isOrg ? "text-accent-blue" : "text-gray-500")}>Viewer</span>
            </button>
            <button
              type="button"
              onClick={() => handleRoleChange('organizer')}
              className={clsx(
                "flex-1 flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all",
                isOrg 
                  ? "border-accent-red bg-accent-red/10" 
                  : "border-gray-200 dark:border-gray-800 hover:border-gray-300"
              )}
            >
              <ShieldAlert size={28} className={isOrg ? "text-accent-red" : "text-gray-400"} />
              <span className={clsx("font-bold text-sm", isOrg ? "text-accent-red" : "text-gray-500")}>Organizer</span>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Full Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full bg-white dark:bg-black/50 border border-gray-300 dark:border-gray-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-accent-blue transition-shadow"
                placeholder="John Doe"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Email Address</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full bg-white dark:bg-black/50 border border-gray-300 dark:border-gray-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-accent-blue transition-shadow"
                placeholder="john@example.com"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Phone Number</label>
              <input
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                className="w-full bg-white dark:bg-black/50 border border-gray-300 dark:border-gray-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-accent-blue transition-shadow"
                placeholder="+1 (555) 000-0000"
              />
            </div>

            <button
              type="submit"
              className={clsx(
                "w-full py-4 mt-4 rounded-xl font-black text-white transition-all transform hover:scale-[1.02] shadow-xl flex items-center justify-center gap-2",
                isOrg ? "bg-accent-red hover:bg-red-600 shadow-red-500/20" : "bg-accent-blue hover:bg-blue-600 shadow-blue-500/20"
              )}
            >
              INITIALIZE CONNECTION <ArrowRight size={18} />
            </button>
          </form>
        </div>
      </div>

      {/* System Status Ticker (Bottom) */}
      <div className="absolute bottom-0 w-full h-10 bg-white/80 dark:bg-black/80 backdrop-blur border-t border-gray-200 dark:border-gray-800 z-50 flex items-center px-4 overflow-hidden text-xs font-mono text-gray-500 dark:text-gray-400">
        <div className="flex items-center gap-8 animate-[marquee_20s_linear_infinite] whitespace-nowrap">
          <span className="flex items-center gap-2"><Server size={14} className="text-accent-green"/> Backend Systems: ONLINE</span>
          <span className="flex items-center gap-2"><Activity size={14} className="text-accent-blue"/> AI Microservice: ACTIVE</span>
          <span className="flex items-center gap-2"><MapPin size={14} className="text-accent-amber"/> Monitored Venues: 3</span>
          <span className="flex items-center gap-2"><Radio size={14} className="text-accent-green"/> WebSockets: BROADCASTING</span>
          <span className="flex items-center gap-2"><CheckCircle size={14} className="text-accent-blue"/> Security Protocols: ENFORCED</span>
          
          {/* Duplicate for seamless looping */}
          <span className="flex items-center gap-2"><Server size={14} className="text-accent-green"/> Backend Systems: ONLINE</span>
          <span className="flex items-center gap-2"><Activity size={14} className="text-accent-blue"/> AI Microservice: ACTIVE</span>
        </div>
      </div>

    </div>
  );
};

export default Login;
