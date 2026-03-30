import { ChevronDown, ChevronUp, Clock, Layers, Music2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { FileUpload } from "./components/FileUpload";
import { Library } from "./components/Library";
import { Minimap } from "./components/Minimap";
import { TrackMixer } from "./components/TrackMixer";
import { TransportBar } from "./components/TransportBar";
import { Button } from "./components/ui/button";
import { Visualizer } from "./components/Visualizer";
import type { Song } from "./domain/types";
import { AudioEngine } from "./engine/AudioEngine";
import { usePlayback } from "./hooks/usePlayback";
import { useSpeedControl } from "./hooks/useSpeedControl";
import {
	getCurrentSongName,
	getSong,
	setCurrentSong,
} from "./services/storage";

/**
 * Main application component for Tocaí - a web-based Guitar Pro player.
 *
 * Manages the overall application state including:
 * - Current song and track selection
 * - Playback control (play, pause, stop, seek)
 * - Speed control
 * - Track mixing (volume, mute, solo)
 * - Song library management
 */
function App() {
	const [song, setSong] = useState<Song | null>(null);
	const [currentSongName, setCurrentSongName] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [selectedTrackIndex, setSelectedTrackIndex] = useState(0);
	const [soloActive, setSoloActive] = useState(false);
	const [trackMutes, setTrackMutes] = useState<Record<string, boolean>>({});
	const [selectedTrackVolume, setSelectedTrackVolume] = useState(0.8);
	const [backingTracksVolume, setBackingTracksVolume] = useState(0.8);
	const [libraryRefreshKey, setLibraryRefreshKey] = useState(0);
	const [isMetadataCollapsed, setIsMetadataCollapsed] = useState(false);

	const { seek } = usePlayback();
	const { speed, setSpeed, resetSpeed } = useSpeedControl();

	const engine = AudioEngine.getInstance();

	// Load last song on mount
	useEffect(() => {
		const loadLastSong = async () => {
			try {
				const lastSongName = await getCurrentSongName();
				if (lastSongName) {
					const savedSong = await getSong(lastSongName);
					if (savedSong) {
						setSong(savedSong);
						setCurrentSongName(lastSongName);
					}
				}
			} catch (err) {
				console.error("Failed to load last song:", err);
			} finally {
				setIsLoading(false);
			}
		};
		void loadLastSong();
	}, []);

	// Load ALL tracks into the audio engine and reset transport + speed state when a NEW song is loaded
	useEffect(() => {
		if (song && song.tracks.length > 0) {
			// Reset both transport state and the lifted speed/timeline state before loading.
			engine.reset();
			resetSpeed();
			// Load the new tracks
			engine.loadSong(song.tracks);
			// Initialize track mutes
			const initialMutes: Record<string, boolean> = {};
			for (const track of song.tracks) {
				initialMutes[track.id] = false;
			}
			setTrackMutes(initialMutes);
		}
		// Reset selection state when song identity changes
		setSelectedTrackIndex(0);
		setSoloActive(false);
	}, [song, engine, resetSpeed]);

	const currentTrack = song?.tracks[selectedTrackIndex];

	// Synchronize audio engine with current track/volume/mute/solo state
	useEffect(() => {
		if (!song) return;

		for (let i = 0; i < song.tracks.length; i++) {
			const track = song.tracks[i];
			const isSelected = i === selectedTrackIndex;

			// Priority 1: Volume
			const vol = isSelected ? selectedTrackVolume : backingTracksVolume;
			engine.setTrackVolume(track.id, vol);

			// Priority 2: Mute/Solo logic
			// If solo is active, ONLY the selected track is unmuted.
			// If solo is NOT active, follow individual track mute state.
			const isMuted = soloActive
				? !isSelected
				: (trackMutes[track.id] ?? false);
			engine.setTrackMute(track.id, isMuted);
		}
	}, [
		song,
		engine,
		selectedTrackIndex,
		soloActive,
		trackMutes,
		selectedTrackVolume,
		backingTracksVolume,
	]);

	const handleTrackChange = useCallback(
		(index: number) => {
			if (!song) return;
			if (soloActive) {
				const newTrack = song.tracks[index];
				if (newTrack) engine.setSolo(newTrack.id);
			}
			setSelectedTrackIndex(index);
		},
		[song, soloActive, engine],
	);

	const handleSoloToggle = useCallback(() => {
		setSoloActive((prev) => !prev);
	}, []);

	const handleTrackMuteToggle = useCallback((trackId: string) => {
		setTrackMutes((prev) => ({
			...prev,
			[trackId]: !prev[trackId],
		}));
	}, []);

	const formatDuration = (seconds: number) => {
		const mins = Math.floor(seconds / 60);
		const secs = Math.floor(seconds % 60);
		return `${mins}:${secs.toString().padStart(2, "0")}`;
	};

	return (
		<section className="flex flex-col gap-6 grow w-full justify-center items-stretch lg:p-0 max-lg:px-5 max-lg:py-6">
			<div className="relative">
				<h1 className="text-4xl lg:text-6xl font-bold tracking-tighter text-foreground mb-5 lg:mb-8 mt-5 lg:mt-8">
					Tocaí
				</h1>
				<p className="text-foreground text-lg mb-8 opacity-90">
					Your web-based Guitar Pro player
				</p>
			</div>

			{isLoading ? (
				<div className="flex justify-center items-center p-12">
					<div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
				</div>
			) : !song ? (
				<FileUpload
					onSongLoaded={(loadedSong, name) => {
						setSong(loadedSong);
						setCurrentSongName(name);
					}}
					onError={(err) => alert(`Failed to load song: ${err.message}`)}
					onSongSaved={() => setLibraryRefreshKey((k) => k + 1)}
				/>
			) : (
				<div className="w-full flex flex-col items-stretch gap-8 animate-in fade-in duration-500">
					{/* Song Metadata Card */}
					<div className="w-full max-w-2xl mx-auto rounded-2xl bg-card shadow-[0_8px_32px_-4px_rgba(0,0,0,0.5)] overflow-hidden">
						{/* Card Header — always visible */}
						<div className="flex items-center justify-between px-6 pt-5 pb-4">
							<div className="flex items-center gap-3 min-w-0">
								<div className="flex items-center justify-center size-10 rounded-xl bg-primary/15 shrink-0">
									<Music2 className="size-5 text-primary" />
								</div>
								<div className="min-w-0">
									<h2 className="text-xl font-bold truncate leading-tight text-foreground">
										{song.metadata.title || currentSongName}
									</h2>
									<p className="text-sm text-foreground/80 truncate">
										{song.metadata.artist || "Unknown Artist"}
									</p>
								</div>
							</div>
							<div className="flex items-center gap-1 shrink-0 ml-4">
								<Button
									variant="ghost"
									size="sm"
									className="h-8 px-2 text-foreground hover:bg-muted/50 cursor-pointer"
									onClick={() => setIsMetadataCollapsed(!isMetadataCollapsed)}
									aria-expanded={!isMetadataCollapsed}
								>
									{isMetadataCollapsed ? (
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

						{/* Expandable body */}
						{!isMetadataCollapsed && (
							<div className="px-6 pb-5 animate-in fade-in slide-in-from-top-2 duration-200">
								{/* Stat pills */}
								<div className="flex flex-wrap gap-2 mb-5">
									<div className="flex items-center gap-1.5 px-3 py-1.5 bg-muted/40 rounded-lg shadow-sm">
										<Clock className="size-3.5 text-primary" />
										<span className="text-xs font-semibold text-foreground">
											Duration
										</span>
										<span className="text-xs font-bold ml-1">
											{formatDuration(song.durationSeconds)}
										</span>
									</div>
									<div className="flex items-center gap-1.5 px-3 py-1.5 bg-muted/40 rounded-lg shadow-sm">
										<Layers className="size-3.5 text-primary" />
										<span className="text-xs font-semibold text-foreground">
											Tracks
										</span>
										<span className="text-xs font-bold ml-1">
											{song.tracks.length}
										</span>
									</div>
								</div>
								<Button
									variant="ghost"
									onClick={() => {
										engine.reset();
										resetSpeed();
										setSong(null);
										setCurrentSongName(null);
										setSelectedTrackIndex(0);
										setSoloActive(false);
										void setCurrentSong("");
									}}
									className="w-full h-10 text-foreground hover:text-primary transition-colors text-sm underline decoration-1 underline-offset-4"
								>
									Upload Another Song
								</Button>
							</div>
						)}
					</div>

					{/* Minimap Navigation */}
					<div className="w-full">
						<Minimap
							track={currentTrack}
							songDuration={song.durationSeconds}
							onSeek={(time) => seek(time)}
						/>
					</div>

					{/* Track Mixer */}
					<div className="w-full">
						<TrackMixer
							tracks={song.tracks}
							selectedTrackIndex={selectedTrackIndex}
							onTrackChange={handleTrackChange}
							trackMutes={trackMutes}
							onTrackMuteToggle={handleTrackMuteToggle}
							soloActive={soloActive}
							onSoloToggle={handleSoloToggle}
							backingTracksVolume={backingTracksVolume}
							onBackingTracksVolumeChange={setBackingTracksVolume}
						/>
					</div>

					{/* Visualizer Area */}
					<div className="w-full">
						<Visualizer track={currentTrack ?? undefined} speed={speed} />
					</div>

					{/* Transport Bar */}
					<TransportBar
						songDuration={song.durationSeconds}
						speed={speed}
						onSpeedChange={setSpeed}
						selectedTrackVolume={selectedTrackVolume}
						onSelectedTrackVolumeChange={setSelectedTrackVolume}
					/>
				</div>
			)}

			<Library
				activeSongName={currentSongName || undefined}
				onSongSelect={(selectedSong, name) => {
					setSong(selectedSong);
					setCurrentSongName(name);
				}}
				onActiveSongDeleted={() => {
					engine.reset();
					resetSpeed();
					setSong(null);
					setCurrentSongName(null);
					setSelectedTrackIndex(0);
					setSoloActive(false);
				}}
				libraryRefreshKey={libraryRefreshKey}
			/>
		</section>
	);
}

export default App;
