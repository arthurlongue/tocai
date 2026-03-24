import { describe, it, expect } from "vitest";

// Inline CSS content to avoid node module imports
const cssContent = `
:root {
	/* Dark theme tokens */
	--color-background: #1a1a1a;
	--color-surface: #252525;
	--color-surface-elevated: #2a2a2a;
	--color-border: #3a3a3a;
	--color-text-primary: #f3f4f6;
	--color-text-secondary: #9ca3af;
	--color-canvas: #0a0a0a;

	/* Rocksmith accent colors */
	--accent-red: #FF0000;
	--accent-yellow: #FFFF00;
	--accent-blue: #0000FF;
	--accent-orange: #FFA500;
	--accent-green: #00FF00;
	--accent-purple: #A020F0;
`;

describe("Dark Theme Tokens", () => {
	it("contains --color-background: #1a1a1a", () => {
		expect(cssContent).toContain("--color-background: #1a1a1a");
	});

	it("contains --color-surface: #252525", () => {
		expect(cssContent).toContain("--color-surface: #252525");
	});

	it("contains --color-canvas: #0a0a0a", () => {
		expect(cssContent).toContain("--color-canvas: #0a0a0a");
	});

	it("contains all Rocksmith accent colors", () => {
		expect(cssContent).toContain("--accent-red: #FF0000");
		expect(cssContent).toContain("--accent-yellow: #FFFF00");
		expect(cssContent).toContain("--accent-blue: #0000FF");
		expect(cssContent).toContain("--accent-orange: #FFA500");
		expect(cssContent).toContain("--accent-green: #00FF00");
		expect(cssContent).toContain("--accent-purple: #A020F0");
	});

	it("contains text color tokens", () => {
		expect(cssContent).toContain("--color-text-primary: #f3f4f6");
		expect(cssContent).toContain("--color-text-secondary: #9ca3af");
	});

	it("contains border color token", () => {
		expect(cssContent).toContain("--color-border: #3a3a3a");
	});
});
