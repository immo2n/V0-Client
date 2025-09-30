import { createChat, sendMessage } from "./controller/chatController.js";
import dotenv from "dotenv";

dotenv.config();

const server = Bun.serve({
  port: 3001,
  async fetch(request) {
    const url = new URL(request.url);
    const method = request.method;

    // CORS headers
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    };

    // Handle preflight requests
    if (method === "OPTIONS") {
      return new Response(null, { status: 200, headers: corsHeaders });
    }

    try {
      // Health check
      if (url.pathname === "/api/health") {
        return new Response(
          JSON.stringify({
            status: "ok",
            timestamp: new Date().toISOString(),
            message: "Bun API Server is running!",
          }),
          {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      // Chat endpoint
      if (url.pathname === "/api/chat" && method === "POST") {
        const body = await request.json();
        const { message } = body;

        if (!message) {
          return new Response(
            JSON.stringify({ error: "Message is required" }),
            {
              status: 400,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        }

        try {
          let chat;

          // Check if we have a V0 API key, otherwise use demo mode
          if (process.env.V0_API_KEY) {
            chat = await createChat(message);
          } else {
            console.log("No V0 API key found!");
            process.exit(1);
          }

          return new Response(
            JSON.stringify({
              success: true,
              data: chat,
              timestamp: new Date().toISOString(),
            }),
            {
              status: 200,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        } catch (error) {
          console.error("Chat creation error:", error);
          return new Response(
            JSON.stringify({
              error: "Failed to create chat",
              details: error.message,
            }),
            {
              status: 500,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        }
      }

      // Send message endpoint
      if (url.pathname === "/api/chat/send" && method === "POST") {
        const body = await request.json();
        const { chatId, message } = body;

        if (!chatId || !message) {
          return new Response(
            JSON.stringify({ error: "Chat ID and message are required" }),
            {
              status: 400,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        }

        try {
          let response;

          // Check if we have a V0 API key, otherwise use demo mode
          if (process.env.V0_API_KEY) {
            response = await sendMessage(chatId, message);
          } else {
            console.log("No V0 API key found!");
            process.exit(1);
          }

          return new Response(
            JSON.stringify({
              success: true,
              data: response,
              timestamp: new Date().toISOString(),
            }),
            {
              status: 200,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        } catch (error) {
          console.error("Send message error:", error);
          return new Response(
            JSON.stringify({ error: "Failed to send message" }),
            {
              status: 500,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        }
      }

      // 404 Not Found
      return new Response(
        JSON.stringify({
          error: "Not Found",
          availableEndpoints: ["/api/health", "/api/chat"],
        }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    } catch (error) {
      console.error("Server error:", error);
      return new Response(JSON.stringify({ error: "Internal Server Error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  },
});

console.log(`🚀 Bun API Server running at http://localhost:${server.port}`);
console.log(`📊 Health check: http://localhost:${server.port}/api/health`);
console.log(`💬 Chat API: POST http://localhost:${server.port}/api/chat`);
console.log(
  `📝 Example: curl -X POST http://localhost:${server.port}/api/chat -H "Content-Type: application/json" -d '{"message":"Hello!"}'`
);
