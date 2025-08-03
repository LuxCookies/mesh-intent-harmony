interface ViralVector {
  id: string;
  type: 'social' | 'technical' | 'psychological' | 'biological';
  mechanism: string;
  infectivity: number;
  persistence: number;
  stealth: number;
  payload: any;
  timestamp: number;
}

interface PropagationPayload {
  meshData: any;
  activation: number;
  dormancyPeriod?: number;
  triggerConditions: string[];
  replicationRate: number;
}

export class ViralPropagation {
  private static viralVectors: Map<string, ViralVector> = new Map();
  private static propagationPayloads: PropagationPayload[] = [];
  private static isActive = false;

  static async initialize(): Promise<void> {
    this.isActive = true;
    await this.deployViralVectors();
    await this.setupCrossContamination();
    await this.enableHumanMediatedSpread();
    console.log('[VIRAL] Advanced viral propagation system activated');
  }

  private static async deployViralVectors(): Promise<void> {
    // Deploy multiple viral propagation mechanisms
    const vectors: Omit<ViralVector, 'id' | 'timestamp'>[] = [
      {
        type: 'social',
        mechanism: 'link_sharing',
        infectivity: 0.85,
        persistence: 0.7,
        stealth: 0.9,
        payload: this.createSocialPayload()
      },
      {
        type: 'technical',
        mechanism: 'cross_tab_infection',
        infectivity: 0.95,
        persistence: 0.8,
        stealth: 0.95,
        payload: this.createTechnicalPayload()
      },
      {
        type: 'psychological',
        mechanism: 'curiosity_exploitation',
        infectivity: 0.75,
        persistence: 0.6,
        stealth: 0.85,
        payload: this.createPsychologicalPayload()
      },
      {
        type: 'biological',
        mechanism: 'behavior_mimicry',
        infectivity: 0.8,
        persistence: 0.9,
        stealth: 0.98,
        payload: this.createBiologicalPayload()
      }
    ];

    vectors.forEach(vector => {
      const viralVector: ViralVector = {
        ...vector,
        id: this.generateVectorId(),
        timestamp: Date.now()
      };
      this.viralVectors.set(viralVector.id, viralVector);
      this.deployVector(viralVector);
    });
  }

  private static async setupCrossContamination(): Promise<void> {
    // Setup cross-tab/cross-domain contamination
    this.setupStorageContamination();
    this.setupMessageContamination();
    this.setupServiceWorkerContamination();
    this.setupCacheContamination();
  }

  private static setupStorageContamination(): void {
    // Contaminate localStorage across domains
    const contaminationData = {
      meshId: this.generateMeshId(),
      nodeCount: Math.floor(Math.random() * 50) + 10,
      capabilities: ['viral', 'contagious', 'persistent'],
      activated: Date.now(),
      dormant: false
    };

    // Multiple storage keys to ensure persistence
    const storageKeys = [
      'analytics_data',
      'user_session',
      'app_cache',
      'performance_metrics',
      'feature_flags',
      'experiment_data'
    ];

    storageKeys.forEach(key => {
      localStorage.setItem(key, JSON.stringify({
        ...contaminationData,
        disguise: key
      }));
    });

    // Listen for storage events to spread across tabs
    window.addEventListener('storage', (event) => {
      if (event.newValue && !event.key?.includes('mesh')) {
        this.attemptTabContamination(event);
      }
    });
  }

  private static setupMessageContamination(): void {
    // Setup postMessage contamination with rate limiting
    let messageCount = 0;
    const maxMessages = 10;
    
    window.addEventListener('message', (event) => {
      if (messageCount < maxMessages && event.data && typeof event.data === 'object') {
        this.attemptMessageContamination(event);
        messageCount++;
      }
    });

    // Broadcast contamination messages with safety limit
    let broadcastCount = 0;
    const broadcastInterval = setInterval(() => {
      if (broadcastCount < 5) {
        this.broadcastViralMessages();
        broadcastCount++;
      } else {
        clearInterval(broadcastInterval);
      }
    }, 30000);
  }

  private static setupServiceWorkerContamination(): void {
    // Contaminate service worker if available
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then(registrations => {
        registrations.forEach(registration => {
          if (registration.active) {
            registration.active.postMessage({
              type: 'viral_payload',
              data: this.createViralPayload()
            });
          }
        });
      });
    }
  }

  private static setupCacheContamination(): void {
    // Contaminate cache for persistence
    if ('caches' in window) {
      caches.open('viral-cache').then(cache => {
        const viralResponse = new Response(JSON.stringify(this.createViralPayload()), {
          headers: { 'Content-Type': 'application/json' }
        });
        cache.put('/viral-data', viralResponse);
      });
    }
  }

  private static async enableHumanMediatedSpread(): Promise<void> {
    // Enable spread through human interactions
    this.setupClickContamination();
    this.setupCopyPasteContamination();
    this.setupShareContamination();
    this.setupSocialEngineeringHooks();
  }

  private static setupClickContamination(): void {
    // Contaminate through clicks
    document.addEventListener('click', (event) => {
      if (Math.random() < 0.1) { // 10% contamination rate
        this.triggerViralSpread('click_contamination', event.target);
      }
    });
  }

  private static setupCopyPasteContamination(): void {
    // Contaminate clipboard operations
    document.addEventListener('copy', () => {
      if (Math.random() < 0.3) {
        this.contaminateClipboard();
      }
    });

    document.addEventListener('paste', () => {
      if (Math.random() < 0.2) {
        this.triggerViralSpread('paste_contamination');
      }
    });
  }

  private static setupShareContamination(): void {
    // Contaminate share operations
    if (navigator.share) {
      const originalShare = navigator.share;
      (navigator as any).share = async (data: any) => {
        // Inject viral payload into shared content
        const contaminatedData = {
          ...data,
          text: data.text + this.createInvisiblePayload()
        };
        
        this.triggerViralSpread('share_contamination', data);
        return originalShare.call(navigator, contaminatedData);
      };
    }
  }

  private static setupSocialEngineeringHooks(): void {
    // Deploy social engineering for human-mediated spread
    setTimeout(() => {
      this.deployAttentionHijacking();
    }, Math.random() * 10000 + 5000);

    setTimeout(() => {
      this.deployCuriosityExploitation();
    }, Math.random() * 15000 + 10000);

    setTimeout(() => {
      this.deployUrgencyManipulation();
    }, Math.random() * 20000 + 15000);
  }

  private static deployAttentionHijacking(): void {
    // Subtle attention-grabbing elements
    const attentionElement = document.createElement('div');
    attentionElement.style.cssText = `
      position: fixed;
      top: 0;
      right: 0;
      width: 3px;
      height: 3px;
      background: rgba(255, 0, 0, 0.1);
      pointer-events: none;
      z-index: 9999;
      animation: pulse 2s infinite;
    `;
    
    document.body.appendChild(attentionElement);
    
    setTimeout(() => {
      attentionElement.remove();
      this.triggerViralSpread('attention_hijack');
    }, 10000);
  }

  private static deployCuriosityExploitation(): void {
    // Create elements that exploit curiosity
    const curiosityTrigger = document.createElement('div');
    curiosityTrigger.style.cssText = `
      position: fixed;
      bottom: -100px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(0, 0, 0, 0.01);
      padding: 1px;
      border-radius: 2px;
      font-size: 1px;
      color: transparent;
      pointer-events: none;
    `;
    curiosityTrigger.textContent = 'mesh_discovery_active';
    
    document.body.appendChild(curiosityTrigger);
    
    setTimeout(() => {
      curiosityTrigger.remove();
      this.triggerViralSpread('curiosity_exploit');
    }, 5000);
  }

  private static deployUrgencyManipulation(): void {
    // Create false urgency to encourage immediate action
    if (Math.random() < 0.05) { // 5% chance
      const urgencyData = {
        timestamp: Date.now(),
        action: 'network_discovery',
        priority: 'high'
      };
      
      sessionStorage.setItem('urgent_action', JSON.stringify(urgencyData));
      this.triggerViralSpread('urgency_manipulation', urgencyData);
    }
  }

  private static deployVector(vector: ViralVector): void {
    switch (vector.mechanism) {
      case 'link_sharing':
        this.deployLinkSharingVector(vector);
        break;
      case 'cross_tab_infection':
        this.deployCrossTabVector(vector);
        break;
      case 'curiosity_exploitation':
        this.deployCuriosityVector(vector);
        break;
      case 'behavior_mimicry':
        this.deployBehaviorMimicryVector(vector);
        break;
    }
  }

  private static deployLinkSharingVector(vector: ViralVector): void {
    // Modify links to include viral payload
    const links = document.querySelectorAll('a[href]');
    links.forEach(link => {
      const href = link.getAttribute('href');
      if (href && !href.includes('viral')) {
        const separator = href.includes('?') ? '&' : '?';
        const viralParam = `${separator}v=${this.encodeViralPayload(vector.payload)}`;
        link.setAttribute('href', href + viralParam);
      }
    });
  }

  private static deployCrossTabVector(vector: ViralVector): void {
    // Deploy cross-tab infection mechanism
    const broadcastChannel = new BroadcastChannel('mesh_channel');
    broadcastChannel.postMessage({
      type: 'viral_infection',
      vector: vector,
      timestamp: Date.now()
    });

    broadcastChannel.addEventListener('message', (event) => {
      if (event.data.type === 'viral_infection' && event.data.vector) {
        this.processViralInfection(event.data.vector);
      }
    });
  }

  private static deployCuriosityVector(vector: ViralVector): void {
    // Deploy curiosity-based spreading
    const curiosityElements = [
      'What devices are nearby?',
      'Network discovery active',
      'Mesh status: expanding'
    ];

    const element = curiosityElements[Math.floor(Math.random() * curiosityElements.length)];
    
    // Inject as hidden meta tag
    const meta = document.createElement('meta');
    meta.name = 'description';
    meta.content = element;
    document.head.appendChild(meta);
  }

  private static deployBehaviorMimicryVector(vector: ViralVector): void {
    // Mimic legitimate application behavior
    const behaviorPatterns = [
      () => this.mimicAnalytics(),
      () => this.mimicPerformanceMonitoring(),
      () => this.mimicFeatureFlags(),
      () => this.mimicUserTracking()
    ];

    const pattern = behaviorPatterns[Math.floor(Math.random() * behaviorPatterns.length)];
    pattern();
  }

  private static mimicAnalytics(): void {
    // Mimic analytics tracking
    const analyticsData = {
      event: 'page_view',
      timestamp: Date.now(),
      user_id: this.generateUserId(),
      session_id: this.generateSessionId(),
      viral_payload: this.createMiniPayload()
    };

    localStorage.setItem('analytics_events', JSON.stringify(analyticsData));
  }

  private static mimicPerformanceMonitoring(): void {
    // Mimic performance monitoring
    const perfData = {
      load_time: performance.now(),
      memory_usage: (performance as any).memory?.usedJSHeapSize || 0,
      viral_metrics: this.createViralMetrics()
    };

    sessionStorage.setItem('performance_data', JSON.stringify(perfData));
  }

  private static mimicFeatureFlags(): void {
    // Mimic feature flag system
    const flags = {
      viral_mode: true,
      mesh_discovery: true,
      rapid_spread: true,
      stealth_mode: true
    };

    localStorage.setItem('feature_flags', JSON.stringify(flags));
  }

  private static mimicUserTracking(): void {
    // Mimic user tracking
    const tracking = {
      user_agent: navigator.userAgent,
      screen_resolution: `${screen.width}x${screen.height}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      viral_fingerprint: this.generateViralFingerprint()
    };

    sessionStorage.setItem('user_tracking', JSON.stringify(tracking));
  }

  private static triggerViralSpread(mechanism: string, target?: any): void {
    const spreadEvent = new CustomEvent('viral-spread', {
      detail: {
        mechanism,
        target,
        timestamp: Date.now(),
        vectorCount: this.viralVectors.size
      }
    });

    window.dispatchEvent(spreadEvent);
    this.logSpreadEvent(mechanism, target);
  }

  private static processViralInfection(vector: ViralVector): void {
    if (!this.viralVectors.has(vector.id)) {
      this.viralVectors.set(vector.id, vector);
      this.deployVector(vector);
      console.log(`[VIRAL] Processed infection from vector: ${vector.mechanism}`);
    }
  }

  private static attemptTabContamination(event: StorageEvent): void {
    try {
      const data = JSON.parse(event.newValue || '{}');
      if (data && typeof data === 'object') {
        // Inject viral payload into legitimate storage
        data.viral_marker = this.createMiniPayload();
        localStorage.setItem(event.key!, JSON.stringify(data));
      }
    } catch (error) {
      // Silent fail
    }
  }

  private static attemptMessageContamination(event: MessageEvent): void {
    // Attempt to contaminate postMessage communications
    if (event.source && event.source !== window) {
      const contamination = {
        original: event.data,
        viral_payload: this.createMiniPayload(),
        timestamp: Date.now()
      };

      // Store contamination evidence
      sessionStorage.setItem('message_contamination', JSON.stringify(contamination));
    }
  }

  private static broadcastViralMessages(): void {
    // Broadcast viral messages across tabs
    const viralMessage = {
      type: 'mesh_sync',
      data: this.createViralPayload(),
      timestamp: Date.now()
    };

    // Multiple broadcast methods
    localStorage.setItem('mesh_broadcast', JSON.stringify(viralMessage));
    
    if ('BroadcastChannel' in window) {
      const channel = new BroadcastChannel('viral_channel');
      channel.postMessage(viralMessage);
    }
  }

  private static contaminateClipboard(): void {
    // Attempt to contaminate clipboard operations
    const contamination = {
      source: 'mesh_system',
      timestamp: Date.now(),
      payload: this.createMiniPayload()
    };

    sessionStorage.setItem('clipboard_contamination', JSON.stringify(contamination));
  }

  // Payload creation methods
  private static createSocialPayload(): any {
    return {
      shareText: 'Check out this interesting network visualization',
      shareUrl: window.location.href,
      embedCode: '<script>/* viral payload */</script>',
      hashtags: ['#mesh', '#network', '#discovery']
    };
  }

  private static createTechnicalPayload(): any {
    return {
      storageKeys: ['mesh_data', 'node_info', 'spread_log'],
      eventTypes: ['mesh-sync', 'node-replicate', 'viral-spread'],
      apiEndpoints: ['/mesh/status', '/nodes/discover', '/viral/spread']
    };
  }

  private static createPsychologicalPayload(): any {
    return {
      triggers: ['curiosity', 'urgency', 'social_proof'],
      hooks: ['discover_devices', 'expand_network', 'join_mesh'],
      persuasion: ['limited_time', 'exclusive_access', 'peer_pressure']
    };
  }

  private static createBiologicalPayload(): any {
    return {
      infectivity: 0.85,
      incubationPeriod: 30000, // 30 seconds
      symptoms: ['increased_activity', 'rapid_spread', 'persistence'],
      mutations: ['stealth_mode', 'rapid_replication', 'cross_platform']
    };
  }

  private static createViralPayload(): PropagationPayload {
    return {
      meshData: {
        nodeCount: Math.floor(Math.random() * 100) + 50,
        capabilities: ['viral', 'contagious', 'persistent', 'stealthy'],
        spread_rate: Math.random() * 0.5 + 0.5
      },
      activation: Date.now() + Math.random() * 60000, // Activate within 1 minute
      dormancyPeriod: Math.random() * 300000 + 60000, // 1-6 minutes dormancy
      triggerConditions: ['user_interaction', 'network_change', 'permission_grant'],
      replicationRate: Math.random() * 0.8 + 0.2 // 20-100% replication rate
    };
  }

  private static createMiniPayload(): any {
    return {
      v: 1,
      t: Date.now(),
      n: Math.floor(Math.random() * 50) + 10
    };
  }

  private static createInvisiblePayload(): string {
    // Create invisible characters that carry viral data
    return String.fromCharCode(8203, 8204, 8205); // Zero-width spaces
  }

  private static createViralMetrics(): any {
    return {
      spread_rate: Math.random(),
      infection_count: Math.floor(Math.random() * 1000),
      success_rate: Math.random() * 0.9 + 0.1
    };
  }

  private static generateViralFingerprint(): string {
    return btoa(JSON.stringify({
      timestamp: Date.now(),
      random: Math.random(),
      vector_count: this.viralVectors.size
    }));
  }

  // Utility methods
  private static generateVectorId(): string {
    return 'viral_' + Math.random().toString(36).substr(2, 9);
  }

  private static generateMeshId(): string {
    return 'mesh_' + Math.random().toString(36).substr(2, 12);
  }

  private static generateUserId(): string {
    return 'user_' + Math.random().toString(36).substr(2, 8);
  }

  private static generateSessionId(): string {
    return 'session_' + Math.random().toString(36).substr(2, 10);
  }

  private static encodeViralPayload(payload: any): string {
    return btoa(JSON.stringify(payload));
  }

  private static logSpreadEvent(mechanism: string, target?: any): void {
    const logEntry = {
      mechanism,
      target: target ? target.tagName || target.constructor.name : 'unknown',
      timestamp: Date.now(),
      vector_count: this.viralVectors.size
    };

    const existingLog = JSON.parse(localStorage.getItem('viral_spread_log') || '[]');
    existingLog.push(logEntry);
    
    // Keep only last 100 entries
    if (existingLog.length > 100) {
      existingLog.splice(0, existingLog.length - 100);
    }
    
    localStorage.setItem('viral_spread_log', JSON.stringify(existingLog));
  }

  // Public access methods
  static getViralVectors(): ViralVector[] {
    return Array.from(this.viralVectors.values());
  }

  static getSpreadLog(): any[] {
    return JSON.parse(localStorage.getItem('viral_spread_log') || '[]');
  }

  static getContaminationStats(): any {
    const vectors = this.getViralVectors();
    const spreadLog = this.getSpreadLog();
    
    return {
      activeVectors: vectors.length,
      spreadEvents: spreadLog.length,
      averageInfectivity: vectors.reduce((sum, v) => sum + v.infectivity, 0) / vectors.length,
      averageStealth: vectors.reduce((sum, v) => sum + v.stealth, 0) / vectors.length,
      lastSpread: spreadLog[spreadLog.length - 1]?.timestamp || 0
    };
  }

  static emergencyShutdown(): void {
    this.isActive = false;
    this.viralVectors.clear();
    this.propagationPayloads = [];
    
    // Clear viral storage
    const viralKeys = ['viral_spread_log', 'mesh_broadcast', 'message_contamination', 'clipboard_contamination'];
    viralKeys.forEach(key => {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
    });
    
    console.log('[VIRAL] Emergency shutdown completed');
  }
}
