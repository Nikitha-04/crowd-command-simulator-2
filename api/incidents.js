// Note: Serverless functions are stateless. 
// For a full demo, this uses a simple memory-based list (resets on deploy).
let incidents = [
  { id: '1', category: 'Medical', detail: 'Minor scrape', zone: 'Zone A', reporter: 'System', status: 'pending', timestamp: new Date().toISOString() }
];

export default function handler(req, res) {
  if (req.method === 'POST') {
    const newIncident = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      status: 'pending',
      ...req.body
    };
    incidents.unshift(newIncident);
    return res.status(201).json(newIncident);
  } else {
    res.status(200).json(incidents);
  }
}
