// Default n8n webhook configuration
export const DEFAULT_N8N_WEBHOOK_URL =
  "https://amrdoma.app.n8n.cloud/webhook-test";

// Google Sheets configuration
export const GOOGLE_SHEET_ID = "1lVtA7MFdNQRk0VBQf1hbshQIQOgNF0mKdeTM4QXbglM";
export const GOOGLE_SHEET_URL = `https://docs.google.com/spreadsheets/d/${GOOGLE_SHEET_ID}/edit`;

// API endpoints
export const API_ENDPOINTS = {
  ADD_TASK: "/add-task",
  GET_TASKS: "/tasks",
  UPDATE_TASK: "/update-task",
  DELETE_TASK: "/delete-task",
} as const;

// Storage keys
export const STORAGE_KEYS = {
  WEBHOOK_URL: "n8nWebhookUrl",
  DISCORD_ENABLED: "discordEnabled",
  TASKS: "jarvis-tasks",
} as const;
