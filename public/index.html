export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { code, stdin } = req.body || {};
  if (!code) return res.status(400).json({ error: 'code required' });

  // stdin ni kod ichiga inject qilamiz — fmemopen orqali
  // Bu codapi/wandbox/har qanday API da stdin support bo'lmasa ham ishlaydi
  const safeStdin = (stdin || '')
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '');

  const injection = `#include <stdio.h>
#include <string.h>
static char _fake_buf[] = "${safeStdin}\\n";
static __attribute__((constructor)) void _stdin_setup(void){
  stdin = fmemopen(_fake_buf, strlen(_fake_buf), "r");
}
`;

  const finalCode = injection + '\n' + code;

  try {
    const response = await fetch('https://api.codapi.org/v1/exec', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sandbox: 'gcc',
        command: 'run',
        files: { 'main.c': finalCode },
      }),
    });

    if (!response.ok) {
      const txt = await response.text().catch(() => '');
      return res.status(502).json({ error: `codapi ${response.status}: ${txt.substring(0,300)}` });
    }

    const data = await response.json();

    if (!data.ok) {
      const errMsg = (data.stderr || data.stdout || 'Noma\'lum xato').trimEnd();
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