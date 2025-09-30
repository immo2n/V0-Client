import { v0 } from "v0-sdk";
import dotenv from "dotenv";

dotenv.config();

export async function createChat(intialMessage) {
  if (!intialMessage) {
    throw new Error("Initial message is required");
  }

  console.log("Creating chat with message:", intialMessage);

  const chat = await v0.chats.create({
    message: intialMessage,
  });

  console.log("Chat created:", chat);

  // Format the chat object for UI consumption
  return formatChatResponse(chat);
}

function formatChatResponse(chat) {
  // Extract only the essential data needed for the UI
  const formattedResponse = {
    // Chat metadata
    chatId: chat.id,
    title: chat.title || chat.name,
    createdAt: chat.createdAt,
    webUrl: chat.webUrl,

    // Demo URL for iframe viewer
    demoUrl: chat.latestVersion?.demoUrl || null,

    // Generated files for file viewer
    files:
      chat.latestVersion?.files?.map((file) => ({
        name: file.name,
        content: file.content,
        type: file.name.split(".").pop() || "unknown",
        size: file.content?.length || 0,
      })) || [],

    // Chat messages for chat interface
    messages:
      chat.messages?.map((msg) => ({
        id: msg.id,
        role: msg.role,
        content: msg.content,
        createdAt: msg.createdAt,
      })) || [],

    // Status information
    status: chat.latestVersion?.status || "unknown",
    isCompleted: chat.latestVersion?.status === "completed",
  };

  return formattedResponse;
}

export async function sendMessage(chatId, message) {
  if (!chatId || !message) {
    throw new Error("Chat ID and message are required");
  }

  console.log("Sending message:", message, "to chat:", chatId);

  const response = await v0.chats.sendMessage({
    chatId: chatId,
    message: message,
  });

  console.log("Message sent:", response);

  return response;
}
