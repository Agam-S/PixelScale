import { useEffect, useRef } from "react";

interface ImagePreviewProps {
  label: string;
  imageData: ImageData | null;
  accentColor: "pink" | "blue";
}
export default function ImagePreview({ label, imageData, accentColor }: ImagePreviewProps) {
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const colorVar = accentColor === "pink" ? "var(--neon-pink)" : "var(--neon-blue)";
  const glowClass = accentColor === "pink" ? "glow-pink" : "glow-blue";

  // whenever imageData changes, useEffect updates the canvas content
  useEffect(() => {
    const canvas = canvasRef.current;
    // if there's no canvas or imageData is null, clear the canvas and exit
    if (!canvas) return;
    if (!imageData) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        canvas.width = 1;
        canvas.height = 1;
        ctx.clearRect(0, 0, 1, 1);
      }
      return;
    }
    canvas.width = imageData.width;
    canvas.height = imageData.height;
    // draw the new image data onto the canvas
    const ctx = canvas.getContext("2d");
    if (ctx) ctx.putImageData(imageData, 0, 0);
  }, [imageData]);

  return (
    <div
      className="glass-panel rounded-sm p-4 flex flex-col gap-3 relative"
      style={{ borderColor: colorVar, boxShadow: `0 0 18px ${colorVar}30, inset 0 0 20px ${colorVar}05` }}
    >
      {/* corner decorations */}
      <span className="corner-tl" style={{ borderColor: colorVar }} />
      <span className="corner-tr" style={{ borderColor: colorVar }} />
      <span className="corner-bl" style={{ borderColor: colorVar }} />
      <span className="corner-br" style={{ borderColor: colorVar }} />

      {/* Header */}
      <div className="flex items-center justify-between">
        <p className={`preview-label ${glowClass}`} style={{ color: colorVar }}>
          {label}
        </p>
        {imageData && (
          <span style={{ fontSize: "0.65rem", color: "var(--text-muted)", letterSpacing: "0.08em" }}>
            {imageData.width} × {imageData.height}
          </span>
        )}
      </div>

      {/* Canvas */}
      <div className="preview-canvas-wrap rounded-sm" style={{
        background: "repeating-conic-gradient(rgba(255,255,255,0.03) 0% 25%, transparent 0% 50%) 0 0 / 16px 16px",
        minHeight: "220px",
      }}>
        {imageData ? (
          <canvas
            ref={canvasRef}
            style={{
              imageRendering: "pixelated",
              maxWidth: "100%",
              maxHeight: "420px",
              display: "block",
            }}
          />
        ) : (
          <div className="canvas-placeholder flex flex-col items-center gap-2">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" opacity="0.3">
              <rect x="1" y="1" width="30" height="30" rx="1" stroke={colorVar} strokeWidth="1"/>
              <line x1="1" y1="16" x2="31" y2="16" stroke={colorVar} strokeWidth="0.5"/>
              <line x1="16" y1="1" x2="16" y2="31" stroke={colorVar} strokeWidth="0.5"/>
            </svg>
            <span>NO DATA</span>
          </div>
        )}
      </div>
    </div>
  );
}
