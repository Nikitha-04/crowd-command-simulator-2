import React, { useState } from 'react';
import { X, AlertTriangle, Activity, Users, MapPin, CheckCircle, ArrowRight } from 'lucide-react';
import useStore from '../store/useStore';
import toast from 'react-hot-toast';

const CATEGORIES = [
  { id: 'medical', label: 'Medical Emergency', icon: Activity, color: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500' },
  { id: 'security', label: 'Security / Fight', icon: AlertTriangle, color: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500' },
  { id: 'crush', label: 'Crowd Crush', icon: Users, color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500' },
  { id: 'lost', label: 'Lost Person', icon: Users, color: 'text-purple-500', bg: 'bg-purple-500/10', border: 'border-purple-500' },
  { id: 'hazard', label: 'Facility Hazard', icon: AlertTriangle, color: 'text-orange-500', bg: 'bg-orange-500/10', border: 'border-orange-500' }
];

const DETAILS_MAP = {
  'medical': ['Need Wheelchair', 'Need Stretcher', 'First Aid / Medic', 'Other'],
  'security': ['Physical Fight', 'Verbal Dispute', 'Suspicious Package', 'Other'],
  'crush': ['Gate Blocked', 'People Falling', 'Severe Congestion', 'Other'],
  'lost': ['Lost Child', 'Lost Adult', 'Found Child', 'Other'],
  'hazard': ['Spill / Slip Hazard', 'Broken Equipment', 'Fire / Smoke', 'Other']
};

const IncidentModal = ({ onClose, venueZones }) => {
  const [step, setStep] = useState(1);
  const [category, setCategory] = useState(null);
  const [detail, setDetail] = useState('');
  const [zone, setZone] = useState('');
  
  const reportIncident = useStore(state => state.reportIncident);
  const currentUser = useStore(state => state.currentUser);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!zone) {
      toast.error("Please select a location.");
      return;
    }

    reportIncident({
      category: CATEGORIES.find(c => c.id === category)?.label || category,
      detail,
      zone,
      reporter: currentUser?.name || 'Anonymous Attendee'
    });
    
    toast.success("Incident Reported Successfully!");
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[2000] flex items-center justify-center p-4">
      <div className="bg-white dark:bg-dark-surface border border-gray-200 dark:border-gray-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-black/20">
          <h2 className="text-xl font-bold flex items-center gap-2 text-gray-900 dark:text-white">
            <AlertTriangle className="text-accent-red" /> Report Incident
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-full transition-colors">
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          {step === 1 && (
            <div className="animate-fade-in">
              <h3 className="font-bold text-gray-700 dark:text-gray-300 mb-4">What type of incident?</h3>
              <div className="grid grid-cols-1 gap-3">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => { setCategory(cat.id); setStep(2); }}
                    className={`flex items-center gap-4 p-4 rounded-xl border-2 border-transparent hover:${cat.border} ${cat.bg} transition-all text-left`}
                  >
                    <cat.icon className={cat.color} size={24} />
                    <span className="font-bold text-gray-900 dark:text-white">{cat.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="animate-fade-in">
              <button onClick={() => setStep(1)} className="text-sm text-gray-500 hover:text-accent-blue mb-4 flex items-center gap-1">
                &larr; Back
              </button>
              <h3 className="font-bold text-gray-700 dark:text-gray-300 mb-4">Specific Details</h3>
              <div className="grid grid-cols-1 gap-3">
                {DETAILS_MAP[category]?.map(det => (
                  <button
                    key={det}
                    onClick={() => { setDetail(det); setStep(3); }}
                    className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-accent-blue hover:bg-blue-500/10 text-left font-semibold text-gray-900 dark:text-white transition-all"
                  >
                    {det}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <form onSubmit={handleSubmit} className="animate-fade-in">
              <button type="button" onClick={() => setStep(2)} className="text-sm text-gray-500 hover:text-accent-blue mb-4 flex items-center gap-1">
                &larr; Back
              </button>
              
              <div className="mb-6">
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-2">Location / Zone</label>
                <select 
                  className="w-full p-4 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-black/50 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-accent-blue"
                  value={zone}
                  onChange={(e) => setZone(e.target.value)}
                  required
                >
                  <option value="" disabled>Select a location...</option>
                  {venueZones.map((z) => (
                    <option key={z.id} value={z.name}>{z.name}</option>
                  ))}
                  <option value="Outside Venue">Outside Venue</option>
                  <option value="Parking Lot">Parking Lot</option>
                </select>
              </div>

              <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-xl mb-6">
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Summary</h4>
                <div className="text-sm text-gray-900 dark:text-white font-semibold">
                  {CATEGORIES.find(c => c.id === category)?.label} &rarr; {detail}
                </div>
              </div>

              <button 
                type="submit" 
                className="w-full py-4 bg-accent-red hover:bg-red-600 text-white rounded-xl font-bold shadow-lg shadow-red-500/20 flex justify-center items-center gap-2 transition-transform hover:scale-105"
              >
                SUBMIT REPORT <ArrowRight size={18} />
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default IncidentModal;
