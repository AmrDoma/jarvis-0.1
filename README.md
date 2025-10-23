# 🤖 JARVIS - Your Personal AI Task Assistant

A beautiful, modern web application that serves as your personal AI assistant, powered by n8n workflows. JARVIS helps you manage tasks and reminders through natural language, with AI-powered command parsing and automated hourly check-ins.

![JARVIS Preview](https://img.shields.io/badge/Status-Active-success?style=for-the-badge)
![React](https://img.shields.io/badge/React-19.1-blue?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue?style=for-the-badge&logo=typescript)
![n8n](https://img.shields.io/badge/n8n-Integration-orange?style=for-the-badge)

## ✨ Features

- 🎯 **Natural Language Input** - Just type what you need in plain English
- 🤖 **AI-Powered** - Transforms natural sentences into actionable commands via n8n
- 📱 **Multiple Input Channels** - Web app and Discord integration
- ⏰ **Smart Reminders** - Hourly checks to keep you on track
- 🎨 **Beautiful UI** - Dark theme inspired by Iron Man's JARVIS
- 💾 **Persistent Storage** - Tasks saved locally with n8n sync
- 📊 **Task Management** - Track status (pending, in-progress, done)
- 🔄 **Real-time Sync** - Seamless integration with your n8n workflow

## 🚀 Quick Start

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- An n8n instance (free cloud or self-hosted)
- **Database** (pick the easiest):
  - 📊 **Google Sheets** - Simplest! No setup needed → [Quick Guide](./QUICKSTART-GOOGLE-SHEETS.md)
  - 🚀 **Supabase** - Free 500MB PostgreSQL with dashboard
  - 💾 **n8n Built-in** - Zero external dependencies

### Installation

1. **Clone and navigate to the project:**

   ```bash
   cd jarvis-0.1
   ```

2. **Install dependencies:**

   ```bash
   npm install axios date-fns lucide-react
   npm install
   ```

3. **Start the development server:**

   ```bash
   npm run dev
   ```

4. **Open your browser:**
   Navigate to `http://localhost:5173`

### First Time Setup

**→ New to this?** Start with Google Sheets (5 min setup):

- Read [QUICKSTART-GOOGLE-SHEETS.md](./QUICKSTART-GOOGLE-SHEETS.md)
- No database knowledge required!

**→ Want more power?** Use Supabase (free):

- See [SETUP.md](./SETUP.md) - Database section
- PostgreSQL with API included

## ⚙️ Configuration

### Setting up n8n Webhook

1. Click the **Settings** icon (⚙️) in the top right
2. Enter your n8n webhook base URL (e.g., `https://your-n8n-instance.com/webhook`)
3. Click **Test Connection** to verify
4. Save your settings

### Required n8n Endpoints

Your n8n workflow should expose these endpoints:

```
POST   /webhook/add-task      - Add a new task
GET    /webhook/tasks         - Fetch all tasks
POST   /webhook/update-task   - Update task status
POST   /webhook/delete-task   - Delete a task
GET    /webhook/ping          - Health check
```

### Example n8n Workflow Structure

```
1. Webhook Trigger
2. AI Agent Node (OpenAI/Claude) - Parse natural language
3. Data Transformation
4. Storage Node (choose one):
   - Google Sheets (simplest)
   - Supabase (recommended)
   - n8n built-in (easiest)
5. Discord Node (optional)
6. Response Node
```

### Storage Options

- **Google Sheets** - No setup, visual, perfect for beginners
- **Supabase** - Free cloud database (500MB), PostgreSQL power
- **n8n Built-in** - Zero setup, stored in workflow memory

## 📦 Project Structure

```
jarvis-0.1/
├── src/
│   ├── components/
│   │   ├── ChatInput.tsx      # Natural language input
│   │   ├── TaskList.tsx       # Task display & management
│   │   └── Settings.tsx       # Configuration panel
│   ├── services/
│   │   └── api.ts             # n8n API integration
│   ├── types.ts               # TypeScript interfaces
│   ├── App.tsx                # Main application
│   ├── App.css                # Component styles
│   ├── index.css              # Global styles
│   └── main.tsx               # Entry point
├── package.json
├── vite.config.ts
├── tsconfig.json
└── README.md
```

## 🎨 UI Components

### Task Input

- Type naturally: "Remind me to call John at 3pm tomorrow"
- Press Enter to send, Shift+Enter for new line
- Real-time feedback with loading states

### Task List

- **Active Tasks** - Pending and in-progress items
- **Completed Tasks** - Finished items (collapsed)
- Status indicators with icons
- Priority badges (high, medium, low)
- Due date display

### Settings Panel

- n8n webhook URL configuration
- Connection testing
- Discord integration toggle

## 🔧 API Integration

### Adding a Task

```typescript
const result = await n8nService.addTask("Schedule meeting tomorrow at 2pm");
// Sends POST to: /webhook/add-task
// Body: { text: "...", timestamp: "..." }
```

### Task Data Structure

```typescript
interface Task {
  id: string;
  text: string;
  parsedCommand?: string; // AI-parsed command
  status: "pending" | "in-progress" | "done";
  createdAt: string;
  dueDate?: string;
  reminderSent?: boolean;
  priority?: "low" | "medium" | "high";
}
```

## 🎯 Usage Examples

### Example Commands

- "Remind me to call Sarah tomorrow at 3pm"
- "Add task: finish the report by Friday"
- "Schedule meeting with team next Monday"
- "Don't forget to buy groceries today"
- "Set reminder for gym at 6am daily"

### Expected n8n Response

```json
{
  "task": {
    "id": "uuid",
    "text": "Call Sarah tomorrow at 3pm",
    "parsedCommand": "schedule_call('Sarah', '2025-10-24T15:00:00')",
    "status": "pending",
    "createdAt": "2025-10-23T10:00:00Z",
    "dueDate": "2025-10-24T15:00:00Z",
    "priority": "medium"
  }
}
```

## 🔌 Discord Integration

When Discord is enabled in settings:

1. Tasks can be added via Discord commands
2. n8n workflow handles both web and Discord inputs
3. Reminders sent to both channels
4. Status updates synced across platforms

## 🎨 Theming

The app features a dark, futuristic theme inspired by JARVIS from Iron Man:

- Deep blue/purple gradients
- Glowing accent colors (#60a5fa)
- Smooth animations
- Glassmorphic design elements

### Color Palette

```css
--bg-primary: #0a0e27
--bg-secondary: #1a1f3a
--accent-primary: #60a5fa
--accent-secondary: #818cf8
--success: #22c55e
--warning: #f59e0b
--error: #ef4444
```

## 🚀 Building for Production

```bash
# Build the app
npm run build

# Preview the build
npm run preview
```

The build output will be in the `dist/` directory.

## 📝 Development

### Run Development Server

```bash
npm run dev
```

### Lint Code

```bash
npm run lint
```

### Type Check

```bash
npm run build
```

## 🔐 Security Notes

- Store n8n webhook URLs securely
- Use HTTPS for production n8n instances
- Implement authentication in your n8n workflow
- Never commit API keys or secrets

## 🐛 Troubleshooting

### Connection Failed

- Verify n8n webhook URL is correct
- Check if n8n instance is running
- Ensure CORS is enabled on n8n

### Tasks Not Syncing

- Check browser console for errors
- Verify n8n workflow endpoints
- Test connection in Settings panel

### Styling Issues

- Clear browser cache
- Check if all dependencies installed
- Verify CSS imports in components

## 🤝 Contributing

Feel free to fork, improve, and submit pull requests!

## 📄 License

MIT License - feel free to use this for your own projects

## 🙏 Acknowledgments

- Built with React 19 + TypeScript
- Powered by Vite
- Icons by Lucide React
- Inspired by Iron Man's JARVIS

---

**Made with ❤️ for productivity enthusiasts**
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
globalIgnores(['dist']),
{
files: ['**/*.{ts,tsx}'],
extends: [
// Other configs...
// Enable lint rules for React
reactX.configs['recommended-typescript'],
// Enable lint rules for React DOM
reactDom.configs.recommended,
],
languageOptions: {
parserOptions: {
project: ['./tsconfig.node.json', './tsconfig.app.json'],
tsconfigRootDir: import.meta.dirname,
},
// other options...
},
},
])

```

```
