import { mountButton, mountMenu } from "@openchamber/sdk/ui";
import type { Stage } from "../model.js";
import { workflowLabel } from "./workflow.js";
import { mountTooltip } from "./help-button.js";
import { english, type UiText } from "./localization.js";

export type PrimaryIntent = "primary" | "worktree";
type State = {
  text?: UiText;
  id: string;
  stage: Stage;
  disabled: boolean;
  pending?: boolean;
  action: (intent: PrimaryIntent) => void;
};

export function mountWorkflowMenu<Workflow extends string>(
  root: HTMLElement,
  items: { id: Workflow; label: string; description: string }[],
) {
  root.classList.add("workflow-menu");
  type MenuState = {
    text?: UiText;
    labels?: Record<Workflow, { label: string; description: string }>;
    disabled: boolean;
    action: (workflow: Workflow) => void;
  };
  let currentItems = items;
  let state: MenuState | null = null;
  let opened: MenuState | null = null;
  const menu = mountMenu(root, {
    label: "Workflows",
    size: "sm",
    variant: "secondary",
    items: [],
    onSelect: (id) => {
      const captured = opened;
      opened = null;
      const item = currentItems.find((item) => item.id === id);
      if (captured && !captured.disabled && !state?.disabled && item) captured.action(item.id);
    },
  });
  const trigger = root.querySelector("button")!;
  let pointer: { x: number; y: number } | null = null;
  const rememberPointer = (event: PointerEvent) => {
    pointer = { x: event.clientX, y: event.clientY };
  };
  const stationaryEntry = (event: PointerEvent) => {
    // Expanded rows must not let a stationary pointer override native keyboard navigation.
    if (
      event.target instanceof HTMLElement &&
      event.target.getAttribute("role") === "menuitem" &&
      pointer?.x === event.clientX &&
      pointer.y === event.clientY
    )
      event.stopPropagation();
  };
  document.addEventListener("pointermove", rememberPointer);
  root.addEventListener("pointerenter", stationaryEntry, true);
  // SDK 1.24.2 replaces its rows and exposes active state only through the mounted DOM.
  let describedActive: string | null = null;
  const descriptions = new MutationObserver(() => {
    const popup = root.querySelector<HTMLElement>('[role="menu"]');
    if (!popup) return;
    popup.querySelectorAll<HTMLElement>('[role="menuitem"]').forEach((row, index) => {
      const item = currentItems[index]!;
      let description = row.querySelector<HTMLElement>(".workflow-description");
      if (!description) {
        row.setAttribute("aria-label", item.label);
        description = document.createElement("span");
        description.className = "workflow-description";
        description.id = `${row.id}-outcome`;
        description.setAttribute("role", "tooltip");
        description.textContent = item.description;
        row.append(description);
      }
      if (row.dataset.active === "true") row.setAttribute("aria-describedby", description.id);
      else row.removeAttribute("aria-describedby");
    });
    const active = popup.querySelector<HTMLElement>('[data-active="true"]');
    if (active) popup.setAttribute("aria-describedby", `${active.id}-outcome`);
    else popup.removeAttribute("aria-describedby");
    popup.style.maxHeight = `min(320px, calc(100vh - ${popup.getBoundingClientRect().top + 8}px))`;
    // Native highlighting scrolls before our inline description expands the row.
    if (active?.id !== describedActive) active?.scrollIntoView({ block: "nearest" });
    describedActive = active?.id ?? null;
  });
  descriptions.observe(root, {
    subtree: true,
    childList: true,
    attributes: true,
    attributeFilter: ["aria-activedescendant"],
  });
  const tooltip = mountTooltip(
    trigger,
    "Choose a workflow to prepare an editable, unsent prompt in the current chat.",
  );
  const capture = () => {
    if (trigger.getAttribute("aria-expanded") !== "true") opened = state;
  };
  trigger.addEventListener("click", capture, true);
  return {
    update(next: MenuState) {
      state = next;
      const text = next.text ?? english;
      currentItems = items.map((item) => ({ ...item, ...next.labels?.[item.id] }));
      const popup = root.querySelector<HTMLElement>('[role="menu"]');
      const scroll = popup?.scrollTop;
      menu.update({
        label: text.workflows,
        items: currentItems.map(({ id, label }) => ({ id, label, disabled: next.disabled })),
      });
      if (popup && scroll !== undefined) popup.scrollTop = scroll;
      trigger.disabled = next.disabled;
      tooltip.update(text.workflowsDescription);
    },
    dispose() {
      descriptions.disconnect();
      document.removeEventListener("pointermove", rememberPointer);
      root.removeEventListener("pointerenter", stationaryEntry, true);
      trigger.removeEventListener("click", capture, true);
      menu.dispose();
      tooltip.dispose();
      opened = state = null;
    },
  };
}

export function mountPrimaryAction(root: HTMLElement) {
  const buttonRoot = document.createElement("span");
  const menuRoot = document.createElement("span");
  root.append(buttonRoot, menuRoot);
  let state: State | null = null;
  let opened: State | null = null;
  const button = mountButton(buttonRoot, {
    label: workflowLabel("planning"),
    size: "sm",
    onClick: () => state?.action("primary"),
  });
  const menu = mountMenu(menuRoot, {
    label: "Apply",
    size: "sm",
    variant: "default",
    items: [],
    onSelect: (id) => {
      const captured = opened;
      opened = null;
      if (
        !captured ||
        captured.disabled ||
        state?.disabled ||
        captured.id !== state?.id ||
        captured.stage !== state?.stage ||
        (id === "worktree" && state?.pending)
      )
        return;
      captured.action(id === "worktree" ? "worktree" : "primary");
    },
  });
  const trigger = menuRoot.querySelector("button")!;
  const tooltip = mountTooltip(buttonRoot.querySelector("button")!, "");
  const menuTooltip = mountTooltip(
    trigger,
    "Choose an unsent current-chat draft or explicitly create a worktree and session and send the Apply prompt.",
  );
  const capture = () => {
    if (trigger.getAttribute("aria-expanded") !== "true") opened = state;
  };
  trigger.addEventListener("click", capture, true);
  return {
    update(next: State) {
      state = next;
      const text = next.text ?? english;
      tooltip.update(
        next.stage === "planning" ? text.continueDescription : text.primaryArchiveDescription,
      );
      menuTooltip.update(text.applyDestinationDescription);
      const apply = next.stage === "ready" || next.stage === "progress";
      buttonRoot.hidden = apply;
      menuRoot.hidden = !apply;
      button.update({ label: text.workflowActions[next.stage], disabled: next.disabled });
      menu.update({
        label: text.workflowActions.ready,
        items: [
          { id: "current", label: text.currentChat, disabled: next.disabled },
          { id: "worktree", label: text.newWorktree, disabled: next.disabled || next.pending },
        ],
      });
      trigger.disabled = next.disabled;
    },
    dispose() {
      trigger.removeEventListener("click", capture, true);
      menu.dispose();
      button.dispose();
      tooltip.dispose();
      menuTooltip.dispose();
      buttonRoot.remove();
      menuRoot.remove();
      opened = state = null;
    },
  };
}
