import { mountButton } from "@openchamber/sdk/ui";
import { mountTooltip } from "./help-button.js";
import { english, type UiText } from "./localization.js";

export function mountArchiveDialog(
  root: HTMLElement,
  callbacks: { current: () => object | null; canStart: () => boolean; start: () => void },
) {
  let text = english;
  const dialog = document.createElement("dialog");
  const heading = document.createElement("h2");
  heading.id = "archive-all-title";
  heading.textContent = text.archiveHeading;
  dialog.setAttribute("aria-labelledby", heading.id);
  const description = document.createElement("p");
  description.id = "archive-all-description";
  description.textContent = text.archiveWarning;
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
    label: text.cancel,
    variant: "secondary",
    size: "sm",
    onClick: close,
  });
  const start = mountButton(startRoot, {
    label: text.startArchiving,
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
    mountTooltip(cancelRoot.querySelector("button")!, text.archiveCancelDescription),
    mountTooltip(startRoot.querySelector("button")!, text.archiveStartDescription),
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
    update(next: UiText) {
      text = next;
      heading.textContent = text.archiveHeading;
      description.textContent = text.archiveWarning;
      cancel.update({ label: text.cancel });
      tooltips[0]!.update(text.archiveCancelDescription);
      tooltips[1]!.update(text.archiveStartDescription);
      if (dialog.open && origin !== callbacks.current()) close();
      start.update({ label: text.startArchiving, disabled: !callbacks.canStart() });
    },
    dispose() {
      tooltips.forEach((tooltip) => tooltip.dispose());
      cancel.dispose();
      start.dispose();
      dialog.remove();
    },
  };
}
