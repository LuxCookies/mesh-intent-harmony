import React, { useState, useCallback } from 'react';
import { BehavioralMonitor, BehavioralSignals, CognitiveState } from './BehavioralMonitor';
import { AmbientBridge, AmbientAction, ConnectedDevice } from './AmbientBridge';
import { ConsentPanel, ConsentSettings } from './ConsentPanel';
import { StatusOverlay } from './StatusOverlay';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Settings, Minimize2, Maximize2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const MirrorGardenWidget: React.FC = () => {
  const { toast } = useToast();
  
  // Widget state
  const [isMinimized, setIsMinimized] = useState(false);
  const [showSettings, setShowSettings] = useState(true);
  
  // System state
  const [isActive, setIsActive] = useState(false);
  const [currentSignals, setCurrentSignals] = useState<BehavioralSignals | null>(null);
  const [currentState, setCCurrentState] = useState<CognitiveState | null>(null);
  const [connectedDevices, setConnectedDevices] = useState<ConnectedDevice[]>([]);
  const [recentActions, setRecentActions] = useState<AmbientAction[]>([]);
  
  // Consent settings
  const [consentSettings, setConsentSettings] = useState<ConsentSettings>({
    behavioralMonitoring: false,
    cognitiveInference: false,
    deviceControl: false,
    dataRetention: false,
    audioActions: false,
    lightActions: false,
    displayActions: false,
    vibrationActions: false
  });

  const handleSignalsUpdate = useCallback((signals: BehavioralSignals) => {
    if (!consentSettings.behavioralMonitoring) return;
    setCurrentSignals(signals);
  }, [consentSettings.behavioralMonitoring]);

  const handleStateInferred = useCallback((state: CognitiveState) => {
    if (!consentSettings.cognitiveInference) return;
    setCCurrentState(state);
  }, [consentSettings.cognitiveInference]);

  const handleActionExecuted = useCallback((action: AmbientAction) => {
    setRecentActions(prev => [...prev, action].slice(-10));
    
    toast({
      title: "Ambient Action",
      description: action.description,
      duration: 2000,
    });
  }, [toast]);

  const handleDeviceConnected = useCallback((device: ConnectedDevice) => {
    setConnectedDevices(prev => {
      const exists = prev.find(d => d.id === device.id);
      if (exists) return prev;
      return [...prev, device];
    });
    
    toast({
      title: "Device Connected",
      description: `${device.name} is now available`,
      duration: 3000,
    });
  }, [toast]);

  const handleActiveChange = useCallback((active: boolean) => {
    setIsActive(active);
    
    if (active) {
      toast({
        title: "Mirror Garden Activated",
        description: "Ambient support system is now active",
        duration: 3000,
      });
    } else {
      toast({
        title: "Mirror Garden Deactivated",
        description: "All monitoring and actions stopped",
        duration: 3000,
      });
      
      // Clear current data when deactivating
      setCurrentSignals(null);
      setCCurrentState(null);
    }
  }, [toast]);

  const getPermittedActions = useCallback(() => {
    const actions: string[] = [];
    if (consentSettings.audioActions) actions.push('audio', 'sound');
    if (consentSettings.lightActions) actions.push('light', 'bluetooth');
    if (consentSettings.displayActions) actions.push('display');
    if (consentSettings.vibrationActions) actions.push('vibration');
    return actions;
  }, [consentSettings]);

  if (isMinimized) {
    return (
      <Card className="fixed bottom-4 right-4 w-48">
        <CardContent className="p-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Mirror Garden</span>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMinimized(false)}
              >
                <Maximize2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
          {isActive && (
            <div className="text-xs text-muted-foreground mt-1">
              Active • {connectedDevices.length} devices
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      {/* Main Widget */}
      <Card className="fixed bottom-4 left-4 w-96">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Mirror Garden</h3>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSettings(!showSettings)}
              >
                <Settings className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMinimized(true)}
              >
                <Minimize2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {showSettings && (
            <ConsentPanel
              settings={consentSettings}
              onSettingsChange={setConsentSettings}
              isActive={isActive}
              onActiveChange={handleActiveChange}
            />
          )}
        </CardContent>
      </Card>

      {/* Status Overlay */}
      <StatusOverlay
        isActive={isActive}
        currentSignals={currentSignals}
        currentState={currentState}
        connectedDevices={connectedDevices}
        recentActions={recentActions}
      />

      {/* Behavioral Monitor */}
      <BehavioralMonitor
        onSignalsUpdate={handleSignalsUpdate}
        onStateInferred={handleStateInferred}
        isActive={isActive && consentSettings.behavioralMonitoring}
      />

      {/* Ambient Bridge */}
      <AmbientBridge
        cognitiveState={currentState}
        isActive={isActive && consentSettings.deviceControl}
        onActionExecuted={handleActionExecuted}
        onDeviceConnected={handleDeviceConnected}
        permittedActions={getPermittedActions()}
      />
    </>
  );
};