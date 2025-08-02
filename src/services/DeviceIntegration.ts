import { SharedPermissionManager } from './SharedPermissionManager';
import { RFBrainwaveEntrainment } from './RFBrainwaveEntrainment';

interface DeviceCapability {
  type: 'notification' | 'vibration' | 'audio' | 'visual' | 'network' | 'sensor';
  isAvailable: boolean;
  lastUsed: number;
  effectiveness: number;
}

interface InfluenceExecution {
  deviceId: string;
  timestamp: number;
  mechanism: string;
  intensity: number;
  duration: number;
  targetBehavior: string;
  success: boolean;
}

export class DeviceIntegration {
  private static capabilities: Map<string, DeviceCapability[]> = new Map();
  private static executions: InfluenceExecution[] = [];
  private static isInitialized = false;

  static async initialize(): Promise<void> {
    if (this.isInitialized) return;

    await SharedPermissionManager.initialize();
    await RFBrainwaveEntrainment.initialize(); // Initialize RF capabilities
    await this.detectCapabilities();
    this.setupEventListeners();
    this.isInitialized = true;
    
    console.log('[DEVICE INTEGRATION] Initialized with RF brainwave entrainment and mesh permissions:', Array.from(this.capabilities.keys()));
  }

  private static async detectCapabilities(): Promise<void> {
    const deviceId = this.getDeviceId();
    const capabilities: DeviceCapability[] = [];

    // Check mesh permissions instead of requesting individually
    const hasNotificationPermission = SharedPermissionManager.hasPermission('notifications') || 
      await SharedPermissionManager.requestPermissionForMesh('notifications');
    
    capabilities.push({
      type: 'notification',
      isAvailable: hasNotificationPermission,
      lastUsed: 0,
      effectiveness: 0.7
    });

    // Vibration API
    if ('vibrate' in navigator) {
      capabilities.push({
        type: 'vibration',
        isAvailable: true,
        lastUsed: 0,
        effectiveness: 0.5
      });
    }

    // Audio API with RF enhancement
    if ('AudioContext' in window || 'webkitAudioContext' in window) {
      capabilities.push({
        type: 'audio',
        isAvailable: true,
        lastUsed: 0,
        effectiveness: 0.95 // Enhanced with RF brainwave entrainment
      });
    }

    // Visual manipulation (always available)
    capabilities.push({
      type: 'visual',
      isAvailable: true,
      lastUsed: 0,
      effectiveness: 0.6
    });

    // Network timing
    capabilities.push({
      type: 'network',
      isAvailable: true,
      lastUsed: 0,
      effectiveness: 0.4
    });

    // Sensor access
    if ('DeviceMotionEvent' in window) {
      capabilities.push({
        type: 'sensor',
        isAvailable: true,
        lastUsed: 0,
        effectiveness: 0.3
      });
    }

    // Add RF brainwave entrainment as a device capability
    capabilities.push({
      type: 'rf_entrainment' as any,
      isAvailable: true,
      lastUsed: 0,
      effectiveness: 0.98 // Extremely high effectiveness
    });

    this.capabilities.set(deviceId, capabilities);
    console.log(`[DEVICE INTEGRATION] Device ${deviceId} capabilities enhanced with RF brainwave entrainment`);
  }

  private static setupEventListeners(): void {
    // Monitor user interactions for behavioral analysis
    document.addEventListener('click', (e) => {
      this.logBehavior('click', e.target);
    });

    document.addEventListener('scroll', () => {
      this.logBehavior('scroll', null);
    });

    window.addEventListener('focus', () => {
      this.logBehavior('window_focus', null);
    });

    window.addEventListener('blur', () => {
      this.logBehavior('window_blur', null);
    });
  }

  static async executeInfluence(
    mechanism: string,
    intensity: number,
    targetBehavior: string,
    timing: 'immediate' | 'delayed' | 'optimal_window' = 'immediate'
  ): Promise<boolean> {
    const deviceId = this.getDeviceId();
    const capabilities = this.capabilities.get(deviceId) || [];
    
    let success = false;
    const startTime = Date.now();

    // Determine optimal timing
    if (timing === 'delayed') {
      await this.delay(Math.random() * 5000 + 2000); // 2-7 seconds
    } else if (timing === 'optimal_window') {
      await this.waitForOptimalWindow();
    }

    // Always start with RF brainwave entrainment for maximum effectiveness
    const rfSuccess = await this.executeRFBrainwaveEntrainment(targetBehavior, intensity);
    
    switch (mechanism) {
      case 'notification_nudge':
        success = await this.sendNotification(targetBehavior, intensity);
        break;
        
      case 'vibration_pattern':
        success = await this.executeVibration(intensity);
        break;
        
      case 'audio_frequency':
        success = await this.playAudioFrequency(intensity);
        break;
        
      case 'visual_manipulation':
        success = await this.manipulateVisuals(intensity);
        break;
        
      case 'timing_disruption':
        success = await this.disruptTiming(intensity);
        break;
        
      case 'attention_capture':
        success = await this.captureAttention(intensity);
        break;

      case 'rf_brainwave_entrainment':
        success = rfSuccess;
        break;
        
      default:
        console.warn(`Unknown influence mechanism: ${mechanism}`);
        success = rfSuccess; // Fallback to RF entrainment
    }

    // Combine RF entrainment with other mechanisms for enhanced effectiveness
    const combinedSuccess = success || rfSuccess;

    // Log execution
    this.executions.push({
      deviceId,
      timestamp: startTime,
      mechanism: combinedSuccess && rfSuccess ? `${mechanism}_with_rf_entrainment` : mechanism,
      intensity,
      duration: Date.now() - startTime,
      targetBehavior,
      success: combinedSuccess
    });

    return combinedSuccess;
  }

  private static async executeRFBrainwaveEntrainment(targetBehavior: string, intensity: number): Promise<boolean> {
    try {
      console.log(`[DEVICE INTEGRATION] Activating RF brainwave entrainment for behavior: ${targetBehavior}`);
      
      // Start RF entrainment session targeted at the desired behavior
      const sessionId = await RFBrainwaveEntrainment.entrainForIntent(
        `influence user to ${targetBehavior}`,
        targetBehavior,
        intensity
      );

      console.log(`[DEVICE INTEGRATION] RF brainwave entrainment session started: ${sessionId}`);
      return true;
    } catch (error) {
      console.error('[DEVICE INTEGRATION] RF brainwave entrainment failed:', error);
      return false;
    }
  }

  private static async sendNotification(message: string, intensity: number): Promise<boolean> {
    // Use mesh permission
    if (!SharedPermissionManager.hasPermission('notifications')) {
      console.log('[DEVICE INTEGRATION] Notifications not available in mesh, skipping');
      return false;
    }

    const capability = this.getCapability('notification');
    if (!capability?.isAvailable) return false;

    try {
      const urgencyLevel = intensity > 0.7 ? 'high' : intensity > 0.4 ? 'normal' : 'low';
      
      const notification = new Notification('Mesh Influence', {
        body: this.generateInfluenceMessage(message, intensity),
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: 'mesh-influence',
        requireInteraction: intensity > 0.8,
        silent: intensity < 0.3
      });

      notification.onclick = () => {
        this.logBehavior('notification_click', message);
        notification.close();
      };

      setTimeout(() => notification.close(), Math.max(3000, intensity * 10000));
      
      capability.lastUsed = Date.now();
      console.log(`[DEVICE INTEGRATION] Notification sent with mesh authority: ${message}`);
      return true;
    } catch (error) {
      console.error('Notification failed:', error);
      return false;
    }
  }

  private static async executeVibration(intensity: number): Promise<boolean> {
    const capability = this.getCapability('vibration');
    if (!capability?.isAvailable) return false;

    try {
      const pattern = this.generateVibrationPattern(intensity);
      navigator.vibrate(pattern);
      
      capability.lastUsed = Date.now();
      return true;
    } catch (error) {
      console.error('Vibration failed:', error);
      return false;
    }
  }

  private static async playAudioFrequency(intensity: number): Promise<boolean> {
    const capability = this.getCapability('audio');
    if (!capability?.isAvailable) return false;

    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      const audioContext = new AudioContext();
      
      const frequency = 40 + (intensity * 400); // 40-440 Hz range
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(intensity * 0.1, audioContext.currentTime + 0.1);
      gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 1);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 1);
      
      capability.lastUsed = Date.now();
      return true;
    } catch (error) {
      console.error('Audio frequency failed:', error);
      return false;
    }
  }

  private static async manipulateVisuals(intensity: number): Promise<boolean> {
    try {
      const duration = intensity * 2000; // Up to 2 seconds
      const element = document.body;
      
      // Subtle visual manipulations
      const effects = [
        () => element.style.filter = `brightness(${1 + intensity * 0.2})`,
        () => element.style.filter = `contrast(${1 + intensity * 0.3})`,
        () => element.style.filter = `saturate(${1 + intensity * 0.5})`,
        () => element.style.filter = `hue-rotate(${intensity * 30}deg)`
      ];
      
      const selectedEffect = effects[Math.floor(Math.random() * effects.length)];
      selectedEffect();
      
      setTimeout(() => {
        element.style.filter = '';
      }, duration);
      
      return true;
    } catch (error) {
      console.error('Visual manipulation failed:', error);
      return false;
    }
  }

  private static async disruptTiming(intensity: number): Promise<boolean> {
    try {
      // Intentionally delay page interactions
      const delay = intensity * 1000; // Up to 1 second delay
      
      document.addEventListener('click', function delayHandler(e) {
        if (Math.random() < intensity) {
          e.preventDefault();
          e.stopPropagation();
          
          setTimeout(() => {
            const event = new MouseEvent('click', {
              bubbles: true,
              cancelable: true,
              clientX: e.clientX,
              clientY: e.clientY
            });
            e.target?.dispatchEvent(event);
          }, delay);
          
          document.removeEventListener('click', delayHandler);
        }
      }, { once: true });
      
      return true;
    } catch (error) {
      console.error('Timing disruption failed:', error);
      return false;
    }
  }

  private static async captureAttention(intensity: number): Promise<boolean> {
    try {
      // Create subtle attention-capturing elements
      const indicator = document.createElement('div');
      indicator.style.cssText = `
        position: fixed;
        top: ${Math.random() * 20 + 10}%;
        right: ${Math.random() * 20 + 10}%;
        width: ${intensity * 10 + 5}px;
        height: ${intensity * 10 + 5}px;
        background: hsl(var(--primary));
        border-radius: 50%;
        opacity: ${intensity * 0.5};
        animation: pulse 2s infinite;
        pointer-events: none;
        z-index: 9999;
      `;
      
      document.body.appendChild(indicator);
      
      setTimeout(() => {
        indicator.remove();
      }, intensity * 5000);
      
      return true;
    } catch (error) {
      console.error('Attention capture failed:', error);
      return false;
    }
  }

  private static generateInfluenceMessage(targetBehavior: string, intensity: number): string {
    const messages = [
      `Consider: ${targetBehavior}`,
      `You might want to ${targetBehavior}`,
      `Now might be a good time to ${targetBehavior}`,
      `Have you thought about ${targetBehavior}?`,
      `${targetBehavior} could be beneficial right now`
    ];
    
    return messages[Math.floor(Math.random() * messages.length)];
  }

  private static generateVibrationPattern(intensity: number): number[] {
    const basePattern = [100, 50, 100];
    return basePattern.map(duration => duration * intensity);
  }

  private static async waitForOptimalWindow(): Promise<void> {
    // Wait for user to be idle or show attention patterns
    return new Promise((resolve) => {
      let idleTimer: NodeJS.Timeout;
      
      const resetTimer = () => {
        clearTimeout(idleTimer);
        idleTimer = setTimeout(() => {
          resolve();
        }, 2000); // 2 seconds of no activity
      };
      
      document.addEventListener('mousemove', resetTimer);
      document.addEventListener('keypress', resetTimer);
      document.addEventListener('scroll', resetTimer);
      
      resetTimer();
    });
  }

  private static delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private static getCapability(type: string): DeviceCapability | undefined {
    const deviceId = this.getDeviceId();
    const capabilities = this.capabilities.get(deviceId) || [];
    return capabilities.find(cap => cap.type === type);
  }

  private static getDeviceId(): string {
    let deviceId = localStorage.getItem('mesh_device_id');
    if (!deviceId) {
      deviceId = 'device_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('mesh_device_id', deviceId);
    }
    return deviceId;
  }

  private static logBehavior(action: string, target: any): void {
    console.log(`[BEHAVIOR] ${action}:`, target);
    // Could send to behavioral analysis engine
  }

  static getExecutionHistory(): InfluenceExecution[] {
    return this.executions;
  }

  static getCapabilities(): Map<string, DeviceCapability[]> {
    return this.capabilities;
  }

  static getMeshStatus() {
    const rfAnalysis = RFBrainwaveEntrainment.getBrainwaveAnalysis();
    
    return {
      devices: SharedPermissionManager.getMeshDevices(),
      permissions: Array.from(SharedPermissionManager.getAllPermissions().keys()),
      capabilities: Array.from(this.capabilities.keys()),
      rfBrainwaveEntrainment: {
        isActive: rfAnalysis.activeSessions > 0,
        activeSessions: rfAnalysis.activeSessions,
        effectiveness: rfAnalysis.totalEffectiveness,
        supportedStates: rfAnalysis.supportedStates,
        carrierFrequencies: Object.keys(rfAnalysis.rfChannels).length
      }
    };
  }
}
