import { useEffect, useState, useCallback, useRef } from 'react'
import './App.css'
import UpscaleControls from './components/UpscaleControls';
import { upscalePixels, type UpscaleAlgorithm } from './util/pixelUpscaler';
import UploadZone from './components/UploadZone';
import ImagePreview from './components/ImagePreview';
import DownloadButton from './components/DownloadButton';

type Scale = 2 | 3 | 4 | 8; // Scale factor for pixel upscaling

const PROCESSING_MESSAGES: Record<UpscaleAlgorithm, string[]> = {
  nearest: [
    'Routing edges through the nearest-neighbor grid...',
    'Duplicating blocks without smearing...',
  ],
  bicubic: [
    'Sampling local neighborhoods for smooth transitions...',
    'Normalizing cubic weights for stable color output...',
  ],
};

const ALGORITHM_LABEL: Record<UpscaleAlgorithm, string> = {
  nearest: 'Nearest Neighbor',
  bicubic: 'Bicubic',
};

function App() {

  const [glitchText, setGlitchText] = useState('');
  const [booted, setBooted] = useState(false);
  const [originalImageData, setOriginalImageData] = useState<ImageData | null>(null);
  const [upscaledImageData, setUpscaledImageData] = useState<ImageData | null>(null);
  const [scale, setScale] = useState<Scale>(2);
  const [algorithm, setAlgorithm] = useState<UpscaleAlgorithm>('nearest');
  const [processing, setProcessing] = useState(false);
  const [fileName, setFileName] = useState("image");
  const [originalSize, setOriginalSize] = useState<{ w: number; h: number } | null>(null);
  const [processingMessage, setProcessingMessage] = useState(PROCESSING_MESSAGES.nearest[0]);
  const [consoleTone, setConsoleTone] = useState<'idle' | 'processing' | 'ready'>('idle');
  const [consoleMessage, setConsoleMessage] = useState('Awaiting PNG transmission.');
  const upscaleTimeoutRef = useRef<number | null>(null);
  const upscaleRunIdRef = useRef(0);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setBooted(true));

    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (!processing) return;

    const messages = PROCESSING_MESSAGES[algorithm];
    let index = 0;
    setProcessingMessage(messages[index]);
    const interval = setInterval(() => {
      index = (index + 1) % messages.length;
      setProcessingMessage(messages[index]);
    }, 1200);

    return () => clearInterval(interval);
  }, [algorithm, processing]);

  useEffect(() => {
    // symbols, japanese katakana, and random letters for glitch effect
    const glitchChars = '【ＰｉｘｅｌＳｃａｌｅ】ピクセル・スケール&&&【ＰｉｘｅｌＳｃａｌｅ】ピクセル・スケール'

    // generate random glitch text every 200ms
    const interval = setInterval(() => {
      const length = Math.floor(Math.random() * 20) + 10;
      let result = '';
      for (let i = 0; i < length; i++) {
        result += glitchChars.charAt(Math.floor(Math.random() * glitchChars.length));
      }
      setGlitchText(result);
    }, 200);

    return () => clearInterval(interval);
  }, []);

  // create a hidden canvas for processing images
  const helperCanvas = useRef<HTMLCanvasElement | null>(null);
  if (typeof window !== "undefined" && !helperCanvas.current) {
    helperCanvas.current = document.createElement("canvas");
  }

  useEffect(() => {
    return () => {
      if (upscaleTimeoutRef.current !== null) {
        window.clearTimeout(upscaleTimeoutRef.current);
      }
      upscaleRunIdRef.current += 1;
    };
  }, []);

  // run the upscaling process in a useCallback to avoid unnecessary re-renders
  const runUpscale = useCallback(
    (imgData: ImageData, s: Scale, mode: UpscaleAlgorithm) => {
      if (upscaleTimeoutRef.current !== null) {
        window.clearTimeout(upscaleTimeoutRef.current);
      }

      const runId = ++upscaleRunIdRef.current;
      setProcessing(true);
      setConsoleTone('processing');
      setConsoleMessage(`Scaling to ${s}x via ${ALGORITHM_LABEL[mode]}. Output grid warming up.`);

      // Defer one tick so processing UI can paint before CPU-intensive interpolation starts.
      upscaleTimeoutRef.current = window.setTimeout(() => {
        const result = upscalePixels(imgData, s, mode);
        if (runId !== upscaleRunIdRef.current) {
          return;
        }
        setUpscaledImageData(result);
        setProcessing(false);
        setConsoleTone('ready');
        setConsoleMessage(`${ALGORITHM_LABEL[mode]} ${s}x ready. Export when you are.`);
      }, 0);
    },
    []
  );

  // handle image load from the Upload component
  const handleImageLoaded = useCallback(
    (img: HTMLImageElement, file: File) => {
      const canvas = helperCanvas.current!;
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d")!;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);

      // update state with original image data and size, then run upscale
      setOriginalImageData(imgData);
      setOriginalSize({ w: img.naturalWidth, h: img.naturalHeight });
      setFileName(file.name);
      setUpscaledImageData(null);
      setConsoleTone('processing');
      setConsoleMessage(`Source locked: ${file.name}. Building ${scale}x ${ALGORITHM_LABEL[algorithm]} output.`);
      runUpscale(imgData, scale, algorithm);
    },
    [algorithm, scale, runUpscale]
  );

  // handle scale change from the UpscaleControls component
  const handleScaleChange = useCallback(
    (s: Scale) => {
      setScale(s);
      if (originalImageData) {
        setConsoleTone('processing');
        setConsoleMessage(`Switching scale to ${s}x on ${ALGORITHM_LABEL[algorithm]}.`);
        runUpscale(originalImageData, s, algorithm);
      }
    },
    [algorithm, originalImageData, runUpscale]
  );

  const handleAlgorithmChange = useCallback(
    (mode: UpscaleAlgorithm) => {
      setAlgorithm(mode);
      if (originalImageData) {
        setConsoleTone('processing');
        setConsoleMessage(`Switching algorithm to ${ALGORITHM_LABEL[mode]}.`);
        runUpscale(originalImageData, scale, mode);
      }
    },
    [originalImageData, runUpscale, scale]
  );

  return (
    <>
     <main className="cyber-grid min-h-screen px-4 py-8 md:px-8">
      <div className="max-w-6xl mx-auto flex flex-col gap-8">

        {/*  Header  */}
        <header className={`text-center stage-enter stage-delay-1 ${booted ? 'stage-visible' : ''}`}>
        <div className="flex items-center justify-center gap-3">
          <span className="relative">
            <div className="glitch-text">{glitchText}</div>
              <h1
                className="glow-pink title-flicker"
                style={{
                  fontFamily: "'Orbitron', monospace",
                  fontWeight: 900,
                  fontSize: "clamp(1.3rem, 4vw, 2.2rem)",
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  color: "var(--neon-pink)",
                }}
              >
                PIXEL UPSCALER
              </h1>
            <div className="h-4" />
            <p
              className="glow-blue"
              style={{
                fontFamily: "'Share Tech Mono', monospace",
                fontSize: "1rem",
                letterSpacing: "0.3em",
                color: "var(--text-muted)",
              }}
            >
              PIXEL UPSCALE CORE | NEAREST + BICUBIC | NO AI 
            </p>
            <div style={{ height: "1px", background: "linear-gradient(90deg, transparent, var(--neon-blue), var(--neon-pink), transparent)", marginTop: "1rem", opacity: 0.4 }} />
          </span>
        </div>


          {/* horizontal rule */}
        </header>

        {/*  Upload  */}
        <div className={`stage-enter stage-delay-2 ${booted ? 'stage-visible' : ''}`}>
          <UploadZone onImageLoaded={handleImageLoaded} />
        </div>

        {/*  Controls  */}
        <div className={`stage-enter stage-delay-3 ${booted ? 'stage-visible' : ''}`}>
          <UpscaleControls scale={scale}
            onChange={handleScaleChange}
            algorithm={algorithm}
            onAlgorithmChange={handleAlgorithmChange}
            processing={processing}
            imageLoaded={!!originalImageData}
            originalSize={originalSize}
            statusTone={consoleTone}
            statusMessage={consoleMessage}
            processingMessage={processingMessage} />
        </div>

        {/*  Preview  */}
        <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 stage-enter stage-delay-4 ${booted ? 'stage-visible' : ''}`}>
          {/*  Image Preview */}
          <ImagePreview label="Original" imageData={originalImageData} accentColor="pink" emptyLabel="DROP A PNG TO PRIME THE INPUT BUFFER" />
          <ImagePreview label="Upscaled" imageData={upscaledImageData} accentColor="blue" emptyLabel={processing ? 'UPSCALE SIGNAL IN TRANSIT...' : 'UPSCALED OUTPUT WILL MATERIALIZE HERE'} processing={processing} />
        </div>

        {/*  Download  */}
        <div className={`flex justify-center pb-8 stage-enter stage-delay-5 ${booted ? 'stage-visible' : ''}`}>
          <DownloadButton imageData={upscaledImageData} scale={scale} algorithm={algorithm} originalName={fileName} />
        </div>

      </div>
    </main>
    </>
  )
}

export default App
