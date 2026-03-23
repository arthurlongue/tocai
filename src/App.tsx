import { useEffect, useState } from "react";
import { FileUpload } from "./components/FileUpload";
import { Visualizer } from "./components/Visualizer";
import { Minimap } from "./components/Minimap";
import type { Song } from "./domain/types";
import { AudioEngine } from "./engine/AudioEngine";
import { usePlayback } from "./hooks/usePlayback";
import { useTransportStatus } from "./hooks/useTransportStatus";
import "./App.css";

function App() {
	const [song, setSong] = useState<Song | null>(null);
	const { play, pause, stop, seek } = usePlayback();
	const transportStatus = useTransportStatus();

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
			<section id="center">
				<div className="hero">
					<h1 className="text-4xl font-bold tracking-tight text-primary mb-2">
						Tocaí
					</h1>
					<p className="text-muted-foreground mb-8">
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

							{/* Playback Controls */}
							<div className="flex flex-col gap-4">
								<div className="flex items-center justify-center gap-4">
									{transportStatus === "started" ? (
										<button
											type="button"
											onClick={pause}
											className="flex-1 py-2 px-4 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors font-bold"
										>
											PAUSE
										</button>
									) : (
										<button
											type="button"
											onClick={play}
											className="flex-1 py-2 px-4 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors font-bold"
										>
											PLAY
										</button>
									)}
									<button
										type="button"
										onClick={stop}
										className="py-2 px-4 bg-destructive text-destructive-foreground rounded-md hover:bg-destructive/90 transition-colors font-bold"
									>
										STOP
									</button>
								</div>

								<div className="text-center">
									<span className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">
										Status: {transportStatus}
									</span>
								</div>

								<button
									type="button"
									onClick={() => {
										stop();
										setSong(null);
									}}
									className="mt-2 w-full py-1 text-sm text-muted-foreground hover:text-foreground transition-colors underline"
								>
									Upload Another Song
								</button>
							</div>
						</div>

						{/* Minimap Navigation */}
						<div className="w-full">
							<Minimap
								track={song.tracks[0]}
								onSeek={(time) => seek(time)}
							/>
						</div>

						{/* Visualizer Area */}
						<div className="w-full">
							<Visualizer track={song.tracks[0]} />
						</div>
					</div>
				)}
			</section>

			<div className="ticks"></div>

			<section id="next-steps">
				<div id="docs">
					<h2>About Tocaí</h2>
					<p>
						Phase 2: Audio Engine complete. Synthesized playback is now
						synchronized with Tone.js transport.
					</p>
				</div>
				<div id="social">
					<h2>What's Next?</h2>
					<p>
						Phase 3 will introduce the Canvas Visualizer, bringing the notes to
						life as they scroll across the screen.
					</p>
				</div>
			</section>

			<div className="ticks"></div>
			<section id="spacer"></section>
		</>
	);
}

export default App;
