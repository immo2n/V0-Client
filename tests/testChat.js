const API_BASE_URL = "http://localhost:3001";

async function testServerEndpoint(endpoint, method = "GET", body = null) {
  const options = {
    method,
    headers: {
      "Content-Type": "application/json",
    },
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, options);

    // Try to parse JSON, but handle non-JSON responses
    let data;
    const contentType = response.headers.get("content-type");

    if (contentType && contentType.includes("application/json")) {
      try {
        data = await response.json();
      } catch (parseError) {
        data = {
          error: "Failed to parse JSON response",
          rawResponse: await response.text(),
        };
      }
    } else {
      data = { text: await response.text() };
    }

    return {
      success: response.ok,
      status: response.status,
      data,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      status: 0,
    };
  }
}

async function testBunServer() {
  console.log("🧪 Testing Bun API Server...\n");

  // Test 0: Server Connectivity Check
  console.log("Test 0: Server Connectivity Check");
  console.log(`Checking if server is running at ${API_BASE_URL}`);

  try {
    const response = await fetch(`${API_BASE_URL}/api/health`);
    if (response.ok) {
      console.log("✅ Server is running and accessible!");
    } else {
      console.log(`❌ Server responded with status: ${response.status}`);
    }
  } catch (error) {
    console.log("❌ Server is not running or not accessible!");
    console.log("Error:", error.message);
    console.log("\n💡 Make sure to start the server first:");
    console.log("   cd app && bun main.js");
    console.log("\nThen run this test again.\n");
    return;
  }

  console.log("\n" + "=".repeat(50) + "\n");

  // Test 1: Health Check
  console.log("Test 1: Health Check");
  console.log("GET /api/health");

  const healthResult = await testServerEndpoint("/api/health");

  if (healthResult.success) {
    console.log("✅ Health check passed!");
    console.log("Response:", JSON.stringify(healthResult.data, null, 2));
  } else {
    console.log(
      "❌ Health check failed:",
      healthResult.error || healthResult.data
    );
  }

  console.log("\n" + "=".repeat(50) + "\n");

  // Test 2: Chat API - Valid Message
  console.log("Test 2: Chat API with valid message");
  console.log("POST /api/chat");

  const chatMessage = {
    message: "Create a responsive navbar with Tailwind CSS",
  };

  const chatResult = await testServerEndpoint("/api/chat", "POST", chatMessage);

  if (chatResult.success) {
    console.log("✅ Chat API test passed!");
    console.log("Status:", chatResult.status);
    console.log("Response:", JSON.stringify(chatResult.data, null, 2));
  } else {
    console.log(
      "❌ Chat API test failed:",
      chatResult.error || chatResult.data
    );
  }

  console.log("\n" + "=".repeat(50) + "\n");

  // Test 3: Chat API - Empty Message (should fail)
  console.log("Test 3: Chat API with empty message (should fail)");
  console.log("POST /api/chat");

  const emptyMessage = {
    message: "",
  };

  const emptyResult = await testServerEndpoint(
    "/api/chat",
    "POST",
    emptyMessage
  );

  if (!emptyResult.success && emptyResult.status === 400) {
    console.log("✅ Correctly rejected empty message!");
    console.log("Status:", emptyResult.status);
    console.log("Response:", JSON.stringify(emptyResult.data, null, 2));
  } else {
    console.log("❌ Should have rejected empty message:", emptyResult);
  }

  console.log("\n" + "=".repeat(50) + "\n");

  // Test 4: Chat API - Missing Message (should fail)
  console.log("Test 4: Chat API with missing message (should fail)");
  console.log("POST /api/chat");

  const missingMessage = {};

  const missingResult = await testServerEndpoint(
    "/api/chat",
    "POST",
    missingMessage
  );

  if (!missingResult.success && missingResult.status === 400) {
    console.log("✅ Correctly rejected missing message!");
    console.log("Status:", missingResult.status);
    console.log("Response:", JSON.stringify(missingResult.data, null, 2));
  } else {
    console.log("❌ Should have rejected missing message:", missingResult);
  }

  console.log("\n" + "=".repeat(50) + "\n");

  // Test 5: Invalid Endpoint (should return 404)
  console.log("Test 5: Invalid endpoint (should return 404)");
  console.log("GET /api/invalid");

  const invalidResult = await testServerEndpoint("/api/invalid");

  if (!invalidResult.success && invalidResult.status === 404) {
    console.log("✅ Correctly returned 404 for invalid endpoint!");
    console.log("Status:", invalidResult.status);
    console.log("Response:", JSON.stringify(invalidResult.data, null, 2));
  } else {
    console.log("❌ Should have returned 404:", invalidResult);
  }

  console.log("\n" + "=".repeat(50) + "\n");

  // Test 6: Another Valid Chat Message
  console.log("Test 6: Another valid chat message");
  console.log("POST /api/chat");

  const anotherMessage = {
    message: "Build a modern dashboard layout with dark mode toggle",
  };

  const anotherResult = await testServerEndpoint(
    "/api/chat",
    "POST",
    anotherMessage
  );

  if (anotherResult.success) {
    console.log("✅ Second chat API test passed!");
    console.log("Status:", anotherResult.status);
    console.log("Response:", JSON.stringify(anotherResult.data, null, 2));
  } else {
    console.log(
      "❌ Second chat API test failed:",
      anotherResult.error || anotherResult.data
    );
  }

  console.log("\n🎉 Bun API Server testing completed!");
  console.log("\n📝 Make sure your server is running with: bun app/main.js");
}

// Run the tests
testBunServer().catch(console.error);
