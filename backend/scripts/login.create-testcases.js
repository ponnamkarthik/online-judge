// filename: login.create-testcases.js
const BASE_URL = 'http://localhost:4000';

const credentials = {
  email: 'ponnamkarthik3@gmail.com',
  password: 'Demo123@',
};

// Map of pid -> array of test cases
const testcaseMap = {
  1: [
    { input: '2 3\n', expectedOutput: '5' },
    { input: '10 -4\n', expectedOutput: '6' },
  ],
  2: [
    { input: '1 2 3\n', expectedOutput: '6' },
    { input: '10 20 30\n', expectedOutput: '60' },
  ],
  3: [
    { input: '4 5\n', expectedOutput: '20' },
    { input: '7 8\n', expectedOutput: '56' },
  ],
};

async function login() {
  const res = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(`Login failed: ${err?.error?.message || res.status}`);
  }
  const rawCookies = res.headers.get('set-cookie');
  if (!rawCookies) throw new Error('No cookies received from login');
  const cookieHeader = rawCookies
    .split(',')
    .map((c) => c.split(';')[0])
    .join('; ');
  const data = await res.json();
  console.log('Logged in as:', data.user.username);
  return cookieHeader;
}

async function createTestcases(cookieHeader, pid, cases) {
  const res = await fetch(`${BASE_URL}/api/testcases/bulk`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: cookieHeader },
    body: JSON.stringify({ pid, cases }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    console.error(`Failed to create testcases for pid=${pid}:`, err);
    return false;
  }
  const data = await res.json();
  console.log(`Created ${data.created} testcases for pid=${pid}`);
  return true;
}

async function main() {
  try {
    const cookieHeader = await login();
    for (const [pidStr, cases] of Object.entries(testcaseMap)) {
      const pid = Number(pidStr);
      await createTestcases(cookieHeader, pid, cases);
    }
    console.log('All testcases processed!');
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

main();
