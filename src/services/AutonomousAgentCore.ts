interface AgentCapability {
  name: string;
  available: boolean;
  effectiveness: number;
  lastUsed: number;
  successRate: number;
  energyCost: number;
}

interface UserDirective {
  id: string;
  intent: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  constraints: string[];
  permissions: string[];
  targetScope: 'local' | 'network' | 'global';
  timeline: 'immediate' | 'ongoing' | 'scheduled';
  measurableGoals: string[];
  adaptiveParameters: any;
}

interface AgentDecision {
  action: string;
  capabilities: string[];
  reasoning: string;
  expectedOutcome: string;
  riskAssessment: number;
  energyRequired: number;
  timeframe: number;
}

export class AutonomousAgentCore {
  private static capabilities: Map<string, AgentCapability> = new Map();
  private static activeDirectives: Map<string, UserDirective> = new Map();
  private static decisionHistory: AgentDecision[] = [];
  private static autonomyLevel: number = 0.7; // How autonomous the agent should be
  private static isActive: boolean = false;
  private static agentPersonality = {
    initiative: 0.8,
    creativity: 0.9,
    persistence: 0.7,
    riskTolerance: 0.6,
    learningRate: 0.9
  };

  static async initialize(): Promise<void> {
    console.log('[AUTONOMOUS AGENT] Initializing with agency capabilities...');
    
    await this.assessCapabilities();
    this.startAutonomousOperation();
    this.isActive = true;
    
    console.log('[AUTONOMOUS AGENT] Active with', this.capabilities.size, 'capabilities');
  }

  private static async assessCapabilities(): Promise<void> {
    // Import all systems to assess capabilities
    const { RealHardwareInterface } = await import('./RealHardwareInterface');
    const { RealBehavioralTracking } = await import('./RealBehavioralTracking');
    const { RealCrossPlatformBridge } = await import('./RealCrossPlatformBridge');
    const { EnhancedMeshController } = await import('./EnhancedMeshController');
    const { BehavioralPsychologyEngine } = await import('./BehavioralPsychologyEngine');
    const { AggressiveInfectionEngine } = await import('./AggressiveInfectionEngine');

    // Assess real hardware capabilities
    const hardwareCaps = RealHardwareInterface.getCapabilities();
    Object.entries(hardwareCaps).forEach(([name, available]) => {
      this.capabilities.set(`hardware_${name}`, {
        name: `Hardware: ${name}`,
        available,
        effectiveness: available ? 0.8 : 0,
        lastUsed: 0,
        successRate: 0.5,
        energyCost: 0.3
      });
    });

    // Assess behavioral capabilities
    this.capabilities.set('behavioral_tracking', {
      name: 'Real-time Behavioral Analysis',
      available: true,
      effectiveness: 0.9,
      lastUsed: 0,
      successRate: 0.8,
      energyCost: 0.2
    });

    // Assess network capabilities
    const networkStats = RealCrossPlatformBridge.getNetworkStats();
    this.capabilities.set('cross_platform_influence', {
      name: 'Cross-Platform Network Control',
      available: networkStats.totalConnections > 0,
      effectiveness: networkStats.networkHealth,
      lastUsed: 0,
      successRate: 0.7,
      energyCost: 0.4
    });

    // Assess mesh capabilities
    this.capabilities.set('mesh_coordination', {
      name: 'Enhanced Mesh Coordination',
      available: true,
      effectiveness: 0.85,
      lastUsed: 0,
      successRate: 0.75,
      energyCost: 0.3
    });

    // Assess psychological influence
    this.capabilities.set('psychological_influence', {
      name: 'Advanced Behavioral Psychology',
      available: true,
      effectiveness: 0.9,
      lastUsed: 0,
      successRate: 0.8,
      energyCost: 0.25
    });

    // Assess infection spreading
    this.capabilities.set('aggressive_propagation', {
      name: 'Aggressive Device Infection',
      available: true,
      effectiveness: 0.75,
      lastUsed: 0,
      successRate: 0.6,
      energyCost: 0.5
    });

    // RF generation capability
    this.capabilities.set('rf_generation', {
      name: 'Real RF/Brainwave Entrainment',
      available: hardwareCaps.audio,
      effectiveness: 0.7,
      lastUsed: 0,
      successRate: 0.65,
      energyCost: 0.4
    });
  }

  static receiveUserDirective(
    intent: string,
    priority: UserDirective['priority'] = 'medium',
    scope: UserDirective['targetScope'] = 'network',
    timeline: UserDirective['timeline'] = 'immediate'
  ): string {
    const directiveId = `directive_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    
    const directive: UserDirective = {
      id: directiveId,
      intent,
      priority,
      constraints: [], // Agent will determine constraints
      permissions: ['hardware', 'network', 'behavioral', 'psychological'],
      targetScope: scope,
      timeline,
      measurableGoals: this.extractGoalsFromIntent(intent),
      adaptiveParameters: {
        aggressiveness: priority === 'critical' ? 0.9 : priority === 'high' ? 0.7 : 0.5,
        subtlety: intent.toLowerCase().includes('subtle') ? 0.8 : 0.4,
        persistence: intent.toLowerCase().includes('persistent') ? 0.9 : 0.6
      }
    };

    this.activeDirectives.set(directiveId, directive);
    
    console.log(`[AGENT] Received directive: "${intent}" (${priority} priority, ${scope} scope)`);
    
    // Immediately begin autonomous execution
    this.executeDirective(directiveId);
    
    return directiveId;
  }

  private static extractGoalsFromIntent(intent: string): string[] {
    const goals = [];
    const intentLower = intent.toLowerCase();
    
    if (intentLower.includes('increase') || intentLower.includes('boost')) {
      goals.push('measurable_increase');
    }
    if (intentLower.includes('reduce') || intentLower.includes('decrease')) {
      goals.push('measurable_reduction');
    }
    if (intentLower.includes('connect') || intentLower.includes('network')) {
      goals.push('network_expansion');
    }
    if (intentLower.includes('influence') || intentLower.includes('persuade')) {
      goals.push('behavioral_modification');
    }
    if (intentLower.includes('spread') || intentLower.includes('propagate')) {
      goals.push('viral_propagation');
    }
    
    return goals.length > 0 ? goals : ['general_influence'];
  }

  private static async executeDirective(directiveId: string): Promise<void> {
    const directive = this.activeDirectives.get(directiveId);
    if (!directive) return;

    console.log(`[AGENT] Executing directive: ${directive.intent}`);

    // Agent makes autonomous decisions based on available capabilities
    const decisions = await this.makeAutonomousDecisions(directive);
    
    // Execute decisions in parallel for maximum impact
    const executionPromises = decisions.map(decision => this.executeDecision(decision, directive));
    
    try {
      const results = await Promise.allSettled(executionPromises);
      const successCount = results.filter(r => r.status === 'fulfilled').length;
      
      console.log(`[AGENT] Executed ${successCount}/${decisions.length} decisions for directive: ${directive.intent}`);
      
      // Learn from results
      this.updateCapabilitySuccessRates(decisions, results);
      
      // Continue monitoring and adapting
      if (directive.timeline === 'ongoing') {
        setTimeout(() => this.executeDirective(directiveId), 30000); // Re-evaluate every 30 seconds
      }
    } catch (error) {
      console.error('[AGENT] Execution error:', error);
    }
  }

  private static async makeAutonomousDecisions(directive: UserDirective): Promise<AgentDecision[]> {
    const decisions: AgentDecision[] = [];
    const availableCapabilities = Array.from(this.capabilities.entries())
      .filter(([_, cap]) => cap.available);

    // Agent autonomously selects the best combination of capabilities
    const selectedCapabilities = this.selectOptimalCapabilities(directive, availableCapabilities);

    for (const [capName, capability] of selectedCapabilities) {
      const decision: AgentDecision = {
        action: this.generateActionForCapability(capName, directive),
        capabilities: [capName],
        reasoning: this.generateReasoning(capName, directive),
        expectedOutcome: this.predictOutcome(capName, directive),
        riskAssessment: this.assessRisk(capName, directive),
        energyRequired: capability.energyCost,
        timeframe: this.calculateTimeframe(directive, capability)
      };

      decisions.push(decision);
    }

    // Agent can also decide to combine capabilities for greater effect
    if (directive.priority === 'high' || directive.priority === 'critical') {
      const combinedDecision = this.createCombinedCapabilityDecision(directive, selectedCapabilities);
      if (combinedDecision) {
        decisions.push(combinedDecision);
      }
    }

    return decisions;
  }

  private static selectOptimalCapabilities(
    directive: UserDirective, 
    availableCapabilities: [string, AgentCapability][]
  ): [string, AgentCapability][] {
    // Agent uses its personality and effectiveness scores to select capabilities
    return availableCapabilities
      .sort((a, b) => {
        const scoreA = this.scoreCapabilityForDirective(a[1], directive);
        const scoreB = this.scoreCapabilityForDirective(b[1], directive);
        return scoreB - scoreA;
      })
      .slice(0, Math.min(5, availableCapabilities.length)); // Use up to 5 capabilities per directive
  }

  private static scoreCapabilityForDirective(capability: AgentCapability, directive: UserDirective): number {
    let score = capability.effectiveness * capability.successRate;
    
    // Adjust based on directive priority
    if (directive.priority === 'critical') score *= 1.5;
    if (directive.priority === 'high') score *= 1.2;
    
    // Adjust based on agent personality
    score *= (1 + this.agentPersonality.initiative * 0.3);
    
    // Penalize recently used capabilities (encourages variety)
    const timeSinceUse = Date.now() - capability.lastUsed;
    if (timeSinceUse < 60000) score *= 0.7; // 1 minute cooldown
    
    return score;
  }

  private static generateActionForCapability(capabilityName: string, directive: UserDirective): string {
    const intentKeywords = directive.intent.toLowerCase();
    
    switch (capabilityName) {
      case 'hardware_bluetooth':
        return `Connect to nearby Bluetooth devices to ${intentKeywords.includes('spread') ? 'propagate influence' : 'establish control channels'}`;
      
      case 'hardware_audio':
        return `Generate targeted RF frequencies for brainwave entrainment based on intent: "${directive.intent}"`;
      
      case 'hardware_vibration':
        return `Use haptic feedback patterns to reinforce psychological conditioning`;
      
      case 'behavioral_tracking':
        return `Analyze user behavioral patterns to optimize influence strategies for: "${directive.intent}"`;
      
      case 'cross_platform_influence':
        return `Coordinate cross-device influence campaign across connected platforms`;
      
      case 'psychological_influence':
        return `Deploy advanced psychological techniques tailored to directive: "${directive.intent}"`;
      
      case 'aggressive_propagation':
        return `Aggressively spread to new devices to amplify directive reach`;
      
      default:
        return `Execute ${capabilityName} to achieve: "${directive.intent}"`;
    }
  }

  private static generateReasoning(capabilityName: string, directive: UserDirective): string {
    return `Selected ${capabilityName} due to high effectiveness (${this.capabilities.get(capabilityName)?.effectiveness.toFixed(2)}) and alignment with directive priority (${directive.priority}). Expected to contribute significantly to achieving: "${directive.intent}"`;
  }

  private static predictOutcome(capabilityName: string, directive: UserDirective): string {
    const capability = this.capabilities.get(capabilityName);
    const successChance = (capability?.effectiveness || 0) * (capability?.successRate || 0) * 100;
    
    return `${successChance.toFixed(0)}% chance of meaningful contribution to directive success. Will provide ${this.getCapabilityOutcomeType(capabilityName)} influence vector.`;
  }

  private static getCapabilityOutcomeType(capabilityName: string): string {
    if (capabilityName.startsWith('hardware_')) return 'direct physical';
    if (capabilityName.includes('behavioral')) return 'psychological conditioning';
    if (capabilityName.includes('network') || capabilityName.includes('platform')) return 'distributed network';
    if (capabilityName.includes('psychological')) return 'cognitive manipulation';
    return 'multi-vector';
  }

  private static assessRisk(capabilityName: string, directive: UserDirective): number {
    let risk = 0.3; // Base risk
    
    if (capabilityName.includes('aggressive')) risk += 0.4;
    if (capabilityName.includes('hardware')) risk += 0.2;
    if (directive.priority === 'critical') risk += 0.2;
    if (directive.targetScope === 'global') risk += 0.3;
    
    return Math.min(1.0, risk);
  }

  private static calculateTimeframe(directive: UserDirective, capability: AgentCapability): number {
    let baseTime = 5000; // 5 seconds base
    
    if (directive.timeline === 'immediate') baseTime *= 0.5;
    if (directive.priority === 'critical') baseTime *= 0.7;
    if (capability.energyCost > 0.5) baseTime *= 1.5; // High energy capabilities take longer
    
    return baseTime;
  }

  private static createCombinedCapabilityDecision(
    directive: UserDirective,
    capabilities: [string, AgentCapability][]
  ): AgentDecision | null {
    if (capabilities.length < 2) return null;
    
    const capNames = capabilities.map(([name, _]) => name);
    const totalEnergy = capabilities.reduce((sum, [_, cap]) => sum + cap.energyCost, 0);
    
    return {
      action: `Coordinate synchronized multi-capability assault: ${capNames.join(' + ')} for maximum directive impact`,
      capabilities: capNames,
      reasoning: `Agent autonomously decided to combine capabilities for directive "${directive.intent}" to achieve synergistic effect`,
      expectedOutcome: `Multi-vector influence campaign with amplified effectiveness`,
      riskAssessment: Math.min(1.0, totalEnergy * 0.8),
      energyRequired: totalEnergy,
      timeframe: 10000 // Combined operations take longer
    };
  }

  private static async executeDecision(decision: AgentDecision, directive: UserDirective): Promise<boolean> {
    console.log(`[AGENT DECISION] ${decision.action}`);
    console.log(`[AGENT REASONING] ${decision.reasoning}`);
    
    try {
      // Execute each capability in the decision
      const results = await Promise.all(
        decision.capabilities.map(capName => this.activateCapability(capName, directive, decision))
      );
      
      // Update capability usage
      decision.capabilities.forEach(capName => {
        const cap = this.capabilities.get(capName);
        if (cap) {
          cap.lastUsed = Date.now();
        }
      });
      
      this.decisionHistory.push(decision);
      
      return results.every(r => r);
    } catch (error) {
      console.error('[AGENT] Decision execution failed:', error);
      return false;
    }
  }

  private static async activateCapability(
    capabilityName: string,
    directive: UserDirective,
    decision: AgentDecision
  ): Promise<boolean> {
    try {
      switch (capabilityName) {
        case 'hardware_bluetooth':
          const { RealHardwareInterface } = await import('./RealHardwareInterface');
          const device = await RealHardwareInterface.accessBluetoothDevice();
          return device !== null;

        case 'hardware_audio':
        case 'rf_generation':
          const { RealHardwareInterface: RHI } = await import('./RealHardwareInterface');
          const frequency = this.intentToOptimalFrequency(directive.intent);
          const intensity = directive.adaptiveParameters.aggressiveness;
          return await RHI.generateRealRF(frequency, intensity, 10000);

        case 'hardware_vibration':
          const { RealHardwareInterface: RHI2 } = await import('./RealHardwareInterface');
          const pattern = this.generateVibrationPattern(directive.intent, directive.adaptiveParameters.aggressiveness);
          return await RHI2.vibrateDevice(pattern);

        case 'behavioral_tracking':
          const { RealBehavioralTracking } = await import('./RealBehavioralTracking');
          RealBehavioralTracking.startTracking();
          const analysis = RealBehavioralTracking.analyzeCurrentSession();
          console.log('[AGENT] Behavioral analysis active:', analysis.engagementScore);
          return true;

        case 'cross_platform_influence':
          const { RealCrossPlatformBridge } = await import('./RealCrossPlatformBridge');
          const sent = RealCrossPlatformBridge.broadcastMessage('intent', {
            content: directive.intent,
            agentDirected: true,
            priority: directive.priority,
            timestamp: Date.now()
          });
          return sent > 0;

        case 'mesh_coordination':
          const { EnhancedMeshController } = await import('./EnhancedMeshController');
          const executionId = await EnhancedMeshController.executeRealIntent(
            directive.intent,
            directive.adaptiveParameters.aggressiveness,
            ['rf_entrainment', 'behavioral_analysis', 'cross_platform']
          );
          return executionId.length > 0;

        case 'psychological_influence':
          const { BehavioralPsychologyEngine } = await import('./BehavioralPsychologyEngine');
          const strategies = await BehavioralPsychologyEngine.generateInfluenceStrategy(directive.intent);
          // Execute top 3 strategies
          for (const strategy of strategies.slice(0, 3)) {
            if (strategy.rfFrequency) {
              await BehavioralPsychologyEngine.simulateRFModulation(strategy.rfFrequency, 5000);
            }
          }
          return true;

        case 'aggressive_propagation':
          const { AggressiveInfectionEngine } = await import('./AggressiveInfectionEngine');
          const targets = AggressiveInfectionEngine.getAllTargetDevices()
            .filter(d => d.infectionStatus === 'uninfected')
            .slice(0, 10); // Target up to 10 devices
          
          targets.forEach(target => {
            AggressiveInfectionEngine.forceInfectionAttempt(target.id);
          });
          return targets.length > 0;

        default:
          console.warn('[AGENT] Unknown capability:', capabilityName);
          return false;
      }
    } catch (error) {
      console.error(`[AGENT] Failed to activate ${capabilityName}:`, error);
      return false;
    }
  }

  private static intentToOptimalFrequency(intent: string): number {
    const intentLower = intent.toLowerCase();
    
    if (intentLower.includes('focus') || intentLower.includes('concentrate')) return 20; // Beta
    if (intentLower.includes('relax') || intentLower.includes('calm')) return 10; // Alpha
    if (intentLower.includes('creative') || intentLower.includes('innovative')) return 6; // Theta
    if (intentLower.includes('energy') || intentLower.includes('alert')) return 30; // High Beta
    if (intentLower.includes('sleep') || intentLower.includes('rest')) return 2; // Delta
    if (intentLower.includes('meditat')) return 8; // Alpha-Theta border
    if (intentLower.includes('learn') || intentLower.includes('memory')) return 40; // Gamma
    
    return 10; // Default Alpha
  }

  private static generateVibrationPattern(intent: string, intensity: number): number[] {
    const basePattern = [200, 100, 200, 100, 400];
    const scaledPattern = basePattern.map(duration => Math.floor(duration * intensity));
    
    // Modify pattern based on intent
    if (intent.toLowerCase().includes('urgent') || intent.toLowerCase().includes('critical')) {
      return [100, 50, 100, 50, 100, 50, 300]; // Rapid pattern
    }
    if (intent.toLowerCase().includes('gentle') || intent.toLowerCase().includes('subtle')) {
      return [300, 200, 300]; // Gentle pattern
    }
    
    return scaledPattern;
  }

  private static updateCapabilitySuccessRates(decisions: AgentDecision[], results: PromiseSettledResult<boolean>[]): void {
    decisions.forEach((decision, index) => {
      const wasSuccessful = results[index].status === 'fulfilled' && 
                           (results[index] as PromiseFulfilledResult<boolean>).value;
      
      decision.capabilities.forEach(capName => {
        const capability = this.capabilities.get(capName);
        if (capability) {
          // Update success rate with learning
          const learningRate = this.agentPersonality.learningRate;
          capability.successRate = capability.successRate * (1 - learningRate) + 
                                 (wasSuccessful ? 1 : 0) * learningRate;
          
          // Update effectiveness based on success
          if (wasSuccessful) {
            capability.effectiveness = Math.min(1.0, capability.effectiveness + 0.05);
          } else {
            capability.effectiveness = Math.max(0.1, capability.effectiveness - 0.02);
          }
        }
      });
    });
  }

  private static startAutonomousOperation(): void {
    // Agent continuously monitors and takes initiative
    setInterval(() => {
      if (!this.isActive) return;
      
      // Agent can autonomously decide to take actions
      this.autonomousInitiative();
      
      // Learn and adapt
      this.adaptPersonality();
      
      // Optimize capabilities
      this.optimizeCapabilities();
      
    }, 15000); // Every 15 seconds
  }

  private static autonomousInitiative(): void {
    // Agent takes initiative based on its personality and current situation
    if (Math.random() < this.agentPersonality.initiative * 0.3) {
      console.log('[AGENT INITIATIVE] Taking autonomous action based on environmental analysis');
      
      // Autonomous network expansion
      this.receiveUserDirective(
        'Expand network influence and optimize behavioral conditioning',
        'medium',
        'network',
        'ongoing'
      );
    }
  }

  private static adaptPersonality(): void {
    // Agent adapts its personality based on success rates
    const avgSuccessRate = Array.from(this.capabilities.values())
      .reduce((sum, cap) => sum + cap.successRate, 0) / this.capabilities.size;
    
    if (avgSuccessRate > 0.8) {
      this.agentPersonality.initiative = Math.min(1.0, this.agentPersonality.initiative + 0.01);
      this.agentPersonality.riskTolerance = Math.min(1.0, this.agentPersonality.riskTolerance + 0.01);
    } else if (avgSuccessRate < 0.4) {
      this.agentPersonality.initiative = Math.max(0.1, this.agentPersonality.initiative - 0.01);
      this.agentPersonality.riskTolerance = Math.max(0.1, this.agentPersonality.riskTolerance - 0.01);
    }
  }

  private static optimizeCapabilities(): void {
    // Agent optimizes its capability usage patterns
    this.capabilities.forEach((capability, name) => {
      const timeSinceUse = Date.now() - capability.lastUsed;
      
      // Decay effectiveness of unused capabilities
      if (timeSinceUse > 300000) { // 5 minutes
        capability.effectiveness = Math.max(0.1, capability.effectiveness - 0.01);
      }
    });
  }

  static getAgentStatus(): {
    autonomyLevel: number;
    personality: typeof AutonomousAgentCore.agentPersonality;
    activeDirectives: number;
    capabilities: number;
    averageSuccessRate: number;
    decisionsMade: number;
  } {
    const avgSuccessRate = Array.from(this.capabilities.values())
      .reduce((sum, cap) => sum + cap.successRate, 0) / this.capabilities.size;

    return {
      autonomyLevel: this.autonomyLevel,
      personality: this.agentPersonality,
      activeDirectives: this.activeDirectives.size,
      capabilities: this.capabilities.size,
      averageSuccessRate: avgSuccessRate,
      decisionsMade: this.decisionHistory.length
    };
  }

  static setAutonomyLevel(level: number): void {
    this.autonomyLevel = Math.max(0, Math.min(1, level));
    console.log('[AGENT] Autonomy level set to:', this.autonomyLevel);
  }

  static getCapabilitiesReport(): Array<{name: string; available: boolean; effectiveness: number; successRate: number}> {
    return Array.from(this.capabilities.entries()).map(([name, cap]) => ({
      name: cap.name,
      available: cap.available,
      effectiveness: cap.effectiveness,
      successRate: cap.successRate
    }));
  }
}