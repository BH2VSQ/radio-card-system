const axios = require("axios");

async function testBackend() {
  try {
    const response = await axios.get("http://localhost:5000/api/auth/init-status");
    if (response.status === 200) {
      console.log("Backend API test passed: Successfully connected to /api/auth/init-status");
      process.exit(0);
    } else {
      console.error(`Backend API test failed: Unexpected status code ${response.status}`);
      process.exit(1);
    }
  } catch (error) {
    console.error("Backend API test failed:", error.message);
    process.exit(1);
  }
}

testBackend();


