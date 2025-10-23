export interface Task {
  id: string;
  text: string;
  parsedCommand?: string;
  status: "pending" | "in-progress" | "done";
  createdAt: string;
  dueDate?: string;
  reminderSent?: boolean;
  priority?: "low" | "medium" | "high";
}

export interface Message {
  id: string;
  text: string;
  sender: "user" | "jarvis";
  timestamp: string;
}

export interface Config {
  n8nWebhookUrl: string;
  discordEnabled: boolean;
  reminderInterval: number; // in minutes
}

export interface APIResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}
