import { User, Brain } from "lucide-react";
import { useEffect, useRef } from "react";
import type { Message } from "../types";
import { format } from "date-fns";

interface ChatHistoryProps {
  messages: Message[];
}

export function ChatHistory({ messages }: ChatHistoryProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="chat-history">
        <h2 className="chat-history-title">Conversation History</h2>
        <div className="empty-chat">
          <Brain size={48} className="empty-icon" />
          <p>No conversation yet. Start by sending a message to JARVIS!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-history">
      <h2 className="chat-history-title">Conversation History</h2>
      <div className="chat-messages">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`chat-message ${
              message.sender === "user" ? "user-message" : "jarvis-message"
            }`}
          >
            <div className="message-icon">
              {message.sender === "user" ? (
                <User size={20} />
              ) : (
                <Brain size={20} />
              )}
            </div>
            <div className="message-content">
              <div className="message-header">
                <span className="message-sender">
                  {message.sender === "user" ? "You" : "JARVIS"}
                </span>
                <span className="message-time">
                  {format(new Date(message.timestamp), "h:mm a")}
                </span>
              </div>
              <p className="message-text">{message.text}</p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}
