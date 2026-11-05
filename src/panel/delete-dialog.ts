import { mountButton } from "@openchamber/sdk/ui";
import { ServiceRequestError, type Client, type Scope } from "./client.js";
import { addButtonIcon } from "./button-icon.js";
import { mountTooltip } from "./help-button.js";
import {
  english,
  describeError,
  presentMessage,
  type UiText,
  type LocalMessage,
} from "./localization.js";

type Target = { scope: Scope; epoch: number; selection: number; name: string };

export function mountDeleteDialog(
  root: HTMLElement,
  client: Pick<Client, "delete" | "list">,
  callbacks: {
    current: () => Target | null;
    removed: (target: Target) => void;
  },
) {
  let text = english;
  let messageText: LocalMessage | string = "";
  const dialog = document.createElement("dialog");
  const heading = document.createElement("h2");
  heading.id = "delete-change-title";
  dialog.setAttribute("aria-labelledby", heading.id);
  const description = document.createElement("p");
  const message = document.createElement("p");
  message.setAttribute("role", "status");
  const actions = document.createElement("div");
  actions.className = "delete-actions";
  const cancelRoot = document.createElement("span");
  const retryRoot = document.createElement("span");
  const deleteRoot = document.createElement("span");
  let target: Target | null = null;
  let mode: "confirming" | "deleting" | "reconciling" | "unresolved" | "present" = "confirming";
  let disposed = false;
  const unresolved = new Set<string>();
  const key = (attempt: Target) =>
    JSON.stringify([
      attempt.scope.directory,
      attempt.scope.root,
      attempt.scope.planning,
      attempt.name,
    ]);
  const matches = (attempt: Target) => {
    const current = callbacks.current();
    return (
      current?.scope === attempt.scope &&
      current.epoch === attempt.epoch &&
      current.selection === attempt.selection &&
      current.name === attempt.name
    );
  };
  function close() {
    dialog.close();
    target = null;
    mode = "confirming";
    messageText = "";
  }
  const cancel = mountButton(cancelRoot, {
    label: text.cancel,
    variant: "secondary",
    size: "sm",
    onClick: () => {
      if (mode === "confirming" || mode === "present") close();
    },
  });
  const retry = mountButton(retryRoot, {
    label: text.retryRead,
    variant: "secondary",
    size: "sm",
    onClick: () => {
      if (target && mode === "unresolved") void reconcile(target);
    },
  });
  const confirm = mountButton(deleteRoot, {
    label: text.delete,
    variant: "destructive",
    size: "sm",
    onClick: () => {
      if (target && mode === "confirming" && matches(target)) void remove(target);
    },
  });
  addButtonIcon(deleteRoot, "delete");
  actions.append(cancelRoot, retryRoot, deleteRoot);
  const tooltips = [
    mountTooltip(cancelRoot.querySelector("button")!, text.deleteCloseDescription),
    mountTooltip(retryRoot.querySelector("button")!, text.deleteRetryDescription),
    mountTooltip(deleteRoot.querySelector("button")!, text.deleteSubmitDescription),
  ];
  dialog.append(heading, description, message, actions);
  root.append(dialog);
  function display() {
    const descriptions = [
      text.deleteCloseDescription,
      text.deleteRetryDescription,
      text.deleteSubmitDescription,
    ];
    tooltips.forEach((tooltip, index) => tooltip.update(descriptions[index]));
    if (target) {
      heading.textContent = text.deleteHeading(target.name);
      description.textContent = text.deleteWarning(target.name);
    }
    message.textContent = presentMessage(text, messageText);
    message.hidden = !message.textContent;
    retryRoot.hidden = mode !== "unresolved";
    deleteRoot.hidden = mode !== "confirming" && mode !== "deleting";
    cancel.update({
      disabled: mode === "deleting" || mode === "reconciling" || mode === "unresolved",
      label: mode === "present" ? text.close : text.cancel,
    });
    retry.update({ label: text.retryRead });
    confirm.update({
      label: text.delete,
      disabled: mode !== "confirming",
      loading: mode === "deleting",
    });
  }
  dialog.addEventListener("cancel", (event) => {
    if (mode === "deleting" || mode === "reconciling" || mode === "unresolved")
      event.preventDefault();
  });
  dialog.addEventListener("close", () => {
    if (mode !== "deleting" && mode !== "reconciling") {
      target = null;
      mode = "confirming";
      messageText = "";
    }
  });
  async function reconcile(attempt: Target) {
    if (matches(attempt) && target === attempt) {
      mode = "reconciling";
      messageText = { key: "deleteChecking" };
      display();
    }
    try {
      const listing = await client.list(
        attempt.scope.directory,
        attempt.scope.root,
        attempt.scope.planning,
      );
      if (disposed || !matches(attempt) || target !== attempt) return;
      unresolved.delete(key(attempt));
      if (!listing.changes.some((item) => item.id === attempt.name)) {
        close();
        callbacks.removed(attempt);
      } else {
        mode = "present";
        messageText = { key: "deletePresent" };
        display();
      }
    } catch {
      if (disposed || !matches(attempt) || target !== attempt) return;
      unresolved.add(key(attempt));
      mode = "unresolved";
      messageText = { key: "deleteUnresolved" };
      display();
    }
  }
  async function remove(attempt: Target) {
    mode = "deleting";
    messageText = "";
    display();
    try {
      await client.delete(attempt.scope, attempt.name);
      if (disposed || !matches(attempt) || target !== attempt) return;
      unresolved.delete(key(attempt));
      close();
      callbacks.removed(attempt);
    } catch (caught) {
      if (disposed) return;
      if (
        caught instanceof ServiceRequestError &&
        caught.outcome !== "unknown" &&
        caught.code !== "CHANGE_UNAVAILABLE"
      ) {
        if (!matches(attempt) || target !== attempt) return;
        mode = "present";
        messageText = describeError(caught);
        display();
      } else {
        // A lost response or missing target is resolved against a new original-context listing.
        await reconcile(attempt);
      }
    }
  }
  return {
    open(attempt: Target) {
      if (dialog.open || disposed || !matches(attempt)) return;
      target = attempt;
      mode = unresolved.has(key(attempt)) ? "unresolved" : "confirming";
      messageText = mode === "unresolved" ? { key: "deleteUnresolved" } : "";
      display();
      dialog.showModal();
      cancelRoot.querySelector("button")?.focus();
    },
    update(next: UiText) {
      text = next;
      if (target && !matches(target)) {
        if (mode === "deleting" || mode === "reconciling" || mode === "unresolved")
          unresolved.add(key(target));
        dialog.close();
        target = null;
      }
      display();
    },
    dispose() {
      tooltips.forEach((tooltip) => tooltip.dispose());
      disposed = true;
      dialog.close();
      cancel.dispose();
      retry.dispose();
      confirm.dispose();
      dialog.remove();
    },
  };
}
