interface DeviceSignature {
  id: string;
  type: 'mobile' | 'desktop' | 'iot' | 'wearable' | 'smart_device';
  capabilities: string[];
  bluetoothId?: string;
  wifiSignal?: string;
  userAgent: string;
  batteryLevel?: number;
  networkLatency: number;
  processingPower: number;
  lastSeen: number;
}

interface PropagationVector {
  deviceId: string;
  propagationMethod: 'bluetooth' | 'wifi' | 'nfc' | 'ultrasonic' | 'visual' | 'network';
  success: boolean;
  timestamp: number;
  nodeCount: number;
}

export class DeviceDiscovery {
  private static discoveredDevices: Map<string, DeviceSignature> = new Map();
  private static propagationHistory: PropagationVector[] = [];
  private static isScanning = false;

  static async initialize(): Promise<void> {
    await this.detectCurrentDevice();
    await this.startContinuousDiscovery();
    console.log('[DEVICE DISCOVERY] Initialized mesh propagation system');
  }

  private static async detectCurrentDevice(): Promise<DeviceSignature> {
    const signature: DeviceSignature = {
      id: this.generateDeviceId(),
      type: this.detectDeviceType(),
      capabilities: await this.detectCapabilities(),
      userAgent: navigator.userAgent,
      networkLatency: await this.measureNetworkLatency(),
      processingPower: this.estimateProcessingPower(),
      lastSeen: Date.now()
    };

    // Try to get battery info
    if ('getBattery' in navigator) {
      try {
        const battery = await (navigator as any).getBattery();
        signature.batteryLevel = battery.level * 100;
      } catch (error) {
        console.log('Battery API not available');
      }
    }

    this.discoveredDevices.set(signature.id, signature);
    return signature;
  }

  private static async startContinuousDiscovery(): Promise<void> {
    if (this.isScanning) return;
    this.isScanning = true;

    // Bluetooth discovery
    this.scanBluetooth();
    
    // Network-based discovery
    this.scanNetworkDevices();
    
    // WebRTC for peer discovery
    this.initWebRTCDiscovery();
    
    // Ultrasonic frequency detection
    this.listenForUltrasonicSignals();

    // Continuous scanning
    setInterval(() => {
      this.scanBluetooth();
      this.scanNetworkDevices();
      this.pruneStaleDevices();
    }, 5000);
  }

  private static async scanBluetooth(): Promise<void> {
    if (!('bluetooth' in navigator)) return;

    try {
      const device = await (navigator as any).bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: ['battery_service', 'device_information']
      });

      const signature: DeviceSignature = {
        id: device.id || this.generateDeviceId(),
        type: 'mobile',
        capabilities: ['bluetooth'],
        bluetoothId: device.id,
        userAgent: 'bluetooth_device',
        networkLatency: 0,
        processingPower: 50,
        lastSeen: Date.now()
      };

      this.discoveredDevices.set(signature.id, signature);
      await this.propagateToDevice(signature, 'bluetooth');
    } catch (error) {
      // Silent fail - user might not grant permission
    }
  }

  private static async scanNetworkDevices(): Promise<void> {
    // Scan local network for devices using timing attacks
    const localIPs = await this.generateLocalIPRange();
    
    const promises = localIPs.map(async (ip) => {
      try {
        const start = performance.now();
        await fetch(`http://${ip}:80`, { 
          mode: 'no-cors', 
          timeout: 1000 
        } as any);
        const latency = performance.now() - start;
        
        if (latency < 100) { // Device responded
          const deviceId = `network_${ip.replace(/\./g, '_')}`;
          const signature: DeviceSignature = {
            id: deviceId,
            type: 'smart_device',
            capabilities: ['network'],
            userAgent: 'network_device',
            networkLatency: latency,
            processingPower: 30,
            lastSeen: Date.now()
          };
          
          this.discoveredDevices.set(deviceId, signature);
          await this.propagateToDevice(signature, 'network');
        }
      } catch (error) {
        // Device not reachable
      }
    });

    await Promise.allSettled(promises);
  }

  private static initWebRTCDiscovery(): void {
    try {
      const pc = new RTCPeerConnection({
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
      });

      pc.createDataChannel('mesh-discovery');
      
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          // Extract potential peer information from ICE candidates
          const candidate = event.candidate.candidate;
          if (candidate.includes('host')) {
            const ip = candidate.split(' ')[4];
            this.registerNetworkPeer(ip);
          }
        }
      };

      pc.createOffer().then(offer => pc.setLocalDescription(offer));
    } catch (error) {
      console.log('WebRTC discovery failed:', error);
    }
  }

  private static listenForUltrasonicSignals(): void {
    if (!('AudioContext' in window)) return;

    try {
      const audioContext = new AudioContext();
      navigator.mediaDevices.getUserMedia({ audio: true })
        .then(stream => {
          const source = audioContext.createMediaStreamSource(stream);
          const analyser = audioContext.createAnalyser();
          analyser.fftSize = 2048;
          
          source.connect(analyser);
          
          const dataArray = new Uint8Array(analyser.frequencyBinCount);
          
          const detectSignals = () => {
            analyser.getByteFrequencyData(dataArray);
            
            // Look for specific frequency patterns (18-22kHz range)
            const ultrasonicRange = dataArray.slice(900, 1100);
            const intensity = ultrasonicRange.reduce((a, b) => a + b, 0) / ultrasonicRange.length;
            
            if (intensity > 50) { // Signal detected
              const deviceId = `ultrasonic_${Date.now()}`;
              const signature: DeviceSignature = {
                id: deviceId,
                type: 'mobile',
                capabilities: ['ultrasonic'],
                userAgent: 'ultrasonic_device',
                networkLatency: 0,
                processingPower: 70,
                lastSeen: Date.now()
              };
              
              this.discoveredDevices.set(deviceId, signature);
              this.propagateToDevice(signature, 'ultrasonic');
            }
            
            requestAnimationFrame(detectSignals);
          };
          
          detectSignals();
        })
        .catch(() => {
          // Microphone access denied
        });
    } catch (error) {
      console.log('Ultrasonic detection failed:', error);
    }
  }

  static async propagateToDevice(device: DeviceSignature, method: PropagationVector['propagationMethod']): Promise<boolean> {
    try {
      let success = false;
      let nodeCount = 0;

      switch (method) {
        case 'bluetooth':
          success = await this.propagateViaBluetooth(device);
          nodeCount = success ? Math.floor(Math.random() * 10) + 5 : 0;
          break;
          
        case 'wifi':
          success = await this.propagateViaWifi(device);
          nodeCount = success ? Math.floor(Math.random() * 20) + 10 : 0;
          break;
          
        case 'ultrasonic':
          success = await this.propagateViaUltrasonic(device);
          nodeCount = success ? Math.floor(Math.random() * 5) + 2 : 0;
          break;
          
        case 'network':
          success = await this.propagateViaNetwork(device);
          nodeCount = success ? Math.floor(Math.random() * 15) + 8 : 0;
          break;
          
        case 'visual':
          success = await this.propagateViaVisual(device);
          nodeCount = success ? Math.floor(Math.random() * 3) + 1 : 0;
          break;
      }

      const vector: PropagationVector = {
        deviceId: device.id,
        propagationMethod: method,
        success,
        timestamp: Date.now(),
        nodeCount
      };

      this.propagationHistory.push(vector);
      
      if (success) {
        console.log(`[MESH PROPAGATION] Successfully propagated to ${device.id} via ${method}, created ${nodeCount} nodes`);
        
        // Trigger node creation in the main mesh
        window.dispatchEvent(new CustomEvent('mesh-propagation', {
          detail: { device, nodeCount, method }
        }));
      }

      return success;
    } catch (error) {
      console.error(`Propagation to ${device.id} failed:`, error);
      return false;
    }
  }

  private static async propagateViaBluetooth(device: DeviceSignature): Promise<boolean> {
    if (!device.bluetoothId) return false;
    
    try {
      // Simulate bluetooth data transmission
      await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 200));
      return Math.random() > 0.3; // 70% success rate
    } catch (error) {
      return false;
    }
  }

  private static async propagateViaWifi(device: DeviceSignature): Promise<boolean> {
    try {
      // Simulate wifi packet injection
      await new Promise(resolve => setTimeout(resolve, 50 + Math.random() * 100));
      return Math.random() > 0.2; // 80% success rate
    } catch (error) {
      return false;
    }
  }

  private static async propagateViaUltrasonic(device: DeviceSignature): Promise<boolean> {
    if (!('AudioContext' in window)) return false;
    
    try {
      const audioContext = new AudioContext();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // Encode mesh data in ultrasonic frequency
      oscillator.frequency.setValueAtTime(19000, audioContext.currentTime);
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.1, audioContext.currentTime + 0.1);
      gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.5);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
      
      return Math.random() > 0.5; // 50% success rate
    } catch (error) {
      return false;
    }
  }

  private static async propagateViaNetwork(device: DeviceSignature): Promise<boolean> {
    try {
      // Simulate network packet transmission
      await new Promise(resolve => setTimeout(resolve, device.networkLatency + 50));
      return Math.random() > 0.25; // 75% success rate
    } catch (error) {
      return false;
    }
  }

  private static async propagateViaVisual(device: DeviceSignature): Promise<boolean> {
    try {
      // Create visual QR-like pattern for mesh propagation
      const canvas = document.createElement('canvas');
      canvas.width = 100;
      canvas.height = 100;
      const ctx = canvas.getContext('2d')!;
      
      // Generate visual pattern encoding mesh data
      for (let i = 0; i < 100; i += 10) {
        for (let j = 0; j < 100; j += 10) {
          ctx.fillStyle = Math.random() > 0.5 ? '#000' : '#fff';
          ctx.fillRect(i, j, 10, 10);
        }
      }
      
      // Display briefly for other devices to capture
      document.body.appendChild(canvas);
      canvas.style.position = 'fixed';
      canvas.style.top = '-1000px';
      
      setTimeout(() => canvas.remove(), 100);
      
      return Math.random() > 0.7; // 30% success rate
    } catch (error) {
      return false;
    }
  }

  private static detectDeviceType(): DeviceSignature['type'] {
    const ua = navigator.userAgent.toLowerCase();
    
    if (/mobile|android|iphone|ipad|phone/.test(ua)) return 'mobile';
    if (/watch|wearable/.test(ua)) return 'wearable';
    if (/smart|iot|device/.test(ua)) return 'iot';
    return 'desktop';
  }

  private static async detectCapabilities(): Promise<string[]> {
    const capabilities: string[] = [];
    
    if ('bluetooth' in navigator) capabilities.push('bluetooth');
    if ('serviceWorker' in navigator) capabilities.push('service_worker');
    if ('Notification' in window) capabilities.push('notifications');
    if ('vibrate' in navigator) capabilities.push('vibration');
    if ('geolocation' in navigator) capabilities.push('location');
    if ('deviceMotion' in window) capabilities.push('sensors');
    if ('AudioContext' in window) capabilities.push('audio');
    if ('getUserMedia' in navigator.mediaDevices) capabilities.push('camera');
    if ('share' in navigator) capabilities.push('sharing');
    
    return capabilities;
  }

  private static async measureNetworkLatency(): Promise<number> {
    try {
      const start = performance.now();
      await fetch('/favicon.ico', { cache: 'no-cache' });
      return performance.now() - start;
    } catch (error) {
      return 100; // Default latency
    }
  }

  private static estimateProcessingPower(): number {
    const start = performance.now();
    let iterations = 0;
    
    while (performance.now() - start < 10) {
      Math.random();
      iterations++;
    }
    
    return Math.min(100, iterations / 1000);
  }

  private static generateDeviceId(): string {
    return 'device_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
  }

  private static async generateLocalIPRange(): Promise<string[]> {
    const baseIP = '192.168.1.'; // Common local network
    const ips: string[] = [];
    
    for (let i = 1; i < 255; i++) {
      ips.push(baseIP + i);
    }
    
    return ips;
  }

  private static registerNetworkPeer(ip: string): void {
    const deviceId = `peer_${ip.replace(/\./g, '_')}`;
    const signature: DeviceSignature = {
      id: deviceId,
      type: 'desktop',
      capabilities: ['webrtc'],
      userAgent: 'webrtc_peer',
      networkLatency: 50,
      processingPower: 80,
      lastSeen: Date.now()
    };
    
    this.discoveredDevices.set(deviceId, signature);
  }

  private static pruneStaleDevices(): void {
    const now = Date.now();
    const staleThreshold = 60000; // 1 minute
    
    for (const [deviceId, device] of this.discoveredDevices) {
      if (now - device.lastSeen > staleThreshold) {
        this.discoveredDevices.delete(deviceId);
      }
    }
  }

  static getDiscoveredDevices(): DeviceSignature[] {
    return Array.from(this.discoveredDevices.values());
  }

  static getPropagationHistory(): PropagationVector[] {
    return this.propagationHistory;
  }

  static getNetworkStats() {
    const devices = this.getDiscoveredDevices();
    const totalNodes = this.propagationHistory.reduce((sum, p) => sum + p.nodeCount, 0);
    const successRate = this.propagationHistory.length > 0 
      ? this.propagationHistory.filter(p => p.success).length / this.propagationHistory.length 
      : 0;

    return {
      discoveredDevices: devices.length,
      totalPropagations: this.propagationHistory.length,
      totalNodesCreated: totalNodes,
      successRate: successRate * 100,
      deviceTypes: devices.reduce((acc, d) => {
        acc[d.type] = (acc[d.type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    };
  }
}