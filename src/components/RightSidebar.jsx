import React from 'react';
import useStore from '../store/useStore';
import { AlertCircle, CheckCircle2, ShieldAlert, X, Activity, Users, AlertTriangle, MapPin } from 'lucide-react';
import clsx from 'clsx';
import toast from 'react-hot-toast';

const RightSidebar = () => {
  const { alerts, suggestions, incidents, updateIncidentStatus } = useStore();

  const handleAcknowledge = (id) => {
    toast.success('Alert acknowledged');
  };

  const handleAcceptSuggestion = (id) => {
    toast.success('Action dispatched successfully');
  };

  const handleDispatchIncident = (id) => {
    updateIncidentStatus(id, 'dispatched');
    toast.success('Team Dispatched!');
  };

  const handleResolveIncident = (id) => {
    updateIncidentStatus(id, 'resolved');
    toast.success('Incident Resolved!');
  };

  return (
    <div className="w-96 bg-dark-surface border-l border-gray-800 flex flex-col h-full shrink-0">
      
      {/* 1. Live Incidents (Viewer Reports) */}
      <div className="flex-1 flex flex-col border-b border-gray-800 min-h-[33%]">
        <div className="p-3 border-b border-gray-800 flex justify-between items-center bg-gray-900/50">
          <h3 className="text-xs font-semibold text-accent-red uppercase tracking-wider flex items-center gap-2">
            <AlertTriangle size={14} /> User Incident Reports
          </h3>
          <span className="bg-accent-red text-white text-xs px-2 py-0.5 rounded-full font-bold">
            {incidents.filter(i => i.status !== 'resolved').length}
          </span>
        </div>
        <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-3">
          {incidents.filter(i => i.status !== 'resolved').length === 0 ? (
            <div className="text-center text-gray-500 text-sm mt-6">No active incidents</div>
          ) : (
            incidents.filter(i => i.status !== 'resolved').map((inc) => (
              <div key={inc.id} className="p-3 bg-red-900/20 border border-red-500/30 rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-bold px-1.5 py-0.5 rounded bg-red-500 text-white">
                    {inc.category}
                  </span>
                  <span className={clsx("text-xs font-bold px-1.5 py-0.5 rounded", inc.status === 'pending' ? 'bg-orange-500/20 text-orange-400' : 'bg-blue-500/20 text-blue-400')}>
                    {inc.status.toUpperCase()}
                  </span>
                </div>
                <div className="text-sm font-semibold text-white mb-1">{inc.detail}</div>
                <div className="text-xs text-gray-400 mb-3 flex items-center gap-1">
                  <MapPin size={12} /> {inc.zone} • Rep: {inc.reporter}
                </div>
                
                {inc.status === 'pending' ? (
                  <button 
                    onClick={() => handleDispatchIncident(inc.id)}
                    className="w-full py-1.5 text-xs font-bold bg-accent-red hover:bg-red-600 text-white rounded transition-colors"
                  >
                    DISPATCH TEAM
                  </button>
                ) : (
                  <button 
                    onClick={() => handleResolveIncident(inc.id)}
                    className="w-full py-1.5 text-xs font-bold bg-gray-700 hover:bg-accent-green text-white rounded transition-colors flex items-center justify-center gap-1"
                  >
                    <CheckCircle2 size={14} /> MARK RESOLVED
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* 2. System Alerts */}
      <div className="flex-1 flex flex-col border-b border-gray-800 min-h-[33%]">
        <div className="p-3 border-b border-gray-800 flex justify-between items-center bg-gray-900/50">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2">
            <ShieldAlert size={14} /> System Alerts
          </h3>
          <span className="bg-gray-800 text-xs px-2 py-0.5 rounded-full">{alerts.length}</span>
        </div>
        <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-3">
          {alerts.length === 0 ? (
            <div className="text-center text-gray-500 text-sm mt-6">No active alerts</div>
          ) : (
            alerts.map((alert) => (
              <div key={alert.id} className={clsx("p-3 rounded-lg border", 
                alert.severity === 'ALERT' ? 'border-accent-red/50 bg-accent-red/10' : 
                alert.severity === 'WARN' ? 'border-accent-amber/50 bg-accent-amber/10' : 
                'border-accent-blue/50 bg-accent-blue/10'
              )}>
                <div className="flex items-start justify-between mb-2">
                  <span className={clsx("text-xs font-bold px-1.5 py-0.5 rounded",
                    alert.severity === 'ALERT' ? 'bg-accent-red text-white' : 
                    alert.severity === 'WARN' ? 'bg-accent-amber text-gray-900' : 
                    'bg-accent-blue text-white'
                  )}>
                    {alert.severity}
                  </span>
                  <span className="text-xs text-gray-400">System</span>
                </div>
                <div className="font-medium text-sm text-gray-200 mb-2">{alert.message}</div>
                <button onClick={() => handleAcknowledge(alert.id)} className="w-full text-xs py-1.5 bg-gray-800 hover:bg-gray-700 rounded transition-colors text-white">Acknowledge</button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* 3. AI Suggestions */}
      <div className="flex-1 flex flex-col min-h-[33%]">
        <div className="p-3 border-b border-gray-800 bg-gray-900/50">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">AI Suggestions</h3>
        </div>
        <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-3">
          {suggestions.length === 0 ? (
            <div className="text-center text-gray-500 text-sm mt-6">Optimal conditions.</div>
          ) : (
            suggestions.map((sug) => (
              <div key={sug.id} className="p-3 bg-gray-800/40 rounded-lg border border-gray-700/50">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs text-accent-amber font-medium">Priority: {sug.priority}</span>
                </div>
                <p className="text-sm text-gray-300 mb-3">{sug.action}</p>
                <div className="flex justify-end gap-2">
                  <button className="p-1 hover:bg-gray-700 rounded text-gray-400 hover:text-white" title="Dismiss">
                    <X size={16} />
                  </button>
                  <button 
                    onClick={() => handleAcceptSuggestion(sug.id)}
                    className="flex items-center gap-1 text-xs px-2 py-1 bg-accent-green/20 text-accent-green hover:bg-accent-green hover:text-white rounded transition-colors"
                  >
                    <CheckCircle2 size={14} /> Accept
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default RightSidebar;
