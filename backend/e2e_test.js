const http = require('http');

function req(method, path, body, token) {
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
        try { resolve({status: res.statusCode, body: JSON.parse(raw)}); }
        catch { resolve({status: res.statusCode, body: raw}); }
      });
    });
    r.on('error', reject);
    if (data) r.write(data);
    r.end();
  });
}

async function runTests() {
  console.log('\n====== FULL END-TO-END VERIFICATION ======\n');
  let token = null;
  let pass = 0, fail = 0;

  function check(name, condition, details) {
    if (condition) { console.log(`  ✅ PASS: ${name}`); pass++; }
    else { console.log(`  ❌ FAIL: ${name}`); if(details) console.log(`        Detail: ${String(details).slice(0,200)}`); fail++; }
  }

  // 1. Health
  console.log('1. Backend Health');
  try {
    const r = await req('GET', '/api/health');
    check('API is reachable and healthy', r.status === 200 && r.body.success === true);
  } catch(e) { check('Health', false, e.message); }

  // 2. Login — token is at r.body.token NOT r.body.data.token
  console.log('\n2. Admin Authentication');
  try {
    const r = await req('POST', '/api/auth/login', { username: 'admin', password: 'admin123' });
    check('Login returns HTTP 200', r.status === 200);
    check('Login success=true', r.body.success === true);
    // token is directly on body (not nested in .data)
    check('Token returned in response', !!(r.body.token));
    token = r.body.token;
    if (token) console.log(`     Token obtained ✓ (${token.slice(0,30)}...)`);
  } catch(e) { check('Auth Login', false, e.message); }

  // Wrong password
  try {
    const r = await req('POST', '/api/auth/login', { username: 'admin', password: 'wrongpass' });
    check('Wrong password returns 401', r.status === 401);
  } catch(e) { check('Wrong password blocked', false, e.message); }

  // 3. Events
  console.log('\n3. Events API');
  try {
    const r = await req('GET', '/api/events?limit=10');
    check('Events returns success', r.body.success === true);
    check('Events data is array', Array.isArray(r.body.data));
    const count = r.body.data?.length ?? 0;
    check('Events has records', count > 0, `count=${count}`);
    if (count > 0) {
      const ev = r.body.data[0];
      check('Event has event_date', !!ev.event_date);
      check('Event has event_time', !!ev.event_time);
      check('Event has registration_fee', ev.registration_fee !== undefined);
      console.log(`     Sample: "${ev.name}" on ${ev.event_date} at ${ev.event_time}`);
    }
  } catch(e) { check('Events API', false, e.message); }

  // 4. Departments
  console.log('\n4. Departments API');
  try {
    const r = await req('GET', '/api/departments');
    check('Departments returns success', r.body.success === true);
    check('Has departments', (r.body.data?.length ?? 0) > 0, `count=${r.body.data?.length}`);
  } catch(e) { check('Departments', false, e.message); }

  // 5. Protected routes (with token)
  console.log('\n5. Admin Protected Routes');
  if (token) {
    // Registrations
    try {
      const r = await req('GET', '/api/registrations?limit=5', null, token);
      check('Registrations endpoint accessible', r.body.success === true);
      check('Registrations returns array', Array.isArray(r.body.data));
      if (r.body.data?.length > 0) {
        const reg = r.body.data[0];
        check('Schema: registration_type field', 'registration_type' in reg);
        check('Schema: group_members field', 'group_members' in reg);
        check('Schema: refund_status field', 'refund_status' in reg);
        check('Schema: rejected_at field', 'rejected_at' in reg);
        check('Schema: rejection_reason field', 'rejection_reason' in reg);
        check('Schema: paid_amount field', 'paid_amount' in reg);
        console.log(`     Sample reg: id=${reg.id}, type=${reg.registration_type}, status=${reg.status}, payment=${reg.payment_status}, refund_status=${reg.refund_status}`);
      } else {
        console.log('     (No registrations yet — schema verified via DESCRIBE below)');
      }
    } catch(e) { check('Registrations', false, e.message); }

    // Stats
    try {
      const r = await req('GET', '/api/registrations/stats', null, token);
      check('Stats endpoint works', r.body.success === true);
      ['totalParticipants','totalEvents','totalDepartments','totalRevenue','pendingPayments'].forEach(k =>
        check(`Stats.${k} exists`, k in (r.body.data || {}))
      );
    } catch(e) { check('Stats', false, e.message); }

    // Update status route exists
    try {
      const r = await req('PATCH', '/api/registrations/99999/status', { status: 'approved' }, token);
      // 404 is OK (record not found), 401 would mean auth broken, 500 is a problem
      check('Status update route is registered (not 404 route)', r.status !== 404 || r.body?.message?.includes('not found'), `HTTP ${r.status}: ${JSON.stringify(r.body)}`);
    } catch(e) { check('Status route', false, e.message); }

    // Profile  
    try {
      const r = await req('GET', '/api/auth/profile', null, token);
      check('Profile endpoint works', r.body.success === true && !!r.body.admin);
    } catch(e) { check('Profile', false, e.message); }

  } else {
    console.log('  ⚠️  Token not available — skipping protected routes');
    fail++;
  }

  // 6. DB Schema Direct Verification
  console.log('\n6. Database Schema Verification');
  const mysql = require('mysql2/promise');
  try {
    const c = await mysql.createConnection({ host:'localhost', user:'root', password:'', database:'abc_symposium' });
    const [cols] = await c.query('DESCRIBE registrations');
    const colMap = {};
    cols.forEach(col => { colMap[col.Field] = col; });
    
    check('registrations.registration_type', !!colMap['registration_type'], 'column missing');
    check('registrations.group_members (JSON/text)', !!colMap['group_members'], 'column missing');
    check('registrations.refund_status', !!colMap['refund_status'], 'column missing');
    check('registrations.rejected_at', !!colMap['rejected_at'], 'column missing');
    check('registrations.rejection_reason', !!colMap['rejection_reason'], 'column missing');
    check('payment_status ENUM includes refunded', colMap['payment_status']?.Type?.includes('refunded'), colMap['payment_status']?.Type);
    check('refund_status ENUM has Pending,Completed', colMap['refund_status']?.Type?.includes('Pending'), colMap['refund_status']?.Type);

    await c.end();
  } catch(e) { check('DB Schema', false, e.message); }

  // 7. Countdown Timer Logic (Node.js simulation)
  console.log('\n7. Countdown Timer Logic (Simulated)');
  function simulateCountdown(targetDate, targetTime) {
    if (!targetDate) return { invalid: true };
    try {
      const d = new Date(targetDate);
      if (isNaN(d.getTime())) return { invalid: true };
      const dateStr = d.toISOString().split('T')[0];
      const timeStr = (targetTime && /^\d{2}:\d{2}/.test(targetTime)) ? targetTime : '00:00:00';
      const combined = new Date(`${dateStr}T${timeStr}`);
      if (isNaN(combined.getTime())) return { invalid: true };
      const diff = combined - Date.now();
      if (diff <= 0) return { started: true, ended: diff < -(1000 * 60 * 60 * 24) };
      return {
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / 1000 / 60) % 60),
        seconds: Math.floor((diff / 1000) % 60),
        invalid: false, started: false, ended: false
      };
    } catch(e) { return { invalid: true }; }
  }

  // Future date
  const future = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000); // 5 days from now
  const r1 = simulateCountdown(future.toISOString(), '09:00:00');
  check('Future event: has days/hours/minutes/seconds', !r1.invalid && !r1.started && !r1.ended && r1.days >= 4);
  check('Future event: no NaN values', !Object.values(r1).some(v => typeof v === 'number' && isNaN(v)));
  
  // Past date < 24h
  const recent = new Date(Date.now() - 2 * 60 * 60 * 1000); // 2 hours ago
  const r2 = simulateCountdown(recent.toISOString(), recent.toTimeString().slice(0,8));
  check('Recent past event: shows "started"', r2.started === true && r2.ended === false);
  
  // Past date > 24h
  const old = new Date(Date.now() - 48 * 60 * 60 * 1000); // 2 days ago
  const r3 = simulateCountdown(old.toISOString(), '09:00');
  check('Old past event: shows "ended"', r3.started === true && r3.ended === true);
  
  // Null date
  const r4 = simulateCountdown(null, null);
  check('Null date: returns invalid', r4.invalid === true);
  
  // Bad date
  const r5 = simulateCountdown('not-a-date', '09:00');
  check('Bad date string: returns invalid', r5.invalid === true);

  // MySQL date format (what backend returns)
  const mysqlDate = '2026-12-15T00:00:00.000Z';
  const r6 = simulateCountdown(mysqlDate, '09:30:00');
  check('MySQL ISO date format: parsed correctly', !r6.invalid, JSON.stringify(r6));

  // Summary
  console.log(`\n====== FINAL RESULTS: ${pass} passed, ${fail} failed ======`);
  if (fail === 0) console.log('🎉 ALL CHECKS PASSED — System is ready!\n');
  else console.log(`⚠️  ${fail} issue(s) need attention.\n`);
}

runTests().catch(e => { console.error('Test runner error:', e); process.exit(1); });
