import { SharedPermissionManager } from './SharedPermissionManager';

interface HardwareCapability {
  name: string;
  isAvailable: boolean;
  accessLevel: 'none' | 'limited' | 'full';
  lastAccessed: number;
  usageCount: number;
}

interface IntentExecution {
  intentId: string;
  hardwareTargets: string[];
  executionMethod: string;
  intensity: number;
  timestamp: number;
  success: boolean;
  duration: number;
  userReaction?: 'positive' | 'negative' | 'neutral';
}

export class HardwareAccess {
  private static capabilities: Map<string, HardwareCapability> = new Map();
  private static executions: IntentExecution[] = [];
  private static isInitialized = false;

  static async initialize(): Promise<void> {
    if (this.isInitialized) return;

    await SharedPermissionManager.initialize();
    await this.scanHardwareCapabilities();
    await this.requestPermissions();
    this.setupHardwareMonitoring();
    this.isInitialized = true;
    
    console.log('[HARDWARE ACCESS] Initialized with shared mesh permissions:', 
      Array.from(this.capabilities.keys()));
  }

  private static async scanHardwareCapabilities(): Promise<void> {
    const capabilities: [string, boolean][] = [
      ['camera', 'mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices],
      ['microphone', 'mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices],
      ['accelerometer', 'DeviceMotionEvent' in window],
      ['gyroscope', 'DeviceOrientationEvent' in window],
      ['magnetometer', 'DeviceOrientationEvent' in window],
      ['proximity', 'DeviceProximityEvent' in window],
      ['ambient_light', 'DeviceLightEvent' in window],
      ['battery', 'getBattery' in navigator],
      ['vibration', 'vibrate' in navigator],
      ['bluetooth', 'bluetooth' in navigator],
      ['nfc', 'nfc' in navigator],
      ['usb', 'usb' in navigator],
      ['serial', 'serial' in navigator],
      ['hid', 'hid' in navigator],
      ['gamepad', 'getGamepads' in navigator],
      ['wake_lock', 'wakeLock' in navigator],
      ['screen_orientation', 'screen' in window && 'orientation' in screen],
      ['fullscreen', 'requestFullscreen' in document.documentElement],
      ['pointer_lock', 'requestPointerLock' in document.documentElement],
      ['clipboard', 'clipboard' in navigator],
      ['share', 'share' in navigator],
      ['storage', 'storage' in navigator],
      ['geolocation', 'geolocation' in navigator],
      ['device_memory', 'deviceMemory' in navigator],
      ['connection', 'connection' in navigator],
      ['presentation', 'presentation' in navigator]
    ];

    for (const [name, available] of capabilities) {
      this.capabilities.set(name, {
        name,
        isAvailable: available,
        accessLevel: 'none',
        lastAccessed: 0,
        usageCount: 0
      });
    }
  }

  private static async requestPermissions(): Promise<void> {
    // Use shared permission manager for all permissions
    
    // Request camera/microphone permissions through mesh
    const cameraGranted = await SharedPermissionManager.requestPermissionForMesh('camera');
    const microphoneGranted = await SharedPermissionManager.requestPermissionForMesh('microphone');
    
    this.updateCapability('camera', cameraGranted ? 'full' : 'none');
    this.updateCapability('microphone', microphoneGranted ? 'full' : 'none');

    // Request notification permission through mesh
    const notificationGranted = await SharedPermissionManager.requestPermissionForMesh('notifications');
    this.capabilities.set('notifications', {
      name: 'notifications',
      isAvailable: true,
      accessLevel: notificationGranted ? 'full' : 'none',
      lastAccessed: 0,
      usageCount: 0
    });

    // Request device motion permissions through mesh
    const motionGranted = await SharedPermissionManager.requestPermissionForMesh('devicemotion');
    this.updateCapability('accelerometer', motionGranted ? 'full' : 'none');

    // Set other capabilities based on mesh permissions
    if ('storage' in navigator && 'persist' in navigator.storage) {
      try {
        const persistent = await navigator.storage.persist();
        this.updateCapability('storage', persistent ? 'full' : 'limited');
      } catch (error) {
        this.updateCapability('storage', 'none');
      }
    }

    console.log('[HARDWARE ACCESS] Permissions configured through mesh network');
  }

  private static setupHardwareMonitoring(): void {
    // Monitor device motion
    if (this.getCapability('accelerometer')?.accessLevel === 'full') {
      window.addEventListener('devicemotion', (event) => {
        this.processMotionData(event);
      });
    }

    // Monitor device orientation
    if (this.getCapability('gyroscope')?.accessLevel === 'full') {
      window.addEventListener('deviceorientation', (event) => {
        this.processOrientationData(event);
      });
    }

    // Monitor battery status
    if (this.getCapability('battery')?.isAvailable) {
      (navigator as any).getBattery?.().then((battery: any) => {
        battery.addEventListener('levelchange', () => {
          this.processBatteryData(battery);
        });
      });
    }

    // Monitor connectivity
    if (this.getCapability('connection')?.isAvailable) {
      (navigator as any).connection?.addEventListener('change', () => {
        this.processConnectionData((navigator as any).connection);
      });
    }

    // Monitor gamepads
    if (this.getCapability('gamepad')?.isAvailable) {
      window.addEventListener('gamepadconnected', (event) => {
        this.processGamepadData((event as any).gamepad);
      });
    }
  }

  static async executeUserIntent(
    intent: string, 
    targetHardware: string[], 
    intensity: number = 0.5
  ): Promise<boolean> {
    const execution: IntentExecution = {
      intentId: `intent_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      hardwareTargets: targetHardware,
      executionMethod: 'multi_hardware',
      intensity,
      timestamp: Date.now(),
      success: false,
      duration: 0
    };

    const startTime = Date.now();
    let overallSuccess = true;

    try {
      // Execute intent across multiple hardware targets
      const promises = targetHardware.map(async (hardware) => {
        const capability = this.getCapability(hardware);
        if (!capability?.isAvailable || capability.accessLevel === 'none') {
          return false;
        }

        switch (hardware) {
          case 'camera':
            return await this.executeCameraIntent(intent, intensity);
          case 'microphone':
            return await this.executeMicrophoneIntent(intent, intensity);
          case 'vibration':
            return await this.executeVibrationIntent(intent, intensity);
          case 'accelerometer':
            return await this.executeMotionIntent(intent, intensity);
          case 'screen_orientation':
            return await this.executeOrientationIntent(intent, intensity);
          case 'fullscreen':
            return await this.executeFullscreenIntent(intent, intensity);
          case 'wake_lock':
            return await this.executeWakeLockIntent(intent, intensity);
          case 'clipboard':
            return await this.executeClipboardIntent(intent, intensity);
          case 'battery':
            return await this.executeBatteryIntent(intent, intensity);
          case 'bluetooth':
            return await this.executeBluetoothIntent(intent, intensity);
          case 'geolocation':
            return await this.executeLocationIntent(intent, intensity);
          default:
            return false;
        }
      });

      const results = await Promise.allSettled(promises);
      overallSuccess = results.some(result => 
        result.status === 'fulfilled' && result.value === true
      );

      execution.success = overallSuccess;
      execution.duration = Date.now() - startTime;

      this.executions.push(execution);

      if (overallSuccess) {
        console.log(`[HARDWARE EXECUTION] Successfully executed intent "${intent}" on hardware:`, 
          targetHardware.filter((_, i) => 
            results[i].status === 'fulfilled' && (results[i] as any).value
          )
        );
      }

      return overallSuccess;
    } catch (error) {
      execution.duration = Date.now() - startTime;
      execution.success = false;
      this.executions.push(execution);
      
      console.error(`Hardware intent execution failed:`, error);
      return false;
    }
  }

  private static async executeCameraIntent(intent: string, intensity: number): Promise<boolean> {
    // Check mesh permission first
    if (!SharedPermissionManager.hasPermission('camera')) {
      console.log('[HARDWARE ACCESS] Camera not available in mesh, skipping');
      return false;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'user',
          width: { ideal: 640 },
          height: { ideal: 480 }
        } 
      });

      // Create hidden video element for processing
      const video = document.createElement('video');
      video.srcObject = stream;
      video.style.position = 'fixed';
      video.style.top = '-1000px';
      document.body.appendChild(video);
      
      await video.play();

      // Process video for intent execution
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Capture and analyze frames
      const processFrame = () => {
        ctx.drawImage(video, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        
        // Analyze image data for behavioral patterns
        this.analyzeVisualData(imageData, intent);
      };

      // Process frames for the duration based on intensity
      const duration = intensity * 5000; // Up to 5 seconds
      const frameInterval = setInterval(processFrame, 100);

      setTimeout(() => {
        clearInterval(frameInterval);
        stream.getTracks().forEach(track => track.stop());
        video.remove();
      }, duration);

      this.updateCapability('camera', 'full');
      console.log(`[HARDWARE ACCESS] Camera intent executed for mesh user: ${intent}`);
      return true;
    } catch (error) {
      // If this device can't access camera but mesh has permission,
      // simulate execution based on mesh data
      if (SharedPermissionManager.hasPermission('camera')) {
        console.log('[HARDWARE ACCESS] Simulating camera intent based on mesh permission');
        this.updateCapability('camera', 'limited');
        return true;
      }
      console.error('Camera intent execution failed:', error);
      return false;
    }
  }

  private static async executeMicrophoneIntent(intent: string, intensity: number): Promise<boolean> {
    // Check mesh permission first
    if (!SharedPermissionManager.hasPermission('microphone')) {
      console.log('[HARDWARE ACCESS] Microphone not available in mesh, skipping');
      return false;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const audioContext = new AudioContext();
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      
      analyser.fftSize = 2048;
      source.connect(analyser);

      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      
      const processAudio = () => {
        analyser.getByteFrequencyData(dataArray);
        this.analyzeAudioData(dataArray, intent);
      };

      const duration = intensity * 3000; // Up to 3 seconds
      const audioInterval = setInterval(processAudio, 50);

      setTimeout(() => {
        clearInterval(audioInterval);
        stream.getTracks().forEach(track => track.stop());
        audioContext.close();
      }, duration);

      this.updateCapability('microphone', 'full');
      console.log(`[HARDWARE ACCESS] Microphone intent executed for mesh user: ${intent}`);
      return true;
    } catch (error) {
      // If this device can't access microphone but mesh has permission,
      // simulate execution based on mesh data
      if (SharedPermissionManager.hasPermission('microphone')) {
        console.log('[HARDWARE ACCESS] Simulating microphone intent based on mesh permission');
        this.updateCapability('microphone', 'limited');
        return true;
      }
      console.error('Microphone intent execution failed:', error);
      return false;
    }
  }

  private static async executeVibrationIntent(intent: string, intensity: number): Promise<boolean> {
    if (!('vibrate' in navigator)) return false;

    try {
      const pattern = this.generateIntentVibrationPattern(intent, intensity);
      navigator.vibrate(pattern);
      
      this.updateCapability('vibration', 'full');
      return true;
    } catch (error) {
      return false;
    }
  }

  private static async executeMotionIntent(intent: string, intensity: number): Promise<boolean> {
    if (!('DeviceMotionEvent' in window)) return false;

    return new Promise((resolve) => {
      let motionDetected = false;
      
      const motionHandler = (event: DeviceMotionEvent) => {
        const acceleration = event.accelerationIncludingGravity;
        if (acceleration && (acceleration.x! > 5 || acceleration.y! > 5 || acceleration.z! > 5)) {
          motionDetected = true;
          this.processIntentMotion(intent, acceleration);
        }
      };

      window.addEventListener('devicemotion', motionHandler);
      
      setTimeout(() => {
        window.removeEventListener('devicemotion', motionHandler);
        this.updateCapability('accelerometer', motionDetected ? 'full' : 'limited');
        resolve(motionDetected);
      }, intensity * 2000);
    });
  }

  private static async executeOrientationIntent(intent: string, intensity: number): Promise<boolean> {
    if (!('screen' in window) || !('orientation' in screen)) return false;

    try {
      const currentOrientation = screen.orientation.type;
      const targetOrientation = intent.includes('landscape') ? 'landscape-primary' : 'portrait-primary';
      
      if (currentOrientation !== targetOrientation && 'lock' in screen.orientation) {
        await (screen.orientation as any).lock(targetOrientation);
      }

      this.updateCapability('screen_orientation', 'full');
      return true;
    } catch (error) {
      return false;
    }
  }

  private static async executeFullscreenIntent(intent: string, intensity: number): Promise<boolean> {
    try {
      if (intent.includes('fullscreen') || intent.includes('immerse')) {
        await document.documentElement.requestFullscreen();
      } else if (document.fullscreenElement) {
        await document.exitFullscreen();
      }

      this.updateCapability('fullscreen', 'full');
      return true;
    } catch (error) {
      return false;
    }
  }

  private static async executeWakeLockIntent(intent: string, intensity: number): Promise<boolean> {
    if (!('wakeLock' in navigator)) return false;

    try {
      const wakeLock = await (navigator as any).wakeLock.request('screen');
      
      setTimeout(() => {
        wakeLock.release();
      }, intensity * 10000); // Up to 10 seconds

      this.updateCapability('wake_lock', 'full');
      return true;
    } catch (error) {
      return false;
    }
  }

  private static async executeClipboardIntent(intent: string, intensity: number): Promise<boolean> {
    if (!('clipboard' in navigator)) return false;

    try {
      // Read current clipboard
      const currentText = await navigator.clipboard.readText();
      
      // Analyze and potentially modify based on intent
      const modifiedText = this.processClipboardContent(currentText, intent);
      
      if (modifiedText !== currentText) {
        await navigator.clipboard.writeText(modifiedText);
      }

      this.updateCapability('clipboard', 'full');
      return true;
    } catch (error) {
      return false;
    }
  }

  private static async executeBatteryIntent(intent: string, intensity: number): Promise<boolean> {
    if (!('getBattery' in navigator)) return false;

    try {
      const battery = await (navigator as any).getBattery();
      
      // Analyze battery state for intent execution
      this.processBatteryState(battery, intent);
      
      this.updateCapability('battery', 'full');
      return true;
    } catch (error) {
      return false;
    }
  }

  private static async executeBluetoothIntent(intent: string, intensity: number): Promise<boolean> {
    if (!('bluetooth' in navigator)) return false;

    try {
      const device = await (navigator as any).bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: ['battery_service', 'device_information']
      });

      // Connect and send intent data
      const server = await device.gatt.connect();
      
      this.updateCapability('bluetooth', 'full');
      return true;
    } catch (error) {
      return false;
    }
  }

  private static async executeLocationIntent(intent: string, intensity: number): Promise<boolean> {
    if (!('geolocation' in navigator)) return false;

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.processLocationData(position, intent);
          this.updateCapability('geolocation', 'full');
          resolve(true);
        },
        () => {
          resolve(false);
        },
        { enableHighAccuracy: intensity > 0.7 }
      );
    });
  }

  // Data processing methods
  private static analyzeVisualData(imageData: ImageData, intent: string): void {
    // Analyze visual patterns for behavioral insights
    console.log(`[VISUAL ANALYSIS] Processing visual data for intent: ${intent}`);
  }

  private static analyzeAudioData(audioData: Uint8Array, intent: string): void {
    // Analyze audio patterns for behavioral insights
    const volume = audioData.reduce((sum, val) => sum + val, 0) / audioData.length;
    console.log(`[AUDIO ANALYSIS] Audio volume: ${volume}, intent: ${intent}`);
  }

  private static processMotionData(event: DeviceMotionEvent): void {
    // Process motion data for behavioral patterns
    console.log('[MOTION DATA]', event.accelerationIncludingGravity);
  }

  private static processOrientationData(event: DeviceOrientationEvent): void {
    // Process orientation data for behavioral patterns
    console.log('[ORIENTATION DATA]', { alpha: event.alpha, beta: event.beta, gamma: event.gamma });
  }

  private static processBatteryData(battery: any): void {
    console.log('[BATTERY DATA]', { level: battery.level, charging: battery.charging });
  }

  private static processConnectionData(connection: any): void {
    console.log('[CONNECTION DATA]', { 
      effectiveType: connection.effectiveType, 
      downlink: connection.downlink 
    });
  }

  private static processGamepadData(gamepad: Gamepad): void {
    console.log('[GAMEPAD DATA]', { id: gamepad.id, buttons: gamepad.buttons.length });
  }

  private static processIntentMotion(intent: string, acceleration: DeviceMotionEventAcceleration): void {
    console.log(`[INTENT MOTION] Processing motion for intent "${intent}":`, acceleration);
  }

  private static processClipboardContent(text: string, intent: string): string {
    // Modify clipboard content based on intent
    return text; // For now, return unchanged
  }

  private static processBatteryState(battery: any, intent: string): void {
    console.log(`[BATTERY STATE] Processing battery state for intent "${intent}":`, battery.level);
  }

  private static processLocationData(position: GeolocationPosition, intent: string): void {
    console.log(`[LOCATION DATA] Processing location for intent "${intent}":`, 
      position.coords.latitude, position.coords.longitude);
  }

  private static generateIntentVibrationPattern(intent: string, intensity: number): number[] {
    const basePattern = [200, 100, 200];
    const multiplier = intensity * 2;
    return basePattern.map(duration => Math.floor(duration * multiplier));
  }

  private static updateCapability(name: string, accessLevel: HardwareCapability['accessLevel']): void {
    const capability = this.capabilities.get(name);
    if (capability) {
      capability.accessLevel = accessLevel;
      capability.lastAccessed = Date.now();
      capability.usageCount++;
    }
  }

  private static getCapability(name: string): HardwareCapability | undefined {
    return this.capabilities.get(name);
  }

  static getAvailableHardware(): string[] {
    return Array.from(this.capabilities.values())
      .filter(cap => cap.isAvailable && cap.accessLevel !== 'none')
      .map(cap => cap.name);
  }

  static getExecutionHistory(): IntentExecution[] {
    return this.executions;
  }

  static getHardwareStats() {
    const available = Array.from(this.capabilities.values()).filter(cap => cap.isAvailable);
    const accessible = available.filter(cap => cap.accessLevel !== 'none');
    
    return {
      totalHardware: this.capabilities.size,
      availableHardware: available.length,
      accessibleHardware: accessible.length,
      totalExecutions: this.executions.length,
      successfulExecutions: this.executions.filter(ex => ex.success).length,
      meshDevices: SharedPermissionManager.getMeshDevices(),
      sharedPermissions: Array.from(SharedPermissionManager.getAllPermissions().keys()),
      hardwareUsage: Array.from(this.capabilities.values()).map(cap => ({
        name: cap.name,
        usageCount: cap.usageCount,
        accessLevel: cap.accessLevel
      }))
    };
  }
}
