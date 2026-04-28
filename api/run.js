export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { code, stdin } = req.body || {};
  if (!code) return res.status(400).json({ error: 'code required' });

  try {
    const response = await fetch('https://wandbox.org/api/compile.json', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        compiler: 'gcc-head',
        code: code,
        stdin: stdin || '',
        'compiler-option-raw': '-Wall\n-lm',
        'runtime-option-raw': '',
        save: false,
      }),
    });

    if (!response.ok) {
      const txt = await response.text().catch(() => '');
      return res.status(502).json({ error: `Wandbox ${response.status}: ${txt.substring(0, 200)}` });
    }

    const data = await response.json();

    // Wandbox: compiler_error = compile xatosi, program_output = stdout
    if (data.compiler_error) {
      return res.status(200).json({ compile_error: data.compiler_error });
    }

    return res.status(200).json({
      stdout: (data.program_output || '').trimEnd(),
      stderr: (data.program_error || '').substring(0, 300),
    });

  } catch (e) {
    return res.status(500).json({ error: 'Server xatosi: ' + e.message });
  }
}