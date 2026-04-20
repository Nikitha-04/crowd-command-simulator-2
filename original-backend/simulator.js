const INITIAL_ZONES = [
  { id: 'zone-A', name: 'Zone A', capacity: 1000, current_headcount: 400, entry_rate: 10, exit_rate: 5, status: 'safe' },
  { id: 'zone-B', name: 'Zone B', capacity: 800, current_headcount: 600, entry_rate: 20, exit_rate: 15, status: 'moderate' },
  { id: 'zone-C', name: 'Zone C', capacity: 1500, current_headcount: 1200, entry_rate: 50, exit_rate: 20, status: 'high' },
  { id: 'zone-D', name: 'Zone D', capacity: 500, current_headcount: 100, entry_rate: 5, exit_rate: 2, status: 'safe' },
  { id: 'zone-E', name: 'Zone E', capacity: 2000, current_headcount: 1950, entry_rate: 30, exit_rate: 10, status: 'critical' },
];

function simulateZones(previousZones = INITIAL_ZONES) {
  return previousZones.map(zone => {
      // Randomly change headcount
      const netChange = Math.floor(Math.random() * 40) - 15; // slightly positive bias to fill up
      let newCount = zone.current_headcount + netChange;
      
      if (newCount < 0) newCount = 0;
      
      // Determine status
      const density = newCount / zone.capacity;
      let status = 'safe';
      if (density >= 0.9) status = 'critical';
      else if (density >= 0.75) status = 'high';
      else if (density >= 0.5) status = 'moderate';

      return {
          ...zone,
          current_headcount: newCount,
          entry_rate: Math.floor(Math.random() * 20) + 5,
          exit_rate: Math.floor(Math.random() * 15) + 2,
          status,
          last_updated: new Date().toISOString()
      };
  });
}

module.exports = { simulateZones };
