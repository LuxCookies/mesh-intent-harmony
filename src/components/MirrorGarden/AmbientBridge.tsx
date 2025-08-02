import React, { useEffect, useRef, useCallback } from 'react';
import { CognitiveState } from './BehavioralMonitor';

export interface AmbientAction {
  type: 'light' | 'sound' | 'vibration' | 'display';
  intensity: number; // 0-1
  duration: number; // milliseconds
  reversible: boolean;
  description: string;
}

export interface ConnectedDevice {
  id: string;
  name: string;
  type: 'bluetooth' | 'wifi' | 'local';
  capabilities: string[];
  connected: boolean;
}

interface AmbientBridgeProps {
  cognitiveState: CognitiveState | null;
  isActive: boolean;
  onActionExecuted: (action: AmbientAction) => void;
  onDeviceConnected: (device: ConnectedDevice) => void;
  permittedActions: string[];
}

export const AmbientBridge: React.FC<AmbientBridgeProps> = ({
  cognitiveState,
  isActive,
  onActionExecuted,
  onDeviceConnected,
  permittedActions
}) => {
  const connectedDevices = useRef<ConnectedDevice[]>([]);
  const lastAction = useRef<number>(0);
  const actionHistory = useRef<AmbientAction[]>([]);

  // Initialize device discovery
  useEffect(() => {
    if (!isActive) return;

    const discoverDevices = async () => {
      // Web Bluetooth discovery
      if ('bluetooth' in navigator && permittedActions.includes('bluetooth')) {
        try {
          // Mock device for demo - in real implementation, scan for actual devices
          const mockDevice: ConnectedDevice = {
            id: 'demo-light-1',
            name: 'Smart Light',
            type: 'bluetooth',
            capabilities: ['brightness', 'color', 'warmth'],
            connected: true
          };
          connectedDevices.current.push(mockDevice);
          onDeviceConnected(mockDevice);
        } catch (error) {
          console.log('Bluetooth discovery not available:', error);
        }
      }

      // Local audio context
      if ('AudioContext' in window && permittedActions.includes('audio')) {
        const audioDevice: ConnectedDevice = {
          id: 'local-audio',
          name: 'System Audio',
          type: 'local',
          capabilities: ['frequency', 'volume', 'binaural'],
          connected: true
        };
        connectedDevices.current.push(audioDevice);
        onDeviceConnected(audioDevice);
      }

      // Display modifications
      if (permittedActions.includes('display')) {
        const displayDevice: ConnectedDevice = {
          id: 'local-display',
          name: 'Screen Ambience',
          type: 'local',
          capabilities: ['brightness', 'warmth', 'overlay'],
          connected: true
        };
        connectedDevices.current.push(displayDevice);
        onDeviceConnected(displayDevice);
      }
    };

    discoverDevices();
  }, [isActive, permittedActions, onDeviceConnected]);

  const executeAmbientAction = useCallback(async (action: AmbientAction) => {
    if (!isActive || !permittedActions.includes(action.type)) return;

    const now = Date.now();
    
    // Rate limiting - no more than one action per 3 seconds
    if (now - lastAction.current < 3000) return;
    lastAction.current = now;

    try {
      switch (action.type) {
        case 'light':
          await executeLightAction(action);
          break;
        case 'sound':
          await executeSoundAction(action);
          break;
        case 'display':
          await executeDisplayAction(action);
          break;
        case 'vibration':
          await executeVibrationAction(action);
          break;
      }

      actionHistory.current.push({ ...action, timestamp: now } as any);
      if (actionHistory.current.length > 20) {
        actionHistory.current.shift();
      }

      onActionExecuted(action);
    } catch (error) {
      console.warn('Ambient action failed:', error);
    }
  }, [isActive, permittedActions, onActionExecuted]);

  const executeLightAction = async (action: AmbientAction) => {
    // Simulate smart light control
    console.log(`Light action: ${action.description}, intensity: ${action.intensity}`);
    
    // In real implementation, this would send commands to connected smart lights
    // For demo, we'll just log the action
    if (action.reversible) {
      setTimeout(() => {
        console.log('Light action reversed');
      }, action.duration);
    }
  };

  const executeSoundAction = async (action: AmbientAction) => {
    if (!('AudioContext' in window)) return;

    const audioContext = new AudioContext();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    // Generate subtle ambient tones based on cognitive state
    const baseFrequency = 220; // A3
    oscillator.frequency.value = baseFrequency * (1 + action.intensity * 0.5);
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(action.intensity * 0.1, audioContext.currentTime + 0.1);
    gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + action.duration / 1000);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + action.duration / 1000);

    console.log(`Sound action: ${action.description}, frequency: ${oscillator.frequency.value}Hz`);
  };

  const executeDisplayAction = async (action: AmbientAction) => {
    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 9999;
      opacity: ${action.intensity * 0.1};
      background: linear-gradient(45deg, 
        hsl(var(--primary) / 0.05), 
        hsl(var(--accent) / 0.05));
      transition: opacity 0.5s ease;
    `;

    document.body.appendChild(overlay);
    console.log(`Display action: ${action.description}, intensity: ${action.intensity}`);

    if (action.reversible) {
      setTimeout(() => {
        overlay.style.opacity = '0';
        setTimeout(() => document.body.removeChild(overlay), 500);
      }, action.duration);
    }
  };

  const executeVibrationAction = async (action: AmbientAction) => {
    if ('vibrate' in navigator) {
      const pattern = [200, 100, 200]; // Subtle pattern
      navigator.vibrate(pattern);
      console.log(`Vibration action: ${action.description}`);
    }
  };

  // React to cognitive state changes
  useEffect(() => {
    if (!cognitiveState || !isActive) return;

    // Generate ambient responses based on inferred state
    const generateResponse = () => {
      // Low focus -> subtle alerting
      if (cognitiveState.focusLevel < 0.3 && cognitiveState.confidenceScore > 0.6) {
        executeAmbientAction({
          type: 'sound',
          intensity: 0.3,
          duration: 1000,
          reversible: true,
          description: 'Gentle focus enhancement tone'
        });
      }

      // High stress -> calming
      if (cognitiveState.stressLevel > 0.7 && cognitiveState.confidenceScore > 0.6) {
        executeAmbientAction({
          type: 'display',
          intensity: 0.2,
          duration: 5000,
          reversible: true,
          description: 'Calming ambient overlay'
        });
      }

      // Low engagement -> subtle activation
      if (cognitiveState.engagementLevel < 0.4 && cognitiveState.confidenceScore > 0.5) {
        executeAmbientAction({
          type: 'light',
          intensity: 0.4,
          duration: 3000,
          reversible: true,
          description: 'Engagement enhancement lighting'
        });
      }
    };

    const timeout = setTimeout(generateResponse, 1000);
    return () => clearTimeout(timeout);
  }, [cognitiveState, isActive, executeAmbientAction]);

  return null; // Headless component
};