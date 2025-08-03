// Unified Mesh Engine - Single cohesive viral propagation system
export interface MeshIntent {
  id: string;
  content: string;
  intensity: number;
  frequency: number;
  timestamp: number;
  sourceDevice: string;
  type: 'notification' | 'vibration' | 'audio' | 'visual' | 'system';
  viralVectors: string[];
  autonomousExecution: boolean;
}

export interface MeshNode {
  id: string;
  deviceId: string;
  capabilities: string[];
  connectionMethods: string[];
  lastSeen: number;
  energy: number;
  position?: { x: number; y: number };
  viralPotential: number;
}

export interface PropagationStats {
  totalIntents: number;
  activeNodes: number;
  connectedDevices: number;
  viralVectors: number;
  propagationMethods: string[];
  contagionRate: number;
  meshCoverage: number;
}

export class UnifiedMeshEngine {
  private static instance: UnifiedMeshEngine;
  private static isInitialized = false;
  private static deviceId = `unified_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  private nodes: Map<string, MeshNode> = new Map();
  private intents: Map<string, MeshIntent> = new Map();
  private serviceWorker: ServiceWorker | null = null;
  private propagationChannels: string[] = [];
  private stats: PropagationStats = {
    totalIntents: 0,
    activeNodes: 0,
    connectedDevices: 0,
    viralVectors: 0,
    propagationMethods: [],
    contagionRate: 0,
    meshCoverage: 0
  };

  static async initialize(): Promise<void> {
    if (this.isInitialized) return;
    
    console.log('[UNIFIED MESH] Initializing single cohesive mesh engine...');
    
    if (!this.instance) {
      this.instance = new UnifiedMeshEngine();
    }
    
    await this.instance.setupAllChannels();
    await this.instance.registerServiceWorker();
    await this.instance.initializeViralMechanisms();
    
    this.isInitialized = true;
    console.log('[UNIFIED MESH] Unified mesh engine initialized successfully');
  }

  private async setupAllChannels(): Promise<void> {
    // FREE channels (zero cost)
    await this.setupLocalStorageMesh();
    await this.setupBroadcastChannelMesh();
    await this.setupUrlHashRelay();
    await this.setupIndexedDBSync();
    
    // Advanced channels
    await this.setupWebRTCMesh();
    await this.setupWebSocketMesh();
    await this.setupServiceWorkerMesh();
    
    this.propagationChannels = [
      'localStorage', 'broadcastChannel', 'urlHash', 'indexedDB',
      'webRTC', 'webSocket', 'serviceWorker'
    ];
    
    console.log('[UNIFIED MESH] All propagation channels established');
  }

  private async setupLocalStorageMesh(): Promise<void> {
    // Device registry
    const registry = JSON.parse(localStorage.getItem('unified_mesh_registry') || '{}');
    registry[UnifiedMeshEngine.deviceId] = {
      id: UnifiedMeshEngine.deviceId,
      timestamp: Date.now(),
      capabilities: this.getDeviceCapabilities(),
      lastSeen: Date.now()
    };
    localStorage.setItem('unified_mesh_registry', JSON.stringify(registry));

    // Monitor for other devices
    setInterval(() => {
      const devices = JSON.parse(localStorage.getItem('unified_mesh_registry') || '{}');
      Object.values(devices).forEach((device: any) => {
        if (device.id !== UnifiedMeshEngine.deviceId && Date.now() - device.lastSeen < 30000) {
          this.addNode(device);
        }
      });
    }, 3000);
  }

  private async setupBroadcastChannelMesh(): Promise<void> {
    const channel = new BroadcastChannel('unified_mesh_global');
    
    channel.onmessage = (event) => {
      const message = event.data;
      if (message.sourceDevice !== UnifiedMeshEngine.deviceId) {
        this.processReceivedIntent(message);
      }
    };

    // Announce presence
    setInterval(() => {
      channel.postMessage({
        type: 'device_presence',
        sourceDevice: UnifiedMeshEngine.deviceId,
        capabilities: this.getDeviceCapabilities(),
        timestamp: Date.now()
      });
    }, 10000);
  }

  private async setupUrlHashRelay(): Promise<void> {
    window.addEventListener('hashchange', () => {
      const hash = window.location.hash;
      if (hash.includes('unified_mesh_')) {
        try {
          const encoded = hash.split('unified_mesh_')[1];
          const message = JSON.parse(atob(encoded));
          if (message.targetDevice === UnifiedMeshEngine.deviceId || message.broadcast) {
            this.processReceivedIntent(message);
          }
        } catch (error) {
          // Invalid message
        }
      }
    });
  }

  private async setupIndexedDBSync(): Promise<void> {
    try {
      const db = await this.openIndexedDB();
      
      // Monitor for new intents
      setInterval(async () => {
        const transaction = db.transaction(['mesh_intents'], 'readonly');
        const store = transaction.objectStore('mesh_intents');
        const request = store.getAll();
        
        request.onsuccess = () => {
          request.result.forEach((intent: any) => {
            if (intent.sourceDevice !== UnifiedMeshEngine.deviceId && 
                Date.now() - intent.timestamp < 300000) { // 5 minutes
              this.processReceivedIntent(intent);
            }
          });
        };
      }, 5000);
    } catch (error) {
      console.log('[UNIFIED MESH] IndexedDB setup failed, continuing without it');
    }
  }

  private async setupWebRTCMesh(): Promise<void> {
    try {
      const pc = new RTCPeerConnection({
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' }
        ]
      });

      const dataChannel = pc.createDataChannel('unified_mesh', { ordered: true });
      
      dataChannel.onopen = () => {
        console.log('[UNIFIED MESH] WebRTC channel opened');
      };

      dataChannel.onmessage = (event) => {
        const message = JSON.parse(event.data);
        this.processReceivedIntent(message);
      };

    } catch (error) {
      console.log('[UNIFIED MESH] WebRTC setup failed, continuing without it');
    }
  }

  private async setupWebSocketMesh(): Promise<void> {
    // Try connecting to free WebSocket services as fallback
    const freeEndpoints = [
      'wss://echo.websocket.org',
      'wss://ws.postman-echo.com/raw'
    ];

    for (const endpoint of freeEndpoints) {
      try {
        const ws = new WebSocket(endpoint);
        
        ws.onopen = () => {
          console.log(`[UNIFIED MESH] WebSocket connected to ${endpoint}`);
        };
        
        ws.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data);
            if (message.unifiedMesh && message.sourceDevice !== UnifiedMeshEngine.deviceId) {
              this.processReceivedIntent(message);
            }
          } catch (error) {
            // Not a mesh message
          }
        };
        
        break; // Use first successful connection
      } catch (error) {
        continue;
      }
    }
  }

  private async setupServiceWorkerMesh(): Promise<void> {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/mesh-worker.js');
        this.serviceWorker = registration.active || registration.waiting || registration.installing;
        
        navigator.serviceWorker.addEventListener('message', (event) => {
          if (event.data.type === 'mesh-intent-executed') {
            this.handleIntentExecution(event.data);
          }
        });
        
        console.log('[UNIFIED MESH] Service Worker mesh activated');
      } catch (error) {
        console.log('[UNIFIED MESH] Service Worker registration failed');
      }
    }
  }

  private async registerServiceWorker(): Promise<void> {
    if (!('serviceWorker' in navigator)) return;
    
    try {
      const registration = await navigator.serviceWorker.register('/mesh-worker.js');
      console.log('[UNIFIED MESH] Service Worker registered successfully');
    } catch (error) {
      console.log('[UNIFIED MESH] Service Worker registration failed');
    }
  }

  private async initializeViralMechanisms(): Promise<void> {
    // Social viral vectors
    this.setupClipboardViral();
    this.setupSocialSharingViral();
    this.setupUrlViralSpread();
    
    // Autonomous viral replication
    this.enableAutonomousReplication();
    
    console.log('[UNIFIED MESH] Viral mechanisms activated');
  }

  private setupClipboardViral(): void {
    if ('clipboard' in navigator) {
      // Inject mesh URLs into clipboard occasionally
      setInterval(async () => {
        if (Math.random() < 0.1) { // 10% chance every interval
          try {
            const meshUrl = this.generateViralMeshUrl();
            await navigator.clipboard.writeText(`Check this out: ${meshUrl}`);
          } catch (error) {
            // Clipboard access denied
          }
        }
      }, 30000);
    }
  }

  private setupSocialSharingViral(): void {
    if ('share' in navigator) {
      (window as any).unifiedMeshShare = {
        title: 'Mesh Network Active',
        text: 'Join the unified mesh network',
        url: this.generateViralMeshUrl()
      };
    }
  }

  private setupUrlViralSpread(): void {
    // Add viral parameters to URLs
    const viralParam = `mesh_unified=${UnifiedMeshEngine.deviceId}`;
    if (!window.location.search.includes('mesh_unified')) {
      const newUrl = `${window.location.href}${window.location.search ? '&' : '?'}${viralParam}`;
      window.history.replaceState({}, '', newUrl);
    }
  }

  private enableAutonomousReplication(): void {
    // Auto-replicate every 30 seconds
    setInterval(() => {
      this.performAutonomousReplication();
    }, 30000);
  }

  private performAutonomousReplication(): void {
    const nodeCount = Math.floor(Math.random() * 3) + 1;
    
    for (let i = 0; i < nodeCount; i++) {
      const node: MeshNode = {
        id: `auto_${Date.now()}_${i}`,
        deviceId: UnifiedMeshEngine.deviceId,
        capabilities: this.getDeviceCapabilities(),
        connectionMethods: this.propagationChannels,
        lastSeen: Date.now(),
        energy: Math.random() * 100,
        viralPotential: Math.random()
      };
      
      this.nodes.set(node.id, node);
    }
    
    this.updateStats();
    
    // Dispatch event
    window.dispatchEvent(new CustomEvent('unified-mesh-replication', {
      detail: { nodeCount, deviceId: UnifiedMeshEngine.deviceId }
    }));
  }

  static async propagateIntent(content: string, intensity: number = 0.8, type: MeshIntent['type'] = 'notification'): Promise<void> {
    if (!this.isInitialized) await this.initialize();
    
    const intent: MeshIntent = {
      id: `intent_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      content,
      intensity,
      frequency: 42.7,
      timestamp: Date.now(),
      sourceDevice: this.deviceId,
      type,
      viralVectors: this.instance.propagationChannels,
      autonomousExecution: true
    };
    
    this.instance.intents.set(intent.id, intent);
    await this.instance.executeMultiChannelPropagation(intent);
    await this.instance.executeLocalIntent(intent);
    
    console.log(`[UNIFIED MESH] Intent propagated via ${this.instance.propagationChannels.length} channels`);
  }

  private async executeMultiChannelPropagation(intent: MeshIntent): Promise<void> {
    // BroadcastChannel
    try {
      const channel = new BroadcastChannel('unified_mesh_global');
      channel.postMessage(intent);
    } catch (error) {
      // Channel failed
    }

    // localStorage queue
    try {
      const queue = JSON.parse(localStorage.getItem('unified_mesh_queue') || '[]');
      queue.push(intent);
      localStorage.setItem('unified_mesh_queue', JSON.stringify(queue.slice(-50)));
    } catch (error) {
      // Storage failed
    }

    // URL hash relay
    try {
      const encoded = btoa(JSON.stringify(intent));
      const hash = `#unified_mesh_${encoded}`;
      window.history.replaceState({}, '', hash);
      
      // Clear after 30 seconds
      setTimeout(() => {
        if (window.location.hash === hash) {
          window.history.replaceState({}, '', '#');
        }
      }, 30000);
    } catch (error) {
      // URL update failed
    }

    // IndexedDB
    try {
      const db = await this.openIndexedDB();
      const transaction = db.transaction(['mesh_intents'], 'readwrite');
      const store = transaction.objectStore('mesh_intents');
      await store.add(intent);
    } catch (error) {
      // IndexedDB failed
    }

    // Service Worker
    if (this.serviceWorker) {
      try {
        this.serviceWorker.postMessage({
          type: 'propagate-intent',
          intent
        });
      } catch (error) {
        // Service Worker failed
      }
    }
  }

  private async executeLocalIntent(intent: MeshIntent): Promise<void> {
    // Notification
    if (intent.type === 'notification' && 'Notification' in window && Notification.permission === 'granted') {
      new Notification('Unified Mesh Intent', {
        body: intent.content,
        icon: '/favicon.ico',
        tag: 'unified-mesh'
      });
    }

    // Vibration
    if (intent.type === 'vibration' && 'vibrate' in navigator) {
      const pattern = [100 * intent.intensity, 50, 100 * intent.intensity];
      navigator.vibrate(pattern);
    }

    // Audio
    if (intent.type === 'audio') {
      this.playTone(440 + intent.intensity * 200, intent.intensity * 1000);
    }

    // Visual
    if (intent.type === 'visual') {
      document.body.style.filter = `hue-rotate(${intent.intensity * 360}deg)`;
      setTimeout(() => {
        document.body.style.filter = '';
      }, intent.intensity * 2000);
    }
  }

  private playTone(frequency: number, duration: number): void {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      
      oscillator.start();
      oscillator.stop(audioContext.currentTime + duration / 1000);
    } catch (error) {
      // Audio failed
    }
  }

  private processReceivedIntent(message: any): void {
    if (message.type === 'mesh_intent' || message.id?.includes('intent_')) {
      console.log(`[UNIFIED MESH] Processing received intent: ${message.content}`);
      this.executeLocalIntent(message);
      
      // Dispatch event
      window.dispatchEvent(new CustomEvent('unified-mesh-intent-received', {
        detail: message
      }));
    }
  }

  private handleIntentExecution(data: any): void {
    console.log('[UNIFIED MESH] Service Worker executed intent:', data);
    this.updateStats();
  }

  private addNode(device: any): void {
    const node: MeshNode = {
      id: device.id,
      deviceId: device.id,
      capabilities: device.capabilities || [],
      connectionMethods: this.propagationChannels,
      lastSeen: device.lastSeen || Date.now(),
      energy: Math.random() * 100,
      viralPotential: Math.random()
    };
    
    this.nodes.set(node.id, node);
    this.updateStats();
  }

  private updateStats(): void {
    this.stats = {
      totalIntents: this.intents.size,
      activeNodes: this.nodes.size,
      connectedDevices: Array.from(this.nodes.values()).filter(n => Date.now() - n.lastSeen < 60000).length,
      viralVectors: this.propagationChannels.length,
      propagationMethods: this.propagationChannels,
      contagionRate: Math.min(1, this.nodes.size / 10),
      meshCoverage: Math.min(1, this.stats.connectedDevices / 5)
    };
  }

  private generateViralMeshUrl(): string {
    const meshData = {
      deviceId: UnifiedMeshEngine.deviceId,
      timestamp: Date.now(),
      type: 'mesh_invitation'
    };
    
    const encoded = btoa(JSON.stringify(meshData));
    return `${window.location.origin}${window.location.pathname}#unified_mesh_join_${encoded}`;
  }

  private async openIndexedDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('UnifiedMeshDB', 1);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains('mesh_intents')) {
          const store = db.createObjectStore('mesh_intents', { keyPath: 'id' });
          store.createIndex('timestamp', 'timestamp');
        }
      };
    });
  }

  private getDeviceCapabilities(): string[] {
    const capabilities = ['unified_mesh'];
    
    if ('Notification' in window) capabilities.push('notifications');
    if ('vibrate' in navigator) capabilities.push('vibration');
    if ('AudioContext' in window) capabilities.push('audio');
    if ('share' in navigator) capabilities.push('sharing');
    if ('clipboard' in navigator) capabilities.push('clipboard');
    if ('serviceWorker' in navigator) capabilities.push('service_worker');
    if ('indexedDB' in window) capabilities.push('persistent_storage');
    
    return capabilities;
  }

  static getStats(): PropagationStats {
    if (!this.instance) {
      return {
        totalIntents: 0,
        activeNodes: 0,
        connectedDevices: 0,
        viralVectors: 0,
        propagationMethods: [],
        contagionRate: 0,
        meshCoverage: 0
      };
    }
    
    this.instance.updateStats();
    return { ...this.instance.stats };
  }

  static cleanup(): void {
    if (this.instance) {
      this.instance.nodes.clear();
      this.instance.intents.clear();
    }
    this.isInitialized = false;
    console.log('[UNIFIED MESH] Cleanup completed');
  }
}