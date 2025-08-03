import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { FreeMeshProtocol } from '../services/FreeMeshProtocol';

export const FreeMeshDashboard: React.FC = () => {
  const [freeMeshStats, setFreeMeshStats] = useState<any>({});
  const [meshURL, setMeshURL] = useState<string>('');
  const [shareableLink, setShareableLink] = useState<string>('');
  const [meshEvents, setMeshEvents] = useState<string[]>([]);

  useEffect(() => {
    const updateStats = () => {
      const stats = FreeMeshProtocol.getStats();
      setFreeMeshStats(stats);
      setMeshURL(stats.meshURL || '');
    };

    updateStats();
    const interval = setInterval(updateStats, 2000);

    // Listen for mesh events
    const handleMeshEvent = (event: CustomEvent) => {
      setMeshEvents(prev => [...prev.slice(-4), 
        `${new Date().toLocaleTimeString()}: FREE MESH - ${event.detail.content || 'Event triggered'}`
      ]);
    };

    const handleURLGenerated = (event: CustomEvent) => {
      setShareableLink(event.detail.url);
    };

    window.addEventListener('free-mesh-intent-received', handleMeshEvent as EventListener);
    window.addEventListener('mesh-url-generated', handleURLGenerated as EventListener);

    return () => {
      clearInterval(interval);
      window.removeEventListener('free-mesh-intent-received', handleMeshEvent as EventListener);
      window.removeEventListener('mesh-url-generated', handleURLGenerated as EventListener);
    };
  }, []);

  const triggerFreeMeshTest = async () => {
    await FreeMeshProtocol.propagateIntent('🚀 FREE MESH TEST - ZERO COST NETWORKING!', 1.0);
  };

  const copyMeshURL = () => {
    if (shareableLink) {
      navigator.clipboard.writeText(shareableLink);
      alert('Mesh URL copied! Share this to connect devices for FREE!');
    }
  };

  const triggerViralShare = async () => {
    if ('share' in navigator && (window as any).meshShareData) {
      try {
        await (navigator as any).share((window as any).meshShareData);
      } catch (error) {
        // Fallback to clipboard
        const shareText = `Join my mesh network: ${window.location.href}`;
        navigator.clipboard.writeText(shareText);
        alert('Share text copied to clipboard!');
      }
    } else {
      const shareText = `Join my mesh network: ${window.location.href}`;
      navigator.clipboard.writeText(shareText);
      alert('Share text copied to clipboard!');
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            💸 FREE Mesh Protocol (Zero Cost!)
            <Badge variant="default" className="bg-green-600">
              100% FREE
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{freeMeshStats.connectedDevices || 0}</div>
              <div className="text-sm text-muted-foreground">Connected Devices</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{freeMeshStats.capabilities?.length || 0}</div>
              <div className="text-sm text-muted-foreground">Free Capabilities</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">$0</div>
              <div className="text-sm text-muted-foreground">Monthly Cost</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">∞</div>
              <div className="text-sm text-muted-foreground">Scalability</div>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <div className="text-sm font-medium mb-2">Free Mesh Methods Active:</div>
              <div className="flex flex-wrap gap-1">
                <Badge variant="outline">LocalStorage Sync</Badge>
                <Badge variant="outline">Broadcast Channels</Badge>
                <Badge variant="outline">URL Hash Relay</Badge>
                <Badge variant="outline">IndexedDB Cross-Tab</Badge>
                <Badge variant="outline">WebRTC P2P</Badge>
                <Badge variant="outline">Viral URL Spread</Badge>
              </div>
            </div>

            {shareableLink && (
              <div>
                <div className="text-sm font-medium mb-2">Shareable Mesh URL:</div>
                <div className="flex gap-2">
                  <Input 
                    value={shareableLink} 
                    readOnly 
                    className="text-xs"
                  />
                  <Button size="sm" onClick={copyMeshURL}>
                    Copy
                  </Button>
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Share this URL to connect any device to your mesh - completely FREE!
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-2">
              <Button onClick={triggerFreeMeshTest} className="bg-green-600 hover:bg-green-700">
                🚀 Test FREE Mesh
              </Button>
              <Button onClick={triggerViralShare} variant="outline">
                📤 Viral Share
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>🎯 How It Works (100% FREE)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <Badge className="bg-blue-600">1</Badge>
              <span>Uses browser localStorage as device registry</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-blue-600">2</Badge>
              <span>Broadcast channels for instant cross-tab sync</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-blue-600">3</Badge>
              <span>URL hashes as message relay system</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-blue-600">4</Badge>
              <span>WebRTC direct P2P (no signaling server needed)</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-blue-600">5</Badge>
              <span>Social viral spread through shared URLs</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-blue-600">6</Badge>
              <span>IndexedDB for persistent cross-session mesh</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>📡 FREE Mesh Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-1 max-h-32 overflow-y-auto">
            {meshEvents.length === 0 ? (
              <div className="text-sm text-muted-foreground">
                Waiting for free mesh activity...
              </div>
            ) : (
              meshEvents.map((event, index) => (
                <div key={index} className="text-xs font-mono bg-green-50 p-2 rounded border border-green-200">
                  {event}
                </div>
              ))
            )}
          </div>
          <div className="mt-3 p-2 bg-green-50 border border-green-200 rounded text-xs">
            <strong>💰 ZERO COST:</strong> This mesh works entirely with free browser APIs. 
            No servers, no monthly fees, no infrastructure costs!
          </div>
        </CardContent>
      </Card>
    </div>
  );
};