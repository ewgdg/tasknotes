import { describe, expect, it } from "@jest/globals";
import { getReleaseNotesUpdateState } from "../../../src/utils/releaseNotesUpdatePolicy";

describe("fork: release notes update policy", () => {
	it("does not reopen release notes when a buffered fork version reuses the same release notes content", () => {
		expect(
			getReleaseNotesUpdateState({
				currentVersion: "4.5.1000",
				currentReleaseNotesVersion: "4.5.0",
				lastSeenVersion: "4.5.0",
			})
		).toEqual({
			hasVersionChange: true,
			hasReleaseNotesChange: false,
			shouldShowReleaseNotes: false,
			nextLastSeenVersion: "4.5.1000",
			nextLastSeenReleaseNotesVersion: "4.5.0",
		});
	});

	it("shows release notes when the underlying release notes content changed", () => {
		expect(
			getReleaseNotesUpdateState({
				currentVersion: "4.6.1000",
				currentReleaseNotesVersion: "4.6.0",
				lastSeenVersion: "4.5.1000",
				lastSeenReleaseNotesVersion: "4.5.0",
			})
		).toEqual({
			hasVersionChange: true,
			hasReleaseNotesChange: true,
			shouldShowReleaseNotes: true,
			nextLastSeenVersion: "4.6.1000",
			nextLastSeenReleaseNotesVersion: "4.6.0",
		});
	});

	it("does not show release notes on first install", () => {
		expect(
			getReleaseNotesUpdateState({
				currentVersion: "4.5.1000",
				currentReleaseNotesVersion: "4.5.0",
			})
		).toEqual({
			hasVersionChange: false,
			hasReleaseNotesChange: true,
			shouldShowReleaseNotes: false,
			nextLastSeenVersion: "4.5.1000",
			nextLastSeenReleaseNotesVersion: "4.5.0",
		});
	});

	it("does not show release notes when neither the plugin version nor the content changed", () => {
		expect(
			getReleaseNotesUpdateState({
				currentVersion: "4.5.1000",
				currentReleaseNotesVersion: "4.5.0",
				lastSeenVersion: "4.5.1000",
				lastSeenReleaseNotesVersion: "4.5.0",
			})
		).toEqual({
			hasVersionChange: false,
			hasReleaseNotesChange: false,
			shouldShowReleaseNotes: false,
			nextLastSeenVersion: "4.5.1000",
			nextLastSeenReleaseNotesVersion: "4.5.0",
		});
	});
});
