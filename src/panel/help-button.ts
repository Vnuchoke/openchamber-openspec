import { mountButton } from "@openchamber/sdk/ui";
import { english } from "./localization.js";

let tooltipId = 0;
let dismissTooltip: (() => void) | null = null;

export function mountTooltip(button: HTMLButtonElement, text: string) {
  const id = `button-outcome-${++tooltipId}`;
  let tooltip: HTMLElement | null = null;
  const usable = () =>
    button.isConnected &&
    !button.disabled &&
    button.checkVisibility() &&
    !Array.from(document.querySelectorAll<HTMLElement>('.workflow-menu [role="menu"]')).some(
      (menu) => menu.checkVisibility(),
    );
  let observer: MutationObserver | null = null;
  function hide() {
    if (dismissTooltip === hide) {
      dismissTooltip = null;
    }
    document.removeEventListener("keydown", escape);
    document.removeEventListener("pointerdown", hide, true);
    window.removeEventListener("resize", hide);
    window.removeEventListener("scroll", hide, true);
    observer?.disconnect();
    observer = null;
    tooltip?.remove();
    tooltip = null;
    const ids = (button.getAttribute("aria-describedby") ?? "")
      .split(/\s+/)
      .filter((item) => item && item !== id);
    if (ids.length) button.setAttribute("aria-describedby", ids.join(" "));
    else button.removeAttribute("aria-describedby");
  }
  function show() {
    if (tooltip || !usable()) return;
    dismissTooltip?.();
    dismissTooltip = hide;
    tooltip = document.createElement("div");
    tooltip.id = id;
    tooltip.className = "button-tooltip";
    tooltip.setAttribute("role", "tooltip");
    tooltip.textContent = text;
    (button.closest("dialog") ?? document.body).append(tooltip);
    button.setAttribute(
      "aria-describedby",
      [button.getAttribute("aria-describedby"), id].filter(Boolean).join(" "),
    );
    const anchor = button.getBoundingClientRect();
    const box = tooltip.getBoundingClientRect();
    tooltip.style.left = `${Math.max(4, Math.min(anchor.left, innerWidth - box.width - 4))}px`;
    // Prefer above the control so descriptions do not cover the next wrapped action row.
    const top = anchor.top - box.height >= 4 ? anchor.top - box.height : anchor.bottom;
    tooltip.style.top = `${Math.max(4, Math.min(top, innerHeight - box.height - 4))}px`;
    // Observe only while visible, so owner updates/removal cannot leave an orphan description.
    observer = new MutationObserver(() => {
      if (!usable()) hide();
    });
    observer.observe(document.body, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: ["hidden", "disabled", "open", "style", "class"],
    });
    document.addEventListener("keydown", escape);
    document.addEventListener("pointerdown", hide, true);
    window.addEventListener("resize", hide);
    window.addEventListener("scroll", hide, true);
  }
  const escape = (event: KeyboardEvent) => {
    if (event.key === "Escape") hide();
  };
  button.addEventListener("pointermove", show);
  button.addEventListener("pointerleave", hide);
  button.addEventListener("click", hide, true);
  return {
    update(next = text) {
      if (next !== text || !usable()) hide();
      text = next;
    },
    dispose() {
      hide();
      button.removeEventListener("pointermove", show);
      button.removeEventListener("pointerleave", hide);
      button.removeEventListener("click", hide, true);
    },
  };
}

export function mountHelpButton(root: HTMLElement, onClick: () => void) {
  root.className = "help-control";
  const handle = mountButton(root, { label: "", variant: "ghost", size: "sm", onClick });
  const button = root.querySelector("button")!;
  button.setAttribute("aria-label", english.help);
  const tooltip = mountTooltip(button, english.helpDescription);
  const icon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  icon.setAttribute("viewBox", "0 0 24 24");
  icon.setAttribute("width", "16");
  icon.setAttribute("height", "16");
  icon.setAttribute("aria-hidden", "true");
  const outline = document.createElementNS("http://www.w3.org/2000/svg", "circle");
  outline.setAttribute("cx", "12");
  outline.setAttribute("cy", "12");
  outline.setAttribute("r", "9");
  outline.setAttribute("fill", "none");
  outline.setAttribute("stroke", "currentColor");
  outline.setAttribute("stroke-width", "1.8");
  const hook = document.createElementNS("http://www.w3.org/2000/svg", "path");
  hook.setAttribute("d", "M9.6 9.5a2.5 2.5 0 1 1 4.4 1.6c-.6.7-2 1.1-2 2.4");
  hook.setAttribute("fill", "none");
  hook.setAttribute("stroke", "currentColor");
  hook.setAttribute("stroke-width", "1.8");
  hook.setAttribute("stroke-linecap", "round");
  const dot = document.createElementNS("http://www.w3.org/2000/svg", "circle");
  dot.setAttribute("cx", "12");
  dot.setAttribute("cy", "16.7");
  dot.setAttribute("r", "1");
  dot.setAttribute("fill", "currentColor");
  icon.append(outline, hook, dot);
  button.prepend(icon);
  return {
    update(label: string, description: string) {
      button.setAttribute("aria-label", label);
      tooltip.update(description);
    },
    dispose() {
      tooltip.dispose();
      handle.dispose();
    },
  };
}
