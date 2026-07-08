require('dotenv').config();
const http = require('http');
const pool = require('./config/db');

function apiReq(method, path, body, token) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const opts = {
      hostname: 'localhost', port: 5000, path, method,
      headers: {
        'Content-Type': 'application/json',
        ...(data ? {'Content-Length': Buffer.byteLength(data)} : {}),
        ...(token ? {'Authorization': `Bearer ${token}`} : {})
      }
    };
    const r = http.request(opts, (res) => {
      let raw = '';
      res.on('data', c => raw += c);
      res.on('end', () => {
        try { resolve(JSON.parse(raw)); }
        catch { resolve({error: raw}); }
      });
    });
    r.on('error', reject);
    if (data) r.write(data);
    r.end();
  });
}

async function verify() {
  // Login
  const login = await apiReq('POST', '/api/auth/login', { username: 'admin', password: 'admin123' });
  const token = login.token;
  console.log('Token:', token ? '✅ obtained' : '❌ failed');
  
  // Get registrations
  const regs = await apiReq('GET', '/api/registrations?limit=3', null, token);
  
  if (regs.data && regs.data.length > 0) {
    const first = regs.data[0];
    console.log('\nFirst registration from API:');
    console.log('  id:', first.id);
    console.log('  status:', first.status);
    console.log('  payment_status:', first.payment_status);
    console.log('  registration_type:', first.registration_type);
    console.log('  refund_status:', first.refund_status);
    console.log('  rejected_at:', first.rejected_at);
    console.log('  rejection_reason:', first.rejection_reason);
    console.log('  paid_amount:', first.paid_amount);
    console.log('  Has "registration_type" key:', 'registration_type' in first);
    console.log('  Has "refund_status" key:', 'refund_status' in first);
    console.log('  Has "rejected_at" key:', 'rejected_at' in first);
    console.log('  Has "rejection_reason" key:', 'rejection_reason' in first);
    console.log('  Has "paid_amount" key:', 'paid_amount' in first);
    console.log('\n  All keys:', Object.keys(first).join(', '));
  } else {
    console.log('No registrations returned:', JSON.stringify(regs).slice(0, 200));
  }
  
  // Also test rejection update for id=8 directly
  console.log('\n--- Testing rejection update ---');
  const updateRes = await apiReq('PATCH', '/api/registrations/8/status', { 
    status: 'rejected', 
    rejection_reason: 'Test rejection from e2e verification' 
  }, token);
  console.log('Update result:', JSON.stringify(updateRes));
  
  // Verify lookup
  const lookup = await apiReq('GET', '/api/registrations/8', null, token);
  if (lookup.data) {
    console.log('\nAfter rejection:');
    console.log('  status:', lookup.data.status);
    console.log('  payment_status:', lookup.data.payment_status);
    console.log('  refund_status:', lookup.data.refund_status);
    console.log('  rejected_at:', lookup.data.rejected_at);
    console.log('  rejection_reason:', lookup.data.rejection_reason);
  }
  
  process.exit(0);
}

verify().catch(e => { console.error(e); process.exit(1); });
