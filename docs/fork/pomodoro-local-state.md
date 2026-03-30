# Fork Notes: Pomodoro Local State

This fork moves transient Pomodoro runtime state out of plugin `data.json` and into Obsidian local storage.

Implementation is isolated under `src/fork/pomodoro/` to keep the fork boundary explicit.

Scope:

- `pomodoroState`
- `lastPomodoroDate`
- `lastSelectedTaskPath`

Behavior:

- Existing legacy values in `data.json` are migrated only when no fork-local snapshot exists yet.
- If fork-local state already exists, legacy runtime keys are ignored in memory and left untouched on disk.
- Settings loads ignore these transient keys in memory, even when legacy disk values are left untouched.
- Pomodoro runtime updates no longer churn `data.json`.

Motivation:

- Keep `data.json` config-focused.
- Reduce sync noise and conflict risk from frequent Pomodoro state writes.

Related issues:

- `#1637`
- `#1669`
