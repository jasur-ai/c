export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { code, stdin } = req.body || {};
  if (!code) return res.status(400).json({ error: 'code required' });

  try {
    const response = await fetch('https://api.codapi.org/v1/exec', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sandbox: 'gcc',
        command: 'run',
        files: { 'main.c': code },
        stdin: stdin || '',
      }),
    });

    if (!response.ok) {
      const txt = await response.text().catch(() => '');
      return res.status(502).json({ error: `codapi ${response.status}: ${txt.substring(0,300)}` });
    }

    const data = await response.json();

    // ok=false => compile yoki runtime xato
    if (!data.ok) {
      const errMsg = (data.stderr || data.stdout || 'Noma\'lum xato').trimEnd();
      // Compile xatosi yoki runtime xato ajratish
      if (errMsg.includes('error:') || errMsg.includes('undefined reference')) {
        return res.status(200).json({ compile_error: errMsg });
      }
      return res.status(200).json({ compile_error: errMsg });
    }

    return res.status(200).json({
      stdout: (data.stdout || '').trimEnd(),
      stderr: (data.stderr || '').substring(0, 300),
    });

  } catch (e) {
    return res.status(500).json({ error: 'Server xatosi: ' + e.message });
  }
}