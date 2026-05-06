import fs from "fs";
import path from "path";

const manifest = JSON.parse(
	fs.readFileSync(path.join(process.cwd(), "manifest.json"), "utf8")
);

describe("fork: manifest identity", () => {
	it("uses a fork-specific plugin ID so Obsidian updater cannot confuse it with upstream", () => {
		expect(manifest.id).toBe("tasknotes-fork");
		expect(manifest.id).not.toBe("tasknotes");
	});
});
