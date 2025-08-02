
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Button } from './ui/button';
import { EnhancedMeshController } from '../services/EnhancedMeshController';
import { RealHardwareInterface } from '../services/RealHardwareInterface';
import { RealBehavioralTracking } from '../services/RealBehavioralTracking';
import { RealCrossPlatformBridge } from '../services/RealCrossPlatformBridge';

export const RealSystemMonitor: React.FC = () => {
  const [meshStatus, setMeshStatus] = useState<any>(null);
  const [hardwareCapabilities, setHardwareCapabilities] = useState<any>(null);
  const [behavioralMetrics, setBehavioralMetrics] = useState<any>(null);
  const [networkStats, setNetworkStats] = useState<any>(null);
  const [isMonitoring, setIsMonitoring] = useState(false);

  useEffect(() => {
    if (isMonitoring) {
      const interval = setInterval(async () => {
        try {
          const [mesh, hardware, behavioral, network] = await Promise.all([
            Promise.resolve(EnhancedMeshController.getMeshStatus()),
            Promise.resolve(RealHardwareInterface.getCapabilities()),
            Promise.resolve(RealBehavioralTracking.getRealTimeMetrics()),
            Promise.resolve(RealCrossPlatformBridge.getNetworkStats())
          ]);

          setMeshStatus(mesh);
          setHardwareCapabilities(hardware);
          setBehavioralMetrics(behavioral);
          setNetworkStats(network);
        } catch (error) {
          console.error('[MONITOR] Update failed:', error);
        }
      }, 2000);

      return () => clearInterval(interval);
    }
  }, [isMonitoring]);

  const handleStartMonitoring = async () => {
    try {
      await EnhancedMeshController.initialize();
      setIsMonitoring(true);
    } catch (error) {
      console.error('[MONITOR] Initialization failed:', error);
    }
  };

  const handleRequestPermissions = async () => {
    try {
      await EnhancedMeshController.requestHardwarePermissions();
    } catch (error) {
      console.error('[MONITOR] Permission request failed:', error);
    }
  };

  if (!isMonitoring) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Real System Monitor</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Initialize the real mesh network to begin monitoring actual hardware capabilities and behavioral influence systems.
            </p>
            <div className="flex gap-2">
              <Button onClick={handleStartMonitoring} className="bg-red-600 hover:bg-red-700">
                Initialize Real Mesh Network
              </Button>
              <Button onClick={handleRequestPermissions} variant="outline">
                Request Hardware Permissions
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Mesh Network Status */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Mesh Network</CardTitle>
          </CardHeader>
          <CardContent>
            {meshStatus && (
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Active Nodes:</span>
                  <Badge variant="outline">{meshStatus.activeNodes}/{meshStatus.totalNodes}</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Executions:</span>
                  <span>{meshStatus.totalExecutions}</span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Effectiveness:</span>
                    <span>{(meshStatus.averageEffectiveness * 100).toFixed(1)}%</span>
                  </div>
                  <Progress value={meshStatus.averageEffectiveness * 100} />
                </div>
                <div className="flex justify-between">
                  <span>Hardware Nodes:</span>
                  <Badge className="bg-green-600">{meshStatus.realHardwareNodes}</Badge>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Hardware Capabilities */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Real Hardware</CardTitle>
          </CardHeader>
          <CardContent>
            {hardwareCapabilities && (
              <div className="space-y-2">
                {Object.entries(hardwareCapabilities).map(([capability, available]) => (
                  <div key={capability} className="flex justify-between items-center">
                    <span className="text-sm capitalize">{capability.replace('_', ' ')}</span>
                    <Badge variant={available ? "default" : "secondary"}>
                      {available ? "✓" : "✗"}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Behavioral Tracking */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Behavioral Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            {behavioralMetrics && (
              <div className="space-y-3">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Engagement:</span>
                    <span>{(behavioralMetrics.engagementScore * 100).toFixed(1)}%</span>
                  </div>
                  <Progress value={behavioralMetrics.engagementScore * 100} />
                </div>
                <div className="flex justify-between">
                  <span>Interactions:</span>
                  <span>{behavioralMetrics.interactionCount}</span>
                </div>
                <div className="flex justify-between">
                  <span>Active Time:</span>
                  <span>{Math.floor(behavioralMetrics.activeTime / 1000)}s</span>
                </div>
                <div className="flex justify-between">
                  <span>Session:</span>
                  <span>{Math.floor(behavioralMetrics.sessionDuration / 1000)}s</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Cross-Platform Network */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Network Bridge</CardTitle>
          </CardHeader>
          <CardContent>
            {networkStats && (
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Connections:</span>
                  <Badge>{networkStats.activeConnections}/{networkStats.totalConnections}</Badge>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Network Health:</span>
                    <span>{(networkStats.networkHealth * 100).toFixed(1)}%</span>
                  </div>
                  <Progress value={networkStats.networkHealth * 100} />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Real Execution Stats */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Real Influence Executions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {meshStatus && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">{meshStatus.totalExecutions}</div>
                    <div className="text-sm text-muted-foreground">Total Executions</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{meshStatus.realHardwareNodes}</div>
                    <div className="text-sm text-muted-foreground">Hardware Nodes</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{meshStatus.crossPlatformConnections}</div>
                    <div className="text-sm text-muted-foreground">Cross-Platform</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{meshStatus.behavioralProfiles}</div>
                    <div className="text-sm text-muted-foreground">Profiles</div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>System Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm font-mono">
            <div className="text-green-400">[MESH] Real hardware mesh network: ACTIVE</div>
            <div className="text-green-400">[RF] Brainwave entrainment system: OPERATIONAL</div>
            <div className="text-green-400">[BEHAVIORAL] Real-time tracking: MONITORING</div>
            <div className="text-green-400">[NETWORK] Cross-platform bridge: CONNECTED</div>
            <div className="text-yellow-400">[HARDWARE] Device permissions: REQUESTING</div>
            <div className="text-red-400">[WARNING] Advanced influence systems active</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
