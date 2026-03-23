import { beatDurationMs, type TabSong } from "guitarpro-parser";
import type { Measure, PlaybackNote, Song, Track } from "./types";

export function flattenSong(tabSong: TabSong): Song {
	const tracks: Track[] = tabSong.tracks.map((tabTrack) => {
		const notes: PlaybackNote[] = [];
		const measures: Measure[] = [];
		let currentTime = 0;

		// Repeat tracking
		let i = 0;
		let repeatStartIndex = 0;
		const bars = tabTrack.bars;
		const processedRepeatCounts = bars.map(() => 0);

		while (i < bars.length) {
			const bar = bars[i];
			if (bar.repeatStart) {
				repeatStartIndex = i;
			}

			// Record measure info (only for the first track to avoid duplication in Song)
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

			// Flatten notes
			for (const beat of bar.beats) {
				const duration = beatDurationMs(beat) / 1000;

				if (!beat.isRest) {
					for (const note of beat.notes) {
						// Calculate MIDI pitch: string tuning + fret + capo
						// Note: guitarpro-parser tuningMidi is indexed [stringIndex]
						const basePitch = tabTrack.tuningMidi[note.string] || 0;
						const pitch = basePitch + note.fret + (tabTrack.capoFret || 0);

						// Handle tied notes: if this note is a tie destination, find the previous note on the same string
						if (note.tie.destination) {
							const previousNote = notes
								.slice()
								.reverse()
								.find((n) => n.string === note.string);
							if (
								previousNote &&
								Math.abs(
									previousNote.startTime + previousNote.duration - currentTime,
								) < 0.01
							) {
								previousNote.duration += duration;
								continue;
							}
						}

						notes.push({
							pitch,
							startTime: currentTime,
							duration,
							string: note.string,
							fret: note.fret,
							techniques: {
								isPalmMute: note.palmMute,
								isLetRing: note.letRing,
								vibrato: !!note.vibrato,
								hammerOn: note.hammerOn,
								pullOff: note.pullOff,
							},
						});
					}
				}
				currentTime += duration;
			}

			// Handle repeats
			processedRepeatCounts[i]++;
			const targetRepeats = (bar as any).repeatCount || (bar.repeatEnd ? 2 : 1);

			if (bar.repeatEnd && processedRepeatCounts[i] < targetRepeats) {
				i = repeatStartIndex;
			} else {
				i++;
			}
		}

		return {
			id: tabTrack.id,
			name: tabTrack.name,
			tuning: tabTrack.tuningMidi,
			notes,
			_measures: measures, // Temporary internal storage to aggregate later
		} as Track & { _measures: Measure[] };
	});

	// Global measures are derived from the first track (they should be identical across tracks in GP)
	const measures = tracks.length > 0 ? (tracks[0] as any)._measures || [] : [];

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
		tracks,
		measures,
		durationSeconds,
	};
}
