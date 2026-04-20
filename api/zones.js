export default function handler(req, res) {
  // Simulate zones based on current time (deterministic)
  const now = Date.now();
  const zones = [
    { id: 'zone-A', name: 'Main Hall', capacity: 1000, current_headcount: 500 + Math.floor(Math.sin(now / 10000) * 400), status: 'moderate' },
    { id: 'zone-B', name: 'North Wing', capacity: 600, current_headcount: 300 + Math.floor(Math.cos(now / 8000) * 200), status: 'safe' },
    { id: 'zone-C', name: 'East Wing', capacity: 800, current_headcount: 700 + Math.floor(Math.sin(now / 12000) * 100), status: 'high' },
    { id: 'zone-D', name: 'South Corridor', capacity: 500, current_headcount: 450 + Math.floor(Math.cos(now / 15000) * 50), status: 'critical' },
    { id: 'zone-E', name: 'Central Hub', capacity: 1200, current_headcount: 600 + Math.floor(Math.sin(now / 20000) * 500), status: 'moderate' }
  ];

  // Update statuses based on density
  zones.forEach(z => {
    const density = z.current_headcount / z.capacity;
    if (density >= 0.9) z.status = 'critical';
    else if (density >= 0.75) z.status = 'high';
    else if (density >= 0.5) z.status = 'moderate';
    else z.status = 'safe';
  });

  res.status(200).json(zones);
}
