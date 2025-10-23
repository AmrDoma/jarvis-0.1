import { Trash2, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import type { Task } from "../types";
import { StatusDropdown } from "./StatusDropdown";

interface TaskListProps {
  tasks: Task[];
  onUpdateStatus: (taskId: string, status: Task["status"]) => void;
  onDeleteTask: (taskId: string) => void;
  limit?: number;
  showAll?: boolean;
}

export function TaskList({
  tasks,
  onUpdateStatus,
  onDeleteTask,
  limit,
  showAll = false,
}: TaskListProps) {
  const getPriorityClass = (priority?: Task["priority"]) => {
    return priority ? `priority-${priority}` : "";
  };

  const activeTasks = tasks.filter((t) => t.status !== "done");
  const completedTasks = tasks.filter((t) => t.status === "done");

  // Apply limit if specified and not showing all
  const displayedActiveTasks =
    !showAll && limit ? activeTasks.slice(0, limit) : activeTasks;
  const displayedCompletedTasks =
    !showAll && limit ? completedTasks.slice(0, limit) : completedTasks;

  if (tasks.length === 0) {
    return (
      <div className="empty-state">
        <AlertCircle size={48} />
        <p>No tasks yet. Start by adding your first task!</p>
      </div>
    );
  }

  return (
    <div className="task-list-container">
      {activeTasks.length > 0 && (
        <div className="task-section">
          <h2 className="section-title">Active Tasks ({activeTasks.length})</h2>
          <div className="task-list">
            {displayedActiveTasks
              .slice()
              .sort((a, b) => {
                const ta = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
                const tb = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;
                return ta - tb;
              })
              .map((task) => (
                <div
                  key={task.id}
                  className={`task-item ${getPriorityClass(task.priority)}`}
                >
                  <div className="task-content">
                    <StatusDropdown
                      currentStatus={task.status}
                      taskId={task.id}
                      onUpdateStatus={onUpdateStatus}
                    />
                    <div className="task-details">
                      <p className="task-text">{task.parsedCommand}</p>
                      {task.parsedCommand && (
                        <p className="parsed-command">
                          <span className="label">Message:</span> {task.text}
                        </p>
                      )}
                      <div className="task-meta">
                        <span className="timestamp">
                          {format(new Date(task.createdAt), "MMM d, h:mm a")}
                        </span>
                        {task.dueDate && (
                          <span className="due-date">
                            Due:{" "}
                            {format(new Date(task.dueDate), "MMM d, h:mm a")}
                          </span>
                        )}
                        {task.priority && (
                          <span className={`priority-badge ${task.priority}`}>
                            {task.priority}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <button
                    className="delete-button"
                    onClick={() => onDeleteTask(task.id)}
                    title="Delete task"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
          </div>
        </div>
      )}

      {completedTasks.length > 0 && (
        <div className="task-section completed-section">
          <h2 className="section-title">Completed ({completedTasks.length})</h2>
          <div className="task-list">
            {displayedCompletedTasks
              .slice()
              .sort((a, b) => {
                const ta = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
                const tb = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;
                return ta - tb;
              })
              .map((task) => (
                <div key={task.id} className="task-item completed">
                  <div className="task-content">
                    <StatusDropdown
                      currentStatus={task.status}
                      taskId={task.id}
                      onUpdateStatus={onUpdateStatus}
                    />
                    <div className="task-details">
                      <p className="task-text">
                        {task.parsedCommand || task.text}
                      </p>
                      {task.parsedCommand && (
                        <p className="parsed-command">
                          <span className="label">Message:</span> {task.text}
                        </p>
                      )}
                      <span className="timestamp">
                        {format(new Date(task.createdAt), "MMM d, h:mm a")}
                      </span>
                    </div>
                  </div>
                  <button
                    className="delete-button"
                    onClick={() => onDeleteTask(task.id)}
                    title="Delete task"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
