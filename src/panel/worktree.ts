import type { HostClient } from "@openchamber/sdk";
import { english, ownedError } from "./localization.js";

async function ready<T extends { state: "loading" | "ready" | "error" }>(
  read: () => Promise<T>,
  subscribe: (listener: (value: T) => void) => Promise<() => void>,
): Promise<T> {
  const initial = await read();
  if (initial.state === "ready") return initial;
  if (initial.state === "error")
    throw ownedError(new Error(english.workspaceInspectionFailed), "workspaceInspectionFailed");
  let off: (() => void) | undefined;
  let settled = false;
  let timer: ReturnType<typeof setTimeout>;
  try {
    return await new Promise<T>((resolve, reject) => {
      timer = setTimeout(() => {
        settled = true;
        reject(
          ownedError(new Error(english.workspaceInspectionTimeout), "workspaceInspectionTimeout"),
        );
      }, 20_000);
      void subscribe((value) => {
        if (value.state === "loading") return;
        settled = true;
        if (value.state === "ready") resolve(value);
        else
          reject(
            ownedError(new Error(english.workspaceInspectionError), "workspaceInspectionError"),
          );
      }).then((unsubscribe) => {
        off = unsubscribe;
        if (settled) off();
      }, reject);
    });
  } finally {
    settled = true;
    clearTimeout(timer!);
    off?.();
  }
}

export async function inspectWorktreeDestination(
  host: HostClient,
  directory: string,
  name: string,
) {
  const projects = await ready(
    () => host.listProjects(),
    (listener) => host.onProjects(listener),
  );
  const owners = projects.projects.filter((project) => project.directory === directory);
  if (!owners.length) {
    const mappings = await Promise.all(
      projects.projects.map(async (project) => ({
        project,
        trees: await ready(
          () => host.listWorktrees(project.id),
          (listener) => host.onWorktrees(project.id, listener),
        ),
      })),
    );
    owners.push(
      ...mappings
        .filter(({ trees }) => trees.worktrees.some((tree) => tree.directory === directory))
        .map(({ project }) => project),
    );
  }
  if (owners.length !== 1)
    throw ownedError(new Error(english.projectUnidentified), "projectUnidentified");
  const project = owners[0]!;
  const [trees, sessions] = await Promise.all([
    ready(
      () => host.listWorktrees(project.id),
      (listener) => host.onWorktrees(project.id, listener),
    ),
    ready(
      () => host.listSessions(project.id),
      (listener) => host.onSessions(project.id, listener),
    ),
  ]);
  if (sessions.coverage.some((item) => item.state !== "ready"))
    throw ownedError(new Error(english.sessionsIncomplete), "sessionsIncomplete");
  const collision = trees.worktrees.find((tree) => tree.name === name || tree.branch === name);
  const session = sessions.sessions.find(
    (session) => session.worktree?.name === name || session.items.some((item) => item.id === name),
  );
  if (collision || session)
    throw ownedError(
      new Error(english.worktreeCollision(name, collision?.directory ?? null, session?.id ?? null)),
      {
        key: "worktreeCollision",
        name,
        directory: collision?.directory ?? null,
        session: session?.id ?? null,
      },
    );
  return project;
}
