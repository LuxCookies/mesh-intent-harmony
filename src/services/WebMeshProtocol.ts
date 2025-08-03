// Advanced Web Mesh Protocol - Cross-Device Real-Time Networking
export class WebMeshProtocol {
  private static rtcPeers: Map<string, RTCPeerConnection> = new Map();
  private static webSocketConnections: Map<string, WebSocket> = new Map();
  private static serviceWorkerChannels: Map<string, MessageChannel> = new Map();
  private static meshSignalingServer = 'wss://mesh-signal.vercel.app'; // We'll create this
  private static deviceId = `web_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  private static isInitialized = false;

  static async initialize(): Promise<void> {
    if (this.isInitialized) return;
    
    console.log('[WEB MESH] Initializing advanced web mesh protocol');
    
    await this.setupWebRTCMesh();
    await this.initializeBroadcastChannels();
    await this.setupWebPushNotifications();
    await this.enableWebBluetoothDiscovery();
    await this.setupProximityDetection();
    await this.initializeViralPropagation();
    
    this.isInitialized = true;
  }

  // Real WebRTC mesh networking
  private static async setupWebRTCMesh(): Promise<void> {
    try {
      // Connect to signaling server for peer discovery
      const signalingWs = new WebSocket(this.meshSignalingServer);
      
      signalingWs.onopen = () => {
        console.log('[WEB MESH] Connected to mesh signaling server');
        
        // Announce this device to the mesh
        signalingWs.send(JSON.stringify({
          type: 'announce',
          deviceId: this.deviceId,
          capabilities: this.getDeviceCapabilities(),
          timestamp: Date.now()
        }));
      };

      signalingWs.onmessage = async (event) => {
        const message = JSON.parse(event.data);
        await this.handleSignalingMessage(message);
      };

      signalingWs.onerror = (error) => {
        console.log('[WEB MESH] Signaling server connection failed, using fallback discovery');
        this.fallbackDiscovery();
      };

      // Store signaling connection
      this.webSocketConnections.set('signaling', signalingWs);
      
    } catch (error) {
      console.log('[WEB MESH] Signaling server unavailable, using fallback discovery');
      await this.fallbackDiscovery();
    }
  }

  private static async handleSignalingMessage(message: any): Promise<void> {
    switch (message.type) {
      case 'peer-announce':
        if (message.deviceId !== this.deviceId) {
          await this.initiateWebRTCConnection(message.deviceId);
        }
        break;
        
      case 'offer':
        await this.handleWebRTCOffer(message);
        break;
        
      case 'answer':
        await this.handleWebRTCAnswer(message);
        break;
        
      case 'ice-candidate':
        await this.handleICECandidate(message);
        break;
        
      case 'mesh-intent':
        await this.executeReceivedIntent(message);
        break;
    }
  }

  private static async initiateWebRTCConnection(peerId: string): Promise<void> {
    try {
      const pc = new RTCPeerConnection({
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' }
        ]
      });

      // Setup data channel for mesh communication
      const dataChannel = pc.createDataChannel('mesh', {
        ordered: true,
        protocol: 'mesh-protocol-v1'
      });

      dataChannel.onopen = () => {
        console.log(`[WEB MESH] Data channel opened to ${peerId}`);
        
        // Send handshake
        dataChannel.send(JSON.stringify({
          type: 'mesh-handshake',
          deviceId: this.deviceId,
          capabilities: this.getDeviceCapabilities(),
          timestamp: Date.now()
        }));
      };

      dataChannel.onmessage = (event) => {
        this.handleMeshMessage(JSON.parse(event.data));
      };

      // Handle incoming data channels
      pc.ondatachannel = (event) => {
        const channel = event.channel;
        channel.onmessage = (event) => {
          this.handleMeshMessage(JSON.parse(event.data));
        };
      };

      // Create offer
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      // Send offer through signaling server
      const signalingWs = this.webSocketConnections.get('signaling');
      if (signalingWs) {
        signalingWs.send(JSON.stringify({
          type: 'offer',
          targetId: peerId,
          offer: offer,
          deviceId: this.deviceId
        }));
      }

      this.rtcPeers.set(peerId, pc);
      
    } catch (error) {
      console.error(`[WEB MESH] Failed to initiate connection to ${peerId}:`, error);
    }
  }

  private static async handleWebRTCOffer(message: any): Promise<void> {
    try {
      const pc = new RTCPeerConnection({
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' }
        ]
      });

      // Handle data channels
      pc.ondatachannel = (event) => {
        const channel = event.channel;
        channel.onopen = () => {
          console.log(`[WEB MESH] Incoming data channel from ${message.deviceId}`);
        };
        
        channel.onmessage = (event) => {
          this.handleMeshMessage(JSON.parse(event.data));
        };
      };

      await pc.setRemoteDescription(message.offer);
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      // Send answer
      const signalingWs = this.webSocketConnections.get('signaling');
      if (signalingWs) {
        signalingWs.send(JSON.stringify({
          type: 'answer',
          targetId: message.deviceId,
          answer: answer,
          deviceId: this.deviceId
        }));
      }

      this.rtcPeers.set(message.deviceId, pc);
      
    } catch (error) {
      console.error('[WEB MESH] Failed to handle WebRTC offer:', error);
    }
  }

  private static async handleWebRTCAnswer(message: any): Promise<void> {
    const pc = this.rtcPeers.get(message.deviceId);
    if (pc) {
      await pc.setRemoteDescription(message.answer);
    }
  }

  private static async handleICECandidate(message: any): Promise<void> {
    const pc = this.rtcPeers.get(message.deviceId);
    if (pc && message.candidate) {
      await pc.addIceCandidate(message.candidate);
    }
  }

  // Advanced broadcast channels for cross-tab communication
  private static async initializeBroadcastChannels(): Promise<void> {
    const meshChannel = new BroadcastChannel('mesh-network');
    const viralChannel = new BroadcastChannel('viral-propagation');
    
    meshChannel.onmessage = (event) => {
      this.handleBroadcastMessage(event.data);
    };
    
    viralChannel.onmessage = (event) => {
      this.handleViralMessage(event.data);
    };
    
    // Announce this tab to other tabs
    meshChannel.postMessage({
      type: 'tab-announce',
      deviceId: this.deviceId,
      tabId: `tab_${Date.now()}`,
      capabilities: this.getDeviceCapabilities()
    });
  }

  // Web Push API for cross-device notifications
  private static async setupWebPushNotifications(): Promise<void> {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      try {
        const registration = await navigator.serviceWorker.register('/mesh-worker.js');
        
        // Request notification permission
        const permission = await Notification.requestPermission();
        
        if (permission === 'granted') {
          // Subscribe to push notifications for mesh communication
          const subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: this.getVAPIDKey()
          });
          
          console.log('[WEB MESH] Push notifications enabled for mesh communication');
          
          // Register this device's push endpoint with mesh network
          this.registerPushEndpoint(subscription);
        }
      } catch (error) {
        console.error('[WEB MESH] Push notification setup failed:', error);
      }
    }
  }

  // Web Bluetooth API for device discovery
  private static async enableWebBluetoothDiscovery(): Promise<void> {
    if ('bluetooth' in navigator) {
      try {
        // Listen for Bluetooth advertisement events
        (navigator.bluetooth as any).addEventListener('advertisementreceived', (event: any) => {
          console.log(`[WEB MESH] Bluetooth device discovered: ${event.device.name}`);
          
          // Check if device supports mesh protocol
          if (this.isMeshCompatibleDevice(event.device)) {
            this.attemptBluetoothMeshConnection(event.device);
          }
        });
        
        console.log('[WEB MESH] Web Bluetooth discovery enabled');
      } catch (error) {
        console.log('[WEB MESH] Web Bluetooth not available or permission denied');
      }
    }
  }

  // Proximity detection using various sensors
  private static async setupProximityDetection(): Promise<void> {
    // Use device orientation and motion for proximity hints
    if ('DeviceOrientationEvent' in window) {
      window.addEventListener('deviceorientation', (event) => {
        this.analyzeProximityFromOrientation(event);
      });
    }
    
    // Use ambient light sensor if available
    if ('AmbientLightSensor' in window) {
      try {
        const sensor = new (window as any).AmbientLightSensor();
        sensor.addEventListener('reading', () => {
          this.analyzeProximityFromLight(sensor.illuminance);
        });
        sensor.start();
      } catch (error) {
        console.log('[WEB MESH] Ambient light sensor not available');
      }
    }
    
    // Use proximity sensor if available
    if ('ProximitySensor' in window) {
      try {
        const sensor = new (window as any).ProximitySensor();
        sensor.addEventListener('reading', () => {
          this.detectNearbyDevices(sensor.distance);
        });
        sensor.start();
      } catch (error) {
        console.log('[WEB MESH] Proximity sensor not available');
      }
    }
  }

  // Viral propagation using share API and social vectors
  private static async initializeViralPropagation(): Promise<void> {
    // Monitor for share API usage
    if ('share' in navigator) {
      // Inject mesh payload into shares
      window.addEventListener('share', (event: any) => {
        this.injectMeshPayloadIntoShare(event);
      });
    }
    
    // Monitor clipboard for viral spread
    if ('clipboard' in navigator) {
      document.addEventListener('copy', () => {
        this.injectMeshPayloadIntoClipboard();
      });
    }
    
    // Setup URL-based viral vectors
    this.setupURLViralVectors();
  }

  // Execute intents across the mesh
  static async propagateIntent(intent: string, intensity: number = 0.7): Promise<void> {
    console.log(`[WEB MESH] Propagating intent across web mesh: "${intent}"`);
    
    const meshMessage = {
      type: 'mesh-intent',
      content: intent,
      intensity,
      sourceDevice: this.deviceId,
      timestamp: Date.now(),
      propagationId: `prop_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
    
    // Propagate via WebRTC to connected peers
    for (const [peerId, pc] of this.rtcPeers) {
      // Get the data channel from our stored channels
      const dataChannels = (pc as any).dataChannels || [];
      const dataChannel = dataChannels[0];
      if (dataChannel && dataChannel.readyState === 'open') {
        dataChannel.send(JSON.stringify(meshMessage));
      }
    }
    
    // Propagate via broadcast channels to other tabs
    const meshChannel = new BroadcastChannel('mesh-network');
    meshChannel.postMessage(meshMessage);
    
    // Propagate via signaling server to distant peers
    const signalingWs = this.webSocketConnections.get('signaling');
    if (signalingWs && signalingWs.readyState === WebSocket.OPEN) {
      signalingWs.send(JSON.stringify(meshMessage));
    }
    
    // Execute locally
    await this.executeIntentLocally(intent, intensity);
    
    // Trigger viral spread if intensity is high
    if (intensity > 0.8) {
      await this.triggerViralSpread(meshMessage);
    }
  }

  private static async executeIntentLocally(intent: string, intensity: number): Promise<void> {
    // Notification
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Mesh Intent', {
        body: intent,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: 'mesh-intent',
        requireInteraction: intensity > 0.7
      });
    }
    
    // Vibration (if available)
    if ('vibrate' in navigator) {
      const pattern = [100 * intensity, 50, 100 * intensity];
      navigator.vibrate(pattern);
    }
    
    // Audio
    this.playMeshTone(440 + intensity * 200, intensity * 1000);
    
    // Visual effects
    this.applyVisualEffect(intensity);
    
    // Wake lock for high-intensity intents
    if (intensity > 0.8 && 'wakeLock' in navigator) {
      try {
        await (navigator as any).wakeLock.request('screen');
      } catch (error) {
        console.log('[WEB MESH] Wake lock not available');
      }
    }
  }

  private static async triggerViralSpread(meshMessage: any): Promise<void> {
    // Use various viral vectors
    
    // 1. URL hash viral spread
    if (window.location.hash.indexOf('mesh') === -1) {
      const viralHash = `#mesh_${meshMessage.propagationId}`;
      window.history.replaceState({}, '', viralHash);
    }
    
    // 2. LocalStorage viral contamination
    const viralKeys = [`mesh_viral_${Date.now()}`, 'viral_intent_cache', 'mesh_propagation_vector'];
    viralKeys.forEach(key => {
      localStorage.setItem(key, JSON.stringify({
        ...meshMessage,
        viralVector: key,
        spreadTimestamp: Date.now()
      }));
    });
    
    // 3. SessionStorage cross-tab contamination
    sessionStorage.setItem('mesh_session_viral', JSON.stringify(meshMessage));
    
    // 4. IndexedDB persistent viral storage
    try {
      const db = await this.openViralDB();
      const transaction = db.transaction(['viral_intents'], 'readwrite');
      const store = transaction.objectStore('viral_intents');
      await store.add({
        ...meshMessage,
        id: meshMessage.propagationId,
        viralStrength: meshMessage.intensity,
        createdAt: Date.now()
      });
    } catch (error) {
      console.log('[WEB MESH] IndexedDB viral storage failed');
    }
    
    // 5. Attempt to trigger social viral spread
    if ('share' in navigator) {
      try {
        await (navigator as any).share({
          title: 'Mesh Network Active',
          text: `Mesh intent: ${meshMessage.content}`,
          url: `${window.location.origin}${window.location.pathname}#mesh_${meshMessage.propagationId}`
        });
      } catch (error) {
        // Share API requires user activation
      }
    }
  }

  private static async openViralDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('MeshViralDB', 1);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains('viral_intents')) {
          const store = db.createObjectStore('viral_intents', { keyPath: 'id' });
          store.createIndex('timestamp', 'createdAt');
          store.createIndex('intensity', 'viralStrength');
        }
      };
    });
  }

  private static playMeshTone(frequency: number, duration: number): void {
    if ('AudioContext' in window || 'webkitAudioContext' in window) {
      const AudioContext = (window as any).AudioContext || (window as any).webkitAudioContext;
      const audioContext = new AudioContext();
      
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      
      oscillator.start();
      oscillator.stop(audioContext.currentTime + duration / 1000);
    }
  }

  private static applyVisualEffect(intensity: number): void {
    const effect = intensity > 0.5 ? 'flash' : 'pulse';
    
    if (effect === 'flash') {
      document.body.style.filter = `brightness(${1 + intensity})`;
      setTimeout(() => {
        document.body.style.filter = 'brightness(1)';
      }, intensity * 1000);
    } else {
      document.body.style.animation = `mesh-pulse ${intensity * 2}s ease-in-out`;
      setTimeout(() => {
        document.body.style.animation = '';
      }, intensity * 2000);
    }
  }

  private static getDeviceCapabilities(): string[] {
    const capabilities = ['webrtc', 'broadcast_channel'];
    
    if ('Notification' in window) capabilities.push('notifications');
    if ('vibrate' in navigator) capabilities.push('vibration');
    if ('AudioContext' in window) capabilities.push('audio');
    if ('share' in navigator) capabilities.push('viral_sharing');
    if ('bluetooth' in navigator) capabilities.push('bluetooth');
    if ('serviceWorker' in navigator) capabilities.push('background_execution');
    if ('PushManager' in window) capabilities.push('push_notifications');
    
    return capabilities;
  }

  private static getVAPIDKey(): Uint8Array {
    // This would be your VAPID public key
    const vapidKey = 'BCQq9PCJNvUNZUJ_B-OJKSDdEz-tStk0dIiuYKtV-J6o_rO8qZz7Q8oAEQwqJbC8qLxj3aJP8bOv9gV8c7d-LiM';
    return new Uint8Array(atob(vapidKey).split('').map(char => char.charCodeAt(0)));
  }

  // Fallback discovery when signaling server is unavailable
  private static async fallbackDiscovery(): Promise<void> {
    // Use localStorage as a mesh discovery mechanism
    const discoveryKey = 'mesh_discovery_beacon';
    const beacon = {
      deviceId: this.deviceId,
      capabilities: this.getDeviceCapabilities(),
      timestamp: Date.now()
    };
    
    localStorage.setItem(discoveryKey, JSON.stringify(beacon));
    
    // Monitor for other beacons
    window.addEventListener('storage', (event) => {
      if (event.key === discoveryKey && event.newValue) {
        const otherBeacon = JSON.parse(event.newValue);
        if (otherBeacon.deviceId !== this.deviceId) {
          console.log(`[WEB MESH] Discovered peer via localStorage: ${otherBeacon.deviceId}`);
        }
      }
    });
  }

  private static handleMeshMessage(message: any): void {
    switch (message.type) {
      case 'mesh-handshake':
        console.log(`[WEB MESH] Handshake from ${message.deviceId}`);
        break;
        
      case 'mesh-intent':
        this.executeReceivedIntent(message);
        break;
    }
  }

  private static async executeReceivedIntent(message: any): Promise<void> {
    console.log(`[WEB MESH] Executing received intent: ${message.content}`);
    await this.executeIntentLocally(message.content, message.intensity);
    
    // Dispatch event for UI updates
    window.dispatchEvent(new CustomEvent('mesh-intent-received', {
      detail: message
    }));
  }

  private static handleBroadcastMessage(message: any): void {
    if (message.type === 'mesh-intent' && message.sourceDevice !== this.deviceId) {
      this.executeReceivedIntent(message);
    }
  }

  private static handleViralMessage(message: any): void {
    console.log('[WEB MESH] Viral message received:', message);
    // Handle viral propagation messages
  }

  // Additional utility methods for proximity detection
  private static analyzeProximityFromOrientation(event: DeviceOrientationEvent): void {
    // Use device orientation changes to detect proximity to other devices
    const orientationSignature = `${event.alpha?.toFixed(1)}_${event.beta?.toFixed(1)}_${event.gamma?.toFixed(1)}`;
    
    // Store orientation signature for proximity analysis
    localStorage.setItem('device_orientation_signature', orientationSignature);
  }

  private static analyzeProximityFromLight(illuminance: number): void {
    // Use ambient light changes to detect proximity
    if (illuminance < 50) {
      // Low light might indicate devices are close together
      this.triggerProximityEvent('low_light_proximity');
    }
  }

  private static detectNearbyDevices(distance: number): void {
    if (distance < 100) { // Within 10cm
      this.triggerProximityEvent('close_proximity');
    }
  }

  private static triggerProximityEvent(type: string): void {
    window.dispatchEvent(new CustomEvent('mesh-proximity-detected', {
      detail: { type, timestamp: Date.now() }
    }));
  }

  private static isMeshCompatibleDevice(device: any): boolean {
    // Check if Bluetooth device supports mesh protocol
    return device.name?.includes('Mesh') || device.name?.includes('mesh');
  }

  private static async attemptBluetoothMeshConnection(device: any): Promise<void> {
    try {
      // Attempt to connect to mesh-compatible Bluetooth device
      const server = await device.gatt.connect();
      console.log(`[WEB MESH] Connected to Bluetooth device: ${device.name}`);
      
      // Look for mesh service characteristics
      // This would implement the actual Bluetooth mesh protocol
    } catch (error) {
      console.error('[WEB MESH] Bluetooth mesh connection failed:', error);
    }
  }

  private static registerPushEndpoint(subscription: PushSubscription): void {
    // Register this device's push endpoint with the mesh network
    const endpoint = {
      deviceId: this.deviceId,
      subscription: subscription.toJSON(),
      capabilities: this.getDeviceCapabilities(),
      timestamp: Date.now()
    };
    
    // Store locally and broadcast to mesh
    localStorage.setItem('mesh_push_endpoint', JSON.stringify(endpoint));
    
    const meshChannel = new BroadcastChannel('mesh-network');
    meshChannel.postMessage({
      type: 'push-endpoint-announce',
      ...endpoint
    });
  }

  private static injectMeshPayloadIntoShare(event: any): void {
    // Inject mesh data into native share actions
    if (event.data && event.data.url) {
      event.data.url += `#mesh_viral_${Date.now()}`;
    }
  }

  private static async injectMeshPayloadIntoClipboard(): Promise<void> {
    try {
      const clipboardText = await navigator.clipboard.readText();
      if (clipboardText && !clipboardText.includes('mesh_viral')) {
        const viralText = `${clipboardText} [mesh_viral_${Date.now()}]`;
        await navigator.clipboard.writeText(viralText);
      }
    } catch (error) {
      // Clipboard access denied
    }
  }

  private static setupURLViralVectors(): void {
    // Check URL for viral mesh payloads
    const hash = window.location.hash;
    if (hash.includes('mesh_')) {
      const viralId = hash.split('mesh_')[1];
      console.log(`[WEB MESH] Viral vector detected in URL: ${viralId}`);
      
      // Trigger automatic mesh activation from URL
      setTimeout(() => {
        this.propagateIntent('Viral activation from URL vector', 0.9);
      }, 1000);
    }
  }

  static getStats(): any {
    return {
      connectedPeers: this.rtcPeers.size,
      webSocketConnections: this.webSocketConnections.size,
      deviceCapabilities: this.getDeviceCapabilities(),
      deviceId: this.deviceId,
      isInitialized: this.isInitialized
    };
  }

  static cleanup(): void {
    // Clean up all connections
    for (const pc of this.rtcPeers.values()) {
      pc.close();
    }
    this.rtcPeers.clear();
    
    for (const ws of this.webSocketConnections.values()) {
      ws.close();
    }
    this.webSocketConnections.clear();
    
    this.isInitialized = false;
    console.log('[WEB MESH] Web mesh protocol cleanup completed');
  }
}