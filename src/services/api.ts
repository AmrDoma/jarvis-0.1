import axios from "axios";
import type { Task, APIResponse } from "../types";
import { DEFAULT_N8N_WEBHOOK_URL } from "../config";

const API_TIMEOUT = 20000; // 20 seconds

class N8NService {
  private baseUrl: string;

  constructor() {
    // Load from localStorage or use default
    this.baseUrl =
      localStorage.getItem("n8nWebhookUrl") || DEFAULT_N8N_WEBHOOK_URL;
  }

  setWebhookUrl(url: string) {
    this.baseUrl = url;
    localStorage.setItem("n8nWebhookUrl", url);
  }

  getWebhookUrl(): string {
    return this.baseUrl;
  }

  // Add a new task via n8n workflow
  async addTask(taskText: string): Promise<APIResponse<Task>> {
    if (!this.baseUrl) {
      return {
        success: false,
        error: "n8n webhook URL not configured. Please set it in Settings.",
      };
    }

    try {
      // Your endpoint uses query parameter: /add-task?message=...
      const response = await axios.post(
        `${this.baseUrl}/add-task?message=${encodeURIComponent(taskText)}`,
        null, // No body needed since message is in query param
        { timeout: API_TIMEOUT }
      );

      // Transform the response to match our Task interface
      let taskData: any = response.data;

      // Extract the JSON from the nested structure
      if (taskData.content?.parts?.[0]?.text) {
        const responseText = taskData.content.parts[0].text;

        // Check if the response is "No new command"
        if (
          responseText.trim() === "No new command" ||
          responseText.toLowerCase().includes("no new command")
        ) {
          return {
            success: false,
            error:
              "Please enter a valid instruction or task. JARVIS needs a clear command to help you!",
          };
        }

        try {
          // Parse the text field which contains the JSON string
          taskData = JSON.parse(responseText);
          console.log("Parsed taskData:", taskData);
        } catch (e) {
          console.error("Failed to parse nested JSON:", e);
          return {
            success: false,
            error:
              "Unable to understand the command. Please try rephrasing your request.",
          };
        }
      } else if (typeof taskData === "string") {
        // Check for "No new command" in plain string response
        if (
          taskData.trim() === "No new command" ||
          taskData.toLowerCase().includes("no new command")
        ) {
          return {
            success: false,
            error:
              "Please enter a valid instruction or task. JARVIS needs a clear command to help you!",
          };
        }

        // Fallback: if the API returned a JSON string directly
        try {
          taskData = JSON.parse(taskData);
        } catch (e) {
          console.warn("Failed to parse response.data as JSON:", e);
        }
      }

      const due = taskData.due_timestamp || taskData.due_date || undefined;

      // Generate a proper ID if not provided
      const taskId = taskData.id
        ? taskData.id.toString()
        : taskData.row_number
        ? taskData.row_number.toString()
        : `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      const task: Task = {
        id: taskId,
        text: taskData.text || taskText,
        parsedCommand: taskData.parsed_command || taskData.parsedCommand || "",
        status: taskData.status || "pending",
        createdAt:
          taskData.created_at || taskData.createdAt || new Date().toISOString(),
        dueDate: due || undefined,
        priority: this.mapPriority(taskData.priority),
        reminderSent: false,
      };

      return {
        success: true,
        data: task,
        message: taskData.chat_response || "Task added successfully",
      };
    } catch (error: any) {
      console.error("Error adding task:", error);
      return {
        success: false,
        error:
          error.response?.data?.message ||
          error.message ||
          "Failed to add task",
      };
    }
  }

  // Helper to map priority from your format to ours
  private mapPriority(priority?: string): Task["priority"] {
    if (!priority) return "medium";
    if (priority === "normal") return "medium";
    if (priority === "high" || priority === "urgent") return "high";
    if (priority === "low") return "low";
    return "medium";
  }

  // Fetch all tasks
  async getTasks(): Promise<APIResponse<Task[]>> {
    if (!this.baseUrl) {
      return {
        success: false,
        error: "n8n webhook URL not configured",
      };
    }

    try {
      const response = await axios.get(`${this.baseUrl}/tasks`, {
        timeout: API_TIMEOUT,
      });

      // Your endpoint returns an array directly, not wrapped in {tasks: [...]}
      const rawTasks = Array.isArray(response.data) ? response.data : [];

      // Transform to match our Task interface
      const tasks: Task[] = rawTasks.map((item: any) => ({
        id:
          item.id?.toString() ||
          item.row_number?.toString() ||
          Date.now().toString(),
        text: item.text || "",
        parsedCommand: item.parsed_command || "",
        status: item.status || "pending",
        createdAt: item.created_at || new Date().toISOString(),
        dueDate: item.due_date || undefined,
        priority: this.mapPriority(item.priority),
        reminderSent: false,
      }));

      return {
        success: true,
        data: tasks,
      };
    } catch (error: any) {
      console.error("Error fetching tasks:", error);
      return {
        success: false,
        error:
          error.response?.data?.message ||
          error.message ||
          "Failed to fetch tasks",
        data: [], // Return empty array as fallback
      };
    }
  }

  // Update task status
  async updateTaskStatus(
    taskId: string,
    status: Task["status"]
  ): Promise<APIResponse<Task>> {
    if (!this.baseUrl) {
      return {
        success: false,
        error: "n8n webhook URL not configured",
      };
    }

    try {
      const response = await axios.post(
        `${this.baseUrl}/update-task`,
        {
          id: taskId,
          status: status,
        },
        { timeout: API_TIMEOUT }
      );

      return {
        success: true,
        data: response.data.task,
        message: `Task status updated to ${status}`,
      };
    } catch (error: any) {
      console.error("Error updating task:", error);
      return {
        success: false,
        error:
          error.response?.data?.message ||
          error.message ||
          "Failed to update task",
      };
    }
  }

  // Delete a task
  async deleteTask(taskId: string): Promise<APIResponse<void>> {
    if (!this.baseUrl) {
      return {
        success: false,
        error: "n8n webhook URL not configured",
      };
    }

    try {
      await axios.delete(`${this.baseUrl}/delete-task`, {
        data: { taskId },
        timeout: API_TIMEOUT,
      });

      return {
        success: true,
        message: "Task deleted successfully",
      };
    } catch (error: any) {
      console.error("Error deleting task:", error);
      return {
        success: false,
        error:
          error.response?.data?.message ||
          error.message ||
          "Failed to delete task",
      };
    }
  }

  // Test webhook connection
  async testConnection(): Promise<APIResponse<void>> {
    if (!this.baseUrl) {
      return {
        success: false,
        error: "n8n webhook URL not configured",
      };
    }

    try {
      // Test by fetching tasks since there's no /ping endpoint
      await axios.get(`${this.baseUrl}/tasks`, { timeout: 5000 });

      return {
        success: true,
        message: "Connection successful!",
      };
    } catch (error: any) {
      console.error("Connection test failed:", error);
      return {
        success: false,
        error: error.message || "Connection failed",
      };
    }
  }
}

export const n8nService = new N8NService();
