
const ITERS = 310000;
async function deriveKey(pass, salt) {
  const km = await crypto.subtle.importKey('raw', new TextEncoder().encode(pass), 'PBKDF2', false, ['deriveKey']);
  return crypto.subtle.deriveKey({name:'PBKDF2', salt, iterations: ITERS, hash:'SHA-256'}, km,
    {name:'AES-GCM', length:256}, false, ['decrypt']);
}
async function tryDecrypt(pass, buf) {
  const b = new Uint8Array(buf);
  const salt = b.slice(0,16), iv = b.slice(16,28), ct = b.slice(28);
  const key = await deriveKey(pass, salt);
  const pt = await crypto.subtle.decrypt({name:'AES-GCM', iv}, key, ct);
  return new TextDecoder().decode(pt);
}
async function openDoc(docKey) {
  const status = document.getElementById('st');
  let buf;
  try {
    const r = await fetch('data/' + docKey + '.bin');
    if (!r.ok) throw new Error('fetch ' + r.status);
    buf = await r.arrayBuffer();
  } catch(e) { status.textContent = 'Could not load content — are you offline before first sync?'; return; }
  const saved = localStorage.getItem('sea_pass');
  if (saved) {
    try {
      const html = await tryDecrypt(atob(saved), buf);
      document.open(); document.write(html); document.close(); return;
    } catch(e) { localStorage.removeItem('sea_pass'); }
  }
  document.getElementById('gate').style.display = 'flex';
  document.getElementById('go').onclick = async () => {
    const pass = document.getElementById('pw').value.trim();
    status.textContent = 'Unlocking…';
    try {
      const html = await tryDecrypt(pass, buf);
      localStorage.setItem('sea_pass', btoa(pass));
      document.open(); document.write(html); document.close();
    } catch(e) { status.textContent = 'Wrong passphrase — try again.'; }
  };
  document.getElementById('pw').addEventListener('keydown', e => { if (e.key === 'Enter') document.getElementById('go').click(); });
}
