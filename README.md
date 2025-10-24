# JARVIS - Personal AI Assistant

A web app that lets you manage tasks using natural language. Tell JARVIS what you need to do, and it figures out the rest using AI through n8n workflows.

## What It Does

- Type tasks in plain English (no special syntax needed)
- AI parses your commands automatically
- Tracks task status and priorities
- Shows conversation history
- Syncs with n8n for workflow automation
- Sends Discord reminders every two hours and notifications upon task creation

## Getting Started

### You Need

- Node.js 18+
- n8n instance (cloud or self-hosted)
- Google Sheets (easiest) or any form of DB
- Demo sheet: https://docs.google.com/spreadsheets/d/1lVtA7MFdNQRk0VBQf1hbshQIQOgNF0mKdeTM4QXbglM/edit?usp=sharing
- Demo n8n:<img width="1217" height="762" alt="image" src="https://github.com/user-attachments/assets/db11d462-6fd8-4d6f-ab37-eec81a62a29c" />


### Install

```bash
npm install
npm run dev
```

Opens at `http://localhost:5173`

### Setup

1. Click the settings gear icon
2. Enter your n8n webhook URL (or use mine): 'https://amrdoma.app.n8n.cloud/webhook`
4. Test the connection
5. Start adding tasks

## How It Works

### Your n8n Workflow Needs These Endpoints

```
GET  /tasks          - Returns all tasks
POST /add-task       - Creates new task (message as query param)
POST /update-task    - Updates task status (id + status in body)
DELETE /delete-task  - Deletes a task (id in body)
```

### Task Structure

```typescript
{
  id: string
  text: string              // Original message
  parsedCommand: string     // AI-extracted command
  status: "pending" | "in-progress" | "done"
  createdAt: string
  dueDate?: string
  priority?: "low" | "medium" | "high"
}
```

### Example Request/Response

**Adding a task:**

```
POST /add-task?message=remind me to drink water

Response:
{
  "content": {
    "parts": [{
      "text": "{
        \"text\": \"remind me to drink water\",
        \"parsed_command\": \"drink water\",
        \"status\": \"pending\",
        \"due_timestamp\": \"2023-10-26T23:59:59Z\",
        \"priority\": \"normal\",
        \"chat_response\": \"Got it. I'll remind you to drink water.\"
      }"
    }]
  }
}
```

## Features

### Task Preview

- Shows 2 most recent tasks
- "Read More" button opens modal with all tasks
- Click status icon to change: pending → in progress → done (and back)

### Chat History

- Scrollable conversation between you and JARVIS
- Auto-scrolls to latest message

### Error Handling

- "No new command" responses show helpful error
- Invalid commands get clear feedback
- Chat history includes error messages

## Project Layout

```
src/
├── components/
│   ├── ChatInput.tsx         # Message input
│   ├── ChatHistory.tsx       # Conversation display
│   ├── TaskList.tsx          # Task cards
│   ├── TaskModal.tsx         # All tasks view
│   ├── StatusDropdown.tsx    # Status selector
│   └── Settings.tsx          # Config panel
├── services/
│   └── api.ts                # n8n integration
├── types.ts                  # TypeScript definitions
└── App.tsx                   # Main component
```

## Usage

Just type naturally:

- "remind me to call mom tomorrow at 3"
- "buy groceries before 6pm"
- "meeting with team on Friday"

JARVIS parses it, creates the task, and responds in the chat.

### Changing Status

Click the status icon on any task to see options:

- ○ Pending
- ⏰ In Progress
- ✓ Done

Done tasks can go back to any status.

## Database Setup

**Easiest: Google Sheets**

- No server setup needed


## Notes

- Tasks stored in localStorage + synced with n8n
- Messages saved locally
- Webhook URL required before using

## Build

```bash
npm run build
```

Output in `dist/` folder.

---

Built with React + TypeScript + Vite

