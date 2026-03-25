import { useEffect, useState } from "react";
import { FileUpload } from "./components/FileUpload";
import { Minimap } from "./components/Minimap";
import { TransportBar } from "./components/TransportBar";
import { Button } from "./components/ui/button";
import { Visualizer } from "./components/Visualizer";
import type { Song } from "./domain/types";
import { AudioEngine } from "./engine/AudioEngine";
import { usePlayback } from "./hooks/usePlayback";
import { useSpeedControl } from "./hooks/useSpeedControl";

function App() {
	const [song, setSong] = useState<Song | null>(null);
	const { stop, seek } = usePlayback();
	const { speed, resetSpeed } = useSpeedControl();

	// Debug: Log speed changes in App
	useEffect(() => {
		console.log("[App] speed changed to:", speed);
	}, [speed]);

	// Load song into audio engine when it changes
	useEffect(() => {
		if (song && song.tracks.length > 0) {
			const engine = AudioEngine.getInstance();
			// For now, just load the first track's notes
			engine.loadSong(song.tracks[0].notes);
		}
	}, [song]);

	const formatDuration = (seconds: number) => {
		const mins = Math.floor(seconds / 60);
		const secs = Math.floor(seconds % 60);
		return `${mins}:${secs.toString().padStart(2, "0")}`;
	};

	return (
		<>
			<section className="flex flex-col gap-6 grow w-full justify-center items-stretch lg:p-0 max-lg:px-5 max-lg:py-6">
				<div className="relative">
					<h1 className="text-4xl lg:text-6xl font-bold tracking-tighter text-foreground mb-5 lg:mb-8 mt-5 lg:mt-8">
						Tocaí
					</h1>
					<p className="text-muted-foreground text-lg mb-8">
						Your web-based Guitar Pro player
					</p>
				</div>

				{!song ? (
					<FileUpload
						onSongLoaded={(loadedSong) => setSong(loadedSong)}
						onError={(err) => alert(`Failed to load song: ${err.message}`)}
					/>
				) : (
					<div className="w-full flex flex-col items-stretch gap-8 animate-in fade-in duration-500">
						<div className="w-full max-w-md mx-auto p-6 bg-card rounded-xl border shadow-lg">
							<h2 className="text-2xl font-bold mb-1">{song.metadata.title}</h2>
							<p className="text-lg text-muted-foreground mb-4">
								{song.metadata.artist}
							</p>

							<div className="flex flex-col gap-2 p-4 bg-muted/30 rounded-lg border mb-6">
								<div className="flex justify-between">
									<span className="text-sm font-medium">Duration</span>
									<span className="text-sm">
										{formatDuration(song.durationSeconds)}
									</span>
								</div>
								<div className="flex justify-between">
									<span className="text-sm font-medium">Tracks</span>
									<span className="text-sm">{song.tracks.length}</span>
								</div>
							</div>

							<Button
								variant="ghost"
								onClick={() => {
									stop();
									resetSpeed();
									setSong(null);
								}}
								className="w-full h-11 text-muted-foreground hover:text-foreground underline decoration-1 underline-offset-4"
							>
								Upload Another Song
							</Button>
						</div>

						{/* Minimap Navigation */}
						<div className="w-full">
							<Minimap
								track={song.tracks[0]}
								songDuration={song.durationSeconds}
								onSeek={(time) => seek(time)}
							/>
						</div>

						{/* Visualizer Area */}
						<div className="w-full">
							<Visualizer track={song.tracks[0]} speed={speed} />
						</div>

						{/* Transport Bar */}
						<TransportBar
							songDuration={song.durationSeconds}
							currentTrack={song.tracks[0]}
							onTrackChange={(index) => {
								// Handle track change (future implementation)
								console.log("Track change requested:", index);
							}}
						/>
					</div>
				)}
			</section>

			<div className="relative w-full before:content-[''] before:absolute before:-top-[4.5px] before:left-0 before:border-[5px] before:border-transparent before:border-l-border after:content-[''] after:absolute after:-top-[4.5px] after:right-0 after:border-[5px] after:border-transparent after:border-r-border"></div>
		</>
	);
}

export default App;
