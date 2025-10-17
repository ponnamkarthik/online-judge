// filename: createProblemsNativeFetch.js
const BASE_URL = 'http://localhost:4000';

const credentials = {
  email: 'ponnamkarthik3@gmail.com',
  password: 'Demo123@',
};

const problems = [
  {
    title: 'Add Two Numbers',
    descriptionMd: `# Add Two Numbers

Given two numbers **a** and **b**, return their sum.

**Input:** a, b  
**Output:** Sum of a and b  

**Example:**  
\`\`\` 
Input: a = 2, b = 3
Output: 5
\`\`\``,
    difficulty: 'easy',
    tags: ['math', 'numbers'],
  },
  {
    title: 'Add Three Numbers',
    descriptionMd: `# Add Three Numbers

Given three numbers **a**, **b**, and **c**, return their sum.

**Input:** a, b, c  
**Output:** Sum of a, b, c  

**Example:**  
\`\`\`
Input: a = 1, b = 2, c = 3
Output: 6
\`\`\``,
    difficulty: 'easy',
    tags: ['math', 'numbers'],
  },
  {
    title: 'Multiply Two Numbers',
    descriptionMd: `# Multiply Two Numbers

Given two numbers **a** and **b**, return their product.

**Input:** a, b  
**Output:** Product of a and b  

**Example:**  
\`\`\`
Input: a = 4, b = 5
Output: 20
\`\`\``,
    difficulty: 'easy',
    tags: ['math', 'numbers'],
  },
];

async function main() {
  try {
    // Login
    const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });

    if (!loginRes.ok) {
      const err = await loginRes.json();
      throw new Error(`Login failed: ${err.error?.message || loginRes.status}`);
    }

    const loginData = await loginRes.json();
    console.log('Logged in as:', loginData.user.username);

    // Extract cookies from login response
    const rawCookies = loginRes.headers.get('set-cookie');
    if (!rawCookies) {
      throw new Error('No cookies received from login');
    }

    // For simplicity, use the entire string as Cookie header
    const cookieHeader = rawCookies
      .split(',')
      .map((c) => c.split(';')[0])
      .join('; ');

    // Create problems
    for (const problem of problems) {
      const res = await fetch(`${BASE_URL}/api/problems`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Cookie: cookieHeader,
        },
        body: JSON.stringify(problem),
      });

      if (!res.ok) {
        const err = await res.json();
        console.error('Failed to create problem:', problem.title, err);
      } else {
        const data = await res.json();
        console.log('Created problem:', data.problem.title);
      }
    }

    console.log('All problems processed!');
  } catch (err) {
    console.error('Error:', err);
  }
}

main();
