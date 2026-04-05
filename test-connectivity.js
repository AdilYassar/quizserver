/**
 * Simple Connectivity Test
 */

console.log("Testing server connectivity...\n");

const BASE_URL = "http://localhost:4000";

async function testConnectivity() {
  try {
    console.log(`🔗 Testing: ${BASE_URL}/api/auth/student/login\n`);
    
    const response = await fetch(`${BASE_URL}/api/auth/student/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "test@test.com", password: "test" })
    });

    console.log(`✅ Server Response Status: ${response.status}`);
    const data = await response.json();
    console.log(`✅ Response Body:`, data);

  } catch (error) {
    console.error(`❌ Connection Error: ${error.message}`);
    console.error(`\nPossible causes:`);
    console.error(`  1. Server not running on port 4000`);
    console.error(`  2. Firewall blocking connection`);
    console.error(`  3. Wrong hostname/port`);
    console.error(`\nTry running: npm start`);
  }
}

testConnectivity();
