import assert from "node:assert/strict";
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { chromium, firefox, webkit } from "playwright";
import test from "node:test";

const directory = "/tmp/fixture-project";
const root = `${directory}/openspec`;
const theme = (mode) => ({
  mode,
  tokens: {
    background: mode === "light" ? "#ffffff" : "#15191c",
    elevated: mode === "light" ? "#f5f7f8" : "#1d2226",
    foreground: mode === "light" ? "#161616" : "#e3e7ea",
    muted: mode === "light" ? "#555f67" : "#a0a9b1",
    subtle: mode === "light" ? "#727c84" : "#737b83",
    border: mode === "light" ? "#d4dbe0" : "#30363c",
    hover: mode === "light" ? "#e8eff0" : "#252b30",
    selection: mode === "light" ? "#dcece6" : "#253b35",
    focus: mode === "light" ? "#187659" : "#75b6a0",
    primary: mode === "light" ? "#cfe9dc" : "#253b35",
    mutedSurface: mode === "light" ? "#e9eff1" : "#20262a",
    elevatedForeground: mode === "light" ? "#161616" : "#e3e7ea",
    active: mode === "light" ? "#b8d7cb" : "#304f45",
    selectionForeground: mode === "light" ? "#163a2d" : "#e3e7ea",
    primaryForeground: mode === "light" ? "#163a2d" : "#e3e7ea",
    primaryText: mode === "light" ? "#19644b" : "#c2e1d7",
    successText: mode === "light" ? "#22704b" : "#9ed9b9",
    warningText: mode === "light" ? "#775617" : "#e4c775",
    errorText: mode === "light" ? "#a32727" : "#e3a1a1",
    infoText: mode === "light" ? "#245f91" : "#9bc2e5",
    success: mode === "light" ? "#d7edde" : "#276749",
    warning: mode === "light" ? "#f6eacd" : "#805d1b",
    error: mode === "light" ? "#f6dcdc" : "#8b3434",
    info: mode === "light" ? "#daeafb" : "#285e8e",
    font: "system-ui, sans-serif",
    mono: "ui-monospace, monospace",
    radius: "8px",
  },
});
const artifacts = [
  { id: "proposal", status: "done", outputPath: "proposal.md", requires: [] },
  { id: "specs", status: "done", outputPath: "specs/**/*.md", requires: ["proposal"] },
  { id: "tasks", status: "done", outputPath: "tasks.md", requires: ["specs"] },
];
function hostHtml() {
  const data = JSON.stringify({ directory, root, artifacts, theme: theme("dark") });
  const themes = JSON.stringify({ dark: theme("dark"), light: theme("light") });
  return `<!doctype html><script>
    const { directory, root, artifacts, theme } = ${data};
    let currentRoot = root;
    let currentPlanning = "fixture-planning";
    let projects = [{ id: "origin-project", name: "Origin", directory }];
    let worktrees = [];
    let sessions = [];
    window.__projects = value => { projects = value; };
    window.__worktrees = value => { worktrees = value; };
    let workspaceState = "ready";
    let workspaceEventState = null;
    let sessionCoverage = [];
    window.__workspaceState = (state, event = null) => { workspaceState = state; workspaceEventState = event; };
    window.__sessionCoverage = value => { sessionCoverage = value; };
    window.__sessions = value => { sessions = value; };
    let failOpenSession = false;
    window.__failOpenSession = () => { failOpenSession = true; };
    const guests = new Set();
    const changes = [
      { id: "first-change", goal: "Read the proposal", completedTasks: 1, totalTasks: 2 },
      { id: "second-change", goal: "Review the specs", completedTasks: 0, totalTasks: 0 },
    ];
    let proposal = "First version of proposal";
    const documents = {};
    let customSelector = "checklist.md";
    window.__document = (selector, text) => { documents[selector] = text; };
    window.__customSelector = (selector) => { customSelector = selector; custom = true; };
    let tasks = [{ id: "1", description: "1.1 CLI description", done: true },
      { id: "2", description: "Second description", done: false }];
    let holdFiles = false;
    let holdListing = false;
    let holdSummaries = location.search.includes("hold-summary");
    const pendingSummaries = [];
    let failSummary = location.search.includes("fail-summary");
    let batchReply = "";
    window.__batchReply = (value) => { batchReply = value; };
    let failDocument = false;
    let failTasks = false;
    let unavailable = false;
    let unavailableOnRelease = false;
    let rootErrorPath = "";
    let unknownCreate = false;
    let createReply = "success";
    let createWrites = true;
    let holdCreate = false;
    let holdDelete = false;
    let unknownDelete = false;
    let malformedDelete = false;
    let failNextListing = false;
    const pendingDeletes = [];
    const pendingCreates = [];
    let holdProposal = false;
    let holdTasks = false;
    let withDesign = false;
    let longSpec = false;
    let failSpec2 = false;
    let custom = false;
    let collidingLabels = false;
    let longArtifact = false;
    let readinessCase = "";
    let workflowArtifacts = null;
    window.__workflowStage = (stage, unusual = false) => {
      changes[0].completedTasks = stage === "complete" ? 2 : stage === "progress" ? 1 : 0;
      workflowArtifacts = [
        { id: "proposal", status: stage === "planning" ? "ready" : "done", outputPath: "proposal.md", requires: [] },
        { id: "tasks", status: "done", outputPath: "tasks.md", requires: ["proposal"] },
        ...(unusual ? [
          { id: "custom-review", status: "ready", outputPath: "review.md", requires: [] },
          { id: "custom-skipped", status: "skipped", outputPath: "skip.md", requires: [] },
        ] : []),
      ];
    };
    let draft = "Earlier draft";
    let holdCompose = false;
    let failCompose = false;
    let failOpenUrl = false;
    let holdClipboard = false;
    let failClipboard = false;
    let failToast = false;
    const pendingClipboard = [];
    window.__holdClipboard = () => { holdClipboard = true; };
    window.__releaseClipboard = () => { holdClipboard = false; pendingClipboard.splice(0).forEach((finish) => finish()); };
    window.__failClipboard = () => { failClipboard = true; };
    window.__failToast = () => { failToast = true; };
    let holdStart = false;
    let startResult = { sessionId: "archive-session", directory, sent: "sent", linked: true };
    let startError = null;
    const pendingStarts = [];
    window.__startResult = (result) => { startResult = result; startError = null; };
    window.__startError = (code) => { startError = code; };
    window.__holdStart = () => { holdStart = true; };
    window.__releaseStart = () => { holdStart = false; pendingStarts.splice(0).forEach((finish) => finish()); };
    window.__surface = (surface) => { ready.surface = surface;
      for (const guest of guests) guest.postMessage({ channel: "openchamber.sdk", v: 1, type: "ready", payload: ready }, "*"); };
    const pendingCompose = [];
    const pending = [];
    window.__requests = [];
    window.__completed = [];
    window.__edit = (text) => { proposal = text; tasks[1].done = true; changes[0].completedTasks = 2; };
    window.__unedit = () => { tasks[1].done = false; changes[0].completedTasks = 1; };
    window.__goal = (id, value) => { changes.find((item) => item.id === id).goal = value; };
    window.__areas = (id, value) => { changes.find((item) => item.id === id).affectedAreas = value; };
    window.__rename = (before, after) => { changes.find((item) => item.id === before).id = after; };
    window.__remove = (id) => { const index = changes.findIndex((item) => item.id === id); changes.splice(index, 1); };
    window.__recreate = (id) => { changes.push({ id, goal: "Recreated goal", completedTasks: 0, totalTasks: 0 }); };
    window.__addSameStage = () => { changes.push({ id: "alpha-change", goal: "Another goal", completedTasks: 1, totalTasks: 2 }); };
     window.__theme = (mode) => { ready.theme = ${themes}[mode]; broadcastReady(); };
     window.__locale = (locale) => { ready.locale = locale; broadcastReady(); };
     function broadcastReady() { for (const guest of guests) guest.postMessage({ channel: "openchamber.sdk", v: 1, type: "ready", payload: ready }, "*"); }
     let language = new URLSearchParams(location.search).has("language") ? JSON.parse(new URLSearchParams(location.search).get("language")) : undefined;
     let holdStorage = new URLSearchParams(location.search).get("hold-storage");
     let failStorage = new URLSearchParams(location.search).get("fail-storage");
     const pendingStorage = [];
     window.__storageCalls = [];
     window.__holdStorage = (op) => { holdStorage = op; };
     window.__failStorage = (op) => { failStorage = op; };
     window.__releaseStorage = () => { holdStorage = null; pendingStorage.splice(0).forEach(finish => finish()); };
     window.__remount = () => { guests.clear(); document.querySelector("iframe").src = "/panel/index.html?mount=" + Math.random(); };
     window.__counts = (count) => { changes[0].completedTasks = 0; changes[0].totalTasks = count; };
     window.__artifactCount = count => { workflowArtifacts = Array.from({length: count}, (_, n) => ({id: "artifact-" + n, status: "done", outputPath: "artifact-" + n + ".md", requires: []})); };
     window.__changeCount = count => { changes.splice(0, changes.length, ...Array.from({length: count}, (_, n) => ({id: "change-" + n, goal: null, completedTasks: 0, totalTasks: 0}))); };
     window.__failSummary = (code = true) => { failSummary = code; };
    window.__failDocument = () => { failDocument = true; };
    window.__failTasks = () => { failTasks = true; };
    window.__clearTasks = () => { tasks = []; changes[0].completedTasks = 0; changes[0].totalTasks = 0; };
    window.__unavailable = () => { unavailable = true; };
    window.__unavailableOnRelease = () => { unavailableOnRelease = true; };
    window.__rootErrorOn = (path) => { rootErrorPath = path; };
    window.__unknownCreate = () => { unknownCreate = true; };
    window.__createReply = (reply, writes = true) => { createReply = reply; createWrites = writes; };
    window.__holdCreate = () => { holdCreate = true; };
    window.__holdDelete = () => { holdDelete = true; };
    window.__releaseDelete = () => { holdDelete = false; pendingDeletes.splice(0).forEach((finish) => finish()); };
    window.__unknownDelete = () => { unknownDelete = true; };
    window.__malformedDelete = () => { malformedDelete = true; };
    window.__keepOnUnknownDelete = () => { unknownDelete = "present"; };
    window.__failNextListing = (code = "CLI_UNAVAILABLE") => { failNextListing = code; };
    window.__releaseCreate = () => { holdCreate = false; pendingCreates.splice(0).forEach((finish) => finish()); };
    window.__holdProposal = () => { holdProposal = true; };
    window.__holdTasks = () => { holdTasks = true; };
    window.__releaseReads = () => { holdProposal = false; holdTasks = false; pending.splice(0).forEach((finish) => finish()); };
    window.__design = () => { withDesign = true; };
    window.__longSpec = () => { longSpec = true; };
    window.__failSpec2 = () => { failSpec2 = true; };
    window.__custom = () => { custom = true; };
    window.__collidingLabels = () => { collidingLabels = true; };
    window.__longArtifact = () => { longArtifact = true; };
    window.__readiness = (mode) => { readinessCase = mode; };
    window.__proposalStatus = (status) => { artifacts[0].status = status; };
    window.__draft = () => draft;
    window.__session = (id) => { ready.session = id ? { id } : null;
      for (const guest of guests) guest.postMessage({ channel: "openchamber.sdk", v: 1,
        type: "session", payload: { session: ready.session } }, "*"); };
    window.__holdCompose = () => { holdCompose = true; };
    window.__releaseCompose = () => { holdCompose = false; pendingCompose.splice(0).forEach((finish) => finish()); };
    window.__failCompose = () => { failCompose = true; };
    window.__failOpenUrl = () => { failOpenUrl = true; };
    window.__holdListing = () => { holdListing = true; };
    window.__releaseListing = () => { holdListing = false; pending.shift()?.(); };
    window.__releaseSummaries = () => { holdSummaries = false; pendingSummaries.splice(0).forEach((finish) => finish()); };
    window.__releaseOneSummary = (index) => { pendingSummaries.splice(index, 1)[0]?.(); };
    window.__holdSummaries = () => { holdSummaries = true; };
    window.__holdFiles = () => { holdFiles = true; };
    window.__releaseFile = () => { const finish = pending.shift(); finish?.(); };
    window.__directory = (next) => { ready.directory = next; for (const guest of guests) guest.postMessage({ channel: "openchamber.sdk", v: 1,
      type: "directory", payload: { directory: next } }, "*"); };
    window.__root = (next) => { currentRoot = next; };
    window.__planning = next => { currentPlanning = next; };
    const ready = { directory, theme, locale: "en-AU", session: { id: "fixture-session" },
      surface: "panel", connection: { connected: true, account: "" }, settings: {}, item: null };
    addEventListener("message", (event) => {
      const message = event.data;
      if (!message || message.channel !== "openchamber.sdk" || message.v !== 1) return;
       const reply = (payload) => { if (message.type === "service-request") __completed.push(message.payload.path);
         event.source.postMessage({ channel: "openchamber.sdk", v: 1,
           type: "result", id: message.id, ok: true, payload }, "*"); };
       if (message.type === "storage") {
         const { op, key, value } = message.payload;
         __storageCalls.push(message.payload);
         const finish = () => {
           if (failStorage === op) { failStorage = null; event.source.postMessage({ channel: "openchamber.sdk", v: 1, type: "result", id: message.id, ok: false, code: "HOST_REJECTED", error: "Storage unavailable" }, "*"); return; }
           if (op === "set") language = value;
           reply(op === "get" ? { storage: true, op, found: language !== undefined, ...(language !== undefined ? {value: language} : {}) } : { storage: true, op });
         };
         if (holdStorage === op) pendingStorage.push(finish); else finish();
         return;
       }
      if (message.type === "hello") {
        guests.add(event.source);
        const show = () => event.source.postMessage({ channel: "openchamber.sdk", v: 1, type: "ready", payload: ready }, "*");
        if (location.search.includes("hold-ready")) window.__releaseReady = show;
        else show();
        return;
      }
      if (message.type === "service-request") {
        const path = message.payload.path;
        const body = JSON.parse(message.payload.body);
        window.__requests.push({ path, body });
        const send = (value, status = 200) => reply({ status, body: JSON.stringify(value && typeof value === "object" ? { planning: currentPlanning, ...value } : value) });
        if (body.expectedPlanning && body.expectedPlanning !== currentPlanning) {
          send({error:{code:"PLANNING_CHANGED",message:"Planning target changed. Refresh to establish the new scope."}},409); return;
        }
        if (path === "/changes") {
            if (failNextListing) { const code = failNextListing; failNextListing = false;
              send({ error: { code, message: code === "NO_OPENSPEC_ROOT" ? "No OpenSpec root" : "Cannot check listing" } }, 503); return; }
           const finish = () => send({ directory: body.directory, root: body.directory === directory ? currentRoot : body.directory + "/openspec",
            changes: body.directory === directory ? changes.map(({ id, completedTasks, totalTasks }) => ({ id, completedTasks, totalTasks })) : [] });
          if (holdListing) pending.push(finish); else finish();
        }
        else if (path === "/summaries") {
          if (body.directory !== directory) { send({ root: body.directory + "/openspec", changes: [] }); return; }
          if (batchReply) {
            const mode = batchReply; batchReply = "";
            if (mode === "malformed") send({ root: currentRoot, changes: null });
            else if (mode === "root") send({ error: { code: "ROOT_CHANGED", message: "Root changed" } }, 409);
            else send({ error: { code: "CLI_UNAVAILABLE", message: "Batch read failed" } }, 503);
            return;
          }
          const finish = () => {
            const results = changes.map((item) => {
              let result;
              respondSummary({ ...body, change: item.id }, (value) => { result = value.error ? { id: item.id, error: value.error } : { id: item.id, summary: value }; });
              return result;
            });
            send({ root: currentRoot, changes: results });
          };
          if (holdSummaries) {
            pendingSummaries.push(finish);
          } else finish();
        }
        else if (path === "/tasks") {
          if (rootErrorPath === path) { rootErrorPath = ""; send({ error: { code: "ROOT_CHANGED", message: "Root changed" } }, 409); return; }
          if (unavailable) send({ error: { code: "CHANGE_UNAVAILABLE", message: "Change no longer exists." } }, 404);
           else if (failTasks) { failTasks = false; send({ error: { code: "TASKS_UNAVAILABLE", message: "Retry these tasks" } }, 503); }
            else {
              const finish = () => unavailableOnRelease
                ? send({ error: { code: "CHANGE_UNAVAILABLE", message: "Change no longer exists." } }, 404)
                : send({ tasks: body.change === "second-change" ? [] : tasks });
              if (holdTasks) pending.push(finish); else finish();
            }
        }
        else if (path === "/document") {
          const finish = () => unavailableOnRelease
            ? send({ error: { code: "CHANGE_UNAVAILABLE", message: "Change no longer exists." } }, 404)
            : send({ artifactId: body.artifactId, selector: body.selector,
              content: documents[body.selector] ?? (body.selector === "proposal.md" ? proposal
                : longSpec && body.selector === "specs/1.md" ? "Long document line\\n\\n".repeat(200)
                : "Content of " + body.selector) });
          if (rootErrorPath === path) { rootErrorPath = ""; send({ error: { code: "ROOT_CHANGED", message: "Root changed" } }, 409); return; }
          if (unavailable) send({ error: { code: "CHANGE_UNAVAILABLE", message: "Change no longer exists." } }, 404);
          else if (failDocument && body.selector === "proposal.md") { failDocument = false;
            send({ error: { code: "DOCUMENT_UNAVAILABLE", message: "Retry this document" } }, 503); }
          else if (failSpec2 && body.selector === "specs/2.md") { failSpec2 = false;
            send({ error: { code: "DOCUMENT_UNAVAILABLE", message: "Second file unavailable" } }, 503); }
          else if (holdFiles && body.artifactId === "specs" || holdProposal && body.artifactId === "proposal") pending.push(finish);
          else finish();
        }
        else if (path === "/create") {
          if (createWrites) changes.push({ id: body.name, goal: body.goal, completedTasks: 0, totalTasks: 0 });
          const finish = () => {
            if (createReply === "invalid-json") reply({ status: 200, body: "{" });
            else if (createReply === "null") send(null);
            else if (createReply === "bad-success") send({ root: "wrong-root", change: body.name });
            else if (createReply === "bad-error") send({ error: null }, 500);
            else if (createReply === "known-error") send({ error: { code: "BAD_GOAL", message: "Known rejection" } }, 400);
            else if (unknownCreate) send({ error: { code: "CLI_TIMEOUT", message: "Write outcome unknown", outcome: "unknown" } }, 504);
            else send({ root, change: body.name });
          };
          if (holdCreate) pendingCreates.push(finish); else finish();
        }
        else if (path === "/delete") {
          const finish = () => {
            const index = changes.findIndex((item) => item.id === body.change);
            if (index >= 0 && unknownDelete !== "present") changes.splice(index, 1);
            if (unknownDelete) send({ error: { code: "CLI_TIMEOUT", message: "Deletion outcome unknown", outcome: "unknown" } }, 504);
            else send({ root: malformedDelete ? "wrong-root" : currentRoot, change: body.change });
          };
          if (holdDelete) pendingDeletes.push(finish); else finish();
        }
        else send({ error: { code: "UNEXPECTED", message: path } }, 500);
        return;
      }
      if (message.type === "compose") {
        window.__requests.push({ path: "compose", body: message.payload });
        const finish = () => {
          if (failCompose) { failCompose = false;
            event.source.postMessage({ channel: "openchamber.sdk", v: 1, type: "result",
              id: message.id, ok: false, code: "HOST_REJECTED", error: "Composer unavailable" }, "*"); }
          else { draft = message.payload.mode === "replace" ? message.payload.text : draft + message.payload.text; reply(); }
        };
        if (holdCompose) pendingCompose.push(finish); else finish();
        return;
      }
      if (message.type === "start-session") {
        window.__requests.push({ path: "start-session", body: message.payload, directory: ready.directory });
        const finish = () => startError
          ? event.source.postMessage({ channel: "openchamber.sdk", v: 1, type: "result", id: message.id,
              ok: false, code: startError, error: "Launch refused" }, "*")
          : reply(startResult);
        if (holdStart) pendingStarts.push(finish); else finish();
        return;
      }
      if (message.type === "workspace-read") {
        window.__requests.push({path:message.type,body:message.payload});
        const query = message.payload;
        reply(query.kind === "projects" ? {kind:"projects",state:workspaceState,projects} :
          query.kind === "worktrees" ? {kind:"worktrees",projectId:query.projectId,state:"ready",worktrees} :
          {kind:"sessions",projectId:query.projectId,state:"ready",coverage:sessionCoverage,sessions});
        return;
      }
      if (message.type === "workspace-subscribe") {
        window.__requests.push({path:message.type,body:message.payload});
        reply();
        window.__releaseWorkspace = () => event.source.postMessage({ channel:"openchamber.sdk", v:1, type:"workspace", payload:{subscriptionId:message.payload.subscriptionId,snapshot:{kind:"projects",state:"ready",projects}} }, "*");
        if (workspaceEventState) event.source.postMessage({ channel:"openchamber.sdk", v:1, type:"workspace", payload:{subscriptionId:message.payload.subscriptionId,snapshot:{kind:"projects",state:workspaceEventState,projects}} }, "*");
        return;
      }
      if (message.type === "workspace-unsubscribe") { window.__requests.push({path:message.type,body:message.payload}); return; }
      if (message.type === "open-session") {
        window.__requests.push({path:message.type,body:message.payload});
        if (failOpenSession) { failOpenSession = false; event.source.postMessage({channel:"openchamber.sdk",v:1,type:"result",id:message.id,ok:false,code:"HOST_REJECTED",error:"Cannot open session"},"*"); }
        else reply();
        return;
      }
      if (message.type === "open-url") {
        window.__requests.push({ path: "open-url", body: message.payload });
        if (failOpenUrl) { failOpenUrl = false;
          event.source.postMessage({ channel: "openchamber.sdk", v: 1, type: "result",
            id: message.id, ok: false, code: "HOST_REJECTED", error: "Cannot open quickstart" }, "*"); }
        else reply();
        return;
      }
      if (message.type === "prompt" || message.type === "toast") {
        window.__requests.push({ path: message.type, body: message.payload });
        if (message.type === "toast" && failToast) { failToast = false;
          event.source.postMessage({ channel: "openchamber.sdk", v: 1, type: "result", id: message.id,
            ok: false, code: "HOST_REJECTED", error: "Toast unavailable" }, "*"); return; }
        reply(message.type === "prompt" ? { sent: "skipped" } : undefined);
      }
      if (message.type === "clipboard-write") {
        window.__requests.push({ path: message.type, body: message.payload });
        const finish = () => {
          if (failClipboard) { failClipboard = false;
            event.source.postMessage({ channel: "openchamber.sdk", v: 1, type: "result", id: message.id,
              ok: false, code: "HOST_REJECTED", error: "Clipboard unavailable" }, "*"); }
          else reply();
        };
        if (holdClipboard) pendingClipboard.push(finish); else finish();
      }
    });
    function respondSummary(body, send) {
           const reply = send;
           send = (value, status) => reply(value.error ? value : { affectedAreas: changes.find((change) => change.id === body.change)?.affectedAreas ?? [], ...value }, status);
          const item = changes.find((change) => change.id === body.change);
          if (!item) send({ error: { code: "CHANGE_UNAVAILABLE", message: "Removed" } }, 404);
           else if (failSummary && item.id === "first-change") { const code = typeof failSummary === "string" ? failSummary : "UNAVAILABLE"; failSummary = false;
             send({ error: { code, message: "Read failed" } }, 503); }
            else if (workflowArtifacts) send({ id: item.id, goal: item.goal, root: currentRoot,
               artifacts: workflowArtifacts, applyRequires: workflowArtifacts.some(item => item.id === "tasks") ? ["tasks"] : workflowArtifacts.map(item => item.id), documents: [] });
            else if (readinessCase) send({ id: item.id, goal: item.goal, root: currentRoot,
             artifacts: [
                { id: "proposal", status: readinessCase === "unknown" ? "done" : "ready", outputPath: "proposal.md", requires: [] },
                 { id: "specs", status: "blocked", outputPath: "specs/**/*.md", requires: ["proposal"] },
                { id: "design", status: "skipped", outputPath: "design.md", requires: ["proposal"] },
                 { id: "tasks", status: readinessCase === "blocked-tasks" ? "blocked" : "done", outputPath: "tasks.md", requires: ["specs"] },
             ], applyRequires: ["tasks"], documents: readinessCase === "available" ?
               [{ artifactId: "proposal", selector: "proposal.md", label: "proposal.md" }] : [] });
           else if (longArtifact) send({ id: item.id, goal: item.goal, root: currentRoot,
              artifacts: [{ id: "long-artifact-name-that-must-wrap-at-sidebar-width", status: "ready", outputPath: "long.md", requires: [] }],
              applyRequires: ["long-artifact-name-that-must-wrap-at-sidebar-width"], documents: [] });
           else if (collidingLabels) send({ id: item.id, goal: item.goal, root: currentRoot,
            artifacts: [
              { id: "specs", status: "done", outputPath: "a:b", requires: [] },
              { id: "specs:a", status: "done", outputPath: "b", requires: [] },
            ], applyRequires: ["specs"], documents: [
              { artifactId: "specs", selector: "a:b", label: "a:b" },
              { artifactId: "specs:a", selector: "b", label: "b" },
            ] });
           else send({ id: item.id, goal: item.goal, root: currentRoot,
              artifacts: custom ? [artifacts[0], { id: "checklist", status: "done", outputPath: customSelector, requires: ["proposal"] }] :
               withDesign ? [artifacts[0], artifacts[1], { id: "design", status: "done", outputPath: "design.md", requires: ["specs"] }, artifacts[2]] : artifacts,
            applyRequires: custom ? ["checklist"] : ["tasks"], documents: [
            { artifactId: "proposal", selector: "proposal.md", label: "proposal.md" },
             ...(custom ? [{ artifactId: "checklist", selector: customSelector, label: customSelector }] : [
               ...[1, 2, 3].map((n) => ({ artifactId: "specs", selector: "specs/" + n + ".md", label: "specs/" + n + ".md" })),
               ...(withDesign ? [{ artifactId: "design", selector: "design.md", label: "design.md" }] : []),
              { artifactId: "tasks", selector: "tasks.md", label: "tasks.md" }]),
          ] });
    }
  </script><style>body{margin:0}iframe{display:block;width:100%;height:100vh;border:0}</style><iframe src="/panel/index.html" title="OpenSpec test panel"></iframe>`;
}

async function withPanel(run) {
  const browserName = process.env.OPENSPEC_TEST_BROWSER ?? "chromium";
  const engine = { chromium, firefox, webkit }[browserName];
  if (!["chromium", "firefox", "webkit"].includes(browserName))
    throw new Error(`Unsupported OPENSPEC_TEST_BROWSER: ${browserName}`);
  const [html, js] = await Promise.all([
    readFile(new URL("../panel/index.html", import.meta.url)),
    readFile(new URL("../panel/main.js", import.meta.url)),
  ]);
  const server = createServer((request, response) => {
    const path = new URL(request.url, "http://127.0.0.1").pathname;
    if (path === "/") {
      response.setHeader("content-type", "text/html");
      response.end(hostHtml());
    } else if (path === "/panel/index.html") {
      response.setHeader("content-type", "text/html");
      response.end(html);
    } else if (path === "/panel/main.js") {
      response.setHeader("content-type", "text/javascript");
      response.end(js);
    } else {
      response.statusCode = 404;
      response.end();
    }
  });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  let browser;
  const pageErrors = [];
  try {
    browser = await engine.launch({ headless: true });
    await run(
      {
        newPage: async (...args) => {
          const page = await browser.newPage(...args);
          page.on("pageerror", (error) => pageErrors.push(error.message));
          return page;
        },
      },
      `http://127.0.0.1:${server.address().port}`,
    );
    if (pageErrors.length) throw new Error(`Browser page error: ${pageErrors.join("; ")}`);
  } finally {
    const cleanup = await Promise.allSettled([
      ...(browser ? [browser.close()] : []),
      new Promise((resolve, reject) =>
        server.close((error) => (error ? reject(error) : resolve())),
      ),
    ]);
    const failures = cleanup.filter((result) => result.status === "rejected");
    if (failures.length) throw new AggregateError(failures.map((result) => result.reason));
  }
}

test("language footer stays at window bottom with an inline label on board and detail", async () => {
  await withPanel(async (browser, url) => {
    for (const width of [320, 1076]) {
      for (const locale of ["en", "ru"]) {
        const page = await browser.newPage({ viewport: { width, height: 700 } });
        await page.goto(url);
        const panel = page.frameLocator("iframe");
        await panel.locator(".toolbar .refresh-control button:not(:disabled)").waitFor();
        await page.evaluate((locale) => __locale(locale), locale);
        await panel.locator(`html[lang="${locale}"]`).waitFor();
        const footer = panel.locator(".language-row");
        for (const view of ["short board", "detail", "long board"]) {
          if (view === "detail") {
            await panel.getByRole("button", { name: "first-change", exact: true }).click();
            await panel.locator(".detail-footer").waitFor();
          } else if (view === "long board") {
            await panel.locator(".detail-back button").click();
            await page.evaluate(() => __changeCount(60));
            await panel.locator(".toolbar .refresh-control button").click();
            await panel.locator(".toolbar .refresh-control button:not(:disabled)").waitFor();
            await panel.locator(".board-shell").evaluate(() => window.scrollTo(0, 200));
          }
          const geometry = await footer.evaluate((node) => {
            const box = node.getBoundingClientRect();
            const label = node.querySelector(".oc-sdk-field-label").getBoundingClientRect();
            const control = node.querySelector("button").getBoundingClientRect();
            return {
              bottom: Math.abs(box.bottom - innerHeight) < 1,
              inline:
                Math.abs((label.top + label.bottom - control.top - control.bottom) / 2) < 1 &&
                label.right <= control.left,
              last: node === document.querySelector("#root").lastElementChild,
              contained:
                box.left >= 0 &&
                box.right <= innerWidth &&
                document.documentElement.scrollWidth <= innerWidth,
            };
          });
          assert.deepEqual(
            geometry,
            { bottom: true, inline: true, last: true, contained: true },
            `${view} ${locale} ${width}px`,
          );
          if (view === "detail") {
            assert.equal(
              await panel
                .locator(".detail")
                .evaluate(
                  (node) =>
                    node.getBoundingClientRect().bottom <=
                    document.querySelector(".language-row").getBoundingClientRect().top + 1,
                ),
              true,
            );
          } else if (view === "long board") {
            await panel
              .locator(".board-shell")
              .evaluate(() => window.scrollTo(0, document.scrollingElement.scrollHeight));
            assert.equal(
              await panel
                .locator(".change-card")
                .last()
                .evaluate(
                  (node) =>
                    node.getBoundingClientRect().bottom <=
                    document.querySelector(".language-row").getBoundingClientRect().top + 1,
                ),
              true,
            );
          }
          const before = await page.evaluate(() => __requests.length);
          await footer.locator("button").click();
          const popup = panel.getByRole("listbox");
          await popup.waitFor();
          assert.equal(
            await popup.evaluate((node) => {
              const box = node.getBoundingClientRect();
              return box.top >= 0 && box.bottom <= innerHeight;
            }),
            true,
          );
          await popup.press("Escape");
          assert.equal(await page.evaluate(() => __requests.length), before);
        }
        await page.close();
      }
    }
  });
});

test("viewer language retained detail translates empty document fallbacks without rerender", async () => {
  await withPanel(async (browser, url) => {
    const page = await browser.newPage();
    await page.goto(url);
    const panel = page.frameLocator("iframe");
    await panel.locator(".toolbar .refresh-control button:not(:disabled)").waitFor();
    await page.evaluate(() =>
      __document(
        "proposal.md",
        "# Original heading\n\n- [ ] []()\n- [ ] ![](https://example.test/task.png)\n\n![](https://example.test/image.png)",
      ),
    );
    await panel.getByRole("button", { name: "first-change", exact: true }).click();
    const content = panel.locator(".document-content").first();
    await content.getByRole("heading", { name: "Original heading" }).waitFor();
    await content.evaluate((node) => {
      window.retainedDocumentHeading = node.querySelector("h1");
    });
    assert.equal(
      await content.getByRole("checkbox", { name: "Document task", exact: true }).count(),
      1,
    );
    const requests = await page.evaluate(() => __requests.length);
    await page.evaluate(() => __locale("ru"));
    await panel.locator('html[lang="ru"]').waitFor();
    assert.equal(
      await content.getByRole("checkbox", { name: "Задача документа", exact: true }).count(),
      1,
    );
    assert.equal(
      await content.getByRole("checkbox", { name: "Изображение", exact: true }).count(),
      1,
    );
    assert.deepEqual(await content.locator(".document-image-placeholder").allTextContents(), [
      "Изображение",
      "Изображение",
    ]);
    assert.equal(
      await content.evaluate((node) => node.querySelector("h1") === window.retainedDocumentHeading),
      true,
    );
    assert.equal(await content.getByRole("heading").textContent(), "Original heading");
    assert.equal(await page.evaluate(() => __requests.length), requests);
  });
});

test("viewer language dialogs retain create draft focus validation and uncertain attempt", async () => {
  await withPanel(async (browser, url) => {
    const page = await browser.newPage();
    await page.goto(url);
    const panel = page.frameLocator("iframe");
    await panel.getByRole("button", { name: "Create scaffold…", exact: true }).click();
    const dialog = panel.getByRole("dialog");
    const name = dialog.locator("input");
    await name.fill("Invalid");
    await dialog.getByRole("textbox", { name: "Goal", exact: true }).fill("Original goal");
    await dialog.getByRole("button", { name: "Create", exact: true }).click();
    await name.focus();
    const before = await page.evaluate(() => __requests.length);
    await page.evaluate(() => __locale("ru"));
    await dialog.getByRole("heading", { name: "Новое изменение" }).waitFor();
    assert.equal(await name.inputValue(), "Invalid");
    assert.equal(
      await dialog.getByRole("textbox", { name: "Цель", exact: true }).inputValue(),
      "Original goal",
    );
    assert.equal(await name.evaluate((el) => el === document.activeElement), true);
    assert.match(await dialog.innerText(), /Используйте строчные/);
    assert.equal(await page.evaluate(() => __requests.length), before);
    await name.fill("uncertain-change");
    await page.evaluate(() => {
      __unknownCreate();
      __failNextListing();
    });
    await dialog.getByRole("button", { name: "Создать", exact: true }).click();
    await dialog.getByRole("button", { name: "Повторить чтение", exact: true }).waitFor();
    assert.match(await dialog.innerText(), /Результат создания неизвестен\. Cannot check listing/);
    const uncertain = await page.evaluate(() => __requests.length);
    await page.evaluate(() => __locale("en"));
    await dialog.getByRole("button", { name: "Retry read", exact: true }).waitFor();
    assert.match(await dialog.innerText(), /Creation outcome is unknown\. Cannot check listing/);
    assert.equal(await page.evaluate(() => __requests.length), uncertain);
    await dialog.getByRole("button", { name: "Retry read", exact: true }).click();
    await dialog.getByRole("button", { name: "Inspect change", exact: true }).waitFor();
    const observed = await page.evaluate(() => __requests.length);
    await page.evaluate(() => __locale("ru"));
    await dialog.getByRole("button", { name: "Просмотреть изменение", exact: true }).waitFor();
    assert.equal(await page.evaluate(() => __requests.length), observed);
    assert.equal(
      await page.evaluate(() => __requests.filter((r) => r.path === "/create").length),
      1,
    );
  });
});

test("viewer language dialogs retain delete unresolved mode and archive confirmation", async () => {
  await withPanel(async (browser, url) => {
    const page = await browser.newPage();
    await page.goto(url);
    const panel = page.frameLocator("iframe");
    await panel.getByRole("button", { name: "first-change", exact: true }).click();
    await panel.getByRole("button", { name: "Delete change", exact: true }).click();
    const dialog = panel.getByRole("dialog");
    const before = await page.evaluate(() => __requests.length);
    await page.evaluate(() => __locale("ru"));
    await dialog.getByRole("heading", { name: "Удалить first-change?" }).waitFor();
    assert.match(await dialog.innerText(), /не отменяет реализацию/);
    assert.equal(await page.evaluate(() => __requests.length), before);
    await page.evaluate(() => {
      __keepOnUnknownDelete();
      __failNextListing();
    });
    await dialog.getByRole("button", { name: "Удалить", exact: true }).click();
    await dialog.getByRole("button", { name: "Повторить чтение", exact: true }).waitFor();
    const unresolved = await page.evaluate(() => __requests.length);
    await page.evaluate(() => __locale("en"));
    await dialog.getByRole("button", { name: "Retry read", exact: true }).waitFor();
    assert.equal(
      await dialog.getByRole("button", { name: "Cancel", exact: true }).isDisabled(),
      true,
    );
    assert.equal(await page.evaluate(() => __requests.length), unresolved);
    await dialog.getByRole("button", { name: "Retry read", exact: true }).click();
    await dialog.getByRole("button", { name: "Close", exact: true }).click();
    await panel.getByRole("button", { name: "Back to changes", exact: true }).click();
    await page.evaluate(() => __edit("done"));
    await panel.getByRole("button", { name: "Refresh", exact: true }).click();
    await panel.getByRole("button", { name: "Archive all", exact: true }).click();
    const confirmation = await page.evaluate(() => __requests.length);
    await page.evaluate(() => __locale("ru"));
    await dialog
      .getByRole("heading", { name: "Архивировать все завершённые изменения?" })
      .waitFor();
    assert.match(await dialog.innerText(), /Незавершённые изменения будут пропущены/);
    assert.equal(
      await dialog
        .getByRole("button", { name: "Отмена", exact: true })
        .evaluate((el) => el === document.activeElement),
      true,
    );
    assert.equal(await page.evaluate(() => __requests.length), confirmation);
    await dialog.getByRole("button", { name: "Отмена", exact: true }).click();
    assert.equal(
      await page.evaluate(() => __requests.filter((r) => r.path === "start-session").length),
      0,
    );
  });
});

test("viewer language dialogs retain goal validation pending writes reconciliation and original context", async () => {
  await withPanel(async (browser, url) => {
    const page = await browser.newPage();
    await page.goto(url);
    const panel = page.frameLocator("iframe");
    await panel.getByRole("button", { name: "Create scaffold…", exact: true }).click();
    const dialog = panel.getByRole("dialog");
    await dialog.locator("input").fill("pending-change");
    await dialog.getByRole("button", { name: "Create", exact: true }).click();
    assert.match(await dialog.innerText(), /Goal is required/);
    await dialog.locator("textarea").focus();
    await page.evaluate(() => __locale("ru"));
    await dialog.getByText("Укажите цель.", { exact: true }).waitFor();
    assert.equal(
      await dialog.locator("textarea").evaluate((el) => el === document.activeElement),
      true,
    );
    await dialog.locator("textarea").fill("Keep this goal");
    assert.equal(await dialog.getByText("Укажите цель.", { exact: true }).count(), 0);
    await page.evaluate(() => {
      __unknownCreate();
      __holdCreate();
      __holdListing();
    });
    await dialog.getByRole("button", { name: "Создать", exact: true }).click();
    await page.waitForFunction(() => __requests.some((r) => r.path === "/create"));
    await dialog.getByRole("button", { name: "Отмена", exact: true }).focus();
    const pending = await page.evaluate(() => __requests.length);
    await page.evaluate(() => __locale("en"));
    await dialog.getByRole("heading", { name: "New change", exact: true }).waitFor();
    assert.equal(await dialog.locator("input").isDisabled(), true);
    assert.equal(await dialog.locator("input").inputValue(), "pending-change");
    assert.equal(await dialog.locator("textarea").inputValue(), "Keep this goal");
    assert.equal(
      await dialog
        .getByRole("button", { name: "Cancel", exact: true })
        .evaluate((el) => el === document.activeElement),
      true,
    );
    assert.equal(await page.evaluate(() => __requests.length), pending);
    await page.evaluate(() => __releaseCreate());
    await dialog
      .getByText("Checking the original project for a matching change…", { exact: true })
      .waitFor();
    const checking = await page.evaluate(() => __requests.length);
    await page.evaluate(() => __locale("ru"));
    await dialog
      .getByText("Проверка исходного проекта на наличие изменения с таким именем…", { exact: true })
      .waitFor();
    assert.equal(await page.evaluate(() => __requests.length), checking);
    await page.evaluate(() => __directory("/different-project"));
    await dialog.getByText(/Вернитесь в \/tmp\/fixture-project \(корень OpenSpec/).waitFor();
    await page.evaluate(() => __locale("en"));
    await dialog.getByText(/Return to \/tmp\/fixture-project \(OpenSpec root/).waitFor();
    assert.equal(await dialog.locator("textarea").inputValue(), "Keep this goal");
    await page.evaluate(() => __releaseListing());
    await dialog.getByRole("button", { name: "Inspect change", exact: true }).waitFor();
    assert.equal(
      await dialog.getByRole("button", { name: "Inspect change", exact: true }).isDisabled(),
      true,
    );
    assert.deepEqual(
      await page.evaluate(() => __requests.filter((r) => r.path === "/create").map((r) => r.body)),
      [
        {
          directory,
          root,
          planning: "fixture-planning",
          expectedRoot: root,
          expectedPlanning: "fixture-planning",
          name: "pending-change",
          goal: "Keep this goal",
        },
      ],
    );
    await page.goto(url);
    await panel.getByRole("button", { name: "first-change", exact: true }).click();
    await panel.getByRole("button", { name: "Delete change", exact: true }).click();
    await page.evaluate(() => {
      __holdDelete();
      __keepOnUnknownDelete();
      __holdListing();
    });
    await dialog.getByRole("button", { name: "Delete", exact: true }).click();
    await page.waitForFunction(() => __requests.some((r) => r.path === "/delete"));
    const deleting = await page.evaluate(() => __requests.length);
    await page.evaluate(() => __locale("ru"));
    await dialog.getByRole("heading", { name: "Удалить first-change?", exact: true }).waitFor();
    assert.equal(
      await dialog.getByRole("button", { name: "Удалить", exact: true }).isDisabled(),
      true,
    );
    assert.equal(
      await dialog.getByRole("button", { name: "Отмена", exact: true }).isDisabled(),
      true,
    );
    assert.equal(await page.evaluate(() => __requests.length), deleting);
    await page.evaluate(() => __releaseDelete());
    await dialog
      .getByText("Проверка наличия изменения в исходном проекте…", { exact: true })
      .waitFor();
    const reconciling = await page.evaluate(() => __requests.length);
    await page.evaluate(() => __locale("en"));
    await dialog
      .getByText("Checking the original project for this change…", { exact: true })
      .waitFor();
    assert.equal(await page.evaluate(() => __requests.length), reconciling);
    await page.evaluate(() => __releaseListing());
    await dialog.getByRole("button", { name: "Close", exact: true }).waitFor();
    await page.evaluate(() => __locale("ru"));
    await dialog.getByRole("button", { name: "Закрыть", exact: true }).waitFor();
    assert.match(await dialog.innerText(), /Удаление не подтверждено/);
    assert.equal(
      await page.evaluate(() => __requests.filter((r) => r.path === "/delete").length),
      1,
    );
  });
});

test("viewer language dialogs translate absent creation and preserve raw rejection without granting retry", async () => {
  await withPanel(async (browser, url) => {
    const page = await browser.newPage();
    for (const rejected of [false, true]) {
      await page.goto(url);
      const panel = page.frameLocator("iframe");
      await panel.getByRole("button", { name: "Create scaffold…", exact: true }).click();
      const dialog = panel.getByRole("dialog");
      await dialog.locator("input").fill("absent-change");
      await dialog.locator("textarea").fill("Raw goal");
      await page.evaluate((rejected) => {
        __createReply(rejected ? "known-error" : "invalid-json", false);
      }, rejected);
      await dialog.getByRole("button", { name: "Create", exact: true }).click();
      await dialog
        .getByText(
          rejected
            ? "Known rejection"
            : "Creation outcome is unknown. The original project was refreshed; no matching change was found.",
          { exact: true },
        )
        .waitFor();
      const before = await page.evaluate(() => __requests.length);
      await page.evaluate(() => __locale("ru"));
      await dialog.getByRole("heading", { name: "Новое изменение", exact: true }).waitFor();
      assert.match(
        await dialog.innerText(),
        rejected
          ? /Known rejection/
          : /Данные исходного проекта обновлены; изменение с таким именем не найдено/,
      );
      assert.equal(await dialog.locator("input").inputValue(), "absent-change");
      assert.equal(await dialog.locator("textarea").inputValue(), "Raw goal");
      assert.equal(
        await dialog.getByRole("button", { name: "Создать", exact: true }).isEnabled(),
        true,
      );
      assert.equal(await page.evaluate(() => __requests.length), before);
      const submit = dialog.getByRole("button", { name: "Создать", exact: true });
      await submit.focus();
      await page.mouse.move(1, 1);
      assert.equal(await dialog.getByRole("tooltip").count(), 0);
      await submit.hover();
      await dialog.getByRole("tooltip").filter({ hasText: "агент не запускается" }).waitFor();
      await page.mouse.move(1, 1);
      assert.equal(await dialog.getByRole("tooltip").count(), 0);
    }
  });
});

test("viewer language operation feedback translates new toasts session titles and prompts not raw errors", async () => {
  await withPanel(async (browser, url) => {
    const page = await browser.newPage();
    const prompts = [];
    for (const ru of [false, true]) {
      await page.goto(url);
      const panel = page.frameLocator("iframe");
      await panel.getByRole("button", { name: "first-change", exact: true }).waitFor();
      if (ru) await page.evaluate(() => __locale("ru"));
      const initialReads = await page.evaluate(
        () => __requests.filter((r) => r.path.startsWith("/")).length,
      );
      await panel
        .getByRole("button", {
          name: ru ? "Краткое руководство OpenSpec" : "OpenSpec quickstart",
          exact: true,
        })
        .click();
      await page.waitForFunction(() => __requests.some((r) => r.path === "open-url"));
      await page.evaluate(() => __failOpenUrl());
      await panel
        .getByRole("button", {
          name: ru ? "Краткое руководство OpenSpec" : "OpenSpec quickstart",
          exact: true,
        })
        .click();
      await page.waitForFunction(() =>
        __requests.some((r) => r.path === "toast" && r.body.message === "Cannot open quickstart"),
      );
      assert.equal(
        await page.evaluate(() => __requests.filter((r) => r.path.startsWith("/")).length),
        initialReads,
      );
      await page.evaluate(() => __document("proposal.md", "[Raw link](https://example.com/raw)"));
      await panel.getByRole("button", { name: "first-change", exact: true }).click();
      await panel.getByRole("link", { name: "Raw link", exact: true }).click();
      await page.waitForFunction(
        () => __requests.filter((r) => r.path === "open-url").length === 3,
      );
      await page.evaluate(() => __failOpenUrl());
      await panel.getByRole("link", { name: "Raw link", exact: true }).click();
      await page.waitForFunction(
        () =>
          __requests.filter(
            (r) => r.path === "toast" && r.body.message === "Cannot open quickstart",
          ).length === 2,
      );
      await panel
        .getByRole("button", {
          name: ru ? "Копировать имя изменения" : "Copy change name",
          exact: true,
        })
        .click();
      await page.waitForFunction(
        (message) => __requests.some((r) => r.path === "toast" && r.body.message === message),
        ru ? "Имя изменения скопировано" : "Change name copied",
      );
      await page.evaluate(() => __failClipboard());
      await panel
        .getByRole("button", {
          name: ru ? "Копировать имя изменения" : "Copy change name",
          exact: true,
        })
        .click();
      await page.waitForFunction(() =>
        __requests.some((r) => r.path === "toast" && r.body.message === "Clipboard unavailable"),
      );
      await panel.getByRole("button", { name: ru ? "Выполнить" : "Apply", exact: true }).click();
      await panel
        .getByRole("menuitem", {
          name: ru ? "Подготовить в текущем чате" : "Prepare in current chat",
          exact: true,
        })
        .click();
      await page.waitForFunction(
        (message) => __requests.some((r) => r.path === "toast" && r.body.message === message),
        ru
          ? "Запрос сценария подготовлен в открытом редакторе сообщения."
          : "Workflow prompt prepared in the open composer.",
      );
      prompts.push(await page.evaluate(() => __requests.find((r) => r.path === "compose").body));
      await page.evaluate(() => __failCompose());
      await panel.getByRole("button", { name: ru ? "Выполнить" : "Apply", exact: true }).click();
      await panel
        .getByRole("menuitem", {
          name: ru ? "Подготовить в текущем чате" : "Prepare in current chat",
          exact: true,
        })
        .click();
      await page.waitForFunction(() =>
        __requests.some((r) => r.path === "toast" && r.body.message === "Composer unavailable"),
      );
      await page.evaluate(() => __edit("done"));
      await panel
        .getByRole("button", { name: ru ? "Назад к изменениям" : "Back to changes", exact: true })
        .click();
      await panel.getByRole("button", { name: ru ? "Обновить" : "Refresh", exact: true }).click();
      await panel
        .getByRole("button", { name: ru ? "Архивировать все" : "Archive all", exact: true })
        .click();
      await panel
        .getByRole("button", { name: ru ? "Начать архивацию" : "Start archiving", exact: true })
        .click();
      await page.waitForFunction(() =>
        __requests.some((r) => r.path === "toast" && r.body.message.includes("archive-session")),
      );
      const launch = await page.evaluate(
        () => __requests.find((r) => r.path === "start-session").body,
      );
      assert.equal(
        launch.title,
        ru ? "Архивировать завершённые изменения OpenSpec" : "Archive completed OpenSpec changes",
      );
      prompts.push(launch.text);
    }
    assert.match(prompts[0].text, /^Use your skill tool/);
    assert.match(prompts[2].text, /^Используй инструмент навыков/);
    assert.deepEqual({ ...prompts[0], text: "" }, { ...prompts[2], text: "" });
    assert.match(prompts[1], /^Archive all completed OpenSpec changes/);
    assert.match(prompts[3], /^Архивируй все завершённые изменения OpenSpec/);
    for (const command of [
      "openspec list --json",
      'openspec status --change "<name>" --json',
      "openspec-archive-change",
    ]) {
      assert.ok(prompts[1].includes(command));
      assert.ok(prompts[3].includes(command));
    }
    for (const policy of [
      /положительным общим числом задач/,
      /done.*skipped/,
      /Не используй.*незавершённой работе/,
      /последовательно/,
      /после.*предыдущей архивации/,
      /не вноси изменений в OpenSpec/,
    ])
      assert.match(prompts[3], policy);
  });
});

test("viewer language operation feedback covers worktree inspection and partial launches in both languages", async () => {
  await withPanel(async (browser, url) => {
    const page = await browser.newPage();
    const tree = {
      directory: "/retained",
      name: "first-change",
      branch: "first-change",
      status: "ready",
    };
    const cases = [
      { setup: "missing", en: /Cannot identify/, ru: /Не удалось определить/ },
      {
        setup: "error",
        en: /Host workspace inspection failed.*Inspect/,
        ru: /Не удалось проверить.*Проверьте/,
      },
      {
        setup: "event-error",
        en: /^Host workspace inspection failed\.$/,
        ru: /^Не удалось проверить рабочее пространство хоста\.$/,
      },
      {
        setup: "timeout",
        en: /timed out.*No creation/,
        ru: /Истекло время.*Создание не запрашивалось/,
      },
      {
        setup: "coverage",
        en: /Session inspection is incomplete/,
        ru: /Проверка сеансов не завершена/,
      },
      {
        setup: "collision",
        en: /first-change already exists at \/retained/,
        ru: /first-change уже существует по пути \/retained/,
      },
      {
        setup: "session-collision",
        en: /first-change already exists \(session existing-id\)/,
        ru: /first-change уже существует \(сеанс existing-id\)/,
      },
      { setup: "unavailable", en: /no longer applicable/, ru: /больше не доступно для выполнения/ },
      {
        result: {
          sessionId: null,
          sent: "skipped",
          failure: "bootstrap-failed",
          directory: "/retained",
          worktree: tree,
        },
        en: /Apply creation failed \(bootstrap-failed\).*first-change at \/retained is retained/,
        ru: /Не удалось создать сеанс выполнения \(ошибка подготовки\).*first-change по пути \/retained сохранено/,
      },
      {
        result: {
          sessionId: null,
          sent: "skipped",
          failure: "session-create-failed",
          directory: "/retained",
          worktree: tree,
        },
        en: /Apply creation failed \(session-create-failed\)/,
        ru: /Не удалось создать сеанс выполнения \(ошибка создания сеанса\)/,
      },
      ...["no-model", "failed", "skipped"].map((sent) => ({
        result: { sessionId: "retained-id", sent, directory: "/retained", worktree: tree },
        en: /Session retained-id exists, but Apply submission was not confirmed/,
        ru: /Сеанс retained-id существует, но отправка запроса выполнения не подтверждена/,
      })),
      {
        result: { sessionId: "retained-id", sent: "sent", directory: "/wrong", worktree: tree },
        en: /unexpected worktree result/,
        ru: /неожиданными данными рабочего дерева/,
      },
      {
        result: {
          sessionId: "retained-id",
          sent: "sent",
          directory: "/retained",
          worktree: tree,
          linked: false,
        },
        en: /Apply submitted in session retained-id.*reference could not be saved/,
        ru: /Запрос выполнения отправлен в сеанс retained-id.*Не удалось сохранить ссылку/,
      },
      {
        setup: "open-failed",
        result: { sessionId: "retained-id", sent: "sent", directory: "/retained", worktree: tree },
        en: /session retained-id exists, but it could not be opened.*will not be repeated/,
        ru: /Сеанс выполнения retained-id существует, но открыть его не удалось.*не будет повторена/,
      },
      {
        setup: "launch-error",
        en: /outcome is uncertain.*Launch refused/,
        ru: /Результат запуска выполнения неизвестен.*Launch refused/,
      },
    ];
    const payloads = [];
    for (const ru of [false, true]) {
      for (const entry of cases) {
        await page.goto(url);
        const panel = page.frameLocator("iframe");
        await panel.getByRole("button", { name: "first-change", exact: true }).waitFor();
        if (ru) await page.evaluate(() => __locale("ru"));
        await page.evaluate(
          ({ setup, result, tree }) => {
            if (result) __startResult(result);
            if (setup === "missing") __projects([]);
            if (setup === "error") __workspaceState("error");
            if (setup === "event-error") __workspaceState("loading", "error");
            if (setup === "timeout") __workspaceState("loading");
            if (setup === "coverage")
              __sessionCoverage([{ directory: "/retained", state: "error" }]);
            if (setup === "collision") __worktrees([tree]);
            if (setup === "session-collision")
              __sessions([
                {
                  id: "existing-id",
                  title: "Raw title",
                  projectId: "origin-project",
                  directory: "/retained",
                  parentId: null,
                  createdAt: 0,
                  updatedAt: 0,
                  archivedAt: null,
                  worktree: tree,
                  activity: "idle",
                  outcome: null,
                  items: [],
                },
              ]);
            if (setup === "unavailable") __remove("first-change");
            if (setup === "open-failed") __failOpenSession();
            if (setup === "launch-error") __startError("HOST_TIMEOUT");
          },
          { ...entry, tree },
        );
        await panel
          .locator(".change-card")
          .filter({ hasText: "first-change" })
          .getByRole("button", { name: ru ? "Выполнить" : "Apply", exact: true })
          .click();
        await panel
          .getByRole("menuitem", {
            name: ru ? "Запустить в новом рабочем дереве" : "Run in new worktree",
            exact: true,
          })
          .click();
        await page.waitForFunction(
          (openFailed) =>
            __requests.filter((r) => r.path === "toast").length >= (openFailed ? 2 : 1),
          entry.setup === "open-failed",
        );
        const requests = await page.evaluate(() => __requests);
        const toast = requests.filter((r) => r.path === "toast").at(-1).body;
        assert.match(
          toast.message,
          ru ? entry.ru : entry.en,
          entry.setup ?? JSON.stringify(entry.result),
        );
        const launches = requests.filter((r) => r.path === "start-session");
        assert.equal(launches.length, entry.result || entry.setup === "launch-error" ? 1 : 0);
        if (launches.length) {
          assert.equal(
            launches[0].body.title,
            ru ? "Выполнить first-change" : "Apply first-change",
          );
          assert.match(
            launches[0].body.text,
            ru
              ? /^Используй инструмент навыков.*openspec-apply-change/
              : /^Use your skill tool.*openspec-apply-change/,
          );
          assert.match(
            launches[0].body.text,
            ru
              ? /проверь снова.*При блокировке.*не отмечай незавершённую работу/s
              : /verify again.*If blocked.*rather than marking unfinished work complete/s,
          );
          payloads.push({ ...launches[0].body, title: undefined, text: undefined });
        }
        assert.equal(
          requests.filter((r) => r.path === "open-session").length,
          entry.setup === "open-failed" || entry.result?.linked === false ? 1 : 0,
        );
        assert.equal(await page.evaluate(() => __draft()), "Earlier draft");
      }
    }
    assert.deepEqual(payloads.slice(0, payloads.length / 2), payloads.slice(payloads.length / 2));
  });
});

test("viewer language operation feedback covers archive failures references and late context without retry", async () => {
  await withPanel(async (browser, url) => {
    const page = await browser.newPage();
    const cases = [
      {
        sent: "sent",
        linked: true,
        en: /Archive prompt submitted in session archive-id.*refresh/,
        ru: /Запрос архивации отправлен в сеанс archive-id.*Обновите/,
      },
      {
        sent: "sent",
        linked: false,
        en: /reference could not be saved/,
        ru: /сохранить ссылку на сценарий не удалось/,
      },
      {
        sent: "no-model",
        linked: false,
        en: /No model was available.*reference was not saved/,
        ru: /Нет доступной модели.*Ссылка на сценарий не сохранена/,
      },
      ...["failed", "skipped"].map((sent) => ({
        sent,
        linked: true,
        en: new RegExp(`Submission ${sent}`),
        ru: new RegExp(`Отправка: ${sent === "failed" ? "ошибка" : "пропущено"}`),
      })),
      ...["NOT_GRANTED", "DISABLED", "NO_DIRECTORY", "HOST_REJECTED", "HOST_UNAVAILABLE"].map(
        (error) => ({
          error,
          en: /Archive launch failed: Launch refused/,
          ru: /Не удалось запустить архивацию: Launch refused/,
        }),
      ),
      {
        error: "HOST_TIMEOUT",
        en: /Archive launch outcome is uncertain/,
        ru: /Результат запуска архивации неизвестен/,
      },
      {
        noSession: true,
        en: /archive session could not be created/,
        ru: /Не удалось создать сеанс архивации/,
      },
      { late: true },
    ];
    for (const ru of [false, true]) {
      for (const entry of cases) {
        await page.goto(url);
        const panel = page.frameLocator("iframe");
        await panel.getByRole("button", { name: "first-change", exact: true }).waitFor();
        await page.evaluate(
          ({ ru, entry }) => {
            if (ru) __locale("ru");
            __edit("done");
            if (entry.error) __startError(entry.error);
            else if (entry.noSession)
              __startResult({
                sessionId: null,
                sent: "skipped",
                directory: "/retained",
                worktree: {
                  directory: "/retained",
                  name: "retained",
                  branch: "retained",
                  status: "ready",
                },
                failure: "session-create-failed",
              });
            else
              __startResult({
                sessionId: "archive-id",
                sent: entry.sent ?? "sent",
                linked: entry.linked ?? true,
              });
            if (entry.late) __holdStart();
          },
          { ru, entry },
        );
        await panel.getByRole("button", { name: ru ? "Обновить" : "Refresh", exact: true }).click();
        await panel
          .getByRole("button", { name: ru ? "Архивировать все" : "Archive all", exact: true })
          .click();
        await panel
          .getByRole("button", { name: ru ? "Начать архивацию" : "Start archiving", exact: true })
          .click();
        await page.waitForFunction(() => __requests.some((r) => r.path === "start-session"));
        if (entry.late) {
          await page.evaluate(() => {
            __session("different-session");
            __releaseStart();
          });
          await page.waitForFunction(
            (label) =>
              [
                ...document
                  .querySelector("iframe")
                  .contentDocument.querySelectorAll(".toolbar button"),
              ].some((button) => button.textContent === label && !button.disabled),
            ru ? "Архивировать все" : "Archive all",
          );
          assert.equal(
            await page.evaluate(() => __requests.filter((r) => r.path === "toast").length),
            0,
          );
        } else {
          await page.waitForFunction(() => __requests.some((r) => r.path === "toast"));
          const toast = await page.evaluate(() => __requests.find((r) => r.path === "toast").body);
          assert.match(toast.message, ru ? entry.ru : entry.en);
          if (entry.error === "HOST_TIMEOUT") assert.equal(toast.persistent, true);
        }
        assert.equal(
          await page.evaluate(
            () =>
              __requests.filter((r) => ["start-session", "prompt", "compose"].includes(r.path))
                .length,
          ),
          1,
        );
      }
    }
  });
});

test("viewer language retained detail preserves actual tab focus source selection expansion and scroll", async () => {
  await withPanel(async (browser, url) => {
    for (const width of [320, 1076]) {
      const page = await browser.newPage({ viewport: { width, height: 700 } });
      await page.goto(url);
      await page.evaluate(() =>
        __document("proposal.md", "Original source paragraph\n\n".repeat(200)),
      );
      await page.evaluate(() => __document("specs/2.md", "Second spec source\n\n".repeat(200)));
      const panel = page.frameLocator("iframe");
      await panel.getByRole("button", { name: "first-change", exact: true }).click();
      await panel.locator(".document-content p").first().waitFor();
      await panel.locator('.artifact-tabs [data-id="artifact:specs"]').focus();
      await panel.locator(".detail-content").evaluate((node) => {
        const text = node.querySelector(".document-content p").firstChild;
        const range = document.createRange();
        range.setStart(text, 1);
        range.setEnd(text, 8);
        getSelection().removeAllRanges();
        getSelection().addRange(range);
        window.originalDocumentText = text;
        node.scrollTop = 200;
      });
      const before = await page.evaluate(() => __requests.length);
      for (const mode of ["light", "dark"]) {
        await page.evaluate((mode) => {
          __theme(mode);
          __locale("ru-RU");
        }, mode);
        await panel
          .getByRole("button", { name: "Копировать имя изменения", exact: true })
          .waitFor();
        assert.match(
          await panel
            .locator('.artifact-tabs [data-id="artifact:specs"]')
            .getAttribute("aria-label"),
          /Спецификации · Написано/,
        );
        assert.deepEqual(
          await panel
            .locator(".detail-content")
            .evaluate((node) => [
              document.activeElement.dataset.id,
              node.querySelector(".document-content p").firstChild === originalDocumentText,
              getSelection().toString(),
              node.scrollTop,
              node.querySelector("details").open,
              document.querySelector('[role=tab][aria-selected="true"]').dataset.id,
            ]),
          ["artifact:specs", true, "riginal", 200, true, "artifact:proposal"],
        );
        assert.equal(await page.evaluate(() => __requests.length), before);
        await page.evaluate(() => __locale("en"));
        await panel.getByRole("button", { name: "Copy change name", exact: true }).waitFor();
      }
      await panel.getByRole("tab", { name: /Specs/ }).click();
      await panel.locator(".detail-content details").nth(1).locator("summary").click();
      await panel
        .locator(".detail-content details")
        .nth(1)
        .locator(".document-content p")
        .first()
        .waitFor();
      await panel.locator('.artifact-tabs [data-id="artifact:tasks"]').focus();
      await panel.locator(".detail-content").evaluate((node) => {
        window.retainedSpec = node
          .querySelectorAll("details")[1]
          .querySelector(".document-content p").firstChild;
        const range = document.createRange();
        range.setStart(retainedSpec, 0);
        range.setEnd(retainedSpec, 6);
        getSelection().removeAllRanges();
        getSelection().addRange(range);
        node.scrollTop = 150;
      });
      const specReads = await page.evaluate(() => __requests.length);
      await page.evaluate(() => __locale("ru"));
      await panel.getByRole("tab", { name: /Спецификации/ }).waitFor();
      assert.deepEqual(
        await panel
          .locator(".detail-content")
          .evaluate((node) => [
            [...node.querySelectorAll("details")].map((detail) => detail.open),
            node.querySelectorAll("details")[1].querySelector(".document-content p").firstChild ===
              retainedSpec,
            getSelection().toString(),
            node.scrollTop,
            document.activeElement.dataset.id,
          ]),
        [[false, true, false], true, "Second", 150, "artifact:tasks"],
      );
      assert.equal(await page.evaluate(() => __requests.length), specReads);
      await panel.getByRole("tab", { name: /Задачи/ }).click();
      await panel.getByText("1.1 CLI description", { exact: true }).waitFor();
      await page.evaluate(() => __locale("ru"));
      await panel.getByRole("tab", { name: /Задачи/ }).waitFor();
      await panel.getByRole("img", { name: "Ожидает выполнения", exact: true }).waitFor();
      assert.equal(await panel.locator(".task-title").first().textContent(), "1.1 CLI description");
      await page.close();
    }
  });
});

test("viewer language workflow payloads localize every registry entry without changing requests", async () => {
  await withPanel(async (browser, url) => {
    const page = await browser.newPage();
    await page.goto(url);
    const panel = page.frameLocator("iframe");
    await panel.getByRole("button", { name: "first-change", exact: true }).waitFor();
    for (const [surface, stage] of [
      [".heading-actions", "ready"],
      ...["planning", "ready", "progress", "complete"].flatMap((stage) => [
        [".change-card:first-child .card-actions", stage],
        [".detail-footer", stage],
      ]),
    ]) {
      await page.goto(url + "?hold-ready");
      await page.waitForFunction(() => typeof __releaseReady === "function");
      await page.evaluate((stage) => {
        __workflowStage(stage);
        __releaseReady();
      }, stage);
      await panel.getByRole("button", { name: "first-change", exact: true }).waitFor();
      if (surface === ".detail-footer")
        await panel.getByRole("button", { name: "first-change", exact: true }).click();
      const owner = panel.locator(surface).first();
      const results = [];
      for (const locale of ["en", "ru"]) {
        await page.evaluate((locale) => __locale(locale), locale);
        if (locale === "ru" && surface !== ".detail-footer")
          await panel
            .getByRole("progressbar", { name: /из .* задач выполнено/ })
            .first()
            .waitFor();
        const trigger = owner.getByRole("button", {
          name: locale === "en" ? "Workflows" : "Сценарии",
          exact: true,
        });
        const count = surface === ".heading-actions" ? 6 : 7;
        const payloads = [];
        for (let index = 0; index < count; index++) {
          await trigger.click();
          const rows = panel.getByRole("menuitem");
          if (locale === "ru") {
            assert.match(await rows.nth(index).getAttribute("aria-label"), /[А-Яа-я]/);
            assert.match(
              await rows.nth(index).locator(".workflow-description").textContent(),
              /[А-Яа-я]/,
            );
          }
          const before = await page.evaluate(
            () => __requests.filter((r) => r.path === "compose").length,
          );
          await rows.nth(index).click();
          await page.waitForFunction(
            (before) => __requests.filter((r) => r.path === "compose").length > before,
            before,
          );
          payloads.push(
            await page.evaluate(() => __requests.filter((r) => r.path === "compose").at(-1).body),
          );
        }
        results.push(payloads);
      }
      for (let index = 0; index < results[0].length; index++) {
        const en = results[0][index],
          ru = results[1][index];
        assert.match(en.text, /^Use your skill tool/);
        assert.match(ru.text, /^Используй инструмент навыков/);
        assert.equal(ru.text.match(/openspec-[a-z-]+/)[0], en.text.match(/openspec-[a-z-]+/)[0]);
        assert.deepEqual({ ...en, text: "" }, { ...ru, text: "" });
        const policies =
          surface === ".heading-actions"
            ? [
                /задумал пользователь.*существующего изменения/,
                /без изменения файлов.*реализации/,
                /задумал пользователь/,
                /задумал пользователь/,
                /выбор кандидатов.*оценку конфликтов.*подтверждение/,
                /разрешение на настройку.*выбор.*задачи/,
              ]
            : [
                /не более одного.*артефакта.*Не создавай.*не реализуй/s,
                /проверь снова.*блокировк/s,
                /Не реализуй задачи.*не архивируй/,
                /обязательные вопросы.*Не реализуй/s,
                /не предполагай.*проверено.*разрешена/,
                /без реализации.*архивации/,
                /без изменения файлов.*реализации/,
              ];
        assert.match(ru.text, policies[index]);
      }
    }
    assert.equal(
      await page.evaluate(() =>
        __requests.some((r) => ["prompt", "start-session"].includes(r.path)),
      ),
      false,
    );
    await page.close();
  });
});

test("viewer language retained detail translates readiness custom tabs retries fallback and retained local errors", async () => {
  await withPanel(async (browser, url) => {
    const page = await browser.newPage();
    const panel = page.frameLocator("iframe");
    await page.goto(url + "?hold-ready");
    await page.waitForFunction(() => typeof __releaseReady === "function");
    await page.evaluate(() => {
      __readiness("pending");
      __releaseReady();
    });
    await panel.getByRole("button", { name: "first-change", exact: true }).click();
    await page.evaluate(() => __locale("ru"));
    await panel
      .getByText("Артефакт готов к написанию. Продолжите планирование в чате.", { exact: true })
      .waitFor();
    await panel.getByRole("tab", { name: /Спецификации/ }).click();
    await panel
      .getByText("Заблокировано, пока не написаны или не пропущены: Предложение.", { exact: true })
      .waitFor();
    await panel.getByRole("tab", { name: /Проектирование/ }).click();
    await panel.getByText("Этот артефакт пропущен.", { exact: true }).waitFor();
    await page.goto(url);
    await panel.getByRole("button", { name: "first-change", exact: true }).waitFor();
    await page.evaluate(() => {
      __custom();
      __failDocument();
      __failTasks();
    });
    await panel.getByRole("button", { name: "Refresh", exact: true }).click();
    await panel.locator(".toolbar .refresh-control button:not(:disabled)").waitFor();
    await panel.getByRole("button", { name: "first-change", exact: true }).click();
    await panel.getByRole("button", { name: "Retry document", exact: true }).waitFor();
    const retry = await panel
      .getByRole("button", { name: "Retry document", exact: true })
      .elementHandle();
    const before = await page.evaluate(() => __requests.length);
    await page.evaluate(() => __locale("ru"));
    await panel.getByRole("button", { name: "Повторить чтение документа", exact: true }).waitFor();
    assert.equal(
      await panel
        .getByRole("button", { name: "Повторить чтение документа", exact: true })
        .evaluate((node, original) => node === original, retry),
      true,
    );
    await panel.getByText("Retry this document", { exact: true }).waitFor();
    await panel.getByRole("tab", { name: /checklist/ }).waitFor();
    assert.equal(await page.evaluate(() => __requests.length), before);
    await panel.getByRole("tab", { name: /Задачи/ }).click();
    await panel.getByRole("button", { name: "Повторить чтение задач", exact: true }).waitFor();
    await panel.getByText("Retry these tasks", { exact: true }).waitFor();

    await page.goto(url);
    await panel.getByRole("button", { name: "first-change", exact: true }).waitFor();
    await page.evaluate(() => __document("proposal.md", "x".repeat(4 * 1024 * 1024)));
    await panel.getByRole("button", { name: "first-change", exact: true }).click();
    await panel
      .getByText("Session read limit reached. Refresh to clear retained reads.", { exact: true })
      .waitFor();
    const reads = await page.evaluate(() => __requests.length);
    await page.evaluate(() => __locale("ru"));
    await panel
      .getByText(
        "Достигнут лимит чтения сеанса. Обновите данные, чтобы очистить сохранённые результаты чтения.",
        { exact: true },
      )
      .waitFor();
    await page.evaluate(() => __locale("en"));
    await panel
      .getByText("Session read limit reached. Refresh to clear retained reads.", { exact: true })
      .waitFor();
    assert.equal(await page.evaluate(() => __requests.length), reads);

    await page.goto(url);
    await panel.getByRole("button", { name: "first-change", exact: true }).waitFor();
    await panel.locator("body").evaluate(() => {
      const replace = Element.prototype.replaceChildren;
      Element.prototype.replaceChildren = function (...nodes) {
        if (this.classList.contains("document-content")) {
          Element.prototype.replaceChildren = replace;
          throw new Error("fixture renderer failure");
        }
        return replace.apply(this, nodes);
      };
    });
    await panel.getByRole("button", { name: "first-change", exact: true }).click();
    await panel
      .getByText("Document rendering failed. Original source is shown.", { exact: true })
      .waitFor();
    const source = await panel.locator(".document-content pre").elementHandle();
    await page.evaluate(() => __locale("ru"));
    await panel
      .getByText("Не удалось отобразить документ. Показан исходный текст.", { exact: true })
      .waitFor();
    assert.equal(
      await panel
        .locator(".document-content pre")
        .evaluate((node, original) => node === original, source),
      true,
    );
    assert.equal(
      await panel.locator(".document-content pre").textContent(),
      "First version of proposal",
    );
    await panel.getByRole("button", { name: "Назад к изменениям", exact: true }).click();
    await page.evaluate(() => __batchReply("malformed"));
    await panel.getByRole("button", { name: "Обновить", exact: true }).click();
    await panel
      .getByText("Локальный сервис OpenSpec вернул недопустимые данные.", { exact: true })
      .waitFor();
    const clientReads = await page.evaluate(() => __requests.length);
    await page.evaluate(() => __locale("en"));
    await panel
      .getByText("The local OpenSpec service returned invalid data.", { exact: true })
      .waitFor();
    assert.equal(await page.evaluate(() => __requests.length), clientReads);
    await page.close();
  });
});

test("viewer language workflow payloads primary stages and Apply destinations match on card and detail", async () => {
  await withPanel(async (browser, url) => {
    for (const surface of ["card", "detail"]) {
      for (const stage of ["planning", "ready", "progress", "complete"]) {
        const page = await browser.newPage();
        await page.goto(url + "?hold-ready");
        await page.waitForFunction(() => typeof __releaseReady === "function");
        await page.evaluate((stage) => {
          __workflowStage(stage);
          __releaseReady();
        }, stage);
        const panel = page.frameLocator("iframe");
        await panel.getByRole("button", { name: "first-change", exact: true }).waitFor();
        if (surface === "detail")
          await panel.getByRole("button", { name: "first-change", exact: true }).click();
        const owner =
          surface === "detail"
            ? panel.locator(".detail-footer")
            : panel
                .locator(".change-card")
                .filter({ has: panel.getByRole("button", { name: "first-change", exact: true }) });
        const payloads = [];
        for (const locale of ["en", "ru"]) {
          await page.evaluate((locale) => __locale(locale), locale);
          const labels =
            locale === "en"
              ? {
                  planning: "Plan",
                  ready: "Apply",
                  progress: "Apply",
                  complete: "Archive",
                }
              : {
                  planning: "Планировать",
                  ready: "Выполнить",
                  progress: "Выполнить",
                  complete: "Архивировать",
                };
          await owner.getByRole("button", { name: labels[stage], exact: true }).click();
          if (["ready", "progress"].includes(stage))
            await panel
              .getByRole("menuitem", {
                name: locale === "en" ? "Prepare in current chat" : "Подготовить в текущем чате",
                exact: true,
              })
              .click();
          await page.waitForFunction(
            (count) => __requests.filter((r) => r.path === "compose").length === count,
            payloads.length + 1,
          );
          payloads.push(
            await page.evaluate(() => __requests.filter((r) => r.path === "compose").at(-1).body),
          );
        }
        assert.match(payloads[0].text, /^Use your skill tool/);
        assert.match(payloads[1].text, /^Используй инструмент навыков/);
        assert.deepEqual({ ...payloads[0], text: "" }, { ...payloads[1], text: "" });
        if (["ready", "progress"].includes(stage)) {
          if (stage === "progress") {
            assert.match(
              payloads[0].text,
              /\n1 of 2 tasks complete\. Pick up where implementation left off/,
            );
            assert.match(payloads[1].text, /\nВыполнено задач: 1 из 2\. Продолжи реализацию/);
          } else {
            assert.doesNotMatch(payloads[0].text, /\ntasks complete|\n\d+ of/);
            assert.doesNotMatch(payloads[1].text, /\nВыполнено задач:/);
          }
          const launches = [];
          for (const locale of ["en", "ru"]) {
            await page.evaluate((locale) => __locale(locale), locale);
            await owner
              .getByRole("button", { name: locale === "en" ? "Apply" : "Выполнить", exact: true })
              .click();
            await panel
              .getByRole("menuitem", {
                name: locale === "en" ? "Run in new worktree" : "Запустить в новом рабочем дереве",
                exact: true,
              })
              .click();
            await page.waitForFunction(
              (count) => __requests.filter((r) => r.path === "start-session").length === count,
              launches.length + 1,
            );
            await page.waitForFunction(
              (count) => __requests.filter((r) => r.path === "toast").length >= count,
              payloads.length + launches.length + 1,
            );
            launches.push(
              await page.evaluate(
                () => __requests.filter((r) => r.path === "start-session").at(-1).body,
              ),
            );
          }
          assert.equal(launches[0].text, payloads[0].text);
          assert.equal(launches[1].text, payloads[1].text);
          assert.deepEqual(launches[0].worktree, launches[1].worktree);
        }
        if (["planning", "complete"].includes(stage)) {
          const quick = [];
          for (const locale of ["en", "ru"]) {
            await page.evaluate((locale) => __locale(locale), locale);
            await owner
              .getByRole("button", {
                name:
                  stage === "planning"
                    ? locale === "en"
                      ? "Explore"
                      : "Исследовать"
                    : locale === "en"
                      ? "Verify"
                      : "Проверить",
                exact: true,
              })
              .click();
            await page.waitForFunction(
              (count) => __requests.filter((r) => r.path === "compose").length === count,
              3 + quick.length,
            );
            quick.push(
              await page.evaluate(() => __requests.filter((r) => r.path === "compose").at(-1).body),
            );
          }
          assert.match(quick[0].text, /^Use your skill tool/);
          assert.match(quick[1].text, /^Используй инструмент навыков/);
          assert.match(
            quick[1].text,
            stage === "planning"
              ? /openspec-explore.*\n.*Цель: Read the proposal/s
              : /openspec-verify-change/,
          );
          assert.match(
            quick[1].text,
            stage === "planning"
              ? /без изменения файлов и без реализации/
              : /без реализации и архивации/,
          );
          assert.deepEqual({ ...quick[0], text: "" }, { ...quick[1], text: "" });
        }
        await page.close();
      }
    }
  });
});

test("viewer language workflow prompts follow resolved preferences and preserve literal goals without inventing missing goals", async () => {
  await withPanel(async (browser, url) => {
    const goal = 'Keep "quoted" paths /specs/план\nand mixed English + русский unchanged';
    for (const preference of ["en", "ru", "auto"]) {
      for (const recorded of [goal, null]) {
        const page = await browser.newPage();
        await page.goto(
          url + "?hold-ready&language=" + encodeURIComponent(JSON.stringify(preference)),
        );
        await page.waitForFunction(() => typeof __releaseReady === "function");
        await page.evaluate(
          ({ recorded, preference }) => {
            __workflowStage("planning");
            __goal("first-change", recorded);
            __locale(preference === "en" ? "ru-RU" : "en-AU");
            __releaseReady();
          },
          { recorded, preference },
        );
        const panel = page.frameLocator("iframe");
        await panel.locator(".language-row button:not(:disabled)").waitFor();
        await panel.getByRole("button", { name: "first-change", exact: true }).click();
        let count = 0;
        for (const locale of [preference === "en" ? "ru-RU" : "en-AU", "ru-RU", "fr-FR"]) {
          await page.evaluate((locale) => __locale(locale), locale);
          const ru = preference === "ru" || (preference === "auto" && locale === "ru-RU");
          await panel.locator(`html[lang="${ru ? "ru" : "en"}"]`).waitFor();
          const reads = await page.evaluate(
            () => __requests.filter((r) => r.path.startsWith("/")).length,
          );
          await panel
            .locator(".detail-footer")
            .getByRole("button", { name: ru ? "Планировать" : "Plan", exact: true })
            .click();
          await page.waitForFunction(
            (count) => __requests.filter((r) => r.path === "compose").length === count,
            ++count,
          );
          const prompt = await page.evaluate(
            () => __requests.filter((r) => r.path === "compose").at(-1).body.text,
          );
          assert.match(
            prompt,
            ru
              ? /^Используй инструмент навыков.*openspec-continue-change/
              : /^Use your skill tool.*openspec-continue-change/,
          );
          if (recorded) assert.ok(prompt.includes(`\n${ru ? "Цель" : "Goal"}: ${goal}\n\n`));
          else assert.doesNotMatch(prompt, /\n(?:Goal|Цель):/);
          assert.match(
            prompt,
            ru
              ? /не выдумывай цель.*не записывай её метаданные автоматически/
              : /do not invent a goal or write goal metadata automatically/,
          );
          assert.equal(
            await page.evaluate(() => __requests.filter((r) => r.path.startsWith("/")).length),
            reads,
          );
          if (ru) {
            await panel.getByRole("tablist", { name: "Артефакты планирования" }).waitFor();
          }
        }
        await page.evaluate(() => __failStorage("set"));
        await panel.locator(".language-row button").click();
        await panel
          .getByRole("option", { name: preference === "ru" ? "English" : "Русский", exact: true })
          .click();
        await panel.locator(".language-warning:not(:empty)").waitFor();
        await panel
          .locator(".detail-footer")
          .getByRole("button", { name: preference === "ru" ? "Планировать" : "Plan", exact: true })
          .click();
        await page.waitForFunction(
          (count) => __requests.filter((r) => r.path === "compose").length === count,
          ++count,
        );
        assert.match(
          await page.evaluate(
            () => __requests.filter((r) => r.path === "compose").at(-1).body.text,
          ),
          preference === "ru" ? /^Используй инструмент навыков/ : /^Use your skill tool/,
        );
        assert.equal(
          await page.evaluate(() =>
            __requests.some((r) =>
              ["start-session", "prompt", "/create", "/delete"].includes(r.path),
            ),
          ),
          false,
        );
        await page.close();
      }
    }
  });
});

test("viewer language workflow prompts capture accepted worktree and composer language but emit current feedback", async () => {
  await withPanel(async (browser, url) => {
    const page = await browser.newPage();
    await page.goto(url);
    const panel = page.frameLocator("iframe");
    const card = panel
      .locator(".change-card")
      .filter({ has: panel.getByRole("button", { name: "first-change", exact: true }) });
    await card.waitFor();
    await page.evaluate(() => {
      __workspaceState("loading");
      __startResult({
        sessionId: "captured-session",
        sent: "sent",
        linked: true,
        directory: "/retained",
        worktree: {
          directory: "/retained",
          name: "first-change",
          branch: "first-change",
          status: "ready",
        },
      });
    });
    await card.getByRole("button", { name: "Apply", exact: true }).click();
    await panel.getByRole("menuitem", { name: "Run in new worktree", exact: true }).click();
    await page.waitForFunction(() => __requests.some((r) => r.path === "workspace-subscribe"));
    assert.equal(
      await page.evaluate(() => __requests.filter((r) => r.path === "start-session").length),
      0,
    );
    await page.evaluate(() => __locale("ru"));
    await panel.locator('html[lang="ru"]').waitFor();
    await page.evaluate(() => __releaseWorkspace());
    await page.waitForFunction(() => __requests.some((r) => r.path === "toast"));
    const launch = await page.evaluate(
      () => __requests.find((r) => r.path === "start-session").body,
    );
    assert.equal(launch.title, "Apply first-change");
    assert.match(launch.text, /^Use your skill tool.*openspec-apply-change/);
    assert.match(
      await page.evaluate(() => __requests.find((r) => r.path === "toast").body.message),
      /Запрос выполнения отправлен в сеанс captured-session/,
    );
    await page.evaluate(() => __holdCompose());
    await card.getByRole("button", { name: "Выполнить", exact: true }).click();
    await panel.getByRole("menuitem", { name: "Подготовить в текущем чате", exact: true }).click();
    await page.waitForFunction(() => __requests.some((r) => r.path === "compose"));
    const accepted = await page.evaluate(
      () => __requests.find((r) => r.path === "compose").body.text,
    );
    assert.match(accepted, /^Используй инструмент навыков/);
    await page.evaluate(() => __locale("en"));
    await panel.locator('html[lang="en"]').waitFor();
    await page.evaluate(() => __releaseCompose());
    await page.waitForFunction(() => __requests.filter((r) => r.path === "toast").length === 2);
    assert.equal(await page.evaluate(() => __draft()), accepted);
    assert.equal(
      await page.evaluate(() => __requests.filter((r) => r.path === "toast").at(-1).body.message),
      "Workflow prompt prepared in the open composer.",
    );
    await page.evaluate(() => __locale("ru"));
    await panel.locator('html[lang="ru"]').waitFor();
    assert.equal(await page.evaluate(() => __draft()), accepted);
    assert.deepEqual(
      await page.evaluate(() =>
        ["start-session", "compose", "prompt"].map(
          (path) => __requests.filter((r) => r.path === path).length,
        ),
      ),
      [1, 1, 0],
    );
    await page.close();
  });
});

test("viewer language workflow archive prompt uses confirmation language without replay or board reads", async () => {
  await withPanel(async (browser, url) => {
    const page = await browser.newPage();
    await page.goto(url + "?hold-ready");
    await page.waitForFunction(() => typeof __releaseReady === "function");
    await page.evaluate(() => {
      __workflowStage("complete");
      __releaseReady();
    });
    const panel = page.frameLocator("iframe");
    await panel.getByRole("button", { name: "Archive all", exact: true }).click();
    const reads = await page.evaluate(
      () => __requests.filter((r) => r.path.startsWith("/")).length,
    );
    await page.evaluate(() => __locale("ru"));
    await panel.getByRole("button", { name: "Начать архивацию", exact: true }).click();
    await page.waitForFunction(() => __requests.some((r) => r.path === "toast"));
    const launch = await page.evaluate(
      () => __requests.find((r) => r.path === "start-session").body,
    );
    assert.equal(launch.title, "Архивировать завершённые изменения OpenSpec");
    assert.match(launch.text, /^Архивируй все завершённые изменения OpenSpec/);
    await page.evaluate(() => __locale("en"));
    await panel.locator('html[lang="en"]').waitFor();
    assert.equal(
      await page.evaluate(() => __requests.filter((r) => r.path.startsWith("/")).length),
      reads,
    );
    assert.deepEqual(
      await page.evaluate(() =>
        ["start-session", "compose", "prompt"].map(
          (path) => __requests.filter((r) => r.path === path).length,
        ),
      ),
      [1, 0, 0],
    );
    await page.close();
  });
});

test("viewer language workflow payloads retain active menu focus description scroll and stale capture", async () => {
  await withPanel(async (browser, url) => {
    const page = await browser.newPage({ viewport: { width: 320, height: 700 } });
    await page.goto(url);
    const panel = page.frameLocator("iframe");
    await panel.getByRole("button", { name: "first-change", exact: true }).waitFor();
    const trigger = panel.locator(".heading-actions .workflow-menu button");
    await trigger.click();
    await page.keyboard.press("End");
    const menu = panel.getByRole("menu");
    const active = await menu.getAttribute("aria-activedescendant");
    const menuScroll = await menu.evaluate((node) => node.scrollTop);
    const before = await page.evaluate(() => __requests.length);
    await page.evaluate(() => {
      __locale("ru");
      __theme("light");
    });
    await panel.getByRole("menuitem", { name: "Введение в работу", exact: true }).waitFor();
    assert.equal(await menu.getAttribute("aria-activedescendant"), active);
    assert.equal(await menu.evaluate((node) => node.scrollTop), menuScroll);
    assert.equal(await menu.evaluate((node) => document.activeElement === node), true);
    assert.match(
      await menu.locator('[data-active="true"] .workflow-description').textContent(),
      /полного цикла/,
    );
    assert.equal(await panel.locator(".button-tooltip").count(), 0);
    assert.equal(await page.evaluate(() => __requests.length), before);
    await page.evaluate(() => __session("replacement"));
    await page.keyboard.press("Enter");
    await panel.getByRole("menu").waitFor({ state: "hidden" });
    assert.equal(
      await page.evaluate(() => __requests.filter((r) => r.path === "compose").length),
      0,
    );
    await trigger.click();
    await page.keyboard.press("End");
    await page.keyboard.press("Enter");
    await page.waitForFunction(() => __requests.some((r) => r.path === "compose"));
    assert.match(await page.evaluate(() => __draft()), /openspec-onboard/);
    await page.close();
  });
});

test("viewer language preference persists only successful choices and blocks concurrent writes", async () => {
  await withPanel(async (browser, url) => {
    const page = await browser.newPage();
    await page.goto(url);
    const panel = page.frameLocator("iframe");
    const picker = panel.locator(".language-row button");
    await picker.waitFor({ timeout: 2000 });
    await panel.locator(".toolbar .refresh-control button:not(:disabled)").waitFor();
    const reads = await page.evaluate(() => __requests.length);
    await picker.click();
    await panel.getByRole("option", { name: "Русский", exact: true }).click();
    await panel.getByRole("searchbox", { name: "Поиск изменений" }).waitFor();
    assert.equal(await panel.locator("html").getAttribute("lang"), "ru");
    await page.evaluate(() => {
      __holdStorage("set");
      __failStorage("set");
    });
    await picker.click();
    await panel.getByRole("option", { name: "English", exact: true }).click();
    assert.equal(await picker.getAttribute("aria-busy"), "true");
    assert.equal(await picker.evaluate((node) => document.activeElement === node), true);
    await picker.dispatchEvent("click");
    await picker.press("ArrowDown");
    assert.equal(await panel.getByRole("listbox").count(), 0);
    assert.equal(await page.evaluate(() => __storageCalls.filter((c) => c.op === "set").length), 2);
    await page.evaluate(() => __releaseStorage());
    await panel.locator(".language-warning:not(:empty)").waitFor();
    assert.equal(await panel.locator("html").getAttribute("lang"), "ru");
    assert.match(await picker.textContent(), /Русский/);
    assert.equal(await page.evaluate(() => __requests.length), reads);
    await picker.click();
    await panel.getByRole("option", { name: "Русский", exact: true }).click();
    assert.equal(await page.evaluate(() => __storageCalls.filter((c) => c.op === "set").length), 2);
    await page.evaluate(() => __remount());
    await panel.getByRole("searchbox", { name: "Поиск изменений" }).waitFor();
    assert.deepEqual(await page.evaluate(() => __storageCalls.filter((c) => c.op === "get")), [
      { op: "get", key: "ui.language" },
      { op: "get", key: "ui.language" },
    ]);
  });
});

test("viewer language preference automatic read failures invalid values and latest locale", async () => {
  await withPanel(async (browser, url) => {
    for (const saved of [undefined, "auto", "en", "ru", null, "bad", 42]) {
      const page = await browser.newPage();
      await page.goto(
        url +
          "?hold-storage=get" +
          (saved === undefined ? "" : "&language=" + encodeURIComponent(JSON.stringify(saved))),
      );
      const panel = page.frameLocator("iframe");
      const picker = panel.locator(".language-row button");
      await picker.waitFor({ timeout: 2000 });
      assert.equal(await picker.isDisabled(), true);
      await panel.getByRole("button", { name: "first-change", exact: true }).waitFor();
      await page.evaluate(() => __locale("RU-ru"));
      await panel.getByRole("searchbox", { name: "Поиск изменений" }).waitFor();
      await page.evaluate(() => __releaseStorage());
      await panel.locator(".language-row button:not(:disabled)").waitFor();
      assert.equal(await panel.locator("html").getAttribute("lang"), saved === "en" ? "en" : "ru");
      assert.equal(
        (await panel.locator(".language-warning").textContent()) !== "",
        saved === null || saved === "bad" || saved === 42,
      );
      await page.evaluate(() => __locale("fr-FR"));
      await panel.locator(`html[lang="${saved === "ru" ? "ru" : "en"}"]`).waitFor();
      assert.equal(await page.evaluate(() => __storageCalls.length), 1);
      await page.close();
    }
    const page = await browser.newPage();
    await page.goto(url + "?fail-storage=get");
    const panel = page.frameLocator("iframe");
    await panel.locator(".language-warning:not(:empty)").waitFor({ timeout: 2000 });
    assert.match(await panel.locator(".language-warning").textContent(), /read/i);
    await page.evaluate(() => __locale("ru-RU"));
    await panel.getByRole("searchbox", { name: "Поиск изменений" }).waitFor();
    assert.match(await panel.locator(".language-warning").textContent(), /прочитать/);
    for (const locale of ["ru", "Ru-RU", "ru-!", "russian", "en-AU"]) {
      await page.evaluate((locale) => __locale(locale), locale);
      await panel
        .locator(`html[lang="${["ru", "Ru-RU"].includes(locale) ? "ru" : "en"}"]`)
        .waitFor();
    }
    assert.equal(await page.evaluate(() => __storageCalls.length), 1);
  });
});

test("viewer language retained board preserves search caret retry identity counts and reads", async () => {
  await withPanel(async (browser, url) => {
    const page = await browser.newPage();
    await page.goto(url);
    const panel = page.frameLocator("iframe");
    await panel.locator(".toolbar .refresh-control button:not(:disabled)").waitFor();
    const search = panel.getByRole("searchbox");
    await search.fill("first");
    await search.evaluate((node) => {
      window.savedSearch = node;
      node.setSelectionRange(1, 3);
    });
    const reads = await page.evaluate(() => __requests.length);
    await page.evaluate(() => __locale("ru-RU"));
    await panel.getByRole("searchbox", { name: "Поиск изменений" }).waitFor();
    assert.deepEqual(
      await search.evaluate((node) => [
        node === window.savedSearch,
        node.value,
        node.selectionStart,
        node.selectionEnd,
        node === document.activeElement,
      ]),
      [true, "first", 1, 3, true],
    );
    await panel.getByRole("button", { name: "Очистить поиск", exact: true }).click();
    assert.equal(await search.inputValue(), "");
    await page.evaluate(() => __theme("light"));
    assert.equal(
      await panel
        .getByRole("button", { name: "Очистить поиск", exact: true, includeHidden: true })
        .count(),
      1,
    );
    assert.equal(await page.evaluate(() => __requests.length), reads);
    await page.evaluate(() => __failNextListing());
    await panel.getByRole("button", { name: "Обновить", exact: true }).click();
    const retry = panel.locator(".board-notices button");
    await retry.waitFor();
    await retry.focus();
    await retry.evaluate((node) => (window.savedRetry = node));
    const failedReads = await page.evaluate(() => __requests.length);
    await page.evaluate(() => __locale("en-AU"));
    await panel.getByRole("button", { name: "Retry", exact: true }).waitFor();
    assert.deepEqual(
      await retry.evaluate((node) => [node === window.savedRetry, node === document.activeElement]),
      [true, true],
    );
    assert.equal(
      await panel.locator(".board-notices .notice.error > span").first().textContent(),
      "Cannot check listing",
    );
    assert.equal(await page.evaluate(() => __requests.length), failedReads);
    for (const count of [0, 1, 2, 5, 11, 21, 22]) {
      await page.evaluate((count) => __counts(count), count);
      await panel.locator(".toolbar .refresh-control button").click();
      await panel.locator(".toolbar .refresh-control button:not(:disabled)").waitFor();
      await page.evaluate(() => __locale("ru"));
      await panel.locator('html[lang="ru"]').waitFor();
      const noun = count === 1 || count === 21 ? "задачи" : "задач";
      assert.match(
        await panel.locator(".board-tally").textContent(),
        new RegExp(`0 из ${count} ${noun}`),
      );
      await page.evaluate(() => __locale("en"));
      await panel.locator('html[lang="en"]').waitFor();
      assert.match(
        await panel.locator(".board-tally").textContent(),
        new RegExp(`0 of ${count} tasks complete`),
      );
    }
  });
});

test("viewer language preference ignores disposed read and write responses without resurrecting UI", async () => {
  await withPanel(async (browser, url) => {
    for (const op of ["get", "set"]) {
      const page = await browser.newPage();
      await page.goto(url + (op === "get" ? "?hold-storage=get&language=%22ru%22" : ""));
      const panel = page.frameLocator("iframe");
      await panel.locator(".language-row button").waitFor({ timeout: 2000 });
      if (op === "set") {
        await panel.locator(".language-row button:not(:disabled)").waitFor();
        await page.evaluate(() => __holdStorage("set"));
        await panel.locator(".language-row button").click();
        await panel.getByRole("option", { name: "Русский", exact: true }).click();
      }
      await panel.locator("body").evaluate(() => window.dispatchEvent(new Event("pagehide")));
      await page.evaluate(() => __releaseStorage());
      assert.equal(await panel.locator(".language-row").count(), 0);
      assert.equal(await panel.locator("html").getAttribute("lang"), "en");
      await page.evaluate(() => __remount());
      await panel.getByRole("searchbox", { name: "Поиск изменений" }).waitFor();
      assert.equal(
        await page.evaluate(() => __storageCalls.filter((c) => c.op === "get").length),
        2,
      );
      await page.close();
    }
  });
});

test("viewer language retained board count forms cover artifacts and changes in both languages", async () => {
  await withPanel(async (browser, url) => {
    const page = await browser.newPage();
    await page.goto(url);
    const panel = page.frameLocator("iframe");
    await panel.locator(".toolbar .refresh-control button:not(:disabled)").waitFor();
    for (const count of [0, 1, 2, 5, 11, 21, 22]) {
      await page.evaluate((count) => __artifactCount(count), count);
      await panel.locator(".toolbar .refresh-control button").click();
      await panel.locator(".toolbar .refresh-control button:not(:disabled)").waitFor();
      for (const locale of ["ru", "en"]) {
        await page.evaluate((locale) => __locale(locale), locale);
        await panel.locator(`html[lang="${locale}"]`).waitFor();
        const noun = count === 1 || count === 21 ? "артефакта" : "артефактов";
        assert.equal(
          await panel
            .locator(".change-card")
            .filter({ has: panel.getByRole("button", { name: "first-change", exact: true }) })
            .locator(".progress-label")
            .textContent(),
          locale === "ru" ? `${count} из ${count} ${noun}` : `${count} of ${count} artefacts`,
        );
      }
    }
    for (const count of [0, 1, 2, 5, 11, 21, 22]) {
      await page.evaluate((count) => __changeCount(count), count);
      await panel.locator(".toolbar .refresh-control button").click();
      await panel.locator(".toolbar .refresh-control button:not(:disabled)").waitFor();
      for (const locale of ["ru", "en"]) {
        await page.evaluate((locale) => __locale(locale), locale);
        await panel.locator(`html[lang="${locale}"]`).waitFor();
        const noun =
          count === 1 || count === 21
            ? "изменение"
            : count === 2 || count === 22
              ? "изменения"
              : "изменений";
        assert.match(
          await panel.locator(".board-tally").textContent(),
          new RegExp(`^${count} ${locale === "ru" ? noun : "changes"} ·`),
        );
      }
    }
  });
});

test("viewer language retained board keeps scroll help focus and language available without project", async () => {
  await withPanel(async (browser, url) => {
    const page = await browser.newPage({ viewport: { width: 320, height: 500 } });
    await page.goto(url);
    const panel = page.frameLocator("iframe");
    await panel.locator(".toolbar .refresh-control button:not(:disabled)").waitFor();
    await page.evaluate(() => {
      for (let n = 0; n < 40; n++) __recreate("long-change-" + n);
    });
    await panel.getByRole("button", { name: "Refresh", exact: true }).click();
    await panel.locator(".toolbar .refresh-control button:not(:disabled)").waitFor();
    await panel.locator("body").evaluate(() => window.scrollTo(0, 400));
    const scroll = await panel.locator("body").evaluate(() => window.scrollY);
    const reads = await page.evaluate(() => __requests.length);
    await page.evaluate(() => __locale("ru"));
    await panel.locator('html[lang="ru"]').waitFor();
    assert.equal(await panel.locator("body").evaluate(() => window.scrollY), scroll);
    assert.equal(await page.evaluate(() => __requests.length), reads);
    const help = panel.getByRole("button", { name: "Краткое руководство OpenSpec", exact: true });
    await help.focus();
    await page.evaluate(() => __locale("en"));
    await panel.getByRole("button", { name: "OpenSpec quickstart", exact: true }).waitFor();
    assert.equal(await help.count(), 0);
    assert.equal(
      await panel
        .getByRole("button", { name: "OpenSpec quickstart", exact: true })
        .evaluate((node) => node === document.activeElement),
      true,
    );
    await page.evaluate(() => {
      __directory(null);
      __locale("ru");
    });
    await panel.getByText("Проект не выбран", { exact: true }).waitFor();
    await panel.locator(".language-row button").click();
    await panel.getByRole("option", { name: "English", exact: true }).click();
    await panel.getByText("No project selected", { exact: true }).waitFor();
    assert.equal(await page.evaluate(() => __requests.length), reads);
  });
});

test("viewer language retained board localizes pending empty stale unavailable and restores navigation focus", async () => {
  await withPanel(async (browser, url) => {
    const page = await browser.newPage();
    await page.goto(url + "?hold-summary");
    const panel = page.frameLocator("iframe");
    await panel.getByText("Loading…").first().waitFor();
    await page.evaluate(() => __locale("ru"));
    await panel.getByText("Загрузка…").first().waitFor();
    await page.evaluate(() => __releaseSummaries());
    const first = panel.getByRole("button", { name: "first-change", exact: true });
    await first.waitFor();
    await panel.getByRole("searchbox").fill("no-results");
    await panel.getByText("Подходящих изменений нет").first().waitFor();
    await panel.getByRole("searchbox").press("Escape");
    await panel.getByText("Здесь пока нет изменений").first().waitFor();
    await page.evaluate(() => __failSummary());
    await panel.getByRole("button", { name: "Обновить", exact: true }).click();
    await panel
      .getByText("first-change: данные устарели; актуальная сводка недоступна.", { exact: true })
      .waitFor();
    const retry = panel.getByRole("button", { name: "Повторить", exact: true });
    await retry.focus();
    await retry.evaluate((node) => (window.failureRetry = node));
    const reads = await page.evaluate(() => __requests.length);
    await page.evaluate(() => __locale("en"));
    await panel
      .getByText("first-change is stale; latest summary unavailable.", { exact: true })
      .waitFor();
    assert.equal(
      await panel
        .getByRole("button", { name: "Retry", exact: true })
        .evaluate((node) => node === window.failureRetry && node === document.activeElement),
      true,
    );
    assert.equal(await page.evaluate(() => __requests.length), reads);
    await page.evaluate(() => {
      __failSummary("CHANGE_UNAVAILABLE");
      __locale("ru");
    });
    await panel.getByRole("button", { name: "Обновить", exact: true }).click();
    await panel.getByText("first-change больше недоступно.", { exact: true }).waitFor();
    await panel.getByRole("button", { name: "Обновить", exact: true }).click();
    await panel.locator(".toolbar .refresh-control button:not(:disabled)").waitFor();
    await first.click();
    await panel.getByRole("button", { name: "Назад к изменениям", exact: true }).click();
    assert.equal(await first.evaluate((node) => node === document.activeElement), true);
    await first.click();
    await panel.getByRole("button", { name: "Удалить изменение", exact: true }).click();
    await panel.getByRole("dialog").getByRole("button", { name: "Удалить", exact: true }).click();
    await panel.getByRole("searchbox", { name: "Поиск изменений" }).waitFor();
    assert.equal(
      await panel.getByRole("searchbox").evaluate((node) => node === document.activeElement),
      true,
    );
  });
});

test("board toolbar contained across intermediate widths and themes", async () => {
  await withPanel(async (browser, url) => {
    const page = await browser.newPage();
    await page.goto(url);
    const panel = page.frameLocator("iframe");
    await panel.locator(".toolbar .refresh-control button:not(:disabled)").waitFor();
    await page.evaluate(() => __rename("second-change", "long-change-name-".repeat(12)));
    await panel.getByRole("button", { name: "Refresh", exact: true }).click();
    await panel.locator(".toolbar .refresh-control button:not(:disabled)").waitFor();
    const reads = await page.evaluate(() => __requests.length);
    for (const locale of ["en", "ru"]) {
      await page.evaluate((locale) => __locale(locale), locale);
      await panel.locator(`html[lang="${locale}"]`).waitFor();
      for (const mode of ["light", "dark"]) {
        await page.evaluate((mode) => window.__theme(mode), mode);
        for (const width of [320, 560, 561, 580, 600, 1076]) {
          await page.setViewportSize({ width, height: 800 });
          for (const query of ["", "first-change"]) {
            await panel.getByRole("searchbox").fill(query);
            const bounds = await panel.locator(".board-search").evaluate((root) => {
              const box = root.getBoundingClientRect();
              const input = root.querySelector("input").getBoundingClientRect();
              const actions = root.nextElementSibling.getBoundingClientRect();
              return {
                contained: [
                  root.querySelector("input"),
                  root.querySelector(".oc-sdk-search-icon"),
                  root.querySelector(".oc-sdk-search-clear"),
                ]
                  .filter((child) => child.checkVisibility())
                  .map((child) => child.getBoundingClientRect())
                  .every((child) => child.left >= box.left - 1 && child.right <= box.right + 1),
                overlap:
                  input.left < actions.right &&
                  input.right > actions.left &&
                  input.top < actions.bottom &&
                  input.bottom > actions.top,
                overflow: document.documentElement.scrollWidth > innerWidth,
              };
            });
            assert.deepEqual(
              bounds,
              { contained: true, overlap: false, overflow: false },
              `${locale}/${mode} ${width}px ${JSON.stringify(query)}`,
            );
          }
          await panel.getByRole("searchbox").fill("first-change");
          await panel
            .getByRole("button", {
              name: locale === "ru" ? "Очистить поиск" : "Clear search",
              exact: true,
            })
            .click({ timeout: 2000 });
          assert.equal(await panel.getByRole("searchbox").inputValue(), "");
          assert.equal(
            await panel.getByRole("searchbox").evaluate((node) => node === document.activeElement),
            true,
          );
          await panel.getByRole("searchbox").fill("first-change");
          await panel.getByRole("searchbox").press("Escape");
          assert.equal(await panel.getByRole("searchbox").inputValue(), "");
        }
      }
    }
    assert.equal(await page.evaluate(() => __requests.length), reads);
  });
});

test("workflow dropdown uses neutral SDK styling and a decorative arrow", async () => {
  await withPanel(async (browser, url) => {
    const page = await browser.newPage();
    await page.goto(url);
    const panel = page.frameLocator("iframe");
    await panel.locator(".toolbar .refresh-control button:not(:disabled)").waitFor();
    for (const mode of ["light", "dark"]) {
      await page.evaluate((mode) => window.__theme(mode), mode);
      for (const width of [320, 1076]) {
        await page.setViewportSize({ width, height: 800 });
        for (const surface of ["board", "card", "detail"]) {
          if (surface === "detail") {
            await panel.getByRole("button", { name: "first-change", exact: true }).click();
            await panel.locator(".detail-footer").waitFor();
          }
          const scope = panel
            .locator(
              surface === "board"
                ? ".heading-actions"
                : surface === "card"
                  ? ".change-card"
                  : ".detail-footer",
            )
            .first();
          const button = scope.locator(".workflow-menu > .oc-sdk-menu > button");
          await button.evaluate(async (node) => {
            await Promise.all(node.getAnimations().map((animation) => animation.finished));
          });
          assert.equal(await button.getAttribute("data-variant"), "secondary");
          assert.equal(await button.getAttribute("aria-haspopup"), "menu");
          assert.notEqual(await button.getAttribute("aria-expanded"), "true");
          const style = await button.evaluate((node) => {
            const css = getComputedStyle(node);
            const reference = getComputedStyle(
              document.querySelector(
                '.heading-actions button[data-variant="secondary"]:not([aria-haspopup])',
              ),
            );
            const arrow = getComputedStyle(node, "::after");
            return {
              neutral:
                css.backgroundColor === reference.backgroundColor &&
                css.color === reference.color &&
                css.borderColor === reference.borderColor,
              arrow:
                arrow.content === '""' &&
                parseFloat(arrow.width) > 0 &&
                arrow.borderRightStyle === "solid" &&
                arrow.borderBottomStyle === "solid",
            };
          });
          assert.deepEqual(style, { neutral: true, arrow: true }, `${mode} ${surface}`);
          await button.hover();
          await button.evaluate(async (node) => {
            await Promise.all(node.getAnimations().map((animation) => animation.finished));
          });
          assert.notEqual(
            await button.evaluate((node) => getComputedStyle(node).backgroundImage),
            "none",
          );
          await page.keyboard.press("Tab");
          await button.focus();
          assert.equal(await button.evaluate((node) => node.matches(":focus-visible")), true);
          assert.notEqual(
            await button.evaluate((node) => getComputedStyle(node).boxShadow),
            "none",
          );
          await button.click();
          await panel.getByRole("menu").waitFor();
          await page.keyboard.press("End");
          const finalEntry = await panel.getByRole("menu").evaluate((menu) => {
            const row = document.getElementById(menu.getAttribute("aria-activedescendant"));
            const box = row.getBoundingClientRect();
            const popup = menu.getBoundingClientRect();
            return {
              contained: box.top >= popup.top - 1 && box.bottom <= popup.bottom + 1,
              horizontal: box.right <= innerWidth,
            };
          });
          assert.deepEqual(finalEntry, { contained: true, horizontal: true });
          await page.keyboard.press("Escape");
          if (surface === "detail")
            await panel.getByRole("button", { name: "Back to changes", exact: true }).click();
        }
      }
      await panel.getByRole("button", { name: "first-change", exact: true }).click();
      await page.evaluate(() => __failSummary("CHANGE_UNAVAILABLE"));
      await panel.locator(".detail-toolbar .refresh-control button").click();
      const disabledDetail = panel.locator(".detail-footer .workflow-menu button");
      await disabledDetail.locator(":scope:disabled").waitFor();
      assert.ok(
        await disabledDetail.evaluate((node) => Number(getComputedStyle(node).opacity) < 1),
      );
      await panel.getByRole("button", { name: "Back to changes", exact: true }).click();
      const disabledCard = panel
        .locator(".change-card")
        .filter({ hasText: "first-change" })
        .locator(".workflow-menu button");
      assert.equal(await disabledCard.isDisabled(), true);
      assert.ok(await disabledCard.evaluate((node) => Number(getComputedStyle(node).opacity) < 1));
      await page.evaluate(() => __directory(null));
      const disabledBoard = panel.locator(".heading-actions .workflow-menu button");
      await disabledBoard.locator(":scope:disabled").waitFor();
      assert.ok(await disabledBoard.evaluate((node) => Number(getComputedStyle(node).opacity) < 1));
      await page.evaluate((value) => __directory(value), directory);
      await panel.locator(".toolbar .refresh-control button:not(:disabled)").waitFor();
    }
  });
});

test("workflow menu labels use sentence case without changing change names", async () => {
  await withPanel(async (browser, url) => {
    const page = await browser.newPage();
    await page.goto(url);
    const panel = page.frameLocator("iframe");
    await panel.getByRole("button", { name: "Refresh", exact: true }).waitFor({ timeout: 2000 });
    assert.equal(await panel.getByRole("button", { name: "Archive all", exact: true }).count(), 1);
    assert.equal(await panel.getByRole("button", { name: "Apply", exact: true }).count(), 2);
    assert.equal(await panel.getByRole("button", { name: "first-change", exact: true }).count(), 1);
  });
});

test("ordinary tooltip hover only ignores keyboard focus on board detail and dialog", async () => {
  await withPanel(async (browser, url) => {
    const page = await browser.newPage();
    await page.goto(url);
    const panel = page.frameLocator("iframe");
    await panel.locator(".toolbar .refresh-control button:not(:disabled)").waitFor();
    for (const surface of ["board", "detail", "dialog"]) {
      if (surface === "detail") {
        await panel.getByRole("button", { name: "first-change", exact: true }).click();
        await panel.locator(".detail-toolbar .refresh-control button:not(:disabled)").waitFor();
      } else if (surface === "dialog") {
        await panel.getByRole("button", { name: "Back to changes", exact: true }).click();
        await panel.getByRole("button", { name: "Create scaffold…", exact: true }).click();
      }
      const button =
        surface === "dialog"
          ? panel.getByRole("dialog").getByRole("button", { name: "Cancel", exact: true })
          : panel.locator(
              surface === "board"
                ? ".toolbar .refresh-control button"
                : ".detail-toolbar .refresh-control button",
            );
      await page.mouse.move(0, 0);
      const before = await page.evaluate(() => __requests.length);
      await button.focus();
      assert.equal(
        await panel.locator(".button-tooltip").count(),
        0,
        `${surface}: focus alone must not show a description`,
      );
      await button.hover();
      await panel.locator(".button-tooltip").waitFor();
      await page.mouse.move(0, 0);
      assert.equal(await panel.locator(".button-tooltip").count(), 0);
      assert.equal(await button.evaluate((node) => node === document.activeElement), true);
      assert.equal(await page.evaluate(() => __requests.length), before);
    }
    await page.close();
  });
});

test("ordinary tooltip hover only hides immediately inside the description rectangle while owner stays focused", async () => {
  await withPanel(async (browser, url) => {
    for (const width of [320, 1076])
      for (const mode of ["light", "dark"]) {
        const page = await browser.newPage({ viewport: { width, height: 700 } });
        await page.goto(url);
        const panel = page.frameLocator("iframe");
        await panel.locator(".toolbar .refresh-control button:not(:disabled)").waitFor();
        await page.evaluate((mode) => __theme(mode), mode);
        const button = panel.getByRole("button", { name: "Create scaffold…", exact: true });
        const before = await page.evaluate(() => __requests.length);
        await button.focus();
        await button.hover();
        const tooltip = panel.locator(".button-tooltip");
        await tooltip.waitFor();
        const box = await tooltip.boundingBox();
        const id = await tooltip.getAttribute("id");
        await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
        assert.equal(
          await panel.locator(`[id="${id}"]`).count(),
          0,
          "pointer exit must hide immediately, including inside the old tooltip rectangle",
        );
        assert.equal(await button.evaluate((node) => node === document.activeElement), true);
        assert.equal(await button.getAttribute("aria-describedby"), null);
        await button.evaluate((node) => node.blur());
        await button.hover();
        await tooltip.waitFor();
        assert.equal(await button.evaluate((node) => node === document.activeElement), false);
        await page.mouse.move(0, 0);
        assert.equal(await tooltip.count(), 0);
        assert.equal(await page.evaluate(() => __requests.length), before);
        await page.close();
      }
  });
});

test("workflow menu descriptions exclusive suppress ordinary tooltips on all surfaces until dismissal", async () => {
  await withPanel(async (browser, url) => {
    const page = await browser.newPage();
    await page.goto(url);
    const panel = page.frameLocator("iframe");
    await panel.locator(".toolbar .refresh-control button:not(:disabled)").waitFor();
    for (const surface of ["global", "card", "detail"]) {
      if (surface === "detail") {
        await panel.getByRole("button", { name: "first-change", exact: true }).click();
        await panel.getByText("First version of proposal", { exact: true }).waitFor();
        await panel.locator(".detail-toolbar .refresh-control button:not(:disabled)").waitFor();
      }
      const actions =
        surface === "global"
          ? panel.locator(".heading-actions")
          : surface === "card"
            ? panel.locator(".change-card").filter({ hasText: "first-change" })
            : panel.locator(".detail-footer");
      const trigger = actions.getByRole("button", { name: "Workflows", exact: true });
      const ordinary = panel.locator(
        surface === "detail"
          ? ".detail-toolbar .refresh-control button"
          : ".toolbar .refresh-control button",
      );
      const before = await page.evaluate(() => __requests.length);
      await trigger.focus();
      await ordinary.focus();
      await ordinary.hover();
      await panel.locator(".button-tooltip").waitFor();
      // Programmatic activation retains the existing description until the opening transition.
      await trigger.evaluate((node) => node.click());
      const menu = panel.getByRole("menu");
      await menu.waitFor();
      await panel.locator(".button-tooltip").waitFor({ state: "detached" });
      await trigger.hover();
      assert.equal(
        await panel.locator(".button-tooltip").count(),
        0,
        "open trigger must not describe itself",
      );
      await ordinary.hover();
      assert.equal(
        await panel.locator(".button-tooltip").count(),
        0,
        "unrelated hover must stay suppressed",
      );
      await trigger.focus();
      assert.equal(
        await panel.locator(".button-tooltip").count(),
        0,
        "focus inside an open menu must stay suppressed",
      );
      await menu.focus();
      await page.keyboard.press("Escape");
      await menu.waitFor({ state: "hidden" });
      assert.equal(await trigger.evaluate((node) => node === document.activeElement), true);
      await ordinary.focus();
      await ordinary.hover();
      await panel.locator(".button-tooltip").waitFor();
      await page.keyboard.press("Escape");
      assert.equal(await page.evaluate(() => __requests.length), before);
    }
    await page.close();
  });
});

test("workflow menu descriptions exclusive describe every pointer and keyboard entry inline in narrow themed menus", async () => {
  await withPanel(async (browser, url) => {
    const global = [
      ["Propose change", /unsent.*new change.*planning/i],
      ["Explore ideas", /unsent.*investigat.*without file changes/i],
      ["New change", /unsent.*new change.*step by step/i],
      ["Fast-forward", /unsent.*all planning artifacts/i],
      ["Bulk archive", /unsent.*select.*confirm/i],
      ["Onboard", /unsent.*guided.*full change cycle/i],
    ];
    const change = [
      ["Continue change", /unsent.*at most one.*artifact/i],
      ["Apply tasks", /unsent.*implement.*remaining tasks/i],
      ["Update change", /unsent.*revise.*without implementing/i],
      ["Sync specs", /unsent.*main specs.*without archiving/i],
      ["Archive change", /unsent.*prerequisites.*confirm/i],
      ["Verify change", /unsent.*report gaps.*without fixing/i],
      ["Explore ideas", /unsent.*investigat.*without file changes/i],
    ];
    for (const width of [320, 1076])
      for (const mode of ["dark", "light"]) {
        const page = await browser.newPage({ viewport: { width, height: 700 } });
        await page.goto(url);
        const panel = page.frameLocator("iframe");
        await panel.locator(".toolbar .refresh-control button:not(:disabled)").waitFor();
        await page.evaluate((mode) => __theme(mode), mode);
        await panel.locator(`html[data-oc-theme="${mode}"]`).waitFor();
        for (const surface of ["global", "card", "detail"]) {
          if (surface === "detail") {
            await panel.getByRole("button", { name: "first-change", exact: true }).click();
            await panel.getByText("First version of proposal", { exact: true }).waitFor();
            await panel.locator(".detail-toolbar .refresh-control button:not(:disabled)").waitFor();
          }
          const actions =
            surface === "global"
              ? panel.locator(".heading-actions")
              : surface === "card"
                ? panel.locator(".change-card").filter({ hasText: "first-change" })
                : panel.locator(".detail-footer");
          const trigger = actions.getByRole("button", { name: "Workflows", exact: true });
          const entries = surface === "global" ? global : change;
          const before = await page.evaluate(() => __requests.length);
          for (const input of ["keyboard", "pointer"]) {
            await page.mouse.move(0, 0);
            await trigger.scrollIntoViewIfNeeded();
            await trigger.focus();
            await trigger.evaluate(
              () =>
                new Promise((resolve) =>
                  requestAnimationFrame(() => requestAnimationFrame(resolve)),
                ),
            );
            await page.keyboard.press("Enter");
            const menu = panel.getByRole("menu");
            await menu.waitFor();
            assert.equal(await menu.getByRole("tooltip").count(), 0, "no active row on opening");
            for (let index = 0; index < entries.length; index++) {
              const [label, outcome] = entries[index];
              const row = menu.getByRole("menuitem", { name: label, exact: true });
              if (input === "keyboard") await page.keyboard.press(index ? "ArrowDown" : "Home");
              else await row.hover();
              const description = row.getByRole("tooltip");
              await description.waitFor({ timeout: 2000 });
              assert.match(await description.innerText(), outcome);
              assert.equal(await menu.getByRole("tooltip").count(), 1);
              assert.equal(
                await row.getAttribute("aria-describedby"),
                await description.getAttribute("id"),
              );
              assert.equal(
                await menu.getAttribute("aria-describedby"),
                await description.getAttribute("id"),
              );
              assert.equal(
                await menu.getAttribute("aria-activedescendant"),
                await row.getAttribute("id"),
              );
              assert.equal(await menu.evaluate((node) => node === document.activeElement), true);
              assert.equal(
                await description.evaluate((node) => {
                  const box = node.getBoundingClientRect();
                  const row = node.parentElement;
                  const r = row.getBoundingClientRect();
                  const popup = row.closest('[role="menu"]').getBoundingClientRect();
                  return (
                    box.top >= r.top &&
                    box.bottom <= r.bottom &&
                    r.top >= popup.top &&
                    r.bottom <= popup.bottom &&
                    box.left >= 0 &&
                    box.right <= innerWidth &&
                    box.top >= 0 &&
                    box.bottom <= innerHeight &&
                    [...row.parentElement.children].every((other) => {
                      if (other === row) return true;
                      const b = other.getBoundingClientRect();
                      return box.bottom <= b.top || box.top >= b.bottom;
                    }) &&
                    document.documentElement.scrollWidth <= innerWidth
                  );
                }),
                true,
                `${width}/${mode}/${surface}/${input}/${label} must be inline and fully reachable`,
              );
              // A stationary pointer must not be retargeted by the expanded row's layout.
              await page.waitForTimeout(40);
              assert.equal(await row.getAttribute("data-active"), "true");
            }
            await page.keyboard.press("Home");
            await page.keyboard.press("End");
            await menu
              .getByRole("menuitem", { name: entries.at(-1)[0], exact: true })
              .getByRole("tooltip")
              .waitFor();
            await page.keyboard.press("ArrowUp");
            await menu
              .getByRole("menuitem", { name: entries.at(-2)[0], exact: true })
              .getByRole("tooltip")
              .waitFor();
            await page.keyboard.press("Escape");
            await menu.waitFor({ state: "hidden" });
            assert.equal(await trigger.evaluate((node) => node === document.activeElement), true);
            assert.equal(await panel.locator(".workflow-menu [role=tooltip]").count(), 0);
          }
          assert.equal(await page.evaluate(() => __requests.length), before);
        }
        await page.close();
      }
  });
});

test("workflow menu descriptions exclusive survive SDK repaint and stage updates and clean up replaced owners", async () => {
  await withPanel(async (browser, url) => {
    const page = await browser.newPage();
    page.setDefaultTimeout(3000);
    await page.goto(url);
    const panel = page.frameLocator("iframe");
    await panel.locator(".toolbar .refresh-control button:not(:disabled)").waitFor();
    for (const surface of ["global", "card", "detail"]) {
      if (surface === "detail") {
        await panel.getByRole("button", { name: "first-change", exact: true }).click();
        await panel.getByText("Updated proposal", { exact: true }).waitFor();
        await panel.locator(".detail-toolbar .refresh-control button:not(:disabled)").waitFor();
      }
      const owner =
        surface === "global"
          ? panel.locator(".heading-actions")
          : surface === "card"
            ? panel.locator(".change-card").filter({ hasText: "first-change" })
            : panel.locator(".detail-footer");
      const trigger = owner.getByRole("button", { name: "Workflows", exact: true });
      const label = surface === "global" ? "Propose change" : "Continue change";
      const before = await page.evaluate(() => __requests.length);
      await trigger.focus();
      await page.keyboard.press("Enter");
      const menu = panel.getByRole("menu");
      await menu.waitFor();
      await page.keyboard.press("Home");
      const row = menu.getByRole("menuitem", { name: label, exact: true });
      await row.getByRole("tooltip").waitFor();
      const oldRow = await row.elementHandle();
      const descriptionId = await row.getAttribute("aria-describedby");
      await page.evaluate(() => __session("fixture-session"));
      await oldRow.waitForElementState("hidden");
      await row.getByRole("tooltip").waitFor();
      assert.equal(await row.getAttribute("aria-describedby"), descriptionId);
      assert.equal(await row.locator(".workflow-description").count(), 1);
      await page.evaluate(() => __theme("light"));
      await panel.locator('html[data-oc-theme="light"]').waitFor();
      await row.getByRole("tooltip").waitFor();
      assert.equal(await menu.getByRole("tooltip").count(), 1);
      assert.equal(await page.evaluate(() => __requests.length), before);
      if (surface === "card") {
        const selectedRow = await row.elementHandle();
        await page.evaluate(() => __edit("Updated proposal"));
        await panel.locator(".toolbar .refresh-control button").evaluate((node) => node.click());
        await owner.getByRole("button", { name: "Archive", exact: true }).waitFor();
        if (await menu.isVisible()) await row.getByRole("tooltip").waitFor();
        else assert.equal(await panel.locator(".workflow-menu [role=tooltip]:visible").count(), 0);
        const selected = await page.evaluate(() => __requests.length);
        await selectedRow.evaluate((node) => node.click());
        await page.waitForFunction(
          (start) => __requests.slice(start).some((r) => r.path === "toast"),
          selected,
        );
        assert.deepEqual(
          await page.evaluate((start) => __requests.slice(start).map((r) => r.path), selected),
          ["compose", "toast"],
        );
        assert.match(
          await page.evaluate(() => __draft()),
          /openspec-continue-change skill for OpenSpec change "first-change"/,
        );
      } else {
        await page.keyboard.press("Escape");
      }
      await menu.waitFor({ state: "hidden" });
      await trigger.focus();
      await page.keyboard.press("Enter");
      await menu.waitFor();
      assert.equal(
        await menu.getByRole("tooltip").count(),
        0,
        "reopening clears the old active description",
      );
      assert.equal(await menu.getAttribute("aria-describedby"), null);
      await page.keyboard.press("End");
      await menu.getByRole("tooltip").waitFor();
      if (surface === "detail") {
        await panel
          .getByRole("button", { name: "Back to changes", exact: true })
          .evaluate((node) => node.click());
        await panel.getByRole("button", { name: "second-change", exact: true }).click();
        await panel.getByRole("heading", { name: "second-change", exact: true }).waitFor();
        assert.equal(await oldRow.evaluate((node) => node.isConnected), false);
        assert.equal(await panel.locator(".workflow-menu [role=tooltip]:visible").count(), 0);
      } else {
        await page.keyboard.press("Escape");
      }
    }
    await page.close();
  });
});

test("workflow menu descriptions support hover, dismissal and narrow themed placement without requests", async () => {
  await withPanel(async (browser, url) => {
    for (const width of [320, 1076])
      for (const mode of ["light", "dark"]) {
        const page = await browser.newPage({ viewport: { width, height: 700 } });
        await page.goto(url);
        const panel = page.frameLocator("iframe");
        await panel.locator(".toolbar .refresh-control button:not(:disabled)").waitFor();
        await page.evaluate((mode) => __theme(mode), mode);
        const before = await page.evaluate(() => __requests.length);
        const button = panel.getByRole("button", { name: "Create scaffold…", exact: true });
        await button.focus();
        await button.hover();
        const tooltip = panel.getByRole("tooltip");
        await tooltip.waitFor({ timeout: 2000 });
        assert.match(await tooltip.innerText(), /form.*directly/i);
        assert.equal(
          await button.getAttribute("aria-describedby"),
          await tooltip.getAttribute("id"),
        );
        assert.equal(await button.getAttribute("title"), null);
        const box = await tooltip.boundingBox();
        assert.ok(box.x >= 0 && box.x + box.width <= width);
        assert.ok(box.y >= 0 && box.y + box.height <= 700);
        assert.equal(
          await tooltip.evaluate((node) => getComputedStyle(node).backgroundColor),
          mode === "light" ? "rgb(245, 247, 248)" : "rgb(29, 34, 38)",
        );
        await button.press("Escape");
        assert.equal(await tooltip.count(), 0);
        assert.equal(await button.evaluate((node) => node === document.activeElement), true);
        await button.hover();
        await tooltip.waitFor();
        const hoverBox = await tooltip.boundingBox();
        const hoverId = await tooltip.getAttribute("id");
        await page.mouse.move(hoverBox.x + hoverBox.width / 2, hoverBox.y + hoverBox.height / 2);
        assert.equal(await panel.locator(`[id="${hoverId}"]`).count(), 0);
        await page.mouse.move(0, 0);
        await tooltip.waitFor({ state: "detached" });
        assert.equal(await page.evaluate(() => __requests.length), before);
        await button.click();
        assert.equal(await button.getAttribute("aria-describedby"), null);
        const cancel = panel
          .getByRole("dialog", { name: "New change", includeHidden: true })
          .getByRole("button", {
            name: "Cancel",
            exact: true,
            includeHidden: true,
          });
        await cancel.focus();
        await cancel.hover();
        await tooltip.waitFor();
        assert.match(await tooltip.innerText(), /without creating/i);
        const dialogBox = await tooltip.boundingBox();
        assert.ok(dialogBox.x >= 0 && dialogBox.x + dialogBox.width <= width);
        assert.ok(dialogBox.y >= 0 && dialogBox.y + dialogBox.height <= 700);
        await cancel.click();
        assert.equal(await cancel.getAttribute("aria-describedby"), null);
        await page.close();
      }
  });
});

test("workflow menu descriptions leave wrapped neighboring actions clickable", async () => {
  await withPanel(async (browser, url) => {
    const page = await browser.newPage({ viewport: { width: 320, height: 700 } });
    await page.goto(url);
    const panel = page.frameLocator("iframe");
    const refresh = panel.getByRole("button", { name: "Refresh", exact: true });
    await panel.locator(".toolbar .refresh-control button:not(:disabled)").waitFor();
    await page.evaluate(() => __edit("Completed"));
    await refresh.click();
    await panel.locator(".toolbar .refresh-control button:not(:disabled)").waitFor();
    const archive = panel.getByRole("button", { name: "Archive all", exact: true });
    await panel.getByRole("searchbox").fill("no match");
    await refresh.hover();
    await panel.getByRole("tooltip").waitFor();
    assert.equal(
      await archive.evaluate((button) => {
        const rect = button.getBoundingClientRect();
        return button.contains(
          document.elementFromPoint(rect.x + rect.width / 2, rect.y + rect.height / 2),
        );
      }),
      true,
    );
    await archive.click({ timeout: 2000 });
    await panel.getByRole("dialog", { name: "Archive all completed changes?" }).waitFor();
    await panel.getByRole("dialog").getByRole("button", { name: "Cancel", exact: true }).click();
    const create = panel.getByRole("button", { name: "Create scaffold…", exact: true });
    await create.hover();
    await panel.getByRole("tooltip").waitFor();
    const workflows = panel
      .locator(".heading-actions")
      .getByRole("button", { name: "Workflows", exact: true });
    assert.equal(
      await workflows.evaluate((button) => {
        const rect = button.getBoundingClientRect();
        return button.contains(
          document.elementFromPoint(rect.x + rect.width / 2, rect.y + rect.height / 2),
        );
      }),
      true,
    );
    await workflows.click({ timeout: 2000 });
    await panel.getByRole("menu").waitFor();
  });
});

test("workflow menu descriptions remain visible through unchanged session updates", async () => {
  await withPanel(async (browser, url) => {
    const page = await browser.newPage();
    await page.goto(url);
    const panel = page.frameLocator("iframe");
    await panel.locator(".toolbar .refresh-control button:not(:disabled)").waitFor();
    const button = panel.getByRole("button", { name: "Create scaffold…", exact: true });
    await button.focus();
    await button.hover();
    const tooltip = panel.getByRole("tooltip");
    await tooltip.waitFor();
    const id = await tooltip.getAttribute("id");
    await page.evaluate(() => __session("fixture-session"));
    await panel.getByRole("button", { name: "first-change", exact: true }).waitFor();
    assert.equal(await tooltip.isVisible(), true);
    assert.equal(await button.getAttribute("aria-describedby"), id);
    assert.equal(await button.evaluate((node) => node === document.activeElement), true);
  });
});

test("workflow menu descriptions follow stages, preserve other descriptions and clean up hidden disabled and removed owners", async () => {
  await withPanel(async (browser, url) => {
    const page = await browser.newPage();
    await page.goto(url);
    const panel = page.frameLocator("iframe");
    const refresh = panel.locator(".toolbar .refresh-control button");
    await refresh.waitFor();
    await page.evaluate(() => __readiness("pending"));
    await refresh.click();
    const card = panel.locator(".change-card").filter({ hasText: "first-change" });
    const primary = card.getByRole("button", { name: "Plan", exact: true });
    await primary.waitFor();
    await primary.evaluate((button) => {
      const note = document.createElement("span");
      note.id = "existing-description";
      note.textContent = "Existing description";
      button.parentElement.append(note);
      button.setAttribute("aria-describedby", note.id);
    });
    await primary.focus();
    await primary.hover();
    const tooltip = panel.getByRole("tooltip");
    await tooltip.waitFor();
    assert.match(await tooltip.innerText(), /unsent.*at most one/i);
    assert.match(
      await primary.getAttribute("aria-describedby"),
      /^existing-description button-outcome-/,
    );
    await primary.press("Escape");
    assert.equal(await primary.getAttribute("aria-describedby"), "existing-description");
    await primary.hover();
    await tooltip.waitFor();
    await page.evaluate(() => {
      __readiness("");
      __edit("Completed");
    });
    await refresh.evaluate((button) => button.click());
    const archive = card.getByRole("button", { name: "Archive", exact: true });
    await archive.waitFor();
    await tooltip.waitFor({ state: "detached" });
    await archive.focus();
    await archive.hover();
    await tooltip.waitFor();
    assert.match(await tooltip.innerText(), /unsent archive.*does not archive directly/i);
    const archiveId = await tooltip.getAttribute("id");
    await archive.press("Escape");
    const apply = panel
      .locator(".change-card")
      .filter({ hasText: "second-change" })
      .getByRole("button", { name: "Apply", exact: true });
    const before = await page.evaluate(() => __requests.length);
    await apply.focus();
    await apply.hover();
    await tooltip.waitFor();
    assert.match(await tooltip.innerText(), /unsent.*worktree and session.*send/i);
    await apply.press("Enter");
    await panel.getByRole("menuitem", { name: "Prepare in current chat", exact: true }).waitFor();
    assert.equal(await tooltip.count(), 0);
    await panel
      .getByRole("menuitem", { name: "Prepare in current chat", exact: true })
      .press("Escape");
    assert.equal(await page.evaluate(() => __requests.length), before);
    await archive.hover();
    await tooltip.waitFor();
    await page.evaluate(() => __remove("first-change"));
    await refresh.evaluate((button) => button.click());
    await card.waitFor({ state: "detached" });
    assert.equal(await panel.locator(`[id="${archiveId}"]`).count(), 0);
    const workflows = panel
      .locator(".heading-actions")
      .getByRole("button", { name: "Workflows", exact: true });
    await workflows.focus();
    await workflows.hover();
    await tooltip.waitFor();
    assert.match(await tooltip.innerText(), /editable, unsent prompt/i);
    await page.evaluate(() => __directory(null));
    await tooltip.waitFor({ state: "detached" });
    assert.equal(await workflows.isDisabled(), true);
    assert.equal(await workflows.getAttribute("aria-describedby"), null);
  });
});

test("workflow menu descriptions explain read retries, navigation and all confirmation dialogs", async () => {
  await withPanel(async (browser, url) => {
    const page = await browser.newPage();
    await page.goto(url);
    const panel = page.frameLocator("iframe");
    await panel.getByRole("button", { name: "first-change", exact: true }).waitFor();
    await page.evaluate(() => {
      __failDocument();
      __failTasks();
    });
    await panel.getByRole("button", { name: "first-change", exact: true }).click();
    const tooltip = panel.getByRole("tooltip");
    for (const [name, outcome] of [
      ["Back to changes", /return.*board/i],
      ["Copy change name", /clipboard/i],
      ["Retry document", /reading this document.*not repeat any write/i],
      ["Delete change", /confirmation.*removing/i],
    ]) {
      const button = panel.getByRole("button", { name, exact: true });
      await button.evaluate((node) => node.blur());
      await button.focus();
      await button.hover();
      await tooltip.waitFor();
      assert.match(await tooltip.innerText(), outcome);
      await button.press("Escape");
    }
    await panel.getByRole("tab", { name: /^Tasks/ }).click();
    const retryTasks = panel.getByRole("button", { name: "Retry tasks", exact: true });
    const before = await page.evaluate(() => __requests.length);
    await retryTasks.focus();
    await retryTasks.hover();
    await tooltip.waitFor();
    assert.match(await tooltip.innerText(), /reading tasks.*not change tasks/i);
    await retryTasks.press("Escape");
    await panel.getByRole("button", { name: "Delete change", exact: true }).click();
    const dialog = panel.getByRole("dialog");
    const confirm = dialog.getByRole("button", { name: "Delete", exact: true });
    await confirm.focus();
    await confirm.hover();
    await tooltip.waitFor();
    assert.match(
      await tooltip.innerText(),
      /permanently remove.*implementation and main specifications remain/i,
    );
    await dialog.getByRole("button", { name: "Cancel", exact: true }).click();
    assert.equal(await page.evaluate(() => __requests.length), before);
    await panel.getByRole("button", { name: "Back to changes", exact: true }).click();
    await page.evaluate(() => __edit("Complete"));
    await panel.getByRole("button", { name: "Refresh", exact: true }).click();
    const archiveAll = panel.getByRole("button", { name: "Archive all", exact: true });
    await panel
      .locator(".heading-actions button:not(:disabled)")
      .filter({ hasText: "Archive all" })
      .waitFor();
    await archiveAll.focus();
    await archiveAll.hover();
    await tooltip.waitFor();
    assert.match(await tooltip.innerText(), /confirmation.*new session.*completed changes only/i);
    await archiveAll.click();
    const start = dialog.getByRole("button", { name: "Start archiving", exact: true });
    await start.focus();
    await start.hover();
    await tooltip.waitFor();
    assert.match(await tooltip.innerText(), /new session.*submit.*skip unfinished/i);
    const archiveRequests = await page.evaluate(() => __requests.length);
    await start.press("Escape");
    await dialog.waitFor({ state: "hidden" });
    assert.equal(await page.evaluate(() => __requests.length), archiveRequests);
    assert.equal(await archiveAll.evaluate((button) => button === document.activeElement), true);
    // Focus restoration must not describe the dismissed confirmation.
    assert.equal(await tooltip.filter({ hasText: /^Create a new session/ }).count(), 0);
    await panel.getByRole("button", { name: "Create scaffold…", exact: true }).click();
    const create = dialog.getByRole("button", { name: "Create", exact: true });
    await create.focus();
    await create.hover();
    await tooltip.waitFor();
    assert.match(await tooltip.innerText(), /directly create.*no agent/i);
    await page.evaluate(() => {
      __unknownCreate();
      __failNextListing();
    });
    await dialog.getByRole("textbox", { name: "Change name" }).fill("uncertain-change");
    await dialog.getByRole("textbox", { name: "Goal" }).fill("Check the uncertain result");
    await create.click();
    const retry = dialog.getByRole("button", { name: "Retry read", exact: true });
    await retry.waitFor();
    const retryBefore = await page.evaluate(() => __requests.length);
    await retry.focus();
    await retry.hover();
    await tooltip.waitFor();
    assert.match(await tooltip.innerText(), /read the original project.*do not retry creation/i);
    await retry.press("Escape");
    assert.equal(await page.evaluate(() => __requests.length), retryBefore);
  });
});

test("workflow menu accessibility planning replacement clears the previous detail before new reads", async () => {
  await withPanel(async (browser, url) => {
    const page = await browser.newPage();
    await page.goto(url);
    const panel = page.frameLocator("iframe");
    await panel.getByRole("button", { name: "first-change", exact: true }).click();
    await panel.getByText("First version of proposal", { exact: true }).waitFor();
    await page.evaluate(() => {
      __holdProposal();
      __planning("replacement");
      __document("proposal.md", "Replacement planning proposal");
    });
    await panel.getByRole("button", { name: "Refresh", exact: true }).click();
    await panel.locator(".refresh-control button:visible:not(:disabled)").first().waitFor();
    assert.equal(
      await panel.getByText("First version of proposal", { exact: true }).isVisible(),
      false,
    );
    assert.equal(await panel.locator(".detail").isVisible(), false);
    await panel.getByRole("button", { name: "first-change", exact: true }).click();
    await page.waitForFunction(() =>
      __requests.some(
        (request) =>
          request.path === "/document" && request.body.expectedPlanning === "replacement",
      ),
    );
    assert.equal(await panel.getByText("First version of proposal", { exact: true }).count(), 0);
    await page.evaluate(() => __releaseReads());
    await panel.getByText("Replacement planning proposal", { exact: true }).waitFor();
    await page.close();
  });
});

test("workflow menu accessibility keyboard activation, navigation and reachable popups on every surface", async () => {
  await withPanel(async (browser, url) => {
    for (const width of [320, 1076]) {
      for (const mode of ["dark", "light"]) {
        const page = await browser.newPage({ viewport: { width, height: 700 } });
        await page.goto(url);
        const panel = page.frameLocator("iframe");
        await panel.locator(".toolbar .refresh-control button:not(:disabled)").waitFor();
        await page.evaluate((mode) => __theme(mode), mode);
        await panel.locator(`html[data-oc-theme="${mode}"]`).waitFor();
        for (const surface of ["global", "card", "detail"]) {
          if (surface === "detail") {
            await panel.getByRole("button", { name: "first-change", exact: true }).click();
            await panel.getByText("First version of proposal", { exact: true }).waitFor();
            await panel.locator(".detail-toolbar .refresh-control button:not(:disabled)").waitFor();
          }
          const actions =
            surface === "global"
              ? panel.locator(".heading-actions")
              : surface === "card"
                ? panel.locator(".change-card").filter({ hasText: "first-change" })
                : panel.locator(".detail-footer");
          const trigger = actions.getByRole("button", { name: "Workflows", exact: true });
          const labels =
            surface === "global"
              ? [
                  "Propose change",
                  "Explore ideas",
                  "New change",
                  "Fast-forward",
                  "Bulk archive",
                  "Onboard",
                ]
              : [
                  "Continue change",
                  "Apply tasks",
                  "Update change",
                  "Sync specs",
                  "Archive change",
                  "Verify change",
                  "Explore ideas",
                ];
          for (const key of ["Enter", "Space"]) {
            // A new session before each native click must be captured at activation, not mount.
            await page.evaluate((id) => __session(id), `${width}-${mode}-${surface}-${key}`);
            const before = await page.evaluate(() => __requests.length);
            await trigger.scrollIntoViewIfNeeded();
            await trigger.focus();
            await trigger.evaluate(
              () =>
                new Promise((resolve) =>
                  requestAnimationFrame(() => requestAnimationFrame(resolve)),
                ),
            );
            await page.keyboard.press(key);
            const menu = panel.getByRole("menu");
            await menu.waitFor();
            assert.equal(
              await trigger.getAttribute("aria-expanded"),
              "true",
              `${width}/${mode}/${surface}/${key}`,
            );
            assert.equal(await menu.evaluate((node) => node === document.activeElement), true);
            assert.deepEqual(await menu.locator(".oc-sdk-option-label").allTextContents(), labels);
            assert.equal(await page.evaluate(() => __requests.length), before);
            await page.keyboard.press("Home");
            assert.equal(
              await menu.getAttribute("aria-activedescendant"),
              await menu.getByRole("menuitem").first().getAttribute("id"),
            );
            for (let index = 0; index < labels.length; index++) {
              if (index) await page.keyboard.press("ArrowDown");
              const item = menu.getByRole("menuitem", { name: labels[index], exact: true });
              assert.equal(
                await menu.getAttribute("aria-activedescendant"),
                await item.getAttribute("id"),
              );
              assert.equal(
                await item.evaluate((node) => {
                  const rect = node.getBoundingClientRect();
                  const popup = node.closest('[role="menu"]').getBoundingClientRect();
                  const hit = document.elementFromPoint(
                    rect.x + rect.width / 2,
                    rect.y + rect.height / 2,
                  );
                  return (
                    rect.left >= 0 &&
                    rect.right <= innerWidth &&
                    rect.top >= 0 &&
                    rect.bottom <= innerHeight &&
                    rect.left >= popup.left &&
                    rect.right <= popup.right &&
                    rect.top >= popup.top &&
                    rect.bottom <= popup.bottom &&
                    node.contains(hit) &&
                    document.documentElement.scrollWidth <= innerWidth
                  );
                }),
                true,
                `${width}/${mode}/${surface}/${labels[index]} must be unclipped and reachable`,
              );
            }
            await page.keyboard.press("Home");
            await page.keyboard.press("End");
            assert.equal(
              await menu.getAttribute("aria-activedescendant"),
              await menu.getByRole("menuitem").last().getAttribute("id"),
            );
            await page.keyboard.press("ArrowUp");
            assert.equal(
              await menu.getAttribute("aria-activedescendant"),
              await menu
                .getByRole("menuitem")
                .nth(labels.length - 2)
                .getAttribute("id"),
            );
            await page.keyboard.press("Escape");
            await menu.waitFor({ state: "hidden" });
            assert.equal(await trigger.evaluate((node) => node === document.activeElement), true);
            assert.equal(await trigger.getAttribute("aria-expanded"), "false");
            assert.equal(await page.evaluate(() => __requests.length), before);
            await page.keyboard.press(key);
            await menu.waitFor();
            await page.keyboard.press("Home");
            await page.keyboard.press(key);
            await menu.waitFor({ state: "hidden" });
            await page.waitForFunction(
              (start) => __requests.slice(start).some((r) => r.path === "toast"),
              before,
            );
            assert.equal(await trigger.evaluate((node) => node === document.activeElement), true);
            assert.deepEqual(
              await page.evaluate((start) => __requests.slice(start).map((r) => r.path), before),
              ["compose", "toast"],
            );
            const draft = await page.evaluate(() => __draft());
            assert.match(
              draft,
              surface === "global"
                ? /^Use your skill tool to load and invoke the openspec-propose skill\./
                : /^Use your skill tool to load and invoke the openspec-continue-change skill for OpenSpec change "first-change"\./,
            );
          }
        }
        await page.close();
      }
    }
  });
});

test("workflow menu accessibility refresh and themes retain search and detail shells, focus, caret and scroll", async () => {
  await withPanel(async (browser, url) => {
    for (const width of [320, 1076]) {
      const page = await browser.newPage({ viewport: { width, height: 700 } });
      await page.goto(url);
      const panel = page.frameLocator("iframe");
      await panel.locator(".toolbar .refresh-control button:not(:disabled)").waitFor();
      const search = panel.getByRole("searchbox", { name: "Search changes" });
      const searchNode = await search.elementHandle();
      const boardNode = await panel.locator(".board-shell").elementHandle();
      await search.fill("change");
      await search.evaluate((node) => node.setSelectionRange(2, 4));
      for (const mode of ["light", "dark"]) {
        await page.evaluate(() => __holdSummaries());
        await panel
          .getByRole("button", { name: "Refresh", exact: true })
          .evaluate((node) => node.click());
        await panel.locator(".toolbar .refresh-control button:disabled").waitFor();
        await page.evaluate((mode) => __theme(mode), mode);
        await panel.locator(`html[data-oc-theme="${mode}"]`).waitFor();
        await page.evaluate(() => __releaseSummaries());
        await panel.locator(".toolbar .refresh-control button:not(:disabled)").waitFor();
        assert.equal(
          await panel
            .locator(".board-shell")
            .evaluate((node, original) => node === original, boardNode),
          true,
        );
        assert.equal(
          await search.evaluate((node, original) => node === original, searchNode),
          true,
        );
        assert.deepEqual(
          await search.evaluate((node) => [
            node.value,
            node.selectionStart,
            node.selectionEnd,
            document.activeElement === node,
          ]),
          ["change", 2, 4, true],
        );
      }
      await page.evaluate(() =>
        __document("proposal.md", "Long proposal paragraph\n\n".repeat(200)),
      );
      await panel.getByRole("button", { name: "first-change", exact: true }).click();
      const proposal = panel.getByRole("tab", { name: /Proposal/ });
      await proposal.click();
      await panel
        .locator(".document-content")
        .getByText(/Long proposal paragraph/)
        .first()
        .waitFor();
      const detailNode = await panel.locator(".detail").elementHandle();
      const content = panel.locator(".detail-content");
      const contentNode = await content.elementHandle();
      const tabNode = await proposal.elementHandle();
      await proposal.focus();
      await content.evaluate((node) => {
        node.scrollTop = 200;
      });
      const scroll = await content.evaluate((node) => node.scrollTop);
      assert.ok(scroll >= 190);
      for (const mode of ["light", "dark"]) {
        await page.evaluate(() => __holdSummaries());
        await panel
          .getByRole("button", { name: "Refresh", exact: true })
          .evaluate((node) => node.click());
        await panel.locator(".detail-toolbar .refresh-control button:disabled").waitFor();
        assert.equal(
          await content.evaluate((node) => node.scrollTop),
          scroll,
          `${width}/${mode}: refresh start`,
        );
        await page.evaluate((mode) => __theme(mode), mode);
        await panel.locator(`html[data-oc-theme="${mode}"]`).waitFor();
        assert.equal(
          await content.evaluate((node) => node.scrollTop),
          scroll,
          `${width}/${mode}: theme`,
        );
        await page.evaluate(() => __releaseSummaries());
        await panel.locator(".detail-toolbar .refresh-control button:not(:disabled)").waitFor();
        assert.equal(
          await panel
            .locator(".detail")
            .evaluate((node, original) => node === original, detailNode),
          true,
        );
        assert.equal(
          await content.evaluate((node, original) => node === original, contentNode),
          true,
        );
        assert.equal(
          await proposal.evaluate(
            (node, original) => node === original && document.activeElement === node,
            tabNode,
          ),
          true,
        );
        assert.equal(
          await content.evaluate((node) => node.scrollTop),
          scroll,
          `${width}/${mode}: refresh settled`,
        );
      }
      await panel.getByRole("button", { name: "Back to changes" }).click();
      assert.equal(await search.evaluate((node, original) => node === original, searchNode), true);
      assert.deepEqual(
        await search.evaluate((node) => [node.value, node.selectionStart, node.selectionEnd]),
        ["change", 2, 4],
      );
      assert.equal(
        await panel
          .getByRole("button", { name: "first-change", exact: true })
          .evaluate((node) => document.activeElement === node),
        true,
      );
      await page.close();
    }
  });
});

test("presentation modal backdrops dim every dialog without changing keyboard cancellation", async () => {
  await withPanel(async (browser, url) => {
    for (const width of [320, 1076]) {
      for (const mode of ["dark", "light"]) {
        const page = await browser.newPage({ viewport: { width, height: 700 } });
        await page.goto(url);
        const panel = page.frameLocator("iframe");
        await panel.getByRole("button", { name: "first-change", exact: true }).waitFor();
        await page.evaluate((mode) => __theme(mode), mode);
        await panel.locator(`html[data-oc-theme="${mode}"]`).waitFor();
        const nativeBackdrop = await page.evaluate(() => {
          const dialog = document.createElement("dialog");
          document.body.append(dialog);
          dialog.showModal();
          const style = getComputedStyle(dialog, "::backdrop");
          const result = { colour: style.backgroundColor, opacity: style.opacity };
          dialog.close();
          dialog.remove();
          return result;
        });
        const checkDialog = async (open, name) => {
          for (const cancel of ["Escape", "button"]) {
            await open();
            const dialog = panel.getByRole("dialog", { name });
            await dialog.waitFor();
            const backdrop = await dialog.evaluate((node) => {
              const style = getComputedStyle(node, "::backdrop");
              return {
                colour: style.backgroundColor,
                backdropOpacity: style.opacity,
                blur: style.backdropFilter,
                focusInside: node.contains(document.activeElement),
                opacity: getComputedStyle(node).opacity,
              };
            });
            assert.equal(backdrop.colour, nativeBackdrop.colour);
            assert.equal(backdrop.backdropOpacity, nativeBackdrop.opacity);
            assert.equal(backdrop.blur, "blur(4px)");
            assert.equal(backdrop.opacity, "1");
            assert.equal(backdrop.focusInside, true);
            await page.keyboard.press("Tab");
            assert.equal(
              await dialog.evaluate((node) => node.contains(document.activeElement)),
              true,
            );
            if (cancel === "Escape") await page.keyboard.press("Escape");
            else await dialog.getByRole("button", { name: "Cancel", exact: true }).click();
            await dialog.waitFor({ state: "hidden" });
            assert.equal(await panel.locator("dialog[open]").count(), 0);
          }
        };
        await checkDialog(
          () => panel.getByRole("button", { name: "Create scaffold…", exact: true }).click(),
          "New change",
        );
        await panel.getByRole("button", { name: "first-change", exact: true }).click();
        await checkDialog(
          () => panel.getByRole("button", { name: "Delete change", exact: true }).click(),
          /Delete first-change/,
        );
        await panel.getByRole("button", { name: "Back to changes" }).click();
        await page.evaluate(() => __edit("Completed"));
        await panel.getByRole("button", { name: "Refresh", exact: true }).click();
        await panel
          .getByRole("button", { name: "Archive all", exact: true })
          .and(panel.locator(":enabled"))
          .waitFor();
        await checkDialog(
          () => panel.getByRole("button", { name: "Archive all", exact: true }).click(),
          "Archive all completed changes?",
        );
        assert.equal(
          await page.evaluate(() =>
            __requests.some((r) => ["/create", "/delete", "start-session"].includes(r.path)),
          ),
          false,
        );
        await page.close();
      }
    }
  });
});

test("presentation footer keeps equal 12px control gaps and an external separator", async () => {
  await withPanel(async (browser, url) => {
    const page = await browser.newPage({ viewport: { width: 320, height: 700 } });
    await page.goto(url);
    const panel = page.frameLocator("iframe");
    await panel.getByRole("button", { name: "first-change", exact: true }).click();
    const footer = panel.locator(".detail-footer");
    const checkSpacing = async (wrapped = false) => {
      const layout = await footer.evaluate((node) => {
        const rect = node.getBoundingClientRect();
        const buttons = [...node.querySelectorAll("button")]
          .filter((button) => button.checkVisibility())
          .map((button) => button.getBoundingClientRect());
        const separator = getComputedStyle(node, "::before");
        return {
          topGap: Math.min(...buttons.map((rect) => rect.top)) - rect.top,
          bottomGap: rect.bottom - Math.max(...buttons.map((rect) => rect.bottom)),
          heights: buttons.map((rect) => rect.height),
          rows: new Set(buttons.map((rect) => rect.top)).size,
          separatorHeight: separator.height,
          separatorBottom: separator.bottom,
          separatorPosition: separator.position,
          separatorColour: separator.backgroundColor,
          borderWidth: getComputedStyle(node).borderTopWidth,
          overflow: document.documentElement.scrollWidth > innerWidth,
        };
      });
      assert.equal(layout.topGap, 12);
      assert.equal(layout.bottomGap, 12);
      assert.ok(layout.heights.every((height) => height === 28));
      assert.equal(layout.separatorHeight, "1px");
      assert.equal(layout.separatorPosition, "absolute");
      assert.equal(layout.borderWidth, "0px");
      assert.equal(
        layout.separatorColour,
        await footer.evaluate((node) => {
          const probe = document.createElement("span");
          probe.style.color = getComputedStyle(node).getPropertyValue("--oc-border");
          node.append(probe);
          const colour = getComputedStyle(probe).color;
          probe.remove();
          return colour;
        }),
      );
      assert.equal(
        parseFloat(layout.separatorBottom),
        await footer.evaluate((node) => node.getBoundingClientRect().height),
      );
      assert.equal(layout.overflow, false);
      if (wrapped) assert.ok(layout.rows > 1);
    };
    for (const width of [320, 1076]) {
      await page.setViewportSize({ width, height: 700 });
      for (const mode of ["dark", "light"]) {
        await page.evaluate((mode) => __theme(mode), mode);
        await panel.locator(`html[data-oc-theme="${mode}"]`).waitFor();
        await checkSpacing();
      }
    }
    await footer.getByRole("button", { name: "Apply", exact: true }).click();
    await panel.getByRole("menuitem", { name: "Prepare in current chat", exact: true }).click();
    await page.waitForFunction(() =>
      __draft().startsWith(
        'Use your skill tool to load and invoke the openspec-apply-change skill for OpenSpec change "first-change".',
      ),
    );
    await page.evaluate(() => __edit("Completed"));
    await panel.getByRole("button", { name: "Refresh", exact: true }).click();
    await footer.getByRole("button", { name: "Verify", exact: true }).waitFor();
    await page.setViewportSize({ width: 320, height: 700 });
    await footer.evaluate((node) => {
      node.style.width = "90px";
    });
    await checkSpacing(true);
    await page.close();
  });
});

test("presentation page fills short boards and preserves long board and detail scrolling", async () => {
  await withPanel(async (browser, url) => {
    const page = await browser.newPage({ viewport: { width: 1076, height: 1000 } });
    await page.goto(url);
    const panel = page.frameLocator("iframe");
    await panel.getByRole("button", { name: "first-change", exact: true }).waitFor();
    for (const viewport of [
      { width: 320, height: 1000 },
      { width: 1076, height: 850 },
    ]) {
      await page.setViewportSize(viewport);
      for (const mode of ["dark", "light"]) {
        await page.evaluate((mode) => __theme(mode), mode);
        await panel.locator(`html[data-oc-theme="${mode}"]`).waitFor();
        const coverage = await panel.locator("html").evaluate((node) => ({
          rootHeight: node.getBoundingClientRect().height,
          bodyHeight: document.body.getBoundingClientRect().height,
          boardHeight: document.querySelector(".board-shell").getBoundingClientRect().height,
          viewportHeight: innerHeight,
          overflow: node.scrollWidth > innerWidth,
          colour: getComputedStyle(node).backgroundColor,
        }));
        assert.ok(coverage.boardHeight < coverage.viewportHeight);
        assert.ok(coverage.rootHeight >= coverage.viewportHeight);
        assert.ok(coverage.bodyHeight >= coverage.viewportHeight);
        assert.equal(coverage.overflow, false);
        assert.equal(coverage.colour, mode === "dark" ? "rgb(21, 25, 28)" : "rgb(255, 255, 255)");
        for (const modal of [false, true]) {
          if (modal)
            await panel.getByRole("button", { name: "Create scaffold…", exact: true }).click();
          const screenshot = (await page.screenshot()).toString("base64");
          const colours = await panel.locator("html").evaluate(async (node, png) => {
            const image = new Image();
            image.src = `data:image/png;base64,${png}`;
            await image.decode();
            const canvas = document.createElement("canvas");
            canvas.width = image.width;
            canvas.height = image.height;
            const context = canvas.getContext("2d");
            context.drawImage(image, 0, 0);
            const pixels = context.getImageData(2, 0, 1, image.height).data;
            const dialog = document.querySelector("dialog[open]")?.getBoundingClientRect();
            const colours = new Set();
            // Exclude the modal and viewport edges affected by the backdrop blur.
            for (let y = dialog ? 16 : 2; y < image.height - (dialog ? 16 : 2); y++) {
              if (dialog && y >= dialog.top - 16 && y <= dialog.bottom + 16) continue;
              colours.add([...pixels.slice(y * 4, y * 4 + 3)].join(","));
            }
            return [...colours];
          }, screenshot);
          assert.equal(colours.length, 1, `Painted background seam in ${mode}, modal=${modal}`);
          if (modal)
            await panel
              .getByRole("dialog", { name: "New change" })
              .getByRole("button", { name: "Cancel", exact: true })
              .click();
        }
      }
    }
    await page.evaluate(() => {
      for (let n = 0; n < 40; n++) __recreate(`long-board-${String(n).padStart(2, "0")}`);
    });
    await panel.getByRole("button", { name: "Refresh", exact: true }).click();
    const last = panel.getByRole("button", { name: "long-board-39", exact: true });
    await last.waitFor();
    await last.scrollIntoViewIfNeeded();
    assert.equal(
      await last.evaluate((node) => {
        const rect = node.getBoundingClientRect();
        return (
          rect.top >= 0 && rect.bottom <= innerHeight && document.scrollingElement.scrollTop > 0
        );
      }),
      true,
    );
    await page.evaluate(() => __document("proposal.md", "Long paragraph.\n\n".repeat(300)));
    await panel.getByRole("button", { name: "first-change", exact: true }).click();
    await panel.locator(".document-content").filter({ hasText: "Long paragraph." }).waitFor();
    const scrolling = await panel.locator(".detail-content").evaluate((node) => {
      node.scrollTop = node.scrollHeight;
      return {
        contentScrolled: node.scrollTop > 0,
        outerHeight: document.scrollingElement.scrollHeight,
        viewportHeight: innerHeight,
        detailHeight: document.querySelector(".detail").getBoundingClientRect().height,
        languageHeight:
          document.querySelector(".language-row").getBoundingClientRect().height +
          parseFloat(getComputedStyle(document.querySelector(".language-row")).marginBottom),
      };
    });
    assert.equal(scrolling.contentScrolled, true);
    assert.equal(scrolling.outerHeight, scrolling.viewportHeight);
    assert.ok(
      Math.abs(scrolling.detailHeight + scrolling.languageHeight - scrolling.viewportHeight) <
        0.001,
      "Detail and language row fill the viewport within CSS subpixel precision",
    );
    await page.close();
  });
});

test("one board load requests one listing and one summaries batch", async () => {
  await withPanel(async (browser, url) => {
    const page = await browser.newPage();
    await page.goto(url);
    const panel = page.frameLocator("iframe");
    await panel.getByRole("button", { name: "first-change", exact: true }).waitFor();
    const paths = await page.evaluate(() => __requests.map((item) => item.path));
    assert.deepEqual(
      paths.filter((path) => path.startsWith("/")),
      ["/changes", "/summaries"],
    );
  });
});

test("Apply native menu dismisses without dispatch and prepares current-chat drafts on cards and detail", async () => {
  await withPanel(async (browser, url) => {
    const page = await browser.newPage();
    await page.goto(url);
    const panel = page.frameLocator("iframe");
    const card = panel.locator(".change-card").filter({ hasText: "first-change" });
    const trigger = card.getByRole("button", { name: "Apply", exact: true });
    await trigger.click();
    await panel.getByRole("menuitem", { name: "Run in new worktree", exact: true }).waitFor();
    await panel.getByRole("menu").press("Escape");
    assert.equal(
      await page.evaluate(() =>
        __requests.some((r) => r.path === "compose" || r.path === "start-session"),
      ),
      false,
    );
    assert.equal(await trigger.evaluate((node) => node === document.activeElement), true);
    await trigger.press("Enter");
    await panel.getByRole("menu").press("ArrowDown");
    await panel.getByRole("menu").press("Enter");
    await page.waitForFunction(() => __requests.some((r) => r.path === "compose"));
    assert.match(
      await page.evaluate(() => __draft()),
      /^Use your skill tool to load and invoke the openspec-apply-change skill for OpenSpec change "first-change"\./,
    );
    await panel.getByRole("button", { name: "first-change", exact: true }).click();
    await panel
      .locator(".detail-footer")
      .getByRole("button", { name: "Apply", exact: true })
      .click();
    await panel.getByRole("menuitem", { name: "Prepare in current chat", exact: true }).click();
    await page.waitForFunction(() => __requests.filter((r) => r.path === "compose").length === 2);
    await page.close();
  });
});

test("new-worktree Apply delegates a path-free first message and opens only after submission", async () => {
  await withPanel(async (browser, url) => {
    const page = await browser.newPage();
    await page.goto(url);
    const panel = page.frameLocator("iframe");
    await page.evaluate(() =>
      __startResult({
        sessionId: "apply-session",
        directory: "/new-worktree",
        sent: "sent",
        linked: true,
        worktree: {
          directory: "/new-worktree",
          name: "first-change",
          branch: "first-change",
          status: "ready",
        },
      }),
    );
    await panel
      .locator(".change-card")
      .filter({ hasText: "first-change" })
      .getByRole("button", { name: "Apply", exact: true })
      .click();
    await panel.getByRole("menuitem", { name: "Run in new worktree", exact: true }).click();
    await page.waitForFunction(() => __requests.some((r) => r.path === "open-session"), null, {
      timeout: 3000,
    });
    const requests = await page.evaluate(() => __requests);
    const start = requests.find((r) => r.path === "start-session").body;
    assert.equal(start.projectId, "origin-project");
    assert.deepEqual(start.worktree, { kind: "new", name: "first-change" });
    assert.equal(start.navigation, "preserve");
    assert.match(
      start.text,
      /^Use your skill tool to load and invoke the openspec-apply-change skill for OpenSpec change "first-change"\./,
    );
    assert.doesNotMatch(start.text, /\/tmp\/|copy|symlink/);
    assert.equal(await page.evaluate(() => __draft()), "Earlier draft");
    assert.equal(
      requests.some((r) => r.path === "compose" || r.path === "prompt"),
      false,
    );
    assert.equal(requests.find((r) => r.path === "open-session").body.sessionId, "apply-session");
    await panel
      .locator(".change-card")
      .filter({ hasText: "first-change" })
      .getByRole("button", { name: "Apply", exact: true })
      .click();
    await panel.getByRole("menuitem", { name: "Prepare in current chat", exact: true }).click();
    await page.waitForFunction(() => __requests.some((r) => r.path === "compose"));
    assert.equal(await page.evaluate(() => __draft()), start.text);
    await page.close();
  });
});

test("planning replacement closes stale confirmations and refresh retains search without automatic reload", async () => {
  await withPanel(async (browser, url) => {
    const page = await browser.newPage();
    await page.goto(url);
    const panel = page.frameLocator("iframe");
    await panel.getByLabel("Search changes", { exact: true }).fill("first");
    await panel.getByRole("button", { name: "first-change", exact: true }).click();
    await panel.getByRole("tab", { name: /Tasks · Written/ }).waitFor();
    await panel.getByRole("tab", { name: /Proposal · Written/ }).waitFor();
    await page.evaluate(() => __planning("replacement"));
    await panel.getByRole("button", { name: "Delete change", exact: true }).click();
    await panel.getByRole("dialog").getByRole("button", { name: "Delete", exact: true }).click();
    await panel.getByText("Planning target changed. Refresh to establish the new scope.").waitFor();
    assert.equal(
      await page.evaluate(() => __requests.filter((r) => r.path === "/delete").length),
      1,
    );
    await panel.getByRole("dialog").getByRole("button", { name: "Close", exact: true }).click();
    await panel.getByRole("button", { name: "Refresh", exact: true }).click();
    await panel.locator(".board-shell").waitFor();
    assert.equal(await panel.locator(".detail").isVisible(), false);
    assert.equal(await panel.getByLabel("Search changes", { exact: true }).inputValue(), "first");
    await panel.getByRole("button", { name: "first-change", exact: true }).click();
    await page.waitForFunction(() =>
      __requests.some((r) => r.path === "/tasks" && r.body.expectedPlanning === "replacement"),
    );
    await page.close();
  });
});

test("worktree Apply preserves partial outcomes, inspects collisions and suppresses late navigation", async () => {
  await withPanel(async (browser, url) => {
    const page = await browser.newPage();
    await page.goto(url);
    const panel = page.frameLocator("iframe");
    const launch = async () => {
      await panel
        .locator(".change-card")
        .filter({ hasText: "first-change" })
        .getByRole("button", { name: "Apply", exact: true })
        .click();
      await panel.getByRole("menuitem", { name: "Run in new worktree", exact: true }).click();
    };
    const tree = {
      directory: "/retained",
      name: "first-change",
      branch: "first-change",
      status: "ready",
    };
    for (const result of [
      { sessionId: null, sent: "skipped", failure: "bootstrap-failed", worktree: tree },
      { sessionId: null, sent: "skipped", failure: "session-create-failed", worktree: tree },
      { sessionId: "retained-session", directory: "/retained", sent: "no-model", worktree: tree },
      { sessionId: "retained-session", directory: "/retained", sent: "failed", worktree: tree },
      { unexpected: true },
    ]) {
      const prior = await page.evaluate(() => __requests.filter((r) => r.path === "toast").length);
      await page.evaluate((value) => __startResult(value), result);
      await launch();
      await page.waitForFunction(
        (count) => __requests.filter((r) => r.path === "toast").length > count,
        prior,
      );
      assert.equal(
        await page.evaluate(() =>
          __requests.some((r) => r.path === "open-session" || r.path === "compose"),
        ),
        false,
      );
    }
    for (const code of ["HOST_REJECTED", "HOST_TIMEOUT"]) {
      const prior = await page.evaluate(() => __requests.filter((r) => r.path === "toast").length);
      await page.evaluate((value) => __startError(value), code);
      await launch();
      await page.waitForFunction(
        (count) => __requests.filter((r) => r.path === "toast").length > count,
        prior,
      );
      assert.match(
        await page.evaluate(() => __requests.filter((r) => r.path === "toast").at(-1).body.message),
        /uncertain.*Inspect/s,
      );
      assert.equal(await page.evaluate(() => __draft()), "Earlier draft");
    }
    const launches = await page.evaluate(
      () => __requests.filter((r) => r.path === "start-session").length,
    );
    await page.evaluate((value) => __worktrees([value]), tree);
    await launch();
    await page.waitForFunction(() =>
      __requests.some((r) => r.path === "toast" && /already exists/.test(r.body.message)),
    );
    assert.equal(
      await page.evaluate(() => __requests.filter((r) => r.path === "start-session").length),
      launches,
    );
    await page.evaluate(() => {
      __worktrees([]);
      __holdStart();
      __startResult({
        sessionId: "late",
        directory: "/late",
        sent: "sent",
        worktree: {
          directory: "/late",
          name: "first-change",
          branch: "first-change",
          status: "ready",
        },
      });
    });
    await launch();
    await page.waitForFunction(
      (count) => __requests.filter((r) => r.path === "start-session").length === count + 1,
      launches,
    );
    await panel
      .locator(".change-card")
      .filter({ hasText: "first-change" })
      .getByRole("button", { name: "Apply", exact: true })
      .click();
    assert.equal(
      await panel.getByRole("menuitem", { name: "Run in new worktree", exact: true }).isDisabled(),
      true,
    );
    await panel.getByRole("menu").press("Escape");
    const feedback = await page.evaluate(() => __requests.filter((r) => r.path === "toast").length);
    await page.evaluate(() => {
      __session({ id: "unrelated" });
      __releaseStart();
    });
    await panel
      .locator(".change-card")
      .filter({ hasText: "first-change" })
      .getByRole("button", { name: "Apply", exact: true })
      .click();
    await panel.getByRole("menuitem", { name: "Run in new worktree", exact: true }).waitFor();
    assert.equal(
      await page.evaluate(() => __requests.some((r) => r.path === "open-session")),
      false,
    );
    assert.equal(
      await page.evaluate(() => __requests.filter((r) => r.path === "toast").length),
      feedback,
    );
    assert.equal(await page.evaluate(() => __draft()), "Earlier draft");
    await page.close();
  });
});

test("worktree Apply resolves worktree ownership and fails missing projects without creation", async () => {
  await withPanel(async (browser, url) => {
    const page = await browser.newPage();
    await page.goto(url);
    const panel = page.frameLocator("iframe");
    const launch = async () => {
      await panel
        .locator(".change-card")
        .filter({ hasText: "first-change" })
        .getByRole("button", { name: "Apply", exact: true })
        .click();
      await panel.getByRole("menuitem", { name: "Run in new worktree", exact: true }).click();
    };
    await page.evaluate(() => __projects([]));
    await launch();
    await page.waitForFunction(() => __requests.some((r) => r.path === "toast"));
    assert.equal(
      await page.evaluate(() => __requests.some((r) => r.path === "start-session")),
      false,
    );
    await page.evaluate(() => {
      __projects([{ id: "main-owner", directory: "/main", name: "Main" }]);
      __worktrees([
        {
          directory: "/tmp/fixture-project",
          name: "existing",
          branch: "existing",
          status: "ready",
        },
      ]);
      __startResult({
        sessionId: "owned",
        directory: "/created",
        sent: "sent",
        worktree: {
          directory: "/created",
          name: "first-change",
          branch: "first-change",
          status: "ready",
        },
      });
    });
    await launch();
    await page.waitForFunction(() => __requests.some((r) => r.path === "open-session"));
    assert.equal(
      await page.evaluate(() => __requests.find((r) => r.path === "start-session").body.projectId),
      "main-owner",
    );
    await page.close();
  });
});

test("Apply menu rejects a selection from a replaced chat but accepts a newly opened menu", async () => {
  await withPanel(async (browser, url) => {
    const page = await browser.newPage();
    await page.goto(url);
    const panel = page.frameLocator("iframe");
    const trigger = panel
      .locator(".change-card")
      .filter({ hasText: "first-change" })
      .getByRole("button", { name: "Apply", exact: true });
    await trigger.click();
    await page.evaluate(() => __session({ id: "replacement-chat" }));
    await panel.getByRole("menuitem", { name: "Prepare in current chat", exact: true }).click();
    await assert.rejects(
      page.waitForFunction(
        () => __requests.some((r) => r.path === "compose" || r.path === "start-session"),
        null,
        { timeout: 500 },
      ),
      /Timeout/,
    );
    assert.equal(
      await page.evaluate(() =>
        __requests.some((r) => r.path === "compose" || r.path === "start-session"),
      ),
      false,
    );
    await trigger.click();
    await panel.getByRole("menuitem", { name: "Prepare in current chat", exact: true }).click();
    await page.waitForFunction(() => __requests.some((r) => r.path === "compose"));
    await page.close();
  });
});

test("four cards arrive together after the listing count and tally", async () => {
  await withPanel(async (browser, url) => {
    const page = await browser.newPage();
    await page.goto(url + "?hold-summary");
    const panel = page.frameLocator("iframe");
    await page.waitForFunction(() => __requests.some((item) => item.path === "/summaries"));
    assert.equal(await panel.locator(".change-card").count(), 0);
    assert.equal(
      await panel.locator(".board-tally").textContent(),
      "2 changes · 1 of 2 tasks complete",
    );
    await page.evaluate(() => {
      __addSameStage();
      __recreate("fourth-change");
      __releaseSummaries();
    });
    await panel.getByRole("button", { name: "first-change", exact: true }).waitFor();
    // The listing remains authoritative: newly appeared batch entries are ignored.
    assert.equal(await panel.locator(".change-card").count(), 2);
    await page.evaluate(() => __holdSummaries());
    await panel.getByRole("button", { name: "Refresh", exact: true }).click();
    await page.waitForFunction(
      () => __requests.filter((item) => item.path === "/summaries").length === 2,
    );
    assert.equal(
      await panel.locator(".board-tally").textContent(),
      "4 changes · 2 of 4 tasks complete",
    );
    assert.equal(await panel.locator(".change-card").count(), 2);
    await page.evaluate(() => __releaseSummaries());
    await panel.getByRole("button", { name: "fourth-change", exact: true }).waitFor();
    assert.equal(await panel.locator(".change-card").count(), 4);
    assert.deepEqual(await page.evaluate(() => __requests.map((item) => item.path)), [
      "/changes",
      "/summaries",
      "/changes",
      "/summaries",
    ]);
  });
});

test("whole batch failures retain stale cards and retry; changed roots reload", async () => {
  await withPanel(async (browser, url) => {
    const page = await browser.newPage();
    await page.goto(url);
    const panel = page.frameLocator("iframe");
    await panel.getByRole("button", { name: "first-change", exact: true }).waitFor();
    for (const [reply, text] of [
      ["error", "Batch read failed"],
      ["malformed", "The local OpenSpec service returned invalid data."],
    ]) {
      await page.evaluate((reply) => __batchReply(reply), reply);
      await panel.getByRole("button", { name: "Refresh", exact: true }).click();
      await panel.getByText(text, { exact: true }).waitFor();
      assert.equal(await panel.locator(".change-card").count(), 2);
      await panel.getByRole("button", { name: "Retry", exact: true }).click();
      await panel.getByText(text, { exact: true }).waitFor({ state: "hidden" });
      await panel.getByRole("button", { name: "Refresh", exact: true }).waitFor();
    }
    const before = await page.evaluate(
      () => __requests.filter((item) => item.path === "/changes").length,
    );
    await page.evaluate(() => __batchReply("root"));
    await panel.getByRole("button", { name: "Refresh", exact: true }).click();
    await page.waitForFunction(
      (before) => __requests.filter((item) => item.path === "/changes").length === before + 2,
      before,
    );
    await panel.getByRole("button", { name: "first-change", exact: true }).waitFor();
    assert.equal(await panel.locator(".change-card").count(), 2);
  });
});

test("copy change name routes exact IDs through the host with pointer and keyboard feedback", async () => {
  await withPanel(async (browser, url) => {
    const page = await browser.newPage();
    await page.goto(url);
    const panel = page.frameLocator("iframe");
    await panel.getByRole("button", { name: "first-change", exact: true }).click();
    await panel.getByText("First version of proposal", { exact: true }).waitFor();
    const copy = panel.getByRole("button", { name: "Copy change name", exact: true });
    await copy.waitFor({ timeout: 2000 });
    assert.equal(await copy.getAttribute("title"), null);
    const baseline = await page.evaluate(() => __requests.length);
    await page.evaluate(() => __holdClipboard());
    await copy.click();
    await page.waitForFunction(() => __requests.some((r) => r.path === "clipboard-write"));
    assert.deepEqual(await page.evaluate((start) => __requests.slice(start), baseline), [
      { path: "clipboard-write", body: { text: "first-change" } },
    ]);
    await page.evaluate(() => __releaseClipboard());
    await page.waitForFunction(() => __requests.some((r) => r.path === "toast"));
    assert.deepEqual(await page.evaluate(() => __requests.find((r) => r.path === "toast").body), {
      kind: "success",
      message: "Change name copied",
    });
    await page.evaluate(() => __failClipboard());
    await copy.focus();
    await copy.press("Enter");
    await page.waitForFunction(() =>
      __requests.some((r) => r.path === "toast" && r.body.kind === "error"),
    );
    assert.equal(
      await page.evaluate(() => __requests.filter((r) => r.path === "clipboard-write").length),
      2,
    );
    assert.equal(
      await page.evaluate(
        () => __requests.find((r) => r.path === "toast" && r.body.kind === "error").body.message,
      ),
      "Clipboard unavailable",
    );
    await copy.press("Space");
    await page.waitForFunction(
      () => __requests.filter((r) => r.path === "toast" && r.body.kind === "success").length === 2,
    );
    assert.deepEqual(
      await page.evaluate((start) => __requests.slice(start).map((r) => r.path), baseline),
      ["clipboard-write", "toast", "clipboard-write", "toast", "clipboard-write", "toast"],
    );
    assert.equal(await page.evaluate(() => __draft()), "Earlier draft");
  });
});

test("copy change name keeps badges below the wrapping name and above the goal", async () => {
  await withPanel(async (browser, url) => {
    const page = await browser.newPage();
    await page.goto(url);
    const panel = page.frameLocator("iframe");
    await panel.getByRole("button", { name: "first-change", exact: true }).waitFor();
    const name = "long-change-" + "title-".repeat(20) + "end";
    await page.evaluate((name) => {
      __rename("first-change", name);
      __areas(name, ["area".repeat(40), "Several words in another affected area", "third"]);
    }, name);
    await panel.getByRole("button", { name: "Refresh", exact: true }).click();
    await panel.getByRole("button", { name, exact: true }).click();
    await panel.getByText("First version of proposal", { exact: true }).waitFor();
    for (const width of [1076, 320]) {
      await page.setViewportSize({ width, height: 700 });
      const layout = await panel.locator(".detail").evaluate((detail) => {
        const group = detail.querySelector(".detail-name-group");
        const title = detail.querySelector("h1");
        const copy = detail.querySelector('[aria-label="Copy change name"]');
        const areas = detail.querySelector(".affected-areas");
        const goal = detail.querySelector(".goal");
        const bounds = (node) => node.getBoundingClientRect();
        return {
          grouped: group.contains(title) && group.contains(copy) && !group.contains(areas),
          ordered:
            bounds(areas).top >= bounds(group).bottom && bounds(goal).top >= bounds(areas).bottom,
          visible:
            bounds(copy).width > 0 && bounds(copy).left >= 0 && bounds(copy).right <= innerWidth,
          wraps: bounds(title).height > parseFloat(getComputedStyle(title).lineHeight),
          badgeWraps: bounds(areas.children[1]).top > bounds(areas.children[0]).top,
          overflow: document.body.scrollWidth > innerWidth,
        };
      });
      assert.equal(layout.grouped, true);
      assert.equal(layout.ordered, true);
      assert.equal(layout.visible, true);
      assert.equal(layout.overflow, false);
      if (width === 320) {
        assert.equal(layout.wraps, true);
        assert.equal(layout.badgeWraps, true);
      }
    }
    await panel.getByRole("button", { name: "Copy change name" }).click();
    await page.waitForFunction(() => __requests.some((r) => r.path === "toast"));
    assert.equal(
      await page.evaluate(() => __requests.find((r) => r.path === "clipboard-write").body.text),
      name,
    );
  });
});

test("copy change name retains focus during reads and captures navigation, refresh and unavailable IDs", async () => {
  await withPanel(async (browser, url) => {
    const page = await browser.newPage();
    await page.goto(url);
    const panel = page.frameLocator("iframe");
    await panel.getByRole("button", { name: "first-change", exact: true }).waitFor();
    await page.evaluate(() => {
      __holdProposal();
      __holdTasks();
      __holdClipboard();
    });
    await panel.getByRole("button", { name: "first-change", exact: true }).click();
    const copy = panel.getByRole("button", { name: "Copy change name", exact: true });
    await copy.focus();
    await copy.evaluate((button) => {
      window.__copyButton = button;
    });
    await page.waitForFunction(() => __requests.some((r) => r.path === "/document"));
    await page.evaluate(() => {
      __releaseFile();
      __releaseFile();
    });
    await panel.getByText("First version of proposal", { exact: true }).waitFor();
    await page.waitForFunction(
      () =>
        __requests.some(
          (r) =>
            r.path === "/document" &&
            r.body.change === "first-change" &&
            r.body.selector === "specs/3.md",
        ) &&
        __completed.filter((path) => path === "/document").length ===
          __requests.filter((r) => r.path === "/document").length,
    );
    assert.ok(
      await copy.evaluate(
        (button) => button === window.__copyButton && button === document.activeElement,
      ),
    );
    await copy.press("Enter");
    await page.waitForFunction(() => __requests.some((r) => r.path === "clipboard-write"));
    await panel.getByRole("button", { name: "Back to changes" }).click();
    await panel.getByRole("button", { name: "second-change", exact: true }).click();
    await page.evaluate(() => {
      __releaseReads();
      __releaseClipboard();
    });
    await page.waitForFunction(() => __requests.some((r) => r.path === "toast"));
    await page.waitForFunction(
      () =>
        __requests.some(
          (r) =>
            r.path === "/document" &&
            r.body.change === "second-change" &&
            r.body.selector === "specs/3.md",
        ) &&
        __completed.filter((path) => path === "/document").length ===
          __requests.filter((r) => r.path === "/document").length,
    );
    await page.evaluate(() => __failToast());
    let before = await page.evaluate(() => __requests.length);
    await copy.click();
    await page.waitForFunction(
      (before) => __requests.slice(before).some((r) => r.path === "toast"),
      before,
    );
    assert.deepEqual(
      await page.evaluate((before) => __requests.slice(before).map((r) => r.path), before),
      ["clipboard-write", "toast"],
    );
    await page.evaluate(() => __holdListing());
    await panel
      .getByRole("button", { name: "Refresh", exact: true })
      .evaluate((button) => button.click());
    await page.waitForFunction(() => __requests.filter((r) => r.path === "/changes").length === 2);
    before = await page.evaluate(() => __requests.length);
    await copy.click();
    await page.waitForFunction(
      (before) => __requests.slice(before).some((r) => r.path === "toast"),
      before,
    );
    assert.deepEqual(
      await page.evaluate((before) => __requests.slice(before).map((r) => r.path), before),
      ["clipboard-write", "toast"],
    );
    await page.evaluate(() => {
      __unavailable();
      __releaseListing();
    });
    await panel
      .getByText("This change is no longer available. Refresh or return to the board.", {
        exact: true,
      })
      .waitFor();
    before = await page.evaluate(() => __requests.length);
    await copy.click();
    await page.waitForFunction(
      (before) => __requests.slice(before).some((r) => r.path === "toast"),
      before,
    );
    assert.deepEqual(
      await page.evaluate((before) => __requests.slice(before).map((r) => r.path), before),
      ["clipboard-write", "toast"],
    );
    assert.deepEqual(
      await page.evaluate(() =>
        __requests.filter((r) => r.path === "clipboard-write").map((r) => r.body.text),
      ),
      ["first-change", "second-change", "second-change", "second-change"],
    );
    assert.equal(
      await page.evaluate(
        () =>
          __requests.filter((r) => ["compose", "prompt", "start-session"].includes(r.path)).length,
      ),
      0,
    );
    assert.equal(await page.evaluate(() => __draft()), "Earlier draft");
  });
});

test("archive all uses secondary controls and requires cancellable confirmation", async () => {
  await withPanel(async (browser, url) => {
    const page = await browser.newPage({ viewport: { width: 320, height: 700 } });
    await page.goto(url);
    const panel = page.frameLocator("iframe");
    await panel.getByRole("button", { name: "first-change", exact: true }).waitFor();
    const archive = panel.getByRole("button", { name: "Archive all", exact: true });
    assert.equal(await archive.count(), 1);
    assert.equal(await archive.isDisabled(), true);
    await page.evaluate(() => __edit("Completed"));
    await panel.getByRole("button", { name: "Refresh", exact: true }).click();
    await archive.waitFor();
    await page.waitForFunction(() => __completed.filter((p) => p === "/summaries").length >= 2);
    assert.equal(await archive.isEnabled(), true);
    assert.equal(await archive.getAttribute("data-variant"), "secondary");
    assert.equal(await archive.locator('svg[aria-hidden="true"]').count(), 1);
    assert.ok(
      await archive.evaluate((node) =>
        node.parentElement.nextElementSibling.textContent.includes("Create scaffold…"),
      ),
    );
    await panel.locator('input[aria-label="Search changes"]').fill("no match");
    assert.equal(await archive.isEnabled(), true);
    await archive.click();
    const dialog = panel.getByRole("dialog", { name: "Archive all completed changes?" });
    await dialog.waitFor();
    assert.ok(
      await dialog.evaluate(
        (node) => node.getBoundingClientRect().right <= 320 && node.scrollWidth <= node.clientWidth,
      ),
    );
    assert.equal(
      await dialog
        .getByRole("button", { name: "Cancel", exact: true })
        .evaluate((node) => node === document.activeElement),
      true,
    );
    await page.keyboard.press("Tab");
    assert.equal(
      await dialog
        .getByRole("button", { name: "Start archiving", exact: true })
        .evaluate((node) => node === document.activeElement),
      true,
    );
    assert.match(await dialog.textContent(), /new session.*sends a prompt/s);
    assert.equal(
      await page.evaluate(
        () => __requests.filter((r) => ["start-session", "prompt"].includes(r.path)).length,
      ),
      0,
    );
    await dialog.getByRole("button", { name: "Cancel", exact: true }).click();
    assert.equal(await archive.evaluate((node) => node === document.activeElement), true);
    await archive.click();
    await dialog.getByRole("button", { name: "Start archiving", exact: true }).waitFor();
    await page.keyboard.press("Escape");
    assert.equal(await dialog.count(), 0);
    assert.equal(
      await page.evaluate(
        () => __requests.filter((r) => ["start-session", "prompt"].includes(r.path)).length,
      ),
      0,
    );
    assert.ok(await panel.locator("body").evaluate((node) => node.scrollWidth <= 320));
  });
});

async function readyArchive(page, url) {
  await page.goto(url);
  const panel = page.frameLocator("iframe");
  await panel.getByRole("button", { name: "first-change", exact: true }).waitFor();
  await page.evaluate(() => __edit("Completed"));
  await panel.getByRole("button", { name: "Refresh", exact: true }).click();
  await page.waitForFunction(() => __completed.filter((p) => p === "/summaries").length >= 2);
  return panel;
}

async function confirmArchive(panel) {
  await panel.getByRole("button", { name: "Archive all", exact: true }).click();
  await panel
    .getByRole("dialog", { name: "Archive all completed changes?" })
    .getByRole("button", { name: "Start archiving", exact: true })
    .click();
}

test("archive all submits one completed-only prompt and preserves rail/page fresh-chat drafts", async () => {
  await withPanel(async (browser, url) => {
    for (const surface of ["panel", "page"]) {
      const page = await browser.newPage();
      const panel = await readyArchive(page, url);
      await page.evaluate((surface) => {
        __surface(surface);
        __session(null);
      }, surface);
      const before = await page.evaluate(() => __requests.length);
      await confirmArchive(panel);
      await page.waitForFunction(() => __requests.some((r) => r.path === "start-session"));
      assert.equal(
        await page.evaluate(() => __requests.filter((r) => r.path === "start-session").length),
        1,
      );
      const requests = await page.evaluate((before) => __requests.slice(before), before);
      assert.deepEqual(
        requests.filter((r) => r.path !== "toast").map((r) => r.path),
        ["start-session"],
      );
      const launch = requests.find((r) => r.path === "start-session");
      assert.equal(launch.directory, directory);
      assert.equal(launch.body.navigation, "preserve");
      assert.equal(launch.body.worktree, undefined);
      assert.equal(launch.body.projectId, undefined);
      assert.equal(launch.body.providerId, "openspec-board");
      assert.ok(launch.body.text.length < 16000);
      for (const pattern of [
        /openspec list --json/,
        /openspec status/,
        /CLI-reported task/,
        /positive task total/,
        /done.*skipped/s,
        /sequentially/,
        /openspec-archive-change/,
        /Use your skill tool to load and invoke the openspec-archive-change skill/,
        /unfinished/,
        /unavailable/,
        /unreadable/,
        /verification/,
        /sync.*choices/s,
        /archived.*skipped.*blocked/s,
        /none qualify.*no.*mutations/s,
      ])
        assert.match(launch.body.text, pattern);
      assert.equal(await page.evaluate(() => __draft()), "Earlier draft");
      assert.equal(await panel.locator(".board-shell").isVisible(), true);
      await page.waitForFunction(() => __requests.some((r) => r.path === "toast"));
      assert.match(
        await page.evaluate(() => __requests.find((r) => r.path === "toast").body.message),
        /submitted/,
      );
      await page.close();
    }
  });
});

test("archive all disables loading and absent contexts and invalidates old confirmations", async () => {
  await withPanel(async (browser, url) => {
    const page = await browser.newPage();
    const panel = await readyArchive(page, url);
    const archive = panel.getByRole("button", { name: "Archive all", exact: true });
    await page.evaluate(() => __holdListing());
    await panel.getByRole("button", { name: "Refresh", exact: true }).click();
    assert.equal(await archive.isDisabled(), true);
    await page.evaluate(() => __releaseListing());
    await page.waitForFunction(() => __completed.filter((p) => p === "/summaries").length >= 3);
    await archive.click();
    await page.evaluate(() => __root("replacement-root"));
    await panel.locator("dialog[open]").evaluate(() => {
      // Refresh remains possible through controller callbacks while a modal is open.
      document.querySelector(".refresh-control button").click();
    });
    await page.waitForFunction(() => __requests.filter((r) => r.path === "/changes").length >= 4);
    await panel.locator("dialog[open]").waitFor({ state: "hidden" });
    assert.equal(
      await page.evaluate(() => __requests.filter((r) => r.path === "start-session").length),
      0,
    );
    await page.evaluate(() => __directory(null));
    await page.waitForTimeout(30);
    assert.equal(await archive.isDisabled(), true);
  });
});

test("archive all holds one launch and discards late feedback without refresh or replay", async () => {
  await withPanel(async (browser, url) => {
    for (const replacement of ["session", "directory", "root", "dispose"]) {
      const page = await browser.newPage();
      const panel = await readyArchive(page, url);
      await page.evaluate(() => __holdStart());
      await confirmArchive(panel);
      const archive = panel.getByRole("button", { name: "Archive all", exact: true });
      assert.equal(await archive.isDisabled(), true);
      const reads = await page.evaluate(
        () => __requests.filter((r) => r.path.startsWith("/")).length,
      );
      await archive.evaluate((node) => node.click());
      assert.equal(
        await page.evaluate(() => __requests.filter((r) => r.path === "start-session").length),
        1,
      );
      if (replacement === "session") await page.evaluate(() => __session("other-session"));
      if (replacement === "directory") await page.evaluate(() => __directory("/tmp/other-project"));
      if (replacement === "root") {
        await page.evaluate(() => __root("other-root"));
        await panel.getByRole("button", { name: "Refresh", exact: true }).click();
        await page.waitForFunction(
          () => __requests.filter((r) => r.path === "/changes").length >= 4,
        );
      }
      if (replacement === "dispose")
        await panel.locator("body").evaluate(() => window.dispatchEvent(new Event("pagehide")));
      await page.evaluate(() => __releaseStart());
      await page.waitForTimeout(50);
      assert.equal(
        await page.evaluate(() => __requests.filter((r) => r.path === "start-session").length),
        1,
      );
      assert.equal(
        await page.evaluate(() => __requests.filter((r) => r.path === "toast").length),
        0,
      );
      assert.equal(await page.evaluate(() => __draft()), "Earlier draft");
      if (replacement === "session") {
        assert.equal(
          await page.evaluate(() => __requests.filter((r) => r.path.startsWith("/")).length),
          reads,
        );
        assert.equal(await archive.isEnabled(), true);
      }
      await page.close();
    }
  });
});

test("archive all reports partial and uncertain launches without automatic retry", async () => {
  await withPanel(async (browser, url) => {
    const cases = [
      {
        sent: "sent",
        linked: false,
        match: /submitted.*reference could not be saved/,
        kind: "info",
      },
      ...["no-model", "failed", "skipped"].map((sent) => ({
        sent,
        linked: false,
        match: /archive-session.*not submitted successfully/,
        kind: "error",
      })),
      { error: "NOT_GRANTED", match: /launch failed.*Launch refused/, kind: "error" },
      {
        error: "HOST_TIMEOUT",
        match: /uncertain.*may already exist.*Inspect sessions/,
        kind: "error",
        persistent: true,
      },
      {
        error: "DISCONNECTED",
        match: /uncertain.*may already exist/,
        kind: "error",
        persistent: true,
      },
      { nullSession: true, match: /could not be created.*Inspect sessions/, kind: "error" },
    ];
    for (const entry of cases) {
      const page = await browser.newPage();
      const panel = await readyArchive(page, url);
      await page.evaluate((entry) => {
        if (entry.error) __startError(entry.error);
        else
          __startResult(
            entry.nullSession
              ? {
                  sessionId: null,
                  sent: "skipped",
                  directory: "/tmp/fixture-project",
                  worktree: { directory: "/tmp/worktree", branch: "test" },
                  failure: "session-create-failed",
                }
              : { sessionId: "archive-session", sent: entry.sent, linked: entry.linked },
          );
      }, entry);
      await confirmArchive(panel);
      await page.waitForFunction(() => __requests.some((r) => r.path === "toast"));
      const toast = await page.evaluate(() => __requests.find((r) => r.path === "toast").body);
      assert.match(toast.message, entry.match);
      assert.equal(toast.kind, entry.kind);
      if (entry.persistent) assert.equal(toast.persistent, true);
      assert.equal(
        await page.evaluate(
          () =>
            __requests.filter((r) => ["start-session", "prompt", "compose"].includes(r.path))
              .length,
        ),
        1,
      );
      assert.equal(await panel.locator(".board-shell").isVisible(), true);
      await page.close();
    }
  });
});

test("Markdown panel links use SDK feedback and unchanged DOM survives sibling reads and themes", async () => {
  await withPanel(async (browser, url) => {
    const page = await browser.newPage({ viewport: { width: 320, height: 700 } });
    await page.goto(url);
    const panel = page.frameLocator("iframe");
    await panel.getByRole("button", { name: "first-change", exact: true }).waitFor();
    await page.evaluate(() => {
      __holdFiles();
      __holdTasks();
      __document(
        "proposal.md",
        "# Proposal\n\n[Web](https://example.com/)\n\n```mermaid\nflowchart LR\n A --> B --> C --> D" +
          " --> E".repeat(80) +
          "\n```",
      );
      __goal("first-change", "# Literal goal");
    });
    await panel.getByRole("button", { name: "Refresh", exact: true }).click();
    await panel.getByRole("button", { name: "first-change", exact: true }).click();
    await panel.locator(".document-content pre code").waitFor();
    await panel.locator(".document-content").evaluate((node) => {
      window.retainedCode = node.querySelector("pre code");
      window.retainedHeading = node.querySelector("h1");
      node.querySelector("a").focus();
      node.querySelector("pre").scrollLeft = 30;
    });
    await page.evaluate(() => {
      __releaseFile();
      __releaseFile();
      __releaseFile();
      __releaseFile();
      __theme("light");
    });
    await page.waitForFunction(
      () => __completed.filter((path) => path === "/document").length === 4,
    );
    assert.ok(
      await panel
        .locator(".document-content")
        .evaluate(
          (node) =>
            node.querySelector("pre code") === retainedCode &&
            node.querySelector("h1") === retainedHeading &&
            node.querySelector("a") === document.activeElement &&
            node.querySelector("pre").scrollLeft === 30,
        ),
    );
    assert.equal(await panel.locator(".goal").textContent(), "# Literal goal");
    assert.equal(await panel.locator(".goal h1").count(), 0);
    const reads = await page.evaluate(
      () => __requests.filter((r) => r.path === "/document").length,
    );
    await panel.getByRole("link", { name: "Web" }).click();
    await page.waitForFunction(() => __requests.some((r) => r.path === "open-url"));
    await page.evaluate(() => __failOpenUrl());
    await panel.getByRole("link", { name: "Web" }).click();
    await page.waitForFunction(() => __requests.some((r) => r.path === "toast"));
    assert.equal(
      await page.evaluate(() => __requests.filter((r) => r.path === "/document").length),
      reads,
    );
    assert.equal(
      await panel.locator("body").evaluate((node) => node.scrollWidth <= innerWidth),
      true,
    );
  });
});

test("custom Markdown extensions are case insensitive and plain outputs remain literal", async () => {
  await withPanel(async (browser, url) => {
    const page = await browser.newPage();
    await page.goto(url);
    const panel = page.frameLocator("iframe");
    await panel.getByRole("button", { name: "first-change", exact: true }).waitFor();
    for (const selector of ["CHECKLIST.MD", "checklist.MarkDown", "checklist.txt"]) {
      await page.evaluate((selector) => {
        __customSelector(selector);
        __document(selector, "# Custom heading\n\n- [x] Read only");
      }, selector);
      await panel.getByRole("button", { name: "Refresh", exact: true }).click();
      await panel.getByRole("button", { name: "first-change", exact: true }).click();
      await panel.getByRole("tab", { name: /checklist/ }).click();
      await panel.getByText("Custom heading", { exact: false }).waitFor();
      assert.equal(
        await panel.locator(".document-content h1").count(),
        selector.endsWith("txt") ? 0 : 1,
      );
      await panel.getByRole("tab", { name: /Tasks/ }).click();
      await panel.getByText("1.1 CLI description").waitFor();
      assert.equal(await panel.locator(".task-row h1").count(), 0);
      await panel.getByRole("button", { name: "Back to changes" }).click();
    }
  });
});

test("affected areas are neutral literal read-only badges on cards and detail", async () => {
  await withPanel(async (browser, url) => {
    const page = await browser.newPage();
    await page.goto(url);
    const panel = page.frameLocator("iframe");
    await panel.getByRole("button", { name: "first-change", exact: true }).waitFor();
    const labels = ["auth", "api", "auth", "<img src=x onerror=alert(1)>"];
    await page.evaluate((labels) => __areas("first-change", labels), labels);
    await panel.getByRole("button", { name: "Refresh", exact: true }).click();
    const card = panel
      .locator(".change-card")
      .filter({ has: panel.getByRole("button", { name: "first-change", exact: true }) });
    await card.locator(".affected-areas .oc-sdk-badge").first().waitFor();
    assert.deepEqual(await card.locator(".affected-areas .oc-sdk-badge").allTextContents(), labels);
    assert.equal(
      await card.locator(".affected-areas img, .affected-areas button, .affected-areas a").count(),
      0,
    );
    assert.equal(
      await card
        .locator(".affected-areas")
        .evaluate((node) => node.previousElementSibling.className),
      "card-main",
    );
    await panel.getByRole("button", { name: "first-change", exact: true }).click();
    assert.deepEqual(
      await panel.locator(".detail .affected-areas .oc-sdk-badge").allTextContents(),
      labels,
    );
    assert.equal(await panel.locator(".stage-label .oc-sdk-badge").textContent(), "In Progress");
    assert.equal(
      await panel.locator(".stage-label .oc-sdk-badge").getAttribute("data-tone"),
      "primary",
    );
    assert.ok(
      await panel.locator(".detail-title-group").evaluate((group) => {
        const title = group.querySelector("h1").getBoundingClientRect();
        const areas = group.querySelector(".affected-areas").getBoundingClientRect();
        return areas.top >= title.bottom;
      }),
      "detail areas sit below the title on a wide layout",
    );
    assert.ok(
      await panel
        .locator(".affected-areas .oc-sdk-badge")
        .evaluateAll((nodes) => nodes.every((node) => !node.hasAttribute("data-tone"))),
    );
    await panel.getByRole("button", { name: "Back to changes" }).click();
    assert.equal(
      await panel
        .locator(".change-card")
        .filter({ has: panel.getByRole("button", { name: "second-change", exact: true }) })
        .locator(".affected-areas")
        .isVisible(),
      false,
    );
  });
});

test("affected area refresh retains handles and focus, wraps labels and discards old contexts", async () => {
  await withPanel(async (browser, url) => {
    const page = await browser.newPage({ viewport: { width: 320, height: 700 } });
    await page.goto(url);
    const panel = page.frameLocator("iframe");
    await panel.getByRole("button", { name: "first-change", exact: true }).waitFor();
    const longTitle = "long-change-" + "title-".repeat(20) + "end";
    const labels = ["area".repeat(40), "Several words in another affected area", "third"];
    await page.evaluate(
      ({ longTitle, labels }) => {
        __rename("first-change", longTitle);
        __areas(longTitle, labels);
      },
      { longTitle, labels },
    );
    await panel.getByRole("button", { name: "Refresh", exact: true }).click();
    await panel.getByRole("button", { name: longTitle, exact: true }).waitFor();
    for (const width of [320, 1076]) {
      await page.setViewportSize({ width, height: 700 });
      assert.ok(
        await panel.locator("body").evaluate((body) => body.scrollWidth <= innerWidth),
        "board has no page overflow",
      );
    }
    await panel.getByRole("button", { name: longTitle, exact: true }).click();
    await panel.getByRole("tab", { name: /Proposal/ }).waitFor();
    for (const width of [320, 1076]) {
      await page.setViewportSize({ width, height: 700 });
      assert.ok(
        await panel.locator("body").evaluate((body) => body.scrollWidth <= innerWidth),
        "detail has no page overflow",
      );
      assert.deepEqual(
        await panel.locator(".detail .affected-areas .oc-sdk-badge").allTextContents(),
        labels,
      );
    }
    const before = await page.evaluate(() => __requests.length);
    await panel.locator(".detail").evaluate((detail) => {
      window.__oldBadge = detail.querySelector(".affected-areas .oc-sdk-badge");
      window.__oldShell = detail;
      detail.querySelector(".goal").focus();
    });
    await panel
      .getByRole("button", { name: "Refresh", exact: true })
      .evaluate((button) => button.click());
    await page.waitForFunction((before) => __requests.length >= before + 7, before);
    await panel.getByRole("button", { name: "Refresh", exact: true }).waitFor();
    assert.ok(
      await panel
        .locator(".detail")
        .evaluate(
          (detail) =>
            detail === window.__oldShell &&
            detail.querySelector(".affected-areas .oc-sdk-badge") === window.__oldBadge,
        ),
    );
    assert.equal(
      await panel.locator(".detail .goal").evaluate((button) => button === document.activeElement),
      true,
    );
    const requests = await page.evaluate(
      (before) => __requests.slice(before).map((request) => request.path),
      before,
    );
    assert.equal(requests.filter((path) => path === "/changes").length, 1);
    assert.equal(requests.filter((path) => path === "/summaries").length, 1);
    assert.equal(requests.length, 7);
    await page.evaluate((id) => __areas(id, ["replacement"]), longTitle);
    await panel.getByRole("button", { name: "Refresh", exact: true }).click();
    await panel
      .locator(".detail .affected-areas")
      .getByText("replacement", { exact: true })
      .waitFor();
    assert.ok(await panel.locator(".detail").evaluate(() => !window.__oldBadge.isConnected));
    await page.evaluate((id) => __areas(id, []), longTitle);
    await panel.getByRole("button", { name: "Refresh", exact: true }).click();
    await panel.locator(".detail .affected-areas").waitFor({ state: "hidden" });
    await panel.getByRole("button", { name: "Back to changes" }).click();
    await panel.getByLabel("Search changes").fill("replacement");
    assert.equal(await panel.locator(".change-card").count(), 0);
    await panel.getByLabel("Search changes").fill("");
    await page.evaluate(() => {
      __holdSummaries();
    });
    await panel.getByRole("button", { name: "Refresh", exact: true }).click();
    await page.waitForFunction(
      () => __requests.filter((request) => request.path === "/summaries").length >= 6,
    );
    await page.evaluate(() => __directory("/tmp/other-project"));
    await panel.getByText("other-project", { exact: true }).waitFor();
    await page.evaluate(() => __releaseSummaries());
    assert.equal(await panel.locator(".affected-areas .oc-sdk-badge").count(), 0);
  });
});

test("failed area summaries retain successful badges and removed cards dispose their badges", async () => {
  await withPanel(async (browser, url) => {
    const page = await browser.newPage();
    await page.goto(url);
    const panel = page.frameLocator("iframe");
    await panel.getByRole("button", { name: "first-change", exact: true }).waitFor();
    await page.evaluate(() => __areas("first-change", ["retained"]));
    await panel.getByRole("button", { name: "Refresh", exact: true }).click();
    await panel.locator(".affected-areas").getByText("retained", { exact: true }).waitFor();
    await panel.locator(".board-shell").evaluate((board) => {
      window.__cardBadge = board.querySelector(".affected-areas .oc-sdk-badge");
    });
    await panel.getByRole("button", { name: "first-change", exact: true }).click();
    await page.evaluate(() => {
      __areas("first-change", [""]);
    });
    await panel.getByRole("button", { name: "Refresh", exact: true }).click();
    await panel.locator(".detail-refresh-issue").waitFor();
    assert.deepEqual(
      await panel.locator(".detail .affected-areas .oc-sdk-badge").allTextContents(),
      ["retained"],
    );
    await panel.getByRole("button", { name: "Back to changes" }).click();
    assert.deepEqual(
      await panel.locator(".change-card .affected-areas .oc-sdk-badge").allTextContents(),
      ["retained"],
    );
    assert.ok(
      await panel
        .locator(".board-shell")
        .evaluate(
          (board) => board.querySelector(".affected-areas .oc-sdk-badge") === window.__cardBadge,
        ),
    );
    await panel.getByLabel("Search changes").fill("retained");
    assert.equal(await panel.locator(".change-card").count(), 0);
    await panel.getByLabel("Search changes").fill("");
    await page.evaluate(() => __remove("first-change"));
    await panel.getByRole("button", { name: "Refresh", exact: true }).click();
    await panel
      .getByRole("button", { name: "first-change", exact: true })
      .waitFor({ state: "detached" });
    assert.ok(await panel.locator(".board-shell").evaluate(() => !window.__cardBadge.isConnected));
    await page.evaluate(() => __areas("second-change", ["context-owned"]));
    await panel.getByRole("button", { name: "Refresh", exact: true }).click();
    await panel.locator(".affected-areas").getByText("context-owned", { exact: true }).waitFor();
    await panel.locator(".board-shell").evaluate((board) => {
      window.__contextBadge = board.querySelector(".affected-areas .oc-sdk-badge");
    });
    await page.evaluate(() => __directory("/tmp/new-context"));
    await panel.getByText("new-context", { exact: true }).waitFor();
    assert.ok(
      await panel.locator(".board-shell").evaluate(() => !window.__contextBadge.isConnected),
    );
  });
});

test("panel harness fails on an uncaught asynchronous browser error", async () => {
  await assert.rejects(
    withPanel(async (browser, url) => {
      const page = await browser.newPage();
      await page.goto(url);
      await page.evaluate(() =>
        setTimeout(() => {
          throw new Error("deliberate panel probe");
        }, 0),
      );
      await page.waitForTimeout(60);
      await page.close();
    }),
    /deliberate panel probe/,
  );
});

test("explicit Refresh retains opened-change observations until a new opening", async () => {
  await withPanel(async (browser, url) => {
    const page = await browser.newPage();
    await page.goto(url);
    const panel = page.frameLocator("iframe");
    await panel.getByRole("button", { name: "first-change" }).waitFor();
    assert.deepEqual(await page.evaluate(() => __requests.map((request) => request.path)), [
      "/changes",
      "/summaries",
    ]);
    await panel.getByRole("button", { name: "first-change" }).click();
    await panel.getByText("First version of proposal").waitFor();
    await panel.getByRole("button", { name: "Back to changes" }).click();
    await page.evaluate(() => {
      __edit("Updated proposal");
      document.querySelector("iframe").contentDocument.dispatchEvent(new Event("visibilitychange"));
    });
    await panel.getByRole("button", { name: "first-change" }).click();
    await panel.getByText("First version of proposal").waitFor();
    assert.equal(
      await page.evaluate(
        () => __requests.filter((request) => request.path === "/document").length,
      ),
      4,
    );
    await panel.getByRole("button", { name: "Back to changes" }).click();
    await panel.getByRole("button", { name: "Refresh", exact: true }).click();
    await panel.getByText("2 of 2 tasks complete", { exact: true }).waitFor();
    await panel.getByRole("button", { name: "first-change" }).click();
    await panel.getByText("Updated proposal").waitFor();
    assert.equal(
      await page.evaluate(
        () => __requests.filter((request) => request.path === "/document").length,
      ),
      8,
    );
    await page.close();
  });
});

test("in-place detail restores search and focus; Tasks is a flat CLI-only checklist", async () => {
  await withPanel(async (browser, url) => {
    const page = await browser.newPage({ viewport: { width: 320, height: 700 } });
    await page.goto(url);
    const panel = page.frameLocator("iframe");
    const search = panel.getByLabel("Search changes");
    await search.fill("first");
    await panel.getByRole("button", { name: "first-change" }).click();
    assert.equal(await panel.locator("dialog.detail").count(), 0);
    assert.equal(await panel.locator(".board-shell:visible").count(), 0);
    await panel.getByRole("tab", { name: /Tasks · Written/ }).click();
    await panel.getByText("1.1 CLI description").waitFor();
    assert.equal(await panel.locator(".tasks-view h3").count(), 0);
    assert.equal(
      await panel.locator(".tasks-view .oc-sdk-progress-label").innerText(),
      "1 of 2 tasks complete\n50%",
    );
    assert.equal(await panel.locator(".tasks-view > .progress-label:visible").count(), 0);
    assert.equal(await panel.locator(".task-row details").count(), 0);
    assert.equal(await panel.locator(".task-row").count(), 2);
    assert.equal(await panel.getByRole("img", { name: "Complete" }).count(), 1);
    assert.equal(await panel.getByRole("img", { name: "Pending" }).count(), 1);
    assert.equal(
      await page.evaluate(() => __requests.filter((request) => request.path === "/tasks").length),
      1,
    );
    await panel.getByRole("button", { name: "Back to changes" }).click();
    assert.equal(await search.inputValue(), "first");
    assert.equal(await panel.locator(":focus").getAttribute("class"), "card-main");
    await page.close();
  });
});

test("board actions and detail back/stage controls use the compact viewer layout", async () => {
  await withPanel(async (browser, url) => {
    const page = await browser.newPage({ viewport: { width: 320, height: 700 } });
    await page.goto(url);
    const panel = page.frameLocator("iframe");
    await panel.getByRole("button", { name: "first-change" }).waitFor();
    assert.equal(await panel.locator(".toolbar .heading-actions button").count(), 5);
    await panel.getByRole("button", { name: "Create scaffold…" }).waitFor();
    assert.equal(
      await panel.locator(".board-tally").innerText(),
      "2 changes · 1 of 2 tasks complete",
    );
    await panel.getByRole("button", { name: "first-change" }).click();
    const back = panel.getByRole("button", { name: "Back to changes" });
    assert.equal(await back.getAttribute("title"), null);
    assert.equal(await panel.locator(".stage-label").innerText(), "In Progress");
    assert.equal(await panel.getByRole("heading", { name: "first-change", level: 1 }).count(), 1);
    await back.click();
    await page.close();
  });
});

test("opening detail loads Tasks beside Proposal, then every Specs file, then Design", async () => {
  await withPanel(async (browser, url) => {
    const page = await browser.newPage();
    await page.goto(url);
    const panel = page.frameLocator("iframe");
    await panel.getByRole("button", { name: "first-change" }).waitFor();
    await page.evaluate(() => {
      __design();
      __holdProposal();
      __holdFiles();
      __holdTasks();
    });
    await panel.getByRole("button", { name: "Refresh", exact: true }).click();
    await panel.getByRole("tab", { name: /Specs/ }).count();
    await panel.getByRole("button", { name: "first-change" }).click();
    await page.waitForFunction(
      () =>
        __requests.some((r) => r.path === "/tasks") &&
        __requests.some((r) => r.body?.selector === "proposal.md"),
    );
    assert.equal(
      await page.evaluate(() => __requests.some((r) => r.body?.artifactId === "specs")),
      false,
    );
    await page.evaluate(() => __releaseFile()); // Tasks may finish without advancing documents.
    await panel.getByRole("tab", { name: /Tasks · Written/ }).click();
    await panel.getByText("1.1 CLI description").waitFor();
    assert.equal(
      await page.evaluate(() => __requests.some((r) => r.body?.artifactId === "specs")),
      false,
    );
    await page.evaluate(() => __releaseFile());
    await page.waitForFunction(
      () => __requests.filter((r) => r.body?.artifactId === "specs").length === 3,
    );
    assert.equal(
      await page.evaluate(() => __requests.some((r) => r.body?.artifactId === "design")),
      false,
    );
    await panel.getByRole("tab", { name: /Specs · Written/ }).click();
    await panel.locator("details").first().waitFor();
    const focusedSpecs = panel.getByRole("tab", { name: /Specs · Written/ });
    await focusedSpecs.focus();
    assert.equal(
      await page.evaluate(
        () =>
          __requests.filter(
            (request) => request.path === "/document" && request.body.artifactId === "specs",
          ).length,
      ),
      3,
    );
    await panel.locator("details summary").first().click();
    await focusedSpecs.focus();
    await page.evaluate(() => __releaseFile());
    await panel.getByText("Content of specs/1.md").waitFor();
    assert.equal(await focusedSpecs.evaluate((node) => document.activeElement === node), true);
    await page.evaluate(() => {
      __releaseFile();
      __releaseFile();
    });
    await page.waitForFunction(() => __requests.some((r) => r.body?.artifactId === "design"));
    await panel.locator("details summary").nth(1).click();
    assert.equal(
      await page.evaluate(
        () =>
          __requests.filter(
            (request) => request.path === "/document" && request.body.artifactId === "specs",
          ).length,
      ),
      3,
    );
    await page.close();
  });
});

test("a failed Proposal advances the groups; custom artefacts retain declared order", async () => {
  await withPanel(async (browser, url) => {
    const page = await browser.newPage();
    await page.goto(url);
    const panel = page.frameLocator("iframe");
    await panel.getByRole("button", { name: "first-change" }).waitFor();
    await page.evaluate(() => {
      __design();
      __failDocument();
    });
    await panel.getByRole("button", { name: "Refresh", exact: true }).click();
    await panel.getByRole("button", { name: "first-change" }).click();
    await panel.getByText("Retry this document").waitFor();
    await page.waitForFunction(() => __requests.some((r) => r.body?.selector === "design.md"));
    await panel.getByRole("button", { name: "Retry document" }).click();
    await panel.getByText("First version of proposal").waitFor();
    assert.equal(
      await page.evaluate(() => __requests.filter((r) => r.body?.selector === "design.md").length),
      1,
    );
    await panel.getByRole("button", { name: "Back to changes" }).click();
    await page.evaluate(() => __custom());
    await panel.getByRole("button", { name: "Refresh", exact: true }).click();
    await panel.getByRole("button", { name: "first-change" }).click();
    await page.waitForFunction(() => __requests.some((r) => r.body?.selector === "checklist.md"));
    await panel.getByRole("tab", { name: /checklist/ }).click();
    await panel.getByText("Content of checklist.md").waitFor();
    assert.equal(
      await page.evaluate(() => __requests.filter((r) => r.body?.selector === "tasks.md").length),
      0,
    );
    await page.close();
  });
});

test("early Design and hidden Tasks stay queued without restarting reads or moving focus", async () => {
  await withPanel(async (browser, url) => {
    const page = await browser.newPage();
    await page.goto(url);
    const panel = page.frameLocator("iframe");
    await panel.getByRole("button", { name: "first-change" }).waitFor();
    await page.evaluate(() => {
      __design();
      __holdProposal();
      __holdTasks();
    });
    await panel.getByRole("button", { name: "Refresh", exact: true }).click();
    await panel.getByRole("button", { name: "first-change" }).click();
    const design = panel.getByRole("tab", { name: /Design · Written/ });
    await design.click();
    await panel.getByText("Loading document…").waitFor();
    assert.equal(
      await page.evaluate(() => __requests.filter((r) => r.body?.selector === "design.md").length),
      0,
    );
    await page.evaluate(() => __releaseFile()); // Tasks resolves while Design is selected.
    await panel.getByRole("tab", { name: /Tasks · Written/ }).click();
    await panel.getByText("1.1 CLI description").waitFor();
    await design.click();
    await design.focus();
    await page.evaluate(() => __releaseFile());
    await panel.getByText("Content of design.md").waitFor();
    assert.equal(await design.evaluate((node) => node === document.activeElement), true);
    assert.equal(
      await page.evaluate(
        () => __requests.filter((r) => r.body?.selector === "proposal.md").length,
      ),
      1,
    );
    assert.equal(
      await page.evaluate(() => __requests.filter((r) => r.body?.selector === "design.md").length),
      1,
    );
    await page.close();
  });
});

test("Back and reopening a pending change share its read without the old opening advancing groups", async () => {
  await withPanel(async (browser, url) => {
    const page = await browser.newPage();
    await page.goto(url);
    const panel = page.frameLocator("iframe");
    await panel.getByRole("button", { name: "first-change" }).waitFor();
    await page.evaluate(() => __holdProposal());
    await panel.getByRole("button", { name: "first-change" }).click();
    await page.waitForFunction(() => __requests.some((r) => r.body?.selector === "proposal.md"));
    await panel.getByRole("button", { name: "Back to changes" }).click();
    assert.equal(
      await page.evaluate(() => __requests.filter((r) => r.body?.artifactId === "specs").length),
      0,
    );
    await panel.getByRole("button", { name: "first-change" }).click();
    assert.equal(
      await page.evaluate(
        () => __requests.filter((r) => r.body?.selector === "proposal.md").length,
      ),
      1,
    );
    await page.evaluate(() => __releaseFile());
    await panel.getByText("First version of proposal").waitFor();
    await page.waitForFunction(
      () => __requests.filter((r) => r.body?.artifactId === "specs").length === 3,
    );
    assert.equal(
      await page.evaluate(
        () => __requests.filter((r) => r.body?.selector === "proposal.md").length,
      ),
      1,
    );
    await page.close();
  });
});

test("confirmed unavailability prevents later document groups from starting", async () => {
  await withPanel(async (browser, url) => {
    const page = await browser.newPage();
    await page.goto(url);
    const panel = page.frameLocator("iframe");
    await panel.getByRole("button", { name: "first-change" }).waitFor();
    await page.evaluate(() => __unavailable());
    await panel.getByRole("button", { name: "first-change" }).click();
    await panel.getByText("This change is no longer available").waitFor();
    assert.equal(
      await page.evaluate(() => __requests.filter((r) => r.body?.artifactId === "specs").length),
      0,
    );
    await page.close();
  });
});

test("fresh listing removal stops queued groups in an already open detail", async () => {
  await withPanel(async (browser, url) => {
    const page = await browser.newPage();
    await page.goto(url);
    const panel = page.frameLocator("iframe");
    await panel.getByRole("button", { name: "first-change" }).waitFor();
    await page.evaluate(() => {
      __holdListing();
      __holdProposal();
    });
    await panel.getByRole("button", { name: "Refresh", exact: true }).click();
    await panel.getByRole("button", { name: "first-change" }).click();
    await page.waitForFunction(() => __requests.some((r) => r.body?.selector === "proposal.md"));
    await page.evaluate(() => {
      __remove("first-change");
      __releaseListing();
    });
    await panel.getByText("This change is no longer available").waitFor();
    await page.evaluate(() => __releaseFile());
    assert.equal(
      await page.evaluate(() => __requests.filter((r) => r.body?.artifactId === "specs").length),
      0,
    );
    await page.close();
  });
});

test("Refresh in detail restarts after fresh metadata and preserves its selected tab", async () => {
  await withPanel(async (browser, url) => {
    const page = await browser.newPage();
    await page.goto(url);
    const panel = page.frameLocator("iframe");
    await panel.getByRole("button", { name: "first-change" }).waitFor();
    await panel.getByRole("button", { name: "first-change" }).click();
    await panel.getByRole("tab", { name: /Specs · Written/ }).click();
    await page.waitForFunction(
      () => __requests.filter((r) => r.body?.artifactId === "specs").length === 3,
    );
    await page.evaluate(() => {
      __holdSummaries();
      __edit("Edited after refresh");
    });
    await panel.getByRole("button", { name: "Back to changes" }).click();
    await panel.getByRole("button", { name: "Refresh", exact: true }).click();
    await panel.getByRole("button", { name: "first-change" }).click();
    await panel.getByRole("tab", { name: /Specs · Written/ }).click();
    await page.evaluate(() => __releaseSummaries());
    await panel.getByRole("tab", { name: /Specs · Written/ }).waitFor();
    assert.equal(
      await panel.getByRole("tab", { name: /Specs · Written/ }).getAttribute("aria-selected"),
      "true",
    );
    await panel.getByRole("tab", { name: /Proposal · Written/ }).click();
    await panel.getByText("Edited after refresh").waitFor();
    await page.close();
  });
});

test("counted tabs use listing metadata and support keyboard selection without duplicate reads", async () => {
  await withPanel(async (browser, url) => {
    const page = await browser.newPage();
    await page.goto(url);
    const panel = page.frameLocator("iframe");
    await panel.getByRole("button", { name: "first-change" }).click();
    const specs = panel.getByRole("tab", { name: /Specs.*3/ });
    const tasks = panel.getByRole("tab", { name: /Tasks.*2/ });
    await specs.waitFor();
    assert.equal(await tasks.count(), 1);
    await page.waitForFunction(
      () => __requests.filter((r) => r.body?.artifactId === "specs").length === 3,
    );
    const reads = await page.evaluate(
      () => __requests.filter((r) => r.path === "/tasks" || r.body?.artifactId === "specs").length,
    );
    assert.equal(reads, 4);
    await specs.focus();
    await specs.press("End");
    assert.equal(await tasks.getAttribute("aria-selected"), "true");
    assert.equal(await tasks.evaluate((node) => document.activeElement === node), true);
    assert.equal(
      await tasks.getAttribute("aria-controls"),
      await panel.getByRole("tabpanel").getAttribute("id"),
    );
    await panel.getByText("1.1 CLI description").waitFor();
    await tasks.press("Home");
    assert.equal(
      await page.evaluate(
        () =>
          __requests.filter((r) => r.path === "/tasks" || r.body?.artifactId === "specs").length,
      ),
      reads,
    );
    assert.equal(await panel.getByRole("tab").first().getAttribute("aria-selected"), "true");
    await page.evaluate(() => __theme("light"));
    assert.equal(
      await panel
        .getByRole("tab")
        .first()
        .evaluate((node) => document.activeElement === node),
      true,
    );
    await page.close();
  });
});

test("ready, blocked and skipped tabs stay selectable and explain observed readiness", async () => {
  await withPanel(async (browser, url) => {
    const page = await browser.newPage();
    await page.goto(url);
    const panel = page.frameLocator("iframe");
    await panel.getByRole("button", { name: "first-change" }).waitFor();
    await page.evaluate(() => __readiness("pending"));
    await panel.getByRole("button", { name: "Refresh", exact: true }).click();
    await panel.getByRole("heading", { name: "Planning 2" }).waitFor();
    await panel.getByRole("button", { name: "first-change" }).click();
    await panel.getByRole("tab", { name: /Proposal · Ready to write/ }).waitFor();
    assert.equal(
      await panel.getByRole("tab", { name: /Proposal · Ready to write/ }).innerText(),
      "Proposal",
    );
    assert.equal(await panel.getByRole("tab", { name: /Specs · Blocked/ }).innerText(), "Specs\n0");
    assert.equal(await panel.getByRole("tab", { name: /Design · Skipped/ }).innerText(), "Design");
    await panel.getByText(/Ready to write this artefact/).waitFor();
    await panel.getByRole("tab", { name: /Specs · Blocked/ }).click();
    await panel.getByText(/Blocked.*proposal/i).waitFor();
    await panel.getByRole("tab", { name: /Design · Skipped/ }).click();
    await panel.getByText(/was skipped/i).waitFor();
    assert.equal(
      await page.evaluate(() => __requests.filter((r) => r.path === "/document").length),
      0,
    );
    await page.close();
  });
});

test("counted artefact tabs sit in a grouped track with aligned label and count", async () => {
  await withPanel(async (browser, url) => {
    const page = await browser.newPage({ viewport: { width: 320, height: 700 } });
    await page.goto(url);
    const panel = page.frameLocator("iframe");
    await panel.getByRole("button", { name: "first-change" }).click();
    const track = panel.locator(".artifact-tabs .oc-sdk-tabs");
    const grouping = await track.evaluate((node) => ({
      background: getComputedStyle(node).backgroundColor,
      radius: parseFloat(getComputedStyle(node).borderRadius),
    }));
    assert.notEqual(grouping.background, "rgba(0, 0, 0, 0)");
    assert.ok(grouping.radius > 0);
    const alignment = await panel.getByRole("tab", { name: /Specs · Written/ }).evaluate((tab) => {
      const [label, count] = tab.children;
      const first = label.getBoundingClientRect();
      const second = count.getBoundingClientRect();
      return Math.abs((first.top + first.bottom) / 2 - (second.top + second.bottom) / 2);
    });
    assert.ok(alignment <= 1);
    assert.equal(
      await panel.locator("html").evaluate((node) => node.scrollWidth > innerWidth),
      false,
    );
    await page.close();
  });
});

test("detail back is square and standalone workflow actions use the panel scale", async () => {
  await withPanel(async (browser, url) => {
    const page = await browser.newPage({ viewport: { width: 320, height: 700 } });
    await page.goto(url);
    const panel = page.frameLocator("iframe");
    await panel.getByRole("button", { name: "first-change" }).click();
    const back = panel.getByRole("button", { name: "Back to changes" });
    const title = panel.getByRole("heading", { name: "first-change", level: 1 });
    const titleBox = await title.boundingBox();
    const backBox = await back.boundingBox();
    assert.ok(backBox.x + backBox.width <= titleBox.x);
    assert.equal(await back.getAttribute("title"), null);
    const dimensions = await back.evaluate((node) => ({
      width: node.getBoundingClientRect().width,
      height: node.getBoundingClientRect().height,
    }));
    assert.deepEqual(dimensions, { width: 28, height: 28 });
    assert.equal(
      await panel
        .locator(".detail-footer button:visible")
        .first()
        .evaluate((node) => node.getBoundingClientRect().height),
      28,
    );
    assert.equal(
      await panel.locator("html").evaluate((node) => node.scrollWidth > innerWidth),
      false,
    );
    await page.close();
  });
});

test("unknown blockers stay generic and available pending documents remain readable", async () => {
  await withPanel(async (browser, url) => {
    const page = await browser.newPage();
    await page.goto(url);
    const panel = page.frameLocator("iframe");
    await panel.getByRole("button", { name: "first-change" }).waitFor();
    await page.evaluate(() => __readiness("unknown"));
    await panel.getByRole("button", { name: "Refresh", exact: true }).click();
    await panel.getByRole("heading", { name: "Planning 2" }).waitFor();
    await panel.getByRole("button", { name: "first-change" }).click();
    await panel.getByRole("tab", { name: /Specs · Blocked 0/ }).click();
    assert.match(await panel.locator(".readiness-note").innerText(), /details are not available/);
    assert.doesNotMatch(await panel.locator(".readiness-note").innerText(), /proposal|missing/);
    await panel.getByRole("button", { name: "Back to changes" }).click();
    await page.evaluate(() => __readiness("available"));
    await panel.getByRole("button", { name: "Refresh", exact: true }).click();
    await panel.getByRole("button", { name: "first-change" }).click();
    await panel.getByText("First version of proposal").waitFor();
    assert.equal(
      await panel
        .getByRole("tab", { name: /Proposal · Ready to write/ })
        .getAttribute("aria-selected"),
      "true",
    );
    await page.close();
  });
});

test("one selected placeholder replaces readiness, loading and empty duplicates", async () => {
  await withPanel(async (browser, url) => {
    const page = await browser.newPage();
    await page.goto(url);
    const panel = page.frameLocator("iframe");
    await panel.getByRole("button", { name: "first-change" }).waitFor();
    await page.evaluate(() => __readiness("pending"));
    await panel.getByRole("button", { name: "Refresh", exact: true }).click();
    await panel.getByRole("button", { name: "first-change" }).click();
    assert.equal(await panel.locator(".detail-content p:visible").count(), 1);
    await panel.getByRole("tab", { name: /Specs · Blocked/ }).click();
    assert.equal(await panel.locator(".detail-content p:visible").count(), 1);
    await panel.getByRole("tab", { name: /Design · Skipped/ }).click();
    assert.equal(await panel.locator(".detail-content p:visible").count(), 1);
    await panel.getByRole("tab", { name: /Tasks · Written/ }).click();
    await panel.getByText("1.1 CLI description").waitFor();
    assert.equal(await panel.locator(".detail-content p:visible").count(), 0);
    await page.close();
  });
});

test("document loading is status text, then content replaces it; failures show one notice", async () => {
  await withPanel(async (browser, url) => {
    const page = await browser.newPage();
    await page.goto(url);
    const panel = page.frameLocator("iframe");
    await panel.getByRole("button", { name: "first-change" }).waitFor();
    await page.evaluate(() => __holdProposal());
    await panel.getByRole("button", { name: "first-change" }).click();
    await panel.locator(".document-status", { hasText: "Loading document…" }).waitFor();
    assert.equal(await panel.locator("pre:visible").count(), 0);
    assert.equal(await panel.locator(".detail-content p:visible").count(), 1);
    await page.evaluate(() => __releaseFile());
    await panel.getByText("First version of proposal").waitFor();
    assert.equal(
      await panel
        .locator(
          ".detail-content .document-status:visible, .detail-content .document-issue:visible",
        )
        .count(),
      0,
    );
    assert.equal(await panel.locator(".document-content p:visible").count(), 1);
    await panel.getByRole("button", { name: "Back to changes" }).click();
    await page.evaluate(() => __failDocument());
    await panel.getByRole("button", { name: "Refresh", exact: true }).click();
    await panel.getByRole("button", { name: "first-change" }).click();
    await panel.getByText("Retry this document").waitFor();
    assert.equal(await panel.locator(".detail-content p:visible").count(), 1);
    assert.equal(await panel.locator("pre:visible").count(), 0);
    await page.close();
  });
});

test("empty blocked and fallback Tasks select one message; task failure is actionable", async () => {
  await withPanel(async (browser, url) => {
    const page = await browser.newPage();
    await page.goto(url);
    const panel = page.frameLocator("iframe");
    await panel.getByRole("button", { name: "first-change" }).waitFor();
    await page.evaluate(() => {
      __clearTasks();
      __readiness("blocked-tasks");
    });
    await panel.getByRole("button", { name: "Refresh", exact: true }).click();
    await panel.getByRole("button", { name: "first-change" }).click();
    await panel.getByRole("tab", { name: /Tasks · Blocked 0/ }).click();
    await panel.getByText(/Blocked until specs/).waitFor();
    assert.equal(await panel.getByText("No tasks tracked yet.").count(), 0);
    assert.equal(await panel.locator(".detail-content p:visible").count(), 1);
    await panel.getByRole("button", { name: "Back to changes" }).click();
    await page.evaluate(() => {
      __custom();
      __readiness("");
      __failTasks();
    });
    await panel.getByRole("button", { name: "Refresh", exact: true }).click();
    await panel.getByRole("button", { name: "first-change" }).click();
    await panel.getByRole("tab", { name: "Tasks 0", exact: true }).click();
    await panel.getByText("Retry these tasks").waitFor();
    assert.equal(await panel.locator(".detail-content p:visible").count(), 1);
    await panel.getByRole("button", { name: "Retry tasks" }).click();
    await panel.getByText("No tasks tracked yet.").waitFor();
    assert.equal(await panel.locator(".detail-content p:visible").count(), 1);
    assert.equal(await panel.locator(".tasks-view .oc-sdk-progress:visible").count(), 0);
    await page.close();
  });
});

test("create dialogue keeps concise actions and a width-stable busy button", async () => {
  await withPanel(async (browser, url) => {
    for (const width of [320, 1076]) {
      const page = await browser.newPage({ viewport: { width, height: 700 } });
      await page.goto(url);
      const panel = page.frameLocator("iframe");
      await panel.getByRole("button", { name: "Create scaffold…" }).click();
      const dialog = panel.locator("dialog:visible");
      const create = dialog.getByRole("button", { name: "Create", exact: true });
      assert.equal(await dialog.getByRole("button", { name: "Cancel", exact: true }).count(), 1);
      assert.equal(await create.locator("svg:visible").count(), 1);
      const before = await create.boundingBox();
      assert.equal(before.height, 28);
      assert.equal(
        await dialog
          .getByRole("button", { name: "Cancel", exact: true })
          .evaluate((button) => button.getBoundingClientRect().height),
        28,
      );
      await panel.getByLabel("Change name", { exact: true }).fill("created-change");
      await panel.getByLabel("Goal").fill("Test creation");
      await page.evaluate(() => __holdCreate());
      await create.click();
      await create.locator(".oc-sdk-spinner-ring").waitFor();
      assert.equal(await dialog.getByText("Creating change…").count(), 0);
      assert.equal(await dialog.getByRole("status").isVisible(), false);
      assert.equal(await create.locator("svg:visible").count(), 0);
      assert.equal(await create.getAttribute("aria-busy"), "true");
      assert.equal(await create.isDisabled(), true);
      assert.ok(Math.abs((await create.boundingBox()).width - before.width) < 1);
      await create.evaluate((button) => button.click());
      assert.equal(
        await page.evaluate(
          () => __requests.filter((request) => request.path === "/create").length,
        ),
        1,
      );
      await page.evaluate(() => __releaseCreate());
      await panel.getByRole("button", { name: "created-change" }).waitFor();
      await page.close();
    }
  });
});

test("creation and detail use named dialogue, one main landmark and unique document elements", async () => {
  await withPanel(async (browser, url) => {
    const page = await browser.newPage();
    await page.goto(url);
    const panel = page.frameLocator("iframe");
    assert.equal(await panel.getByRole("main").count(), 1);
    await panel.getByRole("button", { name: "Create scaffold…" }).click();
    const dialog = panel.getByRole("dialog", { name: "New change" });
    await dialog.getByRole("heading", { name: "New change" }).waitFor({ timeout: 5000 });
    await dialog.getByRole("button", { name: "Cancel", exact: true }).click();
    await panel.getByRole("button", { name: "first-change" }).click();
    await panel.getByRole("tab", { name: /Specs/ }).click();
    assert.equal(await panel.getByRole("main").count(), 1);
    assert.equal(await panel.locator(".detail-content details .document-content").count(), 3);
    assert.equal(await panel.locator("[id=document-content]").count(), 0);
    assert.equal(await panel.locator("[role=tabpanel][aria-labelledby]").count(), 1);
    await page.close();
  });
});

test("numeric-prefixed names are created and shown on the board", async () => {
  await withPanel(async (browser, url) => {
    const page = await browser.newPage();
    await page.goto(url);
    const panel = page.frameLocator("iframe");
    await panel.getByRole("button", { name: "Create scaffold…" }).click();
    await panel.getByLabel("Change name", { exact: true }).fill("100-add-feature");
    await panel.getByLabel("Goal").fill("Numeric change");
    await panel.getByRole("button", { name: "Create", exact: true }).click();
    await panel.getByRole("button", { name: "100-add-feature" }).waitFor();
    assert.equal(
      await page.evaluate(() => __requests.filter((request) => request.path === "/create").length),
      1,
    );
    await page.close();
  });
});

test("safe creation refreshes the board and prompts stay unsent", async () => {
  await withPanel(async (browser, url) => {
    const page = await browser.newPage();
    await page.goto(url);
    const panel = page.frameLocator("iframe");
    await panel.getByRole("button", { name: "Create scaffold…" }).click();
    await panel.getByLabel("Change name", { exact: true }).fill("created-change");
    await panel.getByLabel("Goal").fill("Test creation");
    await panel.getByRole("button", { name: "Create", exact: true }).click();
    await panel.getByRole("button", { name: "created-change" }).waitFor();
    await panel
      .locator(".change-card")
      .filter({ hasText: "created-change" })
      .getByRole("button", { name: "Apply" })
      .click();
    await panel.getByRole("menuitem", { name: "Prepare in current chat", exact: true }).click();
    await page.waitForFunction(() => __requests.some((request) => request.path === "compose"));
    const prompt = await page.evaluate(
      () => __requests.find((request) => request.path === "compose")?.body,
    );
    assert.match(
      prompt.text,
      /^Use your skill tool to load and invoke the openspec-apply-change skill for OpenSpec change "created-change"\.\n\nComplete all remaining tasks/,
    );
    assert.match(prompt.text, /all tasks are complete and verification passes/);
    assert.doesNotMatch(prompt.text, /\/tmp\/fixture-project/);
    assert.equal(prompt.mode, "replace");
    await page.close();
  });
});

test("workflow menu change maps seven skills across stages and surfaces without other effects", async () => {
  await withPanel(async (browser, url) => {
    const mappings = [
      ["Continue change", "openspec-continue-change"],
      ["Apply tasks", "openspec-apply-change"],
      ["Update change", "openspec-update-change"],
      ["Sync specs", "openspec-sync-specs"],
      ["Archive change", "openspec-archive-change"],
      ["Verify change", "openspec-verify-change"],
      ["Explore ideas", "openspec-explore"],
    ];
    const recordedGoal = 'Keep "decisions" intact\nincluding this second line';
    for (const surface of ["card", "detail"]) {
      for (const stage of ["planning", "ready", "progress", "complete", "ready-custom"]) {
        const page = await browser.newPage();
        page.setDefaultTimeout(3000);
        await page.goto(url + "?hold-ready");
        await page.waitForFunction(() => typeof __releaseReady === "function");
        await page.evaluate(
          ({ stage, goal }) => {
            __workflowStage(stage === "ready-custom" ? "ready" : stage, stage === "ready-custom");
            __goal("first-change", goal);
            __releaseReady();
          },
          { stage, goal: recordedGoal },
        );
        const panel = page.frameLocator("iframe");
        await panel.getByRole("button", { name: "first-change", exact: true }).waitFor();
        if (surface === "detail") {
          await panel.getByRole("button", { name: "first-change", exact: true }).click();
          await panel.getByRole("tab", { name: /Tasks/ }).click();
          await panel.getByText("1.1 CLI description", { exact: true }).waitFor();
        }
        const owner =
          surface === "card"
            ? panel
                .locator(".change-card")
                .filter({ has: panel.getByRole("button", { name: "first-change", exact: true }) })
            : panel.locator(".detail-footer");
        const trigger = owner.getByRole("button", { name: "Workflows", exact: true });
        const before = await page.evaluate(() => __requests.length);
        await trigger.click();
        assert.deepEqual(
          await panel.getByRole("menuitem").locator(".oc-sdk-option-label").allTextContents(),
          mappings.map(([label]) => label),
        );
        await page.keyboard.press("Escape");
        assert.equal(await page.evaluate(() => __draft()), "Earlier draft");
        assert.equal(await page.evaluate(() => __requests.length), before);
        for (const [index, [label, skill]] of mappings.entries()) {
          if (index === 3) await page.evaluate(() => __session(null));
          await trigger.click();
          await panel.getByRole("menuitem", { name: label, exact: true }).click();
          await page.waitForFunction(
            (count) => __requests.filter((r) => r.path === "toast").length === count,
            index + 1,
          );
          const draft = await page.evaluate(() => __draft());
          assert.match(
            draft,
            new RegExp(
              `^Use your skill tool to load and invoke the ${skill} skill for OpenSpec change "first-change"`,
            ),
          );
          assert.deepEqual(draft.match(/openspec-[a-z-]+/g), [skill]);
          assert.doesNotMatch(draft, /second-change|\/tmp\/|fixture-planning|Earlier draft/);
          if (index === 0 || index === 6) assert.ok(draft.includes(recordedGoal));
          if (index === 0) {
            assert.match(draft, /at most one.*art[ei]fact/i);
            assert.match(draft, /preserve existing decisions/i);
            assert.match(draft, /do not create another change or implement code/i);
            assert.doesNotMatch(draft, /establish and record|complete missing planning/i);
          }
          if (index === 1) assert.match(draft, /remaining tasks.*verify.*blocker/is);
          if (index === 2) assert.match(draft, /confirmations.*do not implement/is);
          if (index === 3) assert.match(draft, /prerequisite.*do not.*archive/is);
          if (index === 4) assert.match(draft, /prerequisite/i);
          if (index === 5) assert.match(draft, /gaps.*without implementation or archiving/is);
          if (index === 6) assert.match(draft, /without file changes or implementation/);
          const requests = await page.evaluate((start) => __requests.slice(start), before);
          assert.deepEqual(
            requests.filter((r) => r.path !== "toast").map((r) => r.path),
            Array(index + 1).fill("compose"),
          );
          assert.ok(
            requests.filter((r) => r.path === "compose").every((r) => r.body.mode === "replace"),
          );
        }
        await page.close();
      }
    }
  });
});

test("workflow menu change missing goal is clarified without automatic metadata writes", async () => {
  await withPanel(async (browser, url) => {
    const page = await browser.newPage();
    page.setDefaultTimeout(3000);
    await page.goto(url + "?hold-ready");
    await page.waitForFunction(() => typeof __releaseReady === "function");
    await page.evaluate(() => {
      __goal("first-change", null);
      __releaseReady();
    });
    const panel = page.frameLocator("iframe");
    const card = panel
      .locator(".change-card")
      .filter({ has: panel.getByRole("button", { name: "first-change", exact: true }) });
    await card.waitFor();
    for (const label of ["Continue change", "Explore ideas"]) {
      const before = await page.evaluate(() => __requests.length);
      await card.getByRole("button", { name: "Workflows", exact: true }).click();
      await panel.getByRole("menuitem", { name: label, exact: true }).click();
      await page.waitForFunction(
        (start) => __requests.slice(start).some((r) => r.path === "toast"),
        before,
      );
      const draft = await page.evaluate(() => __draft());
      assert.match(draft, /ask the user to clarify.*do not invent a goal/is);
      assert.doesNotMatch(draft, /Goal:|null|record a.*goal/);
      assert.deepEqual(
        await page.evaluate((start) => __requests.slice(start).map((r) => r.path), before),
        ["compose", "toast"],
      );
    }
    await page.close();
  });
});

test("workflow menu change rejects replaced contexts and targets but allows stage-only refresh", async () => {
  await withPanel(async (browser, url) => {
    for (const surface of ["card", "detail"]) {
      for (const replacement of [
        "stage",
        "session",
        "planning",
        "directory",
        "removed",
        "detail",
      ]) {
        if (replacement === "detail" && surface === "card") continue;
        const page = await browser.newPage();
        page.setDefaultTimeout(3000);
        await page.goto(url);
        const panel = page.frameLocator("iframe");
        await panel.getByRole("button", { name: "first-change", exact: true }).waitFor();
        if (surface === "detail")
          await panel.getByRole("button", { name: "first-change", exact: true }).click();
        const owner =
          surface === "card"
            ? panel
                .locator(".change-card")
                .filter({ has: panel.getByRole("button", { name: "first-change", exact: true }) })
            : panel.locator(".detail-footer");
        await owner.getByRole("button", { name: "Workflows", exact: true }).click();
        const openedItem = await panel
          .getByRole("menuitem", { name: "Update change", exact: true })
          .elementHandle();
        if (replacement === "session") await page.evaluate(() => __session("other-session"));
        if (replacement === "directory") {
          await page.evaluate(() => __directory("/tmp/replaced-project"));
          await panel.getByRole("heading", { name: "replaced-project" }).waitFor();
        }
        if (["stage", "planning", "removed"].includes(replacement)) {
          const count = await page.evaluate(
            () => __completed.filter((p) => p === "/changes").length,
          );
          await page.evaluate((replacement) => {
            if (replacement === "stage") __edit("Updated proposal");
            if (replacement === "planning") __planning("other-planning");
            if (replacement === "removed") __remove("first-change");
          }, replacement);
          await panel
            .getByRole("button", { name: "Refresh", exact: true })
            .evaluateAll((buttons) => buttons.find((button) => button.checkVisibility()).click());
          await page.waitForFunction(
            (count) => __completed.filter((p) => p === "/changes").length > count,
            count,
          );
          if (replacement === "stage")
            await panel.getByRole("button", { name: "Archive", exact: true }).first().waitFor();
          if (replacement === "planning")
            await page.waitForFunction(() =>
              __requests.some(
                (r) => r.path === "/summaries" && r.body.expectedPlanning === "other-planning",
              ),
            );
          if (replacement === "removed" && surface === "detail")
            await panel
              .getByText("This change is no longer available. Refresh or return to the board.", {
                exact: true,
              })
              .waitFor();
        }
        if (replacement === "detail") {
          await panel
            .getByRole("button", { name: "Back to changes" })
            .evaluate((button) => button.click());
          await panel
            .getByRole("button", { name: "second-change", exact: true })
            .evaluate((button) => button.click());
          await panel.getByRole("heading", { name: "second-change", exact: true }).waitFor();
        }
        const before = await page.evaluate(
          () => __requests.filter((r) => r.path === "compose").length,
        );
        await openedItem.evaluate((button) => button.click());
        // A new global menu round-trip drains the prior selection, even when its owner was disposed.
        await panel
          .locator(".heading-actions")
          .getByRole("button", { name: "Workflows", exact: true, includeHidden: true })
          .evaluate((button) => button.click());
        await page.keyboard.press("Escape");
        assert.equal(
          await page.evaluate(() => __requests.filter((r) => r.path === "compose").length),
          before + (replacement === "stage" ? 1 : 0),
          `${surface}: ${replacement}`,
        );
        if (replacement === "stage")
          assert.match(
            await page.evaluate(() => __draft()),
            /openspec-update-change skill for OpenSpec change "first-change"/,
          );
        if (replacement === "removed" && surface === "detail")
          assert.equal(
            await owner.getByRole("button", { name: "Workflows", exact: true }).isDisabled(),
            true,
          );
        assert.equal(
          await page.evaluate(() =>
            __requests.some((r) =>
              ["prompt", "start-session", "/create", "/delete"].includes(r.path),
            ),
          ),
          false,
        );
        await page.close();
      }
    }
  });
});

test("workflow menu change compose failure and pending late success or failure never replay", async () => {
  await withPanel(async (browser, url) => {
    for (const surface of ["card", "detail"]) {
      for (const outcome of ["failure", "late-success", "late-failure"]) {
        const page = await browser.newPage();
        page.setDefaultTimeout(3000);
        await page.goto(url);
        const panel = page.frameLocator("iframe");
        await panel.getByRole("button", { name: "first-change", exact: true }).waitFor();
        if (surface === "detail")
          await panel.getByRole("button", { name: "first-change", exact: true }).click();
        const owner =
          surface === "card"
            ? panel
                .locator(".change-card")
                .filter({ has: panel.getByRole("button", { name: "first-change", exact: true }) })
            : panel.locator(".detail-footer");
        await page.evaluate((outcome) => {
          __holdCompose();
          if (outcome !== "late-success") __failCompose();
        }, outcome);
        await owner.getByRole("button", { name: "Workflows", exact: true }).click();
        await panel.getByRole("menuitem", { name: "Verify change", exact: true }).click();
        await page.waitForFunction(() => __requests.some((r) => r.path === "compose"));
        if (outcome !== "failure") {
          await page.evaluate(() => __directory("/tmp/late-change-project"));
          await panel.getByRole("heading", { name: "late-change-project" }).waitFor();
        }
        await page.evaluate(() => __releaseCompose());
        if (outcome === "failure")
          await page.waitForFunction(() => __requests.some((r) => r.path === "toast"));
        await panel
          .locator(".heading-actions")
          .getByRole("button", { name: "Workflows", exact: true, includeHidden: true })
          .evaluate((button) => button.click());
        await page.keyboard.press("Escape");
        const requests = await page.evaluate(() =>
          __requests.filter((r) => !r.path.startsWith("/")),
        );
        assert.deepEqual(
          requests.map((r) => r.path),
          outcome === "failure" ? ["compose", "toast"] : ["compose"],
        );
        if (outcome === "failure") {
          assert.equal(requests[1].body.kind, "error");
          assert.equal(requests[1].body.message, "Composer unavailable");
          assert.equal(await page.evaluate(() => __draft()), "Earlier draft");
        }
        await page.close();
      }
    }
  });
});

test("workflow menu global maps six skills without targets, reads or launch effects", async () => {
  await withPanel(async (browser, url) => {
    const page = await browser.newPage();
    page.setDefaultTimeout(3000);
    await page.goto(url);
    const panel = page.frameLocator("iframe");
    await panel.getByRole("button", { name: "first-change", exact: true }).waitFor();
    const trigger = panel
      .locator(".heading-actions")
      .getByRole("button", { name: "Workflows", exact: true });
    const mappings = [
      ["Propose change", "openspec-propose"],
      ["Explore ideas", "openspec-explore"],
      ["New change", "openspec-new-change"],
      ["Fast-forward", "openspec-ff-change"],
      ["Bulk archive", "openspec-bulk-archive-change"],
      ["Onboard", "openspec-onboard"],
    ];
    const before = await page.evaluate(() => __requests.length);
    await trigger.click();
    assert.deepEqual(
      await panel.getByRole("menuitem").locator(".oc-sdk-option-label").allTextContents(),
      mappings.map(([label]) => label),
    );
    await page.keyboard.press("Escape");
    assert.equal(await page.evaluate(() => __draft()), "Earlier draft");
    assert.equal(await page.evaluate(() => __requests.length), before);
    for (const [index, [label, skill]] of mappings.entries()) {
      if (index === 2) await page.evaluate(() => __session(null));
      await trigger.click();
      await panel.getByRole("menuitem", { name: label, exact: true }).click();
      await page.waitForFunction(
        (count) => __requests.filter((r) => r.path === "toast").length === count,
        index + 1,
      );
      const result = await page.evaluate(
        (start) => ({ draft: __draft(), requests: __requests.slice(start) }),
        before,
      );
      assert.match(
        result.draft,
        new RegExp(`^Use your skill tool to load and invoke the ${skill} skill\\.`),
      );
      assert.deepEqual(result.draft.match(/openspec-[a-z-]+/g), [skill]);
      assert.doesNotMatch(
        result.draft,
        /first-change|second-change|Read the proposal|Review the specs|\/tmp\/|fixture-planning|Earlier draft/,
      );
      if ([0, 2, 3].includes(index)) assert.match(result.draft, /ask the user.*intended change/i);
      if (index === 4) assert.match(result.draft, /selection.*conflict.*confirmation/i);
      if (index === 5) assert.match(result.draft, /setup permission.*task selection/i);
      assert.deepEqual(
        result.requests.filter((r) => r.path !== "toast").map((r) => r.path),
        Array(index + 1).fill("compose"),
      );
      for (const request of result.requests.filter((r) => r.path === "compose"))
        assert.equal(request.body.mode, "replace");
    }
    await page.close();
  });
});

test("workflow menu global works on filtered, empty and unresolved boards but requires a directory", async () => {
  await withPanel(async (browser, url) => {
    const page = await browser.newPage();
    page.setDefaultTimeout(3000);
    await page.goto(url + "?hold-ready");
    await page.waitForFunction(() => typeof __releaseReady === "function");
    await page.evaluate(() => {
      __failNextListing();
      __releaseReady();
    });
    const panel = page.frameLocator("iframe");
    await panel.getByText("Cannot check listing", { exact: true }).waitFor();
    const trigger = panel
      .locator(".heading-actions")
      .getByRole("button", { name: "Workflows", exact: true });
    for (const state of ["unresolved", "no-root", "filtered", "empty"]) {
      if (state === "no-root") {
        await page.evaluate(() => __failNextListing("NO_OPENSPEC_ROOT"));
        await panel.getByRole("button", { name: "Refresh", exact: true }).click();
        await panel.getByText("No OpenSpec root", { exact: true }).waitFor();
      }
      if (state === "filtered") {
        await panel.getByRole("button", { name: "Refresh", exact: true }).click();
        await panel.getByRole("button", { name: "first-change", exact: true }).waitFor();
        await panel.getByRole("searchbox").fill("nothing matches");
      }
      if (state === "empty") {
        await page.evaluate(() => {
          __remove("first-change");
          __remove("second-change");
        });
        await panel.getByRole("button", { name: "Refresh", exact: true }).click();
        await page.waitForFunction(() => __completed.filter((p) => p === "/changes").length === 4);
      }
      const before = await page.evaluate(() => __requests.length);
      await trigger.click();
      await panel
        .getByRole("menuitem", {
          name: ["unresolved", "no-root"].includes(state) ? "Onboard" : "Bulk archive",
          exact: true,
        })
        .click();
      await page.waitForFunction(
        (start) => __requests.slice(start).some((r) => r.path === "toast"),
        before,
      );
      assert.deepEqual(
        await page.evaluate((start) => __requests.slice(start).map((r) => r.path), before),
        ["compose", "toast"],
      );
    }
    await page.evaluate(() => __directory(null));
    await panel.getByRole("heading", { name: "No project selected" }).waitFor();
    assert.equal(await trigger.isDisabled(), true);
    const before = await page.evaluate(() => __requests.length);
    await trigger.evaluate((button) => button.click());
    assert.equal(await panel.getByRole("menuitem").count(), 0);
    assert.equal(await page.evaluate(() => __requests.length), before);
    await page.close();
  });
});

test("workflow menu global rejects stale directory, session and planning openings", async () => {
  await withPanel(async (browser, url) => {
    const page = await browser.newPage();
    page.setDefaultTimeout(3000);
    await page.goto(url);
    const panel = page.frameLocator("iframe");
    await panel.getByRole("button", { name: "first-change", exact: true }).waitFor();
    const trigger = panel
      .locator(".heading-actions")
      .getByRole("button", { name: "Workflows", exact: true });
    for (const replacement of ["session", "planning", "directory"]) {
      await trigger.click();
      if (replacement === "session") await page.evaluate(() => __session("replacement-session"));
      if (replacement === "planning") {
        await page.evaluate(() => __planning("replacement-planning"));
        await panel
          .getByRole("button", { name: "Refresh", exact: true })
          .evaluate((button) => button.click());
        await page.waitForFunction(() =>
          __requests.some(
            (r) => r.path === "/summaries" && r.body.expectedPlanning === "replacement-planning",
          ),
        );
      }
      if (replacement === "directory") {
        await page.evaluate(() => __directory("/tmp/replacement-project"));
        await panel.getByRole("heading", { name: "replacement-project" }).waitFor();
      }
      const before = await page.evaluate(
        () => __requests.filter((r) => r.path === "compose").length,
      );
      await panel.getByRole("menuitem", { name: "Propose change", exact: true }).click();
      await trigger.click();
      assert.equal(
        await page.evaluate(() => __requests.filter((r) => r.path === "compose").length),
        before,
      );
      await panel.getByRole("menuitem", { name: "New change", exact: true }).click();
      await page.waitForFunction(
        (count) => __requests.filter((r) => r.path === "compose").length === count,
        before + 1,
      );
    }
    assert.equal(
      await page.evaluate(() =>
        __requests.some((r) => ["prompt", "start-session", "/create", "/delete"].includes(r.path)),
      ),
      false,
    );
    await page.close();
  });
});

test("workflow menu global compose rejection and late replies never fall back or replay", async () => {
  await withPanel(async (browser, url) => {
    const page = await browser.newPage();
    page.setDefaultTimeout(3000);
    await page.goto(url);
    const panel = page.frameLocator("iframe");
    await panel.getByRole("button", { name: "first-change", exact: true }).waitFor();
    const trigger = panel
      .locator(".heading-actions")
      .getByRole("button", { name: "Workflows", exact: true });
    const before = await page.evaluate(() => __requests.length);
    await page.evaluate(() => __failCompose());
    await trigger.click();
    await panel.getByRole("menuitem", { name: "Propose change", exact: true }).click();
    await page.waitForFunction(() =>
      __requests.some(
        (r) =>
          r.path === "toast" &&
          r.body.kind === "error" &&
          r.body.message === "Composer unavailable",
      ),
    );
    assert.equal(await page.evaluate(() => __draft()), "Earlier draft");
    for (const [index, replacement] of ["session", "planning", "directory"].entries()) {
      await page.evaluate((fail) => {
        __holdCompose();
        if (fail) __failCompose();
      }, index !== 1);
      await trigger.click();
      await panel.getByRole("menuitem", { name: "Onboard", exact: true }).click();
      await page.waitForFunction(
        (count) => __requests.filter((r) => r.path === "compose").length === count,
        index + 2,
      );
      if (replacement === "session") await page.evaluate(() => __session(null));
      if (replacement === "planning") {
        await page.evaluate(() => __planning("late-planning"));
        await panel.getByRole("button", { name: "Refresh", exact: true }).click();
        await page.waitForFunction(() =>
          __requests.some(
            (r) => r.path === "/summaries" && r.body.expectedPlanning === "late-planning",
          ),
        );
      }
      if (replacement === "directory") {
        await page.evaluate(() => __directory("/tmp/late-project"));
        await panel.getByRole("heading", { name: "late-project" }).waitFor();
      }
      await page.evaluate(() => __releaseCompose());
      // A subsequent menu round-trip ensures the held SDK reply has been processed.
      await trigger.click();
      await page.keyboard.press("Escape");
      assert.equal(
        await page.evaluate(() => __requests.filter((r) => r.path === "toast").length),
        1,
      );
      assert.equal(
        await page.evaluate(() => __requests.filter((r) => r.path === "compose").length),
        index + 2,
      );
    }
    assert.equal(
      await page.evaluate(
        (start) =>
          __requests
            .slice(start)
            .some((r) => ["prompt", "start-session", "/create", "/delete"].includes(r.path)),
        before,
      ),
      false,
    );
    await page.close();
  });
});

test("a fresh-chat draft receives replacement composition without sending or starting a session", async () => {
  await withPanel(async (browser, url) => {
    const page = await browser.newPage();
    await page.goto(url);
    const panel = page.frameLocator("iframe");
    await panel.getByRole("button", { name: "first-change" }).waitFor();
    await page.evaluate(() => __session(null));
    await panel
      .locator(".change-card")
      .filter({ hasText: "first-change" })
      .getByRole("button", { name: "Apply", exact: true })
      .click();
    await panel.getByRole("menuitem", { name: "Prepare in current chat", exact: true }).click();
    await page.waitForFunction(
      () => __requests.some((request) => request.path === "compose"),
      null,
      { timeout: 3000 },
    );
    const result = await page.evaluate(() => ({
      draft: __draft(),
      requests: __requests.filter((r) => ["compose", "prompt", "start-session"].includes(r.path)),
    }));
    assert.match(
      result.draft,
      /^Use your skill tool to load and invoke the openspec-apply-change skill for OpenSpec change "first-change"\.\n1 of 2 tasks complete\./,
    );
    assert.match(result.draft, /Pick up where implementation left off/);
    assert.match(result.draft, /verify the implementation against its change artefacts/);
    assert.match(result.draft, /Resolve any issues found and verify again/);
    assert.match(
      result.draft,
      /If blocked, report the blocker rather than marking unfinished work complete/,
    );
    assert.doesNotMatch(result.draft, /\/tmp\/fixture-project/);
    assert.deepEqual(
      result.requests.map((request) => request.path),
      ["compose"],
    );
    assert.equal(result.requests[0].body.mode, "replace");
    await page.close();
  });
});

test("composer rejection reports failure; stale session and directory replies do not replay", async () => {
  await withPanel(async (browser, url) => {
    const page = await browser.newPage();
    await page.goto(url);
    const panel = page.frameLocator("iframe");
    const action = panel
      .locator(".change-card")
      .filter({ hasText: "first-change" })
      .getByRole("button", { name: "Apply", exact: true });
    await action.waitFor();
    await page.evaluate(() => __failCompose());
    await action.click();
    await panel.getByRole("menuitem", { name: "Prepare in current chat", exact: true }).click();
    await page.waitForFunction(() =>
      __requests.some(
        (request) =>
          request.path === "toast" &&
          request.body.kind === "error" &&
          request.body.message === "Composer unavailable",
      ),
    );
    assert.equal(await panel.locator(".board-notices button").count(), 0);
    await page.evaluate(() => {
      __holdCompose();
      __failCompose();
    });
    await action.click();
    await panel.getByRole("menuitem", { name: "Prepare in current chat", exact: true }).click();
    await page.waitForFunction(() => __requests.filter((r) => r.path === "compose").length === 2);
    await page.evaluate(() => {
      __session(null);
      __releaseCompose();
    });
    assert.equal(
      await page.evaluate(() => __requests.filter((r) => r.path === "compose").length),
      2,
    );
    assert.equal(await page.evaluate(() => __requests.filter((r) => r.path === "toast").length), 1);
    await page.evaluate(() => {
      __holdCompose();
      __failCompose();
    });
    await action.click();
    await panel.getByRole("menuitem", { name: "Prepare in current chat", exact: true }).click();
    await page.waitForFunction(() => __requests.filter((r) => r.path === "compose").length === 3);
    await page.evaluate(() => {
      __directory("/tmp/other-project");
      __releaseCompose();
    });
    await panel.getByRole("heading", { name: "other-project" }).waitFor();
    assert.equal(await page.evaluate(() => __requests.filter((r) => r.path === "toast").length), 1);
    assert.equal(
      await page.evaluate(() => __requests.filter((r) => r.path === "compose").length),
      3,
    );
    await page.close();
  });
});

test("detail composer rejection reports host feedback without board navigation or a Retry notice", async () => {
  await withPanel(async (browser, url) => {
    const page = await browser.newPage();
    await page.goto(url);
    const panel = page.frameLocator("iframe");
    await panel.getByRole("button", { name: "first-change" }).click();
    await page.evaluate(() => __failCompose());
    await panel
      .locator(".detail-footer")
      .getByRole("button", { name: "Apply", exact: true })
      .click();
    await panel.getByRole("menuitem", { name: "Prepare in current chat", exact: true }).click();
    await page.waitForFunction(() =>
      __requests.some(
        (request) =>
          request.path === "toast" &&
          request.body.kind === "error" &&
          request.body.message === "Composer unavailable",
      ),
    );
    assert.equal(await panel.locator(".detail:visible").count(), 1);
    assert.equal(await panel.locator(".board-notices button").count(), 0);
    assert.equal(
      await page.evaluate(
        () =>
          __requests.filter((request) => ["prompt", "start-session"].includes(request.path)).length,
      ),
      0,
    );
    await page.close();
  });
});

test("canonical-root replacement discards late composer success and failure without replay", async () => {
  await withPanel(async (browser, url) => {
    const page = await browser.newPage();
    await page.goto(url);
    const panel = page.frameLocator("iframe");
    const action = panel
      .locator(".change-card")
      .filter({ hasText: "first-change" })
      .getByRole("button", { name: "Apply", exact: true });
    await action.waitFor();

    await page.evaluate(() => __holdCompose());
    await action.click();
    await panel.getByRole("menuitem", { name: "Prepare in current chat", exact: true }).click();
    await page.waitForFunction(() => __requests.filter((r) => r.path === "compose").length === 1);
    await page.evaluate(() => __root("/tmp/fixture-project/other-root"));
    await panel.getByRole("button", { name: "Refresh", exact: true }).click();
    await page.waitForFunction(() => __requests.filter((r) => r.path === "/changes").length >= 3);
    await action.waitFor();
    await page.evaluate(() => __releaseCompose());
    assert.equal(await page.evaluate(() => __requests.filter((r) => r.path === "toast").length), 0);

    await page.evaluate(() => {
      __holdCompose();
      __failCompose();
    });
    await action.click();
    await panel.getByRole("menuitem", { name: "Prepare in current chat", exact: true }).click();
    await page.waitForFunction(() => __requests.filter((r) => r.path === "compose").length === 2);
    await page.evaluate(() => __root("/tmp/fixture-project/third-root"));
    await panel.getByRole("button", { name: "Refresh", exact: true }).click();
    await page.waitForFunction(() => __requests.filter((r) => r.path === "/changes").length >= 5);
    await action.waitFor();
    await page.evaluate(() => __releaseCompose());
    assert.equal(await panel.getByText("Composer unavailable").count(), 0);
    assert.equal(
      await page.evaluate(() => __requests.filter((r) => r.path === "compose").length),
      2,
    );
    await page.close();
  });
});

test("planning, ready and complete actions prepare the appropriate unsent composer text", async () => {
  await withPanel(async (browser, url) => {
    const page = await browser.newPage();
    await page.goto(url);
    const panel = page.frameLocator("iframe");
    await panel.getByRole("button", { name: "second-change" }).waitFor();
    await panel
      .locator(".change-card")
      .filter({ hasText: "second-change" })
      .getByRole("button", { name: "Apply" })
      .click();
    await panel.getByRole("menuitem", { name: "Prepare in current chat", exact: true }).click();
    await page.waitForFunction(() =>
      __draft().startsWith(
        'Use your skill tool to load and invoke the openspec-apply-change skill for OpenSpec change "second-change".',
      ),
    );
    assert.match(await page.evaluate(() => __draft()), /Complete all remaining tasks/);
    assert.doesNotMatch(await page.evaluate(() => __draft()), /tasks complete\./);
    assert.doesNotMatch(await page.evaluate(() => __draft()), /\/tmp\/fixture-project/);
    await page.evaluate(() => __edit("new text"));
    await panel.getByRole("button", { name: "Refresh", exact: true }).click();
    await panel.getByRole("heading", { name: "Complete 1" }).waitFor();
    await panel
      .locator(".change-card")
      .filter({ hasText: "first-change" })
      .getByRole("button", { name: "Verify" })
      .click();
    await page.waitForFunction(() => __draft().includes("openspec-verify-change"));
    assert.equal(
      await page.evaluate(() => __draft()),
      'Use your skill tool to load and invoke the openspec-verify-change skill for OpenSpec change "first-change".\n\nCompare the implementation with this change\'s planning artefacts and report gaps and inconsistencies diagnostically, without implementation or archiving.',
    );
    assert.doesNotMatch(await page.evaluate(() => __draft()), /\/tmp\/fixture-project/);
    await page.evaluate(() => __readiness("pending"));
    await panel.getByRole("button", { name: "Refresh", exact: true }).click();
    await panel.getByRole("heading", { name: "Planning 2" }).waitFor();
    await panel
      .locator(".change-card")
      .filter({ hasText: "first-change" })
      .getByRole("button", { name: "Plan" })
      .click();
    await page.waitForFunction(() => __draft().includes("openspec-continue-change"));
    assert.match(
      await page.evaluate(() => __draft()),
      /^Use your skill tool to load and invoke the openspec-continue-change skill for OpenSpec change "first-change"\.\nGoal: Read the proposal\n\nInspect/,
    );
    assert.doesNotMatch(await page.evaluate(() => __draft()), /\/tmp\/fixture-project/);
    assert.equal(
      await page.evaluate(
        () => __requests.filter((r) => r.path === "prompt" || r.path === "start-session").length,
      ),
      0,
    );
    await page.close();
  });
});

test("planning label preserves Continue goals on board and detail without extra effects", async () => {
  await withPanel(async (browser, url) => {
    const page = await browser.newPage();
    await page.goto(url);
    const panel = page.frameLocator("iframe");
    await panel.getByRole("button", { name: "first-change" }).waitFor();
    await page.evaluate(() => __readiness("pending"));
    for (const surface of ["board", "detail"]) {
      for (const goal of ['Ship "A"\nwith B', "Existing goal", null, "   "]) {
        await page.evaluate((goal) => __goal("first-change", goal), goal);
        await panel.getByRole("button", { name: "Refresh", exact: true }).click();
        await panel.locator(".toolbar .refresh-control button:not(:disabled)").waitFor();
        if (surface === "detail") {
          const taskReads = await page.evaluate(
            () => __requests.filter((r) => r.path === "/tasks").length,
          );
          await panel.getByRole("button", { name: "first-change", exact: true }).click();
          await panel.locator(".detail-footer").waitFor();
          await page.waitForFunction(
            (count) => __completed.filter((path) => path === "/tasks").length === count + 1,
            taskReads,
          );
        }
        const actions =
          surface === "board"
            ? panel.locator(".change-card").filter({ hasText: "first-change" })
            : panel.locator(".detail-footer");
        const before = await page.evaluate(() => __requests.length);
        await actions.getByRole("button", { name: "Plan", exact: true }).click({ timeout: 2000 });
        await page.waitForFunction(
          (before) => __requests.slice(before).some((r) => r.path === "compose"),
          before,
        );
        const draft = await page.evaluate(() => __draft());
        assert.ok(
          draft.startsWith(
            `Use your skill tool to load and invoke the openspec-continue-change skill for OpenSpec change "first-change".${goal?.trim() ? `\nGoal: ${goal}` : ""}\n\n`,
          ),
        );
        assert.match(draft, /Inspect this existing change's status/);
        assert.match(draft, /Preserve existing decisions and any recorded goal/);
        assert.match(draft, /ask the user to clarify it if necessary/);
        assert.match(draft, /do not invent a goal or write goal metadata automatically/);
        assert.match(draft, /create at most one next planning artefact/);
        assert.match(draft, /Do not create another change or implement code/);
        assert.match(
          draft,
          /Leave complete planning and partially populated artefacts to the workflow; do not automatically Apply/,
        );
        assert.doesNotMatch(
          draft,
          /Goal: null|\/tmp\/fixture-project|openspec-propose|complete missing planning artefacts|establish and record/,
        );
        if (!goal?.trim()) assert.doesNotMatch(draft, /Goal:/);
        assert.deepEqual(
          await page.evaluate(
            (before) =>
              __requests
                .slice(before)
                .filter((r) => r.path !== "toast")
                .map((r) => r.path),
            before,
          ),
          ["compose"],
        );
        if (surface === "detail")
          await panel.getByRole("button", { name: "Back to changes" }).click();
      }
    }
    await page.close();
  });
});

test("workflow menu quick direct scaffold label opens only the existing creation dialog", async () => {
  await withPanel(async (browser, url) => {
    const page = await browser.newPage();
    await page.goto(url);
    const panel = page.frameLocator("iframe");
    await panel.getByRole("button", { name: "first-change", exact: true }).waitFor();
    await panel.locator(".toolbar .refresh-control button:not(:disabled)").waitFor();
    const before = await page.evaluate(() => __requests.length);
    await panel
      .getByRole("button", { name: "Create scaffold…", exact: true })
      .click({ timeout: 2000 });
    await panel.getByRole("dialog").waitFor();
    assert.deepEqual(await page.evaluate((before) => __requests.slice(before), before), []);
    await page.close();
  });
});

test("explore is a secondary, unsent goal-aware action only in Planning", async () => {
  await withPanel(async (browser, url) => {
    const page = await browser.newPage({ viewport: { width: 320, height: 700 } });
    await page.goto(url);
    const panel = page.frameLocator("iframe");
    const card = panel.locator(".change-card").filter({ hasText: "first-change" });
    await panel.getByRole("button", { name: "first-change" }).waitFor();
    await page.evaluate(() => __session(null));
    assert.equal(
      await panel
        .locator(".change-card")
        .filter({ hasText: "second-change" })
        .getByRole("button", { name: "Explore" })
        .isVisible(),
      false,
    );
    for (const [stage, setup] of [
      ["In Progress", () => {}],
      ["Complete", () => __edit("done")],
      ["Planning", () => __readiness("pending")],
    ]) {
      await page.evaluate(setup);
      await panel.getByRole("button", { name: "Refresh", exact: true }).click();
      await panel
        .getByRole("heading", { name: stage === "Planning" ? "Planning 2" : `${stage} 1` })
        .waitFor();
      assert.equal(
        await card.getByRole("button", { name: "Explore" }).isVisible(),
        stage === "Planning",
      );
      if (stage === "Planning") {
        await card.getByRole("button", { name: "Explore" }).click();
        await page.waitForFunction(() => __draft().includes("openspec-explore"));
        assert.match(await page.evaluate(() => __draft()), /first-change.*Read the proposal/s);
        assert.match(
          await page.evaluate(() => __draft()),
          /^Use your skill tool to load and invoke the openspec-explore skill for OpenSpec change "first-change"\.\nGoal: Read the proposal\n\nInvestigate/,
        );
        assert.match(
          await page.evaluate(() => __draft()),
          /Discuss .*without file changes or implementation/,
        );
      }
      assert.equal(
        await panel
          .getByRole("heading", { name: stage === "Planning" ? "Planning 2" : `${stage} 1` })
          .count(),
        1,
      );
    }
    await page.evaluate(() => {
      __goal("first-change", null);
    });
    await panel.getByRole("button", { name: "Refresh", exact: true }).click();
    await card.getByRole("button", { name: "Explore" }).click();
    await page.waitForFunction(() => __draft().includes('"first-change".\n\n'));
    const draft = await page.evaluate(() => __draft());
    assert.match(draft, /inspect existing context and ask the user to clarify it if necessary/);
    assert.doesNotMatch(draft, /Goal:|record a|write a/);
    assert.equal(
      await page.evaluate(
        () => __requests.filter((r) => ["prompt", "start-session"].includes(r.path)).length,
      ),
      0,
    );
    await page.close();
  });
});

test("board header keeps Help, Refresh, Workflows, Archive all and New change in order at both widths", async () => {
  await withPanel(async (browser, url) => {
    const page = await browser.newPage({ viewport: { width: 320, height: 700 } });
    await page.goto(url);
    const panel = page.frameLocator("iframe");
    for (const width of [320, 1076]) {
      await page.setViewportSize({ width, height: 700 });
      const actions = panel.locator(".heading-actions button");
      assert.deepEqual(
        await actions.evaluateAll((buttons) =>
          buttons.map((button) => button.getAttribute("aria-label") || button.textContent.trim()),
        ),
        ["OpenSpec quickstart", "Refresh", "Workflows", "Archive all", "Create scaffold…"],
      );
      assert.deepEqual(
        await actions.evaluateAll((buttons) => buttons.map((button) => button.dataset.variant)),
        ["ghost", "ghost", "secondary", "secondary", "default"],
      );
      assert.equal(
        await panel.locator("html").evaluate((node) => node.scrollWidth > innerWidth),
        false,
      );
    }
    await page.close();
  });
});

test("board title and toolbar reflow as intact rows without moving the gutter", async () => {
  await withPanel(async (browser, url) => {
    const page = await browser.newPage({ viewport: { width: 1076, height: 700 } });
    await page.goto(url);
    const panel = page.frameLocator("iframe");
    const search = panel.getByRole("searchbox", { name: "Search changes" });
    await search.fill("first");
    const tally = panel.locator(".board-tally");
    assert.match(await tally.innerText(), /2 changes.*1 of 2 tasks complete/);
    for (const width of [1076, 561, 560, 559, 320]) {
      await page.setViewportSize({ width, height: 700 });
      const layout = await panel.locator(".board-shell").evaluate((shell) => {
        const rect = (selector) => shell.querySelector(selector).getBoundingClientRect();
        const project = rect("h1"),
          tally = rect(".board-tally");
        const search = rect('input[aria-label="Search changes"]');
        const actions = rect(".heading-actions"),
          toolbar = rect(".toolbar");
        const heading = rect(".heading");
        const button = rect(".heading-actions button");
        return {
          gutter: project.left,
          titleHeight: project.height,
          headingHeight: heading.height,
          titleTop: project.top,
          tallyTop: tally.top,
          searchTop: search.top,
          actionsTop: actions.top,
          toolbarTop: toolbar.top,
          headerBottom: rect(".board-header").bottom,
          bodyTop: rect(".board-body").top,
          boardTop: rect(".board").top,
          searchWidth: search.width,
          searchLeft: search.left,
          searchHeight: search.height,
          searchBottom: search.bottom,
          buttonHeight: button.height,
          searchCenter: search.top + search.height / 2,
          actionsCenter: actions.top + actions.height / 2,
          actionsRight: actions.right,
          toolbarWidth: toolbar.width,
          actionsWidth: actions.width,
          viewport: innerWidth,
          overflow: document.documentElement.scrollWidth > innerWidth,
        };
      });
      assert.equal(layout.gutter, 16);
      assert.equal(layout.titleHeight, 28);
      assert.equal(layout.overflow, false);
      assert.equal(layout.searchHeight, 36);
      assert.equal(layout.buttonHeight, 28);
      assert.equal(
        await panel
          .locator(".card-actions button:visible")
          .first()
          .evaluate((button) => button.getBoundingClientRect().height),
        layout.buttonHeight,
      );
      assert.ok(layout.actionsRight <= width - 15);
      assert.ok(layout.toolbarTop > layout.titleTop);
      assert.equal(layout.bodyTop - layout.headerBottom, 24);
      assert.equal(layout.boardTop - layout.headerBottom, 24);
      if (width === 320) {
        assert.ok(layout.tallyTop > layout.titleTop);
        assert.ok(layout.actionsTop > layout.searchTop);
        assert.equal(layout.headingHeight, 56);
        assert.ok(Math.abs(layout.actionsTop - layout.searchBottom - 12) < 1);
      } else if (width === 1076) {
        assert.ok(Math.abs(layout.tallyTop - layout.titleTop) < 10);
        assert.ok(Math.abs(layout.actionsCenter - layout.searchCenter) < 1);
        assert.ok(layout.searchWidth > 480);
        assert.ok(
          Math.abs(layout.searchWidth + layout.actionsWidth + 12 - layout.toolbarWidth) < 2,
        );
      }
      assert.equal(await search.inputValue(), "first");
      assert.equal(await search.evaluate((node) => node === document.activeElement), true);
    }
    assert.equal(
      await panel.getByRole("button", { name: "Create scaffold…" }).locator("svg").count(),
      1,
    );
    await page.close();
  });
});

test("detail header groups title then goal with the default badge centred", async () => {
  await withPanel(async (browser, url) => {
    const page = await browser.newPage({ viewport: { width: 320, height: 700 } });
    await page.goto(url);
    const panel = page.frameLocator("iframe");
    await panel.getByRole("button", { name: "first-change" }).click();
    for (const width of [320, 1076]) {
      await page.setViewportSize({ width, height: 700 });
      const layout = await panel.locator(".detail-title-row").evaluate((row) => {
        const back = row.querySelector(".detail-back button");
        const title = row.querySelector("h1");
        const badge = row.querySelector(".oc-sdk-badge");
        const center = (node) => {
          const rect = node.getBoundingClientRect();
          return rect.top + rect.height / 2;
        };
        const header = row.closest("header");
        const goal = header.querySelector(".goal").getBoundingClientRect();
        const toolbar = row
          .closest(".detail")
          .querySelector(".detail-toolbar")
          .getBoundingClientRect();
        return {
          back: back.getBoundingClientRect().height,
          title: title.getBoundingClientRect().height,
          badge: badge.getBoundingClientRect().height,
          titleSize: getComputedStyle(title).fontSize,
          badgeSize: getComputedStyle(badge).fontSize,
          backCenter: center(back),
          titleCenter: center(title),
          badgeCenter: center(badge),
          titleBottom: row.getBoundingClientRect().bottom,
          goalTop: goal.top,
          goalBottom: goal.bottom,
          toolbarTop: toolbar.top,
          headerBottom: header.getBoundingClientRect().bottom,
          bodyTop: row.closest(".detail").querySelector(".detail-body").getBoundingClientRect().top,
          overflow: document.documentElement.scrollWidth > innerWidth,
        };
      });
      assert.equal(layout.badgeSize, "11px");
      assert.equal(layout.titleSize, "14px");
      assert.equal(layout.back, 28);
      assert.equal(layout.title, 28);
      assert.ok(layout.badge < layout.back);
      assert.ok(Math.abs(layout.backCenter - layout.badgeCenter) < 1);
      assert.ok(Math.abs(layout.titleCenter - layout.badgeCenter) < 1);
      assert.ok(layout.goalTop > layout.titleBottom);
      assert.ok(layout.toolbarTop > layout.goalBottom);
      assert.equal(layout.bodyTop - layout.headerBottom, 24);
      assert.equal(layout.toolbarTop - layout.goalBottom, 24);
      assert.equal(layout.overflow, false);
      const toolbar = await panel.locator(".detail-toolbar").evaluate((row) => {
        const tabs = row.querySelector(".oc-sdk-tabs").getBoundingClientRect();
        const tabTrack = row.querySelector(".artifact-tabs").getBoundingClientRect();
        const actions = row.querySelector(".detail-heading-actions").getBoundingClientRect();
        const button = row.querySelector(".detail-heading-actions button").getBoundingClientRect();
        const rowRect = row.getBoundingClientRect();
        return {
          tabsHeight: tabs.height,
          buttonHeight: button.height,
          tabsTop: tabs.top,
          tabsBottom: tabs.bottom,
          tabsLeft: tabs.left,
          tabsRight: tabs.right,
          tabTrackRight: tabTrack.right,
          actionsTop: actions.top,
          actionsLeft: actions.left,
          rowLeft: rowRect.left,
          rowRight: rowRect.right,
          rowWidth: rowRect.width,
        };
      });
      assert.equal(toolbar.tabsHeight, 28);
      assert.equal(toolbar.buttonHeight, 28);
      assert.ok(Math.abs(toolbar.tabsLeft - toolbar.rowLeft) < 1);
      if (width === 320) {
        assert.ok(toolbar.actionsTop > toolbar.tabsTop);
        assert.ok(Math.abs(toolbar.actionsTop - toolbar.tabsBottom - 12) < 1);
        assert.ok(Math.abs(toolbar.tabTrackRight - toolbar.rowRight) < 1);
        assert.ok(toolbar.tabsRight < toolbar.tabTrackRight);
      } else {
        assert.ok(Math.abs(toolbar.actionsTop - toolbar.tabsTop) < 1);
        assert.ok(toolbar.tabsRight + 12 <= toolbar.actionsLeft + 1);
        assert.ok(toolbar.tabsRight < toolbar.rowRight - toolbar.rowWidth / 4);
      }
      const footerHeights = await panel
        .locator(".detail-footer button:visible")
        .evaluateAll((buttons) => buttons.map((button) => button.getBoundingClientRect().height));
      assert.ok(footerHeights.length > 0);
      assert.ok(footerHeights.every((height) => height === 28));
    }
    await page.close();
  });
});

test("circled quickstart help is available only on the board", async () => {
  await withPanel(async (browser, url) => {
    const page = await browser.newPage({ viewport: { width: 320, height: 700 } });
    await page.goto(url);
    const panel = page.frameLocator("iframe");
    const help = panel.getByRole("button", { name: "OpenSpec quickstart" });
    await help.waitFor();
    assert.equal(await help.getAttribute("title"), null);
    await help.focus();
    await page.keyboard.press("Enter");
    await page.waitForFunction(() => __requests.some((r) => r.path === "open-url"));
    await panel.getByRole("button", { name: "first-change" }).click();
    assert.equal(
      await panel
        .locator(".detail-toolbar")
        .getByRole("button", { name: "OpenSpec quickstart" })
        .count(),
      0,
    );
    await panel.getByRole("button", { name: "Back to changes" }).click();
    await help.click();
    await page.waitForFunction(() => __requests.filter((r) => r.path === "open-url").length === 2);
    assert.deepEqual(
      await page.evaluate(() => __requests.filter((r) => r.path === "open-url").map((r) => r.body)),
      [
        { url: "https://openspec.dev/docs/quickstart" },
        { url: "https://openspec.dev/docs/quickstart" },
      ],
    );
    assert.equal(await panel.getByRole("button", { name: "first-change" }).count(), 1);
    await page.evaluate(() => __failOpenUrl());
    await help.click();
    await page.waitForFunction(() =>
      __requests.some((r) => r.path === "toast" && r.body.message === "Cannot open quickstart"),
    );
    await page.evaluate(() => __directory(null));
    await panel.getByText("Select an OpenChamber project or worktree", { exact: false }).waitFor();
    await help.click();
    await page.waitForFunction(() => __requests.filter((r) => r.path === "open-url").length === 4);
    await page.evaluate(() => {
      __failNextListing();
      __directory("/tmp/fixture-project");
    });
    await panel.getByText("Cannot check listing").waitFor();
    await help.focus();
    await page.keyboard.press("Enter");
    await page.waitForFunction(() => __requests.filter((r) => r.path === "open-url").length === 5);
    assert.equal(
      await panel.locator("html").evaluate((node) => node.scrollWidth <= node.clientWidth),
      true,
    );
    assert.equal(
      await page.evaluate(() => __requests.filter((r) => r.path === "compose").length),
      0,
    );
    await page.close();
  });
});

test("long change titles and completed-card actions remain reachable at sidebar width", async () => {
  await withPanel(async (browser, url) => {
    const page = await browser.newPage({ viewport: { width: 320, height: 700 } });
    await page.goto(url);
    const panel = page.frameLocator("iframe");
    const name = "a-deliberately-long-disposable-change-name-that-wraps-in-the-detail-header";
    await panel.getByRole("button", { name: "first-change" }).waitFor();
    await page.evaluate((next) => {
      __rename("first-change", next);
      __edit("done");
    }, name);
    await panel.getByRole("button", { name: "Refresh", exact: true }).click();
    const card = panel.locator(".change-card").filter({ hasText: name });
    await card.getByRole("button", { name: "Verify" }).waitFor();
    for (const label of ["Archive", "Verify"]) {
      const box = await card.getByRole("button", { name: label, exact: true }).boundingBox();
      assert.ok(box && box.x >= 0 && box.x + box.width <= 320, `${label} fits the sidebar`);
    }
    await card.getByRole("button", { name, exact: true }).click();
    await panel.getByRole("heading", { name, level: 1 }).waitFor();
    for (const label of ["Delete change"]) {
      const box = await panel
        .locator(".detail-toolbar")
        .getByRole("button", { name: label })
        .boundingBox();
      assert.ok(box && box.x >= 0 && box.x + box.width <= 320, `${label} fits the detail`);
    }
    assert.equal(
      await panel.locator("html").evaluate((node) => node.scrollWidth <= node.clientWidth),
      true,
    );
    await page.close();
  });
});

test("delete confirmation stays visible and width-stable while the request is pending", async () => {
  await withPanel(async (browser, url) => {
    for (const width of [320, 1076]) {
      const page = await browser.newPage({ viewport: { width, height: 700 } });
      await page.goto(url);
      const panel = page.frameLocator("iframe");
      await panel.getByRole("button", { name: "first-change" }).click();
      const toolbarDelete = panel.getByRole("button", { name: "Delete change" });
      assert.equal(await toolbarDelete.innerText(), "Delete");
      assert.equal(await toolbarDelete.locator("svg").count(), 1);
      await panel.locator(".detail-toolbar").getByRole("button", { name: "Delete change" }).click();
      const dialog = panel.getByRole("dialog", { name: /Delete first-change/ });
      const confirm = dialog.getByRole("button", { name: "Delete", exact: true });
      assert.equal(await dialog.getByRole("button", { name: "Cancel", exact: true }).count(), 1);
      assert.equal(await confirm.locator("svg:visible").count(), 1);
      const before = await confirm.boundingBox();
      assert.equal(before.height, 28);
      await page.evaluate(() => __holdDelete());
      await confirm.click();
      await confirm.locator(".oc-sdk-spinner-ring").waitFor();
      assert.equal(await dialog.getByText("Deleting change…").count(), 0);
      assert.equal(await confirm.isVisible(), true);
      assert.equal(await confirm.isDisabled(), true);
      assert.equal(await confirm.getAttribute("aria-busy"), "true");
      assert.equal(await confirm.locator("svg:visible").count(), 0);
      assert.ok(Math.abs((await confirm.boundingBox()).width - before.width) < 1);
      await confirm.evaluate((button) => button.click());
      await page.keyboard.press("Escape");
      assert.equal(await dialog.isVisible(), true);
      assert.equal(
        await page.evaluate(
          () => __requests.filter((request) => request.path === "/delete").length,
        ),
        1,
      );
      await page.evaluate(() => __releaseDelete());
      await panel.getByRole("heading", { name: "Planning 0" }).waitFor();
      await page.close();
    }
  });
});

test("delete requires confirmation and invalidates it when context changes", async () => {
  await withPanel(async (browser, url) => {
    const page = await browser.newPage();
    await page.goto(url);
    const panel = page.frameLocator("iframe");
    await panel.getByRole("button", { name: "first-change" }).click();
    await panel.locator(".detail-toolbar").getByRole("button", { name: "Delete change" }).click();
    const dialog = panel.getByRole("dialog", { name: /Delete first-change/ });
    await dialog.waitFor();
    assert.match(await dialog.innerText(), /permanent.*planning folder/i);
    assert.match(await dialog.innerText(), /implementation.*main spec/i);
    assert.equal(
      await page.evaluate(() => __requests.filter((r) => r.path === "/delete").length),
      0,
    );
    await page.keyboard.press("Escape");
    await dialog.waitFor({ state: "hidden" });
    assert.equal(
      await panel
        .locator(".detail-toolbar")
        .getByRole("button", { name: "Delete" })
        .evaluate((node) => node === document.activeElement),
      true,
    );
    await panel.locator(".detail-toolbar").getByRole("button", { name: "Delete change" }).click();
    await page.evaluate(() => __directory("/tmp/other-project"));
    await dialog.waitFor({ state: "hidden" });
    assert.equal(
      await page.evaluate(() => __requests.filter((r) => r.path === "/delete").length),
      0,
    );
    await page.close();
  });
});

test("confirmed deletion removes one change and returns to a refreshed, searched board", async () => {
  await withPanel(async (browser, url) => {
    const page = await browser.newPage();
    await page.goto(url);
    const panel = page.frameLocator("iframe");
    const search = panel.getByRole("searchbox", { name: "Search changes" });
    await search.fill("first");
    await panel.getByRole("button", { name: "first-change" }).click();
    await page.evaluate(() => __holdDelete());
    await panel.locator(".detail-toolbar").getByRole("button", { name: "Delete change" }).click();
    const dialog = panel.getByRole("dialog", { name: /Delete first-change/ });
    await dialog.getByRole("button", { name: "Delete" }).click();
    await page.waitForFunction(() => __requests.filter((r) => r.path === "/delete").length === 1);
    assert.equal(await dialog.getByRole("button", { name: "Delete" }).isDisabled(), true);
    assert.equal(
      await dialog.getByRole("button", { name: "Delete" }).locator(".oc-sdk-spinner-ring").count(),
      1,
    );
    await page.keyboard.press("Escape");
    assert.equal(await dialog.isVisible(), true);
    await page.evaluate(() => __releaseDelete());
    await panel.getByRole("heading", { name: "Planning 0" }).waitFor();
    assert.equal(await search.inputValue(), "first");
    assert.equal(await panel.getByRole("button", { name: "first-change" }).count(), 0);
    assert.equal(
      await page.evaluate(() => __requests.filter((r) => r.path === "/delete").length),
      1,
    );
    await page.close();
  });
});

test("confirmed deletion invalidates old actions while its next listing is held or fails", async () => {
  await withPanel(async (browser, url) => {
    for (const mode of ["held", "failed"]) {
      const page = await browser.newPage();
      await page.goto(url);
      const panel = page.frameLocator("iframe");
      await panel.getByRole("button", { name: "first-change" }).click();
      await panel.locator(".detail-toolbar").getByRole("button", { name: "Delete change" }).click();
      await page.evaluate(
        (next) => (next === "held" ? __holdListing() : __failNextListing()),
        mode,
      );
      await panel.getByRole("dialog").getByRole("button", { name: "Delete", exact: true }).click();
      await page.waitForFunction(() => __requests.some((item) => item.path === "/delete"));
      await panel.locator(".detail:visible").waitFor({ state: "detached" });
      assert.equal(await panel.getByRole("button", { name: "first-change" }).count(), 0);
      assert.equal(
        await page.evaluate(() => __requests.filter((item) => item.path === "compose").length),
        0,
      );
      if (mode === "held") {
        await page.evaluate(() => __releaseListing());
        await panel.getByRole("button", { name: "Refresh", exact: true }).waitFor();
      } else await panel.getByText("Cannot check listing").waitFor();
      assert.equal(await panel.getByRole("button", { name: "first-change" }).count(), 0);
      await page.close();
    }
  });
});

test("pre-removal summary cannot restore a deleted card, but a new listing can show recreation", async () => {
  await withPanel(async (browser, url) => {
    const page = await browser.newPage();
    await page.goto(url);
    const panel = page.frameLocator("iframe");
    await panel.getByRole("button", { name: "first-change" }).click();
    await page.evaluate(() => __holdSummaries());
    await panel.getByRole("button", { name: "Back to changes" }).click();
    await panel.getByRole("button", { name: "Refresh", exact: true }).click();
    await page.waitForFunction(
      () => __requests.filter((item) => item.path === "/summaries").length >= 2,
    );
    await panel.getByRole("button", { name: "first-change" }).click();
    await panel.locator(".detail-toolbar").getByRole("button", { name: "Delete change" }).click();
    await page.evaluate(() => __holdListing());
    await panel.getByRole("dialog").getByRole("button", { name: "Delete", exact: true }).click();
    await panel.locator(".detail:visible").waitFor({ state: "detached" });
    await page.evaluate(() => __releaseSummaries());
    assert.equal(await panel.getByRole("button", { name: "first-change" }).count(), 0);
    await page.evaluate(() => {
      __recreate("first-change");
      __releaseListing();
    });
    await panel.getByRole("button", { name: "first-change" }).waitFor();
    await panel.getByLabel("Search changes").fill("Recreated goal");
    assert.equal(await panel.getByRole("button", { name: "first-change" }).count(), 1);
    await page.close();
  });
});

test("late document data cannot reopen a deleted change", async () => {
  await withPanel(async (browser, url) => {
    const page = await browser.newPage();
    await page.goto(url);
    const panel = page.frameLocator("iframe");
    await panel.getByRole("button", { name: "first-change" }).waitFor();
    await page.evaluate(() => __holdProposal());
    await panel.getByRole("button", { name: "first-change" }).click();
    await page.waitForFunction(() => __requests.some((r) => r.path === "/document"));
    await panel.locator(".detail-toolbar").getByRole("button", { name: "Delete change" }).click();
    await panel
      .getByRole("dialog", { name: /Delete first-change/ })
      .getByRole("button", { name: "Delete" })
      .click();
    await panel.getByRole("heading", { name: "Planning 0" }).waitFor();
    await page.evaluate(() => __releaseFile());
    assert.equal(await panel.locator(".detail:visible").count(), 0);
    assert.equal(await panel.getByText("First version of proposal").count(), 0);
    await page.close();
  });
});

test("unknown deletion checks original listing, without retrying the mutation", async () => {
  await withPanel(async (browser, url) => {
    const page = await browser.newPage();
    await page.goto(url);
    const panel = page.frameLocator("iframe");
    await panel.getByRole("button", { name: "first-change" }).click();
    await page.evaluate(() => __unknownDelete());
    await panel.locator(".detail-toolbar").getByRole("button", { name: "Delete change" }).click();
    await panel
      .getByRole("dialog", { name: /Delete first-change/ })
      .getByRole("button", { name: "Delete" })
      .click();
    await panel.getByRole("heading", { name: "Planning 0" }).waitFor();
    assert.equal(
      await page.evaluate(() => __requests.filter((r) => r.path === "/delete").length),
      1,
    );
    assert.ok(
      await page.evaluate(
        () =>
          __requests.filter((r) => r.path === "/changes" && r.body.expectedRoot === root).length >=
          1,
      ),
    );
    await page.close();
  });
});

test("an unconfirmed deletion remains non-repeatable until a fresh confirmation", async () => {
  await withPanel(async (browser, url) => {
    const page = await browser.newPage();
    await page.goto(url);
    const panel = page.frameLocator("iframe");
    await panel.getByRole("button", { name: "first-change" }).click();
    await page.evaluate(() => {
      __keepOnUnknownDelete();
      __failNextListing();
    });
    await panel.locator(".detail-toolbar").getByRole("button", { name: "Delete change" }).click();
    const dialog = panel.getByRole("dialog", { name: /Delete first-change/ });
    await dialog.getByRole("button", { name: "Delete" }).click();
    await dialog.getByText(/outcome is unresolved/).waitFor();
    assert.equal(await dialog.getByRole("button", { name: "Delete" }).count(), 0);
    assert.equal(await dialog.getByRole("button", { name: "Cancel" }).isDisabled(), true);
    await page.keyboard.press("Escape");
    assert.equal(await dialog.isVisible(), true);
    assert.equal(
      await page.evaluate(() => __requests.filter((r) => r.path === "/delete").length),
      1,
    );
    await dialog.getByRole("button", { name: "Retry read" }).click();
    await dialog.getByText(/change is still listed/).waitFor();
    assert.equal(
      await page.evaluate(() => __requests.filter((r) => r.path === "/delete").length),
      1,
    );
    await dialog.getByRole("button", { name: "Close" }).click();
    await panel.locator(".detail-toolbar").getByRole("button", { name: "Delete change" }).click();
    assert.equal(await dialog.getByRole("button", { name: "Delete" }).count(), 1);
    await page.close();
  });
});

test("unresolved deletion after a context switch requires original-root read on return", async () => {
  await withPanel(async (browser, url) => {
    const page = await browser.newPage();
    await page.goto(url);
    const panel = page.frameLocator("iframe");
    await panel.getByRole("button", { name: "first-change" }).click();
    await page.evaluate(() => {
      __keepOnUnknownDelete();
      __failNextListing();
    });
    await panel.locator(".detail-toolbar").getByRole("button", { name: "Delete change" }).click();
    const dialog = panel.getByRole("dialog", { name: /Delete first-change/ });
    await dialog.getByRole("button", { name: "Delete" }).click();
    await dialog.getByText(/outcome is unresolved/).waitFor();
    await page.evaluate(() => __directory("/tmp/other-project"));
    await panel.getByRole("heading", { name: "other-project" }).waitFor();
    await page.evaluate(() => __directory(directory));
    await panel.getByRole("button", { name: "first-change" }).click();
    await panel.locator(".detail-toolbar").getByRole("button", { name: "Delete change" }).click();
    assert.equal(await dialog.getByRole("button", { name: "Delete" }).count(), 0);
    await dialog.getByRole("button", { name: "Retry read" }).click();
    await dialog.getByText(/change is still listed/).waitFor();
    assert.equal(
      await page.evaluate(() => __requests.filter((r) => r.path === "/delete").length),
      1,
    );
    await dialog.getByRole("button", { name: "Close" }).click();
    await panel.locator(".detail-toolbar").getByRole("button", { name: "Delete change" }).click();
    assert.equal(await dialog.getByRole("button", { name: "Delete" }).count(), 1);
    await page.close();
  });
});

test("a malformed delete success reconciles by listing rather than claiming success", async () => {
  await withPanel(async (browser, url) => {
    const page = await browser.newPage();
    await page.goto(url);
    const panel = page.frameLocator("iframe");
    await panel.getByRole("button", { name: "first-change" }).click();
    await page.evaluate(() => __malformedDelete());
    await panel.locator(".detail-toolbar").getByRole("button", { name: "Delete change" }).click();
    await panel
      .getByRole("dialog", { name: /Delete first-change/ })
      .getByRole("button", { name: "Delete" })
      .click();
    await panel.getByRole("heading", { name: "Planning 0" }).waitFor();
    assert.ok(
      await page.evaluate(() =>
        __requests.some((r) => r.path === "/changes" && r.body.expectedRoot === root),
      ),
    );
    assert.equal(
      await page.evaluate(() => __requests.filter((r) => r.path === "/delete").length),
      1,
    );
    await page.close();
  });
});

test("a context switch during uncertain deletion reconciles the original root only", async () => {
  await withPanel(async (browser, url) => {
    const page = await browser.newPage();
    await page.goto(url);
    const panel = page.frameLocator("iframe");
    await panel.getByRole("button", { name: "first-change" }).click();
    await page.evaluate(() => {
      __holdDelete();
      __unknownDelete();
    });
    await panel.locator(".detail-toolbar").getByRole("button", { name: "Delete change" }).click();
    await panel
      .getByRole("dialog", { name: /Delete first-change/ })
      .getByRole("button", { name: "Delete" })
      .click();
    await page.waitForFunction(() => __requests.some((r) => r.path === "/delete"));
    await page.evaluate(() => __directory("/tmp/other-project"));
    await page.evaluate(() => __releaseDelete());
    await page.waitForFunction(() =>
      __requests.some(
        (r) =>
          r.path === "/changes" &&
          r.body.directory === "/tmp/fixture-project" &&
          r.body.expectedRoot === root,
      ),
    );
    assert.equal(await panel.getByRole("heading", { name: "No project selected" }).count(), 0);
    assert.equal(
      await page.evaluate(() => __requests.filter((r) => r.path === "/delete").length),
      1,
    );
    await page.close();
  });
});

test("completed board and detail independently prepare Verify and Archive without changing stage", async () => {
  await withPanel(async (browser, url) => {
    const page = await browser.newPage({ viewport: { width: 320, height: 700 } });
    await page.goto(url);
    const panel = page.frameLocator("iframe");
    await panel.getByRole("button", { name: "first-change" }).waitFor();
    await page.evaluate(() => __edit("new text"));
    await panel.getByRole("button", { name: "Refresh", exact: true }).click();
    const card = panel.locator(".change-card").filter({ hasText: "first-change" });
    await card.getByRole("button", { name: "Archive", exact: true }).waitFor();
    assert.deepEqual(await card.locator(".card-actions button:visible").allTextContents(), [
      "Verify",
      "Archive",
      "Workflows",
    ]);
    assert.equal(
      await card.getByRole("button", { name: "Archive" }).getAttribute("data-variant"),
      "default",
    );
    assert.equal(
      await card.getByRole("button", { name: "Verify" }).getAttribute("data-variant"),
      "secondary",
    );
    const colours = await card.locator(".card-actions").evaluate((row) => {
      const primary = row.querySelector('[data-variant="default"]');
      const secondary = row.querySelector('[data-variant="secondary"]');
      return {
        primary: getComputedStyle(primary).backgroundColor,
        secondary: getComputedStyle(secondary).backgroundColor,
      };
    });
    assert.equal(colours.secondary, "rgb(32, 38, 42)");
    assert.notEqual(colours.primary, colours.secondary);
    await card.getByRole("button", { name: "Archive", exact: true }).click();
    await page.waitForFunction(() => __draft().includes("openspec-archive-change"));
    assert.equal(
      await page.evaluate(() => __draft()),
      'Use your skill tool to load and invoke the openspec-archive-change skill for OpenSpec change "first-change".\n\nCheck the workflow\'s archival prerequisites and retain required user confirmations; do not assume prior verification or permission to archive.',
    );
    assert.doesNotMatch(await page.evaluate(() => __draft()), /\/tmp\/fixture-project/);
    assert.equal(await card.getByRole("button", { name: "Verify" }).isEnabled(), true);
    assert.equal(await panel.getByRole("heading", { name: "Complete 1" }).count(), 1);
    await card.getByRole("button", { name: "first-change" }).click();
    assert.equal(
      await panel
        .locator(".detail-footer")
        .getByRole("button", { name: "Archive" })
        .getAttribute("data-variant"),
      "default",
    );
    assert.equal(
      await panel
        .locator(".detail-footer")
        .getByRole("button", { name: "Verify" })
        .getAttribute("data-variant"),
      "secondary",
    );
    assert.equal(
      await panel
        .locator(".detail-footer")
        .getByRole("button", { name: "Verify" })
        .evaluate((button) => getComputedStyle(button).backgroundColor),
      colours.secondary,
    );
    assert.equal(
      await panel
        .locator(".detail-heading-actions")
        .getByRole("button", { name: "Refresh" })
        .getAttribute("data-variant"),
      "ghost",
    );
    await panel.getByRole("button", { name: "Verify", exact: true }).click();
    await page.waitForFunction(() => __draft().includes("openspec-verify-change"));
    assert.equal(
      await page.evaluate(() => __draft()),
      'Use your skill tool to load and invoke the openspec-verify-change skill for OpenSpec change "first-change".\n\nCompare the implementation with this change\'s planning artefacts and report gaps and inconsistencies diagnostically, without implementation or archiving.',
    );
    assert.equal(
      await panel.getByRole("button", { name: "Archive", exact: true }).isEnabled(),
      true,
    );
    await panel.getByRole("button", { name: "Archive", exact: true }).click();
    await page.waitForFunction(() => __requests.filter((r) => r.path === "compose").length === 3);
    assert.deepEqual(
      await page.evaluate(() =>
        __requests.filter((r) => ["prompt", "start-session", "/archive"].includes(r.path)),
      ),
      [],
    );
    assert.equal(await panel.locator(".stage-label").innerText(), "Complete");
    await page.close();
  });
});

test("a refreshed incomplete summary removes Archive from an already open detail", async () => {
  await withPanel(async (browser, url) => {
    const page = await browser.newPage();
    await page.goto(url);
    const panel = page.frameLocator("iframe");
    await panel.getByRole("button", { name: "first-change" }).waitFor();
    await page.evaluate(() => __edit("complete proposal"));
    await panel.getByRole("button", { name: "Refresh", exact: true }).click();
    await panel.getByRole("heading", { name: "Complete 1" }).waitFor();
    await page.evaluate(() => {
      __unedit();
      __holdSummaries();
    });
    await panel.getByRole("button", { name: "Refresh", exact: true }).click();
    await page.waitForFunction(() => __requests.filter((r) => r.path === "/summaries").length >= 3);
    await panel.getByRole("button", { name: "first-change" }).click();
    assert.equal(await panel.locator(".stage-label").innerText(), "Complete");
    await page.evaluate(() => __releaseSummaries());
    await panel.locator(".stage h2", { hasText: "In Progress 1" }).waitFor({ state: "attached" });
    await panel.locator(".stage-label").getByText("In Progress").waitFor();
    assert.equal(
      await panel
        .locator(".detail-footer button:visible")
        .allInnerTexts()
        .then((labels) => labels.includes("Archive")),
      false,
    );
    assert.equal(
      await page.evaluate(() => __requests.filter((r) => r.path === "compose").length),
      0,
    );
    await page.close();
  });
});

test("readiness-only summary changes update focused tab names without losing focus", async () => {
  await withPanel(async (browser, url) => {
    const page = await browser.newPage();
    await page.goto(url);
    const panel = page.frameLocator("iframe");
    await panel.getByRole("button", { name: "first-change" }).waitFor();
    await page.evaluate(() => {
      __proposalStatus("ready");
      __holdSummaries();
    });
    await panel.getByRole("button", { name: "Refresh", exact: true }).click();
    await page.waitForFunction(
      () => __requests.filter((item) => item.path === "/summaries").length >= 2,
    );
    await panel.getByRole("button", { name: "first-change" }).click();
    const proposal = panel.getByRole("tab", { name: /Proposal · Written/ });
    await proposal.focus();
    await page.waitForFunction(
      () =>
        __requests.some((item) => item.path === "/tasks") &&
        __requests.some((item) => item.path === "/document"),
    );
    const before = await page.evaluate(
      () => __requests.filter((item) => ["/tasks", "/document"].includes(item.path)).length,
    );
    await page.evaluate(() => __releaseSummaries());
    const updated = panel.getByRole("tab", { name: /Proposal · Ready to write/ });
    await updated.waitFor({ timeout: 5000 });
    assert.equal(await updated.evaluate((node) => document.activeElement === node), true);
    assert.equal(await updated.getAttribute("aria-selected"), "true");
    assert.equal(
      await page.evaluate(
        () => __requests.filter((item) => ["/tasks", "/document"].includes(item.path)).length,
      ),
      before,
    );
    await page.close();
  });
});

test("refresh does not overlap and reports partial failure without clearing retained cards", async () => {
  await withPanel(async (browser, url) => {
    const page = await browser.newPage();
    await page.goto(url);
    const panel = page.frameLocator("iframe");
    await panel.getByRole("button", { name: "first-change" }).waitFor();
    await page.evaluate(() => __holdListing());
    await panel.getByRole("button", { name: "Refresh", exact: true }).click();
    await page.waitForFunction(
      () => __requests.filter((item) => item.path === "/changes").length === 2,
    );
    assert.equal(
      await panel.getByRole("button", { name: "Refresh", exact: true }).isDisabled(),
      true,
    );
    assert.equal(await panel.getByRole("button", { name: "first-change" }).count(), 1);
    assert.equal(
      await page.evaluate(() => __requests.filter((item) => item.path === "/changes").length),
      2,
    );
    await page.evaluate(() => {
      __releaseListing();
      __failSummary();
    });
    await panel.getByText(/first-change is stale/).waitFor();
    await panel.getByRole("button", { name: "Refresh", exact: true }).click();
    await panel.getByText(/first-change is stale/).waitFor({ state: "hidden" });
    await page.evaluate(() => __remove("first-change"));
    await panel.getByRole("button", { name: "Refresh", exact: true }).click();
    await panel.getByRole("button", { name: "first-change" }).waitFor({ state: "detached" });
    await page.close();
  });
});

test("refresh swaps its icon for an in-button spinner without moving itself or the tally", async () => {
  await withPanel(async (browser, url) => {
    const page = await browser.newPage({ viewport: { width: 320, height: 700 } });
    await page.goto(url);
    const panel = page.frameLocator("iframe");
    const card = panel.locator(".change-card").filter({ hasText: "first-change" });
    await card.waitFor();
    assert.equal(await card.locator(".progress-label").innerText(), "3 of 3 artefacts");
    assert.match(await card.locator(".oc-sdk-progress-label").innerText(), /1 of 2 tasks complete/);
    for (const width of [320, 1076]) {
      await page.setViewportSize({ width, height: 700 });
      const refresh = panel.getByRole("button", { name: "Refresh", exact: true });
      const tally = panel.locator(".board-tally");
      const before = { button: await refresh.boundingBox(), tally: await tally.boundingBox() };
      assert.equal(await refresh.locator("svg:visible").count(), 1);
      await page.evaluate(() => __holdListing());
      await refresh.click();
      await refresh.locator(".oc-sdk-spinner-ring").waitFor();
      assert.equal(await refresh.getAttribute("aria-busy"), "true");
      assert.equal(await refresh.locator("svg:visible").count(), 0);
      assert.equal(await refresh.isDisabled(), true);
      assert.equal(await panel.locator(".refresh-indicator").count(), 0);
      const during = { button: await refresh.boundingBox(), tally: await tally.boundingBox() };
      assert.ok(Math.abs(during.button.width - before.button.width) < 1);
      assert.ok(Math.abs(during.button.x - before.button.x) < 1);
      assert.ok(Math.abs(during.tally.x - before.tally.x) < 1);
      assert.equal(
        await panel.locator("html").evaluate((node) => node.scrollWidth > innerWidth),
        false,
      );
      const requests = await page.evaluate(
        () => __requests.filter((r) => r.path === "/changes").length,
      );
      await refresh.evaluate((button) => button.click());
      assert.equal(
        await page.evaluate(() => __requests.filter((r) => r.path === "/changes").length),
        requests,
      );
      await page.evaluate(() => __releaseListing());
      await refresh.locator(".oc-sdk-spinner-ring").waitFor({ state: "detached" });
      assert.equal(await refresh.locator("svg:visible").count(), 1);
      assert.ok(Math.abs((await refresh.boundingBox()).width - before.button.width) < 1);
    }
    await page.close();
  });
});

test("refresh button reports context loading and returns to idle after failure", async () => {
  await withPanel(async (browser, url) => {
    const page = await browser.newPage();
    await page.goto(url);
    const panel = page.frameLocator("iframe");
    const refresh = panel.getByRole("button", { name: "Refresh", exact: true });
    await panel.getByRole("button", { name: "first-change" }).waitFor();
    await page.evaluate(() => {
      __holdListing();
      __directory("/tmp/other-project");
    });
    await refresh.locator(".oc-sdk-spinner-ring").waitFor();
    await page.evaluate(() => __releaseListing());
    await refresh.locator(".oc-sdk-spinner-ring").waitFor({ state: "detached" });
    await page.evaluate(() => __failNextListing());
    await refresh.click();
    await panel.getByText("Cannot check listing").waitFor();
    assert.equal(await refresh.isEnabled(), true);
    assert.equal(await refresh.locator("svg:visible").count(), 1);
    await page.close();
  });
});

test("a first-load summary failure names the unreadable change and offers retry", async () => {
  await withPanel(async (browser, url) => {
    const page = await browser.newPage();
    await page.goto(url + "?fail-summary");
    const panel = page.frameLocator("iframe");
    await panel.getByText(/first-change could not be read/).waitFor();
    await panel.getByRole("button", { name: "Retry", exact: true }).click();
    await panel.getByRole("button", { name: "first-change" }).waitFor();
    await page.close();
  });
});

test("focused Retry keeps keyboard focus when a held batch retains a per-change failure", async () => {
  await withPanel(async (browser, url) => {
    const page = await browser.newPage();
    await page.goto(url + "?fail-summary");
    const panel = page.frameLocator("iframe");
    const notice = panel.getByText(/first-change could not be read/);
    await notice.waitFor();
    await page.evaluate(() => __holdSummaries());
    await panel.getByRole("button", { name: "Refresh", exact: true }).click();
    await page.waitForFunction(
      () => __requests.filter((item) => item.path === "/summaries").length === 2,
    );
    const retry = panel.locator(".board-notices").getByRole("button", { name: "Retry" });
    await retry.focus();
    await page.evaluate(() => {
      __failSummary();
      __releaseSummaries();
    });
    await page.waitForFunction(
      () => __completed.filter((path) => path === "/summaries").length === 2,
    );
    await retry.evaluate(() => new Promise((resolve) => requestAnimationFrame(resolve)));
    assert.equal(await retry.evaluate((node) => node === document.activeElement), true);
    await page.evaluate(() => __theme("light"));
    await panel.getByLabel("Search changes").fill("second");
    await retry.focus();
    assert.equal(await retry.evaluate((node) => node === document.activeElement), true);
    await retry.press("Enter");
    await page.evaluate(() => __releaseSummaries());
    await retry.waitFor({ state: "detached" });
    await page.close();
  });
});

test("board standalone controls and wrapped retry notice have panel spacing", async () => {
  await withPanel(async (browser, url) => {
    const page = await browser.newPage({ viewport: { width: 320, height: 700 } });
    await page.goto(url + "?fail-summary");
    const panel = page.frameLocator("iframe");
    const notice = panel.locator(".board-notices .notice");
    await notice.waitFor();
    const sizes = await panel
      .locator(".heading-actions button, .board-notices button, .card-actions button")
      .evaluateAll((buttons) =>
        buttons.map((button) => button.getBoundingClientRect().height).filter(Boolean),
      );
    assert.deepEqual(sizes.slice(0, 4), [28, 28, 28, 28]);
    assert.ok(sizes.slice(4).every((height) => height === 28));
    const message = await notice.getByText(/could not be read/).boundingBox();
    const retry = await notice.getByRole("button", { name: "Retry" }).boundingBox();
    if (retry.y >= message.y + message.height) assert.ok(retry.y - message.y - message.height >= 8);
    else assert.ok(retry.x - message.x - message.width >= 8);
    const board = await panel.locator(".board").boundingBox();
    const box = await notice.boundingBox();
    assert.ok(board.y - box.y - box.height >= 12);
    assert.equal(
      await panel.locator("html").evaluate((node) => node.scrollWidth > innerWidth),
      false,
    );
    await page.close();
  });
});

test("confirmed unavailable detail keeps the selection and disables its workflow action", async () => {
  await withPanel(async (browser, url) => {
    const page = await browser.newPage();
    await page.goto(url);
    const panel = page.frameLocator("iframe");
    await panel.getByRole("button", { name: "first-change" }).waitFor();
    await page.evaluate(() => __unavailable());
    await panel.getByRole("button", { name: "first-change" }).click();
    await panel.getByText(/This change is no longer available/).waitFor();
    assert.equal(await panel.locator(".detail-content .document-issue:visible").count(), 0);
    assert.equal(
      await panel
        .locator(".detail-footer button:visible")
        .evaluateAll((buttons) => buttons.every((button) => button.disabled)),
      true,
    );
    assert.equal(
      await panel
        .locator(".detail-toolbar")
        .getByRole("button", { name: "Delete change" })
        .isDisabled(),
      true,
    );
    assert.equal(await panel.locator(".detail h1").innerText(), "first-change");
    await panel.getByRole("button", { name: "Back to changes" }).click();
    assert.equal(
      await panel
        .locator(".change-card")
        .filter({ hasText: "first-change" })
        .getByRole("button", { name: "Apply", exact: true })
        .isDisabled(),
      true,
    );
    assert.equal(
      await panel
        .locator(".change-card")
        .filter({ hasText: "first-change" })
        .getByRole("button", { name: "Explore" })
        .count(),
      0,
    );
    assert.equal(
      await page.evaluate(() => __requests.filter((request) => request.path === "compose").length),
      0,
    );
    await page.close();
  });
});

test("failed document retries locally; a custom task owner remains a document", async () => {
  await withPanel(async (browser, url) => {
    const page = await browser.newPage();
    await page.goto(url);
    const panel = page.frameLocator("iframe");
    await panel.getByRole("button", { name: "first-change" }).waitFor();
    await page.evaluate(() => {
      __custom();
      __failDocument();
    });
    await panel.getByRole("button", { name: "Refresh", exact: true }).click();
    await panel.getByRole("button", { name: "first-change" }).click();
    await panel.getByText("Retry this document").waitFor();
    await panel.getByRole("button", { name: "Retry document" }).click();
    await panel.getByText("First version of proposal").waitFor();
    await panel.getByRole("tab", { name: /checklist · Written/ }).click();
    await panel.getByText("Content of checklist.md").waitFor();
    await panel.getByRole("tab", { name: "Tasks 2", exact: true }).click();
    assert.equal(await panel.locator(".readiness-note:visible").count(), 0);
    await panel.getByText("1.1 CLI description").waitFor();
    assert.equal(
      await page.evaluate(
        () =>
          __requests.filter(
            (item) => item.path === "/document" && item.body.selector === "tasks.md",
          ).length,
      ),
      0,
    );
    await page.close();
  });
});

test("zero-count Tasks tab does not claim implementation completion", async () => {
  await withPanel(async (browser, url) => {
    const page = await browser.newPage();
    await page.goto(url);
    const panel = page.frameLocator("iframe");
    await panel.getByRole("button", { name: "second-change" }).click();
    await panel.getByRole("tab", { name: /Tasks · Written 0/ }).click();
    await panel.getByText("No tasks tracked yet.").waitFor();
    assert.equal(await panel.locator(".stage-label").innerText(), "Ready");
    await page.close();
  });
});

test("long custom tabs scroll within a 320 px panel without hiding fallback Tasks", async () => {
  await withPanel(async (browser, url) => {
    const page = await browser.newPage({ viewport: { width: 320, height: 700 } });
    await page.goto(url);
    const panel = page.frameLocator("iframe");
    await panel.getByRole("button", { name: "first-change" }).waitFor();
    await page.evaluate(() => __longArtifact());
    await panel.getByRole("button", { name: "Refresh", exact: true }).click();
    await panel.getByRole("heading", { name: "Planning 2" }).waitFor();
    const card = panel.locator(".change-card").filter({ hasText: "first-change" });
    assert.deepEqual(await card.locator(".card-actions button:visible").allTextContents(), [
      "Explore",
      "Plan",
      "Workflows",
    ]);
    await panel.getByRole("button", { name: "first-change" }).click();
    const custom = panel.getByRole("tab", {
      name: /long-artifact-name-that-must-wrap-at-sidebar-width/,
    });
    await custom.waitFor();
    assert.equal(await panel.getByRole("tab", { name: "Tasks 2" }).count(), 1);
    assert.equal(
      await panel.locator("html").evaluate((node) => node.scrollWidth > innerWidth),
      false,
    );
    assert.equal(
      await panel.locator(".oc-sdk-tabs").evaluate((node) => node.scrollWidth > node.clientWidth),
      true,
    );
    await custom.focus();
    await custom.press("End");
    assert.equal(
      await panel.getByRole("tab", { name: "Tasks 2" }).getAttribute("aria-selected"),
      "true",
    );
    await page.close();
  });
});

test("custom artefacts with delimiter characters keep their document identities distinct", async () => {
  await withPanel(async (browser, url) => {
    const page = await browser.newPage();
    await page.goto(url);
    const panel = page.frameLocator("iframe");
    await panel.getByRole("button", { name: "first-change" }).waitFor();
    await page.evaluate(() => __collidingLabels());
    await panel.getByRole("button", { name: "Refresh", exact: true }).click();
    await panel.getByRole("button", { name: "first-change" }).click();
    await panel.getByRole("tab", { name: /specs:a · Written/ }).waitFor({ timeout: 5000 });
    await panel.getByRole("tab", { name: /specs:a · Written/ }).click();
    await panel.getByText("Content of b", { exact: true }).waitFor();
    await panel.getByRole("tab", { name: /Specs · Written/ }).click();
    await panel.locator(".detail-content details summary").first().click();
    await panel.getByText("Content of a:b", { exact: true }).waitFor();
    assert.deepEqual(
      await page.evaluate(() =>
        __requests
          .filter((request) => request.path === "/document")
          .map((request) => [request.body.artifactId, request.body.selector]),
      ),
      [
        ["specs", "a:b"],
        ["specs:a", "b"],
      ],
    );
    await page.close();
  });
});

test("a failed Specs file is labelled on its collapsed path and retries without reloading siblings", async () => {
  await withPanel(async (browser, url) => {
    const page = await browser.newPage();
    await page.goto(url);
    const panel = page.frameLocator("iframe");
    await panel.getByRole("button", { name: "first-change" }).waitFor();
    await page.evaluate(() => __failSpec2());
    await panel.getByRole("button", { name: "first-change" }).click();
    await panel.getByRole("tab", { name: /Specs · Written/ }).click();
    const second = panel.locator("details").filter({ hasText: "specs/2.md" });
    await second.getByText("Read failed").waitFor();
    assert.match(await panel.getByRole("tab", { name: /Specs · Written/ }).innerText(), /3/);
    await second.locator("summary").click();
    await second.getByText("Second file unavailable").waitFor();
    await second.getByRole("button", { name: "Retry document" }).click();
    await second.getByText("Content of specs/2.md").waitFor();
    assert.equal(
      await page.evaluate(
        () =>
          __requests.filter(
            (item) => item.path === "/document" && item.body.selector === "specs/1.md",
          ).length,
      ),
      1,
    );
    await page.close();
  });
});

test("collapsed Specs completion never moves an expanded sibling's reading position", async () => {
  await withPanel(async (browser, url) => {
    const page = await browser.newPage({ viewport: { width: 320, height: 500 } });
    await page.goto(url);
    const panel = page.frameLocator("iframe");
    await page.evaluate(() => {
      __longSpec();
      __holdFiles();
    });
    await panel.getByRole("button", { name: "first-change" }).click();
    await panel.getByRole("tab", { name: /Specs/ }).click();
    await page.waitForFunction(
      () =>
        __requests.filter((item) => item.path === "/document" && item.body.artifactId === "specs")
          .length === 3,
    );
    await page.evaluate(() => __releaseFile());
    const first = panel.locator("details").filter({ hasText: "specs/1.md" });
    await first.locator("summary").click();
    await first
      .locator(".document-content")
      .getByText(/Long document line/)
      .first()
      .waitFor();
    const content = panel.locator(".detail-content");
    await content.evaluate((node) => (node.scrollTop = 200));
    const before = await content.evaluate((node) => node.scrollTop);
    assert.ok(before >= 190);
    await page.evaluate(() => __releaseFile());
    await panel
      .locator("details")
      .filter({ hasText: "specs/2.md" })
      .getByText("Content of specs/2.md")
      .waitFor({ state: "attached" });
    assert.equal(await content.evaluate((node) => node.scrollTop), before);
    assert.equal(await first.getAttribute("open"), "");
    await page.close();
  });
});

test("long goals remain fully scrollable with reachable detail controls", async () => {
  await withPanel(async (browser, url) => {
    for (const [width, mode] of [
      [320, "dark"],
      [320, "light"],
      [1076, "dark"],
      [1076, "light"],
    ]) {
      const page = await browser.newPage({ viewport: { width, height: 400 } });
      await page.goto(url);
      const panel = page.frameLocator("iframe");
      const goal = `A multi-line goal.\n${"one two three ".repeat(120)}\n${"Z".repeat(600)}`;
      await page.evaluate((value) => __goal("first-change", value), goal);
      await panel.getByRole("button", { name: "Refresh", exact: true }).click();
      await panel.getByRole("button", { name: "first-change" }).click();
      if (mode === "light") await page.evaluate(() => __theme("light"));
      const region = panel.getByRole("region", { name: "Recorded objective" });
      assert.equal(await region.textContent(), goal);
      const geometry = await region.evaluate((node) => ({
        height: node.clientHeight,
        scrollHeight: node.scrollHeight,
        scrollWidth: node.scrollWidth,
        clientWidth: node.clientWidth,
        overflow: getComputedStyle(node).overflowY,
      }));
      assert.ok(geometry.height <= 80);
      assert.ok(geometry.scrollHeight > geometry.height);
      assert.ok(geometry.scrollWidth <= geometry.clientWidth + 1);
      assert.equal(geometry.overflow, "auto");
      await region.focus();
      await region.press("End");
      await page.waitForFunction(() =>
        [...document.querySelectorAll("iframe")].some(
          (frame) => frame.contentDocument?.querySelector(".detail-header > .goal")?.scrollTop > 0,
        ),
      );
      assert.ok(
        await panel
          .locator(".detail-footer")
          .evaluate((node) => node.getBoundingClientRect().bottom <= innerHeight),
      );
      assert.ok(await panel.locator(".detail-content").evaluate((node) => node.clientHeight > 0));
      assert.equal(
        await panel.locator("html").evaluate((node) => node.scrollWidth > innerWidth),
        false,
      );
      await page.evaluate(() => __goal("first-change", "Short goal"));
      await panel.getByRole("button", { name: "Back to changes" }).click();
      await panel.getByRole("button", { name: "Refresh", exact: true }).click();
      await panel.getByRole("button", { name: "first-change" }).click();
      await region.getByText("Short goal").waitFor();
      assert.ok(await region.evaluate((node) => node.scrollHeight <= node.clientHeight));
      await page.close();
    }
  });
});

test("Planning detail explores the same goal with secondary action before Plan", async () => {
  await withPanel(async (browser, url) => {
    const page = await browser.newPage({ viewport: { width: 320, height: 700 } });
    await page.goto(url);
    const panel = page.frameLocator("iframe");
    await page.evaluate(() => __readiness("pending"));
    await panel.getByRole("button", { name: "Refresh", exact: true }).click();
    await panel.getByRole("heading", { name: "Planning 2" }).waitFor();
    await panel.getByRole("button", { name: "first-change" }).click();
    const footer = panel.locator(".detail-footer");
    assert.deepEqual(await footer.locator("button:visible").allTextContents(), [
      "Explore",
      "Plan",
      "Workflows",
    ]);
    await footer.getByRole("button", { name: "Explore" }).click();
    await page.waitForFunction(() => __draft().includes("openspec-explore"));
    assert.match(await page.evaluate(() => __draft()), /Read the proposal/);
    assert.equal(
      await page.evaluate(() => __requests.filter((r) => r.path === "compose").length),
      1,
    );
    await page.close();
  });
});

test("detail refresh keeps its selection and replaces content without leaving the reader", async () => {
  await withPanel(async (browser, url) => {
    const page = await browser.newPage({ viewport: { width: 1076, height: 700 } });
    await page.goto(url);
    const panel = page.frameLocator("iframe");
    await panel.getByRole("searchbox", { name: "Search changes" }).fill("first");
    await panel.getByRole("button", { name: "first-change" }).click();
    await panel.getByText("First version of proposal").waitFor();
    await page.evaluate(() => {
      __edit("Edited after detail refresh");
      __holdListing();
    });
    const refresh = panel.locator(".detail").getByRole("button", { name: "Refresh", exact: true });
    const before = await refresh.boundingBox();
    await refresh.click();
    await refresh.locator(".oc-sdk-spinner-ring").waitFor();
    assert.ok(Math.abs((await refresh.boundingBox()).width - before.width) < 1);
    assert.equal(await refresh.isDisabled(), true);
    await page.evaluate(() => __releaseListing());
    await panel.getByText("Edited after detail refresh").waitFor();
    assert.equal(
      await panel.getByRole("tab", { name: /Proposal/ }).getAttribute("aria-selected"),
      "true",
    );
    await panel.getByRole("button", { name: "Back to changes" }).click();
    assert.equal(
      await panel.getByRole("searchbox", { name: "Search changes" }).inputValue(),
      "first",
    );
    await page.close();
  });
});

test("detail refresh reports listing failures and retries in place", async () => {
  await withPanel(async (browser, url) => {
    const page = await browser.newPage();
    await page.goto(url);
    const panel = page.frameLocator("iframe");
    await panel.getByRole("button", { name: "first-change" }).click();
    await page.evaluate(() => __failNextListing());
    await panel.locator(".detail").getByRole("button", { name: "Refresh", exact: true }).click();
    await panel.locator(".detail").getByText("Cannot check listing").waitFor();
    await panel.locator(".detail").getByRole("button", { name: "Retry" }).click();
    await panel.locator(".detail").getByText("Cannot check listing").waitFor({ state: "hidden" });
    await panel.getByRole("heading", { name: "first-change" }).waitFor();
    await page.close();
  });
});

test("detail refresh recovers a selected summary failure and a removed tab", async () => {
  await withPanel(async (browser, url) => {
    const page = await browser.newPage();
    await page.goto(url);
    const panel = page.frameLocator("iframe");
    await panel.getByRole("button", { name: "first-change" }).click();
    await panel.getByRole("tab", { name: /Specs/ }).click();
    await page.evaluate(() => __failSummary());
    const detail = panel.locator(".detail");
    await detail.getByRole("button", { name: "Refresh", exact: true }).click();
    await detail.getByText("Read failed").waitFor();
    await page.evaluate(() => __custom());
    await detail.getByRole("button", { name: "Retry" }).click();
    await detail.getByRole("tab", { name: /checklist/ }).waitFor();
    assert.equal(
      await detail.getByRole("tab", { name: /Proposal/ }).getAttribute("aria-selected"),
      "true",
    );
    assert.equal(await detail.getByRole("tab", { name: /Specs/ }).count(), 0);
    await page.close();
  });
});

test("detail refresh marks a removed change unavailable and ignores old context completions", async () => {
  await withPanel(async (browser, url) => {
    const page = await browser.newPage();
    await page.goto(url);
    const panel = page.frameLocator("iframe");
    await panel.getByRole("button", { name: "first-change" }).click();
    await page.evaluate(() => __remove("first-change"));
    await panel.locator(".detail").getByRole("button", { name: "Refresh", exact: true }).click();
    await panel
      .locator(".detail")
      .getByText("This change is no longer available", { exact: false })
      .waitFor();
    assert.equal(await panel.locator(".detail-footer button:enabled").count(), 0);
    assert.equal(await panel.getByRole("button", { name: "Delete change" }).isDisabled(), true);
    assert.equal(
      await panel
        .locator(".detail")
        .getByRole("button", { name: "Refresh", exact: true })
        .isEnabled(),
      true,
    );
    await page.evaluate(() => {
      __holdListing();
      __directory("/tmp/other-project");
    });
    await panel.getByRole("button", { name: "Back to changes" }).waitFor({ state: "hidden" });
    await page.evaluate(() => __releaseListing());
    assert.equal(await panel.locator(".detail").isVisible(), false);
    assert.equal(await panel.locator(".board-shell").getByText("first-change").count(), 0);
    await page.close();
  });
});

test("theme precedes first paint and detail fills narrow and expanded widths", async () => {
  await withPanel(async (browser, url) => {
    const page = await browser.newPage({ viewport: { width: 320, height: 700 } });
    await page.goto(url + "?hold-ready");
    await page.waitForFunction(() => !!window.__releaseReady);
    const frame = page.frameLocator("iframe");
    assert.equal(
      await frame.locator("#root").evaluate((node) => getComputedStyle(node).visibility),
      "hidden",
    );
    assert.equal(
      await frame.locator("html").evaluate((node) => getComputedStyle(node).backgroundColor),
      "rgba(0, 0, 0, 0)",
    );
    await page.evaluate(() => __releaseReady());
    await frame.getByRole("button", { name: "first-change" }).click();
    const narrow = await frame.locator(".detail").evaluate((node) => ({
      width: node.getBoundingClientRect().width,
      available: document.querySelector("#root").getBoundingClientRect().width,
      border: getComputedStyle(node).borderLeftWidth,
      overflow: document.documentElement.scrollWidth > innerWidth,
    }));
    assert.equal(narrow.width, narrow.available);
    assert.equal(narrow.border, "0px");
    assert.equal(narrow.overflow, false);
    assert.ok(
      await frame
        .locator(".artifact-tabs button")
        .first()
        .evaluate((node) => parseFloat(getComputedStyle(node).fontSize) >= 12),
    );
    assert.equal(
      await frame
        .locator(".change-card")
        .first()
        .evaluate((node) => getComputedStyle(node).backgroundColor),
      "rgb(29, 34, 38)",
    );
    await page.evaluate(() => __theme("light"));
    await frame.getByRole("button", { name: "Back to changes" }).click();
    assert.equal(
      await frame.locator("html").evaluate((node) => getComputedStyle(node).backgroundColor),
      "rgb(255, 255, 255)",
    );
    assert.equal(
      await frame
        .locator(".change-card")
        .first()
        .evaluate((node) => getComputedStyle(node).backgroundColor),
      "rgb(245, 247, 248)",
    );
    await frame.getByRole("button", { name: "first-change", exact: true }).click();
    await page.setViewportSize({ width: 1076, height: 720 });
    assert.equal(
      await frame.locator(".detail").evaluate((node) => node.getBoundingClientRect().width),
      await frame.locator("#root").evaluate((node) => node.getBoundingClientRect().width),
    );
    await page.close();
  });
});

test("uncertain creation reconciles in the original context and opens the observed change", async () => {
  await withPanel(async (browser, url) => {
    const page = await browser.newPage();
    await page.goto(url);
    const panel = page.frameLocator("iframe");
    await panel.getByRole("button", { name: "Create scaffold…" }).waitFor();
    await page.evaluate(() => __unknownCreate());
    await panel.getByRole("button", { name: "Create scaffold…" }).click();
    await panel.getByLabel("Change name", { exact: true }).fill("observed-change");
    await panel.getByLabel("Goal").fill("Observe before retry");
    await panel.getByRole("button", { name: "Create", exact: true }).click();
    await panel.getByRole("button", { name: "Inspect change" }).click();
    await panel.locator(".detail").getByRole("heading", { name: "observed-change" }).waitFor();
    assert.equal(
      await page.evaluate(() => __requests.filter((item) => item.path === "/create").length),
      1,
    );
    assert.equal(
      await page.evaluate(() => __requests.filter((item) => item.path === "/changes").length),
      3,
    );
    assert.deepEqual(
      await page.evaluate(
        () => __requests.find((item) => item.path === "/changes" && item.body.expectedRoot).body,
      ),
      { directory, expectedRoot: root, expectedPlanning: "fixture-planning" },
    );
    await page.close();
  });
});

test("malformed creation replies reconcile instead of permitting another write", async () => {
  await withPanel(async (browser, url) => {
    for (const reply of ["invalid-json", "null", "bad-success", "bad-error"]) {
      const page = await browser.newPage();
      await page.goto(url);
      const panel = page.frameLocator("iframe");
      await page.evaluate((value) => __createReply(value), reply);
      await panel.getByRole("button", { name: "Create scaffold…" }).click();
      await panel.getByLabel("Change name", { exact: true }).fill(`created-${reply}`);
      await panel.getByLabel("Goal").fill("Retain uncertain write");
      await panel.getByRole("button", { name: "Create", exact: true }).click();
      await panel.getByRole("button", { name: "Inspect change" }).waitFor({ timeout: 5000 });
      assert.equal(
        await panel.getByRole("button", { name: "Create", exact: true }).isDisabled(),
        true,
      );
      assert.equal(
        await page.evaluate(
          () => __requests.filter((request) => request.path === "/create").length,
        ),
        1,
      );
      assert.equal(
        await page.evaluate(
          () =>
            __requests.filter((request) => request.path === "/changes" && request.body.expectedRoot)
              .length,
        ),
        1,
      );
      await page.close();
    }
  });
});

test("failed creation reconciliation survives dismissal and closes safely across contexts", async () => {
  await withPanel(async (browser, url) => {
    const page = await browser.newPage();
    await page.goto(url);
    const panel = page.frameLocator("iframe");
    await panel.getByRole("button", { name: "Create scaffold…" }).click();
    await panel.getByLabel("Change name", { exact: true }).fill("uncertain-change");
    await panel.getByLabel("Goal").fill("Retain the draft");
    await page.evaluate(() => {
      __createReply("null");
      __failNextListing();
    });
    await panel.getByRole("button", { name: "Create", exact: true }).click();
    await panel.getByText(/Retry the read before creating again/).waitFor();
    assert.equal(await panel.getByRole("button", { name: "Dismiss attempt" }).isVisible(), false);
    await panel.getByRole("button", { name: "Cancel", exact: true }).click();
    await panel.getByRole("button", { name: "Create scaffold…" }).click();
    assert.equal(
      await panel.getByLabel("Change name", { exact: true }).inputValue(),
      "uncertain-change",
    );
    assert.equal(
      await panel.getByRole("button", { name: "Create", exact: true }).isDisabled(),
      true,
    );
    await page.evaluate(() => __failNextListing());
    await panel.getByRole("button", { name: "Retry read" }).click();
    await panel.getByText(/Retry the read before creating again/).waitFor();
    assert.equal(
      await page.evaluate(() => __requests.filter((request) => request.path === "/create").length),
      1,
    );
    await page.evaluate(() => __directory("/tmp/other-project"));
    await panel.getByText(/Return to \/tmp\/fixture-project/).waitFor();
    await panel.getByRole("button", { name: "Dismiss attempt" }).click();
    await page.evaluate(() => __directory(directory));
    await panel.getByRole("button", { name: "Create scaffold…" }).click();
    assert.equal(
      await panel.getByRole("button", { name: "Create", exact: true }).isDisabled(),
      true,
    );
    await panel.getByRole("button", { name: "Retry read" }).click();
    await panel.getByRole("button", { name: "Inspect change" }).waitFor();
    await page.close();
  });
});

test("creation no-match reconciliation permits only explicit resubmission and known rejection stays editable", async () => {
  await withPanel(async (browser, url) => {
    const page = await browser.newPage();
    await page.goto(url);
    const panel = page.frameLocator("iframe");
    await panel.getByRole("button", { name: "Create scaffold…" }).click();
    await panel.getByLabel("Change name", { exact: true }).fill("not-created");
    await panel.getByLabel("Goal").fill("A retained draft");
    await page.evaluate(() => __createReply("invalid-json", false));
    await panel.getByRole("button", { name: "Create", exact: true }).click();
    await panel.getByText(/no matching change was found/).waitFor();
    assert.equal(await panel.getByLabel("Goal").inputValue(), "A retained draft");
    assert.equal(
      await page.evaluate(() => __requests.filter((request) => request.path === "/create").length),
      1,
    );
    await page.evaluate(() => __createReply("success"));
    await panel.getByRole("button", { name: "Create", exact: true }).click();
    await panel.getByRole("button", { name: "not-created" }).waitFor();
    assert.equal(
      await page.evaluate(() => __requests.filter((request) => request.path === "/create").length),
      2,
    );
    await panel.getByRole("button", { name: "Create scaffold…" }).click();
    await panel.getByLabel("Change name", { exact: true }).fill("known-rejected");
    await panel.getByLabel("Goal").fill("Retain on rejection");
    await page.evaluate(() => __createReply("known-error", false));
    await panel.getByRole("button", { name: "Create", exact: true }).click();
    await panel.getByText("Known rejection").waitFor();
    assert.equal(await panel.getByLabel("Goal").inputValue(), "Retain on rejection");
    assert.equal(
      await panel.getByRole("button", { name: "Create", exact: true }).isEnabled(),
      true,
    );
    await page.close();
  });
});

test("uncertain creation still inspects while board summaries are pending", async () => {
  await withPanel(async (browser, url) => {
    const page = await browser.newPage();
    await page.goto(url + "?hold-summary");
    const panel = page.frameLocator("iframe");
    const create = panel.getByRole("button", { name: "Create scaffold…" });
    await create.waitFor();
    await create.click();
    await panel.getByLabel("Change name", { exact: true }).fill("observed-while-loading");
    await panel.getByLabel("Goal").fill("Confirm a pending write");
    await page.evaluate(() => __unknownCreate());
    await panel.getByRole("button", { name: "Create", exact: true }).click();
    await panel.getByRole("button", { name: "Inspect change" }).click();
    await page.evaluate(() => __releaseSummaries());
    await panel
      .locator(".detail h1")
      .getByText("observed-while-loading")
      .waitFor({ timeout: 5000 });
    assert.equal(
      await page.evaluate(() => __requests.filter((item) => item.path === "/create").length),
      1,
    );
    await page.close();
  });
});

test("uncertain creation checks its original project after the selected project changes", async () => {
  await withPanel(async (browser, url) => {
    const page = await browser.newPage();
    await page.goto(url);
    const panel = page.frameLocator("iframe");
    await panel.getByRole("button", { name: "Create scaffold…" }).click();
    await panel.getByLabel("Change name", { exact: true }).fill("observed-after-switch");
    await panel.getByLabel("Goal").fill("Keep the original scope");
    await page.evaluate(() => {
      __unknownCreate();
      __holdCreate();
    });
    await panel.getByRole("button", { name: "Create", exact: true }).click();
    await page.waitForFunction(() => __requests.some((item) => item.path === "/create"));
    await page.evaluate(() => __directory("/tmp/other-project"));
    await panel.getByRole("heading", { name: "other-project" }).waitFor();
    await page.evaluate(() => __releaseCreate());
    await panel.getByText(/Return to \/tmp\/fixture-project/).waitFor();
    assert.deepEqual(
      await page.evaluate(() =>
        __requests.filter((item) => item.path === "/changes" && item.body.expectedRoot),
      ),
      [
        {
          path: "/changes",
          body: { directory, expectedRoot: root, expectedPlanning: "fixture-planning" },
        },
      ],
    );
    assert.equal(await panel.getByRole("button", { name: "Inspect change" }).isDisabled(), true);
    assert.equal(
      await page.evaluate(() => __requests.filter((item) => item.path === "/create").length),
      1,
    );
    await page.close();
  });
});

test("old reads cannot reopen detail after Back or project replacement", async () => {
  await withPanel(async (browser, url) => {
    const page = await browser.newPage();
    await page.goto(url);
    const panel = page.frameLocator("iframe");
    await panel.getByRole("button", { name: "first-change" }).waitFor();
    await page.evaluate(() => __holdProposal());
    await panel.getByRole("button", { name: "first-change" }).click();
    await panel.getByRole("button", { name: "Back to changes" }).click();
    await page.evaluate(() => __directory("/tmp/other-project"));
    await panel.getByRole("heading", { name: "other-project" }).waitFor();
    await page.evaluate(() => __releaseFile());
    assert.equal(await panel.locator(".detail:visible").count(), 0);
    assert.equal(await panel.getByRole("button", { name: "first-change" }).count(), 0);
    await page.close();
  });
});

test("Tasks and documents independently invalidate a replaced root before later reads", async () => {
  await withPanel(async (browser, url) => {
    for (const route of ["/tasks", "/document"]) {
      const page = await browser.newPage();
      await page.goto(url);
      const panel = page.frameLocator("iframe");
      await panel.getByRole("button", { name: "first-change" }).waitFor();
      await page.evaluate((path) => {
        __holdListing();
        __root("/tmp/new-canonical-root");
        __rootErrorOn(path);
      }, route);
      await panel.getByRole("button", { name: "first-change" }).click();
      await page.waitForFunction((path) => __completed.includes(path), route);
      assert.equal(
        await page.evaluate(() => __requests.filter((item) => item.path === "/changes").length),
        2,
      );
      assert.equal(await panel.locator(".detail:visible").count(), 0);
      await page.evaluate(() => __releaseListing());
      await panel.getByRole("button", { name: "first-change" }).waitFor();
      await page.close();
    }
  });
});

test("reopening a cached unavailable Tasks read disables an empty scaffold", async () => {
  await withPanel(async (browser, url) => {
    const page = await browser.newPage();
    await page.goto(url);
    const panel = page.frameLocator("iframe");
    await page.evaluate(() => {
      __clearTasks();
      __holdTasks();
    });
    await panel.getByRole("button", { name: "Refresh", exact: true }).click();
    await panel.getByRole("button", { name: "first-change" }).click();
    await page.waitForFunction(() => __requests.some((item) => item.path === "/tasks"));
    await panel.getByRole("button", { name: "Back to changes" }).click();
    await page.evaluate(() => {
      __unavailableOnRelease();
      __releaseFile();
    });
    await page.waitForFunction(() => __completed.includes("/tasks"));
    await panel.getByRole("button", { name: "first-change" }).click();
    await panel
      .locator(".detail")
      .getByText(/no longer available/)
      .waitFor({ timeout: 5000 });
    assert.equal(
      await panel
        .locator(".detail-toolbar")
        .getByRole("button", { name: "Delete change" })
        .isDisabled(),
      true,
    );
    assert.equal(await panel.locator(".detail-footer button:visible").first().isDisabled(), true);
    assert.equal(
      await page.evaluate(() => __requests.filter((item) => item.path === "/tasks").length),
      1,
    );
    await page.close();
  });
});

test("cached unavailable Proposal stops later document groups on reopening", async () => {
  await withPanel(async (browser, url) => {
    const page = await browser.newPage();
    await page.goto(url);
    const panel = page.frameLocator("iframe");
    await page.evaluate(() => {
      __design();
      __holdProposal();
    });
    await panel.getByRole("button", { name: "Refresh", exact: true }).click();
    await panel.getByRole("button", { name: "first-change" }).click();
    await page.waitForFunction(() =>
      __requests.some((item) => item.path === "/document" && item.body.artifactId === "proposal"),
    );
    await panel.getByRole("button", { name: "Back to changes" }).click();
    await page.evaluate(() => {
      __unavailableOnRelease();
      __releaseFile();
    });
    await page.waitForFunction(() => __completed.includes("/document"));
    await panel.getByRole("button", { name: "first-change" }).click();
    await panel
      .locator(".detail")
      .getByText(/no longer available/)
      .waitFor({ timeout: 5000 });
    assert.equal(
      await page.evaluate(
        () =>
          __requests.filter((item) => item.path === "/document" && item.body.artifactId === "specs")
            .length,
      ),
      0,
    );
    await page.close();
  });
});

test("search keeps its caret across refresh and same-stage cards stay ordered", async () => {
  await withPanel(async (browser, url) => {
    const page = await browser.newPage();
    await page.goto(url);
    const panel = page.frameLocator("iframe");
    const search = panel.getByLabel("Search changes");
    await search.fill("change");
    await search.evaluate((input) => input.setSelectionRange(2, 2));
    await page.evaluate(() => __addSameStage());
    await panel
      .getByRole("button", { name: "Refresh", exact: true })
      .evaluate((button) => button.click());
    await panel.getByRole("button", { name: "alpha-change" }).waitFor();
    assert.equal(await search.inputValue(), "change");
    assert.equal(await search.evaluate((input) => input.selectionStart), 2);
    assert.equal(await search.evaluate((input) => document.activeElement === input), true);
    assert.deepEqual(
      await panel
        .locator(".stage")
        .filter({ hasText: "In Progress" })
        .locator(".card-main")
        .allTextContents(),
      ["alpha-change", "first-change"],
    );
    await page.close();
  });
});

test("Back restores the board scroll and theme updates preserve detail navigation focus", async () => {
  await withPanel(async (browser, url) => {
    const page = await browser.newPage({ viewport: { width: 320, height: 300 } });
    await page.goto(url);
    const panel = page.frameLocator("iframe");
    await panel.getByRole("button", { name: "first-change" }).waitFor();
    await panel.getByRole("button", { name: "first-change" }).scrollIntoViewIfNeeded();
    const scroll = await panel.locator("html").evaluate(() => scrollY);
    assert.ok(scroll > 0);
    await panel.getByRole("button", { name: "first-change" }).click();
    const tasks = panel.getByRole("tab", { name: /Tasks · Written/ });
    await tasks.focus();
    await page.evaluate(() => __theme("light"));
    assert.equal(await tasks.evaluate((button) => document.activeElement === button), true);
    await panel.getByRole("button", { name: "Back to changes" }).click();
    await panel.getByRole("button", { name: "first-change" }).waitFor();
    await panel
      .locator("html")
      .evaluate(() => new Promise((resolve) => requestAnimationFrame(() => resolve())));
    assert.equal(await panel.locator("html").evaluate(() => scrollY), scroll);
    await page.close();
  });
});
