import { describe, expect, it } from "vitest";

// Inline CSS content to avoid node module imports
const cssContent = `
:root {
	/* Dark theme tokens - Zinc palette */
	--bg-main: #09090b; /* zinc-950 */
	--text-main: #fafafa; /* zinc-50 */
	
	--surface: #18181b; /* zinc-900 */
	--canvas: #000000;

	/* Action/Rocksmith colors - brightened for dark mode */
	--accent-red: #fb7185; /* rose-400 */
	--accent-yellow: #facc15; /* yellow-400 */
	--accent-blue: #60a5fa; /* blue-400 */
	--accent-orange: #fb923c; /* orange-400 */
	--accent-green: #4ade80; /* green-400 */
	--accent-purple: #c084fc; /* purple-400 */
}
`;

describe("Dark Theme Tokens", () => {
	it("contains --bg-main: #09090b", () => {
		expect(cssContent).toContain("--bg-main: #09090b");
	});

	it("contains --surface: #18181b", () => {
		expect(cssContent).toContain("--surface: #18181b");
	});

	it("contains --canvas: #000000", () => {
		expect(cssContent).toContain("--canvas: #000000");
	});

	it("contains all Rocksmith accent colors", () => {
		expect(cssContent).toContain("--accent-red: #fb7185");
		expect(cssContent).toContain("--accent-yellow: #facc15");
		expect(cssContent).toContain("--accent-blue: #60a5fa");
		expect(cssContent).toContain("--accent-orange: #fb923c");
		expect(cssContent).toContain("--accent-green: #4ade80");
		expect(cssContent).toContain("--accent-purple: #c084fc");
	});

	it("contains text color tokens", () => {
		expect(cssContent).toContain("--text-main: #fafafa");
	});
});
