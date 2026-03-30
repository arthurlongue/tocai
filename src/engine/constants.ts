/**
 * Default synthesizer settings for plucked string sounds.
 * Uses a triangle oscillator with a quick attack and moderate sustain.
 * Note: Typed as RecursivePartial<SynthOptions> from Tone.js for flexibility.
 */
export const DEFAULT_SYNTH_SETTINGS = {
	oscillator: {
		type: "triangle",
	},
	envelope: {
		attack: 0.005,
		decay: 0.3,
		sustain: 0.2,
		release: 0.8,
	},
} as const;

/** Standard number of strings for a guitar (EADGBE tuning). */
export const STRING_COUNT = 6;

/**
 * Horizontal scrolling speed in pixels per second.
 * Controls how fast notes move across the screen during playback.
 */
export const PIXELS_PER_SECOND = 200;
/**
 * X-coordinate of the vertical hit line where notes should be played.
 * Notes approach this line from the right during playback.
 */
export const HIT_LINE_X = 100;
/** Height of each string lane in pixels. */
export const LANE_HEIGHT = 40;

// Note shape: rounded rectangle dimensions
/** Width of note fret numbers in pixels. */
export const NOTE_WIDTH = 36;
/** Height of note fret numbers in pixels. */
export const NOTE_HEIGHT = 26;
/** Corner radius for rounded note rectangles. */
export const NOTE_CORNER_RADIUS = 6;

/** Keep for any tests that reference this */
export const NOTE_RADIUS = NOTE_HEIGHT / 2;

/**
 * High-contrast color palette for each guitar string.
 * Uses Rocksmith-style vibrant colors that are WCAG AA compliant against dark backgrounds.
 * Index 0 = String 6 (low E), Index 5 = String 1 (high E).
 */
export const STRING_COLORS = [
	"#FF4C4C", // String 6 - E low  (vivid red)
	"#FFD700", // String 5 - A       (gold)
	"#4DB8FF", // String 4 - D       (sky blue)
	"#FF8C00", // String 3 - G       (dark orange)
	"#4DFF91", // String 2 - B       (bright green)
	"#CF7CFF", // String 1 - E high  (light violet)
];

/** Alpha value for note tail gradient (semi-transparent). */
export const NOTE_TAIL_ALPHA = 0.45;
