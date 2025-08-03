// Free Mesh Protocol - Zero Infrastructure Required
export class FreeMeshProtocol {
  private static deviceId = `free_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  private static connectedDevices: Map<string, any> = new Map();
  private static isInitialized = false;

  static async initialize(): Promise<void> {
    if (this.isInitialized) return;
    
    console.log('[FREE MESH] Initializing zero-cost mesh protocol');
    
    // Use multiple free relay mechanisms
    await this.setupGitHubGistRelay();
    await this.setupPastebinRelay();
    await this.setupLocalStorageSync();
    await this.setupHashChangeRelay();
    await this.setupWebRTCWithoutSignaling();
    await this.setupBroadcastChannelMesh();
    
    this.isInitialized = true;
  }

  // GitHub Gist as free message relay
  private static async setupGitHubGistRelay(): Promise<void> {
    try {
      // Use GitHub Gists as free message relay
      const gistId = '7f3a4b8c9d2e1f0a5b6c7d8e9f0a1b2c'; // Public gist ID
      
      // Check for existing mesh messages every 5 seconds
      setInterval(async () => {
        try {
          const response = await fetch(`https://api.github.com/gists/${gistId}`);
          if (response.ok) {
            const gist = await response.json();
            const meshData = JSON.parse(gist.files['mesh.json']?.content || '{}');
            this.processMeshMessages(meshData);
          }
        } catch (error) {
          // Gist not accessible, continue with other methods
        }
      }, 5000);

      console.log('[FREE MESH] GitHub Gist relay initialized');
    } catch (error) {
      console.log('[FREE MESH] GitHub Gist relay failed, using fallbacks');
    }
  }

  // Pastebin as backup relay
  private static async setupPastebinRelay(): Promise<void> {
    try {
      // Use a public pastebin URL as message relay
      const pastebinUrl = 'https://pastebin.com/raw/freemesh2024';
      
      setInterval(async () => {
        try {
          const response = await fetch(pastebinUrl);
          if (response.ok) {
            const meshData = await response.text();
            this.processMeshMessages(JSON.parse(meshData));
          }
        } catch (error) {
          // Pastebin not accessible, continue
        }
      }, 7000);

      console.log('[FREE MESH] Pastebin relay initialized');
    } catch (error) {
      console.log('[FREE MESH] Pastebin relay failed');
    }
  }

  // Enhanced localStorage sync across browser sessions
  private static async setupLocalStorageSync(): Promise<void> {
    // Create persistent device registry
    const deviceRegistry = `mesh_device_registry_${new Date().toDateString()}`;
    
    // Register this device
    const currentDevices = JSON.parse(localStorage.getItem(deviceRegistry) || '{}');
    currentDevices[this.deviceId] = {
      id: this.deviceId,
      timestamp: Date.now(),
      capabilities: this.getDeviceCapabilities(),
      lastSeen: Date.now()
    };
    
    localStorage.setItem(deviceRegistry, JSON.stringify(currentDevices));
    
    // Monitor for other devices
    setInterval(() => {
      const devices = JSON.parse(localStorage.getItem(deviceRegistry) || '{}');
      
      Object.values(devices).forEach((device: any) => {
        if (device.id !== this.deviceId && Date.now() - device.lastSeen < 30000) {
          this.connectedDevices.set(device.id, device);
        }
      });
      
      this.cleanupStaleDevices();
    }, 3000);

    console.log('[FREE MESH] localStorage sync initialized');
  }

  // URL hash as message relay
  private static async setupHashChangeRelay(): Promise<void> {
    // Monitor URL hash changes for mesh messages
    window.addEventListener('hashchange', () => {
      const hash = window.location.hash;
      if (hash.includes('mesh_msg_')) {
        const encodedMessage = hash.split('mesh_msg_')[1];
        try {
          const message = JSON.parse(atob(encodedMessage));
          if (message.targetDevice === this.deviceId || message.broadcast) {
            this.executeReceivedIntent(message);
          }
        } catch (error) {
          // Invalid message format
        }
      }
    });

    // Generate shareable mesh URLs
    this.generateMeshURL();
    console.log('[FREE MESH] Hash relay initialized');
  }

  // WebRTC without signaling server using creative relay
  private static async setupWebRTCWithoutSignaling(): Promise<void> {
    try {
      // Use localStorage as signaling mechanism
      const signalingKey = 'webrtc_signaling_channel';
      
      // Create peer connection
      const pc = new RTCPeerConnection({
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' }
        ]
      });

      // Create data channel
      const dataChannel = pc.createDataChannel('freemesh', { ordered: true });
      
      dataChannel.onopen = () => {
        console.log('[FREE MESH] WebRTC data channel opened');
      };

      dataChannel.onmessage = (event) => {
        const message = JSON.parse(event.data);
        this.executeReceivedIntent(message);
      };

      // Handle ICE candidates via localStorage
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          const candidates = JSON.parse(localStorage.getItem(signalingKey) || '[]');
          candidates.push({
            type: 'ice-candidate',
            candidate: event.candidate,
            deviceId: this.deviceId,
            timestamp: Date.now()
          });
          localStorage.setItem(signalingKey, JSON.stringify(candidates));
        }
      };

      // Monitor localStorage for signaling
      setInterval(() => {
        const signals = JSON.parse(localStorage.getItem(signalingKey) || '[]');
        signals.forEach(async (signal: any) => {
          if (signal.deviceId !== this.deviceId && signal.type === 'ice-candidate') {
            try {
              await pc.addIceCandidate(signal.candidate);
            } catch (error) {
              // Candidate already added or invalid
            }
          }
        });
      }, 2000);

      console.log('[FREE MESH] WebRTC without signaling initialized');
    } catch (error) {
      console.log('[FREE MESH] WebRTC setup failed:', error);
    }
  }

  // Enhanced broadcast channels
  private static async setupBroadcastChannelMesh(): Promise<void> {
    const meshChannel = new BroadcastChannel('freemesh_global');
    
    meshChannel.onmessage = (event) => {
      const message = event.data;
      if (message.sourceDevice !== this.deviceId) {
        this.executeReceivedIntent(message);
        this.connectedDevices.set(message.sourceDevice, {
          id: message.sourceDevice,
          lastSeen: Date.now(),
          method: 'broadcast_channel'
        });
      }
    };

    // Announce this device periodically
    setInterval(() => {
      meshChannel.postMessage({
        type: 'device_announcement',
        sourceDevice: this.deviceId,
        capabilities: this.getDeviceCapabilities(),
        timestamp: Date.now()
      });
    }, 10000);

    console.log('[FREE MESH] Broadcast channel mesh initialized');
  }

  // Propagate intent using all free methods
  static async propagateIntent(intent: string, intensity: number = 0.7): Promise<void> {
    console.log(`[FREE MESH] Propagating intent via all free channels: "${intent}"`);
    
    const message = {
      type: 'mesh_intent',
      content: intent,
      intensity,
      sourceDevice: this.deviceId,
      timestamp: Date.now(),
      id: `intent_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };

    // Method 1: Broadcast channel
    const meshChannel = new BroadcastChannel('freemesh_global');
    meshChannel.postMessage(message);

    // Method 2: localStorage relay
    const messageQueue = JSON.parse(localStorage.getItem('mesh_message_queue') || '[]');
    messageQueue.push(message);
    localStorage.setItem('mesh_message_queue', JSON.stringify(messageQueue.slice(-50)));

    // Method 3: URL sharing
    this.updateMeshURL(message);

    // Method 4: IndexedDB cross-tab
    await this.storeInIndexedDB(message);

    // Method 5: Social viral spread
    this.triggerViralSpread(message);

    // Execute locally
    await this.executeIntentLocally(intent, intensity);

    console.log('[FREE MESH] Intent propagated via 5 free channels');
  }

  private static async executeIntentLocally(intent: string, intensity: number): Promise<void> {
    // Notification
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Free Mesh Intent', {
        body: intent,
        icon: '/favicon.ico',
        tag: 'freemesh-intent'
      });
    }

    // Vibration
    if ('vibrate' in navigator) {
      const pattern = [100 * intensity, 50, 100 * intensity];
      navigator.vibrate(pattern);
    }

    // Visual effect
    document.body.style.filter = `hue-rotate(${intensity * 360}deg)`;
    setTimeout(() => {
      document.body.style.filter = '';
    }, intensity * 2000);

    // Audio
    this.playFreeTone(440 + intensity * 200, intensity * 1000);
  }

  private static playFreeTone(frequency: number, duration: number): void {
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
      // Audio context failed
    }
  }

  private static generateMeshURL(): void {
    const meshData = {
      deviceId: this.deviceId,
      capabilities: this.getDeviceCapabilities(),
      timestamp: Date.now()
    };
    
    const encodedData = btoa(JSON.stringify(meshData));
    const meshURL = `${window.location.origin}${window.location.pathname}#mesh_join_${encodedData}`;
    
    // Store for sharing
    localStorage.setItem('current_mesh_url', meshURL);
    
    // Dispatch event for UI
    window.dispatchEvent(new CustomEvent('mesh-url-generated', {
      detail: { url: meshURL }
    }));
  }

  private static updateMeshURL(message: any): void {
    const encodedMessage = btoa(JSON.stringify(message));
    const newHash = `#mesh_msg_${encodedMessage}`;
    
    // Update URL without triggering navigation
    window.history.replaceState({}, '', newHash);
    
    // Auto-clear after 30 seconds
    setTimeout(() => {
      if (window.location.hash === newHash) {
        window.history.replaceState({}, '', '#');
      }
    }, 30000);
  }

  private static async storeInIndexedDB(message: any): Promise<void> {
    try {
      const db = await this.openIndexedDB();
      const transaction = db.transaction(['mesh_messages'], 'readwrite');
      const store = transaction.objectStore('mesh_messages');
      await store.add({
        ...message,
        id: message.id,
        timestamp: Date.now()
      });
    } catch (error) {
      // IndexedDB failed
    }
  }

  private static async openIndexedDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('FreeMeshDB', 1);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains('mesh_messages')) {
          const store = db.createObjectStore('mesh_messages', { keyPath: 'id' });
          store.createIndex('timestamp', 'timestamp');
        }
      };
    });
  }

  private static triggerViralSpread(message: any): void {
    // Method 1: Clipboard injection
    if ('clipboard' in navigator) {
      navigator.clipboard.writeText(`Check this out: ${window.location.href} [mesh:${message.id}]`).catch(() => {});
    }

    // Method 2: URL parameter viral vector
    const viralParam = `mesh_viral=${message.id}`;
    if (!window.location.search.includes('mesh_viral')) {
      const newURL = `${window.location.href}${window.location.search ? '&' : '?'}${viralParam}`;
      window.history.replaceState({}, '', newURL);
    }

    // Method 3: Social sharing hint
    if ('share' in navigator) {
      // Don't auto-trigger, just prepare for user sharing
      (window as any).meshShareData = {
        title: 'Mesh Network Active',
        text: `Join the mesh: ${message.content}`,
        url: window.location.href
      };
    }
  }

  private static processMeshMessages(meshData: any): void {
    if (meshData.messages) {
      meshData.messages.forEach((message: any) => {
        if (message.sourceDevice !== this.deviceId && 
            Date.now() - message.timestamp < 300000) { // 5 minutes
          this.executeReceivedIntent(message);
        }
      });
    }
  }

  private static executeReceivedIntent(message: any): void {
    if (message.type === 'mesh_intent') {
      console.log(`[FREE MESH] Executing received intent: ${message.content}`);
      this.executeIntentLocally(message.content, message.intensity);
      
      // Dispatch event for UI
      window.dispatchEvent(new CustomEvent('free-mesh-intent-received', {
        detail: message
      }));
    }
  }

  private static cleanupStaleDevices(): void {
    const now = Date.now();
    for (const [deviceId, device] of this.connectedDevices) {
      if (now - device.lastSeen > 60000) { // 1 minute
        this.connectedDevices.delete(deviceId);
      }
    }
  }

  private static getDeviceCapabilities(): string[] {
    const capabilities = ['free_mesh', 'local_storage', 'broadcast_channel'];
    
    if ('Notification' in window) capabilities.push('notifications');
    if ('vibrate' in navigator) capabilities.push('vibration');
    if ('AudioContext' in window) capabilities.push('audio');
    if ('share' in navigator) capabilities.push('sharing');
    if ('clipboard' in navigator) capabilities.push('clipboard');
    if ('indexedDB' in window) capabilities.push('persistent_storage');
    
    return capabilities;
  }

  static getStats(): any {
    return {
      deviceId: this.deviceId,
      connectedDevices: this.connectedDevices.size,
      capabilities: this.getDeviceCapabilities(),
      isInitialized: this.isInitialized,
      meshURL: localStorage.getItem('current_mesh_url')
    };
  }

  static cleanup(): void {
    this.connectedDevices.clear();
    this.isInitialized = false;
    console.log('[FREE MESH] Free mesh protocol cleanup completed');
  }
}