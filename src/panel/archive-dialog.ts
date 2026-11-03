import { mountButton } from "@openchamber/sdk/ui";
import { mountTooltip } from "./help-button.js";

export function mountArchiveDialog(
  root: HTMLElement,
  callbacks: { current: () => object | null; canStart: () => boolean; start: () => void },
) {
  const dialog = document.createElement("dialog");
  const heading = document.createElement("h2");
  heading.id = "archive-all-title";
  heading.textContent = "Archive all completed changes?";
  dialog.setAttribute("aria-labelledby", heading.id);
  const description = document.createElement("p");
  description.id = "archive-all-description";
  description.textContent =
    "This creates a new session and sends a prompt to archive completed changes in this project. Unfinished changes will be skipped. The board stays open; use refresh to see updates.";
  dialog.setAttribute("aria-describedby", description.id);
  const actions = document.createElement("div");
  actions.className = "archive-actions";
  const cancelRoot = document.createElement("span");
  const startRoot = document.createElement("span");
  let origin: object | null = null;
  let opener: HTMLElement | null = null;
  function close() {
    dialog.close();
    origin = null;
    if (opener?.isConnected) opener.focus();
    opener = null;
  }
  const cancel = mountButton(cancelRoot, {
    label: "Cancel",
    variant: "secondary",
    size: "sm",
    onClick: close,
  });
  const start = mountButton(startRoot, {
    label: "Start archiving",
    size: "sm",
    onClick: () => {
      if (!origin || origin !== callbacks.current() || !callbacks.canStart()) return;
      close();
      callbacks.start();
    },
  });
  dialog.addEventListener("cancel", (event) => {
    event.preventDefault();
    close();
  });
  actions.append(cancelRoot, startRoot);
  const tooltips = [
    mountTooltip(
      cancelRoot.querySelector("button")!,
      "Close this confirmation without creating a session or sending a prompt.",
    ),
    mountTooltip(
      startRoot.querySelector("button")!,
      "Create a new session and submit the completed-only archive prompt; skip unfinished changes.",
    ),
  ];
  dialog.append(heading, description, actions);
  root.append(dialog);
  return {
    open() {
      if (!callbacks.canStart()) return;
      origin = callbacks.current();
      opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      dialog.showModal();
      cancelRoot.querySelector("button")?.focus();
    },
    update() {
      tooltips.forEach((tooltip) => tooltip.update());
      if (dialog.open && origin !== callbacks.current()) close();
      start.update({ disabled: !callbacks.canStart() });
    },
    dispose() {
      tooltips.forEach((tooltip) => tooltip.dispose());
      cancel.dispose();
      start.dispose();
      dialog.remove();
    },
  };
}
