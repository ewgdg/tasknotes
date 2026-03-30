import type TaskNotesPlugin from "../../main";
import {
	loadPomodoroLocalStateSnapshot,
	savePomodoroLocalStateSnapshot,
	sanitizePomodoroLocalStateSnapshot,
} from "./PomodoroLocalStateStorage";

export async function migrateLoadedPluginData(
	plugin: TaskNotesPlugin,
	loadedData: Record<string, any> | null
): Promise<Record<string, any> | null> {
	if (!loadedData || typeof loadedData !== "object") {
		return loadedData;
	}

	const migratedPomodoroState = sanitizePomodoroLocalStateSnapshot({
		pomodoroState: loadedData.pomodoroState,
		lastPomodoroDate: loadedData.lastPomodoroDate,
		lastSelectedTaskPath: loadedData.lastSelectedTaskPath,
	});

	if (Object.keys(migratedPomodoroState).length === 0) {
		return loadedData;
	}

	const nextData = { ...loadedData };
	delete nextData.pomodoroState;
	delete nextData.lastPomodoroDate;
	delete nextData.lastSelectedTaskPath;

	// Keep the migration best-effort and non-destructive: if any fork-local
	// state already exists, prefer that boundary and leave legacy disk data alone.
	const existingLocalState = loadPomodoroLocalStateSnapshot(plugin.app);
	if (Object.keys(existingLocalState).length > 0) {
		return nextData;
	}

	savePomodoroLocalStateSnapshot(plugin.app, migratedPomodoroState);
	await plugin.saveData(nextData);

	return nextData;
}
