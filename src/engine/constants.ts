// biome-ignore lint/suspicious/noExplicitAny: Tone.js RecursivePartial<SynthOptions> is not easily typed without literals
export const DEFAULT_SYNTH_SETTINGS: any = {
	oscillator: {
		type: "triangle",
	},
	envelope: {
		attack: 0.005,
		decay: 0.3,
		sustain: 0.2,
		release: 0.8,
	},
};

export const STRING_COUNT = 6;

export const PIXELS_PER_SECOND = 200;
export const HIT_LINE_X = 100;
export const LANE_HEIGHT = 40;

// Note shape: rounded rectangle dimensions
export const NOTE_WIDTH = 36;
export const NOTE_HEIGHT = 26;
export const NOTE_CORNER_RADIUS = 6;

// Keep for any tests that reference this
export const NOTE_RADIUS = NOTE_HEIGHT / 2;

// High-contrast Rocksmith-style colors, vibrant & WCAG AA against dark backgrounds
export const STRING_COLORS = [
	"#FF4C4C", // String 6 - E low  (vivid red)
	"#FFD700", // String 5 - A       (gold)
	"#4DB8FF", // String 4 - D       (sky blue)
	"#FF8C00", // String 3 - G       (dark orange)
	"#4DFF91", // String 2 - B       (bright green)
	"#CF7CFF", // String 1 - E high  (light violet)
];

// Semi-transparent tail color (same hue as note but muted)
export const NOTE_TAIL_ALPHA = 0.45;
