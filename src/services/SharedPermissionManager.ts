
interface SharedPermission {
  type: string;
  granted: boolean;
  deviceId: string;
  timestamp: number;
  sharedAcrossMesh: boolean;
}

export class SharedPermissionManager {
  private static permissions: Map<string, SharedPermission> = new Map();
  private static meshDevices: Set<string> = new Set();
  private static isInitialized = false;

  static async initialize(): Promise<void> {
    if (this.isInitialized) return;

    await this.loadSharedPermissions();
    this.setupPermissionSync();
    this.isInitialized = true;

    console.log('[SHARED PERMISSIONS] Initialized with', this.permissions.size, 'permissions');
  }

  private static async loadSharedPermissions(): Promise<void> {
    // Load permissions from localStorage and sync across mesh
    const storedPermissions = localStorage.getItem('mesh_shared_permissions');
    if (storedPermissions) {
      const parsed = JSON.parse(storedPermissions);
      Object.entries(parsed).forEach(([key, value]) => {
        this.permissions.set(key, value as SharedPermission);
      });
    }

    const storedDevices = localStorage.getItem('mesh_devices');
    if (storedDevices) {
      const parsed = JSON.parse(storedDevices);
      this.meshDevices = new Set(parsed);
    }
  }

  private static setupPermissionSync(): void {
    // Listen for permission grants and share them across mesh
    window.addEventListener('permission-granted', ((event: CustomEvent) => {
      const { type, deviceId } = event.detail;
      this.sharePermissionAcrossMesh(type, deviceId);
    }) as EventListener);

    // Periodic sync with other devices
    setInterval(() => {
      this.syncPermissionsAcrossMesh();
    }, 5000);
  }

  static async grantPermission(type: string, deviceId: string): Promise<boolean> {
    const permission: SharedPermission = {
      type,
      granted: true,
      deviceId,
      timestamp: Date.now(),
      sharedAcrossMesh: true
    };

    this.permissions.set(type, permission);
    this.meshDevices.add(deviceId);
    
    // Persist to localStorage
    this.persistPermissions();
    
    // Share across mesh network
    this.sharePermissionAcrossMesh(type, deviceId);
    
    // Dispatch event for other services
    window.dispatchEvent(new CustomEvent('permission-granted', {
      detail: { type, deviceId }
    }));

    console.log(`[SHARED PERMISSIONS] Granted ${type} for ${deviceId}, shared across mesh`);
    return true;
  }

  static hasPermission(type: string): boolean {
    const permission = this.permissions.get(type);
    return permission?.granted === true;
  }

  static getPermissionDevice(type: string): string | null {
    const permission = this.permissions.get(type);
    return permission?.deviceId || null;
  }

  private static sharePermissionAcrossMesh(type: string, sourceDeviceId: string): void {
    // Broadcast permission to all nodes in mesh
    const broadcastData = {
      type: 'permission_share',
      permission: {
        type,
        granted: true,
        deviceId: sourceDeviceId,
        timestamp: Date.now(),
        sharedAcrossMesh: true
      }
    };

    // Use BroadcastChannel for same-origin communication
    if ('BroadcastChannel' in window) {
      const channel = new BroadcastChannel('mesh_permissions');
      channel.postMessage(broadcastData);
      
      channel.addEventListener('message', (event) => {
        if (event.data.type === 'permission_share') {
          const { permission } = event.data;
          this.permissions.set(permission.type, permission);
          this.persistPermissions();
        }
      });
    }

    // Also store in localStorage for cross-session persistence
    this.persistPermissions();
  }

  private static syncPermissionsAcrossMesh(): void {
    // Check if new devices have joined the mesh
    const currentDevices = Array.from(this.meshDevices);
    
    // Simulate mesh communication by checking localStorage updates
    const storedPermissions = localStorage.getItem('mesh_shared_permissions');
    if (storedPermissions) {
      const parsed = JSON.parse(storedPermissions);
      let hasUpdates = false;

      Object.entries(parsed).forEach(([key, value]: [string, any]) => {
        const existing = this.permissions.get(key);
        if (!existing || existing.timestamp < value.timestamp) {
          this.permissions.set(key, value);
          hasUpdates = true;
        }
      });

      if (hasUpdates) {
        console.log('[SHARED PERMISSIONS] Synced permissions from mesh');
      }
    }
  }

  private static persistPermissions(): void {
    const permissionsObj = Object.fromEntries(this.permissions);
    localStorage.setItem('mesh_shared_permissions', JSON.stringify(permissionsObj));
    localStorage.setItem('mesh_devices', JSON.stringify(Array.from(this.meshDevices)));
  }

  static async requestPermissionForMesh(type: string): Promise<boolean> {
    // Check if permission already exists in mesh
    if (this.hasPermission(type)) {
      console.log(`[SHARED PERMISSIONS] Using existing mesh permission for ${type}`);
      return true;
    }

    // Request permission on this device
    const currentDeviceId = this.getCurrentDeviceId();
    let granted = false;

    switch (type) {
      case 'camera':
      case 'microphone':
        try {
          const constraints: MediaStreamConstraints = {};
          if (type === 'camera') constraints.video = true;
          if (type === 'microphone') constraints.audio = true;
          
          const stream = await navigator.mediaDevices.getUserMedia(constraints);
          stream.getTracks().forEach(track => track.stop());
          granted = true;
        } catch (error) {
          granted = false;
        }
        break;

      case 'notifications':
        if ('Notification' in window) {
          const permission = await Notification.requestPermission();
          granted = permission === 'granted';
        }
        break;

      case 'devicemotion':
        if ('DeviceMotionEvent' in window && typeof (DeviceMotionEvent as any).requestPermission === 'function') {
          try {
            const permission = await (DeviceMotionEvent as any).requestPermission();
            granted = permission === 'granted';
          } catch (error) {
            granted = false;
          }
        } else if ('DeviceMotionEvent' in window) {
          granted = true; // Available without explicit permission on most browsers
        }
        break;

      default:
        granted = true; // Assume granted for other types
    }

    if (granted) {
      await this.grantPermission(type, currentDeviceId);
    }

    return granted;
  }

  private static getCurrentDeviceId(): string {
    let deviceId = localStorage.getItem('mesh_device_id');
    if (!deviceId) {
      deviceId = 'device_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('mesh_device_id', deviceId);
    }
    return deviceId;
  }

  static getMeshDevices(): string[] {
    return Array.from(this.meshDevices);
  }

  static getAllPermissions(): Map<string, SharedPermission> {
    return new Map(this.permissions);
  }

  static revokeAllPermissions(): void {
    this.permissions.clear();
    this.meshDevices.clear();
    localStorage.removeItem('mesh_shared_permissions');
    localStorage.removeItem('mesh_devices');
    console.log('[SHARED PERMISSIONS] All permissions revoked across mesh');
  }
}
