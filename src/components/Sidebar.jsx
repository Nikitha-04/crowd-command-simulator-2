import React from 'react';
import useStore from '../store/useStore';
import { Users, Activity } from 'lucide-react';
import clsx from 'clsx';

const getStatusColor = (status) => {
  switch(status) {
    case 'safe': return 'bg-accent-green';
    case 'moderate': return 'bg-accent-blue';
    case 'high': return 'bg-accent-amber';
    case 'critical': return 'bg-accent-red animate-pulse';
    default: return 'bg-gray-500';
  }
};

const Sidebar = () => {
  const { zones } = useStore();

  const totalHeadcount = zones.reduce((sum, z) => sum + z.current_headcount, 0);
  const totalCapacity = zones.reduce((sum, z) => sum + z.capacity, 0);
  const totalPercent = totalCapacity > 0 ? Math.round((totalHeadcount / totalCapacity) * 100) : 0;

  return (
    <div className="w-64 bg-dark-surface border-r border-gray-800 flex flex-col h-full shrink-0">
      <div className="p-4 border-b border-gray-800">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Venue Overview</h3>
        <div className="flex items-end gap-2 mb-2">
          <Users className="text-gray-400" size={20} />
          <span className="text-2xl font-bold">{totalHeadcount.toLocaleString()}</span>
          <span className="text-sm text-gray-500 mb-1">/ {totalCapacity.toLocaleString()}</span>
        </div>
        <div className="w-full bg-gray-800 rounded-full h-1.5 mb-1">
          <div 
            className={clsx("h-1.5 rounded-full", totalPercent > 80 ? 'bg-accent-red' : totalPercent > 60 ? 'bg-accent-amber' : 'bg-accent-blue')} 
            style={{ width: `${Math.min(totalPercent, 100)}%` }}
          ></div>
        </div>
        <div className="text-xs text-right text-gray-400">{totalPercent}% full</div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Active Zones</h3>
        <div className="flex flex-col gap-3">
          {zones.map((zone) => {
            const density = Math.round((zone.current_headcount / zone.capacity) * 100);
            return (
              <div 
                key={zone.id} 
                className={clsx(
                  "p-3 rounded-lg border cursor-pointer hover:bg-gray-800/50 transition-colors flex items-center justify-between",
                  zone.status === 'critical' ? 'border-accent-red/30 bg-accent-red/5' : 'border-gray-800'
                )}
              >
                <div className="flex items-center gap-3">
                  <div className={clsx("w-3 h-3 rounded-full", getStatusColor(zone.status))} />
                  <div>
                    <div className="font-medium text-sm text-gray-200">{zone.name}</div>
                    <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                      <Activity size={10} />
                      {(zone.entry_rate - zone.exit_rate) > 0 ? '+' : ''}{zone.entry_rate - zone.exit_rate}/min
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={clsx("font-bold text-sm", density >= 90 ? 'text-accent-red' : density >= 75 ? 'text-accent-amber' : 'text-gray-300')}>
                    {density}%
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
