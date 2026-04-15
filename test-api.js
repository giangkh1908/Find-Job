const http = require('http');

let token = null;

function request(method, path, body) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : '';
    const options = {
      hostname: '127.0.0.1', // Use IP to avoid localhost IPv6/v4 ambiguity
      port: 3000,
      path: '/api' + path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data),
      },
    };

    if (token) {
      options.headers['Authorization'] = 'Bearer ' + token;
    }

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        console.log('Status:', res.statusCode);
        console.log('Response:', body);
        try {
          resolve(JSON.parse(body));
        } catch (e) {
          resolve(body);
        }
      });
    });

    req.on('error', (e) => {
      if (e.code === 'ECONNREFUSED') {
        console.error(`\n[ERROR] Connection refused at ${options.hostname}:${options.port}`);
        console.error(`Please ensure the backend server is running: "cd backend && npm run dev"\n`);
      } else {
        console.error('Error:', e.message);
      }
      reject(e);
    });

    if (data) req.write(data);
    req.end();
  });
}

async function test() {
  // 1. Login
  console.log('=== LOGIN ===');
  const login = await request('POST', '/auth/login', {
    email: 'quangvu1922@gmail.com',
    password: '19082003'
  });

  if (login.success && login.data?.accessToken) {
    token = login.data.accessToken;
    console.log('Token received\n');

    // 2. Search
    console.log('=== SEARCH ===');
    const search = await request('POST', '/jobs/search', {
      keyword: 'BA kế toán',
      platforms: ['TopCV'],
      chromeMode: 'headless'
    });
    console.log('Search result:', JSON.stringify(search, null, 2));

    if (search.data?.searchId) {
      console.log('\n=== WAIT 30s ===');
      await new Promise(r => setTimeout(r, 30000));

      // 3. Check status multiple times
      for (let i = 0; i < 6; i++) {
        const status = await request('GET', '/jobs/' + search.data.searchId + '/status');
        console.log('Status check', i + 1, ':', JSON.stringify(status, null, 2));
        if (status.data?.status === 'completed' || status.data?.status === 'failed') break;
        await new Promise(r => setTimeout(r, 10000));
      }

      // 4. Get results
      console.log('\n=== RESULTS ===');
      const results = await request('GET', '/jobs/' + search.data.searchId + '/results');
      console.log('Results:', JSON.stringify(results, null, 2));
    }
  } else {
    console.log('Login failed:', login.error);
  }
}

test().catch(console.error);