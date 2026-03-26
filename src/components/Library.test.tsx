/**
 * @vitest-environment jsdom
 */
import {
	cleanup,
	fireEvent,
	render,
	screen,
	waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import * as storage from "../services/storage";
import { Library } from "./Library";

// Mock storage
vi.mock("../services/storage", () => ({
	listSongs: vi.fn().mockResolvedValue([]),
	deleteSong: vi.fn().mockResolvedValue(undefined),
	clearStorage: vi.fn().mockResolvedValue(undefined),
	setCurrentSong: vi.fn().mockResolvedValue(undefined),
}));

// Mock Lucide icons
vi.mock("lucide-react", () => ({
	ChevronDown: () => <div data-testid="chevron-down-icon" />,
	ChevronUp: () => <div data-testid="chevron-up-icon" />,
	Music: () => <div data-testid="music-icon" />,
	Play: () => <div data-testid="play-icon" />,
	Trash2: () => <div data-testid="trash-icon" />,
	XCircle: () => <div data-testid="clear-icon" />,
}));

describe("Library Component", () => {
	const mockSongs = [
		{
			name: "song1.gp5",
			song: { metadata: { title: "Title 1", artist: "Artist 1" } },
		},
		{
			name: "song2.gp5",
			song: { metadata: { title: "Title 2", artist: "Artist 2" } },
		},
	];

	beforeEach(() => {
		vi.clearAllMocks();
		(storage.listSongs as any).mockResolvedValue(mockSongs);
	});

	afterEach(() => {
		cleanup();
	});

	it("renders nothing when library is empty", async () => {
		(storage.listSongs as any).mockResolvedValue([]);
		const { container } = render(<Library onSongSelect={() => {}} />);
		await waitFor(() => expect(storage.listSongs).toHaveBeenCalled());
		expect(container.firstChild).toBeNull();
	});

	it("renders list of songs", async () => {
		render(<Library onSongSelect={() => {}} />);
		await waitFor(() => expect(screen.getByText("Title 1")).toBeDefined());
		expect(screen.getByText("Title 2")).toBeDefined();
		expect(screen.getByText("Artist 1")).toBeDefined();
		expect(screen.getByText("Artist 2")).toBeDefined();
	});

	it("calls onSongSelect when load button is clicked", async () => {
		const onSelect = vi.fn();
		render(<Library onSongSelect={onSelect} />);
		await waitFor(() => screen.getByText("Title 1"));

		const loadButtons = await screen.findAllByRole("button", { name: /Load/i });
		fireEvent.click(loadButtons[0]);

		await waitFor(() => {
			expect(storage.setCurrentSong).toHaveBeenCalledWith("song1.gp5");
			expect(onSelect).toHaveBeenCalledWith(mockSongs[0].song, "song1.gp5");
		});
	});

	it("highlights the active song", async () => {
		render(<Library onSongSelect={() => {}} activeSongName="song1.gp5" />);
		await waitFor(() => screen.getByText("Active"));
		expect(screen.getByText("Active")).toBeDefined();
	});

	it("calls deleteSong when trash icon is clicked", async () => {
		render(<Library onSongSelect={() => {}} />);
		await waitFor(() => screen.getByText("Title 1"));

		// Find the button containing the trash icon
		const deleteButtons = screen
			.getAllByRole("button")
			.filter((b) => b.querySelector('[data-testid="trash-icon"]'));
		fireEvent.click(deleteButtons[0]);

		expect(storage.deleteSong).toHaveBeenCalledWith("song1.gp5");
		// Should reload library after delete
		await waitFor(() => expect(storage.listSongs).toHaveBeenCalledTimes(2));
	});

	it("calls clearStorage when clear button is clicked", async () => {
		window.confirm = vi.fn(() => true);
		render(<Library onSongSelect={() => {}} />);
		const clearBtn = await screen.findByRole("button", {
			name: /Clear Library/i,
		});

		fireEvent.click(clearBtn);

		expect(storage.clearStorage).toHaveBeenCalled();
	});
});
