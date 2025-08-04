
// Real functioning mesh network using free web technologies
export interface RealMeshNode {
  id: string;
  peerId: string;
  connection: RTCPeerConnection | null;
  dataChannel: RTCDataChannel | null;
  lastSeen: number;
  capabilities: string[];
  isConnected: boolean;
}

export interface MeshMessage {
  type: 'intent' | 'discovery' | 'heartbeat' | 'data' | 'handshake';
  payload: any;
  sourceId: string;
  timestamp: number;
  hops: number;
}

export class RealMeshNetwork {
  private static instance: RealMeshNetwork;
  private nodeId: string;
  private nodes: Map<string, RealMeshNode> = new Map();
  private messageHistory: Set<string> = new Set();
  private discoveryInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.nodeId = `node_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.initialize();
  }

  static getInstance(): RealMeshNetwork {
    if (!this.instance) {
      this.instance = new RealMeshNetwork();
    }
    return this.instance;
  }

  private async initialize(): Promise<void> {
    console.log(`[REAL MESH] Initializing real mesh network - Node ID: ${this.nodeId}`);
    
    // Register this node in shared discovery
    await this.registerNode();
    
    // Start peer discovery
    this.startPeerDiscovery();
    
    // Listen for new peers
    this.setupPeerDiscovery();
    
    // Setup URL-based peer exchange
    this.setupURLPeerExchange();
    
  }

  private async registerNode(): Promise<void> {
    const nodeData = {
      id: this.nodeId,
      timestamp: Date.now(),
      capabilities: this.getNodeCapabilities(),
      userAgent: navigator.userAgent,
      url: window.location.href
    };

    // Store in localStorage for same-origin discovery
    const nodes = JSON.parse(localStorage.getItem('mesh_nodes') || '{}');
    nodes[this.nodeId] = nodeData;
    localStorage.setItem('mesh_nodes', JSON.stringify(nodes));

    // Broadcast via BroadcastChannel
    const channel = new BroadcastChannel('mesh_discovery');
    channel.postMessage({
      type: 'node_registration',
      node: nodeData
    });
  }

  private startPeerDiscovery(): void {
    // Discover peers every 5 seconds
    this.discoveryInterval = setInterval(async () => {
      await this.discoverPeers();
    }, 5000);

    // Initial discovery
    this.discoverPeers();
  }

  private async discoverPeers(): Promise<void> {
    // Method 1: LocalStorage discovery (same origin)
    const nodes = JSON.parse(localStorage.getItem('mesh_nodes') || '{}');
    for (const [nodeId, nodeData] of Object.entries(nodes) as [string, any][]) {
      if (nodeId !== this.nodeId && Date.now() - nodeData.timestamp < 30000) {
        await this.connectToPeer(nodeId, nodeData);
      }
    }

    // Method 2: URL parameter discovery
    await this.checkURLPeers();

    // Method 3: Firebase signaling discovery
    await this.discoverViaFirebase();
  }

  private async connectToPeer(peerId: string, peerData: any): Promise<void> {
    if (this.nodes.has(peerId)) return;

    console.log(`[REAL MESH] Connecting to peer: ${peerId}`);

    try {
      const connection = new RTCPeerConnection({
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' },
          { urls: 'stun:stun.stunprotocol.org:3478' }
        ]
      });

      const dataChannel = connection.createDataChannel('mesh', {
        ordered: true
      });

      dataChannel.onopen = () => {
        console.log(`[REAL MESH] Data channel opened with ${peerId}`);
        this.onPeerConnected(peerId, connection, dataChannel);
      };

      dataChannel.onmessage = (event) => {
        this.handlePeerMessage(peerId, JSON.parse(event.data));
      };

      dataChannel.onclose = () => {
        console.log(`[REAL MESH] Data channel closed with ${peerId}`);
        this.nodes.delete(peerId);
      };

      // Store node
      const node: RealMeshNode = {
        id: peerId,
        peerId,
        connection,
        dataChannel,
        lastSeen: Date.now(),
        capabilities: peerData.capabilities || [],
        isConnected: false
      };

      this.nodes.set(peerId, node);

      // Create offer
      const offer = await connection.createOffer();
      await connection.setLocalDescription(offer);

      // Send offer via signaling
      await this.sendSignal(peerId, {
        type: 'offer',
        offer: offer,
        fromId: this.nodeId
      });

    } catch (error) {
      console.error(`[REAL MESH] Failed to connect to peer ${peerId}:`, error);
    }
  }

  private async sendSignal(targetId: string, signal: any): Promise<void> {
    // Use multiple signaling methods for reliability
    
    // Method 1: Firebase Firestore (free tier)
    await this.sendFirebaseSignal(targetId, signal);
    
    // Method 2: LocalStorage relay
    const signalKey = `mesh_signal_${targetId}_${Date.now()}`;
    localStorage.setItem(signalKey, JSON.stringify(signal));
    
    // Method 3: BroadcastChannel
    const channel = new BroadcastChannel('mesh_signaling');
    channel.postMessage({
      targetId,
      signal,
      timestamp: Date.now()
    });
  }

  private async sendFirebaseSignal(targetId: string, signal: any): Promise<void> {
    // Use Firebase's free tier for signaling
    try {
      const response = await fetch('https://mesh-signaling-default-rtdb.firebaseio.com/signals.json', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          targetId,
          fromId: this.nodeId,
          signal,
          timestamp: Date.now()
        })
      });
      
      if (!response.ok) {
        throw new Error('Firebase signaling failed');
      }
    } catch (error) {
      console.log('[REAL MESH] Firebase signaling failed, using fallback');
    }
  }

  private async discoverViaFirebase(): Promise<void> {
    try {
      // Check for signals addressed to this node
      const response = await fetch(`https://mesh-signaling-default-rtdb.firebaseio.com/signals.json?orderBy="targetId"&equalTo="${this.nodeId}"`);
      const signals = await response.json();
      
      if (signals) {
        for (const [key, signalData] of Object.entries(signals) as [string, any][]) {
          if (Date.now() - signalData.timestamp < 60000) { // 1 minute old
            await this.handleSignal(signalData.fromId, signalData.signal);
            
            // Delete processed signal
            await fetch(`https://mesh-signaling-default-rtdb.firebaseio.com/signals/${key}.json`, {
              method: 'DELETE'
            });
          }
        }
      }
    } catch (error) {
      console.log('[REAL MESH] Firebase discovery failed, using fallback');
    }
  }

  private async handleSignal(fromId: string, signal: any): Promise<void> {
    console.log(`[REAL MESH] Received signal from ${fromId}:`, signal.type);

    let node = this.nodes.get(fromId);
    if (!node && signal.type === 'offer') {
      // Create new connection for incoming offer
      const connection = new RTCPeerConnection({
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' }
        ]
      });

      connection.ondatachannel = (event) => {
        const dataChannel = event.channel;
        dataChannel.onopen = () => {
          console.log(`[REAL MESH] Incoming data channel opened from ${fromId}`);
          this.onPeerConnected(fromId, connection, dataChannel);
        };
        
        dataChannel.onmessage = (event) => {
          this.handlePeerMessage(fromId, JSON.parse(event.data));
        };
      };

      node = {
        id: fromId,
        peerId: fromId,
        connection,
        dataChannel: null,
        lastSeen: Date.now(),
        capabilities: [],
        isConnected: false
      };
      
      this.nodes.set(fromId, node);
    }

    if (!node) return;

    try {
      switch (signal.type) {
        case 'offer':
          await node.connection?.setRemoteDescription(signal.offer);
          const answer = await node.connection?.createAnswer();
          await node.connection?.setLocalDescription(answer);
          
          await this.sendSignal(fromId, {
            type: 'answer',
            answer: answer,
            fromId: this.nodeId
          });
          break;

        case 'answer':
          await node.connection?.setRemoteDescription(signal.answer);
          break;

        case 'ice-candidate':
          await node.connection?.addIceCandidate(signal.candidate);
          break;
      }
    } catch (error) {
      console.error(`[REAL MESH] Signal handling error:`, error);
    }
  }

  private setupPeerDiscovery(): void {
    // Listen for peer announcements
    const channel = new BroadcastChannel('mesh_discovery');
    channel.onmessage = (event) => {
      if (event.data.type === 'node_registration') {
        const nodeData = event.data.node;
        if (nodeData.id !== this.nodeId) {
          this.connectToPeer(nodeData.id, nodeData);
        }
      }
    };

    // Listen for signaling
    const signalChannel = new BroadcastChannel('mesh_signaling');
    signalChannel.onmessage = (event) => {
      if (event.data.targetId === this.nodeId) {
        this.handleSignal(event.data.signal.fromId, event.data.signal);
      }
    };
  }

  private setupURLPeerExchange(): void {
    // Check URL for peer information
    const urlParams = new URLSearchParams(window.location.search);
    const meshParam = urlParams.get('mesh_unified');
    
    if (meshParam && meshParam !== this.nodeId) {
      // Try to connect to peer from URL
      this.connectToPeer(meshParam, { capabilities: ['url_peer'] });
    }

    // Update URL with our node ID for sharing
    if (!meshParam) {
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.set('mesh_unified', this.nodeId);
      window.history.replaceState({}, '', newUrl.toString());
    }
  }

  private async checkURLPeers(): Promise<void> {
    // Extract peer IDs from URL fragments and parameters
    const hash = window.location.hash;
    const search = window.location.search;
    
    if (hash.includes('mesh_')) {
      const matches = hash.match(/mesh_(\w+)/g);
      if (matches) {
        for (const match of matches) {
          const peerId = match.replace('mesh_', '');
          if (peerId !== this.nodeId) {
            await this.connectToPeer(peerId, { capabilities: ['url_discovery'] });
          }
        }
      }
    }
  }

  private onPeerConnected(peerId: string, connection: RTCPeerConnection, dataChannel: RTCDataChannel): void {
    const node = this.nodes.get(peerId);
    if (node) {
      node.dataChannel = dataChannel;
      node.isConnected = true;
      node.lastSeen = Date.now();
      
      // Send handshake
      this.sendToPeer(peerId, {
        type: 'handshake',
        nodeId: this.nodeId,
        capabilities: this.getNodeCapabilities(),
        timestamp: Date.now()
      });
    }

    // Dispatch connection event
    window.dispatchEvent(new CustomEvent('mesh-peer-connected', {
      detail: { peerId, nodeId: this.nodeId }
    }));
  }

  private handlePeerMessage(fromId: string, message: MeshMessage): void {
    console.log(`[REAL MESH] Message from ${fromId}:`, message);

    // Update peer last seen
    const node = this.nodes.get(fromId);
    if (node) {
      node.lastSeen = Date.now();
    }

    // Prevent message loops
    const messageId = `${fromId}_${message.timestamp}_${JSON.stringify(message.payload).substr(0, 20)}`;
    if (this.messageHistory.has(messageId)) {
      return;
    }
    this.messageHistory.add(messageId);

    // Clean old message history
    if (this.messageHistory.size > 1000) {
      const oldest = Array.from(this.messageHistory).slice(0, 500);
      oldest.forEach(id => this.messageHistory.delete(id));
    }

    // Process message
    switch (message.type) {
      case 'intent':
        this.executeIntent(message.payload);
        // Forward to other peers if hops < 3
        if (message.hops < 3) {
          this.broadcastMessage({
            ...message,
            hops: message.hops + 1
          }, fromId);
        }
        break;

      case 'handshake':
        if (node) {
          node.capabilities = message.payload.capabilities || [];
        }
        break;

      case 'heartbeat':
        // Peer is alive
        break;
    }

    // Dispatch message event
    window.dispatchEvent(new CustomEvent('mesh-message-received', {
      detail: { fromId, message }
    }));
  }

  private executeIntent(intent: any): void {
    console.log(`[REAL MESH] Executing intent:`, intent);

    // Execute real actions based on intent
    switch (intent.type) {
      case 'notification':
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('Mesh Intent Received', {
            body: intent.content,
            tag: 'mesh-intent'
          });
        }
        break;

      case 'vibration':
        if ('vibrate' in navigator) {
          navigator.vibrate([200, 100, 200]);
        }
        break;

      case 'audio':
        this.playTone(intent.frequency || 440, intent.duration || 1000);
        break;

      case 'visual':
        this.applyVisualEffect(intent);
        break;
    }

    // Dispatch intent execution event
    window.dispatchEvent(new CustomEvent('mesh-intent-executed', {
      detail: { intent, nodeId: this.nodeId }
    }));
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
      console.error('[REAL MESH] Audio playback failed:', error);
    }
  }

  private applyVisualEffect(intent: any): void {
    const intensity = intent.intensity || 0.5;
    document.body.style.filter = `hue-rotate(${intensity * 360}deg) brightness(${1 + intensity * 0.5})`;
    
    setTimeout(() => {
      document.body.style.filter = '';
    }, intent.duration || 2000);
  }

  public propagateIntent(content: string, type: string = 'notification', intensity: number = 0.5): void {
    const intent = {
      content,
      type,
      intensity,
      frequency: type === 'audio' ? 440 + intensity * 200 : undefined,
      duration: intensity * 2000,
      timestamp: Date.now(),
      nodeId: this.nodeId
    };

    console.log(`[REAL MESH] Propagating intent to ${this.nodes.size} peers:`, content);

    // Execute locally
    this.executeIntent(intent);

    // Send to all connected peers
    this.broadcastMessage({
      type: 'intent',
      payload: intent,
      sourceId: this.nodeId,
      timestamp: Date.now(),
      hops: 0
    });
  }

  private broadcastMessage(message: MeshMessage, excludePeer?: string): void {
    for (const [peerId, node] of this.nodes) {
      if (peerId !== excludePeer && node.isConnected && node.dataChannel) {
        this.sendToPeer(peerId, message);
      }
    }
  }

  private sendToPeer(peerId: string, message: any): void {
    const node = this.nodes.get(peerId);
    if (node && node.dataChannel && node.dataChannel.readyState === 'open') {
      try {
        node.dataChannel.send(JSON.stringify(message));
      } catch (error) {
        console.error(`[REAL MESH] Failed to send message to ${peerId}:`, error);
      }
    }
  }

  private getNodeCapabilities(): string[] {
    const capabilities = ['webrtc_mesh'];
    
    if ('Notification' in window) capabilities.push('notifications');
    if ('vibrate' in navigator) capabilities.push('vibration');
    if ('AudioContext' in window) capabilities.push('audio');
    if ('localStorage' in window) capabilities.push('storage');
    
    return capabilities;
  }

  public getMeshStats(): any {
    const connectedNodes = Array.from(this.nodes.values()).filter(n => n.isConnected);
    
    return {
      nodeId: this.nodeId,
      totalPeers: this.nodes.size,
      connectedPeers: connectedNodes.length,
      capabilities: this.getNodeCapabilities(),
      messageHistory: this.messageHistory.size,
      lastActivity: Math.max(...Array.from(this.nodes.values()).map(n => n.lastSeen), 0)
    };
  }

  public getShareableURL(): string {
    const baseUrl = window.location.origin + window.location.pathname;
    return `${baseUrl}?mesh_unified=${this.nodeId}#join_mesh_${Date.now()}`;
  }

  public cleanup(): void {
    if (this.discoveryInterval) {
      clearInterval(this.discoveryInterval);
    }
    
    for (const node of this.nodes.values()) {
      if (node.connection) {
        node.connection.close();
      }
    }
    
    this.nodes.clear();
    this.messageHistory.clear();
  }
}
