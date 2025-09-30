import { useState } from "react";
import ChatInterface from "./components/ChatInterface";
import FileViewer from "./components/FileViewer";
import DemoViewer from "./components/DemoViewer";
import "./styles/App.css";

function App() {
  const [currentChat, setCurrentChat] = useState(null);
  const [activeTab, setActiveTab] = useState("chat");
  const [currentChatId, setCurrentChatId] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);

  const handleChatCreated = (chatData) => {
    setCurrentChat(chatData);
    setCurrentChatId(chatData.chatId);
    setActiveTab("demo"); // Switch to demo tab when chat is created
  };

  const handleChatStateUpdate = (newChatId, newMessages) => {
    setCurrentChatId(newChatId);
    setChatMessages(newMessages);
  };

  const handleNewChat = () => {
    setCurrentChatId(null);
    setChatMessages([]);
    setCurrentChat(null);
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>🚀 ScaleBuild Website Builder</h1>
        <p>Create, view, and interact with AI-generated websites</p>
      </header>

      <div className="app-content">
        <div className="sidebar">
          <nav className="tab-nav">
            <button
              className={`tab-button ${activeTab === "chat" ? "active" : ""}`}
              onClick={() => setActiveTab("chat")}
            >
              💬 Chat
            </button>
            <button
              className={`tab-button ${activeTab === "files" ? "active" : ""}`}
              onClick={() => setActiveTab("files")}
              disabled={!currentChat}
            >
              📁 Files
            </button>
            <button
              className={`tab-button ${activeTab === "demo" ? "active" : ""}`}
              onClick={() => setActiveTab("demo")}
              disabled={!currentChat}
            >
              🖥️ Demo
            </button>
          </nav>
        </div>

        <div className="main-content">
          {activeTab === "chat" && (
            <ChatInterface
              onChatCreated={handleChatCreated}
              onChatStateUpdate={handleChatStateUpdate}
              onNewChat={handleNewChat}
              currentChatId={currentChatId}
              initialMessages={chatMessages}
            />
          )}

          {activeTab === "files" && currentChat && (
            <FileViewer files={currentChat.files} />
          )}

          {activeTab === "demo" && currentChat && (
            <DemoViewer
              demoUrl={currentChat.demoUrl}
              title={currentChat.title}
            />
          )}

          {activeTab !== "chat" && !currentChat && (
            <div className="empty-state">
              <h3>No chat created yet</h3>
              <p>Start a conversation to view files and demo</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
