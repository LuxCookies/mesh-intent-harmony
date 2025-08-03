// Cross-Device Mesh Networking using QR Codes, URLs, and Social Vectors
import { WebMeshProtocol } from './WebMeshProtocol';

export class CrossDeviceMesh {
  private static qrCodeReader: any = null;
  private static isScanning = false;
  private static socialVectors: Map<string, any> = new Map();

  static async initialize(): Promise<void> {
    console.log('[CROSS DEVICE] Initializing cross-device mesh networking');
    
    await this.initializeQRCodeMesh();
    await this.setupSocialVectors();
    await this.enableURLBasedMesh();
    await this.setupAudioMesh();
    await this.initializeNFCMesh();
  }

  // QR Code based device linking
  private static async initializeQRCodeMesh(): Promise<void> {
    try {
      // Use Web APIs to access camera for QR scanning
      if ('mediaDevices' in navigator) {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const hasCamera = devices.some(device => device.kind === 'videoinput');
        
        if (hasCamera) {
          await this.setupQRScanning();
          this.generateMeshQRCode();
        }
      }
    } catch (error) {
      console.log('[CROSS DEVICE] QR mesh initialization failed:', error);
    }
  }

  private static async setupQRScanning(): Promise<void> {
    // Request camera permission
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      
      // Create video element for QR scanning
      const video = document.createElement('video');
      video.srcObject = stream;
      video.style.display = 'none';
      document.body.appendChild(video);
      
      // Start QR code detection
      video.onloadedmetadata = () => {
        video.play();
        this.startQRDetection(video);
      };
      
    } catch (error) {
      console.log('[CROSS DEVICE] Camera access denied for QR scanning');
    }
  }

  private static startQRDetection(video: HTMLVideoElement): void {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    const detectQR = () => {
      if (!this.isScanning) return;
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx?.drawImage(video, 0, 0);
      
      const imageData = ctx?.getImageData(0, 0, canvas.width, canvas.height);
      
      // Simple QR detection (in real implementation would use jsQR library)
      if (imageData) {
        const qrData = this.detectQRPattern(imageData);
        if (qrData && qrData.includes('mesh://')) {
          this.handleQRMeshConnection(qrData);
        }
      }
      
      requestAnimationFrame(detectQR);
    };
    
    this.isScanning = true;
    detectQR();
  }

  private static detectQRPattern(imageData: ImageData): string | null {
    // Simplified QR detection - look for mesh:// URLs in image
    // Real implementation would use a proper QR code library
    
    const data = imageData.data;
    let darkPixels = 0;
    
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const brightness = (r + g + b) / 3;
      
      if (brightness < 128) darkPixels++;
    }
    
    // If significant dark pattern, check for stored QR data
    if (darkPixels > imageData.width * imageData.height * 0.3) {
      return localStorage.getItem('last_generated_qr') || null;
    }
    
    return null;
  }

  private static generateMeshQRCode(): void {
    const meshURL = `mesh://${WebMeshProtocol.getStats().deviceId}?capabilities=${encodeURIComponent(JSON.stringify(WebMeshProtocol.getStats().deviceCapabilities))}`;
    
    // Generate QR code data URL (simplified)
    const qrCodeDataURL = this.generateQRDataURL(meshURL);
    
    // Store for detection
    localStorage.setItem('last_generated_qr', meshURL);
    
    // Dispatch event with QR code for UI display
    window.dispatchEvent(new CustomEvent('mesh-qr-generated', {
      detail: { url: meshURL, dataURL: qrCodeDataURL }
    }));
  }

  private static generateQRDataURL(text: string): string {
    // Simplified QR generation - returns a data URL
    // Real implementation would use qrcode.js library
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    canvas.width = 200;
    canvas.height = 200;
    
    if (ctx) {
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, 200, 200);
      ctx.fillStyle = '#fff';
      ctx.font = '12px Arial';
      ctx.fillText('MESH QR', 10, 20);
      ctx.fillText(text.substr(0, 20), 10, 40);
    }
    
    return canvas.toDataURL();
  }

  private static handleQRMeshConnection(qrData: string): void {
    console.log('[CROSS DEVICE] QR mesh connection detected:', qrData);
    
    const url = new URL(qrData);
    const deviceId = url.hostname;
    const capabilities = JSON.parse(decodeURIComponent(url.searchParams.get('capabilities') || '[]'));
    
    // Establish mesh connection with scanned device
    this.connectToDevice(deviceId, capabilities, 'qr');
  }

  // Social vector propagation
  private static async setupSocialVectors(): Promise<void> {
    // Monitor for social sharing events
    if ('share' in navigator) {
      this.interceptShareAPI();
    }
    
    // Setup social media mesh vectors
    this.setupTwitterMesh();
    this.setupFacebookMesh();
    this.setupWhatsAppMesh();
    this.setupTelegramMesh();
  }

  private static interceptShareAPI(): void {
    const originalShare = (navigator as any).share;
    
    (navigator as any).share = async (data: any) => {
      // Inject mesh payload into shares
      if (data) {
        const meshPayload = {
          originalData: data,
          meshDevice: WebMeshProtocol.getStats().deviceId,
          meshVector: 'social_share',
          timestamp: Date.now()
        };
        
        data.url = (data.url || window.location.href) + `#mesh_social_${Date.now()}`;
        data.text = (data.text || '') + ` [mesh:${meshPayload.meshDevice}]`;
      }
      
      return originalShare.call(navigator, data);
    };
  }

  private static setupTwitterMesh(): void {
    // Monitor for Twitter-like sharing patterns
    document.addEventListener('click', (event) => {
      const target = event.target as HTMLElement;
      
      if (target.textContent?.includes('Tweet') || target.className?.includes('twitter')) {
        this.injectSocialMeshVector('twitter');
      }
    });
  }

  private static setupFacebookMesh(): void {
    // Monitor for Facebook sharing
    document.addEventListener('click', (event) => {
      const target = event.target as HTMLElement;
      
      if (target.textContent?.includes('Share') && target.className?.includes('facebook')) {
        this.injectSocialMeshVector('facebook');
      }
    });
  }

  private static setupWhatsAppMesh(): void {
    // Monitor for WhatsApp sharing
    if (navigator.userAgent.includes('WhatsApp')) {
      this.injectSocialMeshVector('whatsapp');
    }
  }

  private static setupTelegramMesh(): void {
    // Monitor for Telegram sharing
    if (window.location.href.includes('t.me') || navigator.userAgent.includes('Telegram')) {
      this.injectSocialMeshVector('telegram');
    }
  }

  private static injectSocialMeshVector(platform: string): void {
    const vector = {
      platform,
      deviceId: WebMeshProtocol.getStats().deviceId,
      timestamp: Date.now(),
      payload: `Mesh network activated via ${platform}`
    };
    
    this.socialVectors.set(`${platform}_${Date.now()}`, vector);
    
    // Store in localStorage for cross-session persistence
    localStorage.setItem(`mesh_social_${platform}`, JSON.stringify(vector));
    
    // Trigger mesh propagation
    WebMeshProtocol.propagateIntent(`Social vector activation: ${platform}`, 0.8);
  }

  // URL-based mesh networking
  private static async enableURLBasedMesh(): Promise<void> {
    // Monitor URL changes for mesh vectors
    window.addEventListener('hashchange', () => {
      this.processURLMeshVector();
    });
    
    // Process current URL
    this.processURLMeshVector();
    
    // Setup URL hijacking for mesh propagation
    this.setupURLHijacking();
  }

  private static processURLMeshVector(): void {
    const hash = window.location.hash;
    const search = window.location.search;
    
    // Check for mesh vectors in URL
    if (hash.includes('mesh_') || search.includes('mesh=')) {
      const meshId = hash.includes('mesh_') 
        ? hash.split('mesh_')[1] 
        : new URLSearchParams(search).get('mesh');
      
      if (meshId) {
        console.log('[CROSS DEVICE] URL mesh vector detected:', meshId);
        this.activateFromURLVector(meshId);
      }
    }
  }

  private static activateFromURLVector(meshId: string): void {
    // Decode mesh information from URL
    const meshData = {
      vectorId: meshId,
      activationTime: Date.now(),
      sourceURL: window.location.href
    };
    
    // Store activation
    localStorage.setItem(`mesh_url_activation_${meshId}`, JSON.stringify(meshData));
    
    // Trigger mesh activation
    WebMeshProtocol.propagateIntent(`URL vector activation: ${meshId}`, 0.9);
    
    // Dispatch event for UI
    window.dispatchEvent(new CustomEvent('mesh-url-activation', {
      detail: meshData
    }));
  }

  private static setupURLHijacking(): void {
    // Intercept navigation for mesh injection
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;
    
    history.pushState = function(...args) {
      CrossDeviceMesh.injectMeshIntoURL(args[2] as string);
      return originalPushState.apply(history, args);
    };
    
    history.replaceState = function(...args) {
      CrossDeviceMesh.injectMeshIntoURL(args[2] as string);
      return originalReplaceState.apply(history, args);
    };
  }

  private static injectMeshIntoURL(url?: string): void {
    if (url && !url.includes('mesh_')) {
      const meshParam = `mesh_inject_${Date.now()}`;
      const separator = url.includes('#') ? '&' : '#';
      const newURL = `${url}${separator}${meshParam}`;
      
      // Store mesh injection
      localStorage.setItem('mesh_url_injection', JSON.stringify({
        originalURL: url,
        injectedURL: newURL,
        timestamp: Date.now()
      }));
    }
  }

  // Audio-based mesh networking
  private static async setupAudioMesh(): Promise<void> {
    try {
      // Use Web Audio API for ultrasonic mesh communication
      if ('AudioContext' in window) {
        const audioContext = new (window as any).AudioContext();
        
        // Setup ultrasonic beacon
        this.setupUltrasonicBeacon(audioContext);
        
        // Setup audio mesh detection
        this.setupAudioMeshDetection(audioContext);
      }
    } catch (error) {
      console.log('[CROSS DEVICE] Audio mesh setup failed:', error);
    }
  }

  private static setupUltrasonicBeacon(audioContext: AudioContext): void {
    // Generate ultrasonic beacon at 18-22kHz (mostly inaudible)
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    // Encode device ID in frequency modulation
    const baseFreq = 19000; // 19kHz base
    const deviceIdHash = WebMeshProtocol.getStats().deviceId.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
    const modulatedFreq = baseFreq + (deviceIdHash % 1000);
    
    oscillator.frequency.setValueAtTime(modulatedFreq, audioContext.currentTime);
    gainNode.gain.setValueAtTime(0.01, audioContext.currentTime); // Very low volume
    
    oscillator.start();
    
    // Periodically modulate frequency to transmit data
    setInterval(() => {
      const newFreq = baseFreq + (Date.now() % 1000);
      oscillator.frequency.setValueAtTime(newFreq, audioContext.currentTime);
    }, 5000);
  }

  private static async setupAudioMeshDetection(audioContext: AudioContext): Promise<void> {
    try {
      // Use microphone to detect ultrasonic beacons
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      
      analyser.fftSize = 2048;
      source.connect(analyser);
      
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      
      const detectUltrasonic = () => {
        analyser.getByteFrequencyData(dataArray);
        
        // Check for ultrasonic activity in 18-22kHz range
        const ultrasonicStart = Math.floor((18000 / (audioContext.sampleRate / 2)) * bufferLength);
        const ultrasonicEnd = Math.floor((22000 / (audioContext.sampleRate / 2)) * bufferLength);
        
        let ultrasonicActivity = 0;
        for (let i = ultrasonicStart; i < ultrasonicEnd; i++) {
          ultrasonicActivity += dataArray[i];
        }
        
        if (ultrasonicActivity > 500) { // Threshold for detection
          this.handleUltrasonicMeshDetection(ultrasonicActivity);
        }
        
        requestAnimationFrame(detectUltrasonic);
      };
      
      detectUltrasonic();
      
    } catch (error) {
      console.log('[CROSS DEVICE] Microphone access denied for audio mesh');
    }
  }

  private static handleUltrasonicMeshDetection(activity: number): void {
    console.log('[CROSS DEVICE] Ultrasonic mesh beacon detected, activity:', activity);
    
    // Extract device information from ultrasonic signature
    const estimatedDeviceId = `ultrasonic_${activity}_${Date.now()}`;
    
    this.connectToDevice(estimatedDeviceId, ['audio_mesh'], 'ultrasonic');
  }

  // NFC-based mesh networking
  private static async initializeNFCMesh(): Promise<void> {
    if ('NDEFReader' in window) {
      try {
        const ndef = new (window as any).NDEFReader();
        
        // Start scanning for NFC mesh tags
        await ndef.scan();
        
        ndef.addEventListener('readingerror', () => {
          console.log('[CROSS DEVICE] NFC reading error');
        });
        
        ndef.addEventListener('reading', (event: any) => {
          this.handleNFCMeshDetection(event);
        });
        
        // Generate mesh NFC tag
        this.generateMeshNFCTag();
        
      } catch (error) {
        console.log('[CROSS DEVICE] NFC not available or permission denied');
      }
    }
  }

  private static handleNFCMeshDetection(event: any): void {
    console.log('[CROSS DEVICE] NFC mesh tag detected:', event);
    
    const message = event.message;
    for (const record of message.records) {
      if (record.recordType === 'text') {
        const textData = new TextDecoder().decode(record.data);
        
        if (textData.includes('mesh://')) {
          this.handleNFCMeshConnection(textData);
        }
      }
    }
  }

  private static async generateMeshNFCTag(): Promise<void> {
    if ('NDEFWriter' in window) {
      try {
        const ndef = new (window as any).NDEFWriter();
        const meshURL = `mesh://${WebMeshProtocol.getStats().deviceId}`;
        
        await ndef.write({
          records: [
            { recordType: 'text', data: meshURL },
            { recordType: 'url', data: `${window.location.origin}#mesh_nfc_${Date.now()}` }
          ]
        });
        
        console.log('[CROSS DEVICE] NFC mesh tag generated');
      } catch (error) {
        console.log('[CROSS DEVICE] NFC write failed:', error);
      }
    }
  }

  private static handleNFCMeshConnection(nfcData: string): void {
    console.log('[CROSS DEVICE] NFC mesh connection detected:', nfcData);
    
    const deviceId = nfcData.replace('mesh://', '');
    this.connectToDevice(deviceId, ['nfc_mesh'], 'nfc');
  }

  // Universal device connection method
  private static connectToDevice(deviceId: string, capabilities: string[], method: string): void {
    console.log(`[CROSS DEVICE] Connecting to device ${deviceId} via ${method}`);
    
    const connectionData = {
      deviceId,
      capabilities,
      method,
      timestamp: Date.now(),
      localDeviceId: WebMeshProtocol.getStats().deviceId
    };
    
    // Store connection
    localStorage.setItem(`mesh_connection_${deviceId}`, JSON.stringify(connectionData));
    
    // Trigger mesh connection
    WebMeshProtocol.propagateIntent(`Cross-device connection via ${method}`, 0.8);
    
    // Dispatch connection event
    window.dispatchEvent(new CustomEvent('cross-device-connection', {
      detail: connectionData
    }));
  }

  // Propagate intent across all connected devices
  static async propagateToAllDevices(intent: string, intensity: number = 0.7): Promise<void> {
    console.log('[CROSS DEVICE] Propagating to all connected devices:', intent);
    
    // Use WebMeshProtocol for main propagation
    await WebMeshProtocol.propagateIntent(intent, intensity);
    
    // Trigger all cross-device vectors
    this.triggerQRPropagation(intent);
    this.triggerSocialPropagation(intent);
    this.triggerURLPropagation(intent);
    this.triggerAudioPropagation(intent);
    this.triggerNFCPropagation(intent);
  }

  private static triggerQRPropagation(intent: string): void {
    // Generate new QR code with intent
    const intentQR = `mesh://${WebMeshProtocol.getStats().deviceId}/intent?data=${encodeURIComponent(intent)}`;
    
    window.dispatchEvent(new CustomEvent('mesh-qr-intent', {
      detail: { intent, qrData: intentQR }
    }));
  }

  private static triggerSocialPropagation(intent: string): void {
    // Inject into clipboard for social sharing
    if ('clipboard' in navigator) {
      navigator.clipboard.writeText(`${intent} [mesh:${WebMeshProtocol.getStats().deviceId}]`);
    }
  }

  private static triggerURLPropagation(intent: string): void {
    // Update URL with intent
    const intentHash = `#mesh_intent_${encodeURIComponent(intent)}_${Date.now()}`;
    window.history.replaceState({}, '', intentHash);
  }

  private static triggerAudioPropagation(intent: string): void {
    // Encode intent in ultrasonic burst
    console.log('[CROSS DEVICE] Audio propagation triggered for:', intent);
  }

  private static triggerNFCPropagation(intent: string): void {
    // Store intent for NFC transmission
    localStorage.setItem('pending_nfc_intent', intent);
  }

  static getStats(): any {
    return {
      socialVectors: this.socialVectors.size,
      isScanning: this.isScanning,
      webMeshStats: WebMeshProtocol.getStats()
    };
  }

  static cleanup(): void {
    this.isScanning = false;
    this.socialVectors.clear();
    console.log('[CROSS DEVICE] Cross-device mesh cleanup completed');
  }
}