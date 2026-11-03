import type { DerivedChange, Stage } from "../model.js";

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

export function globalWorkflowPrompt(workflow: GlobalWorkflow): string {
  const { skill } = globalWorkflows.find(({ id }) => id === workflow)!;
  const instruction =
    workflow === "bulk-archive"
      ? "Leave candidate selection, conflict assessment and batch confirmation to the workflow; do not preselect visible or completed changes."
      : workflow === "onboard"
        ? "Leave setup permission and onboarding task selection to the workflow and its user questions."
        : workflow === "explore"
          ? "Ask the user what ideas to explore. Investigate relevant context, options and trade-offs without file changes or implementation."
          : "Ask the user to establish their intended change; do not target or finish an existing change's scaffold.";
  return `Use your skill tool to load and invoke the ${skill} skill.\n\n${instruction} Preserve the workflow's setup checks and required user questions. If the skill is unavailable, report that limitation rather than substituting another workflow.`;
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

export function changeWorkflowPrompt(workflow: ChangeWorkflow, change: DerivedChange): string {
  const target = `OpenSpec change "${change.id}"`;
  const goal = change.goal?.trim() ? `\nGoal: ${change.goal}` : "";
  const { skill } = changeWorkflows.find(({ id }) => id === workflow)!;
  const invocation = `Use your skill tool to load and invoke the ${skill} skill for ${target}.`;
  switch (workflow) {
    case "continue":
      return `${invocation}${goal}\n\nInspect this existing change's status and follow the workflow's artefact instructions to create at most one next planning artefact. Preserve existing decisions and any recorded goal. If no goal is recorded, inspect existing context and ask the user to clarify it if necessary; do not invent a goal or write goal metadata automatically. Do not create another change or implement code. Leave complete planning and partially populated artefacts to the workflow; do not automatically Apply.`;
    case "explore":
      return `${invocation}${goal}\n\nInvestigate the goal, relevant code, options and trade-offs for ${target}. Discuss findings without file changes or implementation. If no goal is recorded, inspect existing context and ask the user to clarify it if necessary; do not invent a goal.`;
    case "apply": {
      const progress =
        change.stage === "progress"
          ? `\n${change.completedTasks} of ${change.totalTasks} tasks complete. Pick up where implementation left off and complete the remaining tasks.`
          : "";
      return `${invocation}${progress}\n\nComplete all remaining tasks in ${target}, then verify the implementation against its change artefacts. Resolve any issues found and verify again until all tasks are complete and verification passes. If blocked, report the blocker rather than marking unfinished work complete.`;
    }
    case "update":
      return `${invocation}\n\nReview and revise this change's planning artefacts, preserving existing decisions and the recorded goal. Retain the workflow's required user confirmations. Do not implement tasks or archive the change.`;
    case "sync":
      return `${invocation}\n\nSynchronize this change's delta specs with the main specs using the workflow's prerequisite checks and required user questions. Do not implement tasks or archive the change afterward.`;
    case "verify":
      return `${invocation}\n\nCompare the implementation with this change's planning artefacts and report gaps and inconsistencies diagnostically, without implementation or archiving.`;
    case "archive":
      return `${invocation}\n\nCheck the workflow's archival prerequisites and retain required user confirmations; do not assume prior verification or permission to archive.`;
  }
}

export function actionPrompt(
  change: DerivedChange,
  intent: "primary" | "verify" | "explore",
): string {
  if (intent !== "primary") return changeWorkflowPrompt(intent, change);
  const workflow =
    change.stage === "planning" ? "continue" : change.stage === "complete" ? "archive" : "apply";
  return changeWorkflowPrompt(workflow, change);
}

export const stages: { id: Stage; label: string; action: string }[] = [
  { id: "planning", label: "Planning", action: "Continue artifacts" },
  { id: "ready", label: "Ready", action: "Apply" },
  { id: "progress", label: "In Progress", action: "Apply" },
  { id: "complete", label: "Complete", action: "Archive" },
];

export const workflowLabel = (stage: Stage) => stages.find((item) => item.id === stage)!.action;
export const stageLabel = (stage: Stage) => stages.find((item) => item.id === stage)!.label;
