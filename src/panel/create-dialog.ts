import { mountButton, mountTextField } from "@openchamber/sdk/ui";
import { isChangeName } from "../model.js";
import { ServiceRequestError, type Client, type Scope } from "./client.js";
import { addButtonIcon } from "./button-icon.js";
import { mountTooltip } from "./help-button.js";
import { english, describeError, presentMessage, type UiText } from "./localization.js";

type Attempt = { scope: Scope; name: string; goal: string };
type Mode =
  | "editing"
  | "submitting"
  | "reconciling"
  | "read-failed"
  | "observed-existing"
  | "confirmed-success";

export function mountCreateDialog(
  client: Pick<Client, "create" | "list">,
  callbacks: {
    current: () => Scope | null;
    created: (scope: Scope) => void;
    inspect: (scope: Scope, name: string) => void;
  },
) {
  let text = english;
  const dialog = document.createElement("dialog");
  const form = document.createElement("form");
  const heading = document.createElement("h2");
  heading.id = "new-change-title";
  dialog.setAttribute("aria-labelledby", heading.id);
  const nameRoot = document.createElement("div");
  const goalRoot = document.createElement("div");
  let name = "";
  let goal = "";
  let mode: Mode = "editing";
  let attempt: Attempt | null = null;
  let draftScope: Scope | null = null;
  let messageText: string | ((text: UiText) => string) = "";
  let nameInvalid = false;
  let goalInvalid = false;
  let generation = 0;
  let disposed = false;
  const nameField = mountTextField(nameRoot, {
    label: text.changeName,
    value: "",
    placeholder: text.namePlaceholder,
    mono: true,
    onChange: (value) => {
      name = value;
      nameInvalid = false;
      nameField.update({ value, error: undefined });
    },
  });
  const goalField = mountTextField(goalRoot, {
    label: text.goal,
    value: "",
    placeholder: text.goalPlaceholder,
    multiline: true,
    rows: 4,
    onChange: (value) => {
      goal = value;
      goalInvalid = false;
      goalField.update({ value, error: undefined });
    },
  });
  const message = document.createElement("p");
  message.setAttribute("role", "status");
  const actions = document.createElement("div");
  actions.className = "create-actions";
  const cancelRoot = document.createElement("span");
  const submitRoot = document.createElement("span");
  const retryRoot = document.createElement("span");
  const inspectRoot = document.createElement("span");
  const forgetRoot = document.createElement("span");
  const dismiss = mountButton(cancelRoot, {
    label: text.cancel,
    variant: "secondary",
    size: "sm",
    onClick: () => dialog.close(),
  });
  const submit = mountButton(submitRoot, {
    label: text.createSubmit,
    variant: "default",
    size: "sm",
    onClick: () => void submitChange(),
  });
  addButtonIcon(submitRoot, "create");
  const retry = mountButton(retryRoot, {
    label: text.retryRead,
    variant: "secondary",
    size: "sm",
    onClick: () => void reconcile(),
  });
  const inspect = mountButton(inspectRoot, {
    label: text.inspectChange,
    variant: "secondary",
    size: "sm",
    onClick: () => {
      if (!attempt || !sameContext(attempt.scope)) return;
      callbacks.inspect(attempt.scope, attempt.name);
      dialog.close();
    },
  });
  const forget = mountButton(forgetRoot, {
    label: text.dismissAttempt,
    variant: "ghost",
    size: "sm",
    onClick: () => {
      if (mode === "submitting" || mode === "reconciling") return;
      const contextChanged = !!attempt && !sameContext(attempt.scope);
      if (mode === "read-failed" && !contextChanged) return;
      const originalAttempt = attempt;
      attempt = null;
      if (contextChanged) {
        discardDraft();
        if (mode === "read-failed") {
          attempt = originalAttempt;
          messageText = (text) => text.createReadRequired;
        } else mode = "editing";
        dialog.close();
        return;
      }
      draftScope = callbacks.current();
      mode = "editing";
      messageText = "";
      paint();
    },
  });
  actions.append(cancelRoot, forgetRoot, retryRoot, inspectRoot, submitRoot);
  const tooltips = [
    mountTooltip(cancelRoot.querySelector("button")!, text.createCloseDescription),
    mountTooltip(submitRoot.querySelector("button")!, text.createSubmitDescription),
    mountTooltip(retryRoot.querySelector("button")!, text.createRetryDescription),
    mountTooltip(inspectRoot.querySelector("button")!, text.inspectDescription),
    mountTooltip(forgetRoot.querySelector("button")!, text.dismissDescription),
  ];
  form.append(heading, nameRoot, goalRoot, message, actions);
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    void submitChange();
  });
  dialog.append(form);
  document.body.append(dialog);

  const sameContext = (scope: Scope) => {
    const current = callbacks.current();
    return (
      current?.directory === scope.directory &&
      current.root === scope.root &&
      current.planning === scope.planning
    );
  };
  function discardDraft() {
    draftScope = null;
    name = "";
    goal = "";
    messageText = "";
    nameInvalid = goalInvalid = false;
    nameField.update({ value: "", error: undefined });
    goalField.update({ value: "", error: undefined });
  }
  dialog.addEventListener("close", () => {
    if (!attempt && draftScope && !sameContext(draftScope)) discardDraft();
  });
  function paint() {
    const descriptions = [
      text.createCloseDescription,
      text.createSubmitDescription,
      text.createRetryDescription,
      text.inspectDescription,
      text.dismissDescription,
    ];
    tooltips.forEach((tooltip, index) => tooltip.update(descriptions[index]));
    if (disposed) return;
    heading.textContent = text.newChange;
    nameField.update({
      label: text.changeName,
      placeholder: text.namePlaceholder,
      error: nameInvalid ? text.invalidName : undefined,
    });
    goalField.update({
      label: text.goal,
      placeholder: text.goalPlaceholder,
      error: goalInvalid ? text.requiredGoal : undefined,
    });
    dismiss.update({ label: text.cancel });
    submit.update({ label: text.createSubmit });
    retry.update({ label: text.retryRead });
    inspect.update({ label: text.inspectChange });
    forget.update({ label: text.dismissAttempt });
    const current = callbacks.current();
    const origin = attempt?.scope ?? draftScope;
    const usable = origin ? sameContext(origin) : current !== null;
    const busy = mode === "submitting" || mode === "reconciling";
    nameField.update({ disabled: busy || mode === "read-failed" || mode === "observed-existing" });
    goalField.update({ disabled: busy || mode === "read-failed" || mode === "observed-existing" });
    submit.update({ disabled: mode !== "editing" || !usable, loading: mode === "submitting" });
    retryRoot.hidden = mode !== "read-failed";
    retry.update({ disabled: mode !== "read-failed", loading: mode === "reconciling" });
    inspectRoot.hidden = mode !== "observed-existing";
    inspect.update({ disabled: mode !== "observed-existing" || !usable });
    forgetRoot.hidden = !attempt || busy || (mode === "read-failed" && usable);
    forget.update({ disabled: busy });
    const contextNotice =
      origin && !usable ? text.originalContext(origin.directory, origin.root) : "";
    message.textContent =
      (typeof messageText === "string" ? messageText : messageText(text)) + contextNotice;
    message.hidden = !message.textContent;
  }
  async function reconcile() {
    if (!attempt || (mode !== "reconciling" && mode !== "read-failed")) return;
    const original = attempt;
    const currentGeneration = ++generation;
    mode = "reconciling";
    messageText = (text) => text.createChecking;
    paint();
    try {
      const listing = await client.list(
        original.scope.directory,
        original.scope.root,
        original.scope.planning,
      );
      if (disposed || currentGeneration !== generation) return;
      if (listing.changes.some((entry) => entry.id === original.name)) {
        mode = "observed-existing";
        messageText = (text) => text.createObserved;
      } else {
        mode = "editing";
        messageText = (text) => text.createAbsent;
      }
    } catch (caught) {
      if (disposed || currentGeneration !== generation) return;
      mode = "read-failed";
      const diagnostic =
        caught instanceof Error ? describeError(caught) : ({ key: "originalReadFailed" } as const);
      messageText = (text) => text.createReadFailed(presentMessage(text, diagnostic));
    }
    paint();
  }
  async function submitChange() {
    if (mode !== "editing" || disposed) return;
    const current = callbacks.current();
    if (
      !current ||
      (draftScope && !sameContext(draftScope)) ||
      (attempt && !sameContext(attempt.scope))
    ) {
      paint();
      return;
    }
    const submittedName = name.trim();
    const submittedGoal = goal.trim();
    if (!isChangeName(submittedName)) {
      nameInvalid = true;
      paint();
      return;
    }
    if (!submittedGoal) {
      goalInvalid = true;
      paint();
      return;
    }
    attempt = { scope: current, name: submittedName, goal: submittedGoal };
    const original = attempt;
    const currentGeneration = ++generation;
    mode = "submitting";
    messageText = "";
    paint();
    try {
      await client.create(original.scope, original.name, original.goal);
      if (disposed || currentGeneration !== generation) return;
      mode = "confirmed-success";
      messageText = (text) => text.changeCreated;
      paint();
      if (sameContext(original.scope)) callbacks.created(original.scope);
      if (dialog.open) dialog.close();
      attempt = null;
      draftScope = null;
      name = "";
      goal = "";
      nameField.update({ value: "" });
      goalField.update({ value: "" });
      mode = "editing";
      messageText = "";
      paint();
    } catch (caught) {
      if (disposed || currentGeneration !== generation) return;
      if (
        caught instanceof ServiceRequestError &&
        !caught.outcome &&
        caught.code !== "CLI_TIMEOUT"
      ) {
        mode = "editing";
        const diagnostic = describeError(caught);
        messageText = (text) => presentMessage(text, diagnostic);
        paint();
        return;
      }
      mode = "reconciling";
      await reconcile();
    }
  }
  return {
    open() {
      if (!disposed && !dialog.open) {
        if (!attempt && draftScope && !sameContext(draftScope)) discardDraft();
        draftScope ??= callbacks.current();
        paint();
        dialog.showModal();
      }
    },
    update(next: UiText) {
      text = next;
      paint();
    },
    dispose() {
      tooltips.forEach((tooltip) => tooltip.dispose());
      disposed = true;
      generation++;
      dismiss.dispose();
      submit.dispose();
      retry.dispose();
      inspect.dispose();
      forget.dispose();
      nameField.dispose();
      goalField.dispose();
      if (dialog.open) dialog.close();
      dialog.remove();
    },
  };
}
