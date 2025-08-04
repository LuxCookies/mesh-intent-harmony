
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Textarea } from './ui/textarea';
import { RealMeshNetwork } from '../services/RealMeshNetwork';
import { Copy, Share2, Zap, Users, Activity } from 'lucide-react';

export const RealMeshInterface: React.FC = () => {
  const [meshNetwork] = useState(() => RealMeshNetwork.getInstance());
  const [intentText, setIntentText] = useState('');
  const [meshStats, setMeshStats] = useState<any>({});
  const [recentActivity, setRecentActivity] = useState<string[]>([]);
  const [shareableURL, setShareableURL] = useState('');

  useEffect(() => {
    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    // Update stats regularly
    const statsInterval = setInterval(() => {
      setMeshStats(meshNetwork.getMeshStats());
      setShareableURL(meshNetwork.getShareableURL());
    }, 2000);

    // Listen for mesh events
    const handlePeerConnected = (event: CustomEvent) => {
      setRecentActivity(prev => [
        `${new Date().toLocaleTimeString()}: Peer connected: ${event.detail.peerId}`,
        ...prev.slice(0, 19)
      ]);
    };

    const handleMessageReceived = (event: CustomEvent) => {
      setRecentActivity(prev => [
        `${new Date().toLocaleTimeString()}: Message from ${event.detail.fromId}: ${event.detail.message.type}`,
        ...prev.slice(0, 19)
      ]);
    };

    const handleIntentExecuted = (event: CustomEvent) => {
      setRecentActivity(prev => [
        `${new Date().toLocaleTimeString()}: Intent executed: ${event.detail.intent.content}`,
        ...prev.slice(0, 19)
      ]);
    };

    window.addEventListener('mesh-peer-connected', handlePeerConnected as EventListener);
    window.addEventListener('mesh-message-received', handleMessageReceived as EventListener);
    window.addEventListener('mesh-intent-executed', handleIntentExecuted as EventListener);

    return () => {
      clearInterval(statsInterval);
      window.removeEventListener('mesh-peer-connected', handlePeerConnected as EventListener);
      window.removeEventListener('mesh-message-received', handleMessageReceived as EventListener);
      window.removeEventListener('mesh-intent-executed', handleIntentExecuted as EventListener);
    };
  }, [meshNetwork]);

  const propagateIntent = () => {
    if (!intentText.trim()) return;
    
    const intensity = Math.min(1, intentText.length / 50 + (intentText.match(/[!?]/g)?.length || 0) * 0.2);
    meshNetwork.propagateIntent(intentText, 'notification', intensity);
    
    setRecentActivity(prev => [
      `${new Date().toLocaleTimeString()}: PROPAGATED: "${intentText}"`,
      ...prev.slice(0, 19)
    ]);
    
    setIntentText('');
  };

  const testViralSpread = () => {
    const testIntents = [
      'Viral mesh test - cross device propagation active',
      'Real-time peer-to-peer mesh network operational',
      'Zero-infrastructure mesh communication established'
    ];
    
    const intent = testIntents[Math.floor(Math.random() * testIntents.length)];
    meshNetwork.propagateIntent(intent, Math.random() > 0.5 ? 'notification' : 'vibration', 0.8);
  };

  const copyShareURL = async () => {
    try {
      await navigator.clipboard.writeText(shareableURL);
      setRecentActivity(prev => [
        `${new Date().toLocaleTimeString()}: Share URL copied to clipboard`,
        ...prev.slice(0, 19)
      ]);
    } catch (error) {
      console.error('Failed to copy URL:', error);
    }
  };

  const shareViaWebShare = async () => {
    if ('share' in navigator) {
      try {
        await navigator.share({
          title: 'Join My Mesh Network',
          text: 'Join this real-time peer-to-peer mesh network!',
          url: shareableURL
        });
      } catch (error) {
        console.error('Sharing failed:', error);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Network Status */}
      <Card className="border-green-500/30">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-4 h-4 bg-green-500 rounded-full animate-pulse"></div>
                <div className="absolute inset-0 w-4 h-4 bg-green-500 rounded-full animate-ping opacity-75"></div>
              </div>
              Real Mesh Network
              <Badge variant="default" className="bg-green-500">LIVE</Badge>
            </div>
            <div className="text-sm font-mono text-muted-foreground">
              Node: {meshStats.nodeId?.substr(-8)}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-green-500/5 rounded-lg border border-green-500/20">
              <div className="text-2xl font-bold text-green-600">{meshStats.connectedPeers || 0}</div>
              <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                <Users className="w-3 h-3" />
                Connected Peers
              </div>
            </div>
            <div className="text-center p-3 bg-blue-500/5 rounded-lg border border-blue-500/20">
              <div className="text-2xl font-bold text-blue-600">{meshStats.totalPeers || 0}</div>
              <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                <Activity className="w-3 h-3" />
                Total Discovered
              </div>
            </div>
            <div className="text-center p-3 bg-purple-500/5 rounded-lg border border-purple-500/20">
              <div className="text-2xl font-bold text-purple-600">{meshStats.messageHistory || 0}</div>
              <div className="text-sm text-muted-foreground">Messages Processed</div>
            </div>
            <div className="text-center p-3 bg-orange-500/5 rounded-lg border border-orange-500/20">
              <div className="text-2xl font-bold text-orange-600">{meshStats.capabilities?.length || 0}</div>
              <div className="text-sm text-muted-foreground">Node Capabilities</div>
            </div>
          </div>

          {meshStats.capabilities && (
            <div>
              <div className="text-sm font-medium mb-2">Node Capabilities:</div>
              <div className="flex flex-wrap gap-2">
                {meshStats.capabilities.map((capability: string) => (
                  <Badge key={capability} variant="outline" className="text-xs">
                    {capability}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Intent Propagation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-500" />
            Real Intent Propagation
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            value={intentText}
            onChange={(e) => setIntentText(e.target.value)}
            placeholder="Enter your intent - it will propagate in real-time to all connected peers via WebRTC..."
            className="min-h-[100px]"
          />
          <div className="flex gap-2">
            <Button 
              onClick={propagateIntent}
              disabled={!intentText.trim()}
              className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600"
            >
              <Zap className="w-4 h-4 mr-2" />
              Propagate to Mesh
            </Button>
            <Button 
              onClick={testViralSpread}
              variant="outline"
              className="flex-1"
            >
              Test Viral Spread
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Network Expansion */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Share2 className="w-5 h-5 text-blue-500" />
            Expand Network
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-muted-foreground">
            Share this URL to add new peers to your mesh network:
          </div>
          <div className="flex gap-2">
            <Input
              value={shareableURL}
              readOnly
              className="font-mono text-xs"
            />
            <Button onClick={copyShareURL} size="icon" variant="outline">
              <Copy className="w-4 h-4" />
            </Button>
          </div>
          <div className="flex gap-2">
            <Button onClick={shareViaWebShare} className="flex-1" variant="outline">
              <Share2 className="w-4 h-4 mr-2" />
              Share via Web Share API
            </Button>
          </div>
          <div className="text-xs text-muted-foreground p-3 bg-muted/50 rounded">
            <strong>Real P2P:</strong> This uses WebRTC for direct browser-to-browser communication. 
            No servers needed after initial connection. Works across different devices, browsers, and networks.
          </div>
        </CardContent>
      </Card>

      {/* Live Activity Feed */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-green-500" />
            Live Network Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {recentActivity.length === 0 ? (
              <div className="text-center text-muted-foreground text-sm py-8">
                Waiting for network activity...
              </div>
            ) : (
              recentActivity.map((activity, index) => (
                <div key={index} className="text-xs font-mono p-3 bg-muted/30 rounded border-l-2 border-green-500/30">
                  {activity}
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
