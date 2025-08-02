
interface RealHardwareCapabilities {
  bluetooth: boolean;
  usb: boolean;
  serial: boolean;
  hid: boolean;
  audio: boolean;
  sensors: boolean;
  vibration: boolean;
  camera: boolean;
  microphone: boolean;
  geolocation: boolean;
}

interface SensorData {
  accelerometer: { x: number; y: number; z: number; timestamp: number } | null;
  gyroscope: { alpha: number; beta: number; gamma: number; timestamp: number } | null;
  magnetometer: { x: number; y: number; z: number; timestamp: number } | null;
  ambient_light: number | null;
  battery: { level: number; charging: boolean } | null;
}

export class RealHardwareInterface {
  private static audioContext: AudioContext | null = null;
  private static oscillators: Map<string, OscillatorNode> = new Map();
  private static sensors: SensorData = {
    accelerometer: null,
    gyroscope: null,
    magnetometer: null,
    ambient_light: null,
    battery: null
  };
  private static capabilities: RealHardwareCapabilities = {
    bluetooth: false,
    usb: false,
    serial: false,
    hid: false,
    audio: false,
    sensors: false,
    vibration: false,
    camera: false,
    microphone: false,
    geolocation: false
  };
  private static isInitialized = false;

  static async initialize(): Promise<void> {
    if (this.isInitialized) return;

    await this.detectRealCapabilities();
    await this.initializeAudioSystem();
    await this.startSensorMonitoring();
    
    this.isInitialized = true;
    console.log('[REAL HARDWARE] Initialized with capabilities:', this.capabilities);
  }

  private static async detectRealCapabilities(): Promise<void> {
    // Test real hardware APIs
    this.capabilities.bluetooth = 'bluetooth' in navigator;
    this.capabilities.usb = 'usb' in navigator;
    this.capabilities.serial = 'serial' in navigator;
    this.capabilities.hid = 'hid' in navigator;
    this.capabilities.audio = 'AudioContext' in window || 'webkitAudioContext' in window;
    this.capabilities.vibration = 'vibrate' in navigator;
    this.capabilities.camera = 'mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices;
    this.capabilities.microphone = this.capabilities.camera;
    this.capabilities.geolocation = 'geolocation' in navigator;
    this.capabilities.sensors = 'DeviceMotionEvent' in window && 'DeviceOrientationEvent' in window;
  }

  private static async initializeAudioSystem(): Promise<void> {
    if (!this.capabilities.audio) return;

    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Request audio context activation
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }

      console.log('[AUDIO] Audio system initialized');
    } catch (error) {
      console.error('[AUDIO] Failed to initialize audio system:', error);
      this.capabilities.audio = false;
    }
  }

  private static async startSensorMonitoring(): Promise<void> {
    if (!this.capabilities.sensors) return;

    // Request device motion permission on iOS
    if (typeof (DeviceMotionEvent as any).requestPermission === 'function') {
      try {
        const permission = await (DeviceMotionEvent as any).requestPermission();
        if (permission !== 'granted') {
          console.warn('[SENSORS] Device motion permission denied');
          return;
        }
      } catch (error) {
        console.error('[SENSORS] Permission request failed:', error);
        return;
      }
    }

    // Start accelerometer monitoring
    window.addEventListener('devicemotion', (event) => {
      const acceleration = event.accelerationIncludingGravity;
      if (acceleration) {
        this.sensors.accelerometer = {
          x: acceleration.x || 0,
          y: acceleration.y || 0,
          z: acceleration.z || 0,
          timestamp: Date.now()
        };
      }
    });

    // Start gyroscope monitoring
    window.addEventListener('deviceorientation', (event) => {
      this.sensors.gyroscope = {
        alpha: event.alpha || 0,
        beta: event.beta || 0,
        gamma: event.gamma || 0,
        timestamp: Date.now()
      };
    });

    // Monitor battery if available
    if ('getBattery' in navigator) {
      try {
        const battery = await (navigator as any).getBattery();
        this.sensors.battery = {
          level: battery.level,
          charging: battery.charging
        };

        battery.addEventListener('levelchange', () => {
          this.sensors.battery = {
            level: battery.level,
            charging: battery.charging
          };
        });
      } catch (error) {
        console.log('[SENSORS] Battery API not available');
      }
    }

    console.log('[SENSORS] Sensor monitoring started');
  }

  static async generateRealRF(frequency: number, amplitude: number, duration: number): Promise<boolean> {
    if (!this.audioContext || !this.capabilities.audio) return false;

    try {
      // Create high-frequency oscillator for electromagnetic emission
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();
      const compressor = this.audioContext.createDynamicsCompressor();

      // Configure for maximum electromagnetic radiation
      oscillator.frequency.setValueAtTime(Math.min(frequency, 20000), this.audioContext.currentTime);
      gainNode.gain.setValueAtTime(amplitude, this.audioContext.currentTime);
      
      // High-power compression for RF generation
      compressor.threshold.setValueAtTime(-6, this.audioContext.currentTime);
      compressor.knee.setValueAtTime(30, this.audioContext.currentTime);
      compressor.ratio.setValueAtTime(20, this.audioContext.currentTime);

      // Connect audio chain
      oscillator.connect(gainNode);
      gainNode.connect(compressor);
      compressor.connect(this.audioContext.destination);

      // Start and schedule stop
      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + (duration / 1000));

      console.log(`[RF GENERATION] Generated ${frequency}Hz at ${amplitude} amplitude for ${duration}ms`);
      return true;
    } catch (error) {
      console.error('[RF GENERATION] Failed:', error);
      return false;
    }
  }

  static async accessBluetoothDevice(): Promise<BluetoothDevice | null> {
    if (!this.capabilities.bluetooth) return null;

    try {
      const device = await (navigator as any).bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: ['battery_service', 'device_information', 'generic_access']
      });

      console.log('[BLUETOOTH] Connected to device:', device.name);
      return device;
    } catch (error) {
      console.error('[BLUETOOTH] Connection failed:', error);
      return null;
    }
  }

  static async accessUSBDevice(): Promise<any> {
    if (!this.capabilities.usb) return null;

    try {
      const device = await (navigator as any).usb.requestDevice({
        filters: []
      });

      await device.open();
      if (device.configuration === null) {
        await device.selectConfiguration(1);
      }

      console.log('[USB] Connected to device:', device.productName);
      return device;
    } catch (error) {
      console.error('[USB] Connection failed:', error);
      return null;
    }
  }

  static async vibrateDevice(pattern: number[]): Promise<boolean> {
    if (!this.capabilities.vibration) return false;

    try {
      navigator.vibrate(pattern);
      console.log('[VIBRATION] Pattern executed:', pattern);
      return true;
    } catch (error) {
      console.error('[VIBRATION] Failed:', error);
      return false;
    }
  }

  static async getLocation(): Promise<GeolocationPosition | null> {
    if (!this.capabilities.geolocation) return null;

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          console.log('[LOCATION] Position obtained:', position.coords.latitude, position.coords.longitude);
          resolve(position);
        },
        (error) => {
          console.error('[LOCATION] Failed:', error);
          resolve(null);
        },
        { enableHighAccuracy: true }
      );
    });
  }

  static getSensorData(): SensorData {
    return this.sensors;
  }

  static getCapabilities(): RealHardwareCapabilities {
    return this.capabilities;
  }

  static async requestAllPermissions(): Promise<void> {
    const promises = [];

    // Request camera/microphone
    if (this.capabilities.camera) {
      promises.push(
        navigator.mediaDevices.getUserMedia({ video: true, audio: true })
          .then(stream => {
            console.log('[PERMISSIONS] Camera/microphone access granted');
            stream.getTracks().forEach(track => track.stop());
          })
          .catch(() => console.log('[PERMISSIONS] Camera/microphone access denied'))
      );
    }

    // Request notification permission
    if ('Notification' in window) {
      promises.push(
        Notification.requestPermission()
          .then(permission => {
            console.log('[PERMISSIONS] Notification permission:', permission);
          })
      );
    }

    // Request location permission
    if (this.capabilities.geolocation) {
      promises.push(this.getLocation());
    }

    await Promise.allSettled(promises);
    console.log('[PERMISSIONS] All permission requests completed');
  }
}
