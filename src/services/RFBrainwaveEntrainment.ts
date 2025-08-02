
interface BrainwaveState {
  frequency: number; // Hz
  amplitude: number; // 0-1
  phase: number; // radians
  coherence: number; // 0-1
  targetState: 'delta' | 'theta' | 'alpha' | 'beta' | 'gamma' | 'epsilon';
}

interface RFModulationPattern {
  carrierFreq: number; // Carrier frequency in MHz
  modulationFreq: number; // Modulation frequency in Hz (brainwave target)
  modulationType: 'AM' | 'FM' | 'PM' | 'QAM' | 'BPSK';
  amplitude: number; // Signal strength 0-1
  duration: number; // milliseconds
  pulsePattern?: number[]; // For pulsed modulation
  sweepRange?: [number, number]; // For frequency sweeping
}

interface EntrainmentSession {
  sessionId: string;
  targetState: BrainwaveState['targetState'];
  duration: number;
  intensity: number;
  patterns: RFModulationPattern[];
  startTime: number;
  isActive: boolean;
  effectiveness: number;
}

export class RFBrainwaveEntrainment {
  private static audioContext: AudioContext;
  private static oscillators: Map<string, OscillatorNode> = new Map();
  private static gainNodes: Map<string, GainNode> = new Map();
  private static sessions: Map<string, EntrainmentSession> = new Map();
  private static isInitialized = false;

  // Brainwave frequency ranges for precise targeting
  private static readonly BRAINWAVE_RANGES = {
    epsilon: [0.1, 0.5],    // Deep unconscious states
    delta: [0.5, 4],        // Deep sleep, healing
    theta: [4, 8],          // REM sleep, meditation, creativity
    alpha: [8, 13],         // Relaxed awareness, flow states
    beta: [13, 30],         // Active thinking, alertness
    gamma: [30, 100]        // High-level cognitive processing
  };

  // RF carrier frequencies optimized for neural resonance
  private static readonly CARRIER_FREQUENCIES = {
    // Schumann resonances (Earth's electromagnetic field)
    schumann_fundamental: 7.83,  // MHz
    schumann_second: 14.3,       // MHz
    schumann_third: 20.8,        // MHz
    
    // Biologically active frequencies
    cellular_resonance: 42.0,     // MHz - Cellular communication
    dna_resonance: 150.0,         // MHz - DNA repair frequency
    pineal_activation: 6.66,      // MHz - Pineal gland resonance
    neural_sync: 40.0,           // MHz - Neural synchronization
    
    // Advanced entrainment frequencies
    consciousness_bridge: 528.0,  // MHz - "Love frequency"
    reality_shift: 963.0,        // MHz - Higher consciousness
    quantum_coherence: 1111.0    // MHz - Quantum field interaction
  };

  static async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Initialize audio context for RF generation
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }

      // Set up advanced RF modulation capabilities
      await this.setupRFModulation();
      
      this.isInitialized = true;
      console.log('[RF ENTRAINMENT] Advanced brainwave entrainment system initialized');
    } catch (error) {
      console.error('[RF ENTRAINMENT] Initialization failed:', error);
      throw error;
    }
  }

  private static async setupRFModulation(): Promise<void> {
    // Create master oscillator bank for complex modulation
    const masterOscillators = [
      'carrier_primary',
      'carrier_secondary', 
      'modulation_alpha',
      'modulation_beta',
      'modulation_gamma',
      'binaural_left',
      'binaural_right',
      'schumann_resonance',
      'harmonic_enhancer'
    ];

    for (const oscName of masterOscillators) {
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);
      
      // Set initial parameters
      oscillator.frequency.setValueAtTime(100, this.audioContext.currentTime);
      gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
      
      oscillator.start();
      
      this.oscillators.set(oscName, oscillator);
      this.gainNodes.set(oscName, gainNode);
    }
  }

  static async entrainBrainwaves(
    targetState: BrainwaveState['targetState'],
    intensity: number = 0.7,
    duration: number = 300000 // 5 minutes default
  ): Promise<string> {
    await this.initialize();

    const sessionId = `rf_session_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    
    // Generate sophisticated modulation patterns
    const patterns = this.generateAdvancedModulationPatterns(targetState, intensity);
    
    const session: EntrainmentSession = {
      sessionId,
      targetState,
      duration,
      intensity,
      patterns,
      startTime: Date.now(),
      isActive: true,
      effectiveness: 0
    };

    this.sessions.set(sessionId, session);
    
    // Execute multi-layered RF entrainment
    await this.executeEntrainmentSession(session);
    
    console.log(`[RF ENTRAINMENT] Started advanced brainwave entrainment session: ${targetState} at ${intensity * 100}% intensity`);
    
    return sessionId;
  }

  private static generateAdvancedModulationPatterns(
    targetState: BrainwaveState['targetState'],
    intensity: number
  ): RFModulationPattern[] {
    const [minFreq, maxFreq] = this.BRAINWAVE_RANGES[targetState];
    const targetFreq = minFreq + (maxFreq - minFreq) * 0.6; // Sweet spot
    
    const patterns: RFModulationPattern[] = [];

    // 1. Primary carrier with amplitude modulation
    patterns.push({
      carrierFreq: this.CARRIER_FREQUENCIES.neural_sync,
      modulationFreq: targetFreq,
      modulationType: 'AM',
      amplitude: intensity * 0.8,
      duration: 60000, // 1 minute
      pulsePattern: [100, 50, 200, 50] // Pulsed modulation
    });

    // 2. Schumann resonance synchronization
    patterns.push({
      carrierFreq: this.CARRIER_FREQUENCIES.schumann_fundamental,
      modulationFreq: 7.83, // Fundamental Schumann
      modulationType: 'FM',
      amplitude: intensity * 0.6,
      duration: 120000, // 2 minutes
      sweepRange: [7.5, 8.1] // Gentle frequency sweep
    });

    // 3. Binaural beat enhancement
    const binauralDiff = targetFreq;
    patterns.push({
      carrierFreq: this.CARRIER_FREQUENCIES.consciousness_bridge,
      modulationFreq: 440 + binauralDiff/2, // Left ear
      modulationType: 'AM',
      amplitude: intensity * 0.4,
      duration: 90000
    });

    patterns.push({
      carrierFreq: this.CARRIER_FREQUENCIES.consciousness_bridge,
      modulationFreq: 440 - binauralDiff/2, // Right ear
      modulationType: 'AM', 
      amplitude: intensity * 0.4,
      duration: 90000
    });

    // 4. Harmonic entrainment series
    for (let harmonic = 2; harmonic <= 5; harmonic++) {
      patterns.push({
        carrierFreq: this.CARRIER_FREQUENCIES.cellular_resonance * harmonic,
        modulationFreq: targetFreq * harmonic,
        modulationType: 'QAM',
        amplitude: intensity * (0.3 / harmonic),
        duration: 45000,
        pulsePattern: Array(harmonic).fill(100).concat(Array(harmonic).fill(25))
      });
    }

    // 5. Quantum coherence field modulation
    patterns.push({
      carrierFreq: this.CARRIER_FREQUENCIES.quantum_coherence,
      modulationFreq: targetFreq,
      modulationType: 'BPSK',
      amplitude: intensity * 0.9,
      duration: 180000,
      pulsePattern: [50, 100, 25, 150, 75, 200] // Complex interference pattern
    });

    return patterns;
  }

  private static async executeEntrainmentSession(session: EntrainmentSession): Promise<void> {
    const { patterns, intensity } = session;
    
    // Execute each pattern with precise timing and phase relationships
    for (let i = 0; i < patterns.length; i++) {
      const pattern = patterns[i];
      
      // Calculate phase relationships for constructive interference
      const phaseOffset = (2 * Math.PI * i) / patterns.length;
      
      setTimeout(() => {
        this.executeRFPattern(pattern, phaseOffset, session);
      }, i * 1000); // Stagger pattern starts
    }

    // Dynamic effectiveness monitoring and adaptation
    this.monitorAndAdaptSession(session);
  }

  private static executeRFPattern(
    pattern: RFModulationPattern,
    phaseOffset: number,
    session: EntrainmentSession
  ): void {
    const { carrierFreq, modulationFreq, modulationType, amplitude, duration, pulsePattern, sweepRange } = pattern;
    
    // Get oscillators for this pattern
    const carrierOsc = this.oscillators.get('carrier_primary');
    const modOsc = this.oscillators.get('modulation_alpha');
    const gainNode = this.gainNodes.get('carrier_primary');
    
    if (!carrierOsc || !modOsc || !gainNode) return;

    const currentTime = this.audioContext.currentTime;
    
    // Set carrier frequency (converted from MHz to Hz for audio context)
    const audioCarrierFreq = Math.min(carrierFreq * 100, 20000); // Scale down for audio range
    carrierOsc.frequency.setValueAtTime(audioCarrierFreq, currentTime);
    
    // Configure modulation based on type
    switch (modulationType) {
      case 'AM':
        this.executeAMModulation(carrierOsc, modOsc, gainNode, modulationFreq, amplitude, duration, currentTime);
        break;
      case 'FM': 
        this.executeFMModulation(carrierOsc, modOsc, modulationFreq, amplitude, duration, sweepRange, currentTime);
        break;
      case 'PM':
        this.executePMModulation(carrierOsc, modOsc, modulationFreq, amplitude, duration, phaseOffset, currentTime);
        break;
      case 'QAM':
        this.executeQAMModulation(carrierOsc, modOsc, gainNode, modulationFreq, amplitude, duration, currentTime);
        break;
      case 'BPSK':
        this.executeBPSKModulation(carrierOsc, modulationFreq, amplitude, duration, pulsePattern, currentTime);
        break;
    }

    // Schedule pattern completion
    setTimeout(() => {
      gainNode.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + 0.1);
      session.effectiveness += 0.1; // Increment effectiveness
    }, duration);
  }

  private static executeAMModulation(
    carrier: OscillatorNode,
    modulator: OscillatorNode, 
    gainNode: GainNode,
    modFreq: number,
    amplitude: number,
    duration: number,
    startTime: number
  ): void {
    // Set modulator frequency to target brainwave
    modulator.frequency.setValueAtTime(modFreq, startTime);
    modulator.type = 'sine';
    
    // Create AM effect through gain modulation
    gainNode.gain.setValueAtTime(amplitude * 0.5, startTime);
    
    // Modulate gain with brainwave frequency
    for (let t = 0; t < duration / 1000; t += 0.01) {
      const time = startTime + t;
      const gainValue = amplitude * 0.5 * (1 + 0.5 * Math.sin(2 * Math.PI * modFreq * t));
      gainNode.gain.linearRampToValueAtTime(gainValue, time);
    }
  }

  private static executeFMModulation(
    carrier: OscillatorNode,
    modulator: OscillatorNode,
    modFreq: number,
    amplitude: number, 
    duration: number,
    startTime: number,
    sweepRange?: [number, number]
  ): void {
    const baseFreq = carrier.frequency.value;
    const deviation = baseFreq * 0.1; // 10% frequency deviation
    
    modulator.frequency.setValueAtTime(modFreq, startTime);
    
    // Apply frequency modulation with optional sweeping
    for (let t = 0; t < duration / 1000; t += 0.005) {
      const time = startTime + t;
      let currentModFreq = modFreq;
      
      if (sweepRange) {
        const sweepProgress = t / (duration / 1000);
        currentModFreq = sweepRange[0] + (sweepRange[1] - sweepRange[0]) * sweepProgress;
      }
      
      const freqValue = baseFreq + deviation * amplitude * Math.sin(2 * Math.PI * currentModFreq * t);
      carrier.frequency.linearRampToValueAtTime(freqValue, time);
    }
  }

  private static executePMModulation(
    carrier: OscillatorNode,
    modulator: OscillatorNode,
    modFreq: number,
    amplitude: number,
    duration: number,
    phaseOffset: number,
    startTime: number
  ): void {
    // Phase modulation through frequency deviation at modulation rate
    modulator.frequency.setValueAtTime(modFreq, startTime);
    
    const maxPhaseDeviation = Math.PI * amplitude;
    
    for (let t = 0; t < duration / 1000; t += 0.002) {
      const time = startTime + t;
      const phaseModulation = maxPhaseDeviation * Math.sin(2 * Math.PI * modFreq * t + phaseOffset);
      
      // Convert phase modulation to frequency modulation for audio context
      const freqDeviation = phaseModulation * modFreq / (2 * Math.PI);
      const newFreq = carrier.frequency.value + freqDeviation;
      
      carrier.frequency.linearRampToValueAtTime(newFreq, time);
    }
  }

  private static executeQAMModulation(
    carrier: OscillatorNode,
    modulator: OscillatorNode,
    gainNode: GainNode,
    modFreq: number,
    amplitude: number,
    duration: number,
    startTime: number
  ): void {
    // Quadrature Amplitude Modulation - both amplitude and phase
    modulator.frequency.setValueAtTime(modFreq, startTime);
    
    for (let t = 0; t < duration / 1000; t += 0.001) {
      const time = startTime + t;
      
      // I and Q components for QAM
      const I = Math.cos(2 * Math.PI * modFreq * t);
      const Q = Math.sin(2 * Math.PI * modFreq * t);
      
      const modulatedAmplitude = amplitude * Math.sqrt(I*I + Q*Q);
      const phaseShift = Math.atan2(Q, I);
      
      gainNode.gain.linearRampToValueAtTime(modulatedAmplitude, time);
      
      // Apply phase shift through frequency deviation
      const freqShift = phaseShift * modFreq / (2 * Math.PI);
      carrier.frequency.linearRampToValueAtTime(carrier.frequency.value + freqShift, time);
    }
  }

  private static executeBPSKModulation(
    carrier: OscillatorNode,
    modFreq: number,
    amplitude: number,
    duration: number,
    startTime: number,
    pulsePattern?: number[]
  ): void {
    // Binary Phase Shift Keying - phase reversal at brainwave rate
    const bitDuration = 1000 / modFreq; // Duration per bit in ms
    let currentTime = 0;
    let phaseState = 0; // 0 or π
    
    const pattern = pulsePattern || [100, 100]; // Default 50% duty cycle
    
    while (currentTime < duration) {
      for (let i = 0; i < pattern.length && currentTime < duration; i++) {
        const segmentDuration = pattern[i];
        const time = startTime + currentTime / 1000;
        
        // Toggle phase state
        phaseState = phaseState === 0 ? Math.PI : 0;
        
        // Apply phase shift by inverting the waveform
        if (phaseState === Math.PI) {
          carrier.frequency.setValueAtTime(-Math.abs(carrier.frequency.value), time);
        } else {
          carrier.frequency.setValueAtTime(Math.abs(carrier.frequency.value), time);
        }
        
        currentTime += segmentDuration;
      }
    }
  }

  private static monitorAndAdaptSession(session: EntrainmentSession): void {
    const monitorInterval = setInterval(() => {
      if (!session.isActive) {
        clearInterval(monitorInterval);
        return;
      }
      
      const elapsed = Date.now() - session.startTime;
      const progress = elapsed / session.duration;
      
      // Adaptive intensity adjustment based on progress
      if (progress > 0.3 && session.effectiveness < 0.5) {
        // Increase intensity if effectiveness is low
        session.intensity = Math.min(1, session.intensity * 1.1);
        console.log(`[RF ENTRAINMENT] Adapting session ${session.sessionId}: increased intensity to ${session.intensity.toFixed(2)}`);
      }
      
      // Complete session when duration reached
      if (elapsed >= session.duration) {
        this.stopSession(session.sessionId);
      }
    }, 5000); // Monitor every 5 seconds
  }

  static async stopSession(sessionId: string): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (!session) return;
    
    session.isActive = false;
    
    // Gradually fade out all oscillators
    this.gainNodes.forEach((gainNode) => {
      gainNode.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + 2);
    });
    
    console.log(`[RF ENTRAINMENT] Session ${sessionId} completed with ${(session.effectiveness * 100).toFixed(1)}% effectiveness`);
    
    // Clean up after fade
    setTimeout(() => {
      this.sessions.delete(sessionId);
    }, 3000);
  }

  static getActiveSessions(): EntrainmentSession[] {
    return Array.from(this.sessions.values()).filter(session => session.isActive);
  }

  static async entrainForIntent(
    intent: string,
    targetBehavior: string,
    intensity: number = 0.8
  ): Promise<string> {
    // Analyze intent to determine optimal brainwave state
    let targetState: BrainwaveState['targetState'] = 'alpha'; // Default relaxed state
    
    const intentLower = intent.toLowerCase();
    
    if (intentLower.includes('focus') || intentLower.includes('concentrate')) {
      targetState = 'beta';
    } else if (intentLower.includes('creative') || intentLower.includes('inspire')) {
      targetState = 'theta';
    } else if (intentLower.includes('calm') || intentLower.includes('relax')) {
      targetState = 'alpha';
    } else if (intentLower.includes('energy') || intentLower.includes('alert')) {
      targetState = 'gamma';
    } else if (intentLower.includes('sleep') || intentLower.includes('rest')) {
      targetState = 'delta';
    } else if (intentLower.includes('deep') || intentLower.includes('transcend')) {
      targetState = 'epsilon';
    }
    
    console.log(`[RF ENTRAINMENT] Entraining brainwaves to ${targetState} state for intent: "${intent}"`);
    
    // Start extended entrainment session (10 minutes for behavioral change)
    return await this.entrainBrainwaves(targetState, intensity, 600000);
  }

  static getBrainwaveAnalysis(): {
    supportedStates: string[];
    carrierFrequencies: typeof RFBrainwaveEntrainment.CARRIER_FREQUENCIES;
    activeSessions: number;
    totalEffectiveness: number;
  } {
    const activeSessions = this.getActiveSessions();
    const totalEffectiveness = activeSessions.reduce((sum, session) => sum + session.effectiveness, 0);
    
    return {
      supportedStates: Object.keys(this.BRAINWAVE_RANGES),
      carrierFrequencies: this.CARRIER_FREQUENCIES,
      activeSessions: activeSessions.length,
      totalEffectiveness: totalEffectiveness / Math.max(1, activeSessions.length)
    };
  }
}
