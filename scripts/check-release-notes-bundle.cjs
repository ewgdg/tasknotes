const fs = require("fs");
const path = require("path");

const rootDir = process.cwd();
const manifestPath = path.join(rootDir, "manifest.json");
const releaseNotesPath = path.join(rootDir, "src", "releaseNotes.ts");

const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
const releaseNotesSource = fs.readFileSync(releaseNotesPath, "utf8");

const currentVersionMatch = releaseNotesSource.match(/export const CURRENT_VERSION = "([^"]+)";/);
if (!currentVersionMatch) {
	console.error("Release notes bundle is missing CURRENT_VERSION");
	process.exit(1);
}

const currentReleaseNotesVersionMatch = releaseNotesSource.match(
	/export const CURRENT_RELEASE_NOTES_VERSION = "([^"]+)";/
);
if (!currentReleaseNotesVersionMatch) {
	console.error("Release notes bundle is missing CURRENT_RELEASE_NOTES_VERSION");
	process.exit(1);
}

if (currentVersionMatch[1] !== manifest.version) {
	console.error(
		`Release notes bundle version mismatch: expected ${manifest.version}, got ${currentVersionMatch[1]}`
	);
	process.exit(1);
}

if (!releaseNotesSource.includes(`version: "${manifest.version}"`)) {
	console.error(`Release notes bundle does not include an entry for ${manifest.version}`);
	process.exit(1);
}

if (!releaseNotesSource.includes("isCurrent: true")) {
	console.error("Release notes bundle does not mark any entry as current");
	process.exit(1);
}

console.log(
	`Release notes bundle verified for ${manifest.version} using release notes ${currentReleaseNotesVersionMatch[1]}`
);
