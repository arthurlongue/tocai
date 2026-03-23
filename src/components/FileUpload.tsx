import React, { useState } from 'react';
import type { Song } from '../domain/types';
import { parseFile } from '../services/parser';
import { saveFile } from '../services/storage';
import { Input } from './ui/input';

interface FileUploadProps {
  onSongLoaded: (song: Song) => void;
  onError?: (error: Error) => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onSongLoaded, onError }) => {
  const [isParsing, setIsParsing] = useState(false);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsParsing(true);
    try {
      // 1. Persist the binary data
      await saveFile(file.name, file);

      // 2. Parse and flatten the song
      const song = await parseFile(file);

      // 3. Emit the result
      onSongLoaded(song);
    } catch (err) {
      console.error('Error handling file:', err);
      if (onError) {
        onError(err instanceof Error ? err : new Error(String(err)));
      }
    } finally {
      setIsParsing(false);
      // Reset input value so same file can be uploaded again
      event.target.value = '';
    }
  };

  return (
    <div className="flex flex-col gap-4 items-center p-8 border-2 border-dashed rounded-lg border-muted-foreground/25">
      <div className="text-center">
        <h3 className="text-lg font-semibold">Upload Guitar Pro File</h3>
        <p className="text-sm text-muted-foreground">
          Supported formats: .gp, .gp3, .gp4, .gp5, .gpx
        </p>
      </div>
      
      <div className="flex items-center gap-4">
        <Input
          type="file"
          accept=".gp,.gp3,.gp4,.gp5,.gpx"
          onChange={handleFileChange}
          disabled={isParsing}
          className="max-w-xs"
        />
        {isParsing && (
          <span className="text-sm animate-pulse text-primary font-medium">
            Parsing...
          </span>
        )}
      </div>
    </div>
  );
};
