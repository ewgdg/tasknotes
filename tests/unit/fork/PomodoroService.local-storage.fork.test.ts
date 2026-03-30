import { App } from "obsidian";
import { PomodoroService } from "../../../src/services/PomodoroService";
import { migrateLoadedPluginData } from "../../../src/fork/pomodoro/DataMigrationService";
import { POMODORO_LOCAL_STORAGE_KEY } from "../../../src/fork/pomodoro/PomodoroLocalStateStorage";

type StoredPluginData = Record<string, any>;

function createPlugin(initialData: StoredPluginData | null) {
	const app = new App();
	let storedData = initialData ? JSON.parse(JSON.stringify(initialData)) : null;

		const plugin = {
			app,
			settings: {
				pomodoroWorkDuration: 25,
				pomodoroStorageLocation: "plugin",
			},
		emitter: { trigger: jest.fn() },
		i18n: { translate: jest.fn((key: string) => key) },
		taskService: { startTimeTracking: jest.fn(), stopTimeTracking: jest.fn() },
		cacheManager: { getTaskInfo: jest.fn() },
		statusManager: { isCompletedStatus: jest.fn(() => false) },
		loadData: jest.fn(async () => (storedData ? JSON.parse(JSON.stringify(storedData)) : null)),
		saveData: jest.fn(async (data: StoredPluginData) => {
			storedData = JSON.parse(JSON.stringify(data));
		}),
	};

	return {
		app,
		plugin,
		getStoredData: () => storedData,
	};
}

describe("fork: PomodoroService local storage persistence", () => {
	beforeEach(() => {
		localStorage.clear();
		jest.clearAllMocks();
	});

	it("migrates legacy pomodoro runtime state out of plugin data", async () => {
		const { app, plugin, getStoredData } = createPlugin({
			tasksFolder: "Projects/Tasks",
			pomodoroHistory: [{ id: "history-1" }],
			pomodoroState: {
				isRunning: true,
				timeRemaining: 1200,
				currentSession: {
					id: "session-1",
					taskPath: "Tasks/Deep Work.md",
					startTime: "2026-03-29T10:00:00.000Z",
					plannedDuration: 25,
					type: "work",
					completed: false,
					activePeriods: [{ startTime: "2026-03-29T10:00:00.000Z" }],
				},
			},
			lastPomodoroDate: "2026-03-29",
			lastSelectedTaskPath: "Tasks/Deep Work.md",
		});
		const loadedData = await plugin.loadData();
		await migrateLoadedPluginData(plugin as any, loadedData);

		const service = new PomodoroService(plugin as any);

		await service.loadState();

		expect(service.getState().currentSession?.taskPath).toBe("Tasks/Deep Work.md");
		expect(await service.getLastSelectedTaskPath()).toBe("Tasks/Deep Work.md");
		expect(app.loadLocalStorage(POMODORO_LOCAL_STORAGE_KEY)).toEqual(
			expect.stringContaining("\"lastSelectedTaskPath\":\"Tasks/Deep Work.md\"")
		);

		const savedData = getStoredData();
		expect(savedData?.pomodoroHistory).toEqual([{ id: "history-1" }]);
		expect("pomodoroState" in (savedData || {})).toBe(false);
		expect("lastPomodoroDate" in (savedData || {})).toBe(false);
		expect("lastSelectedTaskPath" in (savedData || {})).toBe(false);
	});

	it("writes pomodoro runtime updates to local storage without touching plugin data", async () => {
		const { app, plugin, getStoredData } = createPlugin({
			tasksFolder: "Projects/Tasks",
			pomodoroHistory: [{ id: "history-1" }],
		});
		const service = new PomodoroService(plugin as any);

		(service as any).state = {
			isRunning: true,
			timeRemaining: 900,
			currentSession: {
				id: "session-2",
				taskPath: "Tasks/Focus.md",
				startTime: "2026-03-29T09:00:00.000Z",
				plannedDuration: 15,
				type: "work",
				completed: false,
				activePeriods: [{ startTime: "2026-03-29T09:00:00.000Z" }],
			},
		};

		await service.saveState();
		await service.saveLastSelectedTask("Tasks/Focus.md");

		expect(plugin.saveData).not.toHaveBeenCalled();
		expect(app.saveLocalStorage).toHaveBeenCalled();
		expect(app.loadLocalStorage(POMODORO_LOCAL_STORAGE_KEY)).toEqual(
			expect.stringContaining("\"taskPath\":\"Tasks/Focus.md\"")
		);
		expect(getStoredData()).toEqual({
			tasksFolder: "Projects/Tasks",
			pomodoroHistory: [{ id: "history-1" }],
		});
	});

	it("keeps legacy plugin data untouched when fork local state already exists", async () => {
		const { app, plugin, getStoredData } = createPlugin({
			tasksFolder: "Projects/Tasks",
			pomodoroHistory: [{ id: "history-1" }],
			pomodoroState: {
				isRunning: true,
				timeRemaining: 1200,
				currentSession: {
					id: "session-3",
					taskPath: "Tasks/Legacy.md",
					startTime: "2026-03-29T08:00:00.000Z",
					plannedDuration: 25,
					type: "work",
					completed: false,
					activePeriods: [{ startTime: "2026-03-29T08:00:00.000Z" }],
				},
			},
			lastPomodoroDate: "2026-03-29",
			lastSelectedTaskPath: "Tasks/Legacy.md",
		});

		app.saveLocalStorage(
			POMODORO_LOCAL_STORAGE_KEY,
			JSON.stringify({ lastSelectedTaskPath: "Tasks/Existing Local.md" })
		);
		jest.clearAllMocks();

		const loadedData = await plugin.loadData();
		const migratedData = await migrateLoadedPluginData(plugin as any, loadedData);

		expect(migratedData).toEqual({
			tasksFolder: "Projects/Tasks",
			pomodoroHistory: [{ id: "history-1" }],
		});
		expect(plugin.saveData).not.toHaveBeenCalled();
		expect(app.saveLocalStorage).not.toHaveBeenCalled();
		expect(getStoredData()).toMatchObject({
			pomodoroState: expect.objectContaining({
				currentSession: expect.objectContaining({
					taskPath: "Tasks/Legacy.md",
				}),
			}),
			lastPomodoroDate: "2026-03-29",
			lastSelectedTaskPath: "Tasks/Legacy.md",
		});
		expect(app.loadLocalStorage(POMODORO_LOCAL_STORAGE_KEY)).toEqual(
			expect.stringContaining("\"lastSelectedTaskPath\":\"Tasks/Existing Local.md\"")
		);
	});
});
