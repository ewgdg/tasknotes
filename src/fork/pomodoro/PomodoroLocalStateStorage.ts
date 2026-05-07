import type { App } from "obsidian";
import type { PomodoroState } from "../../types";

export type PomodoroLocalStateSnapshot = {
	pomodoroState?: PomodoroState;
	lastPomodoroDate?: string;
	lastSelectedTaskPath?: string;
};

export const POMODORO_LOCAL_STORAGE_KEY = "tasknotes-pomodoro-local-state";

type LocalStorageApp = Pick<App, "loadLocalStorage" | "saveLocalStorage">;

export function sanitizePomodoroLocalStateSnapshot(
	snapshot: PomodoroLocalStateSnapshot
): PomodoroLocalStateSnapshot {
	const sanitized: PomodoroLocalStateSnapshot = {};

	if (snapshot.pomodoroState) {
		sanitized.pomodoroState = snapshot.pomodoroState;
	}

	if (
		typeof snapshot.lastPomodoroDate === "string" &&
		snapshot.lastPomodoroDate.trim().length > 0
	) {
		sanitized.lastPomodoroDate = snapshot.lastPomodoroDate;
	}

	if (
		typeof snapshot.lastSelectedTaskPath === "string" &&
		snapshot.lastSelectedTaskPath.trim().length > 0
	) {
		sanitized.lastSelectedTaskPath = snapshot.lastSelectedTaskPath;
	}

	return sanitized;
}

export function loadPomodoroLocalStateSnapshot(app: LocalStorageApp): PomodoroLocalStateSnapshot {
	try {
		const stored = app.loadLocalStorage(POMODORO_LOCAL_STORAGE_KEY);
		if (stored && typeof stored === "string") {
			const parsed = JSON.parse(stored);
			if (parsed && typeof parsed === "object") {
				return parsed as PomodoroLocalStateSnapshot;
			}
		}
	} catch (error) {
		console.warn("Failed to load pomodoro local state:", error);
	}

	return {};
}

export function savePomodoroLocalStateSnapshot(
	app: LocalStorageApp,
	snapshot: PomodoroLocalStateSnapshot
): void {
	const sanitizedSnapshot = sanitizePomodoroLocalStateSnapshot(snapshot);
	app.saveLocalStorage(
		POMODORO_LOCAL_STORAGE_KEY,
		Object.keys(sanitizedSnapshot).length > 0 ? JSON.stringify(sanitizedSnapshot) : null
	);
}
