import React from 'react';
import useStore from '../store/useStore';
import clsx from 'clsx';
import { ArrowUpRight, ArrowDownRight, AlertCircle, Eye } from 'lucide-react';

const ZoneCard = ({ zone }) => {
  const density = zone.capacity > 0 ? (zone.current_headcount / zone.capacity) * 100 : 0;
  const netFlow = zone.entry_rate - zone.exit_rate;

  const getStatusColor = (d) => {
    if (d >= 90) return 'text-accent-red';
    if (d >= 75) return 'text-accent-amber';
    if (d >= 50) return 'text-accent-blue';
    return 'text-accent-green';
  };

  const getProgressColor = (d) => {
    if (d >= 90) return 'bg-accent-red';
    if (d >= 75) return 'bg-accent-amber';
    if (d >= 50) return 'bg-accent-blue';
    return 'bg-accent-green';
  };

  return (
    <div className={clsx("card-surface p-5 flex flex-col justify-between", zone.status === 'critical' ? 'ring-2 ring-accent-red/50 shadow-[0_0_15px_rgba(239,68,68,0.2)]' : '')}>
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-bold text-gray-100">{zone.name}</h3>
          <span className={clsx("status-badge mt-1 inline-block", 
            zone.status === 'critical' ? 'bg-accent-red/20 text-accent-red' : 
            zone.status === 'high' ? 'bg-accent-amber/20 text-accent-amber' : 
            'bg-gray-800 text-gray-400'
          )}>
            {zone.status}
          </span>
        </div>
        <div className="flex flex-col items-end">
          <div className="text-3xl font-black font-mono tracking-tight">{zone.current_headcount}</div>
          <div className="text-xs text-gray-500">/ {zone.capacity}</div>
        </div>
      </div>

      <div className="mb-4">
        <div className="flex justify-between text-xs mb-1">
          <span className="text-gray-400">Capacity</span>
          <span className={clsx("font-bold", getStatusColor(density))}>{Math.round(density)}%</span>
        </div>
        <div className="w-full bg-gray-800 rounded-full h-2">
          <div 
            className={clsx("h-2 rounded-full transition-all duration-1000 ease-in-out", getProgressColor(density))} 
            style={{ width: `${Math.min(density, 100)}%` }}
          ></div>
        </div>
      </div>

      <div className="flex justify-between items-center pt-3 border-t border-gray-800">
        <div className="flex items-center gap-2">
          {netFlow > 0 ? (
            <ArrowUpRight size={16} className="text-accent-red" />
          ) : (
            <ArrowDownRight size={16} className="text-accent-green" />
          )}
          <span className="text-sm text-gray-400">
            <span className={netFlow > 0 ? "text-accent-red font-medium" : "text-accent-green font-medium"}>
              {netFlow > 0 ? '+' : ''}{netFlow}
            </span> /min
          </span>
        </div>
        <button className="p-1.5 hover:bg-gray-800 rounded-md transition-colors text-gray-400 hover:text-white" title="View Details">
          <Eye size={18} />
        </button>
      </div>

      {zone.status === 'critical' && (
        <div className="mt-3 bg-accent-red/10 border border-accent-red/20 rounded-md p-2 flex items-start gap-2">
          <AlertCircle size={14} className="text-accent-red shrink-0 mt-0.5" />
          <p className="text-xs text-accent-red font-medium leading-tight">
            Overcrowding detected. Immediate action required.
          </p>
        </div>
      )}
    </div>
  );
};

export default ZoneCard;
