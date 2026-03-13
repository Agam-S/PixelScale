import { useCallback, useEffect, useRef, useState } from "react";

interface DownloadButtonProps {
  imageData: ImageData | null;
  scale: number;
  originalName: string;
}

export default function DownloadButton({
  imageData,
  scale,
  originalName,
}: DownloadButtonProps) {
  const disabled = !imageData;
  // downloadState tracks the button's state: "idle" (no image), "armed" (ready to download), and "complete" (downloaded with success feedback)
  const [downloadState, setDownloadState] = useState<"idle" | "armed" | "complete">("idle");
  // resetTimerRef is used to reset the button state back to "armed" after showing the "complete" state for a short duration
  const resetTimerRef = useRef<number | null>(null);

  // cleanup timer on unmount to prevent memory leaks
  useEffect(() => {
    return () => {
      if (resetTimerRef.current) {
        window.clearTimeout(resetTimerRef.current);
      }
    };
  }, []);

  // whenever imageData changes, update the downloadState accordingly
  useEffect(() => {
    if (!imageData) {
      setDownloadState("idle");
    } else if (downloadState === "idle") {
      setDownloadState("armed");
    }
  }, [imageData, downloadState]);

  // handleDownload creates a temporary canvas to convert the ImageData into a PNG blob, then triggers a download with a filename based on the original name and scale factor. 
  const handleDownload = useCallback(() => {
    if (!imageData) return;

    const canvas = document.createElement("canvas");
    canvas.width = imageData.width;
    canvas.height = imageData.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.putImageData(imageData, 0, 0);

    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      const base = originalName.replace(/\.png$/i, "");
      a.href = url;
      a.download = `${base}_${scale}x_upscaled.png`;
      a.click();
      URL.revokeObjectURL(url);
      setDownloadState("complete");
      if (resetTimerRef.current) {
        window.clearTimeout(resetTimerRef.current);
      }
      resetTimerRef.current = window.setTimeout(() => {
        setDownloadState("armed");
      }, 2200);
    }, "image/png");
  }, [imageData, scale, originalName]);

// labels for the button and hint text change based on the downloadState and whether the button is disabled. 
  const buttonLabel = disabled
    ? `EXPORT PNG - ${scale}× UPSCALED`
    : downloadState === "complete"
      ? "PNG EXPORTED"
      : `EXPORT PNG - ${scale}× UPSCALED`;
  const hintLabel = disabled
    ? "Load an image to unlock export."
    : downloadState === "complete"
      ? "Export complete."
      : "Writes a clean PNG with nearest-neighbor scaling only.";

  return (
    <div className="download-cluster">
      <button
        className={`btn-cyber btn-pink rounded-sm px-8 py-3 text-sm w-full sm:w-auto ${downloadState === 'complete' ? 'download-success' : ''}`}
        onClick={handleDownload}
        disabled={disabled}
        style={{ opacity: disabled ? 0.35 : 1 }}
      >
        <span className="flex items-center justify-center gap-3">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M8 2 L8 10 M4 7 L8 11 L12 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <line x1="2" y1="14" x2="14" y2="14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          {buttonLabel}
        </span>
      </button>
      <p className="download-hint" aria-live="polite">{hintLabel}</p>
    </div>
  );
}
