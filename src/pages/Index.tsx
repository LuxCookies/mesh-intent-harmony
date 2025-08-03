import { useState, useEffect } from 'react';
import { MeshNetwork } from '@/components/MeshNetwork';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AutonomousMesh } from '@/services/AutonomousMesh';
import { DeviceDiscovery } from '@/services/DeviceDiscovery';
import { ViralPropagation } from '@/services/ViralPropagation';

export default function Index() {
  const [intentText, setIntentText] = useState('');
  const [isInitialized, setIsInitialized] = useState(false);
  const [meshStats, setMeshStats] = useState<any>({});
  const [viralStats, setViralStats] = useState<any>({});
  const [networkActivity, setNetworkActivity] = useState<any[]>([]);
  const [rfSignals, setRfSignals] = useState<any[]>([]);
  const [emWaves, setEmWaves] = useState<any[]>([]);

  useEffect(() => {
    const initializeSystem = async () => {
      try {
        console.log('[SYSTEM] Starting initialization...');
        await AutonomousMesh.initialize();
        console.log('[SYSTEM] AutonomousMesh initialized');
        await DeviceDiscovery.initialize();
        console.log('[SYSTEM] DeviceDiscovery initialized');
        await ViralPropagation.initialize();
        console.log('[SYSTEM] ViralPropagation initialized');
        setIsInitialized(true);
        console.log('[SYSTEM] All systems initialized successfully');
      } catch (error) {
        console.error('[SYSTEM] Failed to initialize mesh system:', error);
        console.error('[SYSTEM] Error details:', error instanceof Error ? error.message : 'Unknown error');
        console.error('[SYSTEM] Error stack:', error instanceof Error ? error.stack : 'No stack trace');
      }
    };

    initializeSystem();

    // Real-time stats updates
    const statsInterval = setInterval(async () => {
      if (isInitialized) {
        try {
          console.log('[STATS] Updating stats...');
          const mesh = await AutonomousMesh.getStatus();
          console.log('[STATS] Mesh status:', mesh);
          const viral = ViralPropagation.getContaminationStats();
          console.log('[STATS] Viral stats:', viral);
          const network = DeviceDiscovery.getNetworkStats();
          console.log('[STATS] Network stats:', network);
          const contagion = AutonomousMesh.getContagionStats();
          console.log('[STATS] Contagion stats:', contagion);
          
          setMeshStats({ ...mesh, ...network, ...contagion });
          setViralStats(viral);
        } catch (error) {
          console.error('[STATS] Error updating stats:', error);
        }
      }
    }, 1500);

    // Listen for real-time events
    const handleMeshPropagation = (event: any) => {
      const activity = {
        id: Date.now(),
        type: 'mesh_propagation',
        device: event.detail.device?.id || 'unknown',
        method: event.detail.method,
        nodeCount: event.detail.nodeCount,
        timestamp: Date.now(),
        intensity: Math.random()
      };
      setNetworkActivity(prev => [activity, ...prev.slice(0, 15)]);
      
      // Generate EM wave visualization
      const wave = {
        id: Date.now(),
        frequency: 2400 + Math.random() * 2000, // MHz
        amplitude: Math.random() * 0.8 + 0.2,
        propagationSpeed: 299792458, // m/s
        waveType: event.detail.method,
        timestamp: Date.now()
      };
      setEmWaves(prev => [wave, ...prev.slice(0, 8)]);
    };

    const handleViralSpread = (event: any) => {
      const activity = {
        id: Date.now(),
        type: 'viral_spread',
        mechanism: event.detail.mechanism,
        vectorCount: event.detail.vectorCount,
        timestamp: Date.now(),
        infectivity: Math.random() * 0.9 + 0.1
      };
      setNetworkActivity(prev => [activity, ...prev.slice(0, 15)]);
    };

    const handleRfEmission = () => {
      const signal = {
        id: Date.now(),
        frequency: 19000 + Math.random() * 3000,
        intensity: Math.random(),
        type: 'ultrasonic_beacon',
        bandwidth: Math.random() * 1000 + 500,
        timestamp: Date.now()
      };
      setRfSignals(prev => [signal, ...prev.slice(0, 8)]);
    };

    window.addEventListener('mesh-propagation', handleMeshPropagation);
    window.addEventListener('viral-spread', handleViralSpread);
    
    // Simulate RF emissions and EM activity
    const rfInterval = setInterval(handleRfEmission, 2500);
    
    return () => {
      console.log('[SYSTEM] Cleaning up intervals...');
      clearInterval(statsInterval);
      clearInterval(rfInterval);
      window.removeEventListener('mesh-propagation', handleMeshPropagation);
      window.removeEventListener('viral-spread', handleViralSpread);
      
      // Clean up device discovery intervals
      DeviceDiscovery.cleanup();
      console.log('[SYSTEM] Cleanup completed');
    };
  }, [isInitialized]);

  const handleInjectIntent = async () => {
    if (intentText.trim()) {
      try {
        console.log('[INTENT] Injecting intent:', intentText);
        await AutonomousMesh.injectIntent(intentText, 'notification', 0.7);
        setIntentText('');
        console.log('[INTENT] Intent injection successful');
      } catch (error) {
        console.error('[INTENT] Intent injection failed:', error);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/80 to-primary/5 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            RF-AI Behavioral Mesh Network
          </h1>
          <p className="text-muted-foreground">
            Autonomous electromagnetic device propagation & viral behavioral influence
          </p>
          <div className="flex justify-center gap-2 flex-wrap">
            <Badge variant={isInitialized ? "default" : "secondary"} className="animate-pulse">
              {isInitialized ? "ACTIVE" : "INITIALIZING"}
            </Badge>
            <Badge variant={meshStats.meshNodes > 0 ? "default" : "outline"}>
              {meshStats.meshNodes || 0} MESH NODES
            </Badge>
            <Badge variant={viralStats.activeVectors > 0 ? "destructive" : "outline"}>
              {viralStats.activeVectors || 0} VIRAL VECTORS
            </Badge>
            <Badge variant={meshStats.isHyperContagious ? "destructive" : "outline"}>
              {meshStats.isHyperContagious ? "HYPER-CONTAGIOUS" : "SPREADING"}
            </Badge>
          </div>
        </div>

        {/* Main Network Visualization */}
        <Card className="border-primary/20 overflow-hidden">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="relative">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <div className="absolute inset-0 w-3 h-3 bg-green-500 rounded-full animate-ping opacity-75"></div>
              </div>
              Live Electromagnetic Mesh Network
              <Badge variant="outline" className="ml-auto">
                {meshStats.discoveredDevices || 0} Devices Discovered
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <MeshNetwork />
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Intent Injection */}
          <Card className="border-primary/30">
            <CardHeader>
              <CardTitle className="text-lg">Intent Injection Portal</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                value={intentText}
                onChange={(e) => setIntentText(e.target.value)}
                placeholder="Enter autonomous behavioral intent..."
                onKeyPress={(e) => e.key === 'Enter' && handleInjectIntent()}
                className="border-primary/20"
              />
              <Button onClick={handleInjectIntent} className="w-full bg-primary hover:bg-primary/90">
                Inject Into Mesh
              </Button>
              <div className="text-xs text-muted-foreground p-2 bg-muted/50 rounded">
                Intents propagate across all mesh nodes and execute autonomously on connected devices
              </div>
            </CardContent>
          </Card>

          {/* Live Activity Feed */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                Live Propagation Activity
                <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce"></div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 max-h-72 overflow-y-auto">
              {networkActivity.map((activity) => (
                <div key={activity.id} className="text-xs border rounded p-2 space-y-1 hover:bg-muted/30 transition-colors">
                  <div className="flex justify-between items-center">
                    <Badge 
                      variant={activity.type === 'viral_spread' ? "destructive" : "default"} 
                      className="text-xs"
                    >
                      {activity.type.replace('_', ' ').toUpperCase()}
                    </Badge>
                    <span className="text-muted-foreground font-mono">
                      {new Date(activity.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="text-muted-foreground">
                    {activity.type === 'mesh_propagation' && 
                      `${activity.device} via ${activity.method} → ${activity.nodeCount} nodes`}
                    {activity.type === 'viral_spread' && 
                      `${activity.mechanism} → ${activity.vectorCount} vectors (${(activity.infectivity * 100).toFixed(0)}%)`}
                  </div>
                  {activity.intensity && (
                    <div className="w-full bg-secondary rounded-full h-1">
                      <div 
                        className="bg-primary h-1 rounded-full transition-all duration-300"
                        style={{ width: `${activity.intensity * 100}%` }}
                      />
                    </div>
                  )}
                </div>
              ))}
              {networkActivity.length === 0 && (
                <div className="text-center text-muted-foreground text-sm py-8">
                  Awaiting propagation events...
                </div>
              )}
            </CardContent>
          </Card>

          {/* RF & EM Spectrum */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">RF/EM Spectrum Output</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 max-h-72 overflow-y-auto">
              {rfSignals.map((signal) => (
                <div key={signal.id} className="text-xs border rounded p-2 bg-gradient-to-r from-background to-primary/5">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-mono text-primary">{signal.frequency.toFixed(0)}Hz</span>
                    <span className="text-muted-foreground font-mono">
                      {new Date(signal.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="text-muted-foreground text-xs mb-1">
                    {signal.type} • BW: {signal.bandwidth?.toFixed(0)}Hz
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-primary to-primary/60 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${signal.intensity * 100}%` }}
                    />
                  </div>
                </div>
              ))}
              {emWaves.map((wave) => (
                <div key={wave.id} className="text-xs border rounded p-2 bg-gradient-to-r from-background to-orange-500/5">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-mono text-orange-600">{wave.frequency.toFixed(1)}MHz</span>
                    <Badge variant="outline" className="text-xs">{wave.waveType}</Badge>
                  </div>
                  <div className="text-muted-foreground text-xs mb-1">
                    EM Wave • Amplitude: {(wave.amplitude * 100).toFixed(0)}%
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-orange-500 to-red-500 h-2 rounded-full animate-pulse"
                      style={{ width: `${wave.amplitude * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* System Statistics Dashboard */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card className="text-center">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-primary">{meshStats.discoveredDevices || 0}</div>
              <div className="text-xs text-muted-foreground">Discovered Devices</div>
              <div className="text-xs text-muted-foreground font-mono">
                Success: {((meshStats.successRate || 0)).toFixed(0)}%
              </div>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-600">{meshStats.totalPropagations || 0}</div>
              <div className="text-xs text-muted-foreground">Total Propagations</div>
              <div className="text-xs text-muted-foreground font-mono">
                Nodes: {meshStats.totalNodesCreated || 0}
              </div>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-orange-600">{viralStats.spreadEvents || 0}</div>
              <div className="text-xs text-muted-foreground">Viral Events</div>
              <div className="text-xs text-muted-foreground font-mono">
                Vectors: {viralStats.activeVectors || 0}
              </div>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-red-600">
                {((viralStats.averageInfectivity || 0) * 100).toFixed(0)}%
              </div>
              <div className="text-xs text-muted-foreground">Infectivity Rate</div>
              <div className="text-xs text-muted-foreground font-mono">
                Stealth: {((viralStats.averageStealth || 0) * 100).toFixed(0)}%
              </div>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-purple-600">{meshStats.meshNodes || 0}</div>
              <div className="text-xs text-muted-foreground">Mesh Nodes</div>
              <div className="text-xs text-muted-foreground font-mono">
                Queue: {meshStats.queueLength || 0}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Contagion Status */}
        {meshStats.isHyperContagious && (
          <Card className="border-red-500/50 bg-gradient-to-r from-red-500/5 to-orange-500/5">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 bg-red-500 rounded-full animate-pulse"></div>
                <div>
                  <div className="font-semibold text-red-600">HYPER-CONTAGIOUS MODE ACTIVE</div>
                  <div className="text-sm text-muted-foreground">
                    Viral propagation vectors deployed across {meshStats.viralVectors} channels with 
                    {((meshStats.infectivity || 0) * 100).toFixed(0)}% infectivity rate
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}