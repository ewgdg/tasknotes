function parseVersion(version) {
	const match = version.match(/^(\d+)\.(\d+)\.(\d+)(?:-[\w.]+)?$/);
	if (!match) return null;
	return {
		major: parseInt(match[1], 10),
		minor: parseInt(match[2], 10),
		patch: parseInt(match[3], 10),
		full: version,
	};
}

function compareParsedVersions(a, b) {
	if (a.major !== b.major) return a.major - b.major;
	if (a.minor !== b.minor) return a.minor - b.minor;
	return a.patch - b.patch;
}

function resolveReleaseNotesVersion(currentVersion, availableVersions) {
	const current = parseVersion(currentVersion);
	if (!current) return null;

	const parsedVersions = availableVersions
		.map((version) => parseVersion(version))
		.filter(Boolean)
		.sort((left, right) => compareParsedVersions(right, left));

	if (parsedVersions.some((version) => version.full === currentVersion)) {
		return currentVersion;
	}

	const matchingMinorVersion = parsedVersions.find((version) => {
		return (
			version.major === current.major &&
			version.minor === current.minor &&
			compareParsedVersions(version, current) <= 0
		);
	});
	if (matchingMinorVersion) {
		return matchingMinorVersion.full;
	}

	const latestOlderVersion = parsedVersions.find(
		(version) => compareParsedVersions(version, current) <= 0
	);
	return latestOlderVersion ? latestOlderVersion.full : null;
}

module.exports = {
	compareParsedVersions,
	parseVersion,
	resolveReleaseNotesVersion,
};
