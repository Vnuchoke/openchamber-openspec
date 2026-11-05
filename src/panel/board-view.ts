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
import { english, presentMessage, type LocalMessage, type UiText } from "./localization.js";

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
  text: UiText;
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
  error: string | LocalMessage | null;
  failures: { id: string; error: string | LocalMessage }[];
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
  let text = english;
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
    label: text.create,
    variant: "default",
    size: "sm",
    disabled: true,
    onClick: callbacks.create,
  });
  addButtonIcon(newChangeRoot, "create");
  const archiveRoot = document.createElement("span");
  const archive = mountButton(archiveRoot, {
    label: text.archiveAll,
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
    label: text.refresh,
    variant: "ghost",
    size: "sm",
    onClick: callbacks.retry,
  });
  addButtonIcon(refreshRoot, "refresh");
  const helpRoot = document.createElement("span");
  const help = mountHelpButton(helpRoot, callbacks.help);
  const tooltips = [
    mountTooltip(newChangeRoot.querySelector("button")!, text.createDescription),
    mountTooltip(archiveRoot.querySelector("button")!, text.archiveDescription),
    mountTooltip(refreshRoot.querySelector("button")!, text.refreshDescription),
  ];
  const workflowRoot = document.createElement("span");
  const workflows = mountWorkflowMenu(workflowRoot, globalWorkflows);
  headingActions.append(helpRoot, refreshRoot, workflowRoot, archiveRoot, newChangeRoot);
  const searchRoot = document.createElement("span");
  searchRoot.className = "board-search";
  let searchValue = "";
  const search = mountSearchField(searchRoot, {
    value: "",
    placeholder: text.search,
    label: text.search,
    onChange: (value) => {
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
  let noticeUpdates: (() => void)[] = [];
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
  function addAction(target: HTMLElement) {
    const mount = document.createElement("span");
    target.append(mount);
    const button = mountButton(mount, {
      label: text.retry,
      variant: "secondary",
      size: "sm",
      onClick: callbacks.retry,
    });
    const tooltip = mountTooltip(mount.querySelector("button")!, text.retryDescription);
    noticesMounted.push({
      dispose() {
        tooltip.dispose();
        button.dispose();
      },
    });
    noticeUpdates.push(() => {
      button.update({ label: text.retry });
      tooltip.update(text.retryDescription);
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
      const progress = mountProgress(progressRoot, { value: 0, label: text.taskCompletion });
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
          mountTooltip(title, text.openChangeDescription),
          mountTooltip(exploreRoot.querySelector("button")!, text.exploreDescription),
          mountTooltip(verifyRoot.querySelector("button")!, text.verifyDescription),
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
    entry.tooltips.forEach((tooltip, index) =>
      tooltip.update(
        [text.openChangeDescription, text.exploreDescription, text.verifyDescription][index],
      ),
    );
    const change = item.change;
    if (entry.title.textContent !== change.id) entry.title.textContent = change.id;
    entry.areas.update(change.affectedAreas);
    const label = `${text.artifacts(change.completedArtifacts, change.totalArtifacts)}${change.totalTasks === 0 ? ` · ${text.noTasks}` : ""}`;
    if (entry.progressLabel.textContent !== label) entry.progressLabel.textContent = label;
    entry.progressRoot.hidden = !change.totalTasks;
    entry.progress.update({
      value: change.totalTasks ? Math.round((100 * change.completedTasks) / change.totalTasks) : 0,
      label: text.tasks(change.completedTasks, change.totalTasks),
    });
    entry.action.update({
      text,
      id: change.id,
      stage: change.stage,
      disabled: item.unavailable,
      pending: item.pending,
      action: item.action,
    });
    entry.explore.update({ label: text.explore, disabled: item.unavailable });
    entry.workflows.update({
      text,
      labels: text.changeWorkflows,
      disabled: item.unavailable,
      action: item.workflow,
    });
    entry.exploreRoot.hidden = change.stage !== "planning";
    entry.verifyRoot.hidden = change.stage !== "complete";
    entry.verify.update({ label: text.verify, disabled: item.unavailable });
    entry.status.hidden = !item.stale && !item.unavailable;
    if (item.unavailable) entry.status.textContent = text.unavailable(change.id);
    else if (item.stale) entry.status.textContent = text.stale(change.id);
    return entry.node;
  }
  return {
    setVisible(visible: boolean) {
      main.hidden = !visible;
      tooltips.forEach((tooltip) => tooltip.update());
    },
    update(state: BoardState) {
      text = state.text;
      tooltips.forEach((tooltip, index) =>
        tooltip.update(
          [text.createDescription, text.archiveDescription, text.refreshDescription][index],
        ),
      );
      help.update(text.help, text.helpDescription);
      workflows.update({
        text,
        labels: text.globalWorkflows,
        disabled: !state.directory,
        action: state.workflow,
      });
      project.textContent = state.directory?.split("/").filter(Boolean).at(-1) ?? text.noProject;
      newChange.update({ label: text.create, disabled: !state.canCreate });
      archive.update({
        label: text.archiveAll,
        disabled: !state.canArchive,
        loading: state.archivePending,
      });
      const searchProps: { label: string; placeholder: string; value?: string } = {
        label: text.search,
        placeholder: text.search,
      };
      if (searchValue !== state.search) {
        searchValue = state.search;
        searchProps.value = searchValue;
      }
      // SDK repaints its hardcoded clear label on every search handle update.
      search.update(searchProps);
      searchRoot
        .querySelector(".oc-sdk-search-clear")
        ?.setAttribute("aria-label", text.clearSearch);
      tally.textContent = text.tally(state.listedCount, state.completedTasks, state.totalTasks);
      refresh.update({ label: text.refresh, disabled: !state.directory, loading: state.loading });
      const nextNoticeSignature = JSON.stringify([
        !!state.directory,
        state.error,
        state.failures.map(({ id }) => id),
      ]);
      if (noticeSignature !== nextNoticeSignature) {
        noticeSignature = nextNoticeSignature;
        noticesMounted.forEach((handle) => handle.dispose());
        noticesMounted = [];
        noticeUpdates = [];
        notices.replaceChildren();
        if (!state.directory) {
          const notice = document.createElement("p");
          notice.className = "notice";
          noticeUpdates.push(() => {
            notice.textContent = text.selectProject;
          });
          notices.append(notice);
        }
        if (state.error) {
          const notice = document.createElement("div");
          notice.className = "notice error";
          const message = document.createElement("span");
          const error = state.error;
          noticeUpdates.push(() => {
            message.textContent = presentMessage(text, error);
          });
          notice.append(message);
          addAction(notice);
          notices.append(notice);
        }
        if (state.failures.length) {
          const notice = document.createElement("div");
          notice.className = "notice";
          const message = document.createElement("span");
          const ids = state.failures.map(({ id }) => id).join(", ");
          noticeUpdates.push(() => {
            message.textContent = text.failures(ids);
          });
          notice.append(message);
          addAction(notice);
          notices.append(notice);
        }
      }
      noticeUpdates.forEach((update) => update());
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
        label.textContent = `${text.stages[stage.id]} ${matching.length}`;
        for (const child of [...grid.children]) {
          if (
            child !== empty &&
            !matching.some((item) => cards.get(item.change.id)?.node === child)
          )
            child.remove();
        }
        empty.textContent =
          state.loading && !state.cards.length
            ? text.loading
            : query
              ? text.noMatches
              : text.noChanges;
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
