import { useState, useRef, useEffect } from "react";
import { CheckCircle2, Circle, Clock, ChevronDown } from "lucide-react";
import type { Task } from "../types";

interface StatusDropdownProps {
  currentStatus: Task["status"];
  taskId: string;
  onUpdateStatus: (taskId: string, status: Task["status"]) => void;
}

export function StatusDropdown({
  currentStatus,
  taskId,
  onUpdateStatus,
}: StatusDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const statuses: Array<{ value: Task["status"]; label: string; icon: any }> = [
    { value: "pending", label: "Pending", icon: Circle },
    { value: "in-progress", label: "In Progress", icon: Clock },
    { value: "done", label: "Done", icon: CheckCircle2 },
  ];

  const currentStatusData = statuses.find((s) => s.value === currentStatus);
  const CurrentIcon = currentStatusData?.icon || Circle;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleStatusChange = (newStatus: Task["status"]) => {
    onUpdateStatus(taskId, newStatus);
    setIsOpen(false);
  };

  return (
    <div className="status-dropdown" ref={dropdownRef}>
      <button
        className={`status-button ${currentStatus}`}
        onClick={() => setIsOpen(!isOpen)}
        title="Change status"
      >
        <CurrentIcon className={`task-icon ${currentStatus}`} size={20} />
        <ChevronDown size={14} className="dropdown-arrow" />
      </button>

      {isOpen && (
        <div className="status-dropdown-menu">
          {statuses.map((status) => {
            const Icon = status.icon;
            return (
              <button
                key={status.value}
                className={`status-option ${
                  status.value === currentStatus ? "active" : ""
                }`}
                onClick={() => handleStatusChange(status.value)}
              >
                <Icon className={`task-icon ${status.value}`} size={18} />
                <span>{status.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
