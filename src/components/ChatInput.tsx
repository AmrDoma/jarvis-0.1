import { useState, useRef, useEffect } from "react";
import { Send, Loader } from "lucide-react";

interface ChatInputProps {
  onSendMessage: (message: string) => Promise<void>;
  disabled?: boolean;
}

export function ChatInput({ onSendMessage, disabled = false }: ChatInputProps) {
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    // Auto-focus on mount
    inputRef.current?.focus();
  }, []);

  // Compute the actual disabled state
  const isDisabled = disabled || isLoading;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const message = input.trim();
    if (!message || isDisabled) return;

    setIsLoading(true);
    setInput("");

    try {
      await onSendMessage(message);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Submit on Enter, but allow Shift+Enter for new lines
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form className="chat-input-container" onSubmit={handleSubmit}>
      <div className="input-wrapper">
        <textarea
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={
            disabled && !isLoading
              ? "Configure n8n webhook in settings first..."
              : "Tell Jarvis what you need... (e.g., 'Remind me to call John at 3pm tomorrow')"
          }
          disabled={isDisabled}
          rows={1}
          className="chat-input"
        />
        <button
          type="submit"
          disabled={!input.trim() || isDisabled}
          className="send-button"
          title="Send message"
        >
          {isLoading ? (
            <Loader className="spinner" size={20} />
          ) : (
            <Send size={20} />
          )}
        </button>
      </div>
      <p className="input-hint">
        {isLoading
          ? "🤖 JARVIS is processing your request..."
          : isDisabled && !isLoading
          ? "⚙️ Please configure your n8n webhook URL in settings"
          : "Press Enter to send, Shift+Enter for new line"}
      </p>
    </form>
  );
}
