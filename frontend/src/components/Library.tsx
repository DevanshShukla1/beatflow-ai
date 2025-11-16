"use client";

import { useEffect, useState } from "react";
import { getLibrary, type LibraryFile } from "@/lib/api";
import { AudioPlayer } from "./AudioPlayer";

export function Library() {
  const [files, setFiles] = useState<LibraryFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();
  const [selectedFile, setSelectedFile] = useState<LibraryFile | null>(null);

  useEffect(() => {
    loadLibrary();
  }, []);

  async function loadLibrary() {
    setLoading(true);
    setError(undefined);
    try {
      const result = await getLibrary();
      setFiles(result.files);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString();
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin mx-auto"></div>
          <p className="text-slate-400">Loading your library...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-400">Error loading library: {error}</p>
        <button
          onClick={loadLibrary}
          className="mt-4 px-6 py-2 bg-cyan-500 text-slate-950 rounded-lg hover:bg-cyan-400 transition"
        >
          Retry
        </button>
      </div>
    );
  }

  if (files.length === 0) {
    return (
      <div className="text-center py-12">
        <svg className="w-20 h-20 mx-auto text-slate-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
        </svg>
        <h3 className="text-xl font-semibold text-slate-300 mb-2">Your Library is Empty</h3>
        <p className="text-slate-400">Generate your first track to get started!</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <h2 className="text-3xl font-bold text-slate-200 text-center md:text-left">
          Your Library <span className="text-cyan-400">({files.length})</span>
        </h2>
        <button
          onClick={loadLibrary}
          className="px-6 py-3 bg-slate-800 hover:bg-slate-700 rounded-xl transition text-sm flex items-center gap-2 font-medium"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </button>
      </div>

      {selectedFile && (
        <div className="mb-8">
          <AudioPlayer 
            audioUrl={selectedFile.path} 
            title={selectedFile.filename}
            showMixerControls={true}
          />
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {files.map((file) => (
          <div
            key={file.filename}
            className={`bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm rounded-xl p-5 border transition-all cursor-pointer ${
              selectedFile?.filename === file.filename
                ? 'border-cyan-500 shadow-lg shadow-cyan-500/20'
                : 'border-slate-700/50 hover:border-slate-600'
            }`}
            onClick={() => setSelectedFile(file)}
          >
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center">
                <svg className="w-7 h-7 text-cyan-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
                </svg>
              </div>
              
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-slate-200 truncate text-base mb-2">
                  {file.filename.replace('musicgen_', '').replace('.wav', '')}
                </h3>
                <div className="space-y-1 text-xs text-slate-400">
                  <p>{formatFileSize(file.size)}</p>
                  <p>{formatDate(file.modified)}</p>
                </div>
              </div>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                setSelectedFile(file);
              }}
              className={`w-full mt-4 py-2.5 rounded-lg text-sm font-semibold transition ${
                selectedFile?.filename === file.filename
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg'
                  : 'bg-slate-700 text-slate-200 hover:bg-slate-600'
              }`}
            >
              {selectedFile?.filename === file.filename ? 'Now Playing' : 'Play'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

