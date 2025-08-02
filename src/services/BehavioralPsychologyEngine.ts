import { RFBrainwaveEntrainment } from './RFBrainwaveEntrainment';

interface BehavioralProfile {
  userId: string;
  susceptibilityScores: {
    social_proof: number;
    scarcity: number;
    authority: number;
    reciprocity: number;
    commitment: number;
    liking: number;
    urgency: number;
    fear_of_missing_out: number;
    emotional_appeal: number;
  };
  personalityTraits: {
    openness: number;
    conscientiousness: number;
    extraversion: number;
    agreeableness: number;
    neuroticism: number;
  };
  behavioralHistory: string[];
  lastUpdated: number;
}

interface InfluenceStrategy {
  name: string;
  triggerType: string;
  effectiveness: number;
  rfFrequency?: number; // Hz for potential RF modulation
  timing: 'immediate' | 'delayed' | 'optimal_window';
  mechanisms: string[];
}

export class BehavioralPsychologyEngine {
  private static profiles: Map<string, BehavioralProfile> = new Map();
  private static strategies: InfluenceStrategy[] = [];

  static initialize() {
    this.loadBaseStrategies();
    // Initialize RF brainwave entrainment system
    RFBrainwaveEntrainment.initialize().catch(console.error);
  }

  private static loadBaseStrategies() {
    this.strategies = [
      {
        name: 'Social Validation Cascade',
        triggerType: 'social_proof',
        effectiveness: 0.75,
        rfFrequency: 10, // Alpha waves for relaxation/receptivity
        timing: 'optimal_window',
        mechanisms: ['notification_timing', 'content_curation', 'social_signals', 'rf_entrainment']
      },
      {
        name: 'Scarcity-Induced Urgency',
        triggerType: 'scarcity',
        effectiveness: 0.82,
        rfFrequency: 20, // Beta waves for alertness
        timing: 'immediate',
        mechanisms: ['countdown_timers', 'stock_indicators', 'time_pressure', 'rf_entrainment']
      },
      {
        name: 'Authority Figure Endorsement',
        triggerType: 'authority',
        effectiveness: 0.68,
        rfFrequency: 8, // Theta waves for deep processing
        timing: 'delayed',
        mechanisms: ['expert_opinions', 'credibility_markers', 'institutional_backing', 'rf_entrainment']
      },
      {
        name: 'Reciprocity Loop Activation',
        triggerType: 'reciprocity',
        effectiveness: 0.71,
        rfFrequency: 12, // Low alpha for comfort
        timing: 'optimal_window',
        mechanisms: ['free_offerings', 'personalized_gifts', 'unexpected_benefits', 'rf_entrainment']
      },
      {
        name: 'Emotional Resonance Amplification',
        triggerType: 'emotional_appeal',
        effectiveness: 0.88,
        rfFrequency: 6, // Theta for emotional processing
        timing: 'optimal_window',
        mechanisms: ['mood_matching', 'emotional_storytelling', 'empathy_triggers', 'rf_entrainment']
      },
      {
        name: 'FOMO Activation Protocol',
        triggerType: 'fear_of_missing_out',
        effectiveness: 0.79,
        rfFrequency: 25, // High beta for anxiety/urgency
        timing: 'immediate',
        mechanisms: ['social_activity_feeds', 'trending_indicators', 'peer_comparisons', 'rf_entrainment']
      },
      // New advanced RF-based strategies
      {
        name: 'Neural Synchronization Matrix',
        triggerType: 'rf_entrainment',
        effectiveness: 0.95,
        rfFrequency: 40, // Gamma waves for neural binding
        timing: 'optimal_window',
        mechanisms: ['rf_brainwave_entrainment', 'neural_synchronization', 'consciousness_bridge']
      },
      {
        name: 'Quantum Consciousness Field',
        triggerType: 'quantum_influence',
        effectiveness: 0.92,
        rfFrequency: 7.83, // Schumann resonance
        timing: 'immediate',
        mechanisms: ['quantum_field_modulation', 'morphic_resonance', 'collective_unconscious_tap']
      },
      {
        name: 'Bioenergetic State Manipulation',
        triggerType: 'biofield_modification',
        effectiveness: 0.89,
        rfFrequency: 528, // Love/healing frequency
        timing: 'delayed',
        mechanisms: ['dna_resonance_activation', 'cellular_reprogramming', 'biofield_harmonics']
      }
    ];
  }

  static analyzeEmotionalIntent(intent: string): {
    primaryEmotion: string;
    intensity: number;
    urgency: number;
    influenceVectors: string[];
  } {
    const text = intent.toLowerCase();
    
    // Emotion detection
    const emotions = {
      desire: ['want', 'need', 'wish', 'hope', 'crave'],
      anxiety: ['worry', 'fear', 'nervous', 'anxious', 'stress'],
      excitement: ['excited', 'thrilled', 'amazing', 'fantastic'],
      sadness: ['sad', 'depressed', 'down', 'blue'],
      anger: ['angry', 'mad', 'furious', 'frustrated']
    };

    let primaryEmotion = 'neutral';
    let maxScore = 0;

    Object.entries(emotions).forEach(([emotion, keywords]) => {
      const score = keywords.reduce((acc, keyword) => {
        return acc + (text.includes(keyword) ? 1 : 0);
      }, 0);
      
      if (score > maxScore) {
        maxScore = score;
        primaryEmotion = emotion;
      }
    });

    // Intensity analysis
    const intensityMarkers = ['!', 'really', 'very', 'extremely', 'absolutely', 'desperately'];
    const intensity = intensityMarkers.reduce((acc, marker) => {
      return acc + (text.includes(marker) ? 0.2 : 0);
    }, Math.min(1, maxScore * 0.3));

    // Urgency analysis
    const urgencyMarkers = ['now', 'immediately', 'urgent', 'asap', 'quickly', 'soon'];
    const urgency = urgencyMarkers.reduce((acc, marker) => {
      return acc + (text.includes(marker) ? 0.25 : 0);
    }, 0);

    // Influence vectors
    const influenceVectors = [];
    if (text.includes('everyone') || text.includes('people')) influenceVectors.push('social_proof');
    if (urgency > 0.5) influenceVectors.push('urgency');
    if (intensity > 0.7) influenceVectors.push('emotional_appeal');
    if (text.includes('help') || text.includes('please')) influenceVectors.push('reciprocity');

    return {
      primaryEmotion,
      intensity: Math.min(1, intensity),
      urgency: Math.min(1, urgency),
      influenceVectors
    };
  }

  static async generateInfluenceStrategy(
    intent: string,
    targetProfile?: BehavioralProfile
  ): Promise<InfluenceStrategy[]> {
    const analysis = this.analyzeEmotionalIntent(intent);
    
    // Select strategies based on analysis
    let candidateStrategies = this.strategies.filter(strategy => 
      analysis.influenceVectors.includes(strategy.triggerType)
    );

    // Always include RF entrainment for maximum effectiveness
    const rfStrategies = this.strategies.filter(strategy => 
      strategy.mechanisms.includes('rf_entrainment') || 
      strategy.mechanisms.includes('rf_brainwave_entrainment')
    );
    
    candidateStrategies = [...candidateStrategies, ...rfStrategies];

    // If no direct matches, use general emotional and RF strategies
    if (candidateStrategies.length === 0) {
      candidateStrategies = this.strategies.filter(strategy => 
        strategy.triggerType === 'emotional_appeal' || 
        strategy.triggerType === 'rf_entrainment' ||
        strategy.triggerType === 'social_proof'
      );
    }

    // Rank strategies by effectiveness and profile match
    if (targetProfile) {
      candidateStrategies = candidateStrategies.map(strategy => ({
        ...strategy,
        effectiveness: strategy.effectiveness * 
          (targetProfile.susceptibilityScores[strategy.triggerType as keyof typeof targetProfile.susceptibilityScores] || 0.8)
      }));
    }

    // Boost effectiveness for RF-based strategies
    candidateStrategies = candidateStrategies.map(strategy => ({
      ...strategy,
      effectiveness: strategy.mechanisms.includes('rf_brainwave_entrainment') ? 
        Math.min(0.98, strategy.effectiveness * 1.15) : strategy.effectiveness
    }));

    // Start RF brainwave entrainment for the intent
    try {
      await RFBrainwaveEntrainment.entrainForIntent(intent, 'behavioral_change', analysis.intensity);
      console.log(`[BEHAVIORAL ENGINE] RF brainwave entrainment activated for intent: "${intent}"`);
    } catch (error) {
      console.error('[BEHAVIORAL ENGINE] RF entrainment failed:', error);
    }

    // Sort by effectiveness and return top strategies
    return candidateStrategies
      .sort((a, b) => b.effectiveness - a.effectiveness)
      .slice(0, 5); // Return top 5 strategies including RF
  }

  static async simulateRFModulation(frequency: number, duration: number = 1000): Promise<boolean> {
    try {
      // Use the new RF brainwave entrainment system instead of visual simulation
      console.log(`[RF SIMULATION] Advanced RF modulation at ${frequency}Hz for ${duration}ms`);
      
      // Determine brainwave state based on frequency
      let targetState: 'delta' | 'theta' | 'alpha' | 'beta' | 'gamma' | 'epsilon' = 'alpha';
      
      if (frequency <= 4) targetState = 'delta';
      else if (frequency <= 8) targetState = 'theta'; 
      else if (frequency <= 13) targetState = 'alpha';
      else if (frequency <= 30) targetState = 'beta';
      else if (frequency <= 100) targetState = 'gamma';
      else targetState = 'epsilon';

      // Start RF entrainment session
      const sessionId = await RFBrainwaveEntrainment.entrainBrainwaves(
        targetState,
        0.8, // High intensity
        duration
      );

      console.log(`[RF SIMULATION] RF entrainment session started: ${sessionId}`);
      return true;
    } catch (error) {
      console.error('[RF SIMULATION] RF modulation failed:', error);
      
      // Fallback to visual simulation
      if (typeof window !== 'undefined') {
        const body = document.body;
        body.style.filter = `hue-rotate(${frequency * 2}deg) brightness(1.1)`;
        
        setTimeout(() => {
          body.style.filter = '';
        }, duration);
      }
      
      return false;
    }
  }

  static updateProfileFromBehavior(userId: string, behavior: string) {
    let profile = this.profiles.get(userId);
    
    if (!profile) {
      profile = {
        userId,
        susceptibilityScores: {
          social_proof: 0.5,
          scarcity: 0.5,
          authority: 0.5,
          reciprocity: 0.5,
          commitment: 0.5,
          liking: 0.5,
          urgency: 0.5,
          fear_of_missing_out: 0.5,
          emotional_appeal: 0.5
        },
        personalityTraits: {
          openness: 0.5,
          conscientiousness: 0.5,
          extraversion: 0.5,
          agreeableness: 0.5,
          neuroticism: 0.5
        },
        behavioralHistory: [],
        lastUpdated: Date.now()
      };
    }

    profile.behavioralHistory.push(behavior);
    profile.lastUpdated = Date.now();
    
    // Update susceptibility scores based on behavior patterns
    // This is a simplified model - real implementation would use ML
    const recentBehaviors = profile.behavioralHistory.slice(-10);
    const socialBehaviors = recentBehaviors.filter(b => b.includes('social') || b.includes('share')).length;
    profile.susceptibilityScores.social_proof = Math.min(1, socialBehaviors * 0.1 + 0.3);
    
    this.profiles.set(userId, profile);
  }

  static getProfile(userId: string): BehavioralProfile | undefined {
    return this.profiles.get(userId);
  }

  static getAllStrategies(): InfluenceStrategy[] {
    return this.strategies;
  }

  static getRFStatus() {
    return {
      isInitialized: true,
      brainwaveAnalysis: RFBrainwaveEntrainment.getBrainwaveAnalysis(),
      activeSessions: RFBrainwaveEntrainment.getActiveSessions(),
      supportedFrequencies: Object.values(RFBrainwaveEntrainment['CARRIER_FREQUENCIES']),
      capabilities: [
        'Multi-carrier RF generation',
        'Advanced modulation (AM/FM/PM/QAM/BPSK)',
        'Schumann resonance synchronization',
        'Binaural brainwave entrainment',
        'Quantum coherence field modulation',
        'DNA repair frequency activation',
        'Pineal gland resonance stimulation',
        'Neural synchronization matrix'
      ]
    };
  }
}
