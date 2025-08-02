
interface PeerConnection {
  id: string;
  connection: RTCPeerConnection;
  dataChannel: RTCDataChannel | null;
  status: 'connecting' | 'connected' | 'disconnected';
  lastSeen: number;
}

interface CrossPlatformMessage {
  type: 'intent' | 'status' | 'data' | 'influence' | 'heartbeat';
  source: string;
  target: string;
  payload: any;
  timestamp: number;
  signature: string;
}

interface DeviceCapabilities {
  deviceId: string;
  platform: string;
  hardware: string[];
  permissions: string[];
  lastUpdate: number;
}

export class RealCrossPlatformBridge {
  private static connections: Map<string, PeerConnection> = new Map();
  private static deviceId: string = '';
  private static signalingServer: WebSocket | null = null;
  private static isInitialized = false;
  private static messageHandlers: Map<string, Function> = new Map();
  private static readonly MAX_DEVICES = 40; // Limit to prevent crashes
  private static capabilities: DeviceCapabilities = {
    deviceId: '',
    platform: '',
    hardware: [],
    permissions: [],
    lastUpdate: 0
  };

  static async initialize(): Promise<void> {
    if (this.isInitialized) return;

    this.deviceId = this.generateDeviceId();
    this.capabilities.deviceId = this.deviceId;
    this.capabilities.platform = this.detectPlatform();
    
    await this.detectHardwareCapabilities();
    await this.setupSignalingServer();
    this.startHeartbeat();
    
    this.isInitialized = true;
    console.log('[CROSS PLATFORM] Initialized with device ID:', this.deviceId);
  }

  private static generateDeviceId(): string {
    // Try to get persistent device identifier
    let deviceId = localStorage.getItem('mesh_device_id');
    
    if (!deviceId) {
      // Generate based on available device characteristics
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      ctx.textBaseline = 'top';
      ctx.font = '14px Arial';
      ctx.fillText('Device fingerprint', 2, 2);
      
      const fingerprint = canvas.toDataURL();
      const navigator_props = [
        navigator.userAgent,
        navigator.language,
        screen.width + 'x' + screen.height,
        new Date().getTimezoneOffset(),
        navigator.hardwareConcurrency,
        (navigator as any).deviceMemory || 4
      ].join('|');
      
      deviceId = btoa(fingerprint + navigator_props).substr(0, 16);
      localStorage.setItem('mesh_device_id', deviceId);
    }
    
    return deviceId;
  }

  private static detectPlatform(): string {
    const ua = navigator.userAgent.toLowerCase();
    
    if (ua.includes('mobile') || ua.includes('android')) return 'mobile';
    if (ua.includes('iphone') || ua.includes('ipad')) return 'ios';
    if (ua.includes('tablet')) return 'tablet';
    if (ua.includes('smart-tv') || ua.includes('smarttv')) return 'tv';
    if (ua.includes('electron')) return 'desktop-app';
    
    return 'web';
  }

  private static async detectHardwareCapabilities(): Promise<void> {
    const hardware = [];
    const permissions = [];

    // Test hardware availability
    if ('bluetooth' in navigator) hardware.push('bluetooth');
    if ('usb' in navigator) hardware.push('usb');
    if ('serial' in navigator) hardware.push('serial');
    if ('hid' in navigator) hardware.push('hid');
    if ('vibrate' in navigator) hardware.push('vibration');
    if ('mediaDevices' in navigator) hardware.push('camera', 'microphone');
    if ('geolocation' in navigator) hardware.push('gps');
    if ('DeviceMotionEvent' in window) hardware.push('accelerometer');
    if ('DeviceOrientationEvent' in window) hardware.push('gyroscope');

    // Check current permissions
    try {
      const permissionChecks = [
        navigator.permissions?.query({ name: 'camera' as PermissionName }),
        navigator.permissions?.query({ name: 'microphone' as PermissionName }),
        navigator.permissions?.query({ name: 'geolocation' as PermissionName }),
        navigator.permissions?.query({ name: 'notifications' as PermissionName })
      ];

      const results = await Promise.allSettled(permissionChecks);
      results.forEach((result, index) => {
        if (result.status === 'fulfilled' && result.value?.state === 'granted') {
          permissions.push(['camera', 'microphone', 'geolocation', 'notifications'][index]);
        }
      });
    } catch (error) {
      console.log('[CAPABILITIES] Permission query not supported');
    }

    this.capabilities.hardware = hardware;
    this.capabilities.permissions = permissions;
    this.capabilities.lastUpdate = Date.now();
  }

  private static async setupSignalingServer(): Promise<void> {
    // Use a public WebRTC signaling service (in production, you'd use your own)
    const signalingUrl = 'wss://mesh-signaling.herokuapp.com'; // Mock URL
    
    try {
      this.signalingServer = new WebSocket(signalingUrl);
      
      this.signalingServer.onopen = () => {
        console.log('[SIGNALING] Connected to signaling server');
        this.sendSignalingMessage({
          type: 'register',
          deviceId: this.deviceId,
          capabilities: this.capabilities
        });
      };

      this.signalingServer.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          this.handleSignalingMessage(message);
        } catch (error) {
          console.error('[SIGNALING] Invalid message:', error);
        }
      };

      this.signalingServer.onclose = () => {
        console.log('[SIGNALING] Disconnected from signaling server');
        // Attempt reconnect after 5 seconds
        setTimeout(() => this.setupSignalingServer(), 5000);
      };

      this.signalingServer.onerror = (error) => {
        console.error('[SIGNALING] WebSocket error:', error);
      };
    } catch (error) {
      console.error('[SIGNALING] Failed to connect to signaling server:', error);
      // Fallback: use localStorage for local device discovery
      this.setupLocalDiscovery();
    }
  }

  private static setupLocalDiscovery(): void {
    // Use localStorage and broadcast channel for local device discovery
    const discoveryChannel = new BroadcastChannel('mesh_discovery');
    
    discoveryChannel.onmessage = (event) => {
      const { deviceId, capabilities } = event.data;
      if (deviceId !== this.deviceId) {
        console.log('[LOCAL DISCOVERY] Found device:', deviceId);
        this.initiateConnection(deviceId);
      }
    };

    // Broadcast presence
    setInterval(() => {
      discoveryChannel.postMessage({
        deviceId: this.deviceId,
        capabilities: this.capabilities
      });
    }, 10000);
  }

  private static sendSignalingMessage(message: any): void {
    if (this.signalingServer?.readyState === WebSocket.OPEN) {
      this.signalingServer.send(JSON.stringify(message));
    }
  }

  private static handleSignalingMessage(message: any): void {
    switch (message.type) {
      case 'peer_discovered':
        if (message.deviceId !== this.deviceId) {
          this.initiateConnection(message.deviceId);
        }
        break;
      case 'offer':
        this.handleOffer(message.from, message.offer);
        break;
      case 'answer':
        this.handleAnswer(message.from, message.answer);
        break;
      case 'ice_candidate':
        this.handleIceCandidate(message.from, message.candidate);
        break;
    }
  }

  private static async initiateConnection(targetDeviceId: string): Promise<void> {
    if (this.connections.has(targetDeviceId)) return;
    
    // Limit total device connections to prevent crashes
    if (this.connections.size >= this.MAX_DEVICES) {
      console.warn(`[P2P] Device limit reached (${this.MAX_DEVICES}). Skipping connection to:`, targetDeviceId);
      return;
    }

    console.log('[P2P] Initiating connection to:', targetDeviceId);

    const connection = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
      ]
    });

    // Create data channel
    const dataChannel = connection.createDataChannel('mesh', {
      ordered: true,
      maxRetransmits: 3
    });

    this.setupDataChannel(dataChannel, targetDeviceId);

    const peerConnection: PeerConnection = {
      id: targetDeviceId,
      connection,
      dataChannel,
      status: 'connecting',
      lastSeen: Date.now()
    };

    this.connections.set(targetDeviceId, peerConnection);

    // Create offer
    const offer = await connection.createOffer();
    await connection.setLocalDescription(offer);

    this.sendSignalingMessage({
      type: 'offer',
      to: targetDeviceId,
      from: this.deviceId,
      offer: offer
    });
  }

  private static async handleOffer(fromDeviceId: string, offer: RTCSessionDescriptionInit): Promise<void> {
    // Limit total device connections to prevent crashes
    if (this.connections.size >= this.MAX_DEVICES) {
      console.warn(`[P2P] Device limit reached (${this.MAX_DEVICES}). Rejecting offer from:`, fromDeviceId);
      return;
    }
    
    console.log('[P2P] Received offer from:', fromDeviceId);

    const connection = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
      ]
    });

    await connection.setRemoteDescription(new RTCSessionDescription(offer));

    // Set up data channel for incoming connections
    connection.ondatachannel = (event) => {
      this.setupDataChannel(event.channel, fromDeviceId);
    };

    const peerConnection: PeerConnection = {
      id: fromDeviceId,
      connection,
      dataChannel: null, // Will be set when datachannel opens
      status: 'connecting',
      lastSeen: Date.now()
    };

    this.connections.set(fromDeviceId, peerConnection);

    // Create answer
    const answer = await connection.createAnswer();
    await connection.setLocalDescription(answer);

    this.sendSignalingMessage({
      type: 'answer',
      to: fromDeviceId,
      from: this.deviceId,
      answer: answer
    });
  }

  private static async handleAnswer(fromDeviceId: string, answer: RTCSessionDescriptionInit): Promise<void> {
    const peerConnection = this.connections.get(fromDeviceId);
    if (peerConnection) {
      await peerConnection.connection.setRemoteDescription(new RTCSessionDescription(answer));
    }
  }

  private static async handleIceCandidate(fromDeviceId: string, candidate: RTCIceCandidateInit): Promise<void> {
    const peerConnection = this.connections.get(fromDeviceId);
    if (peerConnection) {
      await peerConnection.connection.addIceCandidate(new RTCIceCandidate(candidate));
    }
  }

  private static setupDataChannel(dataChannel: RTCDataChannel, deviceId: string): void {
    dataChannel.onopen = () => {
      console.log('[P2P] Data channel opened with:', deviceId);
      const connection = this.connections.get(deviceId);
      if (connection) {
        connection.status = 'connected';
        connection.dataChannel = dataChannel;
      }
    };

    dataChannel.onmessage = (event) => {
      try {
        const message: CrossPlatformMessage = JSON.parse(event.data);
        this.handleCrossPlatformMessage(message);
      } catch (error) {
        console.error('[P2P] Invalid message from', deviceId, error);
      }
    };

    dataChannel.onclose = () => {
      console.log('[P2P] Data channel closed with:', deviceId);
      const connection = this.connections.get(deviceId);
      if (connection) {
        connection.status = 'disconnected';
      }
    };
  }

  private static handleCrossPlatformMessage(message: CrossPlatformMessage): void {
    console.log('[P2P MESSAGE]', message.type, 'from', message.source);

    const handler = this.messageHandlers.get(message.type);
    if (handler) {
      handler(message);
    }

    // Update last seen time
    const connection = this.connections.get(message.source);
    if (connection) {
      connection.lastSeen = Date.now();
    }
  }

  private static startHeartbeat(): void {
    setInterval(() => {
      this.connections.forEach((connection, deviceId) => {
        if (connection.status === 'connected' && connection.dataChannel?.readyState === 'open') {
          this.sendMessage(deviceId, 'heartbeat', { timestamp: Date.now() });
        }
      });
    }, 30000); // Every 30 seconds
  }

  static sendMessage(targetDeviceId: string, type: CrossPlatformMessage['type'], payload: any): boolean {
    const connection = this.connections.get(targetDeviceId);
    
    if (!connection || connection.status !== 'connected' || !connection.dataChannel) {
      return false;
    }

    const message: CrossPlatformMessage = {
      type,
      source: this.deviceId,
      target: targetDeviceId,
      payload,
      timestamp: Date.now(),
      signature: this.signMessage(payload)
    };

    try {
      connection.dataChannel.send(JSON.stringify(message));
      return true;
    } catch (error) {
      console.error('[P2P] Failed to send message:', error);
      return false;
    }
  }

  static broadcastMessage(type: CrossPlatformMessage['type'], payload: any): number {
    let sent = 0;
    
    this.connections.forEach((connection, deviceId) => {
      if (this.sendMessage(deviceId, type, payload)) {
        sent++;
      }
    });

    return sent;
  }

  private static signMessage(payload: any): string {
    // Simple signature based on device ID and payload
    return btoa(this.deviceId + JSON.stringify(payload)).substr(0, 8);
  }

  static onMessage(type: string, handler: (message: CrossPlatformMessage) => void): void {
    this.messageHandlers.set(type, handler);
  }

  static getConnectedDevices(): DeviceCapabilities[] {
    return Array.from(this.connections.values())
      .filter(conn => conn.status === 'connected')
      .map(conn => ({
        deviceId: conn.id,
        platform: 'unknown',
        hardware: [],
        permissions: [],
        lastUpdate: conn.lastSeen
      }));
  }

  static getNetworkStats(): {
    totalConnections: number;
    activeConnections: number;
    messagesSent: number;
    messagesReceived: number;
    networkHealth: number;
  } {
    const totalConnections = this.connections.size;
    const activeConnections = Array.from(this.connections.values())
      .filter(conn => conn.status === 'connected').length;

    const networkHealth = totalConnections > 0 ? activeConnections / totalConnections : 0;

    return {
      totalConnections,
      activeConnections,
      messagesSent: 0, // Would track in real implementation
      messagesReceived: 0, // Would track in real implementation
      networkHealth
    };
  }

  static async emergencyShutdown(): Promise<void> {
    console.warn('[P2P] Emergency shutdown initiated');
    
    this.connections.forEach(connection => {
      connection.dataChannel?.close();
      connection.connection.close();
    });

    this.connections.clear();
    
    if (this.signalingServer) {
      this.signalingServer.close();
    }
  }
}
