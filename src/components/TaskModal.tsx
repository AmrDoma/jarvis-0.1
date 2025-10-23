import { X } from "lucide-react";
import { TaskList } from "./TaskList";
import type { Task } from "../types";

interface TaskModalProps {
  tasks: Task[];
  onUpdateStatus: (taskId: string, status: Task["status"]) => void;
  onDeleteTask: (taskId: string) => void;
  onClose: () => void;
}

export function TaskModal({
  tasks,
  onUpdateStatus,
  onDeleteTask,
  onClose,
}: TaskModalProps) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>All Tasks</h2>
          <button className="close-button" onClick={onClose}>
            <X size={24} />
          </button>
        </div>
        <div className="modal-body">
          <TaskList
            tasks={tasks}
            onUpdateStatus={onUpdateStatus}
            onDeleteTask={onDeleteTask}
            showAll={true}
          />
        </div>
      </div>
    </div>
  );
}
