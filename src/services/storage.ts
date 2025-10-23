import type { Task } from "../types";

const STORAGE_KEYS = {
  TASKS: "jarvis-tasks",
  WEBHOOK_URL: "n8nWebhookUrl",
  DISCORD_ENABLED: "discordEnabled",
} as const;

export const storage = {
  // Tasks
  getTasks(): Task[] {
    try {
      const tasks = localStorage.getItem(STORAGE_KEYS.TASKS);
      return tasks ? JSON.parse(tasks) : [];
    } catch (error) {
      console.error("Error loading tasks from storage:", error);
      return [];
    }
  },

  saveTasks(tasks: Task[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
    } catch (error) {
      console.error("Error saving tasks to storage:", error);
    }
  },

  // Webhook URL
  getWebhookUrl(): string {
    return localStorage.getItem(STORAGE_KEYS.WEBHOOK_URL) || "";
  },

  setWebhookUrl(url: string): void {
    localStorage.setItem(STORAGE_KEYS.WEBHOOK_URL, url);
  },

  // Discord
  getDiscordEnabled(): boolean {
    return localStorage.getItem(STORAGE_KEYS.DISCORD_ENABLED) === "true";
  },

  setDiscordEnabled(enabled: boolean): void {
    localStorage.setItem(STORAGE_KEYS.DISCORD_ENABLED, enabled.toString());
  },

  // Clear all
  clearAll(): void {
    Object.values(STORAGE_KEYS).forEach((key) => {
      localStorage.removeItem(key);
    });
  },
};
