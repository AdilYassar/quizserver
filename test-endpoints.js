/**
 * Test available endpoints
 */

const BASE_URL = "http://localhost:3000";

async function testEndpoints() {
  console.log("\nTesting available endpoints:\n");

  const endpoints = [
    "GET /is-alive",
    "POST /api/auth/student/register",
    "POST /api/auth/student/login"
  ];

  for (const endpoint of endpoints) {
    const [method, path] = endpoint.split(" ");
    try {
      console.log(`Testing: ${method} ${path}`);
      const response = await fetch(`${BASE_URL}${path}`, {
        method,
        headers: { "Content-Type": "application/json" },
        body: method === "POST" ? JSON.stringify({}) : undefined
      });
      console.log(`  → Status: ${response.status}\n`);
    } catch (error) {
      console.log(`  → Error: ${error.message}\n`);
    }
  }
}

testEndpoints();
