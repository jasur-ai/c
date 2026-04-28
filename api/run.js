module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { code, stdin } = req.body || {};
  if (!code) return res.status(400).json({ error: 'code required' });

  let pistonData = null;
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

    pistonData = await response.json();

    if (pistonData.compile && pistonData.compile.code !== 0) {
      return res.status(200).json({
        compile_error: pistonData.compile.stderr || pistonData.compile.output || 'Compile error'
      });
    }

    // stdout yoki output fieldini ishlatamiz
    const stdout = (pistonData.run?.stdout || pistonData.run?.output || '').trimEnd();
    const stderr = (pistonData.run?.stderr || '').substring(0, 300);

    return res.status(200).json({ stdout, stderr, _debug: pistonData });
  } catch (e) {
    return res.status(500).json({
      error: e.message,
      _debug: pistonData
    });
  }
};
