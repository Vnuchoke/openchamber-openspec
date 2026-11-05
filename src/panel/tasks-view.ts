import { mountButton, mountProgress } from "@openchamber/sdk/ui";
import type { Task } from "../contracts.js";
import type { ReadState } from "./resources.js";
import { mountTooltip } from "./help-button.js";
import { english, errorMessage, type UiText } from "./localization.js";

export function mountTasksView(root: HTMLElement, retryRead: () => void) {
  root.className = "tasks-view";
  const summary = document.createElement("p");
  summary.className = "content-status";
  const progressRoot = document.createElement("div");
  const progress = mountProgress(progressRoot, { value: 0, label: "Task completion" });
  const issue = document.createElement("p");
  issue.className = "notice error";
  const retryRoot = document.createElement("span");
  const retry = mountButton(retryRoot, {
    label: "Retry tasks",
    variant: "secondary",
    size: "sm",
    onClick: retryRead,
  });
  const list = document.createElement("ol");
  const tooltip = mountTooltip(
    retryRoot.querySelector("button")!,
    "Retry reading tasks; do not change tasks or repeat any write.",
  );
  list.className = "task-rows";
  root.append(summary, progressRoot, issue, retryRoot, list);
  const rows = new Map<string, { row: HTMLLIElement; mark: HTMLElement; label: HTMLElement }>();
  function clear() {
    tooltip.update();
    rows.clear();
    list.replaceChildren();
  }
  return {
    update(
      state: ReadState<Task[]> | null,
      retryable = true,
      emptyMessage = "",
      text: UiText = english,
    ) {
      tooltip.update(text.retryTasksDescription);
      retry.update({ label: text.retryTasks });
      const tasks = state?.value ?? [];
      const completed = tasks.filter((task) => task.done).length;
      summary.textContent =
        tasks.length || state?.error || !retryable
          ? ""
          : state?.pending
            ? text.loadingTasks
            : emptyMessage || text.noTrackedTasks;
      summary.hidden = !summary.textContent;
      progressRoot.hidden = !tasks.length;
      progress.update({
        value: tasks.length ? Math.round((completed / tasks.length) * 100) : 0,
        label: tasks.length ? text.tasks(completed, tasks.length) : text.taskCompletion,
      });
      issue.textContent = retryable && state?.error ? errorMessage(state.error, text) : "";
      issue.hidden = !issue.textContent;
      retryRoot.hidden = !state?.error || !retryable;
      const ids = new Set(tasks.map((task) => task.id));
      for (const [id, row] of rows)
        if (!ids.has(id)) {
          row.row.remove();
          rows.delete(id);
        }
      tasks.forEach((task, index) => {
        let item = rows.get(task.id);
        if (!item) {
          const row = document.createElement("li");
          row.className = "task-row";
          const mark = document.createElement("span");
          mark.className = "task-indicator";
          mark.setAttribute("role", "img");
          const label = document.createElement("span");
          label.className = "task-title";
          row.append(mark, label);
          item = { row, mark, label };
          rows.set(task.id, item);
        }
        item.row.classList.toggle("done", task.done);
        item.mark.textContent = task.done ? "✓" : "○";
        item.mark.setAttribute("aria-label", task.done ? text.taskComplete : text.taskPending);
        item.label.textContent = task.description;
        if (list.children[index] !== item.row)
          list.insertBefore(item.row, list.children[index] ?? null);
      });
    },
    reset: clear,
    dispose() {
      tooltip.dispose();
      progress.dispose();
      retry.dispose();
      clear();
      root.replaceChildren();
    },
  };
}
