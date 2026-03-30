const {
	parseVersion,
	resolveReleaseNotesVersion,
} = require("../../../scripts/release-notes-utils.cjs");

describe("fork: release notes resolver", () => {
	it("uses the exact release notes document when it exists", () => {
		expect(
			resolveReleaseNotesVersion("4.5.0", ["4.4.0", "4.5.0", "4.3.3"])
		).toBe("4.5.0");
	});

	it("falls back to the latest release notes in the same minor series for patch-buffer fork tags", () => {
		expect(
			resolveReleaseNotesVersion("4.5.1000", ["4.4.0", "4.5.0", "4.5.1"])
		).toBe("4.5.1");
	});

	it("falls back to the latest older release notes when the current minor has no matching docs", () => {
		expect(
			resolveReleaseNotesVersion("4.6.1000", ["4.4.0", "4.5.0", "4.5.1"])
		).toBe("4.5.1");
	});

	it("returns null when no release notes are available", () => {
		expect(resolveReleaseNotesVersion("4.5.1000", [])).toBeNull();
	});

	it("parses numeric semver segments while preserving the full version string", () => {
		expect(parseVersion("4.5.1000")).toEqual({
			major: 4,
			minor: 5,
			patch: 1000,
			full: "4.5.1000",
		});
	});
});
