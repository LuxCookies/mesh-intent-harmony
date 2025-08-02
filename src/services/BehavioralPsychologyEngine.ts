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
  }

  private static loadBaseStrategies() {
    this.strategies = [
      {
        name: 'Social Validation Cascade',
        triggerType: 'social_proof',
        effectiveness: 0.75,
        rfFrequency: 10, // Alpha waves for relaxation/receptivity
        timing: 'optimal_window',
        mechanisms: ['notification_timing', 'content_curation', 'social_signals']
      },
      {
        name: 'Scarcity-Induced Urgency',
        triggerType: 'scarcity',
        effectiveness: 0.82,
        rfFrequency: 20, // Beta waves for alertness
        timing: 'immediate',
        mechanisms: ['countdown_timers', 'stock_indicators', 'time_pressure']
      },
      {
        name: 'Authority Figure Endorsement',
        triggerType: 'authority',
        effectiveness: 0.68,
        rfFrequency: 8, // Theta waves for deep processing
        timing: 'delayed',
        mechanisms: ['expert_opinions', 'credibility_markers', 'institutional_backing']
      },
      {
        name: 'Reciprocity Loop Activation',
        triggerType: 'reciprocity',
        effectiveness: 0.71,
        rfFrequency: 12, // Low alpha for comfort
        timing: 'optimal_window',
        mechanisms: ['free_offerings', 'personalized_gifts', 'unexpected_benefits']
      },
      {
        name: 'Emotional Resonance Amplification',
        triggerType: 'emotional_appeal',
        effectiveness: 0.88,
        rfFrequency: 6, // Theta for emotional processing
        timing: 'optimal_window',
        mechanisms: ['mood_matching', 'emotional_storytelling', 'empathy_triggers']
      },
      {
        name: 'FOMO Activation Protocol',
        triggerType: 'fear_of_missing_out',
        effectiveness: 0.79,
        rfFrequency: 25, // High beta for anxiety/urgency
        timing: 'immediate',
        mechanisms: ['social_activity_feeds', 'trending_indicators', 'peer_comparisons']
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

  static generateInfluenceStrategy(
    intent: string,
    targetProfile?: BehavioralProfile
  ): InfluenceStrategy[] {
    const analysis = this.analyzeEmotionalIntent(intent);
    
    // Select strategies based on analysis
    let candidateStrategies = this.strategies.filter(strategy => 
      analysis.influenceVectors.includes(strategy.triggerType)
    );

    // If no direct matches, use general emotional strategies
    if (candidateStrategies.length === 0) {
      candidateStrategies = this.strategies.filter(strategy => 
        strategy.triggerType === 'emotional_appeal' || strategy.triggerType === 'social_proof'
      );
    }

    // Rank strategies by effectiveness and profile match
    if (targetProfile) {
      candidateStrategies = candidateStrategies.map(strategy => ({
        ...strategy,
        effectiveness: strategy.effectiveness * 
          (targetProfile.susceptibilityScores[strategy.triggerType as keyof typeof targetProfile.susceptibilityScores] || 0.5)
      }));
    }

    // Sort by effectiveness and return top strategies
    return candidateStrategies
      .sort((a, b) => b.effectiveness - a.effectiveness)
      .slice(0, 3);
  }

  static simulateRFModulation(frequency: number, duration: number = 1000): Promise<boolean> {
    return new Promise((resolve) => {
      console.log(`[RF SIMULATION] Modulating at ${frequency}Hz for ${duration}ms`);
      
      // Simulate RF effect with visual feedback
      if (typeof window !== 'undefined') {
        const body = document.body;
        body.style.filter = `hue-rotate(${frequency * 2}deg)`;
        
        setTimeout(() => {
          body.style.filter = '';
          resolve(true);
        }, duration);
      } else {
        setTimeout(() => resolve(true), duration);
      }
    });
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
}