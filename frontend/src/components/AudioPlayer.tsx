"use client";

import { useEffect, useRef, useState } from "react";
import * as Tone from "tone";

interface AudioPlayerProps {
  audioUrl: string;
  title?: string;
  showMixerControls?: boolean;
}

export function AudioPlayer({ audioUrl, title, showMixerControls = true }: AudioPlayerProps) {
  const playerRef = useRef<Tone.Player | null>(null);
  const filterRef = useRef<Tone.Filter | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(-6);
  const [filter, setFilter] = useState(18000);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const animationFrameRef = useRef<number>();

  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      playerRef.current?.dispose();
      filterRef.current?.dispose();
    };
  }, []);

  useEffect(() => {
    async function loadClip() {
      await Tone.start();
      
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      playerRef.current?.dispose();
      filterRef.current?.dispose();

      const filterNode = new Tone.Filter(filter, "lowpass").toDestination();
      const player = new Tone.Player(audioUrl)
        .set({ loop: false, autostart: false, volume })
        .connect(filterNode);

      await Tone.loaded();
      
      playerRef.current = player;
      filterRef.current = filterNode;
      setDuration(player.buffer.duration);
      setIsPlaying(false);
      setProgress(0);
    }

    loadClip();
  }, [audioUrl]);

  useEffect(() => {
    if (playerRef.current) {
      playerRef.current.volume.value = volume;
    }
  }, [volume]);

  useEffect(() => {
    if (filterRef.current) {
      filterRef.current.frequency.value = filter;
    }
  }, [filter]);

  const updateProgress = () => {
    if (playerRef.current && isPlaying) {
      const currentTime = Tone.Transport.seconds - (playerRef.current as any)._startTime;
      if (currentTime >= 0) {
        setProgress(Math.min(currentTime, duration));
      }
      animationFrameRef.current = requestAnimationFrame(updateProgress);
    }
  };

  const togglePlay = async () => {
    if (!playerRef.current) return;

    await Tone.start();

    if (isPlaying) {
      playerRef.current.stop();
      setIsPlaying(false);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    } else {
      playerRef.current.start();
      setIsPlaying(true);
      updateProgress();
      
      // Stop playback when it ends
      setTimeout(() => {
        setIsPlaying(false);
        setProgress(duration);
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
      }, duration * 1000);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    setProgress(newTime);
    
    if (playerRef.current) {
      playerRef.current.stop();
      playerRef.current.start("+0", newTime);
      if (!isPlaying) {
        playerRef.current.stop();
      }
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm rounded-2xl p-8 border border-slate-700/50 shadow-xl">
      {title && (
        <div className="mb-6">
          <h3 className="text-xl font-semibold text-cyan-400 truncate text-center">{title}</h3>
        </div>
      )}
      
      {/* Play/Pause Button and Progress */}
      <div className="flex items-center gap-6 mb-6">
        <button
          onClick={togglePlay}
          className="flex-shrink-0 w-16 h-16 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 flex items-center justify-center transition-all shadow-lg hover:shadow-cyan-500/50 hover:scale-105"
        >
          {isPlaying ? (
            <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
            </svg>
          ) : (
            <svg className="w-7 h-7 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </button>
        
        <div className="flex-1">
          <input
            type="range"
            min={0}
            max={duration}
            step={0.1}
            value={progress}
            onChange={handleSeek}
            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer slider-thumb"
          />
          <div className="flex justify-between text-sm text-slate-400 mt-2">
            <span>{formatTime(progress)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>
      </div>

      {/* Mixer Controls */}
      {showMixerControls && (
        <div className="space-y-5 pt-6 border-t border-slate-700/50">
          <div>
            <div className="flex justify-between items-center mb-3">
              <label className="text-sm font-semibold text-slate-300">Volume</label>
              <span className="text-sm text-cyan-400 font-medium">{volume} dB</span>
            </div>
            <input
              type="range"
              min={-24}
              max={6}
              value={volume}
              onChange={(evt) => setVolume(Number(evt.target.value))}
              className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer slider-thumb"
            />
          </div>
          
          <div>
            <div className="flex justify-between items-center mb-3">
              <label className="text-sm font-semibold text-slate-300">Filter</label>
              <span className="text-sm text-cyan-400 font-medium">{filter} Hz</span>
            </div>
            <input
              type="range"
              min={200}
              max={20000}
              value={filter}
              onChange={(evt) => setFilter(Number(evt.target.value))}
              className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer slider-thumb"
            />
          </div>
        </div>
      )}
    </div>
  );
}

