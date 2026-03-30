import {
	cleanup,
	fireEvent,
	render,
	screen,
	waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import App from "./App";
import type { Song } from "./domain/types";

const {
	mockEngine,
	mockEngineReset,
	mockEngineLoadSong,
	mockEngineSetTrackVolume,
	mockEngineSetTrackMute,
	mockEngineSetSolo,
	mockSetSpeed,
	mockResetSpeed,
	mockSeek,
	mockGetCurrentSongName,
	mockGetSong,
	mockSetCurrentSong,
	mixedKeySong,
	testSong,
} = vi.hoisted(() => {
	const song: Song = {
		metadata: {
			title: "Regression Test Song",
			artist: "Test Artist",
			album: "Test Album",
		},
		keySignatures: [
			{
				measureIndex: 0,
				startTime: 0,
				label: "C major",
				accidentalCount: 0,
				mode: "major",
			},
		],
		keySignaturesVaryByTrack: false,
		tracks: [
			{
				id: "track-1",
				name: "Guitar",
				tuning: [64, 59, 55, 50, 45, 40],
				keySignatures: [
					{
						measureIndex: 0,
						startTime: 0,
						label: "C major",
						accidentalCount: 0,
						mode: "major",
					},
				],
				notes: [],
			},
		],
		measures: [],
		durationSeconds: 120,
	};
	const multiTrackSong: Song = {
		...song,
		keySignatures: [
			{
				measureIndex: 0,
				startTime: 0,
				label: "C major",
				accidentalCount: 0,
				mode: "major",
			},
			{
				measureIndex: 0,
				startTime: 0,
				label: "E minor",
				accidentalCount: 1,
				mode: "minor",
			},
		],
		keySignaturesVaryByTrack: true,
		tracks: [
			song.tracks[0],
			{
				id: "track-2",
				name: "Lead Guitar",
				tuning: [52, 57, 62, 67],
				keySignatures: [
					{
						measureIndex: 0,
						startTime: 0,
						label: "E minor",
						accidentalCount: 1,
						mode: "minor",
					},
				],
				notes: [],
			},
		],
	};

	return {
		mockEngine: {
			reset: vi.fn(),
			loadSong: vi.fn(),
			setTrackVolume: vi.fn(),
			setTrackMute: vi.fn(),
			setSolo: vi.fn(),
		},
		mockEngineReset: vi.fn(),
		mockEngineLoadSong: vi.fn(),
		mockEngineSetTrackVolume: vi.fn(),
		mockEngineSetTrackMute: vi.fn(),
		mockEngineSetSolo: vi.fn(),
		mockSetSpeed: vi.fn(),
		mockResetSpeed: vi.fn(),
		mockSeek: vi.fn(),
		mockGetCurrentSongName: vi.fn(),
		mockGetSong: vi.fn(),
		mockSetCurrentSong: vi.fn(),
		mixedKeySong: multiTrackSong,
		testSong: song,
	};
});

mockEngine.reset = mockEngineReset;
mockEngine.loadSong = mockEngineLoadSong;
mockEngine.setTrackVolume = mockEngineSetTrackVolume;
mockEngine.setTrackMute = mockEngineSetTrackMute;
mockEngine.setSolo = mockEngineSetSolo;

vi.mock("./engine/AudioEngine", () => ({
	AudioEngine: {
		getInstance: vi.fn(() => mockEngine),
	},
}));

vi.mock("./hooks/usePlayback", () => ({
	usePlayback: vi.fn(() => ({
		seek: mockSeek,
	})),
}));

vi.mock("./hooks/useSpeedControl", () => ({
	useSpeedControl: vi.fn(() => ({
		speed: 1,
		setSpeed: mockSetSpeed,
		resetSpeed: mockResetSpeed,
	})),
}));

vi.mock("./services/storage", () => ({
	getCurrentSongName: mockGetCurrentSongName,
	getSong: mockGetSong,
	setCurrentSong: mockSetCurrentSong,
}));

vi.mock("./components/FileUpload", () => ({
	FileUpload: ({
		onSongLoaded,
	}: {
		onSongLoaded: (song: Song, name: string) => void;
	}) => (
		<button
			type="button"
			data-testid="load-uploaded-song"
			onClick={() => onSongLoaded(testSong, "uploaded.gp5")}
		>
			Load Uploaded Song
		</button>
	),
}));

vi.mock("./components/Library", () => ({
	Library: ({
		onSongSelect,
		onActiveSongDeleted,
	}: {
		onSongSelect: (song: Song, name: string) => void;
		onActiveSongDeleted: () => void;
	}) => (
		<div>
			<button
				type="button"
				data-testid="load-library-song"
				onClick={() => onSongSelect(testSong, "library.gp5")}
			>
				Load Library Song
			</button>
			<button
				type="button"
				data-testid="load-mixed-song"
				onClick={() => onSongSelect(mixedKeySong, "mixed.gp5")}
			>
				Load Mixed Song
			</button>
			<button
				type="button"
				data-testid="delete-active-song"
				onClick={onActiveSongDeleted}
			>
				Delete Active Song
			</button>
		</div>
	),
}));

vi.mock("./components/Minimap", () => ({
	Minimap: () => <div data-testid="minimap" />,
}));

vi.mock("./components/TrackMixer", () => ({
	TrackMixer: ({
		tracks,
		onTrackChange,
	}: {
		tracks: Song["tracks"];
		onTrackChange: (index: number) => void;
	}) => (
		<div data-testid="track-mixer">
			{tracks.map((track, index) => (
				<button
					key={track.id}
					type="button"
					data-testid={`select-track-${index}`}
					onClick={() => onTrackChange(index)}
				>
					{track.name}
				</button>
			))}
		</div>
	),
}));

vi.mock("./components/TransportBar", () => ({
	TransportBar: () => <div data-testid="transport-bar" />,
}));

vi.mock("./components/Visualizer", () => ({
	Visualizer: () => <div data-testid="visualizer" />,
}));

describe("App", () => {
	afterEach(cleanup);

	beforeEach(() => {
		vi.clearAllMocks();
		mockGetCurrentSongName.mockResolvedValue(null);
		mockGetSong.mockResolvedValue(null);
		mockSetCurrentSong.mockResolvedValue(undefined);
	});

	it("resets hook-managed speed state before loading a new song", async () => {
		render(<App />);

		await waitFor(() =>
			expect(screen.getByTestId("load-uploaded-song")).toBeTruthy(),
		);

		fireEvent.click(screen.getByTestId("load-uploaded-song"));

		await waitFor(() => {
			expect(mockEngineReset).toHaveBeenCalledOnce();
			expect(mockResetSpeed).toHaveBeenCalledOnce();
			expect(mockEngineLoadSong).toHaveBeenCalledWith(testSong.tracks);
		});
	});

	it("shows selected track tuning and key metadata", async () => {
		render(<App />);

		await waitFor(() =>
			expect(screen.getByTestId("load-uploaded-song")).toBeTruthy(),
		);

		fireEvent.click(screen.getByTestId("load-uploaded-song"));

		await waitFor(() => {
			expect(screen.getByText("Key")).toBeTruthy();
			expect(screen.getByText("C major")).toBeTruthy();
			expect(screen.getByText("Tuning: E A D G B E")).toBeTruthy();
		});
	});

	it("shows mixed song keys and updates selected track metadata", async () => {
		render(<App />);

		await waitFor(() =>
			expect(screen.getByTestId("load-mixed-song")).toBeTruthy(),
		);

		fireEvent.click(screen.getByTestId("load-mixed-song"));

		await waitFor(() => {
			expect(screen.getByText("Varies by track")).toBeTruthy();
			expect(screen.getByText("Key: C major")).toBeTruthy();
		});

		fireEvent.click(screen.getByTestId("select-track-1"));

		await waitFor(() => {
			expect(screen.getByText("Key: E minor")).toBeTruthy();
			expect(screen.getByText("Tuning: E A D G")).toBeTruthy();
		});
	});

	it("resets hook-managed speed state when clearing the current song", async () => {
		render(<App />);

		await waitFor(() =>
			expect(screen.getByTestId("load-uploaded-song")).toBeTruthy(),
		);
		fireEvent.click(screen.getByTestId("load-uploaded-song"));
		await waitFor(() =>
			expect(screen.getByText("Upload Another Song")).toBeTruthy(),
		);

		mockEngineReset.mockClear();
		mockResetSpeed.mockClear();
		mockSetCurrentSong.mockClear();

		fireEvent.click(screen.getByText("Upload Another Song"));

		await waitFor(() => {
			expect(mockEngineReset).toHaveBeenCalledOnce();
			expect(mockResetSpeed).toHaveBeenCalledOnce();
			expect(mockSetCurrentSong).toHaveBeenCalledWith("");
			expect(screen.getByTestId("load-uploaded-song")).toBeTruthy();
		});
	});

	it("resets hook-managed speed state when the active library song is deleted", async () => {
		render(<App />);

		await waitFor(() =>
			expect(screen.getByTestId("load-library-song")).toBeTruthy(),
		);
		fireEvent.click(screen.getByTestId("load-library-song"));
		await waitFor(() =>
			expect(screen.getByText("Upload Another Song")).toBeTruthy(),
		);

		mockEngineReset.mockClear();
		mockResetSpeed.mockClear();

		fireEvent.click(screen.getByTestId("delete-active-song"));

		await waitFor(() => {
			expect(mockEngineReset).toHaveBeenCalledOnce();
			expect(mockResetSpeed).toHaveBeenCalledOnce();
			expect(screen.getByTestId("load-uploaded-song")).toBeTruthy();
		});
	});
});
