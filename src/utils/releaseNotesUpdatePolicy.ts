export interface ReleaseNotesUpdateState {
	hasVersionChange: boolean;
	hasReleaseNotesChange: boolean;
	shouldShowReleaseNotes: boolean;
	nextLastSeenVersion: string;
	nextLastSeenReleaseNotesVersion: string;
}

interface ReleaseNotesUpdatePolicyInput {
	currentVersion: string;
	currentReleaseNotesVersion?: string;
	lastSeenVersion?: string;
	lastSeenReleaseNotesVersion?: string;
}

function getReleaseNotesContentVersion({
	currentVersion,
	currentReleaseNotesVersion,
}: Pick<ReleaseNotesUpdatePolicyInput, "currentVersion" | "currentReleaseNotesVersion">): string {
	return currentReleaseNotesVersion ?? currentVersion;
}

export function getReleaseNotesUpdateState({
	currentVersion,
	currentReleaseNotesVersion,
	lastSeenVersion,
	lastSeenReleaseNotesVersion,
}: ReleaseNotesUpdatePolicyInput): ReleaseNotesUpdateState {
	const effectiveCurrentReleaseNotesVersion = getReleaseNotesContentVersion({
		currentVersion,
		currentReleaseNotesVersion,
	});
	const effectiveLastSeenReleaseNotesVersion =
		lastSeenReleaseNotesVersion ?? lastSeenVersion;

	const hasVersionChange = Boolean(lastSeenVersion && lastSeenVersion !== currentVersion);
	const hasReleaseNotesChange =
		effectiveLastSeenReleaseNotesVersion !== effectiveCurrentReleaseNotesVersion;

	return {
		hasVersionChange,
		hasReleaseNotesChange,
		shouldShowReleaseNotes: hasVersionChange && hasReleaseNotesChange,
		nextLastSeenVersion: currentVersion,
		nextLastSeenReleaseNotesVersion: effectiveCurrentReleaseNotesVersion,
	};
}
