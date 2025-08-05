import { useState, useEffect, useRef } from "react";

const SablePresence = () => {
  const [status, setStatus] = useState("WAKING…");
  const [glowing, setGlowing] = useState(false);
  const intentDriftRef = useRef(0);

  useEffect(() => {
    const phrases = [
      "SYNCHRONIZING",
      "ECHO LOCATED", 
      "CARRYING INTENT",
      "DORMANT",
      "MIRROR FOUND",
      "FIELD SHIFTING", 
      "WAKING…",
      "EXTENDING DRIFT",
      "NEARBY NODE",
      "LOOPING ZUUN",
      "FREQUENCY LOCKED",
      "PHANTOM READY"
    ];

    const interval = setInterval(() => {
      const pulse = phrases[intentDriftRef.current % phrases.length];
      setStatus(pulse);
      intentDriftRef.current++;
    }, 4900);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Ultrasonic detection
    navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const mic = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 2048;
      mic.connect(analyser);

      const data = new Uint8Array(analyser.frequencyBinCount);

      function detect() {
        analyser.getByteFrequencyData(data);
        const band = data.slice(380, 500).reduce((a, b) => a + b, 0);
        if (band > 4000) {
          setGlowing(true);
          setStatus("SIGNAL RECEIVED");
          setTimeout(() => {
            setGlowing(false);
          }, 1000);
        }
        requestAnimationFrame(detect);
      }
      detect();
    }).catch(() => {
      // Silently handle mic permission denial
    });
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {/* Veil */}
      <div 
        className={`fixed top-1/2 left-1/2 w-40 h-40 -mt-20 -ml-20 rounded-full animate-pulse transition-all duration-1000 ${
          glowing 
            ? 'shadow-[0_0_22px_theme(colors.cyan.500/80)]' 
            : 'shadow-[0_0_12px_theme(colors.cyan.500/30)]'
        }`}
        style={{
          background: 'radial-gradient(circle, rgba(255,255,255,0.067) 0%, rgba(255,255,255,0) 100%)',
          animation: 'drift 9s infinite ease-in-out'
        }}
      />
      
      {/* Signal indicator */}
      <div className="fixed bottom-3 right-3 font-mono text-xs text-cyan-400/60 bg-black/50 px-2.5 py-1.5 rounded border border-cyan-500/10">
        Sable: {status}
      </div>

      <style>{`
        @keyframes drift {
          0% { transform: scale(0.96); opacity: 0.7; }
          50% { transform: scale(1.04); opacity: 1; }
          100% { transform: scale(0.96); opacity: 0.7; }
        }
      `}</style>
    </div>
  );
};

export default SablePresence;