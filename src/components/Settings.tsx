import { useState } from "react";
import {
  Settings as SettingsIcon,
  X,
  Check,
  Loader,
  MessageSquare,
} from "lucide-react";
import { n8nService } from "../services/api";

interface SettingsProps {
  onClose: () => void;
}

export function Settings({ onClose }: SettingsProps) {
  const [webhookUrl, setWebhookUrl] = useState(n8nService.getWebhookUrl());
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);
  const [discordEnabled, setDiscordEnabled] = useState(
    localStorage.getItem("discordEnabled") === "true"
  );

  const handleSave = () => {
    n8nService.setWebhookUrl(webhookUrl);
    localStorage.setItem("discordEnabled", discordEnabled.toString());
    onClose();
  };

  const handleTest = async () => {
    setIsTesting(true);
    setTestResult(null);

    // Save URL first
    n8nService.setWebhookUrl(webhookUrl);

    const result = await n8nService.testConnection();
    setTestResult({
      success: result.success,
      message: result.message || result.error || "Unknown error",
    });
    setIsTesting(false);
  };

  return (
    <div className="settings-overlay" onClick={onClose}>
      <div className="settings-panel" onClick={(e) => e.stopPropagation()}>
        <div className="settings-header">
          <div className="header-title">
            <SettingsIcon size={24} />
            <h2>Settings</h2>
          </div>
          <button className="close-button" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div className="settings-content">
          <div className="setting-group">
            <label htmlFor="webhook-url">
              <strong>n8n Webhook URL</strong>
              <span className="label-hint">Base URL for your n8n workflow</span>
            </label>
            <input
              id="webhook-url"
              type="text"
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              placeholder="https://amrdoma.app.n8n.cloud/webhook-test"
              className="settings-input"
            />
            <button
              onClick={handleTest}
              disabled={!webhookUrl || isTesting}
              className="test-button"
            >
              {isTesting ? (
                <>
                  <Loader className="spinner" size={16} />
                  Testing...
                </>
              ) : (
                "Test Connection"
              )}
            </button>
            {testResult && (
              <div
                className={`test-result ${
                  testResult.success ? "success" : "error"
                }`}
              >
                {testResult.message}
              </div>
            )}
          </div>

          <div className="setting-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={discordEnabled}
                onChange={(e) => setDiscordEnabled(e.target.checked)}
              />
              <MessageSquare size={16} />
              <span>Enable Discord Integration</span>
            </label>
            <p className="setting-description">
              When enabled, tasks can also be added via Discord through your n8n
              workflow.
            </p>
          </div>

          <div className="setting-group">
            <h3>About</h3>
            <p className="about-text">
              <strong>Jarvis</strong> - Your Personal AI Task Assistant
            </p>
            <p className="about-text small">
              Version 0.1 | Powered by n8n & AI
            </p>
          </div>
        </div>

        <div className="settings-footer">
          <button className="button secondary" onClick={onClose}>
            Cancel
          </button>
          <button className="button primary" onClick={handleSave}>
            <Check size={16} />
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
}
