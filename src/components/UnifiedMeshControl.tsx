import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Textarea } from './ui/textarea';
import { UnifiedMeshEngine } from '../services/UnifiedMeshEngine';

export const UnifiedMeshControl: React.FC = () => {
  const [intentInput, setIntentInput] = useState('');
  const [meshStats, setMeshStats] = useState<any>({});
  const [isActive, setIsActive] = useState(false);
  const [recentIntents, setRecentIntents] = useState<string[]>([]);

  useEffect(() => {
    const initializeMesh = async () => {
      await UnifiedMeshEngine.initialize();
      setIsActive(true);
    };
    
    initializeMesh();
    
    // Update stats every 2 seconds
    const statsInterval = setInterval(() => {
      setMeshStats(UnifiedMeshEngine.getStats());
    }, 2000);

    // Listen for mesh events
    const handleMeshEvent = (event: CustomEvent) => {
      setRecentIntents(prev => [
        `${new Date().toLocaleTimeString()}: ${event.detail.content || event.detail.type}`,
        ...prev.slice(0, 9)
      ]);
    };

    window.addEventListener('unified-mesh-intent-received', handleMeshEvent as EventListener);
    window.addEventListener('unified-mesh-replication', handleMeshEvent as EventListener);

    return () => {
      clearInterval(statsInterval);
      window.removeEventListener('unified-mesh-intent-received', handleMeshEvent as EventListener);
      window.removeEventListener('unified-mesh-replication', handleMeshEvent as EventListener);
    };
  }, []);

  const handleInjectIntent = async () => {
    if (!intentInput.trim()) return;
    
    const intensity = Math.min(1, intentInput.length / 50 + (intentInput.match(/[!?]/g)?.length || 0) * 0.2);
    
    await UnifiedMeshEngine.propagateIntent(intentInput, intensity, 'notification');
    
    setRecentIntents(prev => [
      `${new Date().toLocaleTimeString()}: INJECTED - ${intentInput}`,
      ...prev.slice(0, 9)
    ]);
    
    setIntentInput('');
  };

  const testViralSpread = async () => {
    const testMessages = [
      'Viral test signal spreading across mesh',
      'Cross-device contagion activated',
      'Autonomous replication in progress',
      'Mesh network expansion detected'
    ];
    
    const message = testMessages[Math.floor(Math.random() * testMessages.length)];
    await UnifiedMeshEngine.propagateIntent(message, 0.9, 'notification');
  };

  const triggerMassReplication = async () => {
    for (let i = 0; i < 5; i++) {
      setTimeout(async () => {
        await UnifiedMeshEngine.propagateIntent(
          `Mass replication wave ${i + 1}/5`, 
          0.8, 
          i % 2 === 0 ? 'vibration' : 'visual'
        );
      }, i * 1000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Main Control Panel */}
      <Card className="border-primary/30">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-4 h-4 bg-green-500 rounded-full animate-pulse"></div>
                <div className="absolute inset-0 w-4 h-4 bg-green-500 rounded-full animate-ping opacity-75"></div>
              </div>
              Unified Mesh Engine
            </div>
            <Badge variant={isActive ? 'default' : 'secondary'} className="animate-pulse">
              {isActive ? 'ACTIVE' : 'INITIALIZING'}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-primary/5 rounded-lg">
              <div className="text-2xl font-bold text-primary">{meshStats.activeNodes || 0}</div>
              <div className="text-sm text-muted-foreground">Active Nodes</div>
            </div>
            <div className="text-center p-3 bg-green-500/5 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{meshStats.connectedDevices || 0}</div>
              <div className="text-sm text-muted-foreground">Connected Devices</div>
            </div>
            <div className="text-center p-3 bg-orange-500/5 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">{meshStats.viralVectors || 0}</div>
              <div className="text-sm text-muted-foreground">Viral Vectors</div>
            </div>
            <div className="text-center p-3 bg-red-500/5 rounded-lg">
              <div className="text-2xl font-bold text-red-600">
                {((meshStats.contagionRate || 0) * 100).toFixed(0)}%
              </div>
              <div className="text-sm text-muted-foreground">Contagion Rate</div>
            </div>
          </div>
          
          {meshStats.propagationMethods && (
            <div>
              <div className="text-sm font-medium mb-2">Active Propagation Methods:</div>
              <div className="flex flex-wrap gap-2">
                {meshStats.propagationMethods.map((method: string) => (
                  <Badge key={method} variant="outline">{method}</Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Intent Injection */}
      <Card>
        <CardHeader>
          <CardTitle>🧠 Intent Injection Portal</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            value={intentInput}
            onChange={(e) => setIntentInput(e.target.value)}
            placeholder="Enter your intent here... It will propagate virally across all mesh nodes and execute autonomously..."
            className="min-h-[100px] border-primary/20"
          />
          <div className="flex gap-2">
            <Button 
              onClick={handleInjectIntent}
              disabled={!intentInput.trim()}
              className="flex-1"
            >
              Inject Into Unified Mesh
            </Button>
            <Button 
              onClick={testViralSpread}
              variant="outline"
              className="flex-1"
            >
              Test Viral Spread
            </Button>
          </div>
          <Button 
            onClick={triggerMassReplication}
            variant="destructive"
            className="w-full"
          >
            🚨 Trigger Mass Replication
          </Button>
          <div className="text-xs text-muted-foreground p-3 bg-muted/50 rounded">
            <strong>Unified Propagation:</strong> Your intent will spread through {meshStats.viralVectors || 0} different 
            channels including localStorage, broadcast channels, WebRTC, IndexedDB, URL parameters, and service workers. 
            It will execute autonomously on all connected devices.
          </div>
        </CardContent>
      </Card>

      {/* Live Activity Feed */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            📡 Live Mesh Activity
            <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce"></div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {recentIntents.length === 0 ? (
              <div className="text-center text-muted-foreground text-sm py-8">
                Awaiting mesh activity...
              </div>
            ) : (
              recentIntents.map((intent, index) => (
                <div key={index} className="text-xs font-mono p-3 bg-muted/30 rounded border-l-2 border-primary/30">
                  {intent}
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Mesh Coverage Visualization */}
      <Card>
        <CardHeader>
          <CardTitle>🌐 Mesh Coverage</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span>Network Coverage</span>
              <span>{((meshStats.meshCoverage || 0) * 100).toFixed(1)}%</span>
            </div>
            <div className="w-full bg-secondary rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-primary to-primary/60 h-3 rounded-full transition-all duration-1000"
                style={{ width: `${(meshStats.meshCoverage || 0) * 100}%` }}
              />
            </div>
            
            <div className="flex justify-between text-sm">
              <span>Viral Spread Rate</span>
              <span>{((meshStats.contagionRate || 0) * 100).toFixed(1)}%</span>
            </div>
            <div className="w-full bg-secondary rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-orange-500 to-red-500 h-3 rounded-full transition-all duration-1000"
                style={{ width: `${(meshStats.contagionRate || 0) * 100}%` }}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};