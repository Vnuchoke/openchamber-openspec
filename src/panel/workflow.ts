import type { DerivedChange, Stage } from "../model.js";
import type { UiText } from "./localization.js";

export type GlobalWorkflow = "propose" | "explore" | "new" | "ff" | "bulk-archive" | "onboard";

export const globalWorkflows: {
  id: GlobalWorkflow;
  label: string;
  skill: string;
  description: string;
}[] = [
  {
    id: "propose",
    label: "Propose change",
    skill: "openspec-propose",
    description: "Prepare an unsent prompt to define a new change and its planning artifacts.",
  },
  {
    id: "explore",
    label: "Explore ideas",
    skill: "openspec-explore",
    description:
      "Prepare an unsent prompt to investigate ideas and trade-offs without file changes.",
  },
  {
    id: "new",
    label: "New change",
    skill: "openspec-new-change",
    description: "Prepare an unsent prompt to start a new change step by step.",
  },
  {
    id: "ff",
    label: "Fast-forward",
    skill: "openspec-ff-change",
    description: "Prepare an unsent prompt to create all planning artifacts for a new change.",
  },
  {
    id: "bulk-archive",
    label: "Bulk archive",
    skill: "openspec-bulk-archive-change",
    description:
      "Prepare an unsent prompt to select changes, assess conflicts and confirm batch archiving.",
  },
  {
    id: "onboard",
    label: "Onboard",
    skill: "openspec-onboard",
    description:
      "Prepare an unsent prompt for a guided full change cycle, with setup and task questions.",
  },
];

export function globalWorkflowPrompt(workflow: GlobalWorkflow, text: UiText): string {
  const { skill } = globalWorkflows.find(({ id }) => id === workflow)!;
  const prompts = text.prompts;
  const instruction =
    prompts.globalGuidance[
      workflow === "bulk-archive" || workflow === "onboard" || workflow === "explore"
        ? workflow
        : "creation"
    ];
  return `${prompts.globalIntroduction(skill)}\n\n${instruction} ${prompts.globalSafety}`;
}

export type ChangeWorkflow =
  "continue" | "apply" | "update" | "sync" | "archive" | "verify" | "explore";

export const changeWorkflows: {
  id: ChangeWorkflow;
  label: string;
  skill: string;
  description: string;
}[] = [
  {
    id: "continue",
    label: "Continue change",
    skill: "openspec-continue-change",
    description:
      "Prepare an unsent prompt for at most one next planning artifact, not implementation.",
  },
  {
    id: "apply",
    label: "Apply tasks",
    skill: "openspec-apply-change",
    description: "Prepare an unsent current-chat prompt to implement and verify remaining tasks.",
  },
  {
    id: "update",
    label: "Update change",
    skill: "openspec-update-change",
    description:
      "Prepare an unsent prompt to revise planning artifacts without implementing tasks.",
  },
  {
    id: "sync",
    label: "Sync specs",
    skill: "openspec-sync-specs",
    description:
      "Prepare an unsent prompt to synchronize delta specs with main specs without archiving.",
  },
  {
    id: "archive",
    label: "Archive change",
    skill: "openspec-archive-change",
    description:
      "Prepare an unsent prompt to check archival prerequisites and request confirmation.",
  },
  {
    id: "verify",
    label: "Verify change",
    skill: "openspec-verify-change",
    description:
      "Prepare an unsent prompt to report gaps against planning artifacts without fixing or archiving.",
  },
  {
    id: "explore",
    label: "Explore ideas",
    skill: "openspec-explore",
    description:
      "Prepare an unsent prompt to investigate this change and trade-offs without file changes.",
  },
];

export function changeWorkflowPrompt(
  workflow: ChangeWorkflow,
  change: DerivedChange,
  text: UiText,
): string {
  const prompts = text.prompts;
  const target = prompts.target(change.id);
  const { skill } = changeWorkflows.find(({ id }) => id === workflow)!;
  const goal =
    (workflow === "continue" || workflow === "explore") && change.goal?.trim()
      ? prompts.goal(change.goal)
      : "";
  const progress =
    workflow === "apply" && change.stage === "progress"
      ? prompts.progress(change.completedTasks, change.totalTasks)
      : "";
  return `${prompts.changeIntroduction(skill, target)}${goal}${progress}\n\n${prompts.changeGuidance[workflow](target)}`;
}

export function actionPrompt(
  change: DerivedChange,
  intent: "primary" | "verify" | "explore",
  text: UiText,
): string {
  if (intent !== "primary") return changeWorkflowPrompt(intent, change, text);
  const workflow =
    change.stage === "planning" ? "continue" : change.stage === "complete" ? "archive" : "apply";
  return changeWorkflowPrompt(workflow, change, text);
}

export const stages: { id: Stage; label: string; action: string }[] = [
  { id: "planning", label: "Planning", action: "Plan" },
  { id: "ready", label: "Ready", action: "Apply" },
  { id: "progress", label: "In Progress", action: "Apply" },
  { id: "complete", label: "Complete", action: "Archive" },
];

export const workflowLabel = (stage: Stage) => stages.find((item) => item.id === stage)!.action;
export const stageLabel = (stage: Stage) => stages.find((item) => item.id === stage)!.label;
