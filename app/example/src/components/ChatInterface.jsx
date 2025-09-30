import { useState, useEffect } from "react";
import { Send, Loader2, MessageCircle, Plus } from "lucide-react";
import "../styles/ChatInterface.css";

const API_BASE_URL = "http://localhost:3001";

function ChatInterface({
  onChatCreated,
  onChatStateUpdate,
  onNewChat,
  currentChatId: propCurrentChatId,
  initialMessages,
}) {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState(initialMessages || []);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentChatId, setCurrentChatId] = useState(propCurrentChatId);

  // Sync props with local state
  useEffect(() => {
    setCurrentChatId(propCurrentChatId);
  }, [propCurrentChatId]);

  useEffect(() => {
    setMessages(initialMessages || []);
  }, [initialMessages]);

  // No automatic state sync to avoid infinite loops

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      role: "user",
      content: message.trim(),
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setMessage("");
    setIsLoading(true);
    setError(null);

    try {
      let endpoint, requestBody;

      if (currentChatId) {
        // Follow-up message to existing chat
        endpoint = `${API_BASE_URL}/api/chat/send`;
        requestBody = {
          chatId: currentChatId,
          message: message.trim(),
        };
      } else {
        // Initial chat creation
        endpoint = `${API_BASE_URL}/api/chat`;
        requestBody = {
          message: message.trim(),
        };
      }

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to send message");
      }

      if (data.success && data.data) {
        if (!currentChatId) {
          // First message - chat created
          setCurrentChatId(data.data.chatId);

          const assistantMessage = {
            id: Date.now() + 1,
            role: "assistant",
            content: `Created: ${data.data.title}`,
            timestamp: new Date().toISOString(),
            chatData: data.data,
          };

          setMessages((prev) => [...prev, assistantMessage]);
          onChatCreated(data.data);

          // Update parent with new chat state
          if (onChatStateUpdate) {
            onChatStateUpdate(data.data.chatId, [
              ...messages,
              assistantMessage,
            ]);
          }
        } else {
          // Follow-up message - update existing chat data
          const assistantMessage = {
            id: Date.now() + 1,
            role: "assistant",
            content: data.data.content || data.data.text || "Message received",
            timestamp: new Date().toISOString(),
          };

          setMessages((prev) => [...prev, assistantMessage]);

          // Update parent with new messages
          if (onChatStateUpdate) {
            onChatStateUpdate(currentChatId, [...messages, assistantMessage]);
          }

          // Update chat data if provided - format the response properly
          if (data.data.files || data.data.demoUrl || data.data.latestVersion) {
            // Format the response to match the expected structure
            const formattedResponse = {
              chatId: data.data.id || data.data.chatId,
              title: data.data.title || data.data.name,
              createdAt: data.data.createdAt,
              webUrl: data.data.webUrl,
              demoUrl: data.data.latestVersion?.demoUrl || data.data.demoUrl,
              files: data.data.latestVersion?.files || data.data.files || [],
              messages: data.data.messages || [],
              status: data.data.latestVersion?.status || "completed",
              isCompleted: true,
            };

            onChatCreated(formattedResponse);
          }
        }
      }
    } catch (err) {
      console.error("Chat error:", err);
      setError(err.message);

      // Add error message to chat
      const errorMessage = {
        id: Date.now() + 1,
        role: "assistant",
        content: `Error: ${err.message}`,
        timestamp: new Date().toISOString(),
        isError: true,
      };

      setMessages((prev) => [...prev, errorMessage]);

      // Update parent with error message
      if (onChatStateUpdate) {
        onChatStateUpdate(currentChatId, [...messages, errorMessage]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const startNewChat = () => {
    if (onNewChat) {
      onNewChat();
    }
    setError(null);
    setMessage("");
  };

  // Function to detect and format thinking content
  const formatThinkingContent = (content) => {
    const thinkingRegex = /<Thinking>(.*?)<\/Thinking>/gs;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = thinkingRegex.exec(content)) !== null) {
      // Add content before thinking
      if (match.index > lastIndex) {
        parts.push({
          type: "text",
          content: content.slice(lastIndex, match.index),
        });
      }

      // Add thinking content
      parts.push({
        type: "thinking",
        content: match[1].trim(),
      });

      lastIndex = match.index + match[0].length;
    }

    // Add remaining content
    if (lastIndex < content.length) {
      parts.push({
        type: "text",
        content: content.slice(lastIndex),
      });
    }

    return parts.length > 0 ? parts : [{ type: "text", content }];
  };

  return (
    <div className="chat-interface">
      <div className="chat-header">
        <div className="header-content">
          <h2>
            <MessageCircle size={24} />
            Chat with scalebuild
          </h2>
          <p>
            Describe what you want to build and Scalebuild will create it for
            you
          </p>
        </div>
        {currentChatId && (
          <button onClick={startNewChat} className="new-chat-button">
            <Plus size={16} />
            New Chat
          </button>
        )}
      </div>

      <div className="chat-messages">
        {messages.length === 0 && (
          <div className="empty-chat">
            <MessageCircle size={48} />
            <h3>Start a conversation</h3>
            <p>
              {currentChatId
                ? "Continue the conversation by asking for modifications or improvements"
                : 'Try asking for a component like "Create a responsive navbar" or "Build a login form"'}
            </p>
          </div>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`message ${msg.role} ${msg.isError ? "error" : ""}`}
          >
            <div className="message-content">
              <div className="message-header">
                <span className="message-role">
                  {msg.role === "user"
                    ? "👤 You"
                    : msg.isError
                    ? "❌ Error"
                    : "🤖 V0"}
                </span>
                <span className="message-time">
                  {new Date(msg.timestamp).toLocaleTimeString()}
                </span>
              </div>
              <div className="message-text">
                {formatThinkingContent(msg.content).map((part, index) =>
                  part.type === "thinking" ? (
                    <div key={index} className="thinking-section">
                      <div className="thinking-header">
                        <span className="thinking-icon">🧠</span>
                        <span className="thinking-label">Thinking</span>
                      </div>
                      <div className="thinking-content">{part.content}</div>
                    </div>
                  ) : (
                    <span key={index}>{part.content}</span>
                  )
                )}
              </div>
              {msg.chatData && (
                <div className="chat-success">
                  <p>✅ Chat created successfully!</p>
                  <p>📁 {msg.chatData.files?.length || 0} files generated</p>
                  <p>🖥️ Demo available</p>
                </div>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="message assistant loading">
            <div className="message-content">
              <div className="message-header">
                <span className="message-role">🤖 Scalebuild</span>
              </div>
              <div className="loading-message">
                <Loader2 className="animate-spin" size={16} />
                Creating your component...
              </div>
            </div>
          </div>
        )}
      </div>

      <form onSubmit={sendMessage} className="chat-input">
        <div className="input-container">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Describe what you want to build..."
            disabled={isLoading}
            className="message-input"
          />
          <button
            type="submit"
            disabled={!message.trim() || isLoading}
            className="send-button"
          >
            <Send size={20} />
          </button>
        </div>
        {error && <div className="error-message">⚠️ {error}</div>}
      </form>
    </div>
  );
}

export default ChatInterface;
