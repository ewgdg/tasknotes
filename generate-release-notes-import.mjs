import { readFileSync, writeFileSync, readdirSync } from "fs";
import { execSync } from "child_process";
import releaseNotesUtils from "./scripts/release-notes-utils.cjs";

const { parseVersion, resolveReleaseNotesVersion } = releaseNotesUtils;

// Read current version from manifest.json
const manifest = JSON.parse(readFileSync("manifest.json", "utf8"));
const currentVersion = manifest.version;

// Get git tag date for a version
function getVersionDate(version) {
	try {
		const output = execSync(`git log -1 --format=%aI ${version}`, {
			encoding: 'utf8',
			stdio: ['ignore', 'pipe', 'ignore'],
		}).trim();
		return output;
	} catch (error) {
		// If tag doesn't exist, return null
		return null;
	}
}

// Get all release note files and bundle versions since last minor (includes pre-release versions)
const releaseFiles = readdirSync("docs/releases")
	.filter(f => f.match(/^\d+\.\d+\.\d+(?:-[\w.]+)?\.md$/))
	.map(f => f.replace('.md', ''))
	.map(v => parseVersion(v))
	.filter(v => v !== null)
	.sort((a, b) => {
		if (a.major !== b.major) return b.major - a.major;
		if (a.minor !== b.minor) return b.minor - a.minor;
		return b.patch - a.patch;
	});

const current = parseVersion(currentVersion);
if (!current) {
	console.error(`Invalid version format: ${currentVersion}`);
	process.exit(1);
}

const resolvedCurrentReleaseNotesVersion = resolveReleaseNotesVersion(
	currentVersion,
	releaseFiles.map((version) => version.full)
);
if (!resolvedCurrentReleaseNotesVersion) {
	console.error(`No release notes found for ${currentVersion} or any earlier compatible version`);
	process.exit(1);
}

const releaseNotesSource = parseVersion(resolvedCurrentReleaseNotesVersion);
if (!releaseNotesSource) {
	console.error(`Invalid fallback release notes version: ${resolvedCurrentReleaseNotesVersion}`);
	process.exit(1);
}

// Bundle notes from the source minor series so buffered fork releases inherit the latest upstream notes.
const currentMinorVersions = releaseFiles.filter(v =>
	v.major === releaseNotesSource.major && v.minor === releaseNotesSource.minor
);

const previousMinorVersions = releaseFiles.filter(v =>
	v.major === releaseNotesSource.major && v.minor === releaseNotesSource.minor - 1
);

const versionsToBundle = [
	...new Set([
		resolvedCurrentReleaseNotesVersion,
		...currentMinorVersions.map(v => v.full),
		...previousMinorVersions.map(v => v.full)
	])
];

const versionsWithDates = versionsToBundle.map((version) => {
	const usesFallbackContent = version === resolvedCurrentReleaseNotesVersion && version !== currentVersion;
	const displayVersion = usesFallbackContent ? currentVersion : version;
	const date = getVersionDate(displayVersion) ?? getVersionDate(version);

	return {
		version,
		displayVersion,
		date,
		isCurrent: displayVersion === currentVersion
	};
}).sort((a, b) => {
	// Versions without dates go to the end
	if (!a.date && !b.date) return 0;
	if (!a.date) return 1;
	if (!b.date) return -1;
	// Sort by date descending (newest first)
	return new Date(b.date).getTime() - new Date(a.date).getTime();
});

// Generate imports and metadata
const imports = versionsWithDates.map(({ version }, index) =>
	`import releaseNotes${index} from "../docs/releases/${version}.md";`
).join('\n');

const releaseNotesArray = versionsWithDates.map(({ displayVersion, date, isCurrent }, index) => {
	return `	{
		version: "${displayVersion}",
		content: releaseNotes${index},
		date: ${date ? `"${date}"` : 'null'},
		isCurrent: ${isCurrent}
	}`;
}).join(',\n');

// Generate the TypeScript file
const content = `// Auto-generated file - do not edit manually
// This file is regenerated during the build process to bundle release notes

${imports}

export interface ReleaseNoteVersion {
	version: string;
	content: string;
	date: string | null;
	isCurrent: boolean;
}

export const CURRENT_VERSION = "${currentVersion}";
export const CURRENT_RELEASE_NOTES_VERSION = "${resolvedCurrentReleaseNotesVersion}";
export const RELEASE_NOTES_BUNDLE: ReleaseNoteVersion[] = [
${releaseNotesArray}
];
`;

// Write to src/releaseNotes.ts
writeFileSync("src/releaseNotes.ts", content);

console.log(`✓ Generated release notes bundle for version ${currentVersion}`);
if (resolvedCurrentReleaseNotesVersion !== currentVersion) {
	console.log(`  Using release notes from ${resolvedCurrentReleaseNotesVersion} for current version ${currentVersion}`);
}
console.log(`  Bundled versions: ${versionsToBundle.join(', ')}`);
