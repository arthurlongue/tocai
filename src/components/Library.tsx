import {
	ChevronDown,
	ChevronUp,
	Music,
	Play,
	Trash2,
	XCircle,
} from "lucide-react";
import type React from "react";
import { useCallback, useEffect, useState } from "react";
import type { Song } from "../domain/types";
import {
	clearStorage,
	deleteSong,
	listSongs,
	setCurrentSong,
} from "../services/storage";
import { Button } from "./ui/button";

interface LibraryProps {
	onSongSelect: (song: Song, name: string) => void;
	activeSongName?: string;
	onActiveSongDeleted?: () => void;
	libraryRefreshKey?: number;
}

export const Library: React.FC<LibraryProps> = ({
	onSongSelect,
	activeSongName,
	onActiveSongDeleted,
	libraryRefreshKey = 0,
}) => {
	const [songs, setSongs] = useState<{ name: string; song: Song }[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [isCollapsed, setIsCollapsed] = useState(() =>
		typeof window !== "undefined" ? window.innerWidth < 768 : false,
	);

	const loadLibrary = useCallback(async () => {
		setIsLoading(true);
		try {
			const loadedSongs = await listSongs();
			setSongs(loadedSongs);
		} catch (err) {
			console.error("Failed to load library:", err);
		} finally {
			setIsLoading(false);
		}
	}, []);

	useEffect(() => {
		void loadLibrary();
	}, [loadLibrary]);

	// Trigger reload when libraryRefreshKey changes (e.g., after uploading a new song)
	// biome-ignore lint/correctness/useExhaustiveDependencies: Refreshes library explicitly on key change
	useEffect(() => {
		void loadLibrary();
	}, [loadLibrary, libraryRefreshKey]);

	const handleSelect = async (name: string, song: Song) => {
		await setCurrentSong(name);
		onSongSelect(song, name);
	};

	const handleDelete = async (name: string) => {
		const wasActive = name === activeSongName;
		await deleteSong(name);
		await loadLibrary();
		if (wasActive && onActiveSongDeleted) {
			onActiveSongDeleted();
		}
	};

	const handleClear = async () => {
		if (confirm("Are you sure you want to clear your entire library?")) {
			await clearStorage();
			setSongs([]);
			if (onActiveSongDeleted) {
				onActiveSongDeleted();
			}
		}
	};

	if (isLoading) {
		return <div className="text-center p-4">Loading library...</div>;
	}

	if (songs.length === 0) {
		return null;
	}

	return (
		<div className="w-full max-w-4xl mx-auto mt-12 p-4 md:p-6 bg-card rounded-2xl shadow-[0_8px_32px_-4px_rgba(0,0,0,0.5)]">
			{/* Header */}
			<div className="flex flex-wrap justify-between items-center gap-y-3 mb-0">
				<h2 className="text-xl md:text-2xl font-bold flex flex-wrap items-center gap-2 w-full sm:w-auto">
					<Music className="w-6 h-6 shrink-0" />
					Your Library
					<span className="ml-1 text-xs md:text-sm font-medium text-foreground/70 shrink-0">
						({songs.length})
					</span>
				</h2>
				<div className="flex flex-wrap items-center gap-2 ml-auto">
					{!isCollapsed && (
						<Button
							variant="ghost"
							size="sm"
							onClick={handleClear}
							className="text-destructive/70 hover:text-destructive hover:bg-destructive/10 cursor-pointer text-xs md:text-sm h-8 px-2"
						>
							<XCircle className="w-4 h-4 mr-1 md:mr-2" />
							Clear <span className="hidden md:inline ml-1">Library</span>
						</Button>
					)}
					<Button
						variant="ghost"
						size="sm"
						className="h-8 px-2 text-foreground hover:bg-muted/50 cursor-pointer text-xs md:text-sm"
						onClick={() => setIsCollapsed(!isCollapsed)}
						aria-expanded={!isCollapsed}
					>
						{isCollapsed ? (
							<>
								<ChevronDown className="size-4 mr-1" />
								Show
							</>
						) : (
							<>
								<ChevronUp className="size-4 mr-1" />
								Collapse
							</>
						)}
					</Button>
				</div>
			</div>

			{!isCollapsed && (
				<div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-5 animate-in fade-in slide-in-from-top-2 duration-300">
					{songs.map(({ name, song }) => (
						<div
							key={name}
							className={`flex items-center justify-between p-4 rounded-xl transition-all duration-200 ${
								activeSongName === name
									? "bg-primary/10 shadow-[0_0_0_1px_rgba(168,85,247,0.4),0_0_16px_-2px_rgba(168,85,247,0.3)]"
									: "bg-muted/20 shadow-sm hover:shadow-md hover:bg-muted/40"
							}`}
						>
							<div className="flex-1 min-w-0 pr-4">
								<h3 className="font-semibold truncate">
									{song.metadata.title || name}
								</h3>
								<p className="text-sm text-foreground/80 truncate">
									{song.metadata.artist || "Unknown Artist"}
								</p>
							</div>
							<div className="flex items-center gap-2">
								<Button
									variant={activeSongName === name ? "default" : "secondary"}
									size="sm"
									onClick={() => handleSelect(name, song)}
									disabled={activeSongName === name}
									className="cursor-pointer"
								>
									{activeSongName === name ? (
										"Active"
									) : (
										<>
											<Play className="w-3 h-3 mr-1" /> Load
										</>
									)}
								</Button>
								<Button
									variant="ghost"
									size="icon"
									onClick={() => handleDelete(name)}
									className="text-foreground/70 hover:text-destructive cursor-pointer"
									aria-label={`Delete ${name}`}
								>
									<Trash2 className="w-4 h-4" />
								</Button>
							</div>
						</div>
					))}
				</div>
			)}
		</div>
	);
};
