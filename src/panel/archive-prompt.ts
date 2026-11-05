import type { Language } from "./localization.js";

export const archiveAllPrompts: Record<Language, string> = {
  en: `Archive all completed OpenSpec changes in this session's project/worktree.

Run openspec list --json for a fresh active-change listing and resolve its OpenSpec planning context, honouring declared stores and the selected CLI root. Inspect each change with openspec status --change "<name>" --json and current CLI-reported task counts. Only changes with every applicable planning artefact done or explicitly skipped, a positive task total, and all tasks complete qualify. Skip unfinished, zero-task, unavailable or unreadable changes. Never use an incomplete-work warning override or infer successful verification from a Complete card or task counts.

Use your skill tool to load and invoke the openspec-archive-change skill for each qualifying named change sequentially. Recheck completion before each archive and assess spec sync against the current main specs after any preceding archive. Preserve the skill's prerequisites, sync assessment, user choices and blockers; ask its required questions rather than treating this bulk request as permission to bypass them. Do not implement unfinished work or automatically resolve blockers.

Report archived, skipped and blocked changes with reasons. If none qualify, make no OpenSpec mutations and report that outcome.`,
  ru: `Архивируй все завершённые изменения OpenSpec в проекте/рабочем дереве этой сессии.

Выполни openspec list --json, чтобы получить свежий список активных изменений, и определи его контекст планирования OpenSpec, учитывая объявленные хранилища и выбранный корень CLI. Изучи каждое изменение с помощью openspec status --change "<name>" --json и актуальных счётчиков задач, полученных от CLI. Подходят только изменения, у которых каждый применимый плановый артефакт завершён (done) или явно пропущен (skipped), с положительным общим числом задач и всеми выполненными задачами. Пропускай незавершённые, недоступные, нечитаемые изменения и изменения без задач. Не используй обход предупреждения о незавершённой работе и не считай карточку «Завершено» или счётчики задач доказательством успешной проверки.

Используй инструмент навыков, чтобы загрузить и вызвать навык openspec-archive-change последовательно для каждого подходящего изменения по имени. Повторно проверяй завершённость перед каждой архивацией и оценивай синхронизацию спецификаций с актуальными основными спецификациями после каждой предыдущей архивации. Сохрани предварительные условия навыка, оценку синхронизации, выбор пользователя и блокирующие обстоятельства; задавай обязательные вопросы навыка, а не считай этот пакетный запрос разрешением их обойти. Не реализуй незавершённую работу и не устраняй блокирующие обстоятельства автоматически.

Перечисли архивированные, пропущенные и заблокированные изменения с причинами. Если ни одно изменение не подходит, не вноси изменений в OpenSpec и сообщи об этом результате.`,
};
