module.exports = async function handler(req, res) {
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

    const data = await response.json();

    // Kompilyatsiya xatosi
    if (data.compile && data.compile.code !== 0) {
      return res.status(200).json({ compile_error: data.compile.stderr || data.compile.output || 'Compile error' });
    }

    const stdout = (data.run?.stdout || '').trimEnd();
    const stderr = (data.run?.stderr || '').substring(0, 300);

    res.status(200).json({ stdout, stderr });
  } catch (e) {
    res.status(500).json({ error: 'Server xatosi: ' + e.message });
  }
};
