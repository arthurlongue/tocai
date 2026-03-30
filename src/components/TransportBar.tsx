import { Gauge, Pause, Play, Square, Volume2 } from "lucide-react";
import { useEffect, useState } from "react";
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
	selectedTrackVolume: number;
	onSelectedTrackVolumeChange: (volume: number) => void;
}

export const TransportBar: React.FC<TransportBarProps> = ({
	songDuration,
	speed,
	onSpeedChange,
	selectedTrackVolume,
	onSelectedTrackVolumeChange,
}) => {
	const { play, pause, stop, seek } = usePlayback();
	const transportStatus = useTransportStatus();
	const [currentTime, setCurrentTime] = useState(0);

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

	const handleSeekChange = (value: number[]) => {
		const time = value[0];
		setCurrentTime(time);
		seek(time);
	};

	const formatTime = (seconds: number): string => {
		const mins = Math.floor(seconds / 60);
		const secs = Math.floor(seconds % 60);
		return `${mins}:${secs.toString().padStart(2, "0")}`;
	};

	const isPlaying = transportStatus === "started";

	return (
		<div className="relative z-40 w-full bg-surface shadow-[0_-4px_20px_-2px_rgba(0,0,0,0.5)] p-2 md:p-4 transport-bar">
			<div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:gap-4">
				{/* Seek Bar + Time (Always together, Top on Mobile) */}
				<div className="flex-1 w-full flex items-center gap-3 lg:order-2">
					<Slider
						aria-label="Seek"
						value={[currentTime]}
						max={songDuration}
						step={0.1}
						onValueChange={handleSeekChange}
						className="flex-1 h-8"
					/>
					<span className="text-xs sm:text-sm text-foreground font-mono w-[72px] sm:w-20 text-right whitespace-nowrap shrink-0 lg:min-w-[84px]">
						{formatTime(currentTime)} / {formatTime(songDuration)}
					</span>
				</div>

				{/* Controls Group: Play, Stop, Speed, Volume */}
				<div className="flex items-center justify-between lg:contents gap-2">
					<div className="flex items-center gap-1 sm:gap-2 lg:order-1 shrink-0">
						<Button
							onClick={isPlaying ? pause : play}
							variant="secondary"
							className="px-0 md:px-4 min-w-[40px] md:min-w-[100px] h-9 md:h-11 cursor-pointer"
							aria-label={isPlaying ? "Pause" : "Play"}
						>
							{isPlaying ? (
								<>
									<Pause className="w-4 h-4 md:w-5 md:h-5 md:mr-2" />
									<span className="hidden md:inline">PAUSE</span>
								</>
							) : (
								<>
									<Play className="w-4 h-4 md:w-5 md:h-5 md:mr-2" />
									<span className="hidden md:inline">PLAY</span>
								</>
							)}
						</Button>
						<Button
							onClick={stop}
							variant="destructive"
							className="size-9 md:size-11 cursor-pointer p-0"
							aria-label="Stop"
						>
							<Square className="w-4 h-4 md:w-5 md:h-5" />
						</Button>
					</div>

					<div className="flex items-center gap-3 sm:gap-4 lg:order-3 shrink-0">
						{/* Speed Control */}
						<div className="flex items-center gap-1.5 sm:gap-2">
							<Gauge className="w-3.5 h-3.5 md:w-4 md:h-4 text-primary shrink-0" />
							<Slider
								aria-label="Speed"
								value={[speed]}
								min={0.25}
								max={2}
								step={0.25}
								onValueChange={(v) => onSpeedChange(v[0])}
								className="w-14 sm:w-24 md:w-32 h-8"
							/>
							<span className="text-[10px] sm:text-xs md:text-sm w-7 sm:w-10 shrink-0 text-right">
								{speed.toFixed(2)}x
							</span>
						</div>

						{/* Selected-track Volume */}
						<div className="flex items-center gap-1.5 sm:gap-2">
							<Volume2 className="w-3.5 h-3.5 md:w-4 md:h-4 text-primary shrink-0" />
							<Slider
								aria-label="Selected Track Volume"
								value={[selectedTrackVolume]}
								min={0}
								max={1}
								step={0.05}
								variant="triangular"
								onValueChange={(v) => onSelectedTrackVolumeChange(v[0])}
								className="w-14 sm:w-20 md:w-24 h-8"
							/>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};
