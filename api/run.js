export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { code, stdin } = req.body || {};
  if (!code) return res.status(400).json({ error: 'code required' });

  const CLIENT_ID     = process.env.JDOODLE_CLIENT_ID;
  const CLIENT_SECRET = process.env.JDOODLE_CLIENT_SECRET;

  if (!CLIENT_ID || !CLIENT_SECRET) {
    return res.status(500).json({
      error: 'JDOODLE_CLIENT_ID va JDOODLE_CLIENT_SECRET env variable yo\'q.\nVercel Dashboard → Settings → Environment Variables ga qo\'shing.'
    });
  }

  try {
    const response = await fetch('https://api.jdoodle.com/v1/execute', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        clientId:     CLIENT_ID,
        clientSecret: CLIENT_SECRET,
        script:       code,
        stdin:        stdin || '',
        language:     'c',
        versionIndex: '5',   // GCC 11.1
      }),
    });

    const data = await response.json();

    // JDoodle: output = stdout+stderr, statusCode = 200 ok
    if (data.error) {
      return res.status(200).json({ compile_error: data.error });
    }

    // Kompilatsiya xatosi: output "prog.c" bilan boshlansa
    const out = (data.output || '').trimEnd();
    if (out.includes('error:') && out.includes('.c:')) {
      return res.status(200).json({ compile_error: out });
    }

    return res.status(200).json({
      stdout: out,
      stderr: '',
    });

  } catch (e) {
    return res.status(500).json({ error: 'Server xatosi: ' + e.message });
  }
}