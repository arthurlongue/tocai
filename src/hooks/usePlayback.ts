import * as Tone from "tone";
import { useCallback } from "react";
import { AudioEngine } from "../engine/AudioEngine";

/**
 * Hook providing methods to control the Tone.Transport playback.
 * Handles the mandatory Tone.start() initialization on user gesture.
 */
export const usePlayback = () => {
  const engine = AudioEngine.getInstance();

  const play = useCallback(async () => {
    // Tone.start() is mandatory on user gesture (e.g., click) to enable audio context.
    // It is a no-op if the context is already started.
    await Tone.start();
    Tone.getTransport().start();
  }, []);

  const pause = useCallback(() => {
    Tone.getTransport().pause();
  }, []);

  const stop = useCallback(() => {
    // stopAll also calls Tone.getTransport().stop()
    engine.stopAll();
  }, [engine]);

  const seek = useCallback((seconds: number) => {
    Tone.getTransport().seconds = seconds;
  }, []);

  return {
    play,
    pause,
    stop,
    seek,
  };
};
