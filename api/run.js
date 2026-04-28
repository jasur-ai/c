export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
 
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
 
  const { code, stdin } = req.body || {};
  if (!code) return res.status(400).json({ error: 'code required' });
 
  try {
    const response = await fetch('https://emkc.org/api/v2/piston/execute', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        language: 'c',
        version: '*',
        files: [{ name: 'main.c', content: code }],
        stdin: stdin || '',
      }),
    });
 
    if (!response.ok) {
      return res.status(502).json({ error: `Piston API xatosi: ${response.status}` });
    }
 
    const data = await response.json();
 
    if (data.compile && data.compile.code !== 0 && data.compile.stderr) {
      return res.status(200).json({ compile_error: data.compile.stderr });
    }
 
    return res.status(200).json({
      stdout: (data.run?.stdout || '').trimEnd(),
      stderr: (data.run?.stderr || '').substring(0, 300),
    });
  } catch (e) {
    return res.status(500).json({ error: 'Server xatosi: ' + e.message });
  }
}
 