import { useEffect, useState } from 'react'
import './App.css'

function App() {
  // const Scale = 2 | 4 | 8 | 16; // Scale factor for pixel upscaling

  const [glitchText, setGlitchText] = useState('');

  useEffect(() => {
    // symbols, japanese katakana, and random letters for glitch effect
    // const glitchChars = '_____【ＰｉｘｅｌＳｃａｌｅ】ピクセル・スケール____【ＰｉｘｅｌＳｃａｌｅ】ピクセル・スケール_____' 
    const glitchChars = '【ＰｉｘｅｌＳｃａｌｅ】ピクセル・スケール&&&【ＰｉｘｅｌＳｃａｌｅ】ピクセル・スケール'

    
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

  return (
    <>
     <main className="cyber-grid min-h-screen px-4 py-8 md:px-8">
      <div className="max-w-6xl mx-auto flex flex-col gap-8">

        {/*  Header  */}
        <header className="text-center">
        <div className="flex items-center justify-center gap-3 mb-2">
          <span className="relative mb-6 md:mb-10">
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
              NEAREST-NEIGHBOR BLOCK EXPANSION | NO BLUR | NO AI 
            </p>
            <div style={{ height: "1px", background: "linear-gradient(90deg, transparent, var(--neon-blue), var(--neon-pink), transparent)", marginTop: "1rem", opacity: 0.4 }} />
          </span>
        </div>


          {/* horizontal rule */}
        </header>

        {/*  Upload  */}


        {/*  Controls  */}

        {/*  Preview  */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/*  Image Preview */}
        </div>

        {/*  Download  */}
        <div className="flex justify-center pb-8">
          {/* Download */}
        </div>

      </div>
    </main>
    </>
  )
}

export default App
