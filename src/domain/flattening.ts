import {
	beatDurationMs,
	type TabBar,
	type TabNote,
	type TabSong,
	type TabTrack,
} from "guitarpro-parser";
import type {
	HarmonyEvent,
	KeySignatureChange,
	Measure,
	NoteTechniques,
	PlaybackNote,
	Song,
	Track,
} from "./types";

/**
 * Intermediate structure holding a flattened track with its associated measures.
 */
type FlattenedTrack = {
	track: Track;
	measures: Measure[];
};

type ChordFormula = {
	intervals: number[];
	suffix: string;
	confidence: number;
};

const PITCH_CLASS_NAMES = [
	"C",
	"C#",
	"D",
	"Eb",
	"E",
	"F",
	"F#",
	"G",
	"Ab",
	"A",
	"Bb",
	"B",
] as const;

const CHORD_FORMULAS: ChordFormula[] = [
	{ intervals: [0, 4, 7, 11], suffix: "maj7", confidence: 0.99 },
	{ intervals: [0, 4, 7, 10], suffix: "7", confidence: 0.98 },
	{ intervals: [0, 3, 7, 10], suffix: "m7", confidence: 0.98 },
	{ intervals: [0, 3, 6, 10], suffix: "m7b5", confidence: 0.96 },
	{ intervals: [0, 3, 6, 9], suffix: "dim7", confidence: 0.96 },
	{ intervals: [0, 4, 7, 9], suffix: "6", confidence: 0.95 },
	{ intervals: [0, 3, 7, 9], suffix: "m6", confidence: 0.95 },
	{ intervals: [0, 2, 4, 7], suffix: "add9", confidence: 0.94 },
	{ intervals: [0, 2, 3, 7], suffix: "madd9", confidence: 0.94 },
	{ intervals: [0, 4, 8], suffix: "aug", confidence: 0.93 },
	{ intervals: [0, 3, 6], suffix: "dim", confidence: 0.93 },
	{ intervals: [0, 5, 7], suffix: "sus4", confidence: 0.92 },
	{ intervals: [0, 2, 7], suffix: "sus2", confidence: 0.92 },
	{ intervals: [0, 4, 7], suffix: "", confidence: 0.9 },
	{ intervals: [0, 3, 7], suffix: "m", confidence: 0.9 },
	{ intervals: [0, 7], suffix: "5", confidence: 0.82 },
];

const EXCLUDED_HARMONY_TRACK_PATTERN =
	/\b(drum|drums|perc|percussion|vocal|vocals|voice|vox|choir|mic|fx|sfx|noise|metronome|click)\b/i;

const INCLUDED_HARMONY_TRACK_PATTERN =
	/\b(guitar|gtr|bass|ukulele|uke|banjo|mandolin|string|acoustic|electric|lead|rhythm)\b/i;

const MAJOR_KEY_BY_ACCIDENTAL_COUNT = [
	"Cb",
	"Gb",
	"Db",
	"Ab",
	"Eb",
	"Bb",
	"F",
	"C",
	"G",
	"D",
	"A",
	"E",
	"B",
	"F#",
	"C#",
] as const;

const MINOR_KEY_BY_ACCIDENTAL_COUNT = [
	"Ab",
	"Eb",
	"Bb",
	"F",
	"C",
	"G",
	"D",
	"A",
	"E",
	"B",
	"F#",
	"C#",
	"G#",
	"D#",
	"A#",
] as const;

/**
 * Determines how many times a bar should be repeated during playback.
 * @param bar - The tab bar to evaluate
 * @returns The number of times the bar should be played
 */
const getRepeatCount = (bar: TabBar): number => {
	const repeatCount = (bar as TabBar & { repeatCount?: number }).repeatCount;
	return repeatCount ?? (bar.repeatEnd ? 2 : 1);
};

const buildTechniques = (note: TabNote): NoteTechniques => ({
	...(note.palmMute ? { isPalmMute: true } : {}),
	...(note.letRing ? { isLetRing: true } : {}),
	...(note.vibrato ? { vibrato: true } : {}),
	...(note.hammerOn ? { hammerOn: true } : {}),
	...(note.pullOff ? { pullOff: true } : {}),
	...(note.bend
		? {
				bend: {
					type: "normal",
					value: (note.bend.destination - note.bend.origin) / 4,
				},
			}
		: {}),
	...(note.slide
		? {
				slide: {
					type: note.slide > 0 ? "up" : "down",
				},
			}
		: {}),
});

const arraysEqual = (left: number[], right: number[]): boolean =>
	left.length === right.length &&
	left.every((value, index) => value === right[index]);

const getPitchClassName = (pitchClass: number): string =>
	PITCH_CLASS_NAMES[((pitchClass % 12) + 12) % 12] ?? "C";

const formatKeySignatureLabel = (
	accidentalCount: number,
	mode: "major" | "minor",
): string => {
	const index = accidentalCount + 7;
	const tonic =
		mode === "major"
			? MAJOR_KEY_BY_ACCIDENTAL_COUNT[index]
			: MINOR_KEY_BY_ACCIDENTAL_COUNT[index];

	return `${tonic ?? "C"} ${mode}`;
};

const appendKeySignatureChange = (
	keySignatures: KeySignatureChange[],
	measureIndex: number,
	startTime: number,
	keySignature: TabBar["keySignature"],
) => {
	if (!keySignature) {
		return;
	}

	const nextChange: KeySignatureChange = {
		measureIndex,
		startTime,
		label: formatKeySignatureLabel(
			keySignature.accidentalCount,
			keySignature.mode,
		),
		accidentalCount: keySignature.accidentalCount,
		mode: keySignature.mode,
	};
	const previousChange = keySignatures[keySignatures.length - 1];

	if (
		previousChange?.accidentalCount === nextChange.accidentalCount &&
		previousChange.mode === nextChange.mode
	) {
		return;
	}

	keySignatures.push(nextChange);
};

const serializeKeySignatureChanges = (keySignatures: KeySignatureChange[]) =>
	keySignatures
		.map((keySignature) => `${keySignature.measureIndex}:${keySignature.label}`)
		.join("|");

const inferHarmonyEvent = (
	attackNotes: PlaybackNote[],
	startTime: number,
): HarmonyEvent | null => {
	if (attackNotes.length < 2) {
		return null;
	}

	const pitchClasses = Array.from(
		new Set(attackNotes.map((note) => ((note.pitch % 12) + 12) % 12)),
	).sort((left, right) => left - right);

	if (pitchClasses.length < 2) {
		return null;
	}

	const bassPitchClass =
		attackNotes.reduce(
			(lowest, note) => (note.pitch < lowest.pitch ? note : lowest),
			attackNotes[0],
		).pitch % 12;

	for (const formula of CHORD_FORMULAS) {
		for (const root of pitchClasses) {
			const intervals = pitchClasses
				.map((pitchClass) => (pitchClass - root + 12) % 12)
				.sort((left, right) => left - right);

			if (!arraysEqual(intervals, formula.intervals)) {
				continue;
			}

			const bass = (bassPitchClass + 12) % 12;
			const rootName = getPitchClassName(root);
			const bassName = getPitchClassName(bass);
			const label =
				bass === root
					? `${rootName}${formula.suffix}`
					: `${rootName}${formula.suffix}/${bassName}`;

			return {
				startTime,
				duration: Math.max(...attackNotes.map((note) => note.duration)),
				label,
				root,
				bass: bass === root ? undefined : bass,
				pitchClasses,
				anchorString: Math.min(...attackNotes.map((note) => note.string)),
				confidence: formula.confidence,
				source: "inferred",
			};
		}
	}

	return null;
};

const shouldInferHarmony = (tabTrack: TabTrack): boolean => {
	const searchableLabel = [
		tabTrack.name,
		tabTrack.shortName,
		tabTrack.instrument ?? "",
	].join(" ");

	if (EXCLUDED_HARMONY_TRACK_PATTERN.test(searchableLabel)) {
		return false;
	}

	if (INCLUDED_HARMONY_TRACK_PATTERN.test(searchableLabel)) {
		return true;
	}

	return tabTrack.tuningMidi.length >= 4 && tabTrack.tuningMidi.length <= 8;
};

/**
 * Converts a Guitar Pro tab file (TabSong) into our internal Song format.
 *
 * This function flattens the hierarchical Guitar Pro data into a simple array
 * of `PlaybackNote` objects that are easier to process for both audio playback
 * and visual rendering. It handles:
 * - Bar repetitions (repeat signs)
 * - Tie notes (connecting sustain between notes)
 * - Capo transposition
 * - Various playing techniques (bends, slides, hammer-ons, pull-offs, etc.)
 *
 * @param tabSong - The parsed Guitar Pro file data from guitarpro-parser
 * @returns A normalized Song object suitable for playback and rendering
 */
export function flattenSong(tabSong: TabSong): Song {
	const flattenedTracks: FlattenedTrack[] = tabSong.tracks.map((tabTrack) => {
		const notes: PlaybackNote[] = [];
		const harmonyEvents: HarmonyEvent[] = [];
		const keySignatures: KeySignatureChange[] = [];
		const measures: Measure[] = [];
		const lastNoteByString = new Map<number, PlaybackNote>();
		const canInferHarmony = shouldInferHarmony(tabTrack);
		let currentTime = 0;
		let i = 0;
		let repeatStartIndex = 0;
		const bars = tabTrack.bars;
		const processedRepeatCounts = bars.map(() => 0);

		while (i < bars.length) {
			const bar = bars[i];
			if (bar.repeatStart) {
				repeatStartIndex = i;
			}

			let barDuration = 0;
			for (const beat of bar.beats) {
				barDuration += beatDurationMs(beat) / 1000;
			}

			measures.push({
				index: measures.length,
				startTime: currentTime,
				duration: barDuration,
				timeSignature: bar.timeSignature,
			});
			appendKeySignatureChange(
				keySignatures,
				measures.length - 1,
				currentTime,
				bar.keySignature,
			);

			for (const beat of bar.beats) {
				const duration = beatDurationMs(beat) / 1000;
				const attackNotes: PlaybackNote[] = [];

				if (!beat.isRest) {
					for (const note of beat.notes) {
						const basePitch = tabTrack.tuningMidi[note.string] || 0;
						const pitch = basePitch + note.fret + (tabTrack.capoFret || 0);

						if (note.tie.destination) {
							const previousNote = lastNoteByString.get(note.string);
							if (
								previousNote &&
								Math.abs(
									previousNote.startTime + previousNote.duration - currentTime,
								) < 0.01
							) {
								previousNote.duration += duration;
								lastNoteByString.set(note.string, previousNote);
								continue;
							}
						}

						const playbackNote: PlaybackNote = {
							trackId: String(tabTrack.id),
							pitch,
							startTime: currentTime,
							duration,
							string: note.string,
							fret: note.fret,
							techniques: buildTechniques(note),
						};

						notes.push(playbackNote);
						attackNotes.push(playbackNote);
						lastNoteByString.set(note.string, playbackNote);
					}
				}

				if (canInferHarmony) {
					const harmonyEvent = inferHarmonyEvent(attackNotes, currentTime);
					if (harmonyEvent) {
						harmonyEvents.push(harmonyEvent);
					}
				}

				currentTime += duration;
			}

			processedRepeatCounts[i]++;
			const targetRepeats = getRepeatCount(bar);

			if (bar.repeatEnd && processedRepeatCounts[i] < targetRepeats) {
				i = repeatStartIndex;
			} else {
				i++;
			}
		}

		return {
			track: {
				id: tabTrack.id,
				name: tabTrack.name,
				tuning: tabTrack.tuningMidi,
				keySignatures,
				notes,
				harmonyEvents,
			},
			measures,
		};
	});

	const tracks = flattenedTracks.map(({ track }) => track);
	const measures = flattenedTracks[0]?.measures ?? [];
	const distinctTrackKeyMaps = Array.from(
		new Set(
			tracks.map((track) =>
				serializeKeySignatureChanges(track.keySignatures ?? []),
			),
		),
	);
	const songKeySignatures =
		distinctTrackKeyMaps.length <= 1
			? (tracks[0]?.keySignatures ?? [])
			: Array.from(
					new Map(
						tracks.flatMap((track) =>
							(track.keySignatures ?? []).map((keySignature) => [
								`${track.id}:${keySignature.measureIndex}:${keySignature.label}`,
								keySignature,
							]),
						),
					).values(),
				).sort(
					(left, right) =>
						left.startTime - right.startTime ||
						left.measureIndex - right.measureIndex ||
						left.label.localeCompare(right.label),
				);

	const durationSeconds = tracks.reduce((max, track) => {
		const lastNote = track.notes[track.notes.length - 1];
		if (!lastNote) return max;
		return Math.max(max, lastNote.startTime + lastNote.duration);
	}, 0);

	return {
		metadata: {
			title: tabSong.title || "Untitled",
			artist: tabSong.artist || "Unknown Artist",
			album: tabSong.album || "",
		},
		keySignatures: songKeySignatures,
		keySignaturesVaryByTrack: distinctTrackKeyMaps.length > 1,
		tracks,
		measures,
		durationSeconds,
	};
}
