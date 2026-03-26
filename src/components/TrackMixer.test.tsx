import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { Track } from "../domain/types";
import { TrackMixer } from "./TrackMixer";

const mockTracks: Track[] = [
	{ id: "t1", name: "Guitar", tuning: [], notes: [] },
	{ id: "t2", name: "Bass", tuning: [], notes: [] },
];

// Mock ResizeObserver for Radix UI Slider
if (typeof global.ResizeObserver === "undefined") {
	global.ResizeObserver = class ResizeObserver {
		observe() {}
		unobserve() {}
		disconnect() {}
	};
}

describe("TrackMixer", () => {
	afterEach(cleanup);

	it("renders all track names", () => {
		render(
			<TrackMixer
				tracks={mockTracks}
				selectedTrackIndex={0}
				onTrackChange={vi.fn()}
				trackMutes={{ t1: false, t2: false }}
				onTrackMuteToggle={vi.fn()}
				soloActive={false}
				onSoloToggle={vi.fn()}
				backingTracksVolume={0.8}
				onBackingTracksVolumeChange={vi.fn()}
			/>,
		);

		expect(screen.getByText("Guitar")).toBeTruthy();
		expect(screen.getByText("Bass")).toBeTruthy();
	});

	it("calls onTrackChange when a track block is clicked", () => {
		const onTrackChange = vi.fn();
		render(
			<TrackMixer
				tracks={mockTracks}
				selectedTrackIndex={0}
				onTrackChange={onTrackChange}
				trackMutes={{ t1: false, t2: false }}
				onTrackMuteToggle={vi.fn()}
				soloActive={false}
				onSoloToggle={vi.fn()}
				backingTracksVolume={0.8}
				onBackingTracksVolumeChange={vi.fn()}
			/>,
		);

		fireEvent.click(screen.getByText("Bass"));
		expect(onTrackChange).toHaveBeenCalledWith(1);
	});

	it("calls onTrackMuteToggle when mute button is clicked", () => {
		const onTrackMuteToggle = vi.fn();
		render(
			<TrackMixer
				tracks={mockTracks}
				selectedTrackIndex={0}
				onTrackChange={vi.fn()}
				trackMutes={{ t1: false, t2: false }}
				onTrackMuteToggle={onTrackMuteToggle}
				soloActive={false}
				onSoloToggle={vi.fn()}
				backingTracksVolume={0.8}
				onBackingTracksVolumeChange={vi.fn()}
			/>,
		);

		const muteButton = screen.getByLabelText("Mute track 1: Guitar");
		fireEvent.click(muteButton);
		expect(onTrackMuteToggle).toHaveBeenCalledWith("t1");
	});

	it("disables mute button when soloActive is true", () => {
		render(
			<TrackMixer
				tracks={mockTracks}
				selectedTrackIndex={0}
				onTrackChange={vi.fn()}
				trackMutes={{ t1: false, t2: false }}
				onTrackMuteToggle={vi.fn()}
				soloActive={true}
				onSoloToggle={vi.fn()}
				backingTracksVolume={0.8}
				onBackingTracksVolumeChange={vi.fn()}
			/>,
		);

		const muteButton = screen.getByLabelText(
			"Mute disabled for track 1: Guitar while solo mode is active",
		);
		expect(muteButton.hasAttribute("disabled")).toBe(true);
	});

	it("gives mute buttons unique accessible names even when track names repeat", () => {
		const duplicateTracks: Track[] = [
			{ id: "t1", name: "Guitar", tuning: [], notes: [] },
			{ id: "t2", name: "Guitar", tuning: [], notes: [] },
		];

		render(
			<TrackMixer
				tracks={duplicateTracks}
				selectedTrackIndex={0}
				onTrackChange={vi.fn()}
				trackMutes={{ t1: false, t2: false }}
				onTrackMuteToggle={vi.fn()}
				soloActive={false}
				onSoloToggle={vi.fn()}
				backingTracksVolume={0.8}
				onBackingTracksVolumeChange={vi.fn()}
			/>,
		);

		expect(screen.getByLabelText("Mute track 1: Guitar")).toBeTruthy();
		expect(screen.getByLabelText("Mute track 2: Guitar")).toBeTruthy();
	});

	it("calls onSoloToggle when solo button is clicked", () => {
		const onSoloToggle = vi.fn();
		render(
			<TrackMixer
				tracks={mockTracks}
				selectedTrackIndex={0}
				onTrackChange={vi.fn()}
				trackMutes={{ t1: false, t2: false }}
				onTrackMuteToggle={vi.fn()}
				soloActive={false}
				onSoloToggle={onSoloToggle}
				backingTracksVolume={0.8}
				onBackingTracksVolumeChange={vi.fn()}
			/>,
		);

		fireEvent.click(screen.getByText(/Solo Mode OFF/i));
		expect(onSoloToggle).toHaveBeenCalledOnce();
	});

	it("toggles collapse state", () => {
		render(
			<TrackMixer
				tracks={mockTracks}
				selectedTrackIndex={0}
				onTrackChange={vi.fn()}
				trackMutes={{ t1: false, t2: false }}
				onTrackMuteToggle={vi.fn()}
				soloActive={false}
				onSoloToggle={vi.fn()}
				backingTracksVolume={0.8}
				onBackingTracksVolumeChange={vi.fn()}
			/>,
		);

		expect(screen.getByText("Guitar")).toBeTruthy();
		fireEvent.click(screen.getByText(/Collapse/i));
		expect(screen.queryByText("Guitar")).toBeNull();
		fireEvent.click(screen.getByText(/Show/i));
		expect(screen.getByText("Guitar")).toBeTruthy();
	});

	it("renders a backing tracks volume slider", () => {
		const onBackingTracksVolumeChange = vi.fn();
		render(
			<TrackMixer
				tracks={mockTracks}
				selectedTrackIndex={0}
				onTrackChange={vi.fn()}
				trackMutes={{ t1: false, t2: false }}
				onTrackMuteToggle={vi.fn()}
				soloActive={false}
				onSoloToggle={vi.fn()}
				backingTracksVolume={0.5}
				onBackingTracksVolumeChange={onBackingTracksVolumeChange}
			/>,
		);

		expect(
			screen.getAllByLabelText("Backing Tracks Volume").length,
		).toBeGreaterThan(0);
	});
});
