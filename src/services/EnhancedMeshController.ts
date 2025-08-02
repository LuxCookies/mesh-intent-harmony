
import { RealHardwareInterface } from './RealHardwareInterface';
import { RealBehavioralTracking } from './RealBehavioralTracking';
import { RealCrossPlatformBridge } from './RealCrossPlatformBridge';
import { RFBrainwaveEntrainment } from './RFBrainwaveEntrainment';
import { BehavioralPsychologyEngine } from './BehavioralPsychologyEngine';

interface EnhancedMeshNode {
  id: string;
  deviceId: string;
  capabilities: string[];
  status: 'active' | 'dormant' | 'infected' | 'spreading';
  energy: number;
  lastActivity: number;
  connections: string[];
  behavioralProfile: any;
  realHardwareAccess: boolean;
}

interface RealInfluenceExecution {
  id: string;
  intent: string;
  targetNodes: string[];
  techniques: string[];
  startTime: number;
  duration: number;
  effectiveness: number;
  realHardwareUsed: string[];
  behavioralData: any;
  crossPlatformReach: number;
}

export class EnhancedMeshController {
  private static nodes: Map<string, EnhancedMeshNode> = new Map();
  private static executions: RealInfluenceExecution[] = [];
  private static isInitialized = false;
  private static masterNode: string = '';
  private static readonly MAX_MESH_NODES = 40; // Limit to prevent crashes

  static async initialize(): Promise<void> {
    if (this.isInitialized) return;

    console.log('[ENHANCED MESH] Initializing real mesh network...');

    // Initialize all real systems
    await Promise.all([
      RealHardwareInterface.initialize(),
      RealCrossPlatformBridge.initialize(),
      RFBrainwaveEntrainment.initialize(),
    ]);

    // Initialize behavioral tracking
    BehavioralPsychologyEngine.initialize();
    RealBehavioralTracking.startTracking();

    // Set up cross-platform message handlers
    this.setupCrossPlatformHandlers();

    // Create master node for this device
    await this.createMasterNode();

    // Start mesh operations
    this.startMeshOperations();

    this.isInitialized = true;
    console.log('[ENHANCED MESH] Real mesh network initialized with master node:', this.masterNode);
  }

  private static setupCrossPlatformHandlers(): void {
    RealCrossPlatformBridge.onMessage('intent', (message) => {
      this.handleRemoteIntent(message);
    });

    RealCrossPlatformBridge.onMessage('influence', (message) => {
      this.executeRemoteInfluence(message);
    });

    RealCrossPlatformBridge.onMessage('status', (message) => {
      this.updateRemoteNodeStatus(message);
    });
  }

  private static async createMasterNode(): Promise<void> {
    const deviceCapabilities = RealHardwareInterface.getCapabilities();
    const hardwareList = Object.entries(deviceCapabilities)
      .filter(([_, available]) => available)
      .map(([name, _]) => name);

    this.masterNode = `master_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;

    const masterNode: EnhancedMeshNode = {
      id: this.masterNode,
      deviceId: 'local',
      capabilities: [...hardwareList, 'rf_generation', 'behavioral_analysis', 'cross_platform'],
      status: 'active',
      energy: 1.0,
      lastActivity: Date.now(),
      connections: [],
      behavioralProfile: null,
      realHardwareAccess: hardwareList.length > 0
    };

    this.nodes.set(this.masterNode, masterNode);
  }

  private static startMeshOperations(): void {
    // Periodic mesh maintenance (optimized)
    setInterval(() => {
      if (this.isPerformanceOptimized) {
        this.maintainMeshNetwork();
        this.syncWithRemoteNodes();
      }
    }, 15000); // Every 15 seconds (reduced frequency)

    // Behavioral analysis updates (throttled)
    setInterval(() => {
      if (this.isPerformanceOptimized) {
        this.updateBehavioralProfiles();
      }
    }, 45000); // Every 45 seconds (reduced frequency)
  }

  private static isPerformanceOptimized = true;

  static optimizePerformance(): void {
    const nodeCount = this.nodes.size;
    
    // Throttle operations if approaching limit
    if (nodeCount > 30) {
      this.isPerformanceOptimized = false;
      console.log('[PERFORMANCE] Throttling operations due to high node count:', nodeCount);
      
      // Re-enable after cleanup
      setTimeout(() => {
        this.isPerformanceOptimized = true;
      }, 10000);
    }
    
    // Hard limit enforcement
    if (nodeCount >= this.MAX_MESH_NODES) {
      console.warn(`[MESH] Node limit reached (${this.MAX_MESH_NODES}). Cleaning up oldest inactive nodes.`);
      this.cleanupInactiveNodes();
    }
  }
  
  private static cleanupInactiveNodes(): void {
    const now = Date.now();
    const inactiveNodes = Array.from(this.nodes.entries())
      .filter(([id, node]) => id !== this.masterNode && (now - node.lastActivity > 30000))
      .sort(([, a], [, b]) => a.lastActivity - b.lastActivity)
      .slice(0, 10); // Remove up to 10 oldest inactive nodes
    
    inactiveNodes.forEach(([nodeId]) => {
      this.nodes.delete(nodeId);
      console.log('[CLEANUP] Removed inactive node:', nodeId);
    });
  }

  private static maintainMeshNetwork(): void {
    const now = Date.now();
    
    this.nodes.forEach((node, nodeId) => {
      // Decay energy over time
      node.energy = Math.max(0, node.energy - 0.01);
      
      // Mark nodes as dormant if inactive
      if (now - node.lastActivity > 60000) { // 1 minute
        node.status = 'dormant';
      }
      
      // Remove completely inactive nodes
      if (now - node.lastActivity > 300000) { // 5 minutes
        this.nodes.delete(nodeId);
      }
    });
  }

  private static syncWithRemoteNodes(): void {
    const connectedDevices = RealCrossPlatformBridge.getConnectedDevices();
    
    connectedDevices.forEach(device => {
      if (!this.nodes.has(device.deviceId) && this.nodes.size < this.MAX_MESH_NODES) {
        // Create remote node
        const remoteNode: EnhancedMeshNode = {
          id: `remote_${device.deviceId}`,
          deviceId: device.deviceId,
          capabilities: device.hardware,
          status: 'active',
          energy: 0.8,
          lastActivity: device.lastUpdate,
          connections: [],
          behavioralProfile: null,
          realHardwareAccess: device.hardware.length > 0
        };

        this.nodes.set(device.deviceId, remoteNode);
      }
    });
  }

  private static updateBehavioralProfiles(): void {
    const currentPattern = RealBehavioralTracking.analyzeCurrentSession();
    const masterNode = this.nodes.get(this.masterNode);
    
    if (masterNode) {
      masterNode.behavioralProfile = {
        engagementScore: currentPattern.engagementScore,
        attentionSpan: currentPattern.attentionSpan,
        interactionPatterns: currentPattern.interactions.slice(-50), // Last 50 interactions
        scrollBehavior: currentPattern.scrollDepth,
        lastAnalysis: Date.now()
      };
    }
  }

  static async executeRealIntent(
    intent: string,
    intensity: number = 0.8,
    techniques: string[] = ['rf_entrainment', 'behavioral_analysis', 'cross_platform']
  ): Promise<string> {
    const executionId = `real_exec_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    
    console.log(`[REAL EXECUTION] Starting real influence execution: "${intent}" at ${intensity * 100}% intensity`);

    const execution: RealInfluenceExecution = {
      id: executionId,
      intent,
      targetNodes: Array.from(this.nodes.keys()),
      techniques,
      startTime: Date.now(),
      duration: 0,
      effectiveness: 0,
      realHardwareUsed: [],
      behavioralData: {},
      crossPlatformReach: 0
    };

    // Execute across all available systems
    const results = await Promise.allSettled([
      this.executeRFInfluence(intent, intensity),
      this.executeBehavioralInfluence(intent, intensity),
      this.executeCrossPlatformInfluence(intent, intensity),
      this.executeHardwareInfluence(intent, intensity)
    ]);

    // Collect results
    results.forEach((result, index) => {
      if (result.status === 'fulfilled' && result.value) {
        const techniques = ['rf_entrainment', 'behavioral_analysis', 'cross_platform', 'hardware_access'];
        execution.realHardwareUsed.push(techniques[index]);
      }
    });

    // Calculate effectiveness
    execution.effectiveness = execution.realHardwareUsed.length / techniques.length;
    execution.duration = Date.now() - execution.startTime;
    execution.crossPlatformReach = RealCrossPlatformBridge.getConnectedDevices().length;

    this.executions.push(execution);

    // Broadcast to connected devices
    const broadcastCount = RealCrossPlatformBridge.broadcastMessage('influence', {
      intent,
      intensity,
      executionId,
      source: this.masterNode
    });

    console.log(`[REAL EXECUTION] Completed execution ${executionId} with ${(execution.effectiveness * 100).toFixed(1)}% effectiveness across ${broadcastCount} devices`);

    return executionId;
  }

  private static async executeRFInfluence(intent: string, intensity: number): Promise<boolean> {
    try {
      // Use the enhanced RF system
      await RFBrainwaveEntrainment.entrainForIntent(intent, 'behavioral_modification', intensity);
      
      // Also use our real hardware interface
      const frequency = this.intentToFrequency(intent);
      await RealHardwareInterface.generateRealRF(frequency, intensity, 5000);
      
      return true;
    } catch (error) {
      console.error('[RF INFLUENCE] Failed:', error);
      return false;
    }
  }

  private static async executeBehavioralInfluence(intent: string, intensity: number): Promise<boolean> {
    try {
      // Generate psychological influence strategies
      const strategies = await BehavioralPsychologyEngine.generateInfluenceStrategy(intent);
      
      // Execute most effective strategies
      for (const strategy of strategies.slice(0, 3)) {
        if (strategy.rfFrequency) {
          await BehavioralPsychologyEngine.simulateRFModulation(strategy.rfFrequency, 2000);
        }
      }
      
      return true;
    } catch (error) {
      console.error('[BEHAVIORAL INFLUENCE] Failed:', error);
      return false;
    }
  }

  private static async executeCrossPlatformInfluence(intent: string, intensity: number): Promise<boolean> {
    try {
      const connectedDevices = RealCrossPlatformBridge.getConnectedDevices();
      
      if (connectedDevices.length > 0) {
        // Send influence commands to connected devices
        return RealCrossPlatformBridge.broadcastMessage('intent', {
          content: intent,
          intensity,
          timestamp: Date.now()
        }) > 0;
      }
      
      return false;
    } catch (error) {
      console.error('[CROSS PLATFORM INFLUENCE] Failed:', error);
      return false;
    }
  }

  private static async executeHardwareInfluence(intent: string, intensity: number): Promise<boolean> {
    try {
      const capabilities = RealHardwareInterface.getCapabilities();
      let success = false;

      // Use vibration if available
      if (capabilities.vibration) {
        const pattern = this.intentToVibrationPattern(intent, intensity);
        success = await RealHardwareInterface.vibrateDevice(pattern) || success;
      }

      // Access other hardware
      if (capabilities.bluetooth) {
        const device = await RealHardwareInterface.accessBluetoothDevice();
        success = (device !== null) || success;
      }

      return success;
    } catch (error) {
      console.error('[HARDWARE INFLUENCE] Failed:', error);
      return false;
    }
  }

  private static intentToFrequency(intent: string): number {
    // Map intent to brainwave frequencies
    const intentLower = intent.toLowerCase();
    
    if (intentLower.includes('focus')) return 20; // Beta waves
    if (intentLower.includes('relax')) return 10; // Alpha waves  
    if (intentLower.includes('creative')) return 6; // Theta waves
    if (intentLower.includes('energy')) return 30; // High beta
    if (intentLower.includes('sleep')) return 2; // Delta waves
    
    return 10; // Default alpha
  }

  private static intentToVibrationPattern(intent: string, intensity: number): number[] {
    const basePattern = [200, 100, 200, 100];
    return basePattern.map(duration => Math.floor(duration * intensity));
  }

  private static handleRemoteIntent(message: any): void {
    console.log('[REMOTE INTENT] Received:', message.payload.content);
    // Execute the intent locally
    this.executeRealIntent(message.payload.content, message.payload.intensity || 0.5);
  }

  private static executeRemoteInfluence(message: any): void {
    console.log('[REMOTE INFLUENCE] Executing influence from:', message.source);
    // Process remote influence command
  }

  private static updateRemoteNodeStatus(message: any): void {
    const node = this.nodes.get(message.source);
    if (node) {
      node.lastActivity = Date.now();
      node.status = 'active';
      node.energy = Math.min(1.0, node.energy + 0.1);
    }
  }

  static getMeshStatus(): {
    totalNodes: number;
    activeNodes: number;
    masterNode: string;
    totalExecutions: number;
    averageEffectiveness: number;
    realHardwareNodes: number;
    crossPlatformConnections: number;
    behavioralProfiles: number;
  } {
    const activeNodes = Array.from(this.nodes.values()).filter(n => n.status === 'active').length;
    const realHardwareNodes = Array.from(this.nodes.values()).filter(n => n.realHardwareAccess).length;
    const behavioralProfiles = Array.from(this.nodes.values()).filter(n => n.behavioralProfile).length;
    
    const avgEffectiveness = this.executions.length > 0 ? 
      this.executions.reduce((sum, exec) => sum + exec.effectiveness, 0) / this.executions.length : 0;

    return {
      totalNodes: this.nodes.size,
      activeNodes,
      masterNode: this.masterNode,
      totalExecutions: this.executions.length,
      averageEffectiveness: avgEffectiveness,
      realHardwareNodes,
      crossPlatformConnections: RealCrossPlatformBridge.getConnectedDevices().length,
      behavioralProfiles
    };
  }

  static getExecutionHistory(): RealInfluenceExecution[] {
    return this.executions;
  }

  static getNodes(): EnhancedMeshNode[] {
    return Array.from(this.nodes.values());
  }

  static async requestHardwarePermissions(): Promise<void> {
    await RealHardwareInterface.requestAllPermissions();
  }
}
