const SCALE = [2,3,4,8] as const;
type Scale = typeof SCALE[number];

interface UpscaleControlsProps {
  scale: Scale;
  onChange: (s: Scale) => void;
  processing: boolean;
  imageLoaded: boolean;
  originalSize: { w: number; h: number } | null;
  statusTone: "idle" | "processing" | "ready";
  statusMessage: string;
  processingMessage: string;
}

// UpscaleControls component renders the scale selection buttons, image size info, and status console.
export default function UpscaleControls({
  scale,
  onChange,
  processing,
  imageLoaded,
  originalSize,
  statusTone,
  statusMessage,
  processingMessage,
}: UpscaleControlsProps) {

return (
<div className="glass-panel rounded-sm p-5 relative">
      {/* corner decorations */}
      <span className="corner-tl" /><span className="corner-tr" />
      <span className="corner-bl" /><span className="corner-br" />

      {processing && <div className="processing-bar absolute top-0 left-0 right-0" />}

      <div className="flex flex-wrap items-center gap-6">
        {/* Label */}
        <div>
          <p className="preview-label glow-cyan mb-1" style={{ fontSize: "1rem" }}>
            SCALE FACTOR
          </p>
          <div className="flex gap-2">
            {SCALE.map((s) => (
              <button
                key={s}
                className={`scale-btn rounded-sm ${scale === s ? "active" : ""}`}
                onClick={() => onChange(s)}
                disabled={!imageLoaded || processing}
              >
                {s}×
              </button>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div style={{ width: "1px", height: "40px", background: "var(--border-dim)" }} />

        {/* Info */}
        {originalSize ? (
          <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", lineHeight: 1.7 }}>
            <p>
              <span style={{ color: "var(--neon-blue)" }}>INPUT </span>
              {originalSize.w} × {originalSize.h}px
            </p>
            <p>
              <span style={{ color: "var(--neon-pink)" }}>OUTPUT </span>
              {originalSize.w * scale} × {originalSize.h * scale}px
            </p>
          </div>
        ) : (
          <p style={{ fontSize: "1rem", color: "var(--text-muted)" }}>
            no image loaded
          </p>
        )}

        {/* Status */}
        {processing && (
          <div className="ml-auto flex items-center gap-2">
            <span style={{
              display: "inline-block",
              width: "6px",
              height: "6px",
              borderRadius: "50%",
              background: "var(--neon-pink)",
              animation: "pulseGlow 0.8s ease-in-out infinite",
              boxShadow: "0 0 8px var(--neon-pink)",
            }} />
            <span style={{ fontFamily: "'Orbitron', monospace", fontSize: "0.8rem", color: "var(--neon-pink)", letterSpacing: "0.15em" }}>
              PROCESSING
            </span>
          </div>
        )}
      </div>

      <div className={`signal-console signal-console-${statusTone}`} aria-live="polite">
        <div className="signal-console-heading">
          <span className="signal-console-led" />
          <span>{processing ? 'PIXEL ROUTER' : 'SYSTEM STATUS'}</span>
        </div>
        <p>{processing ? processingMessage : statusMessage}</p>
      </div>
    </div>
  );
}
