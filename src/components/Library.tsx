import { Music, Play, Trash2, XCircle } from "lucide-react";
import type React from "react";
import { useCallback, useEffect, useState } from "react";
import type { Song } from "../domain/types";
import { clearStorage, deleteSong, listSongs, setCurrentSong } from "../services/storage";
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
		<div className="w-full max-w-4xl mx-auto mt-12 p-6 bg-card rounded-xl border shadow-sm">
			<div className="flex justify-between items-center mb-6">
				<h2 className="text-2xl font-bold flex items-center gap-2">
					<Music className="w-6 h-6" />
					Your Library
				</h2>
				<Button
					variant="outline"
					size="sm"
					onClick={handleClear}
					className="text-destructive hover:bg-destructive/10 cursor-pointer"
				>
					<XCircle className="w-4 h-4 mr-2" />
					Clear Library
				</Button>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				{songs.map(({ name, song }) => (
					<div
						key={name}
						className={`flex items-center justify-between p-4 rounded-lg border transition-all ${
							activeSongName === name
								? "bg-primary/5 border-primary shadow-sm"
								: "bg-muted/30 border-transparent hover:border-muted-foreground/30"
						}`}
					>
						<div className="flex-1 min-w-0 pr-4">
							<h3 className="font-semibold truncate">
								{song.metadata.title || name}
							</h3>
							<p className="text-sm text-muted-foreground truncate">
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
								className="text-muted-foreground hover:text-destructive cursor-pointer"
								aria-label={`Delete ${name}`}
							>
								<Trash2 className="w-4 h-4" />
							</Button>
						</div>
					</div>
				))}
			</div>
		</div>
	);
};
