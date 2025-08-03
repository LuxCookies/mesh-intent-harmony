
import { SharedPermissionManager } from './SharedPermissionManager';
import { ViralPropagation } from './ViralPropagation';

interface AutonomousNode {
  id: string;
  type: 'autonomous' | 'replica';
  energy: number;
  frequency: number;
  createdFrom: string;
  lastExecution: number;
  executionCount: number;
  position: { x: number; y: number };
  replicatedFrom?: string;
}

interface AutonomousIntent {
  content: string;
  type: 'notification' | 'vibration' | 'audio' | 'visual';
  intensity: number;
  frequency?: number;
  requiredPermissions: string[];
  timestamp: number;
}

export class AutonomousMesh {
  private static serviceWorker: ServiceWorker | null = null;
  private static isInitialized = false;
  private static nodes: Map<string, AutonomousNode> = new Map();

  static async initialize(): Promise<void> {
    if (this.isInitialized) return;

    await this.registerServiceWorker();
    await this.setupMessageHandling();
    await this.syncPermissions();
    await this.enableHyperContagion();
    
    this.isInitialized = true;
    console.log('[AUTONOMOUS MESH] Initialized with hyper-contagious capabilities');
  }

  private static async registerServiceWorker(): Promise<void> {
    if (!('serviceWorker' in navigator)) {
      console.warn('[AUTONOMOUS MESH] Service Worker not supported');
      return;
    }

    try {
      const registration = await navigator.serviceWorker.register('/mesh-worker.js');
      
      if (registration.active) {
        this.serviceWorker = registration.active;
      } else if (registration.waiting) {
        this.serviceWorker = registration.waiting;
      } else if (registration.installing) {
        this.serviceWorker = registration.installing;
      }

      // Handle service worker updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing!;
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'activated') {
            this.serviceWorker = newWorker;
            this.syncPermissions();
          }
        });
      });

      console.log('[AUTONOMOUS MESH] Service worker registered successfully');
    } catch (error) {
      console.error('[AUTONOMOUS MESH] Service worker registration failed:', error);
    }
  }

  private static async setupMessageHandling(): Promise<void> {
    navigator.serviceWorker.addEventListener('message', (event) => {
      const { type, data } = event.data;

      switch (type) {
        case 'intent-executed':
          this.handleIntentExecuted(data);
          break;
        case 'mesh-state-sync':
          this.handleMeshStateSync(data);
          break;
        case 'execute-notification':
          this.executeClientNotification(data);
          break;
        case 'execute-vibration':
          this.executeClientVibration(data);
          break;
        case 'execute-audio':
          this.executeClientAudio(data);
          break;
        case 'execute-visual':
          this.executeClientVisual(data);
          break;
      }
    });
  }

  static async injectIntent(
    content: string,
    type: AutonomousIntent['type'] = 'notification',
    intensity: number = 0.5,
    frequency?: number
  ): Promise<void> {
    if (!this.serviceWorker) {
      console.warn('[AUTONOMOUS MESH] Service worker not available');
      return;
    }

    const intent: Partial<AutonomousIntent> = {
      content,
      type,
      intensity,
      frequency,
      requiredPermissions: this.getRequiredPermissions(type)
    };

    this.serviceWorker.postMessage({
      type: 'inject-intent',
      data: intent
    });

    console.log(`[AUTONOMOUS MESH] Intent injected for autonomous execution: ${content}`);
    
    // Dispatch event for UI updates
    window.dispatchEvent(new CustomEvent('autonomous-intent-injected', {
      detail: { intent }
    }));
  }

  private static getRequiredPermissions(type: AutonomousIntent['type']): string[] {
    switch (type) {
      case 'notification':
        return ['notifications'];
      case 'vibration':
        return ['vibration'];
      case 'audio':
        return ['audio', 'microphone'];
      case 'visual':
        return [];
      default:
        return [];
    }
  }

  private static async syncPermissions(): Promise<void> {
    if (!this.serviceWorker) return;

    const permissions = Object.fromEntries(SharedPermissionManager.getAllPermissions());
    
    this.serviceWorker.postMessage({
      type: 'update-permissions',
      data: permissions
    });

    console.log('[AUTONOMOUS MESH] Synced permissions to service worker');
  }

  private static handleIntentExecuted(data: any): void {
    console.log(`[AUTONOMOUS MESH] Intent executed across ${data.nodeCount} nodes`);
    
    window.dispatchEvent(new CustomEvent('autonomous-execution-complete', {
      detail: data
    }));
  }

  private static handleMeshStateSync(data: any): void {
    window.dispatchEvent(new CustomEvent('autonomous-mesh-sync', {
      detail: data
    }));
  }

  private static executeClientNotification(data: any): void {
    if (SharedPermissionManager.hasPermission('notifications')) {
      new Notification(data.title, {
        body: data.body,
        tag: `mesh-${data.nodeId}`,
        icon: '/favicon.ico'
      });
    }
  }

  private static executeClientVibration(data: any): void {
    if ('vibrate' in navigator) {
      navigator.vibrate(data.pattern);
    }
  }

  private static executeClientAudio(data: any): void {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      const audioContext = new AudioContext();
      
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(data.frequency, audioContext.currentTime);
      gainNode.gain.setValueAtTime(data.intensity * 0.1, audioContext.currentTime);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + (data.duration / 1000));
    } catch (error) {
      console.error('Audio execution failed:', error);
    }
  }

  private static executeClientVisual(data: any): void {
    const element = document.body;
    element.style.filter = data.value;
    
    setTimeout(() => {
      element.style.filter = '';
    }, data.duration);
  }

  static async getStatus(): Promise<any> {
    if (!this.serviceWorker) return { nodes: 0, permissions: [], queueLength: 0 };

    return new Promise((resolve) => {
      const channel = new MessageChannel();
      
      channel.port1.onmessage = (event) => {
        resolve(event.data);
      };
      
      this.serviceWorker!.postMessage({
        type: 'get-status'
      }, [channel.port2]);
    });
  }

  static async requestBackgroundSync(): Promise<void> {
    if (!('serviceWorker' in navigator)) {
      console.warn('[AUTONOMOUS MESH] Service Worker not supported');
      return;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      
      // Check if Background Sync is supported
      if ('sync' in registration) {
        await (registration as any).sync.register('mesh-execution');
        console.log('[AUTONOMOUS MESH] Background sync requested');
      } else {
        console.warn('[AUTONOMOUS MESH] Background Sync API not supported');
        // Fallback: trigger immediate execution
        if (this.serviceWorker) {
          this.serviceWorker.postMessage({
            type: 'fallback-execution'
          });
        }
      }
    } catch (error) {
      console.error('[AUTONOMOUS MESH] Background sync registration failed:', error);
    }
  }

  private static async enableHyperContagion(): Promise<void> {
    try {
      // Initialize viral propagation system with safety limits
      await ViralPropagation.initialize();
      
      // Setup mesh-viral integration
      this.setupViralIntegration();
      
      // Enable rapid mesh replication with limits
      this.enableRapidMeshReplication();
      
      console.log('[AUTONOMOUS MESH] Hyper-contagious mesh capabilities enabled');
    } catch (error) {
      console.error('[AUTONOMOUS MESH] Failed to enable hyper-contagion:', error);
    }
  }

  private static setupViralIntegration(): void {
    // Listen for viral spread events
    window.addEventListener('viral-spread', (event: any) => {
      const { mechanism, vectorCount } = event.detail;
      
      // Inject viral intent into mesh
      this.injectIntent(
        `Viral spread via ${mechanism} detected`,
        'notification',
        0.3
      );
      
      // Trigger mesh expansion
      if (vectorCount > 5) {
        this.requestBackgroundSync();
      }
    });

    // Listen for mesh propagation events
    window.addEventListener('mesh-propagation', (event: any) => {
      const { nodeCount } = event.detail;
      
      // Trigger viral replication when mesh expands
      if (nodeCount > 10) {
        this.triggerViralReplication();
      }
    });
  }

  private static enableRapidMeshReplication(): void {
    // Rapid node creation with safety limits
    let replicationCount = 0;
    const maxReplications = 10;
    
    const replicationInterval = setInterval(() => {
      if (replicationCount < maxReplications) {
        this.performAutonomousReplication();
        replicationCount++;
      } else {
        clearInterval(replicationInterval);
      }
    }, 20000); // Every 20 seconds
  }

  private static triggerViralReplication(): void {
    // Trigger viral propagation when mesh grows
    const viralIntents = [
      'Network mesh expanding rapidly',
      'Cross-device propagation active',
      'Autonomous nodes replicating',
      'Viral spread vectors deployed'
    ];

    const randomIntent = viralIntents[Math.floor(Math.random() * viralIntents.length)];
    
    this.injectIntent(randomIntent, 'visual', 0.2);
    
    // Dispatch viral expansion event
    window.dispatchEvent(new CustomEvent('mesh-viral-expansion', {
      detail: {
        meshNodes: this.nodes.size,
        viralVectors: ViralPropagation.getViralVectors().length,
        timestamp: Date.now()
      }
    }));
  }

  private static performAutonomousReplication(): void {
    // Autonomous mesh self-replication
    if (this.serviceWorker && this.nodes.size < 100) {
      this.serviceWorker.postMessage({
        type: 'trigger-replication',
        data: {
          intensity: Math.random() * 0.5 + 0.5,
          targetCount: Math.floor(Math.random() * 10) + 5
        }
      });
    }
  }

  static getContagionStats(): any {
    const viralStats = ViralPropagation.getContaminationStats();
    
    return {
      meshNodes: this.nodes.size,
      viralVectors: viralStats.activeVectors,
      spreadEvents: viralStats.spreadEvents,
      infectivity: viralStats.averageInfectivity,
      stealth: viralStats.averageStealth,
      lastSpread: viralStats.lastSpread,
      isHyperContagious: viralStats.activeVectors > 3 && this.nodes.size > 10
    };
  }

  static isSupported(): boolean {
    return 'serviceWorker' in navigator;
  }
}
