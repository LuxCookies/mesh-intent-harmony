import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { WebMeshProtocol } from '../services/WebMeshProtocol';
import { CrossDeviceMesh } from '../services/CrossDeviceMesh';

export const WebMeshDashboard: React.FC = () => {
  const [webMeshStats, setWebMeshStats] = useState<any>({});
  const [crossDeviceStats, setCrossDeviceStats] = useState<any>({});
  const [qrCode, setQrCode] = useState<string>('');
  const [meshEvents, setMeshEvents] = useState<string[]>([]);

  useEffect(() => {
    const updateStats = () => {
      setWebMeshStats(WebMeshProtocol.getStats());
      setCrossDeviceStats(CrossDeviceMesh.getStats());
    };

    updateStats();
    const interval = setInterval(updateStats, 2000);

    // Listen for mesh events
    const handleMeshEvent = (event: CustomEvent) => {
      setMeshEvents(prev => [...prev.slice(-9), 
        `${new Date().toLocaleTimeString()}: ${event.type} - ${JSON.stringify(event.detail).slice(0, 50)}...`
      ]);
    };

    const handleQRGenerated = (event: CustomEvent) => {
      setQrCode(event.detail.dataURL);
    };

    window.addEventListener('mesh-intent-received', handleMeshEvent as EventListener);
    window.addEventListener('cross-device-connection', handleMeshEvent as EventListener);
    window.addEventListener('mesh-qr-generated', handleQRGenerated as EventListener);
    window.addEventListener('mesh-url-activation', handleMeshEvent as EventListener);

    return () => {
      clearInterval(interval);
      window.removeEventListener('mesh-intent-received', handleMeshEvent as EventListener);
      window.removeEventListener('cross-device-connection', handleMeshEvent as EventListener);
      window.removeEventListener('mesh-qr-generated', handleQRGenerated as EventListener);
      window.removeEventListener('mesh-url-activation', handleMeshEvent as EventListener);
    };
  }, []);

  const triggerWebMeshTest = async () => {
    await WebMeshProtocol.propagateIntent('Web mesh test signal', 0.9);
  };

  const triggerCrossDeviceTest = async () => {
    await CrossDeviceMesh.propagateToAllDevices('Cross-device test signal', 0.9);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🌐 Advanced Web Mesh Protocol
            <Badge variant={webMeshStats.isInitialized ? 'default' : 'secondary'}>
              {webMeshStats.isInitialized ? 'Active' : 'Inactive'}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{webMeshStats.connectedPeers || 0}</div>
              <div className="text-sm text-muted-foreground">WebRTC Peers</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{webMeshStats.webSocketConnections || 0}</div>
              <div className="text-sm text-muted-foreground">WebSocket Connections</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{webMeshStats.deviceCapabilities?.length || 0}</div>
              <div className="text-sm text-muted-foreground">Device Capabilities</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{webMeshStats.deviceId?.slice(-4) || 'N/A'}</div>
              <div className="text-sm text-muted-foreground">Device ID (Last 4)</div>
            </div>
          </div>
          
          {webMeshStats.deviceCapabilities && (
            <div className="mb-4">
              <div className="text-sm font-medium mb-2">Capabilities:</div>
              <div className="flex flex-wrap gap-1">
                {webMeshStats.deviceCapabilities.map((cap: string) => (
                  <Badge key={cap} variant="outline">{cap}</Badge>
                ))}
              </div>
            </div>
          )}
          
          <Button onClick={triggerWebMeshTest} className="w-full">
            Test Web Mesh Propagation
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            📱 Cross-Device Mesh Networking
            <Badge variant="default">Multi-Vector</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{crossDeviceStats.socialVectors || 0}</div>
              <div className="text-sm text-muted-foreground">Social Vectors</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{crossDeviceStats.isScanning ? '📡' : '⏸️'}</div>
              <div className="text-sm text-muted-foreground">QR Scanning</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">🔊</div>
              <div className="text-sm text-muted-foreground">Audio Mesh</div>
            </div>
          </div>

          {qrCode && (
            <div className="mb-4 text-center">
              <div className="text-sm font-medium mb-2">Mesh QR Code:</div>
              <img src={qrCode} alt="Mesh QR Code" className="mx-auto border rounded" />
              <div className="text-xs text-muted-foreground mt-2">
                Scan with another device to establish mesh connection
              </div>
            </div>
          )}
          
          <Button onClick={triggerCrossDeviceTest} className="w-full" variant="outline">
            Test Cross-Device Propagation
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>🚀 Mesh Event Log</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-1 max-h-40 overflow-y-auto">
            {meshEvents.length === 0 ? (
              <div className="text-sm text-muted-foreground">No mesh events yet...</div>
            ) : (
              meshEvents.map((event, index) => (
                <div key={index} className="text-xs font-mono bg-muted p-2 rounded">
                  {event}
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};