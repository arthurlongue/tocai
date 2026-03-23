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
export const NOTE_RADIUS = 15;

export const STRING_COLORS = [
	"#FF0000", // Red (String 6 - E low)
	"#FFFF00", // Yellow (String 5 - A)
	"#0000FF", // Blue (String 4 - D)
	"#FFA500", // Orange (String 3 - G)
	"#00FF00", // Green (String 2 - B)
	"#A020F0", // Purple (String 1 - E high)
];
