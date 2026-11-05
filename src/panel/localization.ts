import type { Stage } from "../model.js";
import { archiveAllPrompts } from "./archive-prompt.js";
import {
  globalWorkflows,
  changeWorkflows,
  type GlobalWorkflow,
  type ChangeWorkflow,
} from "./workflow.js";

type WorkflowText = { label: string; description: string };

export type Language = "en" | "ru";
export type LanguagePreference = "auto" | Language;
export const isLanguagePreference = (value: unknown): value is LanguagePreference =>
  value === "auto" || value === "en" || value === "ru";

export function resolveLanguage(preference: LanguagePreference, locale: string): Language {
  if (preference !== "auto") return preference;
  try {
    return new Intl.Locale(locale).language.toLowerCase() === "ru" ? "ru" : "en";
  } catch {
    return "en";
  }
}

const russianPlural = new Intl.PluralRules("ru");
function plural(count: number, one: string, few: string, many: string) {
  const form = russianPlural.select(count);
  return form === "one" ? one : form === "few" ? few : many;
}

export const english = {
  prompts: {
    archiveAll: archiveAllPrompts.en,
    globalIntroduction: (skill: string) =>
      `Use your skill tool to load and invoke the ${skill} skill.`,
    changeIntroduction: (skill: string, target: string) =>
      `Use your skill tool to load and invoke the ${skill} skill for ${target}.`,
    target: (id: string) => `OpenSpec change "${id}"`,
    goal: (goal: string) => `\nGoal: ${goal}`,
    progress: (done: number, total: number) =>
      `\n${done} of ${total} tasks complete. Pick up where implementation left off and complete the remaining tasks.`,
    globalGuidance: {
      "bulk-archive":
        "Leave candidate selection, conflict assessment and batch confirmation to the workflow; do not preselect visible or completed changes.",
      onboard:
        "Leave setup permission and onboarding task selection to the workflow and its user questions.",
      explore:
        "Ask the user what ideas to explore. Investigate relevant context, options and trade-offs without file changes or implementation.",
      creation:
        "Ask the user to establish their intended change; do not target or finish an existing change's scaffold.",
    },
    globalSafety:
      "Preserve the workflow's setup checks and required user questions. If the skill is unavailable, report that limitation rather than substituting another workflow.",
    changeGuidance: {
      continue: () =>
        "Inspect this existing change's status and follow the workflow's artefact instructions to create at most one next planning artefact. Preserve existing decisions and any recorded goal. If no goal is recorded, inspect existing context and ask the user to clarify it if necessary; do not invent a goal or write goal metadata automatically. Do not create another change or implement code. Leave complete planning and partially populated artefacts to the workflow; do not automatically Apply.",
      explore: (target: string) =>
        `Investigate the goal, relevant code, options and trade-offs for ${target}. Discuss findings without file changes or implementation. If no goal is recorded, inspect existing context and ask the user to clarify it if necessary; do not invent a goal.`,
      apply: (target: string) =>
        `Complete all remaining tasks in ${target}, then verify the implementation against its change artefacts. Resolve any issues found and verify again until all tasks are complete and verification passes. If blocked, report the blocker rather than marking unfinished work complete.`,
      update: () =>
        "Review and revise this change's planning artefacts, preserving existing decisions and the recorded goal. Retain the workflow's required user confirmations. Do not implement tasks or archive the change.",
      sync: () =>
        "Synchronize this change's delta specs with the main specs using the workflow's prerequisite checks and required user questions. Do not implement tasks or archive the change afterward.",
      verify: () =>
        "Compare the implementation with this change's planning artefacts and report gaps and inconsistencies diagnostically, without implementation or archiving.",
      archive: () =>
        "Check the workflow's archival prerequisites and retain required user confirmations; do not assume prior verification or permission to archive.",
    } satisfies Record<ChangeWorkflow, (target: string) => string>,
  },
  newChange: "New change",
  changeName: "Change name",
  namePlaceholder: "add-change-board",
  goal: "Goal",
  goalPlaceholder: "What should this change make possible?",
  cancel: "Cancel",
  close: "Close",
  createSubmit: "Create",
  retryRead: "Retry read",
  inspectChange: "Inspect change",
  dismissAttempt: "Dismiss attempt",
  invalidName: "Use lowercase letters or digits separated by single hyphens.",
  requiredGoal: "Goal is required.",
  createCloseDescription: "Close this form without creating another scaffold.",
  createSubmitDescription:
    "Directly create the named scaffold and recorded goal in the original project; no agent is launched.",
  createRetryDescription:
    "Read the original project to check the uncertain creation outcome; do not retry creation.",
  inspectDescription:
    "Open the observed change for inspection; this does not confirm that creation succeeded.",
  dismissDescription:
    "Dismiss this attempt without retrying creation or removing any existing change.",
  createReadRequired: "Creation outcome is unknown. Retry the read before creating again.",
  createChecking: "Checking the original project for a matching change…",
  createObserved:
    "Creation outcome is unknown. An existing change with this name was found for inspection.",
  createAbsent:
    "Creation outcome is unknown. The original project was refreshed; no matching change was found.",
  originalReadFailed: "The original project could not be read.",
  createReadFailed: (diagnostic: string) =>
    `Creation outcome is unknown. ${diagnostic} Retry the read before creating again.`,
  originalContext: (directory: string, root: string) =>
    ` Return to ${directory} (OpenSpec root ${root}) to inspect or submit in the original project.`,
  changeCreated: "Change created.",
  deleteHeading: (name: string) => `Delete ${name}?`,
  deleteWarning: (name: string) =>
    `Permanently remove the planning folder for ${name}? This does not undo implementation or delete main specifications.`,
  deleteCloseDescription: "Close this confirmation without removing the change.",
  deleteRetryDescription:
    "Read the original project to resolve the deletion outcome; do not retry deletion.",
  deleteSubmitDescription:
    "Permanently remove this change's planning folder; implementation and main specifications remain.",
  deleteChecking: "Checking the original project for this change…",
  deletePresent:
    "Removal was not confirmed. The change is still listed. Close and confirm again before another attempt.",
  deleteUnresolved:
    "Deletion outcome is unresolved. Retry the read of the original project before another attempt.",
  archiveHeading: "Archive all completed changes?",
  archiveWarning:
    "This creates a new session and sends a prompt to archive completed changes in this project. Unfinished changes will be skipped. The board stays open; use refresh to see updates.",
  startArchiving: "Start archiving",
  archiveCancelDescription:
    "Close this confirmation without creating a session or sending a prompt.",
  archiveStartDescription:
    "Create a new session and submit the completed-only archive prompt; skip unfinished changes.",
  promptPrepared: "Workflow prompt prepared in the open composer.",
  promptFailed: "The workflow prompt could not be prepared.",
  quickstartFailed: "Cannot open quickstart",
  copyFailed: "Could not copy change name",
  nameCopied: "Change name copied",
  linkFailed: "Cannot open document link",
  workspaceInspectionFailed:
    "Host workspace inspection failed. Inspect worktrees and sessions before trying again.",
  workspaceInspectionTimeout: "Host workspace inspection timed out. No creation was requested.",
  workspaceInspectionError: "Host workspace inspection failed.",
  projectUnidentified:
    "Cannot identify the originating registered project. No worktree was requested.",
  sessionsIncomplete: "Session inspection is incomplete. Inspect the project before trying again.",
  worktreeCollision: (name: string, directory: string | null, session: string | null) =>
    `Worktree or session for ${name} already exists${directory !== null ? ` at ${directory}` : ` (session ${session})`}. Inspect it instead of creating another worktree.`,
  applyUnavailable: "This change is no longer applicable. Refresh before starting Apply.",
  applyTitle: (name: string) => `Apply ${name}`,
  retainedWorktree: (name: string, directory: string) =>
    ` Worktree ${name} at ${directory} is retained.`,
  applyNotSent: (id: string, sent: string, resource: string) =>
    `Session ${id} exists, but Apply submission was not confirmed (${sent}).${resource} Inspect it before another attempt.`,
  applyCreationFailed: (failure: string, resource: string) =>
    `Apply creation failed (${failure}).${resource} Inspect worktrees and sessions before another attempt.`,
  applyUnexpected: (id: string, resource: string) =>
    `Session ${id} was returned with an unexpected worktree result.${resource} Inspect it before another attempt.`,
  applySubmitted: (id: string, linked: boolean) =>
    `Apply submitted in session ${id}.${linked ? "" : " Its workflow reference could not be saved."}`,
  applyOpenFailed: (id: string) =>
    `Apply session ${id} exists, but it could not be opened. Inspect that session; submission will not be repeated.`,
  applyUncertain: (diagnostic: string) =>
    `Apply launch outcome is uncertain. A worktree, session or sent prompt may already exist. Inspect worktrees and sessions before another attempt; this launch will not be retried automatically. ${diagnostic}`,
  worktreeInspectionFailed: "Worktree inspection failed. No creation was requested.",
  archiveTitle: "Archive completed OpenSpec changes",
  archiveSubmitted: (id: string, linked: boolean) =>
    linked
      ? `Archive prompt submitted in session ${id}. Use refresh to see updates.`
      : `Archive prompt submitted in session ${id}, but its workflow reference could not be saved.`,
  noModel: "No model was available.",
  submissionReason: (sent: string) => `Submission ${sent}.`,
  archiveNotSent: (id: string, reason: string, linked: boolean) =>
    `Session ${id} exists, but the archive prompt was not submitted successfully. ${reason} Inspect this session before starting again.${linked ? "" : " Its workflow reference was not saved."}`,
  archiveCreationFailed:
    "The archive session could not be created. Inspect sessions before starting again.",
  archiveRefused: (diagnostic: string) => `Archive launch failed: ${diagnostic}`,
  archiveUncertain:
    "Archive launch outcome is uncertain. A session or submitted prompt may already exist. Inspect sessions before starting again; this launch will not be retried automatically.",
  sentReasons: {
    sent: "sent",
    "no-model": "no-model",
    skipped: "skipped",
    failed: "failed",
    unknown: "unknown",
    "bootstrap-failed": "bootstrap-failed",
    "session-create-failed": "session-create-failed",
  } as Record<string, string>,
  back: "Back to changes",
  backDescription: "Return to the changes board.",
  copyName: "Copy change name",
  copyDescription: "Copy this change's name to the clipboard.",
  delete: "Delete",
  deleteChange: "Delete change",
  deleteDescription: "Open confirmation before permanently removing this change's planning folder.",
  recordedObjective: "Recorded objective",
  planningArtifacts: "Planning artefacts",
  goalUnavailable: "Goal unavailable",
  detailUnavailable: "This change is no longer available. Refresh or return to the board.",
  detailRefreshDescription:
    "Read the latest change, document and task state without changing files.",
  detailRetryDescription: "Retry reading this change; do not repeat any write.",
  artifactLabels: {
    proposal: "Proposal",
    specs: "Specs",
    design: "Design",
    tasks: "Tasks",
  } as Record<string, string>,
  readiness: { done: "Written", ready: "Ready to write", blocked: "Blocked", skipped: "Skipped" },
  readyToWrite: "Ready to write this artefact. Continue planning in chat.",
  blockedUntil: (ids: string[]) => `Blocked until ${ids.join(", ")} is written or skipped.`,
  blockedUnknown: "Blocked by planning prerequisites; their details are not available.",
  skippedArtifact: "This artefact was skipped.",
  noArtifactDocuments: "This artefact has no available documents yet.",
  noPlanningDocuments: "This change has no available planning documents.",
  readFailed: " · Read failed",
  loadingDocument: "Loading document…",
  retryDocument: "Retry document",
  retryDocumentDescription: "Retry reading this document; do not repeat any write.",
  renderingFailed: "Document rendering failed. Original source is shown.",
  documentTask: "Document task",
  documentImage: "Image",
  retryTasks: "Retry tasks",
  retryTasksDescription: "Retry reading tasks; do not change tasks or repeat any write.",
  loadingTasks: "Loading tasks…",
  noTrackedTasks: "No tasks tracked yet.",
  taskComplete: "Complete",
  taskPending: "Pending",
  explore: "Explore",
  verify: "Verify",
  workflowActions: {
    planning: "Plan",
    ready: "Apply",
    progress: "Apply",
    complete: "Archive",
  } satisfies Record<Stage, string>,
  workflows: "Workflows",
  workflowsDescription:
    "Choose a workflow to prepare an editable, unsent prompt in the current chat.",
  globalWorkflows: Object.fromEntries(
    globalWorkflows.map(({ id, label, description }) => [id, { label, description }]),
  ) as Record<GlobalWorkflow, WorkflowText>,
  changeWorkflows: Object.fromEntries(
    changeWorkflows.map(({ id, label, description }) => [id, { label, description }]),
  ) as Record<ChangeWorkflow, WorkflowText>,
  continueDescription:
    "Prepare an editable, unsent prompt for at most one next planning artifact; do not implement tasks.",
  primaryArchiveDescription:
    "Prepare an editable, unsent archive prompt in the current chat; this does not archive directly.",
  applyDestinationDescription:
    "Choose an unsent current-chat draft or explicitly create a worktree and session and send the Apply prompt.",
  currentChat: "Prepare in current chat",
  newWorktree: "Run in new worktree",
  badServiceData: "The local OpenSpec service returned invalid data.",
  rootChanged: "OpenSpec root changed.",
  planningTargetChanged: "OpenSpec planning target changed.",
  changeUnlisted: "Change is no longer listed.",
  contextChanged: "OpenSpec context changed.",
  readLimit: "Session read limit reached. Refresh to clear retained reads.",
  localReadFailed: "OpenSpec read failed.",
  createUnknown: "Creation outcome is unknown; check the original project before retrying.",
  createUnknownData: "Creation outcome is unknown.",
  deleteUnknown: "Deletion outcome is unknown; check the original project before retrying.",
  language: "Language",
  auto: "Like OpenChamber",
  invalidPreference: "Invalid saved language preference. Using Like OpenChamber temporarily.",
  readPreferenceFailed:
    "Could not read the language preference. Using Like OpenChamber temporarily.",
  writePreferenceFailed:
    "Could not save the language preference. Your previous choice is unchanged.",
  create: "Create scaffold…",
  archiveAll: "Archive all",
  refresh: "Refresh",
  search: "Search changes",
  clearSearch: "Clear search",
  help: "OpenSpec quickstart",
  helpDescription: "Open the OpenSpec quickstart guide.",
  createDescription:
    "Open a form that directly creates a scaffold with its name and goal; no agent prompt is sent.",
  archiveDescription:
    "Open confirmation to create a new session and submit an archive prompt for completed changes only; unfinished changes are skipped.",
  refreshDescription: "Read the latest board state without changing files.",
  retryDescription: "Retry reading the board; do not repeat any write.",
  openChangeDescription: "Open this change's planning documents and tasks.",
  exploreDescription: "Prepare an editable, unsent exploration prompt without file changes.",
  verifyDescription:
    "Prepare an editable, unsent diagnostic verification prompt; do not implement or archive.",
  noProject: "No project selected",
  selectProject: "Select an OpenChamber project or worktree to view its OpenSpec changes.",
  retry: "Retry",
  loading: "Loading…",
  noMatches: "No matching changes",
  noChanges: "No changes here",
  noTasks: "No tasks yet",
  taskCompletion: "Task completion",
  planningChanged: "Planning target changed. Refresh to establish the new scope.",
  inspectionUnavailable: "The observed change is no longer available for inspection.",
  boardLoadFailed: "The board could not be loaded.",
  stages: {
    planning: "Planning",
    ready: "Ready",
    progress: "In Progress",
    complete: "Complete",
  } satisfies Record<Stage, string>,
  artifacts: (done: number, total: number) => `${done} of ${total} artefacts`,
  tasks: (done: number, total: number) => `${done} of ${total} tasks complete`,
  tally: (count: number, done: number, total: number) =>
    `${count} changes · ${done} of ${total} tasks complete`,
  unavailable: (id: string) => `${id} is no longer available.`,
  stale: (id: string) => `${id} is stale; latest summary unavailable.`,
  failures: (ids: string) => `${ids} could not be read. Refresh to try again.`,
};
export type UiText = typeof english;

export const russian: UiText = {
  prompts: {
    archiveAll: archiveAllPrompts.ru,
    globalIntroduction: (skill: string) =>
      `Используй инструмент навыков, чтобы загрузить и вызвать навык ${skill}.`,
    changeIntroduction: (skill: string, target: string) =>
      `Используй инструмент навыков, чтобы загрузить и вызвать навык ${skill} для ${target}.`,
    target: (id: string) => `изменения OpenSpec "${id}"`,
    goal: (goal: string) => `\nЦель: ${goal}`,
    progress: (done: number, total: number) =>
      `\nВыполнено задач: ${done} из ${total}. Продолжи реализацию с того места, где она остановилась, и выполни оставшиеся задачи.`,
    globalGuidance: {
      "bulk-archive":
        "Оставь выбор кандидатов, оценку конфликтов и подтверждение пакетной архивации сценарию; не выбирай заранее видимые или завершённые изменения.",
      onboard:
        "Оставь разрешение на настройку и выбор учебной задачи сценарию и его вопросам пользователю.",
      explore:
        "Спроси пользователя, какие идеи исследовать. Изучи соответствующий контекст, варианты и компромиссы без изменения файлов и без реализации.",
      creation:
        "Выясни, какое новое изменение задумал пользователь; не выбирай и не дополняй каркас существующего изменения.",
    },
    globalSafety:
      "Сохрани проверки настройки и обязательные вопросы пользователю, предусмотренные сценарием. Если навык недоступен, сообщи об этом ограничении, а не подменяй его другим сценарием.",
    changeGuidance: {
      continue: () =>
        "Изучи статус этого существующего изменения и следуй инструкциям сценария по артефактам, чтобы создать не более одного следующего планового артефакта. Сохрани существующие решения и записанную цель. Если цель не записана, изучи существующий контекст и при необходимости попроси пользователя уточнить её; не выдумывай цель и не записывай её метаданные автоматически. Не создавай другое изменение и не реализуй код. Обработку уже завершённого планирования и частично заполненных артефактов оставь сценарию; не переходи автоматически к выполнению задач.",
      explore: (target: string) =>
        `Исследуй цель, соответствующий код, варианты и компромиссы для ${target}. Обсуди результаты без изменения файлов и без реализации. Если цель не записана, изучи существующий контекст и при необходимости попроси пользователя уточнить её; не выдумывай цель.`,
      apply: (target: string) =>
        `Выполни все оставшиеся задачи для ${target}, затем проверь реализацию на соответствие артефактам изменения. Устрани найденные проблемы и проверь снова, пока все задачи не будут выполнены и проверка не пройдёт успешно. При блокировке сообщи о препятствии, а не отмечай незавершённую работу как выполненную.`,
      update: () =>
        "Пересмотри и обнови плановые артефакты этого изменения, сохранив существующие решения и записанную цель. Сохрани обязательные подтверждения пользователя, предусмотренные сценарием. Не реализуй задачи и не архивируй изменение.",
      sync: () =>
        "Синхронизируй дельта-спецификации этого изменения с основными спецификациями, соблюдая предварительные проверки и обязательные вопросы пользователю, предусмотренные сценарием. Не реализуй задачи и не архивируй изменение после синхронизации.",
      verify: () =>
        "Сравни реализацию с плановыми артефактами этого изменения и сообщи о пробелах и несоответствиях в диагностическом режиме, без реализации и архивации.",
      archive: () =>
        "Проверь предварительные условия архивации, предусмотренные сценарием, и сохрани обязательные подтверждения пользователя; не предполагай, что изменение уже проверено или что архивация разрешена.",
    },
  },
  newChange: "Новое изменение",
  changeName: "Имя изменения",
  namePlaceholder: "add-change-board",
  goal: "Цель",
  goalPlaceholder: "Что должно стать возможным благодаря этому изменению?",
  cancel: "Отмена",
  close: "Закрыть",
  createSubmit: "Создать",
  retryRead: "Повторить чтение",
  inspectChange: "Просмотреть изменение",
  dismissAttempt: "Сбросить попытку",
  invalidName: "Используйте строчные латинские буквы или цифры, разделённые одиночными дефисами.",
  requiredGoal: "Укажите цель.",
  createCloseDescription: "Закрыть форму без создания ещё одной заготовки.",
  createSubmitDescription:
    "Создать заготовку с указанным именем и записанной целью в исходном проекте; агент не запускается.",
  createRetryDescription:
    "Прочитать исходный проект для проверки неизвестного результата создания, не повторяя создание.",
  inspectDescription:
    "Открыть найденное изменение для просмотра; это не подтверждает успешное создание.",
  dismissDescription:
    "Сбросить попытку без повторного создания и без удаления существующего изменения.",
  createReadRequired: "Результат создания неизвестен. Повторите чтение перед новым созданием.",
  createChecking: "Проверка исходного проекта на наличие изменения с таким именем…",
  createObserved:
    "Результат создания неизвестен. Найдено существующее изменение с таким именем для просмотра.",
  createAbsent:
    "Результат создания неизвестен. Данные исходного проекта обновлены; изменение с таким именем не найдено.",
  originalReadFailed: "Не удалось прочитать исходный проект.",
  createReadFailed: (diagnostic) =>
    `Результат создания неизвестен. ${diagnostic} Повторите чтение перед новым созданием.`,
  originalContext: (directory, root) =>
    ` Вернитесь в ${directory} (корень OpenSpec ${root}) для просмотра или отправки в исходном проекте.`,
  changeCreated: "Изменение создано.",
  deleteHeading: (name) => `Удалить ${name}?`,
  deleteWarning: (name) =>
    `Безвозвратно удалить папку планирования ${name}? Это не отменяет реализацию и не удаляет основные спецификации.`,
  deleteCloseDescription: "Закрыть подтверждение без удаления изменения.",
  deleteRetryDescription:
    "Прочитать исходный проект для выяснения результата удаления, не повторяя удаление.",
  deleteSubmitDescription:
    "Безвозвратно удалить папку планирования изменения; реализация и основные спецификации сохраняются.",
  deleteChecking: "Проверка наличия изменения в исходном проекте…",
  deletePresent:
    "Удаление не подтверждено. Изменение всё ещё в списке. Закройте окно и подтвердите заново перед следующей попыткой.",
  deleteUnresolved:
    "Результат удаления не выяснен. Повторите чтение исходного проекта перед следующей попыткой.",
  archiveHeading: "Архивировать все завершённые изменения?",
  archiveWarning:
    "Будет создан новый сеанс и отправлен запрос архивации завершённых изменений этого проекта. Незавершённые изменения будут пропущены. Доска останется открытой; обновите её для просмотра результатов.",
  startArchiving: "Начать архивацию",
  archiveCancelDescription: "Закрыть подтверждение без создания сеанса и отправки запроса.",
  archiveStartDescription:
    "Создать сеанс и отправить запрос архивации только завершённых изменений; незавершённые пропускаются.",
  promptPrepared: "Запрос сценария подготовлен в открытом редакторе сообщения.",
  promptFailed: "Не удалось подготовить запрос сценария.",
  quickstartFailed: "Не удалось открыть краткое руководство",
  copyFailed: "Не удалось скопировать имя изменения",
  nameCopied: "Имя изменения скопировано",
  linkFailed: "Не удалось открыть ссылку документа",
  workspaceInspectionFailed:
    "Не удалось проверить рабочее пространство хоста. Проверьте рабочие деревья и сеансы перед новой попыткой.",
  workspaceInspectionTimeout:
    "Истекло время проверки рабочего пространства хоста. Создание не запрашивалось.",
  workspaceInspectionError: "Не удалось проверить рабочее пространство хоста.",
  projectUnidentified:
    "Не удалось определить исходный зарегистрированный проект. Рабочее дерево не запрашивалось.",
  sessionsIncomplete: "Проверка сеансов не завершена. Проверьте проект перед новой попыткой.",
  worktreeCollision: (name, directory, session) =>
    `Рабочее дерево или сеанс для ${name} уже существует${directory !== null ? ` по пути ${directory}` : ` (сеанс ${session})`}. Просмотрите его вместо создания ещё одного рабочего дерева.`,
  applyUnavailable:
    "Это изменение больше не доступно для выполнения. Обновите данные перед запуском выполнения.",
  applyTitle: (name) => `Выполнить ${name}`,
  retainedWorktree: (name, directory) => ` Рабочее дерево ${name} по пути ${directory} сохранено.`,
  applyNotSent: (id, sent, resource) =>
    `Сеанс ${id} существует, но отправка запроса выполнения не подтверждена (${sent}).${resource} Проверьте его перед новой попыткой.`,
  applyCreationFailed: (failure, resource) =>
    `Не удалось создать сеанс выполнения (${failure}).${resource} Проверьте рабочие деревья и сеансы перед новой попыткой.`,
  applyUnexpected: (id, resource) =>
    `Сеанс ${id} возвращён с неожиданными данными рабочего дерева.${resource} Проверьте его перед новой попыткой.`,
  applySubmitted: (id, linked) =>
    `Запрос выполнения отправлен в сеанс ${id}.${linked ? "" : " Не удалось сохранить ссылку на сценарий."}`,
  applyOpenFailed: (id) =>
    `Сеанс выполнения ${id} существует, но открыть его не удалось. Проверьте этот сеанс; отправка не будет повторена.`,
  applyUncertain: (diagnostic) =>
    `Результат запуска выполнения неизвестен. Рабочее дерево, сеанс или отправленный запрос уже могут существовать. Проверьте рабочие деревья и сеансы перед новой попыткой; автоматического повтора запуска не будет. ${diagnostic}`,
  worktreeInspectionFailed: "Не удалось проверить рабочее дерево. Создание не запрашивалось.",
  archiveTitle: "Архивировать завершённые изменения OpenSpec",
  archiveSubmitted: (id, linked) =>
    linked
      ? `Запрос архивации отправлен в сеанс ${id}. Обновите доску для просмотра результатов.`
      : `Запрос архивации отправлен в сеанс ${id}, но сохранить ссылку на сценарий не удалось.`,
  noModel: "Нет доступной модели.",
  submissionReason: (sent) => `Отправка: ${sent}.`,
  archiveNotSent: (id, reason, linked) =>
    `Сеанс ${id} существует, но запрос архивации не был успешно отправлен. ${reason} Проверьте этот сеанс перед новым запуском.${linked ? "" : " Ссылка на сценарий не сохранена."}`,
  archiveCreationFailed:
    "Не удалось создать сеанс архивации. Проверьте сеансы перед новым запуском.",
  archiveRefused: (diagnostic) => `Не удалось запустить архивацию: ${diagnostic}`,
  archiveUncertain:
    "Результат запуска архивации неизвестен. Сеанс или отправленный запрос уже могут существовать. Проверьте сеансы перед новым запуском; автоматического повтора запуска не будет.",
  sentReasons: {
    sent: "отправлено",
    "no-model": "нет модели",
    skipped: "пропущено",
    failed: "ошибка",
    unknown: "неизвестно",
    "bootstrap-failed": "ошибка подготовки",
    "session-create-failed": "ошибка создания сеанса",
  },
  back: "Назад к изменениям",
  backDescription: "Вернуться к доске изменений.",
  copyName: "Копировать имя изменения",
  copyDescription: "Копировать имя этого изменения в буфер обмена.",
  delete: "Удалить",
  deleteChange: "Удалить изменение",
  deleteDescription:
    "Открыть подтверждение перед безвозвратным удалением папки планирования изменения.",
  recordedObjective: "Записанная цель",
  planningArtifacts: "Артефакты планирования",
  goalUnavailable: "Цель недоступна",
  detailUnavailable: "Это изменение больше недоступно. Обновите данные или вернитесь к доске.",
  detailRefreshDescription:
    "Прочитать актуальное состояние изменения, документов и задач без изменения файлов.",
  detailRetryDescription: "Повторить чтение изменения, не повторяя запись.",
  artifactLabels: {
    proposal: "Предложение",
    specs: "Спецификации",
    design: "Проектирование",
    tasks: "Задачи",
  },
  readiness: {
    done: "Написано",
    ready: "Готово к написанию",
    blocked: "Заблокировано",
    skipped: "Пропущено",
  },
  readyToWrite: "Артефакт готов к написанию. Продолжите планирование в чате.",
  blockedUntil: (ids) =>
    `Заблокировано, пока не написаны или не пропущены: ${ids.map((id) => russian.artifactLabels[id] ?? id).join(", ")}.`,
  blockedUnknown: "Заблокировано условиями планирования; подробности недоступны.",
  skippedArtifact: "Этот артефакт пропущен.",
  noArtifactDocuments: "У этого артефакта пока нет доступных документов.",
  noPlanningDocuments: "У этого изменения нет доступных документов планирования.",
  readFailed: " · Ошибка чтения",
  loadingDocument: "Загрузка документа…",
  retryDocument: "Повторить чтение документа",
  retryDocumentDescription: "Повторить чтение документа, не повторяя запись.",
  renderingFailed: "Не удалось отобразить документ. Показан исходный текст.",
  documentTask: "Задача документа",
  documentImage: "Изображение",
  retryTasks: "Повторить чтение задач",
  retryTasksDescription: "Повторить чтение задач, не изменяя задачи и не повторяя запись.",
  loadingTasks: "Загрузка задач…",
  noTrackedTasks: "Отслеживаемых задач пока нет.",
  taskComplete: "Завершено",
  taskPending: "Ожидает выполнения",
  explore: "Исследовать",
  verify: "Проверить",
  workflowActions: {
    planning: "Планировать",
    ready: "Выполнить",
    progress: "Выполнить",
    complete: "Архивировать",
  },
  workflows: "Сценарии",
  workflowsDescription:
    "Выбрать сценарий для подготовки редактируемого, неотправленного запроса в текущем чате.",
  globalWorkflows: {
    propose: {
      label: "Предложить изменение",
      description:
        "Подготовить неотправленный запрос для определения нового изменения и его артефактов планирования.",
    },
    explore: {
      label: "Исследовать идеи",
      description:
        "Подготовить неотправленный запрос для исследования идей и компромиссов без изменения файлов.",
    },
    new: {
      label: "Новое изменение",
      description: "Подготовить неотправленный запрос для пошагового начала нового изменения.",
    },
    ff: {
      label: "Быстрое планирование",
      description:
        "Подготовить неотправленный запрос для создания всех артефактов планирования нового изменения.",
    },
    "bulk-archive": {
      label: "Групповая архивация",
      description:
        "Подготовить неотправленный запрос для выбора изменений, оценки конфликтов и подтверждения групповой архивации.",
    },
    onboard: {
      label: "Введение в работу",
      description:
        "Подготовить неотправленный запрос для полного цикла изменения с вопросами о настройке и задачах.",
    },
  },
  changeWorkflows: {
    continue: {
      label: "Продолжить изменение",
      description:
        "Подготовить неотправленный запрос для не более одного следующего артефакта планирования, без реализации.",
    },
    apply: {
      label: "Выполнить задачи",
      description:
        "Подготовить неотправленный запрос в текущем чате для реализации и проверки оставшихся задач.",
    },
    update: {
      label: "Обновить изменение",
      description:
        "Подготовить неотправленный запрос для пересмотра артефактов планирования без реализации задач.",
    },
    sync: {
      label: "Синхронизировать спецификации",
      description:
        "Подготовить неотправленный запрос для синхронизации изменений спецификаций с основными спецификациями без архивации.",
    },
    archive: {
      label: "Архивировать изменение",
      description:
        "Подготовить неотправленный запрос для проверки условий архивации и запроса подтверждения.",
    },
    verify: {
      label: "Проверить изменение",
      description:
        "Подготовить неотправленный запрос для отчёта о расхождениях с артефактами планирования без исправлений и архивации.",
    },
    explore: {
      label: "Исследовать идеи",
      description:
        "Подготовить неотправленный запрос для исследования этого изменения и компромиссов без изменения файлов.",
    },
  },
  continueDescription:
    "Подготовить редактируемый, неотправленный запрос для не более одного следующего артефакта планирования, без реализации задач.",
  primaryArchiveDescription:
    "Подготовить редактируемый, неотправленный запрос архивации в текущем чате; это не прямая архивация.",
  applyDestinationDescription:
    "Выбрать неотправленный черновик в текущем чате или явно создать рабочее дерево и сеанс и отправить запрос выполнения.",
  currentChat: "Подготовить в текущем чате",
  newWorktree: "Запустить в новом рабочем дереве",
  badServiceData: "Локальный сервис OpenSpec вернул недопустимые данные.",
  rootChanged: "Корень OpenSpec изменился.",
  planningTargetChanged: "Цель планирования OpenSpec изменилась.",
  changeUnlisted: "Изменение больше не указано в списке.",
  contextChanged: "Контекст OpenSpec изменился.",
  readLimit:
    "Достигнут лимит чтения сеанса. Обновите данные, чтобы очистить сохранённые результаты чтения.",
  localReadFailed: "Не удалось прочитать данные OpenSpec.",
  createUnknown:
    "Результат создания неизвестен; проверьте исходный проект перед повторной попыткой.",
  createUnknownData: "Результат создания неизвестен.",
  deleteUnknown:
    "Результат удаления неизвестен; проверьте исходный проект перед повторной попыткой.",
  language: "Язык",
  auto: "Как в OpenChamber",
  invalidPreference:
    "Сохранённое значение языка недопустимо. Временно используется язык OpenChamber.",
  readPreferenceFailed:
    "Не удалось прочитать настройку языка. Временно используется язык OpenChamber.",
  writePreferenceFailed: "Не удалось сохранить настройку языка. Предыдущий выбор не изменён.",
  create: "Создать заготовку…",
  archiveAll: "Архивировать все",
  refresh: "Обновить",
  search: "Поиск изменений",
  clearSearch: "Очистить поиск",
  help: "Краткое руководство OpenSpec",
  helpDescription: "Открыть краткое руководство OpenSpec.",
  createDescription:
    "Открыть форму создания заготовки с именем и целью; запрос агенту не отправляется.",
  archiveDescription:
    "Открыть подтверждение создания сеанса и отправки запроса архивации только завершённых изменений; незавершённые пропускаются.",
  refreshDescription: "Прочитать актуальное состояние доски без изменения файлов.",
  retryDescription: "Повторить чтение доски, не повторяя запись.",
  openChangeDescription: "Открыть документы планирования и задачи этого изменения.",
  exploreDescription:
    "Подготовить редактируемый, неотправленный запрос исследования без изменения файлов.",
  verifyDescription:
    "Подготовить редактируемый, неотправленный диагностический запрос проверки без реализации и архивации.",
  noProject: "Проект не выбран",
  selectProject: "Выберите проект или рабочее дерево OpenChamber для просмотра изменений OpenSpec.",
  retry: "Повторить",
  loading: "Загрузка…",
  noMatches: "Подходящих изменений нет",
  noChanges: "Здесь пока нет изменений",
  noTasks: "Задач пока нет",
  taskCompletion: "Выполнение задач",
  planningChanged: "Цель планирования изменилась. Обновите доску для нового контекста.",
  inspectionUnavailable: "Наблюдаемое изменение больше недоступно для просмотра.",
  boardLoadFailed: "Не удалось загрузить доску.",
  stages: {
    planning: "Планирование",
    ready: "Готово к выполнению",
    progress: "В работе",
    complete: "Завершено",
  },
  artifacts: (done, total) =>
    `${done} из ${total} ${plural(total, "артефакта", "артефактов", "артефактов")}`,
  tasks: (done, total) =>
    `${done} из ${total} ${plural(total, "задачи", "задач", "задач")} выполнено`,
  tally: (count, done, total) =>
    `${count} ${plural(count, "изменение", "изменения", "изменений")} · ${russian.tasks(done, total)}`,
  unavailable: (id) => `${id} больше недоступно.`,
  stale: (id) => `${id}: данные устарели; актуальная сводка недоступна.`,
  failures: (ids) => `${ids}: не удалось прочитать. Обновите доску, чтобы повторить попытку.`,
};

export const uiText = (language: Language): UiText => (language === "ru" ? russian : english);

// Keep owned messages distinct from verbatim upstream diagnostics until presentation.
type MessageKey = { [K in keyof UiText]: UiText[K] extends string ? K : never }[keyof UiText];
export type LocalMessage =
  | { key: MessageKey }
  | { key: "worktreeCollision"; name: string; directory: string | null; session: string | null };
export const presentMessage = (text: UiText, message: LocalMessage | string): string =>
  typeof message === "string"
    ? message
    : message.key === "worktreeCollision"
      ? text.worktreeCollision(message.name, message.directory, message.session)
      : text[message.key];

export function ownedError<T extends Error>(
  error: T,
  key: MessageKey | LocalMessage,
): T & { localMessage: LocalMessage } {
  return Object.assign(error, { localMessage: typeof key === "string" ? { key } : key });
}
export function errorMessage(error: Error, text: UiText): string {
  return presentMessage(text, describeError(error));
}
export function describeError(error: Error): LocalMessage | string {
  return "localMessage" in error
    ? (error as Error & { localMessage: LocalMessage }).localMessage
    : error.message;
}
