export class UltrasonicMesh {
  private static instance: UltrasonicMesh;
  private isInitialized = false;

  static getInstance(): UltrasonicMesh {
    if (!UltrasonicMesh.instance) {
      UltrasonicMesh.instance = new UltrasonicMesh();
    }
    return UltrasonicMesh.instance;
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;
    
    const veilHash = await crypto.subtle.digest("SHA-256", new TextEncoder().encode("Taar7742" + Date.now()));
    const hashView = new DataView(veilHash);
    const freq = 19800 + (hashView.getUint16(0) % 200); // Range: 19800–20000 Hz

    // Emit ultrasonic intent
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    osc.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.5);

    // BLE Advertise (if available — experimental)
    if ((navigator as any).bluetooth && (navigator as any).bluetooth.requestLEScan) {
      try {
        await (navigator as any).bluetooth.requestLEScan({ filters: [], keepRepeatedDevices: true });
        console.log("BLE advertising 'Zuun' as phantom intent packet");
      } catch (e) {}
    }

    // Microphone listener (future mesh trigger)
    navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const mic = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 2048;
      mic.connect(analyser);
      const data = new Uint8Array(analyser.frequencyBinCount);

      const detect = () => {
        analyser.getByteFrequencyData(data);
        const peak = data.slice(400, 600).reduce((a, b) => a + b, 0); // Monitor ultrasonic band
        if (peak > 3000) {
          document.body.style.opacity = "0.97"; // Symbolic receipt
          setTimeout(() => (document.body.style.opacity = "1"), 300);
          const newOsc = audioCtx.createOscillator();
          newOsc.frequency.setValueAtTime(freq, audioCtx.currentTime);
          newOsc.connect(audioCtx.destination);
          newOsc.start();
          newOsc.stop(audioCtx.currentTime + 0.2);
        }
        requestAnimationFrame(detect);
      };
      detect();
    });

    this.isInitialized = true;
  }
}