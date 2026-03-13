import { useCallback, useRef, useState } from "react";

interface UploadZoneProps {
  onImageLoaded: (img: HTMLImageElement, file: File) => void;
}

type UploadNoticeTone = "idle" | "info" | "success" | "error";

const DEFAULT_NOTICE = {
  tone: "idle" as const,
  text: "PNG only. Best for pixel art, sprites, UI sheets, and crunchy screenshots.",
};

export default function UploadZone({ onImageLoaded }: UploadZoneProps) {
  const [dragging, setDragging] = useState(false);
  const [notice, setNotice] = useState<{ tone: UploadNoticeTone; text: string }>(DEFAULT_NOTICE);
  const inputRef = useRef<HTMLInputElement>(null);

  // process the uploaded file, validate it, and create an Image object 
  // useCallback to memoize the function and avoid unnecessary re-renders
  const processFile = useCallback(
    (file: File) => {
      // validate file type (png)
      if (!file || file.type !== "image/png") {
        setNotice({
          tone: "error",
          text: "Signal rejected. Feed me a PNG so the pixel grid stays crisp.",
        });
        return;
      }
      setNotice({
        tone: "success",
        text: `Handshake complete: ${file.name}. Rendering source image...`,
      });
      // create an object URL for the file and load it into an Image object
      const url = URL.createObjectURL(file);
      const img = new Image();
      const cleanup = () => {
        URL.revokeObjectURL(url);
      };
      img.onload = () => {
        onImageLoaded(img, file);
        cleanup();
      };
      img.onerror = () => {
        cleanup();
        setNotice({
          tone: "error",
          text: "Decode failed. Try a different PNG source.",
        });
      };
      img.onabort = () => {
        cleanup();
      };
      img.src = url;
    },
    [onImageLoaded]
  );

  // handle file drop event
  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) processFile(file);
    },
    [processFile]
  );

  // handle file selection
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) processFile(file);
      e.target.value = "";
    },
    [processFile]
  );

  return (
    <div
      className={`upload-zone glass-panel rounded-sm p-10 text-center transition-all duration-300 ${
        dragging ? "drag-over" : ""
      }`}
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
        setNotice({ tone: "info", text: "Drop the PNG and I will duplicate every pixel cleanly." });
      }}
      onDragLeave={() => {
        setDragging(false);
        setNotice(DEFAULT_NOTICE);
      }}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      style={{ cursor: "pointer" }}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          inputRef.current?.click();
        }
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".png,image/png"
        className="hidden"
        onChange={handleChange}
      />

      {/* Icon */}
      <div className="mb-4 flex justify-center upload-glyph-wrap">
        <svg width="52" height="52" viewBox="0 0 52 52" fill="none">
          <rect x="1" y="1" width="50" height="50" rx="2"
            stroke="var(--neon-blue)" strokeWidth="1" strokeDasharray="4 3" opacity="0.6"/>
          {/* grid of pixels */}
          {[0,1,2,3].map(row =>
            [0,1,2,3].map(col => (
              <rect
                key={`${row}-${col}`}
                className="upload-pixel"
                x={14 + col * 7}
                y={14 + row * 7}
                width="5" height="5"
                fill={
                  (row + col) % 3 === 0 ? "var(--neon-pink)" :
                  (row + col) % 3 === 1 ? "var(--neon-blue)" :
                  "var(--neon-purple)"
                }
                opacity={dragging ? 1 : 0.7}
              />
            ))
          )}
          <path d="M26 44 L26 36 M22 40 L26 36 L30 40"
            stroke="var(--neon-cyan)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>

      <p
        className="mb-1 glow-blue"
        style={{ fontFamily: "'Orbitron', monospace", fontSize: "1rem", letterSpacing: "0.2em", textTransform: "uppercase" }}
      >
        {dragging ? "DROP TO UPLOAD" : "DRAG & DROP PNG"}
      </p>
      <p style={{ fontSize: "0.9rem", color: "var(--text-muted)", letterSpacing: "0.1em" }}>
        or click to browse filesystem
      </p>
      <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "0.75rem", opacity: 0.8 }}>
        ACCEPTS: .PNG ONLY
      </p>

      <div className={`upload-status upload-status-${notice.tone}`} aria-live="polite">
        <span className="upload-status-dot" />
        <span>{notice.text}</span>
      </div>
    </div>
  );
}
