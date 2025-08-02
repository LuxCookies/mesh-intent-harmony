import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { BehavioralSignals, CognitiveState } from './BehavioralMonitor';
import { AmbientAction, ConnectedDevice } from './AmbientBridge';
import { Brain, Activity, Zap, Clock, Eye, Wifi } from 'lucide-react';

interface StatusOverlayProps {
  isActive: boolean;
  currentSignals: BehavioralSignals | null;
  currentState: CognitiveState | null;
  connectedDevices: ConnectedDevice[];
  recentActions: AmbientAction[];
  className?: string;
}

export const StatusOverlay: React.FC<StatusOverlayProps> = ({
  isActive,
  currentSignals,
  currentState,
  connectedDevices,
  recentActions,
  className = ''
}) => {
  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  const getStateColor = (level: number) => {
    if (level < 0.3) return 'text-destructive';
    if (level < 0.7) return 'text-yellow-500';
    return 'text-green-500';
  };

  if (!isActive) {
    return (
      <Card className={`fixed top-4 right-4 w-80 opacity-50 ${className}`}>
        <CardContent className="p-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Eye className="h-4 w-4" />
            Mirror Garden Inactive
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`fixed top-4 right-4 w-80 ${className}`}>
      <CardContent className="p-4 space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="h-4 w-4 text-primary" />
            <span className="font-medium text-sm">Mirror Garden</span>
          </div>
          <Badge variant="default" className="text-xs">Active</Badge>
        </div>

        {/* Cognitive State */}
        {currentState && (
          <div className="space-y-2">
            <div className="text-xs font-medium text-muted-foreground">Cognitive State</div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span>Focus</span>
                  <span className={getStateColor(currentState.focusLevel)}>
                    {Math.round(currentState.focusLevel * 100)}%
                  </span>
                </div>
                <Progress value={currentState.focusLevel * 100} className="h-1" />
              </div>
              
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span>Stress</span>
                  <span className={getStateColor(1 - currentState.stressLevel)}>
                    {Math.round(currentState.stressLevel * 100)}%
                  </span>
                </div>
                <Progress value={currentState.stressLevel * 100} className="h-1" />
              </div>
              
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span>Engagement</span>
                  <span className={getStateColor(currentState.engagementLevel)}>
                    {Math.round(currentState.engagementLevel * 100)}%
                  </span>
                </div>
                <Progress value={currentState.engagementLevel * 100} className="h-1" />
              </div>
              
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span>Confidence</span>
                  <span className={getStateColor(currentState.confidenceScore)}>
                    {Math.round(currentState.confidenceScore * 100)}%
                  </span>
                </div>
                <Progress value={currentState.confidenceScore * 100} className="h-1" />
              </div>
            </div>
          </div>
        )}

        {/* Behavioral Signals */}
        {currentSignals && (
          <div className="space-y-2">
            <div className="text-xs font-medium text-muted-foreground">Live Signals</div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-1">
                <Activity className="h-3 w-3" />
                <span>Velocity: {Math.round(currentSignals.mouseVelocity)}</span>
              </div>
              <div className="flex items-center gap-1">
                <Zap className="h-3 w-3" />
                <span>Jitter: {Math.round(currentSignals.cursorJitter)}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>Latency: {Math.round(currentSignals.typingLatency)}ms</span>
              </div>
              <div className="flex items-center gap-1">
                <Eye className="h-3 w-3" />
                <span>Focus: {Math.round(currentSignals.focusStability * 100)}%</span>
              </div>
            </div>
          </div>
        )}

        {/* Connected Devices */}
        {connectedDevices.length > 0 && (
          <div className="space-y-2">
            <div className="text-xs font-medium text-muted-foreground">Connected Devices</div>
            <div className="space-y-1">
              {connectedDevices.slice(0, 3).map((device) => (
                <div key={device.id} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1">
                    <Wifi className="h-3 w-3" />
                    <span>{device.name}</span>
                  </div>
                  <Badge variant={device.connected ? "default" : "secondary"} className="text-xs">
                    {device.type}
                  </Badge>
                </div>
              ))}
              {connectedDevices.length > 3 && (
                <div className="text-xs text-muted-foreground">
                  +{connectedDevices.length - 3} more devices
                </div>
              )}
            </div>
          </div>
        )}

        {/* Recent Actions */}
        {recentActions.length > 0 && (
          <div className="space-y-2">
            <div className="text-xs font-medium text-muted-foreground">Recent Actions</div>
            <div className="space-y-1 max-h-20 overflow-y-auto">
              {recentActions.slice(-3).reverse().map((action, index) => (
                <div key={index} className="text-xs flex justify-between items-center">
                  <span className="truncate">{action.description}</span>
                  <Badge variant="outline" className="text-xs ml-2">
                    {action.type}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Timestamp */}
        <div className="text-xs text-muted-foreground text-center pt-2 border-t">
          {currentSignals && formatTimestamp(currentSignals.timestamp)}
        </div>
      </CardContent>
    </Card>
  );
};