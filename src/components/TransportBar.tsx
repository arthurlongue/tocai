import { Music, Pause, Play, Square, Volume2 } from "lucide-react";
import { useEffect, useState } from "react";
import * as Tone from "tone";
import type { Track } from "../domain/types";
import { getPlaybackTimelineTime } from "../engine/playbackTimeline";
import { subscribeToVisualSync } from "../engine/visualSync";
import { usePlayback } from "../hooks/usePlayback";
import { useTransportStatus } from "../hooks/useTransportStatus";
import { Button } from "./ui/button";
import { Slider } from "./ui/slider";

interface TransportBarProps {
	songDuration: number;
	speed: number;
	onSpeedChange: (speed: number) => void;
	currentTrack?: Track;
}

export const TransportBar: React.FC<TransportBarProps> = ({
	songDuration,
	speed,
	onSpeedChange,
	currentTrack,
}) => {
	const { play, pause, stop, seek } = usePlayback();
	const transportStatus = useTransportStatus();
	const [currentTime, setCurrentTime] = useState(0);
	const [volume, setVolume] = useState(0.8);

	useEffect(
		() =>
			subscribeToVisualSync((songSeconds) => {
				setCurrentTime(songSeconds);
			}),
		[],
	);

	useEffect(() => {
		if (transportStatus !== "started") {
			setCurrentTime(getPlaybackTimelineTime());
			return;
		}

		setCurrentTime(getPlaybackTimelineTime());
		const interval = window.setInterval(() => {
			setCurrentTime(getPlaybackTimelineTime());
		}, 100);
		return () => window.clearInterval(interval);
	}, [transportStatus]);

	// Handle volume changes
	const handleVolumeChange = (value: number[]) => {
		const newVolume = value[0];
		setVolume(newVolume);
		Tone.getDestination().volume.value = Tone.gainToDb(newVolume);
	};

	// Handle seek changes
	const handleSeekChange = (value: number[]) => {
		const time = value[0];
		setCurrentTime(time);
		seek(time);
	};

	// Handle speed changes
	const handleSpeedChange = (value: number[]) => {
		const newSpeed = value[0];
		onSpeedChange(newSpeed);
	};

	// Format time as M:SS
	const formatTime = (seconds: number): string => {
		const mins = Math.floor(seconds / 60);
		const secs = Math.floor(seconds % 60);
		return `${mins}:${secs.toString().padStart(2, "0")}`;
	};

	const isPlaying = transportStatus === "started";

	return (
		<div className="w-full bg-surface border-t border-border p-4 transport-bar">
			<div className="flex flex-wrap items-center gap-4">
				{/* Playback Controls */}
				<div className="flex gap-2">
					<Button
						onClick={isPlaying ? pause : play}
						variant="secondary"
						className="min-w-[100px] h-11"
						aria-label={isPlaying ? "Pause" : "Play"}
					>
						{isPlaying ? (
							<>
								<Pause className="w-5 h-5 mr-2" />
								PAUSE
							</>
						) : (
							<>
								<Play className="w-5 h-5 mr-2" />
								PLAY
							</>
						)}
					</Button>
					<Button
						onClick={stop}
						variant="destructive"
						className="size-11"
						aria-label="Stop"
					>
						<Square className="w-5 h-5" />
					</Button>
				</div>

				{/* Seek Bar */}
				<div className="flex-1 min-w-[200px] flex items-center gap-2">
					<Slider
						aria-label="Seek"
						value={[currentTime]}
						max={songDuration}
						step={0.1}
						onValueChange={handleSeekChange}
						className="flex-1 h-11"
					/>
					<span className="text-sm text-muted-foreground min-w-[80px] text-right">
						{formatTime(currentTime)} / {formatTime(songDuration)}
					</span>
				</div>

				{/* Speed Control */}
				<div className="flex items-center gap-2">
					<Music className="w-4 h-4 text-muted-foreground" />
					<Slider
						aria-label="Speed"
						value={[speed]}
						min={0.25}
						max={2}
						step={0.25}
						onValueChange={handleSpeedChange}
						className="w-32 h-11"
					/>
					<span className="text-sm min-w-[40px]">{speed.toFixed(2)}x</span>
				</div>

				{/* Volume Control */}
				<div className="flex items-center gap-2">
					<Volume2 className="w-4 h-4 text-muted-foreground" />
					<Slider
						aria-label="Volume"
						value={[volume]}
						min={0}
						max={1}
						step={0.05}
						onValueChange={handleVolumeChange}
						className="w-32 h-11"
					/>
				</div>

				{/* Track Selector (if multiple tracks) */}
				{currentTrack && (
					<div className="flex items-center gap-2">
						<Music className="w-4 h-4 text-muted-foreground" />
						<span className="text-sm">{currentTrack.name}</span>
					</div>
				)}
			</div>
		</div>
	);
};
