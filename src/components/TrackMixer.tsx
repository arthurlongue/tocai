import { ChevronDown, ChevronUp, Music, Volume2, VolumeX } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import type { Track } from "../domain/types";
import { Button } from "./ui/button";
import { Slider } from "./ui/slider";

interface TrackMixerProps {
	tracks: Track[];
	selectedTrackIndex: number;
	onTrackChange: (index: number) => void;
	trackMutes: Record<string, boolean>;
	onTrackMuteToggle: (trackId: string) => void;
	soloActive: boolean;
	onSoloToggle: () => void;
	backingTracksVolume: number;
	onBackingTracksVolumeChange: (volume: number) => void;
}

export const TrackMixer: React.FC<TrackMixerProps> = ({
	tracks,
	selectedTrackIndex,
	onTrackChange,
	trackMutes,
	onTrackMuteToggle,
	soloActive,
	onSoloToggle,
	backingTracksVolume,
	onBackingTracksVolumeChange,
}) => {
	const [isCollapsed, setIsCollapsed] = useState(false);

	return (
		<div className="w-full flex flex-col gap-3 p-1">
			<div className="flex justify-between items-center px-1">
				<div className="flex items-center gap-4">
					<h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">
						Tracks
					</h3>
					{!isCollapsed && (
						<div className="flex items-center gap-4">
							<Button
								variant={soloActive ? "default" : "outline"}
								size="xs"
								className="h-6 px-2 font-bold text-[10px] uppercase tracking-tighter cursor-pointer"
								onClick={onSoloToggle}
								aria-pressed={soloActive}
							>
								Solo Mode {soloActive ? "ON" : "OFF"}
							</Button>

							<div className="flex items-center gap-2 bg-muted/30 px-2 py-1 rounded-lg shadow-sm font-bold">
								<Volume2 className="size-3 text-primary" />
								<span className="text-[10px] text-foreground uppercase tracking-tighter">
									Backing
								</span>
								<Slider
									aria-label="Backing Tracks Volume"
									value={[backingTracksVolume]}
									min={0}
									max={1}
									step={0.05}
									variant="triangular"
									onValueChange={(v) => onBackingTracksVolumeChange(v[0])}
									className="w-20 h-8"
								/>
							</div>
						</div>
					)}
				</div>
				<Button
					variant="ghost"
					size="sm"
					className="h-8 px-2 text-foreground hover:bg-muted/50 cursor-pointer"
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

			{!isCollapsed && (
				<div className="flex flex-wrap gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
					{tracks.map((track, index) => {
						const isSelected = index === selectedTrackIndex;
						const isMuted = soloActive
							? !isSelected
							: (trackMutes[track.id] ?? false);

						return (
							<div
								key={track.id}
								className={cn(
									"group relative flex items-center gap-3 p-3 rounded-xl transition-all duration-200 min-w-[180px] cursor-pointer",
									isSelected
										? "bg-primary/10 shadow-[0_0_0_1px_rgba(168,85,247,0.4),0_0_18px_-2px_rgba(168,85,247,0.25)]"
										: "bg-card shadow-sm hover:shadow-md hover:bg-muted/50",
									isMuted && !isSelected && "opacity-60 grayscale-[0.5]",
								)}
							>
								<button
									type="button"
									className="flex-1 flex items-center gap-3 text-left outline-none cursor-pointer"
									onClick={() => onTrackChange(index)}
								>
									<div
										className={cn(
											"flex items-center justify-center size-8 rounded-lg",
											isSelected
												? "bg-primary text-primary-foreground"
												: "bg-muted text-muted-foreground group-hover:bg-muted-foreground/10",
										)}
									>
										<Music className="size-4" />
									</div>
									<div className="flex flex-col overflow-hidden">
										<span
											className={cn(
												"text-sm font-bold truncate",
												isSelected ? "text-primary" : "text-foreground",
											)}
										>
											{track.name}
										</span>
										<span className="text-[10px] text-foreground/80 uppercase tracking-tight">
											{isSelected ? "Active" : isMuted ? "Muted" : "Playing"}
										</span>
									</div>
								</button>

								<Button
									variant="ghost"
									size="icon"
									className={cn(
										"size-8 rounded-lg shrink-0",
										isMuted
											? "text-destructive hover:text-destructive hover:bg-destructive/10"
											: "text-foreground hover:text-primary hover:bg-muted",
										soloActive && "opacity-30 cursor-not-allowed",
									)}
									onClick={(e) => {
										e.stopPropagation();
										if (!soloActive) onTrackMuteToggle(track.id);
									}}
									disabled={soloActive}
									aria-label={
										soloActive
											? `Mute disabled for track ${index + 1}: ${track.name} while solo mode is active`
											: isMuted
												? `Unmute track ${index + 1}: ${track.name}`
												: `Mute track ${index + 1}: ${track.name}`
									}
								>
									{isMuted ? (
										<VolumeX className="size-4" />
									) : (
										<Volume2 className="size-4" />
									)}
								</Button>
							</div>
						);
					})}
				</div>
			)}
		</div>
	);
};
