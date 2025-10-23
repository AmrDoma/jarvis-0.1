import { useState, useEffect } from "react";
import { Settings as SettingsIcon, RefreshCw, Brain } from "lucide-react";
import "./App.css";
import { ChatInput } from "./components/ChatInput";
import { TaskList } from "./components/TaskList";
import { Settings } from "./components/Settings";
import { TaskModal } from "./components/TaskModal";
import { ChatHistory } from "./components/ChatHistory";
import { n8nService } from "./services/api";
import type { Task, Message } from "./types";

function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  // Load tasks from localStorage on mount and fetch from n8n
  useEffect(() => {
    const initializeTasks = async () => {
      // First, load from localStorage for instant display
      const savedTasks = localStorage.getItem("jarvis-tasks");
      if (savedTasks) {
        try {
          setTasks(JSON.parse(savedTasks));
        } catch (e) {
          console.error("Failed to parse saved tasks", e);
        }
      }

      // Load messages from localStorage
      const savedMessages = localStorage.getItem("jarvis-messages");
      if (savedMessages) {
        try {
          setMessages(JSON.parse(savedMessages));
        } catch (e) {
          console.error("Failed to parse saved messages", e);
        }
      }

      // Check if webhook URL is configured
      if (!n8nService.getWebhookUrl()) {
        setIsSettingsOpen(true);
        setIsInitialLoading(false);
        return;
      }

      // Then fetch fresh data from n8n
      setIsRefreshing(true);
      const result = await n8nService.getTasks();

      if (result.success && result.data) {
        setTasks(result.data);
      }
      setIsRefreshing(false);
      setIsInitialLoading(false);
    };

    initializeTasks();
  }, []);

  // Save tasks to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("jarvis-tasks", JSON.stringify(tasks));
  }, [tasks]);

  // Save messages to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("jarvis-messages", JSON.stringify(messages));
  }, [messages]);

  // Show notification helper
  const showNotification = (message: string, type: "success" | "error") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  // Handle new message from user
  const handleSendMessage = async (message: string) => {
    setIsLoading(true);

    // Add user message to history
    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      text: message,
      sender: "user",
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMessage]);

    try {
      // Send to n8n
      const result = await n8nService.addTask(message);

      if (result.success && result.data) {
        // Parse the nested response structure
        let taskData: any = result.data;
        let chatResponse = "";

        // Check if response has the nested structure
        if ("content" in taskData && taskData.content?.parts?.[0]?.text) {
          try {
            const parsedData = JSON.parse(taskData.content.parts[0].text);
            chatResponse = parsedData.chat_response || "";

            // Create task from parsed data
            const newTask: Task = {
              id: `task-${Date.now()}`,
              text: parsedData.text || message,
              parsedCommand: parsedData.parsed_command,
              status: parsedData.status || "pending",
              createdAt: new Date().toISOString(),
              dueDate: parsedData.due_timestamp,
              priority:
                parsedData.priority === "normal"
                  ? "medium"
                  : parsedData.priority,
            };

            // Add the task
            setTasks((prev) => [newTask, ...prev]);
          } catch (parseError) {
            console.error("Failed to parse response:", parseError);
            showNotification("Failed to parse task response", "error");
            setIsLoading(false);
            return;
          }
        } else {
          // Fallback to old format
          setTasks((prev) => [result.data!, ...prev]);
          chatResponse = result.message || "Task added successfully!";
        }

        // Add JARVIS response to message history
        if (chatResponse) {
          const jarvisMessage: Message = {
            id: `msg-${Date.now()}-jarvis`,
            text: chatResponse,
            sender: "jarvis",
            timestamp: new Date().toISOString(),
          };
          setMessages((prev) => [...prev, jarvisMessage]);
          showNotification(chatResponse, "success");
        }
      } else {
        // Add error message to chat history
        const errorMessage: Message = {
          id: `msg-${Date.now()}-jarvis`,
          text: result.error || "Failed to add task",
          sender: "jarvis",
          timestamp: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, errorMessage]);
        showNotification(result.error || "Failed to add task", "error");
      }
    } catch (error) {
      console.error("Error adding task:", error);
      const errorMessage: Message = {
        id: `msg-${Date.now()}-jarvis`,
        text: "An unexpected error occurred. Please try again.",
        sender: "jarvis",
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMessage]);
      showNotification("Failed to add task", "error");
    }

    setIsLoading(false);
  };

  // Refresh tasks from n8n
  const handleRefresh = async () => {
    setIsRefreshing(true);
    const result = await n8nService.getTasks();

    if (result.success && result.data) {
      setTasks(result.data);
      showNotification("Tasks refreshed!", "success");
    } else {
      showNotification(result.error || "Failed to refresh tasks", "error");
    }

    setIsRefreshing(false);
  };

  // Update task status
  const handleUpdateStatus = async (taskId: string, status: Task["status"]) => {
    // Update locally first
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status } : t))
    );

    // Sync with n8n
    const result = await n8nService.updateTaskStatus(taskId, status);

    if (result.success) {
      showNotification("Task updated!", "success");
    } else {
      showNotification(result.error || "Failed to update task", "error");
      // Revert on error by refreshing
      handleRefresh();
    }
  };

  // Delete task
  const handleDeleteTask = async (taskId: string) => {
    // Remove locally first
    setTasks((prev) => prev.filter((t) => t.id !== taskId));

    // Sync with n8n
    const result = await n8nService.deleteTask(taskId);

    if (result.success) {
      showNotification("Task deleted!", "success");
    } else {
      showNotification(result.error || "Failed to delete task", "error");
      // Revert on error by refreshing
      handleRefresh();
    }
  };

  return (
    <div className="app">
      {/* Header */}
      <header className="app-header">
        <div className="header-content">
          <div className="logo">
            <Brain size={32} className="logo-icon" />
            <h1>JARVIS</h1>
          </div>
          <div className="header-actions">
            <button
              className="icon-button"
              onClick={handleRefresh}
              disabled={isRefreshing || isLoading}
              title="Refresh tasks from n8n"
            >
              <RefreshCw className={isRefreshing ? "spinning" : ""} size={20} />
            </button>
            <button
              className="icon-button"
              onClick={() => setIsSettingsOpen(true)}
              disabled={isLoading}
              title="Settings"
            >
              <SettingsIcon size={20} />
            </button>
          </div>
        </div>
      </header>

      {/* Notification */}
      {notification && (
        <div className={`notification ${notification.type}`}>
          {notification.message}
        </div>
      )}

      {/* Main Content */}
      <main className="main-content">
        <div className="content-wrapper">
          {/* Loading State */}
          {isInitialLoading ? (
            <div className="loading-container">
              <div className="loading-spinner">
                <Brain size={48} className="pulse" />
              </div>
              <p className="loading-text">Initializing JARVIS...</p>
              <p className="loading-subtext">Loading your tasks from n8n</p>
            </div>
          ) : (
            <>
              {/* Task List - Show only 2 tasks */}
              <div className="tasks-preview">
                <TaskList
                  tasks={tasks}
                  onUpdateStatus={handleUpdateStatus}
                  onDeleteTask={handleDeleteTask}
                  limit={2}
                />
                {tasks.length > 2 && (
                  <button
                    className="read-more-button"
                    onClick={() => setIsTaskModalOpen(true)}
                  >
                    Read More ({tasks.length - 2} more tasks)
                  </button>
                )}
              </div>

              {/* Chat History */}
              <ChatHistory messages={messages} />

              {/* Chat Input */}
              <ChatInput
                onSendMessage={handleSendMessage}
                disabled={!n8nService.getWebhookUrl() || isLoading}
              />
            </>
          )}
        </div>
      </main>

      {/* Settings Modal */}
      {isSettingsOpen && <Settings onClose={() => setIsSettingsOpen(false)} />}

      {/* Task Modal */}
      {isTaskModalOpen && (
        <TaskModal
          tasks={tasks}
          onUpdateStatus={handleUpdateStatus}
          onDeleteTask={handleDeleteTask}
          onClose={() => setIsTaskModalOpen(false)}
        />
      )}
    </div>
  );
}

export default App;
