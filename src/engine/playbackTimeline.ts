import * as Tone from "tone";

type PlaybackTimelineState = {
	anchorSongSeconds: number;
	anchorTransportSeconds: number;
	speed: number;
};

const state: PlaybackTimelineState = {
	anchorSongSeconds: 0,
	anchorTransportSeconds: 0,
	speed: 1,
};

const clampSongSeconds = (seconds: number): number => Math.max(0, seconds);

export const getPlaybackTimelineTime = (
	rawTransportSeconds: number = Tone.getTransport().seconds,
): number => {
	const elapsedTransportSeconds =
		rawTransportSeconds - state.anchorTransportSeconds;
	return clampSongSeconds(
		state.anchorSongSeconds + elapsedTransportSeconds * state.speed,
	);
};

export const setPlaybackTimelineSpeed = (
	speed: number,
	rawTransportSeconds: number = Tone.getTransport().seconds,
): void => {
	state.anchorSongSeconds = getPlaybackTimelineTime(rawTransportSeconds);
	state.anchorTransportSeconds = rawTransportSeconds;
	state.speed = speed;
};

export const syncPlaybackTimeline = (
	songSeconds: number,
	rawTransportSeconds: number = Tone.getTransport().seconds,
): void => {
	state.anchorSongSeconds = clampSongSeconds(songSeconds);
	state.anchorTransportSeconds = rawTransportSeconds;
};

export const resetPlaybackTimelineState = (): void => {
	state.anchorSongSeconds = 0;
	state.anchorTransportSeconds = 0;
	state.speed = 1;
};
