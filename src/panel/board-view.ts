import { mountButton, mountProgress, mountSearchField } from "@openchamber/sdk/ui";
import type { DerivedChange } from "../model.js";
import {
  changeWorkflows,
  globalWorkflows,
  stages,
  type ChangeWorkflow,
  type GlobalWorkflow,
} from "./workflow.js";
import { mountPrimaryAction, mountWorkflowMenu } from "./primary-action.js";
import { mountHelpButton, mountTooltip } from "./help-button.js";
import { addButtonIcon } from "./button-icon.js";
import { mountAreaBadges } from "./area-badges.js";

export type BoardCard = {
  change: DerivedChange;
  stale: boolean;
  unavailable: boolean;
  open: () => void;
  pending?: boolean;
  action: (intent: "primary" | "worktree" | "verify" | "explore") => void;
  workflow: (workflow: ChangeWorkflow) => void;
};
export type BoardState = {
  directory: string | null;
  workflow: (workflow: GlobalWorkflow) => void;
  canCreate: boolean;
  canArchive: boolean;
  archivePending: boolean;
  search: string;
  listedCount: number;
  completedTasks: number;
  totalTasks: number;
  pendingSummaries: number;
  loading: boolean;
  settled: boolean;
  error: string | null;
  failures: { id: string; error: string }[];
  cards: BoardCard[];
};

export function mountBoardView(
  root: HTMLElement,
  callbacks: {
    create: () => void;
    archive: () => void;
    retry: () => void;
    search: (value: string) => void;
    help: () => void;
  },
) {
  const main = document.createElement("div");
  main.className = "board-shell";
  const header = document.createElement("header");
  header.className = "board-header";
  const body = document.createElement("div");
  body.className = "view-body board-body";
  const heading = document.createElement("div");
  heading.className = "heading";
  const project = document.createElement("h1");
  const headingActions = document.createElement("div");
  headingActions.className = "heading-actions";
  const newChangeRoot = document.createElement("span");
  const newChange = mountButton(newChangeRoot, {
    label: "Create scaffold…",
    variant: "default",
    size: "sm",
    disabled: true,
    onClick: callbacks.create,
  });
  addButtonIcon(newChangeRoot, "create");
  const archiveRoot = document.createElement("span");
  const archive = mountButton(archiveRoot, {
    label: "Archive all",
    variant: "secondary",
    size: "sm",
    disabled: true,
    onClick: callbacks.archive,
  });
  addButtonIcon(archiveRoot, "archive");
  const toolbar = document.createElement("div");
  toolbar.className = "toolbar";
  const tally = document.createElement("span");
  tally.className = "board-tally";
  const tallyGroup = document.createElement("span");
  tallyGroup.className = "board-tally-group";
  const refreshRoot = document.createElement("span");
  refreshRoot.className = "refresh-control";
  const refresh = mountButton(refreshRoot, {
    label: "Refresh",
    variant: "ghost",
    size: "sm",
    onClick: callbacks.retry,
  });
  addButtonIcon(refreshRoot, "refresh");
  const helpRoot = document.createElement("span");
  const help = mountHelpButton(helpRoot, callbacks.help);
  const tooltips = [
    mountTooltip(
      newChangeRoot.querySelector("button")!,
      "Open a form that directly creates a scaffold with its name and goal; no agent prompt is sent.",
    ),
    mountTooltip(
      archiveRoot.querySelector("button")!,
      "Open confirmation to create a new session and submit an archive prompt for completed changes only; unfinished changes are skipped.",
    ),
    mountTooltip(
      refreshRoot.querySelector("button")!,
      "Read the latest board state without changing files.",
    ),
  ];
  const workflowRoot = document.createElement("span");
  const workflows = mountWorkflowMenu(workflowRoot, globalWorkflows);
  headingActions.append(helpRoot, refreshRoot, workflowRoot, archiveRoot, newChangeRoot);
  const searchRoot = document.createElement("span");
  searchRoot.className = "board-search";
  let searchValue = "";
  const search = mountSearchField(searchRoot, {
    value: "",
    placeholder: "Search changes",
    label: "Search changes",
    onChange: (value) => {
      searchValue = value;
      callbacks.search(value);
    },
  });
  tallyGroup.append(tally);
  heading.append(project, tallyGroup);
  toolbar.append(searchRoot, headingActions);
  header.append(heading, toolbar);
  const notices = document.createElement("div");
  notices.className = "board-notices";
  const board = document.createElement("section");
  board.className = "board";
  const sections = stages.map((stage) => {
    const section = document.createElement("section");
    section.className = "stage";
    const label = document.createElement("h2");
    const grid = document.createElement("div");
    grid.className = "card-grid";
    const empty = document.createElement("p");
    empty.className = "empty-stage";
    section.append(label, grid);
    board.append(section);
    return { stage, label, grid, empty };
  });
  body.append(notices, board);
  main.append(header, body);
  root.append(main);
  let noticesMounted: { dispose: () => void }[] = [];
  let noticeSignature = "";
  const cards = new Map<
    string,
    {
      node: HTMLElement;
      title: HTMLButtonElement;
      tooltips: ReturnType<typeof mountTooltip>[];
      areas: ReturnType<typeof mountAreaBadges>;
      progressLabel: HTMLElement;
      progressRoot: HTMLElement;
      progress: ReturnType<typeof mountProgress>;
      action: ReturnType<typeof mountPrimaryAction>;
      workflows: ReturnType<typeof mountWorkflowMenu<ChangeWorkflow>>;
      explore: ReturnType<typeof mountButton>;
      exploreRoot: HTMLElement;
      verify: ReturnType<typeof mountButton>;
      verifyRoot: HTMLElement;
      status: HTMLElement;
      current: BoardCard;
    }
  >();
  function addAction(target: HTMLElement, label: string) {
    const mount = document.createElement("span");
    target.append(mount);
    const button = mountButton(mount, {
      label,
      variant: "secondary",
      size: "sm",
      onClick: callbacks.retry,
    });
    const tooltip = mountTooltip(
      mount.querySelector("button")!,
      "Retry reading the board; do not repeat any write.",
    );
    noticesMounted.push({
      dispose() {
        tooltip.dispose();
        button.dispose();
      },
    });
  }
  function cardFor(item: BoardCard) {
    let entry = cards.get(item.change.id);
    if (!entry) {
      const node = document.createElement("article");
      node.className = "change-card";
      const title = document.createElement("button");
      title.className = "card-main";
      title.type = "button";
      const progressLabel = document.createElement("p");
      progressLabel.className = "progress-label";
      const progressRoot = document.createElement("div");
      const progress = mountProgress(progressRoot, { value: 0, label: "Task completion" });
      const actionRoot = document.createElement("span");
      actionRoot.className = "card-actions";
      const id = item.change.id;
      const action = mountPrimaryAction(actionRoot);
      const exploreRoot = document.createElement("span");
      const explore = mountButton(exploreRoot, {
        label: "Explore",
        variant: "secondary",
        size: "sm",
        onClick: () => cards.get(id)?.current.action("explore"),
      });
      const verifyRoot = document.createElement("span");
      const verify = mountButton(verifyRoot, {
        label: "Verify",
        variant: "secondary",
        size: "sm",
        onClick: () => cards.get(id)?.current.action("verify"),
      });
      actionRoot.prepend(exploreRoot, verifyRoot);
      const workflowRoot = document.createElement("span");
      const workflows = mountWorkflowMenu(workflowRoot, changeWorkflows);
      actionRoot.append(workflowRoot);
      title.addEventListener("click", () => cards.get(id)?.current.open());
      const status = document.createElement("p");
      status.className = "stale-label";
      node.append(title);
      const areas = mountAreaBadges(node);
      node.append(progressLabel, progressRoot, actionRoot, status);
      entry = {
        tooltips: [
          mountTooltip(title, "Open this change's planning documents and tasks."),
          mountTooltip(
            exploreRoot.querySelector("button")!,
            "Prepare an editable, unsent exploration prompt without file changes.",
          ),
          mountTooltip(
            verifyRoot.querySelector("button")!,
            "Prepare an editable, unsent diagnostic verification prompt; do not implement or archive.",
          ),
        ],
        node,
        title,
        areas,
        progressLabel,
        progressRoot,
        progress,
        action,
        workflows,
        explore,
        exploreRoot,
        verify,
        verifyRoot,
        status,
        current: item,
      };
      cards.set(id, entry);
    }
    entry.current = item;
    entry.tooltips.forEach((tooltip) => tooltip.update());
    const change = item.change;
    if (entry.title.textContent !== change.id) entry.title.textContent = change.id;
    entry.areas.update(change.affectedAreas);
    const label = `${change.completedArtifacts} of ${change.totalArtifacts} artefacts${change.totalTasks === 0 ? " · No tasks yet" : ""}`;
    if (entry.progressLabel.textContent !== label) entry.progressLabel.textContent = label;
    entry.progressRoot.hidden = !change.totalTasks;
    entry.progress.update({
      value: change.totalTasks ? Math.round((100 * change.completedTasks) / change.totalTasks) : 0,
      label: `${change.completedTasks} of ${change.totalTasks} tasks complete`,
    });
    entry.action.update({
      id: change.id,
      stage: change.stage,
      disabled: item.unavailable,
      pending: item.pending,
      action: item.action,
    });
    entry.explore.update({ disabled: item.unavailable });
    entry.workflows.update({ disabled: item.unavailable, action: item.workflow });
    entry.exploreRoot.hidden = change.stage !== "planning";
    entry.verifyRoot.hidden = change.stage !== "complete";
    entry.verify.update({ disabled: item.unavailable });
    entry.status.hidden = !item.stale && !item.unavailable;
    if (item.unavailable) entry.status.textContent = `${change.id} is no longer available.`;
    else if (item.stale)
      entry.status.textContent = `${change.id} is stale; latest summary unavailable.`;
    return entry.node;
  }
  return {
    setVisible(visible: boolean) {
      main.hidden = !visible;
      tooltips.forEach((tooltip) => tooltip.update());
    },
    update(state: BoardState) {
      tooltips.forEach((tooltip) => tooltip.update());
      workflows.update({ disabled: !state.directory, action: state.workflow });
      project.textContent =
        state.directory?.split("/").filter(Boolean).at(-1) ?? "No project selected";
      newChange.update({ disabled: !state.canCreate });
      archive.update({ disabled: !state.canArchive, loading: state.archivePending });
      if (searchValue !== state.search) {
        searchValue = state.search;
        search.update({ value: searchValue });
      }
      tally.textContent = `${state.listedCount} changes · ${state.completedTasks} of ${state.totalTasks} tasks complete`;
      refresh.update({ disabled: !state.directory, loading: state.loading });
      const nextNoticeSignature = JSON.stringify([
        !!state.directory,
        state.error,
        state.failures.map(({ id }) => id),
      ]);
      if (noticeSignature !== nextNoticeSignature) {
        noticeSignature = nextNoticeSignature;
        noticesMounted.forEach((handle) => handle.dispose());
        noticesMounted = [];
        notices.replaceChildren();
        if (!state.directory) {
          const notice = document.createElement("p");
          notice.className = "notice";
          notice.textContent =
            "Select an OpenChamber project or worktree to view its OpenSpec changes.";
          notices.append(notice);
        }
        if (state.error) {
          const notice = document.createElement("div");
          notice.className = "notice error";
          const message = document.createElement("span");
          message.textContent = state.error;
          notice.append(message);
          addAction(notice, "Retry");
          notices.append(notice);
        }
        if (state.failures.length) {
          const notice = document.createElement("div");
          notice.className = "notice";
          const message = document.createElement("span");
          message.textContent = `${state.failures.map(({ id }) => id).join(", ")} could not be read. Refresh to try again.`;
          notice.append(message);
          addAction(notice, "Retry");
          notices.append(notice);
        }
      }
      const ids = new Set(state.cards.map(({ change }) => change.id));
      for (const [id, entry] of cards) {
        if (ids.has(id)) continue;
        entry.action.dispose();
        entry.tooltips.forEach((tooltip) => tooltip.dispose());
        entry.workflows.dispose();
        entry.explore.dispose();
        entry.verify.dispose();
        entry.progress.dispose();
        entry.areas.dispose();
        entry.node.remove();
        cards.delete(id);
      }
      const query = state.search.trim().toLocaleLowerCase();
      for (const entry of cards.values()) {
        const change = entry.current.change;
        if (!`${change.id} ${change.goal ?? ""}`.toLocaleLowerCase().includes(query))
          entry.node.remove();
      }
      for (const { stage, label, grid, empty } of sections) {
        const matching = state.cards
          .filter(
            ({ change }) =>
              change.stage === stage.id &&
              `${change.id} ${change.goal ?? ""}`.toLocaleLowerCase().includes(query),
          )
          .sort((a, b) => (a.change.id < b.change.id ? -1 : a.change.id > b.change.id ? 1 : 0));
        label.textContent = `${stage.label} ${matching.length}`;
        for (const child of [...grid.children]) {
          if (
            child !== empty &&
            !matching.some((item) => cards.get(item.change.id)?.node === child)
          )
            child.remove();
        }
        empty.textContent =
          state.loading && !state.settled && state.pendingSummaries
            ? "Loading…"
            : query
              ? "No matching changes"
              : "No changes here";
        if (!matching.length) {
          if (empty.parentElement !== grid) grid.append(empty);
        } else empty.remove();
        matching.forEach((item, index) => {
          const node = cardFor(item);
          if (grid.children[index] !== node) grid.insertBefore(node, grid.children[index] ?? null);
        });
      }
    },
    dispose() {
      tooltips.forEach((tooltip) => tooltip.dispose());
      noticesMounted.forEach((handle) => handle.dispose());
      for (const entry of cards.values()) {
        entry.tooltips.forEach((tooltip) => tooltip.dispose());
        entry.action.dispose();
        entry.workflows.dispose();
        entry.explore.dispose();
        entry.verify.dispose();
        entry.progress.dispose();
        entry.areas.dispose();
      }
      cards.clear();
      newChange.dispose();
      workflows.dispose();
      archive.dispose();
      refresh.dispose();
      help.dispose();
      search.dispose();
      main.remove();
    },
  };
}
