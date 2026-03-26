import { beatDurationMs, type TabBar, type TabSong } from "guitarpro-parser";
import type { Measure, PlaybackNote, Song, Track } from "./types";

type FlattenedTrack = {
	track: Track;
	measures: Measure[];
};

const getRepeatCount = (bar: TabBar): number => {
	const repeatCount = (bar as TabBar & { repeatCount?: number }).repeatCount;
	return repeatCount ?? (bar.repeatEnd ? 2 : 1);
};

export function flattenSong(tabSong: TabSong): Song {
	const flattenedTracks: FlattenedTrack[] = tabSong.tracks.map((tabTrack) => {
		const notes: PlaybackNote[] = [];
		const measures: Measure[] = [];
		const lastNoteByString = new Map<number, PlaybackNote>();
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

			for (const beat of bar.beats) {
				const duration = beatDurationMs(beat) / 1000;

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
							techniques: {
								isPalmMute: note.palmMute,
								isLetRing: note.letRing,
								vibrato: !!note.vibrato,
								hammerOn: note.hammerOn,
								pullOff: note.pullOff,
							},
						};

						notes.push(playbackNote);
						lastNoteByString.set(note.string, playbackNote);
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
				notes,
			},
			measures,
		};
	});

	const tracks = flattenedTracks.map(({ track }) => track);
	const measures = flattenedTracks[0]?.measures ?? [];

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
